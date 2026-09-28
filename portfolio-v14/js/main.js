import { FLOORS, PROJECTS, SNAPS, CLIENTS, WINS, PHOTOS, PEOPLE, THOUGHTS, GREETINGS, LINKS } from './data.js';

// Sanjay Chauhan, v14. The site is a lift: the loader rides up to the top floor, the doors open,
// and every scroll rides one floor down. Long jumps close the doors and count the floors.
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = html.classList.contains('reduced');
const TOUCH = html.classList.contains('touch');
const qs = new URLSearchParams(location.search);
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));
const floors = $$('.floor');
const N = floors.length;
const doors = $('#doors');
function setDD(label) {
  const n = $('#ddNum'); n.textContent = label;
  n.animate([{ transform: 'translateY(12%)', opacity: 0.25 }, { transform: 'none', opacity: 1 }], { duration: 170, easing: 'cubic-bezier(.22,1,.36,1)' });
}
function menu(open) {
  html.classList.toggle('menu', open);
  $('#disp').setAttribute('aria-expanded', String(open));
}
let cur = 0, busy = false, overlay = null, hero = null, pj = 0;

// ---------------------------------------------------------------- small sounds (off until asked)
const sfx = (() => {
  let ctx = null, on = false;
  const tone = (f, peak, dcy, when = 0) => { const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dcy); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dcy + 0.05); };
  return {
    get on() { return on; },
    toggle() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); on = !on; if (ctx.state === 'suspended') ctx.resume(); return on; },
    ding() { if (on) { tone(1318.5, 0.07, 1.1); tone(1046.5, 0.05, 1.3, 0.16); } },
    tick() { if (on) tone(2600, 0.012, 0.05); },
    floor() { if (on) tone(880, 0.02, 0.12); },
  };
})();

// ---------------------------------------------------------------- build
function build() {
  $('#panel').innerHTML = FLOORS.map((f, i) => `<button type="button" data-go="${i}" aria-label="Floor ${f.n}, ${f.name}">${f.n}<span>${f.name}</span></button>`).join('');
  $('#wMedia').innerHTML = PROJECTS.map((p, i) => `<div class="w-slide" data-i="${i}">${p.video ? `<video muted loop playsinline preload="none" poster="${p.poster}" data-src="${p.video}"></video>` : `<img src="${p.cover}" alt="${p.title}" loading="lazy">`}</div>`).join('');
  $('#wList').innerHTML = PROJECTS.map((p, i) => `<li><button type="button" data-p="${i}">${p.title}</button></li>`).join('');
  $('#wTot').textContent = pad(PROJECTS.length);
  const rows = [[], [], []]; SNAPS.forEach((s, i) => rows[i % 3].push(s));
  $('#sRows').innerHTML = rows.map((r, k) => `<div class="s-row${k === 1 ? ' rev' : ''}"><div class="s-track" style="--t:${[80, 96, 72][k]}s">${[...r, ...r].map(([src, cap]) => `<figure data-cur="${cap}"><img src="${src}" alt="${cap}" loading="lazy" draggable="false"></figure>`).join('')}</div></div>`).join('');
  $('#names').innerHTML = CLIENTS.map((n, i) => `<li style="--d:${(0.12 + i * 0.045).toFixed(2)}s">${n}</li>`).join('');
  $('#winsList').innerHTML = WINS.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('');
  $('#vShots').innerHTML = [['assets/vbo/carvesx-1.jpg', 'CarvesX, product visual'], ['assets/vbo/carvesx-5.jpg', 'CarvesX, launch ad'], ['assets/vbo/carvesx-6.jpg', 'CarvesX, campaign']]
    .map(([s, c]) => `<figure class="r" data-cur="View" data-lb="${s}" data-cap="${c}"><img src="${s}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`).join('');
  $('#strip').innerHTML = PHOTOS.map(([s, c]) => `<figure data-cur="View" data-lb="${s}" data-cap="${c}"><img src="${s}" alt="${c}" loading="lazy" draggable="false"><figcaption>${c}</figcaption></figure>`).join('');
  const mq = '<span>Chai <em>sips</em> ☕&#xFE0E;</span><span class="dim">·</span><span>Football <em>kicks</em> ⚽&#xFE0E;</span><span class="dim">·</span><span>Camera <em>clicks</em> [◉°]</span><span class="dim">·</span>';
  $('#mq').innerHTML = mq.repeat(4);
  $('#bPhotos').innerHTML = PEOPLE.map(([s, c]) => `<figure class="r" data-cur="View" data-lb="${s}" data-cap="${c}"><img src="${s}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`).join('');
  $('#tGrid').innerHTML = THOUGHTS.map(([h, p], i) => `<article class="t-card r"><b>${pad(i + 1)}</b><div><h3>${h}</h3><p>${p}</p></div></article>`).join('');
  // every image learns its own shape, so the strips keep true proportions
  $$('.strip img, .s-track img').forEach((im) => {
    const set = () => { if (im.naturalWidth) im.parentElement.style.setProperty('--a', (im.naturalWidth / im.naturalHeight).toFixed(3)); };
    if (im.complete) set(); else im.addEventListener('load', set, { once: true });
  });
  floors.forEach((f) => $$('.r', f).forEach((el, i) => el.style.setProperty('--d', `${(0.1 + i * 0.055).toFixed(3)}s`)));
}

