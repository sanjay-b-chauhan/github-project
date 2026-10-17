/* The coach, b16. One learner from day one, in the real app. Navid is the face of Zero: grey in the corner when he has
   nothing, lit when he has something. Tap him and the app steps aside for a black screen, his face and his words, then comes back. */
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
      '<div class="msgs" id="msgs"></div>' +
      '<div class="comp" id="comp"><div class="att" id="att"></div><div class="row"><button type="button" class="clip">' + I.clip + '</button>' +
      '<div class="in"><span class="tx" id="tx"></span><span class="ph">Message ' + JORDAN.name + '</span><i class="caret"></i></div>' +
      '<button type="button" class="send" id="send">' + I.send + '</button></div></div></section><aside class="ws-r"></aside></div>');
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
  function attach(name) { var a = $('#att'); if (!a) return; a.insertAdjacentHTML('beforeend', '<span class="chipin">' + I.file + esc(name) + '</span>'); $('#comp').classList.add('has'); }
  function part(i, st) { var li = document.querySelector('.parts li[data-p="' + i + '"]'); if (li) li.className = st; }
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



  /* ================================================================
     The coach, b16. Navid is the face of Zero, on your team for the whole road to the job. Jordan runs the project.
     He sits in the corner, grey when he has nothing, blinking when he has something. Tap him and the app moves aside:
     a black panel takes the right 30%, his face, two or three lines at a time, centred, and two answers at most.
     Then the app comes back and you carry on. It should never feel like an interruption.
     ================================================================ */
  function words(t) { return t.split(/\s+/).length; }
  function dChunk(t) { return 900 + words(t) * 300; }
  function secs(o) { var n = 0; (o.say || []).forEach(function (c) { n += words(c); }); n = Math.max(4, Math.round(n / 2.6)); return '0:' + String(n).padStart(2, '0'); }
  function dTalk(o) { var t = 0; o.say.forEach(function (c, i) { t += dChunk(c) + (i ? 700 : 0); }); return t + 600; }

  /* his face blinks in the corner, with a voice note beside it */
  function pulse(o) {
    var v = $('#vnote');
    $('#chipMe').classList.add('lit');
    v.innerHTML = '<span class="vn-w"><i></i><i></i><i></i><i></i><i></i></span><b>' + esc(o.t) + '</b><em>' + secs(o) + '</em>';
    v.hidden = false; v.classList.remove('out');
  }
  function unpulse() { $('#chipMe').classList.remove('lit'); var v = $('#vnote'); if (!v.hidden) { v.classList.add('out'); later(function () { v.hidden = true; }, 260); } }
  function tapChip() { var c = $('#chipMe'); c.classList.remove('tap'); c.offsetWidth; c.classList.add('tap'); }

  /* the side panel */
  var CUR = null;
  function sideOpen(o) {
    unpulse(); CUR = o;
    var C = H.coach(), el = $('#cside');
    el.innerHTML = '<div class="sd-in"><div class="sd-face"><img src="' + C.img + '" alt=""><i class="ring"></i></div>' +
      '<div class="sd-who"><b>' + C.name + '</b><span>Your coach</span></div>' +
      '<div class="sd-txt"><p id="sdP"></p></div><div class="sd-x" id="sdX"></div><div class="sd-act" id="sdAct"></div></div>';
    el.hidden = false; el.classList.remove('out');
    scr().classList.add('siding');
    logTip(o);
  }
  /* two or three lines at a time; the words light up as he says them, then the next lines take their place */
  function chunk(text, then) {
    var p = $('#sdP'); if (!p) return;
    var el = $('#cside');
    p.classList.add('swap');
    later(function () {
      if (!$('#sdP')) return;
      p.innerHTML = text.split(/\s+/).map(function (w) { return '<span>' + esc(w) + '</span>'; }).join(' ');
      p.classList.remove('swap');
      el.classList.add('speaking');
      var sp = p.querySelectorAll('span'), n = 0;
      (function tick() {
        if (p !== $('#sdP')) return;
        if (sp[n]) sp[n].classList.add('on');
        if (++n < sp.length) later(tick, 300); else later(function () { el.classList.remove('speaking'); if (then) then(); }, 450);
      })();
    }, 260);
  }
  function buttons(list) {
    var a = $('#sdAct'); if (!a) return;
    a.innerHTML = list.map(function (x, i) { return '<button type="button" class="' + (i ? 'gh' : 'pr') + '" data-a="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
    a.classList.remove('in'); a.offsetWidth; a.classList.add('in');
  }
  function noButtons() { var a = $('#sdAct'); if (a) a.innerHTML = ''; }
  function tapBtn(id) { var b = document.querySelector('#sdAct [data-a="' + id + '"]'); if (b) { b.classList.remove('tap'); b.offsetWidth; b.classList.add('tap'); } }
  function sideClose() {
    var el = $('#cside'); if (el.hidden) return;
    el.classList.add('out'); el.classList.remove('speaking');
    scr().classList.remove('siding');
    later(function () { el.hidden = true; el.innerHTML = ''; }, 560);
    CUR = null;
  }
  /* he says his lines in order, then offers his two answers */
  function converse(o) {
    sideOpen(o); noButtons();
    var cs = o.say.slice();
    (function next() {
      var c = cs.shift(); if (!c) return;
      chunk(c, function () { if (cs.length) later(next, 700); else buttons(o.btn || [['ok', 'Got it'], ['why', 'Why?']]); });
    })();
  }
  function answer(id) {
    var o = CUR; if (!o) return;
    if (id === 'why' && o.why) { noButtons(); chunk(o.why, function () { buttons([['ok', 'Okay, got it']]); }); return; }
    if (id === 'show' && o.show) { noButtons(); chunk(o.show, function () { $('#sdX').innerHTML = o.ex || ''; buttons([['ok', 'Okay, got it']]); }); return; }
    if (o.reply && o.reply[id]) { noButtons(); chunk(o.reply[id], function () { buttons([['ok', 'Okay']]); }); return; }
    sideClose();
    if (o.after && o.after[id]) later(o.after[id], 600);
  }
  /* every time he speaks it goes into his list, to play again later */
  function logTip(o) {
    if (!o.t || o.replay) return;
    var ST = H.ST; ST.tips = ST.tips || [];
    if (ST.tips.some(function (x) { return x.id === o.id; })) return;
    ST.tips.push({ id: o.id, t: o.t, at: o.at, len: secs(o), o: o });
    ST.tipNew = o.id; H.updateCoach();
  }
  /* ---------- the scenes he talks about ---------- */
  function kick2(notes) {
    scene('kick', '<div class="kk">' +
      '<div class="kv"><img src="' + JORDAN.img + '" alt=""><span class="onair"><i></i>Live</span><span class="nm">' + JORDAN.name + ' · Your manager</span></div>' +
      '<div class="kb"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h2>' + esc(SC.title) + '</h2><p>Get every new host lead to the right rep in under two minutes.</p>' +
      '<div class="kn"><span>Your notes</span><p id="kn"></p></div></div></div>');
  }
  function note(line) { var k = $('#kn'); if (k) k.insertAdjacentHTML('beforeend', '<i>' + esc(line) + '</i>'); }
  function pop() {
    scene('rev', '<div class="pp"><div class="rv-h"><img src="' + JORDAN.img + '" alt=""><span><b>' + JORDAN.name + '</b><em>Say it back · ' + esc(SC.title) + '</em></span></div>' +
      '<p class="pp-q">Before you build: in your own words, what are we solving?</p>' +
      '<div class="pp-a"><span class="mic"><i></i></span><p id="ppA"></p></div><p class="pp-r" id="ppR"></p></div>');
  }
  function popSay(text, done) {
    var el = $('#ppA'), i = 0; if (!el) return;
    (function tick() { if (!$('#ppA')) return; el.textContent = text.slice(0, ++i); if (i < text.length) later(tick, 22); else later(done || function () {}, 300); })();
  }
  function walkBtn() {
    var rv = document.querySelector('.rv'); if (!rv) return;
    rv.insertAdjacentHTML('beforeend', '<button type="button" class="rv-co" id="rvCo"><img src="' + H.coach().img + '" alt=""><span>Walk me through it</span><em>' + H.coach().name + ' · 0:14</em></button>');
  }
  function tapWalk() { var b = $('#rvCo'); if (b) { b.classList.remove('tap'); b.offsetWidth; b.classList.add('tap'); } }
  function tapStart() { var b = document.querySelector('#card .btn'); if (b) { b.classList.remove('tap'); b.offsetWidth; b.classList.add('tap'); } }

  /* ---------- what he says: two or three lines at a time ---------- */
  var SAY = {
    hi: { id: 'hi', t: 'Hey, I am your coach', at: 'Your first scenario',
      say: ['Hey Maya, I’m Navid. I’m your coach, all the way to GTM Engineer at OpenAI.', 'Jordan runs this project. I only step in when a tip gets you there faster.'],
      why: 'People who follow my tips reach Level 1 in about a week. On their own, it takes two.', btn: [['ok', 'Got it'], ['why', 'Why a coach?']] },
    notes: { id: 'notes', t: 'Take notes in every kickoff', at: 'Kickoff',
      say: ['Quick one. You haven’t written a single note yet.', 'Almost nobody does in a kickoff. It’s the best habit in this job.'],
      why: 'By the middle of a project you forget half of the kickoff. Your notes are what you build from.' },
    back: { id: 'back', t: 'Why we say it back', at: 'Before you say it back',
      say: ['Next, Jordan asks you to say it back.', 'Use your notes: the number, the goal, the deadline.'],
      why: 'So you both agree on the problem before you build. People with notes pass it the first time.' },
    ai: { id: 'ai', t: 'Use AI the way they do', at: 'While you work',
      say: ['You haven’t opened Claude in forty minutes.', 'Draft the routing rules with it, then check every one yourself.'],
      why: 'That’s how GTM engineers at OpenAI work. Same quality, in half the time.' },
    walk: { id: 'walk', t: 'What moves Meeting to Exceeding', at: 'After your review',
      say: ['Jordan gave you Meeting. That’s a thousand skill points, and a good start.', 'Two changes make it Exceeding: a number in every update, and your test results with the work.', 'Do both at Uber and it pays two thousand. That’s Level 3 in one go.'],
      btn: [['ok', 'Got it']] },
    l1: { id: 'l1', t: 'Level 1, faster than most', at: 'Level 1',
      say: ['Level 1, in five days. Most people take two weeks.', 'Twelve roles just opened for you, and two of them are in Austin.'], btn: [['ok', 'Got it']] },
    pattern: { id: 'pattern', t: 'The one thing before Stripe', at: 'Before Stripe',
      say: ['Before Stripe, one thing.', 'Twice now, Jordan had to chase you for a date. That’s what keeps you at Meeting.'],
      btn: [['show', 'Show me'], ['later', 'Not now']],
      show: 'Write every update in three parts: what you did, what you found, what you need.',
      ex: '<div class="sd-ex"><span>Like this</span><p>The router is tested on 50 leads. Two lead types had no owner, so I fixed them. Can you review it by 4pm?</p></div>' },
    pace: { id: 'pace', t: 'Back on pace', at: 'Day 6',
      say: ['You said an hour a day, and yesterday you missed it. That’s fine.', 'One short scenario today keeps you on track for December 4.'],
      btn: [['go', 'Start Stripe'], ['later', 'Not today']] },
    fb: { id: 'fb', t: 'How is Zero going for you?', at: 'Day 9',
      say: ['Quick one, Maya. How is Zero going for you so far?'],
      btn: [['good', 'Loving it'], ['meh', 'Could be better']],
      reply: { good: 'Thank you. I read every one of these, and so does the team.', meh: 'Thank you for saying it. Tell me more in my panel, and the team will see it.' } }
  };

  /* ---------- the moments, from the first scenario on ---------- */
  function S_(cap, d, go) { return { cap: cap, d: d, go: go }; }
  /* a conversation as steps: he talks, she answers, the app comes back */
  function talkSteps(o, caps, pick) {
    var out = [S_(caps[0], dTalk(o), function () { tapChip(); converse(o); })];
    if (pick && (pick === 'why' || pick === 'show')) {
      var t = pick === 'why' ? o.why : o.show;
      out.push(S_(caps[1], dChunk(t) + 900, function () { tapBtn(pick); later(function () { answer(pick); }, 250); }));
      out.push(S_(caps[2] || 'Then back to work.', 1600, function () { tapBtn('ok'); later(function () { answer('ok'); }, 250); }));
    } else if (pick && o.reply && o.reply[pick]) {
      out.push(S_(caps[1], dChunk(o.reply[pick]) + 900, function () { tapBtn(pick); later(function () { answer(pick); }, 250); }));
      out.push(S_(caps[2] || 'Back home.', 1600, function () { tapBtn('ok'); later(function () { answer('ok'); }, 250); }));
    } else {
      out.push(S_(caps[1] || 'Then back to work.', 1600, function () { tapBtn(pick || 'ok'); later(function () { answer(pick || 'ok'); }, 250); }));
    }
    return out;
  }
  var MOMENTS = [
    { k: 'Meet your coach', done: 0, tips: [SAY.hi], steps: function () { return [
      S_('Onboarding is done. Maya starts her first scenario, Airbnb.', 2000, function () { tapStart(); }),
      S_('As the kickoff opens, her coach’s face starts to blink.', 2600, function () { kick2(); later(function () { pulse(SAY.hi); }, 700); })
    ].concat(talkSteps(SAY.hi, ['She taps it. The app moves aside and he talks.', 'She asks why she needs a coach.', 'Back to the kickoff.'], 'why')); } },
    { k: 'Kickoff', done: 0, tips: [SAY.notes], steps: function () { return [
      S_('Jordan is briefing her. She is listening, not writing.', 3000, function () { kick2(); later(function () { pulse(SAY.notes); }, 1600); })
    ].concat(talkSteps(SAY.notes, ['She taps his face.', 'She asks why.', 'Back to the kickoff. Now she takes notes.'], 'why')).concat([
      S_('Her notes fill in as Jordan talks.', 3800, function () { later(function () { note('1,200 host leads a month'); }, 400); later(function () { note('26 hours to a first reply'); }, 1500); later(function () { note('Goal: under 2 minutes, right rep'); }, 2600); })
    ]); } },
    { k: 'Say it back', done: 0, tips: [SAY.back], steps: function () { return [
      S_('The kickoff ends. One quick tip before she says it back.', 2400, function () { kick2(); note('1,200 host leads a month'); note('26 hours to a first reply'); note('Goal: under 2 minutes, right rep'); later(function () { pulse(SAY.back); }, 900); })
    ].concat(talkSteps(SAY.back, ['She taps it.', 'Got it. She says it back, from her notes.'])).concat([
      S_('Jordan agrees. She is ready to build.', 6200, function () {
        later(pop, 200);
        later(function () { popSay('Host leads wait 26 hours for a reply. We need every one of the 1,200 a month to reach the right rep in under two minutes.', function () { var r = $('#ppR'); if (r) r.innerHTML = '<img src="' + JORDAN.img + '" alt="">Exactly. Go build it.'; }); }, 700);
      })
    ]); } },
    { k: 'Working', done: 0, tips: [SAY.ai], steps: function () { return [
      S_('The workspace. Jordan runs this part. Her coach stays out of it.', 4200, function () {
        work(); H.setStage(0, 2); part(0, 'done'); part(1, 'cur');
        later(function () { jordan('Kickoff done. What do you need from me to start?'); }, 300);
        later(function () { typeIn('Hi Jordan, I need HubSpot admin to build the router. Could you add me today?', function () { press(); sent('Hi Jordan, I need HubSpot admin to build the router. Could you add me today?'); later(function () { jordan('Done, you are in.'); }, 500); }); }, 1300);
      }),
      S_('Forty minutes in, no AI. His face blinks, and waits for her.', 3000, function () { sys('Maya is building the router in n8n.'); later(function () { pulse(SAY.ai); }, 600); })
    ].concat(talkSteps(SAY.ai, ['She taps it when she is ready.', 'Back to work, with Claude.'])).concat([
      S_('She carries on, faster.', 2400, function () { sys('Maya drafted the routing rules with Claude, then checked each one.'); })
    ]); } },
    { k: 'Review', done: 0, tips: [SAY.walk], steps: function () { return [
      S_('Jordan’s review: Meeting. 1,000 skill points.', 3400, function () { review(2, 'Every lead in the test reached the right rep.', 'Give a date the first time I ask.'); later(walkBtn, 1400); }),
      S_('She asks her coach to walk her through it.', dTalk(SAY.walk), function () { tapWalk(); later(function () { converse(SAY.walk); }, 300); }),
      S_('Two changes for next time.', 1600, function () { tapBtn('ok'); later(function () { answer('ok'); }, 250); })
    ]; } },
    { k: 'Level 1', done: 1, tips: [SAY.l1], steps: function () { return [
      S_('Level 1.', 3200, function () { lvup(1); }),
      S_('His face blinks.', 1600, function () { pulse(SAY.l1); })
    ].concat(talkSteps(SAY.l1, ['She taps it.', 'Back home.'])); } },
    { k: 'Before Stripe', done: 2, tips: [SAY.pattern], steps: function () { return [
      S_('Two projects done. Before her third, he has one thing.', 2400, function () { pulse(SAY.pattern); })
    ].concat(talkSteps(SAY.pattern, ['She taps it.', 'She asks him to show her.', 'Then she starts Stripe.'], 'show')).concat([
      S_('Stripe.', 1400, function () { tapStart(); })
    ]); } },
    { k: 'Day 6', done: 2, tips: [SAY.pace], steps: function () { return [
      S_('Day 6. She missed yesterday.', 2200, function () { pulse(SAY.pace); })
    ].concat(talkSteps(SAY.pace, ['A nudge, not a lecture.', 'She starts Stripe.'], 'go')).concat([
      S_('Back on pace.', 1400, function () { tapStart(); })
    ]); } },
    { k: 'Day 9', done: 3, tips: [SAY.fb], steps: function () { return [
      S_('Day 9. He asks how it is going.', 2200, function () { pulse(SAY.fb); })
    ].concat(talkSteps(SAY.fb, ['She taps it.', 'She answers in one tap.', 'Back home.'], 'good')); } },
    { k: 'You ask', done: 3, tips: [], steps: function () { return [
      S_('Any time, she can open her coach herself.', 3000, function () { tapChip(); H.openTab('coach'); }),
      S_('Every note is there to play again. She replays the one before Stripe.', 2400, function () { var r = document.querySelector('[data-tip-i="' + idx('pattern') + '"]'); if (r) { r.classList.remove('tap'); r.offsetWidth; r.classList.add('tap'); } }),
      S_('His tip again, whenever she needs it.', dTalk(SAY.pattern), function () { replay(idx('pattern')); }),
      S_('That is her coach: a face, a voice, a few lines, then back to work.', 2400, function () { tapBtn('later'); later(function () { answer('later'); }, 250); later(function () { H.openTab('level'); }, 800); })
    ]; } }
  ];
  function idx(id) { var t = H.ST.tips || []; for (var i = 0; i < t.length; i++) if (t[i].id === id) return i; return 0; }

  /* replay a note from his list, or tell him how it is going */
  function replay(i) { var t = (H.ST.tips || [])[i]; if (!t) return; H.setOpen(false); converse(Object.assign({}, t.o, { replay: true })); }
  J.replay = function (i) { replay(i); };
  J.feedback = function () { H.setOpen(false); converse(Object.assign({}, SAY.fb, { replay: true })); };
  /* by hand: tap his blinking face, answer him */
  document.getElementById('cside').addEventListener('click', function (e) { e.stopPropagation(); var b = e.target.closest('[data-a]'); if (b && !J.playing) answer(b.dataset.a); });
  document.getElementById('chipMe').addEventListener('click', function (e) {
    if (J.playing || !$('#chipMe').classList.contains('lit') || CUR) return;
    var m = MOMENTS[J.m], o = m && m.tips && m.tips[0];
    if (o) { e.stopImmediatePropagation(); H.setOpen(false); converse(o); }
  }, true);

  /* ---------- where each moment starts ---------- */
  function at(done) {
    clear(); H.clearAll(); H.reset('mid'); H.coachOn(true);
    for (var i = 0; i < done; i++) H.quiet('mid', i);
    H.ST.cur = Math.min(done, D.SCENARIOS.length - 1); H.ST.stage = 0;
    H.ST.pace = '1 hour';
    H.ST.tips = [];
    for (var m = 0; m < J.m; m++) (MOMENTS[m].tips || []).forEach(function (o) { H.ST.tips.push({ id: o.id, t: o.t, at: o.at, len: secs(o), o: o }); });
    H.refresh();
    homeView(); H.setOpen(false); unpulse();
    $('#lvup').hidden = true; var cs = $('#cside'); cs.hidden = true; cs.innerHTML = ''; scr().classList.remove('siding'); CUR = null;
  }

  /* ---------- the player ---------- */
  function playFrom(m, all) {
    J.m = m; J.all = all; J.playing = true; J.steps = MOMENTS[m].steps(); J.i = 0;
    at(MOMENTS[m].done);
    drawBar(); run();
  }
  function run() {
    if (!J.playing) return;
    if (J.i >= J.steps.length) {
      if (J.all && J.m < MOMENTS.length - 1) { J.t = setTimeout(function () { playFrom(J.m + 1, true); }, 900 / J.speed); return; }
      J.playing = false; drawBar(); return;
    }
    var s = J.steps[J.i++];
    J.cap = s.cap; drawBar();
    s.go();
    J.t = setTimeout(run, s.d / J.speed);
  }
  function toggle() {
    if (!J.steps.length) { playFrom(0, true); return; }
    J.playing = !J.playing; if (J.playing) run(); else clearTimeout(J.t);
    drawBar();
  }
  function skip() { clearTimeout(J.t); J.playing = true; run(); }
  J.drawBar = drawBar;
  J.onFinish = function () {};
  function drawBar() {
    var tl = $('#tl');
    if (tl) tl.innerHTML = MOMENTS.map(function (m, i) {
      return '<button type="button" data-m="' + i + '" class="' + (i === J.m ? 'on' : i < J.m ? 'past' : '') + '"><i></i><span>' + m.k + '</span></button>';
    }).join('');
    var r = $('#run'); if (!r) return;
    r.innerHTML = '<span class="st cap">' + esc(J.cap || 'Press play to see the coach, from the first scenario on.') + '</span>' +
      '<button type="button" data-jr="play" aria-label="' + (J.playing ? 'Pause' : 'Play') + '">' + (J.playing ? I.pause : I.play) + '</button>' +
      '<button type="button" data-jr="next" aria-label="Next step">' + I.next + '</button>' +
      '<button type="button" data-jr="again" aria-label="Start over">' + I.again + '</button>' +
      '<button type="button" class="sp" data-jr="speed">' + J.speed + 'x</button>';
    var v = $('#variant'); if (v) v.innerHTML = '';
  }
  document.getElementById('dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.jr === 'play') toggle();
    if (b.dataset.jr === 'next') skip();
    if (b.dataset.jr === 'again') playFrom(0, true);
    if (b.dataset.jr === 'speed') { J.speed = J.speed >= 2 ? 1 : J.speed * 2; drawBar(); }
  });
  document.getElementById('tl').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) playFrom(+b.dataset.m, false); });

  J.m = 0; J.steps = []; J.speed = 1;
  at(0); drawBar();
  try { var q = new URLSearchParams(location.search); if (q.get('play') === '1') playFrom(0, true); else if (q.get('m')) playFrom(+q.get('m'), false); } catch (e) {}
  window.__ready = true;
})();
