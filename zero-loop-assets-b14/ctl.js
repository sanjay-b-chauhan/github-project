/* Zero b14 prototype bar: under the app, apart from it.
   The point of this prototype is the coach, so the bar is built around Navid's moments: a slider of every moment in the
   case. Click a dot (or the arrows) and you land straight on Navid talking: a card says where you are, what he noticed and
   what he is making sure of while the app gets there, then he speaks, then it stops. Best / worst, play, speed, sound. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var root, veil;
  var PRIV = 'Private slips: Zero covers twice, Navid steps in the third time.';
  var SEND = 'Anything your manager will see is checked at Send, the first time.';
  /* [name, where, what he noticed, how he helps, what he is making sure of, the rule] */
  var MM = {
    intro: ['Meet Navid', 'Scenario one, before he goes in', 'A new learner on his first scenario.', 'Says who he is: Jay runs the work, Navid is on his side, and speaks only when it matters.', 'Sanjay knows who is who: Jay for the work, Navid for getting better and faster to GTM roles.'],
    notes_good: ['Every note taken', 'Kickoff, after Jay’s brief', 'He wrote all three numbers down himself.', 'Names the habit, and why it pays off.', 'He keeps doing it, because he knows it is why the check will be easy.'],
    pou_good: ['Three for three', 'After the understanding check', 'All three answers right.', 'Connects the result to his notes.', 'He sees cause and effect: the habit turned into points.'],
    plan_good: ['"What we talked about"', 'Stage, his first message to Jay', 'A clear plan: what he is building and by when.', 'Calls back to what they agreed at the start.', 'The habit sticks because someone noticed it.'],
    test_good: ['Tested before sending', 'Stage, testing', 'He ran it on real leads before he sent it.', 'Names it, and says what it is worth when asked.', 'He knows a third of the grade is already locked in.'],
    hi5: ['A high five', 'Feedback report', 'He opened with the number.', 'Says exactly why it worked.', 'He does it again in the next presentation.'],
    up_best: ['Level 4, ahead of plan', 'Performance review', 'Level 1 to Level 4 on the first try.', 'Shows the path to GTM roles, and how far ahead he is.', 'He sees the next level, not just this grade.'],
    next_best: ['The day, and one stretch', 'Home, after the scenario', 'Every habit done, all day.', 'Sums up the day, gives one stretch (edge cases on the slide), and asks how it felt.', 'He leaves motivated, and still has something to reach for.'],
    notes_hold: ['Third skipped note', 'Kickoff, meeting notes', 'Continue pressed with nothing written, three times. Zero wrote two of them for him.', 'Steps in by himself. Sanjay writes the third while Navid watches.', 'The numbers stick before the check that asks about them.', PRIV],
    pou_low: ['Mostly guesses', 'After the understanding check', 'One answer of three right.', 'Says it is normal on day one, and gives one trick.', 'He reads his notes back before he builds, not after.'],
    casual: ['"yo whats up"', 'Stage, his first message to Jay', 'A casual opener about to go to his manager.', 'Holds the send. Says why when asked. Sanjay rewrites it in front of him.', 'Jay reads him as someone doing the work.', SEND],
    stuck: ['Twelve quiet minutes', 'Stage, building the router', 'Twelve minutes on the hard step, with no message to Jay.', 'Credits the message that landed, says the step is hard, then one tip: ask one clear question.', 'He asks early, instead of losing the hour.'],
    nofile: ['A file with no words', 'Stage, sharing a file', 'A CSV going to Jay with no message.', 'Holds it: say what it is and what you need.', 'Jay can answer in one reply.', SEND],
    thin: ['A one page plan', 'Stage, submitting', 'One page, for a brief that needs problem, cause and fix.', 'Holds the submit. The plan becomes three pages.', 'The work meets the brief before Jay grades it.', SEND],
    ums: ['Fourteen ums', 'Right after the presentation', '14 ums in four minutes.', 'Waits until the meeting is over, then one tip: pause instead.', 'He sounds sure next time.', 'Never during a presentation; right after it.'],
    walk_worst2: ['Feedback, then practice', 'Feedback report', 'No test behind the plan.', 'The feedback in one line, then a two minute practice.', 'He knows how to show proof next time.'],
    up_worst: ['Still Level 1', 'Performance review', 'Below Expectations, no level up.', 'Normal on day one, the 500 points he did earn, and the one habit that moves him up. Asked why so many nudges: because he can get there.', 'He feels backed, not judged.'],
    recap_worst: ['Four habits in one day', 'Home, after the scenario', 'Notes, first message, file and plan: all fixed today.', 'Counts the progress, answers how to level up, asks how it felt.', 'He leaves with progress he can see, and one goal for next time.']
  };
  /* what each moment is worth: the skill points, the level, the role it moves him toward */
  var PTS = {
    intro: 'Scenario one pays up to 3,000 skill points: Level 1 to Level 4 in one go.',
    notes_good: 'The understanding check right after reads from these notes.',
    pou_good: 'Understanding is part of Jay’s grade, and it is already in.',
    plan_good: 'Communication is a part of Jay’s grade. Clear the first time means no points lost to chasing.',
    test_good: 'Testing is a third of Jay’s grade here. Locked in before he sends.',
    hi5: 'Delivery is what lifts Exceeding (2,000) to Exceptional (3,000).',
    up_best: '3,000 skill points. Level 1 to Level 4. GTM Engineer roles open at Level 6.',
    next_best: 'Two more scenarios like this one, and GTM Engineer roles are open to him.',
    notes_hold: 'The check right after asks about this number. Written down, it is points; skipped, it is a guess.',
    pou_low: 'Guesses cost Understanding points. Notes read back earn them.',
    casual: 'Caught before Jay saw it, so it costs nothing.',
    stuck: 'Twelve stuck minutes cost Speed. One question gets them back.',
    nofile: 'Caught before Jay saw it, so it costs nothing.',
    thin: 'Caught before Jay graded it. A one page plan would have been Underperforming: 0 points.',
    ums: 'Delivery is graded in the presentation. Fourteen ums cost it.',
    walk_worst2: 'No test kept him at Below Expectations: 500 points, not 1,000 or more.',
    up_worst: '500 skill points. 500 more to Level 2.',
    recap_worst: 'Zero holds next time is how the points add up: Meeting pays 1,000, Exceeding 2,000.'
  };
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
  var cur = -1, hover = false, flash = 0, live = null;
  function card(m, k, n) {
    var mm = MM[m.id] || [m.id, '', '', '', ''];
    return '<div class="ct-ph"><img alt="" src="' + D.COACH.photo + '"><span>Navid · moment ' + (k + 1) + ' of ' + n + '</span></div><h4>' + esc(mm[0]) + '</h4>' +
      '<dl><dt>Where</dt><dd>' + esc(mm[1]) + '</dd><dt>He noticed</dt><dd>' + esc(mm[2]) + '</dd><dt>He helps</dt><dd>' + esc(mm[3]) + '</dd><dt>Making sure</dt><dd>' + esc(mm[4]) + '</dd>' + (PTS[m.id] ? '<dt>Points</dt><dd>' + esc(PTS[m.id]) + '</dd>' : '') + '</dl>' +
      (mm[5] ? '<p>' + esc(mm[5]) + '</p>' : '');
  }
  function jump(k) {
    var M = moments(); if (!M.length) return;
    k = Math.max(0, Math.min(M.length - 1, k));
    cur = k; live = null;
    var P = J.P, restore = P.moment ? P.moment.restore : (P.speed > 4 ? 1 : P.speed);
    P.moment = { restore: restore, i: M[k].i, id: M[k].id };
    P.paused = false;
    veil.innerHTML = '<div class="ct-vc">' + card(M[k], k, M.length) + '</div>';
    veil.classList.add('on');
    J.speed(16);                                   // the app gets there behind the card; Navid sets the speed back when he starts
    J.go(M[k].i, { cut: true });
    show(M[k].i);
  }
  function mount(el) {
    root = el;
    veil = document.createElement('div'); veil.className = 'ct-veil'; document.body.appendChild(veil);
    el.innerHTML = '<div class="ct-case" role="group" aria-label="Which case">' + ['best', 'worst'].map(function (k) { return '<button data-case="' + k + '">' + esc(D.CASES[k].name.replace(' case', '')) + '</button>'; }).join('') + '</div>' +
      '<div class="ct-tr"><button data-t="prev" aria-label="Back one step">' + IC.prev + '</button><button data-t="play" aria-label="Pause"></button><button data-t="next" aria-label="Forward one step">' + IC.next + '</button></div>' +
      '<div class="ct-spd" role="group" aria-label="Speed">' + [1, 2, 4].map(function (v) { return '<button data-sp="' + v + '">' + v + 'x</button>'; }).join('') + '</div>' +
      '<button class="ct-snd" aria-label="Sound"></button>' +
      '<div class="ct-nv" role="group" aria-label="Navid’s moments"><button data-nv="-1" aria-label="Previous Navid moment">' + IC.left + '</button>' +
        '<span class="ct-nvl"><img alt="" src="' + D.COACH.photo + '"><span class="ct-nvt"><b></b><em></em></span></span>' +
        '<span class="ct-sl" role="group" aria-label="Every moment"></span>' +
        '<button data-nv="1" aria-label="Next Navid moment">' + IC.right + '</button></div>' +
      '<div class="ct-pop" aria-live="polite"></div>' +
      '<div class="ct-cap" aria-live="polite"></div>' +
      '<a class="ct-doc" href="zero-loop-coach-b14.html" target="_blank" rel="noopener">Every moment, written out</a><span class="ct-v">b14</span>';
    $$('[data-case]', el).forEach(function (b) { b.addEventListener('click', function () { J.P.moment = null; cur = -1; live = null; veil.classList.remove('on'); J.setCase(b.getAttribute('data-case')); }); });
    $('[data-t=prev]', el).addEventListener('click', function () { J.P.moment = null; veil.classList.remove('on'); J.prev(); });
    $('[data-t=next]', el).addEventListener('click', function () { J.P.moment = null; veil.classList.remove('on'); J.next(); });
    $('[data-t=play]', el).addEventListener('click', function () {
      J.P.moment = null; veil.classList.remove('on');
      if (J.P.paused && J.P.i === J.beats().length - 1) { J.P.paused = false; J.go(0, { cut: true }); return; }
      J.pause();
    });
    $$('[data-sp]', el).forEach(function (b) { b.addEventListener('click', function () { var v = +b.getAttribute('data-sp'); if (J.P.moment) J.P.moment.restore = v; else J.speed(v); show(J.P.i); }); });
    $('.ct-snd', el).addEventListener('click', function () { if (window.NV) NV.setSound(!NV.sound); show(J.P.i); });
    var nvEl = $('.ct-nv', el);
    nvEl.addEventListener('mouseenter', function () { hover = true; show(J.P.i); });
    nvEl.addEventListener('mouseleave', function () { hover = false; show(J.P.i); });
    $$('[data-nv]', el).forEach(function (b) { b.addEventListener('click', function () {
      var d = +b.getAttribute('data-nv'), M = moments(), k = cur < 0 ? (d > 0 ? 0 : 0) : cur + d;
      if (cur < 0 && d > 0) { var i = J.P.i; k = M.findIndex(function (m) { return m.i >= i; }); if (k < 0) k = M.length - 1; }
      jump(k);
    }); });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === ' ') { e.preventDefault(); J.pause(); } else if (e.key === 'ArrowRight') $('[data-nv="1"]', el).click(); else if (e.key === 'ArrowLeft') $('[data-nv="-1"]', el).click();
      else if (e.key === 'm') $('.ct-snd', el).click();
    });
  }
  var SPK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.9a5.8 5.8 0 0 1 0 8.2"/></svg>';
  var MUTE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 6.2l3.4 3.6M14 6.2l-3.4 3.6"/></svg>';
  function show(i, ended) {
    if (!root) return;
    var P = J.P, b = J.beats(), beat = b[i];
    $$('[data-case]', root).forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-case') === P.key); });
    var pb = $('[data-t=play]', root), end = ended || (P.paused && i === b.length - 1);
    pb.innerHTML = end ? IC.redo : P.paused ? IC.play : IC.pause;
    pb.setAttribute('aria-label', end ? 'Play again' : P.paused ? 'Play' : 'Pause');
    var sp = P.moment ? P.moment.restore : P.speed;
    $$('[data-sp]', root).forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-sp') === sp); });
    var snd = $('.ct-snd', root), on1 = !window.NV || NV.sound;
    snd.innerHTML = on1 ? SPK : MUTE; snd.classList.toggle('off', !on1); snd.setAttribute('aria-label', on1 ? 'Mute Navid' : 'Turn Navid’s voice on');
    /* where we are among Navid's moments */
    var M = moments(), k = cur;
    if (P.moment) k = M.findIndex(function (m) { return m.i === P.moment.i && m.id === P.moment.id; });
    else if (live) k = M.findIndex(function (m) { return m.i === live.i && m.id === live.id; });
    if (k < 0 || (!P.moment && !live && M[k] && M[k].i > i)) { k = -1; for (var n = 0; n < M.length; n++) if (M[n].i < i) k = n; }
    var m = M[Math.max(0, k)], mm = m ? MM[m.id] : null;
    $('.ct-nvt b', root).textContent = M.length ? (k < 0 ? 'Next: 1' : (k + 1)) + ' of ' + M.length : '';
    $('.ct-nvt em', root).textContent = mm ? mm[0] : '';
    $('.ct-sl', root).innerHTML = M.map(function (x, n) { return '<i data-m="' + n + '" class="' + (n === k ? 'on' : n < k ? 'past' : '') + '" title="' + esc((MM[x.id] || [x.id])[0]) + '"></i>'; }).join('');
    $$('.ct-sl i', root).forEach(function (x) { x.addEventListener('click', function () { jump(+x.getAttribute('data-m')); }); });
    var talking = live && live.i === i;
    $('.ct-nv', root).classList.toggle('here', !!talking);
    /* the explainer above the bar: on hover, and for a few seconds when Navid starts */
    var pop = $('.ct-pop', root);
    if ((hover || Date.now() < flash) && m && !(P.moment && !P.moment.hit)) { pop.innerHTML = card(m, Math.max(0, k), M.length); pop.style.left = Math.max(8, $('.ct-nv', root).offsetLeft) + 'px'; pop.classList.add('on'); }
    else pop.classList.remove('on');
    $('.ct-cap', root).innerHTML = talking && mm ? '<span>Navid</span>' + esc(mm[0]) + ' · making sure ' + esc(mm[4].charAt(0).toLowerCase() + mm[4].slice(1)) : '<span>' + (i + 1) + ' / ' + b.length + '</span>' + esc(beat.cap);
  }
  /* Navid calls this when a moment starts */
  function at(id, i) {
    live = { id: id, i: i };
    var M = moments(), k = M.findIndex(function (m) { return m.i === i && m.id === id; }); if (k >= 0) cur = k;
    if (veil) veil.classList.remove('on');
    flash = Date.now() + 3500;
    show(i);
    setTimeout(function () { show(J.P.i); }, 3600);
  }
  function done(id) { if (live && live.id === id) { live = null; show(J.P.i); } }
  window.CT = { mount: mount, show: show, moments: moments, jump: jump, at: at, done: done };
})();