// ---------------------------------------------------------------- display + panel
function setDisplay(i) {
  const f = FLOORS[i], num = $('#dispNum');
  num.animate([{ transform: 'translateY(-60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
  num.textContent = f.n; $('#dispName').textContent = f.name;
  $$('#panel button').forEach((b, k) => b.classList.toggle('on', k === i));
  html.classList.toggle('hero-3d', i === 0);
  history.replaceState(null, '', i ? `#${f.id}` : location.pathname + location.search);
}

// ---------------------------------------------------------------- one floor: the lift moves, the next floor slides in
function go(i) {
  i = Math.max(0, Math.min(N - 1, i));
  if (i === cur || busy || overlay) return;
  if (Math.abs(i - cur) > 1) { jump(i); return; }
  const dir = i > cur ? 1 : -1, A = floors[cur], B = floors[i];
  busy = true;
  const D = REDUCED ? 1 : 1050, E = 'cubic-bezier(.76,0,.24,1)';
  B.classList.remove('in'); B.classList.add('on'); B.style.zIndex = 3; A.style.zIndex = 2;
  B.scrollTop = 0;
  B.animate([{ transform: `translateY(${dir * 100}%)` }, { transform: 'translateY(0)' }], { duration: D, easing: E });
  A.animate([{ transform: 'translateY(0)', filter: 'brightness(1)' }, { transform: `translateY(${-dir * 26}%)`, filter: 'brightness(.3)' }], { duration: D, easing: E });
  if (dir > 0) { B.classList.remove('slab'); void B.offsetWidth; B.classList.add('slab'); }
  if (i === 0) html.classList.add('hero-3d');
  sfx.floor();
  leaving(cur);
  cur = i; setDisplay(i);
  setTimeout(() => B.classList.add('in'), D * 0.42);
  setTimeout(() => { A.classList.remove('on', 'in'); A.style.zIndex = ''; B.style.zIndex = ''; busy = false; arrived(i); }, D);
}

// ---------------------------------------------------------------- many floors: close the doors, count, open
async function jump(i) {
  if (busy) return;
  busy = true;
  const from = cur, dir = i > from ? 1 : -1;
  $('#ddCap').textContent = dir > 0 ? 'Going down' : 'Going up';
  setDD(FLOORS[from].n);
  doors.classList.remove('open'); doors.classList.add('shut', 'show-dd');
  await sleep(1000);
  for (let k = from + dir; dir > 0 ? k <= i : k >= i; k += dir) {
    await sleep(70); setDD(FLOORS[k].n); sfx.tick();
    await sleep(60);
  }
  leaving(from);
  floors[from].classList.remove('on', 'in');
  floors[i].classList.remove('in'); floors[i].classList.add('on'); floors[i].scrollTop = 0;
  cur = i; setDisplay(i);
  await sleep(200);
  sfx.ding();
  doors.classList.remove('show-dd'); doors.classList.add('open');
  setTimeout(() => floors[i].classList.add('in'), REDUCED ? 0 : 380);
  await sleep(1050);
  doors.classList.remove('shut');
  busy = false; arrived(i);
}

function leaving(i) {
  if (FLOORS[i].id === 'work') $$('#wMedia video').forEach((v) => v.pause());
}
function arrived(i) {
  if (FLOORS[i].id === 'work') playProject();
}

// ---------------------------------------------------------------- work: one project at a time
function setProject(i, first = false) {
  const n = PROJECTS.length; i = ((i % n) + n) % n;
  const slides = $$('.w-slide'), prev = slides[pj];
  if (!first && i === pj) return;
  if (!first) { prev.classList.remove('on'); prev.classList.add('out'); setTimeout(() => prev.classList.remove('out'), 1100); const v = $('video', prev); v && v.pause(); }
  slides[i].classList.remove('out'); slides[i].classList.add('on');
  pj = i;
  const p = PROJECTS[i];
  $('#wNum').textContent = pad(i + 1);
  [['#wTitle', p.title], ['#wSub', p.sub], ['#wRole', p.role], ['#wYear', p.year], ['#wClient', p.client]].forEach(([s, t]) => { $(s).textContent = t; });
  if (!first) ['#wTitle', '#wSub', '.w-meta'].forEach((s) => { const el = $(s); el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  $$('#wList button').forEach((b, k) => b.classList.toggle('on', k === i));
  if (!first) sfx.tick();
  if (FLOORS[cur].id === 'work') playProject();
}
function playProject() {
  const v = $('video', $$('.w-slide')[pj]);
  if (!v) return;
  if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; }
  v.play().catch(() => {});
}

// ---------------------------------------------------------------- case study
function openCase(i) {
  const n = PROJECTS.length; i = ((i % n) + n) % n;
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % n];
  const el = $('#case'), sc = $('#caseScroll');
  sc.innerHTML = `<p class="label">Case study ${pad(i + 1)} / ${pad(n)}</p>
    <header class="cs-head"><div><h2 class="cs-title" id="caseTitle">${p.title}</h2><p class="cs-sub">${p.sub}</p></div>${p.url ? `<a class="btn solid cs-live" href="${p.url}" target="_blank" rel="noopener">Visit the live site</a>` : ''}</header>
    <div class="cs-media">${p.video ? `<video src="${p.video}" poster="${p.poster}" autoplay muted loop playsinline></video>` : `<img src="${p.cover}" alt="${p.title}">`}</div>
    <div class="cs-meta"><div><p class="tag">For</p><p>${p.client}</p></div><div><p class="tag">Role</p><p>${p.role}</p></div><div><p class="tag">Year</p><p>${p.year}</p></div><div><p class="tag">Services</p><p>${p.services.join(', ')}</p></div></div>
    <div class="cs-body">${p.body.map(([h, t]) => `<section><h3>${h}</h3><p>${t}</p></section>`).join('')}</div>
    ${p.credit ? `<p class="cs-credit">${p.credit}</p>` : ''}
    <button class="cs-next" type="button" data-case="${(i + 1) % n}"><span class="tag">Next case</span><b>${next.title}</b></button>`;
  sc.scrollTop = 0;
  if (overlay === 'case') { sc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); return; }
  overlay = 'case';
  $$('#wMedia video').forEach((v) => v.pause());
  el.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  setTimeout(() => $('#caseX').focus({ preventScroll: true }), 300);
  sfx.ding();
}
function closeCase() {
  const el = $('#case');
  el.classList.remove('open');
  setTimeout(() => { el.hidden = true; $('#caseScroll').innerHTML = ''; }, REDUCED ? 0 : 1000);
  overlay = null;
  if (FLOORS[cur].id === 'work') playProject();
}

// ---------------------------------------------------------------- lightbox
function openLB(src, cap) {
  const lb = $('#lb'); $('#lbImg').src = src; $('#lbImg').alt = cap; $('#lbCap').textContent = cap;
  overlay = 'lb'; lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open'));
}
function closeLB() { const lb = $('#lb'); lb.classList.remove('open'); overlay = null; setTimeout(() => { lb.hidden = true; }, 450); }

// ---------------------------------------------------------------- input
let lastWheel = 0, acc = 0, locked = false;
function scrollableEdge(el, dy) {
  if (el.scrollHeight <= el.clientHeight + 4) return true;
  if (dy > 0) return el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  return el.scrollTop <= 1;
}
function onWheel(e) {
  if (overlay || html.classList.contains('menu')) return;
  const t = performance.now();
  if (t - lastWheel > 230) { locked = false; acc = 0; }
  lastWheel = t;
  const strip = e.target.closest && e.target.closest('.strip');
  if (strip) {
    const max = strip.scrollWidth - strip.clientWidth, d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if ((d > 0 && strip.scrollLeft < max - 2) || (d < 0 && strip.scrollLeft > 2)) { e.preventDefault(); strip.scrollLeft += d; locked = true; return; }
  }
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const f = floors[cur];
  if (!scrollableEdge(f, e.deltaY)) return; // let a tall floor scroll first
  e.preventDefault();
  if (busy || locked) return;
  acc += e.deltaY;
  if (Math.abs(acc) > 36) { locked = true; go(cur + Math.sign(acc)); acc = 0; }
}
let ty = 0, tx = 0, tt = 0;
function onTouchStart(e) { const p = e.touches[0]; ty = p.clientY; tx = p.clientX; tt = performance.now(); }
function onTouchEnd(e) {
  if (overlay || busy) return;
  const p = e.changedTouches[0], dy = ty - p.clientY, dx = tx - p.clientX;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 50 && e.target.closest && e.target.closest('.w-media')) setProject(pj + Math.sign(dx));
    return;
  }
  if (Math.abs(dy) < 60 || performance.now() - tt > 900) return;
  if (!scrollableEdge(floors[cur], dy)) return;
  go(cur + Math.sign(dy));
}
function onKey(e) {
  if (e.key === 'Escape') { if (html.classList.contains('menu')) menu(false); else if (overlay === 'case') closeCase(); else if (overlay === 'lb') closeLB(); return; }
  if (overlay) return;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
  else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
  else if (e.key === 'Home') { e.preventDefault(); go(0); }
  else if (e.key === 'End') { e.preventDefault(); go(N - 1); }
  else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && FLOORS[cur].id === 'work') setProject(pj + (e.key === 'ArrowRight' ? 1 : -1));
  else if (e.key === 'Enter' && FLOORS[cur].id === 'work' && document.activeElement === document.body) openCase(pj);
}

