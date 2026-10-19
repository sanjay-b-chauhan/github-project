// node tests/run-screens.mjs : rebuilt screens vs the real portal (v82), pixel by pixel at 1512 by 860.
// V82=<url or path> to compare with a local copy. Needs Google Chrome and Python 3 with Pillow.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here),out=path.join(here,'out');mkdirSync(out,{recursive:true});
// the portal runs its own clock, so load it from disk: a slow network would let the story run ahead
let V82=process.env.V82||'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal-index-assets/v/v82.html';
if(/^https?:/.test(V82)){const f=path.join(out,'_v82.html');writeFileSync(f,Buffer.from(await (await fetch(V82)).arrayBuffer()));V82='file://'+f}
else if(!V82.startsWith('file:'))V82='file://'+path.resolve(V82);
const shot=readFileSync(path.join(here,'shot.js'),'utf8');
const W=process.env.WIN||'1512,860';
// how to reach each screen in the real portal
const REAL={'for-you':'','jobs':"A.go('jobs');render(true);",'inbox':"A.go('inbox');render(true);",'role':"A.go('jobs');render(true);await new Promise(r=>setTimeout(r,1200));[...document.querySelectorAll('tbody tr')].find(t=>t.querySelector('.zy-sp.ok')).click();"};
const run=(url,script,env={})=>{const f=path.join(out,'_s.js');writeFileSync(f,script);execFileSync('node',[path.join(here,'drive.mjs'),url,f],{env:{...process.env,WIN:W,SHOT_DIR:out,...env},encoding:'utf8'})};
let worst=0;
for(const [name,go] of Object.entries(REAL)){
  run('file://'+path.join(root,'screens',name+'.html'),`window.__name='rebuilt-${name}';\n`+shot);
  // the live Zero glances at random; centre its eyes so only the design is compared
  const still="setTimeout(()=>document.querySelectorAll('.orb').forEach(o=>{o.style.setProperty('--gx',0);o.style.setProperty('--gy',0)}),1800);";
  // For you is captured 4s after load, before the portal's story moves on to the next event
  const first=name==='for-you'?1500:3500;
  run(V82+'?as=mid',`await new Promise(r=>setTimeout(r,${first}));${go}${still}window.__name='real-${name}';window.__wait=2500;\n`+shot,{PORT:'9335',READY:'typeof S'});
  const r=execFileSync('python3',[path.join(here,'diff.py'),path.join(out,`real-${name}.png`),path.join(out,`rebuilt-${name}.png`),name,path.join(out,`diff-${name}.png`)],{encoding:'utf8'}).trim();
  console.log(r);const pct=parseFloat(r.match(/= ([\d.]+)%/)[1]);worst=Math.max(worst,pct);
}
console.log(worst<0.05?'PASS: every screen within 0.05% of the portal':'CHECK: a screen differs by more than 0.05%, open tests/out/diff-*.png');
