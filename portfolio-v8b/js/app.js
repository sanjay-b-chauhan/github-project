// v8B orchestrator: loader -> storm -> sunrise -> scroll choreography.
import { runStorm } from './storm.js';

const d = document.documentElement;
clearTimeout(window.__fs);
if (d.classList.contains('failsafe')) { d.classList.remove('failsafe'); }

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

const gsap = window.gsap, ST = window.ScrollTrigger, LenisC = window.Lenis;
const RM = d.classList.contains('rm');
const mq = matchMedia('(max-width: 767px)');
const coarse = matchMedia('(hover: none)').matches;
let STATIC = d.classList.contains('static');
if (!gsap || !ST) STATIC = true;

const PLATE_META = [
  ['01', 'ZERO Job Portal', 'An agent that job-hunts for you, and asks before every move.', 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html'],
  ['02', 'ZERO Workspace', 'Real job scenarios, with an AI manager beside you.', 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html'],
  ['03', 'Curio', 'Explainer films you can talk back to.', 'https://sanjay-curio.vercel.app/'],
  ['04', 'anyo', 'Close friends, no texting. Video and voice only.', 'https://getanyo.vercel.app/'],
  ['05', 'Stack FX', 'A card dealer for motion studies.', 'https://sanjay-trace-fx.vercel.app/stack'],
  ['06', 'Signal', 'A portfolio built on live shaders.', 'https://sanjay-b-chauhan.github.io/github-project/portfolio-v4/'],
  ['07', 'Voice-first onboarding', 'Talk, and the profile builds itself.', 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html']
];

/* ───────── shared UI bits (both modes) ───────── */
const ticksEl = $('#ticks');
const TN = 40, ticks = [];
for (let i = 0; i < TN; i++) { const t = document.createElement('i'); ticksEl.appendChild(t); ticks.push(t); }
buildRing();

function buildRing() {
  const g = $('#ringRot'); if (!g) return;
  const N = 16; let html = '';
  for (let k = 0; k < N; k++) {
    const a = k * 360 / N, big = k % 2 === 0;
    const w = big ? 38 : 24, h = w * 301.009 / 424.098, R = big ? 104 : 100;
    html += `<g transform="translate(150 150) rotate(${a}) translate(0 ${-R})"><use href="#i-sun" x="${-w / 2}" y="${-h}" width="${w}" height="${h}"/></g>`;
  }
  html += `<circle cx="150" cy="150" r="136" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 7" opacity=".7"/>`;
  g.innerHTML = html;
}

function splitWords(el) {
  if (!el || el.dataset.split) return [];
  el.dataset.split = '1';
  const out = [];
  [...el.childNodes].forEach(n => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
      const w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w); out.push(w);
    });
    n.replaceWith(frag);
  });
  return out;
}

function staticMode() {
  STATIC = true;
  d.classList.remove('anim', 'locked', 'entered');
  d.classList.add('static');
  const l = $('#loader'); if (l) l.remove();
  const s = $('#storm'); if (s) s.remove();
  $('#ring')?.classList.add('lit');
  ticks.forEach((t, i) => t.classList.toggle('on', i < 6));
  // light, reversible-free reveal for the cards on touch screens
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('lit', e.isIntersecting && coarse)), { threshold: .6 });
    $$('.card').forEach(c => io.observe(c));
  }
}

if (STATIC) staticMode();
else boot().catch(err => { console.warn('[v8b] falling back to static', err); staticMode(); });

