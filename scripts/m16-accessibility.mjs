import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const webUrl = process.env.M16_WEB_URL;
if (!webUrl) throw Error("M16_WEB_URL is required");
const port = Number(process.env.M16_A11Y_CDP_PORT ?? 9477);
const chrome = process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = await mkdtemp(path.join(os.tmpdir(), "masterhost-m16-a11y-"));
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;

async function poll(fn, label) {
  let last;
  for (let index = 0; index < 100; index++) {
    try { const value = await fn(); if (value) return value; } catch (error) { last = error; }
    await delay(100);
  }
  throw Error(`${label}${last ? `: ${last.message}` : ""}`);
}

try {
  const target = await poll(async () => (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.type === "page"), "Chrome target");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data), item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    ws.send(JSON.stringify({ id: next, method, params }));
  });
  const evaluate = async expression => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  const key = async (value, modifiers = 0) => {
    const code = value === "Tab" ? "Tab" : "Enter", virtual = value === "Tab" ? 9 : 13;
    const text = value === "Enter" ? "\r" : undefined;
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: value, code, text, unmodifiedText: text, modifiers, windowsVirtualKeyCode: virtual, nativeVirtualKeyCode: virtual });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: value, code, modifiers, windowsVirtualKeyCode: virtual, nativeVirtualKeyCode: virtual });
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${webUrl}/?realm=default&lang=en` });
  await poll(() => evaluate("document.readyState==='complete'&&Boolean(document.querySelector('.productHome'))"), "product home");

  const audit = await evaluate(`(()=>{const name=e=>(e.getAttribute('aria-label')||e.textContent||e.value||'').trim();return{lang:document.documentElement.lang,mains:document.querySelectorAll('main').length,h1:document.querySelectorAll('h1').length,primaryChoices:document.querySelectorAll('.homeChoices article').length,unnamedButtons:[...document.querySelectorAll('button')].filter(e=>!name(e)).length,unlabelledInputs:[...document.querySelectorAll('input,select,textarea')].filter(e=>!e.closest('label')&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).length,imagesWithoutAlt:document.querySelectorAll('img:not([alt])').length}})()`);
  assert.deepEqual(audit, { lang: "en", mains: 1, h1: 1, primaryChoices: 3, unnamedButtons: 0, unlabelledInputs: 0, imagesWithoutAlt: 0 });

  const visited = new Set();
  let joinTabIndex = 0;
  for (let index = 0; index < 12; index++) {
    await key("Tab");
    const focused = await evaluate(`(()=>{const e=document.activeElement;if(!e?.matches('.homeChoices button'))return null;return{text:(e.textContent||'').trim(),outline:getComputedStyle(e).outlineStyle}})()`);
    if (focused) {
      assert.notEqual(focused.outline, "none");
      visited.add(focused.text);
      if (focused.text === "Enter code" && !joinTabIndex) joinTabIndex = index + 1;
    }
  }
  assert.equal(visited.size, 3, `keyboard did not traverse all primary choices: ${[...visited].join(", ")}`);
  assert.ok(joinTabIndex, "Join primary control was not reached by keyboard");

  await send("Page.navigate", { url: `${webUrl}/?realm=default&lang=en` });
  await poll(() => evaluate("Boolean(document.querySelector('.productHome'))"), "home reload before keyboard activation");
  for (let index = 0; index < joinTabIndex; index++) await key("Tab");
  assert.equal(await evaluate("document.activeElement===document.querySelector('.homeChoices article:nth-child(2) button')"), true);
  await key("Enter");
  await poll(() => evaluate("location.hash==='#join'&&Boolean(document.querySelector('input'))"), "keyboard activation of Join");

  await send("Page.navigate", { url: `${webUrl}/?realm=default&lang=en` });
  await poll(() => evaluate("Boolean(document.querySelector('.productHome'))"), "home reload");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(200);
  assert.equal(await evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"), true);
  console.log("M16 accessibility check passed: landmarks, names, labels, image alternatives, all primary keyboard controls, Join activation, visible focus and 375px overflow.");
} finally {
  ws?.close();
  browser.kill("SIGTERM");
  await delay(300);
  await rm(profile, { recursive: true, force: true });
}