// cursor
const cur_ = { x: -100, y: -100, cx: -100, cy: -100 };
function cursorLoop() {
  cur_.cx += (cur_.x - cur_.cx) * 0.22; cur_.cy += (cur_.y - cur_.cy) * 0.22;
  $('#cur').style.transform = `translate(${cur_.cx.toFixed(1)}px, ${cur_.cy.toFixed(1)}px)`;
  requestAnimationFrame(cursorLoop);
}

function wire() {
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchend', onTouchEnd, { passive: true });
  addEventListener('keydown', onKey);
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); menu(false); if (overlay === 'case') closeCase(); go(+g.dataset.go); return; }
    if (e.target.closest('#disp')) { menu(!html.classList.contains('menu')); return; }
    if (e.target.closest('#scrim')) { menu(false); return; }
    const pb = e.target.closest('[data-p]'); if (pb) { setProject(+pb.dataset.p); return; }
    const cs = e.target.closest('[data-case]'); if (cs) { openCase(+cs.dataset.case); return; }
    const lbf = e.target.closest('[data-lb]'); if (lbf && !dragged) { openLB(lbf.dataset.lb, lbf.dataset.cap); return; }
    if (e.target.closest('.w-media')) { openCase(pj); return; }
    if (cur === 0 && hero && !e.target.closest('a,button')) hero.kick(7);
  });
  $('#wOpen').addEventListener('click', () => openCase(pj));
  $('#wPrev').addEventListener('click', () => setProject(pj - 1));
  $('#wNext').addEventListener('click', () => setProject(pj + 1));
  $('#caseX').addEventListener('click', closeCase);
  $('#lbX').addEventListener('click', closeLB);
  $('#lb').addEventListener('click', (e) => { if (e.target === $('#lb')) closeLB(); });
  $('#snd').addEventListener('click', (e) => { const on = sfx.toggle(); e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.textContent = on ? 'Sound on' : 'Sound off'; });
  $('#cMail').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(LINKS.email); $('#cMailT').textContent = 'Copied. Talk soon.'; }
    catch (err) { location.href = `mailto:${LINKS.email}`; }
    setTimeout(() => { $('#cMailT').textContent = 'Click to copy'; }, 2600);
  });
  $$('.btn, .rnd, .panel button, .w-list button, .logo').forEach((b) => b.addEventListener('pointerenter', () => sfx.tick()));
  // drag the photo strip
  const strip = $('#strip'); let down = null;
  strip.addEventListener('pointerdown', (e) => { down = { x: e.clientX, s: strip.scrollLeft }; dragged = false; strip.classList.add('drag'); });
  addEventListener('pointermove', (e) => {
    cur_.x = e.clientX; cur_.y = e.clientY;
    if (down) { const d = e.clientX - down.x; if (Math.abs(d) > 5) dragged = true; strip.scrollLeft = down.s - d; }
    if (hero) { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); }
  }, { passive: true });
  addEventListener('pointerup', () => { if (down) { down = null; strip.classList.remove('drag'); setTimeout(() => { dragged = false; }, 0); } });
  // cursor labels
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest && e.target.closest('[data-cur], .w-media, .strip');
    const c = $('#cur');
    if (t) { c.classList.add('big'); $('#curT').textContent = t.classList.contains('w-media') ? 'Open' : t.classList.contains('strip') ? 'Drag' : t.dataset.cur === 'View' ? 'View' : 'View'; }
    else c.classList.remove('big');
  });
  // clock in Dubai
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' });
  const tick = () => { $('#clock').textContent = fmt.format(new Date()).toLowerCase(); };
  tick(); setInterval(tick, 20000);
  addEventListener('resize', resize);
}
let dragged = false;
const ptr = { x: 0, y: 0 };

