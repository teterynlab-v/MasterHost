import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const stateFile = process.env.M9_STATE_FILE;
const webUrl = process.env.M9_WEB_URL ?? "http://127.0.0.1:8132";
const cdpPort = Number(process.env.M9_CDP_PORT ?? 9339);
const chrome = process.env.CHROME_BIN ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : "google-chrome");
if (!stateFile) throw new Error("M9_STATE_FILE is required");

const state = JSON.parse(await readFile(stateFile, "utf8"));
assert.ok(state.browser?.participant?.accessToken, "browser participant fixture is missing");
const profile = await mkdtemp(path.join(os.tmpdir(), "masterhost-m9-chrome-"));
const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" });
let launchError;
browser.once("error", error => { launchError = error; });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function poll(fn, message, attempts = 100) {
  let last;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try { const value = await fn(); if (value) return value; }
    catch (error) { last = error; }
    await delay(100);
  }
  throw new Error(`${message}${last ? `: ${last.message}` : ""}`);
}

let socket;
try {
  const target = await poll(async () => {
    if (launchError) throw launchError;
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const targets = await response.json();
    return targets.find(value => value.type === "page");
  }, "Chrome DevTools target was not available");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const browserIssues = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") browserIssues.push(message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") browserIssues.push("console.error");
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      const entry = message.params.entry;
      if (entry.source !== "network") browserIssues.push(`${entry.text}${entry.url ? ` (${entry.url})` : ""}`);
    }
    if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && !message.params.response.url.endsWith("/favicon.ico")) browserIssues.push(`${message.params.response.status} ${message.params.response.url}`);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const navigate = async url => {
    await send("Page.navigate", { url });
    await poll(() => evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`), `Page did not load: ${url}`);
  };
  const waitForText = text => poll(() => evaluate(`document.body?.innerText.includes(${JSON.stringify(text)})`), `Text was not rendered: ${text}`);

  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Page.enable");
  await navigate(`${webUrl}/?realm=${encodeURIComponent(state.slug)}#realm`);
  await waitForText("Community discovery");
  assert.equal(await evaluate("document.body.innerText.includes('Creator collaboration')"), true);
  await evaluate(`(() => {
    const section = [...document.querySelectorAll('section')].find(value => value.querySelector('h2')?.textContent === 'Community discovery');
    const input = section?.querySelector('input');
    const button = [...(section?.querySelectorAll('button') ?? [])].find(value => value.textContent === 'SEARCH PUBLIC PACKS');
    if (!input || !button) throw new Error('community controls missing');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'collaborative');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    button.click();
  })()`);
  await waitForText("Sky Gates Community");
  await waitForText("license unspecified");

  await navigate(`${webUrl}/?realm=${encodeURIComponent(state.slug)}`);
  await evaluate(`(() => {
    localStorage.setItem('masterhost.realm', ${JSON.stringify(state.slug)});
    localStorage.setItem('masterhost.join', ${JSON.stringify(JSON.stringify(state.browser))});
    location.hash = 'join';
  })()`);
  await waitForText("Exploration, replay and canon");
  await waitForText("The Sky Gate is open");
  await waitForText("Replay timeline");
  await waitForText("deterministic recap");
  assert.equal(await evaluate("document.body.innerText.includes('AI disabled by default')"), true);
  assert.equal(await evaluate("document.body.innerText.includes('Connected')"), true);
  assert.deepEqual(browserIssues, []);
  console.log("M9 browser acceptance passed: community discovery and live player exploration/replay/canon UI rendered in headless Chrome.");
} finally {
  socket?.close();
  browser.kill("SIGTERM");
  if (browser.exitCode === null) await Promise.race([
    new Promise(resolve => browser.once("exit", resolve)),
    delay(2_000),
  ]);
  await rm(profile, { recursive: true, force: true });
}
