import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { PROJECTS as RAW, CLIENTS, WINS, THOUGHTS, GREETINGS, LINKS, ACCENTS, HALL, EXPERIENCE, STUDIO_SHOTS, STOPS, STOP_NAMES, WINDOWS, STYLES, REMAP } from './content.js';
import { clamp, damp, smooth, win, quadMatrix, scramble, ease } from './util.js';
import { pointer } from './track.js';
import { createCompanion } from './companion.js';

// Sanjay Chauhan, v15. One night, one camera: a portal on a mountain opens into a
// screening room, a hall of photographs, a lounge with three posters, then the sea at sunrise.
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const isMobile = () => innerWidth < 761;
const D = (s) => (REDUCED ? 0 : s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, '0');
const NS = STOPS.length;
const remap = (p, pairs) => {
  if (p <= pairs[0][0]) return pairs[0][1];
  for (let i = 1; i < pairs.length; i++) if (p <= pairs[i][0]) { const [a, x] = pairs[i - 1], [b, y] = pairs[i]; return x + ((p - a) / (b - a)) * (y - x); }
  return pairs[pairs.length - 1][1];
};
const lq = (set, p) => remap(p, REMAP[set.name]);

const PROJECTS = RAW.map((p) => ({ ...p, accent: ACCENTS[p.id] || '#ff2205', tags: [p.services[0], p.services[1] || p.industry] }));
const state = { p: 0, pRaw: 0, intro: 0, introVis: 0, entered: false, panel: null, menu: false, overlay: null, gl: false, userPicked: false, hoverScreen: false };
let lenis = null;

