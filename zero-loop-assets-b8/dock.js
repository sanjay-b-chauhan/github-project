/* Zero b8 dock: the level and the coach in one pill, top right of the app. It grows into the panel.
   Level: every level from 1, what it opens. Coach (Navid): what I think about you, what I like, areas for improvement, the reads.
   The engine calls DK.update(state) on every beat; screens call s.coach(note) for the short live notes. */
(function () {
  'use strict';
  var D = window.ZD, A = D.A, J = window.J;
  var $ = J.$, $$ = J.$$, esc = J.esc, n = J.n, logo = J.logo, badge = J.badge, IC = J.IC;
  var READS = ['Understanding', 'Quality', 'Communication', 'Independence', 'Speed'];
  var READ_IC = { Communication: 'chat', Independence: 'shield', Quality: 'star', Speed: 'clock', Understanding: 'bulb' };
  var USUAL = { exceptional: 87.5, exceeding: 62.5, meeting: 37.5, below: 12.5, under: 2 };

  var S = { coachKey: 'navi', tab: null, openLv: null, pop: null, dot: false, gain: 0, call: null, st: J.fresh(), root: null };
  function CO() { for (var i = 0; i < D.COACHES.length; i++) if (D.COACHES[i].key === S.coachKey) return D.COACHES[i]; return D.COACHES[0]; }
  function lv() { return D.levelOf(S.st.pts); }
  function into() { var L = lv(); return L >= 10 ? 1 : (S.st.pts - D.startOf(L)) / 1000; }
  function W() { return 432; }

  function mount(app) {
    var el = document.createElement('div');
    el.innerHTML = '<div class="toasts" aria-live="polite"></div>' +
      '<div class="dk"><div class="dk-bg"></div>' +
        '<div class="pill" role="tablist" aria-label="Level and coach">' +
          '<button class="seg lv" role="tab" data-tab="level"></button><i class="sep"></i>' +
          '<button class="seg co" role="tab" data-tab="coach" aria-label="Your coach"><span class="me"><img alt="" src="' + CO().photo + '"><i class="dot"></i></span><span class="lbl">Coach</span></button>' +
        '</div>' +
        '<div class="dk-body"><div><div class="dk-sc"></div></div></div>' +
      '</div>';
    while (el.firstChild) app.appendChild(el.firstChild);
    S.root = app;
    $$('.seg', app).forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.call) endCall(); else if (S.pop) setPop(null); else close(); } });
    document.addEventListener('pointerdown', function (e) {
      if (S.pop && !e.target.closest('.pop,.q,.ib.edit')) setPop(null);
      if (S.tab && !e.target.closest('.dk,.toasts,#ctl')) close();
    });
    $('.dk-sc').addEventListener('scroll', fade);
    draw();
  }

  function draw() {
    var L = lv();
    $('.seg.lv').innerHTML = badge(L) + '<span class="tx"><b>Level ' + L + '</b><span class="mini"><i style="width:' + Math.round(into() * 100) + '%"></i></span></span>';
    $('.seg.lv').setAttribute('aria-label', 'Level ' + L + ', ' + n(S.st.pts) + ' skill points');
    var img = $('.seg.co .me img'); if (img && img.getAttribute('src') !== CO().photo) img.src = CO().photo;
    $('.dk .dot').classList.toggle('on', S.dot);
    if (!S.tab) fitClosed();
  }
  function closedW() {
    var g = document.createElement('div'); g.className = 'dk';
    g.style.cssText = 'visibility:hidden;left:-9999px;right:auto;width:auto;transition:none;pointer-events:none';
    var p = $('.pill').cloneNode(true); $$('.seg', p).forEach(function (x) { x.classList.remove('on'); });
    g.appendChild(p); S.root.appendChild(g);
    var w = Math.ceil(g.getBoundingClientRect().width / (parseFloat(getComputedStyle(S.root).zoom) || 1)); g.remove(); return w;
  }
  function fitClosed() { $('.dk').style.width = closedW() + 'px'; }

  function toggle(tab) { if (S.tab === tab) close(); else open(tab); }
  function open(tab) {
    var was = S.tab; S.tab = tab;
    var dk = $('.dk'); dk.classList.add('open'); dk.style.width = W() + 'px';
    $('.toasts').classList.add('beside');
    $$('.seg').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (tab === 'coach' && S.dot) { S.dot = false; $('.dk .dot').classList.remove('on'); }
    if (was !== tab) { S.pop = null; render(true); }
  }
  function close() {
    if (!S.tab) return;
    if (S.call) endCall();
    S.tab = null; S.pop = null;
    $('.dk').classList.remove('open'); $('.toasts').classList.remove('beside');
    $$('.seg').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    fitClosed();
  }
  function render(anim, hl) {
    if (!S.tab) return;
    var sc = $('.dk-sc'), top = sc.scrollTop;
    sc.innerHTML = '<div class="' + (anim ? 'view' : '') + '">' + (S.tab === 'level' ? levelView(hl || {}) : coachView(hl || {})) + '</div>';
    sc.scrollTop = anim ? 0 : top;
    if (S.tab === 'level') wireLevel(anim); else wireCoach();
    wirePop();
    setTimeout(fade, 520);
  }
  function fade() { var sc = $('.dk-sc'); if (sc) sc.classList.toggle('more', sc.scrollHeight - sc.scrollTop - sc.clientHeight > 4); }

  var popT = 0;
  function setPop(k) {
    S.pop = k;
    $$('.dk .q').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-q') === k); });
    var eb = $('.ib.edit'); if (eb) eb.classList.toggle('on', k === 'sw');
    $$('.dk .pop').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-q') === k); });
  }
  function wirePop() {
    $$('.dk .q').forEach(function (b) {
      var k = b.getAttribute('data-q');
      b.addEventListener('click', function () { setPop(S.pop === k ? null : k); });
      b.addEventListener('mouseenter', function () { clearTimeout(popT); setPop(k); });
      b.addEventListener('mouseleave', function () { popT = setTimeout(function () { if (S.pop === k) setPop(null); }, 220); });
      var p = $('.dk .pop[data-q="' + k + '"]');
      if (p) { p.addEventListener('mouseenter', function () { clearTimeout(popT); }); p.addEventListener('mouseleave', function () { popT = setTimeout(function () { if (S.pop === k) setPop(null); }, 220); }); }
    });
  }

  /* ---------- Level ---------- */
  function levelView(hl) {
    var L = lv(), next = Math.min(10, L + 1), st = S.st;
    if (S.openLv == null) S.openLv = L < 10 ? next : 10;
    var at = USUAL[st.usual] != null ? USUAL[st.usual] : null;
    return '<div class="lv-hero">' + badge(L) + '<div><h2>Level ' + L + '</h2><div class="pts">' + n(st.pts) + ' skill points' + (S.gain ? '<span class="gain">+' + n(S.gain) + '</span>' : '') + '</div></div>' +
      '<button class="q" data-q="lv" aria-label="How skill points work">?</button>' +
      '<div class="pop" data-q="lv" role="tooltip">' +
        '<p>Skill points come only from finished scenarios. Your manager grades the work, and better work pays more.</p>' +
        '<div class="scale">' + (at != null ? '<span class="yo" style="left:' + at + '%">You, usually</span>' : '') + '<div class="bar"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i></div>' +
        '<div class="lbls"><span>Below<b>500</b></span><span>Meeting<b>1,000</b></span><span>Exceeding<b>2,000</b></span><span>Exceptional<b>3,000</b></span></div></div>' +
        '<div class="foot">Everyone starts at Level 1. Every 1,000 skill points is a level, and every level opens new roles.</div></div></div>' +
      '<div class="lv-prog"><div class="lv-track"><i data-w="' + Math.round(into() * 100) + '"></i></div>' +
      '<div class="lv-meta">' + (L >= 10 ? '<b>Top level</b>' : '<b>' + n(D.startOf(next) - st.pts) + ' more</b> to Level ' + next) + '</div></div>' +
      '<div class="lv-list"><span class="lv-line" aria-hidden="true"><i></i></span>' +
      D.LEVELS.map(function (x) {
        var state = x.n === L ? 'now' : x.n < L ? 'past' : 'fut', op = S.openLv === x.n;
        return '<div class="lv-row ' + state + (op ? ' open' : '') + (hl.up === x.n ? ' up' : '') + '" data-n="' + x.n + '">' +
          '<button class="lv-btn" aria-expanded="' + op + '">' + badge(x.n) +
          '<span class="lv-tw"><span class="lv-nm">Level ' + x.n + (state === 'now' ? '<span class="you">You</span>' : '') + '</span>' + (state === 'fut' ? '<span class="lv-sub">' + n(D.startOf(x.n)) + ' skill points</span>' : '') + '</span>' +
          '<span class="stk">' + x.cos.slice(0, 3).map(function (k) { return logo(k, 26); }).join('') + '</span><span class="lv-cv">' + IC.chev + '</span></button>' +
          '<div class="lv-more"><div><div class="lv-x"><div class="lv-x-l">' +
            '<div class="lv-num">' + x.roles + (state === 'fut' ? ' more roles' : ' roles') + '</div>' +
            '<div class="lv-kind">' + esc(x.kind) + ' · ' + esc(x.pay) + '</div>' +
            '<div class="stk big">' + x.cos.slice(0, 6).map(function (k) { return logo(k, 30); }).join('') + '</div></div>' +
            '<button class="all" data-jobs="1">View all' + IC.out + '</button></div></div></div></div>';
      }).join('') + '</div>';
  }
  function wireLevel(anim) {
    requestAnimationFrame(function () { var b = $('.lv-track i'); if (b) b.style.width = b.getAttribute('data-w') + '%'; line(anim); });
    $$('.lv-row').forEach(function (r) {
      $('.lv-btn', r).addEventListener('click', function () {
        var k = +r.getAttribute('data-n'); S.openLv = S.openLv === k ? -1 : k;
        $$('.lv-row').forEach(function (o) { var on = +o.getAttribute('data-n') === S.openLv; o.classList.toggle('open', on); $('.lv-btn', o).setAttribute('aria-expanded', on); });
        var t0 = performance.now(); (function f() { line(false); if (performance.now() - t0 < 650) requestAnimationFrame(f); })();
        setTimeout(fade, 460);
      });
    });
    $$('.all[data-jobs]').forEach(function (b) { b.addEventListener('click', function () { if (window.PB) PB.peek(); }); });
  }
  function line(grow) {
    var list = $('.lv-list'), ln = $('.lv-line'); if (!list || !ln) return;
    var rows = $$('.lv-row'), lt = list.getBoundingClientRect().top, z = parseFloat(getComputedStyle(S.root).zoom) || 1;
    var mid = function (k) { var b = $('.lv-btn .bdg', rows[k]).getBoundingClientRect(); return (b.top + b.height / 2 - lt) / z; };
    var top = mid(0), bot = mid(rows.length - 1); ln.style.top = top + 'px'; ln.style.height = Math.max(0, bot - top) + 'px';
    var L = lv(), fill = mid(L - 1) - top; if (L < 10) fill += (mid(L) - mid(L - 1)) * into();
    var i = $('i', ln);
    if (grow) { i.style.transition = 'none'; i.style.height = '0px'; void i.offsetHeight; i.style.transition = ''; } else i.style.transition = 'none';
    i.style.height = Math.max(0, fill) + 'px';
  }

  /* ---------- Coach ---------- */
  function tone(v) { return !v ? '' : v >= 4 ? 'hi' : v <= 2 ? 'lo' : 'mid'; }
  function word(v) { return !v ? 'Not seen yet' : v >= 5 ? 'Strong' : v >= 4 ? 'Good' : v >= 3 ? 'Steady' : 'Needs work'; }
  function coachView(hl) {
    var c = CO(), k = S.st.coach;
    return '<div class="co-hd"><img class="co-face" alt="" src="' + c.photo + '"><div class="co-nm"><b>' + esc(c.name) + '</b><span>' + esc(c.style) + ' coach</span></div>' +
        '<button class="ib call" aria-label="Call ' + esc(c.name) + '">' + IC.phone + '</button>' +
        '<button class="ib edit" aria-label="Change your coach">' + IC.edit + '</button>' +
        '<div class="pop sw" data-q="sw" role="dialog" aria-label="Your coach"><div class="sw-hd">Your coach</div>' +
          D.COACHES.map(function (x) { return '<button class="sw-it' + (x.key === c.key ? ' on' : '') + '" data-c="' + x.key + '"><img alt="" src="' + x.photo + '"><div><b>' + esc(x.name) + ' <em>' + esc(x.style) + '</em></b><span>' + esc(x.line) + '</span></div><i>' + IC.tick + '</i></button>'; }).join('') +
        '</div></div>' +
      '<div class="co-think"><div class="co-tl"><span class="cl">What I think about you</span><button class="q" data-q="co" aria-label="How your coach reads you">?</button></div>' +
        '<p' + (hl.think ? ' class="in"' : '') + '>' + esc(k.think) + '</p>' +
        '<div class="pop" data-q="co" role="tooltip"><p>In every scenario I watch how you keep your manager in the loop, how much you do on your own, the quality of what you send, and your pace.</p>' +
          '<p style="margin-top:6px">I tell you right after it happens. Your manager grades the work; I help you get better at it.</p></div></div>' +
      (k.like.length ? '<div class="co-sec"><div class="co-sl"><i class="g">' + IC.tick + '</i>What I like</div>' +
        k.like.map(function (x, i) { return '<div class="co-li' + (hl.think && i === 0 ? ' new' : '') + '">' + esc(x) + '</div>'; }).join('') + '</div>' : '') +
      (k.fix.length ? '<div class="co-sec"><div class="co-sl"><i class="w">' + IC.arrow + '</i>Areas for improvement for you, Sanjay</div>' +
        k.fix.map(function (x, i) { return '<div class="co-fx' + (hl.think && i === 0 ? ' new' : '') + '"><div class="was">' + esc(x.t) + '</div>' + (x.try ? '<div class="try"><b>Try this instead</b>' + esc(x.try) + '</div>' : '') + '</div>'; }).join('') + '</div>' : '') +
      (!k.like.length && !k.fix.length ? '<div class="co-sec"><div class="co-empty">Start your first scenario and I will tell you what I like, and what to do instead.</div></div>' : '') +
      '<div class="co-reads"><span class="cl">' + esc(c.name) + '’s read</span><span class="rings">' + READS.map(function (r) {
        var v = (k.reads || {})[r] || 0;
        return '<span class="rg' + (hl.read === r ? ' pulse' : '') + '" tabindex="0"><span class="ring ' + tone(v) + '" style="--p:' + (v * 20) + '">' + IC[READ_IC[r]] + '</span><span class="tip">' + esc(r) + ' · ' + word(v) + '</span></span>';
      }).join('') + '</span></div>';
  }
  function wireCoach() {
    var cb = $('.ib.call'); if (cb) cb.addEventListener('click', call);
    var eb = $('.ib.edit'); if (eb) eb.addEventListener('click', function () { setPop(S.pop === 'sw' ? null : 'sw'); });
    $$('.sw-it').forEach(function (b) { b.addEventListener('click', function () { pickCoach(b.getAttribute('data-c')); }); });
  }
  function pickCoach(k) {
    S.coachKey = k; setPop(null); draw(); render(false);
    toast({ kind: 'praise', title: 'Hi, I am ' + CO().name, text: CO().line });
  }

  /* ---------- the call ---------- */
  var WORDS = null;
  fetch(A + 'coach/words.json').then(function (r) { return r.json(); }).then(function (j) { WORDS = j; }).catch(function () {});
  function call() {
    var c = CO(); if (S.call) return;
    if (!S.tab) open('coach');
    var ov = document.createElement('div'); ov.className = 'callv';
    ov.innerHTML = '<div class="cl-v"><video playsinline preload="auto" src="' + c.video + '"></video>' +
        '<div class="cl-ring"><span class="wv"></span><span class="wv"></span><span class="wv"></span><img alt="" src="' + c.photo + '"></div></div>' +
      '<div class="cl-nm"><b>' + esc(c.name) + '</b><span class="cl-st"><span class="cl-dots">Ringing<i>.</i><i>.</i><i>.</i></span></span></div>' +
      '<div class="cl-cap" aria-live="polite"></div>' +
      '<div class="cl-bt"><button class="cl-mute" aria-label="Mute">' + IC.mic + '</button><button class="cl-end" aria-label="End call">' + IC.end + '</button></div>';
    $('.dk').appendChild(ov); $('.dk').classList.add('calling');
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var v = $('video', ov), st = $('.cl-st', ov), cap = $('.cl-cap', ov), t0 = 0, words = (WORDS || {})[c.key] || [], ready = false, rang = false;
    S.call = { ov: ov, timer: 0 };
    v.addEventListener('canplaythrough', function () { ready = true; go(); }, { once: true });
    v.load();
    setTimeout(function () { rang = true; if (!ready) st.innerHTML = '<span class="cl-dots">Connecting<i>.</i><i>.</i><i>.</i></span>'; go(); }, 2200);
    $('.cl-mute', ov).addEventListener('click', function () { var b = this, m = b.classList.toggle('on'); b.innerHTML = m ? IC.micoff : IC.mic; });
    $('.cl-end', ov).addEventListener('click', endCall);
    function go() {
      if (!S.call || !ready || !rang || t0) return;
      ov.classList.add('cl-on'); t0 = performance.now();
      try { var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); }); } catch (e) {}
      S.call.timer = setInterval(function () {
        var sec = Math.floor((performance.now() - t0) / 1000);
        st.textContent = Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
        var t = v.currentTime, said = words.filter(function (w) { return w[0] <= t; }).map(function (w) { return w[2]; });
        if (v.ended) said = words.map(function (w) { return w[2]; });
        cap.textContent = said.slice(-14).join(' ');
        ov.classList.toggle('cl-talk', !v.paused && !v.ended);
      }, 120);
    }
  }
  function endCall() {
    if (!S.call) return;
    var ov = S.call.ov; clearInterval(S.call.timer);
    var v = $('video', ov); try { v.pause(); } catch (e) {}
    ov.classList.remove('on'); setTimeout(function () { ov.remove(); $('.dk').classList.remove('calling'); }, 400);
    S.call = null;
  }

  /* ---------- short notes ---------- */
  function toast(o) {
    var box = $('.toasts');
    var av = o.kind === 'level' ? badge(o.level) : '<img alt="" src="' + CO().photo + '"><i class="k">' + (o.kind === 'nudge' ? IC.bang : IC.check) + '</i>';
    var t = document.createElement('div');
    t.className = 'toast ' + o.kind; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="av">' + av + '</span><div><b>' + esc(o.title) + '</b><span class="tt">' + esc(o.text) + '</span>' +
      (o.try ? '<span class="tr"><em>Try this instead</em>' + esc(o.try) + '</span>' : '') + (o.extra || '') + '</div>';
    t.addEventListener('click', function () { open(o.kind === 'level' ? 'level' : 'coach'); dismiss(t); });
    box.appendChild(t);
    while (box.children.length > 2) box.removeChild(box.firstChild);
    setTimeout(function () { dismiss(t); }, o.ms || 6500);
    return t;
  }
  function dismiss(t) { if (!t.parentNode || t.classList.contains('out')) return; t.classList.add('out'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 360); }

  /* a live note from the coach, during the work */
  function note(o) {
    toast({ kind: o.kind || 'praise', title: o.title, text: o.text, try: o.try });
    if (S.tab === 'coach') render(false, { read: o.read }); else { S.dot = true; draw(); }
  }

  /* the engine hands over the state after every beat and every fx */
  function update(st, opt) {
    opt = opt || {};
    var was = lv();
    S.st = st;
    var L = lv();
    if (opt.quiet) { S.gain = 0; draw(); if (S.tab) render(false); return; }
    if (opt.gain) { S.gain = opt.gain; setTimeout(function () { S.gain = 0; }, 200); }
    if (opt.coach) { if (S.tab === 'coach') render(false, { think: true }); else { S.dot = true; } }
    draw();
    if (L > (opt.from || was)) {
      S.openLv = null;
      var seg = $('.seg.lv'); seg.classList.remove('bump'); void seg.offsetWidth; seg.classList.add('bump');
    }
    if (S.tab === 'level') render(false, { up: L > (opt.from || was) ? L : 0 });
  }
  function levelToast(L) {
    var x = D.LEVELS[L - 1];
    toast({ kind: 'level', level: L, title: 'Level ' + L, text: x.roles + ' new ' + (x.kind === 'Internships' ? 'internships' : 'roles') + ' open to you', extra: '<span class="stk">' + x.cos.slice(0, 5).map(function (k) { return logo(k, 22); }).join('') + '</span>', ms: 6500 });
  }
  function reset() { close(); S.dot = false; S.openLv = null; $$('.toast').forEach(dismiss); }

  window.DK = { S: S, mount: mount, update: update, note: note, toast: toast, levelToast: levelToast, open: open, close: close, reset: reset, call: call, endCall: endCall, render: render, CO: CO };
})();
