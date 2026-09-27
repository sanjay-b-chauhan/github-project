import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { PROJECTS, STOPS, STOP_CHAPTER, CHAPTERS, CHAPTER_STOP, WINDOWS, RISE, FLOOD, EXPERIENCE, BEFORE, SERVICES } from './data.js';
import { clamp, damp, smooth, win, quadMatrix, scramble, ease } from './util.js';
import { pointer } from './track.js';
import { runStorm } from './storm.js';

// Sanjay Chauhan Designs, v9. One film from night to day: the name under the stars,
// a dive through the portal into the beam, the screening room, the lounge, a sunrise
// over the sea, and the cream day page. One renderer, one camera journey.
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const SHORT = html.classList.contains('short') && !REDUCED;
const isMobile = () => innerWidth < 761;
const D = (s) => (REDUCED ? 0 : SHORT ? s * 0.5 : s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, '0');
const qs = new URLSearchParams(location.search);
const DEEP = qs.has('s') ? clamp(Math.round(+qs.get('s') || 0), 0, STOPS.length - 1)
  : qs.has('c') ? CHAPTER_STOP[clamp(Math.round(+qs.get('c') || 1) - 1, 0, 5)] : -1;
const SECTION_STOP = [0, 1, 2, 6, 7, 8, 10];
const STEP_STOPS = [0.19, 0.25, 0.31, 0.37];

const state = { p: 0, pRaw: 0, dayScroll: 0, intro: 0, introVis: 0, entered: false, panel: null, menu: false, gl: false, userPicked: false, hoverScreen: false, mode: 'loader', dayShown: false };
let lenis = null;
const G = { sets: [null, null, null, null, null], day: null, dpr: 1 };

