/* Zero b13 prototype bar: under the app, apart from it.
   Best / mid / worst, play and step, speed (1x 2x 4x), Navid's moments (jump straight to one: it plays, then stops), the chapters, what is happening. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var root;
  /* each moment: its name, where it happens, what Navid noticed, how he helps, and the rule behind it */
  var PRIV = 'Private slips: Zero covers twice, Navid steps in the third time.';
  var SEND = 'Anything your manager will see is checked when you press Send, the first time.';
  var MM = {
    intro: ['Meet Navid', 'Scenario one, before he goes in', 'A new learner, first scenario.', 'Says who he is, and that he only speaks up when it matters.'],
    notes_hold: ['Third skipped note', 'Kickoff, meeting notes', 'Continue pressed with nothing written, three times. Zero wrote the first two.', 'Steps in by himself: write this one, it is how it sticks.', PRIV],
    casual: ['"yo whats up"', 'Stage, first message to Jay', 'A casual opener about to go to his manager.', 'Holds the send; Sanjay rewrites it while Navid watches.', SEND],
    nofile: ['A file with no words', 'Stage, sharing a file', 'A CSV going to Jay with no message.', 'Holds it: say what it is and what you need.', SEND],
    thin: ['A one page plan', 'Stage, submitting', 'One page, for a brief that needs problem, cause and fix.', 'Holds the submit; the plan becomes three pages.', SEND],
    stuck: ['Stuck in a stage', 'Stage', 'Twelve minutes with no message to Jay.', 'Blinks with one tip: ask one clear question.'],
    hi5: ['A high five', 'Feedback report', 'He opened with the number.', 'Says why it worked, so he does it again.'],
    walk_mid: ['Feedback, then practice', 'Feedback report', 'Jay had to chase him for updates.', 'The feedback in one line, then a two minute practice.'],
    walk_worst: ['Feedback, then practice', 'Feedback report', 'The plan went out before it covered the brief.', 'The feedback in one line, then a two minute practice.'],
    up_best: ['Level 4, ahead of plan', 'Performance review', 'A big jump on the first try.', 'Shows the path to his goal, and when he gets there.'],
    up_mid: ['Level 2, then a question', 'Performance review', 'On pace, one habit holding him back.', 'Names the fix, then answers his first question.'],
    up_worst: ['No level up yet', 'Performance review', 'Still Level 1 after the first scenario.', 'Says that is normal, and names the one habit.'],
    pattern: ['The same habit twice', 'Review, scenario two', 'Asking before trying, in two scenarios.', 'Names the pattern, and why it costs him.'],
    adapt: ['Keeping it short', 'Entering the next scenario', 'He skipped a tip.', 'Adapts: shorter from now on.'],
    goal_best: ['Goal reached', 'Review, scenario two', 'GTM Engineer roles open in six days.', 'Shows the path, and sets the next goal.'],
    w2: ['Level 2', 'Performance review', 'The habit, fixed.', 'Points at the next one.'],
    week_best: ['Week one check in', 'Home, end of the week', 'Showed up every day.', 'His pace, then asks how Zero has been.'],
    week_mid: ['Week one check in', 'Home, end of the week', 'Four days out of five.', 'His pace, then asks how Zero has been.'],
    week_worst: ['Week one check in', 'Home, end of the week', 'Three days out of five.', 'His pace, then asks how Zero has been.'],
    b3: ['Level 9', 'Performance review', 'Senior roles open.', 'One line of what it means.'],
    m3: ['Level 4', 'Performance review', 'Back on pace.', 'One line of what it means.'],
    w3: ['Level 3', 'Performance review', 'Making his own calls now.', 'One line of what it means.']
  };
  var LBL = {}; for (var mk in MM) LBL[mk] = MM[mk][0];
  /* every moment Navid speaks in this case, in order */
  function moments() {
    var out = [];
    J.beats().forEach(function (b, i) {
      var d = b.d || {};
      (b.cc || []).forEach(function (c) { if (c.click && c.at === 'pre') out.push({ i: i, id: c.id }); });
      if (d.notesMode === 'auto2') out.push({ i: i, id: 'notes_hold' });
      (d.chat || []).forEach(function (m) { if (m.hold) out.push({ i: i, id: m.hold.id }); });
      if (d.submit && d.submit.hold) out.push({ i: i, id: d.submit.hold.id });
      (b.cc || []).forEach(function (c) { if (c.click && c.at !== 'pre') out.push({ i: i, id: c.id }); });
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
  var hover = false, flash = 0, live = null;   // the explainer shows after a jump, for a moment when Navid starts, and on hover
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
      '<div class="ct-pop" aria-live="polite"></div>' +
      '<div class="ct-cap" aria-live="polite"></div>' +
      '<a class="ct-doc" href="zero-loop-coach-b13.html" target="_blank" rel="noopener">How Navid works</a><span class="ct-v">b13</span>';
    $$('[data-case]', el).forEach(function (b) { b.addEventListener('click', function () { J.P.moment = null; cur = -1; J.setCase(b.getAttribute('data-case')); }); });
    $('[data-t=prev]', el).addEventListener('click', function () { J.P.moment = null; J.prev(); });
    $('[data-t=next]', el).addEventListener('click', function () { J.P.moment = null; J.next(); });
    $('[data-t=play]', el).addEventListener('click', function () {
      J.P.moment = null;
      if (J.P.paused && J.P.i === J.beats().length - 1) { J.P.paused = false; J.go(0, { cut: true }); return; }
      J.pause();
    });
    $$('[data-sp]', el).forEach(function (b) { b.addEventListener('click', function () { var v = +b.getAttribute('data-sp'); if (J.P.moment) J.P.moment.restore = v; else J.speed(v); show(J.P.i); }); });
    var nvEl = $('.ct-nv', el);
    nvEl.addEventListener('mouseenter', function () { hover = true; show(J.P.i); });
    nvEl.addEventListener('mouseleave', function () { hover = false; show(J.P.i); });
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
    if (k < 0 && live && live.i === i) k = M.findIndex(function (m) { return m.i === i && m.id === live.id; });
    if (k < 0) { for (var n = 0; n < M.length; n++) if (M[n].i < i || (M[n].i === i && live && live.i === i)) k = n; }
    var on = k >= 0 && M[k].i === i && ((P.moment && !P.moment.hit) || (live && live.i === i)), m = M[Math.max(0, k)];
    var showPop = (P.moment && !P.moment.hit) || hover || Date.now() < flash;
    var nv = $('.ct-nv', root), pop = $('.ct-pop', root), mm = showPop && m ? MM[m.id] : null;
    if (mm) {
      pop.innerHTML = '<div class="ct-ph"><img alt="" src="' + D.COACH.photo + '"><b>' + esc(mm[0]) + '</b><span>' + (k + 1) + ' of ' + M.length + '</span></div>' +
        '<dl><dt>Where</dt><dd>' + esc(mm[1]) + '</dd><dt>He noticed</dt><dd>' + esc(mm[2]) + '</dd><dt>He helps</dt><dd>' + esc(mm[3]) + '</dd></dl>' + (mm[4] ? '<p>' + esc(mm[4]) + '</p>' : '');
      pop.style.left = Math.max(8, nv.offsetLeft) + 'px';
      pop.classList.add('on');
    } else pop.classList.remove('on');
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
  /* Navid calls this when a moment starts: the bar names it, and the explainer shows for a few seconds */
  function at(id, i) {
    live = { id: id, i: i };
    var M = moments(), k = M.findIndex(function (m) { return m.i === i && m.id === id; }); if (k >= 0) cur = k;
    flash = Date.now() + 3200;
    show(i);
    setTimeout(function () { show(J.P.i); }, 3300);
  }
  window.CT = { mount: mount, show: show, moments: moments, jump: jump, at: at };
})();
