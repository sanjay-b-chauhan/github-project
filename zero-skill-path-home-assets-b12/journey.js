/* The journey: one learner from day one to the job, in the real app, best case or worst case.
   Scenario 1 plays in full: home, kickoff, the workspace with Jordan, the review, the level.
   In the workspace she makes mistakes. The first one the coach lets go. The second, a light note after it sends.
   The third, the composer shakes as she hits send and the coach holds the message with a better version.
   When something goes well, the coach says so. Then the rest of her scenarios play on the home screen to the end. */
(function () {
  'use strict';
  var H = window.__home; if (!H) return;
  var D = H.D, AS = H.AS, esc = H.esc, fmt = H.fmt;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var J = { k: null, steps: [], i: 0, playing: false, t: null, subs: [], speed: 1, phase: 'idle', cap: '', catches: 0 };
  window.__J = J;

  var SC = D.SCENARIOS[0], JORDAN = H.MGR, MAYA = H.ME;
  var I = {
    send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>',
    clip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7.5-5 5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3L6.6 11a1 1 0 0 1-1.5-1.5l4.6-4.6"/></svg>',
    file: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/></svg>',
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>',
    play: '<svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.6 5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="1.5" width="2.2" height="7" rx=".6"/><rect x="5.8" y="1.5" width="2.2" height="7" rx=".6"/></svg>',
    next: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5v9L7.5 6z"/><rect x="8.3" y="1.5" width="1.8" height="9" rx=".5"/></svg>',
    again: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 2v2.5H5"/></svg>'
  };

  /* ---------- timing ---------- */
  function later(fn, ms) { var id = setTimeout(fn, ms / J.speed); J.subs.push(id); return id; }
  function clear() { clearTimeout(J.t); J.subs.forEach(clearTimeout); J.subs = []; }
  function dType(t) { return 500 + t.length * 26; }

  /* ---------- scenes ---------- */
  var scr = function () { return $('#screen'); };
  function homeView() { var s = $('#scene'); s.hidden = true; s.className = 'scene'; s.innerHTML = ''; scr().classList.remove('insc'); }
  function scene(cls, html) {
    var s = $('#scene'); s.className = 'scene ' + cls; s.innerHTML = html; s.hidden = false;
    scr().classList.add('insc'); H.setOpen(false);
  }
  function kick() {
    scene('kick', '<div class="kk">' +
      '<div class="kv"><img src="' + JORDAN.img + '" alt=""><span class="onair"><i></i>Live</span><span class="nm">' + JORDAN.name + ' · Your manager</span></div>' +
      '<div class="kb"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h2>' + esc(SC.title) + '</h2><p>Get every new host lead to the right rep in under two minutes.</p>' +
      '<div class="nums"><div><b>1,200</b><span>host leads a month</span></div><div><b>26 hours</b><span>to a first reply today</span></div><div><b>Under 2 min</b><span>the goal</span></div></div></div></div>');
  }
  var PARTS = ['Map the lead flow', 'Build the router', 'Test it on real leads', 'Send it for review'];
  function work() {
    scene('work', '<div class="ws">' +
      '<aside class="ws-l"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h3>' + esc(SC.title) + '</h3><p>Get every new host lead to the right rep in under two minutes.</p>' +
      '<ol class="parts">' + PARTS.map(function (p, i) { return '<li data-p="' + i + '" class="' + (i === 0 ? 'cur' : '') + '"><i>' + I.tick + '</i>' + p + '</li>'; }).join('') + '</ol>' +
      '<div class="tools">' + SC.tools.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></aside>' +
      '<section class="ws-c"><header class="ws-h"><img src="' + JORDAN.img + '" alt=""><span><b>' + JORDAN.name + '</b><em>Your manager · ' + D.CO[SC.co] + '</em></span></header>' +
      '<div class="msgs" id="msgs"></div><div class="hold" id="hold"></div>' +
      '<div class="comp" id="comp"><div class="att" id="att"></div><div class="row"><button type="button" class="clip">' + I.clip + '</button>' +
      '<div class="in"><span class="tx" id="tx"></span><span class="ph">Message ' + JORDAN.name + '</span><i class="caret"></i></div>' +
      '<button type="button" class="send" id="send">' + I.send + '</button></div></div></section></div>');
  }
  function msgs() { return $('#msgs'); }
  function push(html) { var m = msgs(); if (!m) return; m.insertAdjacentHTML('beforeend', html); m.scrollTop = m.scrollHeight; }
  function jordan(text) {
    push('<div class="m them typing" id="mt"><img src="' + JORDAN.img + '" alt=""><p><span class="dots"><i></i><i></i><i></i></span></p></div>');
    later(function () { var t = $('#mt'); if (!t) return; t.removeAttribute('id'); t.classList.remove('typing'); t.querySelector('p').textContent = text; msgs().scrollTop = 1e6; }, 800);
  }
  function sys(text) { push('<div class="m sys"><p>' + esc(text) + '</p></div>'); }
  function sent(text, files) {
    push('<div class="m me">' + (files ? '<div class="fl">' + files.map(function (f) { return '<span>' + I.file + esc(f) + '</span>'; }).join('') + '</div>' : '') + '<p>' + esc(text) + '</p></div>');
    $('#tx').textContent = ''; $('#att').innerHTML = ''; $('#comp').classList.remove('has');
  }
  function typeIn(text, done) {
    var tx = $('#tx'), c = $('#comp'), i = 0; if (!tx) return;
    tx.textContent = ''; c.classList.add('has', 'typing');
    (function tick() {
      if (!$('#tx')) return;
      tx.textContent = text.slice(0, ++i);
      if (i < text.length) later(tick, 26); else { c.classList.remove('typing'); later(done, 350); }
    })();
  }
  function press() { var b = $('#send'); if (!b) return; b.classList.remove('press'); b.offsetWidth; b.classList.add('press'); }
  function shake() {
    var c = $('#comp'); if (!c) return;
    c.classList.remove('shake'); c.offsetWidth; c.classList.add('shake');
    try { if (navigator.vibrate) navigator.vibrate([25, 40, 25]); } catch (e) {}
  }
  function attach(name) { var a = $('#att'); if (!a) return; a.insertAdjacentHTML('beforeend', '<span>' + I.file + esc(name) + '</span>'); $('#comp').classList.add('has'); }
  function part(i, st) { var li = document.querySelector('.parts li[data-p="' + i + '"]'); if (li) li.className = st; }
  /* the coach holds the message, with a better version */
  function hold(o) {
    var C = H.coach(), h = $('#hold'); if (!h) return;
    J.catches++;
    h.innerHTML = '<div class="hc"><div class="hc-h"><img src="' + C.img + '" alt=""><b>Hold on, ' + MAYA.name + '</b><span>' + C.name + ', your coach</span></div>' +
      '<p class="hc-t">' + esc(o.why) + '</p>' +
      (o.ins ? '<div class="hc-s"><span class="k">Try this instead</span><p>' + esc(o.ins) + '</p></div>' : '') +
      (o.file ? '<div class="hc-s"><span class="k">Upload this</span><p class="f">' + I.file + esc(o.file) + '</p></div>' : '') +
      '<div class="hc-b"><button type="button" class="use" id="use">' + esc(o.use) + '</button><button type="button" class="anyway">' + esc(o.anyway) + '</button></div></div>';
    h.classList.add('on'); var wc = $('.ws-c'); if (wc) wc.classList.add('held');
    var hud = $('#chipMe'); hud.classList.remove('ping'); hud.offsetWidth; hud.classList.add('ping');
  }
  function unhold() { var c = $('#comp'); if (c) c.classList.remove('shake'); var wc = $('.ws-c'); if (wc) wc.classList.remove('held'); var h = $('#hold'); if (h) { h.classList.remove('on'); later(function () { if (h) h.innerHTML = ''; }, 300); } }
  function tapUse() { var u = $('#use'); if (u) { u.classList.add('tap'); } }
  function review(b, well, one) {
    var B = H.BANDS[b], col = ['', '#E07A45', '#EDBE52', '#4CC27A', '#2FB866'][b];
    scene('rev', '<div class="rv"><div class="rv-h"><img src="' + JORDAN.img + '" alt=""><span><b>' + JORDAN.name + '’s review</b><em>' + esc(SC.title) + ' · ' + D.CO[SC.co] + '</em></span></div>' +
      '<div class="rv-b" style="--bc:' + col + '"><span class="band">' + B.n + '</span><span class="pts">✦ <b id="rvPts">0</b></span></div>' +
      '<div class="rv-n"><div><span class="ic ok">' + I.tick + '</span><p><em>What went well</em>' + esc(well) + '</p></div><div><span class="ic"></span><p><em>One thing for next time</em>' + esc(one) + '</p></div></div></div>');
    var n = 0, el = $('#rvPts');
    (function count() { n = Math.min(B.pay, n + Math.ceil(B.pay / 24)); if (el) el.textContent = fmt(n); if (n < B.pay) later(count, 30); })();
  }
  function lvup(L) {
    var rs = [], n = 0; for (var k = 1; k <= L; k++) { n += D.BUCKET[k] || 0; }
    var cos = H.companies(H.rolesAt(L), 5), r0 = H.rolesAt(L)[0];
    var el = $('#lvup');
    el.innerHTML = '<div class="lu"><span class="k">Level up</span><h2>Level ' + L + '</h2><p>' + n + ' roles open to you now</p><span class="circles">' + cos.map(function (c) { return H.logo(c, 34); }).join('') + '</span>' +
      (r0 ? '<em>' + esc(r0.title) + ', ' + D.CO[r0.co] + (/^Remote/.test(r0.loc) ? ', remote' : ' in ' + esc(r0.loc)) + '</em>' : '') + '</div>';
    el.hidden = false; el.classList.remove('out'); scr().classList.add('luon');
    var hud = $('#hud'); hud.classList.remove('up'); hud.offsetWidth; hud.classList.add('up');
    later(function () { el.classList.add('out'); later(function () { el.hidden = true; scr().classList.remove('luon'); }, 400); }, 2900);
  }

  /* ---------- the two journeys ---------- */
  function S_(cap, d, go) { return { cap: cap, d: d, go: go }; }
  var M = {
    rush1: 'need crm access', rush2: 'hubspot admin pls', rush3: 'soon',
    fix3: 'The router will be ready for you to test tomorrow at 2pm. It sends every new lead to the right rep in under two minutes.',
    good1: 'Hi Jordan, I mapped the lead flow. To build the router I need HubSpot admin access. Could you add me today?',
    good2: 'Tomorrow at 2pm. It sends every new lead to the right rep in under two minutes.',
    ready: 'The router is ready for your review.'
  };
  function opening() {
    return [
      S_('Day 1. Maya opens Zero. Level 0, no skill points yet.', 2600, function () { homeView(); H.setOpen(false); }),
      S_('Her level: 0 skill points. Level 1 opens her first 12 roles.', 3200, function () { H.openTab('level'); }),
      S_('Her coach is ready before she starts.', 3000, function () { H.openTab('coach'); }),
      S_('Kickoff with Jordan, her manager at Airbnb.', 3800, function () { kick(); }),
      S_('The workspace. Jordan asks what she needs.', 2600, function () { work(); H.setStage(0, 1); later(function () { jordan('Kickoff done. What do you need from me to start?'); }, 300); })
    ];
  }
  var JOURNEYS = {
    worst: function () {
      return opening().concat([
        S_('Mistake 1. A rushed message. The coach lets it go.', dType(M.rush1) + 1500, function () {
          typeIn(M.rush1, function () { press(); sent(M.rush1); H.setNow({ kind: 'miss', k: 'comm', del: M.rush1, ins: M.good1, why: 'Jordan will have to ask what you mean.', msg: true }, -10); });
        }),
        S_('Jordan has to ask what she means.', 2600, function () { jordan('Which CRM? And what access do you need?'); }),
        S_('Mistake 2. Still rushed. The coach leaves a light note, after it sends.', dType(M.rush2) + 3600, function () {
          typeIn(M.rush2, function () { press(); sent(M.rush2); later(function () { H.toast('heads', 'Jordan has asked twice now. Next message, say what you need and why.', ''); }, 900); });
          H.setNow({ kind: 'miss', k: 'comm', del: M.rush2, ins: M.good1, why: 'Jordan asked twice. Say what you need and why.', msg: true }, -6);
        }),
        S_('Jordan adds her, and asks for a date.', 2600, function () { jordan('Done, you are in. When can I see a first version?'); }),
        S_('Mistake 3. As she hits send, it shakes. The coach holds the message.', dType(M.rush3) + 5200, function () {
          typeIn(M.rush3, function () { press(); shake(); later(function () {
            hold({ why: '“soon” will make Jordan ask a third time. Give him a date and what it will do.', ins: M.fix3, use: 'Use this', anyway: 'Send mine anyway' });
          }, 420); });
        }),
        S_('She takes the coach’s version.', 3400, function () {
          tapUse(); later(function () { $('#tx').textContent = M.fix3; unhold(); }, 500); later(function () { press(); sent(M.fix3); }, 1500);
        }),
        S_('Jordan gets it in one go. The coach says so.', 3400, function () {
          jordan('Perfect. That is exactly what I needed.');
          later(function () { H.toast('praise', 'That is it. One clear message and Jordan said yes straight away.', ''); }, 1300);
          H.setNow({ kind: 'win', k: 'comm', text: 'Your message gave Jordan a date and what it will do.' }, 14);
        }),
        S_('Part 2. She builds the router in n8n.', 2800, function () { part(0, 'done'); part(1, 'cur'); sys(MAYA.name + ' is building the router in n8n.'); H.setStage(0, 2); }),
        S_('She sends it without testing. The coach lets her learn this one.', dType(M.ready) + 2400, function () {
          part(1, 'done'); part(2, 'skip'); part(3, 'cur'); attach('lead-router.json');
          later(function () { typeIn(M.ready, function () { press(); sent(M.ready, ['lead-router.json']); }); }, 500);
          H.setNow({ kind: 'miss', k: 'quality', del: 'Sent without a test run.', ins: 'Test it on real leads, then send the results with it.', why: 'Jordan will find the gaps in review.' }, -10);
        }),
        S_('Jordan finds the gap.', 2800, function () { jordan('Two lead types land with no owner. Let us go through it in your review.'); }),
        S_('The review: Below. 500 skill points.', 4400, function () {
          review(1, 'The router sends most leads in under two minutes.', 'Test it on real leads before you send it.');
          later(function () { H.quiet('worst', 0); H.gain(500); }, 1200);
        }),
        S_('Back home. The coach turns it into the next step.', 3400, function () {
          homeView(); H.setOpen(false);
          later(function () { H.toast('nudge', 'Below this time, and that is how you learn it. Next one: test on real leads before you send.', ''); }, 500);
        }),
        S_('Then the rest of her scenarios. The coach keeps watching.', 900, function () { montage('worst'); })
      ]);
    },
    best: function () {
      return opening().concat([
        S_('A clear message from the start.', dType(M.good1) + 1500, function () { typeIn(M.good1, function () { press(); sent(M.good1); }); }),
        S_('Jordan says yes in one go. The coach notices.', 3400, function () {
          jordan('Done, you are in.');
          later(function () { H.toast('praise', 'Clear ask. Jordan said yes in one message. That is Exceeding work.', ''); }, 1300);
          H.setNow({ kind: 'win', k: 'comm', text: 'Your ask was clear. Jordan said yes in one message.' }, 12);
        }),
        S_('Jordan asks for a date.', 2400, function () { jordan('When can I see a first version?'); }),
        S_('She gives a date and what it will do.', dType(M.good2) + 2200, function () {
          typeIn(M.good2, function () { press(); sent(M.good2); later(function () { jordan('Great.'); }, 600); });
        }),
        S_('Part 2. She builds the router in n8n, and tests it.', 3200, function () {
          part(0, 'done'); part(1, 'cur'); sys(MAYA.name + ' is building the router in n8n.'); H.setStage(0, 2);
          later(function () { part(1, 'done'); part(2, 'cur'); sys(MAYA.name + ' tested it on 200 real leads. Every one routed.'); }, 1600);
        }),
        S_('One slip. She hits send without the test results. It shakes.', dType(M.ready) + 4600, function () {
          part(2, 'done'); part(3, 'cur'); attach('lead-router.json');
          later(function () { typeIn(M.ready, function () { press(); shake(); later(function () {
            hold({ why: 'Jordan will ask if it works. You already tested it, so send the proof with it.', file: 'test-run-200-leads.csv', use: 'Upload test run', anyway: 'Send without it' });
          }, 420); }); }, 400);
        }),
        S_('She adds the test run, then sends.', 3400, function () {
          tapUse(); later(function () { attach('test-run-200-leads.csv'); unhold(); }, 500);
          later(function () { press(); sent(M.ready, ['lead-router.json', 'test-run-200-leads.csv']); }, 1600);
        }),
        S_('Jordan is impressed. So is the coach.', 3400, function () {
          jordan('Tested on 200 real leads, every one routed. Impressive.');
          later(function () { H.toast('praise', 'You added the proof, and Jordan had nothing to ask. That is how Exceptional looks.', ''); }, 1300);
          H.setNow({ kind: 'win', k: 'quality', text: 'You sent the proof with the work.' }, 16);
        }),
        S_('The review: Exceptional. 3,000 skill points.', 4400, function () {
          review(4, 'Every lead reached the right rep, tested on 200 real ones.', 'Show reps how they hear about a new lead.');
          later(function () { H.quiet('best', 0); H.gain(3000); }, 1200);
        }),
        S_('Level 3. Her first full time roles open.', 3800, function () { homeView(); H.setOpen(false); later(function () { lvup(3); }, 300); }),
        S_('Then the rest of her scenarios.', 900, function () { montage('best'); })
      ]);
    }
  };

  /* the rest of the run plays on the home screen, with the coach open so you see it read her live */
  function montage(k) {
    J.phase = 'montage';
    H.openTab('coach');
    H.startFrom(k, 1, 3);
    drawBar();
  }
  J.onFinish = function () {
    if (J.phase !== 'montage') return;
    J.phase = 'end'; J.playing = false;
    later(function () { H.openTab('level'); }, 1200);
    later(summary, 2200);
    drawBar();
  };
  function summary() {
    var ST = H.ST, lv = H.level(ST.pts), n = H.CASES[J.k].runs.length, c = ST.cnt;
    var el = $('#sum');
    el.innerHTML = '<div class="smry"><span class="k">' + (J.k === 'best' ? 'Best case' : 'Worst case') + '</span><h2>Level ' + lv + ' in ' + n + ' scenarios</h2>' +
      '<p>' + (lv >= 10 ? 'GTM Engineer at OpenAI is open to her.' : '') + '</p>' +
      '<div class="st"><div><b>' + J.catches + '</b><span>message' + (J.catches === 1 ? '' : 's') + ' held before sending</span></div>' +
      '<div><b>' + (c.nudge + c.heads) + '</b><span>' + ((c.nudge + c.heads) === 1 ? 'note' : 'notes') + ' to try something else</span></div><div><b>' + c.praise + '</b><span>wins celebrated</span></div></div>' +
      '<div class="bt"><button type="button" data-j="' + (J.k === 'best' ? 'worst' : 'best') + '">Watch the ' + (J.k === 'best' ? 'worst' : 'best') + ' case</button><button type="button" class="gh" data-j="' + J.k + '">Watch again</button></div></div>';
    el.hidden = false;
  }

  /* ---------- the player ---------- */
  function play(k) {
    clear(); H.clearAll();
    J.k = k; J.steps = JOURNEYS[k](); J.i = 0; J.playing = true; J.phase = 'scenario'; J.catches = 0;
    $('#sum').hidden = true; $('#lvup').hidden = true;
    H.reset(k); homeView();
    run();
  }
  function run() {
    if (!J.playing || J.phase !== 'scenario') return;
    if (J.i >= J.steps.length) return;
    var s = J.steps[J.i++];
    J.cap = s.cap; drawBar();
    s.go();
    J.t = setTimeout(run, s.d / J.speed);
  }
  function toggle() {
    if (J.phase === 'montage') { H.togglePlay(); J.playing = H.P.playing; drawBar(); return; }
    J.playing = !J.playing; if (J.playing) run(); else clearTimeout(J.t);
    drawBar();
  }
  function skip() {
    if (J.phase !== 'scenario') return;
    clearTimeout(J.t); J.playing = true; run();
  }
  J.drawBar = drawBar;
  function drawBar() {
    var cs = $('#cases'); if (!cs) return;
    cs.innerHTML = [['best', 'Play best case'], ['worst', 'Play worst case']].map(function (x) {
      return '<button type="button" data-j="' + x[0] + '"' + (J.k === x[0] ? ' class="on"' : '') + '><span class="pl"></span>' + x[1] + '</button>';
    }).join('');
    var v = $('#variant'); if (v) v.innerHTML = '<button type="button" data-cv="1"' + (H.S.cv ? ' class="on"' : '') + ' title="What the coach reads, for the team. Learners never see it.">Coach’s view</button>';
    var r = $('#run'); if (!r) return;
    if (!J.k) { r.innerHTML = ''; return; }
    var ST = H.ST, lv = H.level(ST.pts), n = H.CASES[J.k].runs.length, cap;
    if (J.phase === 'scenario') cap = J.cap;
    else if (J.phase === 'montage') cap = 'Scenario ' + Math.min(n, ST.cur + 1) + ' of ' + n + ' · Level ' + lv;
    else cap = 'Level ' + lv + ' in ' + n + ' scenarios';
    var playing = J.phase === 'montage' ? H.P.playing : J.playing;
    r.innerHTML = '<span class="st cap">' + esc(cap) + '</span>' +
      (J.phase === 'end' ? '' : '<button type="button" data-jr="play" aria-label="' + (playing ? 'Pause' : 'Play') + '">' + (playing ? I.pause : I.play) + '</button>') +
      (J.phase === 'scenario' ? '<button type="button" data-jr="next" aria-label="Next step">' + I.next + '</button>' : '') +
      '<button type="button" data-jr="again" aria-label="Start over">' + I.again + '</button>' +
      '<button type="button" class="sp" data-jr="speed">' + (J.phase === 'montage' ? H.P.speed : J.speed) + 'x</button>';
  }
  document.getElementById('dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.j) play(b.dataset.j);
    if (b.dataset.jr === 'play') toggle();
    if (b.dataset.jr === 'next') skip();
    if (b.dataset.jr === 'again' && J.k) play(J.k);
    if (b.dataset.jr === 'speed') {
      if (J.phase === 'montage') H.P.speed = H.P.speed >= 4 ? 1 : H.P.speed * 2; else J.speed = J.speed >= 2 ? 1 : J.speed * 2;
      drawBar();
    }
  });
  document.getElementById('sum').addEventListener('click', function (e) { var b = e.target.closest('[data-j]'); if (b) play(b.dataset.j); });
  /* the coach's card: Use this, or send your own anyway */
  document.getElementById('scene').addEventListener('click', function (e) { e.stopPropagation(); });

  drawBar();
  try { var q = new URLSearchParams(location.search).get('j'); if (JOURNEYS[q]) play(q); } catch (e) {}
  window.__ready = true;
})();
