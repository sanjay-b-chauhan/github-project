/* Zero, System 2: Levels & Coach. Know where you stand, get better.
   Maya in the middle inside her ten piece level ring. Left: what the next levels open. Right: the coach card.
   Under the coach card, only when it matters, the coach's own head (six reads) that Maya never sees.
   One day, Tue 14 Oct, told from the level pill. Every number comes from core.js (ZS.DAY, ZS.LEVELS, ZS.CREDITS, ZS.COACH). */
(function () {
  'use strict';
  var Z = window.ZS, $ = Z.$, $$ = Z.$$, n = Z.n, esc = Z.esc, D = Z.DAY, C = Z.CREDITS, body = null;

  var IC = {
    eye: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.4 8s2.1-3.9 5.6-3.9S13.6 8 13.6 8s-2.1 3.9-5.6 3.9S2.4 8 2.4 8z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.9" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3.2 12.8 12.8 3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    up: '<svg viewBox="0 0 12 12" aria-label="Going up" role="img"><path d="M3 9 9 3M4.6 3H9v4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dn: '<svg viewBox="0 0 12 12" aria-label="Going down" role="img"><path d="M3 3l6 6M9 4.6V9H4.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flat: '<svg viewBox="0 0 12 12" aria-label="Steady" role="img"><path d="M2 6h7.6M7 3.4 9.6 6 7 8.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* what the coach holds in its head (order of ZS.HEAD: Understanding, Quality, Communication, Independence, Speed, AI slop).
     v = band 0..4 (AI slop 3 = low slop, good). t = trend. */
  var HEADS = {
    morning: { v: [3, 3, 1, 2, 2, 3], t: ['up', 'flat', 'dn', 'flat', 'up', 'flat'] },
    evening: { v: [3, 3, 2, 2, 2, 3], t: ['flat', 'up', 'up', 'flat', 'flat', 'flat'] }
  };
  function coachFor(k) { for (var i = 0; i < Z.COACH.length; i++) if (Z.COACH[i].key === k) return Z.COACH[i]; return null; }
  function rolesAt(l) { return Z.LEVELS[l].open - Z.LEVELS[l - 1].open; }

  /* ---------- small runners that respect the strip's speed and stop when the beat changes ---------- */
  function tween(ms, fn, ease) {
    return new Promise(function (res) {
      var t0 = performance.now(), d = ms / Z.story.speed, tok = Z.story.tok;
      (function f(t) {
        if (tok !== Z.story.tok) return res();
        var k = Math.max(0, Math.min(1, (t - t0) / d));
        fn(ease ? ease(k) : k);
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  function outCubic(k) { return 1 - Math.pow(1 - k, 3); }
  function inOut(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function reflow(x) { if (x) x.getBoundingClientRect(); }

  /* ---------- her level ring: ten pieces, one per level ---------- */
  var RC = 92, RR = 84, SPAN = 36, GAP = 9.5;
  function pt(a) { var t = (a - 90) * Math.PI / 180; return (RC + RR * Math.cos(t)).toFixed(2) + ' ' + (RC + RR * Math.sin(t)).toFixed(2); }
  function arcD(k) { var a0 = (k - 1) * SPAN + GAP / 2, a1 = k * SPAN - GAP / 2; return 'M' + pt(a0) + ' A' + RR + ' ' + RR + ' 0 0 1 ' + pt(a1); }
  function ringHTML() {
    var t = '', f = '', x = '';
    for (var k = 1; k <= 10; k++) {
      var d = arcD(k);
      t += '<path class="g-tk" d="' + d + '"/>';
      f += '<path class="g-fl" pathLength="100" d="' + d + '"/>';
      x += '<path class="g-fx" d="' + d + '"/>';
    }
    return '<div class="g-ring"><svg viewBox="0 0 184 184" aria-hidden="true">' + t + f + x + '</svg><img class="g-photo" alt="Maya Reyes" src="' + Z.MAYA.photo + '"></div>';
  }
  function setRing(root, pts) {
    var fl = $$('.g-fl', root);
    for (var k = 1; k <= 10; k++) {
      var fr = Math.max(0, Math.min(1, pts / 1000 - (k - 1))), p = fl[k - 1];
      if (!p) continue;
      p.style.strokeDasharray = (fr * 100).toFixed(2) + ' 200';
      p.style.opacity = fr > 0.004 ? 1 : 0;
    }
  }
  function flash(root, k, delay) {
    var x = $$('.g-fx', root)[k - 1]; if (!x) return;
    x.classList.remove('on'); reflow(x); x.style.animationDelay = (delay || 0) + 'ms'; x.classList.add('on');
  }
  function burst(ring) {
    var h = '', N = 14;
    for (var i = 0; i < N; i++) {
      var a = i * (360 / N) + (i % 2 ? 8 : -6), s = i % 3 ? 5 : 7, r = 20 + (i * 11) % 22;
      h += '<i class="g-pt" style="--a:' + a + 'deg;--s:' + s + 'px;--r:' + r + 'px;--d:' + (i % 5) * 70 + 'ms;--c:' + (i % 3 ? '#F2C14E' : '#D4D5DA') + '"></i>';
    }
    ring.insertAdjacentHTML('beforeend', h);
  }

  /* ---------- pieces ---------- */
  function metaHTML(pts, lvl) {
    var lv = lvl == null ? Z.levelOf(pts) : lvl;
    return '<div class="g-meta"><h1 class="h">Level <span class="g-lvn">' + lv + '</span></h1>' +
      '<div class="g-pts"><span class="g-ptn">' + n(pts) + '</span> skill points</div>' +
      '<div class="g-next">' + nextText(pts) + '</div></div>';
  }
  function nextText(pts) { var lv = Z.levelOf(pts); return lv >= 10 ? 'Every level open' : n((lv + 1) * 1000 - pts) + ' to Level ' + (lv + 1); }

  function upHTML() {
    return '<div class="g-up"><div class="big">Level 4</div><div class="g-uprow">' +
      '<span class="g-upi">' + Z.stack(['ramp.com', 'brex.com', 'webflow.com', 'gong.io', 'rippling.com'], 24, 30) + '<span>' + (D.after.open - D.before.open) + ' roles open</span></span>' +
      '<span class="g-upi"><span class="coin"></span><span>+' + 2 * C.level + ' credits</span></span></div></div>';
  }

  function getCard(levels, want) {
    return '<section class="card g-get" aria-label="What you get"><div class="g-ct">What you get</div>' + levels.map(function (l) {
      var w = want && l === 6, cos = l === 10 ? ['apple.com', 'openai.com'] : Z.LEVELS[l].cos;
      return '<div class="g-gr' + (w ? ' g-want' : '') + '"><div class="g-grt"><span class="i">Level ' + l + '</span><span class="m">+' + rolesAt(l) + ' roles</span></div>' + Z.stack(cos, 24) +
        (w ? '<div class="g-gj"><div class="g-gji"><div class="g-job">' + Z.logo('vercel.com', 24) + '<span class="i grow">' + esc(Z.MAYA.wants) + '</span><span class="m">Vercel</span></div></div></div>' : '') + '</div>';
    }).join('') + '</section>';
  }

  function scenCard() {
    var p = D.pick;
    return '<section class="card g-scen" aria-label="Scenario done"><span class="g-done" aria-label="Done" role="img">' + Z.IC.check + '</span>' +
      '<div class="g-st">' + Z.logo(p.dom, 40) + '<div class="g-stt"><span class="i">' + esc(p.title) + '</span><span class="m">' + esc(p.co) + '</span></div></div>' +
      '<div class="g-band">' + Z.bands(p.band) + '<span>' + esc(Z.BANDS[p.band].name) + '</span></div>' +
      '<span class="sp g-gain">+' + n(p.pays) + '</span></section>';
  }

  function coachCard(c) {
    return '<section class="g-coach" aria-label="Coach"><div class="g-ch">' + Z.zero(30) + '<span>Coach</span></div>' +
      '<div class="g-cb"><div class="g-cl">What I think so far</div><p class="g-think">' + esc(c.think) + '</p></div>' +
      '<div class="g-cb g-need"><div class="g-cl">What I need to see</div><p class="g-needp">' + esc(c.need) + '</p></div></section>';
  }

  function headHTML(state, open, hi, saw) {
    var H = HEADS[state];
    return '<div class="g-drawer' + (open ? ' open' : '') + '"><div class="g-dri"><section class="g-head" aria-label="Only the coach sees this">' +
      '<div class="g-hh">' + IC.eye + '<span>Only the coach sees this</span></div><ul class="g-reads">' +
      Z.HEAD.map(function (k, i) {
        return '<li class="g-rd' + (k === hi ? ' hi' : '') + '" data-k="' + esc(k) + '"><span class="g-rn">' + esc(k) + '</span>' + Z.bands(H.v[i]) +
          '<span class="g-tr ' + H.t[i] + '">' + IC[H.t[i]] + '</span><span class="g-sw"><span class="g-swi"><span>' + (k === hi && saw ? esc(saw) : '') + '</span></span></span></li>';
      }).join('') + '</ul></section></div></div>';
  }

  function rulesHTML() {
    return '<div class="g-rules"><span class="chip">Skill points: only from scenarios</span><span class="chip">Credits: stage ' + C.stage + ', scenario ' + C.scenario +
      ', level ' + C.level + ', streak ' + C.streak + ', invite ' + C.invite + '</span></div>';
  }

  /* the core layout. o = {pts, left:'get'|'scen', gets, want, coach, head, open, hi, saw, pre, hold, up, rise, rules} */
  function core(o) {
    var cls = 'g-root g-c' + (o.pre ? ' g-pre' : '') + (o.hold ? ' g-hold' : '');
    body.innerHTML = '<div class="' + cls + '"><div class="g-core">' +
      '<div class="g-left' + (o.rise ? ' rise' : '') + '">' + (o.left === 'scen' ? scenCard() : getCard(o.gets || [3, 4, 10], o.want)) + '</div>' +
      '<div class="g-mid">' + ringHTML() + metaHTML(o.pts, o.lvl) + (o.up ? upHTML() : '') + '</div>' +
      '<div class="g-right' + (o.rise ? ' rise d2' : '') + '">' + coachCard(D.coach[o.coach || 'morning']) + headHTML(o.head || 'morning', o.open, o.hi, o.saw) +
      '<svg class="g-link" aria-hidden="true"></svg></div>' +
      '</div>' + (o.rules ? rulesHTML() : '') + '</div>';
    var root = $('.g-root', body);
    setRing(root, o.pts);
    return root;
  }

  /* the connector: from the read the coach is watching to the line it says */
  function drawLink(k) {
    var r = $('.g-right'), svg = r && $('.g-link', r); if (!svg) return;
    var row = k && $('.g-rd[data-k="' + k + '"]', r), need = $('.g-need', r), coach = $('.g-coach', r);
    if (!row || !need || !coach) { svg.classList.remove('on'); return; }
    var R = r.getBoundingClientRect(), z = R.width / (r.offsetWidth || 1) || 1, a = need.getBoundingClientRect(), b = row.getBoundingClientRect();
    var y1 = Math.round((a.top + a.height / 2 - R.top) / z), y2 = Math.round((b.top - R.top) / z + 13), x = -18, q = 8;
    svg.innerHTML = '<path class="ln" d="M-3 ' + y1 + 'H' + (x + q) + 'Q' + x + ' ' + y1 + ' ' + x + ' ' + (y1 + q) + 'V' + (y2 - q) + 'Q' + x + ' ' + y2 + ' ' + (x + q) + ' ' + y2 + 'H-3"/>' +
      '<path d="M-7.5 ' + (y1 - 3.5) + 'L-3.5 ' + y1 + 'L-7.5 ' + (y1 + 3.5) + '"/><circle cx="-3" cy="' + y2 + '" r="2"/>';
    svg.classList.add('on');
    $$('.g-cb', r).forEach(function (cb) { cb.classList.toggle('lit', cb === need); });
  }
  function hideLink() {
    var svg = $('.g-link'); if (svg) svg.classList.remove('on');
    $$('.g-cb.lit').forEach(function (cb) { cb.classList.remove('lit'); });
  }
  function highlight(k, saw) {
    $$('.g-rd').forEach(function (rd) {
      var on = rd.getAttribute('data-k') === k;
      if (on) $('.g-swi span', rd).textContent = saw || '';
      rd.classList.toggle('hi', on);
    });
  }
  function setRead(k, v, t) {
    var rd = $('.g-rd[data-k="' + k + '"]'); if (!rd) return;
    $('.bands', rd).className = 'bands on' + v;
    var tr = $('.g-tr', rd); tr.className = 'g-tr ' + t; tr.innerHTML = IC[t];
    rd.classList.remove('moved'); reflow(rd); rd.classList.add('moved');
  }
  function openDrawer(on) { var d = $('.g-drawer'); if (d) d.classList.toggle('open', on !== false); }

  /* the credits ledger hangs under the credits pill in the top bar */
  function lrow(r) { return '<div class="g-lr' + (r.fresh ? ' new' : '') + '">' + '<span class="grow">' + esc(r.t) + '</span><span class="g-la"><span class="coin"></span>' + esc(r.a) + '</span></div>'; }
  function ledger(rows) {
    var top = $('.zs-top'), cr = $('.zs-cr'); if (!top || !cr) return null;
    var L = Z.el('<div class="g-ledger" role="dialog" aria-label="Credits today">' + rows.map(lrow).join('') + '</div>');
    L.style.left = cr.offsetLeft + 'px';
    top.appendChild(L);
    return L;
  }

  function clean() {
    $$('.g-ledger').forEach(function (x) { x.remove(); });
  }
  function pills(pts, cr) { Z.pill.set(pts); Z.pill.credits(cr); }

  /* ---------- Day 4 ---------- */
  function daily() {
    var d = '';
    for (var i = 1; i <= 7; i++) {
      var cls = i < 4 ? 'got' : i === 4 ? 'now' : i === 7 ? 'chest' : 'next';
      var ic = i < 4 ? '<span class="g-tick">' + Z.IC.check + '</span>' : i === 7 ? '<span class="g-chest" aria-label="Chest" role="img"><i></i></span>' : '<span class="coin"></span>';
      d += '<div class="g-day ' + cls + '"><span class="g-dn">Day ' + i + '</span><span class="g-dic">' + ic + '</span><span class="g-da">' + (i === 7 ? C.chest7 : C.streak) + '</span></div>';
    }
    body.innerHTML = '<div class="g-root g-daily"><section class="card g-dc"><h1 class="h">Day ' + D.after.streak + '</h1><div class="g-days">' + d + '</div>' +
      '<button class="btn g-collect"><span class="coin"></span>Collect ' + C.streak + '</button></section></div>';
  }

  /* ---------- how the coach talks ---------- */
  var TALK = ['Communication', 'Independence', 'Quality', 'Speed'];
  function note(o, good) {
    return '<div class="g-note' + (good ? ' good' : '') + '"><p>' + esc(o.say) + '</p><div class="g-try"><span>' + (good ? 'Keep' : 'Try') + '</span> ' + esc(o.try) + '</div></div>';
  }
  function talk() {
    body.innerHTML = '<div class="g-root g-talk"><div class="g-th">' + Z.zero(34) + '<h1 class="h">How your coach talks</h1></div><div class="g-grid">' +
      TALK.map(function (k) {
        var c = coachFor(k);
        return '<section class="g-cell" data-k="' + esc(k) + '"><div class="g-cr"><span class="i">' + esc(k) + '</span><span class="g-cw">' +
          c.watches.map(function (w) { return '<span class="chip">' + esc(w) + '</span>'; }).join('') + '</span></div>' +
          '<div class="g-notes"><span class="g-saw">' + esc(c.low.saw) + '</span><span class="g-saw">' + esc(c.high.saw) + '</span>' + note(c.low, false) + note(c.high, true) + '</div></section>';
      }).join('') + '</div><div class="g-crules">' + Z.COACH_RULES.map(function (r) { return '<span class="chip">' + esc(r) + '</span>'; }).join('') + '</div></div>';
  }

  var COMM = coachFor('Communication'), INDEP = coachFor('Independence');

  /* ================= the beats ================= */
  var BEATS = [
    { /* 1 Day 4: the daily check in */
      at: '8:40 AM',
      enter: function () { clean(); pills(D.before.pts, D.before.credits); daily(); },
      play: async function (s) {
        await s.wait(900);
        var btn = $('.g-collect');
        await s.press(btn, 1700);
        var day = $('.g-day.now'), from = $('.coin', day), to = $('.zs-cr .coin') || $('.zs-cr');
        var flights = [Z.fly(from, to, '<span class="coin"></span>', 900)];
        await s.wait(120); flights.push(Z.fly(from, to, '<span class="coin"></span>', 900));
        await s.wait(120); flights.push(Z.fly(from, to, '<span class="coin"></span>', 900));
        day.classList.add('got'); $('.g-dic', day).innerHTML = '<span class="g-tick">' + Z.IC.check + '</span>';
        btn.className = 'btn-l g-collect'; btn.disabled = true; btn.innerHTML = '<span class="g-tick">' + Z.IC.check + '</span>Collected';
        await Promise.all(flights); s.alive();
        Z.pill.credits(D.before.credits + C.streak, true);
        await s.wait(600);
      },
      hold: 1800
    },
    { /* 2 Where you stand */
      at: '8:41 AM',
      enter: function () {
        clean(); pills(D.before.pts, D.before.credits + C.streak);
        var root = core({ pts: 0, lvl: D.before.level, pre: true });
        $('.g-next', root).classList.add('off'); $('.g-next', root).textContent = nextText(D.before.pts);
      },
      play: async function (s) {
        var root = $('.g-root');
        await s.wait(350);
        await Promise.all([
          Z.count($('.g-ptn'), 0, D.before.pts, 1500),
          tween(1500, function (e) { setRing(root, e * D.before.pts); }, outCubic)
        ]); s.alive();
        $('.g-next').classList.remove('off');
        await s.wait(350);
        root.classList.remove('g-pre');
        await s.wait(900);
      },
      hold: 2600
    },
    { /* 3 What the coach keeps to itself */
      at: '8:42 AM',
      enter: function () { clean(); pills(D.before.pts, D.before.credits + C.streak); core({ pts: D.before.pts, head: 'morning' }); },
      play: async function (s) {
        await s.wait(800);
        openDrawer();
        await s.wait(900);
        highlight('Communication', COMM.low.saw);
        await s.wait(800);
        drawLink('Communication');
        await s.wait(600);
      },
      hold: 3600
    },
    { /* 4 How the coach talks */
      at: '8:43 AM',
      enter: function () { clean(); pills(D.before.pts, D.before.credits + C.streak); talk(); },
      play: async function (s) {
        await s.wait(500);
        var cells = $$('.g-cell');
        for (var i = 0; i < cells.length; i++) { cells[i].classList.add('on'); await s.wait(1300); }
        $('.g-crules').classList.add('on');
        await s.wait(600);
      },
      hold: 9000
    },
    { /* 5 Signals arrive */
      at: '10:31 AM',
      enter: function () {
        clean(); pills(D.before.pts, 260);
        core({ pts: D.before.pts, head: 'morning', open: true, hi: 'Communication', saw: COMM.low.saw });
        drawLink('Communication');
        ledger([{ t: 'Started ' + D.pick.co, a: 'Spent ' + C.start }]);
      },
      play: async function (s) {
        await s.wait(1100);
        Z.wire({ from: 1, text: 'Message read: clear' });
        await s.wait(500);
        setRead('Communication', 2, 'up');
        highlight('Communication', COMM.high.saw);
        await s.wait(700);
        drawLink('Communication');
        await s.wait(1300);
        Z.wire({ from: 1, text: 'Plan done, +' + C.stage + ' credits' });
        var L = $('.g-ledger');
        if (L) L.insertAdjacentHTML('beforeend', lrow({ t: 'Plan done', a: 'Earned ' + C.stage, fresh: true }));
        await s.wait(250);
        Z.pill.credits(260 + C.stage, true);
        await s.wait(2200);
        L = $('.g-ledger'); if (L) L.classList.add('out');
        await s.wait(400);
        clean();
      },
      hold: 1600
    },
    { /* 6 Scenario done */
      at: '3:40 PM',
      enter: function () { clean(); pills(D.before.pts, 360); core({ pts: D.before.pts, left: 'scen', hold: true }); },
      play: async function (s) {
        var root = $('.g-root');
        await s.wait(500);
        root.classList.remove('g-hold');
        await s.wait(1000);
        Z.wire({ from: 1, text: '+' + n(D.pick.pays) + ' skill points' });
        await s.wait(300);
        var gain = $('.g-gain');
        await Z.fly(gain, $('.g-photo'), '<span class="sp">+' + n(D.pick.pays) + '</span>', 1000); s.alive();
        gain.classList.add('spent');
        var lvNow = D.before.level, ptn = $('.g-ptn'), lvn = $('.g-lvn'), nx = $('.g-next');
        await tween(2600, function (e) {
          var p = D.before.pts + e * (D.after.pts - D.before.pts), l = Z.levelOf(p);
          setRing(root, p); ptn.textContent = n(p); nx.textContent = nextText(Math.round(p));
          if (l > lvNow) { lvNow = l; flash(root, l); lvn.textContent = l; lvn.classList.remove('pop'); reflow(lvn); lvn.classList.add('pop'); }
        }, inOut); s.alive();
        Z.pill.set(D.after.pts, true);
        await s.wait(800);
        Z.wire({ from: 1, text: 'Scenario done, +' + C.scenario + ' credits' });
        await s.wait(250);
        Z.pill.credits(360 + C.scenario, true);
        await s.wait(700);
      },
      hold: 1800
    },
    { /* 7 Level 4 */
      at: '3:41 PM',
      enter: function () { clean(); pills(D.after.pts, 510); core({ pts: D.after.pts, left: 'scen', up: true }); },
      play: async function (s) {
        var root = $('.g-root');
        await s.wait(600);
        root.classList.add('g-focus');
        await s.wait(700);
        for (var k = 1; k <= D.after.level; k++) flash(root, k, (k - 1) * 110);
        burst($('.g-ring'));
        await s.wait(1000);
        Z.wire({ to: 3, text: 'Level ' + D.after.level + ' opened ' + (D.after.open - D.before.open) + ' roles' });
        await s.wait(900);
        var from = $('.g-up .coin'), to = $('.zs-cr .coin') || $('.zs-cr');
        var f = [Z.fly(from, to, '<span class="coin"></span>', 900)];
        await s.wait(140); f.push(Z.fly(from, to, '<span class="coin"></span>', 900));
        await Promise.all(f); s.alive();
        Z.pill.credits(510 + 2 * C.level, true);
        await s.wait(900);
        Z.wire({ to: 1, text: 'Next scenario unlocked' });
        await s.wait(600);
      },
      hold: 2600
    },
    { /* 8 The coach updates */
      at: '3:42 PM',
      enter: function () { clean(); pills(D.after.pts, D.after.credits); core({ pts: D.after.pts, gets: [5, 6, 10], head: 'evening', rise: true }); },
      play: async function (s) {
        await s.wait(1100);
        openDrawer();
        await s.wait(900);
        highlight('Independence', INDEP.low.saw);
        await s.wait(800);
        drawLink('Independence');
        await s.wait(900);
        var th = $('.g-think'), nd = $('.g-needp');
        th.classList.add('out'); nd.classList.add('out');
        await s.wait(420);
        th.textContent = ''; nd.textContent = ''; th.classList.remove('out'); nd.classList.remove('out');
        await s.type(th, D.coach.evening.think, 44);
        await s.wait(250);
        await s.type(nd, D.coach.evening.need, 44);
        await s.wait(2000);
        hideLink();
        highlight(null);
        openDrawer(false);
        await s.wait(800);
      },
      hold: 1800
    },
    { /* 9 What's next */
      at: '3:43 PM',
      enter: function () { clean(); pills(D.after.pts, D.after.credits); core({ pts: D.after.pts, gets: [5, 6, 10], want: true, coach: 'evening', rules: true }); },
      play: async function (s) {
        await s.wait(800);
        var w = $('.g-want'); if (w) w.classList.add('on');
        await s.wait(1000);
        $('.g-rules').classList.add('on');
        await s.wait(400);
      },
      hold: 6000
    }
  ];

  addEventListener('resize', function () {
    var svg = $('.g-link.on'), hi = $('.g-rd.hi');
    if (svg && hi) drawLink(hi.getAttribute('data-k'));
  });

  Z.loadWord().then(function () {
    body = Z.shell({ sys: 2, tab: '', level: true, coach: false });
    Z.run(BEATS);
  });
  window.ZG = { beats: BEATS, drawLink: drawLink };
})();