/* ═════════════════ ANIMATED MODE ═════════════════ */
async function boot() {
  gsap.registerPlugin(ST);
  try { window.scrollTo(0, 0); } catch (e) { }
  const loader = $('#loader'), numEl = $('#loaderNum'), enterBtn = $('#loaderEnter');
  let world = null, worldErr = null, entered = false, ready = false, wantEnter = false, autoT = 0;
  let target = 6, shown = 0;
  const tStart = performance.now();
  const MIN_MS = 2300;

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { target = Math.max(target, 38); });
  const worldP = import('./gl.js').then(m => {
    target = Math.max(target, 72);
    return m.createWorld({ canvas: $('#gl'), stageEl: $('#stageSticky'), casesEl: $('#casesSticky'), footEl: $('#foot'), mobile: mq.matches || coarse });
  }).then(w => { world = w; target = 100; return w; }).catch(e => { worldErr = e; });

  const pad = n => String(n).padStart(3, '0');
  const countTick = () => {
    if (entered) return;
    const el = performance.now() - tStart;
    const cap = 100 * clamp(el / MIN_MS);
    const goal = Math.min(target, cap);
    shown = shown + (goal - shown) * .09 + (goal > shown ? .15 : 0);
    if (shown > goal) shown = goal;
    const v = Math.round(shown);
    if (numEl.textContent !== pad(v)) numEl.textContent = pad(v);
    if (!ready && v >= 100 && world) {
      ready = true; enterBtn.classList.add('ready');
      if (wantEnter) enter(); else autoT = setTimeout(enter, 1500);
    }
    if (worldErr) { gsap.ticker.remove(countTick); staticMode(); }
  };
  gsap.ticker.add(countTick);
  const hardStop = setTimeout(() => { if (!world && !entered) { gsap.ticker.remove(countTick); staticMode(); } }, 14000);

  const ask = e => {
    if (e && e.type === 'keydown' && !['Enter', ' ', 'ArrowDown', 'PageDown', 'Escape', 'Spacebar'].includes(e.key)) return;
    if (e && e.type === 'keydown') e.preventDefault();
    wantEnter = true; if (ready) enter();
  };
  loader.addEventListener('click', ask);
  addEventListener('wheel', ask, { passive: true });
  addEventListener('touchmove', ask, { passive: true });
  addEventListener('keydown', ask);
  const unbindAsk = () => { loader.removeEventListener('click', ask); removeEventListener('wheel', ask); removeEventListener('touchmove', ask); removeEventListener('keydown', ask); };

  function enter() {
    if (entered) return;
    entered = true; clearTimeout(autoT); clearTimeout(hardStop); unbindAsk();
    gsap.ticker.remove(countTick);
    numEl.textContent = '100';
    enterBtn.classList.remove('ready');
    const storm = $('#storm');
    let started = false;
    const go = () => { if (started) return; started = true; startSite(world); };
    const ok = runStorm(storm, {
      duration: 2150,
      down: /[?&]storm=down\b/.test(location.search),
      onCover: () => { loader.style.display = 'none'; world.frame(performance.now()); },
      onDone: cleanup => { go(); gsap.to(storm, { opacity: 0, duration: .55, ease: 'power1.out', onComplete: cleanup }); }
    });
    if (!ok) gsap.to(loader, { opacity: 0, duration: .9, ease: 'power2.inOut', onComplete: () => { loader.style.display = 'none'; go(); } });
  }
}

