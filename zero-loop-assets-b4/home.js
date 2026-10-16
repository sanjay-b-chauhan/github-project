/* Zero home b4. One pill: the level on the left, your photo (the coach) on the right.
   Click either side and the pill grows into the panel; its two halves become the tabs. Click the open side again to close. */
(function () {
  'use strict';
  var D = window.HD, A = D.A;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lvOf(p) { return Math.min(10, Math.floor(p / 1000)); }

  var IC = {
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M3.5 10h13M10 3c2 2.2 2.9 4.6 2.9 7s-.9 4.8-2.9 7c-2-2.2-2.9-4.6-2.9-7S8 5.2 10 3z"/></svg>',
    spark: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 2.5c.5 3.6 2 5.4 7 7.5-5 2.1-6.5 3.9-7 7.5-.5-3.6-2-5.4-7-7.5 5-2.1 6.5-3.9 7-7.5z"/></svg>',
    bag: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6.5" width="14" height="10" rx="2.5"/><path d="M7.5 6.5V5.2c0-.9.7-1.7 1.7-1.7h1.6c1 0 1.7.8 1.7 1.7v1.3"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"/></svg>',
    up: '<svg class="tr up" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5v-7M3 5.2 6 2.4l3 2.8"/></svg>',
    dn: '<svg class="tr dn" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5v-7M3 5.2 6 2.4l3 2.8"/></svg>',
    play: '<svg viewBox="0 0 12 12"><path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.8 4.2c0-.9.7-1.6 1.6-1.6h7.2c.9 0 1.6.7 1.6 1.6v5c0 .9-.7 1.6-1.6 1.6H7l-2.8 2.4v-2.4h0c-.8 0-1.4-.7-1.4-1.6z"/></svg>',
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2 3 3.8v3.8c0 3 2.1 5.3 5 6.4 2.9-1.1 5-3.4 5-6.4V3.8z"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2 1.4"/></svg>'
  };

  function logo(k, size) {
    var c = D.CO[k] || [k, ''], s = size || 24;
    if (c[1] === 'png') return '<span class="lg png" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><img alt="" src="' + A + 'logo/' + k + '.png"></span>';
    if (c[1] === 'svg') return '<span class="lg" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><i class="mk" style="--c:' + (c[2] || '#111') + ';--m:url(' + A + 'logo/' + k + '.svg)"></i></span>';
    return '<span class="lg ltr" style="--l:' + s + 'px;--c:' + (c[2] || '#111') + '" title="' + esc(c[0]) + '"><span class="lt">' + esc(c[0].charAt(0)) + '</span></span>';
  }
  function badge(lv) {
    if (lv < 1) return '<span class="bdg0">0</span>';
    return '<img class="bdg" alt="Level ' + lv + ' badge" src="' + A + 'badge/b' + lv + '.webp">';
  }

  /* ---------- state ---------- */
  var q = new URLSearchParams(location.search);
  var S = {};
  function load(key) {
    var st = D.STATES[key] || D.STATES.l2;
    S.key = D.STATES[key] ? key : 'l2';
    S.pts = st.pts; S.done = st.done.slice(); S.coach = clone(st.coach); S.step = 0;
    S.dot = !!st.fresh; S.openLv = null; S.openRd = S.coach.focus || null; S.help = null; S.gain = 0; S.flash = [];
  }
  function lv() { return lvOf(S.pts); }
  function into() { return lv() >= 10 ? 1 : (S.pts - lv() * 1000) / 1000; }
  function W() { return Math.min(432, innerWidth - 40); }

  /* ---------- the page ---------- */
  function page() {
    document.body.innerHTML =
      '<div class="h-world" aria-hidden="true"></div><div class="h-shade" aria-hidden="true"></div>' +
      '<div class="h-word" aria-label="Zero"></div>' +
      '<nav class="h-rail" aria-label="Zero"><button class="on" aria-label="World">' + IC.world + '</button><button aria-label="Skills">' + IC.spark + '</button><button aria-label="Jobs">' + IC.bag + '</button></nav>' +
      '<div class="h-road" aria-label="Your scenarios"></div>' +
      '<div class="dk"><div class="dk-bg"></div>' +
        '<div class="pill" role="tablist" aria-label="Level and coach">' +
          '<button class="seg lv" role="tab" data-tab="level"></button><i class="sep"></i>' +
          '<button class="seg co" role="tab" data-tab="coach" aria-label="Your coach, ' + esc(D.COACH.name) + '"><span class="me"><img alt="" src="' + D.COACH.photo + '"><i class="dot"></i></span><span class="lbl">Coach</span></button>' +
        '</div>' +
        '<div class="dk-body"><div><div class="dk-sc"></div></div></div>' +
      '</div>' +
      '<div class="dev" aria-label="Prototype controls"><span class="lab">View as</span>' +
        Object.keys(D.STATES).map(function (k) { return '<button data-s="' + k + '">' + esc(D.STATES[k].label) + '</button>'; }).join('') +
        '<i class="gap"></i><button class="play"></button><em>b4</em></div>';
    fetch(A + 'zero-wordmark.svg').then(function (r) { return r.text(); }).then(function (t) { $('.h-word').innerHTML = t.replace(/<\?xml[^>]*>/, ''); }).catch(function () {});
    $$('.seg').forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    $$('.dev [data-s]').forEach(function (b) { b.addEventListener('click', function () { var t = S.tab; load(b.getAttribute('data-s')); draw(); if (t) open(t, true); }); });
    $('.dev .play').addEventListener('click', play);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('pointerdown', function (e) { if (S.tab && !e.target.closest('.dk,.dev')) close(); });
    $('.dk-sc').addEventListener('scroll', fade);
    addEventListener('resize', function () { if (S.tab) $('.dk').style.width = W() + 'px'; else fitClosed(); });
    draw();
  }

  /* ---------- the pill and the road ---------- */
  function draw() {
    $$('.dev [data-s]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-s') === S.key); });
    var L = lv();
    $('.seg.lv').innerHTML = badge(L) + '<span class="tx"><b>Level ' + L + '</b><span class="mini"><i style="width:' + Math.round(into() * 100) + '%"></i></span></span>';
    $('.seg.lv').setAttribute('aria-label', 'Level ' + L + ', ' + n(S.pts) + ' skill points');
    $('.dot').classList.toggle('on', S.dot);
    $('.h-road').innerHTML = S.done.map(function (k) { return '<span class="rd" title="' + esc((D.CO[k] || [k])[0]) + '">' + logo(k, 22) + '<i class="ck">' + IC.check + '</i></span><span class="ln"></span>'; }).join('') +
      '<span class="rd next" title="Your next scenario"></span><span class="ln"></span><span class="bag" title="Jobs">' + IC.bag + '</span>';
    playLabel();
    if (!S.tab) fitClosed();
  }
  /* the closed pill is as wide as its contents. Measured on an invisible copy, so a half finished animation never skews it */
  function closedW() {
    var g = document.createElement('div'); g.className = 'dk';
    g.style.cssText = 'visibility:hidden;left:-9999px;right:auto;width:auto;transition:none;pointer-events:none';
    var p = $('.pill').cloneNode(true); $$('.seg', p).forEach(function (x) { x.classList.remove('on'); });
    g.appendChild(p); document.body.appendChild(g);
    var w = Math.ceil(g.getBoundingClientRect().width / (parseFloat(getComputedStyle(g).zoom) || 1)); g.remove(); return w;
  }
  function fitClosed() { $('.dk').style.width = closedW() + 'px'; }

  /* ---------- open, switch, close ---------- */
  function toggle(tab) { if (S.tab === tab) close(); else open(tab); }
  function open(tab, redraw) {
    var was = S.tab; S.tab = tab;
    var dk = $('.dk');
    dk.classList.add('open'); dk.style.width = W() + 'px';
    $$('.seg').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (tab === 'coach' && S.dot) { S.dot = false; $('.dot').classList.remove('on'); }
    if (was !== tab || redraw) render();
  }
  function close() {
    if (!S.tab) return;
    S.tab = null; S.help = null;
    var dk = $('.dk');
    dk.classList.remove('open');
    $$('.seg').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    dk.style.width = closedW() + 'px';
  }
  function render() {
    var sc = $('.dk-sc'); sc.scrollTop = 0;
    sc.innerHTML = '<div class="view">' + (S.tab === 'level' ? levelView() : coachView()) + '</div>';
    if (S.tab === 'level') wireLevel(); else wireCoach();
    setTimeout(fade, 520);
  }
  function fade() { var sc = $('.dk-sc'); if (sc) sc.classList.toggle('more', sc.scrollHeight - sc.scrollTop - sc.clientHeight > 4); }
  function wireHelp() {
    $$('.q').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-q'); S.help = S.help === k ? null : k;
        b.classList.toggle('on', S.help === k); $('.help[data-q="' + k + '"]').classList.toggle('on', S.help === k);
        setTimeout(fade, 450);
      });
    });
  }

  /* ---------- Level ---------- */
  function levelView() {
    var L = lv(), next = Math.min(10, L + 1), nx = D.LEVELS[next - 1];
    if (S.openLv == null) S.openLv = L < 10 ? next : 10;
    var h = '<div class="lv-hero">' + badge(L) + '<div><h2>Level ' + L + '</h2><div class="pts">' + n(S.pts) + ' skill points' + (S.gain ? '<span class="gain">+' + n(S.gain) + '</span>' : '') + '</div></div>' +
      '<button class="q' + (S.help === 'lv' ? ' on' : '') + '" data-q="lv" aria-label="How levels work">?</button></div>' +
      '<div class="help' + (S.help === 'lv' ? ' on' : '') + '" data-q="lv"><div><div class="help-in">' +
        '<p>Skill points come only from finished scenarios. Your manager grades the work, and better work pays more.</p>' +
        '<div class="bands">' + D.PAY.map(function (p) { return '<span><i style="background:' + p.c + '"></i>' + esc(p.name) + ' <b>' + n(p.pts) + '</b></span>'; }).join('') + '</div>' +
        '<p style="margin-top:10px">Every 1,000 points is a level, and every level opens new roles.</p>' +
      '</div></div></div>' +
      '<div class="lv-prog"><div class="lv-track"><i data-w="' + Math.round(into() * 100) + '"></i></div>' +
      '<div class="lv-meta">' + (L >= 10 ? '<span><b>Top level</b></span>' : '<span><b>' + n(next * 1000 - S.pts) + ' more</b> to Level ' + next + '</span><span>Opens ' + nx.roles + ' roles</span>') + '</div></div>' +
      '<div class="lv-hd cap">What each level opens</div>' +
      '<div class="lv-list"><span class="lv-line" aria-hidden="true"><i></i></span>' +
      D.LEVELS.map(function (x) {
        var state = x.n === L ? 'now' : x.n < L ? 'past' : 'fut';
        var sub = x.n === L ? '<span class="here">You are here</span>' : x.n < L ? '<span>Reached</span>' : '<span>' + n(x.pts) + ' skill points</span>';
        var shown = x.cos.slice(0, 6);
        return '<div class="lv-row ' + state + (S.openLv === x.n ? ' open' : '') + '" data-n="' + x.n + '">' +
          '<button class="lv-btn" aria-expanded="' + (S.openLv === x.n) + '">' + badge(x.n) +
          '<span class="lv-tx"><b>Level ' + x.n + '</b>' + sub + '</span><span class="lv-rt">' + x.roles + ' roles</span><span class="lv-cv">' + IC.chev + '</span></button>' +
          '<div class="lv-more"><div><div class="lv-x"><div><div class="kind">' + esc(x.kind) + ' · ' + esc(x.pay) + '</div>' +
            '<div class="stk">' + shown.map(function (k) { return logo(k, 28); }).join('') + '</div></div>' +
            '<a class="all" href="' + D.PORTAL + '" target="_blank" rel="noopener">View all' + IC.out + '</a></div></div></div></div>';
      }).join('') + '</div>';
    return h;
  }
  function wireLevel() {
    wireHelp();
    requestAnimationFrame(function () { var b = $('.lv-track i'); if (b) b.style.width = b.getAttribute('data-w') + '%'; line(true); });
    $$('.lv-row').forEach(function (r) {
      $('.lv-btn', r).addEventListener('click', function () {
        var k = +r.getAttribute('data-n'); S.openLv = S.openLv === k ? -1 : k;
        $$('.lv-row').forEach(function (o) { var on = +o.getAttribute('data-n') === S.openLv; o.classList.toggle('open', on); $('.lv-btn', o).setAttribute('aria-expanded', on); });
        var t0 = performance.now(); (function f() { line(false); if (performance.now() - t0 < 600) requestAnimationFrame(f); })();
        if (S.openLv === k) setTimeout(function () { var sc = $('.dk-sc'), rr = r.getBoundingClientRect(), br = sc.getBoundingClientRect(); if (rr.bottom > br.bottom - 8) sc.scrollBy({ top: rr.bottom - br.bottom + 20, behavior: 'smooth' }); fade(); }, 400);
      });
    });
  }
  /* the line down the badges, filled up to where you are */
  function line(grow) {
    var list = $('.lv-list'), ln = $('.lv-line'); if (!list || !ln) return;
    var rows = $$('.lv-row'), mid = function (k) { var b = $('.bdg,.bdg0', rows[k]).getBoundingClientRect(); return b.top + b.height / 2 - list.getBoundingClientRect().top; };
    var top = mid(0), bot = mid(rows.length - 1); ln.style.top = top + 'px'; ln.style.height = (bot - top) + 'px';
    var L = lv(), fill = 0;
    if (L >= 1) { fill = mid(L - 1) - top; if (L < 10) fill += (mid(L) - mid(L - 1)) * into(); }
    var i = $('i', ln);
    if (grow) { i.style.transition = 'none'; i.style.height = '0px'; void i.offsetHeight; i.style.transition = ''; } else i.style.transition = 'none';
    i.style.height = Math.max(0, fill) + 'px';
  }

  /* ---------- Coach ---------- */
  function readRow(rd) {
    var x = S.coach.reads[rd.key] || {}, v = x.v || 0;
    var tone = v === 0 ? '' : v >= 4 ? 'g' : v <= 2 ? 'w' : '';
    var pc = v === 0 ? 'none' : v >= 4 ? 'hi' : v <= 2 ? 'lo' : 'mid';
    var pips = '<span class="pips ' + pc + '">' + [1, 2, 3, 4, 5].map(function (k) { return '<i class="' + (k <= v ? 'on' : '') + '"></i>'; }).join('') + '</span>';
    var line = v === 0 ? '' : x.line;
    var open = S.openRd === rd.key && v > 0;
    return '<div class="cr' + (open ? ' open' : '') + (S.flash.indexOf(rd.key) >= 0 ? ' flash' : '') + '" data-k="' + rd.key + '">' +
      '<button class="cr-btn"' + (v === 0 ? ' disabled' : '') + ' aria-expanded="' + open + '"><span class="cr-ic ' + tone + '">' + IC[rd.icon] + '</span>' +
      '<span class="cr-tx"><b>' + esc(rd.key) + '</b>' + (line ? '<span>' + esc(line) + '</span>' : '') + '</span>' +
      '<span class="cr-m">' + (x.t > 0 ? IC.up : x.t < 0 ? IC.dn : '') + pips + '</span></button>' +
      (v > 0 ? '<div class="cr-more"><div><div class="cr-in"><div class="saw"><b>What I saw</b> ' + esc(x.saw) + '</div>' + (x.tip ? '<div class="try"><b>Try</b>' + esc(x.tip) + '</div>' : '') + '</div></div></div>' : '') +
      '</div>';
  }
  function coachView() {
    var c = S.coach, L = lv(), nxt = Math.min(10, L + 1);
    return '<div class="co-hero"><img class="co-face" alt="' + esc(D.COACH.name) + '" src="' + D.COACH.photo + '"><div><p>' + esc(c.think) + '</p><div class="co-when' + (c.live ? ' live' : '') + '"><i></i>' + esc(c.when) + '</div></div>' +
      '<button class="q' + (S.help === 'co' ? ' on' : '') + '" data-q="co" aria-label="How your coach reads you">?</button></div>' +
      '<div class="help' + (S.help === 'co' ? ' on' : '') + '" data-q="co"><div><div class="help-in">' +
        '<p>After every stage I look at four things: how you keep your manager in the loop, how much you do on your own, the quality of what you send, and your pace.</p>' +
        '<p>Your manager grades the work. I help you get better at it, and I only speak up when something changes.</p>' +
      '</div></div></div>' +
      '<div class="co-list">' + D.READS.map(readRow).join('') + '</div>' +
      '<div class="co-next">' + badge(nxt) + '<span>' + esc(c.next) + '</span></div>';
  }
  function wireCoach() {
    wireHelp();
    $$('.cr').forEach(function (r) {
      var b = $('.cr-btn', r); if (b.disabled) return;
      b.addEventListener('click', function () {
        var k = r.getAttribute('data-k'); S.openRd = S.openRd === k ? null : k;
        $$('.cr').forEach(function (o) { var on = o.getAttribute('data-k') === S.openRd; o.classList.toggle('open', on); $('.cr-btn', o).setAttribute('aria-expanded', on); });
        setTimeout(fade, 450);
      });
    });
    S.flash = [];
  }

  /* ---------- play: the next moment, so you can watch both react ---------- */
  function playLabel() {
    var ev = (D.STATES[S.key].play || [])[S.step], b = $('.dev .play');
    b.innerHTML = IC.play + (ev ? (ev.kind === 'stage' ? 'Play a stage' : 'Finish the scenario') : 'Start over');
  }
  function play() {
    var ev = (D.STATES[S.key].play || [])[S.step];
    if (!ev) { var t = S.tab; load(S.key); draw(); if (t) open(t, true); return; }
    S.step++;
    var c = S.coach;
    if (ev.kind === 'stage') {
      S.flash = [];
      Object.keys(ev.reads || {}).forEach(function (k) { var x = ev.reads[k]; c.reads[k] = Object.assign({}, c.reads[k], x); if (!x.tip) delete c.reads[k].tip; S.flash.push(k); });
      Object.keys(ev.tips || {}).forEach(function (k) { if (c.reads[k]) c.reads[k].tip = ev.tips[k]; });
      c.think = ev.think; c.when = ev.when; c.live = true; c.focus = ev.focus;
      S.openRd = ev.focus || S.flash[0] || null;
      if (S.tab !== 'coach') { S.dot = true; }
    } else {
      var was = lv(); S.pts += ev.pts; S.gain = ev.pts;
      if (ev.co && S.done.indexOf(ev.co) < 0) S.done.push(ev.co);
      c.think = ev.think; c.when = ev.when; c.next = ev.next; c.live = true;
      if (lv() > was) { S.openLv = null; setTimeout(function () { $('.seg.lv').classList.remove('bump'); void $('.seg.lv').offsetWidth; $('.seg.lv').classList.add('bump'); }, 60); }
      if (S.tab !== 'level' && S.tab !== 'coach') S.dot = true;
    }
    draw();
    if (S.tab) render();
    setTimeout(function () { S.gain = 0; }, 100);
  }

  window.H = { S: S, open: open, close: close, play: play, load: function (k) { load(k); draw(); } };
  load(q.get('s'));
  page();
  var op = q.get('open'), steps = parseInt(q.get('play'), 10) || 0;
  for (var i = 0; i < steps; i++) play();
  if (op === 'level' || op === 'coach') setTimeout(function () {
    open(op);
    var x = parseInt(q.get('x'), 10); if (x && op === 'level') { var r = $('.lv-row[data-n="' + x + '"] .lv-btn'); if (r && S.openLv !== x) r.click(); }
    var h = q.get('help'); if (h) { var hb = $('.q'); if (hb) hb.click(); }
  }, 500);
})();
