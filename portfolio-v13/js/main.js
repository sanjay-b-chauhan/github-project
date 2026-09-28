import * as THREE from 'three';
import Lenis from 'lenis';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createPost } from './post.js';
import { createAudio } from './audio.js';
import { createRippleView } from './ripple.js';
import { initTex } from './tex.js';
import { clamp, damp, smooth, ease, input, isMobile } from './util.js';
import { PROJECTS, SECTIONS, STOP_SET, SET_FIRST, SET_LAST, SKILLS, EXPERIENCE, GREETINGS } from './data.js';

// Sanjay Chauhan Designs, v13. A quiet loader (one mark in a thin ring), then the thread drops from
// the nav into the name and the story runs from the top to the ground in six full-bleed sections.
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const qs = new URLSearchParams(location.search);
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAST = STOP_SET.length - 1; // 11
const audio = createAudio();
html.classList.add('loading');

const state = { p: 0, pRaw: 0, mode: 'loader', entered: false, gl: false, intro: 0, introT: -1, since: -1, section: -1, set: -1, about: false, menu: false, userPicked: false };
let lenis = null;
const G = { sets: [] };

// ---------------------------------------------------------------- static content
function fillDOM() {
  $('#steps').innerHTML = SKILLS.map((s, i) => `<li class="step ${i % 2 ? 'step-r' : 'step-l'}"><span class="n">${pad(i + 1)} / ${pad(SKILLS.length)}</span><h3>${s.h}</h3><p>${s.p}</p></li>`).join('');
  $('#xpList').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><em>${y}</em><span>${o}</span></li>`).join('');
  $('#ticks').innerHTML = '<i></i>'.repeat(28);
  let s = '';
  for (let k = 0; k < 16; k++) {
    const a = (k * 360) / 16, big = k % 2 === 0;
    const w = big ? 38 : 24, h = (w * 301.009) / 424.098, R = big ? 104 : 100;
    s += `<g transform="translate(150 150) rotate(${a}) translate(0 ${-R})"><use href="#sb-big" x="${-w / 2}" y="${-h}" width="${w}" height="${h}"/></g>`;
  }
  s += '<circle cx="150" cy="150" r="136" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 7" opacity=".7"/>';
  $('#ringRot').innerHTML = s;
}

// ---------------------------------------------------------------- loader: one mark in a thin ring
const L = { el: $('#loader'), num: $('#ldNum'), arc: $('#ldArc'), mark: $('#ldMark'), enter: $('#ldEnter'), greet: $('#ldGreet'), shown: 0, target: 0, t0: performance.now(), last: performance.now(), ready: false, want: false, g: 0, prompt: false };
function loaderTick() {
  if (state.entered || L.ready) return;
  const now = performance.now();
  const dt = Math.min(0.25, (now - L.last) / 1000); L.last = now;
  const cap = Math.min(100, ((now - L.t0) / (REDUCED ? 1 : 2600)) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + (goal - L.shown) * (1 - Math.exp(-dt * 5)) + (goal > L.shown ? dt * 8 : 0));
  const v = Math.min(100, Math.round(L.shown));
  const txt = String(v).padStart(3, '0');
  if (L.num.textContent !== txt) L.num.textContent = txt;
  L.arc.style.strokeDashoffset = (503 * (1 - L.shown / 100)).toFixed(1);
  if (v >= 100 && L.target >= 100) { L.ready = true; land(); return; }
  requestAnimationFrame(loaderTick);
}
const greetTimer = setInterval(() => {
  if (L.ready) { clearInterval(greetTimer); return; }
  L.greet.classList.add('swap');
  setTimeout(() => { L.g = (L.g + 1) % GREETINGS.length; L.greet.textContent = GREETINGS[L.g][0]; L.greet.lang = GREETINGS[L.g][1]; L.greet.classList.remove('swap'); }, 380);
}, 1150);
// the counter and ring step back, the mark flies up into the nav, then we ask for a click
function land() {
  L.el.classList.add('done');
  const nl = $('.nav-logo').getBoundingClientRect(), mb = L.mark.getBoundingClientRect();
  const dx = nl.left + nl.width / 2 - (mb.left + mb.width / 2), dy = nl.top + nl.height / 2 - (mb.top + mb.height / 2), sc = nl.width / mb.width;
  const fly = REDUCED ? 0 : 1150;
  setTimeout(() => {
    L.mark.style.transition = `transform ${fly}ms cubic-bezier(.83,0,.17,1), filter ${fly}ms`;
    L.mark.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
  }, REDUCED ? 0 : 320);
  setTimeout(() => {
    html.classList.add('flown', 'navin');
    L.mark.style.opacity = '0';
    L.el.classList.add('prompt');
    L.prompt = true;
    if (L.want || qs.has('enter')) enter();
  }, REDUCED ? 0 : 320 + fly + 60);
}
function askEnter(e) {
  if (state.entered) return;
  if (e && e.type === 'keydown' && !['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) return;
  if (e && e.type === 'keydown') e.preventDefault();
  if (L.prompt) enter(); else L.want = true;
}

// ---------------------------------------------------------------- enter: the thread drops into the name
function enter() {
  if (state.entered || !L.prompt) return;
  state.entered = true;
  if (!qs.has('quiet')) setSound(true);
  L.el.classList.add('out');
  setTimeout(() => { L.el.style.display = 'none'; }, REDUCED ? 0 : 1000);
  startSite();
}
function startSite() {
  state.mode = 'site';
  html.classList.remove('loading');
  resize();
  state.since = 0; state.introT = 0;
  setTimeout(() => html.classList.add('name-in'), REDUCED ? 0 : 1000);
  setTimeout(() => html.classList.add('hero-bot-in'), REDUCED ? 0 : 2500);
  setTimeout(() => html.classList.add('ui'), REDUCED ? 0 : 2800);
  lenis?.start();
  const deep = { '#do': 1, '#work': 6, '#journey': 7, '#roots': 10, '#contact': 11 }[location.hash];
  const s = qs.has('s') ? clamp(+qs.get('s'), 0, LAST) : deep;
  if (s) setTimeout(() => (qs.has('s') ? jump(s) : goTo(s)), qs.has('s') ? 30 : 2200);
}
function setSound(v) { audio.toggle(v).then((on) => $('#snd').setAttribute('aria-pressed', String(on))); }

// ---------------------------------------------------------------- boot
async function boot() {
  fillDOM();
  requestAnimationFrame(loaderTick);
  Promise.race([document.fonts.load('400 40px Telgra'), document.fonts.load('400 15px "Noto Sans Devanagari"'), sleep(2500)]).then(() => L.el.classList.add('fonts'));
  const canvas = $('#gl');
  let gl = null;
  try { gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }); } catch (e) { gl = null; }
  if (!gl) return fallback();
  try {
    const mobile = isMobile() || TOUCH;
    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 1);
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    G.renderer = renderer; G.mobile = mobile;
    initTex(renderer, { mobile });
    G.post = createPost(renderer, { mobile });
    state.gl = true;
    html.classList.add('gl');
    resize();
    last = performance.now();
    raf = requestAnimationFrame(frame);
    L.target = 10;
    const { makeEnv, createBeam } = await import('./sets/beam.js');
    const env = makeEnv(renderer);
    const pm = new THREE.PMREMGenerator(renderer);
    const neutral = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
    const texLoader = new THREE.TextureLoader();
    await Promise.race([Promise.all(['400 40px Telgra', '400 64px "Instrument Serif"', '400 16px "Inter Tight"'].map((f) => document.fonts.load(f))), sleep(3000)]);
    const ctx = { renderer, env, neutral, mobile, audio, gltf, texLoader };
    const [{ createHello }, { createWork }, { createJourney }, { createRoots }, { createGround }] = await Promise.all([
      import('./sets/hello.js'), import('./sets/work.js'), import('./sets/journey.js'), import('./sets/roots.js'), import('./sets/ground.js'),
    ]);
    L.target = 24;
    const hello = createHello(ctx), beam = createBeam(ctx), work = createWork(ctx);
    L.target = 40;
    const bump = (x) => { L.target = Math.min(94, L.target + 18); return x; };
    const [journey, roots, ground] = await Promise.all([createJourney(ctx).then(bump), createRoots(ctx).then(bump), createGround(ctx).then(bump)]);
    Object.assign(G, { hello, beam, work, journey, roots, ground });
    G.sets = [hello, beam, work, journey, roots, ground];
    resize();
    for (const s of G.sets) { try { await renderer.compileAsync(s.scene, s.camera); } catch (e) { /* lazily */ } }
    G.rv = createRippleView({
      renderer, projects: PROJECTS, reduce: REDUCED, coarse: TOUCH, mobile,
      dom: { root: $('#rv'), body: $('#rvBody'), scroll: $('#rvScroll'), close: $('#rvClose'), tagT: $('#rvTagT'), tagB: $('#rvTagB'), court: $('#court'), imgA: $('#rvImgA'), imgB: $('#rvImgB') },
      onOpen: () => { lenis?.stop(); html.classList.add('rv-open'); hideChip(); G.work.pauseAll(); audio.open(); },
      onSwap: (i) => setProject(i, true),
      onClose: () => { html.classList.remove('rv-open', 'rv-cover'); clearMask(ui.stage); if (!state.about && !state.menu) lenis?.start(); },
    });
    G.rv.resize(innerWidth, innerHeight);
    setupScroll();
    setupUI();
    setProject(0, true);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });
    html.classList.add('booted');
    window.__v13Booted = true; clearTimeout(window.__fs);
    await sleep(40);
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
  html.classList.add('nogl', 'booted', 'entered', 'ui', 'name-in');
  L.el?.remove(); html.classList.add('flown', 'navin');
  window.__v13Booted = true; clearTimeout(window.__fs);
  setupUI();
  setProject(0, true);
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
}
function pickStop(p, dir) {
  const a = Math.floor(p), b = Math.min(LAST, a + 1), f = p - a;
  if (f < 0.002) return a;
  if (f > 0.998) return b;
  return dir > 0 ? (f > 0.07 ? b : a) : (f < 0.93 ? a : b);
}
function trySnap() {
  if (!state.entered || state.about || state.menu || G.rv?.active || !lenis) return;
  if (Math.abs(lenis.velocity) > 0.6) { snapTimer = setTimeout(trySnap, 110); return; }
  goTo(pickStop(state.pRaw, lastDir));
}
function goTo(stop) {
  if (!lenis) return;
  stop = clamp(Math.round(stop), 0, LAST);
  const y = (stop / LAST) * lenis.limit;
  if (Math.abs(y - lenis.scroll) < 1.5) return;
  const dist = Math.abs(stop - state.pRaw);
  snapping = true; clearTimeout(snapTimer);
  lenis.scrollTo(y, {
    duration: REDUCED ? 0 : clamp(1.05 + dist * 0.4, 1.1, 2.6), easing: ease.inOut, lock: true, force: true,
    onComplete: () => {
      snapping = false;
      if (!REDUCED) { lenis.stop(); clearTimeout(cool); cool = setTimeout(() => { if (!state.about && !state.menu && !G.rv?.active) lenis.start(); }, 360); }
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
const settledOn = (stop) => Math.abs(state.p - stop) < 0.08;

// ---------------------------------------------------------------- UI
const ui = {};
function setupUI() {
  if (ui.done) return;
  ui.done = true;
  Object.assign(ui, {
    stage: $('#stage'), ov: SECTIONS.map((s) => $('#' + s.id)), steps: $$('#steps .step'),
    quad: $('#screenQuad'), prev: $('#wkPrev'), next: $('#wkNext'), workM: $('#workM'),
    place: $$('#c4h span'), cap: $$('#placeCap span'), gens: $$('#gens li'), labels: $$('.cube-label'),
    hudNum: $('#hudNum'), hudName: $('#hudName'), ticks: $$('#ticks i'), chip: $('#chip'), chipText: $('#chipText'), rThread: $('#rThread'),
    navWork: $('.nl-work'), navContact: $('.nl-contact'),
  });
  L.el?.addEventListener('click', askEnter);
  addEventListener('keydown', (e) => { if (!state.entered) askEnter(e); });
  addEventListener('wheel', () => { if (!state.entered && L.ready) enter(); }, { passive: true });
  $('#snd').addEventListener('click', () => setSound(!audio.on));
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    if (!state.gl) return;
    e.preventDefault();
    if (state.menu) closeMenu(true);
    if (state.about) closeAbout();
    goTo(+a.dataset.go);
  }));
  $('.nav-menu').addEventListener('click', () => (state.menu ? closeMenu() : openMenu()));
  $('#aboutBtn').addEventListener('click', openAbout);
  $('#panelBack').addEventListener('click', closeAbout);
  $('#panel-about .panel-x').addEventListener('click', closeAbout);
  ui.prev.addEventListener('click', () => stepProject(-1));
  ui.next.addEventListener('click', () => stepProject(1));
  $('#screenLink').addEventListener('click', (e) => openProject(G.work.active, e.detail === 0 ? innerWidth / 2 : e.clientX, e.detail === 0 ? innerHeight / 2 : e.clientY, e.currentTarget));
  $('#screenLink').addEventListener('pointerenter', () => showChip('Open case'));
  $('#screenLink').addEventListener('pointerleave', hideChip);
  $('#wmOpen').addEventListener('click', (e) => openProject(G.work.active, innerWidth / 2, innerHeight / 2, e.currentTarget));
  $$('.pill, .arrow, .nav-link, .ring, .reach a').forEach((b) => b.addEventListener('pointerenter', () => audio.tickUI()));

  let down = null;
  addEventListener('pointermove', (e) => {
    input.ax = (e.clientX / innerWidth) * 2 - 1; input.ay = -((e.clientY / innerHeight) * 2 - 1);
    chip.x = e.clientX; chip.y = e.clientY;
  }, { passive: true });
  addEventListener('pointerdown', (e) => { if (!e.target.closest?.('a,button,#rv,.panel,.menu,#loader')) down = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 6 || !state.gl || state.mode !== 'site' || G.rv?.active) return;
    if (settledOn(0)) G.hello.pluck();
  });
  addEventListener('keydown', onKey);
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!state.gl) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; G.work?.pauseAll(); }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
}
function onKey(e) {
  if (!state.entered) return;
  if (G.rv?.onKey(e)) return;
  if (e.key === 'Escape') { if (state.about) closeAbout(); else if (state.menu) closeMenu(); return; }
  if (state.about || state.menu) return;
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(curStop() + 1); }
  else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(curStop() - 1); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(LAST); }
  else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && settledOn(6)) stepProject(e.key === 'ArrowRight' ? 1 : -1);
}

// chip
const chip = { x: -400, y: -400, cx: -400, cy: -400, on: false };
function showChip(t) { if (TOUCH) return; ui.chipText.textContent = t; chip.on = true; ui.chip.classList.add('on'); }
function hideChip() { chip.on = false; ui.chip?.classList.remove('on'); }

// projects
let autoT = 0;
function setProject(i, instant = false) {
  if (!G.work && state.gl) return;
  if (G.work) i = G.work.setActive(i); else i = ((i % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
  const pj = PROJECTS[i], n = PROJECTS.length;
  const count = `${pad(i + 1)} / ${pad(n)}`;
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('#sqCount', count); set('#sqTitle', pj.title); set('#sqTag1', pj.tags[0]); set('#sqTag2', pj.tags[1]); set('#sqYear', pj.year); set('#sqStory', pj.story); set('#sqClose', pj.close);
  set('#wmCount', count); set('#wmYear', pj.year); set('#wmTitle', pj.title); set('#wmLine', pj.story); set('#wmClose', pj.close);
  set('#screenLinkLabel', `Open case: ${pj.title}`);
  if (!instant) {
    set('#projLive', `${pj.title}. ${pj.year}. ${pj.story} ${pj.close}`);
    if (!REDUCED) [$('#screenQuad'), $('#workM')].forEach((el) => el?.animate([{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 700, easing: 'cubic-bezier(.19,1,.22,1)' }));
    audio.thread();
  }
  autoT = 0;
}
function stepProject(d) { state.userPicked = true; autoT = 0; setProject(G.work.active + d); }
function openProject(i, x, y, trig) { if (!G.rv || G.rv.isOpen) return; state.userPicked = true; G.rv.open(i, x, y, trig); }
function setMask(el, m) { el.style.webkitMaskImage = m; el.style.maskImage = m; el._masked = true; }
function clearMask(el) { if (!el || !el._masked) return; el.style.webkitMaskImage = ''; el.style.maskImage = ''; el.style.opacity = ''; el._masked = false; }

// about + menu
let lastFocus = null;
function openAbout() {
  if (state.about) return;
  state.about = true; lastFocus = document.activeElement;
  lenis?.stop(); hideChip();
  const p = $('#panel-about'), b = $('#panelBack');
  p.hidden = false; b.hidden = false; html.classList.add('panel-open');
  requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('open')));
  setTimeout(() => $('#panel-about .panel-x').focus({ preventScroll: true }), 80);
  audio.open();
}
function closeAbout() {
  if (!state.about) return;
  state.about = false;
  const p = $('#panel-about'), b = $('#panelBack');
  p.classList.remove('open'); html.classList.remove('panel-open');
  setTimeout(() => { if (!state.about) { p.hidden = true; b.hidden = true; } }, REDUCED ? 0 : 700);
  if (!state.menu) lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}
function openMenu() {
  state.menu = true; lastFocus = document.activeElement;
  const m = $('#menu'); m.hidden = false;
  html.classList.add('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'true'); $('.nav-menu').setAttribute('aria-label', 'Close menu');
  lenis?.stop();
  requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('open')));
  setTimeout(() => m.querySelector('a').focus({ preventScroll: true }), 300);
}
function closeMenu(fromLink = false) {
  state.menu = false;
  const m = $('#menu'); m.classList.remove('open');
  html.classList.remove('menu-open');
  $('.nav-menu').setAttribute('aria-expanded', 'false'); $('.nav-menu').setAttribute('aria-label', 'Open menu');
  setTimeout(() => { if (!state.menu) m.hidden = true; }, REDUCED ? 0 : 800);
  if (!state.about) lenis?.start();
  if (!fromLink) $('.nav-menu').focus({ preventScroll: true });
}

// ---------------------------------------------------------------- resize
function resize() {
  if (!G.renderer) return;
  const w = innerWidth, h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, G.mobile ? 1.5 : 1.6);
  G.renderer.setPixelRatio(dpr);
  G.renderer.setSize(w, h, false);
  G.post.resize(w, h, dpr);
  G.sets.forEach((s) => { s.applyAspect(w / h); s.setPx?.(dpr); });
  G.rv?.resize(w, h);
  lenis?.resize();
}

// ---------------------------------------------------------------- frame
let raf = 0, last = 0, clock = 0;
const st = { intro: 0, since: -1, visible: false, settled: false, reduced: REDUCED, ff: false };
const labelPos = [];
function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.08, Math.max(0, (now - last) / 1000));
  last = now;
  clock += REDUCED ? 0 : dt;
  const t = REDUCED ? 12 : clock;
  if (state.mode === 'loader') return;
  lenis?.raf(now);
  if (state.menu) return;
  state.p = REDUCED ? state.pRaw : damp(state.p, state.pRaw, 9, dt);
  if (Math.abs(state.p - state.pRaw) < 1e-4) state.p = state.pRaw;
  const p = state.p;
  if (state.introT >= 0 && state.introT < 1) { state.introT = REDUCED ? 1 : Math.min(1, state.introT + dt / 3.2); state.intro = ease.inOut(state.introT); }
  if (state.since >= 0) state.since += REDUCED ? 10 : dt;
  G.post.uniforms.uFade.value = damp(G.post.uniforms.uFade.value, 1, 2.4, dt);
  input.x = damp(input.x, TOUCH ? 0 : input.ax, 2.6, dt);
  input.y = damp(input.y, TOUCH ? 0 : input.ay, 2.6, dt);
  input.vy = lenis ? lenis.velocity : 0;
  G.rv?.update(dt);

  const cover = G.rv?.fullCover();
  const i0 = clamp(Math.floor(p), 0, LAST - 1), f = p - i0;
  const sA = STOP_SET[i0], sB = STOP_SET[i0 + 1];
  let A = sA, B = -1, mix = 0;
  if (sB !== sA) {
    mix = ease.inOut(smooth(0.2, 0.8, f));
    if (mix >= 0.999) { A = sB; mix = 0; } else if (mix > 0.001) B = sB;
  } else if (f > 0.999) A = STOP_SET[i0 + 1];
  const setNow = mix > 0.5 ? B : A;
  if (setNow !== state.set) { if (state.set >= 0) audio.section(setNow); state.set = setNow; }
  if (!cover) {
    st.intro = state.intro; st.since = state.since;
    const upd = (k) => {
      st.visible = true;
      const r = Math.round(p);
      st.settled = Math.abs(p - r) < 0.03 && STOP_SET[r] === k;
      G.sets[k].update(dt, t, p - SET_FIRST[k], st);
    };
    upd(A); if (B >= 0) upd(B);
    if (A !== 4 && B !== 4) { st.visible = false; st.settled = false; G.roots.update(0, t, p - SET_FIRST[4], st); }
    if (A !== 2 && B !== 2) G.work.pauseAll();
    G.post.uniforms.uTime.value = t;
    G.post.render(G.sets[A], B >= 0 ? G.sets[B] : null, mix);
  }
  G.rv?.render();
  if (ui.done) overlays(p, dt);
}

function overlays(p, dt) {
  const w = innerWidth, h = innerHeight, mob = isMobile();
  // sections
  const vis = SECTIONS.map((s, i) => {
    const a = SET_FIRST[i], b = SET_LAST[i];
    const dist = Math.max(0, a - p, p - b);
    let v = 1 - smooth(0.03, 0.26, dist);
    if (i === 0) v *= state.intro > 0.05 ? 1 : 0;
    const el = ui.ov[i];
    if (Math.abs((el._v ?? -1) - v) > 0.001) {
      el._v = v;
      el.style.opacity = v.toFixed(3);
      el.style.transform = v > 0.999 || REDUCED ? '' : `translateY(${((p < a ? 1 : -1) * (1 - v) * 34).toFixed(1)}px)`;
      el.style.filter = v > 0.999 || v < 0.002 || REDUCED || i === 1 ? '' : `blur(${((1 - v) * 10).toFixed(1)}px)`;
      const on = v > 0.002; if (on !== el._vis) { el._vis = on; el.classList.toggle('vis', on); }
      const live = v > 0.6; if (live !== el._live) { el._live = live; el.classList.toggle('live', live); }
    }
    return v;
  });
  // what i do: one step per skill, sliding in from its side
  if (vis[1] > 0) ui.steps.forEach((el, k) => {
    const d = p - (1 + k);
    const v = 1 - smooth(0.1, 0.46, Math.abs(d));
    const side = k % 2 ? 1 : -1;
    el.style.opacity = v.toFixed(3);
    el.style.transform = `translate3d(${(side * (1 - v) * 40).toFixed(1)}px, ${(-d * 70).toFixed(1)}px, 0)`;
    el.style.filter = v > 0.99 || REDUCED ? '' : `blur(${((1 - v) * 8).toFixed(1)}px)`;
  });
  // work: the title rides on the hanging frame
  if (vis[2] > 0 && G.work) {
    const q = G.work.screenQuad(w, h);
    if (!mob) {
      const m = quadMatrix(1000, 625, q[0], q[1], q[2], q[3]);
      if (m) ui.quad.style.transform = m;
      const lm = [(q[0][0] + q[3][0]) / 2, (q[0][1] + q[3][1]) / 2], rm = [(q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2];
      const off = Math.max(80, (rm[0] - lm[0]) * 0.1);
      ui.prev.style.transform = `translate(${Math.max(64, lm[0] - off).toFixed(1)}px, ${lm[1].toFixed(1)}px)`;
      ui.next.style.transform = `translate(${Math.min(w - 64, rm[0] + off).toFixed(1)}px, ${rm[1].toFixed(1)}px)`;
    } else {
      const bottom = Math.max(q[2][1], q[3][1]);
      const top = Math.min(bottom + 26, h - 260);
      ui.workM.style.transform = `translateY(${top.toFixed(1)}px)`;
      ui.prev.style.transform = `translate(${(q[3][0] + 34).toFixed(1)}px, ${(Math.min(q[0][1], q[1][1]) - 40).toFixed(1)}px)`;
      ui.next.style.transform = `translate(${(q[2][0] - 34).toFixed(1)}px, ${(Math.min(q[0][1], q[1][1]) - 40).toFixed(1)}px)`;
      const scr = $('#screenLink');
      const m = quadMatrix(1000, 625, q[0], q[1], q[2], q[3]); if (m) ui.quad.style.transform = m;
      scr.style.pointerEvents = 'auto';
    }
    if (!REDUCED && !state.userPicked && settledOn(6) && !G.rv?.active) { autoT += dt; if (autoT > 8) setProject(G.work.active + 1); }
  }
  // journey
  if (vis[3] > 0) {
    const k = clamp(Math.round(p - 7), 0, 2);
    if (k !== ui.jk) { ui.jk = k; [ui.place, ui.cap].forEach((arr) => arr.forEach((e, i) => e.classList.toggle('on', i === k))); }
  }
  // roots
  if (vis[4] > 0) {
    const lit = G.roots.lit();
    ui.gens.forEach((li, i) => li.classList.toggle('on', lit[i]));
    ui.rThread.classList.toggle('on', lit[2]);
    G.roots.labels(w, h, labelPos);
    ui.labels.forEach((el, i) => { el.style.transform = `translate(${labelPos[i][0].toFixed(1)}px, ${(labelPos[i][1] + 14).toFixed(1)}px) translateX(-50%)`; el.classList.toggle('on', lit[i]); });
  }
  // the ripple masks the page under its front
  const fr = G.rv?.front();
  if (fr) {
    if (fr.fade !== undefined) { clearMask(ui.stage); ui.stage.style.opacity = String(fr.mode === 2 ? fr.fade : 1 - fr.fade); ui.stage._masked = true; }
    else if (fr.mode === 0) setMask(ui.stage, `radial-gradient(circle at ${fr.x.toFixed(1)}px ${fr.y.toFixed(1)}px, transparent ${Math.max(0, fr.R - 22).toFixed(1)}px, #000 ${(fr.R + 30).toFixed(1)}px)`);
    else if (fr.mode === 2) setMask(ui.stage, `radial-gradient(circle at ${fr.x.toFixed(1)}px ${fr.y.toFixed(1)}px, #000 ${Math.max(0, fr.R - 22).toFixed(1)}px, transparent ${(fr.R + 30).toFixed(1)}px)`);
  } else clearMask(ui.stage);
  const rvCover = !!(G.rv?.fullCover() || (fr && fr.mode === 1));
  if (rvCover !== ui.rvCover) { ui.rvCover = rvCover; html.classList.toggle('rv-cover', rvCover); }
  // HUD
  let sec = 0; SECTIONS.forEach((s, i) => { if (p >= s.stop - 0.5) sec = i; });
  if (sec !== state.section) {
    state.section = sec;
    ui.hudNum.textContent = pad(sec + 1); ui.hudName.textContent = SECTIONS[sec].name;
    ui.navWork.classList.toggle('on', sec === 2); ui.navContact.classList.toggle('on', sec === 5);
  }
  const lit = Math.round((p / LAST) * (ui.ticks.length - 1));
  if (lit !== ui.lit) { ui.lit = lit; ui.ticks.forEach((t, i) => { t.classList.toggle('on', i < lit); t.classList.toggle('now', i === lit); }); }
  if (chip.on) {
    chip.cx = damp(chip.cx, chip.x + 16, 20, dt); chip.cy = damp(chip.cy, chip.y + 16, 20, dt);
    ui.chip.style.transform = `translate(${chip.cx.toFixed(1)}px, ${chip.cy.toFixed(1)}px)`;
  } else { chip.cx = chip.x + 16; chip.cy = chip.y + 16; }
}

// CSS matrix3d that maps a W x H element onto the quad p0 (tl), p1 (tr), p2 (br), p3 (bl)
function quadMatrix(W, H, p0, p1, p2, p3) {
  const x0 = p0[0], y0 = p0[1], x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], x3 = p3[0], y3 = p3[1];
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) < 1e-9) return null;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  const m = [a / W, d / W, 0, g / W, b / H, e / H, 0, hh / H, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-12 ? 0 : v.toFixed(9))).join(',')})`;
}

// test hook (no UI)
window.__v13 = {
  state, go: (i) => goTo(i), jump: (i) => jump(i), ff: (v = true) => { st.ff = v; },
  jumpP: (p) => { if (!lenis) return; clearTimeout(snapTimer); snapping = true; lenis.scrollTo((p / LAST) * lenis.limit, { immediate: true, force: true }); state.pRaw = state.p = p; setTimeout(() => { snapping = false; }, 60000); },
  enter: () => { L.want = true; if (L.prompt) enter(); }, open: (i) => openProject(i, innerWidth / 2, innerHeight / 2, null), close: () => G.rv?.close(), about: () => openAbout(), project: (i) => setProject(i),
};

boot();
