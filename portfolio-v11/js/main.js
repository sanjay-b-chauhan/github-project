import * as THREE from 'three';
import Lenis from 'lenis';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createPost } from './post.js';
import { createAudio } from './audio.js';
import { clamp, damp, smooth, ease, input, isMobile } from './util.js';
import { CASES, WORK, SECTIONS, STOP_SET, SET_FIRST, SKILLS, EXPERIENCE, GREETINGS } from './data.js';

const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const qs = new URLSearchParams(location.search);
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAST = STOP_SET.length - 1; // 7
const audio = createAudio();

const state = { p: 0, pRaw: 0, entered: false, gl: false, intro: 0, introT: -1, caseOpen: null, about: false, section: -1, set: -1, stop: 0, skill: 0, skillT: 0, skillHold: 0 };
let lenis = null;

// ---------------------------------------------------------------- static DOM
function fillDOM() {
  $('#skills').innerHTML = SKILLS.map((s, i) => `<li${i === 0 ? ' class="on"' : ''}><button type="button" data-skill="${i}"><b>${s.verb}</b><span>${s.cap}</span></button></li>`).join('');
  $('#threadList').innerHTML = SECTIONS.map((s, i) => `<li style="top:${(s.stop / LAST) * 100}%"><button type="button" data-go="${s.stop}" aria-label="${s.name}"><span>${pad(i + 1)} ${s.name}</span></button></li>`).join('');
  $('#xp').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><span>${o}</span><em>${y}</em></li>`).join('');
  $('#slats').innerHTML = '<i></i>'.repeat(isMobile() ? 5 : 9);
}

// ---------------------------------------------------------------- loader
const L = { el: $('#loader'), count: $('#ldCount'), arc: $('.ld-arc'), greet: $('#ldGreet'), shown: 0, target: 0, t0: performance.now(), done: false, g: 0 };
function loaderTick() {
  if (L.done) return;
  const minT = REDUCED ? 400 : 2600;
  const cap = Math.min(100, ((performance.now() - L.t0) / minT) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + Math.max(0.3, (goal - L.shown) * 0.09));
  L.count.textContent = Math.floor(L.shown);
  L.arc.style.strokeDashoffset = 503 * (1 - L.shown / 100);
  if (L.shown >= 99.9 && L.target >= 100) {
    L.done = true; L.count.textContent = '100'; L.arc.style.strokeDashoffset = 0;
    L.el.classList.add('ready');
    if (qs.has('enter')) setTimeout(() => enter(false), 50);
    return;
  }
  requestAnimationFrame(loaderTick);
}
const greetTimer = setInterval(() => {
  if (state.entered) { clearInterval(greetTimer); return; }
  L.greet.classList.add('swap');
  setTimeout(() => {
    L.g = (L.g + 1) % GREETINGS.length;
    L.greet.textContent = GREETINGS[L.g][0];
    L.greet.lang = L.g === 0 || L.g === 3 ? 'en' : L.g === 1 ? 'hi' : 'mr';
    L.greet.classList.remove('swap');
  }, 360);
}, 1100);

function enter(withSound) {
  if (state.entered || !L.done) return;
  state.entered = true;
  clearInterval(greetTimer);
  if (withSound) setSound(true);
  html.classList.remove('loading');
  L.el.classList.add('out');
  setTimeout(() => L.el.remove(), 1100);
  state.introT = 0;
  setTimeout(() => html.classList.add('ui'), REDUCED ? 0 : 1700);
  lenis?.start();
  const deep = { '#do': 1, '#work': 2, '#journey': 3, '#roots': 6, '#contact': 7 }[location.hash];
  const s = qs.has('s') ? clamp(+qs.get('s'), 0, LAST) : deep;
  if (s) setTimeout(() => (qs.has('s') ? jump(s) : goTo(s)), qs.has('s') ? 30 : 1400);
}

function setSound(v) {
  audio.toggle(v).then((on) => { $('#snd').setAttribute('aria-pressed', String(on)); });
}

// ---------------------------------------------------------------- boot
const G = { sets: [] };
async function boot() {
  fillDOM();
  requestAnimationFrame(loaderTick);
  const canvas = $('#gl');
  let gl = null;
  try { gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }); } catch (e) { gl = null; }
  if (!gl) return fallback();
  try {
    const mobile = isMobile() || TOUCH;
    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false });
    renderer.setClearColor(0x000000, 1);
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    G.renderer = renderer; G.mobile = mobile;
    G.post = createPost(renderer, { mobile });
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
    const texLoader = new THREE.TextureLoader();
    await Promise.race([document.fonts.load('400 200px Telgra'), sleep(3000)]);
    L.target = 12;
    const ctx = { env, mobile, audio, gltf, texLoader };
    const [{ createHello }, { createTools }, { createWork }, { createJourney }, { createRoots }, { createGround }] = await Promise.all([
      import('./sets/hello.js'), import('./sets/tools.js'), import('./sets/work.js'), import('./sets/journey.js'), import('./sets/roots.js'), import('./sets/ground.js'),
    ]);
    L.target = 20;
    const bump = (n) => () => { L.target = Math.min(96, L.target + n); };
    const hello = createHello(ctx);
    const work = createWork(ctx);
    L.target = 30;
    const [tools, journey, roots, ground] = await Promise.all([
      createTools(ctx).then((x) => { bump(16)(); return x; }),
      createJourney(ctx).then((x) => { bump(16)(); return x; }),
      createRoots(ctx).then((x) => { bump(16)(); return x; }),
      createGround(ctx).then((x) => { bump(16)(); return x; }),
    ]);
    Object.assign(G, { hello, tools, work, journey, roots, ground });
    G.sets = [hello, tools, work, journey, roots, ground];
    resize();
    for (const s of G.sets) { try { await renderer.compileAsync(s.scene, s.camera); } catch (e) { /* lazily */ } }
    state.gl = true;
    html.classList.add('gl');
    setupScroll();
    setupUI();
    setProject(0, true);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });
    last = performance.now();
    raf = requestAnimationFrame(frame);
    await sleep(80);
    L.target = 100;
  } catch (err) {
    console.error('WebGL scene failed, using the static page.', err);
    fallback();
  }
}

function fallback() {
  state.gl = false;
  cancelAnimationFrame(raf);
  html.classList.remove('gl', 'loading');
  html.classList.add('nogl', 'ui');
  L.done = true; L.el?.remove();
  const wk = $('.work-info');
  if (wk && !$('.nogl-list')) {
    wk.innerHTML = `<p class="micro orange">Work</p><ul class="nogl-list">${WORK.map((id) => { const c = CASES[id]; const img = c.media.poster || c.media.image; return `<li><a href="${c.url || '#'}" ${c.url ? 'target="_blank" rel="noopener"' : ''}><img src="${img}" alt="" loading="lazy"><b>${c.title}</b><span class="micro dim">${c.year} · ${c.kind}</span></a></li>`; }).join('')}</ul>`;
  }
  setupUI();
}

// ---------------------------------------------------------------- scroll + snapping
let snapTimer = 0, snapping = false, lastDir = 1, cool = 0;
function setupScroll() {
  lenis = new Lenis({ autoRaf: false, smoothWheel: true, lerp: REDUCED ? 1 : 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2, syncTouch: false });
  lenis.stop();
  lenis.on('scroll', (e) => {
    state.pRaw = e.limit > 0 ? clamp(e.scroll / e.limit) * LAST : 0;
    if (e.direction) lastDir = e.direction;
    if (!snapping) { clearTimeout(snapTimer); snapTimer = setTimeout(trySnap, 170); }
  });
  lenis.on('virtual-scroll', ({ deltaY }) => { if (deltaY) lastDir = Math.sign(deltaY); });
  addEventListener('wheel', () => { if (!state.entered && L.done) enter(false); }, { passive: true });
}
function pickStop(p, dir) {
  const a = Math.floor(p), b = Math.min(LAST, a + 1), f = p - a;
  if (f < 0.002) return a;
  if (f > 0.998) return b;
  const th = 0.07;
  return dir > 0 ? (f > th ? b : a) : (f < 1 - th ? a : b);
}
function trySnap() {
  if (!state.entered || state.caseOpen || state.about || !lenis) return;
  if (Math.abs(lenis.velocity) > 0.6) { snapTimer = setTimeout(trySnap, 110); return; }
  goTo(pickStop(state.pRaw, lastDir));
}
function goTo(stop) {
  if (!lenis) return;
  stop = clamp(Math.round(stop), 0, LAST);
  const y = (stop / LAST) * lenis.limit;
  const dist = Math.abs(stop - state.pRaw);
  if (Math.abs(y - lenis.scroll) < 1.5) return;
  snapping = true;
  clearTimeout(snapTimer);
  lenis.scrollTo(y, {
    duration: REDUCED ? 0 : clamp(1.0 + dist * 0.55, 1.05, 2.6), easing: ease.inOut, lock: true, force: true,
    onComplete: () => {
      snapping = false;
      if (!REDUCED) { lenis.stop(); clearTimeout(cool); cool = setTimeout(() => { if (!state.caseOpen && !state.about) lenis.start(); }, 380); }
    },
  });
  if (REDUCED) snapping = false;
}
function jump(stop) {
  if (!lenis) return;
  clearTimeout(snapTimer); snapping = false;
  lenis.scrollTo((stop / LAST) * lenis.limit, { immediate: true, force: true });
  state.pRaw = state.p = stop;
}
const curStop = () => clamp(Math.round(state.p), 0, LAST);

// ---------------------------------------------------------------- UI
const ui = {};
function setupUI() {
  if (ui.done) return;
  ui.done = true;
  Object.assign(ui, {
    ov: SECTIONS.map((s) => $('#' + s.id)),
    thread: $$('#threadList li'), fill: $('#threadFill'), bob: $('#threadBob'),
    idxNum: $('#idxNum'), idxName: $('#idxName'), cta: $('#cta'), chip: $('#chip'), chipT: $('#chipT'),
    skills: $$('#skills li'), city: $$('#city span'), cap: $$('#cityCap span'), steps: $$('#jSteps li'),
    gens: $$('#gens li'), labels: $$('.cube-label'), navWork: $('.nav-link[data-go="2"]'), navContact: $('.nav-link[data-go="7"]'),
  });
  $('#enterSound').addEventListener('click', () => enter(true));
  $('#enterQuiet').addEventListener('click', () => enter(false));
  $('#snd').addEventListener('click', () => setSound(!audio.on));
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    if (!state.gl) return;
    e.preventDefault();
    if (state.about) closeAbout();
    if (!state.entered) enter(false);
    goTo(+a.dataset.go);
  }));
  $('#aboutBtn').addEventListener('click', openAbout);
  $('#aboutX').addEventListener('click', closeAbout);
  $('#aboutBack').addEventListener('click', closeAbout);
  $('#skills').addEventListener('click', (e) => { const b = e.target.closest('[data-skill]'); if (b) pickSkill(+b.dataset.skill, true); });
  $('#skills').addEventListener('pointerenter', () => { state.skillHold = 1; });
  $('#skills').addEventListener('pointerleave', () => { state.skillHold = 0; });
  $('#wkPrev').addEventListener('click', () => stepProject(-1));
  $('#wkNext').addEventListener('click', () => stepProject(1));
  $('#wkOpen').addEventListener('click', () => openCase(WORK[G.work ? G.work.active : 0]));
  $('#caseX').addEventListener('click', closeCase);
  $('#casePrev').addEventListener('click', () => stepCase(-1));
  $('#caseNext').addEventListener('click', () => stepCase(1));
  $$('.pill, .arrow, .nav-link, .skills button').forEach((b) => b.addEventListener('pointerenter', () => audio.tickUI()));

  // pointer: parallax, drag to spin, click the 3D
  let down = null;
  addEventListener('pointermove', (e) => {
    input.ax = (e.clientX / innerWidth) * 2 - 1; input.ay = -((e.clientY / innerHeight) * 2 - 1);
    if (down && e.pointerId === down.id) { input.drag += e.clientX - down.x; down.moved += Math.abs(e.clientX - down.x); down.x = e.clientX; }
    chip.x = e.clientX; chip.y = e.clientY;
    hover(e);
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('a,button,.case,.about,#loader')) return;
    down = { id: e.pointerId, x: e.clientX, moved: 0 };
  });
  addEventListener('pointerup', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const moved = down.moved; down = null;
    if (moved > 6 || e.target.closest?.('a,button,.case,.about,#loader')) return;
    click3D(e);
  });
  addEventListener('keydown', onKey);
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!state.gl) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; G.work?.pauseAll(); }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
}

const ndc = new THREE.Vector2();
function ndcFrom(e) { ndc.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)); return ndc; }
function settledOn(stop) { return Math.abs(state.p - stop) < 0.08; }
function hover(e) {
  if (!state.gl || !state.entered || state.caseOpen || state.about || TOUCH) { hideChip(); return; }
  if (e.target.closest?.('a,button')) { hideChip(); return; }
  if (settledOn(2)) {
    const i = G.work.pick(ndcFrom(e));
    if (i >= 0) { showChip(i === G.work.active ? 'Open case' : 'View'); return; }
  } else if (settledOn(1)) { showChip('Drag to spin'); return; }
  hideChip();
}
function click3D(e) {
  if (!state.gl || !state.entered || state.caseOpen || state.about) return;
  if (settledOn(2)) {
    const i = G.work.pick(ndcFrom(e));
    if (i < 0) return;
    if (i === G.work.active) openCase(WORK[i]); else setProject(i);
  } else if (settledOn(0)) G.hello.pluck();
  else if (settledOn(1)) pickSkill((state.skill + 1) % SKILLS.length, true);
}
const chip = { x: -400, y: -400, cx: -400, cy: -400, on: false, text: '' };
function showChip(t) { if (chip.text !== t) { chip.text = t; ui.chipT.textContent = t; } if (!chip.on) { chip.on = true; ui.chip.classList.add('on'); } }
function hideChip() { if (chip.on) { chip.on = false; ui.chip?.classList.remove('on'); } }

function onKey(e) {
  if (e.key === 'Escape') { if (state.caseOpen) closeCase(); else if (state.about) closeAbout(); return; }
  if (!state.entered) { if (L.done && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); enter(false); } return; }
  if (state.caseOpen) { if (e.key === 'ArrowRight') stepCase(1); if (e.key === 'ArrowLeft') stepCase(-1); if (e.key === 'Tab') trap(e, $('#case')); return; }
  if (state.about) { if (e.key === 'Tab') trap(e, $('.about-in')); return; }
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(curStop() + 1); }
  else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(curStop() - 1); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(LAST); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const d = e.key === 'ArrowRight' ? 1 : -1;
    if (settledOn(2)) stepProject(d);
    else if (settledOn(1)) pickSkill((state.skill + d + SKILLS.length) % SKILLS.length, true);
  }
}
function trap(e, root) {
  const f = [...root.querySelectorAll('a[href], button:not([disabled])')].filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], lastEl = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
  else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
}

// ---------------------------------------------------------------- skills
function pickSkill(k, byUser = false) {
  state.skill = k; state.skillT = 0;
  if (byUser) state.skillHold = Math.max(state.skillHold, 0.5);
  ui.skills.forEach((li, i) => li.classList.toggle('on', i === k));
  G.tools?.setSkill(k);
}

// ---------------------------------------------------------------- projects
let autoT = 0;
function setProject(i, instant = false) {
  if (!G.work) return;
  i = G.work.setActive(i);
  const c = CASES[WORK[i]];
  $('#wkCount').textContent = `${pad(i + 1)} / ${pad(WORK.length)}`;
  $('#wkKind').textContent = `${c.year} · ${c.kind}`;
  const t = $('#wkTitle'), l = $('#wkLine');
  if (instant || REDUCED) { t.textContent = c.title; l.textContent = c.line; }
  else {
    t.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-14px)', filter: 'blur(6px)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
      t.textContent = c.title; l.textContent = c.line;
      t.animate([{ opacity: 0, transform: 'translateY(18px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 80, fill: 'backwards' });
    };
    audio.thread();
  }
  $('#wkLive').textContent = `${c.title}. ${c.year}. ${c.line}`;
  autoT = 0;
}
const stepProject = (d) => { autoT = -8; setProject(G.work.active + d); };

// ---------------------------------------------------------------- case viewer
let caseId = null, lastFocus = null;
function openCase(id) {
  const c = CASES[id]; if (!c) return;
  caseId = id;
  const el = $('#case');
  const media = $('#caseMedia');
  media.classList.toggle('contain', !!c.media.contain);
  media.innerHTML = c.media.video
    ? `<video src="${c.media.video}" poster="${c.media.poster || ''}" autoplay muted loop playsinline></video>`
    : `<img src="${c.media.image}" alt="${c.title}">`;
  $('#caseKind').textContent = `${c.year} · ${c.kind}`;
  $('#caseTitle').textContent = c.title;
  $('#caseLine').textContent = c.line;
  $('#caseDid').innerHTML = c.did.map((d) => `<li>${d}</li>`).join('');
  $('#caseCredit').textContent = c.credit || '';
  $('#caseCta').innerHTML = c.url ? `<a class="pill solid" href="${c.url}" target="_blank" rel="noopener">Open live</a>` : '';
  if (state.caseOpen) return;
  state.caseOpen = id;
  lastFocus = document.activeElement;
  lenis?.stop(); hideChip(); G.work?.pauseAll();
  audio.open();
  el.hidden = false;
  requestAnimationFrame(() => {
    el.classList.add('open');
    $$('#slats i').forEach((s, i) => { s.style.transitionDelay = `${i * 40}ms`; });
    setTimeout(() => { el.classList.add('show'); $('#caseX').focus({ preventScroll: true }); }, REDUCED ? 0 : 420);
  });
}
function closeCase() {
  if (!state.caseOpen) return;
  const el = $('#case');
  el.classList.remove('show');
  $$('#slats i').forEach((s, i, a) => { s.style.transitionDelay = `${(a.length - i) * 35}ms`; });
  setTimeout(() => el.classList.remove('open'), REDUCED ? 0 : 200);
  setTimeout(() => { el.hidden = true; $('#caseMedia').innerHTML = ''; }, REDUCED ? 0 : 1000);
  state.caseOpen = null;
  lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}
function stepCase(d) {
  const i = (WORK.indexOf(caseId) + d + WORK.length) % WORK.length;
  const body = $('.case-in');
  body.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 180, fill: 'forwards' }).onfinish = () => {
    openCase(WORK[i]); setProject(i, true);
    body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
  };
}

// ---------------------------------------------------------------- about
function openAbout() {
  if (state.about) return;
  state.about = true; lastFocus = document.activeElement;
  lenis?.stop(); hideChip();
  const el = $('#about'); el.hidden = false;
  requestAnimationFrame(() => el.classList.add('open'));
  setTimeout(() => $('#aboutX').focus({ preventScroll: true }), 60);
  audio.open();
}
function closeAbout() {
  if (!state.about) return;
  state.about = false;
  const el = $('#about'); el.classList.remove('open');
  setTimeout(() => { if (!state.about) el.hidden = true; }, REDUCED ? 0 : 800);
  if (!state.caseOpen) lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}

// ---------------------------------------------------------------- resize
function resize() {
  if (!G.renderer || !G.sets.length) return;
  const w = innerWidth, h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, G.mobile ? 1.5 : 1.6);
  G.renderer.setPixelRatio(dpr);
  G.renderer.setSize(w, h, false);
  G.post.resize(w, h, dpr);
  G.sets.forEach((s) => { s.applyAspect(w / h); s.setPx?.(dpr); });
  lenis?.resize();
}

// ---------------------------------------------------------------- frame
let raf = 0, last = 0, clock = 0;
const st = { intro: 0, visible: false, settled: false, reduced: REDUCED, ff: false };
const labelPos = [];
function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.08, Math.max(0, (now - last) / 1000));
  last = now;
  clock += REDUCED ? 0 : dt;
  lenis?.raf(now);
  state.p = REDUCED ? state.pRaw : damp(state.p, state.pRaw, 9, dt);
  if (Math.abs(state.p - state.pRaw) < 1e-4) state.p = state.pRaw;
  const p = state.p, t = REDUCED ? 12 : clock;

  // intro
  if (state.introT >= 0 && state.introT < 1) {
    state.introT = REDUCED ? 1 : Math.min(1, state.introT + dt / 3.4);
    state.intro = ease.inOut(state.introT);
  }
  G.post.uniforms.uFade.value = state.entered ? damp(G.post.uniforms.uFade.value, 1, 2.2, dt) : 0.0;
  input.x = damp(input.x, TOUCH ? 0 : input.ax, 2.6, dt);
  input.y = damp(input.y, TOUCH ? 0 : input.ay, 2.6, dt);
  input.vy = lenis ? lenis.velocity : 0;

  // which sets are on screen
  const i0 = clamp(Math.floor(p), 0, LAST - 1), f = p - i0;
  const sA = STOP_SET[i0], sB = STOP_SET[i0 + 1];
  let A = sA, B = -1, mix = 0;
  if (sB !== sA) {
    mix = ease.inOut(smooth(0.2, 0.8, f));
    if (mix >= 0.999) { A = sB; mix = 0; } else if (mix > 0.001) B = sB;
  } else if (f > 0.999) A = STOP_SET[i0 + 1];
  const setNow = mix > 0.5 ? B : A;
  if (setNow !== state.set) { if (state.set >= 0 && state.entered) audio.section(setNow); state.set = setNow; }
  st.intro = state.intro;
  const upd = (k) => {
    st.visible = true;
    st.settled = state.entered && Math.abs(p - Math.round(p)) < 0.03 && STOP_SET[Math.round(p)] === k;
    G.sets[k].update(dt, t, p - SET_FIRST[k], st);
  };
  upd(A); if (B >= 0) upd(B);
  // keep the roots reveal clock honest when roots is off screen
  if (A !== 4 && B !== 4) { st.visible = false; st.settled = false; G.roots.update(0, t, p - SET_FIRST[4], st); }
  if (A !== 2 && B !== 2) G.work.pauseAll();
  G.post.uniforms.uTime.value = t;
  G.post.render(G.sets[A], B >= 0 ? G.sets[B] : null, mix);

  audio.tick(dt, state.set === 5 ? 1 : 0);
  audio.breeze(state.set === 3 ? clamp(p - 4) : state.set === 5 ? 0.6 : 0);
  audio.drone(state.set === 5 ? 1 : 0);

  if (!state.entered || !ui.done) return;
  overlays(p, dt);
}

function overlays(p, dt) {
  const w = innerWidth, h = innerHeight;
  // section overlays
  SECTIONS.forEach((s, i) => {
    const a = s.stop, b = i === 3 ? 5 : a;
    const dist = Math.max(0, a - p, p - b);
    let v = 1 - smooth(0.03, 0.26, dist);
    if (i === 0) v *= smooth(0.45, 0.95, state.intro);
    const el = ui.ov[i];
    if (Math.abs((el._v ?? -1) - v) > 0.001) {
      el._v = v;
      el.style.opacity = v.toFixed(3);
      const dir = p < a ? 1 : -1;
      el.style.transform = v > 0.999 || REDUCED ? '' : `translateY(${(dir * (1 - v) * 36).toFixed(1)}px)`;
      el.style.filter = v > 0.999 || v < 0.002 || REDUCED ? '' : `blur(${((1 - v) * 10).toFixed(1)}px)`;
      const vis = v > 0.002; if (vis !== el._vis) { el._vis = vis; el.classList.toggle('vis', vis); }
      const live = v > 0.6; if (live !== el._live) { el._live = live; el.classList.toggle('live', live); }
    }
  });
  // thread progress + index
  const pr = p / LAST;
  ui.fill.style.height = `${(pr * 100).toFixed(2)}%`;
  ui.bob.style.top = `${(pr * 100).toFixed(2)}%`;
  let sec = 0; SECTIONS.forEach((s, i) => { if (p >= s.stop - 0.5) sec = i; });
  if (sec !== state.section) {
    state.section = sec;
    ui.thread.forEach((li, i) => li.classList.toggle('on', i === sec));
    ui.idxNum.textContent = pad(sec + 1);
    ui.idxName.textContent = SECTIONS[sec].name;
    ui.navWork.classList.toggle('on', sec === 2);
    ui.navContact.classList.toggle('on', sec === 5);
  }
  ui.cta.classList.toggle('hide', p > 6.4);

  // what i do: advance on its own unless the visitor is choosing
  if (settledOn(1) && !REDUCED) {
    state.skillHold = Math.max(0, state.skillHold - dt * 0.08);
    if (state.skillHold <= 0.001) { state.skillT += dt; if (state.skillT > 3.4) pickSkill((state.skill + 1) % SKILLS.length); }
  }
  // work: gentle auto advance
  if (settledOn(2) && !REDUCED && !state.caseOpen) { autoT += dt; if (autoT > 9) setProject(G.work.active + 1); } else autoT = Math.min(autoT, 0);
  // journey
  if (p > 2.4 && p < 5.6) {
    const k = clamp(Math.round(p - 3), 0, 2);
    if (k !== ui.jk) { ui.jk = k; [ui.city, ui.cap, ui.steps].forEach((arr) => arr.forEach((e, i) => e.classList.toggle('on', i === k))); }
  }
  // roots
  if (p > 5.2 && p < 7) {
    const lit = G.roots.lit();
    ui.gens.forEach((li, i) => li.classList.toggle('on', lit[i]));
    G.roots.labels(w, h, labelPos);
    ui.labels.forEach((el, i) => { el.style.transform = `translate(${labelPos[i][0].toFixed(1)}px, ${(labelPos[i][1] + 14).toFixed(1)}px) translateX(-50%)`; el.classList.toggle('on', lit[i]); });
  }
  // chip
  if (chip.on) {
    chip.cx = damp(chip.cx, chip.x + 16, 20, dt); chip.cy = damp(chip.cy, chip.y + 16, 20, dt);
    ui.chip.style.transform = `translate(${chip.cx.toFixed(1)}px, ${chip.cy.toFixed(1)}px)`;
  } else { chip.cx = chip.x + 16; chip.cy = chip.y + 16; }
}

// test hook (no UI)
window.__v11 = {
  state, go: (i) => goTo(i), jump: (i) => jump(i),
  jumpP: (p) => { if (!lenis) return; clearTimeout(snapTimer); snapping = true; lenis.scrollTo((p / LAST) * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = p; setTimeout(() => { snapping = false; }, 60000); },
  enter: (s) => enter(!!s), ff: (v = true) => { st.ff = v; }, open: (id) => openCase(id), close: () => closeCase(), about: () => openAbout(), skill: (k) => pickSkill(k, true), project: (i) => setProject(i),
};

boot();