const css = (el, k, v) => { const c = el._c || (el._c = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };

function startSite(world) {
  d.classList.remove('locked');
  try { window.scrollTo(0, 0); } catch (e) { }
  const lenis = LenisC ? new LenisC({ duration: 1.2, smoothWheel: true, wheelMultiplier: .95, touchMultiplier: 1.5 }) : null;
  if (lenis) { lenis.on('scroll', ST.update); }
  gsap.ticker.lagSmoothing(0);

  const S = world.state;
  const vh = () => innerHeight;
  const stageSec = $('#stage'), casesSec = $('#cases'), foot = $('#foot');
  const hero = $('#hero'), heroSide = $('#heroSide'), nav = $('#nav'), veil = $('#stageVeil');
  const steps = $$('#steps .step');
  const stepH = steps.map(s => $('h2', s));
  const stepW = steps.map(s => splitWords($('p', s)));
  const splitL = $('#splitL'), splitR = $('#splitR'), seam = $('#seam');
  const cap = $('#caseCap'), ccN = $('#ccN'), ccT = $('#ccT'), ccL = $('#ccL');
  const coin = $('#coin'), xs = $$('.bar .x'), barEl = $('.bar');
  const N = PLATE_META.length;

  /* intro: the sun rises, the beam shoots up, the hero writes itself */
  d.classList.add('entered');
  gsap.to(S, { intro: 1, duration: 3.0, ease: 'none' });
  const heroLines = $$('.statement .lni:not(.script)');
  gsap.fromTo(heroLines, { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.35, ease: 'power4.out', stagger: .12, delay: 1.05 });
  gsap.fromTo('#heroScript', { clipPath: 'inset(-20% 100% -30% 0%)' }, { clipPath: 'inset(-20% 0% -30% 0%)', duration: 1.7, ease: 'power2.inOut', delay: 1.45 });
  gsap.fromTo(heroSide, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.7 });
  // failsafe for the hero if a tween is ever interrupted
  setTimeout(() => { gsap.set(heroLines, { yPercent: 0, opacity: 1 }); gsap.set('#heroScript', { clipPath: 'inset(-20% 0% -30% 0%)' }); gsap.set(heroSide, { opacity: 1 }); }, 5200);

  // plates are built while the visitor is still in the stage
  const buildLater = () => world.buildCases().catch(e => console.warn('[v8b] cases', e));
  ('requestIdleCallback' in window) ? requestIdleCallback(buildLater, { timeout: 2500 }) : setTimeout(buildLater, 1200);

  /* ───── work section ───── */
  const wt = $('.work-title');
  gsap.fromTo($$('.mi', wt), { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: wt, start: 'top 82%' } });
  gsap.fromTo($('.wt-script', wt), { clipPath: 'inset(-20% 100% -40% 0%)' }, { clipPath: 'inset(-20% 0% -40% 0%)', duration: 1.6, ease: 'power2.inOut', delay: .25, scrollTrigger: { trigger: wt, start: 'top 82%' } });
  const noteW = splitWords($('.work-note'));
  gsap.fromTo(noteW, { opacity: .12 }, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.work-note', start: 'top 88%', end: 'top 45%', scrub: true } });
  const cards = $$('.card');
  if (!mq.matches) {
    gsap.fromTo(cards[0], { y: 130 }, { y: -50, ease: 'none', scrollTrigger: { trigger: '.cards', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(cards[2], { y: 150 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.cards', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(cards[1], { y: 40 }, { y: -90, ease: 'none', scrollTrigger: { trigger: '.cards', start: 'top bottom', end: 'bottom top', scrub: true } });
    cards.forEach(c => {
      const img = $('.card-img', c);
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; gsap.to(img, { rotateY: x * 7, rotateX: -y * 7, duration: .6, ease: 'power3.out', transformPerspective: 900 }); });
      c.addEventListener('pointerleave', () => gsap.to(img, { rotateY: 0, rotateX: 0, duration: .9, ease: 'power3.out' }));
    });
  }
  cards.forEach(c => gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 94%' } }));
  if (coarse && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('lit', e.isIntersecting)), { threshold: .7 });
    cards.forEach(c => io.observe(c));
  }

  /* ───── case studies title ───── */
  gsap.fromTo(['#splitL .cs-heavy', '#splitR .cs-heavy'], { clipPath: 'inset(100% 0% -10% 0%)', yPercent: 30 }, { clipPath: 'inset(0% 0% -10% 0%)', yPercent: 0, duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: '#cases', start: 'top 62%' } });
  gsap.fromTo(['#splitL .cs-script', '#splitR .cs-script'], { clipPath: 'inset(-30% 100% -40% -5%)' }, { clipPath: 'inset(-30% 0% -40% -5%)', duration: 1.6, ease: 'power2.inOut', delay: .3, scrollTrigger: { trigger: '#cases', start: 'top 62%' } });
  gsap.fromTo(['#splitL .cs-note', '#splitR .cs-note'], { opacity: 0 }, { opacity: 1, duration: 1.2, delay: .7, ease: 'power2.out', scrollTrigger: { trigger: '#cases', start: 'top 62%' } });

  /* ───── CTA ───── */
  const ct = $('.cta-title');
  gsap.fromTo($$('.mi', ct), { yPercent: 112 }, { yPercent: 0, duration: 1.25, ease: 'power4.out', stagger: .12, scrollTrigger: { trigger: ct, start: 'top 80%' } });
  gsap.fromTo('.cta-script', { clipPath: 'inset(-30% 100% -40% 0%)' }, { clipPath: 'inset(-30% 0% -40% 0%)', duration: 1.5, ease: 'power2.inOut', delay: .55, scrollTrigger: { trigger: ct, start: 'top 80%' } });
  gsap.fromTo(['#ring .ring-svg', '#ring .ring-t'], { opacity: 0, scale: .82, rotate: -30 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '#ring', start: 'top 90%' } });
  ST.create({ trigger: '#ring', start: 'top 70%', end: 'bottom 20%', onToggle: s => $('#ring').classList.toggle('lit', s.isActive) });

  /* ───── pointer ───── */
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    S.mx = (e.clientX / innerWidth) * 2 - 1; S.my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  const cs = $('#casesSticky');
  let lastPick = -1;
  cs.addEventListener('pointermove', e => {
    const i = world.pick(e.clientX, e.clientY);
    if (i !== lastPick) { cs.style.cursor = i >= 0 ? 'pointer' : ''; lastPick = i; }
  });
  cs.addEventListener('pointerleave', () => { if (world.cases) world.cases.hovered = -1; cs.style.cursor = ''; lastPick = -1; });
  cs.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const i = world.pick(e.clientX, e.clientY);
    if (i >= 0) window.open(PLATE_META[i][3], '_blank', 'noopener');
  });

  /* ───── navigation ───── */
  const scrollToY = y => lenis ? lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y });
  const topOf = el => el.getBoundingClientRect().top + window.scrollY;
  $$('[data-go]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id && $(id); if (!el) return;
    e.preventDefault(); scrollToY(topOf(el) + (id === '#cases' ? innerHeight * .9 : 0));
  }));
  $('.emblem').addEventListener('click', e => { e.preventDefault(); scrollToY(0); });
  $('.skip').addEventListener('click', e => { e.preventDefault(); scrollToY(topOf($('#work'))); $('#work .card')?.focus({ preventScroll: true }); });
  const plateQ = i => .12 + (i / (N - 1)) * .76 + .004;
  $$('#plates a').forEach(a => a.addEventListener('focus', () => {
    const i = +a.dataset.i; const top = topOf(casesSec);
    scrollToY(top + plateQ(i) * (casesSec.offsetHeight - innerHeight));
  }));

  /* ───── per-frame choreography ───── */
  let spin = 0, lastY = window.scrollY, vel = 0, capI = -1, capOn = false, navHidden = false;
  const secP = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - vh())); };

  function tick(time) {
    if (lenis) lenis.raf(time * 1000);
    const y = window.scrollY;
    vel = lerp(vel, y - lastY, .2); lastY = y;
    const H = vh();

    // stage
    const p = secP(stageSec);
    S.stageP = p;
    const heroOut = sstep(.004, .1, p);
    css(hero, 'transform', `translate3d(0,${(-heroOut * 34).toFixed(2)}vh,0)`);
    css(hero, 'opacity', (1 - sstep(.02, .085, p)).toFixed(3));
    css(heroSide, 'transform', `translate3d(0,${(-heroOut * 22).toFixed(2)}vh,0)`);
    if (S.intro >= 1) css(heroSide, 'opacity', (1 - sstep(.015, .07, p)).toFixed(3));
    const K = (1.0 + .52 * 3 + .42) / .68;
    steps.forEach((st, i) => {
      const yy = (1.0 + .52 * i) - K * (p - .12);
      css(st, 'transform', `translate3d(0,${(yy * H).toFixed(1)}px,0)`);
      const vis = yy > (mq.matches ? .3 : -.5) && yy < 1.05;
      css(st, 'visibility', vis ? 'visible' : 'hidden');
      if (!vis) return;
      const rev = mq.matches ? sstep(.98, .8, yy) : sstep(.98, .62, yy);
      css(stepH[i], 'clipPath', `inset(-30% ${((1 - rev) * 106).toFixed(2)}% -40% -5%)`);
      const w = stepW[i], n = w.length, r2 = (mq.matches ? sstep(.95, .64, yy) : sstep(.9, .45, yy)) * (n + 3);
      w.forEach((el, j) => css(el, 'opacity', (.1 + .9 * clamp((r2 - j) / 3)).toFixed(2)));
      css(st, 'opacity', (mq.matches ? (1 - sstep(.47, .37, yy)) * sstep(1.0, .86, yy) : 1 - sstep(.16, -.22, yy)).toFixed(3));
    });
    css(veil, 'opacity', (sstep(.955, 1, p) * .94).toFixed(3));
    const hideNav = p > .03 || y > stageSec.offsetHeight;
    if (hideNav !== navHidden) { navHidden = hideNav; nav.classList.toggle('hide', hideNav); }

    // cases
    const q = secP(casesSec);
    S.casesQ = q;
    const open = sstep(.055, .125, q) * (1 - sstep(.9, .965, q));
    S.casesOpen = open;
    const off = open * 52;
    css(splitL, 'transform', `translate3d(${(-off).toFixed(3)}vw,0,0)`);
    css(splitR, 'transform', `translate3d(${off.toFixed(3)}vw,0,0)`);
    const seamK = sstep(.0, .045, q) * (1 - sstep(.06, .09, q)) + sstep(.955, .985, q);
    css(seam, 'transform', `scaleY(${clamp(seamK).toFixed(3)})`);
    const showCap = open > .92 && world.cases;
    if (showCap !== capOn) { capOn = showCap; cap.classList.toggle('on', !!showCap); }
    if (showCap) {
      const ci = clamp(Math.round(S.casesU), 0, N - 1);
      if (ci !== capI) {
        capI = ci; const m = PLATE_META[ci];
        ccN.textContent = `No. ${m[0]} / 07`; ccT.textContent = m[1]; ccL.textContent = m[2]; cap.href = m[3];
        cap.setAttribute('aria-label', `Open ${m[1]}, live build`);
      }
    }

    // footer
    const fr = foot.getBoundingClientRect();
    S.footP = clamp(1 - fr.top / H);
    const tAway = fr.top < H * .55;
    if (tAway !== ticksEl._away) { ticksEl._away = tAway; ticksEl.classList.toggle('away', tAway); barEl.classList.toggle('clear', tAway); }

    // chrome: emblem coin, bar crosses, progress ticks
    spin += .5 + Math.min(18, Math.abs(vel) * .35);
    coin.style.setProperty('--spin', (spin % 360).toFixed(1) + 'deg');
    const xr = (y * .18) % 360;
    xs.forEach((x, i) => x.style.setProperty('--xr', (i % 2 ? -xr : xr).toFixed(1) + 'deg'));
    const doc = Math.max(1, document.documentElement.scrollHeight - H);
    const lit = Math.round(clamp(y / doc) * TN);
    const energy = Math.min(1, Math.abs(vel) / 40);
    for (let i = 0; i < TN; i++) {
      const tk = ticks[i];
      const on = i < Math.max(1, lit);
      if (tk._on !== on) { tk._on = on; tk.classList.toggle('on', on); }
      const hgt = 7 + (Math.sin(time * 4.2 + i * .75) * .5 + .5) * (5 + 16 * energy) + (Math.sin(i * 12.9898 + time * 9) * .5 + .5) * 14 * energy;
      tk.style.transform = `scaleY(${Math.min(1, hgt / 30).toFixed(3)})`;
    }

    if (!document.hidden) world.frame(performance.now());
  }
  gsap.ticker.add(tick);
  document.addEventListener('visibilitychange', () => { document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake(); });
  addEventListener('resize', () => { world.size(); ST.refresh(); });
  ST.refresh();
  window.__v8b = { world, lenis };
}
