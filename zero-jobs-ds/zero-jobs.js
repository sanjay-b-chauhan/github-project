/* Zero Jobs design system, v1. Small helpers that print the same markup the Job Portal prints.
   Needs Lucide 0.469.0 for icons: <script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script> */
(function(){
  // Zero's eyes, as the portal draws them in v82: [left eye path, stroke width, right eye path if it is not a mirror]
  const EYES={idle:['M38 35V47',14],talk:['M38 35V47',14],listen:['M38 34V48',14.5],think:['M38.5 37V45',13,'M61.5 34V46'],work:['M38 36V46',13.5],alert:['M38 33V48',15]};
  // where the eyes look for each mood (x and y, -1 to 1)
  const LOOK={think:[.35,-.75],work:[0,.2],listen:[0,.5],alert:[0,-.1]};
  const flip=d=>{let c='',n=0;return d.replace(/[MLQV]|-?\d+(?:\.\d+)?/g,t=>{if(/[MLQV]/.test(t)){c=t;n=0;return t}return c!=='V'&&n++%2===0?String(100-t):t})};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const zj={
    /* Zero. size: 24, 26, 28, 34, 36, 44 or 60. mood: idle, talk, listen, think, work, alert.
       still: no blink (use for small avatars in lists). look: [x, y] to point the eyes. */
    orb(size=34,mood='idle',o={}){
      const e=EYES[mood]||EYES.idle,g=o.look||LOOK[mood]||[0,0];
      return`<span class="zj-orb zj-s${size}${o.still?' zj-still':''}" data-m="${mood}" role="img" aria-label="Zero" style="--gx:${g[0]};--gy:${g[1]}"><span class="zj-orb-b"></span><svg class="zj-orb-e" viewBox="0 0 100 100" aria-hidden="true"><g class="zj-orb-eg"><path class="l" d="${e[0]}" stroke-width="${e[1]}"/><path class="r" d="${e[2]||flip(e[0])}" stroke-width="${e[1]}"/></g></svg></span>`;
    },
    /* the zero wordmark, 52px wide in the top bar. It takes the text colour */
    logoMark(){return`<svg class="zj-logo" viewBox="0 0 373 136" xmlns="http://www.w3.org/2000/svg" aria-label="zero"><path d="M303.572 115.999C294.465 115.999 286.219 113.845 278.834 109.538C271.45 105.23 265.604 99.4455 261.296 92.1841C256.988 84.9227 254.835 76.9228 254.835 68.1845C254.835 59.3231 256.988 51.3233 261.296 44.1849C265.604 37.0466 271.45 31.3236 278.834 27.016C286.219 22.7084 294.465 20.5546 303.572 20.5546C312.926 20.5546 321.233 22.7084 328.495 27.016C335.879 31.3236 341.664 37.1081 345.848 44.3695C350.156 51.5079 352.31 59.4462 352.31 68.1845C352.31 76.9228 350.156 84.9227 345.848 92.1841C341.664 99.4455 335.879 105.23 328.495 109.538C321.11 113.845 312.803 115.999 303.572 115.999ZM303.572 95.8763C308.864 95.8763 313.541 94.6456 317.603 92.1841C321.664 89.5995 324.864 86.215 327.202 82.0304C329.664 77.8459 330.895 73.2921 330.895 68.3691C330.895 63.3231 329.664 58.7078 327.202 54.5232C324.864 50.3387 321.664 47.0156 317.603 44.5542C313.541 41.9696 308.864 40.6773 303.572 40.6773C298.403 40.6773 293.726 41.9696 289.542 44.5542C285.48 47.0156 282.219 50.3387 279.757 54.5232C277.419 58.7078 276.25 63.3231 276.25 68.3691C276.25 73.2921 277.419 77.8459 279.757 82.0304C282.219 86.215 285.48 89.5995 289.542 92.1841C293.726 94.6456 298.403 95.8763 303.572 95.8763Z" fill="currentColor"></path><path d="M224.893 113.785H203.478V52.6503C203.478 36.2583 216.767 22.9699 233.159 22.9699H257.939V43.8311H232.313C228.215 43.8311 224.893 47.1532 224.893 51.2512V113.785Z" fill="currentColor"></path><path d="M152.213 115.998C142.982 115.998 134.675 113.968 127.29 109.906C119.906 105.722 114.06 99.9986 109.752 92.7372C105.568 85.4758 103.475 77.1067 103.475 67.6299C103.475 59.0147 105.383 51.0764 109.198 43.815C113.137 36.5536 118.614 30.769 125.629 26.4614C132.644 22.1538 140.767 20 149.998 20C159.351 20 167.351 22.0923 173.997 26.2768C180.643 30.3383 185.751 35.8151 189.32 42.7073C193.012 49.5995 194.858 57.2301 194.858 65.5992V73.1683H120.275L123.967 66.153C123.598 72.0606 124.583 77.3528 126.921 82.0297C129.26 86.7065 132.583 90.3988 136.89 93.1064C141.198 95.814 146.244 97.1679 152.028 97.1679C157.444 97.1679 162.305 95.9987 166.613 93.6602C171.043 91.1987 174.49 87.6296 176.951 82.9527L193.382 91.4449C189.443 99.3217 183.905 105.414 176.766 109.721C169.628 113.906 161.444 115.998 152.213 115.998ZM125.075 60.2454H173.443C173.074 56.0609 171.843 52.3687 169.751 49.1687C167.782 45.9688 165.074 43.5073 161.628 41.7842C158.182 39.9381 154.244 39.015 149.813 39.015C145.259 39.015 141.198 39.9996 137.629 41.9688C134.183 43.815 131.413 46.338 129.321 49.5379C127.229 52.7379 125.813 56.3071 125.075 60.2454Z" fill="currentColor"></path><path d="M98.8426 113.782H40.6897C33.9206 113.782 28.7515 112.059 25.1823 108.613C21.7362 105.044 20.0132 101.044 20.0132 96.6133C19.8901 92.6749 20.6286 89.2904 22.2285 86.4596C23.8285 83.6289 26.4131 81.0444 29.9822 78.7059L75.766 46.2142C76.7506 45.3527 77.2429 44.4296 77.2429 43.445C77.2429 42.5835 76.9353 42.0297 76.3199 41.7835C75.8276 41.4143 75.2122 41.2297 74.4738 41.2297H22.4131V22.9531H78.9045C85.6736 22.9531 90.7812 24.7377 94.2273 28.3068C97.7964 31.7529 99.581 35.6913 99.581 40.122C99.581 44.0604 98.781 47.4449 97.1811 50.2757C95.7042 53.1064 93.1811 55.691 89.612 58.0294L43.8282 90.7057C42.7205 91.4442 42.1666 92.3672 42.1666 93.4749C42.1666 94.2133 42.4128 94.7672 42.9051 95.1364C43.5205 95.3826 44.1974 95.5056 44.9358 95.5056H98.8426V113.782Z" fill="currentColor"></path></svg>`},
    /* a company's real logo in its tile. size: '' (32), 'l' (44), 'xs' (24 round), 'xxs' (20 round) */
    logo(domain,size=''){return`<span class="zj-lg${size?' zj-'+size:''}"><img src="https://www.google.com/s2/favicons?sz=128&domain=${esc(domain)}" alt="" loading="lazy"></span>`},
    /* a person: a generated face. Never a real stranger's photo, never initials when a face exists */
    face(src,size=''){return`<span class="zj-av${size?' zj-'+size:''}"><img src="${esc(src)}" alt=""></span>`},
    /* a person at a company: the face with the company's logo badge */
    faceAt(src,domain){return`<span class="zj-face"><span class="zj-av"><img src="${esc(src)}" alt=""></span><span class="zj-lg"><img src="https://www.google.com/s2/favicons?sz=128&domain=${esc(domain)}" alt=""></span></span>`},
    icon(name){return`<i data-lucide="${name}"></i>`},
    icons(root){if(window.lucide)lucide.createIcons(root?{root}:undefined)},
    /* a toast: white, one line, one action. It leaves by itself after 4.2s */
    toast(text,o={}){
      let host=document.getElementById('zj-toast');
      if(!host){host=document.createElement('div');host.id='zj-toast';host.style.cssText='position:fixed;left:50%;bottom:24px;z-index:450;transform:translateX(-50%);pointer-events:none';(document.querySelector('.zj')||document.body).appendChild(host)}
      const ti=o.icon?`<span class="zj-ti${o.icon==='heart'?' zj-heart':''}">${zj.icon(o.icon)}</span>`:'';
      host.innerHTML=`<div class="zj-toast" style="pointer-events:auto">${ti}<span class="zj-clip">${esc(text)}</span>${o.action?`<button type="button">${esc(o.action)}${o.actionIcon?zj.icon(o.actionIcon):''}</button>`:''}</div>`;
      const b=host.querySelector('button');if(b&&o.onAction)b.onclick=o.onAction;
      zj.icons(host);clearTimeout(zj._tt);zj._tt=setTimeout(()=>{host.innerHTML=''},4300);
    },
    /* why it fits, under the pill, arrow on the pill's start. strong: true for a strong fit */
    pop(anchor,html,o={}){
      zj.unpop();const r=anchor.getBoundingClientRect(),p=document.createElement('div');
      p.className='zj-pop'+(o.strong?' zj-strong':'');p.id='zj-pop';p.setAttribute('role','tooltip');p.innerHTML=html;
      p.style.cssText=`position:fixed;z-index:450;pointer-events:none;left:${Math.round(r.left)}px;top:${Math.round(r.bottom+10)}px;--ax:16px`;
      (document.querySelector('.zj')||document.body).appendChild(p);zj.icons(p);return p;
    },
    unpop(){const p=document.getElementById('zj-pop');if(p)p.remove()},
    /* the rounded option: every button goes full round */
    rounded(on=true){(document.querySelector('.zj')||document.body).classList.toggle('zj-rounded',on)},
    /* dates the way the portal writes them: Tue 13 Oct */
    date(d){d=new Date(d);return['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]},
    /* pay the way the portal writes it: $85k to 105k */
    pay(a,b,cur='$'){return`${cur}${Math.round(a/1000)}k to ${Math.round(b/1000)}k`},
    EYES,LOOK
  };
  window.zj=zj;
})();
