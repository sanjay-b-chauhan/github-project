// still the page (no animation, no caret), wait for fonts and images, then save a PNG named by SHOT
const W=ms=>new Promise(r=>setTimeout(r,ms));
await W(+(window.__wait||2500));
const st=document.createElement('style');st.textContent='*,*::before,*::after{animation-play-state:paused!important;animation-delay:-10s!important;transition:none!important;caret-color:transparent!important}';document.head.appendChild(st);
await document.fonts.ready;await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})));await W(400);
await __shot(window.__name||'shot');await W(600);return {ok:1,err:window.__e||[]};
