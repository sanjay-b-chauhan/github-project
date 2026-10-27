(function () {
  const D = window.EDITS, X = window.Edits;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = {
    check: '<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="#0b0b0c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 16 16"><path d="M8 7v4.5M8 4.6v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 16 16"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><path d="M4.5 3h2.4v10H4.5zM9.1 3h2.4v10H9.1z" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    ext: '<svg viewBox="0 0 16 16"><path d="M6 3h7v7M13 3L4 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    safe: '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="4.5" y="5.5" width="7" height="5" rx=".5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    copy: '<svg viewBox="0 0 16 16"><rect x="5" y="5" width="8.5" height="8.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10.5V4a1.5 1.5 0 011.5-1.5H11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    down: '<svg viewBox="0 0 16 16"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const fontOf = id => { const f = D.fonts[id] || D.fonts.geist; return { d: f.d, b: f.b, dw: f.dw, dv: f.dv }; };
  const RES = X.RES;

  /* ---------- state ---------- */
  const KEY = 'edits-state-v1';
  function recipe(id) {
    const r = D.edits[id];
    const scenes = r.scenes.map(s => Object.assign({}, s));
    const sum = scenes.reduce((a, s) => a + s.dur, 0);
    if (!r.locked && Math.abs(sum - r.len) > .05) {
      scenes.forEach(s => { s.dur = Math.max(.5, Math.round(s.dur * r.len / sum * 10) / 10); });
      const left = r.len - scenes.reduce((a, s) => a + s.dur, 0);
      scenes[scenes.length - 1].dur = Math.round((scenes[scenes.length - 1].dur + left) * 10) / 10;
    }
    const has = k => scenes.some(s => k.includes(s.kind));
    return {
      edit: id, ratios: [...r.ratios], view: r.ratios[0], len: r.len, fps: r.fps, feel: r.feel, cam: r.cam, trans: [...r.trans], text: r.text, font: r.font, pal: r.pal, tex: [...r.tex], sound: r.sound, world: r.world, scenes,
      bpm: r.bpm || (r.sound === 'beat' ? 128 : 112.5), voice: r.sound === 'voice' ? 'take' : 'none',
      assets: { logo: 'attach', brand: 'attach', ui: has(['ui']) ? 'make' : 'none', footage: has(['photo', 'portrait', 'grid', 'collage', 'doc']) ? 'attach' : 'none', photos: 'none', voiceTake: r.sound === 'voice' ? 'attach' : 'none', music: r.sound === 'silent' || r.sound === 'sfx' ? 'none' : 'attach' }
    };
  }
  const base = {
    step: 'format', subject: '', audience: '', message: '', platform: [], voice: 'none', words: '', engine: 'hyperframes',
    refs: [{ url: '', at: '', borrow: ['Moves', 'Pacing'] }], noRefs: false, track: '',
    assets: { logo: 'attach', brand: 'attach', ui: 'make', footage: 'none', photos: 'make', voiceTake: 'none', music: 'attach' },
    outputs: ['master', 'cutdowns', 'player'], captions: 'none', approval: 'stills', deadline: '',
    notesPicked: {}, noteText: '', briefEdit: null
  };
  let S = Object.assign({}, base, recipe('launch'));
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && saved.edit && D.edits[saved.edit]) S = Object.assign(S, saved); } catch (e) { }
  let saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }, 300); }

  /* ---------- toast ---------- */
  let toastT = 0;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800); }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch (e) { const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(msg); } catch (e2) { toast('Select the text and copy it'); } ta.remove(); }
  }

  /* ---------- previews ---------- */
  const camImg = { push: 'street', pull: 'court', pan: 'tokyo', orbit: 'lanterns', dolly: 'hood', hand: 'friends', crane: 'dusk', punch: 'bridge', rack: 'neon', locked: 'window' };
  const texImg = { grain: 'dusk', paper: 'tokyo', halftone: 'friends', scan: 'neon', dust: 'lanterns', vignette: 'street', sweep: 'court', chroma: 'crowd', burst: 'dunk', neg: 'flash' };
  const textLine = { mask: 'Make it move. Then land.', words: 'Every word lands on time', chars: 'Cascade', slam: 'Hit. Every. Beat.', scramble: 'DECODED', type: 'Hand off the busywork', weight: 'Weight', stretch: 'Stretch', track: 'Night Shift', karaoke: 'Every word lands on the beat' };

  function previewFor(cat, id) {
    const pal = D.pal[S.pal];
    switch (cat) {
      case 'edit': {
        const r = D.edits[id];
        return { comp: { ratio: r.ratios[0], scenes: r.scenes.slice(0, 4).map(s => Object.assign({}, s, { dur: Math.min(2.4, Math.max(1.5, s.dur * .5)) })), feel: r.feel, cam: r.cam, trans: r.trans, text: r.text, pal: D.pal[r.pal], fonts: fontOf(r.font), tex: r.tex } };
      }
      case 'cam': return { comp: { ratio: '16:9', scenes: [{ kind: 'photo', img: camImg[id], line: D.cams[id].name, dur: 3.4 }], feel: 'butter', cam: id, trans: ['cut'], text: 'mask', pal: D.pal.graphite, fonts: fontOf('geist'), tex: [] } };
      case 'trans': {
        const sc = id === 'match'
          ? [{ kind: 'type', v: 3, line: '', dur: 1.3 }, { kind: 'type', v: 4, line: '', dur: 1.3 }]
          : [{ kind: 'type', v: 1, line: 'Scene A', dur: 1.5 }, { kind: 'photo', img: 'neon', line: 'Scene B', dur: 1.5 }];
        return { comp: { ratio: '16:9', scenes: sc, feel: 'butter', cam: 'push', trans: [id], text: 'mask', pal: D.pal.graphite, fonts: fontOf('geist'), tex: [] } };
      }
      case 'text': return { comp: { ratio: '16:9', scenes: [{ kind: 'type', v: 0, line: textLine[id], dur: id === 'type' || id === 'karaoke' ? 3.4 : 2.8 }], feel: 'butter', cam: 'locked', trans: ['cut'], text: id, pal: D.pal.graphite, fonts: fontOf(id === 'stretch' ? 'anybody' : id === 'weight' ? 'bricolage' : id === 'karaoke' ? 'anton' : 'geist'), tex: [] } };
      case 'font': return { comp: { ratio: '16:9', scenes: [{ kind: 'type', v: 0, line: 'Make it move', dur: 3.2, scale: 1.7 }], feel: 'butter', cam: 'locked', trans: ['cut'], text: 'mask', pal, fonts: fontOf(id), tex: [] } };
      case 'pal': return { comp: { ratio: '16:9', scenes: [{ kind: 'type', v: 2, line: D.pal[id].name, dur: 2.4 }, { kind: 'type', v: 1, line: 'One accent', dur: 2.4 }], feel: 'butter', cam: 'push', trans: ['curve'], text: 'mask', pal: D.pal[id], fonts: fontOf(S.font), tex: [] } };
      case 'tex': {
        const cut = ['chroma', 'burst', 'neg'].includes(id);
        const sc = cut ? [{ kind: 'photo', img: texImg[id], line: '', dur: 1.4 }, { kind: 'photo', img: 'neon', line: '', dur: 1.4 }] : [{ kind: 'photo', img: texImg[id], line: '', dur: 3.2 }];
        const p = id === 'paper' || id === 'halftone' ? D.pal.news : D.pal.graphite;
        return { comp: { ratio: '16:9', scenes: id === 'paper' ? [{ kind: 'doc', img: 'tokyo', line: 'On paper', dur: 3.2 }] : sc, feel: 'butter', cam: 'push', trans: ['cut'], text: 'mask', pal: p, fonts: fontOf('shoulders'), tex: [id] } };
      }
      case 'sound': return { custom: soundPreview(id) };
      case 'feel': return { custom: feelPreview(id) };
      case 'ratio': return { custom: ratioPreview(id) };
    }
  }
  function mountPreview(host, cat, id, opts) {
    const p = previewFor(cat, id);
    if (!p) return;
    if (p.comp) X.mount(host, p.comp, opts || {});
    else if (p.custom) { host.innerHTML = ''; host.appendChild(p.custom.node); X.mountCustom(host, p.custom); }
  }

  function svgEl(tag, attrs, parent) { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }

  /* motion feel: an After Effects style value graph with the move under it */
  function feelPreview(id) {
    const F = X.FEEL[id];
    const W = 320, H = 200;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gsvg', preserveAspectRatio: 'xMidYMid meet' });
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const rest = .35, hold = .8, tail = .4;
    const L = rest + F.in + hold + F.out + tail;
    const val = t => {
      let x = t;
      if (F.steps) x = Math.floor(x * F.steps) / F.steps;
      if (x < rest) return 0;
      if (x < rest + F.in) return F.ei((x - rest) / F.in);
      if (x < rest + F.in + hold) return 1;
      if (x < rest + F.in + hold + F.out) return 1 - F.eo((x - rest - F.in - hold) / F.out);
      return 0;
    };
    const gx = 18, gy = 22, gw = W - 36, gh = 104;
    svgEl('rect', { x: gx, y: gy, width: gw, height: gh, rx: 6, fill: '#121214' }, svg);
    for (let i = 1; i < 4; i++) svgEl('line', { x1: gx + gw * i / 4, x2: gx + gw * i / 4, y1: gy, y2: gy + gh, stroke: '#1e1e22', 'stroke-width': 1 }, svg);
    let d = '';
    for (let i = 0; i <= 200; i++) { const t = L * i / 200; const v = val(t); d += (i ? 'L' : 'M') + (gx + gw * i / 200).toFixed(1) + ' ' + (gy + gh - 14 - v * (gh - 34)).toFixed(1); }
    svgEl('path', { d, fill: 'none', stroke: '#ecebe6', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg);
    const ph = svgEl('line', { y1: gy, y2: gy + gh, stroke: '#ff0101', 'stroke-width': 1.5 }, svg);
    const dot = svgEl('circle', { r: 4, fill: '#ff0101' }, svg);
    svgEl('rect', { x: gx, y: 150, width: gw, height: 30, rx: 8, fill: '#121214' }, svg);
    const blk = svgEl('rect', { y: 155, width: 40, height: 20, rx: 5, fill: '#ecebe6' }, svg);
    return {
      node: svg, total: L,
      seek(t) {
        t = t % L; const v = val(t);
        const x = gx + gw * t / L, y = gy + gh - 14 - v * (gh - 34);
        ph.setAttribute('x1', x); ph.setAttribute('x2', x);
        dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        blk.setAttribute('x', gx + 6 + v * (gw - 52));
      },
      fit() { }, destroy() { }
    };
  }
  function soundPreview(id) {
    const W = 320, H = 200;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const r = X.rng(id.length * 31 + 7), N = 56, bars = [];
    const gx = 16, gw = W - 32, mid = 100;
    const beats = id === 'silent' ? [] : [0, 1, 2, 3, 4, 5, 6, 7].map(i => gx + gw * (i + .5) / 8);
    beats.forEach((x, i) => svgEl('line', { x1: x, x2: x, y1: 36, y2: 164, stroke: i % 4 === 0 ? '#34343a' : '#202024', 'stroke-width': 1 }, svg));
    for (let i = 0; i < N; i++) {
      const x = gx + gw * i / N;
      let a;
      if (id === 'silent') a = .04;
      else if (id === 'voice') a = (Math.floor(i / 7) % 2 ? .12 : .35 + r() * .5);
      else if (id === 'sfx') a = (i % 9 === 3 ? .9 : .05 + r() * .06);
      else if (id === 'beat') { const near = beats.some(b => Math.abs(b - x) < 4); a = near ? .95 : .2 + r() * .25; }
      else a = .16 + r() * .18 + (i % 14 === 6 ? .55 : 0);
      bars.push({ x, a, n: svgEl('rect', { x: x, width: gw / N - 1.6, rx: 1.2, fill: '#ecebe6' }, svg) });
    }
    if (id !== 'silent') beats.forEach(x => svgEl('rect', { x: x - 1, y: 170, width: 2, height: 10, rx: 1, fill: id === 'beat' ? '#ff0101' : '#4a4a50' }, svg));
    const ph = svgEl('line', { y1: 30, y2: 170, stroke: '#ff0101', 'stroke-width': 1.5 }, svg);
    const L = 3.2;
    return {
      node: svg, total: L,
      seek(t) {
        t = t % L; const px = gx + gw * t / L;
        ph.setAttribute('x1', px); ph.setAttribute('x2', px);
        bars.forEach(b => { const k = Math.max(0, 1 - Math.abs(b.x - px) / 26); const a = b.a * (.55 + .45 * k); const hh = Math.max(2, a * 120); b.n.setAttribute('y', mid - hh / 2); b.n.setAttribute('height', hh); b.n.setAttribute('fill', b.x < px ? '#ecebe6' : '#55555b'); });
      },
      fit() { }, destroy() { }
    };
  }
  function ratioPreview(id) {
    const [w, h] = RES[id];
    const node = el('div', 'rprev');
    node.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center';
    const k = Math.min(140 / w, 74 / h);
    const fr = el('div');
    fr.style.cssText = `width:${w * k}px;height:${h * k}px;border-radius:6px;box-shadow:inset 0 0 0 1.5px #ecebe6;position:relative;display:grid;place-items:center`;
    const inner = el('div'); inner.style.cssText = 'position:absolute;inset:10%;box-shadow:inset 0 0 0 1px #3a3a40;border-radius:3px';
    fr.appendChild(inner);
    const col = el('div'); col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px';
    const lab = el('span', 'mono', D.ratios[id].px); lab.style.cssText = 'font-size:11px;color:#9d9ca1';
    col.appendChild(fr); col.appendChild(lab);
    node.appendChild(col);
    return { node, total: 1, seek() { }, fit() { }, destroy() { } };
  }

  /* ---------- tiles ---------- */
  function tile(cat, id, item, o) {
    o = o || {};
    const b = el('button', 'tile');
    b.type = 'button';
    b.dataset.cat = cat; b.dataset.id = id;
    const pv = el('div', 'pv');
    b.appendChild(pv);
    const tk = el('span', 'tick', I.check); b.appendChild(tk);
    if (!o.noInfo) { const inf = el('span', 'info', I.info); inf.title = 'Details'; inf.addEventListener('click', e => { e.stopPropagation(); openSheet(cat, id); }); b.appendChild(inf); }
    const meta = el('div', 'meta', `<b>${esc(item.name)}</b><span>${esc(item.line || item.use || '')}</span>`);
    if (cat === 'pal') { const sw = el('div', 'swatch'); [item.bg, item.surface, item.muted, item.fg, item.accent].forEach(c => { const i = el('i'); i.style.background = c; sw.appendChild(i); }); b.appendChild(sw); }
    b.appendChild(meta);
    requestAnimationFrame(() => mountPreview(pv, cat, id, { offset: (o.offset || 0) }));
    return b;
  }
  function tileGrid(cat, map, isOn, onPick, cls) {
    const g = el('div', 'tiles' + (cls ? ' ' + cls : ''));
    Object.keys(map).forEach((id, i) => {
      const t = tile(cat, id, map[id], { offset: i * .37 });
      if (isOn(id)) t.classList.add('on');
      t.addEventListener('click', () => { onPick(id, t, g); });
      g.appendChild(t);
    });
    return g;
  }
  function syncTiles(g, isOn) { $$('.tile', g).forEach(t => t.classList.toggle('on', isOn(t.dataset.id))); }
  function grp(title, hint, body) {
    const s = el('section', 'grp');
    s.appendChild(el('div', 'grp-h', `<h3>${esc(title)}</h3>${hint ? `<span>${esc(hint)}</span>` : ''}`));
    if (body) s.appendChild(body);
    return s;
  }
  function seg(options, value, onPick) {
    const s = el('div', 'seg');
    options.forEach(([v, label]) => {
      const b = el('button', value === v ? 'on' : '', esc(label)); b.type = 'button';
      b.addEventListener('click', () => { $$('button', s).forEach(x => x.classList.remove('on')); b.classList.add('on'); onPick(v); });
      s.appendChild(b);
    });
    return s;
  }
  function chips(options, values, onToggle, max) {
    const c = el('div', 'chips');
    options.forEach(([v, label]) => {
      const b = el('button', 'chip' + (values.includes(v) ? ' on' : ''), esc(label)); b.type = 'button';
      b.addEventListener('click', () => {
        const on = values.includes(v);
        if (on) values.splice(values.indexOf(v), 1);
        else { if (max && values.length >= max) values.shift(); values.push(v); }
        $$('.chip', c).forEach((x, i) => x.classList.toggle('on', values.includes(options[i][0])));
        onToggle();
      });
      c.appendChild(b);
    });
    return c;
  }
  function field(label, input, full) { const f = el('div', 'field' + (full ? ' full' : '')); f.appendChild(el('label', null, esc(label))); f.appendChild(input); return f; }
  function input(value, ph, on, ta) {
    const i = el(ta ? 'textarea' : 'input', 'in'); if (!ta) i.type = 'text';
    i.value = value || ''; i.placeholder = ph || '';
    i.addEventListener('input', () => on(i.value));
    return i;
  }

  /* ---------- steps ---------- */
  const STEPS = [
    ['format', 'Format'], ['story', 'Story'], ['motion', 'Motion'], ['look', 'Look'], ['sound', 'Sound'], ['refs', 'References'], ['deliver', 'Deliver']
  ];
  const total = () => S.scenes.reduce((a, s) => a + (+s.dur || 0), 0);
  function summary(id) {
    switch (id) {
      case 'format': return `${D.edits[S.edit].name}, ${S.ratios.join(' ')}, ${S.len} s`;
      case 'story': return S.message ? S.message : `${S.scenes.length} scenes, message missing`;
      case 'motion': return `${D.feels[S.feel].name}, ${D.cams[S.cam].name}, ${S.trans.map(t => D.trans[t].name).join(', ')}`;
      case 'look': return `${D.fonts[S.font].name}, ${D.pal[S.pal].name}`;
      case 'sound': return `${D.sounds[S.sound].name}${S.sound === 'beat' ? ', ' + S.bpm + ' BPM' : ''}`;
      case 'refs': { const n = S.refs.filter(r => r.url.trim()).length; return n ? `${n} reference${n > 1 ? 's' : ''}` : S.noRefs ? 'Recipe references' : 'None yet'; }
      case 'deliver': return S.approval === 'stills' ? 'Stills first, then render' : 'Straight to render';
    }
  }
  function done(id) {
    if (id === 'story') return !!S.message.trim();
    if (id === 'refs') return S.noRefs || S.refs.some(r => r.url.trim());
    return true;
  }
  function renderRail() {
    const r = $('#steps'); r.innerHTML = '';
    STEPS.forEach(([id, name], i) => {
      const b = el('button', 'step' + (S.step === id ? ' on' : '') + (done(id) ? ' done' : ''));
      b.type = 'button'; b.dataset.step = id;
      b.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${name}<i class="st"></i></span><span class="s">${esc(summary(id))}</span>`;
      b.addEventListener('click', () => go(id));
      r.appendChild(b);
    });
    r.appendChild(el('p', 'rail-foot', 'Pick, then Copy brief and paste it into Claude Code. The edits skill runs it.'));
  }
  function refreshRail() {
    $$('#steps .step').forEach(b => {
      const id = b.dataset.step;
      b.classList.toggle('done', done(id)); b.classList.toggle('on', S.step === id);
      const s = $('.s', b); const v = summary(id); if (s.textContent !== v) s.textContent = v;
    });
  }
  function go(id) {
    S.step = id; save();
    refreshRail(); renderStage();
    $('#stage').scrollTop = 0;
    if (window.innerWidth <= 900) { const b = $(`#steps [data-step="${id}"]`); if (b) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
  }
  function nextBtn(id) {
    const i = STEPS.findIndex(s => s[0] === id);
    const w = el('div', 'next');
    if (i < STEPS.length - 1) { const b = el('button', 'btn solid', `Next: ${STEPS[i + 1][1]}`); b.type = 'button'; b.addEventListener('click', () => go(STEPS[i + 1][0])); w.appendChild(b); }
    return w;
  }
  function changed(what) {
    save(); refreshRail(); refreshSpec();
    if (what !== 'text-only') remountMonitor();
    if (S.step === 'deliver') refreshBrief();
  }

  function renderStage() {
    const st = $('#stage');
    $$('.pv', st).forEach(p => X.unmount(p));
    st.innerHTML = '';
    ({ format: stFormat, story: stStory, motion: stMotion, look: stLook, sound: stSound, refs: stRefs, deliver: stDeliver })[S.step](st);
  }

  function stFormat(st) {
    st.appendChild(el('h2', null, 'What are we making?'));
    st.appendChild(el('p', 'lead', 'Pick a format. It loads a full recipe: pace, motion, camera, cuts, type, colour and sound. Change anything after.'));
    const g = tileGrid('edit', D.edits, id => S.edit === id, (id) => {
      Object.assign(S, recipe(id));
      syncTiles(g, x => S.edit === x);
      renderFormatSettings(set);
      changed();
    }, 'big');
    st.appendChild(grp('Format', `${Object.keys(D.edits).length} recipes`, g));
    const set = el('div');
    st.appendChild(set);
    renderFormatSettings(set);
    st.appendChild(nextBtn('format'));
  }
  function renderFormatSettings(set) {
    $$('.pv', set).forEach(p => X.unmount(p));
    set.innerHTML = '';
    const rg = tileGrid('ratio', D.ratios, id => S.ratios.includes(id), (id, t, g) => {
      if (S.ratios.includes(id)) { if (S.ratios.length > 1) S.ratios.splice(S.ratios.indexOf(id), 1); }
      else S.ratios.push(id);
      if (!S.ratios.includes(S.view)) S.view = S.ratios[0];
      syncTiles(g, x => S.ratios.includes(x));
      changed(); renderRatioSwitch();
    });
    rg.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    $$('.info', rg).forEach(x => x.remove());
    set.appendChild(grp('Ratios', 'The first one is the master. The rest are recomposed, never cropped.', rg));
    const len = el('div', 'range');
    const r = el('input'); r.type = 'range'; r.min = 3; r.max = 180; r.step = 1; r.value = S.len;
    const out = el('output', null, S.len + ' s');
    r.addEventListener('input', () => { S.len = +r.value; out.textContent = S.len + ' s'; changed('text-only'); renderBoardTotal(); });
    len.appendChild(r); len.appendChild(out);
    const row = el('div', 'row'); row.style.gap = '28px';
    row.appendChild(field('Length', len));
    row.appendChild(field('Frame rate', seg([[24, '24'], [25, '25'], [30, '30'], [60, '60']], S.fps, v => { S.fps = v; changed('text-only'); })));
    row.appendChild(field('Engine', seg([['hyperframes', 'HyperFrames'], ['player', 'Interactive player'], ['remotion', 'Remotion']], S.engine, v => { S.engine = v; changed('text-only'); })));
    set.appendChild(grp('Timing', null, row));
  }

  function renderBoardTotal() {
    const t = $('#boardTotal'); if (!t) return;
    const sum = total();
    t.textContent = `${sum.toFixed(1)} s of ${S.len} s`;
    t.classList.toggle('off', Math.abs(sum - S.len) > .05);
    const fit = $('#fitBtn'); if (fit) fit.style.visibility = Math.abs(sum - S.len) > .05 ? 'visible' : 'hidden';
  }
  function stStory(st) {
    st.appendChild(el('h2', null, 'What is it about?'));
    st.appendChild(el('p', 'lead', 'One message, said once, shown many ways. The storyboard below is the source of truth Claude builds from.'));
    const f = el('div', 'fields');
    f.appendChild(field('Subject', input(S.subject, 'Relay, an AI agent app that clears busywork', v => { S.subject = v; changed('text-only'); })));
    f.appendChild(field('Audience', input(S.audience, 'Ops leads at 50 to 500 person companies', v => { S.audience = v; changed('text-only'); })));
    f.appendChild(field('One message', input(S.message, 'The single sentence the viewer should remember', v => { S.message = v; changed('text-only'); }), true));
    st.appendChild(grp('Story', null, f));
    st.appendChild(grp('Where it lives', null, chips([['Product Hunt', 'Product Hunt'], ['X', 'X'], ['LinkedIn', 'LinkedIn'], ['Instagram', 'Instagram'], ['TikTok', 'TikTok'], ['YouTube', 'YouTube'], ['Website hero', 'Website hero'], ['Paid social', 'Paid social'], ['Keynote', 'Keynote']], S.platform, () => changed('text-only'))));
    const v = el('div'); v.style.display = 'flex'; v.style.flexDirection = 'column'; v.style.gap = '12px';
    v.appendChild(seg([['none', 'No voice'], ['take', 'I have a take'], ['write', 'Write it, ask before recording']], S.voice, x => { S.voice = x; changed('text-only'); }));
    const w = input(S.words, 'Script or words on screen. Leave empty and Claude writes them from the storyboard.', x => { S.words = x; changed('text-only'); }, true);
    w.style.maxWidth = '760px';
    v.appendChild(w);
    st.appendChild(grp('Voice and words', 'The voice carries the words. Narration is never printed.', v));
    const board = el('div', 'board'); board.id = 'board';
    st.appendChild(grp('Storyboard', 'Never reordered, added or dropped by Claude', board));
    renderBoard(board);
    const foot = el('div', 'board-foot');
    const add = el('button', 'btn line', 'Add scene'); add.type = 'button';
    add.addEventListener('click', () => { S.scenes.push({ name: 'Scene ' + (S.scenes.length + 1), dur: 3, kind: 'type', line: '' }); renderBoard(board); changed(); });
    const fit = el('button', 'btn line', 'Fit to length'); fit.type = 'button'; fit.id = 'fitBtn';
    fit.addEventListener('click', () => { const k = S.len / total(); S.scenes.forEach(s => s.dur = Math.max(.5, Math.round(s.dur * k * 10) / 10)); const d = S.len - total(); S.scenes[S.scenes.length - 1].dur = Math.max(.5, Math.round((S.scenes[S.scenes.length - 1].dur + d) * 10) / 10); renderBoard(board); changed(); });
    const tt = el('span', 'total'); tt.id = 'boardTotal';
    foot.appendChild(add); foot.appendChild(fit); foot.appendChild(tt);
    st.appendChild(foot);
    renderBoardTotal();
    st.appendChild(nextBtn('story'));
  }
  const kindImg = { photo: 'street', portrait: 'bridge', doc: 'tokyo' };
  let boardT = 0;
  function renderBoard(board) {
    board.innerHTML = '';
    S.scenes.forEach((s, i) => {
      const r = el('div', 'scene');
      r.appendChild(el('span', 'k', String(i + 1).padStart(2, '0')));
      const nm = input(s.name, 'Name', v => { s.name = v; changed('text-only'); refreshTimeline(); }); r.appendChild(nm);
      const du = el('div', 'dur');
      const minus = el('button', null, '-'), plus = el('button', null, '+'), val = el('span', null, (+s.dur).toFixed(1) + ' s');
      minus.type = plus.type = 'button';
      const setD = d => { s.dur = Math.max(.5, Math.round((s.dur + d) * 10) / 10); val.textContent = s.dur.toFixed(1) + ' s'; renderBoardTotal(); changed(); };
      minus.addEventListener('click', () => setD(-.5)); plus.addEventListener('click', () => setD(.5));
      du.appendChild(minus); du.appendChild(val); du.appendChild(plus); r.appendChild(du);
      const ln = input(s.line, 'What is on screen', v => { s.line = v; clearTimeout(boardT); boardT = setTimeout(() => changed(), 350); }); ln.classList.add('line-in'); r.appendChild(ln);
      const k = el('select', 'in wide-only');
      Object.keys(D.kinds).forEach(id => { const o = el('option', null, D.kinds[id]); o.value = id; if (s.kind === id) o.selected = true; k.appendChild(o); });
      k.addEventListener('change', () => { s.kind = k.value; if (kindImg[s.kind] && !s.img) s.img = kindImg[s.kind]; changed(); });
      r.appendChild(k);
      const x = el('button', 'x', I.x); x.type = 'button'; x.title = 'Remove scene';
      x.addEventListener('click', () => { if (S.scenes.length < 2) return; S.scenes.splice(i, 1); renderBoard(board); changed(); });
      r.appendChild(x);
      board.appendChild(r);
    });
    renderBoardTotal();
  }

  function stMotion(st) {
    st.appendChild(el('h2', null, 'How does it move?'));
    st.appendChild(el('p', 'lead', 'Feel sets every ease and stagger. Camera moves the frame. Transitions are the seams between scenes: pick two or three and repeat them.'));
    const fg = tileGrid('feel', D.feels, id => S.feel === id, id => { S.feel = id; syncTiles(fg, x => S.feel === x); changed(); });
    st.appendChild(grp('Feel', 'The graph is the value curve, like the After Effects graph editor', fg));
    const cg = tileGrid('cam', D.cams, id => S.cam === id, id => { S.cam = id; syncTiles(cg, x => S.cam === x); changed(); });
    st.appendChild(grp('Camera', null, cg));
    const tg = tileGrid('trans', D.trans, id => S.trans.includes(id), id => {
      if (S.trans.includes(id)) { if (S.trans.length > 1) S.trans.splice(S.trans.indexOf(id), 1); }
      else { if (S.trans.length >= 3) S.trans.shift(); S.trans.push(id); }
      syncTiles(tg, x => S.trans.includes(x)); changed();
    });
    st.appendChild(grp('Transitions', 'Up to 3, in the order they repeat', tg));
    const xg = tileGrid('text', D.texts, id => S.text === id, id => { S.text = id; syncTiles(xg, x => S.text === x); changed(); });
    st.appendChild(grp('Text motion', null, xg));
    st.appendChild(nextBtn('motion'));
  }

  function stLook(st) {
    st.appendChild(el('h2', null, 'How does it look?'));
    st.appendChild(el('p', 'lead', 'One type family, one palette with one accent, and a texture stack with real blend modes. Every font here is free for commercial work.'));
    let pg;
    const fg = tileGrid('font', D.fonts, id => S.font === id, id => { S.font = id; syncTiles(fg, x => S.font === x); changed(); remountGrid(pg, 'pal'); });
    st.appendChild(grp('Type', 'Google Fonts, OFL', fg));
    pg = tileGrid('pal', D.pal, id => S.pal === id, id => { S.pal = id; syncTiles(pg, x => S.pal === x); changed(); remountGrid(fg, 'font'); });
    st.appendChild(grp('Colour', null, pg));
    const xg = tileGrid('tex', D.tex, id => S.tex.includes(id), id => {
      if (S.tex.includes(id)) S.tex.splice(S.tex.indexOf(id), 1); else S.tex.push(id);
      syncTiles(xg, x => S.tex.includes(x)); changed();
    });
    st.appendChild(grp('Texture and blending', 'Pick any', xg));
    st.appendChild(grp('World', null, seg([['2d', '2D'], ['25d', '2.5D, layered depth'], ['3d', '3D, three.js']], S.world, v => { S.world = v; changed('text-only'); })));
    st.appendChild(nextBtn('look'));
  }
  function remountGrid(g, cat) {
    if (!g) return;
    $$('.tile', g).forEach((t, i) => { const pv = $('.pv', t); mountPreview(pv, cat, t.dataset.id, { offset: i * .37 }); });
  }

  function stSound(st) {
    st.appendChild(el('h2', null, 'How does it sound?'));
    st.appendChild(el('p', 'lead', 'Music is a bed, not the lead. Every moment gets its own sound. Loudness is measured on the exported file.'));
    const sg = tileGrid('sound', D.sounds, id => S.sound === id, id => { S.sound = id; syncTiles(sg, x => S.sound === x); changed('text-only'); renderTempo(); });
    st.appendChild(grp('Sound', null, sg));
    const tempo = el('div'); st.appendChild(tempo);
    function renderTempo() {
      tempo.innerHTML = '';
      const r = el('div', 'range');
      const i = el('input'); i.type = 'range'; i.min = 60; i.max = 180; i.step = .5; i.value = S.bpm;
      const o = el('output', null, S.bpm + ' BPM');
      const fpb = el('span', 'mono dim');
      const upd = () => { o.textContent = S.bpm + ' BPM'; fpb.textContent = `${(S.fps * 60 / S.bpm).toFixed(2)} frames per beat at ${S.fps} fps`; };
      i.addEventListener('input', () => { S.bpm = +i.value; upd(); changed('text-only'); });
      r.appendChild(i); r.appendChild(o); upd();
      const box = el('div'); box.style.display = 'flex'; box.style.flexDirection = 'column'; box.style.gap = '10px';
      box.appendChild(r); box.appendChild(fpb);
      box.appendChild(el('p', 'dim', '112.5 BPM makes a sixteenth exactly 4 frames at 30 fps.'));
      tempo.appendChild(grp('Tempo', S.sound === 'beat' ? 'Every cut lands on this grid' : 'Used for SFX timing', box));
      const t = input(S.track, 'Track name or link. Yours or licensed, never ripped.', v => { S.track = v; changed('text-only'); });
      t.style.maxWidth = '560px';
      tempo.appendChild(grp('Track', null, t));
    }
    renderTempo();
    st.appendChild(nextBtn('sound'));
  }

  const BORROW = ['Moves', 'Pacing', 'Camera', 'Type', 'Colour', 'Sound', 'Transitions'];
  function stRefs(st) {
    st.appendChild(el('h2', null, 'What should it feel like?'));
    st.appendChild(el('p', 'lead', 'Paste references with a timestamp and say what to borrow. Claude takes the principle and the timing, never the look.'));
    const list = el('div', 'refs');
    function draw() {
      list.innerHTML = '';
      S.refs.forEach((r, i) => {
        const row = el('div', 'ref');
        row.appendChild(input(r.url, 'Link to a reel, film, site or post', v => { r.url = v; changed('text-only'); }));
        const at = input(r.at, '0:12', v => { r.at = v; changed('text-only'); }); at.classList.add('at-in', 'mono'); row.appendChild(at);
        row.appendChild(chips(BORROW.map(b => [b, b]), r.borrow, () => changed('text-only')));
        const x = el('button', 'x', I.x); x.type = 'button';
        x.addEventListener('click', () => { S.refs.splice(i, 1); if (!S.refs.length) S.refs.push({ url: '', at: '', borrow: ['Moves'] }); draw(); changed('text-only'); });
        row.appendChild(x);
        list.appendChild(row);
      });
    }
    draw();
    const g = grp('References', null, list);
    const foot = el('div', 'board-foot');
    const add = el('button', 'btn line', 'Add reference'); add.type = 'button';
    add.addEventListener('click', () => { S.refs.push({ url: '', at: '', borrow: ['Moves'] }); draw(); });
    foot.appendChild(add);
    const none = el('button', 'chip' + (S.noRefs ? ' on' : ''), 'No references, use the recipe'); none.type = 'button';
    none.addEventListener('click', () => { S.noRefs = !S.noRefs; none.classList.toggle('on', S.noRefs); changed('text-only'); });
    foot.appendChild(none);
    g.appendChild(foot);
    st.appendChild(g);
    const recipeRefs = D.edits[S.edit].refs || [];
    if (recipeRefs.length) {
      const rl = el('div', 'reflist'); rl.style.maxWidth = '760px';
      recipeRefs.forEach(([n, u, w]) => { const a = el('a', null, `<span>${esc(n)}<small>${esc(w)}</small></span>${I.ext}`); a.href = u; a.target = '_blank'; a.rel = 'noopener'; rl.appendChild(a); });
      st.appendChild(grp(`The ${D.edits[S.edit].name.toLowerCase()} recipe already studies`, null, rl));
    }
    const as = el('div', 'assets');
    [['logo', 'Logo', 'SVG, real file only'], ['brand', 'Brand colours and fonts', 'or use the Look you picked'], ['ui', 'Product UI', 'Figma link or screens, rebuilt as vectors'], ['footage', 'Footage', 'clips you shot'], ['photos', 'Photos', 'yours or licensed'], ['voiceTake', 'Voice take', 'an existing recording'], ['music', 'Music track', 'yours or licensed']].forEach(([k, n, sub]) => {
      const r = el('div', 'asset', `<div><b>${esc(n)}</b><small>${esc(sub)}</small></div>`);
      r.appendChild(seg([['attach', 'I will attach'], ['make', 'Make it'], ['none', 'Not needed']], S.assets[k], v => { S.assets[k] = v; changed('text-only'); }));
      as.appendChild(r);
    });
    st.appendChild(grp('Assets', 'Paid generation always asks first', as));
    st.appendChild(nextBtn('refs'));
  }

  const OUTS = [['master', 'MP4 master'], ['cutdowns', 'Cutdowns per ratio'], ['player', 'Interactive player (HTML)'], ['gif', 'GIF loop'], ['alpha', 'Transparent MOV'], ['cover', 'Cover still'], ['srt', 'SRT captions']];
  function stDeliver(st) {
    st.appendChild(el('h2', null, 'What do we ship?'));
    st.appendChild(el('p', 'lead', 'Every build ends in one live link, byte checked, with the version stamped on screen.'));
    st.appendChild(grp('Outputs', null, chips(OUTS, S.outputs, () => changed('text-only'))));
    const row = el('div', 'row'); row.style.gap = '28px'; row.style.alignItems = 'flex-start';
    row.appendChild(field('Approval', seg([['stills', 'Stills first'], ['render', 'Straight to render']], S.approval, v => { S.approval = v; changed('text-only'); })));
    row.appendChild(field('Captions', seg([['none', 'None'], ['srt', 'SRT file'], ['burn', 'Burned in, talking heads only']], S.captions, v => { S.captions = v; changed('text-only'); })));
    const dl = input(S.deadline, 'Friday 5 pm', v => { S.deadline = v; changed('text-only'); }); dl.style.width = '200px';
    row.appendChild(field('Deadline', dl));
    st.appendChild(grp('Rules of delivery', null, row));
    const box = el('div', 'brief-box');
    const ta = el('textarea'); ta.id = 'briefText'; ta.spellcheck = false;
    ta.value = S.briefEdit != null ? S.briefEdit : brief();
    ta.addEventListener('input', () => { S.briefEdit = ta.value; save(); resetB.style.visibility = 'visible'; });
    box.appendChild(ta);
    const acts = el('div', 'brief-acts');
    const cp = el('button', 'btn solid', I.copy + 'Copy brief'); cp.type = 'button'; cp.addEventListener('click', () => copy(currentBrief(), 'Brief copied. Paste it into Claude Code.'));
    const dn = el('button', 'btn line', I.down + 'Download .md'); dn.type = 'button'; dn.addEventListener('click', downloadBrief);
    const resetB = el('button', 'btn line', 'Reset to my picks'); resetB.type = 'button'; resetB.style.visibility = S.briefEdit != null ? 'visible' : 'hidden';
    resetB.addEventListener('click', () => { S.briefEdit = null; ta.value = brief(); save(); resetB.style.visibility = 'hidden'; });
    acts.appendChild(cp); acts.appendChild(dn); acts.appendChild(resetB);
    box.appendChild(acts);
    st.appendChild(grp('Your brief', 'Edit it here if you like. Claude follows it line by line.', box));
  }
  function refreshBrief() { const ta = $('#briefText'); if (ta && S.briefEdit == null) ta.value = brief(); }
  const currentBrief = () => (S.briefEdit != null ? S.briefEdit : brief());
  function slug() { return (S.subject || D.edits[S.edit].name).toLowerCase().split(',')[0].replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'film'; }
  function downloadBrief() {
    try {
      const b = new Blob([currentBrief()], { type: 'text/markdown' });
      const a = el('a'); a.href = URL.createObjectURL(b); a.download = `edits-brief-${slug()}.md`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { toast('Download blocked here. Use Copy brief.'); }
  }

  /* ---------- the brief ---------- */
  const fmt = n => (Math.round(n * 10) / 10).toString();
  const nums = arr => arr.map(([k, v]) => `${k} ${v}`).join('; ');
  function brief() {
    const r = D.edits[S.edit], fps = S.fps;
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const [mw, mh] = RES[S.ratios[0]];
    const L = [];
    L.push('Run this through the Edits pipeline. Load the edits skill and follow every stage and gate in order.');
    L.push('');
    L.push('EDITS BRIEF');
    L.push(`Edits ${D.build}, ${date}`);
    L.push('');
    L.push('FORMAT');
    L.push(`Edit: ${r.name}. ${r.line}.`);
    L.push(`Master: ${S.ratios[0]}, ${mw} x ${mh}, ${fps} fps, ${S.len} s (${Math.round(S.len * fps)} frames)`);
    if (S.ratios.length > 1) L.push(`Cutdowns: ${S.ratios.slice(1).map(x => `${x} (${D.ratios[x].px})`).join(', ')}. Recompose each from the timeline, never crop.`);
    L.push(`Engine: ${S.engine === 'remotion' ? 'Remotion (personal work only, company licence needed above 3 people)' : S.engine === 'player' ? 'Interactive HTML player (play, scrub, captions toggle), built on a seek(t) timeline' : 'HyperFrames, HTML and GSAP, seek safe'}${S.world === '3d' ? '. three.js for the 3D shots.' : '.'}`);
    L.push(`Pace: ${r.pace}.`);
    L.push('');
    L.push('STORY');
    L.push(`Subject: ${S.subject || '(not given: ask me)'}`);
    L.push(`Audience: ${S.audience || '(not given: ask me)'}`);
    L.push(`One message: ${S.message || '(not given: ask me before anything else)'}`);
    if (S.platform.length) L.push(`Where it lives: ${S.platform.join(', ')}`);
    L.push(`Voice: ${S.voice === 'none' ? 'None. Music and sound carry it.' : S.voice === 'take' ? 'I have a take and will attach it. Cut to the take; never time stretch it.' : 'Write the script in the native US manager voice, then ask me before any recording (name the tool, voice and credit cost).'}`);
    L.push(`Words: ${S.words.trim() ? S.words.trim().replace(/\n+/g, ' / ') : 'Write them from the storyboard, 3 to 7 words a beat. Never print narration.'}`);
    L.push('');
    L.push('STORYBOARD (source of truth: never reorder, add or drop a scene without asking)');
    let t = 0;
    S.scenes.forEach((s, i) => {
      const a = t, b = t + (+s.dur);
      L.push(`${i + 1}. ${s.name}, ${fmt(a)} to ${fmt(b)} s, frames ${Math.round(a * fps)} to ${Math.round(b * fps)}, ${D.kinds[s.kind] || s.kind}${s.line ? `: "${s.line}"` : ''}`);
      t = b;
    });
    if (Math.abs(t - S.len) > .05) L.push(`(Scenes add up to ${fmt(t)} s against ${S.len} s. Fit them to the length before building.)`);
    L.push('');
    L.push('MOTION');
    L.push(`Feel: ${D.feels[S.feel].name}. ${nums(D.feels[S.feel].nums)}.`);
    L.push(`Camera: ${D.cams[S.cam].name}. ${nums(D.cams[S.cam].nums)}.`);
    L.push(`Transitions, only these, repeated in this order: ${S.trans.map(x => `${D.trans[x].name} (${nums(D.trans[x].nums)})`).join('; ')}.`);
    L.push(`Text motion: ${D.texts[S.text].name}. ${nums(D.texts[S.text].nums)}.`);
    L.push('');
    L.push('LOOK');
    const f = D.fonts[S.font], p = D.pal[S.pal];
    L.push(`Type: ${f.name} (${f.by}, ${f.lic}). ${f.line}. Three sizes only. Tracking -0.035 em at 30 px and up. Load before frame 0.`);
    L.push(`Colour: ${p.name}. Ground ${p.bg}, ink ${p.fg}, accent ${p.accent} (the only accent), surface ${p.surface}, muted ${p.muted}.`);
    L.push(`Texture and blending: ${S.tex.length ? S.tex.map(x => `${D.tex[x].name} (${nums(D.tex[x].nums)})`).join('; ') : 'none'}.`);
    L.push(`World: ${S.world === '3d' ? '3D, studio light, real materials with wear, contact shadows' : S.world === '25d' ? '2.5D, three to five layers of parallax' : '2D'}.`);
    L.push('');
    L.push('SOUND');
    L.push(`Mode: ${D.sounds[S.sound].name}. ${nums(D.sounds[S.sound].nums)}.`);
    if (S.sound !== 'silent') L.push(`Tempo: ${S.bpm} BPM, ${(fps * 60 / S.bpm).toFixed(2)} frames per beat at ${fps} fps.`);
    L.push(`Track: ${S.track.trim() || (S.sound === 'silent' ? 'none.' : 'ask me for the track; never rip or synthesise one.')}`);
    L.push('');
    L.push('REFERENCES (borrow the principle and the timing, never the look)');
    const refs = S.refs.filter(x => x.url.trim());
    if (refs.length) refs.forEach((x, i) => L.push(`${i + 1}. ${x.url.trim()}${x.at ? ` at ${x.at}` : ''}, borrow: ${(x.borrow.length ? x.borrow : ['Moves']).join(', ').toLowerCase()}`));
    else L.push(`None given. Study the recipe's references: ${(r.refs || []).map(x => `${x[0]} (${x[1]})`).join('; ')}.`);
    L.push('');
    L.push('ASSETS');
    const AN = { logo: 'Logo SVG', brand: 'Brand colours and fonts', ui: 'Product UI', footage: 'Footage', photos: 'Photos', voiceTake: 'Voice take', music: 'Music track' };
    const AV = { attach: 'I will attach', make: 'make it (ask before any paid generation)', none: 'not needed' };
    Object.keys(AN).forEach(k => L.push(`${AN[k]}: ${AV[S.assets[k]]}`));
    L.push('');
    L.push('DELIVER');
    L.push(`Outputs: ${S.outputs.map(o => OUTS.find(x => x[0] === o)[1]).join(', ') || 'MP4 master'}.`);
    L.push(`Captions: ${S.captions === 'none' ? 'none' : S.captions === 'srt' ? 'SRT file, not burned in' : 'burned in (talking head footage only), one caption system, one accent'}.`);
    L.push(`Approval: ${S.approval === 'stills' ? 'stop after the storyboard and 3 to 4 stills at the hero moments, send one live link, wait for my yes' : 'go straight to render, then send one live link'}.`);
    if (S.deadline) L.push(`Deadline: ${S.deadline}`);
    L.push(`Folder: ~/claudecode/edits-films/${slug()}/v1. Keep every version, stamp the build on screen, end with one live https link, byte checked.`);
    L.push(`Skills to lean on: ${(r.skills || []).join(', ')}.`);
    L.push('');
    L.push('HOUSE RULES (always)');
    L.push('No centre or radial glow, no inner glow. No opacity fade entrances or crossfades: things rise, slide, scale from origin or mask wipe. No eyebrow tags or filler micro text. No em or en dashes anywhere. Voice carries the words. Real UI, real logos, real data with sources. Nothing spills its frame. Max 3 flashes a second. Ask before any paid generation with tool, model and credit cost.');
    return L.join('\n');
  }

  /* ---------- monitor ---------- */
  let mon = null, playing = true, safeOn = false;
  function compOpts() {
    const p = D.pal[S.pal];
    return { ratio: S.view, scenes: S.scenes.map(s => Object.assign({}, s, { line: s.line || (s.kind === 'type' ? s.name : s.line) })), feel: S.feel, cam: S.cam, trans: S.trans, text: S.text, pal: p, fonts: fontOf(S.font), tex: S.tex };
  }
  let monT = 0;
  function remountMonitor() {
    clearTimeout(monT);
    monT = setTimeout(() => {
      const v = $('#viewer');
      const t = mon ? mon.t : 0;
      const host = $('#viewerHost');
      mon = X.mount(host, compOpts(), { offset: t, manual: !playing });
      if (!playing) mon.seek(t);
      refreshTimeline(); placeSafe();
      void v;
    }, 60);
  }
  function refreshTimeline() {
    const tl = $('#tl');
    const sum = total() || 1;
    const blks = $$('.blk', tl);
    if (blks.length !== S.scenes.length) {
      blks.forEach(b => b.remove());
      S.scenes.forEach(() => { const b = el('div', 'blk', '<b></b><span></span>'); tl.insertBefore(b, $('.phd', tl)); });
    }
    $$('.blk', tl).forEach((b, i) => {
      const s = S.scenes[i];
      b.style.flex = `${s.dur} 0 0`;
      const nb = $('b', b), ns = $('span', b);
      if (nb.textContent !== s.name) nb.textContent = s.name;
      const d = (+s.dur).toFixed(1) + ' s'; if (ns.textContent !== d) ns.textContent = d;
    });
    void sum;
  }
  function renderRatioSwitch() {
    const r = $('#ratioSwitch'); r.innerHTML = '';
    S.ratios.forEach(x => {
      const b = el('button', S.view === x ? 'on' : '', x); b.type = 'button';
      b.addEventListener('click', () => { S.view = x; save(); renderRatioSwitch(); remountMonitor(); });
      r.appendChild(b);
    });
  }
  function placeSafe() {
    const sf = $('#safe'); sf.classList.toggle('on', safeOn);
    if (!mon) return;
    const host = $('#viewerHost').getBoundingClientRect();
    const s = mon.s, W = mon.W, H = mon.H;
    sf.style.left = (host.width - W * s) / 2 + 'px'; sf.style.top = (host.height - H * s) / 2 + 'px';
    sf.style.width = W * s + 'px'; sf.style.height = H * s + 'px';
    sf.innerHTML = '';
    const box = (x, y, w, h, cls) => { const i = el('i', cls); Object.assign(i.style, { left: x * s + 'px', top: y * s + 'px', width: w * s + 'px', height: h * s + 'px' }); sf.appendChild(i); };
    box(W * .1, H * .1, W * .8, H * .8);
    if (S.view === '9:16') { box(0, 0, W, 360, 'ui'); box(0, 1420, W, 500, 'ui'); box(W - 120, 360, 120, 1060, 'ui'); }
  }
  const tcFmt = (t, fps) => { const s = Math.floor(t), f = Math.floor((t - s) * fps); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
  function monitorLoop() {
    if (mon) {
      const tl = $('#tl'), ph = $('.phd', tl);
      const p = mon.total ? mon.t / mon.total : 0;
      ph.style.left = `calc(${(p * 100).toFixed(3)}% - 1px)`;
      const tc = window.innerWidth <= 900 ? tcFmt(mon.t, S.fps) : `${tcFmt(mon.t, S.fps)} / ${tcFmt(mon.total || 0, S.fps)}`;
      const tce = $('#tc'); if (tce.textContent !== tc) tce.textContent = tc;
      const i = mon.sceneAt ? mon.sceneAt(mon.t) : 0;
      $$('.blk', tl).forEach((b, k) => b.classList.toggle('on', k === i));
    }
    requestAnimationFrame(monitorLoop);
  }
  function setPlaying(v) {
    playing = v;
    const b = $('#playBtn'); b.innerHTML = playing ? I.pause : I.play; b.title = playing ? 'Pause' : 'Play';
    if (!mon) return;
    if (playing) { mon.manual = false; mon.t0 = performance.now() - mon.t * 1000; }
    else mon.manual = true;
  }
  function initMonitor() {
    $('#playBtn').innerHTML = I.pause; $('#safeBtn').innerHTML = I.safe;
    $('#playBtn').addEventListener('click', () => setPlaying(!playing));
    $('#safeBtn').addEventListener('click', () => { safeOn = !safeOn; $('#safeBtn').classList.toggle('on', safeOn); placeSafe(); });
    const tl = $('#tl');
    let drag = false;
    const scrub = e => {
      if (!mon) return;
      const r = tl.getBoundingClientRect();
      const p = Math.min(.9999, Math.max(0, (e.clientX - r.left) / r.width));
      mon.seek(p * mon.total);
      if (playing) mon.t0 = performance.now() - mon.t * 1000;
    };
    tl.addEventListener('pointerdown', e => { drag = true; tl.setPointerCapture(e.pointerId); if (playing) setPlaying(false); scrub(e); });
    tl.addEventListener('pointermove', e => { if (drag) scrub(e); });
    tl.addEventListener('pointerup', () => { drag = false; });
    window.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space' && $('#compose').classList.contains('on')) { e.preventDefault(); setPlaying(!playing); }
    });
    new ResizeObserver(() => { if (mon) { mon.fit(); placeSafe(); } }).observe($('#viewerHost'));
    renderRatioSwitch();
    remountMonitor();
    requestAnimationFrame(monitorLoop);
  }
  function refreshSpec() {
    const r = D.edits[S.edit], p = D.pal[S.pal];
    const rows = [
      ['Format', r.name],
      ['Master', `${S.ratios[0]}, ${S.fps} fps, ${S.len} s`],
      ['Feel', D.feels[S.feel].name],
      ['Camera', D.cams[S.cam].name],
      ['Cuts', S.trans.map(x => D.trans[x].name).join(', ')],
      ['Text', D.texts[S.text].name],
      ['Type', D.fonts[S.font].name],
      ['Colour', `<span style="display:inline-flex;gap:3px;vertical-align:-2px;margin-right:6px">${[p.bg, p.fg, p.accent].map(c => `<i style="width:11px;height:11px;border-radius:3px;background:${c};box-shadow:inset 0 0 0 1px #ffffff22;display:block"></i>`).join('')}</span>${esc(p.name)}`],
      ['Texture', S.tex.length ? S.tex.map(x => D.tex[x].name).join(', ') : 'None'],
      ['Sound', D.sounds[S.sound].name]
    ];
    $('#spec').innerHTML = `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${k === 'Colour' ? v : esc(v)}</dd>`).join('')}</dl>`;
  }

  /* ---------- sheet ---------- */
  const CAT = { edit: ['edits', 'Format'], feel: ['feels', 'Feel'], cam: ['cams', 'Camera'], trans: ['trans', 'Transition'], text: ['texts', 'Text motion'], font: ['fonts', 'Type'], pal: ['pal', 'Colour'], tex: ['tex', 'Texture'], sound: ['sounds', 'Sound'], ratio: ['ratios', 'Ratio'] };
  function isPicked(cat, id) {
    return { edit: S.edit === id, feel: S.feel === id, cam: S.cam === id, trans: S.trans.includes(id), text: S.text === id, font: S.font === id, pal: S.pal === id, tex: S.tex.includes(id), sound: S.sound === id, ratio: S.ratios.includes(id) }[cat];
  }
  function pick(cat, id) {
    switch (cat) {
      case 'edit': Object.assign(S, recipe(id)); break;
      case 'feel': S.feel = id; break; case 'cam': S.cam = id; break; case 'text': S.text = id; break;
      case 'font': S.font = id; break; case 'pal': S.pal = id; break; case 'sound': S.sound = id; break;
      case 'trans': if (S.trans.includes(id)) { if (S.trans.length > 1) S.trans.splice(S.trans.indexOf(id), 1); } else { if (S.trans.length >= 3) S.trans.shift(); S.trans.push(id); } break;
      case 'tex': if (S.tex.includes(id)) S.tex.splice(S.tex.indexOf(id), 1); else S.tex.push(id); break;
      case 'ratio': if (S.ratios.includes(id)) { if (S.ratios.length > 1) S.ratios.splice(S.ratios.indexOf(id), 1); } else S.ratios.push(id); if (!S.ratios.includes(S.view)) S.view = S.ratios[0]; renderRatioSwitch(); break;
    }
    changed();
    $$(`.tile[data-cat="${cat}"]`).forEach(t => t.classList.toggle('on', isPicked(cat, t.dataset.id)));
    if (cat === 'edit' && S.step === 'format' && $('#compose').classList.contains('on')) renderStage();
  }
  function openSheet(cat, id) {
    const [key, label] = CAT[cat];
    const item = D[key][id];
    const sh = $('#sheet');
    const pv = $('.pv', sh); X.unmount(pv);
    const body = $('.sheet-body', sh);
    let h = `<h3>${esc(item.name)}</h3><p>${esc(item.line || '')}${item.use ? '. ' + esc(item.use) + '.' : ''}</p>`;
    if (item.when) h += `<p>${esc(item.when)}</p>`;
    if (cat === 'edit') {
      h += `<h4>Recipe</h4><div class="nums">${[['Length', `${item.len} s at ${item.fps} fps`], ['Ratios', item.ratios.join(', ')], ['Pace', item.pace], ['Feel', D.feels[item.feel].name], ['Camera', D.cams[item.cam].name], ['Cuts', item.trans.map(x => D.trans[x].name).join(', ')], ['Type', D.fonts[item.font].name], ['Colour', D.pal[item.pal].name], ['Sound', D.sounds[item.sound].name]].map(([k, v]) => `<div><span>${k}</span><span>${esc(v)}</span></div>`).join('')}</div>`;
      h += `<h4>Storyboard</h4><div class="nums">${item.scenes.map((s, i) => `<div><span>${i + 1}. ${esc(s.name)}, ${s.dur} s</span><span>${esc(D.kinds[s.kind])}${s.line ? ': ' + esc(s.line) : ''}</span></div>`).join('')}</div>`;
      if (item.refs) h += `<h4>Study</h4><div class="reflist">${item.refs.map(([n, u, w]) => `<a href="${esc(u)}" target="_blank" rel="noopener"><span>${esc(n)}<small>${esc(w)}</small></span>${I.ext}</a>`).join('')}</div>`;
      if (item.skills) h += `<h4>Skills Claude loads</h4><div class="nums"><div><span>Local skills</span><span class="mono" style="font-size:12px">${esc(item.skills.join(', '))}</span></div></div>`;
    } else {
      if (item.nums) h += `<h4>The numbers</h4><div class="nums">${item.nums.map(([k, v]) => `<div><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('')}</div>`;
      if (cat === 'pal') h += `<h4>Hex</h4><div class="nums">${['bg', 'fg', 'accent', 'surface', 'muted'].map(k => `<div><span>${{ bg: 'Ground', fg: 'Ink', accent: 'Accent', surface: 'Surface', muted: 'Muted' }[k]}</span><span class="mono"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${item[k]};margin-right:8px;box-shadow:inset 0 0 0 1px #ffffff22"></i>${item[k]}</span></div>`).join('')}</div>`;
      if (cat === 'font') h += `<h4>Source</h4><div class="nums"><div><span>Foundry</span><span>${esc(item.by)}</span></div><div><span>Licence</span><span>${esc(item.lic)}</span></div><div><span>Best for</span><span>${esc(item.use)}</span></div></div>`;
      if (item.code) h += `<h4>In code</h4><div class="code">${esc(item.code)}</div>`;
    }
    body.innerHTML = h;
    const use = el('button', 'btn ' + (isPicked(cat, id) ? 'line' : 'solid'), isPicked(cat, id) ? 'In your brief' : 'Use this');
    use.type = 'button'; use.style.marginTop = '18px';
    use.addEventListener('click', () => { pick(cat, id); const on = isPicked(cat, id); use.className = 'btn ' + (on ? 'line' : 'solid'); use.textContent = on ? 'In your brief' : 'Use this'; });
    body.appendChild(use);
    sh.classList.add('on');
    sh.dataset.cat = cat;
    pv.style.aspectRatio = cat === 'edit' ? (() => { const [w, hh] = RES[item.ratios[0]]; return w / hh >= 1 ? '16 / 9' : '4 / 5'; })() : '16 / 9';
    requestAnimationFrame(() => requestAnimationFrame(() => mountPreview(pv, cat, id)));
    body.scrollTop = 0;
  }
  function closeSheet() { const sh = $('#sheet'); sh.classList.remove('on'); setTimeout(() => { if (!sh.classList.contains('on')) X.unmount($('.pv', sh)); }, 420); }

  /* ---------- library ---------- */
  const LIB = [['edit', 'edits', 'Formats'], ['feel', 'feels', 'Motion feel'], ['cam', 'cams', 'Camera'], ['trans', 'trans', 'Transitions'], ['text', 'texts', 'Text motion'], ['font', 'fonts', 'Type'], ['pal', 'pal', 'Colour'], ['tex', 'tex', 'Texture and blending'], ['sound', 'sounds', 'Sound']];
  let libBuilt = false;
  function buildLibrary() {
    if (libBuilt) return; libBuilt = true;
    const rail = $('#libRail'), body = $('#libBody');
    body.appendChild(el('h2', null, 'Library'));
    body.appendChild(el('p', 'lead', 'Every option in the composer, with its numbers, how it is built and who does it best. Open any tile for the detail.'));
    LIB.forEach(([cat, key, name], k) => {
      const map = D[key];
      const b = el('button', 'cat' + (k === 0 ? ' on' : ''), `${esc(name)}<span>${Object.keys(map).length}</span>`); b.type = 'button';
      b.addEventListener('click', () => { const s = $('#lib-' + cat); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      rail.appendChild(b);
      const sec = el('section', 'lib-sec'); sec.id = 'lib-' + cat;
      sec.appendChild(el('div', 'grp-h', `<h3>${esc(name)}</h3>`));
      const g = el('div', 'tiles' + (cat === 'edit' ? ' big' : ''));
      Object.keys(map).forEach((id, i) => { const t = tile(cat, id, map[id], { noInfo: true, offset: i * .37 }); if (isPicked(cat, id)) t.classList.add('on'); t.addEventListener('click', () => openSheet(cat, id)); g.appendChild(t); });
      sec.appendChild(g);
      body.appendChild(sec);
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const id = e.target.id.slice(4); $$('#libRail .cat').forEach((c, k) => c.classList.toggle('on', LIB[k][0] === id)); } }), { root: body, rootMargin: '0px 0px -70% 0px' });
    $$('.lib-sec', body).forEach(s => io.observe(s));
  }

  /* ---------- notes ---------- */
  let notesBuilt = false;
  function noteMessage() {
    const picked = [];
    D.notes.forEach((g, gi) => g.items.forEach((n, ni) => { const k = gi + '.' + ni; if (S.notesPicked[k]) picked.push([S.notesPicked[k].at, n]); }));
    const L = ['Notes on the latest render. Fix only these and keep everything else exactly as it is: same scale, same positions, same timing.', ''];
    picked.forEach(([at, n], i) => L.push(`${i + 1}. ${at ? at + ': ' : ''}${n}`));
    if (S.noteText.trim()) L.push(`${picked.length + 1}. ${S.noteText.trim()}`);
    if (!picked.length && !S.noteText.trim()) L.push('(pick notes on the left)');
    L.push('', 'Then duplicate to the next version, render stills at each changed moment, check them at 2x, and send the new live link.');
    return L.join('\n');
  }
  function buildNotes() {
    if (notesBuilt) { $('#noteOut').value = noteMessage(); return; } notesBuilt = true;
    const wrap = $('#notesWrap');
    const left = el('div');
    left.appendChild(el('h2', null, 'Notes'));
    left.appendChild(el('p', 'lead', 'After a render, pick what is off. Add a timecode if it happens at one moment. Claude fixes only what you name.'));
    D.notes.forEach((g, gi) => {
      const s = el('div', 'note-grp'); s.appendChild(el('h3', null, esc(g.g)));
      g.items.forEach((n, ni) => {
        const k = gi + '.' + ni;
        const r = el('div', 'note' + (S.notesPicked[k] ? ' on' : ''));
        r.appendChild(el('span', 'cb', I.check));
        r.appendChild(el('span', null, esc(n)));
        const at = el('input', 'in at'); at.placeholder = '0:12'; at.value = (S.notesPicked[k] && S.notesPicked[k].at) || '';
        at.addEventListener('click', e => e.stopPropagation());
        at.addEventListener('input', () => { S.notesPicked[k] = { at: at.value }; r.classList.add('on'); save(); $('#noteOut').value = noteMessage(); });
        r.appendChild(at);
        r.addEventListener('click', () => { if (S.notesPicked[k]) delete S.notesPicked[k]; else S.notesPicked[k] = { at: at.value }; r.classList.toggle('on', !!S.notesPicked[k]); save(); $('#noteOut').value = noteMessage(); });
        s.appendChild(r);
      });
      left.appendChild(s);
    });
    const own = el('div', 'note-grp'); own.appendChild(el('h3', null, 'Your note'));
    const t = input(S.noteText, 'Anything else, in one line', v => { S.noteText = v; save(); $('#noteOut').value = noteMessage(); }, true);
    own.appendChild(t); left.appendChild(own);
    wrap.appendChild(left);
    const right = el('div', 'note-out');
    const ta = el('textarea'); ta.id = 'noteOut'; ta.readOnly = true; ta.value = noteMessage();
    right.appendChild(ta);
    const a = el('div', 'brief-acts');
    const c = el('button', 'btn solid', I.copy + 'Copy notes'); c.type = 'button'; c.addEventListener('click', () => copy(noteMessage(), 'Notes copied'));
    const clr = el('button', 'btn line', 'Clear'); clr.type = 'button'; clr.addEventListener('click', () => { S.notesPicked = {}; S.noteText = ''; save(); $$('#notesWrap .note').forEach(n => n.classList.remove('on')); $$('#notesWrap .note .at').forEach(i => i.value = ''); t.value = ''; ta.value = noteMessage(); });
    a.appendChild(c); a.appendChild(clr); right.appendChild(a);
    wrap.appendChild(right);
  }

  /* ---------- pipeline and rules ---------- */
  let pipeBuilt = false, rulesBuilt = false;
  function buildPipeline() {
    if (pipeBuilt) return; pipeBuilt = true;
    const w = $('#pipeWrap');
    w.appendChild(el('h2', null, 'The crew'));
    w.appendChild(el('p', 'lead', 'Every brief runs through these roles in order. Claude plays each one with its own skills and checks. Two gates come back to you.'));
    const dg = el('div', 'diagram');
    const P = D.pipeline, n = P.length, W = 1100, nw = 76, gap = (W - 20 - n * nw) / (n - 1);
    let s = `<svg viewBox="0 0 ${W} 112" xmlns="http://www.w3.org/2000/svg" font-family="Geist, sans-serif">`;
    P.forEach((p, i) => {
      const x = 10 + i * (nw + gap), y = 30;
      if (i < n - 1) s += `<line x1="${x + nw}" y1="${y + 26}" x2="${x + nw + gap}" y2="${y + 26}" stroke="#34343a" stroke-width="1.5"/>`;
      s += `<rect x="${x}" y="${y}" width="${nw}" height="52" rx="10" fill="${p.gate ? '#0b0b0c' : '#18181b'}" stroke="${p.gate ? '#ecebe6' : '#2a2a2f'}" stroke-width="${p.gate ? 1.5 : 1}"/>`;
      s += `<text x="${x + nw / 2}" y="${y + 22}" text-anchor="middle" font-size="11" fill="${p.gate ? '#ecebe6' : '#66666c'}" font-family="Geist Mono, monospace">${p.n}</text>`;
      s += `<text x="${x + nw / 2}" y="${y + 39}" text-anchor="middle" font-size="12" fill="#ecebe6" font-weight="500">${p.stage}</text>`;
      s += `<text x="${x + nw / 2}" y="${y - 10}" text-anchor="middle" font-size="11" fill="#9d9ca1">${p.role}</text>`;
    });
    s += '</svg>';
    dg.innerHTML = s;
    w.appendChild(dg);
    const fl = el('div', 'flow');
    P.forEach(p => {
      const c = el('div', 'stg' + (p.gate ? ' gate' : ''));
      c.innerHTML = `<span class="num">${p.n}</span><h3>${esc(p.stage)}</h3><span class="role">${esc(p.role)}</span><p>${esc(p.does)}</p><span class="io">${esc(p.out)}</span>${p.skills.length ? `<div class="sk">${p.skills.map(k => `<span>${esc(k)}</span>`).join('')}</div>` : ''}`;
      fl.appendChild(c);
    });
    w.appendChild(fl);
  }
  function buildRules() {
    if (rulesBuilt) return; rulesBuilt = true;
    const w = $('#rulesWrap');
    w.appendChild(el('h2', null, 'The rules'));
    w.appendChild(el('p', 'lead', 'Ten laws every film follows, the looks that are banned, and the numbers behind them. Measured from real work, not guessed.'));
    D.laws.forEach(([t, p], i) => w.appendChild(el('div', 'law', `<span class="num">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`)));
    const cols = el('div', 'cols sec');
    cols.innerHTML = `<div class="box ban"><h3>Never</h3><ul>${D.bans.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div><div class="box"><h3>Words on screen</h3><ul><li>3 to 7 words a beat, readable in under 1.5 s</li><li>No em or en dashes. Ranges say to.</li><li>Banned: leverage, robust, seamless, elevate, unlock, empower, harness, delve, transform, revolutionize, cutting edge</li><li>A clear title needs no subtitle</li><li>Concrete beats abstract: $0 forever, not affordable</li><li>Read it aloud. If it sounds automated, rewrite it.</li></ul></div>`;
    w.appendChild(cols);
    const sec = el('div', 'sec');
    sec.appendChild(el('div', 'grp-h', '<h3>The numbers</h3><span>Source on the right</span>'));
    const tb = el('table', 'tbl');
    tb.innerHTML = D.numbers.map(([k, v, s]) => `<tr><td>${esc(k)}</td><td class="v">${esc(v)}</td><td>${esc(s)}</td></tr>`).join('');
    sec.appendChild(tb);
    w.appendChild(sec);
  }

  /* ---------- views ---------- */
  function view(v) {
    $$('.nav button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    $$('.view').forEach(s => s.classList.toggle('on', s.id === v));
    if (v === 'library') buildLibrary();
    if (v === 'notes') buildNotes();
    if (v === 'pipeline') buildPipeline();
    if (v === 'rules') buildRules();
    if (v === 'compose' && mon) { mon.fit(); placeSafe(); }
    if (v === 'library') $$('#libBody .tile').forEach(t => { const id = t.dataset.id, cat = t.dataset.cat; t.classList.toggle('on', isPicked(cat, id)); });
    closeSheet();
    try { sessionStorage.setItem('edits-view', v); } catch (e) { }
  }

  /* ---------- boot ---------- */
  function boot() {
    $$('.nav button').forEach(b => b.addEventListener('click', () => view(b.dataset.view)));
    $('#copyBrief').addEventListener('click', () => copy(currentBrief(), 'Brief copied. Paste it into Claude Code.'));
    $('#getSkill').addEventListener('click', () => $('#skillModal').classList.add('on'));
    $('#skillModal').addEventListener('click', e => { if (e.target.id === 'skillModal' || e.target.closest('[data-close]')) $('#skillModal').classList.remove('on'); });
    $('#copyInstall').addEventListener('click', () => copy($('#installCmd').textContent, 'Command copied'));
    $('#sheetX').addEventListener('click', closeSheet);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); $('#skillModal').classList.remove('on'); } });
    renderRail(); renderStage(); refreshSpec(); initMonitor();
    let v = 'compose'; try { v = sessionStorage.getItem('edits-view') || 'compose'; } catch (e) { }
    view(v);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
