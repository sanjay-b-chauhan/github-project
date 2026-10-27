/* Scene kinds. Each builds its layers at film resolution and returns seek(lt, dur, p).
   Layers: L[0] ground, L[1] middle, L[2] type. */
(function () {
  const { E, makeText, textSeek, h, px, clamp, lerp, rng, halftoneURL } = window.Edits;
  const en = (lt, at, F) => F.ei(clamp((lt - at) / F.in));
  const IMG = n => 'img/' + n + '.jpg';

  function place(el, o) {
    for (const k of ['left', 'top', 'right', 'bottom', 'width', 'height']) if (o[k] != null) el.style[k] = px(o[k]);
    if (o.tf) el.style.transform = o.tf;
  }
  function headline(S, C, str, o) {
    const T = makeText(S.L[2], str, Object.assign({ font: 'var(--fd)', weight: 'var(--fdw)', color: C.pal.fg }, o));
    if (o.anchor === 'c') place(T.el, { left: C.W / 2, top: C.H / 2, tf: 'translate(-50%,-50%)' });
    else if (o.anchor === 'cl') place(T.el, { left: o.x, top: o.y, tf: 'translateY(-50%)' });
    else if (o.anchor === 'bl') { T.el.style.top = 'auto'; place(T.el, { left: o.x, bottom: o.bottom }); }
    S.texts.push(T);
    return T;
  }
  const sz = (C, wide, square, tall) => C.W * (C.shape === 'wide' ? wide : C.shape === 'tall' ? tall : square);
  const mode = C => C.o.text || 'mask';
  function photo(parent, name, extra) {
    const im = h('img', 'ph', extra || null, parent);
    im.src = IMG(name); im.alt = ''; im.draggable = false; im.decoding = 'async';
    return im;
  }

  const K = {};

  K.type = (S, C) => {
    const { W, H, pal } = C, d = S.d;
    const v = d.v != null ? d.v : S.i % 3;
    let plane = null, block = null;
    if (v === 1) plane = h('div', 'pl', { background: pal.accent, inset: 0 }, S.L[0]);
    if (v === 3 || v === 4) {
      const r = Math.min(W, H) * .16;
      if (v === 4) S.L[0].style.background = pal.surface2 || pal.surface;
      h('div', 'pl', { background: v === 3 ? pal.accent : pal.fg, width: px(r * 2), height: px(r * 2), left: px(W / 2 - r), top: px(H / 2 - r), borderRadius: '50%' }, S.L[0]);
      if (v === 4) for (let i = 0; i < 3; i++) h('div', 'pl', { background: pal.muted, height: px(H * .012), width: px(W * (.1 + i * .05)), left: px(W * .08), top: px(H * (.72 + i * .05)), borderRadius: px(H * .006) }, S.L[0]);
    }
    if (v === 2) {
      const b = Math.min(W, H) * .2;
      block = h('div', 'pl', { background: pal.accent, width: px(b), height: px(b), right: px(W * .07), top: px(H * .1), transformOrigin: '100% 0' }, S.L[0]);
    }
    const k = d.scale || 1;
    const T = v === 2
      ? headline(S, C, d.line, { size: k * sz(C, .066, .1, .11), w: W * (C.shape === 'wide' ? .62 : .84), anchor: 'bl', x: W * .07, bottom: H * (C.shape === 'tall' ? .2 : .11), color: pal.fg })
      : headline(S, C, d.line, { size: k * sz(C, .07, .1, .112), w: W * (C.shape === 'wide' ? .74 : .84), align: 'center', anchor: 'c', color: v === 1 ? (pal.onAccent || pal.bg) : pal.fg });
    S.hero = [.5, .5];
    return {
      seek(lt) {
        const F = C.F;
        if (plane) plane.style.clipPath = `inset(${(1 - en(lt, 0, F)) * 100}% 0 0 0)`;
        if (block) block.style.transform = `scale(${Math.max(0, en(lt, .08, F))})`;
        textSeek(T, lt, .14, mode(C), F, pal.accent);
      }
    };
  };

  K.photo = (S, C) => {
    const { W, H, pal } = C, d = S.d;
    const im = photo(S.L[0], d.img || 'neon', d.bw ? { filter: 'grayscale(1) contrast(1.15)' } : null);
    h('div', 'scrim', null, S.L[1]);
    const T = d.line ? headline(S, C, d.line, { size: sz(C, .052, .078, .088), w: W * (C.shape === 'wide' ? .56 : .84), anchor: 'bl', x: W * .07, bottom: H * (C.shape === 'tall' ? .22 : .1), color: '#F4F3EE' }) : null;
    S.hero = [.3, .75];
    return {
      seek(lt, dur) {
        im.style.transform = `scale(${1.1 - .04 * clamp(lt / Math.max(dur, 1))})`;
        if (T) textSeek(T, lt, .18, mode(C), C.F, pal.accent);
      }
    };
  };

  K.ui = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    let win, ho;
    if (shape === 'wide') { win = { x: W * .4, y: H * .15, w: W * .53, h: H * .7 }; ho = { size: W * .036, w: W * .28, anchor: 'cl', x: W * .07, y: H * .5 }; }
    else if (shape === 'tall') { win = { x: W * .06, y: H * .36, w: W * .88, h: H * .5 }; ho = { size: W * .082, w: W * .86, anchor: 'tl', x: W * .07, y: H * .13 }; }
    else { win = { x: W * .09, y: H * .32, w: W * .82, h: H * .6 }; ho = { size: W * .066, w: W * .82, anchor: 'tl', x: W * .09, y: H * .1 }; }
    const u = win.w / 760;
    const wEl = h('div', 'win', { left: px(win.x), top: px(win.y), width: px(win.w), height: px(win.h), background: pal.surface, borderRadius: px(22 * u), boxShadow: `0 0 0 ${px(1.5 * u)} ${pal.edge}` }, S.L[1]);
    const bar = h('div', 'win-bar', { height: px(54 * u), background: pal.surface2 || pal.surface }, wEl);
    for (let i = 0; i < 3; i++) h('i', 'dot', { width: px(12 * u), height: px(12 * u), left: px(22 * u + i * 20 * u), top: px(21 * u), background: pal.edge }, bar);
    const ctr = h('div', 'ctr', { right: px(24 * u), top: px(12 * u), fontSize: px(26 * u), color: pal.fg }, bar);
    const side = shape === 'tall' ? 0 : 150 * u;
    if (side) { const sb = h('div', 'side', { left: 0, top: px(54 * u), width: px(side), bottom: 0 }, wEl); for (let i = 0; i < 6; i++) h('i', 'row', { left: px(26 * u), top: px(36 * u + i * 46 * u), width: px((64 + (i * 29) % 50) * u), height: px(12 * u), background: pal.edge, borderRadius: px(6 * u) }, sb); }
    const bx = side + 28 * u, bw = win.w - bx - 28 * u;
    const pb = h('div', 'pbar', { left: px(bx), top: px(84 * u), width: px(bw), height: px(68 * u), borderRadius: px(16 * u), boxShadow: `0 0 0 ${px(1.5 * u)} ${pal.edge}`, background: pal.bg }, wEl);
    const run = h('div', 'run', { right: px(12 * u), top: px(12 * u), width: px(112 * u), height: px(44 * u), borderRadius: px(11 * u), background: pal.accent, color: pal.onAccent || pal.bg, fontSize: px(19 * u), lineHeight: px(44 * u) }, pb);
    run.textContent = 'Run';
    const typed = makeText(pb, d.prompt || 'Hand off today\'s busywork', { font: 'var(--fb)', size: 23 * u, weight: 500, color: pal.fg, ls: -0.01, x: 24 * u, y: 20 * u });
    S.texts.push(typed);
    const nCards = Math.max(1, Math.min(3, Math.floor((win.h - 190 * u) / 150 / u)));
    const cards = [];
    for (let i = 0; i < nCards; i++) {
      const c = h('div', 'card', { left: px(bx), top: px(180 * u + i * 148 * u), width: px(bw), height: px(128 * u), borderRadius: px(18 * u), background: pal.bg, boxShadow: `0 0 0 ${px(1.5 * u)} ${pal.edge}` }, wEl);
      h('i', 'av', { left: px(24 * u), top: px(40 * u), width: px(46 * u), height: px(46 * u), background: pal.accent, borderRadius: '50%' }, c);
      h('i', 'ln', { left: px(90 * u), top: px(44 * u), width: px(Math.min(bw * .42, (150 + i * 26) * u)), height: px(13 * u), background: pal.fg, borderRadius: px(7 * u) }, c);
      h('i', 'ln', { left: px(90 * u), top: px(70 * u), width: px(120 * u), height: px(10 * u), background: pal.edge, borderRadius: px(5 * u) }, c);
      const tr = h('i', 'trk', { right: px(90 * u), top: px(58 * u), width: px(Math.min(250 * u, bw * .3)), height: px(10 * u), background: pal.edge, borderRadius: px(5 * u) }, c);
      const fill = h('i', 'fill', { background: pal.accent }, tr);
      const ok = h('i', 'ok', { right: px(28 * u), top: px(44 * u), width: px(38 * u), height: px(38 * u), background: pal.fg, borderRadius: '50%' }, c);
      ok.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="${pal.bg}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      cards.push({ c, fill, ok });
    }
    const cs = W * .05;
    const cur = h('div', 'cursor', { width: px(cs), height: px(cs) }, wEl);
    cur.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.3 1.4-3.2 5.9z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    const T = headline(S, C, d.line, Object.assign({ color: pal.fg }, ho));
    const runX = bx + bw - 12 * u - 56 * u, runY = 84 * u + 34 * u;
    S.hero = [(win.x + runX) / W, (win.y + runY) / H];
    const N = d.count || 200;
    return {
      cam(lt) {
        const k = S.dur >= 4 ? 1 : S.dur / 4;
        const z = E.io3(clamp((lt - 1.15 * k) / (.45 * k))) * (1 - E.io3(clamp((lt - 2.05 * k) / (.6 * k))));
        return z > 0 ? { s: 1 + .28 * z, ox: win.x + runX, oy: win.y + runY } : null;
      },
      seek(lt, dur) {
        const F = C.F, k = dur >= 4 ? 1 : dur / 4;
        const q = en(lt, 0, F);
        wEl.style.transform = `translateY(${(1 - q) * 60 * u}px) scale(${.965 + .035 * q})`;
        textSeek(T, lt, .2 * k, mode(C), F, pal.accent);
        textSeek(typed, lt, .35 * k, 'type', F, pal.accent);
        /* cursor rides an arc to Run, presses, then drifts off */
        const a = E.io3(clamp((lt - .55 * k) / (.75 * k)));
        const sx = win.w * .82, sy = win.h * .92, ex = runX - 6 * u, ey = runY - 4 * u;
        const cx = lerp(sx, ex, a), cy = lerp(sy, ey, a) - Math.sin(a * Math.PI) * 90 * u;
        const b = E.io2(clamp((lt - 1.6 * k) / (.8 * k)));
        const pt = lt - 1.32 * k;
        const ps = pt < 0 ? 1 : pt < .1 ? 1 - .16 * E.i2(pt / .1) : 1 - .16 * (1 - E.o2(clamp((pt - .1) / .22)));
        cur.style.transform = `translate(${cx + b * 120 * u - cs * .21}px, ${cy + b * 260 * u - cs * .14}px) scale(${ps})`;
        run.style.transform = pt >= 0 && pt < .32 ? `scale(${1 - .06 * (1 - (ps - .84) / .16)})` : '';
        cards.forEach((c, i) => {
          const at = 1.45 * k + i * .08;
          const r = en(lt, at, F);
          c.c.style.visibility = lt >= at ? '' : 'hidden';
          c.c.style.transform = `translateY(${(1 - r) * 40 * u}px) scale(${.96 + .04 * r})`;
          const f = E.io2(clamp((lt - at - .3 * k) / (.75 * k)));
          c.fill.style.transform = `scaleX(${f})`;
          const pulse = lt - at - .3 * k;
          if (pulse > 0 && pulse < .25) c.c.style.transform += ` scale(${1 + .02 * Math.sin(pulse / .25 * Math.PI)})`;
          const o = E.back(1.6)(clamp((lt - at - 1.1 * k) / .3));
          c.ok.style.transform = `scale(${Math.max(0, o)})`;
        });
        const cd = E.o3(clamp((lt - 2.3 * k) / 1.0));
        ctr.textContent = String(Math.round(N * (1 - cd)));
      }
    };
  };

  K.bars = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    const vals = d.vals || [.34, .46, .41, .58, .72, .94];
    let ch, num, ho;
    if (shape === 'wide') { ch = { x: W * .5, w: W * .42, base: H * .8, h: H * .58 }; num = { x: W * .07, y: H * .16, size: W * .115 }; ho = { x: W * .07, y: H * .58, w: W * .36, size: W * .03 }; }
    else if (shape === 'tall') { ch = { x: W * .08, w: W * .84, base: H * .86, h: H * .36 }; num = { x: W * .08, y: H * .12, size: W * .27 }; ho = { x: W * .08, y: H * .3, w: W * .84, size: W * .07 }; }
    else { ch = { x: W * .08, w: W * .84, base: H * .9, h: H * .38 }; num = { x: W * .08, y: H * .08, size: W * .2 }; ho = { x: W * .08, y: H * .3, w: W * .84, size: W * .05 }; }
    const bw = ch.w / vals.length;
    const bars = vals.map((v, i) => h('i', 'bar', { left: px(ch.x + i * bw + bw * .18), width: px(bw * .64), top: px(ch.base - v * ch.h), height: px(v * ch.h), background: i === vals.length - 1 ? pal.accent : pal.muted, transformOrigin: '50% 100%', borderRadius: px(bw * .06) }, S.L[1]));
    h('i', 'base', { left: px(ch.x), top: px(ch.base), width: px(ch.w), height: px(Math.max(2, W * .0015)), background: pal.fg }, S.L[1]);
    const nEl = h('div', 'num', { left: px(num.x), top: px(num.y), fontSize: px(num.size), color: pal.fg }, S.L[2]);
    const T = headline(S, C, d.line, { size: ho.size, w: ho.w, x: ho.x, y: ho.y, color: pal.fg, anchor: 'tl' });
    const V = d.value != null ? d.value : 3.2, dec = String(V).includes('.') ? 1 : 0, suf = d.suffix != null ? d.suffix : 'x';
    S.hero = [(ch.x + ch.w) / W, (ch.base - ch.h * .9) / H];
    return {
      seek(lt) {
        const F = C.F;
        bars.forEach((b, i) => { const q = en(lt, .1 + i * .06, F); b.style.transform = `scaleY(${Math.max(0, q)})`; });
        const c = E.o3(clamp((lt - .15) / 1.0));
        nEl.textContent = (V * c).toFixed(dec) + suf;
        const q = en(lt, 0, F); nEl.style.transform = `translateY(${(1 - q) * 30}px)`;
        textSeek(T, lt, .3, mode(C), F, pal.accent);
      }
    };
  };

  K.object = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    S.L[0].style.background = `linear-gradient(180deg, ${pal.bg} 0%, ${pal.bg} 58%, ${pal.surface} 100%)`;
    const oh = H * (shape === 'tall' ? .4 : .62), ow = oh * .49, od = oh * .055;
    const cx = shape === 'wide' ? W * .66 : W * .5, cy = shape === 'tall' ? H * .58 : H * .5;
    const shadow = h('i', 'oshadow', { left: px(cx - ow * .75), top: px(cy + oh * .48), width: px(ow * 1.5), height: px(oh * .09), background: pal.light ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.55)', filter: `blur(${px(oh * .04)})` }, S.L[1]);
    const stage = h('div', 'stage', { left: px(cx - ow / 2), top: px(cy - oh / 2), width: px(ow), height: px(oh), perspective: px(W * 1.4) }, S.L[1]);
    const obj = h('div', 'obj', { width: px(ow), height: px(oh) }, stage);
    const r = ow * .14;
    const face = (w, hh, tf, bg) => h('div', 'face', { width: px(w), height: px(hh), transform: tf, background: bg, borderRadius: px(r) }, obj);
    const back = face(ow, oh, `translateZ(${-od / 2}px) rotateY(180deg)`, pal.surface2 || pal.surface);
    const sideL = face(od, oh, `translateX(${-od / 2}px) rotateY(-90deg)`, pal.surface); sideL.style.left = px(0); sideL.style.borderRadius = px(od / 2);
    const sideR = face(od, oh, `translateX(${ow - od / 2}px) rotateY(90deg)`, pal.surface); sideR.style.borderRadius = px(od / 2);
    const front = face(ow, oh, `translateZ(${od / 2}px)`, pal.surface);
    const scr = h('div', 'scr', { inset: px(ow * .045), borderRadius: px(r * .8), background: `linear-gradient(160deg, ${pal.accent}, ${pal.accent2 || pal.bg})` }, front);
    for (let i = 0; i < 3; i++) h('i', 'sl', { left: px(ow * .1), top: px(oh * (.62 + i * .08)), width: px(ow * (.62 - i * .14)), height: px(oh * .035), background: 'rgba(255,255,255,.85)', borderRadius: px(oh * .02) }, scr);
    const spec = h('i', 'specl', null, front);
    const T = headline(S, C, d.line, shape === 'wide'
      ? { size: W * .05, w: W * .36, anchor: 'cl', x: W * .09, y: H * .5 }
      : { size: W * .09, w: W * .84, anchor: 'tl', x: W * .08, y: H * .08 });
    S.hero = [cx / W, cy / H];
    return {
      seek(lt, dur, p) {
        const F = C.F;
        const q = en(lt, 0, F);
        const ry = lerp(-38, 26, E.io2(clamp(lt / Math.max(dur, 2.5)))), rx = -6;
        obj.style.transform = `translateY(${(1 - q) * oh * .18}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        shadow.style.transform = `scaleX(${.8 + .2 * q})`;
        const lit = .62 + .38 * Math.cos((ry + 18) * Math.PI / 180);
        front.style.filter = `brightness(${lit.toFixed(3)})`;
        sideR.style.filter = `brightness(${(.45 + .4 * clamp(-ry / 40)).toFixed(3)})`;
        sideL.style.filter = `brightness(${(.45 + .4 * clamp(ry / 40)).toFixed(3)})`;
        spec.style.transform = `translateX(${lerp(-120, 160, (ry + 38) / 64)}%) skewX(-18deg)`;
        void back;
        textSeek(T, lt, .2, mode(C), F, pal.accent);
      }
    };
  };

  K.portrait = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    const im = photo(S.L[0], d.img || 'bridge');
    const words = String(d.line || '').split(/\s+/).filter(Boolean);
    const chunks = []; for (let i = 0; i < words.length; i += 2) chunks.push(words.slice(i, i + 2));
    const size = sz(C, .06, .1, .13);
    const caps = chunks.map(ws => {
      const hero = ws.reduce((a, b) => (b.length > a.length ? b : a), '');
      const T = makeText(S.L[2], ws.join(' '), { font: 'var(--fd)', size, weight: 800, color: '#FFFFFF', ls: -0.02, align: 'center' });
      T.el.classList.add('cap');
      place(T.el, { left: W / 2, top: H * (shape === 'tall' ? .64 : .76), tf: 'translate(-50%,-50%)' });
      T.W.forEach((w, i) => { if (ws[i] === hero) w.inner.style.color = pal.accent; });
      S.texts.push(T);
      return T;
    });
    S.hero = [.5, .4];
    const per = .46;
    return {
      cam(lt) { return { s: lt > S.dur * .45 ? 1.13 : 1.0, oy: H * .38 }; },
      seek(lt) {
        im.style.transform = 'scale(1.04)';
        const idx = Math.floor((lt - .1) / per) % Math.max(1, caps.length);
        caps.forEach((T, i) => {
          const on = lt >= .1 && i === idx;
          T.el.style.visibility = on ? '' : 'hidden';
          if (on) { const k = (lt - .1) - Math.floor((lt - .1) / per) * per; const q = E.oX(clamp(k / .12)); T.el.style.scale = String(1.14 - .14 * q); }
        });
      }
    };
  };

  K.logo = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    const m = Math.min(W, H) * (shape === 'wide' ? .2 : .26);
    const tall = shape === 'tall';
    const mx = tall ? W / 2 - m * .65 : W * .5 - m * 1.55, my = tall ? H * .36 - m / 2 : H / 2 - m / 2;
    const mark = h('div', 'mark', { left: px(mx), top: px(my), width: px(m * 1.3), height: px(m) }, S.L[1]);
    const disc = h('i', 'mk', { left: 0, top: 0, width: px(m), height: px(m), borderRadius: '50%', background: pal.accent }, mark);
    const sq = h('i', 'mk', { left: px(m * .42), top: px(m * .12), width: px(m * .88), height: px(m * .76), borderRadius: px(m * .16), background: pal.fg }, mark);
    const word = makeText(S.L[2], d.line || 'Your brand', { font: 'var(--fd)', size: m * .5, weight: 'var(--fdw)', color: pal.fg, ls: -0.04 });
    if (tall) place(word.el, { left: W / 2, top: H * .36 + m * .72, tf: 'translateX(-50%)' }); else place(word.el, { left: mx + m * 1.5, top: H / 2, tf: 'translateY(-50%)' });
    S.texts.push(word);
    let sub = null;
    if (d.sub) {
      sub = makeText(S.L[2], d.sub, { font: 'var(--fb)', size: m * .16, weight: 500, color: pal.light ? pal.fg : '#9d9ca1', ls: -0.01 });
      if (tall) place(sub.el, { left: W / 2, top: H * .36 + m * 1.45, tf: 'translateX(-50%)' }); else place(sub.el, { left: mx + m * 1.52, top: H / 2 + m * .42 });
      S.texts.push(sub);
    }
    S.hero = [(mx + m / 2) / W, (my + m / 2) / H];
    return {
      seek(lt) {
        const F = C.F;
        const a = en(lt, .05, F), b = en(lt, .22, F);
        disc.style.transform = `scale(${Math.max(0, a)})`;
        sq.style.transform = `translateX(${(1 - b) * m * .9}px)`;
        sq.style.visibility = lt >= .22 ? '' : 'hidden';
        textSeek(word, lt, .5, 'mask', F, pal.accent);
        if (sub) textSeek(sub, lt, .85, 'mask', F, pal.accent);
      }
    };
  };

  K.collage = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    const imgs = d.imgs || ['flash', 'window', 'bridge', 'grass', 'friends', 'dunk'];
    const P = shape === 'tall'
      ? [{ x: .06, y: .07, w: .6, h: .4, o: 'b' }, { x: .38, y: .4, w: .56, h: .3, o: 'r' }, { x: .08, y: .66, w: .48, h: .27, o: 's' }]
      : shape === 'wide'
        ? [{ x: .05, y: .1, w: .34, h: .8, o: 'b' }, { x: .42, y: .07, w: .28, h: .46, o: 'r' }, { x: .73, y: .32, w: .22, h: .6, o: 's' }]
        : [{ x: .06, y: .08, w: .5, h: .58, o: 'b' }, { x: .6, y: .06, w: .34, h: .4, o: 'r' }, { x: .48, y: .52, w: .46, h: .4, o: 's' }];
    const r = rng(23 + S.i);
    const panels = P.map((p, i) => {
      const el = h('div', 'pan', { left: px(p.x * W), top: px(p.y * H), width: px(p.w * W), height: px(p.h * H), transformOrigin: p.o === 's' ? '0 100%' : '50% 50%' }, S.L[1]);
      const im = photo(el, imgs[(i + S.i) % imgs.length]);
      const cuts = []; let t = .6 + r() * .4; while (t < 30) { cuts.push(t); t += .28 + r() * .5; }
      return { el, im, p, cuts, at: .06 + i * .12 };
    });
    const T = headline(S, C, d.line, { size: sz(C, .1, .13, .15), w: W * .9, align: 'center', anchor: 'c', color: '#FFFFFF' });
    T.el.style.mixBlendMode = 'difference';
    S.hero = [.5, .5];
    return {
      seek(lt) {
        const F = C.F;
        panels.forEach((P2, i) => {
          const q = en(lt, P2.at, F);
          const tf = P2.p.o === 'b' ? `translateY(${(1 - q) * 110}%)` : P2.p.o === 'r' ? `translateX(${(1 - q) * 120}%)` : `scale(${Math.max(0, q)})`;
          P2.el.style.transform = tf;
          const since = lt - P2.at;
          let f = '';
          if (since >= 0 && since < 2 / 30) f = 'brightness(2.6) contrast(.55)';
          if (i === 1 && since >= 3 / 30 && since < 6 / 30) f = 'invert(1)';
          P2.el.style.filter = f;
          let n = 0; for (const c of P2.cuts) if (lt >= c) n++; else break;
          const src = IMG(imgs[(i + S.i + n * 2) % imgs.length]);
          if (!P2.im.src.endsWith(src)) P2.im.src = src;
        });
        textSeek(T, lt, .28, mode(C), F, pal.accent);
      }
    };
  };

  K.doc = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    S.L[0].style.background = pal.bg;
    const card = shape === 'tall' ? { x: .07, y: .3, w: .86, h: .44 } : shape === 'wide' ? { x: .07, y: .13, w: .5, h: .74 } : { x: .07, y: .26, w: .86, h: .5 };
    const cEl = h('div', 'paper', { left: px(card.x * W), top: px(card.y * H), width: px(card.w * W), height: px(card.h * H), transform: 'rotate(-1.6deg)', background: pal.surface }, S.L[1]);
    const r = rng(41 + S.i), pts = ['0% 0%', '100% 0%'];
    for (let i = 1; i < 18; i++) pts.push(`${(97 + r() * 3).toFixed(1)}% ${(i / 18 * 100).toFixed(1)}%`);
    pts.push('100% 100%', '0% 100%');
    cEl.style.clipPath = `polygon(${pts.join(',')})`;
    const ht = h('div', 'ht', null, cEl);
    halftoneURL(IMG(d.img || 'tokyo'), pal.fg, pal.surface, url => { ht.style.backgroundImage = `url(${url})`; });
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'route');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); S.L[1].appendChild(svg);
    const x0 = (card.x + .08) * W, y0 = (card.y + card.h * .8) * H, x1 = (card.x + card.w * .78) * W, y1 = (card.y + card.h * .22) * H;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${x0} ${y0} C ${x0 + W * .08} ${y0 - H * .3}, ${x1 - W * .16} ${y1 + H * .22}, ${x1} ${y1}`);
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', pal.accent); path.setAttribute('stroke-width', W * .005); path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    const dot = document.createElementNS(ns, 'circle'); dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', W * .011); dot.setAttribute('fill', pal.accent); svg.appendChild(dot);
    dot.style.transformOrigin = `${x1}px ${y1}px`; dot.style.transformBox = 'view-box';
    const len = 2200;
    path.style.strokeDasharray = len;
    const lab = shape === 'wide' ? { x: W * .62, y: H * .36, w: W * .3, size: W * .036 } : { x: W * .07, y: H * .08, w: W * .86, size: W * .07 };
    const box = h('div', 'label', { left: px(lab.x), top: px(lab.y), maxWidth: px(lab.w + lab.size), background: pal.fg, padding: `${px(lab.size * .3)} ${px(lab.size * .4)}` }, S.L[2]);
    const T = makeText(box, d.line, { font: 'var(--fd)', size: lab.size, weight: 'var(--fdw)', color: pal.bg, ls: -0.01, lh: 1.04 });
    T.el.style.position = 'relative';
    S.texts.push(T);
    S.hero = [x1 / W, y1 / H];
    return {
      seek(lt) {
        const F = C.F;
        const q = en(lt, 0, F);
        cEl.style.transform = `translateY(${(1 - q) * H * .06}px) rotate(${-1.6 + (1 - q) * 3}deg)`;
        const dr = E.io2(clamp((lt - .45) / 1.1));
        path.style.strokeDashoffset = String(len * (1 - dr));
        dot.style.transform = `scale(${Math.max(0, E.back(1.6)(clamp((lt - 1.5) / .3)))})`;
        const b = E.o3(clamp((lt - .3) / .45));
        box.style.clipPath = `inset(0 ${(1 - b) * 100}% 0 0)`;
        textSeek(T, lt, .5, 'mask', F, pal.accent);
      }
    };
  };

  K.grid = (S, C) => {
    const { W, H, pal, shape } = C, d = S.d;
    const imgs = d.imgs || ['court', 'dusk', 'street', 'grass', 'lanterns', 'window'];
    const [cols, rows] = shape === 'wide' ? [3, 2] : shape === 'tall' ? [2, 3] : [2, 2];
    const g = W * .012, cw = (W - g * (cols + 1)) / cols, chh = (H - g * (rows + 1)) / rows;
    const r = rng(9 + S.i), order = [...Array(cols * rows).keys()].sort(() => r() - .5);
    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      const x = g + (i % cols) * (cw + g), y = g + Math.floor(i / cols) * (chh + g);
      const el = h('div', 'cell', { left: px(x), top: px(y), width: px(cw), height: px(chh) }, S.L[1]);
      const im = photo(el, imgs[i % imgs.length]);
      cells.push({ el, im, at: .05 + order.indexOf(i) * .07 });
    }
    const T = d.line ? headline(S, C, d.line, { size: sz(C, .075, .11, .12), w: W * .86, align: 'center', anchor: 'c', color: '#FFFFFF' }) : null;
    if (T) T.el.style.mixBlendMode = 'difference';
    S.hero = [.5, .5];
    return {
      seek(lt, dur) {
        const F = C.F;
        cells.forEach(c => {
          const q = en(lt, c.at, F);
          c.el.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`;
          c.im.style.transform = `scale(${1.16 - .1 * E.o3(clamp((lt - c.at) / Math.max(dur, 1.5)))})`;
        });
        if (T) textSeek(T, lt, .45, mode(C), F, pal.accent);
      }
    };
  };

  window.EditsKinds = K;
})();
