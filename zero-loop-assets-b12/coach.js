/* Zero b11: Navid, beside your work.
   Grey in the pill when he has nothing. When he has something his face lights up and blinks.
   Click it and the whole app slides left; the right 30% turns black and Navid is there: his voice, two or three
   centred lines at a time, then two answers (Got it, Why?). Got it, and the app slides back and you carry on.
   His own voice (ElevenLabs nd1Ukim1avaQS5P3O5dn), timings in voice.js. Same language as the in-app tutorial:
   the serif for what he says, white keys for what you answer, the ring that moves with his voice. */
(function () {
  'use strict';
  var J = window.J, D = J.D, A = D.A, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var ZV = window.ZV || {};
  var NV = { pending: null, played: [], sound: true, root: null, open: false, ac: null };

  function face() { return $('.dk .seg.co .me'); }
  function CO() { return window.DK ? DK.CO() : D.COACH; }

  /* ---------- his voice: the ring follows it, the captions follow it two or three lines at a time ---------- */
  function analyser(a) {
    try {
      if (!NV.ac) NV.ac = new (window.AudioContext || window.webkitAudioContext)();
      if (NV.ac.state === 'suspended') NV.ac.resume();
      var src = NV.ac.createMediaElementSource(a), an = NV.ac.createAnalyser();
      an.fftSize = 512; src.connect(an); an.connect(NV.ac.destination);
      return an;
    } catch (e) { return null; }
  }
  async function speak(s, id, V) {
    var L = ZV[id]; if (!L) return;
    var man = !!V.manual, cap = V.cap, ring = V.face, pages = L.p || [[0, L.w.length - 1]], pi = -1, spans = [], sp = 0;
    function showPage(k) {
      pi = k; var p = pages[k];
      var html = L.w.slice(p[0], p[1] + 1).map(function (w) { return '<span>' + esc(w[2]) + '</span>'; }).join(' ');
      cap.classList.remove('nv-cin'); cap.classList.add('nv-swap');
      setTimeout(function () { cap.innerHTML = '<p>' + html + '</p>'; spans = $$('span', cap); sp = p[0]; cap.classList.remove('nv-swap'); cap.classList.add('nv-cin'); }, k === 0 ? 0 : 180);
    }
    var a = null, an = null, buf = null;
    if (NV.sound) {
      a = new Audio(A + 'voice/' + id + '.mp3'); a.crossOrigin = 'anonymous';
      a.playbackRate = man ? 1 : J.P.speed;
      an = analyser(a); if (an) buf = new Uint8Array(an.fftSize);
      try { await a.play(); } catch (e) { a = null; }
    }
    showPage(0);
    if (ring) ring.classList.add('nv-talk');
    var t = 0, last = performance.now();
    try {
      while (t < L.d + 0.05) {
        await s.wait(45);
        var now = performance.now(), dt = (now - last) / 1000; last = now;
        var paused = man ? false : J.P.paused, spd = man ? 1 : J.P.speed;
        if (a) {
          if (paused) { if (!a.paused) a.pause(); }
          else { if (a.playbackRate !== spd) a.playbackRate = spd; if (a.paused && !a.ended) a.play().catch(function () {}); }
          t = a.ended ? L.d + 1 : a.currentTime;
        } else if (!paused) t += dt * spd;
        /* the page turns when he starts its first word */
        for (var k = pages.length - 1; k > pi; k--) if (L.w[pages[k][0]][0] <= t) { showPage(k); break; }
        for (var i = 0; i < spans.length; i++) { var wd = L.w[sp + i]; if (wd) spans[i].classList.toggle('on', wd[0] <= t); }
        /* the ring: how loud he is, right now */
        var amp = 0;
        if (an && a && !a.paused) { an.getByteTimeDomainData(buf); var sum = 0; for (var j = 0; j < buf.length; j++) { var v = (buf[j] - 128) / 128; sum += v * v; } amp = Math.min(1, Math.sqrt(sum / buf.length) * 5); }
        else if (!a && !paused) amp = .35 + .3 * Math.sin(now / 90);
        if (ring) ring.style.setProperty('--amp', amp.toFixed(3));
      }
    } finally {
      if (a) { try { a.pause(); } catch (e) {} }
      if (ring) { ring.classList.remove('nv-talk'); ring.style.setProperty('--amp', 0); }
      spans.forEach(function (x) { x.classList.add('on'); });
    }
    if (NV.played.indexOf(id) < 0) NV.played.unshift(id);
  }

  /* ---------- the face in the pill: grey, or lit and blinking ---------- */
  function pulse(id) { NV.pending = id; paint(); }
  function clear() { NV.pending = null; paint(); }
  function paint() {
    var f = face(); if (!f) return;
    f.classList.toggle('nv-has', !!NV.pending);
    var co = $('.dk .seg.co'); if (!co) return;
    co.classList.toggle('nv-wants', !!NV.pending);
    co.setAttribute('aria-label', NV.pending ? 'Navid has something for you' : 'Your coach');
    var u = $('.upt', co);
    if (u) { if (NV.pending) { u.innerHTML = '<i>Navid</i><b>Got a sec?</b>'; u.classList.add('on', 'nv-tag'); } else { u.classList.remove('on', 'nv-tag'); } }
    if (window.DK && !DK.S.tab) setTimeout(function () { try { DK.fit(); } catch (e) {} }, 0);
  }

  /* ---------- the side: the app slides left, Navid has the right 30% ---------- */
  function mount(app) {
    NV.root = app;
    var el = document.createElement('aside'); el.className = 'nv-side'; el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="nv-in"><div class="nv-face"><span class="nv-ring"></span><img alt="" src="' + CO().photo + '"></div>' +
      '<div class="nv-tag2"><b>' + esc(CO().name) + '</b><span>Your coach</span></div>' +
      '<div class="nv-cap"></div><div class="nv-x"></div><div class="nv-act"></div></div>';
    app.insertBefore(el, $('.cur', app));
    NV.side = el;
    document.addEventListener('jbeat', function (e) { shut(true); setTimeout(function () { sync(e.detail.i); }, 0); });
    addEventListener('resize', function () { if (NV.open) frame(); });
  }
  function frame() {
    var app = NV.root, W = app.clientWidth, H = app.clientHeight, side = Math.round(W * .3), pad = 16;
    var s = Math.min((W - side - pad * 2) / W, (H - pad * 2) / H);
    app.style.setProperty('--sk', s.toFixed(4));
    app.style.setProperty('--skx', pad + 'px');
    app.style.setProperty('--sky', Math.round((H - H * s) / 2) + 'px');
    app.style.setProperty('--side', side + 'px');
  }
  function rectIn(el) {
    var app = NV.root, z = parseFloat(app.style.zoom) || 1, r = el.getBoundingClientRect(), ar = app.getBoundingClientRect();
    return { x: (r.left - ar.left) / z, y: (r.top - ar.top) / z, w: r.width / z, h: r.height / z };
  }
  /* his face travels from the pill to the panel, and back */
  function fly(fromEl, toEl, back) {
    var a = rectIn(fromEl), b = rectIn(toEl), c = document.createElement('div'); c.className = 'nv-fly';
    c.innerHTML = '<img alt="" src="' + CO().photo + '">';
    c.style.cssText = 'left:' + a.x + 'px;top:' + a.y + 'px;width:' + a.w + 'px;height:' + a.h + 'px';
    NV.root.appendChild(c);
    void c.offsetWidth;
    c.style.transform = 'translate(' + (b.x - a.x) + 'px,' + (b.y - a.y) + 'px) scale(' + (b.w / a.w) + ')';
    setTimeout(function () { c.remove(); }, 820);
  }
  async function openSide(s) {
    var app = NV.root; frame();
    if (window.DK) DK.close();
    clear();
    var V = { el: NV.side, cap: $('.nv-cap', NV.side), act: $('.nv-act', NV.side), x: $('.nv-x', NV.side), face: $('.nv-face', NV.side) };
    V.cap.innerHTML = ''; V.act.innerHTML = ''; V.x.innerHTML = '';
    $('.nv-face img', NV.side).src = CO().photo;
    app.classList.add('nv-open'); NV.open = true;
    var f = face();
    if (f) { f.classList.add('nv-gone'); setTimeout(function () { fly(f, V.face); }, 120); }
    await s.wait(900);
    NV.side.classList.add('nv-on');
    await s.wait(300);
    return V;
  }
  async function closeSide(s, V) {
    var app = NV.root, f = face();
    V.act.innerHTML = ''; V.x.innerHTML = '';
    NV.side.classList.remove('nv-on');
    await s.wait(260);
    app.classList.remove('nv-open'); NV.open = false;
    if (f) { setTimeout(function () { fly(V.face, f); }, 80); setTimeout(function () { f.classList.remove('nv-gone'); }, 900); }
    await s.wait(900);
  }
  function shut(now) {
    if (!NV.root) return;
    NV.root.classList.remove('nv-open'); NV.open = false;
    if (NV.side) NV.side.classList.remove('nv-on');
    var f = face(); if (f) f.classList.remove('nv-gone');
    $$('.nv-fly').forEach(function (x) { x.remove(); });
  }

  /* ---------- what he says, and what you answer ---------- */
  function keys(opts) {
    return '<div class="nv-keys">' + opts.map(function (o, i) { return '<button class="nv-key' + (o.pri ? ' pri' : '') + '" data-i="' + i + '">' + esc(o.t) + '</button>'; }).join('') + '</div>';
  }
  async function step(s, st, V) {
    if (st.say) { if (!st.keep) V.x.innerHTML = ''; V.act.innerHTML = ''; await speak(s, st.say, V); await s.wait(st.hold == null ? 500 : st.hold); return; }
    if (st.opts) {
      V.act.innerHTML = keys(st.opts);
      requestAnimationFrame(function () { $$('.nv-key', V.act).forEach(function (b, i) { setTimeout(function () { b.classList.add('in'); }, 80 * i); }); });
      await s.wait(st.wait || 1500);
      var b = $$('.nv-key', V.act)[st.pick || 0];
      await s.press(b, 160); s.hideCursor();
      b.classList.add('chosen');
      await s.wait(250);
      V.act.innerHTML = '';
      var then = st.then && st.then[st.pick || 0];
      if (then) for (var k = 0; k < then.length; k++) await step(s, then[k], V);
      return;
    }
    if (st.path) { V.x.innerHTML = pathHTML(st.path); requestAnimationFrame(function () { V.x.classList.add('nv-xin'); var f = $('.nv-pf i', V.x); if (f) f.style.width = f.getAttribute('data-w'); }); await s.wait(st.path.hold || 600); return; }
    if (st.drill) { await drill(s, st.drill, V); return; }
    if (st.feedback) { await feedback(s, st.feedback, V); return; }
    if (st.ask) { await ask(s, st.ask, V); return; }
    if (st.fn) { V.act.innerHTML = ''; await st.fn(s, V); await s.wait(400); return; }
  }

  function pathHTML(p) {
    var goal = p.goal || 6, top = Math.max(goal, p.at), pct = Math.round((p.at - 1) / (top - 1) * 100), dots = '';
    for (var n = 1; n <= top; n++) dots += '<span class="' + (n <= p.at ? 'got' : '') + (n === goal ? ' goal' : '') + '" style="left:' + ((n - 1) / (top - 1) * 100) + '%"></span>';
    return '<div class="nv-path"><div class="nv-pt"><span>Level ' + p.at + '</span><b>' + esc(p.goalName || 'GTM Engineer') + ' · Level ' + goal + '</b></div>' +
      '<div class="nv-pf"><i data-w="' + pct + '%"></i>' + dots + '</div><div class="nv-pe">' + esc(p.eta) + '</div></div>';
  }

  /* practice, two minutes, inside the panel */
  async function drill(s, d, V) {
    V.x.innerHTML = '<div class="nv-drill"><div class="nv-dh"><span>Practice</span><b>' + esc(d.title) + '</b></div>' +
      (d.from ? '<div class="nv-dq">' + J.face(D.P[d.from], 24) + '<p>' + esc(d.ask) + '</p></div>' : '') +
      (d.strike ? '<p class="nv-dx">' + esc(d.strike) + '</p>' : '') +
      '<div class="nv-din"><p class="nv-dt"></p></div><div class="nv-dk">' + d.checks.map(function (c) { return '<span>' + IC.tick + esc(c[0]) + '</span>'; }).join('') + '</div></div>';
    requestAnimationFrame(function () { V.x.classList.add('nv-xin'); });
    await speak(s, d.say, V);
    await s.wait(400);
    await s.press($('.nv-din', V.x), 100); s.hideCursor();
    var dt = $('.nv-dt', V.x), ks = $$('.nv-dk span', V.x), text = d.answer;
    dt.classList.add('typing');
    for (var i = 1; i <= text.length; i++) {
      dt.textContent = text.slice(0, i);
      d.checks.forEach(function (c, k) { if (!ks[k].classList.contains('on') && c[1] && new RegExp(c[1], 'i').test(text.slice(0, i))) ks[k].classList.add('on'); });
      await s.wait(text[i - 1] === ' ' ? 16 : 28);
    }
    dt.classList.remove('typing'); ks.forEach(function (k) { k.classList.add('on'); });
    await s.wait(600);
    await speak(s, d.ok, V);
  }

  /* how has Zero been: one tap, a line, sent */
  async function feedback(s, f, V) {
    V.x.innerHTML = '<div class="nv-fb"><div class="nv-fbo">' + f.opts.map(function (o, i) { return '<button data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<div class="nv-fin"><p class="nv-ft"></p><button class="nv-send">Send</button></div></div>';
    requestAnimationFrame(function () { V.x.classList.add('nv-xin'); });
    await s.wait(900);
    var b = $$('.nv-fbo button', V.x)[f.pick || 0]; await s.press(b, 150); b.classList.add('on');
    await s.wait(300);
    await s.press($('.nv-fin', V.x), 80); s.hideCursor();
    await s.type($('.nv-ft', V.x), f.text, 38);
    await s.wait(300);
    await s.press($('.nv-send', V.x), 200); s.hideCursor();
    V.x.innerHTML = '<div class="nv-sent">' + IC.tick + 'Sent to Navid</div>';
  }

  /* a first taste of asking him: three questions he can answer now, chat comes later */
  async function ask(s, q, V) {
    V.cap.innerHTML = '<p><span class="on">Ask me anything about where you are.</span></p>';
    V.x.innerHTML = '<div class="nv-ask">' + q.q.map(function (t, i) { return '<button data-i="' + i + '">' + esc(t) + '</button>'; }).join('') +
      '<div class="nv-soon">' + IC.chat + '<span>Type your own question</span><em>Soon</em></div></div>';
    requestAnimationFrame(function () { V.x.classList.add('nv-xin'); });
    await s.wait(1300);
    var b = $$('.nv-ask button', V.x)[q.pick || 0]; await s.press(b, 160); s.hideCursor();
    V.x.innerHTML = '<div class="nv-me"><p>' + esc(q.q[q.pick || 0]) + '</p></div>';
    await s.wait(500);
    await speak(s, q.answer, V);
  }

  /* ---------- what a beat asks for ---------- */
  async function run(c, s) {
    if (c.kind !== 'side') return;
    if (c.fx) s.fx();
    if (J.P.moment) { J.speed(J.P.moment.restore); J.P.moment.hit = true; }
    pulse(c.id);
    if (!c.click) return;                              // ignored: he keeps blinking
    if (c.auto) await s.wait(900);                     // the third time he does not wait to be asked
    else { await s.wait(c.delay || 1600); await s.press(face(), 140); }
    var V = await openSide(s);
    try {
      for (var i = 0; i < c.steps.length; i++) await step(s, c.steps[i], V);
    } finally {
      if (NV.open) await closeSide(s, V).catch(function () { shut(); });
    }
    /* jumped here with the Navid arrows: play the moment, then stop */
    if (J.P.moment && J.P.moment.hit) { J.P.moment = null; J.pause(true); }
  }
  function sync(i) {
    var b = J.beats(), ch = b[i] && b[i].ch, pend = null;
    for (var k = 0; k < i; k++) { if (b[k].ch !== ch || !b[k].cc) continue; b[k].cc.forEach(function (c) { pend = c.kind === 'side' && !c.click ? c.id : null; }); }
    NV.pending = pend; paint();
  }
  function reset() { NV.pending = null; shut(); paint(); }

  /* the viewer clicks a blinking face themselves: he plays it, they answer */
  function manual() {
    var id = NV.pending; if (!id) return false;
    var c = null, b = J.beats();
    for (var k = 0; k <= J.P.i; k++) (b[k].cc || []).forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return false;
    var was = J.P.paused; J.pause(true);
    var h = { wait: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); }, press: function (el) { return new Promise(function (r) { el.addEventListener('click', r, { once: true }); }); }, hideCursor: function () {}, fx: function () {}, type: function (el, t) { el.textContent = t; return Promise.resolve(); } };
    (async function () {
      var V = await openSide(h); V.manual = true;
      try { for (var i = 0; i < c.steps.length; i++) await step(h, c.steps[i], V); } finally { await closeSide(h, V); J.P.paused = was; if (window.CT) CT.show(J.P.i); }
    })();
    return true;
  }

  NV.mount = mount; NV.run = run; NV.pulse = pulse; NV.clear = clear; NV.speak = speak; NV.reset = reset; NV.paint = paint; NV.manual = manual; NV.shut = shut;
  window.NV = NV;
})();