// ---------------------------------------------------------------- static content
function fillContent() {
  $('#xpList').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><em>${y}</em><span>${o}</span></li>`).join('');
  $('#bzList').innerHTML = BEFORE.map(([n, d]) => `<li><b>${n}</b><span>${d}</span></li>`).join('');
  $('#svcList').innerHTML = SERVICES.map((n) => `<li>${n}</li>`).join('');
  $('#fbWork').innerHTML = PROJECTS.map((p) => `<li><a href="${p.url}" target="_blank" rel="noopener"><img src="${p.img}" alt="${p.title} screenshot" loading="lazy" width="1800" height="1125"><h3>${p.title}</h3><p>${p.kicker}. ${p.line}</p></a></li>`).join('');
  $('#dayList').innerHTML = PROJECTS.map((p, i) => `<li><a href="${p.url}" target="_blank" rel="noopener" data-i="${i}"><span class="ln"><span style="--d:${(0.34 + i * 0.04).toFixed(2)}s">${p.short}</span></span></a></li>`).join('');
  // the sunburst ring: sixteen marks around a dotted circle
  let s = '';
  for (let k = 0; k < 16; k++) {
    const a = (k * 360) / 16, big = k % 2 === 0;
    const w = big ? 38 : 24, h = (w * 301.009) / 424.098, R = big ? 104 : 100;
    s += `<g transform="translate(150 150) rotate(${a}) translate(0 ${-R})"><use href="#sb-big" x="${-w / 2}" y="${-h}" width="${w}" height="${h}"/></g>`;
  }
  s += '<circle cx="150" cy="150" r="136" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 7" opacity=".7"/>';
  $('#ringRot').innerHTML = s;
  $('#ticks').innerHTML = '<i></i>'.repeat(28);
}

// ---------------------------------------------------------------- loader: the counter
const L = { el: $('#loader'), num: $('#ldNum'), enter: $('#ldEnter'), shown: 0, target: 0, t0: performance.now(), last: performance.now(), ready: false, want: false };
let autoEnter = 0;
function loaderTick() {
  if (state.entered) return;
  const now = performance.now();
  const dt = Math.min(0.25, (now - L.last) / 1000);
  L.last = now;
  const minT = REDUCED ? 1 : SHORT ? 240 : 2300;
  const cap = Math.min(100, ((now - L.t0) / minT) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + (goal - L.shown) * (1 - Math.exp(-dt * (SHORT ? 22 : 5.5))) + (goal > L.shown ? dt * 9 : 0));
  const v = Math.min(100, Math.round(L.shown));
  const txt = String(v).padStart(3, '0');
  if (L.num.textContent !== txt) L.num.textContent = txt;
  if (!L.ready && v >= 100 && L.target >= 100) {
    L.ready = true;
    L.enter.classList.add('ready');
    html.classList.add('ready');
    if (L.want || SHORT) enter(); else autoEnter = setTimeout(enter, 1500);
    return;
  }
  requestAnimationFrame(loaderTick);
}
function askEnter(e) {
  if (state.entered) return;
  if (e && e.type === 'keydown' && !['Enter', ' ', 'ArrowDown', 'PageDown', 'Spacebar'].includes(e.key)) return;
  if (e && e.type === 'keydown') e.preventDefault();
  if (L.ready) enter(); else L.want = true;
}

// ---------------------------------------------------------------- enter: the storm, then the night
function enter() {
  if (state.entered || !L.ready) return;
  state.entered = true;
  clearTimeout(autoEnter);
  try { sessionStorage.setItem('scd9-seen', '1'); } catch (e) { /* private mode */ }
  L.enter.classList.remove('ready');
  html.classList.add('entered');
  const storm = $('#storm');
  let started = false;
  const go = () => { if (started) return; started = true; startSite(); };
  let ok = false;
  if (!REDUCED && state.gl) {
    ok = runStorm(storm, {
      duration: SHORT ? 720 : 2150,
      onCover: () => { L.el.style.display = 'none'; go(); },
      onDone: (cleanup) => gsap.to(storm, { opacity: 0, duration: SHORT ? 0.3 : 0.6, ease: 'power1.out', onComplete: cleanup }),
    });
  }
  if (!ok) {
    storm.remove();
    gsap.to(L.el, { opacity: 0, duration: REDUCED ? 0.01 : 0.7, onComplete: () => { L.el.style.display = 'none'; } });
    go();
  }
}
function switchToSite() {
  state.mode = 'site';
  resize();
}
function startSite() {
  switchToSite();
  const pu = G.post.uniforms;
  pu.uFade.value = REDUCED ? 1 : 0;
  gsap.to(pu.uFade, { value: 1, duration: D(1.2) || 0.01, ease: 'power2.out' });
  gsap.to(state, { intro: 1, duration: D(4) || 0.01, ease: 'power2.inOut' });
  state.introVis = 1;
  setTimeout(() => G.sets[0].ignite(), D(650));
  setTimeout(() => html.classList.add('name-in'), D(1150));
  setTimeout(() => html.classList.add('ui'), D(2300));
  // a touch-scroll during the loader must not skip the name
  if (state.pRaw > 0.001) jumpTo(0);
  lenis?.start();
  if (!G.sets[1]) setTimeout(() => ensureSet(1), D(1500));
  queueLazy(D(3400) + 400);
  const deep = { '#what': 2, '#work': 6, '#about': 7, '#contact': 8, '#index': 10 }[location.hash];
  if (deep) setTimeout(() => ensureAll().then(() => goTo(STOPS[deep], true)), D(1800));
  setTimeout(() => { G.intro?.dispose(); G.intro = null; }, 3000);
}
async function deepStart(stop) {
  state.entered = true;
  clearTimeout(autoEnter);
  L.el.remove();
  $('#storm')?.remove();
  html.classList.add('entered', 'name-in', 'ui', 'ready');
  await ensureAll();
  switchToSite();
  state.intro = 1; state.introVis = 1;
  G.post.uniforms.uFade.value = 1;
  G.sets[0].ignite();
  jumpTo(STOPS[stop]);
  lenis?.start();
}

// ---------------------------------------------------------------- WebGL world, built lazily
let mods = null;
async function boot() {
  fillContent();
  requestAnimationFrame(loaderTick);
  const fontsOn = () => L.el.classList.add('fonts');
  document.fonts.load('100px Telgra').then(fontsOn, fontsOn);
  setTimeout(fontsOn, 1400);
  const canvas = $('#gl');
  let ctx = null;
  try { ctx = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }); } catch (e) { ctx = null; }
  if (!ctx) return fallback();
  try {
    const [post, intro, mountain, beam, ripple, tex] = await Promise.all([
      import('./post.js'), import('./intro.js'), import('./scenes/mountain.js'), import('./scenes/beam.js'), import('./ripple.js'), import('./tex.js'),
    ]);
    mods = { post, intro, mountain, beam, ripple, tex };
    L.target = 12;
    const renderer = new THREE.WebGLRenderer({ canvas, context: ctx, antialias: false });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.NoToneMapping;
    G.renderer = renderer;
    G.mobile = isMobile() || TOUCH;
    tex.initTex(renderer, { mobile: G.mobile });
    G.intro = intro.createIntro(renderer);
    G.post = post.createPost(renderer, { mobile: G.mobile });
    state.gl = true;
    html.classList.add('gl');
    resize();
    last = performance.now();
    raf = requestAnimationFrame(frame);
    if (DEEP < 0) gsap.to(G.intro.U.uFade, { value: 1, duration: REDUCED ? 0.01 : SHORT ? 0.35 : 1.3, delay: 0.05, ease: 'power2.inOut' });
    await Promise.race([
      Promise.all(['400 40px Telgra', '400 64px "Instrument Serif"', '400 16px "Inter Tight"'].map((f) => document.fonts.load(f))),
      sleep(3500),
    ]);
    L.target = 34; await sleep(16);
    G.sets[0] = mountain.createMountain(renderer, { mobile: G.mobile });
    L.target = 58; await sleep(16);
    // a returning visitor gets straight in; the beam builds while the name lands
    if (!SHORT || DEEP >= 0) G.sets[1] = beam.createBeam(renderer, { mobile: G.mobile });
    L.target = 76;
    resize();
    for (const s of G.sets) { if (!s) continue; try { await renderer.compileAsync(s.scene, s.camera); } catch (e) { /* compile lazily */ } }
    L.target = 90;
    G.rv = ripple.createRippleView({
      renderer, projects: PROJECTS, reduce: REDUCED, coarse: TOUCH, mobile: G.mobile,
      dom: { root: $('#rv'), body: $('#rvBody'), scroll: $('#rvScroll'), close: $('#rvClose'), tagT: $('#rvTagT'), tagB: $('#rvTagB'), court: $('#court'), imgA: $('#rvImgA'), imgB: $('#rvImgB') },
      onOpen: rvOpened, onSwap: rvSwapped, onClose: rvClosed,
    });
    G.rv.resize(innerWidth, innerHeight);
    setupScroll();
    setupUI();
    showProject(0, true);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });
    html.classList.add('booted');
    window.__scdBooted = true;
    clearTimeout(window.__fs);
    await sleep(30);
    L.target = 100;
    if (DEEP >= 0) deepStart(DEEP);
  } catch (err) {
    console.warn('WebGL scene failed, using the static page.', err);
    fallback();
  }
}

const building = [];
const BUILDERS = [
  async () => (await import('./scenes/mountain.js')).createMountain(G.renderer, { mobile: G.mobile }),
  async () => (await import('./scenes/beam.js')).createBeam(G.renderer, { mobile: G.mobile }),
  async () => (await import('./scenes/room.js')).createRoom(G.renderer, { mobile: G.mobile, projects: PROJECTS }),
  async () => (await import('./scenes/lounge.js')).createLounge(G.renderer, { mobile: G.mobile }),
  async () => (await import('./scenes/ocean.js')).createOcean(G.renderer, { mobile: G.mobile }),
];
function ensureSet(i) {
  if (G.sets[i]) return Promise.resolve(G.sets[i]);
  if (building[i]) return building[i];
  building[i] = BUILDERS[i]().then(async (s) => {
    s.applyAspect(innerWidth / innerHeight);
    s.setPx?.(G.dpr);
    try { await G.renderer.compileAsync(s.scene, s.camera); } catch (e) { /* compile lazily */ }
    G.sets[i] = s;
    if (s.name === 'room') { G.room = s; s.preload(); showProject(projIdx, true); }
    return s;
  });
  return building[i];
}
let dayBuilding = null;
function ensureDay() {
  if (G.day) return Promise.resolve(G.day);
  if (dayBuilding) return dayBuilding;
  dayBuilding = import('./scenes/day.js').then(({ createDay }) => {
    const d = createDay(G.renderer, { projects: PROJECTS, stripEl: $('#strip'), coarse: TOUCH });
    d.resize(innerWidth, innerHeight);
    d.onActive = dayActive;
    d.onOpen = (i, x, y) => openProject(i, x, y, null, 'day');
    G.day = d;
    return d;
  });
  return dayBuilding;
}
const ensureAll = () => Promise.all([1, 2, 3, 4].map(ensureSet)).then(ensureDay);
// the rest of the film builds in idle time after the intro, one set at a time
function queueLazy(delay) {
  const order = [1, 2, 3, 4];
  let k = 0;
  const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 900 }) : setTimeout(fn, 60));
  const next = () => {
    if (k >= order.length) { idle(() => ensureDay()); return; }
    const i = order[k++];
    idle(() => ensureSet(i).then(() => setTimeout(next, 160), () => setTimeout(next, 160)));
  };
  setTimeout(next, delay);
}
// sets three or more chapters away give their GPU buffers back; they re-upload on the way back
function parkScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of mats) {
      for (const k in m) { const v = m[k]; if (v && v.isTexture && !v.isRenderTargetTexture && !v.userData.keep) v.dispose(); }
      if (m.uniforms) for (const k in m.uniforms) { const v = m.uniforms[k] && m.uniforms[k].value; if (v && v.isTexture && !v.isRenderTargetTexture && !v.userData.keep) v.dispose(); }
    }
  });
}
let lastSetIdx = -1;
function manageSets(cur) {
  if (cur === lastSetIdx) return;
  lastSetIdx = cur;
  G.sets.forEach((s, i) => {
    if (!s) return;
    const far = Math.abs(i - cur) >= 3;
    if (far && !s._parked) { parkScene(s.scene); s._parked = true; }
    else if (!far && s._parked) { s._parked = false; G.post.warm(s); }
  });
}

function fallback() {
  state.gl = false;
  cancelAnimationFrame(raf);
  html.classList.remove('gl');
  html.classList.add('nogl', 'booted', 'ready', 'entered', 'ui', 'name-in');
  window.__scdBooted = true;
  clearTimeout(window.__fs);
  L.ready = true; state.entered = true;
  L.el?.remove();
  $('#storm')?.remove();
  $('#strip').innerHTML = PROJECTS.map((p) => `<a href="${p.url}" target="_blank" rel="noopener"><img src="${p.img}" alt="${p.title} screenshot" loading="lazy" width="1800" height="1125"></a>`).join('');
  html.classList.remove('rv-open', 'rv-cover');
  if (!G.rvDom) {
    G.rv?.kill?.();
    import('./ripple.js').then(({ createRippleView }) => {
      G.rv = createRippleView({
        renderer: null, projects: PROJECTS, reduce: REDUCED, coarse: TOUCH, mobile: isMobile(),
        dom: { root: $('#rv'), body: $('#rvBody'), scroll: $('#rvScroll'), close: $('#rvClose'), tagT: $('#rvTagT'), tagB: $('#rvTagB'), court: $('#court'), imgA: $('#rvImgA'), imgB: $('#rvImgB') },
        onOpen: rvOpened, onSwap: () => {}, onClose: rvClosed,
      });
      G.rvDom = true;
      G.rv.resize(innerWidth, innerHeight);
      const tick = () => { G.rv.update(1 / 60); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }).catch(() => {});
  }
  setupUI();
}

// ---------------------------------------------------------------- scroll + snapping
let snapTimer = 0, snapping = false, lastDir = 1, cool = 0, hold = false, dayExtra = 0;
// the film runs over the first part of the scroll; on phones the day page adds its own height after it
const filmLimit = () => Math.max(1, (lenis ? lenis.limit : 1) - dayExtra);
function measureDay() {
  const el = $('#day');
  if (!el || !state.gl) return;
  const extra = Math.max(0, Math.ceil(el.offsetHeight - innerHeight));
  if (extra === dayExtra) return;
  dayExtra = extra;
  $('.scroll-space').style.height = extra ? `calc(1000lvh + ${extra}px)` : '';
  lenis?.resize();
}
function setupScroll() {
  lenis = new Lenis({ autoRaf: false, smoothWheel: true, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1, syncTouch: false });
  lenis.stop();
  lenis.on('scroll', (e) => {
    const fl = Math.max(1, e.limit - dayExtra);
    state.pRaw = e.limit > 0 ? clamp(e.scroll / fl) : 0;
    state.dayScroll = Math.max(0, e.scroll - fl);
    if (e.direction) lastDir = e.direction;
    if (!snapping) { clearTimeout(snapTimer); snapTimer = setTimeout(trySnap, 180); }
  });
  lenis.on('virtual-scroll', ({ deltaY }) => { if (deltaY) lastDir = Math.sign(deltaY); });
  addEventListener('wheel', askEnter, { passive: true });
  addEventListener('touchmove', askEnter, { passive: true });
}
function pickStop(p, dir) {
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1]) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const f = (p - a) / (b - a);
  const lim = filmLimit();
  const th = Math.min(0.06, 45 / ((b - a) * lim));
  if (f <= 0.0005) return a;
  if (f >= 0.9995) return b;
  if (dir > 0) return f > th ? b : a;
  return f < 1 - th ? a : b;
}
function trySnap() {
  if (hold || !state.entered || state.panel || state.menu || !lenis || G.rv?.isOpen) return;
  if (lenis.scroll > filmLimit() + 2) return;
  if (Math.abs(lenis.velocity) > 0.5) { snapTimer = setTimeout(trySnap, 120); return; }
  goTo(pickStop(state.pRaw, lastDir), false);
}
function goTo(stopP, fromNav = true) {
  if (!lenis) return;
  const fl = filmLimit();
  const y = stopP * fl;
  const dist = Math.abs(y - lenis.scroll) / fl;
  if (dist * fl < 1.5) return;
  snapping = true;
  clearTimeout(snapTimer);
  if (REDUCED) {
    lenis.scrollTo(y, { immediate: true, force: true });
    state.pRaw = state.p = stopP;
    setTimeout(() => { snapping = false; }, 60);
    return;
  }
  lenis.scrollTo(y, {
    duration: clamp(0.95 + dist * 2.6, 1.1, fromNav ? 2.8 : 1.9),
    easing: ease.inOut,
    lock: true,
    force: true,
    onComplete: () => {
      snapping = false;
      // swallow trackpad inertia for a beat so one flick moves one stop
      lenis.stop(); clearTimeout(cool);
      cool = setTimeout(() => { if (!state.panel && !state.menu && !G.rv?.isOpen) lenis.start(); }, 420);
    },
  });
}
function jumpTo(p) {
  if (!lenis) return;
  clearTimeout(snapTimer); snapping = false;
  lenis.scrollTo(p * filmLimit(), { immediate: true, force: true });
  state.pRaw = state.p = p;
}

// ---------------------------------------------------------------- UI wiring
const ui = {};
function setupUI() {
  if (ui.done) return;
  ui.done = true;
  Object.assign(ui, {
    s: [$('.c1'), $('.c1b'), $('.c2'), $('.c3'), $('.c4'), $('.c5'), $('.c6')],
    blur: [[$('.c1 .name'), $('.name-line')], [$('.c1b .headline'), $('.c1b .clients')], [], [$('#screenQuad'), $('#workM')], [$('.c4-cap')], [$('.c5-in')], []],
    name: $('.c1 .name'), nameLine: $('.name-line'), stage: $('#main'),
    steps: $$('.step'), quad: $('#screenQuad'), prev: $('.arrow.prev'), next: $('.arrow.next'), workM: $('#workM'),
    posters: $$('.poster-hit'), cap: $('.c4-cap'), git: $('#gitBtn'), navLinks: $$('.nav-link'), c5: $('.c5'), c6: $('.c6'),
    hudNum: $('#hudNum'), hudName: $('#hudName'), chip: $('#chip'), chipText: $('#chipText'), xs: $$('.hud-bar .x'), ticks: $$('#ticks i'),
    dayLinks: $$('#dayList a'), pv: $('#pvImg'), ring: $('#ring'), ringT: $('#ring .ring-t'), dayEl: $('#day'), c5sub: $('.c5 .sub'),
  });
  ui.stepH = ui.steps.map((s) => $('h3', s));
  ui.stepW = ui.steps.map((s) => splitWords($('p', s)));
  // keyboard focus inside a chapter that is not on screen flies the camera there
  ui.s.forEach((el, i) => el.addEventListener('focusin', () => {
    if (!state.gl || (ui.v && ui.v[i] > 0.5)) return;
    if (!state.entered) askEnter();
    goTo(STOPS[SECTION_STOP[i]], true);
  }));
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    if (!state.gl) { if (state.menu) closeMenu(); return; }
    e.preventDefault();
    const i = +a.dataset.go;
    if (state.menu) closeMenu(true);
    if (!state.entered) askEnter();
    state.userPicked = true;
    ensureAll();
    goTo(STOPS[i], true);
  }));
  $('.nav-menu').addEventListener('click', () => (state.menu ? closeMenu() : openMenu()));
  ui.navLinks.forEach((a) => { const t = a.textContent.trim().toUpperCase(); a.setAttribute('aria-label', a.textContent.trim()); a.addEventListener('pointerenter', () => scramble(a, t, 380)); });
  document.fonts?.ready.then(() => { ui.ringBase = null; measureDay(); });
  $('.skip').addEventListener('click', (e) => {
    if (!state.gl) return;
    e.preventDefault();
    if (!state.entered) askEnter();
    ensureAll().then(() => goTo(1, true));
    setTimeout(() => ui.dayLinks[0]?.focus({ preventScroll: true }), 3200);
  });
  ui.prev.addEventListener('click', () => { state.userPicked = true; stepProject(-1); });
  ui.next.addEventListener('click', () => { state.userPicked = true; stepProject(1); });
  ui.posters.forEach((b, i) => {
    b.addEventListener('click', () => openPanel(b.dataset.panel));
    b.addEventListener('pointerenter', () => { G.sets[3]?.setHover(i); showChip(`Open ${b.querySelector('.ph-label').textContent}`); });
    b.addEventListener('pointerleave', () => { G.sets[3]?.setHover(-1); hideChip(); });
    b.addEventListener('focus', () => G.sets[3]?.setHover(i));
    b.addEventListener('blur', () => G.sets[3]?.setHover(-1));
  });
  const link = $('#screenLink');
  link.addEventListener('pointerenter', () => { state.hoverScreen = true; showChip('Open case'); });
  link.addEventListener('pointerleave', () => { state.hoverScreen = false; hideChip(); });
  link.addEventListener('click', (e) => {
    if (!state.gl || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const kb = e.detail === 0;
    const c = kb && G.room ? G.room.screenCenter(innerWidth, innerHeight) : [e.clientX, e.clientY];
    openProject(projIdx, c[0], c[1], link, 'room');
  });
  $('#wmOpen').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    openProject(projIdx, r.left + r.width / 2, r.top + r.height / 2, e.currentTarget, 'room');
  });
  ui.dayLinks.forEach((a) => {
    const k = +a.dataset.i;
    a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') G.day?.hoverIndex(k); });
    a.addEventListener('pointerleave', () => G.day?.hoverIndex(-1));
    a.addEventListener('focus', () => G.day?.focusIndex(k));
    a.addEventListener('blur', () => G.day?.focusIndex(-1));
    a.addEventListener('click', (e) => {
      if (!G.rv || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const r = a.getBoundingClientRect();
      const kb = e.detail === 0;
      openProject(k, kb ? r.left + r.width / 2 : e.clientX, kb ? r.top + r.height / 2 : e.clientY, a, 'day');
    });
  });
  $('#panelBack').addEventListener('click', closePanel);
  $$('.panel-x').forEach((b) => b.addEventListener('click', closePanel));
  addEventListener('pointermove', (e) => {
    chip.x = e.clientX; chip.y = e.clientY;
    if (e.pointerType === 'mouse' && !REDUCED) { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }
  }, { passive: true });
  addEventListener('keydown', onKey);
  L.el?.addEventListener('click', askEnter);
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!state.gl) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
}
function splitWords(el) {
  if (!el) return [];
  const out = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
      const w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w); out.push(w);
    });
    n.replaceWith(frag);
  });
  return out;
}

function onKey(e) {
  if (G.rv && G.rv.onKey(e)) return;
  if (e.key === 'Escape') { if (state.panel) closePanel(); else if (state.menu) closeMenu(); return; }
  if (!state.entered) { askEnter(e); return; }
  if (state.panel || state.menu) { if (e.key === 'Tab') trapFocus(e); return; }
  if (state.gl && workActive() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    state.userPicked = true;
    stepProject(e.key === 'ArrowRight' ? 1 : -1);
  }
}
const workActive = () => ui.v && ui.v[3] > 0.5;

// ---------------------------------------------------------------- III: projects on the big screen
let projIdx = 0, autoT = 0;
function showProject(i, instant = false) {
  const n = PROJECTS.length;
  i = ((i % n) + n) % n;
  projIdx = i;
  const pr = PROJECTS[i];
  G.room?.setProject(i, instant);
  const set = (id, txt, dur) => { const el = $(id); if (!el) return; if (instant) el.textContent = txt; else scramble(el, txt, dur); };
  set('#sqTitle', pr.title, 720);
  $('#sqCount').textContent = `${pad(i + 1)} / ${pad(n)}`;
  set('#sqTag1', pr.tags[0], 520); set('#sqTag2', pr.tags[1], 600);
  set('#sqYear', pr.year, 420); set('#sqCat', pr.cat, 520);
  $('#sqLine').textContent = pr.line;
  $('#screenLink').href = pr.url;
  $('#screenLinkLabel').textContent = `Open case: ${pr.title}`;
  $('#wmCount').textContent = `${pad(i + 1)} / ${pad(n)}`;
  $('#wmYear').textContent = `${pr.year} · ${pr.cat}`;
  set('#wmTitle', pr.title, 700);
  $('#wmLine').textContent = pr.line;
  if (!instant) $('#projLive').textContent = `${pr.title}. ${pr.kicker}. ${pr.line}`;
  autoT = 0;
}
const stepProject = (d) => showProject(projIdx + d);

// ---------------------------------------------------------------- the ripple view (III and VI)
let rvFrom = 'room';
function openProject(i, x, y, trig, from) {
  if (!G.rv || G.rv.isOpen) return;
  rvFrom = from;
  hideChip();
  state.userPicked = true;
  G.rv.open(i, x, y, trig);
}
function rvOpened() {
  lenis?.stop();
  clearTimeout(cool);
  html.classList.add('rv-open');
}
function rvSwapped(i) {
  if (rvFrom === 'room') showProject(i);
  else dayActive(i);
}
function rvClosed() {
  html.classList.remove('rv-open', 'rv-cover');
  clearMask(ui.stage);
  if (!state.panel && !state.menu) lenis?.start();
}
function dayActive(i) {
  ui.dayLinks.forEach((a, k) => a.classList.toggle('on', k === i));
  const src = PROJECTS[i].img;
  if (ui.pv && ui.pv.getAttribute('src') !== src) {
    ui.pv.setAttribute('src', src);
    ui.pv.classList.remove('swap'); void ui.pv.offsetWidth; ui.pv.classList.add('swap');
  }
}
function setMask(el, m) { el.style.webkitMaskImage = m; el.style.maskImage = m; el._masked = true; }
function clearMask(el) { if (!el || !el._masked) return; el.style.webkitMaskImage = ''; el.style.maskImage = ''; el.style.opacity = ''; el._masked = false; }

// ---------------------------------------------------------------- cursor chip
const chip = { x: -300, y: -300, cx: -300, cy: -300, on: false };
const aim = { x: 0, y: 0 };
function showChip(text) {
  if (TOUCH) return;
  chip.on = true;
  ui.chip.classList.add('on');
  scramble(ui.chipText, text.toUpperCase(), 420);
}
function hideChip() { chip.on = false; ui.chip?.classList.remove('on'); }

// ---------------------------------------------------------------- IV: panels, and the menu
let lastFocus = null;
function openPanel(name) {
  const el = $(`#panel-${name}`);
  if (!el || state.panel) return;
  lastFocus = document.activeElement;
  state.panel = el;
  hideChip();
  lenis?.stop();
  html.classList.add('panel-open');
  const back = $('#panelBack');
  back.hidden = false; el.hidden = false;
  el.querySelector('.panel-in').scrollTop = 0;
  gsap.fromTo(back, { opacity: 0 }, { opacity: 1, duration: D(0.5) || 0.01 });
  gsap.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: D(0.85) || 0.01, ease: 'expo.out' });
  gsap.fromTo(el.querySelectorAll('.panel-top, .panel-h, .panel-lead, .panel-quote, .panel-sub, .xp li, .bz li, .svc li, .pill'),
    { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.7) || 0.01, stagger: D(0.035), delay: D(0.18), ease: 'power3.out' });
  setTimeout(() => el.querySelector('.panel-x').focus({ preventScroll: true }), D(60));
}
function closePanel() {
  const el = state.panel;
  if (!el) return;
  const back = $('#panelBack');
  gsap.to(back, { opacity: 0, duration: D(0.4) || 0.01 });
  gsap.to(el, { xPercent: 100, duration: D(0.6) || 0.01, ease: 'expo.in', onComplete: () => { el.hidden = true; back.hidden = true; } });
  state.panel = null;
  html.classList.remove('panel-open');
  if (!state.menu) lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}
