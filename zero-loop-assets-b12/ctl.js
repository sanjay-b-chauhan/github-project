/* Zero b12 prototype bar: under the app, apart from it.
   Best / mid / worst, play and step, speed (1x 2x 4x), Navid's moments (jump straight to one: it plays, then stops), the chapters, what is happening. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var root;
  var LBL = {
    intro: 'Meet Navid', notes: 'The notes trick', notes3: 'Third missed note', pou: 'Before the check', nonotes: 'No notes taken', stuck: 'Stuck in a stage',
    hi5: 'A high five', walk_mid: 'Feedback, then practice', walk_worst: 'Feedback, then practice', up_best: 'Level 4, the path', up_mid: 'Level 2, then a question',
    up_worst: 'No level up yet', pattern: 'The same habit twice', adapt: 'Keeping it short', goal_best: 'Goal reached', w2: 'Level 2', week_best: 'Week one check in',
    week_mid: 'Week one check in', week_worst: 'Week one check in', b3: 'Level 9', m3: 'Level 4', w3: 'Level 3'
  };
  /* every moment Navid speaks in this case, in order */
  function moments() {
    var out = [];
    J.beats().forEach(function (b, i) {
      if (b.d && b.d.missNotes) out.push({ i: i, id: 'notes3' });
      (b.cc || []).forEach(function (c) { if (c.click) out.push({ i: i, id: c.id }); });
    });
    return out;
  }
  function chapters() {
    var b = J.beats(), out = [];
    b.forEach(function (x, i) { var last = out[out.length - 1]; if (!last || last.ch !== x.ch) out.push({ ch: x.ch, from: i, to: i }); else last.to = i; });
    return out;
  }
  function label(ch) {
    if (ch.ch.charAt(0) === 'j') return '<span class="ji">' + IC.bag + '</span>';
    var sc = D.SC[D.ROAD[+ch.ch.slice(1) - 1]];
    return J.logo(sc.co, 20);
  }
  function title(ch) {
    if (ch.ch.charAt(0) === 'j') return 'Jobs';
    var sc = D.SC[D.ROAD[+ch.ch.slice(1) - 1]]; return sc.title + ' at ' + J.coName(sc.co);
  }
  var cur = -1;          // the moment we are on, or just past
  function jump(k) {
    var M = moments(); if (!M.length) return;
    k = Math.max(0, Math.min(M.length - 1, k));
    cur = k;
    var P = J.P, restore = P.moment ? P.moment.restore : (P.speed > 4 ? 1 : P.speed);
    P.moment = { restore: restore, i: M[k].i, id: M[k].id };
    P.paused = false;
    J.speed(12);                                   // run up to the moment fast; Navid sets the speed back when he starts
    J.go(M[k].i, { cut: true });
    show(M[k].i);
  }
  function mount(el) {
    root = el;
    el.innerHTML = '<div class="ct-case" role="group" aria-label="Which case">' + ['best', 'mid', 'worst'].map(function (k) { return '<button data-case="' + k + '">' + esc(D.CASES[k].name.replace(' case', '')) + '</button>'; }).join('') + '</div>' +
      '<div class="ct-tr"><button data-t="prev" aria-label="Back one step">' + IC.prev + '</button><button data-t="play" aria-label="Pause"></button><button data-t="next" aria-label="Forward one step">' + IC.next + '</button></div>' +
      '<div class="ct-spd" role="group" aria-label="Speed">' + [1, 2, 4].map(function (v) { return '<button data-sp="' + v + '">' + v + 'x</button>'; }).join('') + '</div>' +
      '<div class="ct-nv" role="group" aria-label="Navid’s moments"><button data-nv="-1" aria-label="Previous Navid moment">' + IC.left + '</button>' +
        '<span class="ct-nvl"><img alt="" src="' + D.COACH.photo + '"><span class="ct-nvt"><b></b><em></em></span></span><button data-nv="1" aria-label="Next Navid moment">' + IC.right + '</button></div>' +
      '<div class="ct-ch" role="group" aria-label="Chapters"></div>' +
      '<div class="ct-cap" aria-live="polite"></div>' +
      '<a class="ct-doc" href="zero-loop-coach-b12.html" target="_blank" rel="noopener">How Navid works</a><span class="ct-v">b12</span>';
    $$('[data-case]', el).forEach(function (b) { b.addEventListener('click', function () { J.P.moment = null; cur = -1; J.setCase(b.getAttribute('data-case')); }); });
    $('[data-t=prev]', el).addEventListener('click', function () { J.P.moment = null; J.prev(); });
    $('[data-t=next]', el).addEventListener('click', function () { J.P.moment = null; J.next(); });
    $('[data-t=play]', el).addEventListener('click', function () {
      J.P.moment = null;
      if (J.P.paused && J.P.i === J.beats().length - 1) { J.P.paused = false; J.go(0, { cut: true }); return; }
      J.pause();
    });
    $$('[data-sp]', el).forEach(function (b) { b.addEventListener('click', function () { var v = +b.getAttribute('data-sp'); if (J.P.moment) J.P.moment.restore = v; else J.speed(v); show(J.P.i); }); });
    $$('[data-nv]', el).forEach(function (b) { b.addEventListener('click', function () {
      var d = +b.getAttribute('data-nv'), M = moments(), i = J.P.i, k;
      if (d > 0) { k = M.findIndex(function (m, n) { return m.i > i || (m.i === i && n > cur); }); if (k < 0) k = M.length - 1; }
      else { k = -1; for (var n = M.length - 1; n >= 0; n--) if (M[n].i < i || (M[n].i === i && n < cur)) { k = n; break; } if (k < 0) k = 0; }
      jump(k);
    }); });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === ' ') { e.preventDefault(); J.pause(); } else if (e.key === 'ArrowRight') J.next(); else if (e.key === 'ArrowLeft') J.prev();
      else if (e.key === ']' || e.key === 'n') $('[data-nv="1"]', el).click(); else if (e.key === '[' || e.key === 'p') $('[data-nv="-1"]', el).click();
    });
  }
  function show(i, ended) {
    if (!root) return;
    var P = J.P, b = J.beats(), beat = b[i];
    $$('[data-case]', root).forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-case') === P.key); });
    var pb = $('[data-t=play]', root), end = ended || (P.paused && i === b.length - 1);
    pb.innerHTML = end ? IC.redo : P.paused ? IC.play : IC.pause;
    pb.setAttribute('aria-label', end ? 'Play again' : P.paused ? 'Play' : 'Pause');
    var sp = P.moment ? P.moment.restore : P.speed;
    $$('[data-sp]', root).forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-sp') === sp); });
    /* Navid: which moment we are on, or the next one coming */
    var M = moments(), k = -1;
    if (P.moment) k = M.findIndex(function (m) { return m.i === P.moment.i && m.id === P.moment.id; });
    if (k < 0) { for (var n = 0; n < M.length; n++) if (M[n].i <= i) k = n; }
    var on = k >= 0 && M[k].i === i, m = M[Math.max(0, k)];
    var nv = $('.ct-nv', root);
    nv.classList.toggle('here', !!on);
    $('.ct-nvt b', nv).textContent = M.length ? (Math.max(0, k) + 1) + ' of ' + M.length : '';
    $('.ct-nvt em', nv).textContent = m ? (LBL[m.id] || m.id) : '';
    var chs = chapters();
    $('.ct-ch', root).innerHTML = chs.map(function (c) {
      var o = i >= c.from && i <= c.to, w = o ? ((i - c.from + 1) / (c.to - c.from + 1) * 100) : i > c.to ? 100 : 0;
      return '<button class="' + (o ? 'on' : i > c.to ? 'past' : '') + '" data-go="' + c.from + '" title="' + esc(title(c)) + '">' + label(c) + '<i class="bar"><b style="--w:' + w + '%"></b></i></button>';
    }).join('');
    $$('[data-go]', root).forEach(function (x) { x.addEventListener('click', function () { J.P.moment = null; J.P.paused = false; J.go(+x.getAttribute('data-go'), { cut: true }); }); });
    $('.ct-cap', root).innerHTML = '<span>' + (i + 1) + ' / ' + b.length + '</span>' + esc(beat.cap);
  }
  window.CT = { mount: mount, show: show, moments: moments, jump: jump };
})();
