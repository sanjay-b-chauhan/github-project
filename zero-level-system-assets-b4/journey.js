/* ZERO levels · the learner in the middle. Left: the scenario she is on. Centre: her, her level ring, her motivation, her coach.
   Right: the jobs her level opens. Bottom: her run so far and how it felt.
   Every number comes from engine.js. This file only draws and plays it.
   Address bar: ?case=best|steady|slow|flat|worst  &coach=0  &k=<scenarios done>  &pre=1 (coach speaking)  &still=1 (no autoplay). */
(function () {
  'use strict';
  var Z = window.ZL, B = Z.BANDS, cfg = Z.clone(Z.DEFAULTS), Q = new URLSearchParams(location.search);
  var PAY_MAX = [0, 1500, 3000, 4000, 5000];
  var st = { key: 'flat', nat: [], weak: null, coachable: 2, coach: Q.get('coach') !== '0', k: 0, pre: false, now: -1, playing: false, speed: 1, timer: 0, still: Q.get('still') === '1' };
  var A = null, G = null, N = 10, twin = false, ui = { tiles: [], pay: [], gates: [], rules: [], cm: [], pips: [] };
  var IC = {
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.25" y="7" width="9.5" height="6.5" rx="1.75"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/></svg>',
    open: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.4 12.6 4.9"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.9v10.2a.6.6 0 0 0 .92.5l8-5.1a.6.6 0 0 0 0-1L5.42 2.4a.6.6 0 0 0-.92.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.6" y="2.6" width="3.2" height="10.8" rx=".9"/><rect x="9.2" y="2.6" width="3.2" height="10.8" rx=".9"/></svg>',
    again: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75"/><path d="M2.6 2.4v2.4H5"/></svg>'
  };

  function $(s) { return document.querySelector(s); }
  function fmt(v) { return Math.round(v).toLocaleString('en-US'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function logo(dom, name, size) { return '<span class="lg ' + size + '" title="' + name + '"><img src="https://www.google.com/s2/favicons?sz=64&domain=' + dom + '" alt="" onerror="this.parentNode.textContent=\'' + name.charAt(0) + '\'"></span>'; }
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
    N = Math.max(8, Math.min(20, Math.max(A.n, G.n)));
  }
  /* where the run stands after k scenarios */
  function at(k) {
    var r = k > 0 ? A.rows[k - 1] : null;
    return r ? { pts: r.pts, level: r.level, held: r.heldGate, heldBar: r.heldBar, passed: r.passed, mot: r.mot, row: r }
      : { pts: 0, level: 1, held: 0, heldBar: -1, passed: cfg.gates.map(function () { return false; }), mot: cfg.mot.start, row: null };
  }
  function passedAt(gi, upTo) { for (var i = 0; i < Math.min(upTo, A.n); i++) if (cfg.hold ? A.rows[i].passed[gi] : A.rows[i].level >= cfg.gates[gi]) return i + 1; return 0; }

  /* ---------- build once ---------- */
  function buildCases() {
    $('#cases').innerHTML = Z.LEARNERS.map(function (L) { return '<button class="case" data-case="' + L.key + '">' + L.name + '</button>'; }).join('') + '<button class="case" data-case="custom" hidden>Your run</button>';
  }
  function buildMe() {
    $('#coachMeters').innerHTML = Z.SKILLS.map(function (s) { return '<span class="cmi" title="' + s.asks + '">' + s.name + '<span class="cm">' + B.map(function () { return '<i></i>'; }).join('') + '</span></span>'; }).join('');
    ui.cm = [].map.call(document.querySelectorAll('#coachMeters .cmi'), function (e) { return { el: e, pips: e.querySelectorAll('i') }; });
    $('#motBar').innerHTML = new Array(11).join('<i></i>');
    $('#bm').innerHTML = B.map(function (b, j) { return '<button data-pip="' + j + '" title="' + b.name + '" aria-label="' + b.name + '"></button>'; }).join('');
    ui.pips = $('#bm').querySelectorAll('button');
    $('#coachSw').addEventListener('click', function () { st.coach = !st.coach; restart(); });
  }
  function buildTiles() {
    var box = $('#tiles'); box.innerHTML = ''; ui.tiles = [];
    Z.ROLE_TIERS.forEach(function (t) {
      var show = t.jobs.slice(0, 4), rest = t.n - show.length;
      var e = el('div', 'tile', '<span class="ic"></span><div><b></b><em></em></div><span class="stack">' + show.map(function (j) { return logo(j.dom, j.title + ', ' + j.co, 's'); }).join('') + (rest > 0 ? '<u>+' + rest + '</u>' : '') + '</span>');
      e.title = t.jobs.map(function (j) { return j.title + ', ' + j.co; }).join('\n');
      ui.tiles.push({ el: e, t: t, ic: e.querySelector('.ic'), name: e.querySelector('b'), em: e.querySelector('em'), open: false });
      box.appendChild(e);
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

  /* ---------- her level ring: ten pieces, one per level ---------- */
  function arc(r, a0, a1) {
    var p = function (a) { var t = (a - 90) * Math.PI / 180; return (150 + r * Math.cos(t)).toFixed(2) + ' ' + (150 + r * Math.sin(t)).toFixed(2); };
    return 'M' + p(a0) + ' A' + r + ' ' + r + ' 0 0 1 ' + p(a1);
  }
  function drawRing(s, was) {
    var M = cfg.maxLevel, span = 360 / M, gap = 5, R = 116, o = '';
    for (var i = 1; i <= M; i++) {
      var a0 = (i - 1) * span + gap / 2, a1 = i * span - gap / 2, frac = Math.max(0, Math.min(1, s.pts / cfg.perLevel - (i - 1)));
      var gi = cfg.gates.indexOf(i), gate = gi >= 0 || i === M, held = s.held === i, full = i <= s.level && (i > 1 || s.pts >= cfg.perLevel || s.level > 1);
      o += '<path class="seg" d="' + arc(R, a0, a1) + '"/>';
      if (full) o += '<path class="seg full' + (was != null && i > was ? ' flash' : '') + '" d="' + arc(R, a0, a1) + '"/>';
      else if (held) o += '<path class="seg held" d="' + arc(R, a0, a1) + '"/>';
      else if (frac > 0.02) o += '<path class="seg part" d="' + arc(R, a0, a0 + (a1 - a0) * frac) + '"/>';
      if (gate) {
        var am = ((i - 0.5) * span - 90) * Math.PI / 180, passed = s.level >= i, need = gi >= 0 ? cfg.bars[gi] : -1;
        o += '<text class="gl' + (passed ? ' ok' : held ? ' no' : '') + '" x="' + (150 + 143 * Math.cos(am)).toFixed(1) + '" y="' + (150 + 143 * Math.sin(am)).toFixed(1) + '">' + i + '</text>';
        if (!passed) o += '<circle class="gd" r="3.5" cx="' + (150 + 129.5 * Math.cos(am)).toFixed(1) + '" cy="' + (150 + 129.5 * Math.sin(am)).toFixed(1) + '" fill="' + (held ? 'var(--no)' : 'var(--tx-4)') + '"/>';
      }
    }
    $('#ring').innerHTML = o;
  }

  /* ---------- the scenario she is on ---------- */
  function drawScenario(s, anim) {
    var i = st.now >= 0 ? st.now : st.k > 0 ? st.k - 1 : 0, r = A.rows[i], sc = Z.SCENARIOS[i % Z.SCENARIOS.length], card = $('#inCard');
    var working = st.now === i, fresh = !working && st.k === 0, band = r ? r.band : st.nat[i];
    card.className = 'side in' + (working ? ' wait' : fresh ? ' next wait' : '') + (!working && !fresh && r && r.gain === 0 ? ' zero' : '') + (anim && !working ? ' pop' : '');
    card.setAttribute('data-i', i);
    $('#scNo').textContent = 'Scenario ' + (i + 1) + (fresh ? '' : ' of ' + A.n);
    if ($('#scLogo').getAttribute('data-i') !== String(i)) { $('#scLogo').innerHTML = logo(sc.dom, sc.co, 'l'); $('#scLogo').setAttribute('data-i', i); }
    $('#scTitle').textContent = sc.title; $('#scCo').textContent = sc.co;
    [].forEach.call(ui.pips, function (p, j) { p.className = !fresh && j <= band ? 'on' + band : ''; });
    $('#bm').className = 'bm' + (working ? ' fill' : '');
    $('#bandName').innerHTML = fresh ? '' : B[band].short + (r && r.lift > 0 ? '<i>coach</i>' : '');
    if (!r) return;
    var note = 'skill points', need = r.heldGate ? B[r.heldBar].short : '';
    if (r.level > r.levelBefore) note = r.opened.length ? 'Level ' + r.level + '. ' + r.opened.reduce(function (a, t) { return a + t.n; }, 0) + ' more jobs open.' : 'Level ' + r.level + '.';
    else if (r.heldGate) note = r.gain ? 'Level ' + r.level + ' is full. Level ' + r.heldGate + ' needs ' + need + '.' : 'Still needs ' + need + ' for Level ' + r.heldGate + '.';
    else if (r.gain === 0) note = cfg.pay[r.band] ? B[r.band].short + ' no longer counts at Level ' + r.level + '.' : 'Nothing counted.';
    $('#gain').textContent = '+' + fmt(r.gain); $('#gainNote').textContent = note;
  }

  /* ---------- her run so far, and how it felt ---------- */
  function drawTime() {
    var box = $('#tl'), W = box.clientWidth, pad = 84, step = Math.min(84, (W - pad - 20) / N), x0 = Math.max(pad, (W - step * N) / 2), x = function (i) { return x0 + step * i; };
    var cx = function (r) { return (x(r.i - 1) + x(r.i)) / 2; }, cur = st.now >= 0 ? st.now : st.k - 1, h = '';
    for (var i = 0; i < N; i++) {
      var r = A.rows[i], done = i < st.k;
      h += '<button class="dot' + (i >= A.n ? ' never' : done ? ' done ' + (r.gain === 0 ? 'zero' : 'd' + r.band) : '') + (i === cur ? ' cur' : '') + '" data-step="' + (i + 1) + '" style="left:' + x(i + 1).toFixed(1) + 'px" aria-label="Scenario ' + (i + 1) + '">' + (i + 1) + '</button>';
      if (done && r.opened.length) h += '<span class="flag" style="left:' + x(i + 1).toFixed(1) + 'px">Level ' + r.level + '</span>';
      if (r && r.coached && (r.i <= st.k || (st.pre && r.i === st.k + 1))) h += '<span class="flag c" style="left:' + cx(r).toFixed(1) + 'px;top:27px">Coach</span>';
    }
    if (A.quit && st.k >= A.n) h += '<span class="flag q" style="left:' + x(A.n).toFixed(1) + 'px">Drops off</span>';
    $('#dots').innerHTML = h;

    var H = 86, T = 14, Bm = 4, ym = function (m) { return T + (H - T - Bm) * (1 - m / 100); }, o = '';
    var str = function (a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
    var line = function (run, upTo, pre) {
      var pts = [[x(0), ym(cfg.mot.start)]], prev = cfg.mot.start;
      for (var q = 0; q < upTo; q++) { var rr = run.rows[q]; if (rr.coached) { pts.push([cx(rr), ym(prev)]); pts.push([cx(rr), ym(rr.motBefore)]); } pts.push([x(rr.i), ym(rr.mot)]); prev = rr.mot; }
      if (pre && run.rows[upTo] && run.rows[upTo].coached) { pts.push([cx(run.rows[upTo]), ym(prev)]); pts.push([cx(run.rows[upTo]), ym(run.rows[upTo].motBefore)]); }
      return pts;
    };
    o += '<defs><linearGradient id="mg" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="' + ym(100) + '" y2="' + ym(0) + '"><stop offset="0" stop-color="#46A056"/><stop offset=".55" stop-color="#EDBE52"/><stop offset="1" stop-color="#e2482b"/></linearGradient></defs>';
    o += '<line class="base" x1="' + x(0) + '" x2="' + x(N) + '" y1="' + ym(0) + '" y2="' + ym(0) + '"/><text class="gt" x="' + (x(0) - 12) + '" y="' + (ym(cfg.mot.start) + 4) + '" text-anchor="end">Motivation</text>';
    if (!twin) {
      /* the other version of her run grows with this one, so the ending is not given away */
      var gp = line(G, st.k >= A.n ? G.n : Math.min(st.k, G.n), false), ge = gp[gp.length - 1], right = ge[0] > W - 170;
      o += '<polyline class="ghost' + (st.coach ? '' : ' g') + '" points="' + str(gp) + '"/>';
      if (W > 620 && st.k >= A.n) o += '<text class="gt" x="' + (right ? ge[0] - 8 : ge[0] + 9) + '" y="' + (right ? ge[1] - 7 : ge[1] + 4) + '" text-anchor="' + (right ? 'end' : 'start') + '">' + (st.coach ? 'without the coach' : 'with the coach') + '</text>';
    }
    A.rows.forEach(function (r2) { if (r2.coached && (r2.i <= st.k || (st.pre && r2.i === st.k + 1))) o += '<line class="cline" x1="' + cx(r2) + '" x2="' + cx(r2) + '" y1="0" y2="' + H + '"/>'; });
    var pts = line(A, st.k, st.pre), last = pts[pts.length - 1];
    o += '<polygon class="marea" fill="url(#mg)" points="' + str(pts) + ' ' + last[0].toFixed(1) + ',' + ym(0) + ' ' + pts[0][0] + ',' + ym(0) + '"/><polyline class="mline" stroke="url(#mg)" points="' + str(pts) + '"/>';
    o += '<circle r="4" cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" fill="#fff" stroke="#5f616b" stroke-width="1.75"/>';
    $('#moSvg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#moSvg').innerHTML = o;
  }

  function coachSays(s) {
    var w = weakSkill(), wn = w ? w.name.toLowerCase() : 'the brief';
    if (st.pre) return s.held ? 'So close. One ' + B[s.heldBar].short + ' scenario opens Level ' + s.held + '.' : 'Two in a row with nothing to show. Let\'s fix your ' + wn + '.';
    if (!st.k) return 'Let\'s see how the first one goes.';
    if (A.top && st.k >= A.n) return 'Every job is open. Go get one.';
    if (A.quit && st.k >= A.n) return 'My nudges stopped landing.';
    var r = s.row;
    if (r.coached && r.level > r.levelBefore) return 'That\'s the jump. Hold that standard.';
    if (r.stalled) return (r.heldGate ? 'That one didn\'t open Level ' + r.heldGate + '.' : 'That one didn\'t count.') + ' Look at your ' + wn + '.';
    return 'You\'re good. Nothing I\'d change right now.';
  }

  var lastLevel = null;
  function render(anim) {
    var s = at(st.k), M = cfg.maxLevel, next = A.rows[st.k], w = weakSkill();

    drawRing(s, anim ? lastLevel : null); drawScenario(s, anim); drawTime();

    /* her */
    var lvEl = $('#lvNow'), txt = 'Level ' + s.level;
    if (anim && lvEl.textContent && lvEl.textContent !== txt) { lvEl.classList.remove('pop'); void lvEl.offsetWidth; lvEl.classList.add('pop'); }
    lvEl.textContent = txt; $('#ptNow').textContent = fmt(s.pts) + ' skill points';
    var mot = st.pre && next ? next.motBefore : s.mot, before = st.pre ? s.mot : st.k > 1 ? A.rows[st.k - 2].mot : cfg.mot.start;
    if (st.k && !st.pre && A.rows[st.k - 1].coached) before = A.rows[st.k - 1].motBefore;
    $('#motNow').innerHTML = Math.round(mot) + (st.k || st.pre ? (mot > before ? '<i class="up">&#9650;</i>' : mot < before ? '<i class="dn">&#9660;</i>' : '') : '');
    var lit = Math.round(mot / 10), col = mot >= 60 ? 'var(--b3)' : mot >= 30 ? 'var(--b2)' : 'var(--no)';
    [].forEach.call($('#motBar').children, function (b, i) { b.style.background = i < lit ? col : ''; });

    /* her coach */
    var card = $('#coach'), line = coachSays(s), cl = $('#coachLine'), blocked = st.pre || (s.row && s.row.stalled);
    card.className = 'coach' + (st.coach ? '' : ' off') + (st.pre ? ' alert' : '');
    $('#coachSw').setAttribute('aria-checked', st.coach ? 'true' : 'false');
    if (cl.textContent !== line) { cl.textContent = line; cl.classList.remove('in'); void cl.offsetWidth; cl.classList.add('in'); }
    ui.cm.forEach(function (c, j) {
      var from = Math.max(0, st.k - 2), sum = 0, n = 0;
      for (var q = from; q < st.k; q++) { sum += skillsFor(A.rows[q].band, q, A.rows[q].lifts)[j]; n++; }
      var b = n ? Z.bandFor(sum / n) : -1;
      [].forEach.call(c.pips, function (p, x) { p.style.background = x <= b ? 'var(--b' + b + ')' : ''; });
      c.el.className = 'cmi' + (blocked && w && Z.SKILLS[j].key === w.key ? ' weak' : '');
    });
    $('#coachTip').innerHTML = w ? '<b>Try this:</b> ' + w.tip : '';

    /* the jobs her level opens */
    var openN = 0;
    ui.tiles.forEach(function (t) {
      var lv = Z.tierLevel(t.t, cfg), open = s.level >= lv, gi = cfg.gates.indexOf(lv), held = s.held === lv, need = gi >= 0 ? cfg.bars[gi] : -1;
      if (open) openN += t.t.n;
      t.el.className = 'tile' + (open ? ' open' : '') + (held ? ' held' : '') + (anim && open && !t.open ? ' pop' : '');
      t.open = open;
      t.ic.innerHTML = open ? IC.open : IC.lock;
      t.name.textContent = 'Level ' + lv + ' · ' + t.t.n + ' jobs';
      var when = lv === M ? A.top : gi >= 0 ? passedAt(gi, st.k) : 0;
      t.em.textContent = open ? 'open since scenario ' + when : need >= 0 && cfg.hold ? 'needs ' + B[need].short : lv === M ? 'every job' : '';
    });
    $('#jobCount').innerHTML = '<b>' + openN + '</b> of ' + Z.rolesTotal() + ' open';

    /* the run in one line */
    var lc = function (t) { return t.replace(/^(Drops|Stuck)/, function (m) { return m.toLowerCase(); }); };
    $('#sum').innerHTML = twin ? '<b>' + outcome(A) + '</b>, with or without the coach' : (st.coach ? 'With the coach: ' : 'Without the coach: ') + '<b>' + lc(outcome(A)) + '</b> &nbsp;·&nbsp; ' + (st.coach ? 'without: ' : 'with the coach: ') + lc(outcome(G));

    /* top bar and rules */
    [].forEach.call(document.querySelectorAll('.case'), function (c) {
      var k = c.getAttribute('data-case');
      c.setAttribute('aria-pressed', k === st.key ? 'true' : 'false');
      if (k === 'custom') c.hidden = st.key !== 'custom';
    });
    $('#play').innerHTML = st.playing ? IC.pause : IC.play;
    $('#speed').textContent = st.speed + 'x';
    ui.pay.forEach(function (u) { u.inp.value = cfg.pay[u.i]; fillRange(u.inp); u.v.textContent = fmt(cfg.pay[u.i]); });
    ui.gates.concat(ui.rules).forEach(function (u) { u.draw(); });
    $('#hold').setAttribute('aria-checked', cfg.hold ? 'true' : 'false');
    lastLevel = s.level;
  }

  /* ---------- play ---------- */
  function wait(ms, fn) { st.timer = setTimeout(fn, ms / st.speed); }
  function stop() { clearTimeout(st.timer); st.playing = false; st.now = -1; }
  function fly(text) {
    var from = $('#gain'), to = $('.ringwrap');
    if (!from.animate || getComputedStyle(to).display === 'none' || window.innerWidth < 861) return;
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), chip = el('div', 'fly', text);
    document.body.appendChild(chip);
    var w = chip.offsetWidth, x1 = a.left, y1 = a.top + 6, x2 = b.left + b.width / 2 - w / 2, y2 = b.top + b.height / 2 - 13;
    var an = chip.animate([{ transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.9)', opacity: 0 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px)', opacity: 1, offset: .15 },
      { transform: 'translate(' + x2 + 'px,' + y2 + 'px)', opacity: 1, offset: .8 }, { transform: 'translate(' + x2 + 'px,' + y2 + 'px) scale(.6)', opacity: 0 }], { duration: 700 / st.speed, easing: 'cubic-bezier(.625,.05,0,1)' });
    an.onfinish = an.oncancel = function () { chip.remove(); };
    setTimeout(function () { chip.remove(); }, 1500);
  }
  function beat() {
    if (st.k >= A.n) { st.playing = false; st.pre = false; render(); return; }
    var row = A.rows[st.k], prev = st.k ? A.rows[st.k - 1] : null;
    if (row.coached && !st.pre) { st.pre = true; render(true); wait(3200, beat); return; }       /* the coach steps in before this one */
    var quick = prev && row.stalled && prev.stalled && !row.coached;                              /* flat scenarios in a row go by fast */
    st.now = st.k; render();
    wait(quick ? 380 : 760, function () {
      st.now = -1; st.pre = false; st.k++; render(true);
      if (row.gain > 0) fly('+' + fmt(row.gain));
      var big = row.opened.length || (row.heldGate && !(prev && prev.heldGate === row.heldGate));
      wait(quick ? 520 : big ? 1700 : 1050, beat);
    });
  }
  function play() { if (st.playing) return; if (st.k >= A.n) { st.k = 0; st.pre = false; } st.playing = true; render(); wait(st.k ? 200 : 1000, beat); }
  function restart() { stop(); sim(); st.k = 0; st.pre = false; lastLevel = null; render(); if (!st.still) play(); }
  function rules() { var was = st.k >= A.n; sim(); st.k = was ? A.n : Math.min(st.k, A.n); st.pre = false; render(); }
  function load(key, k, pre) {
    var L = learner(key) || learner('flat');
    stop(); st.key = L.key; st.nat = L.nat.slice(); st.weak = L.weak; st.coachable = L.coachable; st.k = 0; st.pre = false; lastLevel = null;
    sim();
    if (k != null) { st.k = Math.max(0, Math.min(A.n, k)); st.pre = !!pre && !!A.rows[st.k] && A.rows[st.k].coached; render(); return; }
    render(); if (!st.still) play();
  }

  /* ---------- wiring ---------- */
  buildCases(); buildMe(); buildTiles(); buildTune();
  $('#again').innerHTML = IC.again;
  function tuneToggle() { var p = $('#tunePanel'); p.hidden = !p.hidden; $('#tune').setAttribute('aria-expanded', p.hidden ? 'false' : 'true'); }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-case]'), sp = e.target.closest('[data-step]'), pip = e.target.closest('[data-pip]');
    if (c && c.getAttribute('data-case') !== 'custom') load(c.getAttribute('data-case'));
    else if (pip) {
      var i = +$('#inCard').getAttribute('data-i'), lifted = A.rows[i] ? A.rows[i].lift : 0;
      stop(); st.nat[i] = Math.max(0, Math.min(4, +pip.getAttribute('data-pip') - lifted)); st.key = 'custom'; st.coachable = 2;
      sim(); st.k = Math.min(A.n, i + 1); st.pre = false; lastLevel = null; render();
    } else if (sp) { stop(); st.k = Math.min(A.n, +sp.getAttribute('data-step')); st.pre = false; lastLevel = null; render(); }
    if (!e.target.closest('#tunePanel') && !e.target.closest('#tune') && !$('#tunePanel').hidden) tuneToggle();
  });
  $('#play').addEventListener('click', function () { if (st.playing) { stop(); render(); } else play(); });
  $('#again').addEventListener('click', function () { stop(); st.k = 0; st.pre = false; lastLevel = null; render(); play(); });
  $('#speed').addEventListener('click', function () { st.speed = st.speed === 1 ? 2 : st.speed === 2 ? 0.5 : 1; render(); });
  $('#tune').addEventListener('click', tuneToggle);
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); $('#play').click(); }
    else if (e.key === 'ArrowRight') { stop(); st.pre = false; st.k = Math.min(A.n, st.k + 1); lastLevel = null; render(); }
    else if (e.key === 'ArrowLeft') { stop(); st.pre = false; st.k = Math.max(0, st.k - 1); lastLevel = null; render(); }
  });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (A) drawTime(); }, 60); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (A) drawTime(); }).observe($('#tl'));
  load(Q.get('case') || 'flat', Q.get('k') != null ? +Q.get('k') : null, Q.get('pre') === '1');
  window.ZJ = { st: st, load: load, render: render, play: play, stop: stop, cfg: function () { return cfg; }, run: function () { return A; } };
})();
