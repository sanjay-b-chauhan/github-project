/* ZERO levels · one learner's run, played. Scenarios on the left pay into the ladder; the ladder opens the job portal on the right.
   Everything on screen is worked out by engine.js. This file only draws and plays it.
   Address bar: ?case=best|steady|slow|flat|worst  &k=<scenarios done>  &still=1 (no autoplay). */
(function () {
  'use strict';
  var Z = window.ZL, B = Z.BANDS, cfg = Z.clone(Z.DEFAULTS);
  var Q = new URLSearchParams(location.search);
  var MAXN = Z.SCENARIOS.length, PAY_MAX = [0, 1500, 3000, 4000, 5000];
  var st = { key: 'steady', seq: [], weak: null, k: 0, playing: false, speed: 1, timer: 0, still: Q.get('still') === '1' };
  var R = null, ui = { rows: [], cells: [], groups: [], pay: [], gates: [] };
  var IC = {
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.25" y="7" width="9.5" height="6.5" rx="1.75"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/></svg>',
    open: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.4 12.6 4.9"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.9v10.2a.6.6 0 0 0 .92.5l8-5.1a.6.6 0 0 0 0-1L5.42 2.4a.6.6 0 0 0-.92.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.6" y="2.6" width="3.2" height="10.8" rx=".9"/><rect x="9.2" y="2.6" width="3.2" height="10.8" rx=".9"/></svg>',
    again: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75"/><path d="M2.6 2.4v2.4H5"/></svg>'
  };

  function $(s) { return document.querySelector(s); }
  function fmt(v) { return Math.round(v).toLocaleString('en-US'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function logo(dom, name) { return '<span class="lg" title="' + name + '"><img src="https://www.google.com/s2/favicons?sz=64&domain=' + dom + '" alt="" onerror="this.parentNode.textContent=\'' + name.charAt(0) + '\'"></span>'; }
  function same(a, b) { return a.length === b.length && a.every(function (v, i) { return v === b[i]; }); }
  function learner(key) { return Z.LEARNERS.filter(function (L) { return L.key === key; })[0]; }
  function fillRange(inp) { inp.style.setProperty('--p', ((inp.value - inp.min) / ((inp.max - inp.min) || 1) * 100) + '%'); }
  /* a believable read of the four skills behind one scenario's band. One skill trails the rest; the score they make lands in that band. */
  function skillsFor(band, weakKey, i) {
    var offs = Z.SKILLS.map(function (s, j) { return s.key === weakKey ? -16 : weakKey ? [5, 3, 6, 4][j] : [2, -2, 1, -1][j]; });
    var wob = Z.SKILLS.map(function (_, j) { return ((i * 7 + j * 13) % 5) - 2; });
    var o = offs.map(function (v, j) { return v + wob[j]; }), m = o.reduce(function (a, v) { return a + v; }, 0) / o.length;
    var sd = Math.sqrt(o.reduce(function (a, v) { return a + (v - m) * (v - m); }, 0) / o.length);
    var baseScore = [10, 30, 50, 70, 91][band] + cfg.lambda * sd - m;
    return o.map(function (v) { return Math.max(2, Math.min(99, Math.round(baseScore + v))); });
  }
  /* where the run stands after k scenarios */
  function at(k) {
    var r = k > 0 ? R.rows[k - 1] : null;
    return r ? { pts: r.pts, level: r.level, held: r.heldGate, passed: r.passed, row: r } : { pts: 0, level: 1, held: 0, passed: cfg.gates.map(function () { return false; }), row: null };
  }
  function topAt() { for (var i = 0; i < R.rows.length; i++) if (R.rows[i].level >= cfg.maxLevel) return i + 1; return 0; }
  function passedAt(gi) { for (var i = 0; i < R.rows.length; i++) if (R.rows[i].passed[gi] || !cfg.hold && R.rows[i].level >= cfg.gates[gi]) return i + 1; return 0; }
  function summary(seq) {
    var r = Z.run(seq, cfg), t = 0;
    for (var i = 0; i < r.rows.length && !t; i++) if (r.rows[i].level >= cfg.maxLevel) t = i + 1;
    return t ? 'Level ' + cfg.maxLevel + ' in ' + t + ' scenarios' : (r.held ? 'Stuck at Level ' : 'Level ') + r.level + ' after ' + seq.length;
  }

  /* ---------- build once ---------- */
  function buildCases() {
    var h = Z.LEARNERS.map(function (L) { return '<button class="case" data-case="' + L.key + '"><b>' + L.name + '</b><span></span></button>'; }).join('');
    $('#cases').innerHTML = h + '<button class="case" data-case="custom" hidden><b>Your run</b><span></span></button>';
  }
  function buildLegend() {
    $('#legend').innerHTML = B.map(function (b, i) { return '<div><i style="background:var(--b' + i + ')"></i><span>' + b.short + '</span><b></b></div>'; }).join('');
  }
  function buildSkills() {
    $('#skills').innerHTML = Z.SKILLS.map(function (s) { return '<div class="skl" title="' + s.asks + '"><span>' + s.name + '</span><span class="meter">' + B.map(function () { return '<i class="pip"></i>'; }).join('') + '</span></div>'; }).join('');
  }
  function buildLadder() {
    var box = $('#cells'); box.innerHTML = ''; ui.cells = [];
    for (var lv = 1; lv <= cfg.maxLevel; lv++) {
      var c = el('div', 'cell', '<div class="f"></div><span class="num">' + lv + '</span>');
      ui.cells.push({ el: c, f: c.firstChild, chip: null });
      box.appendChild(c);
    }
  }
  function buildGroups() {
    var box = $('#groups'); box.innerHTML = ''; ui.groups = [];
    Z.ROLE_TIERS.slice().reverse().forEach(function (t) {
      var show = t.jobs.slice(0, t.at === 3 ? 2 : 3), rest = t.jobs.slice(show.length);
      var g = el('div', 'grp', '<div class="gh"><i class="ic"></i><b></b><span>' + t.n + ' jobs</span></div>' +
        show.map(function (j) {
          return '<div class="jr">' + logo(j.dom, j.co) + '<div class="t"><b>' + j.title + '</b><span>' + j.co + (j.pay ? ' · ' + j.pay : '') + '</span></div><span class="a">' + IC.lock + '<em style="font-style:normal"></em></span></div>';
        }).join('') +
        (rest.length ? '<div class="mo"><span class="ls">' + rest.map(function (j) { return logo(j.dom, j.co); }).join('') + '</span>' + rest.length + ' more</div>' : ''));
      ui.groups.push({ el: g, t: t, ic: g.querySelector('.ic'), name: g.querySelector('.gh b'), acts: g.querySelectorAll('.a em') });
      box.appendChild(g);
    });
  }
  function buildTune() {
    var box = $('#payRows');
    B.forEach(function (b, i) {
      if (!i) return;
      var r = el('div', 'pr', '<span class="nm"><i style="background:var(--b' + i + ')"></i>' + b.short + '</span><input type="range" min="0" max="' + PAY_MAX[i] + '" step="' + (i === 1 ? 50 : 100) + '" aria-label="Skill points for ' + b.name + '"><span class="v"></span>');
      var inp = r.querySelector('input');
      inp.addEventListener('input', function () { cfg.pay[i] = +inp.value; recalc(); });
      ui.pay.push({ i: i, inp: inp, v: r.querySelector('.v') });
      box.appendChild(r);
    });
    var gb = $('#gateRows');
    cfg.gates.forEach(function (_, i) {
      var r = el('div', 'gr', '<span>' + Z.ROLE_TIERS[i].title + '</span><span class="stp"><button aria-label="Lower">&minus;</button><b></b><button aria-label="Higher">+</button></span>');
      var bt = r.querySelectorAll('button');
      bt[0].addEventListener('click', function () { cfg.gates[i]--; rebuildGates(); });
      bt[1].addEventListener('click', function () { cfg.gates[i]++; rebuildGates(); });
      ui.gates.push({ lab: r.querySelector('b'), dn: bt[0], up: bt[1] });
      gb.appendChild(r);
    });
    $('#hold').addEventListener('click', function () { cfg.hold = !cfg.hold; recalc(); });
    $('#reset').addEventListener('click', function () { cfg = Z.clone(Z.DEFAULTS); rebuildGates(); });
  }
  function buildRows() {
    var box = $('#rows'); box.innerHTML = ''; ui.rows = [];
    st.seq.forEach(function (_, i) {
      var s = Z.SCENARIOS[i % MAXN];
      var r = el('div', 'row', '<span class="n">' + (i + 1) + '</span>' + logo(s.dom, s.co) + '<span class="t">' + s.title + ' <em>' + s.co + '</em></span><span class="meter">' +
        B.map(function (b, j) { return '<button class="pip" data-pip="' + j + '" title="' + b.name + '" aria-label="' + b.name + '"></button>'; }).join('') + '</span><span class="p"></span>');
      r.addEventListener('click', function (e) {
        var pip = e.target.closest('.pip');
        if (pip) { st.seq[i] = +pip.getAttribute('data-pip'); edited(); return; }
        stop(); st.k = i + 1; render();
      });
      ui.rows.push({ el: r, pips: r.querySelectorAll('.pip'), p: r.querySelector('.p') });
      box.appendChild(r);
    });
  }

  /* ---------- draw the state after st.k scenarios ---------- */
  function render() {
    var s = at(st.k), M = cfg.maxLevel, done = topAt();

    /* scenarios */
    ui.rows.forEach(function (u, i) {
      var row = R.rows[i], over = done && i >= done;
      u.el.className = 'row ' + (i < st.k ? 'done' : 'todo') + (i < st.k && row.gain === 0 && !over ? ' zero' : '') + (u.el.classList.contains('now') && i === st.k ? ' now' : '');
      [].forEach.call(u.pips, function (p, j) { p.className = 'pip' + (j <= row.band ? ' on' + row.band : ''); });
      u.p.textContent = over && i >= st.k ? '' : '+' + fmt(row.gain);
    });
    $('#scCount').textContent = st.seq.length;
    $('#less').disabled = st.seq.length <= 1; $('#more').disabled = st.seq.length >= MAXN;
    [].forEach.call(document.querySelectorAll('#legend b'), function (b, i) { b.textContent = fmt(cfg.pay[i]); });

    /* the ladder */
    ui.cells.forEach(function (c, i) {
      var lv = i + 1, frac = Math.max(0, Math.min(1, s.pts / cfg.perLevel - i));
      var gi = cfg.gates.indexOf(lv), isGate = gi >= 0 || lv === M;
      var held = s.held === lv, passed = gi >= 0 ? (cfg.hold ? s.passed[gi] : s.level >= lv) : s.level >= lv;
      c.f.style.height = (frac * 100) + '%';
      c.el.className = 'cell' + (frac >= 0.55 ? ' full' : '') + (isGate ? ' gate' : '') + (isGate && held ? ' held' : '') + (isGate && passed ? ' passed' : '');
      if (isGate) {
        if (!c.chip) { c.chip = el('span', 'chip'); c.el.appendChild(c.chip); }
        var when = lv === M ? done : passedAt(gi);
        var need = gi >= 0 ? cfg.bars[gi] : cfg.bars[cfg.bars.length - 1];
        c.chip.innerHTML = passed ? IC.open + 'Scenario ' + when : IC.lock + (lv === M ? 'Every job' : cfg.hold ? '<i style="background:var(--b' + need + ')"></i>' + B[need].short : 'Level ' + lv);
      } else if (c.chip) { c.chip.remove(); c.chip = null; }
    });
    var lvEl = $('#lvNow'), txt = 'Level ' + s.level;
    if (lvEl.textContent && lvEl.textContent !== txt) { lvEl.classList.remove('pop'); void lvEl.offsetWidth; lvEl.classList.add('pop'); }
    lvEl.textContent = txt;
    $('#ptNow').textContent = fmt(s.pts) + ' skill points';

    /* a numbered mark where each scenario left the learner. Scenarios that paid nothing pile up at the same height. */
    var box = $('#steps'), seen = {}, h = '';
    for (var i2 = 0; i2 < st.k; i2++) {
      var r = R.rows[i2], key = r.pts, n = seen[key] = (seen[key] || 0) + 1, col = (n - 1) % 5, line = Math.floor((n - 1) / 5);
      if (done && i2 >= done) break;
      h += '<span class="st s' + r.band + (r.gain === 0 ? ' z' : '') + '" data-step="' + (i2 + 1) + '" style="right:calc(50% + var(--ladw) / 2 + ' + (10 + col * 21) + 'px);bottom:calc(var(--cell) * ' + (r.pts / cfg.perLevel) + ' + ' + (line * 21 - 9) + 'px)' + (i2 === st.k - 1 ? '' : ';animation:none') + '">' + (i2 + 1) + '</span>';
    }
    box.innerHTML = h;

    /* the one line the coach gives, only when something is in the way */
    var say = '', weak = Z.SKILLS.filter(function (k) { return k.key === st.weak; })[0];
    if (s.level >= M) say = '<div class="ok"><b>Every job is open</b><span>after ' + done + ' scenarios</span></div>';
    else if (s.held) say = '<div class="no"><b>Needs one ' + B[cfg.bars[cfg.gates.indexOf(s.held)]].short + ' scenario</b>' + (weak ? '<span>Weak spot: ' + weak.name + '</span>' : '') + '</div>';
    else if (s.row && s.row.status === 'under') say = '<div class="no"><b>' + B[s.row.band].short + ' no longer counts at Level ' + s.level + '</b></div>';
    if ($('#say').getAttribute('data-say') !== say) { $('#say').innerHTML = say; $('#say').setAttribute('data-say', say); }

    /* her four skills, read from the last three scenarios */
    var from = Math.max(0, st.k - 3), blocked = s.held || (s.row && s.row.status === 'under' && s.level < M);
    [].forEach.call(document.querySelectorAll('#skills .skl'), function (elx, j) {
      var sum = 0, n = 0;
      for (var q = from; q < st.k; q++) { sum += skillsFor(R.rows[q].band, st.weak, q)[j]; n++; }
      var b = n ? Z.bandFor(sum / n) : -1;
      elx.className = 'skl' + (blocked && Z.SKILLS[j].key === st.weak ? ' weak' : '');
      [].forEach.call(elx.querySelectorAll('.pip'), function (p, x) { p.className = 'pip' + (x <= b ? ' on' + b : ''); });
    });

    /* the job portal */
    var openN = 0;
    ui.groups.forEach(function (g) {
      var lv = Z.tierLevel(g.t, cfg), open = s.level >= lv;
      if (open) openN += g.t.n;
      g.el.className = 'grp' + (open ? ' open' : '');
      g.ic.innerHTML = open ? IC.open : IC.lock;
      g.name.textContent = 'Level ' + lv;
      [].forEach.call(g.acts, function (a) { a.textContent = open ? 'Apply' : ''; });
    });
    $('#jobCount').innerHTML = '<b>' + openN + '</b> of ' + Z.rolesTotal() + ' open';

    /* top bar */
    [].forEach.call(document.querySelectorAll('.case'), function (c) {
      var k = c.getAttribute('data-case'), L = learner(k);
      c.setAttribute('aria-pressed', k === st.key ? 'true' : 'false');
      if (k === 'custom') c.hidden = st.key !== 'custom';
      c.querySelector('span').textContent = summary(L ? L.seq : st.seq);
    });
    $('#play').innerHTML = st.playing ? IC.pause : IC.play;
    $('#speed').textContent = st.speed + 'x';
    ui.pay.forEach(function (u) { u.inp.value = cfg.pay[u.i]; fillRange(u.inp); u.v.textContent = fmt(cfg.pay[u.i]); });
    ui.gates.forEach(function (u, i) {
      u.lab.textContent = 'Level ' + cfg.gates[i];
      var lo = i === 0 ? 2 : cfg.gates[i - 1] + 1, hi = i === cfg.gates.length - 1 ? M - 1 : cfg.gates[i + 1] - 1;
      u.dn.disabled = cfg.gates[i] <= lo; u.up.disabled = cfg.gates[i] >= hi;
    });
    $('#hold').setAttribute('aria-checked', cfg.hold ? 'true' : 'false');
    wires(s);
  }

  /* lines from each gate to the jobs it opens */
  function wires(s) {
    var svg = $('#wires'), stage = $('#stage');
    if (getComputedStyle(svg).display === 'none') return;
    var o = stage.getBoundingClientRect(), h = '';
    s = s || at(st.k);
    ui.groups.forEach(function (g) {
      var lv = Z.tierLevel(g.t, cfg), c = ui.cells[lv - 1];
      if (!c || !c.chip) return;
      var a = c.chip.getBoundingClientRect(), b = g.el.querySelector('.gh').getBoundingClientRect();
      var x1 = a.right - o.left + 4, y1 = a.top + a.height / 2 - o.top, x2 = b.left - o.left - 6, y2 = b.top + b.height / 2 - o.top, mx = (x1 + x2) / 2;
      h += '<path class="' + (s.level >= lv ? 'on' : s.held === lv ? 'no' : '') + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + y1.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
    });
    svg.innerHTML = h;
  }

  /* ---------- play ---------- */
  function wait(ms, fn) { st.timer = setTimeout(fn, ms / st.speed); }
  function stop() { clearTimeout(st.timer); st.playing = false; ui.rows.forEach(function (u) { u.el.classList.remove('now'); }); }
  function fly(fromEl, pts, text) {
    var lad = $('#cells');
    if (getComputedStyle($('#wires')).display === 'none' || !fromEl.animate) return;
    var a = fromEl.getBoundingClientRect(), b = lad.getBoundingClientRect(), chip = el('div', 'fly', text);
    document.body.appendChild(chip);
    var w = chip.offsetWidth, x1 = a.right - w, y1 = a.top + a.height / 2 - 12, x2 = b.left + b.width / 2 - w / 2, y2 = b.bottom - Math.min(1, pts / Z.top(cfg)) * b.height - 12;
    var an = chip.animate([{ transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.9)', opacity: 0 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(1)', opacity: 1, offset: .15 },
      { transform: 'translate(' + x2 + 'px,' + y2 + 'px) scale(1)', opacity: 1, offset: .85 }, { transform: 'translate(' + x2 + 'px,' + y2 + 'px) scale(.7)', opacity: 0 }],
      { duration: 620 / st.speed, easing: 'cubic-bezier(.625,.05,0,1)' });
    an.onfinish = an.oncancel = function () { chip.remove(); };
    setTimeout(function () { chip.remove(); }, 1400);
  }
  function beat() {
    var i = st.k, done = topAt();
    if (i >= st.seq.length || (done && i >= done)) { st.playing = false; render(); return; }
    var u = ui.rows[i], row = R.rows[i], prev = i ? R.rows[i - 1] : null;
    var quick = prev && row.gain === 0 && prev.gain === 0;      /* a run of scenarios that pay nothing goes by fast */
    u.el.classList.remove('todo'); u.el.classList.add('now');
    u.el.scrollIntoView({ block: 'nearest' });
    wait(quick ? 260 : 620, function () {
      if (row.gain > 0) fly(u.p, row.pts, '+' + fmt(row.gain));
      wait(quick ? 120 : row.gain > 0 ? 520 : 200, function () {
        u.el.classList.remove('now');
        st.k = i + 1; render();
        var big = row.opened.length || (row.heldGate && !(prev && prev.heldGate === row.heldGate));
        wait(quick ? 260 : big ? 1500 : 760, beat);
      });
    });
  }
  function play() { if (st.playing) return; var done = topAt(); if (st.k >= st.seq.length || (done && st.k >= done)) st.k = 0; st.playing = true; render(); wait(st.k ? 200 : 900, beat); }
  function recalc() { R = Z.run(st.seq, cfg); render(); }
  function rebuildGates() { R = Z.run(st.seq, cfg); render(); }
  function edited() {
    stop();
    var m = Z.LEARNERS.filter(function (L) { return same(L.seq, st.seq); })[0];
    st.key = m ? m.key : 'custom'; if (m) st.weak = m.weak;
    R = Z.run(st.seq, cfg); st.k = topAt() || st.seq.length; render();
  }
  function load(key, k) {
    var L = learner(key) || learner('steady');
    stop(); st.key = L.key; st.seq = L.seq.slice(); st.weak = L.weak; st.k = 0;
    R = Z.run(st.seq, cfg); buildRows();
    if (k != null) { st.k = Math.max(0, Math.min(st.seq.length, k)); render(); return; }
    render(); if (!st.still) play();
  }

  /* ---------- wiring ---------- */
  buildCases(); buildLegend(); buildLadder(); buildSkills(); buildGroups(); buildTune();
  $('#again').innerHTML = IC.again;
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-case]'), s = e.target.closest('[data-step]');
    if (c && c.getAttribute('data-case') !== 'custom') load(c.getAttribute('data-case'));
    else if (s) { stop(); st.k = +s.getAttribute('data-step'); render(); }
    if (!e.target.closest('#tunePanel') && !e.target.closest('#tune') && !e.target.closest('#legend') && !$('#tunePanel').hidden) { $('#tunePanel').hidden = true; $('#tune').setAttribute('aria-expanded', 'false'); }
  });
  $('#play').addEventListener('click', function () { if (st.playing) { stop(); render(); } else play(); });
  $('#again').addEventListener('click', function () { stop(); st.k = 0; render(); play(); });
  $('#speed').addEventListener('click', function () { st.speed = st.speed === 1 ? 2 : st.speed === 2 ? 0.5 : 1; render(); });
  function tuneToggle() { var p = $('#tunePanel'); p.hidden = !p.hidden; $('#tune').setAttribute('aria-expanded', p.hidden ? 'false' : 'true'); }
  $('#tune').addEventListener('click', tuneToggle);
  $('#legend').addEventListener('click', function (e) { e.stopPropagation(); tuneToggle(); });
  $('#less').addEventListener('click', function () { if (st.seq.length > 1) { st.seq.pop(); buildRows(); edited(); } });
  $('#more').addEventListener('click', function () { if (st.seq.length < MAXN) { st.seq.push(st.seq[st.seq.length - 1]); buildRows(); edited(); } });
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); $('#play').click(); }
    else if (e.key === 'ArrowRight') { stop(); st.k = Math.min(st.seq.length, st.k + 1); render(); }
    else if (e.key === 'ArrowLeft') { stop(); st.k = Math.max(0, st.k - 1); render(); }
  });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { wires(); }, 100); });
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { wires(); }); ro.observe($('#stage')); ro.observe($('#lad')); ro.observe($('#groups')); }
  window.addEventListener('load', function () { wires(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { wires(); });
  load(Q.get('case') || 'steady', Q.get('k') != null ? +Q.get('k') : null);
  window.ZJ = { st: st, load: load, render: render, play: play, stop: stop, cfg: function () { return cfg; }, run: function () { return R; } };
})();
