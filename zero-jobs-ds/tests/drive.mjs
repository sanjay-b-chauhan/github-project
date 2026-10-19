#!/usr/bin/env node
// Headless Chrome driver for sweeping the prototype without the Browser pane's
// hidden-tab timer throttling. Usage: node drive.mjs <url> <script.js>
// The script file is evaluated in the page (top-level await allowed); its
// completion value is printed as JSON. `__e` collects uncaught errors.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [url, scriptPath] = process.argv.slice(2);
if (!url || !scriptPath) { console.error('usage: drive.mjs <url> <script.js>'); process.exit(2); }
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = +(process.env.PORT || 9334);
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--user-data-dir=/tmp/zj-ds-headless-profile', `--window-size=${process.env.WIN || '1512,900'}`, '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required', ...(process.env.DPR ? [`--force-device-scale-factor=${process.env.DPR}`] : []), 'about:blank',
], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50; i++) {
  try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); target = list.find(t => t.type === 'page'); if (target) break; } catch {}
  await sleep(200);
}
if (!target) { chrome.kill(); console.error('chrome did not start'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (process.env.DEBUG) console.error('[cdp]', JSON.stringify(r).slice(0, 900));
  if (r.result?.exceptionDetails) return { __exception: JSON.stringify(r.result.exceptionDetails).slice(0, 1200) };
  if (!r.result) return { __protocol: JSON.stringify(r).slice(0, 600) };
  return r.result.result.value;
};
await send('Page.enable'); await send('Runtime.enable');
// __shot('name') from page code saves a PNG next to the script
const shotDir = process.env.SHOT_DIR || '/tmp';
await send('Runtime.addBinding', { name: '__shot' });
const { writeFileSync } = await import('node:fs');
const origOnMessage = ws.onmessage;
ws.onmessage = async e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.bindingCalled' && m.params.name === '__shot') {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${shotDir}/${m.params.payload}.png`, Buffer.from(r.result.data, 'base64'));
    return;
  }
  origOnMessage(e);
};
await send('Page.navigate', { url });
// wait until the page's own script has run (the shell defines S), so a slow CDN cannot race the sweep
for (let i = 0; i < 100; i++) { const r = await send('Runtime.evaluate', { expression: process.env.READY || "document.readyState==='complete'", returnByValue: true }); if (r.result?.result?.value === true || r.result?.result?.value === 'object') break; await sleep(150); }
await sleep(300);
await evaluate(`window.__e=[];addEventListener('error',e=>__e.push(e.message));addEventListener('unhandledrejection',e=>__e.push('rej:'+String(e.reason)));1`);
const script = readFileSync(scriptPath, 'utf8');
const out = await evaluate(`(async()=>{${script}\n})().then(v=>JSON.stringify(v),e=>JSON.stringify({__thrown:String(e&&e.stack||e)}))`);
try { console.log(JSON.stringify(JSON.parse(out), null, 1)); } catch { console.log(out); }
ws.close(); chrome.kill();