let menuShown = false;
function openMenu() {
  const m = $('#menu');
  state.menu = true;
  lastFocus = document.activeElement;
  html.classList.add('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'true');
  $('.nav-menu').setAttribute('aria-label', 'Close menu');
  lenis?.stop();
  m.hidden = false;
  gsap.fromTo(m, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: D(0.8) || 0.01, ease: 'expo.inOut', onComplete: () => { menuShown = state.menu; } });
  gsap.fromTo(m.querySelectorAll('.menu-list li, .menu-side p'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.8) || 0.01, stagger: D(0.05), delay: D(0.25), ease: 'power3.out' });
  setTimeout(() => m.querySelector('a').focus({ preventScroll: true }), D(300));
}
function closeMenu(fromLink = false) {
  const m = $('#menu');
  state.menu = false;
  menuShown = false;
  html.classList.remove('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'false');
  $('.nav-menu').setAttribute('aria-label', 'Open menu');
  gsap.to(m, { clipPath: 'inset(0 0 100% 0)', duration: D(0.65) || 0.01, ease: 'expo.inOut', onComplete: () => { m.hidden = true; } });
  if (!state.panel) lenis?.start();
  if (!fromLink) $('.nav-menu').focus({ preventScroll: true });
}
function trapFocus(e) {
  const root = state.panel || $('#menu');
  const f = [...root.querySelectorAll('a[href], button:not([disabled])')].filter((x) => x.offsetParent !== null);
  if (state.menu && !state.panel) f.unshift($('.nav-menu'));
  if (!f.length) return;
  const first = f[0], lastEl = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
  else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
}

// ---------------------------------------------------------------- resize
function resize() {
  if (!G.renderer) return;
  const w = innerWidth, h = innerHeight;
  const cap = G.mobile ? 1.25 : 1.5;
  const dpr = state.mode === 'loader' ? 1 : Math.min(devicePixelRatio || 1, cap);
  G.dpr = dpr;
  G.renderer.setPixelRatio(dpr);
  G.renderer.setSize(w, h, false);
  G.post.resize(w, h, dpr);
  G.intro?.resize(w, h);
  G.sets.forEach((s) => { if (s) { s.applyAspect(w / h); s.setPx?.(dpr); } });
  G.day?.resize(w, h);
  G.rv?.resize(w, h);
  lenis?.resize();
  ui.ringBase = null;
  measureDay();
}

// ---------------------------------------------------------------- frame loop
let raf = 0, last = 0, clock = 0, manual = false;
function pickSets(p) {
  for (let i = 0; i < 4; i++) {
    const [a, b] = WINDOWS[i];
    if (p < a) return [i, -1, 0];
    if (p < b) { const m = smooth(a, b, p); return m > 0.999 ? [i + 1, -1, 0] : [i, i + 1, m]; }
  }
  return [4, -1, 0];
}
function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  if (manual) return;
  step(dt);
}
function step(dt) {
  if (!REDUCED) clock += dt;
  const t = REDUCED ? 14 : clock;
  const R = G.renderer;
  if (state.mode === 'loader') { G.intro?.render(t); return; }
  lenis?.raf(performance.now());
  if (state.menu && menuShown) return;
  state.p = REDUCED ? state.pRaw : damp(state.p, state.pRaw, 7.5, dt);
  if (Math.abs(state.p - state.pRaw) < 1e-5) state.p = state.pRaw;
  const p = state.p;
  pointer.x = damp(pointer.x, aim.x, 2.4, dt);
  pointer.y = damp(pointer.y, aim.y, 2.4, dt);
  G.rv?.update(dt);
  const w = innerWidth, h = innerHeight;
  const cover = G.rv?.fullCover();
  const dayOn = p >= FLOOD[1] - 1e-4 && !!G.day;
  let floodK = 0, sun = null;
  if (!cover) {
    if (dayOn) {
      G.day.update(dt, t);
      if (G.day.dirty || G.rv?.active) G.day.render();
    } else {
      const [ia, ib, mix] = pickSets(p);
      const A = G.sets[ia], B = ib >= 0 ? G.sets[ib] : null;
      if (!A) {
        ensureSet(ia);
        R.setRenderTarget(null); R.clear();
      } else {
        A.update(dt, t, p, state.intro);
        if (B) B.update(dt, t, p, state.intro); else if (ib >= 0) ensureSet(ib);
        G.post.uniforms.uTime.value = t;
        G.post.render(A, B, B ? mix : 0);
        manageSets(ia);
        if (ia === 4) sun = A.sunScreen(w, h);
        if (ia === 4 && p > FLOOD[0]) {
          floodK = clamp((p - FLOOD[0]) / (FLOOD[1] - FLOOD[0]));
          G.rv.renderFlood(floodK, sun[0], sun[1], t);
          if (floodK > 0.3) ensureDay();
        }
      }
    }
  }
  if (G.rv?.active) {
    if (cover) { R.setRenderTarget(null); R.clear(); }
    G.rv.render();
  }
  updateOverlays(p, dt, floodK, sun, t);
}

