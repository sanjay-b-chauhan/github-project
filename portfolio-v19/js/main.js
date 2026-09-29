import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { PROJECTS, CLIENTS, ARCHIVE, PLAY, STATS, DOING, TOOLS, EXPERIENCE, PROCESS, PHOTOS, PEOPLE, LINKS } from './content.js';
import { damp, scramble } from './util.js';
import { pointer } from './track.js';

// Sanjay Chauhan, v19. The structure of his own site, tightened, with three moments in WebGL:
// dawn over the desert with the sunburst rising behind his name, the endless archive, and three
// generations of builders told in sand, brick and pixels.
gsap.registerPlugin(ScrollTrigger);
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const MOBILE = innerWidth < 821 || TOUCH;
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
html.classList.add('loading');

// ---------------------------------------------------------------- content into the page
function build() {
  $('#clientTrack').innerHTML = [0, 1].map(() => `<span>${CLIENTS.map((c) => `${c}<i></i>`).join('')}</span>`).join('');
  $('#cards').innerHTML = PROJECTS.map((p, i) => `
    <article class="card" data-i="${i}">
      <div class="card-media" data-cursor="Open" data-case="${i}">${p.video ? `<video muted loop playsinline preload="none" poster="${p.poster}" data-src="${p.video}"></video>` : `<img src="${p.cover}" alt="${p.title}" loading="lazy">`}</div>
      <div class="card-info">
        <p class="card-n"><span><b>${pad(i + 1)}</b> / ${pad(PROJECTS.length)}</span><span>${p.year}</span></p>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-sub">${p.sub}</p>
        <dl class="card-meta"><div><dt>Role</dt><dd>${p.role}</dd></div><div><dt>Client</dt><dd>${p.client}</dd></div><div><dt>Field</dt><dd>${p.industry}</dd></div></dl>
        <button class="btn card-open" type="button" data-case="${i}">Open case study</button>
      </div>
      <div class="card-shade"></div>
    </article>`).join('');
  $('#workCount').textContent = pad(PROJECTS.length);
  $('#arCount').textContent = ARCHIVE.length;
  $('#fbArchive').innerHTML = ARCHIVE.map((h) => `<li><button type="button" ${h.case !== undefined ? `data-case="${h.case}"` : `data-lb="${h.src}" data-cap="${h.title}"`}><img src="${h.src}" alt="${h.title}" loading="lazy"></button></li>`).join('');
  $('#stats').innerHTML = STATS.map(([n, l]) => `<li class="r"><b>${n.replace('+', '<em>+</em>')}</b><span>${l}</span></li>`).join('');
  $('#doing').innerHTML = DOING.map((d) => `<li>${d}</li>`).join('');
  $('#tools').innerHTML = TOOLS.map(([a, b]) => `<li><b>${a}</b>${b}</li>`).join('');
  $('#xp').innerHTML = EXPERIENCE.map(([r, o, y]) => `<li><b>${r}</b><em>${y}</em><span>${o}</span></li>`).join('');
  $('#proc').innerHTML = PROCESS.map(([w, l]) => `<div class="proc-row r"><p class="proc-w">${w}</p><ul class="proc-l">${l.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('');
  $('#playTrack').innerHTML = PLAY.map(([s, t, k]) => `<button class="play-card" type="button" data-lb="${s}" data-cap="${t}" data-cursor="View"><figure><img src="${s}" alt="${t}" loading="lazy"></figure><p>${t}<span>${k}</span></p></button>`).join('');
  const off = '<span>Chai <em>sips</em> &#9749;&#xFE0E;</span><span>&middot;</span><span>Football <em>kicks</em> &#9917;&#xFE0E;</span><span>&middot;</span><span>Camera <em>clicks</em> [&#9673;&deg;]</span><span>&middot;</span>';
  $('#offTrack').innerHTML = `<span>${off}${off}</span><span>${off}${off}</span>`;
  const shots = [...PHOTOS, ...PEOPLE].slice(0, 10);
  const spans = [[5, 3], [3, 2], [4, 2], [3, 3], [4, 3], [5, 2], [4, 2], [3, 2], [4, 3], [5, 3]];
  $('#offGrid').innerHTML = shots.map(([s, c], i) => `<figure data-lb="${s}" data-cap="${c}" data-cursor="View" style="grid-column:span ${spans[i][0]};grid-row:span ${spans[i][1]}"><img src="${s}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`).join('');
  const ft = '<span>Think. Design. <em>Disrupt.</em></span><span>&bull;</span><span>Let&rsquo;s go</span><span>&bull;</span>';
  $('#footTrack').innerHTML = `<span>${ft}${ft}</span><span>${ft}${ft}</span>`;
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' });
  const tick = () => $$('[data-clock]').forEach((el) => { el.textContent = fmt.format(new Date()).toLowerCase(); });
  tick(); setInterval(tick, 15000);
  // statement words, lit one by one on scroll
  $$('.st-w').forEach((l) => { l.innerHTML = l.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' '); });
}

