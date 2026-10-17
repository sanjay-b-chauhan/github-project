/* The journey coach, b15. One learner from day one, in the real app. Navid is the face of Zero: grey in the corner when he has
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
     The journey coach. Navid is the face of Zero. He is not inside the project: Jordan runs the project.
     He sits in the corner, grey when he has nothing, lit when he has something. Tap him and the app slides aside:
     a black screen, his face, his words as he says them, then back to where you were.
     He shows up at the moments that change how fast you level up, across the whole journey.
     ================================================================ */
  var NAVID = H.coach();
  var TL = [];
  function words(t) { return t.split(/\s+/).length; }
  function dTalk(t) { return 900 + words(t) * 330; }
  function secs(t) { var n = Math.max(4, Math.round(words(t) / 2.6)); return '0:' + String(n).padStart(2, '0'); }

  /* his face lights up in the corner, with a voice note beside it */
  function pulse(t, len) {
    var C = H.coach(), v = $('#vnote');
    $('#chipMe').classList.add('lit');
    v.innerHTML = '<span class="vn-w"><i></i><i></i><i></i><i></i><i></i></span><b>' + esc(t) + '</b><em>' + len + '</em>';
    v.hidden = false; v.classList.remove('out');
  }
  function unpulse() { $('#chipMe').classList.remove('lit'); var v = $('#vnote'); if (!v.hidden) { v.classList.add('out'); later(function () { v.hidden = true; }, 260); } }
  function tapChip() { var c = $('#chipMe'); c.classList.remove('tap'); c.offsetWidth; c.classList.add('tap'); }

  /* the takeover: the app slides aside, he talks, it slides back */
  var T = null;
  function talk(o) {
    unpulse();
    var C = H.coach(), el = $('#cstage');
    T = o;
    el.innerHTML = '<div class="cs-in"><div class="cs-face"><img src="' + C.img + '" alt=""><i class="ring"></i></div>' +
      '<div class="cs-who"><b>' + C.name + '</b><span>' + esc(o.at) + '</span></div>' +
      '<p class="cs-cap" id="csCap"></p><div class="cs-x" id="csX"></div>' +
      '<div class="cs-au"><button type="button" class="cs-pl" aria-label="Pause">' + I.pause + '</button><span class="cs-wv">' + Array(29).join('<i></i>') + '</span><span class="cs-tm" id="csTm">0:00</span></div>' +
      '<div class="cs-act" id="csAct"></div></div>';
    el.hidden = false; el.classList.remove('out');
    scr().classList.add('coaching');
    say(o.say);
    acts(o.acts || [['ok', 'Got it']]);
    if (o.extra) $('#csX').innerHTML = o.extra;
    logTip(o);
  }
  /* his words appear as he says them */
  function say(t) {
    var cap = $('#csCap'); if (!cap) return;
    var w = t.split(/\s+/);
    cap.innerHTML = w.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' ');
    var spans = cap.querySelectorAll('span'), n = 0, el = $('#cstage'), tm = $('#csTm'), t0 = Date.now();
    el.classList.add('speaking');
    (function tick() {
      if (!$('#csCap') || cap !== $('#csCap')) return;
      if (spans[n]) spans[n].classList.add('on');
      n++;
      var s = Math.round((Date.now() - t0) / 1000 * J.speed); if (tm) tm.textContent = '0:' + String(s).padStart(2, '0');
      if (n < spans.length) later(tick, 330); else later(function () { el.classList.remove('speaking'); }, 400);
    })();
  }
  function acts(list) {
    var a = $('#csAct'); if (!a) return;
    a.innerHTML = list.map(function (x, i) { return '<button type="button" class="' + (i ? 'gh' : 'pr') + '" data-a="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
  }
  function tapAct(id) { var b = document.querySelector('#csAct [data-a="' + id + '"], #csX [data-a="' + id + '"]'); if (b) { b.classList.remove('tap'); b.offsetWidth; b.classList.add('tap'); } }
  function close() {
    var el = $('#cstage'); el.classList.add('out'); el.classList.remove('speaking');
    scr().classList.remove('coaching');
    later(function () { el.hidden = true; el.innerHTML = ''; }, 520);
    T = null;
  }
  /* every time he speaks it goes into his list, to play again later */
  function logTip(o) {
    if (!o.t || o.replay) return;
    var ST = H.ST; ST.tips = ST.tips || [];
    if (ST.tips.some(function (x) { return x.id === o.id; })) return;
    ST.tips.push({ id: o.id, t: o.t, at: o.at, len: secs(o.say), o: o });
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

  /* ---------- where each moment starts, so any of them can be opened on its own ---------- */
  function at(done) {
    clear(); H.clearAll(); H.reset('mid'); H.coachOn(true);
    for (var i = 0; i < done; i++) H.quiet('mid', i);
    H.ST.cur = Math.min(done, D.SCENARIOS.length - 1); H.ST.stage = 0;
    H.ST.pace = J.pace || '1 hour';
    H.ST.tips = TIPS_BEFORE(J.m);
    H.refresh();
    homeView(); H.setOpen(false); unpulse();
    $('#lvup').hidden = true; $('#cstage').hidden = true; scr().classList.remove('coaching');
  }
  function TIPS_BEFORE(m) {
    var out = [];
    for (var i = 0; i < m; i++) (MOMENTS[i].tips || []).forEach(function (o) { out.push({ id: o.id, t: o.t, at: o.at, len: secs(o.say), o: o }); });
    return out;
  }

  /* ---------- what he says ---------- */
  var SAY = {
    hi: { id: 'hi', t: 'Hi, I am your coach', at: 'Day 1',
      say: 'Hi Maya, I am Navid. I will be with you all the way to GTM Engineer at OpenAI. Jordan runs your projects. I am on your team. People who follow my tips reach Level 1 in about seven days. On their own, it takes about fifteen. So, how much time can you give me each day?' },
    pace: { say: 'One hour a day. Then you reach Level 10 around December 4. I will keep you on that pace.' },
    notes: { id: 'notes', t: 'Take notes in every kickoff', at: 'Before your first kickoff',
      say: 'Before you join Jordan, one trick. Take notes. Almost nobody does in a kickoff, and it is the best habit in this industry. By the middle of a project you will have forgotten half of what he said.' },
    notesWhy: { say: 'Your notes are what you build from. And the next step asks you to say the problem back. People with notes pass that the first time.' },
    back: { id: 'back', t: 'Why we say it back', at: 'Before the understanding check',
      say: 'Next, Jordan asks you to say it back. We do this so you both agree on the problem before you build anything. Use your notes. Say the number, the goal and the deadline.' },
    ai: { id: 'ai', t: 'Use AI the way they do', at: 'While you work',
      say: 'You have not opened Claude in forty minutes. GTM engineers at OpenAI use it all day. Draft the routing rules with it, then check every one yourself. That is how the best ones work.' },
    walk: { id: 'walk', t: 'What moves Meeting to Exceeding', at: 'After your first review',
      say: 'Jordan gave you Meeting. That is a thousand skill points, and it is a good start. Two changes make it Exceeding next time. Put the number in every update. And send your test results with the work. Do both at Uber and it pays two thousand. That is Level 3 in one go.' },
    l1: { id: 'l1', t: 'Level 1, faster than most', at: 'Level 1',
      say: 'Level 1, in five days. Most people take fifteen. Twelve roles just opened for you, and two of them are in Austin. Keep this pace.' },
    pattern: { id: 'pattern', t: 'A two minute drill on updates', at: 'Day 4',
      say: 'I have watched two projects now. Twice, Jordan had to chase you for a date. That is the one thing between you and Exceeding. Want to practise it with me? It takes two minutes.' },
    drill: { say: 'Here is one of yours. Rewrite it with three parts: what you did, what you found, what you need.' },
    drillOk: { say: 'That is it. Send that at Stripe and Jordan will not need to ask. That is how Exceeding sounds.' },
    paceOff: { id: 'paceoff', t: 'Back on pace', at: 'Day 6',
      say: 'You said one hour a day, and yesterday you missed it. That is fine. One short scenario today keeps you on track for December 4.' },
    fb: { id: 'fb', t: 'How is Zero going for you?', at: 'Day 9',
      say: 'Quick one, Maya. How is Zero going for you so far? Tell me straight. I read every one of these, and so does the team.' },
    fbOk: { say: 'Thank you. That is exactly what we needed to hear. I have passed it to the team.' }
  };

  /* ---------- the moments, in order ---------- */
  function S_(cap, d, go) { return { cap: cap, d: d, go: go }; }
  var MOMENTS = [
    { k: 'Day 1', done: 0, tips: [SAY.hi], steps: function () { return [
      S_('Day 1. Maya finishes onboarding. Her coach is grey: nothing yet.', 2400, function () { }),
      S_('His face lights up. He has something.', 2600, function () { pulse('Hi, I am your coach', secs(SAY.hi.say)); }),
      S_('She taps it. The app steps aside and he talks.', dTalk(SAY.hi.say), function () { tapChip(); talk(Object.assign({}, SAY.hi, { acts: [], extra: '<div class="cs-ch">' + ['30 minutes', '1 hour', '2 hours'].map(function (x) { return '<button type="button" data-a="' + x + '">' + x + '</button>'; }).join('') + '</div>' })); }),
      S_('She commits to one hour a day.', dTalk(SAY.pace.say), function () { tapAct('1 hour'); J.pace = '1 hour'; H.ST.pace = '1 hour'; later(function () { $('#csX').innerHTML = ''; say(SAY.pace.say); acts([['ok', 'Let us go']]); }, 400); }),
      S_('Back to the app.', 1500, function () { tapAct('ok'); later(close, 250); })
    ]; } },
    { k: 'Kickoff', done: 0, tips: [SAY.notes], steps: function () { return [
      S_('She starts her first scenario, Airbnb.', 1600, function () { tapStart(); }),
      S_('Before the kickoff, her coach takes the screen.', dTalk(SAY.notes.say), function () { talk(Object.assign({}, SAY.notes, { acts: [['ok', 'Got it'], ['why', 'Why does it matter?']] })); }),
      S_('She asks why.', dTalk(SAY.notesWhy.say), function () { tapAct('why'); later(function () { say(SAY.notesWhy.say); acts([['ok', 'Got it']]); }, 350); }),
      S_('Then the kickoff with Jordan. She takes notes.', 5200, function () {
        tapAct('ok'); later(close, 250); later(kick2, 500);
        later(function () { note('1,200 host leads a month'); }, 1600); later(function () { note('26 hours to a first reply'); }, 2600); later(function () { note('Goal: under 2 minutes, right rep'); }, 3600);
      })
    ]; } },
    { k: 'Say it back', done: 0, tips: [SAY.back], steps: function () { return [
      S_('Before the understanding check, he explains why it exists.', dTalk(SAY.back.say), function () { kick2(); note('1,200 host leads a month'); note('26 hours to a first reply'); note('Goal: under 2 minutes, right rep'); later(function () { talk(SAY.back); }, 400); }),
      S_('She says it back, from her notes.', 6200, function () {
        tapAct('ok'); later(close, 250); later(pop, 500);
        later(function () { popSay('Host leads wait 26 hours for a reply. We need every one of the 1,200 a month to reach the right rep in under two minutes.', function () { var r = $('#ppR'); if (r) r.innerHTML = '<img src="' + JORDAN.img + '" alt="">Exactly. Go build it.'; }); }, 900);
      })
    ]; } },
    { k: 'Working', done: 0, tips: [SAY.ai], steps: function () { return [
      S_('The workspace. Jordan runs this part. Her coach stays out of it.', 4200, function () {
        work(); H.setStage(0, 2); part(0, 'done'); part(1, 'cur');
        later(function () { jordan('Kickoff done. What do you need from me to start?'); }, 300);
        later(function () { typeIn('Hi Jordan, I need HubSpot admin to build the router. Could you add me today?', function () { press(); sent('Hi Jordan, I need HubSpot admin to build the router. Could you add me today?'); later(function () { jordan('Done, you are in.'); }, 500); }); }, 1300);
      }),
      S_('Forty minutes in, no AI. His face lights up. It waits for her.', 3200, function () { sys('Maya is building the router in n8n.'); later(function () { pulse('Use AI the way they do', secs(SAY.ai.say)); }, 600); }),
      S_('She taps it when she is ready.', dTalk(SAY.ai.say), function () { tapChip(); talk(SAY.ai); }),
      S_('Back to work, with Claude.', 2600, function () { tapAct('ok'); later(close, 250); later(function () { sys('Maya drafted the routing rules with Claude, then checked each one.'); }, 700); })
    ]; } },
    { k: 'Review', done: 0, tips: [SAY.walk], steps: function () { return [
      S_('Jordan’s review: Meeting. 1,000 skill points.', 3600, function () { review(2, 'Every lead in the test reached the right rep.', 'Give a date the first time I ask.'); later(walkBtn, 1500); }),
      S_('She asks her coach to walk her through it.', dTalk(SAY.walk.say), function () { tapWalk(); later(function () { talk(SAY.walk); }, 350); }),
      S_('Two changes for next time.', 1500, function () { tapAct('ok'); later(close, 250); })
    ]; } },
    { k: 'Level 1', done: 1, tips: [SAY.l1], steps: function () { return [
      S_('Level 1.', 3300, function () { lvup(1); }),
      S_('He tells her what it means.', dTalk(SAY.l1.say), function () { pulse('Level 1, faster than most', secs(SAY.l1.say)); later(function () { tapChip(); talk(SAY.l1); }, 1200); }),
      S_('Back home.', 1500, function () { tapAct('ok'); later(close, 250); })
    ]; } },
    { k: 'Day 4', done: 2, tips: [SAY.pattern], steps: function () { return [
      S_('Day 4. Two projects done. He has spotted a pattern.', 2600, function () { pulse('A two minute drill on updates', secs(SAY.pattern.say)); }),
      S_('She taps it.', dTalk(SAY.pattern.say), function () { tapChip(); talk(Object.assign({}, SAY.pattern, { acts: [['go', 'Practise now'], ['later', 'Later']] })); }),
      S_('A two minute drill, with him.', dTalk(SAY.drill.say) + 5600, function () {
        tapAct('go');
        later(function () {
          say(SAY.drill.say); acts([]);
          $('#csX').innerHTML = '<div class="dr"><p class="dr-o">soon</p><div class="dr-f"><div><span>What I did</span><p id="d1"></p></div><div><span>What I found</span><p id="d2"></p></div><div><span>What I need</span><p id="d3"></p></div></div></div>';
          var lines = [['d1', 'The router is built and tested on 50 leads.'], ['d2', 'Two lead types had no owner. Fixed.'], ['d3', 'Your review by 4pm today.']];
          lines.forEach(function (l, i) { later(function () { var e = $('#' + l[0]), n = 0; (function tk() { if (!e) return; e.textContent = l[1].slice(0, ++n); if (n < l[1].length) later(tk, 24); })(); }, dTalk(SAY.drill.say) - 600 + i * 1700); });
        }, 400);
      }),
      S_('He tells her she has it.', dTalk(SAY.drillOk.say), function () { say(SAY.drillOk.say); acts([['ok', 'Got it']]); var o = document.querySelector('.dr-o'); if (o) o.classList.add('x'); }),
      S_('Back home.', 1500, function () { tapAct('ok'); later(close, 250); })
    ]; } },
    { k: 'Day 6', done: 2, tips: [SAY.paceOff], steps: function () { return [
      S_('Day 6. She missed yesterday.', 2400, function () { pulse('Back on pace', secs(SAY.paceOff.say)); }),
      S_('A nudge, not a lecture.', dTalk(SAY.paceOff.say), function () { tapChip(); talk(Object.assign({}, SAY.paceOff, { acts: [['go', 'Start Stripe now'], ['pace', 'Change my pace']] })); }),
      S_('She starts Stripe.', 1800, function () { tapAct('go'); later(close, 250); later(tapStart, 900); })
    ]; } },
    { k: 'Day 9', done: 3, tips: [SAY.fb], steps: function () { return [
      S_('Day 9. He asks how it is going.', dTalk(SAY.fb.say), function () { pulse('How is Zero going for you?', secs(SAY.fb.say)); later(function () { tapChip(); talk(Object.assign({}, SAY.fb, { acts: [], extra: fbBox() })); }, 1200); }),
      S_('She tells him.', 4800, function () {
        tapAct('Loving it');
        var t = 'The projects feel real. I wish I had known sooner what Exceeding looks like.', e = $('#fbT'), n = 0;
        later(function () { (function tk() { if (!e) return; e.textContent = t.slice(0, ++n); if (n < t.length) later(tk, 24); })(); }, 500);
      }),
      S_('He thanks her.', dTalk(SAY.fbOk.say), function () { tapAct('send'); later(function () { $('#csX').innerHTML = ''; say(SAY.fbOk.say); acts([['ok', 'Got it']]); }, 350); }),
      S_('Back home.', 1500, function () { tapAct('ok'); later(close, 250); })
    ]; } },
    { k: 'You ask', done: 3, tips: [], steps: function () { return [
      S_('Any time. She opens her coach herself.', 3200, function () { tapChip(); H.openTab('coach'); }),
      S_('Every voice note is there to play again. She replays the drill.', 3000, function () { var r = document.querySelector('[data-tip-i="' + idx('pattern') + '"]'); if (r) { r.classList.remove('tap'); r.offsetWidth; r.classList.add('tap'); } }),
      S_('His tip again, whenever she needs it.', dTalk(SAY.pattern.say), function () { replay(idx('pattern')); }),
      S_('That is the coach: a face, a voice, at the moments that matter.', 2600, function () { tapAct('ok'); later(close, 250); later(function () { H.openTab('level'); }, 700); })
    ]; } }
  ];
  function idx(id) { var t = H.ST.tips || []; for (var i = 0; i < t.length; i++) if (t[i].id === id) return i; return 0; }
  function fbBox() {
    return '<div class="fbx"><div class="cs-ch">' + ['Loving it', 'It is okay', 'Confusing'].map(function (x) { return '<button type="button" data-a="' + x + '">' + x + '</button>'; }).join('') + '</div>' +
      '<div class="fbt"><p id="fbT"></p><button type="button" data-a="send">Send</button></div></div>';
  }

  /* replay a voice note from his list, or open feedback from the panel */
  function replay(i) {
    var t = (H.ST.tips || [])[i]; if (!t) return;
    H.setOpen(false);
    talk(Object.assign({}, t.o, { replay: true, acts: [['ok', 'Got it']], extra: '' }));
  }
  J.replay = function (i) { replay(i); };
  J.feedback = function () { H.setOpen(false); talk(Object.assign({}, SAY.fb, { replay: true, acts: [['ok', 'Send']], extra: fbBox() })); };
  /* clicks on the stage, for when someone uses it by hand */
  document.getElementById('cstage').addEventListener('click', function (e) {
    e.stopPropagation();
    var b = e.target.closest('[data-a]'); if (!b || J.playing) return;
    var a = b.dataset.a;
    if (a === 'ok' || a === 'later' || a === 'go' || a === 'pace' || a === 'send') { close(); return; }
    if (a === 'why' && T && T.id === 'notes') { say(SAY.notesWhy.say); acts([['ok', 'Got it']]); return; }
    if (/hour|minutes/.test(a)) { J.pace = a; H.ST.pace = a; H.updateCoach(); $('#csX').innerHTML = ''; say(SAY.pace.say.replace('One hour', a.charAt(0).toUpperCase() + a.slice(1)).replace('December 4', { '30 minutes': 'December 22', '1 hour': 'December 4', '2 hours': 'November 21' }[a])); acts([['ok', 'Let us go']]); return; }
    b.classList.add('on');
  });
  document.getElementById('chipMe').addEventListener('click', function (e) {
    if (J.playing) return;
    var v = $('#vnote');
    if ($('#chipMe').classList.contains('lit') && T === null) {
      var m = MOMENTS[J.m]; var o = m && m.tips && m.tips[0];
      if (o) { e.stopImmediatePropagation(); H.setOpen(false); talk(o); }
    }
  }, true);

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
      J.playing = false; J.cap = J.m === MOMENTS.length - 1 ? 'From day one, all the way to the job.' : J.cap; drawBar(); return;
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
    r.innerHTML = '<span class="st cap">' + esc(J.cap || 'Press play to see the coach at every moment.') + '</span>' +
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