// ---------------------------------------------------------------- hero render loop
let last = 0, clock = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
  clock += dt;
  if (hero && !document.hidden) hero.render(clock, dt, ptr, html.classList.contains('hero-3d'));
}
function resize() {
  if (hero) hero.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 1.75));
}

// ---------------------------------------------------------------- the loader: ride up to the top floor
async function boot() {
  busy = true;
  const want = qs.has('f') ? +qs.get('f') : FLOORS.findIndex((f) => `#${f.id}` === location.hash);
  build();
  wire();
  setProject(0, true);
  if (!TOUCH) requestAnimationFrame(cursorLoop);
  doors.classList.add('show-dd');
  // greetings while the lift climbs
  let g = 0;
  const gt = setInterval(() => {
    const el = $('#ddGreet'); el.classList.add('swap');
    setTimeout(() => { g = (g + 1) % GREETINGS.length; el.textContent = GREETINGS[g][0]; el.lang = GREETINGS[g][1]; el.classList.remove('swap'); }, 360);
  }, 1100);
  let progress = 0, shown = -1;
  const t0 = performance.now(), minT = REDUCED ? 200 : 3200;
  const tasks = [
    Promise.race([document.fonts.ready, sleep(3000)]),
    import('./hero.js').then(({ createHero }) => { hero = createHero($('#gl'), { mobile: innerWidth < 761 }); resize(); }).catch((e) => console.warn('hero 3d off', e)),
    ...['assets/people/portrait.jpg', 'assets/work/zero.jpg', 'assets/media/case-zero.jpg'].map((src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })),
  ];
  let done = 0; tasks.forEach((p) => p.then(() => { done++; }));
  await new Promise((resolve) => {
    const step = () => {
      const time = Math.min(1, (performance.now() - t0) / minT);
      progress = Math.min(time, (done / tasks.length) * 0.85 + time * 0.15);
      const fl = Math.min(N - 1, Math.floor(progress * N)); // 0..9 -> G..10
      const label = FLOORS[N - 1 - fl].n;
      if (fl !== shown) { shown = fl; setDD(label); }
      if (progress >= 1 && done >= tasks.length) resolve(); else requestAnimationFrame(step);
    };
    step();
  });
  clearInterval(gt);
  $('#ddCap').textContent = 'Top floor';
  await sleep(520);
  sfx.ding();
  window.__v14Booted = true; clearTimeout(window.__fs);
  html.classList.remove('loading'); html.classList.add('ready', 'hero-3d');
  floors[0].classList.add('on');
  requestAnimationFrame(loop);
  doors.classList.remove('show-dd'); doors.classList.add('open');
  if (hero) hero.restart();
  await sleep(420);
  floors[0].classList.add('in');
  setDisplay(0);
  busy = false;
  if (want > 0) { await sleep(qs.has('f') ? 900 : 1600); jump(want); }
}

window.__v14 = { go, jump: (i) => jump(i), open: openCase, close: closeCase, get cur() { return cur; }, project: setProject };
boot();