// ---------------------------------------------------------------- WebGL moments: one canvas each, drawn only on screen
const G = {};
async function moment(canvas, make) {
  const ctx = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!ctx) throw new Error('no webgl2');
  const renderer = new THREE.WebGLRenderer({ canvas, context: ctx, antialias: false });
  renderer.setClearColor(0x000000, 1);
  const { createPost } = await import('./post.js');
  const post = createPost(renderer, { mobile: MOBILE });
  post.uniforms.uFade.value = 1;
  const set = await make(renderer);
  const m = { canvas, renderer, post, set, on: false, w: 0, h: 0 };
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 1.5);
    if (!w || !h || (w === m.w && h === m.h)) return;
    m.w = w; m.h = h;
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); post.resize(w, h, dpr); set.applyAspect(w / h);
  };
  m.size = size;
  new IntersectionObserver(([e]) => { m.on = e.isIntersecting; }, { rootMargin: '10% 0px' }).observe(canvas);
  size();
  // compile while the lift is still climbing, so the first real frame is not a stall
  try { set.update(0, 0, 1); await renderer.compileAsync(set.scene, set.camera); post.render(set, null, 0, 0, null); } catch (e) { /* compiles lazily */ }
  return m;
}
function draw(m, dt, t, q) {
  if (!m || !m.on) return;
  m.size();
  m.set.update(dt, t, q);
  m.post.uniforms.uTime.value = t;
  m.post.uniforms.uExposure.value = m.set.exposure ?? 1;
  m.post.render(m.set, null, 0, 0, null);
}

// ---------------------------------------------------------------- loader: the lift rides up
const L = { count: $('#ldCount'), shown: 0, target: 0, t0: performance.now() };
function liftTick(resolve) {
  const cap = Math.min(100, ((performance.now() - L.t0) / (REDUCED ? 1 : 2200)) * 100);
  const goal = Math.min(L.target, cap);
  L.shown = Math.min(goal, L.shown + Math.max(0.4, (goal - L.shown) * 0.12));
  L.count.textContent = String(Math.floor(L.shown)).padStart(3, '0');
  if (L.shown >= 99.9 && L.target >= 100) { L.count.textContent = '100'; $('#ldArrow').classList.add('top'); $('#ldCap').textContent = 'Top floor'; resolve(); return; }
  requestAnimationFrame(() => liftTick(resolve));
}

