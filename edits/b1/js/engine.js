/* Edits preview engine.
   Every preview is a pure seek(t): the same t always draws the same frame,
   the same contract HyperFrames renders use. Comps are built at true film
   resolution (1920 x 1080 and friends) and scaled down to fit. */
(function () {
  const RES = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080], '4:5': [1080, 1350], '21:9': [2520, 1080] };
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;

  const E = {
    lin: t => t,
    i2: t => t * t, o2: t => 1 - (1 - t) ** 2, io2: t => (t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    i3: t => t ** 3, o3: t => 1 - (1 - t) ** 3, io3: t => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
    i4: t => t ** 4, o4: t => 1 - (1 - t) ** 4, io4: t => (t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
    oX: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)), iX: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    ioX: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    sio: t => -(Math.cos(Math.PI * t) - 1) / 2,
    back: s => t => { const u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; },
    spring: (z, f) => t => {
      if (t >= 1) return 1;
      const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    }
  };

  /* Motion feels. in/out in seconds, st = word stagger in seconds, drift = share of frame per second. */
  const FEEL = {
    butter: { in: .45, out: .3, ei: E.o4, eo: E.i3, st: .15, drift: .01 },
    snap: { in: .24, out: .14, ei: E.oX, eo: E.i3, st: .08, drift: .004 },
    spring: { in: .8, out: .25, ei: E.spring(.55, 1.6), eo: E.i2, st: .12, drift: .008 },
    whip: { in: .38, out: .26, ei: E.ioX, eo: E.iX, st: .06, drift: .01, blur: 1 },
    slam: { in: .2, out: .12, ei: E.oX, eo: E.i3, st: .16, drift: .003, slam: 1 },
    drift: { in: 1.2, out: .9, ei: E.sio, eo: E.sio, st: .3, drift: .02 },
    twos: { in: .5, out: .3, ei: E.o3, eo: E.i3, st: .12, drift: .012, steps: 12 }
  };

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const hash = (n) => { const r = rng(n * 9301 + 49297); return r(); };

  function h(tag, cls, style, parent) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (style) Object.assign(el.style, style);
    if (parent) parent.appendChild(el);
    return el;
  }
  const px = v => v + 'px';

  /* entrance progress for an element that starts at `at` seconds */
  const en = (lt, at, F) => F.ei(clamp((lt - at) / F.in));

  /* ---------- Text ---------- */
  function makeText(parent, str, o) {
    const el = h('div', 'tx', {
      fontFamily: o.font, fontSize: px(o.size), fontWeight: o.weight || 600, color: o.color,
      letterSpacing: (o.ls != null ? o.ls : (o.size >= 30 ? -0.035 : -0.02)) + 'em', lineHeight: o.lh || 1.02,
      textAlign: o.align || 'left', width: o.w ? px(o.w) : 'auto', position: 'absolute'
    }, parent);
    if (o.x != null) el.style.left = px(o.x);
    if (o.y != null) el.style.top = px(o.y);
    if (o.bottom != null) el.style.bottom = px(o.bottom);
    if (o.center) { el.style.left = '50%'; el.style.transform = 'translateX(-50%)'; }
    const words = String(str || '').split(/\s+/).filter(Boolean);
    const W = [], C = [];
    words.forEach((w, i) => {
      const m = h('span', 'tw', null, el);
      const inner = h('span', 'twi', null, m);
      [...w].forEach(ch => { const c = h('span', 'tc', null, inner); c.textContent = ch; C.push({ el: c, w: i, ch }); });
      W.push({ m, inner, line: 0 });
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    const T = { el, W, C, lines: 1, size: o.size, baseLs: parseFloat(el.style.letterSpacing) };
    T.measure = () => {
      let top = null, line = -1;
      W.forEach(w => { const t = w.m.offsetTop; if (top === null || t > top + 4) { line++; top = t; } w.line = line; });
      T.lines = line + 1;
      C.forEach(c => { c.x = c.el.offsetLeft; c.y = c.el.offsetTop; c.wpx = c.el.offsetWidth; });
    };
    return T;
  }

  const GLYPHS = 'ABCDEFGHJKLMNPRSTUVXYZ0123456789#%&*+=<>/';
  function textSeek(T, lt, at, mode, F, accent) {
    const st = F.st;
    switch (mode) {
      case 'mask':
        T.W.forEach(w => { const q = en(lt, at + w.line * st * 1.4, F); w.inner.style.transform = `translateY(${(1 - q) * 112}%)`; });
        break;
      case 'words':
        T.W.forEach((w, i) => { const q = en(lt, at + i * st, F); w.inner.style.transform = `translateY(${(1 - q) * 112}%)`; });
        break;
      case 'chars':
        T.C.forEach((c, j) => { const q = en(lt, at + j * st * .32, F); c.el.style.transform = `translateY(${(1 - q) * 115}%) rotate(${(1 - q) * 12}deg)`; });
        break;
      case 'slam': {
        let shake = 0;
        T.W.forEach((w, i) => {
          const a = at + i * Math.max(st, .12);
          const on = lt >= a;
          w.m.style.visibility = on ? '' : 'hidden';
          const k = clamp((lt - a) / .2);
          w.inner.style.transform = `scale(${1.55 - .55 * E.oX(k)})`;
          const since = lt - a;
          if (since >= .16 && since < .16 + 2 / 30) shake = (i % 2 ? 1 : -1);
        });
        T.el.style.translate = shake ? `${shake * T.size * .04}px ${-shake * T.size * .03}px` : '0 0';
        break;
      }
      case 'scramble':
        T.C.forEach((c, j) => {
          const a = at + j * .022, lock = a + .32 + (j % 3) * .04;
          c.el.style.visibility = lt >= a ? '' : 'hidden';
          if (lt >= a && lt < lock) {
            const g = GLYPHS[Math.floor(hash(Math.floor(lt * 30) * 31 + j) * GLYPHS.length)];
            if (c.el.textContent !== g) c.el.textContent = g;
            c.el.style.color = accent;
          } else { if (c.el.textContent !== c.ch) c.el.textContent = c.ch; c.el.style.color = ''; }
        });
        break;
      case 'type': {
        if (!T.times) { const r = rng(7); let t = 0; T.times = T.C.map((c, j) => { t += .045 + r() * .07 + (j > 0 && T.C[j - 1].w !== c.w ? .06 : 0); return t; }); }
        let n = 0;
        T.C.forEach((c, j) => { const on = lt >= at + T.times[j]; c.el.style.visibility = on ? '' : 'hidden'; if (on) n = j + 1; });
        if (!T.caret) { T.caret = h('span', 'caret', { background: accent }, T.el); }
        const idle = lt - (at + (T.times[n - 1] || 0));
        T.caret.style.visibility = (lt < at || (n === T.C.length && Math.floor(idle / .53) % 2 === 1)) ? 'hidden' : '';
        const last = n ? T.C[n - 1] : null;
        if (last) { T.caret.style.left = px(last.x + last.wpx + T.size * .04); T.caret.style.top = px(last.y + T.size * .1); }
        else if (T.C[0]) { T.caret.style.left = px(T.C[0].x); T.caret.style.top = px(T.C[0].y + T.size * .1); }
        T.caret.style.height = px(T.size * .82);
        break;
      }
      case 'weight':
        T.C.forEach((c, j) => {
          const a = at + j * .03;
          const q = clamp((lt - a) / .7);
          c.el.style.fontVariationSettings = `'wght' ${Math.round(lerp(120, 820, E.o3(q)))}`;
          c.el.style.transform = `translateY(${(1 - E.o3(clamp((lt - a) / .32))) * 115}%)`;
        });
        break;
      case 'stretch':
        T.C.forEach((c, j) => {
          const a = at + j * .025;
          const q = E.o4(clamp((lt - a) / .8));
          c.el.style.fontVariationSettings = `'wdth' ${Math.round(lerp(50, 112, q))}, 'wght' 700`;
          c.el.style.transform = `translateY(${(1 - E.o3(clamp((lt - a) / .3))) * 115}%)`;
        });
        break;
      case 'track': {
        const q = E.oX(clamp((lt - at) / 1.4));
        T.el.style.letterSpacing = lerp(.55, T.baseLs, q) + 'em';
        T.W.forEach(w => { const k = en(lt, at + w.line * .06, F); w.inner.style.transform = `translateY(${(1 - k) * 112}%)`; });
        break;
      }
      case 'karaoke': {
        T.W.forEach((w, i) => {
          const q = E.oX(clamp((lt - at - i * .03) / .22));
          const hot = Math.floor((lt - at - .25) / .34) === i;
          w.inner.style.transform = `translateY(${(1 - q) * 112}%) scale(${hot ? 1.06 : 1})`;
          w.inner.style.color = hot ? accent : '';
        });
        break;
      }
    }
  }

  /* ---------- Camera ---------- */
  function camState(name, p, lt, dur, seed) {
    switch (name) {
      case 'push': return { s: 1 + .06 * E.sio(p) };
      case 'pull': return { s: 1.16 - .16 * E.o3(p) };
      case 'pan': return { x: lerp(.035, -.035, E.sio(p)), s: 1.08 };
      case 'orbit': return { ry: lerp(-9, 9, E.sio(p)), s: 1.06, par: 1 };
      case 'dolly': return { fg: 1 + .08 * E.sio(p), bg: 1.16 - .14 * E.sio(p) };
      case 'hand': {
        const r = rng(seed); const a = r() * 6, b = r() * 6, c = r() * 6;
        return { x: .0045 * Math.sin(1.7 * lt + a) + .002 * Math.sin(4.3 * lt + b), y: .004 * Math.sin(1.3 * lt + b) + .0018 * Math.sin(3.7 * lt + c), r: .35 * Math.sin(1.1 * lt + c), s: 1.05 };
      }
      case 'crane': return { y: lerp(.045, -.045, E.sio(p)), s: 1.1 };
      case 'punch': return { s: lt > dur * .45 ? 1.14 : 1 };
      case 'rack': { const k = E.io3(clamp((p - .3) / .4)); return { fgb: lerp(10, 0, k), bgb: lerp(0, 10, k), rk: 1 }; }
      default: return {};
    }
  }

  /* ---------- Transitions ---------- */
  /* Each returns styles for the outgoing (A) and incoming (B) scene and the overlays.
     p runs 0 to 1 across the transition window; the swap sits at p = 0.5. */
  const TR = {
    cut: { d: .001, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5 } }) },
    smash: { d: .16, f: (p) => { const q = clamp((p - .5) * 2); return { A: { vis: p < .5, s: 1 + .05 * E.i3(p * 2) }, B: { vis: p >= .5, s: 1.1 - .1 * E.o4(q) } }; } },
    whip: { d: .38, f: (p) => { const a = clamp(p * 2), b = clamp((p - .5) * 2); return { A: { vis: p < .5, tx: -1.15 * E.iX(a) * 100, blur: 26 * a, sx: 1 + .12 * a }, B: { vis: p >= .5, tx: 1.15 * (1 - E.oX(b)) * 100, blur: 26 * (1 - b), sx: 1 + .12 * (1 - b) } }; } },
    zoom: { d: .7, sp: .29, f: (p) => { const a = clamp(p / .29), b = clamp((p - .29) / .71); return { A: { vis: p < .29, s: 1 + .2 * E.i3(a), blur: 19 * E.i3(a) }, B: { vis: p >= .29, s: .75 + .25 * E.oX(b), blur: 19 * (1 - E.oX(b)) } }; } },
    izoom: { d: .7, sp: .3, f: (p) => { const a = clamp(p / .3), b = clamp((p - .3) / .7); return { A: { vis: p < .3, s: 1 - .2 * E.i3(a), blur: 14 * E.i3(a) }, B: { vis: p >= .3, s: 1.25 - .25 * E.oX(b), blur: 14 * (1 - E.oX(b)) } }; } },
    push: { d: .55, f: (p) => { const q = E.io4(p); return { A: { vis: true, tx: -100 * q }, B: { vis: true, tx: 100 * (1 - q) } }; } },
    mask: { d: .55, f: (p) => { const q = E.io3(p); const x = lerp(118, -18, q); return { A: { vis: true }, B: { vis: true, z: 2, clip: `polygon(${x}% 0, 130% 0, 130% 100%, ${x - 12}% 100%)` } }; } },
    rack: { d: .8, f: (p) => { const a = clamp(p * 2), b = clamp((p - .5) * 2); return { A: { vis: p < .5, blur: 12 * E.i2(a), s: 1 + .06 * E.i2(a) }, B: { vis: p >= .5, blur: 12 * (1 - E.o2(b)), s: 1.06 - .06 * E.o2(b) } }; } },
    flash: { d: .14, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5 }, flash: p > .3 && p < .72 }) },
    neg: { d: .12, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5, inv: p >= .5 && p < .92 } }) },
    curve: { d: .6, sp: .45, f: (p) => { const a = clamp(p / .45), b = clamp((p - .45) / .55); return { A: { vis: p < .45, tx: -12 * E.i4(a), blur: 18 * E.i4(a) }, B: { vis: p >= .45, tx: 12 * (1 - E.o4(b)), blur: 18 * (1 - E.o4(b)) } }; } },
    bars: { d: .7, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5 }, bars: p }) },
    morph: { d: .7, f: (p, c) => { const a = E.io3(clamp(p / .5)), b = E.io3(clamp((p - .5) / .5)); const r = p < .5 ? a * c.reach : (1 - b) * c.reach; const x = p < .5 ? c.ax : c.hx, y = p < .5 ? c.ay : c.hy; return { A: { vis: p < .5 }, B: { vis: p >= .5 }, blob: { r, x, y } }; } },
    sweep: { d: .75, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5 }, leak: p }) },
    ramp: { d: .5, f: (p) => { const a = clamp(p * 2), b = clamp((p - .5) * 2); return { A: { vis: p < .5, s: 1 + .32 * E.iX(a), tx: -4 * E.iX(a) }, B: { vis: p >= .5, s: 1.32 - .32 * E.oX(b), tx: 4 * (1 - E.oX(b)) } }; } },
    match: { d: .001, f: (p) => ({ A: { vis: p < .5 }, B: { vis: p >= .5 }, disc: 1 }) }
  };

  /* ---------- Grain and paper tiles ---------- */
  let NOISE = null, PAPER = null;
  function noiseURL() {
    if (NOISE) return NOISE;
    const c = document.createElement('canvas'); c.width = c.height = 192;
    const x = c.getContext('2d'); const d = x.createImageData(192, 192); const r = rng(11);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 190; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); NOISE = c.toDataURL(); return NOISE;
  }
  function paperURL() {
    if (PAPER) return PAPER;
    const c = document.createElement('canvas'); c.width = c.height = 384;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 384, 384); const r = rng(5);
    for (let i = 0; i < 2600; i++) { x.strokeStyle = `rgba(80,60,40,${.03 + r() * .07})`; x.lineWidth = .6 + r(); x.beginPath(); const sx = r() * 384, sy = r() * 384, a = r() * 6.28, l = 3 + r() * 14; x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); }
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(60,50,40,${r() * .05})`; x.fillRect(r() * 384, r() * 384, 1, 1); }
    PAPER = c.toDataURL(); return PAPER;
  }
  const HT = {};
  function halftoneURL(src, ink, paper, cb) {
    const key = src + ink + paper;
    if (HT[key]) return cb(HT[key]);
    const img = new Image(); img.onload = () => {
      const W = 760, H = Math.round(760 * img.height / img.width);
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.drawImage(img, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data;
      x.fillStyle = paper; x.fillRect(0, 0, W, H); x.fillStyle = ink; const cell = 7;
      for (let yy = 0; yy < H; yy += cell) for (let xx = (yy / cell) % 2 ? cell / 2 : 0; xx < W; xx += cell) {
        const i = (Math.min(H - 1, yy | 0) * W + Math.min(W - 1, xx | 0)) * 4; const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
        const rr = (1 - l) * cell * .62; if (rr > .3) { x.beginPath(); x.arc(xx, yy, rr, 0, 6.283); x.fill(); }
      }
      HT[key] = c.toDataURL('image/jpeg', .82); cb(HT[key]);
    }; img.src = src;
  }

  /* ---------- Comp ---------- */
  class Comp {
    constructor(host, o) {
      this.host = host; this.o = o; this.t = 0;
      this.build();
    }
    get ratio() { return this.o.ratio || '16:9'; }
    build() {
      const o = this.o;
      const [W, H] = RES[this.ratio] || RES['16:9'];
      this.W = W; this.H = H; this.shape = W / H >= 1.5 ? 'wide' : W / H <= .8 ? 'tall' : 'square';
      this.F = FEEL[o.feel] || FEEL.butter;
      this.pal = o.pal; this.fonts = o.fonts;
      this.host.innerHTML = '';
      this.cv = h('div', 'cv', { width: px(W), height: px(H), background: this.pal.bg }, this.host);
      this.cv.style.setProperty('--fd', this.fonts.d); this.cv.style.setProperty('--fb', this.fonts.b); this.cv.style.setProperty('--fdw', this.fonts.dw || 600); this.cv.style.setProperty('--fdv', this.fonts.dv || 'normal');
      this.scenes = (o.scenes || []).map((s, i) => this.buildScene(s, i));
      this.starts = []; let acc = 0; this.scenes.forEach(s => { this.starts.push(acc); acc += s.dur; }); this.total = acc;
      this.trs = (o.trans && o.trans.length ? o.trans : ['cut']);
      this.buildFx();
      this.fit();
      const measure = () => this.scenes.forEach(s => s.texts.forEach(T => T.measure()));
      measure();
      if (document.fonts && document.fonts.load) {
        const tok = this.tok = {};
        Promise.all([document.fonts.load(`700 100px ${this.fonts.d}`), document.fonts.load(`500 40px ${this.fonts.b}`)])
          .catch(() => { }).then(() => document.fonts.ready).then(() => { if (this.tok !== tok || !this.cv.isConnected) return; measure(); this.seek(this.t); });
      }
      this.seek(0);
    }
    fit() {
      const r = this.host.getBoundingClientRect();
      const s = Math.min(r.width / this.W, r.height / this.H) || .2;
      this.s = s;
      this.cv.style.transform = `translate(${(r.width - this.W * s) / 2}px, ${(r.height - this.H * s) / 2}px) scale(${s})`;
      if (this.fxGrain) this.fxGrain.style.backgroundSize = px(192 / s * .9);
      if (this.fxScan) this.fxScan.style.backgroundSize = `100% ${px(Math.max(4, 3 / s))}`;
    }
    buildScene(s, i) {
      const el = h('div', 'sc', { visibility: 'hidden' }, this.cv);
      const cam = h('div', 'cam', null, el);
      const L = [h('div', 'ly', null, cam), h('div', 'ly', null, cam), h('div', 'ly', null, cam)];
      const S = { i, el, cam, L, dur: s.dur, d: s, texts: [], hero: s.hero || [.5, .5], kind: s.kind || 'type' };
      const K = window.EditsKinds[S.kind] || window.EditsKinds.type;
      S.k = K(S, this);
      return S;
    }
    buildFx() {
      const tex = this.o.tex || [];
      const fx = this.fx = h('div', 'fx', null, this.cv);
      this.tex = new Set(tex);
      if (this.tex.has('paper')) this.fxPaper = h('div', 'fx-paper', { backgroundImage: `url(${paperURL()})` }, fx);
      if (this.tex.has('halftone')) this.fxHalf = h('div', 'fx-half', null, fx);
      if (this.tex.has('scan')) this.fxScan = h('div', 'fx-scan', null, fx);
      if (this.tex.has('dust')) { this.fxDust = h('div', 'fx-dust', null, fx); this.dust = []; for (let i = 0; i < 7; i++) this.dust.push(h('i', null, null, this.fxDust)); }
      if (this.tex.has('grain')) this.fxGrain = h('div', 'fx-grain', { backgroundImage: `url(${noiseURL()})` }, fx);
      if (this.tex.has('vignette') && !this.pal.light) h('div', 'fx-vig', { boxShadow: `inset 0 0 ${px(this.W * .16)} ${px(this.W * .02)} rgba(0,0,0,.55)` }, fx);
      this.fxLeak = h('div', 'fx-leak', { visibility: 'hidden' }, fx);
      this.fxFlash = h('div', 'fx-flash', { visibility: 'hidden' }, fx);
      this.fxBlob = h('div', 'fx-blob', { visibility: 'hidden', background: this.pal.accent }, fx);
      this.fxDisc = h('div', 'fx-disc', { visibility: 'hidden', background: this.pal.accent }, fx);
      this.fxBars = h('div', 'fx-bars', { visibility: 'hidden' }, fx);
      this.bars = []; for (let i = 0; i < 5; i++) this.bars.push(h('i', null, { background: i % 2 ? this.pal.fg : this.pal.accent }, this.fxBars));
    }
    sceneAt(t) {
      for (let i = this.scenes.length - 1; i >= 0; i--) if (t >= this.starts[i]) return i;
      return 0;
    }
    applyLook(S, L, lt) {
      const st = S.el.style;
      st.visibility = L.vis ? 'visible' : 'hidden';
      st.zIndex = L.z || 1;
      const sx = L.sx || 1;
      st.transform = (L.tx || L.ty || L.s || sx !== 1) ? `translate(${L.tx || 0}%, ${L.ty || 0}%) scale(${(L.s || 1) * sx}, ${L.s || 1})` : '';
      let f = '';
      if (L.blur > .3) f += `blur(${L.blur.toFixed(1)}px) `;
      if (L.inv) f += 'invert(1) ';
      if (L.burst) f += `blur(${L.burst}px) `;
      st.filter = f;
      st.clipPath = L.clip || '';
      if (L.vis) this.seekScene(S, lt);
    }
    seekScene(S, lt) {
      const F = this.F;
      if (F.steps) lt = Math.floor(lt * F.steps) / F.steps;
      const p = clamp(lt / S.dur);
      const cam = Object.assign({}, camState(this.o.cam, p, lt, S.dur, 17 + S.i), S.k.cam ? S.k.cam(lt) : null);
      const d = (this.F.drift || 0) * lt;
      const s = (cam.s || 1) * (1 + d * .5);
      const tx = (cam.x || 0) * this.W, ty = (cam.y || 0) * this.H;
      const ox = cam.ox != null ? cam.ox : this.W / 2, oy = cam.oy != null ? cam.oy : this.H / 2;
      S.cam.style.transformOrigin = `${ox}px ${oy}px`;
      S.cam.style.transform = `translate(${tx}px, ${ty}px) rotateY(${cam.ry || 0}deg) rotate(${cam.r || 0}deg) scale(${s})`;
      S.el.style.perspective = cam.par ? px(this.W * 1.2) : '';
      S.L[0].style.transform = cam.par ? `translateZ(${-this.W * .1}px) scale(1.1)` : cam.bg ? `scale(${cam.bg})` : '';
      S.L[2].style.transform = cam.par ? `translateZ(${this.W * .025}px)` : cam.fg ? `scale(${cam.fg})` : '';
      S.L[0].style.filter = cam.rk ? `blur(${cam.bgb.toFixed(1)}px)` : '';
      S.L[2].style.filter = cam.rk ? `blur(${cam.fgb.toFixed(1)}px)` : '';
      S.k.seek(lt, S.dur, p);
    }
    seek(t) {
      if (!this.scenes.length) return;
      const total = this.total;
      t = ((t % total) + total) % total;
      this.t = t;
      const n = this.scenes.length;
      /* find a boundary whose window holds t (boundary k sits between scene k-1 and k; 0 wraps) */
      let act = null;
      for (let k = 0; k < n; k++) {
        const b = k === 0 ? total : this.starts[k];
        const name = this.trs[(k + n - 1) % this.trs.length];
        const T = TR[name] || TR.cut;
        const sp = T.sp != null ? T.sp : .5;
        const lo = b - T.d * sp, hi = b + T.d * (1 - sp);
        let tt = t;
        if (k === 0 && t < T.d * (1 - sp)) tt = t + total;
        if (tt >= lo && tt < hi && n > 1) { act = { k, name, T, p: (tt - lo) / T.d, b, tt }; break; }
      }
      const fxReset = () => {
        this.fxFlash.style.visibility = 'hidden'; this.fxBlob.style.visibility = 'hidden';
        this.fxLeak.style.visibility = 'hidden'; this.fxBars.style.visibility = 'hidden'; this.fxDisc.style.visibility = 'hidden';
      };
      fxReset();
      this.scenes.forEach(S => { S.el.style.visibility = 'hidden'; });
      const i = this.sceneAt(t);
      if (!act) {
        const S = this.scenes[i];
        const lt = t - this.starts[i];
        const L = { vis: true };
        if (this.tex.has('burst')) { const bt = lt - S.dur * .58; if (bt >= 0 && bt < 3 / 30) L.burst = 14; }
        if (this.tex.has('neg') && lt >= 0 && lt < 2 / 30 && i > 0) L.inv = true;
        this.applyLook(S, L, lt);
        if (this.tex.has('sweep')) this.leakAt((t % 7) / 7 * 2.6 - .5, true);
      } else {
        const A = this.scenes[(act.k + n - 1) % n], B = this.scenes[act.k];
        const ltA = act.tt - (act.k === 0 ? this.starts[n - 1] : this.starts[act.k - 1]);
        const ltB = act.tt - act.b;
        const c = this.ctxFor(A, B);
        const R = act.T.f(act.p, c);
        this.applyLook(A, R.A, ltA);
        const LB = Object.assign({}, R.B);
        if (this.tex.has('neg') && act.name !== 'flash' && ltB >= 0 && ltB < 2 / 30) LB.inv = true;
        this.applyLook(B, LB, ltB);
        if (R.flash) this.fxFlash.style.visibility = 'visible';
        if (R.blob) { const b = this.fxBlob.style; b.visibility = 'visible'; b.clipPath = `circle(${R.blob.r}px at ${R.blob.x}px ${R.blob.y}px)`; }
        if (R.leak != null) this.leakAt(R.leak * 1.6 - .3, false);
        else if (this.tex.has('sweep')) this.leakAt((t % 7) / 7 * 2.6 - .5, true);
        if (R.bars != null) this.barsAt(R.bars);
        if (R.disc) { const d = this.fxDisc.style; d.visibility = 'visible'; const r = Math.min(this.W, this.H) * .16; d.width = d.height = px(r * 2); d.left = px(this.W / 2 - r); d.top = px(this.H / 2 - r); }
        if (this.tex.has('chroma')) this.chroma(B, true);
      }
      if (this.tex.has('chroma') && !act) this.scenes.forEach(S => this.chroma(S, false));
      if (this.fxGrain) { const f = Math.floor(t * 24); this.fxGrain.style.backgroundPosition = `${Math.floor(hash(f) * 192)}px ${Math.floor(hash(f + 99) * 192)}px`; }
      if (this.fxScan) this.fxScan.style.opacity = .55 + .12 * hash(Math.floor(t * 30));
      if (this.fxDust) { const f = Math.floor(t * 12); this.dust.forEach((d, j) => { const r = rng(f * 13 + j); const on = r() > .45; d.style.visibility = on ? 'visible' : 'hidden'; d.style.left = px(r() * this.W); d.style.top = px(r() * this.H); d.style.width = px(2 + r() * (j % 3 === 0 ? 40 : 5)); d.style.height = px(j % 3 === 0 ? 1.5 : 2 + r() * 4); d.style.transform = `rotate(${r() * 180}deg)`; }); }
    }
    ctxFor(A, B) {
      const reach = Math.hypot(this.W, this.H) * 1.05;
      return { reach, hx: B.hero[0] * this.W, hy: B.hero[1] * this.H, ax: A.hero[0] * this.W, ay: A.hero[1] * this.H };
    }
    leakAt(x, ambient) {
      const l = this.fxLeak.style; l.visibility = 'visible';
      l.transform = `translateX(${x * 100}%) skewX(-14deg)`;
      l.opacity = ambient ? .26 : 1;
    }
    barsAt(p) {
      this.fxBars.style.visibility = 'visible';
      this.bars.forEach((b, j) => {
        const a = clamp((p - j * .05) / .45), c = clamp((p - .5 - j * .05) / .45);
        const y = p < .5 + j * .05 ? (1 - E.io3(a)) * 100 : -E.io3(c) * 100;
        b.style.transform = `translateY(${y}%)`;
      });
    }
    chroma(S, on) {
      S.texts.forEach(T => { T.el.style.textShadow = on ? `${-T.size * .03}px 0 rgba(255,30,60,.75), ${T.size * .03}px 0 rgba(0,190,255,.75)` : ''; });
    }
    destroy() { this.host.innerHTML = ''; }
  }

  /* ---------- Ticker: only visible comps draw ---------- */
  const live = new Set();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { const c = e.target.__comp; if (c) c.visible = e.isIntersecting; }), { rootMargin: '80px' }) : null;
  function mount(host, o, opts = {}) {
    if (host.__comp) unmount(host);
    const c = new Comp(host, o);
    c.loop = opts.loop || null; c.speed = opts.speed || 1; c.manual = !!opts.manual; c.t0 = performance.now() - (opts.offset || 0) * 1000;
    c.visible = !io; host.__comp = c; live.add(c);
    if (io) io.observe(host);
    return c;
  }
  /* custom previews share the ticker: obj needs seek(t), fit(), destroy() */
  function mountCustom(host, obj, opts = {}) {
    if (host.__comp) unmount(host);
    obj.t0 = performance.now(); obj.speed = opts.speed || 1; obj.visible = !io; obj.manual = false;
    host.__comp = obj; live.add(obj); if (io) io.observe(host);
    return obj;
  }
  function unmount(host) {
    const c = host.__comp; if (!c) return;
    live.delete(c); if (io) io.unobserve(host); c.destroy(); host.__comp = null;
  }
  let reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(now) {
    live.forEach(c => {
      if (!c.visible || c.manual || document.hidden) return;
      const t = (now - c.t0) / 1000 * c.speed;
      c.seek(reduce ? c.total * .6 : t);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.addEventListener('resize', () => live.forEach(c => c.fit()));

  window.Edits = { RES, E, FEEL, TR, Comp, mount, mountCustom, unmount, makeText, textSeek, h, px, clamp, lerp, rng, hash, halftoneURL, live };
})();
