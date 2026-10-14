/* 1 Scenarios: do the work, build proof.
   Maya's Tuesday inside one scenario (Stripe), told in the real app: the road, the pick, the kickoff call,
   the workspace (plan, proof of understanding, build, review) and the scenario card.
   What crosses to Levels & Coach (2) and Jobs (3) shows on the strip through ZS.wire. Every class starts with l-. */
(function () {
  'use strict';
  var D = ZS.DAY, P = D.pick, ALT = D.alt, DANA = P.manager, IC = ZS.IC, esc = ZS.esc;
  var body = null;

  /* ================= small pieces ================= */
  var IX = {
    cam: '<svg viewBox="0 0 16 16"><rect x="1.8" y="4.3" width="8.6" height="7.4" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.4 7.1 14.2 5.2v5.6l-3.8-1.9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    phone: '<svg viewBox="0 0 16 16"><path d="M3.2 9.6c3-2.2 6.6-2.2 9.6 0l-1.1 1.9-2.1-.6V9.4a6.6 6.6 0 0 0-3.2 0v1.5l-2.1.6z" fill="currentColor"/></svg>'
  };
  function q(s, r) { return (r || body).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || body).querySelectorAll(s)); }
  function draw(html) { body.innerHTML = html; return body.firstElementChild; }
  function add(parent, html) { var e = ZS.el(html); parent.appendChild(e); return e; }
  function wave(nb, seed) {
    var s = '';
    for (var i = 0; i < nb; i++) {
      var h = .2 + .8 * Math.abs(Math.sin((i + seed) * 1.37) * Math.cos((i + seed) * .41 + .7));
      s += '<i style="--h:' + h.toFixed(2) + ';--d:' + ((i * 97) % 640) + 'ms"></i>';
    }
    return s;
  }
  function mins(m) { var h = Math.floor(m / 60), r = m % 60; return h + ' h' + (r ? ' ' + r + ' m' : ''); }
  function topEl(sel) { return document.querySelector(sel); }
  function jobsDot(on) {
    var b = topEl('.tabs button[data-tab="jobs"]'); if (!b) return;
    var d = b.querySelector('.dot');
    if (on && !d) b.insertAdjacentHTML('beforeend', '<i class="dot l-dotin"></i>');
    if (!on && d) d.remove();
  }
  /* every beat starts here: the pills as they were at that moment, no coach note, the right floater place */
  function reset(pts, cr, ws) {
    ZS.pill.set(pts); ZS.pill.credits(cr); ZS.coach.hide(); jobsDot(false);
    document.body.classList.toggle('l-ws-on', !!ws);
    if (!ws) document.body.style.removeProperty('--l-cl');
  }
  /* in the workspace the chat owns the right edge, so the coach floater sits under the stage rail */
  function placeCoach() {
    if (!document.body.classList.contains('l-ws-on')) return;
    var root = q('.l-ws'), rail = q('.l-rail'); if (!root || !rail) return;
    document.body.style.setProperty('--l-cl', (root.offsetLeft + rail.offsetLeft) + 'px');
  }
  function coachSay(x, good) { return ZS.coach.say({ say: x.say, try: x.try, good: !!good }); }

  /* ================= the road (Zero map, Maya's home) ================= */
  var ROAD = D.road;
  var MAP = null; /* {el, st} */
  function mapHTML() {
    var h = '<svg class="l-rsvg" aria-hidden="true"><polyline class="l-r-a"/><polyline class="l-r-d"/></svg>' +
      '<div class="l-home"><span class="l-plat"></span>' + ZS.zero(96) + '</div>';
    ROAD.forEach(function (r, i) {
      h += '<div class="l-stop" data-i="' + i + '"><span class="l-ring">' + ZS.logo(r.dom, 40, 'round') + '</span>' +
        '<i class="l-bd"></i><span class="l-tk">' + IC.check + '</span><span class="l-sl">' + esc(r.co) + '</span></div>';
    });
    return h + '<span class="l-me">' + ZS.av('maya', 30) + '</span>';
  }
  /* st = {bands: {i: band}, lit: i or -1, maya: position in stop units} */
  function mapDraw(host, st) {
    var m = add(host, '<div class="l-map">' + mapHTML() + '</div>');
    MAP = { el: m, st: st };
    mapLayout();
    return m;
  }
  function geom(W, H) {
    var k = Math.max(.8, Math.min(W / 1180, H / 660, 1.3));
    /* the road leaves Zero's platform, opens quickly, then runs as a slowly widening orbit (calm, balanced) */
    var cx = W / 2, cy = H / 2, ax = 1.58, t0 = 0.56, sw = 5.72, R = 100;
    var r0 = R / Math.sqrt(ax * ax * Math.cos(t0) * Math.cos(t0) + Math.sin(t0) * Math.sin(t0)), rA = 178 * k, r1 = 238 * k, ua = .2;
    var N = 600, pts = [], L = [0];
    for (var i = 0; i <= N; i++) {
      var u = i / N, th = t0 + sw * u, x = Math.min(u / ua, 1), r = r0 + (rA - r0) * (1 - (1 - x) * (1 - x)) + (r1 - rA) * u;
      pts.push([cx + ax * r * Math.cos(th), cy + r * Math.sin(th)]);
      if (i) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    var total = L[N], d = total / (ROAD.length - 1 + .62);
    function at(s) {
      s = Math.max(0, Math.min(total, s));
      var lo = 0, hi = N;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (L[mid] < s) lo = mid; else hi = mid; }
      var f = (s - L[lo]) / ((L[hi] - L[lo]) || 1);
      return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f, lo];
    }
    function sOf(u) { return (.62 + u) * d; } /* stop units to arc length */
    return { W: W, H: H, cx: cx, cy: cy, k: k, pts: pts, L: L, total: total, at: at, sOf: sOf, stops: ROAD.map(function (r, i) { return at(sOf(i)); }) };
  }
  function mapLayout() {
    if (!MAP || !MAP.el.isConnected) return;
    var m = MAP.el, st = MAP.st, W = m.clientWidth, H = m.clientHeight;
    if (!W || !H) return;
    var g = geom(W, H); MAP.g = g;
    var svg = q('.l-rsvg', m); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var sm = g.sOf(st.maya), pm = g.at(sm);
    var done = [], ahead = [pm];
    g.pts.forEach(function (p, i) { if (g.L[i] < sm) done.push(p); else ahead.push(p); });
    done.push(pm);
    function pl(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    q('.l-r-d', m).setAttribute('points', pl(done));
    q('.l-r-a', m).setAttribute('points', pl(ahead));
    var home = q('.l-home', m); home.style.left = g.cx + 'px'; home.style.top = g.cy + 'px';
    qa('.l-stop', m).forEach(function (e, i) {
      var p = g.stops[i], band = st.bands[i];
      e.style.left = p[0].toFixed(1) + 'px'; e.style.top = p[1].toFixed(1) + 'px';
      e.classList.toggle('is-done', band != null);
      e.classList.toggle('is-lit', i === st.lit);
      e.classList.toggle('is-later', band == null && i !== st.lit);
      if (band != null) q('.l-bd', e).style.background = ZS.BANDS[band].c;
    });
    var me = q('.l-me', m); me.style.left = pm[0].toFixed(1) + 'px'; me.style.top = pm[1].toFixed(1) + 'px';
    var card = q('.l-unlock', m); if (card && st.lit >= 0) placeCard(card, g, st.lit, pm);
  }
  /* the unlock card sits beside the lit stop, in the calmest free spot (no stop, no road, inside the sheet) */
  function placeCard(card, g, i, pm) {
    var cw = card.offsetWidth, ch = card.offsetHeight, p = g.stops[i], gap = 58, mg = 24, best = null;
    function dist(x, y) { var nx = Math.max(x, Math.min(p[0], x + cw)), ny = Math.max(y, Math.min(p[1], y + ch)); return Math.hypot(nx - p[0], ny - p[1]); }
    /* first choice: straight out from Zero, just far enough to leave a clear gap from the lit stop */
    var ox = p[0] - g.cx, oy = p[1] - g.cy, ol = Math.hypot(ox, oy) || 1, t = 0; ox /= ol; oy /= ol;
    while (t < 600 && dist(p[0] + ox * t - cw / 2, p[1] + oy * t - ch / 2) < gap) t += 2;
    var c = [
      [p[0] + ox * t - cw / 2, p[1] + oy * t - ch / 2],
      [p[0] - gap - cw, p[1] - ch / 2], [p[0] - gap - cw, p[1] - ch + 36], [p[0] - gap - cw, p[1] - 36],
      [p[0] + gap, p[1] - ch / 2], [p[0] + gap, p[1] - ch + 36], [p[0] + gap, p[1] - 36],
      [p[0] - cw / 2, p[1] + gap], [p[0] - cw / 2, p[1] - gap - ch]
    ];
    c.forEach(function (xy, ci) {
      var x = xy[0], y = xy[1], pen = ci * .5;
      if (x < mg || y < mg || x + cw > g.W - mg || y + ch > g.H - mg) pen += 1e6;
      if (x + cw > g.W - 110 && y + ch > g.H - 110) pen += 1e5; /* the coach floater */
      function hit(cx, cy, r) { var nx = Math.max(x, Math.min(cx, x + cw)), ny = Math.max(y, Math.min(cy, y + ch)); return Math.hypot(nx - cx, ny - cy) < r; }
      g.stops.forEach(function (s, si) { if (hit(s[0], s[1], si === i ? gap - 2 : 44)) pen += 1000; });
      if (hit(g.cx, g.cy, 110)) pen += 1000;
      if (hit(pm[0], pm[1], 30)) pen += 1000;
      g.pts.forEach(function (s, k) { if (k % 3 === 0 && hit(s[0], s[1], 12)) pen += 1; });
      if (!best || pen < best.pen) best = { x: x, y: y, pen: pen };
    });
    card.style.left = Math.round(best.x) + 'px'; card.style.top = Math.round(best.y) + 'px';
  }
  function unlockCard(doms) {
    return '<div class="l-unlock"><div class="l-uh">' + ZS.stack(doms, 28) + '<div class="grow"><div class="l-ut">New scenario unlocked</div><div class="l-um">2 to pick from</div></div></div>' +
      '<button class="l-btnw">Pick</button></div>';
  }
  function showUnlock(doms) {
    var c = add(MAP.el, unlockCard(doms)); mapLayout(); c.classList.add('l-in'); return c;
  }
  /* Maya walks the road from one spot to the next */
  function walk(s, from, to, ms) {
    return new Promise(function (res) {
      var t0 = performance.now(), dur = ms / ZS.story.speed;
      (function f(t) {
        if (!MAP || !MAP.el.isConnected || s.tok !== ZS.story.tok) return res();
        var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        MAP.st.maya = from + (to - from) * e; mapLayout();
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  window.addEventListener('resize', function () { mapLayout(); placeCoach(); });

  /* ================= pick one ================= */
  function pickCard(x, i) {
    return '<article class="l-pick card rise d' + (i + 1) + '" data-co="' + esc(x.co) + '">' +
      '<div class="l-art">' + ZS.logo(x.dom, 64, 'round') + '<span class="i">' + esc(x.co) + '</span></div>' +
      '<div class="l-pk-b"><div class="i">' + esc(x.title) + '</div>' +
      '<div class="l-tools">' + x.tools.map(function (t) { return '<span class="l-tool">' + ZS.logo(t[1], 20, 'round') + esc(t[0]) + '</span>'; }).join('') + '</div>' +
      '<div class="l-meta"><span class="chip">' + mins(x.mins) + '</span><span class="sp">Up to 3,000</span></div></div>' +
      '<button class="btn l-start">Start<span class="l-cost"><span class="coin"></span>100</span></button></article>';
  }

  /* ================= kickoff call ================= */
  var GOALS = ['Pick 3 intent signals', 'Score 8,000 accounts', 'Show sales the top 50'];
  function callHTML() {
    return '<div class="l-root l-callv"><div class="l-call">' +
      '<header class="l-call-h">' + ZS.logo(P.dom, 24, 'round') + '<span class="i">Kickoff</span><span class="l-timer">12:04</span></header>' +
      '<div class="l-stagev"><div class="l-spk">' + ZS.av(DANA, 120) + '<div class="l-who"><span class="i">' + esc(DANA.name) + '</span><span class="m">' + esc(DANA.title) + '</span></div></div>' +
      '<div class="l-self"><img alt="" src="' + ZS.MAYA.photo + '"></div></div>' +
      '<div class="l-cap"><span class="l-cap-n">Dana</span><span class="l-cap-t"></span></div>' +
      '<div class="l-goals">' + GOALS.map(function (g, i) { return '<span class="l-goal"><i>' + (i + 1) + '</i>' + esc(g) + '</span>'; }).join('') + '</div>' +
      '<div class="l-ctl"><button class="l-cb" aria-label="Mute">' + IC.mic + '</button><button class="l-cb" aria-label="Camera">' + IX.cam + '</button><button class="btn l-go">Start the work</button></div>' +
      '</div></div>';
  }
  function ticker(s, node, from) {
    var t = from;
    (async function () { for (;;) { await s.wait(1000); t++; node.textContent = Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2); } })().catch(function () {});
  }

  /* ================= the workspace: stage rail, the work, the one chat ================= */
  var CHAT0 = [['dana', 'When can I see your scoring plan?']];
  var RUSHED = 'ok will send it tmrw', CLEAR = 'I\'ll send the scoring plan by 10am tomorrow, with the three signals I picked and why.';
  var CHAT1 = CHAT0.concat([['maya', RUSHED], ['dana', 'Thanks.'], ['maya', CLEAR], ['dana', 'Perfect, that helps.']]);
  function msg(who, text, cls) {
    return '<div class="l-m is-' + who + (cls ? ' ' + cls : '') + '">' + (who === 'dana' ? ZS.av(DANA, 24) : '') + '<div class="l-bub">' + esc(text) + '</div></div>';
  }
  function rail(cur) {
    return '<aside class="l-rail"><div class="l-sc">' + ZS.logo(P.dom, 36, 'round') + '<div class="grow"><div class="i">' + esc(P.title) + '</div><div class="m">' + esc(P.co) + '</div></div></div>' +
      '<ol class="l-stages">' + P.stages.map(function (t, i) {
        var c = i < cur ? 'done' : i === cur ? 'cur' : 'todo';
        return '<li class="l-st is-' + c + '"><span class="l-sti">' + IC.check + '</span><span class="grow">' + esc(t) + '</span></li>';
      }).join('') + '</ol></aside>';
  }
  function chat(list) {
    return '<aside class="l-chat"><header class="l-chat-h">' + ZS.av(DANA, 32) + '<div class="grow"><div class="i">' + esc(DANA.name) + '</div><div class="m">' + esc(DANA.title) + '</div></div></header>' +
      '<div class="l-msgs">' + list.map(function (m) { return msg(m[0], m[1]); }).join('') + '</div>' +
      '<div class="l-comp"><div class="l-input" data-ph="Message Dana"></div><button class="l-send" aria-label="Send">' + IC.send + '</button></div></aside>';
  }
  function ws(cur, work, list) {
    draw('<div class="l-root l-ws">' + rail(cur) + '<section class="l-work"><div class="l-workin">' + work + '</div></section>' + chat(list) + '</div>');
    var m = q('.l-msgs'); m.scrollTop = m.scrollHeight;
    placeCoach();
  }
  function stageDone(i) {
    var li = qa('.l-st'); li[i].className = 'l-st is-done l-justdone';
    if (li[i + 1]) li[i + 1].className = 'l-st is-cur';
    return li[i];
  }
  function addMsg(who, text) { var box = q('.l-msgs'), e = add(box, msg(who, text, 'l-new')); box.scrollTop = box.scrollHeight; return e; }
  async function send(s, text, cps) {
    var inp = q('.l-input'), btn = q('.l-send');
    await s.type(inp, text, cps);
    btn.classList.add('is-ready');
    await s.press(btn, 500);
    inp.textContent = ''; btn.classList.remove('is-ready');
    addMsg('maya', text);
  }
  async function reply(s, text, ms) {
    var box = q('.l-msgs');
    var t = add(box, '<div class="l-m is-dana l-new">' + ZS.av(DANA, 24) + '<div class="l-bub l-typing"><i></i><i></i><i></i></div></div>');
    box.scrollTop = box.scrollHeight;
    await s.wait(ms || 1000);
    t.remove(); addMsg('dana', text);
  }
  /* credits for a stage: a coin flies from the stage to the credits pill */
  async function stagePay(s, i, to, text) {
    var li = stageDone(i);
    await ZS.fly(q('.l-sti', li), topEl('.zs-cr'), '<span class="l-flyc"><span class="coin"></span>+50</span>', 900); s.alive();
    ZS.pill.credits(to, true);
    ZS.wire({ to: 2, text: text });
  }

  /* --- plan --- */
  var SIGS = [['Pricing page visits', 'hubspot.com', 35], ['Seats added this month', 'snowflake.com', 45], ['Hiring for RevOps', 'clay.com', 20]];
  function sigRow(x, full) {
    return '<div class="l-sig">' + ZS.logo(x[1], 28, 'round') + '<span class="l-sig-n grow">' + (full ? esc(x[0]) : '') + '</span>' +
      '<span class="l-wbar"><i style="width:' + (full ? x[2] : 0) + '%"></i></span><span class="l-wv">' + (full ? x[2] : 0) + '%</span></div>';
  }
  function planWork(full) {
    return '<div class="l-doc card"><h2 class="h">Scoring plan</h2><div class="l-sigs">' + (full ? SIGS.map(function (x) { return sigRow(x, true); }).join('') : '') + '</div></div>';
  }

  /* --- proof of understanding --- */
  var QS = [
    { q: 'Why weigh seats added above page visits?', ql: '0:06', al: '0:14', checks: 2 },
    { q: 'What could push an account up by mistake?', ql: '0:05', al: '0:11', checks: 3 },
    { q: 'How will sales use the top 50?', ql: '0:04', al: '0:09', checks: 4 }
  ];
  function voiceQ(x, i) {
    return '<div class="l-q">' + ZS.av(DANA, 28) + '<div class="l-vn"><div class="l-vn-r"><span class="l-play">' + IC.play + '</span>' +
      '<span class="l-wave"><span class="l-wb">' + wave(34, i * 7 + 2) + '</span><span class="l-wf">' + wave(34, i * 7 + 2) + '</span></span><span class="l-dur">' + x.ql + '</span></div>' +
      '<div class="l-vn-t">' + esc(x.q) + '</div></div></div>';
  }
  function voiceA(x, i, done) {
    return '<div class="l-a"><div class="l-rec' + (done ? '' : ' is-on') + '"><span class="l-mic">' + IC.mic + '</span><span class="l-wave l-ww">' + wave(26, i * 5 + 11) + '</span>' +
      '<span class="l-dur">' + (done ? x.al : '0:00') + '</span><span class="l-ak">' + IC.check + '</span></div></div>';
  }
  function popWork() {
    return '<div class="l-pop card"><div class="l-pop-h"><h2 class="h">Proof of understanding</h2><div class="l-meter" aria-label="Checks">' +
      '<i>' + IC.check + '</i><i>' + IC.check + '</i><i>' + IC.check + '</i><i>' + IC.check + '</i></div></div><div class="l-qa"></div></div>';
  }
  function fillChecks(nb) { qa('.l-meter i').forEach(function (e, i) { if (i < nb) e.classList.add('on'); }); }

  /* --- build --- */
  var ACCTS = [
    ['Northwind Health', 'Seats added', 94], ['Orbit Freight', 'Pricing visits', 91], ['Larkspur Bank', 'Seats added', 87], ['Kestrel Robotics', 'RevOps hiring', 82],
    ['Juniper Foods', 'Pricing visits', 76], ['Fernhill Air', 'Seats added', 71], ['Bramble Studio', 'RevOps hiring', 64], ['Tidewater Energy', 'Pricing visits', 58]
  ];
  function mono(name) { return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function acctRow(a, cls) {
    return '<div class="l-tr' + (cls ? ' ' + cls : '') + '"><span class="l-acc"><span class="l-mono">' + esc(mono(a[0])) + '</span><span class="i">' + esc(a[0]) + '</span></span>' +
      '<span><span class="chip">' + esc(a[1]) + '</span></span><span class="l-score"><span class="l-sbar"><i style="width:' + a[2] + '%"></i></span><span class="i">' + a[2] + '</span></span></div>';
  }
  function buildWork() {
    return '<div class="l-build"><div class="l-toolsrow">' + P.tools.map(function (t) {
      return '<span class="l-conn">' + ZS.logo(t[1], 20, 'round') + '<span class="i">' + esc(t[0]) + '</span><span class="l-ok">' + IC.check + 'Connected</span></span>';
    }).join('') + '</div><div class="l-table card"><h2 class="h">Accounts by intent</h2>' +
      '<div class="l-tr l-th"><span>Account</span><span>Signal</span><span>Intent</span></div><div class="l-rows"></div></div></div>';
  }

  /* --- review --- */
  function slide(i) {
    var inner = [
      '<span class="l-s1">' + ZS.logo(P.dom, 16, 'round') + '<b style="width:70%"></b><b style="width:46%"></b></span>',
      '<span class="l-s2"><b style="width:62%"></b><b style="width:82%"></b><b style="width:40%"></b></span>',
      '<span class="l-s3"><b style="height:30%"></b><b style="height:46%"></b><b style="height:58%"></b><b style="height:74%"></b><b style="height:92%"></b></span>',
      '<span class="l-s4"><b></b><b></b><b></b><b></b></span>'
    ][i];
    return '<span class="l-slide' + (i === 0 ? ' on' : '') + '">' + inner + '</span>';
  }
  function reviewWork() {
    return '<div class="l-revv"><div class="l-slides">' + [0, 1, 2, 3].map(slide).join('') + '</div>' +
      '<div class="l-rev card"><div class="l-rev-h">' + ZS.av(DANA, 32) + '<div class="grow"><div class="i">' + esc(DANA.name) + '</div><div class="m">' + esc(DANA.title) + '</div></div></div>' +
      '<h2 class="h">Exceeding Expectations</h2><span class="bands l-band">' + '<i></i><i></i><i></i><i></i><i></i>' + '</span>' +
      '<div class="l-reads">' + ZS.SKILLS.map(function (k, i) {
        return '<div class="l-read"><span class="grow">' + esc(k) + '</span><span class="bands"><i></i><i></i><i></i><i></i><i></i></span><span class="l-rb">' + esc(ZS.BANDS[P.reads[i]].short) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="l-say">Clear plan and a strong model. Send updates before I ask.</div></div></div>';
  }

  /* ================= scenario done ================= */
  var ART = { 'stripe.com': ['#7C75FF', '#4B43D6'] }; /* the company art takes the company's own colour */
  function doneHTML() {
    return '<div class="l-root l-donev"><article class="l-done">' +
      '<div class="l-dart" style="--a1:' + ART[P.dom][0] + ';--a2:' + ART[P.dom][1] + '"><span class="l-cnt">04 / 10</span>' + ZS.logo(P.dom, 72, 'round') + '</div>' +
      '<h2 class="h l-dt">' + esc(P.title) + ' at ' + esc(P.co) + '</h2>' +
      '<div class="l-drows">' +
      '<div class="l-dr"><span>Performance</span><span class="l-dv"><i class="l-bdot" style="background:' + ZS.BANDS[P.band].c + '"></i>' + esc(ZS.BANDS[P.band].short) + '</span></div>' +
      '<div class="l-dr"><span>Time spent</span><span class="l-dv">2 h 50 m</span></div>' +
      '<div class="l-dr"><span>Skill points earned</span><span class="l-dv"><span class="sp">+' + ZS.n(P.pays) + '</span></span></div>' +
      '<div class="l-dr"><span>Portfolio</span><span class="l-dv l-added">Added</span></div>' +
      '</div><button class="l-btnw">Back to the road</button></article></div>';
  }

  /* ================= the beats ================= */
  var B4 = { bands: { 0: ROAD[0].band, 1: ROAD[1].band, 2: ROAD[2].band } };
  function bands9() { var b = { 0: ROAD[0].band, 1: ROAD[1].band, 2: ROAD[2].band }; b[3] = P.band; return b; }

  var BEATS = [
    { at: '8:55 AM',
      enter: function () {
        reset(D.before.pts, 360);
        var r = draw('<div class="l-root"></div>');
        mapDraw(r, { bands: B4.bands, lit: 3, maya: 2.42 });
      },
      play: async function (s) {
        await s.wait(800);
        showUnlock([P.dom, ALT.dom]);
        ZS.wire({ from: 2, text: 'Level 2 unlocked your next scenario' });
        await s.wait(1800);
        await s.press(q('.l-unlock .l-btnw'), 2200);
      }, hold: 250 },

    { at: '9:00 AM',
      enter: function () {
        reset(D.before.pts, 360);
        draw('<div class="l-root l-pickv"><h1 class="h">Pick one</h1><div class="l-picks">' + pickCard(P, 0) + pickCard(ALT, 1) + '</div></div>');
      },
      play: async function (s) {
        var cards = qa('.l-pick');
        await s.wait(1400);
        cards[1].classList.add('is-hov'); await s.wait(1100);
        cards[1].classList.remove('is-hov'); cards[0].classList.add('is-hov'); await s.wait(700);
        var go = q('.l-start', cards[0]);
        await s.press(go, 900);
        cards[0].classList.add('is-picked'); cards[1].classList.add('is-left');
        ZS.pill.credits(260, true);
        await ZS.fly(topEl('.zs-cr'), go, '<span class="l-flyc"><span class="coin"></span>100</span>', 850); s.alive();
        ZS.wire({ to: 2, text: 'Started Stripe, 100 credits' });
        await s.wait(1100);
      }, hold: 300 },

    { at: '9:05 AM',
      enter: function () { reset(D.before.pts, 260); draw(callHTML()); },
      play: async function (s) {
        ticker(s, q('.l-timer'), 12 * 60 + 4);
        await s.wait(700);
        q('.l-spk').classList.add('is-talk');
        await s.type(q('.l-cap-t'), 'We need to know which accounts are ready to buy this quarter.', 30);
        q('.l-spk').classList.remove('is-talk');
        await s.wait(500);
        var gs = qa('.l-goal');
        for (var i = 0; i < gs.length; i++) { gs[i].classList.add('l-in'); await s.wait(520); }
        await s.wait(700);
        await s.press(q('.l-go'), 1700);
      }, hold: 250 },

    { at: '9:30 AM',
      enter: function () { reset(D.before.pts, 260, true); ws(1, planWork(false), CHAT0); },
      play: async function (s) {
        var box = q('.l-sigs');
        await s.wait(600);
        for (var i = 0; i < SIGS.length; i++) {
          var row = add(box, sigRow(SIGS[i], false)); row.classList.add('rise');
          await s.type(q('.l-sig-n', row), SIGS[i][0], 32);
          q('.l-wbar i', row).style.width = SIGS[i][2] + '%';
          q('.l-wv', row).textContent = SIGS[i][2] + '%';
          await s.wait(380);
        }
        await s.wait(700);
        await send(s, RUSHED, 22);
        await reply(s, 'Thanks.', 1000);
        await s.wait(700);
        coachSay(ZS.COACH[0].low, false);
        ZS.wire({ to: 2, text: 'Message read: rushed' });
        await s.wait(3800);
        await send(s, CLEAR, 44);
        await reply(s, 'Perfect, that helps.', 1100);
        await s.wait(700);
        coachSay(ZS.COACH[0].high, true);
        ZS.wire({ to: 2, text: 'Message read: clear' });
        await s.wait(3600);
        ZS.coach.hide();
      }, hold: 700 },

    { at: '10:30 AM',
      enter: function () { reset(D.before.pts, 260, true); ws(1, popWork(), CHAT1); },
      play: async function (s) {
        var box = q('.l-qa');
        await s.wait(700);
        for (var i = 0; i < QS.length; i++) {
          var qn = add(box, voiceQ(QS[i], i)); qn.classList.add('rise');
          await s.wait(450);
          qn.classList.add('is-play');
          await s.wait(1500);
          qn.classList.remove('is-play'); qn.classList.add('is-heard');
          var an = add(box, voiceA(QS[i], i, false)); an.classList.add('rise');
          var dur = q('.l-dur', an), secs = parseInt(QS[i].al.split(':')[1], 10);
          for (var t = 1; t <= 4; t++) { await s.wait(420); dur.textContent = '0:' + ('0' + Math.round(secs * t / 4)).slice(-2); }
          q('.l-rec', an).classList.remove('is-on'); q('.l-rec', an).classList.add('is-done');
          await s.wait(300);
          fillChecks(QS[i].checks);
          await s.wait(650);
        }
        await s.wait(500);
        coachSay(ZS.COACH[4].high, true);
        await s.wait(2400);
        await stagePay(s, 1, 310, 'Plan done, +50 credits');
        await s.wait(2600);
        ZS.coach.hide();
      }, hold: 800 },

    { at: '1:10 PM',
      enter: function () { reset(D.before.pts, 310, true); ws(2, buildWork(), CHAT1); },
      play: async function (s) {
        var box = q('.l-rows');
        await s.wait(800);
        for (var i = 0; i < ACCTS.length; i++) { add(box, acctRow(ACCTS[i], 'l-new')); await s.wait(300); }
        await s.wait(900);
        await stagePay(s, 2, 360, 'Build done, +50 credits');
        await s.wait(1700);
        coachSay(ZS.COACH[2].high, true);
        ZS.wire({ to: 2, text: 'Quality read: tested before sending' });
        await s.wait(3400);
        ZS.coach.hide();
      }, hold: 700 },

    { at: '3:20 PM',
      enter: function () { reset(D.before.pts, 360, true); ws(3, reviewWork(), CHAT1); q('.l-rev').classList.add('l-wait'); },
      play: async function (s) {
        await s.wait(900);
        var rev = q('.l-rev'); rev.classList.remove('l-wait'); rev.classList.add('rise');
        await s.wait(600);
        q('.l-band').classList.add('on' + P.band);
        await s.wait(500);
        var rs = qa('.l-read');
        for (var i = 0; i < rs.length; i++) { q('.bands', rs[i]).classList.add('on' + P.reads[i]); rs[i].classList.add('l-in'); await s.wait(320); }
        await s.wait(400);
        q('.l-say').classList.add('l-in');
      }, hold: 3600 },

    { at: '3:40 PM',
      enter: function () {
        reset(D.before.pts, 360);
        draw(doneHTML());
      },
      play: async function (s) {
        await s.wait(1100);
        await ZS.fly(q('.l-done .sp'), topEl('.zs-lv'), '<span class="sp">+2,000</span>', 1000); s.alive();
        ZS.pill.set(D.after.pts, true);
        ZS.wire({ to: 2, text: '+2,000 skill points' });
        await s.wait(2000);
        await ZS.fly(q('.l-dt'), topEl('.zs-cr'), '<span class="l-flyc"><span class="coin"></span>+150</span>', 900); s.alive();
        ZS.pill.credits(510, true);
        ZS.wire({ to: 2, text: 'Scenario done, +150 credits' });
        await s.wait(2000);
        await ZS.fly(q('.l-added'), topEl('.tabs button[data-tab="jobs"]'), '<span class="l-flya">' + ZS.logo(P.dom, 18, 'round') + 'Intent signal scoring</span>', 1000); s.alive();
        ZS.wire({ to: 3, text: 'New proof in her portfolio' });
        await s.wait(1400);
        await s.press(q('.l-done .l-btnw'), 2200);
      }, hold: 250 },

    { at: '3:45 PM',
      enter: function () {
        reset(D.after.pts, 710);
        ZS.pill.credits(710, true);
        ZS.wire({ from: 2, text: 'Level 4, +200 credits' });
        var r = draw('<div class="l-root"></div>');
        mapDraw(r, { bands: bands9(), lit: -1, maya: 2.42 });
      },
      play: async function (s) {
        await s.wait(900);
        await walk(s, 2.42, 3.42, 1500); s.alive();
        MAP.st.lit = 4; mapLayout();
        await s.wait(500);
        showUnlock(['figma.com', 'attio.com']);
        await s.wait(1800);
        jobsDot(true);
        ZS.wire({ from: 2, text: 'Level 4 opened 35 roles' });
      }, hold: 6000 }
  ];

  /* test hook: L_DONE = the index of the last beat whose play finished */
  BEATS.forEach(function (b, i) {
    var p = b.play;
    b.play = function (s) { window.L_DONE = -1; return Promise.resolve(p ? p(s) : null).then(function () { window.L_DONE = i; }); };
  });

  ZS.loadWord().then(function () {
    document.body.classList.add('l-site');
    body = ZS.shell({ sys: 1, tab: 'learn', coach: true });
    ZS.run(BEATS);
  });
})();