// ---------------------------------------------------------------- scroll
let lenis = null;
function smooth() {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  $$('[data-to]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo($(a.dataset.to), { duration: 1.6 }); }));
}

// ---------------------------------------------------------------- choreography
const S = { hero: 0, heroIntro: 0.08, story: 0 };
// each chapter holds while its words are on screen; the changes happen between them
const STORY_KEYS = [[0, 0.8], [0.26, 1.0], [0.4, 2.0], [0.6, 2.0], [0.74, 3.0], [1, 3.25]];
function storyQ(p) { for (let i = 1; i < STORY_KEYS.length; i++) { const [a, x] = STORY_KEYS[i - 1], [b, y] = STORY_KEYS[i]; if (p <= b) { const t = (p - a) / (b - a); const e = t * t * (3 - 2 * t); return x + (y - x) * e; } } return 3.25; }
function choreo() {
  // reveals
  ScrollTrigger.batch('.r', { start: 'top 88%', onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, overwrite: true }) });
  // hero: the sun keeps rising as you scroll through it
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { S.hero = s.progress; } });
  gsap.to('.hero-name', { yPercent: -30, opacity: 0.0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom bottom', scrub: true } });
  // work: each card settles back as the next one slides over it
  const cards = $$('.card');
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(c, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 96px', scrub: true } });
    gsap.to(c.querySelector('.card-shade'), { opacity: 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 96px', scrub: true } });
  });
  // statement: words light up one by one
  gsap.to('.st-line .w', { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top 70%', end: 'center 45%', scrub: true } });
  // story: three chapters on one stage
  ScrollTrigger.create({ trigger: '.story', start: 'top top', end: 'bottom bottom', onUpdate: (s) => {
    S.story = s.progress;
    const k = s.progress, idx = k < 0.34 ? 0 : k < 0.66 ? 1 : 2;
    $$('.chap').forEach((c, i) => c.classList.toggle('on', i === idx));
    $$('.story-prog i').forEach((b, i) => b.style.setProperty('--k', Math.min(1, Math.max(0, k * 3 - i)).toFixed(3)));
  } });
  // playground: vertical scroll drives a horizontal track
  const track = $('#playTrack');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.play', start: 'top top', end: () => `+=${dist()}`, pin: '.play-pin', scrub: 0.6, invalidateOnRefresh: true } });
  // contact: the sun comes up over the footer
  gsap.fromTo('.sun-mark', { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 80%', end: 'bottom bottom', scrub: true } });
  gsap.fromTo('.sun-glow', { opacity: 0.2, scale: 0.7 }, { opacity: 1, scale: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 80%', end: 'bottom bottom', scrub: true } });
  // timeline + nav state
  const secs = $$('main > section');
  $('#tlTicks').innerHTML = secs.map(() => '<i></i>').join('');
  secs.forEach((sec, i) => ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => { if (s.isActive) setSection(i, sec); } }));
  setSection(0, secs[0]);
  // videos only play while their card is on screen
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.2 });
  $$('.card video').forEach((v) => io.observe(v));
}
let curSec = -1;
function setSection(i, sec) {
  if (i === curSec) return; curSec = i;
  const n = $$('#tlTicks i').length;
  $$('#tlTicks i').forEach((t, k) => t.classList.toggle('on', k <= i));
  const lab = $('#tlLabel');
  gsap.to(lab, { x: (i / Math.max(1, n - 1)) * $('#tlTicks').offsetWidth, duration: 0.9, ease: 'power3.inOut' });
  scramble(lab.firstElementChild, (sec.dataset.name || '').toUpperCase(), 420);
  $$('.nav-links a').forEach((a) => a.classList.toggle('on', a.dataset.to === `#${sec.id}`));
}

// ---------------------------------------------------------------- the archive: drag, throw, filter, open
let arList = ARCHIVE, arHover = -1;
const drag = { on: false, x: 0, y: 0, t: 0, moved: 0 };
function archiveUI() {
  const st = $('#arStage');
  const ndc = (e) => { const r = st.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)]; };
  st.addEventListener('pointerdown', (e) => { if (!G.archive) return; drag.on = true; drag.x = e.clientX; drag.y = e.clientY; drag.t = performance.now(); drag.moved = 0; G.archive.set.grab(true); st.setPointerCapture(e.pointerId); });
  st.addEventListener('pointermove', (e) => {
    if (!G.archive) return;
    if (drag.on) {
      const now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.t = now; drag.moved += Math.abs(dx) + Math.abs(dy);
      const k = (MOBILE ? 14 : 20) / st.clientWidth;
      G.archive.set.push(dx * k, -dy * k * (e.pointerType === 'touch' ? 0 : 1), dt);
      html.classList.add('dragging');
      return;
    }
    const [x, y] = ndc(e), i = G.archive.set.pick(x, y);
    if (i !== arHover) { arHover = i; G.archive.set.setHover(i); cursorLabel(i >= 0 ? (arList[i].case !== undefined ? 'Open' : 'View') : 'Drag'); }
  });
  const up = (e) => {
    if (!drag.on) return;
    drag.on = false; G.archive.set.grab(false); html.classList.remove('dragging');
    if (drag.moved < 6) { const [x, y] = ndc(e); const i = G.archive.set.pick(x, y); if (i >= 0) { const it = arList[i]; if (it.case !== undefined) openCase(it.case); else openLB(it.src, it.title); } }
  };
  st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  st.addEventListener('pointerenter', () => cursorLabel('Drag'));
  st.addEventListener('pointerleave', () => { cursorLabel(''); arHover = -1; G.archive?.set.setHover(-1); });
  st.addEventListener('wheel', (e) => { if (G.archive && Math.abs(e.deltaX) > Math.abs(e.deltaY)) G.archive.set.push(-e.deltaX * 0.01, 0); }, { passive: true });
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-filter]').forEach((x) => x.classList.toggle('on', x === b));
    arList = b.dataset.filter === 'all' ? ARCHIVE : ARCHIVE.filter((x) => x.cat === b.dataset.filter);
    G.archive?.set.setItems(arList);
    $('#arCount').textContent = arList.length;
  }));
}

