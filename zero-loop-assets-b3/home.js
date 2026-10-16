/* Zero home: one chip for the level and the coach. Click a side, its tab opens in the panel; click the other side, it switches. */
(function () {
  'use strict';
  var D = window.HD, A = D.A;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function lvOf(p) { return Math.min(10, Math.floor(p / 1000)); }

  var IC = {
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M3.5 10h13M10 3c2 2.2 2.9 4.6 2.9 7s-.9 4.8-2.9 7c-2-2.2-2.9-4.6-2.9-7S8 5.2 10 3z"/></svg>',
    spark: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 2.5c.5 3.6 2 5.4 7 7.5-5 2.1-6.5 3.9-7 7.5-.5-3.6-2-5.4-7-7.5 5-2.1 6.5-3.9 7-7.5z"/></svg>',
    bag: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6.5" width="14" height="10" rx="2.5"/><path d="M7.5 6.5V5.2c0-.9.7-1.7 1.7-1.7h1.6c1 0 1.7.8 1.7 1.7v1.3"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7m0-7-7 7"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.8 4.2c0-.9.7-1.6 1.6-1.6h7.2c.9 0 1.6.7 1.6 1.6v5c0 .9-.7 1.6-1.6 1.6H7l-2.8 2.4v-2.4h0c-.8 0-1.4-.7-1.4-1.6z"/></svg>',
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2 3 3.8v3.8c0 3 2.1 5.3 5 6.4 2.9-1.1 5-3.4 5-6.4V3.8z"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2 1.4"/></svg>',
    bulb: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5h4M6.6 14.2h2.8M5.4 10.2C4.4 9.4 3.8 8.2 3.8 6.9a4.2 4.2 0 0 1 8.4 0c0 1.3-.6 2.5-1.6 3.3-.4.3-.6.8-.6 1.3H6c0-.5-.2-1-.6-1.3z"/></svg>'
  };

  /* ---------- small builders ---------- */
  function logo(k, size) {
    var c = D.CO[k] || [k, ''], s = size || 24;
    if (c[1] === 'png') return '<span class="lg png" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><img alt="" src="' + A + 'logo/' + k + '.png"></span>';
    if (c[1] === 'svg') return '<span class="lg" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><i class="mk" style="--c:' + (c[2] || '#111') + ';--m:url(' + A + 'logo/' + k + '.svg)"></i></span>';
    return '<span class="lg ltr" style="--l:' + s + 'px;--c:' + (c[2] || '#111') + '" title="' + esc(c[0]) + '"><span class="lt">' + esc(c[0].charAt(0)) + '</span></span>';
  }
  function stack(keys, size) { return '<span class="stk">' + keys.map(function (k) { return logo(k, size || 22); }).join('') + '</span>'; }
  function badge(lv, cls) {
    if (lv < 1) return '<span class="bdg0 ' + (cls || '') + '">0</span>';
    return '<img class="bdg ' + (cls || '') + '" alt="Level ' + lv + ' badge" src="' + A + 'badge/b' + lv + '.webp">';
  }
  function zero() { return '<span class="zf" role="img" aria-label="Zero"><i></i><i></i></span>'; }
  function coName(k) { return (D.CO[k] || [k])[0]; }

  /* ---------- state ---------- */
  var q = new URLSearchParams(location.search);
  var S = { key: D.STATES[q.get('s')] ? q.get('s') : 'l2', tab: null, openLv: null, seen: false };
  function st() { return D.STATES[S.key]; }
  function lv() { return lvOf(st().pts); }
  function into() { var p = st().pts; return lv() >= 10 ? 1 : (p - lv() * 1000) / 1000; }

  /* ---------- the home ---------- */
  function home() {
    document.body.innerHTML =
      '<div class="h-world" aria-hidden="true"></div><div class="h-shade" aria-hidden="true"></div>' +
      '<div class="h-word" aria-label="Zero"></div>' +
      '<nav class="h-rail" aria-label="Zero"><button class="on" aria-label="World">' + IC.world + '</button><button aria-label="Skills">' + IC.spark + '</button><button aria-label="Jobs">' + IC.bag + '</button></nav>' +
      '<div class="h-road" aria-label="Your scenarios"></div>' +
      '<div class="h-top"><div class="h-chip" role="group" aria-label="Level and coach"></div><span class="h-me">' + '<img alt="Sanjay" src="' + D.ME.photo + '"></span></div>' +
      '<section class="h-pn" role="dialog" aria-label="Level and coach" aria-hidden="true"><div class="h-hd"><div class="h-tabs" role="tablist"><i class="ind"></i></div><button class="h-x" aria-label="Close">' + IC.x + '</button></div><div class="h-bd"></div></section>' +
      '<div class="h-dev" aria-label="Prototype: view as"><span>View as</span>' + Object.keys(D.STATES).map(function (k) { return '<button data-s="' + k + '">' + esc(D.STATES[k].label) + '</button>'; }).join('') + '<em>b3</em></div>';
    fetch(A + 'zero-wordmark.svg').then(function (r) { return r.text(); }).then(function (t) { $('.h-word').innerHTML = t.replace(/<\?xml[^>]*>/, ''); }).catch(function () {});
    $('.h-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('pointerdown', function (e) { if (S.tab && !e.target.closest('.h-pn,.h-chip,.h-dev')) close(); });
    $$('.h-dev button').forEach(function (b) { b.addEventListener('click', function () { setState(b.getAttribute('data-s')); }); });
    draw();
  }
  function draw() {
    var s = st(), L = lv(), coach = s.coach;
    $$('.h-dev button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-s') === S.key); });
    /* the chip: level on the left, coach on the right */
    $('.h-chip').innerHTML =
      '<button class="h-seg lvs" data-tab="level" aria-label="Level ' + L + ', open your levels">' + badge(L) + '<span class="t"><b>Level ' + L + '</b><span class="mini"><i style="width:0"></i></span></span></button>' +
      '<i class="h-div"></i>' +
      '<button class="h-seg cos" data-tab="coach" aria-label="Open your coach">' + zero() + '<span class="t"><b>Coach</b></span>' + (s.fresh && !S.seen ? '<i class="h-dot"></i>' : '') + '</button>';
    $$('.h-seg').forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    requestAnimationFrame(function () { var m = $('.h-seg .mini i'); if (m) m.style.width = Math.round(into() * 100) + '%'; });
    /* the road: the scenarios done, the next one, then jobs */
    var road = s.done.map(function (k) { return '<span class="rd" title="' + esc(coName(k)) + '">' + logo(k, 22) + '<i class="ck">' + IC.check + '</i></span><span class="ln"></span>'; }).join('');
    $('.h-road').innerHTML = road + '<span class="rd next" title="Your next scenario"></span><span class="ln"></span><span class="bag" title="Jobs">' + IC.bag + '</span>';
    /* the tabs */
    $('.h-tabs').innerHTML = '<i class="ind"></i>' +
      '<button class="h-tab" role="tab" data-tab="level">' + badge(L) + 'Level</button>' +
      '<button class="h-tab" role="tab" data-tab="coach">' + zero() + 'Coach' + (s.fresh && !S.seen ? '<i class="h-dot"></i>' : '') + '</button>';
    $$('.h-tab').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-tab')); }); });
    if (S.tab) show(S.tab, true);
    eyes();
  }

  /* ---------- open, switch, close ---------- */
  function toggle(tab) { if (S.tab === tab) close(); else show(tab); }
  function show(tab, redraw) {
    var was = S.tab; S.tab = tab;
    var pn = $('.h-pn'); pn.classList.add('open'); pn.setAttribute('aria-hidden', 'false');
    $('.h-chip').classList.add('open');
    $$('.h-seg').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === tab); });
    $('.h-tabs').setAttribute('data-tab', tab);
    $$('.h-tab').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    pn.style.transformOrigin = (tab === 'level' ? 'calc(100% - 210px)' : 'calc(100% - 90px)') + ' -10px';
    if (tab === 'coach' && !S.seen) { S.seen = true; $$('.h-dot').forEach(function (d) { d.classList.add('gone'); }); }
    if (was !== tab || redraw) {
      var bd = $('.h-bd'); bd.scrollTop = 0;
      bd.innerHTML = '<div class="h-view">' + (tab === 'level' ? levelHTML() : coachHTML()) + '</div>';
      if (tab === 'level') wireLevel(); else wireCoach();
      eyes();
    }
  }
  function close() {
    if (!S.tab) return;
    S.tab = null;
    var pn = $('.h-pn'); pn.classList.remove('open'); pn.setAttribute('aria-hidden', 'true');
    $('.h-chip').classList.remove('open');
    $$('.h-seg').forEach(function (b) { b.classList.remove('on'); });
  }
  function setState(k) {
    if (!D.STATES[k]) return;
    S.key = k; S.seen = false; S.openLv = null;
    try { history.replaceState(null, '', '?s=' + k + (S.tab ? '&open=' + S.tab : '')); } catch (e) {}
    draw();
  }

  /* ---------- the Level tab ---------- */
  function levelHTML() {
    var s = st(), L = lv(), next = Math.min(10, L + 1), nx = D.LEVELS[next - 1];
    if (S.openLv == null) S.openLv = L < 10 ? next : 10;
    var toGo = L >= 10 ? 0 : next * 1000 - s.pts;
    var head = '<div class="lv-now">' + badge(L) + '<div><h2>Level ' + L + '</h2><div class="pts">' + n(s.pts) + ' skill points</div></div></div>' +
      '<div class="lv-bar"><div class="lv-track"><i data-w="' + Math.round(into() * 100) + '"></i></div>' +
      '<div class="lv-meta">' + (L >= 10 ? '<span><b>Top level</b></span>' : '<span><b>' + n(toGo) + ' more</b> to Level ' + next + '</span><span>Opens ' + nx.roles + ' roles</span>') + '</div></div>';
    var rows = D.LEVELS.map(function (x) {
      var state = x.n < L + 1 ? (x.n === L ? 'now' : 'past') : 'fut';
      if (x.n <= L && x.n !== L) state = 'past';
      var sub = x.n === L ? '<span class="you">You are here</span>' : x.n < L ? '<span>Reached</span>' : '<span>' + n(x.pts) + ' skill points</span>';
      return '<div class="lv-row ' + state + (S.openLv === x.n ? ' open' : '') + '" data-n="' + x.n + '">' +
        '<button class="lv-btn" aria-expanded="' + (S.openLv === x.n) + '">' + badge(x.n) +
        '<span class="lv-tx"><b>Level ' + x.n + '</b>' + sub + '</span>' +
        '<span class="lv-rt">' + stack(x.cos.slice(0, 3), 22) + '<span>' + x.roles + ' roles</span></span>' +
        '<span class="lv-cv">' + IC.chev + '</span></button>' +
        '<div class="lv-more"><div><div class="lv-in">' +
          '<div class="lv-big"><b>' + x.roles + ' roles</b><span>' + esc(x.kind) + '</span></div>' +
          '<div class="lv-sub">' + esc(x.pay) + (x.n > L ? ' · opens at ' + n(x.pts) + ' skill points' : '') + '</div>' +
          '<ul class="lv-eg">' + x.eg.map(function (r) { return '<li>' + logo(r.co, 26) + '<div><b>' + esc(r.title) + '</b><span>' + esc(coName(r.co)) + ' · ' + esc(r.pay) + '</span></div></li>'; }).join('') + '</ul>' +
          '<div class="lv-and">and ' + (x.roles - x.eg.length) + ' more at ' + x.cos.map(coName).slice(0, 4).join(', ') + '</div>' +
          (x.also ? '<span class="lv-also">' + IC.spark + 'Also opens ' + esc(x.also) + '</span>' : '') +
        '</div></div></div></div>';
    }).join('');
    var how = '<div class="lv-how"><div class="lab">Skill points come only from scenarios. Better work pays more.</div><div class="lv-pay">' +
      D.PAY.map(function (p) { return '<span><i style="background:' + p.c + '"></i>' + esc(p.name) + '<b>' + n(p.pts) + '</b></span>'; }).join('') + '</div></div>';
    return head + '<div class="lv-hd"><span class="lab">Every level and what it opens</span><span class="lab">' + D.LEVELS.reduce(function (a, x) { return a + x.roles; }, 0) + ' roles in all</span></div>' +
      '<div class="lv-list"><span class="lv-line" aria-hidden="true"><i></i></span>' + rows + '</div>' + how;
  }
  function wireLevel() {
    requestAnimationFrame(function () {
      var bar = $('.lv-track i'); if (bar) bar.style.width = bar.getAttribute('data-w') + '%';
      placeLine(true);
    });
    $$('.lv-row').forEach(function (r) {
      $('.lv-btn', r).addEventListener('click', function () {
        var k = +r.getAttribute('data-n');
        S.openLv = S.openLv === k ? -1 : k;
        $$('.lv-row').forEach(function (o) { var on = +o.getAttribute('data-n') === S.openLv; o.classList.toggle('open', on); $('.lv-btn', o).setAttribute('aria-expanded', on); });
        var t0 = performance.now();
        (function f() { placeLine(false); if (performance.now() - t0 < 600) requestAnimationFrame(f); })();
        if (S.openLv === k) setTimeout(function () { var bd = $('.h-bd'), rr = r.getBoundingClientRect(), br = bd.getBoundingClientRect(); if (rr.bottom > br.bottom - 8) bd.scrollBy({ top: rr.bottom - br.bottom + 16, behavior: 'smooth' }); }, 380);
      });
    });
  }
  /* the line down the badges: grey from Level 1 to 10, ink up to where you are */
  function placeLine(grow) {
    var list = $('.lv-list'), line = $('.lv-line'); if (!list || !line) return;
    var rows = $$('.lv-row'), first = $('.bdg,.bdg0', rows[0]), last = $('.bdg,.bdg0', rows[rows.length - 1]);
    var lr = list.getBoundingClientRect(), f = first.getBoundingClientRect(), l = last.getBoundingClientRect();
    var top = f.top + f.height / 2 - lr.top, bot = l.top + l.height / 2 - lr.top;
    line.style.top = top + 'px'; line.style.height = (bot - top) + 'px';
    var L = lv(), fill = 0;
    if (L >= 1) {
      var cur = $('.bdg,.bdg0', rows[L - 1]).getBoundingClientRect(), cy = cur.top + cur.height / 2 - lr.top;
      fill = cy - top;
      if (L < 10) { var nx = $('.bdg,.bdg0', rows[L]).getBoundingClientRect(), ny = nx.top + nx.height / 2 - lr.top; fill += (ny - cy) * into(); }
    }
    var i = $('i', line);
    if (grow) { i.style.transition = 'none'; i.style.height = '0px'; void i.offsetHeight; i.style.transition = ''; }
    else i.style.transition = 'none';
    i.style.height = Math.max(0, fill) + 'px';
  }

  /* ---------- the Coach tab ---------- */
  function readIcon(read, tone) { return '<span class="co-ic ' + tone + '">' + IC[(D.READS[read] || {}).icon || 'spark'] + '</span>'; }
  function coachHTML() {
    var s = st(), c = s.coach, L = lv(), rec = D.SCN[c.rec];
    var h = '<div class="co-hd">' + zero() + '<div><b>' + esc(c.based) + '</b><span>' + esc(c.when || 'Updated 2 hours ago') + '</span></div></div>' +
      '<div class="co-think"><div class="lab">What I think so far</div><p>' + esc(c.think) + '</p></div>';
    if (c.watch) h += '<div class="co-sec"><div class="co-sl lab">What I will watch</div><div class="co-watch">' + c.watch.map(function (r) { return '<span>' + IC[(D.READS[r] || {}).icon] + esc(r) + '</span>'; }).join('') + '</div></div>';
    if (c.well.length) h += '<div class="co-sec"><div class="co-sl lab"><i style="background:#3CC878"></i>Doing well</div>' +
      c.well.map(function (w) { return '<div class="co-it">' + readIcon(w.read, 'g') + '<div><div class="rd">' + esc(w.read) + '</div><p>' + esc(w.line) + '</p></div></div>'; }).join('') + '</div>';
    if (c.improve.length) h += '<div class="co-sec"><div class="co-sl lab"><i style="background:#EBA640"></i>To improve</div>' +
      c.improve.map(function (w) { return '<div class="co-it">' + readIcon(w.read, 'w') + '<div><div class="rd">' + esc(w.read) + '</div><p>' + esc(w.line) + '</p><div class="co-try"><b>Try</b>' + esc(w.tip) + '</div></div></div>'; }).join('') + '</div>';
    h += '<div class="co-sec"><div class="co-sl lab">To reach Level ' + c.next.to + '</div><div class="co-next">' + badge(c.next.to) + '<div><p>' + esc(c.next.line) + '</p><span>' + esc(c.next.pts) + '</span></div></div></div>';
    if (rec) h += '<div class="co-sec"><div class="co-sl lab">A scenario for this</div><div class="co-rec">' + logo(rec.co, 40) +
      '<div><b>' + esc(rec.title) + '</b><span>' + esc(coName(rec.co)) + ' · trains ' + esc(rec.trains) + ' · up to ' + n(rec.pays) + ' skill points</span></div><button class="co-go">Open</button></div></div>';
    return h;
  }
  function wireCoach() { }

  /* ---------- Zero's eyes: they look around, nothing else moves ---------- */
  var gl = 0;
  function eyes() {
    clearTimeout(gl);
    (function look() {
      $$('.zf').forEach(function (z, i) {
        var a = Math.random() * Math.PI * 2, r = Math.random() < .35 ? 0 : 1;
        z.style.setProperty('--gx', (Math.cos(a) * r * 1.6).toFixed(2) + 'px');
        z.style.setProperty('--gy', (Math.sin(a) * r * 1.1).toFixed(2) + 'px');
      });
      gl = setTimeout(look, 2200 + Math.random() * 2400);
    })();
  }

  function fadeMore() { var bd = $('.h-bd'); if (bd) bd.classList.toggle('more', bd.scrollHeight - bd.scrollTop - bd.clientHeight > 4); }
  document.addEventListener('scroll', function (e) { if (e.target && e.target.classList && e.target.classList.contains('h-bd')) fadeMore(); }, true);
  setInterval(fadeMore, 400);
  window.H = { show: show, close: close, setState: setState, S: S };
  home();
  var op = q.get('open'); if (op === 'level' || op === 'coach') setTimeout(function () { show(op); var x = parseInt(q.get('x'), 10); if (x) { var r = $('.lv-row[data-n="' + x + '"] .lv-btn'); if (r && S.openLv !== x) r.click(); } }, 500);
})();
