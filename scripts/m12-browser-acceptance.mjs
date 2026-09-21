import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const stateFile = process.env.M12_STATE_FILE, webUrl = process.env.M12_WEB_URL ?? "http://127.0.0.1:8162", cdpPort = Number(process.env.M12_CDP_PORT ?? 9342);
const chrome = process.env.CHROME_BIN ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
if (!stateFile) throw Error("M12_STATE_FILE is required");
const state = JSON.parse(await readFile(stateFile, "utf8")), profile = await mkdtemp(path.join(os.tmpdir(), "masterhost-m12-chrome-"));
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let launchError, socket, browserExited = false; browser.once("error", error => { launchError = error; }); const browserExit = new Promise(resolve => browser.once("exit", () => { browserExited = true; resolve(); }));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function poll(fn, message, attempts = 180) { let last; for (let attempt = 0; attempt < attempts; attempt++) { try { const value = await fn(); if (value) return value; } catch (error) { last = error; } await delay(100); } throw Error(`${message}${last ? `: ${last.message}` : ""}`); }

try {
  const target = await poll(async () => { if (launchError) throw launchError; const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`), targets = await response.json(); return targets.find(value => value.type === "page"); }, "Chrome DevTools target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0; const pending = new Map(), issues = [];
  socket.onmessage = event => { const message = JSON.parse(event.data); if (message.method === "Runtime.exceptionThrown") issues.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text); if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") issues.push("console.error"); if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && !message.params.response.url.endsWith("/favicon.ico")) issues.push(`${message.params.response.status} ${message.params.response.url}`); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result); };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; };
  const navigate = async url => { await send("Page.navigate", { url }); await poll(() => evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`), `Page did not load: ${url}`); };
  const waitForText = text => poll(() => evaluate(`document.body?.innerText.includes(${JSON.stringify(text)})`), `Text was not rendered: ${text}`);
  const setInput = (label, value) => evaluate(`(() => { const input = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!input) throw Error('missing input ${label}'); const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const click = text => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(value => value.textContent?.trim() === ${JSON.stringify(text)}); if (!button) throw Error('missing button ${text}'); if (button.disabled) throw Error('disabled button ${text}'); button.click(); })()`);
  const choose = id => poll(() => evaluate(`(() => { const button = document.querySelector('[data-quick-asset-id=${JSON.stringify(id)}]'); if (!button) return false; button.click(); return true; })()`), `Asset was not rendered: ${id}`);

  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
  await navigate(`${webUrl}/?realm=${encodeURIComponent(state.browserSlug)}`); await evaluate(`sessionStorage.setItem(${JSON.stringify(`masterhost.realmAccess.${state.browserSlug}`)}, ${JSON.stringify(state.browserToken)}); localStorage.setItem('masterhost.realm', ${JSON.stringify(state.browserSlug)}); location.hash = 'game-builder';`);
  await waitForText("QUICK GAME BUILDER"); await waitForText("Step 1 of 12"); assert.equal(await evaluate(`document.body.innerText.includes('JSON') || document.body.innerText.includes('YAML')`), false);
  await setInput("Quick game name", "Voidwake Browser Voyage"); await setInput("Quick game seed", "m12-browser-seed"); await click("NEXT");
  const choices = [
    ["Setting", "masterhost.asset.voidwake.setting"], ["World template", "masterhost.asset.voidwake.world"], ["Locations", "masterhost.asset.voidwake.locations"], ["Cast", "masterhost.asset.voidwake.cast"], ["Items, clues and rewards", "masterhost.asset.voidwake.items"], ["Rules", "masterhost.asset.voidwake.rules"], ["Character Builder", "masterhost.asset.voidwake.characters"], ["Adventure, scenes and encounters", "masterhost.asset.voidwake.adventure"], ["Visual style", "masterhost.asset.voidwake.visuals"],
  ];
  for (const [heading, id] of choices) { await waitForText(heading); await choose(id); if (id === "masterhost.asset.voidwake.world") await setInput("Quick parameter missionPremise", "Escort the last archive ship through the closing storm."); await poll(() => evaluate(`[...document.querySelectorAll('button')].some(value => value.textContent?.trim() === 'NEXT' && !value.disabled)`), `NEXT stayed disabled for ${heading}`); await click("NEXT"); }
  await waitForText("World decisions"); await setInput("Decision world.tone", "tense"); await setInput("Decision world.environment", "frontier"); await click("NEXT");
  await waitForText("Complete review"); await waitForText("READY TO CREATE"); await waitForText("10 locations"); await waitForText("20 actors"); await waitForText("12 scenes"); await waitForText("CC-BY-4.0"); await waitForText("Campaign tone · Tense"); await waitForText("masterhost.asset.voidwake.world@1.0.0"); await waitForText("Exact dependencies · none"); await waitForText("Parameter missionPremise · Escort the last archive ship through the closing storm."); await poll(() => evaluate(`document.querySelectorAll('img.quickAssetPreview').length > 0 && [...document.querySelectorAll('img.quickAssetPreview')].every(value => value.complete && value.naturalWidth > 0)`), "Review media did not load");
  await click("CREATE PLAYABLE WORLD"); await waitForText("Generation report"); await waitForText("masterhost.game.");
  await evaluate("location.reload()"); await waitForText("Generation report"); await waitForText("masterhost.game.");
  assert.deepEqual(issues, []); console.log("M12 browser acceptance passed: a new GM used all 12 guided stages to review, create, compile and reload a playable one-shot without source editing.");
} finally { socket?.close(); browser.kill("SIGTERM"); await Promise.race([browserExit, delay(2_000)]); if (!browserExited) { browser.kill("SIGKILL"); await Promise.race([browserExit, delay(2_000)]); } await rm(profile, { recursive: true, force: true }); if (!browserExited) throw Error(`Chrome process ${browser.pid} did not exit`); }