// ---------------------------------------------------------------- cursor
const cur = { x: -100, y: -100, cx: -100, cy: -100 };
function cursorLabel(t) { const c = $('#cursor'); c.classList.toggle('big', !!t); $('#cursorT').textContent = t; }
function cursorUI() {
  addEventListener('pointermove', (e) => {
    cur.x = e.clientX; cur.y = e.clientY;
    if (e.pointerType === 'mouse' && !REDUCED) { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest && e.target.closest('#arStage')) return;
    const t = e.target.closest && e.target.closest('[data-cursor]');
    cursorLabel(t ? t.dataset.cursor : '');
  });
}
const aim = { x: 0, y: 0 };

// ---------------------------------------------------------------- case study + lightbox
let overlay = null;
function openCase(i) {
  const n = PROJECTS.length; i = ((i % n) + n) % n;
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % n];
  const el = $('#case'), sc = $('#caseScroll');
  sc.innerHTML = `<p class="cs-kick">Case study ${pad(i + 1)} / ${pad(n)}</p>
    <header class="cs-head"><div><h2 class="cs-title" id="caseTitle">${p.title}</h2><p class="cs-sub">${p.sub}</p></div>${p.url ? `<a class="btn solid" href="${p.url}" target="_blank" rel="noopener">Visit the live site</a>` : ''}</header>
    <div class="cs-media">${p.video ? `<video src="${p.video}" poster="${p.poster}" autoplay muted loop playsinline></video>` : `<img src="${p.cover}" alt="${p.title}">`}</div>
    <div class="cs-meta"><div><p>For</p><b>${p.client}</b></div><div><p>Role</p><b>${p.role}</b></div><div><p>Year</p><b>${p.year}</b></div><div><p>Services</p><b>${p.services.join(', ')}</b></div></div>
    <div class="cs-body">${p.body.map(([h, t]) => `<section><h3>${h}</h3><p>${t}</p></section>`).join('')}</div>
    ${p.credit ? `<p class="cs-credit">${p.credit}</p>` : ''}
    <button class="cs-next" type="button" data-case="${(i + 1) % n}"><span>Next case</span><b>${next.title}</b></button>`;
  sc.scrollTop = 0;
  if (overlay === 'case') { gsap.fromTo(sc, { opacity: 0 }, { opacity: 1, duration: 0.5 }); return; }
  overlay = 'case'; lenis?.stop(); cursorLabel('');
  el.hidden = false;
  gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: REDUCED ? 0 : 1.0, ease: 'expo.inOut' });
  gsap.fromTo(sc.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, delay: REDUCED ? 0 : 0.45, ease: 'power3.out' });
}
function closeCase() {
  const el = $('#case');
  gsap.to(el, { yPercent: 100, duration: REDUCED ? 0 : 0.8, ease: 'expo.inOut', onComplete: () => { el.hidden = true; $('#caseScroll').innerHTML = ''; } });
  overlay = null; lenis?.start();
}
function openLB(src, cap) {
  $('#lbImg').src = src; $('#lbImg').alt = cap; $('#lbCap').textContent = cap;
  overlay = 'lb'; lenis?.stop(); cursorLabel('');
  const lb = $('#lb'); lb.hidden = false;
  gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  gsap.fromTo('#lb figure', { scale: 0.94, y: 20 }, { scale: 1, y: 0, duration: 0.7, ease: 'expo.out' });
}
function closeLB() { const lb = $('#lb'); gsap.to(lb, { opacity: 0, duration: 0.3, onComplete: () => { lb.hidden = true; } }); overlay = null; lenis?.start(); }
function wire() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#arStage')) return;
    const c = e.target.closest('[data-case]'); if (c) { openCase(+c.dataset.case); return; }
    const l = e.target.closest('[data-lb]'); if (l) openLB(l.dataset.lb, l.dataset.cap);
  });
  $('#caseX').addEventListener('click', closeCase);
  $('#lbX').addEventListener('click', closeLB);
  $('#lb').addEventListener('click', (e) => { if (e.target === $('#lb') || e.target.tagName === 'FIGURE') closeLB(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (overlay === 'lb') closeLB(); else if (overlay === 'case') closeCase(); } });
  $('#mailBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(LINKS.email); $('#mailHint').textContent = 'Copied. Talk soon.'; } catch (err) { location.href = `mailto:${LINKS.email}`; }
    setTimeout(() => { $('#mailHint').textContent = 'Click to copy'; }, 2600);
  });
  addEventListener('resize', () => { G.hero?.size(); G.archive?.size(); G.story?.size(); });
}

