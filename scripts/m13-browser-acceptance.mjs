import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const stateFile = process.env.M13_STATE_FILE, webUrl = process.env.M13_WEB_URL ?? "http://127.0.0.1:8172", cdpPort = Number(process.env.M13_CDP_PORT ?? 9352), chrome = process.env.CHROME_BIN ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
if (!stateFile) throw Error("M13_STATE_FILE is required");
const state = JSON.parse(await readFile(stateFile, "utf8")), profile = await mkdtemp(path.join(os.tmpdir(), "masterhost-m13-chrome-")), browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let launchError, socket, browserExited = false; browser.once("error", error => { launchError = error; }); const browserExit = new Promise(resolve => browser.once("exit", () => { browserExited = true; resolve(); })), delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function poll(fn, message, attempts = 200) { let last; for (let attempt = 0; attempt < attempts; attempt++) { try { const value = await fn(); if (value) return value; } catch (error) { last = error; } await delay(100); } throw Error(`${message}${last ? `: ${last.message}` : ""}`); }

try {
  const target = await poll(async () => { if (launchError) throw launchError; const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`), targets = await response.json(); return targets.find(value => value.type === "page"); }, "Chrome DevTools target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0; const pending = new Map(), issues = [];
  socket.onmessage = event => { const message = JSON.parse(event.data); if (message.method === "Runtime.exceptionThrown") issues.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text); if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") issues.push("console.error"); if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && !message.params.response.url.endsWith("/favicon.ico")) issues.push(`${message.params.response.status} ${message.params.response.url}`); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result); };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; };
  const navigate = async url => { await send("Page.navigate", { url }); await poll(() => evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`), `Page did not load: ${url}`); };
  const waitForText = text => poll(() => evaluate(`document.body?.innerText.includes(${JSON.stringify(text)})`), `Text was not rendered: ${text}`);
  const click = text => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(value => value.textContent?.trim() === ${JSON.stringify(text)}); if (!button) throw Error('missing button ${text}'); if (button.disabled) throw Error('disabled button ${text}'); button.click(); })()`);
  const setInput = (label, value) => evaluate(`(() => { const input = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!input) throw Error('missing input ${label}'); const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const setSectionLabel = (heading, label, value) => evaluate(`(() => { const section = [...document.querySelectorAll('section')].find(value => value.querySelector('h2')?.textContent?.includes(${JSON.stringify(heading)})); const row = [...(section?.querySelectorAll('label') ?? [])].find(value => value.childNodes[0]?.textContent?.trim() === ${JSON.stringify(label)}); const input = row?.querySelector('input,select'); if (!input) throw Error('missing ${heading}/${label}'); const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
  await navigate(`${webUrl}/?realm=${encodeURIComponent(state.browserSlug)}`); await evaluate(`sessionStorage.setItem(${JSON.stringify(`masterhost.realmAccess.${state.browserSlug}`)}, ${JSON.stringify(state.browserToken)}); localStorage.setItem('masterhost.realm', ${JSON.stringify(state.browserSlug)}); location.hash='game-builder';`);
  await waitForText("QUICK GAME BUILDER"); await click("NEXT");
  for (const heading of ["Setting", "World template", "Locations", "Cast", "Items, clues and rewards", "Rules", "Character Builder", "Adventure, scenes and encounters", "Visual style"]) {
    await waitForText(heading); assert.equal(await evaluate("document.querySelectorAll('.quickChoices article').length"), 3, `${heading} should expose three choices`);
    await evaluate("document.querySelector('.quickChoices article button').click()"); await poll(() => evaluate("[...document.querySelectorAll('button')].some(value => value.textContent.trim()==='NEXT' && !value.disabled)"), `NEXT disabled for ${heading}`);
    if (heading === "Visual style") await poll(() => evaluate("[...document.querySelectorAll('.quickChoices img')].every(value => value.complete && value.naturalWidth > 0) && document.querySelectorAll('.quickChoices img').length === 3"), "Quick media did not load");
    await click("NEXT");
  }
  await waitForText("World decisions");
  await evaluate(`sessionStorage.setItem('masterhost.packProject', ${JSON.stringify(state.browserProjectId)}); location.hash='pack';`); await waitForText("Browser Custom Sunforge"); await waitForText("Forked from Descriptor");
  await setInput(`Art Set ${state.browserArtSet} defaults`, `portrait:${state.browserAssetName}`);
  await click("world"); await waitForText("Templates, values, components and scenes"); await evaluate(`document.querySelector(${JSON.stringify(`[aria-label="Remove templates ${state.browserReferencedTemplate}"]`)}).click()`); await waitForText("referenced by");
  await click("Add generator"); await click("Add scene"); await click("Add relation");
  await setInput(`Template ${state.browserReferencedTemplate} values`, "name:M13 Browser Haven");
  await click("characters"); await setSectionLabel("Character steps", "Title", "Build your M13 hero");
  await click("rules"); await setInput(`Check ${state.browserCheckId} dice`, "3d6"); await setInput(`Action ${state.browserActionId} label`, "Browser Star Action"); await click("Add effect");
  await click("assets"); await poll(() => evaluate("document.querySelectorAll('.mediaGrid img').length > 0 && [...document.querySelectorAll('.mediaGrid img')].every(value => value.complete && value.naturalWidth > 0)"), "Authenticated Pack media did not load");
  await click("Save draft"); await waitForText("saved"); await click("Validate"); await waitForText("PASS"); await click("Publish immutable version"); await waitForText("published"); await click("Generate World"); await waitForText("Generated World:");
  assert.deepEqual(issues, []); console.log("M13 browser acceptance passed: three choices per category, authenticated images, dependency-safe removal and visual full-custom edit/save/validate/publish/compile all passed without source editing.");
} finally { socket?.close(); browser.kill("SIGTERM"); await Promise.race([browserExit, delay(2_000)]); if (!browserExited) { browser.kill("SIGKILL"); await Promise.race([browserExit, delay(2_000)]); } await rm(profile, { recursive: true, force: true }); if (!browserExited) throw Error(`Chrome process ${browser.pid} did not exit`); }
