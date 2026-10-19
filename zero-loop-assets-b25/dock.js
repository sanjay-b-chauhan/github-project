/* Zero b12 dock: the level and the coach in one pill, top right of the app. It grows into the panel.
   Level (from the meeting): where you are and how far to the next level; the NEXT level big, with real roles from the portal
   and "and N more"; later levels condensed (hover for the count); no past levels, no skill points per level, no View all.
   Coach (Navid): one job, earn you skill points. In a scenario the pill shows "Up to N" (what is still possible), the panel
   shows the three targets and their state; outside a scenario it answers "how do I level up faster". When points are at
   stake the coach pauses the app (freeze): the screen blurs, one card, Got it. Wins and tips are short notes. */
(function () {
  'use strict';
  var D = window.ZD, A = D.A, J = window.J;
  var $ = J.$, $$ = J.$$, esc = J.esc, n = J.n, logo = J.logo, badge = J.badge, IC = J.IC;
  var LADDER = D.LADDER;

  var S = { coachKey: 'navi', tab: null, pop: null, dot: false, call: null, st: J.fresh(), root: null, upShown: null, coachShown: false };
  function CO() { for (var i = 0; i < D.COACHES.length; i++) if (D.COACHES[i].key === S.coachKey) return D.COACHES[i]; return D.COACHES[0]; }
  function lv() { return D.levelOf(S.st.pts); }
  function into() { var L = lv(); return L >= 10 ? 1 : Math.min(1, (S.st.pts + (S.st.kept || 0) - D.startOf(L)) / 1000); }
  function W() { return 432; }
  function fav(dom, size) { return '<span class="fv" style="--v:' + (size || 22) + 'px"><img alt="" src="https://www.google.com/s2/favicons?sz=64&domain=' + esc(dom) + '"></span>'; }
  function scName(k) { var s = D.SC[k]; return s ? s.title + ' at ' + J.coName(s.co) : ''; }
  function mgrName(k) { var s = D.SC[k]; return s ? D.P[s.mgr].first : 'your manager'; }
  var STATE = { hit: ['Locked in', 'hit'], on: ['On track', 'on'], strike: ['Strike one', 'strike'], lost: ['Lost', 'lost'] };

  function mount(app) {
    var el = document.createElement('div');
    el.innerHTML = '<div class="toasts" aria-live="polite"></div>' +
      '<div class="dk solo"><div class="dk-bg"></div>' +
        '<div class="pill" role="tablist" aria-label="Rank and coach">' +
          '<button class="seg lv" role="tab" data-tab="level"></button><i class="sep"></i>' +
          '<button class="seg co" role="tab" data-tab="coach" aria-label="Your coach"><span class="me"><img alt="" src="' + CO().photo + '"><i class="dot"></i></span><span class="upt"><i>Up to</i><b></b></span><span class="lbl">Coach</span></button>' +
        '</div>' +
        '<div class="dk-body"><div><div class="dk-sc"></div></div></div>' +
      '</div>';
    while (el.firstChild) app.appendChild(el.firstChild);
    S.root = app;
    $$('.seg', app).forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.call) endCall(); else if (S.pop) setPop(null); else close(); } });
    document.addEventListener('pointerdown', function (e) {
      if (S.pop && !e.target.closest('.pop,.q,.ib.edit')) setPop(null);
      if (S.tab && !e.target.closest('.dk,.toasts,#ctl,.cz')) close();
    });
    $('.dk-sc').addEventListener('scroll', fade);
    draw();
    /* warm the company icons the level panel shows */
    D.LEVELS.forEach(function (x) { (x.top || []).forEach(function (r) { var i = new Image(); i.src = 'https://www.google.com/s2/favicons?sz=64&domain=' + r.dom; }); });
  }

  /* ---------- the pill ---------- */
  function upTo() { return S.st.track ? D.upTo(S.st.track) : 0; }
  function draw(anim) {
    var L = lv(), dk = $('.dk');
    /* b15: the points Navid's fixes keep show up here as they happen, in the reward colour, before the grade makes them real */
    var k = S.st.kept || 0, tt = S.st.pts + k;   /* b19: the pill shows total XP, the same number the rank panel shows */
    $('.seg.lv').innerHTML = rb(L) + '<span class="tl">Rank</span><span class="tx"><b>Rank ' + L + '</b><span class="pts"><span class="mini"><i style="width:' + Math.round(into() * 100) + '%"></i></span></span></span>';
    $('.seg.lv').setAttribute('aria-label', 'Rank ' + L + (k ? ', ' + n(k) + ' skill points kept this scenario' : '') + ', ' + n(Math.max(0, D.startOf(Math.min(10, L + 1)) - S.st.pts - k)) + ' to the next rank');
    var img = $('.seg.co .me img'); if (img && img.getAttribute('src') !== CO().photo) img.src = CO().photo;
    $('.dk .dot').classList.toggle('on', S.dot);
    var on = !!S.st.coachOn;
    if (on && !S.coachShown && anim) { dk.classList.remove('solo'); dk.classList.add('arrive'); setTimeout(function () { dk.classList.remove('arrive'); }, 900); }
    dk.classList.toggle('solo', !on);   /* b25: the coach is back in the pill. No pulse: he comes in on his own when he has something */
    dk.classList.toggle('cv-live', cstate() > 0);
    S.coachShown = on;
    var u = upTo(), up = $('.seg.co .upt');
    up.classList.toggle('on', !!u);
    if (u) {
      var b = $('b', up), was = S.upShown;
      if (anim && was != null && was !== u) {
        up.classList.remove('dn', 'upp'); void up.offsetWidth; up.classList.add(u < was ? 'dn' : 'upp');
        countTo(b, was, u);
      } else b.textContent = n(u);
      S.upShown = u;
    } else S.upShown = null;
    if (!S.tab) fitClosed();
  }
  function countTo(el, a, b) {
    var t0 = performance.now(), d = 900;
    (function f() { var k = Math.min(1, (performance.now() - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = n(a + (b - a) * e); if (k < 1) requestAnimationFrame(f); })();
  }
  function closedW() {
    var g = document.createElement('div'); g.className = $('.dk').className.replace(/\b(open|arrive)\b/g, '');
    g.style.cssText = 'visibility:hidden;left:-9999px;right:auto;width:auto;transition:none;pointer-events:none';
    var p = $('.pill').cloneNode(true); $$('.seg', p).forEach(function (x) { x.classList.remove('on'); });
    g.appendChild(p); S.root.appendChild(g);
    var w = Math.ceil(g.getBoundingClientRect().width / (parseFloat(getComputedStyle(document.getElementById('app')).zoom) || 1)); g.remove(); return w;
  }
  function fitClosed() { $('.dk').style.width = closedW() + 'px'; }

  function toggle(tab) { if (document.documentElement.classList.contains('zx-turn')) return; if (S.tab === tab) close(); else open(tab); }
  function open(tab) {
    if (tab === 'coach' && !S.st.coachOn) tab = 'level';
    var was = S.tab; S.tab = tab;
    var dk = $('.dk'); dk.classList.add('open'); dk.style.width = W() + 'px';
    $('.toasts').classList.add('beside');
    $$('.seg').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (tab === 'coach' && S.dot) { S.dot = false; $('.dk .dot').classList.remove('on'); }
    if (was !== tab) { S.pop = null; S.ask = null; render(true); }
  }
  function close() {
    if (!S.tab) return;
    if (S.call) endCall();
    S.tab = null; S.pop = null;
    $('.dk').classList.remove('open'); $('.toasts').classList.remove('beside');
    $$('.seg').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    fitClosed();
  }
  function render(anim) {
    if (!S.tab) return;
    var sc = $('.dk-sc'), top = sc.scrollTop;
    sc.innerHTML = '<div class="' + (anim ? 'view' : '') + '">' + (S.tab === 'level' ? levelView() : coachView()) + '</div>';
    sc.scrollTop = anim ? 0 : top;
    if (S.tab === 'level') wireLevel(); else wireCoach();
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

  /* ---------- Level: where you are, what is next (big), what is later (small) ---------- */
  /* ================= b18: the rank panel =================
     Top: the badge, Rank N, your total XP on the right; the bar with where this rank starts and ends; how much to the next.
     Next rank: what it gets you and why it works, in two lines, then real roles (the third blurred, LinkedIn style).
     Every rank after it: what roles it opens and the XP it needs, locked; open one to see who is hiring (one role you
     can read, the rest blurred). No logos on their own, no "Later" label, no "?". */
  var LOCK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.6"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/></svg>';
  function total() { return S.st.pts + (S.st.kept || 0); }
  function topPay(p) { var m = /to \$?([A-Z]*\$?[\d.,]+k)/.exec(p || ''); return m ? (m[1].charAt(0) === '$' || /^[A-Z]/.test(m[1]) ? m[1] : '$' + m[1]) : ''; }
  function teams(x) { var c = []; (x.top || []).forEach(function (r) { if (c.indexOf(r.co) < 0) c.push(r.co); }); return c.slice(0, 2); }
  function role(r) { return '<div class="nx-r">' + fav(r.dom, 26) + '<div><b>' + esc(r.t) + '</b><span>' + esc(r.co) + (r.pay && r.pay !== 'Not posted' ? ' · ' + esc(r.pay) : '') + '</span></div></div>'; }
  /* b20: one way to show what a rank gets you: a line, two roles you can read, the rest blurred and locked */
  function gets(y) {
    var tm = teams(y), pay = topPay(y.pay);
    return '<p class="rk-gets">Rank ' + y.n + ' puts you in front of ' + (tm.length ? 'teams like ' + esc(tm.join(' and ')) : 'more teams') + (pay ? ', with pay up to ' + esc(pay) : '') + '.</p>';
  }
  function roles(y, icon) {
    var t = y.top || [];
    return '<div class="nx-rs">' + t.slice(0, 2).map(role).join('') +
      (t[2] ? '<div class="nx-lock">' + role(t[2]) + '<em>' + icon + '<b>' + Math.max(0, y.roles - 2) + ' more roles</b> open at Rank ' + y.n + '</em></div>' : '') + '</div>';
  }
  /* b25: a badge with a number you can read */
  function rb(k, cls) { return '<span class="rkb' + (cls ? ' ' + cls : '') + '">' + badge(k) + '<b>' + k + '</b></span>'; }
  function levelView() {
    var L = lv(), next = Math.min(10, L + 1), top = L >= 10, x = D.LEVELS[next - 1], T = total();
    var a = D.startOf(L), into1 = Math.max(0, Math.min(1, (T - a) / 1000));
    /* b25 (founder): the rank, the bar, and one line under it: 470 / 1,000 */
    var h = '<div class="rk-hero">' + rb(L) +
      '<div class="rk-m"><h2>Rank ' + L + '</h2>' +
        '<div class="lv-track"><i data-w="' + Math.round(into1 * 100) + '"></i></div>' +
        '<div class="rk-ends"><span><b>' + n(T - a) + '</b> / ' + (top ? 'top rank' : '1,000 XP') + '</span></div>' +
      '</div></div>';
    if (top) return h + '<div class="nx"><div class="nx-k">Every role in the portal is open to you.</div></div>';
    h += '<div class="nx"><div class="nx-hd">' + rb(next) + '<div class="nx-t"><span class="cl">Next</span><b>Rank ' + next + '</b></div><span class="nx-n">Opens <b>' + x.roles + '</b> roles</span></div>' +
      gets(x) + roles(x, LOCK) + '</div>';
    var later = D.LEVELS.filter(function (y) { return y.n > next; });
    if (later.length) h += '<div class="rk-list">' + later.map(function (y) {
      return '<div class="rk-r" data-n="' + y.n + '"><button class="rk-h" aria-expanded="false">' + rb(y.n) +
          '<span class="rk-hn"><b>Rank ' + y.n + '</b><span>' + esc(y.kind) + '</span></span>' +
          '<span class="lt-s">' + (y.top || []).slice(0, 3).map(function (r) { return fav(r.dom, 22); }).join('') + '</span></button>' +
        '<div class="rk-b"><div><div class="rk-in">' + gets(y) + '</div></div></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function wireLevel() {
    requestAnimationFrame(function () { var b = $('.lv-track i'); if (b) b.style.width = b.getAttribute('data-w') + '%'; });
    $$('.rk-h').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = btn.parentNode, open = !r.classList.contains('on');
        $$('.rk-r.on').forEach(function (o) { o.classList.remove('on'); $('.rk-h', o).setAttribute('aria-expanded', 'false'); });
        if (open) { r.classList.add('on'); btn.setAttribute('aria-expanded', 'true'); }
        setTimeout(fade, 420);
      });
    });
  }

  /* ---------- Coach: how you earn more skill points ---------- */
  function rowsFor(t, opts) {
    var sc = t.sc;
    return (D.TG[sc] || []).map(function (g, i) {
      var v = t.s[g.id], st = STATE[v] || ['To play', 'open'];
      var show = opts && opts.how && v !== 'hit' && v !== 'lost';
      if (v !== 'hit' && v !== 'lost') st = [(v ? st[0] + ' · ' : 'Worth ') + n(worth(t)), st[1]];
      return '<div class="tg ' + st[1] + '"><span class="tg-i">' + (v === 'hit' ? IC.tick : v === 'lost' ? IC.x : v === 'strike' ? IC.bang : v === 'on' ? IC.tick : (i + 1)) + '</span>' +
        '<div class="tg-b"><b>' + esc(opts && opts.full ? g.t : g.short) + '</b>' + (show ? '<span>' + esc(g.how) + '</span>' : '') + '</div><em>' + st[0] + '</em></div>';
    }).join('');
  }
  /* what one open target is worth: how far the ceiling drops if it is lost */
  function worth(t) { var h = 0, o = 0; for (var k in t.s) { if (t.s[k] === 'hit') h++; else if (t.s[k] !== 'lost') o++; } return o ? LADDER[h + o] - LADDER[h + o - 1] : 0; }
  function levelAfter(gain) { return D.levelOf(S.st.pts + gain); }
  function coachHead() {
    var c = CO();
    return '<div class="co-hd"><img class="co-face" alt="" src="' + c.photo + '"><div class="co-nm"><b>' + esc(c.name) + '</b><span>Your coach · on your team</span></div>' +
        '<button class="ib call" aria-label="Call ' + esc(c.name) + '">' + IC.phone + '</button>' +
        '<button class="ib edit" aria-label="Change your coach">' + IC.edit + '</button>' +
        '<div class="pop sw" data-q="sw" role="dialog" aria-label="Your coach"><div class="sw-hd">Your coach</div>' +
          D.COACHES.map(function (x) { return '<button class="sw-it' + (x.key === c.key ? ' on' : '') + '" data-c="' + x.key + '"><img alt="" src="' + x.photo + '"><div><b>' + esc(x.name) + ' <em>' + esc(x.style) + '</em></b><span>' + esc(x.line) + '</span></div><i>' + IC.tick + '</i></button>'; }).join('') +
        '</div></div>';
  }
  /* ================= b25: the coach panel (from the founder's notes) =================
     Before the first stage is done: "Watching how you work." and the sections greyed out. After it: what you are doing
     well, what he wants to see grow (one to three each, one or two sentences), and four stats on the real app's band
     meter (cells, amber to gold to green, left to right), named Calibrating, Developing, Good, Strong, Exceptional.
     It is always open, no dropdowns, and it changes as the scenario goes. */
  var RANGE = [[0, [208, 102, 50]], [.22, [226, 138, 58]], [.4, [235, 166, 64]], [.52, [237, 190, 82]], [.66, [140, 182, 80]], [.82, [70, 160, 86]], [1, [24, 116, 60]]];
  function bandRgb(v) {
    var t = Math.max(0, Math.min(100, v)) / 100;
    for (var i = 1; i < RANGE.length; i++) if (t <= RANGE[i][0]) { var a = RANGE[i - 1], b = RANGE[i], k = (t - a[0]) / (b[0] - a[0] || 1); return a[1].map(function (x, j) { return Math.round(x + (b[1][j] - x) * k); }); }
    return RANGE[RANGE.length - 1][1];
  }
  function rgb(c) { return 'rgb(' + c.join(',') + ')'; }
  function word(v) { return v == null ? 'Calibrating' : v < 40 ? 'Developing' : v < 60 ? 'Good' : v < 80 ? 'Strong' : 'Exceptional'; }
  function meter(v) {
    var cells = 20, on = v == null ? 0 : Math.max(1, Math.round(v / 100 * cells)), deep = v == null ? null : bandRgb(v), h = '';
    for (var i = 0; i < cells; i++) {
      var st = '';
      if (i < on) { var t = on > 1 ? i / (on - 1) : 1, light = deep.map(function (x) { return Math.round(x + (255 - x) * .35 * (1 - t)); }); st = ' style="--c:' + rgb(light) + ';--d:' + (i * 22) + 'ms"'; }
      h += '<i' + (i < on ? ' class="on"' : '') + st + '></i>';
    }
    return '<span class="cv-mt">' + h + '</span>';
  }
  /* where the scenario is: 0 before the first stage is done, 1 after it, 2 after the presentation, 3 after the review */
  function cstate() {
    var b = J.beats(), i = J.P.i, f = function (q) { for (var k = 0; k < b.length; k++) if (q(b[k])) return k; return 99; };
    var st = f(function (x) { return x.d && x.d.step === 'resubmit'; }), rp = f(function (x) { return x.screen === 'report'; }), rv = f(function (x) { return x.screen === 'review'; });
    return i > rv ? 3 : i > rp ? 2 : i > st ? 1 : 0;
  }
  function coachRead(k) {
    var good = !!J.P.notesGood;
    var well = [
      'Every message to Jay after the first one said what you were doing and by when.',
      'You fixed both high priority items before the meeting.'
    ];
    if (good) well.unshift('You wrote down every number Jay gave in the kickoff, in your own words.');
    var grow = ['Test before you send. Run it on real leads and put the number in the plan.'];
    if (!good) grow.push('Take your own notes in the kickoff. The check reads from them.');
    grow.push(k >= 2 ? 'Pause instead of um when you present. A pause sounds sure.' : 'When you are stuck, ask Jay one clear question sooner.');
    var stats = k === 1 ? [58, 36, 38, 52] : k === 2 ? [55, 40, 46, 54] : [60, 42, 52, 56];
    var say = k === 3 ? 'Meeting Expectations on your first scenario. Add a test next time and this is Exceeding.' :
      'Your updates got clear fast. The one thing between you and Exceeding is a test before you send.';
    return { well: well.slice(0, 3), grow: grow.slice(0, 3), stats: stats, say: say };
  }
  function coachView() {
    var k = cstate(), r = k ? coachRead(k) : null, names = ['Communication', 'Independence', 'Quality', 'Speed'];
    var h = '<div class="cv">' +
      '<div class="cv-hd"><img alt="" src="' + CO().photo + '"><div><b>' + esc(CO().name) + '</b><span>Your coach</span></div></div>' +
      '<p class="cv-say">' + (k ? esc(r.say) : 'Watching how you work. I’ll share my feedback after you finish the first stage.') + '</p>' +
      '<div class="cv-body' + (k ? '' : ' cv-lock') + '"' + (k ? '' : ' aria-hidden="true"') + '>' +
        '<section class="cv-s"><h4>What you’re doing well</h4><ul>' + (k ? r.well.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') : '<li><i class="cv-sk" style="width:92%"></i></li><li><i class="cv-sk" style="width:74%"></i></li><li><i class="cv-sk" style="width:84%"></i></li>') + '</ul></section>' +
        '<section class="cv-s"><h4>Areas I want to see you grow</h4><ul>' + (k ? r.grow.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') : '<li><i class="cv-sk" style="width:88%"></i></li><li><i class="cv-sk" style="width:66%"></i></li>') + '</ul></section>' +
        '<section class="cv-s"><h4>Your stats</h4><div class="cv-ms">' + names.map(function (nm, i) {
          var v = k ? r.stats[i] : null, w = word(v);
          return '<div class="cv-m"><span class="cv-mn">' + nm + '</span>' + meter(v) + '<em style="color:' + (v == null ? 'var(--ink3)' : rgb(bandRgb(v).map(function (x) { return Math.round(x * .78); }))) + '">' + w + '</em></div>';
        }).join('') + '</div></section>' +
      '</div></div>';
    return h;
  }
  /* no chat: three fixed questions, each answered from what the coach already knows */
  function chips() {
    var L = lv(), q = [['easy', 'Where are my easiest points?']];
    if (S.st.lastTrack) q.push(['why', 'Why did I get my last grade?']);
    if (L < 10) q.push(['next', 'What does Rank ' + (L + 1) + ' open?']);
    return '<div class="qc">' + q.map(function (x) { return '<button data-qc="' + x[0] + '"' + (S.ask === x[0] ? ' class="on"' : '') + '>' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
      (S.ask ? '<div class="qa-ans">' + answer(S.ask) + '</div>' : '');
  }
  function answer(k) {
    var t = S.st.track, lt = S.st.lastTrack, fx = S.st.coach.fix;
    if (k === 'easy') {
      if (t) {
        var g = (D.TG[t.sc] || []).filter(function (x) { return t.s[x.id] !== 'hit' && t.s[x.id] !== 'lost'; })[0];
        if (!g) return 'Every target here is settled. Finish strong: the points are locked in.';
        return '<b>' + esc(g.short) + '.</b> ' + esc(g.how) + ' That keeps ' + n(worth(t)) + ' in play.';
      }
      return fx.length ? '<b>' + esc(fx[0].try || fx[0].t) + '</b> It is the one you missed last time, so it is the cheapest points you can win back.' : 'Hit all three targets in your next scenario. That is 3,000.';
    }
    if (k === 'why' && lt) {
      var hits = (D.TG[lt.sc] || []).filter(function (x) { return lt.s[x.id] === 'hit'; }), miss = (D.TG[lt.sc] || []).filter(function (x) { return lt.s[x.id] !== 'hit'; });
      return 'You hit <b>' + hits.length + ' of 3</b>' + (hits.length ? ': ' + hits.map(function (x) { return esc(x.short.toLowerCase()); }).join(', ') : '') + '. That pays ' + n(LADDER[hits.length]) + '.' + (miss.length ? ' The ' + n(LADDER[3] - LADDER[hits.length]) + ' you left: ' + miss.map(function (x) { return esc(x.short.toLowerCase()); }).join(', ') + '.' : '');
    }
    return '';
  }
  function wireCoach() {
    /* the meters fill in, cell by cell, each time you open him */
    requestAnimationFrame(function () { $$('.cv-mt').forEach(function (m) { m.classList.add('in'); }); });
    $$('.tp[data-id]').forEach(function (b) { b.addEventListener('click', function () { var a = new Audio(A + 'voice/' + b.getAttribute('data-id') + '.mp3'); $$('.tp').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); a.play().catch(function () {}); a.addEventListener('ended', function () { b.classList.remove('on'); }); }); });
    $$('.pc button').forEach(function (b) { b.addEventListener('click', function () { $$('.pc button').forEach(function (x) { x.classList.toggle('on', x === b); }); }); });
    $$('.qc [data-qc]').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-qc'); if (k === 'next') { S.ask = null; open('level'); return; } S.ask = S.ask === k ? null : k; render(false); }); });
    var cb = $('.ib.call'); if (cb) cb.addEventListener('click', call);
    var eb = $('.ib.edit'); if (eb) eb.addEventListener('click', function () { setPop(S.pop === 'sw' ? null : 'sw'); });
    $$('.sw-it').forEach(function (b) { b.addEventListener('click', function () { pickCoach(b.getAttribute('data-c')); }); });
  }
  function pickCoach(k) {
    S.coachKey = k; setPop(null); draw(); render(false);
    toast({ kind: 'on', title: 'Hi, I am ' + CO().name, text: CO().line });
  }

  /* ---------- the call: a 1:1 with an agenda ---------- */
  var WORDS = null;
  fetch(A + 'coach/words.json').then(function (r) { return r.json(); }).then(function (j) { WORDS = j; }).catch(function () {});
  function call() {
    var c = CO(); if (S.call) return;
    if (!S.tab) open('coach');
    var ov = document.createElement('div'); ov.className = 'callv';
    ov.innerHTML = '<div class="cl-v"><video playsinline preload="auto" src="' + c.video + '"></video>' +
        '<div class="cl-ring"><span class="wv"></span><span class="wv"></span><span class="wv"></span><img alt="" src="' + c.photo + '"></div></div>' +
      '<div class="cl-nm"><b>' + esc(c.name) + '</b><span class="cl-st"><span class="cl-dots">Ringing<i>.</i><i>.</i><i>.</i></span></span></div>' +
      '<div class="cl-ag"><span>Agenda</span><b>Where you are</b><b>What is costing you points</b><b>Your target next</b></div>' +
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
        var tt = v.currentTime, said = words.filter(function (w) { return w[0] <= tt; }).map(function (w) { return w[2]; });
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

  /* ---------- short notes: wins, saves and tips ---------- */
  var KIC = { on: 'tick', hit: 'tick', praise: 'tick', save: 'shield', tip: 'bulb', miss: 'bang', nudge: 'bang' };
  function toast(o) {
    var box = $('.toasts');
    var av = o.kind === 'level' ? badge(o.level) : '<img alt="" src="' + CO().photo + '"><i class="k">' + IC[KIC[o.kind] || 'tick'] + '</i>';
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
  function note(o) {
    toast(o);
    if (S.tab === 'coach') render(false);
  }

  /* ---------- the freeze: the coach takes the floor, the app waits ---------- */
  var KIND = { intro: ['Meet your coach', 'cz-k-in'], pre: ['Before you start', 'cz-k-in'], strike: ['Strike one', 'cz-k-st'], lost: ['Target lost', 'cz-k-lo'], save: ['Saved', 'cz-k-ok'], post: ['Your points, explained', 'cz-k-ok'] };
  function freeze(o, s) {
    var app = S.root, st = S.st, c = CO();
    var t = o.targets === 'last' ? st.lastTrack : st.track;
    var k = KIND[o.kind] || KIND.pre;
    var u = t ? D.upTo(t) : 0;
    var body = '<div class="cz-hd"><img alt="" src="' + c.photo + '"><div><b>' + esc(c.name) + '</b><span>Your coach, on your team</span></div><em class="' + k[1] + '">' + k[0] + '</em></div>' +
      '<h3>' + esc(o.title) + '</h3>' + (o.text ? '<p class="cz-p">' + esc(o.text) + '</p>' : '') +
      (o.try ? '<div class="cz-try"><b>Try this instead</b>' + esc(o.try) + '</div>' : '') +
      (o.lead ? '<p class="cz-lead">' + esc(o.lead) + '</p>' : '') +
      (o.targets && t ? '<div class="cz-tg">' + rowsFor(t, { full: true }) + '</div>' : '') +
      (o.ladder ? '<div class="cz-lad">' + [3, 2, 1, 0].map(function (h2) { return '<span><b>' + n(LADDER[h2]) + '</b>' + h2 + ' of 3</span>'; }).join('') + '</div>' : '') +
      (o.next ? '<p class="cz-next">' + esc(o.next) + '</p>' : '') +
      '<div class="cz-ft">' + (o.kind !== 'post' && t ? '<span class="cz-up">Up to <b>' + n(u) + '</b> skill points</span>' : '<span></span>') + '<button class="cz-go">Got it</button></div>';
    var ov = document.createElement('div'); ov.className = 'cz';
    ov.innerHTML = '<div class="cz-bg"></div><div class="cz-card cz-' + o.kind + '" role="dialog" aria-label="' + esc(o.title) + '">' + body + '</div>';
    app.insertBefore(ov, $('.dk', app));
    close();
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var words = (o.title + ' ' + (o.text || '') + ' ' + (o.try || '') + ' ' + (o.lead || '') + ' ' + (o.next || '')).length + (o.targets ? 160 : 0);
    var btn = $('.cz-go', ov), clicked = new Promise(function (r) { btn.addEventListener('click', r, { once: true }); });
    return (async function () {
      try {
        await Promise.race([s.wait(2200 + words * 34), clicked]);
        if (ov.isConnected && !btn.classList.contains('pressed')) await s.press(btn, 120);
        s.hideCursor();
      } finally {
        ov.classList.remove('on'); setTimeout(function () { ov.remove(); }, 380);
      }
    })();
  }

  /* the engine hands over the state after every beat and every fx */
  function update(st, opt) {
    opt = opt || {};
    var was = lv();
    S.st = st;
    var L = lv();
    if (opt.quiet) { $$('.cz').forEach(function (x) { x.remove(); }); draw(false); if (S.tab) render(false); return; }
    draw(true);
    if (L > (opt.from || was)) { var seg = $('.seg.lv'); seg.classList.remove('bump'); void seg.offsetWidth; seg.classList.add('bump'); }
    if (S.tab) render(false);
  }
  function reset() { close(); S.dot = false; S.upShown = null; S.coachShown = false; $$('.toast').forEach(dismiss); $$('.cz').forEach(function (x) { x.remove(); }); }

  /* b15: a coin from Navid lands: count the pill up */
  function kept(pts) {
    var from = S.st.kept || 0; S.st.kept = from + pts;
    var seg = $('.seg.lv'); if (!seg) return;
    var em = $('.pts em', seg), bar = $('.mini i', seg);
    if (em) { em.classList.add('on'); countTo(em, S.st.pts + from, S.st.pts + S.st.kept); }
    if (bar) bar.style.width = Math.round(into() * 100) + '%';
    seg.classList.remove('nv-gain'); void seg.offsetWidth; seg.classList.add('nv-gain');
    setTimeout(function () { draw(false); }, 1000);
  }
  window.DK = { kept: kept, fit: function () { if (!S.tab) fitClosed(); }, S: S, mount: mount, update: update, note: note, toast: toast, freeze: freeze, open: open, close: close, reset: reset, call: call, endCall: endCall, render: render, CO: CO };
})();