// ---------------------------------------------------------------- frame
let last = performance.now(), clock = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  if (!REDUCED) clock += dt;
  pointer.x = damp(pointer.x, aim.x, 2.4, dt); pointer.y = damp(pointer.y, aim.y, 2.4, dt);
  cur.cx = damp(cur.cx, cur.x, 18, dt); cur.cy = damp(cur.cy, cur.y, 18, dt);
  $('#cursor').style.transform = `translate(${cur.cx.toFixed(1)}px, ${cur.cy.toFixed(1)}px)`;
  if (overlay === 'case') return;
  draw(G.hero, dt, clock, S.heroIntro + S.hero * 0.5);
  if (G.archive) { G.archive.set.scrollVel(-(lenis?.velocity || 0) * 0.02); draw(G.archive, dt, clock, 0); }
  draw(G.story, dt, clock, storyQ(S.story));
}

// ---------------------------------------------------------------- boot
async function boot() {
  build(); wire(); cursorUI(); smooth();
  const done = new Promise((r) => requestAnimationFrame(() => liftTick(r)));
  L.target = 10;
  try {
    const [{ createHero }, { createArchive }, { createLineage }] = await Promise.all([import('./scenes/hero.js'), import('./scenes/archive.js'), import('./scenes/lineage.js')]);
    await Promise.race([document.fonts.ready, sleep(2500)]);
    L.target = 30;
    G.hero = await moment($('#glHero'), (r) => createHero(r, { mobile: MOBILE }));
    L.target = 60;
    G.archive = await moment($('#glArchive'), (r) => createArchive(r, { mobile: MOBILE, items: ARCHIVE }));
    L.target = 80;
    G.story = await moment($('#glStory'), (r) => createLineage(r, { mobile: MOBILE }));
  } catch (err) {
    console.warn('WebGL moments off, the page still works', err);
    html.classList.add('nogl');
  }
  L.target = 100;
  requestAnimationFrame(frame);
  await done;
  await sleep(REDUCED ? 0 : 350);
  // the lift doors open onto the dawn
  $('#loader').classList.add('open');
  html.classList.remove('loading'); html.classList.add('ready');
  setTimeout(() => $('#loader').remove(), 1700);
  choreo(); archiveUI();
  lenis.start();
  gsap.to(S, { heroIntro: 0.55, duration: REDUCED ? 0 : 3.2, ease: 'power2.out', delay: 0.4 });
  gsap.fromTo('.hn-l > span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.75 });
  gsap.to(['.hero-top', '.hero-foot'], { opacity: 1, duration: 1.2, delay: 1.4, stagger: 0.1 });
  ScrollTrigger.refresh();
}

window.__v19 = { open: openCase, close: closeCase, lb: openLB, S, G, get lenis() { return lenis; }, filter: (f) => $(`[data-filter="${f}"]`).click() };
boot();
