import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { PROJECTS, SCREEN_PROJECTS, STOPS, STOP_NAMES, SERVICES, EXPERIENCE } from './data.js';
import { clamp, damp, smooth, win, quadMatrix, scramble, ease } from './util.js';
import { pointer } from './track.js';

const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const isMobile = () => innerWidth < 761;
const D = (s) => (REDUCED ? 0 : s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, '0');

const state = { p: 0, pRaw: 0, intro: 0, introVis: 0, entered: false, panel: null, menu: false, gl: false, userPicked: false, hoverScreen: false };
let lenis = null;

// ---------------------------------------------------------------- static content
function fillContent() {
  $('#xpList').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><em>${y}</em><span>${o}</span></li>`).join('');
  $('#svcList').innerHTML = SERVICES.map(([n, d]) => `<li><b>${n}</b><span>${d}</span></li>`).join('');
  $('#workList').innerHTML = PROJECTS.map((p) => `<li><a href="${p.url}" target="_blank" rel="noopener"><img src="${p.img}" alt="" loading="lazy" width="1800" height="1125"><div><small>${p.year} · ${p.cat}</small><h3>${p.title}</h3><p>${p.line}</p></div></a></li>`).join('');
}

// ---------------------------------------------------------------- loader
const L = { el: $('#loader'), count: $('#ldCount'), arc: $('.ld-arc'), logo: $('#ldLogo'), enter: $('#ldEnter'), shown: 0, target: 0, t0: performance.now(), finished: false };
function loaderTick() {
  if (L.finished) return;
  const minT = REDUCED ? 1 : 2300;
  const cap = Math.min(100, ((performance.now() - L.t0) / minT) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + Math.max(0.35, (goal - L.shown) * 0.1));
  L.count.textContent = Math.floor(L.shown);
  L.arc.style.strokeDashoffset = 503 * (1 - L.shown / 100);
  if (L.shown >= 99.9 && L.target >= 100) { L.count.textContent = '100'; L.arc.style.strokeDashoffset = 0; L.finished = true; finishLoader(); return; }
  requestAnimationFrame(loaderTick);
}
let autoEnter = 0;
function finishLoader() {
  const nl = $('.nav-logo').getBoundingClientRect();
  const lb = L.logo.getBoundingClientRect();
  const dx = nl.left + nl.width / 2 - (lb.left + lb.width / 2);
  const dy = nl.top + nl.height / 2 - (lb.top + lb.height / 2);
  const s = nl.width / lb.width;
  const navItems = $$('.nav-link, .nav-menu');
  html.classList.add('ready');
  const prompt = () => { L.el.classList.add('prompt'); autoEnter = setTimeout(enter, 5200); };
  if (REDUCED) {
    // no choreography: land on the prompt state at once
    html.classList.add('flown');
    gsap.set([L.count, '.ld-ring', L.logo], { opacity: 0 });
    gsap.set(L.el, { backgroundColor: 'rgba(0,0,0,0)' });
    gsap.set(L.enter, { autoAlpha: 1 });
    prompt();
    return;
  }
  gsap.set(navItems, { opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(L.count, { opacity: 0, y: 8, duration: D(0.45) }, D(0.25))
    .to('.ld-ring', { opacity: 0, scale: 1.12, duration: D(0.7), ease: 'power2.out' }, '<')
    .to(L.logo, { x: dx, y: dy, scale: s, duration: D(1.15), ease: 'expo.inOut' }, D(0.55))
    .to(L.el, { backgroundColor: 'rgba(0,0,0,0)', duration: D(0.5) }, '-=0.35')
    .add(() => { html.classList.add('flown'); gsap.set(L.logo, { opacity: 0 }); })
    .to(navItems, { opacity: 1, duration: D(0.7), stagger: D(0.06) }, '-=0.2')
    .to(L.enter, { autoAlpha: 1, duration: D(0.7) }, '-=0.5')
    .add(prompt);
}

// ---------------------------------------------------------------- enter
function enter() {
  if (state.entered || !L.finished) return;
  state.entered = true;
  clearTimeout(autoEnter);
  html.classList.add('entered');
  gsap.to(L.enter, { autoAlpha: 0, duration: D(0.35) });
  gsap.to(L.el, { autoAlpha: 0, duration: D(0.5), delay: D(0.1), onComplete: () => L.el.remove() });
  if (state.gl) {
    gsap.to(G.post.uniforms.uFade, { value: 1, duration: D(1.8), ease: 'power2.out' });
    gsap.to(state, { intro: 1, duration: D(4.2), ease: 'power2.inOut' });
    setTimeout(() => G.mountain.ignite(), D(1100));
    gsap.to(state, { introVis: 1, duration: D(1.4), delay: D(2.2), ease: 'power2.out' });
    setTimeout(() => html.classList.add('ui'), D(2600));
    setTimeout(() => G.room.preload(), 2500);
    const deep = { '#work': 2, '#about': 3, '#contact': 4 }[location.hash];
    if (deep) setTimeout(() => goTo(STOPS[deep], true), D(1600));
  } else html.classList.add('ui');
  lenis?.start();
}

// ---------------------------------------------------------------- WebGL world
const G = {};
async function boot() {
  fillContent();
  requestAnimationFrame(loaderTick);
  const canvas = $('#gl');
  let ctx = null;
  try { ctx = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }); } catch (e) { ctx = null; }
  if (!ctx) return fallback();
  try {
    const [{ createPost }, { createMountain }, { createRoom }, { createLounge }, { createOcean }] = await Promise.all([
      import('./post.js'), import('./scenes/mountain.js'), import('./scenes/room.js'), import('./scenes/lounge.js'), import('./scenes/ocean.js'),
    ]);
    L.target = 8;
    const renderer = new THREE.WebGLRenderer({ canvas, context: ctx, antialias: false });
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.NoToneMapping;
    G.renderer = renderer;
    const mobile = isMobile() || TOUCH;
    G.post = createPost(renderer, { mobile });
    await Promise.race([
      Promise.all([document.fonts.load('300 64px Fraunces'), document.fonts.load('40px Telgra'), document.fonts.load('500 12px "JetBrains Mono"')]),
      sleep(3500),
    ]);
    L.target = 22; await sleep(16);
    G.mountain = createMountain(renderer, { mobile });
    L.target = 45; await sleep(16);
    G.room = createRoom(renderer, { mobile, projects: SCREEN_PROJECTS });
    L.target = 58; await sleep(16);
    G.lounge = await createLounge(renderer, { mobile });
    L.target = 72; await sleep(16);
    G.ocean = await createOcean(renderer, { mobile });
    L.target = 82;
    G.sets = [G.mountain, G.room, G.lounge, G.ocean];
    resize();
    for (const s of G.sets) { try { await renderer.compileAsync(s.scene, s.camera); } catch (e) { /* compile lazily */ } }
    L.target = 94;
    state.gl = true;
    html.classList.add('gl', 'booted');
    setupScroll();
    setupUI();
    showProject(0, true);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });
    last = performance.now();
    raf = requestAnimationFrame(frame);
    await sleep(60);
    L.target = 100;
  } catch (err) {
    console.warn('WebGL scene failed, using the static page.', err);
    fallback();
  }
}

function fallback() {
  state.gl = false;
  cancelAnimationFrame(raf);
  html.classList.remove('gl');
  html.classList.add('nogl', 'booted', 'ready', 'flown', 'entered', 'ui');
  L.finished = true;
  L.el?.remove();
  setupUI();
}

// ---------------------------------------------------------------- scroll + snapping
let snapTimer = 0, snapping = false, lastDir = 1, cool = 0;
function setupScroll() {
  lenis = new Lenis({ autoRaf: false, smoothWheel: true, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1, syncTouch: false });
  lenis.stop();
  lenis.on('scroll', (e) => {
    state.pRaw = e.limit > 0 ? clamp(e.scroll / e.limit) : 0;
    if (e.direction) lastDir = e.direction;
    if (!snapping) { clearTimeout(snapTimer); snapTimer = setTimeout(trySnap, 180); }
  });
  lenis.on('virtual-scroll', ({ deltaY }) => { if (deltaY) lastDir = Math.sign(deltaY); });
  // before entering, any scroll gesture or key enters
  addEventListener('wheel', () => { if (!state.entered) enter(); }, { passive: true });
  addEventListener('touchmove', () => { if (!state.entered) enter(); }, { passive: true });
}
function pickStop(p, dir) {
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1]) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const f = (p - a) / (b - a);
  const lim = lenis.limit || 1;
  const th = Math.min(0.06, 45 / ((b - a) * lim));
  if (f <= 0.0005) return a;
  if (f >= 0.9995) return b;
  if (dir > 0) return f > th ? b : a;
  return f < 1 - th ? a : b;
}
function trySnap() {
  if (!state.entered || state.panel || state.menu || !lenis) return;
  if (Math.abs(lenis.velocity) > 0.5) { snapTimer = setTimeout(trySnap, 120); return; }
  const target = pickStop(state.pRaw, lastDir);
  goTo(target, false);
}
function goTo(stopP, fromNav = true) {
  if (!lenis) return;
  const y = stopP * lenis.limit;
  const dist = Math.abs(y - lenis.scroll) / Math.max(1, lenis.limit);
  if (dist * lenis.limit < 1.5) return;
  snapping = true;
  clearTimeout(snapTimer);
  lenis.scrollTo(y, {
    duration: clamp(0.95 + dist * 2.6, 1.1, fromNav ? 2.8 : 1.9),
    easing: ease.inOut,
    lock: true,
    force: true,
    onComplete: () => {
      snapping = false;
      // swallow trackpad inertia for a beat so one flick moves one scene
      if (!REDUCED) { lenis.stop(); clearTimeout(cool); cool = setTimeout(() => { if (!state.panel && !state.menu) lenis.start(); }, 420); }
    },
  });
  if (REDUCED) snapping = false;
}

// ---------------------------------------------------------------- UI wiring
const ui = {};
function setupUI() {
  if (ui.done) return;
  ui.done = true;
  Object.assign(ui, {
    s: [$('.s1'), $('.s2'), $('.s3'), $('.s4'), $('.s5')],
    blur: [[$('.hero-label')], [$('.s2 .headline'), $('.s2 .clients')], [$('#screenQuad'), $('#workM')], [$('.s4-cap')], [$('.s5-in')]],
    quad: $('#screenQuad'), prev: $('.arrow.prev'), next: $('.arrow.next'), workM: $('#workM'),
    posters: $$('.poster-hit'), cap: $('.s4-cap'), git: $('#gitBtn'), navLinks: $$('.nav-link'),
    siNum: $('#siNum'), siName: $('#siName'), chip: $('#chip'), chipText: $('#chipText'), s5: $('.s5'),
  });
  // keyboard / screen reader focus inside a scene that is not on screen flies the camera there
  ui.s.forEach((el, i) => el.addEventListener('focusin', () => {
    if (!state.gl || (ui.v && ui.v[i] > 0.5)) return;
    if (!state.entered) enter();
    goTo(STOPS[i], true);
  }));
  // nav, menu links
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    if (!state.gl) { if (state.menu) closeMenu(); return; }
    e.preventDefault();
    const i = +a.dataset.go;
    if (state.menu) closeMenu(true);
    if (!state.entered) enter();
    state.userPicked = true;
    goTo(STOPS[i], true);
  }));
  $('.nav-menu').addEventListener('click', () => (state.menu ? closeMenu() : openMenu()));
  $$('.nav-link').forEach((a) => { const t = a.textContent.trim().toUpperCase(); a.setAttribute('aria-label', a.textContent.trim()); a.addEventListener('pointerenter', () => scramble(a, t, 380)); });
  $('.skip').addEventListener('click', (e) => {
    if (!state.gl) return;
    e.preventDefault();
    if (!state.entered) enter();
    goTo(STOPS[2], true);
    setTimeout(() => $('#screenLink').focus({ preventScroll: true }), 2400);
  });
  // project arrows
  ui.prev.addEventListener('click', () => { state.userPicked = true; stepProject(-1); });
  ui.next.addEventListener('click', () => { state.userPicked = true; stepProject(1); });
  // posters
  ui.posters.forEach((b, i) => {
    b.addEventListener('click', () => openPanel(b.dataset.panel));
    b.addEventListener('pointerenter', () => { G.lounge?.setHover(i); showChip(`Open ${b.dataset.panel}`); });
    b.addEventListener('pointerleave', () => { G.lounge?.setHover(-1); hideChip(); });
    b.addEventListener('focus', () => G.lounge?.setHover(i));
    b.addEventListener('blur', () => G.lounge?.setHover(-1));
  });
  const link = $('#screenLink');
  link.addEventListener('pointerenter', () => { state.hoverScreen = true; showChip('Open case'); });
  link.addEventListener('pointerleave', () => { state.hoverScreen = false; hideChip(); });
  // panels
  $('#panelBack').addEventListener('click', closePanel);
  $$('.panel-x').forEach((b) => b.addEventListener('click', closePanel));
  addEventListener('pointermove', (e) => {
    chip.x = e.clientX; chip.y = e.clientY;
    if (e.pointerType === 'mouse' && !REDUCED) { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }
  }, { passive: true });
  addEventListener('keydown', onKey);
  L.enter?.addEventListener('click', enter);
  L.el?.addEventListener('click', (e) => { if (L.el.classList.contains('prompt')) enter(); });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!state.gl) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
}

function onKey(e) {
  if (e.key === 'Escape') { if (state.panel) closePanel(); else if (state.menu) closeMenu(); return; }
  if (!state.entered && L.finished && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown')) { e.preventDefault(); enter(); return; }
  if (state.panel || state.menu) { if (e.key === 'Tab') trapFocus(e); return; }
  if (state.gl && workActive() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    state.userPicked = true;
    stepProject(e.key === 'ArrowRight' ? 1 : -1);
  }
}
const workActive = () => ui.v && ui.v[2] > 0.5;

// ---------------------------------------------------------------- projects
let projIdx = 0, autoT = 0;
function showProject(i, instant = false) {
  const n = SCREEN_PROJECTS.length;
  i = ((i % n) + n) % n;
  projIdx = i;
  const pr = SCREEN_PROJECTS[i];
  G.room?.setProject(i, instant);
  const set = (id, txt, dur) => { const el = $(id); if (!el) return; if (instant) el.textContent = txt; else scramble(el, txt, dur); };
  set('#sqTitle', pr.title, 720);
  $('#sqCount').textContent = `${pad(i + 1)} / ${pad(n)}`;
  set('#sqTag1', pr.tags[0], 520); set('#sqTag2', pr.tags[1], 600);
  set('#sqYear', pr.year, 420); set('#sqCat', pr.cat, 520);
  set('#sqLine', pr.line, 820);
  $('#screenLink').href = pr.url;
  $('#screenLinkLabel').textContent = `Open case: ${pr.title} (opens in a new tab)`;
  $('#wmCount').textContent = `${pad(i + 1)} / ${pad(n)}`;
  $('#wmYear').textContent = `${pr.year} · ${pr.cat}`;
  set('#wmTitle', pr.title, 700);
  $('#wmLine').textContent = pr.line;
  $('#wmOpen').href = pr.url;
  if (!instant) $('#projLive').textContent = `${pr.title}. ${pr.year}, ${pr.cat}. ${pr.line}`;
  autoT = 0;
}
const stepProject = (d) => showProject(projIdx + d);

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

// ---------------------------------------------------------------- panels + menu
let lastFocus = null;
function openPanel(name) {
  const el = $(`#panel-${name}`);
  if (!el || state.panel) return;
  lastFocus = document.activeElement;
  state.panel = el;
  hideChip();
  lenis?.stop();
  const back = $('#panelBack');
  back.hidden = false; el.hidden = false;
  el.querySelector('.panel-in').scrollTop = 0;
  gsap.fromTo(back, { opacity: 0 }, { opacity: 1, duration: D(0.5) });
  gsap.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: D(0.85), ease: 'expo.out' });
  gsap.fromTo(el.querySelectorAll('.panel-top, .panel-h, .panel-lead, .panel-sub, .xp li, .svc li, .plist li, .panel-clients, .pill'),
    { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.7), stagger: D(0.035), delay: D(0.18), ease: 'power3.out' });
  setTimeout(() => el.querySelector('.panel-x').focus({ preventScroll: true }), D(60));
}
function closePanel() {
  const el = state.panel;
  if (!el) return;
  const back = $('#panelBack');
  gsap.to(back, { opacity: 0, duration: D(0.4) });
  gsap.to(el, { xPercent: 100, duration: D(0.6), ease: 'expo.in', onComplete: () => { el.hidden = true; back.hidden = true; } });
  state.panel = null;
  if (!state.menu) lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}
