// Compares the computed style of every live demo on index.html with the value recorded from the real v82.
// Run: node tests/run-parity.mjs   (prints PASS or each mismatch)
const W=ms=>new Promise(r=>setTimeout(r,ms));await W(3000);await document.fonts.ready;
const PROPS=['height','font-size','line-height','font-weight','letter-spacing','color','background-color','background-image','border-radius','box-shadow','padding','gap','opacity','border-top','display','align-items'];
const DEF={display:'',padding:'0px',gap:'normal','align-items':'normal','background-color':'rgba(0, 0, 0, 0)','background-image':'none','border-radius':'0px','box-shadow':'none',opacity:'1','border-top':''};
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
const fails=[],passes=[];
for(const [key,sel,opt={}] of window.__MAP){
  const r=window.__REAL[key];const el=document.querySelector(sel);
  if(!r){fails.push(key+': no real value');continue}
  if(!el){fails.push(key+': '+sel+' not found');continue}
  const s=getComputedStyle(el);const skip=new Set(opt.skip||[]);const diffs=[];
  for(const p of PROPS){
    if(skip.has(p))continue;
    let real=p==='height'?(r.box||'').split('x')[1]+'px':(r.style[p]!==undefined?r.style[p]:DEF[p]);
    let mine=p==='height'?Math.round(el.getBoundingClientRect().height)+'px':s.getPropertyValue(p);
    if(p==='border-top'&&/^0px/.test(mine))mine='';
    if(p==='display'){real=norm(real).replace('inline-','');mine=norm(mine).replace('inline-','');if(real==='block'||real==='')continue}
    if(real===undefined||real===null)continue;
    if(norm(real)!==norm(mine))diffs.push(`${p}: real ${norm(real)} | kit ${norm(mine)}`);
  }
  if(!skip.has('box')&&r.box){const w=+r.box.split('x')[0],mw=Math.round(el.getBoundingClientRect().width);if(Math.abs(w-mw)>1)diffs.push(`width: real ${w} | kit ${mw}`)}
  (diffs.length?fails:passes).push(diffs.length?`${key} (${sel})\n    `+diffs.join('\n    '):key);
}
return {checked:window.__MAP.length,passed:passes.length,failed:fails.length,fails};
