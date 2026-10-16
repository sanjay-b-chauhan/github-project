/* Zero home b7: one full journey, played on top of the home.
   New scenario unlocked > kickoff with the manager > the work, where Sanjay sends a weak update, hears from the coach after,
   then tries the same thing again and the coach stops it before it goes > the grade > the level up > home, with the coach's new read. */
(function () {
  'use strict';
  var H = window.H, D = H.D, J = D.JOURNEY, $ = H.$, $$ = H.$$, esc = H.esc, n = H.n, IC = H.IC;
  var M = J.manager, SCK = J.sc;

  /* ---------- the clock: waits that pause, and stop when the journey is stopped ---------- */
  var R = { tok: 0, paused: false, running: false, done: false, step: '' };
  function Stopped() { }
  function wait(ms) {
    var tok = R.tok;
    return new Promise(function (res, rej) {
      var left = ms, last = performance.now();
      (function t() {
        if (tok !== R.tok) return rej(new Stopped());
        var now = performance.now(); if (!R.paused) left -= now - last; last = now;
        if (left <= 0) res(); else setTimeout(t, 40);
      })();
    });
  }
  function type(el, text, cps) {
    var tok = R.tok, i = 0, per = 1000 / (cps || 30);
    return new Promise(function (res, rej) {
      (function t() {
        if (tok !== R.tok) return rej(new Stopped());
        if (R.paused) return setTimeout(t, 60);
        i++; var v = text.slice(0, i);
        if ('value' in el && el.tagName === 'TEXTAREA') el.value = v; else el.textContent = v;
        if (i < text.length) setTimeout(t, per * (text.charAt(i - 1) === ' ' ? 1.4 : 1)); else res();
      })();
    });
  }
  function press(el) { if (!el) return wait(0); el.classList.add('jpress'); return wait(200).then(function () { el.classList.remove('jpress'); }); }
  function stage() { return $('.scn'); }
  function scene(cls, html) {
    var box = stage(), old = $('.sc', box);
    if (old) { old.classList.add('out'); setTimeout(function () { old.remove(); }, 450); }
    var el = document.createElement('div'); el.className = 'sc ' + cls; el.innerHTML = html; box.appendChild(el);
    box.classList.add('on');
    requestAnimationFrame(function () { el.classList.add('in'); });
    return el;
  }
  function clearScene() { var box = stage(), old = $('.sc', box); if (old) { old.classList.add('out'); setTimeout(function () { old.remove(); }, 450); } box.classList.remove('on'); }
  function setStep(t) { R.step = t; label(); }

  /* ---------- the pieces ---------- */
  function face(src, size, cls) { return '<img class="fc ' + (cls || '') + '" style="--f:' + size + 'px" alt="" src="' + src + '">'; }
  function topbar(title) {
    return '<header class="st-top"><button class="st-back" aria-label="Back">' + IC.chev + '</button>' + H.logo(SCK, 26) + '<span class="st-t">' + esc(title) + '</span></header>';
  }
  function stageLeft(stg) {
    return '<aside class="st-left"><div class="st-card"><div class="st-row"><b class="st-stg">' + esc(stg) + '</b><span class="st-tl">Time left</span></div>' +
      '<div class="st-bar"><i></i></div><div class="st-k">Requirements</div><ul class="st-reqs">' +
      J.reqs.map(function (r, i) { return '<li data-i="' + i + '"><i>' + IC.tick + '</i><span>' + esc(r) + '</span></li>'; }).join('') + '</ul>' +
      '<button class="st-sub" hidden>Submit your work</button></div>' +
      '<div class="st-tools"><div class="st-k">Tools</div>' + J.tools.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></aside>';
  }
  function bubble(who, text) {
    var me = who === 'me';
    var b = document.createElement('div'); b.className = 'mg ' + (me ? 'me' : 'mgr');
    b.innerHTML = (me ? '' : face(M.photo, 30)) + '<div class="bb">' + esc(text) + '</div>';
    $('.st-thread').appendChild(b);
    var th = $('.st-thread'); th.scrollTop = th.scrollHeight;
    return b;
  }
  function typing() {
    var b = document.createElement('div'); b.className = 'mg mgr ty';
    b.innerHTML = face(M.photo, 30) + '<div class="bb"><i></i><i></i><i></i></div>';
    $('.st-thread').appendChild(b); return b;
  }
  async function managerSays(text, think) {
    var t = typing(); await wait(think || 1300); t.remove(); bubble('mgr', text); await wait(500);
  }
  async function iSay(text) {
    var box = $('.cmp-in'); box.classList.add('focus');
    await type(box, text, 26); await wait(450);
    await press($('.cmp-send')); box.textContent = ''; box.classList.remove('focus');
    bubble('me', text); await wait(400);
  }
  function tickReq(i) { var li = $('.st-reqs li[data-i="' + i + '"]'); if (li) li.classList.add('ok'); }

  /* ---------- the journey ---------- */
  async function run() {
    var c = H.CO();
    /* reset the home to where Sanjay stands today */
    H.S.sim = null; $('.sim-now').classList.remove('on');
    H.rest(); H.S.dot = false; H.close(); $$('.toast').forEach(H.dismiss); H.draw();
    await wait(700);

    /* 1. a new scenario is unlocked: the company hooks first */
    setStep('A new scenario is unlocked');
    var sc = scene('unlock', '<div class="ul-card"><div class="ul-k">New scenario unlocked</div>' +
      '<div class="ul-art">' + H.logo(SCK, 72) + '</div>' +
      '<h2 class="ul-t">' + esc(J.title) + '</h2><div class="ul-at">at Datadog</div>' +
      '<div class="ul-rows"><div><span>Skill points up to</span><b class="ul-sp">' + n(J.pays) + '</b></div><div><span>Time</span><b>' + esc(J.time) + '</b></div>' +
      '<div><span>Manager</span><b class="ul-m">' + face(M.photo, 22) + esc(M.name) + '</b></div></div>' +
      '<button class="ul-go">Enter</button></div>');
    await wait(2800); await press($('.ul-go', sc)); await wait(250);

    /* 2. kickoff: the manager sets the brief */
    setStep('Kickoff with Esther');
    H.S.now = { sc: SCK, stage: 'Kickoff' }; H.draw();
    sc = scene('kick', topbar(J.title + ' at Datadog') +
      '<div class="kk"><div class="kk-v"><div class="kk-img" style="background-image:url(' + M.wide + ')"></div>' +
        '<div class="kk-tag"><span class="kk-live"></span>' + esc(M.name) + ' · ' + esc(M.title) + '</div>' +
        '<div class="kk-me">' + face(D.A + 'sanjay.jpg', 64, 'sq') + '</div></div>' +
        '<div class="kk-cap"></div></div>' +
      '<aside class="kk-brief"><div class="kb-hd">' + H.logo(SCK, 34) + '<div><b>' + esc(J.title) + '</b><span>Datadog</span></div></div>' +
        '<div class="st-k">What you will deliver</div><ul class="kb-reqs">' + J.reqs.map(function (r, i) { return '<li data-i="' + i + '"><i></i>' + esc(r) + '</li>'; }).join('') + '</ul>' +
        '<div class="st-k">Tools</div><div class="kb-tools">' + J.tools.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<button class="kb-go">Start working</button></aside>');
    await wait(900);
    $('.kk-v', sc).classList.add('talk');
    await type($('.kk-cap', sc), J.kick, 34);
    $('.kk-v', sc).classList.remove('talk');
    for (var i = 0; i < J.reqs.length; i++) { await wait(380); $('.kb-reqs li[data-i="' + i + '"]', sc).classList.add('on'); }
    await wait(1000); await press($('.kb-go', sc)); await wait(250);

    /* 3. the work: one chat, with the manager */
    setStep('The work: Plan');
    H.S.now = { sc: SCK, stage: 'Plan' }; H.draw();
    sc = scene('work', topbar(J.title + ' at Datadog') + '<div class="wk">' + stageLeft('Plan') +
      '<section class="st-chat"><div class="st-ch">' + face(M.photo, 34) + '<div><b>' + esc(M.name) + '</b><span>Your manager</span></div></div>' +
        '<div class="st-thread"></div>' +
        '<div class="cmp"><div class="ccard" hidden></div><div class="cmp-box"><div class="cmp-in" data-ph="Reply to Esther"></div>' +
        '<div class="cmp-bt"><span class="cmp-stuck">I’m stuck</span><button class="cmp-send" aria-label="Send">' + IC.arrow + '</button></div></div></div>' +
      '</section></div>');
    await wait(900);

    /* 3a. the first time: a weak update goes through, the coach says so after */
    await managerSays(J.first.ask, 1100);
    await wait(700);
    await iSay(J.first.bad);
    await managerSays(J.first.reply, 1500);
    await wait(900);
    H.S.reads.Communication = { v: 2, saw: 'Esther had to ask again after "ok will do".', tip: J.first.note.tip };
    H.note(J.first.note, 'After Plan at Datadog, just now');
    await wait(2600);
    tickReq(0);
    await wait(700);

    /* 3b. the second time: the coach stops it before it goes */
    setStep('The work: Build');
    H.S.now = { sc: SCK, stage: 'Build' }; H.draw();
    $('.st-stg').textContent = 'Build'; $('.st-bar i').style.width = '55%';
    await wait(900);
    await managerSays(J.second.ask, 1200);
    await wait(700);
    var box = $('.cmp-in'); box.classList.add('focus');
    await type(box, J.second.bad, 24); await wait(500);
    await press($('.cmp-send'));
    var cmp = $('.cmp-box'); cmp.classList.add('shake', 'held');
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch (e) {}
    setStep('Your coach steps in');
    var card = $('.ccard');
    card.innerHTML = '<div class="cc-hd">' + face(c.photo, 34) + '<div><b>Hold on, Sanjay</b><span>' + esc(c.name) + ', your coach</span></div></div>' +
      '<p>I don’t think you should send this yet. Last time Esther had to ask again. “done sent it” doesn’t tell her what is done.</p>' +
      '<div class="cc-try"><span>Try this instead</span><div>' + esc(J.second.good) + '</div></div>' +
      '<div class="cc-why">' + IC.spark + 'A clear update is what moves your grade, and your skill points.</div>' +
      '<div class="cc-bt"><button class="cc-use">Use this</button><button class="cc-skip">Send mine anyway</button></div>';
    card.hidden = false; requestAnimationFrame(function () { card.classList.add('in'); });
    await wait(600); cmp.classList.remove('shake');
    await wait(4200);
    await press($('.cc-use', card));
    card.classList.remove('in'); setTimeout(function () { card.hidden = true; }, 350);
    cmp.classList.remove('held');
    box.textContent = '';
    await type(box, J.second.good, 70); await wait(500);
    await press($('.cmp-send')); box.textContent = ''; box.classList.remove('focus');
    bubble('me', J.second.good); await wait(300);
    await managerSays(J.second.reply, 1500);
    H.S.reads.Communication = { v: 4, saw: 'Your update told Esther what was done, what was next, and by when.' };
    H.note(J.second.note, 'After Build at Datadog, just now');
    await wait(1600);
    tickReq(1); await wait(500); tickReq(2); await wait(500);
    var sub = $('.st-sub'); sub.hidden = false; await wait(1100); await press(sub); await wait(300);

    /* 4. the grade: the manager reviews, the points land in the pill */
    setStep('Esther grades your work');
    H.S.now = null; H.draw();
    var g = D.GRADES.filter(function (x) { return x.key === J.grade; })[0];
    sc = scene('review', '<div class="rv"><div class="rv-hd">' + face(M.photo, 48) + '<div><span>Your manager graded your work</span><b>' + esc(M.name) + '</b></div></div>' +
      '<div class="rv-band"><b>Exceeding Expectations</b><span class="rv-pips">' + [0, 1, 2, 3, 4].map(function (k) { return '<i class="' + (k < 4 ? 'on' : '') + '"></i>'; }).join('') + '</span></div>' +
      '<p class="rv-note">“Clear, sourced, and you kept me in the loop. This is ready for the team.”</p>' +
      '<div class="rv-rw"><span>Skill points</span><b class="rv-pts">+0</b></div></div>');
    await wait(1200);
    var pts = $('.rv-pts', sc), t0 = performance.now();
    await new Promise(function (res) { (function f(t) { var k = Math.min(1, (t - t0) / 900); pts.textContent = '+' + n(g.pts * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); else res(); })(t0); });
    await wait(700);
    await fly(pts, $('.seg.lv'), '<span class="fly-sp">+' + n(g.pts) + '</span>');
    var r = gradeQuiet(g);
    await wait(1400);

    /* 5. level up: what it opens */
    setStep('Level ' + r.now);
    var opened = D.LEVELS.slice(r.was, r.now), roles = opened.reduce(function (a, x) { return a + x.roles; }, 0), cos = [];
    opened.forEach(function (x) { x.cos.forEach(function (k) { if (cos.indexOf(k) < 0) cos.push(k); }); });
    sc = scene('lvup', '<div class="lu"><div class="lu-b">' + H.badge(r.now) + '</div><div class="lu-k">You reached</div><h2>Level ' + r.now + '</h2>' +
      '<div class="lu-r"><b>' + roles + ' more roles</b> open to you</div>' +
      '<div class="lu-cos">' + cos.slice(0, 7).map(function (k, i) { return '<span style="animation-delay:' + (300 + i * 70) + 'ms">' + H.logo(k, 40) + '</span>'; }).join('') + '</div>' +
      '<button class="lu-go">Continue</button></div>');
    await wait(4200); await press($('.lu-go', sc)); await wait(200);

    /* 6. home: the coach's new read, then the levels */
    setStep('Back home: your coach’s new read');
    clearScene();
    H.S.reads = Object.assign({}, H.S.reads, J.after.reads);
    H.S.notes = J.after.notes.slice();
    H.S.think = J.after.think; H.S.when = J.after.when; H.S.live = true; H.S.dot = true; H.draw();
    await wait(1600);
    H.open('coach');
    await wait(6500);
    setStep('What Level ' + r.now + ' opens');
    H.open('level');
    await wait(6000);
    R.running = false; R.done = true; setStep('Done'); label();
  }
  function gradeQuiet(g) {
    var was = H.lv(); H.S.pts += g.pts; H.S.gain = g.pts; if (H.S.done.indexOf(SCK) < 0) H.S.done.push(SCK); H.S.newDone = SCK; H.S.openLv = null;
    H.draw(); var seg = $('.seg.lv'); seg.classList.remove('bump'); void seg.offsetWidth; seg.classList.add('bump');
    setTimeout(function () { H.S.gain = 0; }, 200);
    return { was: was, now: H.lv() };
  }
  function fly(from, to, html) {
    return new Promise(function (res) {
      if (!from || !to) return res();
      var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      var f = document.createElement('div'); f.className = 'jfly'; f.innerHTML = html; document.body.appendChild(f);
      var w = f.offsetWidth, h = f.offsetHeight, x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2, x1 = b.left + 20 - w / 2, y1 = b.top + b.height / 2 - h / 2;
      var an = f.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 80) + 'px) scale(1.1)', opacity: 1, offset: .55 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.5)', opacity: .2 }], { duration: 1000, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
      an.onfinish = function () { f.remove(); res(); };
    });
  }

  /* ---------- controls ---------- */
  function label() {
    var b = $('.sim-row .jy'); if (!b) return;
    b.classList.toggle('on', R.running);
    b.innerHTML = R.running ? (R.paused ? IC.play + 'Resume' : IC.pause + 'Pause') : IC.play + (R.done ? 'Play the journey again' : 'Play Sanjay’s journey');
    var now = $('.sim-now');
    if (R.running) { now.classList.add('on'); now.innerHTML = H.logo(SCK, 24) + '<span><span class="st">Journey ·</span> ' + esc(R.step) + '</span>'; }
  }
  function start() {
    R.tok++; R.running = true; R.paused = false; R.done = false;
    run().catch(function (e) { if (!(e instanceof Stopped)) console.error(e); });
    label();
  }
  function stop() {
    if (!R.running) return;
    R.tok++; R.running = false; R.paused = false;
    clearScene(); $$('.jfly').forEach(function (f) { f.remove(); });
    H.S.now = null; H.draw(); $('.sim-now').classList.remove('on'); label();
  }
  window.JY = {
    toggle: function () { if (!R.running) start(); else { R.paused = !R.paused; label(); } },
    start: start, stop: stop, label: label, R: R
  };
  label();
  if (new URLSearchParams(location.search).get('journey') === '1') setTimeout(start, 600);
})();