// ---------------------------------------------------------------- static content
function fillContent() {
  $('#clients').innerHTML = CLIENTS.map((c) => `<li>${c}</li>`).join('');
  $('#xpList').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><em>${y}</em><span>${o}</span></li>`).join('');
  $('#winsList').innerHTML = WINS.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('');
  $('#thList').innerHTML = THOUGHTS.map(([h, p]) => `<li>${h} ${p}</li>`).join('');
  $('#beliefs').innerHTML = THOUGHTS.map(([h, p]) => `<li><b>${h}</b><span>${p}</span></li>`).join('');
  $('#studioShots').innerHTML = STUDIO_SHOTS.map(([s, c]) => `<button type="button" class="shot" data-lb="${s}" data-cap="${c}"><img src="${s}" alt="${c}" loading="lazy"></button>`).join('');
  $('#workList').innerHTML = PROJECTS.map((p, i) => `<li><button type="button" data-case="${i}"><img src="${p.cover}" alt="" loading="lazy"><div><small>${p.year} · ${p.industry}</small><h3>${p.title}</h3><p>${p.sub}</p></div></button></li>`).join('');
  $('#fbWork').innerHTML = PROJECTS.map((p, i) => `<li><button type="button" data-case="${i}"><img src="${p.cover}" alt="${p.title}" loading="lazy"><h3>${p.title}</h3><p>${p.sub}</p></button></li>`).join('');
  $('#fbHall').innerHTML = HALL.map((h) => `<li><button type="button" data-lb="${h.src}" data-cap="${h.cap}"><img src="${h.src}" alt="${h.cap}" loading="lazy"></button></li>`).join('');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' });
  const tick = () => $$('[data-clock]').forEach((el) => { el.textContent = fmt.format(new Date()).toLowerCase(); });
  tick(); setInterval(tick, 20000);
}

// ---------------------------------------------------------------- loader
const L = { el: $('#loader'), count: $('#ldCount'), arc: $('.ld-arc'), logo: $('#ldLogo'), enter: $('#ldEnter'), lift: $('.ld-lift'), cap: $('#ldCap'), shown: 0, target: 0, t0: performance.now(), finished: false };
const floorLabel = (n) => String(Math.floor(n)).padStart(3, '0');
function loaderTick() {
  if (L.finished) return;
  const minT = REDUCED ? 1 : 2600;
  const cap = Math.min(100, ((performance.now() - L.t0) / minT) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + Math.max(0.35, (goal - L.shown) * 0.1));
  L.count.textContent = floorLabel(L.shown);
  L.arc.style.strokeDashoffset = 503 * (1 - L.shown / 100);
  if (L.shown >= 99.9 && L.target >= 100) { L.count.textContent = '100'; $('#ldArrow').classList.add('top'); L.cap.textContent = 'Top floor'; L.arc.style.strokeDashoffset = 0; L.finished = true; finishLoader(); return; }
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
  const prompt = () => { L.el.classList.add('prompt'); autoEnter = setTimeout(enter, 4200); };
  if (REDUCED) {
    html.classList.add('flown');
    gsap.set([L.lift, L.cap, '.ld-ring', L.logo], { opacity: 0 });
    gsap.set(L.enter, { autoAlpha: 1 });
    prompt();
    return;
  }
  gsap.set(navItems, { opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to([L.lift, L.cap], { opacity: 0, y: 8, duration: 0.45, stagger: 0.05 }, 0.55)
    .to('.ld-ring', { opacity: 0, scale: 1.12, duration: 0.7, ease: 'power2.out' }, '<')
    // the mark flies to the nav like a drop of liquid: it stretches along the path and settles
    .to(L.logo, { x: dx, y: dy, duration: 1.15, ease: 'expo.inOut' }, 0.55)
    .to(L.logo, { keyframes: [{ scaleX: 0.86, scaleY: 1.22, duration: 0.3, ease: 'power2.in' }, { scaleX: s * 0.9, scaleY: s * 1.35, duration: 0.45, ease: 'power2.inOut' }, { scaleX: s * 1.08, scaleY: s * 0.9, duration: 0.2, ease: 'power2.out' }, { scaleX: s, scaleY: s, duration: 0.45, ease: 'elastic.out(1, 0.45)' }] }, 0.55)
    .add(() => { html.classList.add('flown'); gsap.set(L.logo, { opacity: 0 }); }, 1.95)
    .to(navItems, { opacity: 1, duration: 0.7, stagger: 0.06 }, 1.8)
    .to(L.enter, { autoAlpha: 1, duration: 0.7 }, 1.9)
    .add(prompt);
}

// ---------------------------------------------------------------- enter
function enter() {
  if (state.entered || !L.finished) return;
  state.entered = true;
  clearTimeout(autoEnter);
  html.classList.add('entered');
  gsap.to(L.enter, { autoAlpha: 0, duration: D(0.35) });
  // the lift doors open onto the night
  L.el.classList.add('open');
  setTimeout(() => L.el.remove(), D(1600));
  if (state.gl) {
    gsap.to(G.post.uniforms.uFade, { value: 1, duration: D(1.8), ease: 'power2.out' });
    gsap.to(state, { intro: 1, duration: D(4.2), ease: 'power2.inOut' });
    setTimeout(() => G.mountain.ignite(), D(1100));
    gsap.to(state, { introVis: 1, duration: D(1.4), delay: D(2.2), ease: 'power2.out' });
    setTimeout(() => html.classList.add('ui'), D(2600));
    setTimeout(() => G.room.preload(), 2500);
    const deep = { '#work': 2, '#roots': 3, '#studio': 4, '#clicks': 5, '#thoughts': 6, '#about': 7, '#contact': 8 }[location.hash];
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
    const [{ createPost }, { createMountain }, { createRoom }, { createGallery }, { createLounge }, { createOcean }, { createStepwell }, { createCyclo }, { createNeon }] = await Promise.all([
      import('./post.js'), import('./scenes/mountain.js'), import('./scenes/room.js'), import('./scenes/gallery.js'), import('./scenes/lounge.js'), import('./scenes/ocean.js'),
      import('./scenes/stepwell.js'), import('./scenes/cyclo.js'), import('./scenes/neon.js'),
    ]);
    L.target = 8;
    const renderer = new THREE.WebGLRenderer({ canvas, context: ctx, antialias: false });
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    G.renderer = renderer;
    const mobile = isMobile() || TOUCH;
    G.mobile = mobile;
    G.post = createPost(renderer, { mobile });
    await Promise.race([
      Promise.all([document.fonts.load('300 64px Fraunces'), document.fonts.load('40px Telgra'), document.fonts.load('500 12px "JetBrains Mono"')]),
      sleep(3500),
    ]);
    L.target = 20; await sleep(16);
    G.mountain = createMountain(renderer, { mobile });
    L.target = 38; await sleep(16);
    G.room = createRoom(renderer, { mobile, projects: PROJECTS });
    L.target = 52; await sleep(16);
    G.stepwell = createStepwell(renderer, { mobile });
    L.target = 46; await sleep(16);
    G.cyclo = await createCyclo(renderer, { mobile, shots: STUDIO_SHOTS });
    L.target = 54; await sleep(16);
    G.gallery = createGallery(renderer, { mobile, photos: HALL });
    L.target = 62; await sleep(16);
    G.neon = await createNeon(renderer, { mobile, thoughts: THOUGHTS });
    L.target = 70; await sleep(16);
    G.lounge = await createLounge(renderer, { mobile });
    L.target = 76; await sleep(16);
    G.ocean = await createOcean(renderer, { mobile });
    L.target = 82;
    G.sets = [G.mountain, G.room, G.stepwell, G.cyclo, G.gallery, G.neon, G.lounge, G.ocean];
    G.comp = createCompanion(renderer);
    // the portal on the mountain is a window: the room renders into it
    G.portalRT = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true });
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
const locked = () => state.panel || state.menu || state.overlay;
function setupScroll() {
  lenis = new Lenis({ autoRaf: false, smoothWheel: true, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1, syncTouch: false });
  lenis.stop();
  lenis.on('scroll', (e) => {
    state.pRaw = e.limit > 0 ? clamp(e.scroll / e.limit) : 0;
    if (e.direction) lastDir = e.direction;
    if (!snapping) { clearTimeout(snapTimer); snapTimer = setTimeout(trySnap, 180); }
  });
  lenis.on('virtual-scroll', ({ deltaY }) => { if (deltaY) lastDir = Math.sign(deltaY); });
  addEventListener('wheel', () => { if (!state.entered) enter(); }, { passive: true });
  addEventListener('touchmove', () => { if (!state.entered) enter(); }, { passive: true });
}
function pickStop(p, dir) {
  let i = 0;
  while (i < NS - 2 && p > STOPS[i + 1]) i++;
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
  if (!state.entered || locked() || !lenis) return;
  if (Math.abs(lenis.velocity) > 0.5) { snapTimer = setTimeout(trySnap, 120); return; }
  goTo(pickStop(state.pRaw, lastDir), false);
}
function goTo(stopP, fromNav = true) {
  if (!lenis) return;
  const y = stopP * lenis.limit;
  const dist = Math.abs(y - lenis.scroll) / Math.max(1, lenis.limit);
  if (dist * lenis.limit < 1.5) return;
  snapping = true;
  clearTimeout(snapTimer);
  lenis.scrollTo(y, {
    duration: clamp(1.0 + dist * 2.4, 1.2, fromNav ? 3.2 : 2.0),
    easing: ease.inOut,
    lock: true,
    force: true,
    onComplete: () => {
      snapping = false;
      if (!REDUCED) { lenis.stop(); clearTimeout(cool); cool = setTimeout(() => { if (!locked()) lenis.start(); }, 420); }
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
    s: $$('.stage > .ov'),
    blur: $$('.stage > .ov').map((sec) => [...sec.children].filter((c) => !c.matches('.arrow, .posters, .sr-only, .fb-work, .fb-hall, .fb-portal'))),
    quad: $('#screenQuad'), prev: $('.arrow.prev'), next: $('.arrow.next'), workM: $('#workM'),
    posters: $$('.poster-hit'), cap: $('.s5-cap'), navLinks: $$('.nav-link'),
    siNum: $('#siNum'), siName: $('#siName'), chip: $('#chip'), chipText: $('#chipText'),
  });
  ui.s.forEach((el, i) => el.addEventListener('focusin', () => {
    if (!state.gl || (ui.v && ui.v[i] > 0.5)) return;
    if (!state.entered) enter();
    goTo(STOPS[i], true);
  }));
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
  ui.prev.addEventListener('click', () => { state.userPicked = true; stepProject(-1); });
  ui.next.addEventListener('click', () => { state.userPicked = true; stepProject(1); });
  $('#screenLink').addEventListener('click', () => openCase(projIdx));
  $('#wmOpen').addEventListener('click', () => openCase(projIdx));
  const link = $('#screenLink');
  link.addEventListener('pointerenter', () => { state.hoverScreen = true; showChip('Open case'); });
  link.addEventListener('pointerleave', () => { state.hoverScreen = false; hideChip(); });
  // the hall
  $('#hallPrev').addEventListener('click', () => { G.gallery?.step(-1); });
  $('#hallNext').addEventListener('click', () => { G.gallery?.step(1); });
  // posters
  ui.posters.forEach((b, i) => {
    b.addEventListener('click', () => openPanel(b.dataset.panel));
    b.addEventListener('pointerenter', () => { G.lounge?.setHover(i); showChip(`Open ${b.dataset.panel}`); });
    b.addEventListener('pointerleave', () => { G.lounge?.setHover(-1); hideChip(); });
    b.addEventListener('focus', () => G.lounge?.setHover(i));
    b.addEventListener('blur', () => G.lounge?.setHover(-1));
  });
  // delegated: case buttons, lightbox buttons, panel buttons
  document.addEventListener('click', (e) => {
    const pn = e.target.closest('[data-panel]:not(.poster-hit)'); if (pn) { openPanel(pn.dataset.panel); return; }
    const c = e.target.closest('[data-case]'); if (c) { openCase(+c.dataset.case); return; }
    const l = e.target.closest('[data-lb]'); if (l) { openLB(l.dataset.lb, l.dataset.cap); }
  });
  $('#caseX').addEventListener('click', closeCase);
  $('#lbX').addEventListener('click', closeLB);
  $('#lb').addEventListener('click', (e) => { if (e.target === $('#lb') || e.target.tagName === 'FIGURE') closeLB(); });
  $('#mailBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(LINKS.email); $('#mailHint').textContent = 'Copied. Talk soon.'; }
    catch (err) { location.href = `mailto:${LINKS.email}`; }
    setTimeout(() => { $('#mailHint').textContent = 'Click to copy'; }, 2600);
  });
  $('#panelBack').addEventListener('click', closePanel);
  $$('.panel-x').forEach((b) => b.addEventListener('click', closePanel));
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown, { passive: true });
  addEventListener('pointerup', onUp, { passive: true });
  addEventListener('wheel', onHallWheel, { passive: true });
  addEventListener('keydown', onKey);
  L.enter?.addEventListener('click', enter);
  L.el?.addEventListener('click', () => { if (L.el.classList.contains('prompt')) enter(); });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!state.gl) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
}

// ---------------------------------------------------------------- pointer: parallax, the hall, the ridge
const chip = { x: -300, y: -300, cx: -300, cy: -300, on: false };
const aim = { x: 0, y: 0 };
const mouse = { x: 0, y: 0, moved: false };
const drag = { on: false, x: 0, moved: 0 };
const hallActive = () => state.gl && ui.v && ui.v[5] > 0.6 && !locked();
const onUI = (t) => t.closest && t.closest('button, a, .panel, .menu, .case, .lb, .nav');
function onMove(e) {
  chip.x = e.clientX; chip.y = e.clientY;
  mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -((e.clientY / innerHeight) * 2 - 1); mouse.moved = e.pointerType === 'mouse';
  if (e.pointerType === 'mouse' && !REDUCED) { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }
  if (drag.on) {
    const dx = e.clientX - drag.x; drag.x = e.clientX; drag.moved += Math.abs(dx);
    G.gallery.drag((-dx / innerWidth) * (isMobile() ? 9 : 16));
    html.classList.add('dragging');
    return;
  }
  if (hallActive() && e.pointerType === 'mouse' && !onUI(e.target)) {
    const i = G.gallery.pick(mouse.x, mouse.y);
    if (i !== hallHover) { hallHover = i; G.gallery.setHover(i); if (i >= 0) showChip('View'); else hideChip(); }
  } else if (hallHover !== -1) { hallHover = -1; G.gallery?.setHover(-1); hideChip(); }
}
let hallHover = -1;
function onDown(e) {
  if (!hallActive() || onUI(e.target)) return;
  drag.on = true; drag.x = e.clientX; drag.moved = 0;
}
function onUp(e) {
  if (!drag.on) return;
  drag.on = false;
  html.classList.remove('dragging');
  if (drag.moved < 6) {
    const i = G.gallery.pick((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    if (i >= 0) openLB(HALL[i].src, HALL[i].cap);
  } else G.gallery.settle();
}
let hallWheelT = 0;
function onHallWheel(e) {
  if (!hallActive() || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  G.gallery.drag(e.deltaX * 0.012);
  clearTimeout(hallWheelT); hallWheelT = setTimeout(() => G.gallery.settle(), 220);
}
function onKey(e) {
  if (e.key === 'Escape') { if (state.overlay === 'lb') closeLB(); else if (state.overlay === 'case') closeCase(); else if (state.panel) closePanel(); else if (state.menu) closeMenu(); return; }
  if (!state.entered && L.finished && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown')) { e.preventDefault(); enter(); return; }
  if (state.panel || state.menu) { if (e.key === 'Tab') trapFocus(e); return; }
  if (state.overlay) return;
  if (!state.gl || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
  const d = e.key === 'ArrowRight' ? 1 : -1;
  if (ui.v[2] > 0.5) { state.userPicked = true; stepProject(d); }
  else if (ui.v[5] > 0.5) G.gallery.step(d);
}

// ---------------------------------------------------------------- projects
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
  set('#sqYear', pr.year, 420); set('#sqCat', pr.industry, 520);
  set('#sqLine', pr.sub, 820);
  $('#screenLinkLabel').textContent = `Open case study: ${pr.title}`;
  $('#wmCount').textContent = `${pad(i + 1)} / ${pad(n)}`;
  $('#wmYear').textContent = pr.year;
  set('#wmTitle', pr.title, 700);
  $('#wmLine').textContent = pr.sub;
  if (!instant) $('#projLive').textContent = `${pr.title}. ${pr.year}. ${pr.sub}`;
  autoT = 0;
}
const stepProject = (d) => showProject(projIdx + d);

function showChip(text) {
  if (TOUCH) return;
  chip.on = true;
  ui.chip.classList.add('on');
  scramble(ui.chipText, text.toUpperCase(), 420);
}
function hideChip() { chip.on = false; ui.chip?.classList.remove('on'); }

// ---------------------------------------------------------------- case study (full screen) + lightbox
function openCase(i) {
  const n = PROJECTS.length; i = ((i % n) + n) % n;
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % n];
  const el = $('#case'), sc = $('#caseScroll');
  sc.innerHTML = `<p class="cs-kick">Case study ${pad(i + 1)} / ${pad(n)}</p>
    <header class="cs-head"><div><h2 class="cs-title" id="caseTitle">${p.title}</h2><p class="cs-sub">${p.sub}</p></div>${p.url ? `<a class="pill pill-light cs-live" href="${p.url}" target="_blank" rel="noopener">Visit the live site</a>` : ''}</header>
    <div class="cs-media">${p.video ? `<video src="${p.video}" poster="${p.poster}" autoplay muted loop playsinline></video>` : `<img src="${p.cover}" alt="${p.title}">`}</div>
    <div class="cs-meta"><div><p>For</p><b>${p.client}</b></div><div><p>Role</p><b>${p.role}</b></div><div><p>Year</p><b>${p.year}</b></div><div><p>Services</p><b>${p.services.join(', ')}</b></div></div>
    <div class="cs-body">${p.body.map(([h, t]) => `<section><h3>${h}</h3><p>${t}</p></section>`).join('')}</div>
    ${p.credit ? `<p class="cs-credit">${p.credit}</p>` : ''}
    <button class="cs-next" type="button" data-case="${(i + 1) % n}"><span>Next case</span><b>${next.title}</b></button>`;
  sc.scrollTop = 0;
  if (state.panel) closePanel(true);
  if (state.overlay === 'case') { gsap.fromTo(sc, { opacity: 0 }, { opacity: 1, duration: D(0.5) }); return; }
  state.overlay = 'case';
  hideChip();
  lenis?.stop();
  G.room?.setPlaying(false);
  el.hidden = false;
  gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: D(1.0), ease: 'expo.inOut' });
  gsap.fromTo(sc.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.8), stagger: D(0.05), delay: D(0.45), ease: 'power3.out' });
  setTimeout(() => $('#caseX').focus({ preventScroll: true }), D(400));
}
function closeCase() {
  const el = $('#case');
  gsap.to(el, { yPercent: 100, duration: D(0.8), ease: 'expo.inOut', onComplete: () => { el.hidden = true; $('#caseScroll').innerHTML = ''; } });
  state.overlay = null;
  if (!locked()) lenis?.start();
}
function openLB(src, cap) {
  const lb = $('#lb'); $('#lbImg').src = src; $('#lbImg').alt = cap; $('#lbCap').textContent = cap;
  state.overlay = 'lb'; hideChip(); lenis?.stop();
  lb.hidden = false;
  gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: D(0.45) });
  gsap.fromTo('#lb figure', { scale: 0.94, y: 20 }, { scale: 1, y: 0, duration: D(0.7), ease: 'expo.out' });
}
function closeLB() {
  const lb = $('#lb');
  gsap.to(lb, { opacity: 0, duration: D(0.35), onComplete: () => { lb.hidden = true; } });
  state.overlay = state.overlay === 'lb' ? null : state.overlay;
  if (!locked()) lenis?.start();
}

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
  gsap.fromTo(el.querySelectorAll('.panel-top, .pa-face, .panel-h, .panel-lead, .panel-p, .roots li, .panel-sub, .xp li, .wins li, .beliefs li, .plist li, .shots, .panel-row'),
    { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.7), stagger: D(0.03), delay: D(0.18), ease: 'power3.out' });
  setTimeout(() => el.querySelector('.panel-x').focus({ preventScroll: true }), D(60));
}
function closePanel(keepLocked = false) {
  const el = state.panel;
  if (!el) return;
  const back = $('#panelBack');
  gsap.to(back, { opacity: 0, duration: D(0.4) });
  gsap.to(el, { xPercent: 100, duration: D(0.6), ease: 'expo.in', onComplete: () => { el.hidden = true; back.hidden = true; } });
  state.panel = null;
  if (keepLocked !== true && !locked()) lenis?.start();
  if (keepLocked !== true) lastFocus?.focus?.({ preventScroll: true });
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
  if (!locked()) lenis?.start();
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
  const k = G.mobile ? 0.4 : 0.6;
  G.portalRT.setSize(Math.max(4, Math.round(w * dpr * k)), Math.max(4, Math.round(h * dpr * k)));
  G.mountain.setWindow(G.portalRT.texture, w * dpr, h * dpr);
  G.sets.forEach((s) => s.applyAspect(w / h));
  G.comp.resize(w, h);
  G.mountain.setPx?.(dpr);
  lenis?.resize();
}

// ---------------------------------------------------------------- frame loop
let raf = 0, last = 0, clock = 0, menuShown = false;
function pickSets(p) {
  const s = G.sets;
  for (let i = 0; i < WINDOWS.length; i++) {
    const [a, b] = WINDOWS[i];
    if (p < a) return [s[i], null, 0, 0];
    if (p < b) { const m = smooth(a, b, p); return m > 0.999 ? [s[i + 1], null, 0, 0] : [s[i], s[i + 1], m, STYLES[i]]; }
  }
  return [s[s.length - 1], null, 0, 0];
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
  if ((state.menu && menuShown) || state.overlay === 'case') { last = now; lenis?.raf(now); return; }
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
  const [A, B, mix, style] = pickSets(p);
  A.update(dt, t, lq(A, p), state.intro);
  if (B) B.update(dt, t, lq(B, p), state.intro);
  const ex = (s) => s?.exposure ?? 1;
  G.post.uniforms.uExposure.value = B ? ex(A) + (ex(B) - ex(A)) * mix : ex(A);
  // the portal: while the mountain is on screen, the room renders through it
  if (A === G.mountain) {
    if (B !== G.room) G.room.update(dt, t, lq(G.room, p), state.intro);
    G.renderer.setRenderTarget(G.portalRT);
    G.renderer.render(G.room.scene, G.room.camera);
    G.mountain.setMouse(mouse.x, mouse.y, mouse.moved && p < 0.1 && !locked() ? 1 : 0, dt);
  }
  G.room.setPlaying(p < 0.272 && state.entered && !locked());
  G.post.uniforms.uTime.value = t;
  G.comp.update(dt, t, A, B, mix);
  G.post.render(A, B, mix, style, G.comp);
  updateOverlays(p, dt);
}

function updateOverlays(p, dt) {
  const w = innerWidth, h = innerHeight, mob = isMobile();
  const v = STOPS.map((s, i) => {
    const gp = i ? s - STOPS[i - 1] : 1, gn = i < NS - 1 ? STOPS[i + 1] - s : 2;
    const x = win(p, i ? s - 0.4 * gp : -1, i ? s - 0.12 * gp : -0.5, s + 0.12 * gn, s + 0.4 * gn);
    return i === 0 ? x * state.introVis : x;
  });
  ui.v = v;
  v.forEach((x, i) => setOv(i, x));

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
        const bottom = Math.max(q[2][1], q[3][1]);
        ui.prev.style.transform = `translate(${q[3][0] + 56}px, ${bottom + 70}px)`;
        ui.next.style.transform = `translate(${q[2][0] - 56}px, ${bottom + 70}px)`;
      } else {
        const off = Math.max(84, (rm[0] - lm[0]) * 0.1);
        ui.prev.style.transform = `translate(${Math.max(70, lm[0] - off)}px, ${lm[1]}px)`;
        ui.next.style.transform = `translate(${Math.min(w - 70, rm[0] + off)}px, ${rm[1]}px)`;
      }
    }
    if (!REDUCED && !state.userPicked && !state.hoverScreen && v[2] > 0.98 && !locked()) {
      autoT += dt;
      if (autoT > 9) stepProject(1);
    }
  }
  if (v[5] > 0) {
    const i = G.gallery.index;
    if (ui.hi !== i) { ui.hi = i; $('#hallNum').textContent = pad(i + 1); scramble($('#hallName'), HALL[i].cap, 500); }
  }
  if (v[7] > 0) {
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
  let active = -1; v.forEach((x, i) => { if (x > 0.5) active = i; });
  ui.navLinks.forEach((a) => a.classList.toggle('on', +a.dataset.go === active));
  let si = 0, best = 9;
  STOPS.forEach((s, i) => { const d = Math.abs(s - p); if (d < best) { best = d; si = i; } });
  if (ui.si !== si) { ui.si = si; ui.siNum.textContent = pad(si + 1); scramble(ui.siName, STOP_NAMES[si].toUpperCase(), 500); }
  ui.siEl ??= $('.scene-index');
  ui.siEl.style.opacity = p > 0.95 ? '0' : '';

  if (chip.on) {
    chip.cx = damp(chip.cx, chip.x + 18, 22, dt);
    chip.cy = damp(chip.cy, chip.y + 18, 22, dt);
    ui.chip.style.transform = `translate(${chip.cx.toFixed(1)}px, ${chip.cy.toFixed(1)}px)`;
  } else { chip.cx = chip.x + 18; chip.cy = chip.y + 18; }
}

// test hook (no UI)
window.__v17 = {
  state,
  go: (i) => goTo(STOPS[i], true),
  jump: (i) => { if (!lenis) return; clearTimeout(snapTimer); snapping = false; lenis.scrollTo(STOPS[i] * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = STOPS[i]; },
  jumpP: (p) => { if (!lenis) return; clearTimeout(snapTimer); snapping = true; lenis.scrollTo(p * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = p; setTimeout(() => { snapping = false; }, 60000); },
  enter: () => enter(),
  open: (i) => openCase(i),
  close: () => closeCase(),
  panel: (n) => openPanel(n),
  closePanel: () => closePanel(),
  hall: (d) => G.gallery.step(d),
  lb: (i) => openLB(HALL[i].src, HALL[i].cap),
};

boot();
