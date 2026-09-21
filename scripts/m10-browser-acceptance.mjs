import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const stateFile = process.env.M10_STATE_FILE, webUrl = process.env.M10_WEB_URL ?? "http://127.0.0.1:8142", cdpPort = Number(process.env.M10_CDP_PORT ?? 9340);
const chrome = process.env.CHROME_BIN ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
if (!stateFile) throw Error("M10_STATE_FILE is required");
const state = JSON.parse(await readFile(stateFile, "utf8")), profile = await mkdtemp(path.join(os.tmpdir(), "masterhost-m10-chrome-"));
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let launchError, socket; browser.once("error", error => { launchError = error; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function poll(fn, message, attempts = 120) { let last; for (let attempt = 0; attempt < attempts; attempt++) { try { const value = await fn(); if (value) return value; } catch (error) { last = error; } await delay(100); } throw Error(`${message}${last ? `: ${last.message}` : ""}`); }

try {
  const target = await poll(async () => { if (launchError) throw launchError; const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`), targets = await response.json(); return targets.find(value => value.type === "page"); }, "Chrome DevTools target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0; const pending = new Map(), issues = [];
  socket.onmessage = event => { const message = JSON.parse(event.data); if (message.method === "Runtime.exceptionThrown") issues.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text); if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") issues.push("console.error"); if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && !message.params.response.url.endsWith("/favicon.ico")) issues.push(`${message.params.response.status} ${message.params.response.url}`); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result); };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; };
  const navigate = async url => { await send("Page.navigate", { url }); try { await poll(() => evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`), `Page did not load: ${url}`); } catch (error) { throw Error(`${error.message}; actual=${await evaluate("location.href")}`); } };
  const waitForText = text => poll(() => evaluate(`document.body?.innerText.includes(${JSON.stringify(text)})`), `Text was not rendered: ${text}`);
  const setInput = (label, value) => evaluate(`(() => { const input = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!input) throw Error('missing input ${label}'); const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const click = text => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(value => value.textContent?.trim() === ${JSON.stringify(text)}); if (!button) throw Error('missing button ${text}'); button.click(); })()`);

  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
  await navigate(`${webUrl}/?realm=${encodeURIComponent(state.slug)}`);
  await evaluate(`sessionStorage.setItem(${JSON.stringify(`masterhost.realmAccess.${state.slug}`)}, ${JSON.stringify(state.creatorToken)}); localStorage.setItem('masterhost.realm', ${JSON.stringify(state.slug)}); location.hash = 'game-builder';`);
  await waitForText("DYNAMIC GAME BUILDER"); await waitForText("Revision 2");
  await click("New game");
  await setInput("Game name", "The Browser Observatory"); await setInput("Deterministic seed", "m10-browser-seed");
  await evaluate(`document.querySelector('[data-fragment-id="masterhost.fragment.observatory"]')?.click()`);
  await evaluate(`document.querySelector('[data-fragment-id="masterhost.fragment.fortune"]')?.click()`);
  await waitForText("Selected fragments · 2"); await setInput("Parameter danger", "4");
  await click("CREATE PROJECT"); await waitForText("Revision 1");
  await click("PREVIEW"); await waitForText("VALID"); await waitForText("location:observatory"); await waitForText("rules:fortune"); await waitForText("0.1.1");
  await click("COMPILE WORLD"); await waitForText("Generation report");
  await evaluate("location.hash = 'game-builder'"); await waitForText("DYNAMIC GAME BUILDER"); await evaluate("location.reload()");
  await waitForText("Revision 1"); await waitForText("Observatory Location"); await waitForText("Fortune Rules");
  assert.deepEqual(issues, []);
  console.log("M10 browser acceptance passed: creator selected fragments and parameters, previewed a valid Descriptor, compiled a World and restored the project after reload.");
} finally {
  socket?.close(); browser.kill("SIGTERM"); if (browser.exitCode === null) await Promise.race([new Promise(resolve => browser.once("exit", resolve)), delay(2_000)]); await rm(profile, { recursive: true, force: true });
}
