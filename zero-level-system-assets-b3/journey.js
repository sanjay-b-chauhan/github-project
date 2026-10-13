/* ZERO levels · one learner's run, left to right. Top lane: her level climbing through the gates. Middle lane: her motivation.
   Bottom lane: each scenario and how it went. Left: the coach. Right: the job portal the gates open.
   Every number comes from engine.js. This file only draws and plays it.
   Address bar: ?case=best|steady|slow|flat|worst  &coach=0  &k=<scenarios done>  &pre=1 (coach speaking)  &still=1 (no autoplay). */
(function () {
  'use strict';
  var Z = window.ZL, B = Z.BANDS, cfg = Z.clone(Z.DEFAULTS), Q = new URLSearchParams(location.search);
  var PAY_MAX = [0, 1500, 3000, 4000, 5000], G0 = 76, PR = 26;
  var st = { key: 'flat', nat: [], weak: null, coachable: 2, coach: Q.get('coach') !== '0', k: 0, pre: false, now: -1, playing: false, speed: 1, timer: 0, still: Q.get('still') === '1' };
  var A = null, G = null, N = 10, twin = false, ui = { cells: [], groups: [], pay: [], gates: [], rules: [], crow: [] };
  var IC = {
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.25" y="7" width="9.5" height="6.5" rx="1.75"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/></svg>',
    open: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.4 12.6 4.9"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.9v10.2a.6.6 0 0 0 .92.5l8-5.1a.6.6 0 0 0 0-1L5.42 2.4a.6.6 0 0 0-.92.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.6" y="2.6" width="3.2" height="10.8" rx=".9"/><rect x="9.2" y="2.6" width="3.2" height="10.8" rx=".9"/></svg>',
    again: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75"/><path d="M2.6 2.4v2.4H5"/></svg>',
    quality: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
    communication: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.2 2.6h9.6a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 1-1.6 1.6H7.4l-3 2.4v-2.4H3.2a1.6 1.6 0 0 1-1.6-1.6V4.2a1.6 1.6 0 0 1 1.6-1.6z"/></svg>',
    independence: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l5 1.8v4.2c0 3.1-2.1 5.6-5 7-2.9-1.4-5-3.9-5-7V3.3z"/></svg>'
  };

  function $(s) { return document.querySelector(s); }
  function fmt(v) { return Math.round(v).toLocaleString('en-US'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function logo(dom, name) { return '<span class="lg" title="' + name + '"><img src="https://www.google.com/s2/favicons?sz=64&domain=' + dom + '" alt="" onerror="this.parentNode.textContent=\'' + name.charAt(0) + '\'"></span>'; }
  function learner(key) { return Z.LEARNERS.filter(function (L) { return L.key === key; })[0]; }
  function fillRange(inp) { inp.style.setProperty('--p', ((inp.value - inp.min) / ((inp.max - inp.min) || 1) * 100) + '%'); }
  function weakSkill() { return Z.SKILLS.filter(function (s) { return s.key === st.weak; })[0]; }
  function outcome(r) {
    return r.top ? 'Level ' + cfg.maxLevel + ' in ' + r.top + ' scenarios' : r.quit ? 'Drops off at Level ' + r.level + ' after ' + r.quit : (r.held ? 'Stuck at Level ' : 'Level ') + r.level + ' after ' + r.n;
  }
  /* a believable read of the three skills behind one scenario's band. One trails the rest until the coach's advice lands. */
  function skillsFor(band, i, lifts) {
    var o = Z.SKILLS.map(function (s, j) {
      var base = s.key === st.weak ? Math.min(0, -18 + 9 * lifts) : st.weak ? [5, 4, 6][j] : [2, -2, 1][j];
      return base + ((i * 7 + j * 13) % 5) - 2;
    });
    var m = o.reduce(function (a, v) { return a + v; }, 0) / o.length;
    var sd = Math.sqrt(o.reduce(function (a, v) { return a + (v - m) * (v - m); }, 0) / o.length);
    var base0 = [10, 30, 50, 70, 91][band] + cfg.lambda * sd - m;
    return o.map(function (v) { return Math.max(2, Math.min(99, Math.round(base0 + v))); });
  }
  function sim() {
    A = Z.simulate(st.nat, cfg, { coach: st.coach, coachable: st.coachable });
    G = Z.simulate(st.nat, cfg, { coach: !st.coach, coachable: st.coachable });
    twin = A.n === G.n && A.rows.every(function (r, i) { return r.pts === G.rows[i].pts && r.mot === G.rows[i].mot; });
    N = Math.max(10, Math.min(20, Math.max(A.n, G.n)));
  }
  /* where the run stands after k scenarios */
  function at(k) {
    var r = k > 0 ? A.rows[k - 1] : null;
    return r ? { pts: r.pts, level: r.level, held: r.heldGate, heldBar: r.heldBar, passed: r.passed, mot: r.mot, row: r }
      : { pts: 0, level: 1, held: 0, heldBar: -1, passed: cfg.gates.map(function () { return false; }), mot: cfg.mot.start, row: null };
  }
  function passedAt(gi, upTo) { for (var i = 0; i < Math.min(upTo, A.n); i++) if (cfg.hold ? A.rows[i].passed[gi] : A.rows[i].level >= cfg.gates[gi]) return i + 1; return 0; }
  function geo() { var W = $('#mid').clientWidth, step = (W - G0 - PR) / N; return { W: W, step: step, x: function (i) { return G0 + step * i; } }; }
  function plot(r) { return r.heldGate ? (r.heldGate - 0.17) * cfg.perLevel : r.pts; }
  function coachX(g, r) { return (g.x(r.i - 1) + g.x(r.i)) / 2; }

  /* ---------- build once ---------- */
  function buildCases() {
    $('#cases').innerHTML = Z.LEARNERS.map(function (L) { return '<button class="case" data-case="' + L.key + '"><b>' + L.name + '</b><span></span></button>'; }).join('') +
      '<button class="case" data-case="custom" hidden><b>Your run</b><span></span></button>';
  }
  function buildLegend() { $('#legend').innerHTML = B.map(function (b, i) { return '<div><i style="background:var(--b' + i + ')"></i><span>' + b.short + '</span><b></b></div>'; }).join(''); }
  function buildCoach() {
    var box = $('#coachRows'); box.innerHTML = ''; ui.crow = [];
    Z.SKILLS.forEach(function (s) {
      var r = el('div', 'crow', '<span class="ic">' + IC[s.key] + '</span><div><div class="top"><span>' + s.name + '</span><span class="cm">' + B.map(function () { return '<i></i>'; }).join('') + '</span></div><p></p></div>');
      ui.crow.push({ el: r, pips: r.querySelectorAll('.cm i'), p: r.querySelector('p'), s: s });
      box.appendChild(r);
    });
    $('#coachSw').addEventListener('click', function () { st.coach = !st.coach; restart(); });
    $('#motBar').innerHTML = new Array(11).join('<i></i>');
  }
  function buildGroups() {
    var box = $('#groups'); box.innerHTML = ''; ui.groups = [];
    Z.ROLE_TIERS.slice().reverse().forEach(function (t) {
      var show = t.jobs.slice(0, t.at === 3 ? 2 : 3), rest = t.jobs.slice(show.length);
      var g = el('div', 'grp', '<div class="gh"><i class="ic"></i><b></b><em></em><span>' + t.n + ' jobs</span></div>' +
        show.map(function (j) { return '<div class="jr">' + logo(j.dom, j.co) + '<div class="t"><b>' + j.title + '</b><span>' + j.co + (j.pay ? ' · ' + j.pay : '') + '</span></div><span class="a">' + IC.lock + '<u style="text-decoration:none"></u></span></div>'; }).join('') +
        (rest.length ? '<div class="mo2"><span class="ls">' + rest.map(function (j) { return logo(j.dom, j.co); }).join('') + '</span>' + rest.length + ' more</div>' : ''));
      ui.groups.push({ el: g, t: t, ic: g.querySelector('.ic'), name: g.querySelector('.gh b'), em: g.querySelector('.gh em'), head: g.querySelector('.gh'), acts: g.querySelectorAll('.a u') });
      box.appendChild(g);
    });
  }
  function stepper(label, get, set, lo, hi, show) {
    var r = el('div', 'gr', '<span>' + label + '</span><span class="stp"><button aria-label="Lower">&minus;</button><b></b><button aria-label="Higher">+</button></span>'), bt = r.querySelectorAll('button');
    bt[0].addEventListener('click', function () { set(get() - 1); rules(); });
    bt[1].addEventListener('click', function () { set(get() + 1); rules(); });
    return { el: r, draw: function () { r.querySelector('b').textContent = show(get()); bt[0].disabled = get() <= lo(); bt[1].disabled = get() >= hi(); } };
  }
  function buildTune() {
    var box = $('#payRows');
    B.forEach(function (b, i) {
      if (!i) return;
      var r = el('div', 'pr', '<span class="nm"><i style="background:var(--b' + i + ')"></i>' + b.short + '</span><input type="range" min="0" max="' + PAY_MAX[i] + '" step="' + (i === 1 ? 50 : 100) + '" aria-label="Skill points for ' + b.name + '"><span class="v"></span>');
      var inp = r.querySelector('input');
      inp.addEventListener('input', function () { cfg.pay[i] = +inp.value; rules(); });
      ui.pay.push({ i: i, inp: inp, v: r.querySelector('.v') });
      box.appendChild(r);
    });
    cfg.gates.forEach(function (_, i) {
      var s = stepper(Z.ROLE_TIERS[i].title, function () { return cfg.gates[i]; }, function (v) { cfg.gates[i] = v; },
        function () { return i === 0 ? 2 : cfg.gates[i - 1] + 1; }, function () { return i === cfg.gates.length - 1 ? cfg.maxLevel - 1 : cfg.gates[i + 1] - 1; }, function (v) { return 'Level ' + v; });
      ui.gates.push(s); $('#gateRows').appendChild(s.el);
    });
    var a = stepper('Steps in after', function () { return cfg.coachAfter; }, function (v) { cfg.coachAfter = v; }, function () { return 1; }, function () { return 4; }, function (v) { return v + ' flat'; });
    var b2 = stepper('Lifts the work by', function () { return cfg.coachLift; }, function (v) { cfg.coachLift = v; }, function () { return 0; }, function () { return 2; }, function (v) { return v + (v === 1 ? ' band' : ' bands'); });
    ui.rules = [a, b2]; $('#coachRules').appendChild(a.el); $('#coachRules').appendChild(b2.el);
    $('#hold').addEventListener('click', function () { cfg.hold = !cfg.hold; rules(); });
    $('#reset').addEventListener('click', function () { cfg = Z.clone(Z.DEFAULTS); rules(); });
  }
  /* the scenario lane: one column per scenario, rebuilt when the run or the width changes */
  function layout() {
    var g = geo(), box = $('#scCells'), h = '';
    for (var i = 0; i < N; i++) {
      var s = Z.SCENARIOS[i % Z.SCENARIOS.length];
      h += '<div class="sc1" data-i="' + i + '" style="left:' + g.x(i + 1).toFixed(1) + 'px">' + logo(s.dom, s.title + ', ' + s.co) + '<span class="vm">' +
        B.map(function (b, j) { return '<button data-pip="' + j + '" title="' + b.name + '" aria-label="Scenario ' + (i + 1) + ': ' + b.name + '"></button>'; }).join('') + '</span><span class="p"></span><span class="n">' + (i + 1) + '</span></div>';
    }
    box.innerHTML = h;
    ui.cells = [].map.call(box.children, function (c) { return { el: c, pips: c.querySelectorAll('.vm button'), p: c.querySelector('.p') }; });
  }

  /* ---------- draw the state after st.k scenarios ---------- */
  function drawLevel(g, s, anim) {
    var box = $('#laneLv'), W = g.W, H = box.clientHeight, T = 34, Bm = 20, top = Z.top(cfg), M = cfg.maxLevel, per = cfg.perLevel, x = g.x;
    var y = function (p) { return T + (H - T - Bm) * (1 - p / top); }, o = '';
    for (var lv = 1; lv <= M; lv++) {
      var gi = cfg.gates.indexOf(lv), gate = gi >= 0 || lv === M, yy = y(lv * per);
      if (!gate) { o += '<line class="grid" x1="' + G0 + '" x2="' + (W - PR) + '" y1="' + yy + '" y2="' + yy + '"/>'; continue; }
      var when = lv === M ? (A.top && A.top <= st.k ? A.top : 0) : passedAt(gi, st.k), held = s.held === lv;
      o += '<line class="gate' + (held ? ' no' : '') + '" x1="' + G0 + '" x2="' + W + '" y1="' + yy + '" y2="' + yy + '"/>';
      if (when) o += '<line class="gate ok" x1="' + x(when).toFixed(1) + '" x2="' + W + '" y1="' + yy + '" y2="' + yy + '"/>';
      o += '<text class="axg" x="' + (G0 - 14) + '" y="' + (yy + 1) + '" text-anchor="end">Level ' + lv + '</text><text class="axs" x="' + (G0 - 14) + '" y="' + (yy + 13) + '" text-anchor="end">' + fmt(lv * per) + '</text>';
    }
    o += '<line class="grid" x1="' + G0 + '" x2="' + (W - PR) + '" y1="' + y(0) + '" y2="' + y(0) + '"/><text class="ax" x="' + (G0 - 14) + '" y="' + (y(0) + 4) + '" text-anchor="end">Level 1</text>';

    /* the same learner the other way: without the coach, or with it */
    if (!twin) {
      var gp = [[x(0), y(0)]]; G.rows.forEach(function (r) { gp.push([x(r.i), y(plot(r))]); });
      var ge = gp[gp.length - 1], right = ge[0] > W - 150;
      o += '<polyline class="ghost' + (st.coach ? '' : ' g') + '" points="' + gp.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>';
      if (W > 560) o += '<text class="gt" x="' + (right ? ge[0] - 8 : ge[0] + 8) + '" y="' + (ge[1] + (G.top ? 16 : 15)) + '" text-anchor="' + (right ? 'end' : 'start') + '">' + (st.coach ? 'Without the coach: ' : 'With the coach: ') + (G.top ? 'Level ' + M + ' in ' + G.top : G.quit ? 'drops off' : 'Level ' + G.level) + '</text>';
    }

    /* where the coach stepped in */
    A.rows.forEach(function (r) {
      var speaking = st.pre && r.i === st.k + 1;
      if (!r.coached || !(r.i <= st.k || speaking)) return;
      var xc = coachX(g, r);
      o += '<line class="cline" x1="' + xc + '" x2="' + xc + '" y1="24" y2="' + H + '"/><g class="cbadge' + (speaking ? ' pulse' : '') + '"><rect x="' + (xc - 24) + '" y="5" width="48" height="19" rx="9.5"/><text x="' + xc + '" y="15">Coach</text></g>';
    });

    /* her path, one numbered stop per scenario */
    var pts = [[x(0), y(0)]];
    for (var i = 0; i < st.k; i++) pts.push([x(i + 1), y(plot(A.rows[i]))]);
    var str = function (a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
    if (pts.length > 1) {
      if (anim && pts.length > 2) o += '<polyline class="path" points="' + str(pts.slice(0, -1)) + '"/>';
      o += anim ? '<polyline class="path draw" pathLength="1" points="' + str(pts.slice(-2)) + '"/>' : '<polyline class="path" points="' + str(pts) + '"/>';
    }
    for (var j = 1; j < pts.length; j++) {
      var r2 = A.rows[j - 1];
      o += '<g' + (anim && j === pts.length - 1 ? ' class="pop"' : '') + ' data-step="' + j + '" style="cursor:pointer"><circle class="nd' + (r2.stalled ? ' z' : '') + '" r="9.5" cx="' + pts[j][0].toFixed(1) + '" cy="' + pts[j][1].toFixed(1) + '"' + (r2.stalled ? '' : ' style="stroke:var(--b' + r2.band + ')"') + '/><text class="nt" x="' + pts[j][0].toFixed(1) + '" y="' + (pts[j][1] + 0.5).toFixed(1) + '">' + j + '</text></g>';
    }
    if (A.quit && st.k >= A.n) { var e = pts[pts.length - 1], edge = e[0] > W - 60; o += '<text class="endt" x="' + (edge ? e[0] + 10 : e[0]) + '" y="' + (e[1] - 17) + '" text-anchor="' + (edge ? 'end' : 'middle') + '">Drops off</text>'; }
    $('#lvSvg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#lvSvg').innerHTML = o;
    return { y: y };
  }

  function motPoints(g, run, upTo, pre, ym) {
    var pts = [[g.x(0), ym(cfg.mot.start)]], prev = cfg.mot.start;
    for (var i = 0; i < upTo; i++) {
      var r = run.rows[i];
      if (r.coached) { var xc = coachX(g, r); pts.push([xc, ym(prev)]); pts.push([xc, ym(r.motBefore)]); }
      pts.push([g.x(r.i), ym(r.mot)]); prev = r.mot;
    }
    if (pre && run.rows[upTo] && run.rows[upTo].coached) { var x2 = coachX(g, run.rows[upTo]); pts.push([x2, ym(prev)]); pts.push([x2, ym(run.rows[upTo].motBefore)]); }
    return pts;
  }
  function drawMot(g, anim) {
    var box = $('#laneMo'), W = g.W, H = box.clientHeight, T = 30, Bm = 14, o = '';
    var ym = function (m) { return T + (H - T - Bm) * (1 - m / 100); }, str = function (a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
    o += '<defs><linearGradient id="mg" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="' + ym(100) + '" y2="' + ym(0) + '"><stop offset="0" stop-color="#46A056"/><stop offset=".55" stop-color="#EDBE52"/><stop offset="1" stop-color="#e2482b"/></linearGradient></defs>';
    o += '<line class="grid" x1="' + G0 + '" x2="' + (W - PR) + '" y1="' + ym(100) + '" y2="' + ym(100) + '"/><line class="grid" x1="' + G0 + '" x2="' + (W - PR) + '" y1="' + ym(50) + '" y2="' + ym(50) + '"/><line class="grid" x1="' + G0 + '" x2="' + (W - PR) + '" y1="' + ym(0) + '" y2="' + ym(0) + '"/>';
    o += '<text class="axs" x="' + (G0 - 14) + '" y="' + (ym(100) + 3) + '" text-anchor="end">High</text><text class="axs" x="' + (G0 - 14) + '" y="' + (ym(0) + 3) + '" text-anchor="end">Gone</text>';
    if (!twin) o += '<polyline class="ghost' + (st.coach ? '' : ' g') + '" points="' + str(motPoints(g, G, G.n, false, ym)) + '"/>';
    A.rows.forEach(function (r) {
      if (r.coached && (r.i <= st.k || (st.pre && r.i === st.k + 1))) { var xc = coachX(g, r); o += '<line class="cline" x1="' + xc + '" x2="' + xc + '" y1="0" y2="' + H + '"/>'; }
    });
    var pts = motPoints(g, A, st.k, st.pre, ym), last = pts[pts.length - 1];
    o += '<polygon class="marea" fill="url(#mg)" points="' + str(pts) + ' ' + last[0].toFixed(1) + ',' + ym(0) + ' ' + pts[0][0] + ',' + ym(0) + '"/>';
    o += '<polyline class="mline" stroke="url(#mg)" points="' + str(pts) + '"/>';
    for (var i = 0; i <= st.k; i++) { var m = i ? A.rows[i - 1].mot : cfg.mot.start; o += '<circle class="mdot' + (anim && i === st.k ? ' pop' : '') + '" r="3" cx="' + g.x(i).toFixed(1) + '" cy="' + ym(m).toFixed(1) + '"/>'; }
    $('#moSvg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#moSvg').innerHTML = o;
  }

  function coachSays(s) {
    var w = weakSkill(), wn = w ? w.name.toLowerCase() : 'the brief';
    if (!st.coach) return 'Coach is off.';
    if (st.pre) return s.held ? 'So close. One ' + B[s.heldBar].short + ' scenario opens Level ' + s.held + '.' : 'Two in a row with nothing to show. Let\'s fix your ' + wn + '.';
    if (!st.k) return 'Let\'s see how the first one goes.';
    if (A.top && st.k >= A.n) return 'Every job is open. Go get one.';
    if (A.quit && st.k >= A.n) return 'My nudges stopped landing.';
    var r = s.row;
    if (r.coached && r.level > r.levelBefore) return 'That\'s the jump. Hold that standard.';
    if (r.stalled) return (r.heldGate ? 'That one didn\'t open Level ' + r.heldGate + '.' : 'That one didn\'t count.') + ' Look at your ' + wn + '.';
    return 'You\'re good. Nothing I\'d change right now.';
  }

  function render(anim) {
    var s = at(st.k), M = cfg.maxLevel, g = geo(), next = A.rows[st.k], ended = st.k >= A.n;

    var lane = drawLevel(g, s, anim); drawMot(g, anim);

    /* scenarios */
    ui.cells.forEach(function (c, i) {
      var r = A.rows[i], band = r ? r.band : Math.min(4, st.nat[i]);
      c.el.className = 'sc1 ' + (i >= A.n ? 'never' : i < st.k ? 'done' : i === st.now ? 'now' : 'todo') + (r && i < st.k && r.gain === 0 ? ' zero' : '');
      [].forEach.call(c.pips, function (p, j) { p.className = (j <= band ? 'on' + band : '') + (r && j > r.natural && j <= band ? ' lift' : ''); });
      c.p.textContent = r ? '+' + (g.step < 46 && r.gain >= 1000 ? (r.gain / 1000) + 'k' : fmt(r.gain)) : '';
    });

    /* who she is and how she feels */
    var lvEl = $('#lvNow'), txt = 'Level ' + s.level;
    if (lvEl.textContent && lvEl.textContent !== txt) { lvEl.classList.remove('pop'); void lvEl.offsetWidth; lvEl.classList.add('pop'); }
    lvEl.textContent = txt; $('#ptNow').textContent = fmt(s.pts) + ' skill points';
    var mot = st.pre && next ? next.motBefore : s.mot, before = st.pre ? s.mot : st.k > 1 ? A.rows[st.k - 2].mot : cfg.mot.start;
    if (st.k && !st.pre && A.rows[st.k - 1].coached) before = A.rows[st.k - 1].motBefore;
    $('#motNow').innerHTML = (st.k || st.pre ? (mot > before ? '<i class="up">&#9650;</i>' : mot < before ? '<i class="dn">&#9660;</i>' : '') : '') + Math.round(mot);
    var lit = Math.round(mot / 10), col = mot >= 60 ? 'var(--b3)' : mot >= 30 ? 'var(--b2)' : 'var(--no)';
    [].forEach.call($('#motBar').children, function (b, i) { b.style.background = i < lit ? col : ''; });

    /* the coach */
    var card = $('#coach'), line = coachSays(s), w = weakSkill();
    card.className = 'coach' + (st.coach ? '' : ' off') + (st.pre ? ' alert' : '');
    $('#coachSw').setAttribute('aria-checked', st.coach ? 'true' : 'false');
    var cl = $('#coachLine'); if (cl.textContent !== line) { cl.textContent = line; cl.classList.remove('in'); void cl.offsetWidth; cl.classList.add('in'); }
    ui.crow.forEach(function (c, j) {
      var from = Math.max(0, st.k - 2), sum = 0, n = 0;
      for (var q = from; q < st.k; q++) { sum += skillsFor(A.rows[q].band, q, A.rows[q].lifts)[j]; n++; }
      var b = n ? Z.bandFor(sum / n) : -1, tip = st.coach && st.pre && w && c.s.key === w.key;
      [].forEach.call(c.pips, function (p, x) { p.style.background = x <= b ? 'var(--b' + b + ')' : ''; });
      c.el.className = 'crow' + (tip ? ' tip' : '');
      c.p.innerHTML = tip ? '<b>Try this:</b> ' + c.s.tip : b < 0 ? 'Can\'t tell yet.' : c.s.reads[b <= 1 ? 0 : b === 2 ? 1 : 2];
    });
    [].forEach.call(document.querySelectorAll('#legend b'), function (b, i) { b.textContent = fmt(cfg.pay[i]); });

    /* the same learner, with and without the coach */
    var withC = st.coach ? A : G, noC = st.coach ? G : A;
    $('#fx').innerHTML = [[withC, 'With the coach', st.coach], [noC, 'Without the coach', !st.coach]].map(function (v) {
      var r = v[0], bar = '';
      for (var q = 1; q <= M; q++) bar += '<i' + (q <= r.level ? ' class="f"' : '') + '></i>';
      return '<div class="fxr' + (v[2] ? ' on' : '') + '"><div><span>' + v[1] + '</span><b' + (r.quit ? ' class="q"' : '') + '>Level ' + r.level + ' · ' + (r.quit ? 'drops off' : Z.rolesOpen(r.level, cfg) + ' jobs') + '</b></div><p>' + bar + '</p></div>';
    }).join('');

    /* the job portal */
    var openN = 0;
    ui.groups.forEach(function (gr) {
      var lv = Z.tierLevel(gr.t, cfg), open = s.level >= lv, gi = cfg.gates.indexOf(lv), held = s.held === lv;
      if (open) openN += gr.t.n;
      gr.el.className = 'grp' + (open ? ' open' : '') + (held ? ' held' : '');
      gr.ic.innerHTML = open ? IC.open : IC.lock;
      gr.name.textContent = 'Level ' + lv;
      var when = lv === M ? A.top : gi >= 0 ? passedAt(gi, st.k) : 0, need = gi >= 0 ? cfg.bars[gi] : -1;
      gr.em.innerHTML = open ? 'scenario ' + when : need >= 0 && cfg.hold ? '<i style="background:var(--b' + need + ')"></i>needs ' + B[need].short : '';
      [].forEach.call(gr.acts, function (a) { a.textContent = open ? 'Apply' : ''; });
    });
    $('#jobCount').innerHTML = '<b>' + openN + '</b> of ' + Z.rolesTotal() + ' open';

    /* top bar and rules */
    [].forEach.call(document.querySelectorAll('.case'), function (c) {
      var k = c.getAttribute('data-case'), L = learner(k);
      c.setAttribute('aria-pressed', k === st.key ? 'true' : 'false');
      if (k === 'custom') c.hidden = st.key !== 'custom';
      c.querySelector('span').textContent = L ? outcome(Z.simulate(L.nat, cfg, { coach: st.coach, coachable: L.coachable })) : outcome(A);
    });
    $('#play').innerHTML = st.playing ? IC.pause : IC.play;
    $('#speed').textContent = st.speed + 'x';
    ui.pay.forEach(function (u) { u.inp.value = cfg.pay[u.i]; fillRange(u.inp); u.v.textContent = fmt(cfg.pay[u.i]); });
    ui.gates.concat(ui.rules).forEach(function (u) { u.draw(); });
    $('#hold').setAttribute('aria-checked', cfg.hold ? 'true' : 'false');
    wires(s, lane);
    return ended;
  }

  /* each gate's line runs on into the jobs it opens */
  function wires(s, lane) {
    var svg = $('#wires'), stage = $('#stage');
    if (getComputedStyle(svg).display === 'none') return;
    s = s || at(st.k);
    if (!lane) { var H = $('#laneLv').clientHeight, top = Z.top(cfg); lane = { y: function (p) { return 34 + (H - 34 - 20) * (1 - p / top); } }; }
    var o = stage.getBoundingClientRect(), m = $('#mid').getBoundingClientRect(), l = $('#laneLv').getBoundingClientRect(), h = '';
    ui.groups.forEach(function (gr) {
      var lv = Z.tierLevel(gr.t, cfg), b = gr.head.getBoundingClientRect();
      var x1 = m.right - o.left, y1 = l.top - o.top + lane.y(lv * cfg.perLevel), x2 = b.left - o.left + 10, y2 = b.top + b.height / 2 - o.top, mx = (x1 + x2) / 2;
      h += '<path class="' + (s.level >= lv ? 'on' : s.held === lv ? 'no' : '') + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + y1.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
    });
    svg.innerHTML = h;
  }

  /* ---------- play ---------- */
  function wait(ms, fn) { st.timer = setTimeout(fn, ms / st.speed); }
  function stop() { clearTimeout(st.timer); st.playing = false; st.now = -1; }
  function beat() {
    if (st.k >= A.n) { st.playing = false; st.pre = false; render(); return; }
    var row = A.rows[st.k], prev = st.k ? A.rows[st.k - 1] : null;
    if (row.coached && !st.pre) { st.pre = true; render(true); wait(3000, beat); return; }       /* the coach steps in before this one */
    var quick = prev && row.stalled && prev.stalled && !row.coached;                              /* flat scenarios in a row go by fast */
    st.now = st.k; render();
    wait(quick ? 300 : 600, function () {
      st.now = -1; st.pre = false; st.k++; render(true);
      var big = row.opened.length || (row.heldGate && !(prev && prev.heldGate === row.heldGate));
      wait(quick ? 380 : big ? 1500 : 820, beat);
    });
  }
  function play() { if (st.playing) return; if (st.k >= A.n) { st.k = 0; st.pre = false; } st.playing = true; render(); wait(st.k ? 200 : 900, beat); }
  function restart() { stop(); sim(); layout(); st.k = 0; st.pre = false; render(); if (!st.still) play(); }
  function rules() { var was = st.k >= A.n; sim(); layout(); st.k = was ? A.n : Math.min(st.k, A.n); st.pre = false; render(); }
  function load(key, k, pre) {
    var L = learner(key) || learner('flat');
    stop(); st.key = L.key; st.nat = L.nat.slice(); st.weak = L.weak; st.coachable = L.coachable; st.k = 0; st.pre = false;
    sim(); layout();
    if (k != null) { st.k = Math.max(0, Math.min(A.n, k)); st.pre = !!pre && !!A.rows[st.k] && A.rows[st.k].coached; render(); return; }
    render(); if (!st.still) play();
  }

  /* ---------- wiring ---------- */
  buildCases(); buildLegend(); buildCoach(); buildGroups(); buildTune();
  $('#again').innerHTML = IC.again;
  function tuneToggle() { var p = $('#tunePanel'); p.hidden = !p.hidden; $('#tune').setAttribute('aria-expanded', p.hidden ? 'false' : 'true'); }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-case]'), sp = e.target.closest('[data-step]'), pip = e.target.closest('[data-pip]');
    if (c && c.getAttribute('data-case') !== 'custom') load(c.getAttribute('data-case'));
    else if (pip) {
      var i = +pip.parentNode.parentNode.getAttribute('data-i'), lifted = A.rows[i] ? A.rows[i].lift : 0;
      stop(); st.nat[i] = Math.max(0, Math.min(4, +pip.getAttribute('data-pip') - lifted)); st.key = 'custom'; st.coachable = 2;
      sim(); layout(); st.k = A.n; st.pre = false; render();
    } else if (sp) { stop(); st.k = Math.min(A.n, +sp.getAttribute('data-step')); st.pre = false; render(); }
    if (!e.target.closest('#tunePanel') && !e.target.closest('#tune') && !e.target.closest('#legend') && !$('#tunePanel').hidden) tuneToggle();
  });
  $('#play').addEventListener('click', function () { if (st.playing) { stop(); render(); } else play(); });
  $('#again').addEventListener('click', function () { stop(); st.k = 0; st.pre = false; render(); play(); });
  $('#speed').addEventListener('click', function () { st.speed = st.speed === 1 ? 2 : st.speed === 2 ? 0.5 : 1; render(); });
  $('#tune').addEventListener('click', tuneToggle);
  $('#legend').addEventListener('click', function (e) { e.stopPropagation(); tuneToggle(); });
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); $('#play').click(); }
    else if (e.key === 'ArrowRight') { stop(); st.pre = false; st.k = Math.min(A.n, st.k + 1); render(); }
    else if (e.key === 'ArrowLeft') { stop(); st.pre = false; st.k = Math.max(0, st.k - 1); render(); }
  });
  var rz; function resized() { clearTimeout(rz); rz = setTimeout(function () { if (!A) return; var now = st.now; layout(); st.now = now; render(); }, 60); }
  window.addEventListener('resize', resized);
  if (window.ResizeObserver) { var ro = new ResizeObserver(resized); ro.observe($('#mid')); ro.observe($('#groups')); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (A) wires(); });
  load(Q.get('case') || 'flat', Q.get('k') != null ? +Q.get('k') : null, Q.get('pre') === '1');
  window.ZJ = { st: st, load: load, render: render, play: play, stop: stop, cfg: function () { return cfg; }, run: function () { return A; } };
})();