function setOv(i, v) {
  const el = ui.s[i];
  if (Math.abs((el._v ?? -1) - v) < 0.001) return;
  el._v = v;
  el.style.opacity = v.toFixed(3);
  const vis = v > 0.003;
  if (vis !== el._vis) { el._vis = vis; el.classList.toggle('vis', vis); }
  const b = !REDUCED && v > 0.003 && v < 0.997 ? `blur(${((1 - v) * 14).toFixed(2)}px)` : '';
  for (const tg of ui.blur[i]) if (tg) tg.style.filter = b;
}
const css = (el, k, v) => { const c = el._c || (el._c = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };

function updateOverlays(p, dt, floodK, sun, t) {
  const w = innerWidth, h = innerHeight, mob = isMobile();
  const v = [
    state.introVis * win(p, -1, -0.5, 0.012, 0.042),
    win(p, 0.028, 0.055, 0.085, 0.108),
    win(p, 0.165, 0.178, 0.385, 0.412),
    win(p, 0.462, 0.485, 0.515, 0.545),
    win(p, 0.6, 0.625, 0.655, 0.685),
    win(p, 0.745, 0.77, 0.955, 0.975),
    win(p, 0.948, 0.97, 2, 3),
  ];
  ui.v = v;
  v.forEach((x, i) => setOv(i, x));

  // I: the name drifts up and grows a little as the camera pushes toward the portal
  if (v[0] > 0) {
    const k = smooth(0, 0.045, p);
    css(ui.name, 'transform', `translate3d(${(-pointer.x * 9).toFixed(2)}px, ${(-k * 46 - pointer.y * 5).toFixed(2)}px, 0) scale(${(1 + k * 0.1).toFixed(4)})`);
    css(ui.nameLine, 'transform', `translate3d(0, ${(-k * 30).toFixed(2)}px, 0)`);
  }
  // II: one heading per stop, the script writes itself in, the line fills word by word
  if (v[2] > 0) {
    ui.steps.forEach((st, j) => {
      const s = STEP_STOPS[j];
      const a0 = j === 0 ? 0.165 : s - 0.036;
      const d1 = j === 3 ? 0.41 : s + 0.036;
      const vis = win(p, a0, s - 0.012, s + 0.012, d1);
      css(st, 'visibility', vis > 0.003 ? 'visible' : 'hidden');
      if (vis <= 0.003) return;
      css(st, 'opacity', vis.toFixed(3));
      css(st, 'transform', `translate3d(0, ${((s - p) * (mob ? 220 : 300)).toFixed(2)}vh, 0)`);
      const rev = REDUCED ? 1 : smooth(a0, s - 0.003, p);
      css(ui.stepH[j], 'clipPath', `inset(-30% ${((1 - rev) * 106).toFixed(2)}% -40% -5%)`);
      const words = ui.stepW[j], n = words.length, r2 = (REDUCED ? 1 : smooth(a0 + 0.004, s, p)) * (n + 3);
      words.forEach((el, k) => css(el, 'opacity', (0.1 + 0.9 * clamp((r2 - k) / 3)).toFixed(2)));
    });
  }
  // III: the work screen overlay follows the projected 3D screen
  if (v[3] > 0 && G.room) {
    const q = G.room.screenQuad(w, h);
    if (q) {
      const m = quadMatrix(1000, 625, q[0], q[1], q[2], q[3]);
      if (m) ui.quad.style.transform = m;
      const lm = [(q[0][0] + q[3][0]) / 2, (q[0][1] + q[3][1]) / 2];
      const rm = [(q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2];
      if (mob) {
        const bottom = Math.max(q[2][1], q[3][1]);
        const top = Math.min(bottom + 26, h - 262);
        ui.workM.style.transform = `translateY(${top}px)`;
        ui.prev.style.transform = `translate(${44}px, ${top + 62}px)`;
        ui.next.style.transform = `translate(${w - 44}px, ${top + 62}px)`;
      } else if (h > w) {
        const bottom = Math.max(q[2][1], q[3][1]);
        ui.prev.style.transform = `translate(${q[3][0] + 56}px, ${bottom + 70}px)`;
        ui.next.style.transform = `translate(${q[2][0] - 56}px, ${bottom + 70}px)`;
      } else {
        const off = Math.max(84, (rm[0] - lm[0]) * 0.1);
        ui.prev.style.transform = `translate(${Math.max(70, lm[0] - off)}px, ${lm[1]}px)`;
        ui.next.style.transform = `translate(${Math.min(w - 70, rm[0] + off)}px, ${rm[1]}px)`;
      }
    }
    // gentle auto-advance while the room is on screen and nobody is touching it
    if (!REDUCED && !state.userPicked && !state.hoverScreen && v[3] > 0.98 && !state.panel && !G.rv?.active) {
      autoT += dt;
      if (autoT > 7) stepProject(1);
    }
  }
  // IV: invisible buttons mapped over each 3D poster
  if (v[4] > 0 && G.sets[3]) {
    let topY = h;
    ui.posters.forEach((b, i) => {
      const q = G.sets[3].posterQuad(i, w, h);
      if (!q) return;
      const m = quadMatrix(310, 596, q[0], q[1], q[2], q[3]);
      if (m) b.style.transform = m;
      topY = Math.min(topY, q[0][1], q[1][1]);
    });
    ui.cap.style.transform = `translateY(${Math.max(84, topY - 36)}px)`;
  }
  // V: the sun rises into the ring; the dawn flood takes the page
  ui.c5.classList.toggle('on', v[5] > 0.55);
  if (v[5] > 0 && sun) {
    const r = REDUCED ? (p >= RISE[1] - 0.005 ? 1 : 0) : smooth(RISE[0] + 0.004, RISE[1], p);
    if (!ui.ringBase) {
      const c5in = ui.ring.offsetParent;
      ui.ringBase = { x: (c5in ? c5in.offsetLeft : 0) + ui.ring.offsetLeft + ui.ring.offsetWidth / 2, y: (c5in ? c5in.offsetTop : 0) + ui.ring.offsetTop + ui.ring.offsetHeight / 2, size: ui.ring.offsetWidth };
    }
    const b0 = ui.ringBase;
    const sc = 1 + (Math.max(1, (1.25 * sun[2]) / (0.66 * b0.size)) - 1) * r;
    css(ui.ring, 'transform', r > 0.0005 ? `translate3d(${((sun[0] - b0.x) * r).toFixed(2)}px, ${((sun[1] - b0.y) * r).toFixed(2)}px, 0) scale(${sc.toFixed(4)})` : '');
    css(ui.ringT, 'opacity', (1 - smooth(0, 0.45, r)).toFixed(3));
    css(ui.c5sub, 'opacity', (1 - smooth(0.05, 0.6, r)).toFixed(3));
  }
  let navInk = p >= FLOOD[1], barInk = p >= FLOOD[1];
  if (floodK > 0 && sun) {
    const R = G.rv.floodRadius(floodK, sun[0], sun[1]);
    setMask(ui.c5, `radial-gradient(circle at ${sun[0].toFixed(1)}px ${sun[1].toFixed(1)}px, transparent ${Math.max(0, R - 26).toFixed(1)}px, #000 ${(R + 36).toFixed(1)}px)`);
    navInk = R > Math.hypot(w / 2 - sun[0], 38 - sun[1]) + 10;
    barInk = R > Math.hypot(w / 2 - sun[0], h - 26 - sun[1]) + 10;
  } else clearMask(ui.c5);
  if (navInk !== ui.navInk) { ui.navInk = navInk; html.classList.toggle('day', navInk); }
  if (barInk !== ui.barInk) { ui.barInk = barInk; html.classList.toggle('day-bar', barInk); }
  // VI: the day page reveals its lines; on phones it scrolls on after the film ends
  css(ui.dayEl, 'transform', state.dayScroll > 0.5 ? `translate3d(0, ${(-state.dayScroll).toFixed(1)}px, 0)` : '');
  const scrolled = state.dayScroll > 6;
  if (scrolled !== ui.dayScrolled) { ui.dayScrolled = scrolled; html.classList.toggle('day-scrolled', scrolled); }
  if (v[6] > 0.3 && !ui.dayMeasured) { ui.dayMeasured = true; measureDay(); }
  const dayIn = v[6] > 0.5;
  if (dayIn !== ui.dayIn) { ui.dayIn = dayIn; ui.c6.classList.toggle('in', dayIn); if (dayIn) setTimeout(() => ui.dayIn && ui.c6.classList.add('settled'), 1900); else ui.c6.classList.remove('settled'); }
  if (p >= FLOOD[1] - 1e-4 && G.day && !state.dayShown) { state.dayShown = true; if (REDUCED) G.day.settle(); else G.day.flyIn(); }
  if (p < 0.9 && state.dayShown) state.dayShown = false;

  // the ripple view masks the page under its front
  const fr = G.rv?.front();
  if (fr) {
    if (fr.fade !== undefined) { clearMask(ui.stage); ui.stage.style.opacity = String(fr.mode === 2 ? fr.fade : 1 - fr.fade); ui.stage._masked = true; }
    else if (fr.mode === 0) setMask(ui.stage, `radial-gradient(circle at ${fr.x.toFixed(1)}px ${fr.y.toFixed(1)}px, transparent ${Math.max(0, fr.R - 22).toFixed(1)}px, #000 ${(fr.R + 30).toFixed(1)}px)`);
    else if (fr.mode === 2) setMask(ui.stage, `radial-gradient(circle at ${fr.x.toFixed(1)}px ${fr.y.toFixed(1)}px, #000 ${Math.max(0, fr.R - 22).toFixed(1)}px, transparent ${(fr.R + 30).toFixed(1)}px)`);
  }
  const rvCover = !!(G.rv?.fullCover() || (fr && fr.mode === 1));
  if (rvCover !== ui.rvCover) { ui.rvCover = rvCover; html.classList.toggle('rv-cover', rvCover); }

  // the pill: chapter I, the room and the lounge
  const pillOn = !G.rv?.active && !state.panel && (p < 0.1 || v[3] > 0.5 || v[4] > 0.5);
  if (pillOn !== ui.pillOn) { ui.pillOn = pillOn; ui.git.classList.toggle('show', pillOn); }

  // nav state + chapter index
  let si = 0, best = 9;
  STOPS.forEach((s, i) => { const d = Math.abs(s - p); if (d < best) { best = d; si = i; } });
  const ch = STOP_CHAPTER[si];
  if (ui.ch !== ch) {
    ui.ch = ch;
    ui.hudNum.textContent = pad(ch + 1);
    scramble(ui.hudName, CHAPTERS[ch].toUpperCase(), 500);
    const active = ch === 2 ? 6 : ch === 3 ? 7 : ch === 4 ? 8 : -1;
    ui.navLinks.forEach((a) => a.classList.toggle('on', +a.dataset.go === active));
  }
  const xr = ((p * 1440) % 360).toFixed(1);
  if (xr !== ui.xr) { ui.xr = xr; ui.xs.forEach((x, i) => x.style.setProperty('--xr', `${i % 2 ? -xr : xr}deg`)); }
  const lit = Math.max(1, Math.round(p * ui.ticks.length));
  ui.ticks.forEach((tk, i) => {
    const on = i < lit;
    if (tk._on !== on) { tk._on = on; tk.classList.toggle('on', on); }
    if (!REDUCED && !mob) tk.style.transform = `scaleY(${(0.42 + 0.3 * (Math.sin(t * 3.2 + i * 0.7) * 0.5 + 0.5)).toFixed(3)})`;
  });

  // cursor chip (also for the cards on the day strip)
  const stripHover = !!(G.day && v[6] > 0.9 && G.day.hovered >= 0 && !G.rv?.active);
  if (stripHover !== ui.stripChip) { ui.stripChip = stripHover; if (stripHover) showChip('Open case'); else hideChip(); }
  if (chip.on) {
    chip.cx = damp(chip.cx, chip.x + 18, 22, dt);
    chip.cy = damp(chip.cy, chip.y + 18, 22, dt);
    ui.chip.style.transform = `translate(${chip.cx.toFixed(1)}px, ${chip.cy.toFixed(1)}px)`;
  } else { chip.cx = chip.x + 18; chip.cy = chip.y + 18; }
}

// test hooks (no UI): jump straight to a stop, drive the ripple view on a fixed clock
window.__scd = {
  state, G,
  go: (i) => goTo(STOPS[i], true),
  jump: (i) => { hold = false; jumpTo(STOPS[i]); clearTimeout(snapTimer); },
  jumpP: (v) => { hold = true; jumpTo(v); clearTimeout(snapTimer); },
  release: () => { hold = false; },
  enter: () => askEnter(),
  ready: () => !!(G.sets.every(Boolean) && G.day),
  ensureAll: () => ensureAll().then(() => true),
  open: (i, x, y, from = 'room') => openProject(i, x ?? innerWidth / 2, y ?? innerHeight / 2, null, from),
  next: () => G.rv?.next(),
  close: () => G.rv?.close(),
  manual(on) { manual = !!on; last = performance.now(); },
  advance(sec) { const n = Math.max(1, Math.round(sec * 60)); for (let i = 0; i < n; i++) step(sec / n); },
};

boot();
