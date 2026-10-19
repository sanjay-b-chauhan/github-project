/* The coach, b18. One flow: Sanjay's first scenario, start to the end of day one.
   Navid is on Sanjay's side, for the whole road to the job. Jay runs the project. Navid never opens by himself:
   his face pulses (coral when something is off, green when it is good) and Sanjay clicks when ready.
   The whole app shifts left and his panel takes the right 30%: a timer ring around his face, the data he noticed,
   his own voice with the words two or three lines at a time, what good looks like, and what it is worth in skill points. */
(function () {
  'use strict';
  var H = window.__home; if (!H) return;
  var D = H.D, AS = H.AS, esc = H.esc, fmt = H.fmt, ZV = window.ZV || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var J = { run: 0, playing: false, m: 0, cap: '', sound: true, done: false };
  window.__J = J;

  /* the people: the voice says Sanjay and Jay */
  var JAY = H.MGR; JAY.name = 'Jay'; JAY.img = AS + 'img/jay.jpg';
  var SC = D.SCENARIOS[0];
  var I = {
    send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>',
    clip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7.5-5 5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3L6.6 11a1 1 0 0 1-1.5-1.5l4.6-4.6"/></svg>',
    file: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/></svg>',
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>',
    play: '<svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.6 5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="1.5" width="2.2" height="7" rx=".6"/><rect x="5.8" y="1.5" width="2.2" height="7" rx=".6"/></svg>',
    prev: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M10 1.5v9L4.5 6z"/><rect x="1.9" y="1.5" width="1.8" height="9" rx=".5"/></svg>',
    next: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5v9L7.5 6z"/><rect x="8.3" y="1.5" width="1.8" height="9" rx=".5"/></svg>',
    again: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 2v2.5H5"/></svg>',
    snd: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h2.5L9 3v10L5.5 10H3z"/><path d="M11.3 5.6a3.4 3.4 0 0 1 0 4.8M13 4a5.7 5.7 0 0 1 0 8"/></svg>',
    mute: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h2.5L9 3v10L5.5 10H3z"/><path d="m11.5 6.2 3 3.6M14.5 6.2l-3 3.6"/></svg>'
  };

  /* ---------- a run that can be paused, jumped and restarted ---------- */
  function Stop() {}
  function alive(tok) { if (tok !== J.run) throw new Stop(); }
  function wait(ms) {
    var tok = J.run, t = 0;
    return new Promise(function (res, rej) {
      (function tick() {
        if (tok !== J.run) { rej(new Stop()); return; }
        if (J.playing) t += 50;
        if (t >= ms) res(); else setTimeout(tick, 50);
      })();
    });
  }
  function cap(t) { J.cap = t; drawBar(); }

  /* ---------- scenes ---------- */
  var scr = function () { return $('#screen'); };
  function homeView() { var s = $('#scene'); s.hidden = true; s.className = 'scene'; s.innerHTML = ''; scr().classList.remove('insc'); }
  function scene(cls, html) { var s = $('#scene'); s.className = 'scene ' + cls; s.innerHTML = html; s.hidden = false; scr().classList.add('insc'); H.setOpen(false); }
  function kickoff() {
    scene('kick', '<div class="k8"><div class="k8-v"><img src="' + JAY.img + '" alt=""><span class="onair"><i></i>Live</span><span class="nm">Jay · Your manager</span></div>' +
      '<div class="k8-r"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h2>Inbound lead router</h2>' +
      '<div class="k8-slide" id="kSlide"><span>Leads wait</span><b>3 h 10 m</b><em>for a first reply, up from 47 min</em></div>' +
      '<div class="k8-notes"><div class="k8-nh"><span>Meeting notes</span><em id="kCount">0</em></div><ul id="kNotes"></ul></div></div></div>');
  }
  function slide(lbl, big, sub) { var s = $('#kSlide'); if (!s) return; s.classList.add('swap'); setTimeout(function () { s.innerHTML = '<span>' + esc(lbl) + '</span><b>' + esc(big) + '</b><em>' + esc(sub) + '</em>'; s.classList.remove('swap'); }, 220); }
  function note(text, who) {
    var ul = $('#kNotes'); if (!ul) return;
    ul.insertAdjacentHTML('beforeend', '<li class="' + who + '"><span class="tg">' + (who === 'zero' ? 'Zero' : 'You') + '</span><p></p></li>');
    var p = ul.lastChild.querySelector('p'), i = 0;
    (function t() { if (!p.isConnected) return; p.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(t, who === 'me' ? 45 : 14); })();
    var c = $('#kCount'); if (c) c.textContent = ul.children.length;
  }
  function check() {
    scene('rev', '<div class="ck"><div class="rv-h"><img src="' + JAY.img + '" alt=""><span><b>Jay</b><em>Understanding check · 1 of 3</em></span></div>' +
      '<p class="ck-q">In your own words: what is slow leads costing us?</p><div class="ck-a" id="ckA"><p id="ckT"></p><span class="ck-tag" id="ckTag" hidden>Pasted</span></div>' +
      '<div class="ck-f"><button type="button" class="ck-go" id="ckGo">Answer</button></div></div>');
  }
  var AI_TEXT = 'Delayed lead response times can significantly impact conversion rates, as prospects tend to lose interest over time. Organizations that respond faster typically see measurable improvements in pipeline.';
  var PARTS = ['Map the lead flow', 'Build the router', 'Test it on real leads', 'Send the plan'];
  function work() {
    scene('work', '<div class="ws w8">' +
      '<aside class="ws-l"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h3>Inbound lead router</h3><p>Get every inbound lead a first reply in under two minutes.</p>' +
      '<ol class="parts">' + PARTS.map(function (p, i) { return '<li data-p="' + i + '" class="' + (i === 0 ? 'cur' : '') + '"><i>' + I.tick + '</i>' + p + '</li>'; }).join('') + '</ol>' +
      '<div class="tools">' + SC.tools.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></aside>' +
      '<section class="ws-c"><header class="ws-h"><img src="' + JAY.img + '" alt=""><span><b>Jay</b><em>Your manager · ' + D.CO[SC.co] + '</em></span><span class="ws-t" id="wsT"></span></header>' +
      '<div class="msgs" id="msgs"></div>' +
      '<div class="comp" id="comp"><div class="att" id="att"></div><div class="row"><button type="button" class="clip">' + I.clip + '</button>' +
      '<div class="in"><span class="tx" id="tx"></span><span class="ph">Message Jay</span><i class="caret"></i></div>' +
      '<button type="button" class="send" id="send">' + I.send + '</button></div></div></section></div>');
  }
  function push(html) { var m = $('#msgs'); if (!m) return; m.insertAdjacentHTML('beforeend', html); }
  function jay(text) {
    push('<div class="m them typing"><img src="' + JAY.img + '" alt=""><p><span class="dots"><i></i><i></i><i></i></span></p></div>');
    var el = $('#msgs').lastChild;
    return wait(900).then(function () { el.classList.remove('typing'); el.querySelector('p').textContent = text; });
  }
  function sys(text) { push('<div class="m sys"><p>' + esc(text) + '</p></div>'); }
  function sent(text, files) {
    push('<div class="m me">' + (files ? '<div class="fl">' + files.map(function (f) { return '<span>' + I.file + esc(f) + '</span>'; }).join('') + '</div>' : '') + (text ? '<p>' + esc(text) + '</p>' : '') + '</div>');
    $('#tx').textContent = ''; $('#att').innerHTML = ''; $('#comp').classList.remove('has', 'held');
  }
  function type(el, text, speed) {
    var i = 0, tok = J.run;
    return new Promise(function (res, rej) {
      (function t() {
        if (tok !== J.run) { rej(new Stop()); return; }
        if (!J.playing) { setTimeout(t, 60); return; }
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(t, speed || 28); else res();
      })();
    });
  }
  function typeIn(text) { var c = $('#comp'); c.classList.add('has', 'typing'); return type($('#tx'), text).then(function () { c.classList.remove('typing'); return wait(300); }); }
  function press() { var b = $('#send'); if (b) { b.classList.remove('press'); b.offsetWidth; b.classList.add('press'); } }
  function shake() { var c = $('#comp'); if (!c) return; c.classList.remove('shake'); c.offsetWidth; c.classList.add('shake', 'held'); try { if (navigator.vibrate) navigator.vibrate([25, 40, 25]); } catch (e) {} }
  function attach(name, cls) { var a = $('#att'); if (!a) return; a.insertAdjacentHTML('beforeend', '<span class="chipin ' + (cls || '') + '">' + I.file + '<b>' + esc(name) + '</b></span>'); $('#comp').classList.add('has'); }
  function part(i, st) { var li = document.querySelector('.parts li[data-p="' + i + '"]'); if (li) li.className = st; }
  function review() {
    scene('rev', '<div class="rv"><div class="rv-h"><img src="' + JAY.img + '" alt=""><span><b>Jay’s review</b><em>Inbound lead router · ' + D.CO[SC.co] + '</em></span></div>' +
      '<div class="rv-b" style="--bc:#E07A45"><span class="band">Below</span><span class="pts">✦ <b id="rvPts">0</b></span></div>' +
      '<div class="rv-n"><div><span class="ic ok">' + I.tick + '</span><p><em>What went well</em>The plan reads well, and the router routes every lead.</p></div><div><span class="ic"></span><p><em>One thing for next time</em>There is no test behind it.</p></div></div>' +
      '<button type="button" class="rv-co" id="rvCo"><img src="' + H.coach().img + '" alt=""><span>Walk me through it</span><em>Navid · 0:' + String(Math.round(ZV.walk_worst2.d)).padStart(2, '0') + '</em></button></div>');
    var n = 0, el = $('#rvPts');
    (function count() { n = Math.min(500, n + 25); if (el) el.textContent = fmt(n); if (n < 500) setTimeout(count, 30); })();
  }

  /* ---------- the pointer: Sanjay chooses to click ---------- */
  function click(el) {
    var cur = $('#cur'), sc = $('#screen').getBoundingClientRect(), s = $('#app')._s || 1;
    if (!el) return wait(200);
    var r = el.getBoundingClientRect(), x = (r.left + r.width / 2 - sc.left) / s, y = (r.top + r.height / 2 - sc.top) / s;
    if (cur.hidden) { cur.style.transition = 'none'; cur.style.left = (x - 180) + 'px'; cur.style.top = (y + 140) + 'px'; cur.hidden = false; cur.offsetWidth; cur.style.transition = ''; }
    cur.classList.remove('click');
    cur.style.left = x + 'px'; cur.style.top = y + 'px';
    return wait(700).then(function () { cur.classList.add('click'); el.classList.remove('tap'); el.offsetWidth; el.classList.add('tap'); setTimeout(function () { cur.hidden = true; cur.classList.remove('click'); }, 700); return wait(250); });
  }

  /* ---------- his face pulses; it waits for her ---------- */
  function pulse(o) {
    var v = $('#vnote'), c = $('#chipMe'), tone = o.tone;
    c.classList.remove('warn', 'good'); c.classList.add('lit', tone);
    $('#hud').classList.add('hud-' + tone);
    v.className = 'vnote ' + tone;
    v.innerHTML = '<span class="vn-i">' + (tone === 'warn' ? '!' : '✦') + '</span><b>' + esc(o.tease) + '</b><em>' + secs(o.say) + '</em>';
    v.hidden = false;
  }
  function unpulse() { var c = $('#chipMe'); c.classList.remove('lit', 'warn', 'good'); $('#hud').classList.remove('hud-warn', 'hud-good'); var v = $('#vnote'); v.hidden = true; }
  function secs(id) { var d = ZV[id] ? ZV[id].d : 5; return '0:' + String(Math.round(d)).padStart(2, '0'); }

  /* ---------- his panel ---------- */
  var R = 52, CIRC = 2 * Math.PI * R;
  function panel(o) {
    unpulse();
    var C = H.coach(), el = $('#cside');
    el.className = 'cside ' + o.tone;
    el.innerHTML = '<div class="sd-in">' +
      '<div class="sd-face"><svg class="sd-ring" viewBox="0 0 120 120"><circle class="tr" cx="60" cy="60" r="' + R + '"/><circle class="ar" id="sdRing" cx="60" cy="60" r="' + R + '" style="stroke-dasharray:' + CIRC + ';stroke-dashoffset:0"/></svg><img src="' + C.img + '" alt=""></div>' +
      '<div class="sd-who"><b>' + C.name + '</b><span id="sdTime">' + secs(o.say) + '</span></div>' +
      (o.data ? '<div class="sd-data">' + o.data.map(function (d, i) { return '<div class="' + (i === 0 && o.tone === 'warn' ? 'hot' : '') + '"><b>' + esc(d[0]) + '</b><span>' + esc(d[1]) + '</span></div>'; }).join('') + '</div>' : '') +
      '<div class="sd-txt"><p id="sdP"></p></div><div class="sd-x" id="sdX"></div><div class="sd-act" id="sdAct"></div></div>';
    el.hidden = false; el.classList.remove('out');
    scr().classList.add('siding');
    setTimeout(H.world, 30);
  }
  function panelClose() {
    var el = $('#cside'); if (el.hidden) return wait(0);
    el.classList.add('out'); el.classList.remove('speaking');
    scr().classList.remove('siding');
    setTimeout(H.world, 30);
    return wait(560).then(function () { el.hidden = true; el.innerHTML = ''; });
  }
  /* what good looks like, and what it is worth */
  function good(o) {
    var x = $('#sdX'); if (!x || !o.good) return;
    x.innerHTML = '<div class="sd-good"><span class="k">What good looks like</span>' + o.good + '</div>' +
      (o.pts ? '<div class="sd-pts"><div class="a"><span>As it is</span><b>✦ ' + fmt(o.pts[0]) + '</b></div><i>→</i><div class="b"><span>' + esc(o.pts[2] || 'With this') + '</span><b>✦ ' + fmt(o.pts[1]) + '</b></div></div>' : '');
    x.classList.remove('in'); x.offsetWidth; x.classList.add('in');
  }

  /* his voice, his words two or three lines at a time, the ring counting down */
  var AUD = null;
  function say(id) {
    var V = ZV[id], tok = J.run; if (!V) return wait(500);
    var el = $('#cside'), p = $('#sdP'), ring = $('#sdRing'), tm = $('#sdTime');
    var a = new Audio(AS + 'voice/' + id + '.mp3'); a.muted = !J.sound; AUD = a;
    var t = 0, last = Date.now(), useAudio = false, page = -1;
    var pages = V.p && V.p.length ? V.p : [[0, V.w.length - 1]];
    a.play().then(function () { useAudio = true; }).catch(function () { useAudio = false; });
    el.classList.add('speaking');
    return new Promise(function (res, rej) {
      var iv = setInterval(function () {
        if (tok !== J.run) { clearInterval(iv); a.pause(); rej(new Stop()); return; }
        var now = Date.now();
        if (!J.playing) { if (!a.paused) a.pause(); last = now; return; }
        if (useAudio) { if (a.paused && !a.ended) a.play().catch(function () {}); t = a.currentTime; }
        else t += (now - last) / 1000;
        last = now;
        var pg = 0; for (var i = 0; i < pages.length; i++) if (V.w[pages[i][0]][0] <= t + 0.05) pg = i;
        if (pg !== page && p) {
          page = pg;
          var ws = V.w.slice(pages[pg][0], pages[pg][1] + 1);
          p.classList.add('swap');
          setTimeout(function () { if (!p.isConnected) return; p.innerHTML = ws.map(function (w, k) { return '<span data-i="' + (pages[pg][0] + k) + '">' + esc(w[2]) + '</span>'; }).join(' '); p.classList.remove('swap'); }, 160);
        }
        if (p) [].forEach.call(p.querySelectorAll('span'), function (s) { var w = V.w[+s.dataset.i]; if (w && w[0] <= t) s.classList.add('on'); });
        var f = Math.min(1, t / V.d);
        if (ring) ring.style.strokeDashoffset = (CIRC * f).toFixed(1);
        if (tm) tm.textContent = '0:' + String(Math.max(0, Math.ceil(V.d - t))).padStart(2, '0');
        if (t >= V.d + 0.15 || (useAudio && a.ended)) {
          clearInterval(iv); el.classList.remove('speaking');
          if (p) [].forEach.call(p.querySelectorAll('span'), function (s) { s.classList.add('on'); });
          if (ring) ring.style.strokeDashoffset = CIRC.toFixed(1);
          if (tm) tm.textContent = '0:00';
          setTimeout(res, 350);
        }
      }, 50);
    });
  }
  function ask(list) {
    var a = $('#sdAct'); if (!a) return;
    a.innerHTML = list.map(function (x, i) { return '<button type="button" class="' + (i ? 'gh' : 'pr') + '" data-a="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
    a.classList.remove('in'); a.offsetWidth; a.classList.add('in');
    return wait(1100);
  }
  function pick(id) { var b = document.querySelector('#sdAct [data-a="' + id + '"]'); return click(b).then(function () { var a = $('#sdAct'); if (a) a.innerHTML = ''; }); }

  /* ---------- the ten places the coach steps in ---------- */
  var POINTS = [
    { k: 'Coach joins', tone: 'good', run: p_intro },
    { k: 'Numbers going by', tone: 'warn', run: p_notes },
    { k: 'AI in the check', tone: 'warn', run: p_pou },
    { k: 'Casual first message', tone: 'warn', run: p_casual },
    { k: 'Stuck 12 minutes', tone: 'warn', run: p_stuck },
    { k: 'A file, no words', tone: 'warn', run: p_nofile },
    { k: 'A one page plan', tone: 'warn', run: p_thin },
    { k: 'Review, practised', tone: 'warn', run: p_walk },
    { k: 'Still Level 1', tone: 'good', run: p_level },
    { k: 'Day one, recap', tone: 'good', run: p_recap }
  ];

  async function p_intro() {
    homeView(); tapStart();
    cap('Day one. Sanjay starts his first scenario.'); await wait(1600);
    kickoff(); cap('The kickoff opens. Navid’s face pulses green. He has something.'); await wait(900);
    pulse({ tone: 'good', tease: 'Hey Sanjay, I’m your coach', say: 'intro' }); await wait(2600);
    cap('Sanjay clicks when he is ready. The app shifts left.'); await click($('#chipMe'));
    panel({ tone: 'good', say: 'intro', data: [['Level 1', 'where you are'], ['GTM Engineer', 'roles you want']] });
    await say('intro'); await ask([['ok', 'Got it'], ['why', 'Why a coach?']]);
    cap('He asks why.'); await pick('why');
    good({ good: '<ul><li>Jay grades the work</li><li>Navid watches how you work</li><li>The fastest gains are in how you work</li></ul>' });
    await say('intro_why'); await ask([['ok', 'Okay, got it']]);
    await pick('ok'); await panelClose();
  }
  async function p_notes() {
    kickoff(); cap('Jay is briefing. Zero writes the first two numbers down for Sanjay.'); await wait(800);
    note('Leads wait 3 h 10 m for a first reply', 'zero'); await wait(1500);
    slide('Every hour a lead waits costs', '8%', 'of the chance to book a meeting'); await wait(800);
    note('Each hour of wait costs 8% of meetings', 'zero'); await wait(1600);
    slide('That adds up to', '$2.4M', 'of pipeline lost a quarter');
    cap('The third number goes by. Nothing written. Navid pulses coral.'); await wait(700);
    pulse({ tone: 'warn', tease: 'Third number going by', say: 'notes_hold' }); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'notes_hold', data: [['3rd', 'number, not written'], ['2', 'Zero wrote for you']] });
    good({ good: '<p class="gq">$2.4M of pipeline lost a quarter</p>', pts: [500, 1000, 'With notes'] });
    await say('notes_hold');
    cap('He writes it himself, while Navid watches.'); await wait(300);
    note('$2.4M of pipeline lost a quarter', 'me'); await wait(2200);
    await say('notes3_ok'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
  }
  async function p_pou() {
    check(); cap('The understanding check. Sanjay pastes an answer from AI.'); await wait(900);
    var t = $('#ckT'); t.textContent = AI_TEXT; $('#ckA').classList.add('pasted'); $('#ckTag').hidden = false; await wait(1200);
    cap('Before he answers, Navid pulses.'); pulse({ tone: 'warn', tease: 'An AI answer in the check', say: 'pou' }); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'pou', data: [['AI', 'pasted answer'], ['0', 'words of your own']] });
    good({ good: '<p class="gq">Leads wait over three hours. Each hour costs 8% of meetings. That’s $2.4M a quarter.</p>', pts: [500, 1000, 'Your own words'] });
    await say('pou'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
    cap('He clears it and answers from his notes.'); $('#ckA').classList.remove('pasted'); $('#ckTag').hidden = true; t.textContent = ''; await wait(300);
    await type(t, 'Leads wait over three hours. Each hour costs 8% of meetings. That’s $2.4M a quarter.', 24); await wait(400);
    await click($('#ckGo')); $('#ckA').classList.add('ok'); await wait(1200);
  }
  async function p_casual() {
    work(); H.setStage(0, 2); part(0, 'cur');
    cap('The workspace. Sanjay writes his first message to Jay.'); await wait(600);
    await jay('Kickoff done. Keep me posted as you go.'); await wait(300);
    await typeIn('yo whats up'); press(); shake();
    cap('He hits send. It shakes, and Navid pulses. The message waits.'); pulse({ tone: 'warn', tease: 'This reads like a text to a friend', say: 'casual' }); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'casual', data: [['“yo whats up”', 'first message to Jay'], ['1st', 'line sets the tone']] });
    await say('casual'); await ask([['ok', 'Got it'], ['why', 'Why?']]);
    cap('He asks why.'); await pick('why');
    good({ good: '<p class="gq">Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.</p>', pts: [1000, 2000, 'Updates like this'] });
    await say('casual_why'); await ask([['ok', 'Okay, got it']]);
    await pick('ok'); await panelClose();
    cap('He rewrites it, and sends.'); $('#tx').classList.add('sel'); await wait(500); $('#tx').classList.remove('sel'); $('#comp').classList.remove('held', 'shake');
    var m = 'Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.';
    await typeIn(m); press(); sent(m); await wait(400);
    await jay('Great, that’s exactly what I need.'); part(0, 'done'); part(1, 'cur'); await wait(1000);
  }
  async function p_stuck() {
    work(); H.setStage(0, 2); part(0, 'done'); part(1, 'cur');
    sent('Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>Great, that’s exactly what I need.</p></div>');
    sys('Sanjay is building the routing rules in n8n.');
    cap('The hard part: routing leads with no region. Sanjay goes quiet.'); var wt = $('#wsT');
    for (var mn = 2; mn <= 12; mn += 2) { if (wt) wt.textContent = mn + ' min on this part'; await wait(380); }
    pulse({ tone: 'warn', tease: '12 minutes on one step', say: 'stuck' }); cap('Twelve minutes, no question. Navid pulses.'); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'stuck', data: [['12 min', 'on this step'], ['0', 'questions to Jay']] });
    good({ good: '<p class="gq">Jay, leads with no region: should they go to the round robin, or to you?</p>', pts: [1000, 1000, 'Asking costs'] });
    await say('stuck'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
    var q = 'Jay, leads with no region: should they go to the round robin, or to you?';
    cap('He asks one clear question.'); await typeIn(q); press(); sent(q); if (wt) wt.textContent = '';
    await jay('Round robin. Good question.'); await wait(900);
  }
  async function p_nofile() {
    work(); H.setStage(0, 3); part(0, 'done'); part(1, 'done'); part(2, 'cur');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>Round robin. Good question.</p></div>');
    sys('Sanjay exports the September leads to test on.');
    cap('He attaches the export and hits send, with no words.'); await wait(500);
    attach('Lead export, September.csv'); await wait(900); press(); shake();
    pulse({ tone: 'warn', tease: 'A file with no words', say: 'nofile' }); cap('It shakes. Navid pulses.'); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'nofile', data: [['1', 'file'], ['0', 'words with it']] });
    good({ good: '<p class="gq">Here is the September lead export I am testing on. Is September the right month?</p>', pts: [1000, 2000, 'File plus a line'] });
    await say('nofile'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
    var m = 'Here is the September lead export I am testing on. Is September the right month?';
    cap('He adds one line, and sends.'); $('#comp').classList.remove('held', 'shake'); await typeIn(m); press(); sent(m, ['Lead export, September.csv']);
    await jay('September works.'); await wait(900);
  }
  async function p_thin() {
    work(); H.setStage(0, 3); part(0, 'done'); part(1, 'done'); part(2, 'done'); part(3, 'cur');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>September works. Send me the plan when it’s ready.</p></div>');
    cap('Time to submit. The plan is one page.'); await wait(500);
    attach('Routing plan.pdf · 1 page', 'thin'); await wait(500);
    await typeIn('here is the plan'); press(); shake();
    pulse({ tone: 'warn', tease: 'One page, for leadership', say: 'thin' }); cap('It shakes. Navid pulses before it reaches Jay.'); await wait(2600);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'warn', say: 'thin', data: [['1 page', 'in the plan'], ['3', 'parts Jay asked for']] });
    good({ good: '<ul><li>The problem, with the numbers</li><li>The cause</li><li>The fix, and how you will test it</li></ul>', pts: [500, 1000, 'Three parts'] });
    await say('thin');
    cap('He fixes it in the app while Navid watches.'); $('#comp').classList.remove('held', 'shake');
    var a = document.querySelector('.chipin.thin b'); if (a) { a.textContent = 'Routing plan.pdf · 3 pages'; a.parentNode.classList.add('grew'); }
    $('#tx').textContent = ''; await typeIn('Routing plan, three pages: the wait and what it costs, the cause, and the router.'); await wait(300);
    await say('thin_ok'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
    press(); sent('Routing plan, three pages: the wait and what it costs, the cause, and the router.', ['Routing plan.pdf · 3 pages']); await wait(900);
  }
  async function p_walk() {
    cap('Jay’s review: Below. 500 skill points. There’s no test behind the plan.'); review(); await wait(2800);
    cap('Sanjay asks Navid to walk him through it.'); await click($('#rvCo'));
    panel({ tone: 'warn', say: 'walk_worst2', data: [['Below', '✦ 500 today'], ['0', 'tests behind the plan']] });
    good({ good: '<p class="gq">I’ll test the router on 200 real leads from September and report the share routed in under two minutes, by Thursday.</p>', pts: [500, 2000, 'With a test'] });
    await say('walk_worst2'); await ask([['go', 'Practise it'], ['ok', 'Got it']]);
    cap('He practises, with Navid.'); await pick('go');
    var x = $('#sdX'); x.innerHTML = '<div class="sd-dr"><span class="k">Tell Jay how you will test it, in two lines</span><p id="drT"></p></div>';
    await say('drill_test_in');
    await type($('#drT'), 'I’ll test on 200 September leads. I’ll report the share routed under two minutes, by Thursday.', 26); await wait(300);
    $('#drT').parentNode.classList.add('ok');
    await say('drill_test_ok'); await ask([['ok', 'Got it']]);
    await pick('ok'); await panelClose();
  }
  async function p_level() {
    homeView(); H.ST.pts = 1500; H.refresh();
    cap('Back home. Level 1, 1,500 skill points. Navid pulses.'); await wait(900);
    H.gain(500); await wait(1200);
    pulse({ tone: 'good', tease: 'Still Level 1, and that’s normal', say: 'up_worst' }); await wait(2400);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'good', say: 'up_worst', data: [['Level 1', '1,500 skill points'], ['500', 'to Level 2']] });
    good({ good: '<ul><li>Test before you send</li><li>Exceeding on the next one</li><li>Level 2, in one scenario</li></ul>', pts: [1500, 3500, 'Next one, tested'] });
    await say('up_worst'); await ask([['ok', 'Got it'], ['why', 'Why so many nudges?']]);
    cap('He asks why so many nudges.'); await pick('why');
    $('#sdX').innerHTML = '';
    await say('wise'); await ask([['ok', 'Okay, got it']]);
    await pick('ok'); await panelClose();
  }
  async function p_recap() {
    homeView(); H.ST.pts = 1500; H.refresh();
    cap('End of day one. Navid pulses one last time.'); await wait(900);
    pulse({ tone: 'good', tease: 'What you fixed today', say: 'recap_worst' }); await wait(2400);
    cap('Sanjay clicks.'); await click($('#chipMe'));
    panel({ tone: 'good', say: 'recap_worst', data: [['4', 'habits fixed today'], ['+500', 'skill points']] });
    good({ good: '<ul class="done"><li>Notes</li><li>First message</li><li>The file</li><li>The plan</li></ul>' });
    await say('recap_worst');
    $('#sdX').innerHTML = '';
    await say('day_feel'); await ask([['hard', 'Hard, but clearer'], ['easy', 'Easy']]);
    await pick('hard');
    await say('thanks_day'); await ask([['ok', 'See you tomorrow']]);
    await pick('ok'); await panelClose();
    cap('That is the coach: he pulses, Sanjay chooses when to listen, and every tip is worth skill points.');
  }
  function tapStart() { var b = document.querySelector('#card .btn'); if (b) { b.classList.remove('tap'); b.offsetWidth; b.classList.add('tap'); } }

  /* ---------- the player ---------- */
  function reset() {
    H.clearAll(); H.reset('mid'); H.coachOn(true);
    H.ST.pts = 1000; H.ST.cur = 0; H.ST.stage = 0; H.ST.done = 0; H.ST.tips = [];
    H.refresh(); H.setOpen(false); homeView(); unpulse();
    var cs = $('#cside'); cs.hidden = true; cs.innerHTML = ''; scr().classList.remove('siding');
    $('#cur').hidden = true; $('#lvup').hidden = true; if (AUD) { AUD.pause(); AUD = null; }
    setTimeout(H.world, 30);
  }
  async function go(m, all) {
    J.run++; var tok = J.run; J.m = m; J.playing = true; J.done = false;
    reset(); drawBar();
    try {
      for (var i = m; i < POINTS.length; i++) {
        J.m = i; drawBar();
        if (i > m) await wait(900);
        await POINTS[i].run();
        alive(tok);
        if (!all) break;
      }
      J.playing = false; J.done = true; drawBar();
    } catch (e) { if (!(e instanceof Stop)) { console.error(e); } }
  }
  function toggle() {
    if (J.done || J.run === 0) { go(J.done ? 0 : J.m, true); return; }
    J.playing = !J.playing;
    if (AUD) { if (J.playing) { if (!AUD.ended) AUD.play().catch(function () {}); } else AUD.pause(); }
    drawBar();
  }
  J.drawBar = drawBar; J.onFinish = function () {};
  function drawBar() {
    var tl = $('#tl');
    if (tl) tl.innerHTML = POINTS.map(function (p, i) {
      return '<button type="button" data-m="' + i + '" class="' + p.tone + (i === J.m && J.run ? ' on' : i < J.m ? ' past' : '') + '"><i></i><span>' + p.k + '</span></button>';
    }).join('');
    var r = $('#run'); if (!r) return;
    r.innerHTML = '<span class="st cap">' + esc(J.cap || 'One scenario, day one. Press play.') + '</span>' +
      '<button type="button" data-jr="prev" aria-label="Previous point">' + I.prev + '</button>' +
      '<button type="button" data-jr="play" class="pl" aria-label="' + (J.playing ? 'Pause' : 'Play') + '">' + (J.playing ? I.pause : I.play) + '</button>' +
      '<button type="button" data-jr="next" aria-label="Next point">' + I.next + '</button>' +
      '<button type="button" data-jr="again" aria-label="Start over">' + I.again + '</button>' +
      '<button type="button" data-jr="snd" aria-label="' + (J.sound ? 'Mute' : 'Sound on') + '">' + (J.sound ? I.snd : I.mute) + '</button>';
    var v = $('#variant'); if (v) v.innerHTML = '';
  }
  document.getElementById('dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.jr;
    if (a === 'play') toggle();
    if (a === 'next') go(Math.min(POINTS.length - 1, J.m + (J.run ? 1 : 0)), true);
    if (a === 'prev') go(Math.max(0, J.m - 1), true);
    if (a === 'again') go(0, true);
    if (a === 'snd') { J.sound = !J.sound; if (AUD) AUD.muted = !J.sound; drawBar(); }
  });
  document.getElementById('tl').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) go(+b.dataset.m, true); });
  document.getElementById('cside').addEventListener('click', function (e) { e.stopPropagation(); });

  reset(); drawBar();
  try { var q = new URLSearchParams(location.search); if (q.get('play') === '1') go(0, true); else if (q.get('m')) go(+q.get('m'), true); } catch (e) {}
  window.__ready = true;
})();