function openMenu() {
  const m = $('#menu');
  state.menu = true;
  lastFocus = document.activeElement;
  html.classList.add('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'true');
  $('.nav-menu').setAttribute('aria-label', 'Close menu');
  lenis?.stop();
  m.hidden = false;
  gsap.fromTo(m, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: D(0.8), ease: 'expo.inOut', onComplete: () => { menuShown = state.menu; } });
  gsap.fromTo(m.querySelectorAll('.menu-list li, .menu-side p'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.8), stagger: D(0.05), delay: D(0.25), ease: 'power3.out' });
  setTimeout(() => m.querySelector('a').focus({ preventScroll: true }), D(300));
}
function closeMenu(fromLink = false) {
  const m = $('#menu');
  state.menu = false;
  menuShown = false;
  html.classList.remove('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'false');
  $('.nav-menu').setAttribute('aria-label', 'Open menu');
  gsap.to(m, { clipPath: 'inset(0 0 100% 0)', duration: D(0.65), ease: 'expo.inOut', onComplete: () => { m.hidden = true; } });
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
  if (!G.renderer || !G.sets) return;
  const w = innerWidth, h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  G.renderer.setPixelRatio(dpr);
  G.renderer.setSize(w, h, false);
  G.post.resize(w, h, dpr);
  G.sets.forEach((s) => s.applyAspect(w / h));
  G.mountain.setPx?.(dpr);
  lenis?.resize();
}

// ---------------------------------------------------------------- frame loop
const WINDOWS = [[0.285, 0.375], [0.565, 0.645], [0.835, 0.915]];
let raf = 0, last = 0, clock = 0, menuShown = false;
function pickSets(p) {
  const s = G.sets;
  for (let i = 0; i < 3; i++) {
    const [a, b] = WINDOWS[i];
    if (p < a) return [s[i], null, 0];
    if (p < b) { const m = smooth(a, b, p); return m > 0.999 ? [s[i + 1], null, 0] : [s[i], s[i + 1], m]; }
  }
  return [s[3], null, 0];
}
function setOv(i, v) {
  const el = ui.s[i];
  if (Math.abs((el._v ?? -1) - v) < 0.001) return;
  el._v = v;
  el.style.opacity = v.toFixed(3);
  const vis = v > 0.003;
  if (vis !== el._vis) { el._vis = vis; el.classList.toggle('vis', vis); }
  const b = !REDUCED && v > 0.003 && v < 0.997 ? `blur(${((1 - v) * 14).toFixed(2)}px)` : '';
  for (const t of ui.blur[i]) if (t) t.style.filter = b;
}
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (state.menu && menuShown) { last = now; lenis?.raf(now); return; }
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  if (!REDUCED) clock += dt;
  lenis?.raf(now);
  state.p = REDUCED ? state.pRaw : damp(state.p, state.pRaw, 7.5, dt);
  if (Math.abs(state.p - state.pRaw) < 1e-5) state.p = state.pRaw;
  const p = state.p;
  const t = REDUCED ? 14 : clock;

  pointer.x = damp(pointer.x, aim.x, 2.4, dt);
  pointer.y = damp(pointer.y, aim.y, 2.4, dt);
  const [A, B, mix] = pickSets(p);
  A.update(dt, t, p, state.intro);
  if (B) B.update(dt, t, p, state.intro);
  G.post.uniforms.uTime.value = t;
  G.post.render(A, B, mix);
  updateOverlays(p, dt);
}

