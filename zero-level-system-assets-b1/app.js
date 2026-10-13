/* ZERO levels · the page. Every number shown here is worked out by engine.js from the dials. */
(function () {
  'use strict';
  var Z = window.ZL, B = Z.BANDS, cfg = Z.clone(Z.DEFAULTS);
  var MAX_ROWS = 24, PAY_MAX = [0, 1500, 3000, 4000, 5000], PAY_STEP = [50, 50, 100, 100, 100];
  var st = { learner: 'steady', seq: [], weak: null, skills: [78, 74, 42, 70] };
  var ui = { pay: [], gates: [], rows: [], sk: [] };

  function $(s) { return document.querySelector(s); }
  function fmt(v) { return Math.round(v).toLocaleString('en-US'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fill(inp) { inp.style.setProperty('--p', ((inp.value - inp.min) / ((inp.max - inp.min) || 1) * 100) + '%'); }
  function dot(b) { return '<i class="dot d' + b + '"></i>'; }
  function orBetter(b) { return b >= B.length - 1 ? B[b].short : B[b].short + ' or better'; }
  function learner(key) { for (var i = 0; i < Z.LEARNERS.length; i++) if (Z.LEARNERS[i].key === key) return Z.LEARNERS[i]; return null; }
  function same(a, b) { return a.length === b.length && a.every(function (v, i) { return v === b[i]; }); }
  function outcome(r) {
    for (var i = 0; i < r.rows.length; i++) if (r.rows[i].level >= cfg.maxLevel) return { top: true, at: i + 1, text: 'Level ' + cfg.maxLevel + ' in ' + (i + 1) };
    return { top: false, at: r.rows.length, text: (r.held ? 'Stuck at Level ' : 'Level ') + r.level };
  }

  /* ---------- 1 · pay and gates ---------- */
  function buildPay() {
    var box = $('#pay');
    box.appendChild(el('div', 'r h', '<div>Band</div><div>Skill points for one scenario</div><div></div><div class="c">At this band only</div>'));
    B.forEach(function (b, i) {
      var r = el('div', 'r' + (i === 0 ? ' off' : ''));
      r.innerHTML = '<div class="n">' + dot(i) + '<span>' + b.name + '</span></div>' +
        '<input type="range" min="0" max="' + (PAY_MAX[i] || 1000) + '" step="' + PAY_STEP[i] + '" aria-label="Skill points for ' + b.name + '">' +
        '<div class="v"></div><div class="c"></div>';
      var inp = r.querySelector('input');
      inp.addEventListener('input', function () { cfg.pay[i] = +inp.value; refresh(); });
      ui.pay.push({ inp: inp, v: r.querySelector('.v'), c: r.querySelector('.c') });
      box.appendChild(r);
    });
  }
  function drawPay() {
    ui.pay.forEach(function (u, i) {
      u.inp.value = cfg.pay[i]; fill(u.inp);
      u.v.textContent = fmt(cfg.pay[i]);
      var s = Z.steady(i, cfg);
      u.c.textContent = cfg.pay[i] === 0 ? 'Stays at Level 1' : s.reachesTop ? 'Level ' + cfg.maxLevel + ' in ' + s.scenarios : 'Stuck at Level ' + s.level;
    });
  }

  function buildGates() {
    var box = $('#gates');
    box.innerHTML = '<h3>Where the bar rises</h3><p>A gate takes two things: the points, and one scenario at its bar.</p>';
    cfg.gates.forEach(function (_, i) {
      var t = Z.ROLE_TIERS[i];
      var g = el('div', 'gate', '<div class="w"><b>' + t.title + ' open</b><span>' + dot(cfg.bars[i]) + 'Bar: ' + orBetter(cfg.bars[i]) + '</span></div>' +
        '<div class="step"><button aria-label="Lower">&minus;</button><b></b><button aria-label="Higher">+</button></div>');
      var btn = g.querySelectorAll('button');
      btn[0].addEventListener('click', function () { cfg.gates[i]--; refresh(); });
      btn[1].addEventListener('click', function () { cfg.gates[i]++; refresh(); });
      ui.gates.push({ lab: g.querySelector('.step b'), dn: btn[0], up: btn[1] });
      box.appendChild(g);
    });
    box.appendChild(el('div', 'gate', '<div class="w"><b>Every role open</b><span>The top. Nothing to level after it.</span></div><div class="step"><b style="padding:0 6px">Level ' + cfg.maxLevel + '</b></div>'));
    var sw = el('div', 'sw', '<div><b>Gates hold weaker work</b><span>Switch it off and repeating scenarios is enough.</span></div><button class="tog" role="switch" aria-label="Gates hold weaker work"></button>');
    ui.tog = sw.querySelector('.tog');
    ui.tog.addEventListener('click', function () { cfg.hold = !cfg.hold; refresh(); });
    box.appendChild(sw);
  }
  function drawGates() {
    ui.gates.forEach(function (u, i) {
      u.lab.textContent = 'Level ' + cfg.gates[i];
      var lo = i === 0 ? 2 : cfg.gates[i - 1] + 1, hi = i === cfg.gates.length - 1 ? cfg.maxLevel - 1 : cfg.gates[i + 1] - 1;
      u.dn.disabled = cfg.gates[i] <= lo; u.up.disabled = cfg.gates[i] >= hi;
    });
    ui.tog.setAttribute('aria-checked', cfg.hold ? 'true' : 'false');
  }

  function drawRuler() {
    var g = cfg.gates, M = cfg.maxLevel, zones;
    if (cfg.hold) zones = [[g[0], 1, 'Any finished work', 'Any work'], [g[1] - g[0], cfg.bars[0], orBetter(cfg.bars[0]), B[cfg.bars[0]].short + ' +'], [g[2] - g[1], cfg.bars[1], orBetter(cfg.bars[1]), B[cfg.bars[1]].short + ' +'], [M - g[2], cfg.bars[2], orBetter(cfg.bars[2]), '']];
    else zones = [[M, 0, 'Any finished work counts all the way up', 'Any finished work counts']];
    var h = '<div class="bar">' + zones.map(function (z) { return z[0] > 0 ? '<div class="z z' + z[1] + '" style="width:' + (z[0] / M * 100) + '%" title="' + z[2] + '"><span class="wide">' + z[2] + '</span><span class="narrow">' + z[3] + '</span></div>' : ''; }).join('') + '</div><div class="ticks">';
    for (var lv = 1; lv <= M; lv++) {
      var gi = g.indexOf(lv), isTop = lv === M, tier = isTop ? Z.ROLE_TIERS[g.length] : gi >= 0 ? Z.ROLE_TIERS[gi] : null;
      h += '<div class="tk' + (lv === 1 ? ' first' : '') + (isTop ? ' last' : '') + (tier ? ' g' : '') + '" style="left:' + (lv === 1 ? 0 : lv / M * 100) + '%">' +
        (lv === 1 ? 'Level 1' : lv) + (tier ? '<small>' + tier.title + '</small>' : '') + '</div>';
    }
    $('#ruler').innerHTML = h + '</div>';
  }

  /* ---------- 2 · five learners ---------- */
  function drawFive() {
    var custom = st.learner === 'custom';
    var box = $('#plot'), W = Math.max(280, Math.round(box.clientWidth - 16)), small = W < 560;
    var H = small ? 300 : 384, L = small ? 64 : 78, R = small ? 12 : 20, T = 30, Bm = 44, top = Z.top(cfg);
    var N = Math.max(16, custom ? st.seq.length : 0);
    var x = function (i) { return L + (W - L - R) * i / N; }, y = function (p) { return T + (H - T - Bm) * (1 - p / top); };
    var s = '';
    for (var lv = 1; lv <= cfg.maxLevel; lv++) {
      var gi = cfg.gates.indexOf(lv), gate = gi >= 0 || lv === cfg.maxLevel, yy = lv === 1 ? y(0) : y(lv * cfg.perLevel);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + (gate ? 'rgba(13,13,13,.34)' : 'rgba(13,13,13,.07)') + '"' + (gate ? ' stroke-dasharray="2 4"' : '') + '/>';
      if (gate || lv === 1) {
        s += '<text class="' + (gate ? 'axg' : 'ax') + '" x="' + (L - 12) + '" y="' + (yy + 4 - (gi >= 0 && cfg.hold ? 6 : 0)) + '" text-anchor="end">Level ' + lv + '</text>';
        if (gi >= 0 && cfg.hold) s += '<text class="ax" x="' + (L - 12) + '" y="' + (yy + 11) + '" text-anchor="end">' + B[cfg.bars[gi]].short + '</text>';
      }
    }
    for (var i = 0; i <= N; i += 4) s += '<text class="ax" x="' + x(i) + '" y="' + (H - Bm + 18) + '" text-anchor="middle">' + i + '</text>';
    s += '<text class="ax" x="' + ((L + W - R) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Scenarios finished</text>';

    var lines = Z.LEARNERS.map(function (Lr) { return { key: Lr.key, name: Lr.name, run: Z.run(Lr.seq, cfg) }; });
    if (custom) lines.push({ key: 'custom', name: 'Your learner', run: Z.run(st.seq, cfg) });
    lines.forEach(function (ln) {
      var o = outcome(ln.run), pts = [[0, 0]];
      /* a learner held at a gate is drawn just under its line: the points are there, the level is not */
      ln.run.rows.some(function (r) { pts.push([r.i, r.heldGate ? (r.heldGate - 0.14) * cfg.perLevel : r.pts]); return r.level >= cfg.maxLevel; });
      ln.o = o; ln.pts = pts; ln.on = ln.key === st.learner;
    });
    lines.sort(function (a, b) { return (a.on ? 1 : 0) - (b.on ? 1 : 0); });
    var labels = {};
    lines.forEach(function (ln) {
      var d = ln.pts.map(function (p, k) { return (k ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1); }).join(' ');
      var e = ln.pts[ln.pts.length - 1];
      s += '<path class="ln' + (ln.on ? ' on' : '') + '" d="' + d + '"/>';
      if (ln.on) ln.pts.slice(1, -1).forEach(function (p) { s += '<circle class="pt" r="2.5" cx="' + x(p[0]).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '"/>'; });
      s += '<circle class="end' + (ln.on ? ' on' : '') + '" r="4" cx="' + x(e[0]).toFixed(1) + '" cy="' + y(e[1]).toFixed(1) + '"/>';
      if (ln.key !== 'custom') s += '<path d="' + d + '" fill="none" stroke="transparent" stroke-width="14" style="cursor:pointer" data-k="' + ln.key + '"/>';
      var id = e[0] + ':' + Math.round(e[1] / 400);
      (labels[id] = labels[id] || { e: e, names: [], on: false, top: ln.o.top }).names.push(ln.name);
      if (ln.on) labels[id].on = true;
    });
    Object.keys(labels).forEach(function (id) {
      var lb = labels[id], ex = x(lb.e[0]), ey = y(lb.e[1]), right = lb.e[0] > N - (small ? 7 : 3);
      if (small && !lb.on) return;
      s += '<text class="' + (lb.on ? 'axg' : 'ax') + '" x="' + (right ? ex + 4 : ex) + '" y="' + (lb.top ? ey - 11 : ey + 17) + '" text-anchor="' + (right ? 'end' : 'middle') + '">' + lb.names.join(', ') + '</text>';
    });
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Skill points after each scenario for five kinds of learner">' + s + '</svg>';

    $('#learners').innerHTML = Z.LEARNERS.map(function (Lr) {
      var o = outcome(Z.run(Lr.seq, cfg));
      return '<button class="lrn" data-k="' + Lr.key + '" aria-pressed="' + (Lr.key === st.learner) + '"><b>' + Lr.name + '<em>' + o.text + '</em></b><span>' + Lr.line + '</span></button>';
    }).join('');
  }

  /* ---------- 3 · the simulator ---------- */
  function buildChips() {
    $('#chips').innerHTML = Z.LEARNERS.map(function (Lr) { return '<button class="chip" data-k="' + Lr.key + '">' + Lr.name + '</button>'; }).join('');
  }
  function pick(key) {
    var Lr = learner(key); if (!Lr) return;
    st.learner = key; st.seq = Lr.seq.slice(); st.weak = Lr.weak;
    buildRows(-1); refresh();
  }
  function buildRows(fresh) {
    var box = $('#rows'); box.innerHTML = ''; ui.rows = [];
    st.seq.forEach(function (band, i) {
      var r = el('div', 'srow' + (i === fresh ? ' new' : ''), '<span class="i">' + (i + 1) + '</span><input type="range" min="0" max="4" step="1" aria-label="How scenario ' + (i + 1) + ' went"><span class="bn"></span><span class="out"></span>');
      var inp = r.querySelector('input'); inp.value = band;
      inp.addEventListener('input', function () {
        st.seq[i] = +inp.value;
        var m = Z.LEARNERS.filter(function (Lr) { return same(Lr.seq, st.seq); })[0];
        st.learner = m ? m.key : 'custom';
        refresh();
      });
      ui.rows.push({ inp: inp, bn: r.querySelector('.bn'), out: r.querySelector('.out') });
      box.appendChild(r);
    });
  }
  function drawSim() {
    var r = Z.run(st.seq, cfg);
    r.rows.forEach(function (row, i) {
      var u = ui.rows[i]; if (!u) return;
      fill(u.inp);
      u.bn.innerHTML = dot(row.band) + B[row.band].short;
      var tag;
      if (row.status === 'held') tag = '<span class="tag held">Held at <i>the </i>Level ' + row.heldGate + '<i> gate</i></span>';
      else if (row.status === 'under') tag = '<span class="tag held">Under the bar</span>';
      else if (row.status === 'up') tag = '<span class="tag up">Level ' + row.level + (row.opened.length ? '<i> · ' + row.opened[row.opened.length - 1].title.toLowerCase() + ' open</i>' : '') + '</span>';
      else tag = '<span class="tag">Level ' + row.level + '</span>';
      u.out.innerHTML = tag + '<b>+' + fmt(row.gain) + '</b>';
    });
    [].forEach.call(document.querySelectorAll('#chips .chip'), function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-k') === st.learner ? 'true' : 'false'); });
    $('#count').textContent = st.seq.length + (st.seq.length === 1 ? ' scenario' : ' scenarios');
    $('#add').disabled = st.seq.length >= MAX_ROWS; $('#del').disabled = !st.seq.length;
    drawRes(r);
  }

  function buildRes() {
    var cx = 38, cy = 38, rad = 31, gap = 7, seg = 360 / cfg.maxLevel, arcs = '';
    for (var i = 0; i < cfg.maxLevel; i++) {
      var a0 = (-90 + i * seg + gap / 2) * Math.PI / 180, a1 = (-90 + (i + 1) * seg - gap / 2) * Math.PI / 180;
      arcs += '<path d="M' + (cx + rad * Math.cos(a0)).toFixed(2) + ' ' + (cy + rad * Math.sin(a0)).toFixed(2) + ' A' + rad + ' ' + rad + ' 0 0 1 ' + (cx + rad * Math.cos(a1)).toFixed(2) + ' ' + (cy + rad * Math.sin(a1)).toFixed(2) + '"/>';
    }
    $('#res').innerHTML = '<div class="hd"><svg class="ring" viewBox="0 0 76 76" aria-hidden="true">' + arcs + '<text x="38" y="39"></text></svg><div><b id="rLevel"></b><span id="rSub"></span></div></div>' +
      '<div class="track"><div class="t"><div class="f" id="rFill"></div><span id="rGates"></span></div><div class="lb" id="rLab"></div></div>' +
      '<div class="coach" id="rCoach"></div>' +
      '<div class="stats"><div><b id="s1"></b><span>Finished</span></div><div><b id="s2"></b><span>Moved the level</span></div><div><b id="s3"></b><span>Paid nothing</span></div></div>';
    ui.arcs = $('#res').querySelectorAll('.ring path'); ui.num = $('#res').querySelector('.ring text');
  }
  function drawRes(r) {
    [].forEach.call(ui.arcs, function (p, i) { p.setAttribute('class', i < r.level ? 'on' : ''); });
    ui.num.textContent = r.level;
    $('#rLevel').textContent = 'Level ' + r.level;
    $('#rSub').textContent = fmt(r.pts) + ' skill points · ' + r.roles + ' of ' + Z.rolesTotal() + ' roles open';
    $('#rFill').style.width = (r.pts / Z.top(cfg) * 100) + '%';
    var lockAt = r.held ? cfg.gates.indexOf(r.held) : -1;
    $('#rGates').innerHTML = cfg.gates.map(function (g, i) { return '<i class="g' + (i === lockAt ? ' lock' : '') + '" style="left:' + (g / cfg.maxLevel * 100) + '%"></i>'; }).join('');
    $('#rLab').innerHTML = '<span style="left:0">Level 1</span>' + cfg.gates.map(function (g, i) { return '<span class="' + (i === lockAt ? 'lock' : '') + '" style="left:' + (g / cfg.maxLevel * 100) + '%">' + g + '</span>'; }).join('') + '<span style="left:100%">' + cfg.maxLevel + '</span>';
    var c = Z.coach(r, cfg, st.weak), box = $('#rCoach');
    box.className = 'coach c-' + c.state;
    box.innerHTML = '<small>The coach says</small><b>' + c.head + '</b><p>' + c.body + '</p>';
    $('#s1').textContent = r.rows.length;
    $('#s2').textContent = r.rows.filter(function (x) { return x.level > x.levelBefore; }).length;
    $('#s3').textContent = r.rows.filter(function (x) { return x.gain === 0; }).length;
  }

  /* ---------- 4 · one scenario ---------- */
  function buildSkills() {
    var box = $('#sk');
    Z.SKILLS.forEach(function (s, i) {
      var r = el('div', 'r', '<div class="nm"><b>' + s.name + '</b><span>' + s.asks + '</span></div><input type="range" min="0" max="100" step="1" aria-label="' + s.name + ' score"><div class="v"></div><div class="bd"></div>');
      var inp = r.querySelector('input'); inp.value = st.skills[i];
      inp.addEventListener('input', function () { st.skills[i] = +inp.value; drawScore(); });
      ui.sk.push({ inp: inp, v: r.querySelector('.v'), bd: r.querySelector('.bd') });
      box.appendChild(r);
    });
    var h = '<table><thead><tr><th></th>' + B.map(function (b, i) { return '<th><span>' + dot(i) + b.name + '</span></th>'; }).join('') + '</tr></thead><tbody>';
    Z.SKILLS.forEach(function (s) {
      h += '<tr><th>' + s.name + '<small>' + s.reads + '</small></th>' + Z.RUBRIC[s.key].map(function (t) { return '<td>' + t + '</td>'; }).join('') + '</tr>';
    });
    $('#rub').innerHTML = h + '</tbody></table>';
  }
  function drawScore() {
    var s = Z.score(st.skills, cfg), weak = Z.SKILLS[s.weakest].name;
    ui.sk.forEach(function (u, i) {
      var b = Z.bandFor(st.skills[i]);
      fill(u.inp); u.v.textContent = st.skills[i]; u.bd.innerHTML = dot(b) + B[b].short;
    });
    [].forEach.call(document.querySelectorAll('#rub tbody tr'), function (tr, i) {
      var b = Z.bandFor(st.skills[i]);
      [].forEach.call(tr.querySelectorAll('td'), function (td, k) { td.className = k === b ? 'on' : ''; });
    });
    var say;
    if (s.ifFixed.band > s.band) say = '<b>' + weak + ' is the gap.</b><p>At ' + s.ifFixed.to + ' this is ' + B[s.ifFixed.band].name + ': ' + fmt(cfg.pay[s.ifFixed.band]) + ' skill points, not ' + fmt(cfg.pay[s.band]) + '.</p>';
    else if (s.penalty >= 2) say = '<b>' + weak + ' is the lowest.</b><p>Bringing it level lifts the score to ' + Math.round(s.ifFixed.score) + '. Still ' + B[s.band].name + '.</p>';
    else say = '<b>No weak spot.</b><p>The next band takes all four up together.</p>';
    $('#sum').innerHTML = '<div class="big"><b>' + Math.round(s.score) + '</b><span>' + dot(s.band) + B[s.band].name + '</span></div>' +
      '<dl><div><dt>Average of the four</dt><dd>' + Math.round(s.mean) + '</dd></div>' +
      '<div><dt>Taken off for an uneven profile</dt><dd>' + (Math.round(s.penalty) ? '&minus;' + Math.round(s.penalty) : '0') + '</dd></div>' +
      '<div><dt>This scenario pays</dt><dd>' + fmt(cfg.pay[s.band]) + ' skill points</dd></div></dl>' +
      '<div class="coach' + (s.ifFixed.band > s.band ? ' c-held' : '') + '"><small>The coach says</small>' + say + '</div>';
  }

  /* ---------- 5 · roles ---------- */
  function drawRoles() {
    var sum = 0;
    $('#rolesList').innerHTML = Z.ROLE_TIERS.map(function (t, i) {
      var lv = Z.tierLevel(t, cfg), bar = i < cfg.bars.length ? cfg.bars[i] : cfg.bars[cfg.bars.length - 1];
      sum += t.n;
      return '<div class="role"><div class="lv">Level ' + lv + '</div><div class="w"><b>' + t.title + '</b><span>' + t.what + '</span></div>' +
        '<div class="bar">' + (cfg.hold ? dot(bar) + orBetter(bar) : 'Any finished work') + '</div>' +
        '<div class="cnt"><b>' + sum + '</b> roles open</div>' +
        '<div class="logos">' + t.cos.map(function (c) { return '<i><img src="zero-level-system-assets-b1/logo/' + c + '.svg" alt="' + c + '"></i>'; }).join('') + '</div></div>';
    }).join('');
  }

  /* JSON with one line per band and per gate, so the whole config reads at a glance */
  function pretty(o) {
    var keys = Object.keys(o);
    return '{\n' + keys.map(function (k) {
      var v = o[k], out;
      if (Array.isArray(v) && v.length && typeof v[0] === 'object') out = '[\n' + v.map(function (x) { return '    ' + JSON.stringify(x).replace(/":/g, '": ').replace(/,"/g, ', "'); }).join(',\n') + '\n  ]';
      else if (Array.isArray(v) && typeof v[0] === 'string') out = '[\n' + v.map(function (x) { return '    ' + JSON.stringify(x); }).join(',\n') + '\n  ]';
      else if (v && typeof v === 'object' && !Array.isArray(v)) out = '{\n' + Object.keys(v).map(function (x) { return '    "' + x + '": ' + JSON.stringify(v[x]); }).join(',\n') + '\n  }';
      else out = JSON.stringify(v).replace(/,/g, ', ');
      return '  "' + k + '": ' + out;
    }).join(',\n') + '\n}';
  }

  function drawMeta() {
    $('#chPay').textContent = 'Up to ' + fmt(Math.max.apply(null, cfg.pay)) + ' a scenario.';
    $('#chRoles').textContent = 'Open at Levels ' + cfg.gates.join(', ') + ' and ' + cfg.maxLevel + '.';
    $('#cfg').textContent = pretty(Z.config(cfg));
  }

  function refresh() { drawPay(); drawGates(); drawRuler(); drawFive(); drawSim(); drawScore(); drawRoles(); drawMeta(); }

  /* ---------- wiring ---------- */
  buildPay(); buildGates(); buildChips(); buildRes(); buildSkills();
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-k]') : null;
    if (t) { pick(t.getAttribute('data-k')); return; }
  });
  $('#add').addEventListener('click', function () {
    if (st.seq.length >= MAX_ROWS) return;
    st.seq.push(st.seq.length ? st.seq[st.seq.length - 1] : 2); st.learner = 'custom';
    buildRows(st.seq.length - 1); refresh();
  });
  $('#del').addEventListener('click', function () {
    if (!st.seq.length) return;
    st.seq.pop();
    var m = Z.LEARNERS.filter(function (Lr) { return same(Lr.seq, st.seq); })[0];
    st.learner = m ? m.key : 'custom';
    buildRows(-1); refresh();
  });
  $('#reset').addEventListener('click', function () { cfg = Z.clone(Z.DEFAULTS); refresh(); });
  $('#copy').addEventListener('click', function () {
    var b = $('#copy'), txt = $('#cfg').textContent, done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () {});
  });
  pick('steady');
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(drawFive, 120); });
  window.ZLpage = { cfg: function () { return cfg; }, st: st, pick: pick, refresh: refresh };
})();
