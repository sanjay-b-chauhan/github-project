/* The coach, b20. One flow, played by hand: Sanjay's first scenario, start to the end of day one.
   Nothing moves until you click. Each step names the one thing to click, and that thing breathes.
   Enter or Space does the step too, so nobody gets stuck. No pointer plays it for you.
   The kickoff is the real app's: the project card, Jay on video, the deck with Meeting Notes, the voice check.
   Navid never opens by himself: his face pulses (coral when something is off, green when it is good) and you click.
   The app shifts left, his panel takes the right 30%, he talks in his own voice, and every tip is worth skill points. */
(function () {
  'use strict';
  var H = window.__home; if (!H) return;
  var D = H.D, AS = H.AS, esc = H.esc, fmt = H.fmt, ZV = window.ZV || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var J = { run: 0, m: 0, cap: '', sound: true, done: false, skipSay: false };
  window.__J = J;

  /* the people: the voice says Sanjay and Jay */
  var JAY = H.MGR; JAY.name = 'Jay'; JAY.img = AS + 'img/jay.jpg';
  JAY.full = 'Jay Shah'; JAY.title = 'Director of Revenue Operations'; JAY.wide = AS + 'img/jay-wide.jpg';
  var SC = D.SCENARIOS[0];
  var I = {
    send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>',
    clip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7.5-5 5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3L6.6 11a1 1 0 0 1-1.5-1.5l4.6-4.6"/></svg>',
    file: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/></svg>',
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>',
    prev: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M10 1.5v9L4.5 6z"/><rect x="1.9" y="1.5" width="1.8" height="9" rx=".5"/></svg>',
    next: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5v9L7.5 6z"/><rect x="8.3" y="1.5" width="1.8" height="9" rx=".5"/></svg>',
    again: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 2v2.5H5"/></svg>',
    snd: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h2.5L9 3v10L5.5 10H3z"/><path d="M11.3 5.6a3.4 3.4 0 0 1 0 4.8M13 4a5.7 5.7 0 0 1 0 8"/></svg>',
    mute: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h2.5L9 3v10L5.5 10H3z"/><path d="m11.5 6.2 3 3.6M14.5 6.2l-3 3.6"/></svg>',
    left: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2 1.4"/></svg>',
    skip: '<svg viewBox="0 0 12 12"><path d="M7.9 2.2h1.6v7.6H7.9zM2.2 2.2v7.6L7.4 6z" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5.7" y="2" width="4.6" height="7.6" rx="2.3"/><path d="M3.6 7.8a4.4 4.4 0 0 0 8.8 0M8 12.3V14"/></svg>',
    playf: '<svg viewBox="0 0 12 12"><path d="M3 1.6v8.8L10.2 6z" fill="currentColor"/></svg>',
    pausef: '<svg viewBox="0 0 12 12"><path d="M2.8 1.8h2.4v8.4H2.8zM6.8 1.8h2.4v8.4H6.8z" fill="currentColor"/></svg>',
    note: '<svg viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12.5" height="14.5" rx="2.6" fill="#FFF7DC" stroke="#3A2F12" stroke-width="1.4"/><path d="M4 6.2h12.5" stroke="#3A2F12" stroke-width="1.4"/><path d="M7 9.6h6.2M7 12.6h4.4" stroke="#E9B949" stroke-width="1.4" stroke-linecap="round"/></svg>',
    ok: '<svg class="kx-okc" viewBox="0 0 20 20" fill="none" stroke="#49BA61" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8.2"/><path class="kx-okt" d="M6.6 10.2 8.9 12.4 13.4 7.8"/></svg>',
    brain: '<svg viewBox="-1 -1 32 32" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(1 4)"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18"/></g><path d="M25 .2c.45 2.9 1.45 4 4.5 4.8-3.05.8-4.05 1.9-4.5 4.8-.45-2.9-1.45-4-4.5-4.8 3.05-.8 4.05-1.9 4.5-4.8z" fill="currentColor" stroke="#fff" stroke-width="1.6"/></svg>'
  };

  /* ---------- a run that can be jumped and restarted ---------- */
  function Stop() {}
  function alive(tok) { if (tok !== J.run) throw new Stop(); }
  function wait(ms) { var tok = J.run; return new Promise(function (res, rej) { setTimeout(function () { if (tok !== J.run) rej(new Stop()); else res(); }, ms); }); }
  /* wait for an animation, then make sure the run is still this one */
  function fin(p) { var tok = J.run; return Promise.resolve(p).catch(function () {}).then(function () { if (tok !== J.run) throw new Stop(); }); }
  function cap(t) { J.cap = t; var c = $('#runCap'); if (c) c.textContent = t; }

  /* ---------- the one thing to click: it breathes, and nothing moves until it is clicked ---------- */
  var W = null;
  function want(els, text, ring) {
    els = [].concat(els).filter(function (e) { return e && e.isConnected; });
    if (text) cap(text);
    if (!els.length) return wait(200);
    if (ring !== false) els.forEach(function (e) { e.classList.add('want'); });
    return new Promise(function (res, rej) { W = { els: els, res: res, rej: rej }; });
  }
  function unwant() { if (!W) return null; var w = W; W = null; w.els.forEach(function (e) { e.classList.remove('want', 'kx-nudge'); }); return w; }
  function done(el) { var w = unwant(); if (!w) return; tap(el); w.res(el); }
  function cancelWant() { var w = unwant(); if (w) w.rej(new Stop()); }
  function tap(el) { el.classList.remove('tap'); void el.offsetWidth; el.classList.add('tap'); }
  function nudge() { if (!W) return; W.els.forEach(function (e) { e.classList.remove('kx-nudge'); void e.offsetWidth; e.classList.add('kx-nudge'); }); }
  document.addEventListener('click', function (e) {
    if (!J.run) return;
    var t = e.target;
    if (W) for (var i = 0; i < W.els.length; i++) if (W.els[i].contains(t)) { e.stopPropagation(); e.preventDefault(); done(W.els[i]); return; }
    /* the app's own tabs stay shut while a step is on */
    if (t.closest('#chipMe') || (t.closest('#chipLv') && scr().classList.contains('insc'))) { e.stopPropagation(); e.preventDefault(); }
    /* a click anywhere else in the app points back at the one thing to click */
    if (t.closest('#screen') && !t.closest('#cside .sd-face')) nudge();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!W || e.repeat || e.metaKey || e.ctrlKey) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(W.els[0]); }
  });

  /* ---------- scenes ---------- */
  var scr = function () { return $('#screen'); };
  function homeView() { var s = $('#scene'); s.hidden = true; s.className = 'scene'; s.innerHTML = ''; scr().classList.remove('insc', 'kxl', 'kx-nohud'); }
  function scene(cls, html, light) {
    var s = $('#scene'); s.className = 'scene ' + cls; s.innerHTML = html; s.hidden = false;
    scr().classList.add('insc'); scr().classList.toggle('kxl', !!light); H.setOpen(false); return s;
  }
  /* where an element sits inside another, as clip-path insets */
  function insetOf(el, ref, r) {
    var a = el.getBoundingClientRect(), b = ref.getBoundingClientRect(), s = b.width / ref.offsetWidth || 1;
    return 'inset(' + ((a.top - b.top) / s).toFixed(1) + 'px ' + ((b.right - a.right) / s).toFixed(1) + 'px ' + ((b.bottom - a.bottom) / s).toFixed(1) + 'px ' + ((a.left - b.left) / s).toFixed(1) + 'px round ' + (r || 0) + 'px)';
  }
  function clipTo(el, from, to, ms) { return el.animate([{ clipPath: from }, { clipPath: to }], { duration: ms, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }).finished; }

  /* ===================== the kickoff, as the real app has it ===================== */
  /* 1. the project card (Join Now) */
  function landing(from) {
    var s = scene('kx kx-land',
      '<div class="kx-bg"><img src="' + AS + 'img/b/' + SC.co + '.webp" alt=""></div>' +
      '<button class="kx-back" type="button" aria-label="Back">' + I.left + '</button>' +
      '<div class="kx-card"><span class="kx-eb">Project kickoff</span><h1 class="kx-h">Understand the scope and what comes next.</h1>' +
        '<span class="kx-av"><img src="' + JAY.img + '" alt=""></span><b class="kx-nm">' + JAY.full + '</b><span class="kx-tl">' + JAY.title + '</span>' +
        '<span class="kx-tm">' + I.clock + '~12 min</span><button class="kx-join" type="button">Join Now</button></div>');
    if (from) { var a = from.getBoundingClientRect(), b = s.getBoundingClientRect(); s.style.setProperty('--ox', ((a.left + a.width / 2 - b.left) / b.width * 100).toFixed(1) + '%'); s.style.setProperty('--oy', ((a.top + a.height / 2 - b.top) / b.height * 100).toFixed(1) + '%'); }
    return s;
  }

  /* 2. Jay on video, full window, with captions; Skip or let it play */
  var GREET = ['Hey Sanjay, welcome to the team.', 'Our inbound leads wait way too long for a reply.', 'Let me show you what that costs us.'];
  var SEG = [0.9, 5.2, 4.2, 4.2, 4.2];
  function strip(cls) { return '<span class="' + cls + '">' + SEG.map(function (g) { return '<i style="--g:' + g + '"><b></b></i>'; }).join('') + '</span>'; }
  function videoLayer(s) {
    s.insertAdjacentHTML('beforeend', '<div class="kx-vid" id="kxVid"><img src="' + JAY.wide + '" alt=""><div class="kx-vsh"></div>' +
      '<button class="kx-back" type="button" aria-label="Back">' + I.left + '</button><button class="kx-skip" type="button">' + I.skip + 'Skip</button>' +
      '<div class="kx-cap"><span id="kxCap"></span></div>' + strip('kx-strip kx-vstrip') + '</div>');
    return $('#kxVid', s);
  }
  async function greet(vid, stop) {
    var c = $('#kxCap', vid), seg = $('.kx-vstrip b', vid), words = GREET.map(function (l) { return l.split(' '); });
    var total = 0; words.forEach(function (w) { total += w.length; });
    var said = 0;
    await wait(600);
    for (var i = 0; i < words.length; i++) {
      for (var k = 1; k <= words[i].length; k++) {
        if (stop.cut) return;
        c.textContent = words[i].slice(0, k).join(' ');
        said++; seg.style.width = (said / total * 100).toFixed(1) + '%';
        await wait(210);
      }
      await wait(900);
      if (stop.cut) return;
      if (i < words.length - 1) { c.textContent = ''; await wait(160); }
    }
  }

  /* 3. the meeting: the deck on the left, Meeting Notes on the right */
  var NOTES = {
    p1: 'Inbound leads wait 3 h 10 m for a first reply, up from 47 min',
    p2: 'Each hour of wait cuts meeting rates by about 8%',
    p3: '$2.4M of pipeline lost a quarter',
    o1: 'Every new lead gets a reply in under 2 minutes'
  };
  function u(text, i, cls) { return '<span class="kx-ln"><span class="kx-u ' + (cls || '') + '" style="--i:' + i + '">' + text + '</span></span>'; }
  function slides() {
    return '<div class="kx-sl kx-hero on" data-i="0">' + u('Every lead,', 0, 'kx-big') + u('answered fast.', 1, 'kx-big') + u(JAY.full + ', your manager', 2, 'kx-sub') + '</div>' +
      '<div class="kx-sl" data-i="1">' + u('The wait climbed fast.', 0, 'kx-st') +
        '<div class="kx-chart"><svg viewBox="0 0 690 250" aria-hidden="true">' +
          '<path class="kx-path" d="M0 196 L234 190 L392 136 L690 60" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
          '<circle cx="0" cy="196" r="8.5" fill="#fff"/><circle class="kx-d1" cx="690" cy="60" r="0" fill="#fff"/><path d="M0 250 H690" stroke="#444" stroke-width="2"/></svg>' +
          '<span class="kx-v kx-vl">' + u('47 min', 1) + '</span><span class="kx-v kx-vr">' + u('3 h 10 m', 0) + '</span>' +
          '<div class="kx-xl"><span>6 months ago</span><span>today</span></div></div></div>' +
      '<div class="kx-sl" data-i="2">' + u('Every hour a lead waits costs us', 0, 'kx-pre') + u('8%', 1, 'kx-num') + u('of the chance to book a meeting', 2, 'kx-post') + '</div>' +
      '<div class="kx-sl" data-i="3">' + u('That adds up to', 0, 'kx-pre') + u('$2.4M', 1, 'kx-num') + u('of pipeline lost a quarter', 2, 'kx-post') + '</div>' +
      '<div class="kx-sl" data-i="4">' + u('We pay for <em>leads</em>', 0, 'kx-q') + u('and then make them <em>wait</em>.', 1, 'kx-q') + '</div>';
  }
  function row(text, cls, mark) {
    return '<li class="kx-row ' + (cls || '') + '"><span class="kx-pt">' + (mark ? I.ok : '<i class="kx-dot"></i>') + '</span><p class="kx-p">' + text + '</p></li>';
  }
  function notesCard(o) {
    o = o || {};
    return '<aside class="kx-notes' + (o.ready ? ' kx-ready' : '') + '" id="kxNotes"><div class="kx-nh"><span class="kx-ni">' + I.note + '</span><span class="kx-nt">Meeting Notes</span></div>' +
      (o.ready ? '' : '<div class="kx-intro"><span class="kx-ic">' + I.note + '</span><h2 class="kx-it">Meeting Notes</h2><p class="kx-is">Earn skill points by noting all the important details of the project</p>' +
        '<button class="kx-rd" type="button">I’m ready</button></div>') +
      '<div class="kx-nb"><section class="kx-seg" data-k="p"><h3>Problem</h3><i class="kx-hr"></i><ul class="kx-ul" id="kxP">' + (o.p || '') + '</ul></section>' +
        '<section class="kx-seg" data-k="o"' + (o.o ? '' : ' hidden') + '><h3>Outcome</h3><i class="kx-hr"></i><ul class="kx-ul" id="kxO">' + (o.o || '') + '</ul></section></div></aside>';
  }
  function meetLayer(s) {
    s.insertAdjacentHTML('afterbegin', '<div class="kx-meet" id="kxMeet"><button class="kx-back" type="button" aria-label="Back">' + I.left + '</button>' +
      '<div class="kx-grid"><section class="kx-deck" id="kxDeck"><div class="kx-wm"><img src="' + AS + 'logo/' + SC.co + '.svg" alt=""><b>' + D.CO[SC.co].toLowerCase() + '</b></div>' + slides() +
        strip('kx-strip kx-dstrip') +
        '<div class="kx-bar"><span class="kx-bb">' + I.playf + '</span>' + strip('kx-trk') + '<span class="kx-bb">1x</span><span class="kx-bb">CC</span></div>' +
        '<div class="kx-pop"><img src="' + JAY.img + '" alt=""><div class="kx-pin"><span class="kx-an"><i></i><span>Analyzing</span></span><button class="kx-cont" type="button">Continue</button></div></div>' +
      '</section>' + notesCard() + '</div></div>');
    return $('#kxMeet', s);
  }
  /* one slide at a time: the old one's lines rise out, the new one's rise in */
  var STRIP = null;
  function show(i, ms) {
    var dk = $('#kxDeck'); if (!dk) return;
    $$('.kx-sl', dk).forEach(function (x) {
      var k = +x.dataset.i;
      if (k === i) { x.classList.remove('out'); x.classList.add('on'); }
      else if (x.classList.contains('on')) { x.classList.remove('on'); x.classList.add('out'); setTimeout(function () { x.classList.remove('out'); }, 420); }
    });
    var segs = $$('.kx-dstrip b', dk);
    if (STRIP) { STRIP.finish(); STRIP = null; }
    segs.forEach(function (b, k) { if (k < i) { b.getAnimations().forEach(function (a) { a.cancel(); }); b.style.width = '100%'; } });
    STRIP = segs[i] && ms ? segs[i].animate([{ width: '0%' }, { width: '100%' }], { duration: ms, fill: 'forwards' }) : null;
  }
  async function zeroNote(ul, text) {
    ul.insertAdjacentHTML('beforeend', row('', 'kx-new kx-auto'));
    var li = ul.lastElementChild; await type($('.kx-p', li), text, 22);
    li.querySelector('.kx-p').insertAdjacentHTML('beforeend', ' <em class="kx-by">Written by Zero</em>');
    return li;
  }
  function writeRow(ul, ph) { ul.insertAdjacentHTML('beforeend', row('<span class="kx-ph">' + esc(ph) + '</span>', 'kx-new kx-wr')); return ul.lastElementChild; }
  async function fillRow(li, text) { var p = $('.kx-p', li); li.classList.add('kx-typing'); p.textContent = ''; await type(p, text, 30); li.classList.remove('kx-wr', 'kx-typing'); }
  async function grade(ul) {
    var lis = $$('.kx-row', ul);
    for (var i = 0; i < lis.length; i++) { var pt = $('.kx-pt', lis[i]); pt.innerHTML = I.ok; lis[i].classList.add('kx-ok'); await wait(280); }
  }

  /* 4. the understanding check: Jay asks by voice, you hold the mic and answer */
  function bars(seed, n) {
    var h = '', x = seed * 9301 + 49297;
    for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var v = 10 + Math.round((x / 233280) * 16); if (i % 6 === 3) v = 9; h += '<i style="height:' + v + 'px"></i>'; }
    return h;
  }
  function vn(jay, seed) {
    return '<div class="kx-vn ' + (jay ? 'kx-jay' : 'kx-me') + '">' + (jay ? '<img class="kx-vav" src="' + JAY.img + '" alt="">' : '') +
      '<div class="kx-vb"><span class="kx-pl">' + I.playf + '</span><span class="kx-wv">' + bars(seed, 18) + '</span><span class="kx-du">00:00</span></div>' +
      '<button class="kx-tr" type="button">Transcript' + I.chev + '</button><p class="kx-tx"></p></div>';
  }
  function check() {
    var s = scene('kx kx-chk', '<button class="kx-back" type="button" aria-label="Back">' + I.left + '</button>' +
      '<div class="kx-mast"><span class="kx-mtr"><i id="kxMtr"></i></span><span class="kx-brain">' + I.brain + '</span></div>' +
      '<div class="kx-ug"><div class="kx-col"><div class="kx-chat" id="kxChat"><div class="kx-th" id="kxTh"></div></div>' +
        '<div class="kx-micw"><button class="kx-mic" id="kxMic" type="button" aria-label="Hold to talk">' + I.mic + '</button><span class="kx-mh" id="kxMh">Hold ‘space’ to talk</span></div></div>' +
        notesCard({ ready: true, p: row(NOTES.p1) + row(NOTES.p2) + row(NOTES.p3), o: row(NOTES.o1) }) + '</div>', true);
    return s;
  }
  function addVn(jay, seed) { var th = $('#kxTh'); th.insertAdjacentHTML('beforeend', vn(jay, seed)); var x = th.lastElementChild; var c = $('#kxChat'); c.scrollTop = c.scrollHeight; return x; }
  async function jayAsks(q, secs) {
    var v = addVn(true, 4); await wait(500);
    var pl = $('.kx-pl', v), wv = $$('.kx-wv i', v), tx = $('.kx-tx', v), du = $('.kx-du', v), w = q.split(' ');
    pl.innerHTML = I.pausef; v.classList.add('kx-open');
    var n = Math.max(2000, w.length * 240), t0 = Date.now(), tok = J.run;
    while (Date.now() - t0 < n) {
      alive(tok);
      var p = (Date.now() - t0) / n, on = Math.round(p * wv.length);
      wv.forEach(function (b, k) { b.classList.toggle('on', k < on); });
      tx.textContent = w.slice(0, Math.max(1, Math.ceil(p * w.length))).join(' ');
      du.textContent = '00:0' + Math.min(secs, Math.round(p * secs));
      await wait(50);
    }
    tx.textContent = q; du.textContent = '00:0' + secs; pl.innerHTML = I.playf; wv.forEach(function (b) { b.classList.remove('on'); });
  }
  async function answer(text) {
    var mic = $('#kxMic'), mh = $('#kxMh');
    mic.classList.add('kx-rec'); mh.textContent = 'Recording';
    var v = addVn(false, 11); v.classList.add('kx-open');
    var pl = $('.kx-pl', v), wv = $$('.kx-wv i', v), du = $('.kx-du', v), tx = $('.kx-tx', v), secs = Math.max(3, Math.min(14, Math.round(text.length / 14)));
    pl.innerHTML = ''; pl.classList.add('kx-live'); wv.forEach(function (b) { b.classList.add('kx-off'); });
    var tok = J.run, i = 0;
    while (i < text.length) {
      alive(tok);
      i = Math.min(text.length, i + 2); tx.textContent = text.slice(0, i);
      var p = i / text.length, on = Math.round(p * wv.length);
      wv.forEach(function (b, k) { b.classList.toggle('kx-off', k >= on); });
      du.textContent = '00:' + String(Math.round(p * secs)).padStart(2, '0');
      var c = $('#kxChat'); c.scrollTop = c.scrollHeight;
      await wait(28);
    }
    mic.classList.remove('kx-rec'); mh.textContent = 'Hold ‘space’ to talk';
    pl.classList.remove('kx-live'); pl.innerHTML = I.playf;
    return v;
  }

  /* ===================== the workspace and the review (b19, unchanged in look) ===================== */
  var AI_TEXT = 'Delayed lead response times can significantly impact conversion rates, as prospects tend to lose interest over time. Organizations that respond faster typically see measurable improvements in pipeline.';
  var OWN = 'Leads wait over three hours. Each hour costs us 8% of meetings. That’s $2.4M of pipeline a quarter.';
  var PARTS = ['Map the lead flow', 'Build the router', 'Test it on real leads', 'Send the plan'];
  function work() {
    scene('work', '<div class="ws w8">' +
      '<aside class="ws-l"><span class="co">' + H.logo(SC.co, 22) + D.CO[SC.co] + '</span><h3>Inbound lead router</h3><p>Get every inbound lead a first reply in under two minutes.</p>' +
      '<ol class="parts">' + PARTS.map(function (p, i) { return '<li data-p="' + i + '" class="' + (i === 0 ? 'cur' : '') + '"><i>' + I.tick + '</i>' + p + '</li>'; }).join('') + '</ol>' +
      '<div class="tools">' + SC.tools.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></aside>' +
      '<section class="ws-c"><header class="ws-h"><img src="' + JAY.img + '" alt=""><span><b>Jay</b><em>Your manager · ' + D.CO[SC.co] + '</em></span><span class="ws-t" id="wsT"></span></header>' +
      '<div class="msgs" id="msgs"></div>' +
      '<div class="comp" id="comp"><div class="att" id="att"></div><div class="row"><button type="button" class="clip" id="clip" aria-label="Attach a file">' + I.clip + '</button>' +
      '<div class="in" id="inBox"><span class="tx" id="tx"></span><span class="ph">Message Jay</span><i class="caret"></i></div>' +
      '<button type="button" class="send" id="send" aria-label="Send">' + I.send + '</button></div></div></section></div>');
  }
  function push(html) { var m = $('#msgs'); if (!m) return; m.insertAdjacentHTML('beforeend', html); m.scrollTop = m.scrollHeight; }
  function jay(text) {
    push('<div class="m them typing"><img src="' + JAY.img + '" alt=""><p><span class="dots"><i></i><i></i><i></i></span></p></div>');
    var el = $('#msgs').lastChild;
    return wait(900).then(function () { el.classList.remove('typing'); el.querySelector('p').textContent = text; });
  }
  function sys(text) { push('<div class="m sys"><p>' + esc(text) + '</p></div>'); }
  function sent(text, files) {
    push('<div class="m me">' + (files ? '<div class="fl">' + files.map(function (f) { return '<span>' + I.file + esc(f) + '</span>'; }).join('') + '</div>' : '') + (text ? '<p>' + esc(text) + '</p>' : '') + '</div>');
    $('#tx').textContent = ''; $('#att').innerHTML = ''; $('#comp').classList.remove('has', 'held', 'shake');
  }
  function type(el, text, speed) {
    var i = 0, tok = J.run;
    return new Promise(function (res, rej) {
      (function t() {
        if (tok !== J.run) { rej(new Stop()); return; }
        if (!el.isConnected) { res(); return; }
        i = Math.min(text.length, i + 1); el.textContent = text.slice(0, i);
        if (i < text.length) setTimeout(t, speed || 24); else res();
      })();
    });
  }
  function typeIn(text) { var c = $('#comp'); c.classList.add('has', 'typing'); $('#tx').textContent = ''; return type($('#tx'), text, 20).then(function () { c.classList.remove('typing'); }); }
  function press() { var b = $('#send'); if (b) { b.classList.remove('press'); void b.offsetWidth; b.classList.add('press'); } }
  function shake() { var c = $('#comp'); if (!c) return; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake', 'held'); try { if (navigator.vibrate) navigator.vibrate([25, 40, 25]); } catch (e) {} }
  function attach(name, cls) { var a = $('#att'); if (!a) return; a.insertAdjacentHTML('beforeend', '<span class="chipin ' + (cls || '') + '">' + I.file + '<b>' + esc(name) + '</b></span>'); $('#comp').classList.add('has'); }
  function part(i, st) { var li = document.querySelector('.parts li[data-p="' + i + '"]'); if (li) li.className = st; }
  function review() {
    scene('rev', '<div class="rv"><div class="rv-h"><img src="' + JAY.img + '" alt=""><span><b>Jay’s review</b><em>Inbound lead router · ' + D.CO[SC.co] + '</em></span></div>' +
      '<div class="rv-b" style="--bc:#E07A45"><span class="band">Below</span><span class="pts">✦ <b id="rvPts">0</b></span></div>' +
      '<div class="rv-n"><div><span class="ic ok">' + I.tick + '</span><p><em>What went well</em>The plan reads well, and the router routes every lead.</p></div><div><span class="ic"></span><p><em>One thing for next time</em>There is no test behind it.</p></div></div>' +
      '<button type="button" class="rv-co" id="rvCo"><img src="' + H.coach().img + '" alt=""><span>Walk me through it</span><em>Navid · 0:' + String(Math.round(ZV.walk_worst2.d)).padStart(2, '0') + '</em></button></div>');
    var n = 0, el = $('#rvPts');
    (function count() { n = Math.min(100, n + 5); if (el) el.textContent = fmt(n); if (n < 100) setTimeout(count, 30); })();
  }

  /* ===================== the coach ===================== */
  /* his face pulses; it waits for you */
  function pulse(o) {
    var v = $('#vnote'), c = $('#chipMe'), tone = o.tone;
    c.classList.remove('warn', 'good'); c.classList.add('lit', tone);
    $('#hud').classList.remove('hud-warn', 'hud-good'); $('#hud').classList.add('hud-' + tone);
    v.className = 'vnote ' + tone;
    v.innerHTML = '<span class="vn-i">' + (tone === 'warn' ? '!' : '✦') + '</span><b>' + esc(o.tease) + '</b><em>' + secs(o.say) + '</em>';
    v.hidden = false;
  }
  function unpulse() { var c = $('#chipMe'); c.classList.remove('lit', 'warn', 'good'); $('#hud').classList.remove('hud-warn', 'hud-good'); var v = $('#vnote'); v.hidden = true; }
  function secs(id) { var d = ZV[id] ? ZV[id].d : 5; return '0:' + String(Math.round(d)).padStart(2, '0'); }

  var R = 52, CIRC = 2 * Math.PI * R;
  function panel(o) {
    unpulse();
    var C = H.coach(), el = $('#cside');
    el.className = 'cside ' + o.tone;
    el.innerHTML = '<div class="sd-in">' +
      '<div class="sd-face" title="Tap to skip ahead"><svg class="sd-ring" viewBox="0 0 120 120"><circle class="tr" cx="60" cy="60" r="' + R + '"/><circle class="ar" id="sdRing" cx="60" cy="60" r="' + R + '" style="stroke-dasharray:' + CIRC + ';stroke-dashoffset:0"/></svg><img src="' + C.img + '" alt=""></div>' +
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
    x.classList.remove('in'); void x.offsetWidth; x.classList.add('in');
  }

  /* his voice, his words two or three lines at a time, the ring counting down.
     If the audio is blocked, slow or stalls, a clock takes over, so it always ends. Tap his face to skip ahead. */
  var AUD = null;
  function say(id) {
    var V = ZV[id], tok = J.run; if (!V) return wait(400);
    var el = $('#cside'), p = $('#sdP'), ring = $('#sdRing'), tm = $('#sdTime');
    if (AUD) { try { AUD.pause(); } catch (e) {} }
    var a = new Audio(AS + 'voice/' + id + '.mp3'); a.muted = !J.sound; a.preload = 'auto'; AUD = a;
    var t = 0, t0 = Date.now(), last = t0, started = false, useAudio = false, page = -1, lastAT = -1, stall = 0;
    var pages = V.p && V.p.length ? V.p : [[0, V.w.length - 1]];
    J.skipSay = false;
    a.play().then(function () { useAudio = true; started = true; }).catch(function () { useAudio = false; started = true; });
    el.classList.add('speaking');
    return new Promise(function (res, rej) {
      var iv = setInterval(function () {
        if (tok !== J.run) { clearInterval(iv); a.pause(); rej(new Stop()); return; }
        var now = Date.now();
        if (!started) { if (now - t0 > 1500) { started = true; useAudio = false; try { a.pause(); } catch (e) {} } else { last = now; return; } }
        if (useAudio) {
          var at = a.currentTime;
          if (at === lastAT && !a.ended) { stall += now - last; if (stall > 2500) { useAudio = false; try { a.pause(); } catch (e) {} } }
          else { stall = 0; lastAT = at; }
          t = Math.max(t, at);
        } else t += (now - last) / 1000;
        last = now;
        if (J.skipSay) { t = V.d + 1; try { a.pause(); } catch (e) {} }
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
          var all = function () { if (p && p.isConnected) [].forEach.call(p.querySelectorAll('span'), function (s) { s.classList.add('on'); }); };
          all(); setTimeout(all, 220);
          if (ring) ring.style.strokeDashoffset = CIRC.toFixed(1);
          if (tm) tm.textContent = '0:00';
          setTimeout(function () { all(); if (tok === J.run) res(); else rej(new Stop()); }, 300);
        }
      }, 50);
    });
  }
  /* the answers are yours to click */
  function choose(list, text) {
    var a = $('#sdAct'); if (!a) return Promise.resolve(list[0][0]);
    a.innerHTML = list.map(function (x, i) { return '<button type="button" class="' + (i ? 'gh' : 'pr') + '" data-a="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
    a.classList.remove('in'); void a.offsetWidth; a.classList.add('in');
    var t = text || (list.length > 1 ? list[0][1] + ', or ' + list[1][1].replace(/\?$/, '') + '. Your call.' : 'Click ' + list[0][1] + ' when you’re ready.');
    return want($$('button', a), t, false).then(function (b) { a.innerHTML = ''; return b.dataset.a; });
  }
  /* he pulses, you click his face, the app shifts left, he talks */
  async function coach(o) {
    pulse(o);
    await want([$('#chipMe'), $('#vnote')], o.cap || 'Navid’s face is pulsing. Click it to hear him.', false);
    panel(o); if (o.good) good(o);
    cap('Navid is talking. Tap his face to skip ahead.');
    await say(o.say);
  }
  document.getElementById('cside').addEventListener('click', function (e) {
    e.stopPropagation();
    if (e.target.closest('.sd-face')) J.skipSay = true;
  });

  /* ---------- the ten places the coach steps in ---------- */
  var POINTS = [
    { k: 'Coach joins', tone: 'good', run: p_intro },
    { k: 'Numbers going by', tone: 'warn', run: p_notes, gap: 0 },
    { k: 'AI in the check', tone: 'warn', run: p_pou },
    { k: 'Casual first message', tone: 'warn', run: p_casual },
    { k: 'Stuck 12 minutes', tone: 'warn', run: p_stuck },
    { k: 'A file, no words', tone: 'warn', run: p_nofile },
    { k: 'A one page plan', tone: 'warn', run: p_thin },
    { k: 'Review, practised', tone: 'warn', run: p_walk },
    { k: 'Still Rank 1', tone: 'good', run: p_level },
    { k: 'Day one, recap', tone: 'good', run: p_recap }
  ];

  async function p_intro() {
    homeView(); H.refresh();
    var start = $('#card .btn');
    await want(start, 'Day one. Press Start on your first scenario.');
    landing(start);
    await wait(1000);
    await coach({ tone: 'good', tease: 'Hey Sanjay, I’m your coach', say: 'intro', data: [['Rank 1', 'where you are'], ['GTM Engineer', 'roles you want']],
      cap: 'Navid’s face pulses green. Click it to meet your coach.' });
    var c = await choose([['ok', 'Got it'], ['why', 'Why a coach?']]);
    if (c === 'why') {
      good({ good: '<ul><li>Jay grades the work</li><li>Navid watches how you work</li><li>The fastest gains are in how you work</li></ul>' });
      await say('intro_why'); await choose([['ok', 'Okay, got it']]);
    }
    await panelClose();
    await want($('.kx-join'), 'Join the kickoff. Press Join Now.');
  }
  async function p_notes() {
    var s = $('#scene'), card = $('.kx-card', s), tok = J.run;
    if (!s.classList.contains('kx') || !card) { s = scene('kx', ''); card = null; }
    /* Jay on video: the card grows into the window */
    scr().classList.add('kx-nohud');
    var vid = videoLayer(s);
    if (card) { card.classList.add('kx-down'); await fin(clipTo(vid, insetOf(card, s, 32), 'inset(0px 0px 0px 0px round 0px)', 760)); }
    $$(':scope > .kx-bg, :scope > .kx-card, :scope > .kx-back', s).forEach(function (x) { x.remove(); }); s.className = 'scene kx';
    var stop = { cut: false };
    await Promise.race([greet(vid, stop).catch(function () {}), want($('.kx-skip', vid), 'Jay joins on video. Watch, or press Skip.')]);
    stop.cut = true; unwant(); alive(tok);
    /* the video shrinks into the deck; the notes glide in from the right */
    var meet = meetLayer(s); scr().classList.add('kxl'); scr().classList.remove('kx-nohud');
    $('.kx-dstrip b', meet).style.width = '100%';
    await fin(clipTo(vid, 'inset(0px 0px 0px 0px round 0px)', insetOf($('#kxDeck'), s, 24), 700));
    vid.remove();
    meet.classList.add('kx-nin');
    await wait(700);
    var notes = $('#kxNotes');
    await want($('.kx-rd', notes), 'Get your notes ready. Press I’m ready.');
    notes.classList.add('kx-going'); await wait(380); notes.classList.add('kx-ready');
    var P = $('#kxP'), path = $('.kx-path'), d1 = $('.kx-d1');
    /* slide 1: the wait climbs; Zero writes the first number down */
    cap('Jay walks through the numbers. Zero writes the first two down for you.');
    show(1, 5200); await wait(600);
    await fin(path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1500, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'forwards' }).finished);
    d1.setAttribute('r', '8.5'); $('.kx-vr').closest('.kx-v').classList.add('in');
    await wait(400);
    await zeroNote(P, NOTES.p1); await wait(1100);
    /* slide 2: 8% */
    show(2, 4200); await wait(1200);
    await zeroNote(P, NOTES.p2); await wait(1500);
    /* slide 3: the third number goes by, with nothing written */
    show(3, 4200); await wait(900);
    cap('The third number is going by.');
    var li = writeRow(P, 'Write what Jay just said'); await wait(1000);
    if (STRIP) STRIP.pause();
    await coach({ tone: 'warn', tease: 'Third number going by', say: 'notes_hold', data: [['3rd', 'number, not written'], ['2', 'Zero wrote for you']],
      good: '<p class="gq">$2.4M of pipeline lost a quarter</p>', pts: [100, 500, 'With notes'], cap: 'Nothing written. Navid pulses coral. Click his face.' });
    await want(li, 'Write it yourself. Click the empty line.');
    await fillRow(li, NOTES.p3);
    await say('notes3_ok'); await choose([['ok', 'Got it']]);
    await panelClose();
    if (STRIP) STRIP.play();
    await wait(1200);
    /* slide 4: the goal */
    show(4, 4200); await wait(1300);
    var os = $('.kx-seg[data-k="o"]'); os.hidden = false; os.classList.add('kx-new');
    var lo = writeRow($('#kxO'), 'Write the goal');
    await want(lo, 'Jay gives the goal. Click the line and write it down.');
    await fillRow(lo, NOTES.o1); await wait(600);
    /* the end of the chapter: the bar, the check, Continue */
    if (STRIP) STRIP.finish(); $$('.kx-dstrip b').forEach(function (b) { b.style.width = '100%'; }); $('#kxDeck').classList.add('kx-end');
    cap('Zero checks your notes.');
    await wait(800); await grade(P); await grade($('#kxO')); await wait(400);
    $('#kxDeck').classList.add('kx-graded');
    await want($('.kx-cont'), 'All four notes count. Press Continue.');
  }
  async function p_pou() {
    check(); var mtr = $('#kxMtr');
    cap('The understanding check. Jay asks one thing by voice.');
    await wait(700);
    await jayAsks('In your own words, what are slow replies costing us?', 4);
    await want($('#kxMic'), 'Your turn. Hold the mic, or hold Space, to answer.');
    var v = await answer(AI_TEXT);
    v.classList.add('kx-held'); $('.kx-vb', v).insertAdjacentHTML('afterend', '<span class="kx-hold">Not sent</span>');
    await wait(500);
    await coach({ tone: 'warn', tease: 'An AI answer in the check', say: 'pou', data: [['AI', 'answer, read out'], ['0', 'numbers from your notes']],
      good: '<p class="gq">' + esc(OWN) + '</p>', pts: [100, 500, 'Your own words'], cap: 'That reads like AI. It holds, and Navid pulses. Click his face.' });
    await choose([['ok', 'Got it']]);
    await panelClose();
    v.classList.add('kx-drop'); await wait(320); v.remove();
    await want($('#kxMic'), 'Answer again, from your notes. Hold the mic.');
    v = await answer(OWN);
    await wait(400);
    $('.kx-vb', v).insertAdjacentHTML('beforeend', '<span class="kx-rx">👍</span>');
    mtr.style.width = '100%';
    cap('Jay got it. On to the work.');
    await wait(1800);
  }
  async function p_casual() {
    work(); H.setStage(0, 2); part(0, 'cur');
    cap('The workspace. Jay is waiting on your first update.');
    await jay('Kickoff done. Keep me posted as you go.');
    await want($('#inBox'), 'Write Jay your first message. Click the message box.');
    await typeIn('yo whats up');
    await want($('#send'), 'Send it.');
    press(); shake();
    await coach({ tone: 'warn', tease: 'This reads like a text to a friend', say: 'casual', data: [['“yo whats up”', 'first message to Jay'], ['1st', 'line sets the tone']],
      good: '<p class="gq">Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.</p>', pts: [500, 1500, 'Updates like this'],
      cap: 'It shakes and holds. Navid pulses. Click his face.' });
    var c = await choose([['ok', 'Got it'], ['why', 'Why?']]);
    if (c === 'why') { await say('casual_why'); await choose([['ok', 'Okay, got it']]); }
    await panelClose();
    $('#comp').classList.remove('held', 'shake');
    var m = 'Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.';
    await want($('#inBox'), 'Rewrite it the way Navid showed. Click the message box.');
    await typeIn(m);
    await want($('#send'), 'Send it.');
    press(); sent(m); await wait(300);
    await jay('Great, that’s exactly what I need.'); part(0, 'done'); part(1, 'cur'); await wait(1000);
  }
  async function p_stuck() {
    work(); H.setStage(0, 2); part(0, 'done'); part(1, 'cur');
    sent('Hi Jay, quick update on the router: the lead flow is mapped. Next I build the rules, ready for you by 4pm.');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>Great, that’s exactly what I need.</p></div>');
    sys('Sanjay is building the routing rules in n8n.');
    cap('The hard part: leads with no region. The minutes go by.'); var wt = $('#wsT');
    for (var mn = 2; mn <= 12; mn += 2) { if (wt) wt.textContent = mn + ' min on this part'; await wait(380); }
    await coach({ tone: 'warn', tease: '12 minutes on one step', say: 'stuck', data: [['12 min', 'on this step'], ['0', 'questions to Jay']],
      good: '<p class="gq">Jay, leads with no region: should they go to the round robin, or to you?</p>', pts: [100, 500, 'One clear question'],
      cap: 'Twelve minutes, no question. Navid pulses. Click his face.' });
    await choose([['ok', 'Got it']]);
    await panelClose();
    var q = 'Jay, leads with no region: should they go to the round robin, or to you?';
    await want($('#inBox'), 'Ask Jay one clear question. Click the message box.');
    await typeIn(q);
    await want($('#send'), 'Send it.');
    press(); sent(q); if (wt) wt.textContent = '';
    await jay('Round robin. Good question.'); await wait(900);
  }
  async function p_nofile() {
    work(); H.setStage(0, 3); part(0, 'done'); part(1, 'done'); part(2, 'cur');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>Round robin. Good question.</p></div>');
    sys('Sanjay exports the September leads to test on.');
    await want($('#clip'), 'Share the September export with Jay. Click the clip.');
    attach('Lead export, September.csv');
    await want($('#send'), 'Send it.');
    press(); shake();
    await coach({ tone: 'warn', tease: 'A file with no words', say: 'nofile', data: [['1', 'file'], ['0', 'words with it']],
      good: '<p class="gq">Here is the September lead export I am testing on. Is September the right month?</p>', pts: [500, 1500, 'File plus a line'],
      cap: 'A file with no words. It holds, and Navid pulses. Click his face.' });
    await choose([['ok', 'Got it']]);
    await panelClose();
    $('#comp').classList.remove('held', 'shake');
    var m = 'Here is the September lead export I am testing on. Is September the right month?';
    await want($('#inBox'), 'Add one line. Click the message box.');
    await typeIn(m);
    await want($('#send'), 'Send it.');
    press(); sent(m, ['Lead export, September.csv']);
    await jay('September works.'); await wait(900);
  }
  async function p_thin() {
    work(); H.setStage(0, 3); part(0, 'done'); part(1, 'done'); part(2, 'done'); part(3, 'cur');
    push('<div class="m them"><img src="' + JAY.img + '" alt=""><p>September works. Send me the plan when it’s ready.</p></div>');
    await want($('#clip'), 'Time to submit. Click the clip to add your plan.');
    attach('Routing plan.pdf · 1 page', 'thin');
    await want($('#inBox'), 'Click the message box and add a line.');
    await typeIn('here is the plan');
    await want($('#send'), 'Send it.');
    press(); shake();
    await coach({ tone: 'warn', tease: 'One page, for leadership', say: 'thin', data: [['1 page', 'in the plan'], ['3', 'parts Jay asked for']],
      good: '<ul><li>The problem, with the numbers</li><li>The cause</li><li>The fix, and how you will test it</li></ul>', pts: [100, 500, 'Three parts'],
      cap: 'One page for leadership. It holds before it reaches Jay. Click Navid.' });
    $('#comp').classList.remove('held', 'shake');
    var chip = $('.chipin.thin');
    await want(chip, 'Fix it while Navid watches. Click the plan to add the three parts.');
    var b = $('b', chip); if (b) { b.textContent = 'Routing plan.pdf · 3 pages'; chip.classList.add('grew'); }
    await want($('#inBox'), 'Now say what is in it. Click the message box.');
    await typeIn('Routing plan, three pages: the wait and what it costs, the cause, and the router.');
    await say('thin_ok'); await choose([['ok', 'Got it']]);
    await panelClose();
    await want($('#send'), 'Send it to Jay.');
    press(); sent('Routing plan, three pages: the wait and what it costs, the cause, and the router.', ['Routing plan.pdf · 3 pages']); await wait(900);
  }
  async function p_walk() {
    review(); cap('Jay’s review: Below, 100 skill points. There’s no test behind the plan.');
    await wait(1400);
    await want($('#rvCo'), 'Ask Navid what to fix. Press Walk me through it.');
    panel({ tone: 'warn', say: 'walk_worst2', data: [['Below', '✦ 100 today'], ['0', 'tests behind the plan']] });
    good({ good: '<p class="gq">I’ll test the router on 200 real leads from September and report the share routed in under two minutes, by Thursday.</p>', pts: [100, 3000, 'With a test'] });
    cap('Navid is talking. Tap his face to skip ahead.');
    await say('walk_worst2');
    var c = await choose([['go', 'Practise it'], ['ok', 'Got it']]);
    if (c === 'go') {
      var x = $('#sdX'); x.innerHTML = '<div class="sd-dr" id="sdDr"><span class="k">Tell Jay how you will test it, in two lines</span><p id="drT"><span class="ph">Click to answer</span></p></div>';
      cap('Navid is talking. Tap his face to skip ahead.');
      await say('drill_test_in');
      await want($('#sdDr'), 'Your turn. Click the box and answer in two lines.');
      $('#drT').textContent = '';
      await type($('#drT'), 'I’ll test on 200 September leads. I’ll report the share routed under two minutes, by Thursday.', 24); await wait(300);
      $('#sdDr').classList.add('ok');
      await say('drill_test_ok'); await choose([['ok', 'Got it']]);
    }
    await panelClose();
  }
  async function p_level() {
    homeView(); H.ST.pts = 100; H.refresh();
    cap('Back home. Rank 1, 100 skill points. A day of work does not rank you up. Great work does.');
    await wait(900); H.gain(100); await wait(1200);
    await coach({ tone: 'good', tease: 'Still Rank 1. Here is how you rank up', say: 'ask_level', data: [['Rank 1', '100 skill points'], ['2,900', 'to Rank 2']],
      good: '<ul><li>Fewer holds: every one you avoid is points you keep</li><li>Test before you send</li><li>One Exceptional scenario is Rank 2</li></ul>', pts: [100, 3000, 'Exceptional next'],
      cap: 'Navid pulses green. Click his face to see how you rank up.' });
    var c = await choose([['ok', 'Got it'], ['why', 'Why so many nudges?']]);
    if (c === 'why') { $('#sdX').innerHTML = ''; await say('wise'); await choose([['ok', 'Okay, got it']]); }
    await panelClose();
  }
  async function p_recap() {
    homeView(); H.ST.pts = 100; H.refresh();
    cap('End of day one.'); await wait(700);
    await coach({ tone: 'good', tease: 'What you fixed today', say: 'recap_worst', data: [['4', 'habits fixed today'], ['+100', 'skill points']],
      good: '<ul class="done"><li>Notes</li><li>First message</li><li>The file</li><li>The plan</li></ul>', cap: 'Navid pulses one last time. Click his face.' });
    $('#sdX').innerHTML = '';
    await say('day_feel');
    var c = await choose([['hard', 'Hard, but clearer'], ['easy', 'Easy']], 'How did today feel? Pick one.');
    if (c === 'hard') await say('thanks_day');
    else { var p = $('#sdP'); if (p) p.innerHTML = '<span class="on">Then the next one should push you harder. See you there.</span>'; await wait(1600); }
    await choose([['ok', 'See you tomorrow']]);
    await panelClose();
  }

  /* ---------- the controls, outside the app ---------- */
  function reset() {
    cancelWant();
    H.clearAll(); H.reset('mid'); H.coachOn(true);
    H.ST.pts = 0; H.ST.cur = 0; H.ST.stage = 0; H.ST.done = 0; H.ST.tips = [];
    H.refresh(); H.setOpen(false); homeView(); unpulse(); STRIP = null;
    var cs = $('#cside'); cs.hidden = true; cs.innerHTML = ''; scr().classList.remove('siding');
    $('#lvup').hidden = true; if (AUD) { try { AUD.pause(); } catch (e) {} AUD = null; }
    setTimeout(H.world, 30);
  }
  async function go(m) {
    J.run++; var tok = J.run; J.m = m; J.done = false;
    reset(); drawBar();
    try {
      for (var i = m; i < POINTS.length; i++) {
        J.m = i; drawBar();
        if (i > m) { var g = POINTS[i].gap == null ? 700 : POINTS[i].gap; if (g) await wait(g); }
        await POINTS[i].run();
        alive(tok);
      }
      J.done = true; drawBar();
      cap('That is day one with the coach. Press restart to play it again.');
    } catch (e) { if (!(e instanceof Stop)) { console.error(e); window.__err = String(e && e.stack || e); cap('Something slipped. Press restart.'); } }
  }
  J.drawBar = drawBar; J.onFinish = function () {}; J.replay = function () {}; J.feedback = function () {};
  J.targets = function () { return W ? W.els.slice() : []; };
  function drawBar() {
    var tl = $('#tl');
    if (tl) {
      if (!tl.children.length) tl.innerHTML = POINTS.map(function (p, i) { return '<button type="button" data-m="' + i + '" class="' + p.tone + '"><i></i><span>' + p.k + '</span></button>'; }).join('');
      $$('button', tl).forEach(function (b, i) { b.classList.toggle('on', i === J.m && !J.done); b.classList.toggle('past', i < J.m || J.done); });
    }
    var r = $('#run'); if (!r) return;
    if (!$('#runCap', r)) {
      r.innerHTML = '<span class="st cap" id="runCap"></span>' +
        '<button type="button" data-jr="prev" aria-label="Previous point">' + I.prev + '</button>' +
        '<button type="button" data-jr="next" aria-label="Next point">' + I.next + '</button>' +
        '<button type="button" data-jr="again" aria-label="Start over">' + I.again + '</button>' +
        '<button type="button" data-jr="snd" aria-label="Mute">' + I.snd + '</button>';
    }
    $('#runCap').textContent = J.cap || '';
    var sb = $('[data-jr="snd"]', r); sb.innerHTML = J.sound ? I.snd : I.mute; sb.setAttribute('aria-label', J.sound ? 'Mute' : 'Sound on');
    var v = $('#variant'); if (v) v.innerHTML = '';
  }
  document.getElementById('dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.jr;
    if (a === 'next') go(Math.min(POINTS.length - 1, J.m + 1));
    if (a === 'prev') go(Math.max(0, J.m - 1));
    if (a === 'again') go(0);
    if (a === 'snd') { J.sound = !J.sound; if (AUD) AUD.muted = !J.sound; drawBar(); }
  });
  document.getElementById('tl').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) go(+b.dataset.m); });

  var m0 = 0;
  try { var q = new URLSearchParams(location.search); if (q.get('m')) m0 = Math.max(0, Math.min(POINTS.length - 1, +q.get('m') || 0)); } catch (e) {}
  go(m0);
  window.__ready = true;
})();