function updateOverlays(p, dt) {
  const w = innerWidth, h = innerHeight, mob = isMobile();
  const v = [
    state.introVis * win(p, -1, -0.5, 0.02, 0.07),
    win(p, 0.06, 0.122, 0.165, 0.225),
    win(p, 0.4, 0.455, 0.505, 0.555),
    win(p, 0.68, 0.735, 0.79, 0.84),
    win(p, 0.925, 0.985, 2, 3),
  ];
  ui.v = v;
  v.forEach((x, i) => setOv(i, x));

  // work screen overlay follows the projected 3D screen
  if (v[2] > 0) {
    const q = G.room.screenQuad(w, h);
    if (q) {
      const m = quadMatrix(1000, 625, q[0], q[1], q[2], q[3]);
      if (m) ui.quad.style.transform = m;
      const lm = [(q[0][0] + q[3][0]) / 2, (q[0][1] + q[3][1]) / 2];
      const rm = [(q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2];
      if (mob) {
        const bottom = Math.max(q[2][1], q[3][1]);
        const top = Math.min(bottom + 26, h - 250);
        ui.workM.style.transform = `translateY(${top}px)`;
        ui.prev.style.transform = `translate(${44}px, ${top + 62}px)`;
        ui.next.style.transform = `translate(${w - 44}px, ${top + 62}px)`;
      } else if (h > w) {
        // tablet portrait: arrows sit under the screen's bottom corners
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
    if (!REDUCED && !state.userPicked && !state.hoverScreen && v[2] > 0.98 && !state.panel) {
      autoT += dt;
      if (autoT > 7) stepProject(1);
    }
  }
  // posters: invisible buttons mapped over each 3D poster
  if (v[3] > 0) {
    let topY = h;
    ui.posters.forEach((b, i) => {
      const q = G.lounge.posterQuad(i, w, h);
      if (!q) return;
      const m = quadMatrix(310, 596, q[0], q[1], q[2], q[3]);
      if (m) b.style.transform = m;
      topY = Math.min(topY, q[0][1], q[1][1]);
    });
    ui.cap.style.transform = `translateY(${Math.max(80, topY - 36)}px)`;
  }
  ui.s5.classList.toggle('on', v[4] > 0.55);
  ui.git.classList.toggle('hide', p > 0.87);

  // nav state + scene index
  const active = p > 0.9 ? 4 : p > 0.66 && p < 0.9 ? 3 : p > 0.38 && p < 0.62 ? 2 : -1;
  ui.navLinks.forEach((a) => a.classList.toggle('on', +a.dataset.go === active));
  let si = 0, best = 9;
  STOPS.forEach((s, i) => { const d = Math.abs(s - p); if (d < best) { best = d; si = i; } });
  if (ui.si !== si) { ui.si = si; ui.siNum.textContent = pad(si + 1); scramble(ui.siName, STOP_NAMES[si].toUpperCase(), 500); }
  ui.siEl ??= $('.scene-index');
  ui.siEl.style.opacity = p > 0.9 ? '0' : '';

  // cursor chip
  if (chip.on) {
    chip.cx = damp(chip.cx, chip.x + 18, 22, dt);
    chip.cy = damp(chip.cy, chip.y + 18, 22, dt);
    ui.chip.style.transform = `translate(${chip.cx.toFixed(1)}px, ${chip.cy.toFixed(1)}px)`;
  } else { chip.cx = chip.x + 18; chip.cy = chip.y + 18; }
}

// test hook (no UI): jump straight to a stop
window.__scd = {
  state,
  go: (i) => goTo(STOPS[i], true),
  jump: (i) => { if (!lenis) return; clearTimeout(snapTimer); snapping = false; lenis.scrollTo(STOPS[i] * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = STOPS[i]; },
  jumpP: (p) => { if (!lenis) return; clearTimeout(snapTimer); snapping = true; lenis.scrollTo(p * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = p; setTimeout(() => { snapping = false; }, 60000); },
  enter: () => enter(),
};

boot();
