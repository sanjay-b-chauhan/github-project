/* Zero b15: Navid, beside your work.
   Grey in the pill when he has nothing. When he has something his face pulses in Zero's signal colour (coral: something
   to fix, green: a win) and the pill says how long it will take. Click it and the whole app shifts left, at full size,
   and Navid takes the right 30%: his voice, two or three centred lines, a ring around his face that counts down, what is
   at stake in skill points, and two answers. Why? gives the reason and what good looks like. The fix happens in the app
   while he watches, and the points he kept fly into the level pill. */
(function () {
  'use strict';
  var J = window.J, D = J.D, A = D.A, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC, n = J.n;
  var ZV = window.ZV || {}, IV = D.IV || {};
  var NV = { pending: null, pendingC: null, played: [], sound: true, root: null, open: false, ac: null };
  var KC = { fix: '#FF6A4D', win: '#4ADE80', brief: '#FFFFFF' };

  function face() { return $('.dk .seg.co .me'); }
  function CO() { return window.DK ? DK.CO() : D.COACH; }
  function iv(id) { return IV[id] || {}; }

  /* ---------- how long he will take: his lines, plus a moment for each answer and each fix ---------- */
  function est(steps, pri) {
    var t = 0;
    (steps || []).forEach(function (st) {
      if (st.say) t += (ZV[st.say] ? ZV[st.say].d : 3) + (st.hold == null ? .5 : st.hold / 1000);
      else if (st.opts) {
        t += 1.9;
        var k = pri ? Math.max(0, st.opts.findIndex(function (o) { return o.pri; })) : (st.pick || 0);
        if (st.then && st.then[k]) t += est(st.then[k], pri);
      }
      else if (st.fn || st.fix) t += st.est || 4.5;
      else if (st.drill) t += (ZV[st.drill.say] ? ZV[st.drill.say].d : 5) + (ZV[st.drill.ok] ? ZV[st.drill.ok].d : 3) + 5;
      else if (st.feedback) t += 7;
      else if (st.ask) t += 2.5 + (ZV[st.ask.answer] ? ZV[st.ask.answer].d : 5);
      else if (st.path || st.grade) t += 1.5;
      else if (st.good) t += 1;
      else if (st.kept) t += 1.6;
    });
    return t;
  }
  function secs(t) { return Math.max(1, Math.round(t)) + 's'; }
  function clock(t) { t = Math.max(0, Math.ceil(t)); return '0:' + (t < 10 ? '0' : '') + t; }

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
      setTimeout(function () { cap.innerHTML = '<p>' + html + '</p>'; spans = $$('span', cap); sp = p[0]; cap.classList.remove('nv-swap'); cap.classList.add('nv-cin'); }, k === 0 ? 0 : 200);
    }
    var a = null, an = null, buf = null;
    if (!(J.P.moment && !J.P.moment.hit)) {
      a = new Audio(A + 'voice/' + id + '.mp3'); a.crossOrigin = 'anonymous'; a.muted = !NV.sound; NV.audio = a;
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
        for (var k = pages.length - 1; k > pi; k--) if (L.w[pages[k][0]][0] <= t) { showPage(k); break; }
        for (var i = 0; i < spans.length; i++) { var wd = L.w[sp + i]; if (wd) spans[i].classList.toggle('on', wd[0] <= t); }
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

  /* ---------- the face in the pill: grey, or pulsing in the signal colour with how long it takes ---------- */
  function pulse(id, c) { NV.pending = id; NV.pendingC = c || null; paint(); }
  function clear() { NV.pending = null; NV.pendingC = null; paint(); }
  function paint() {
    var f = face(); if (!f) return;
    var co = $('.dk .seg.co'); if (!co) return;
    var m = iv(NV.pending), kind = m.kind || 'fix';
    f.classList.toggle('nv-has', !!NV.pending);
    co.classList.toggle('nv-wants', !!NV.pending);
    co.setAttribute('data-kind', kind);
    co.style.setProperty('--nvk', KC[kind]);
    co.setAttribute('aria-label', NV.pending ? 'Navid has something for you' : 'Your coach');
    var u = $('.upt', co);
    if (u) {
      if (NV.pending && NV.pendingC) {
        u.innerHTML = '<i>Navid · ' + secs(est(NV.pendingC.steps, true)) + '</i><b>' + esc(m.hook || 'Got a sec?') + '</b>';
        u.classList.add('on', 'nv-tag');
      } else u.classList.remove('on', 'nv-tag');
    }
    if (window.DK && !DK.S.tab) setTimeout(function () { try { DK.fit(); } catch (e) {} }, 0);
  }

  /* ---------- the side: the app shifts left at full size, Navid takes the right 30% ---------- */
  var R = 41, CIRC = 2 * Math.PI * R;
  function mount(app) {
    NV.root = app;
    var el = document.createElement('aside'); el.className = 'nv-side'; el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="nv-in"><div class="nv-face"><svg class="nv-tm" viewBox="0 0 92 92" aria-hidden="true"><circle class="nv-tb" cx="46" cy="46" r="' + R + '"/><circle class="nv-tf" cx="46" cy="46" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '"/></svg><span class="nv-ring"></span><img alt="" src="' + CO().photo + '"></div>' +
      '<div class="nv-tag2"><b>' + esc(CO().name) + '</b><span class="nv-tl"></span></div>' +
      '<div class="nv-cap"></div><div class="nv-stk"></div><div class="nv-x"></div><div class="nv-act"></div></div>';
    app.insertBefore(el, $('.cur', app));
    NV.side = el;
    document.addEventListener('jbeat', function (e) { shut(true); setTimeout(function () { sync(e.detail.i); }, 0); });
    addEventListener('resize', function () { if (NV.open) frame(); });
  }
  function frame() {
    var app = NV.root, W = app.clientWidth, side = Math.round(W * .3);
    app.style.setProperty('--side', side + 'px');
    app.style.setProperty('--skx', -side + 'px');
  }
  function rectIn(el) {
    var app = NV.root, z = parseFloat(app.style.zoom) || 1, r = el.getBoundingClientRect(), ar = app.getBoundingClientRect();
    return { x: (r.left - ar.left) / z, y: (r.top - ar.top) / z, w: r.width / z, h: r.height / z };
  }
  /* his face travels from the pill to the panel, and back */
  function fly(fromEl, toEl) {
    var a = rectIn(fromEl), b = rectIn(toEl), c = document.createElement('div'); c.className = 'nv-fly';
    c.innerHTML = '<img alt="" src="' + CO().photo + '">';
    c.style.cssText = 'left:' + a.x + 'px;top:' + a.y + 'px;width:' + a.w + 'px;height:' + a.h + 'px';
    NV.root.appendChild(c);
    void c.offsetWidth;
    c.style.transform = 'translate(' + (b.x - a.x) + 'px,' + (b.y - a.y) + 'px) scale(' + (b.w / a.w) + ')';
    setTimeout(function () { c.remove(); }, 820);
  }

  /* ---------- the timer around his face: how long this takes, counting down ---------- */
  function timer(V, c) {
    var T = { total: est(c.steps, true), used: 0, id: c.id, stop: false };
    var tf = $('.nv-tf', V.el), tl = $('.nv-tl', V.el), last = performance.now();
    V.T = T;
    tf.style.stroke = KC[iv(c.id).kind || 'fix'];
    (function tick() {
      if (T.stop) return;
      var now = performance.now(), dt = (now - last) / 1000; last = now;
      if (V.manual || !J.P.paused) T.used += dt * (V.manual ? 1 : J.P.speed);
      var left = Math.max(.6, T.total - T.used), f = Math.min(1, T.used / T.total);
      tf.style.strokeDashoffset = (CIRC * f).toFixed(2);
      tl.textContent = clock(left) + ', then back to work';
      if (window.CT && CT.prog) CT.prog(c.id, f);
      requestAnimationFrame(tick);
    })();
    return T;
  }
  /* an answer that is not the quick one (Why?) adds its own time, and says so */
  function extend(V, then) {
    if (!V.T || !then) return;
    var add = est(then, false); V.T.total += add;
    var tl = $('.nv-tl', V.el); tl.classList.remove('nv-plus'); void tl.offsetWidth; tl.classList.add('nv-plus');
  }

  async function openSide(s, c) {
    var app = NV.root; frame();
    if (window.DK) DK.close();
    clear();
    var V = { el: NV.side, cap: $('.nv-cap', NV.side), stk: $('.nv-stk', NV.side), act: $('.nv-act', NV.side), x: $('.nv-x', NV.side), face: $('.nv-face', NV.side), id: c.id, manual: s.manual };
    V.cap.innerHTML = ''; V.act.innerHTML = ''; V.x.innerHTML = ''; V.stk.innerHTML = ''; V.stk.className = 'nv-stk';
    $('.nv-face img', NV.side).src = CO().photo;
    NV.side.setAttribute('data-kind', iv(c.id).kind || 'fix');
    timer(V, c);
    app.classList.add('nv-open'); NV.open = true;
    var f = face();
    if (f) { f.classList.add('nv-gone'); setTimeout(function () { fly(f, V.face); }, 140); }
    await s.wait(900);
    NV.side.classList.add('nv-on');
    await s.wait(300);
    return V;
  }
  async function closeSide(s, V) {
    var app = NV.root, f = face();
    if (V.T) V.T.stop = true;
    V.act.innerHTML = ''; V.x.innerHTML = '';
    NV.side.classList.remove('nv-on');
    await s.wait(260);
    app.classList.remove('nv-open'); NV.open = false;
    if (f) { setTimeout(function () { fly(V.face, f); }, 80); setTimeout(function () { f.classList.remove('nv-gone'); }, 900); }
    if (window.CT && CT.prog) CT.prog(V.id, 1);
    await s.wait(900);
  }
  function shut() {
    if (!NV.root) return;
    NV.root.classList.remove('nv-open'); NV.open = false;
    if (NV.side) NV.side.classList.remove('nv-on');
    var f = face(); if (f) f.classList.remove('nv-gone');
    $$('.nv-fly,.nv-coin').forEach(function (x) { x.remove(); });
  }

  /* ---------- what is at stake, what good looks like, what he kept ---------- */
  var COIN = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6l1 2.1 2.3.3-1.7 1.6.4 2.3L8 9.8l-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="currentColor"/></svg>';
  function stakeHTML(id) {
    var m = iv(id), st = m.stake, pts = m.keep ? m.keep[0] : st && st.pts, t = typeof st === 'string' ? st : st && st.t;
    if (!pts) return '';
    return COIN + '<b>+' + n(pts) + ' skill points</b><span>' + esc(t || '') + '</span>';
  }
  function goodHTML(id) {
    var g = iv(id).good, m = iv(id); if (!g) return '';
    var me = '<img class="nv-gme" alt="" src="' + A + 'img/sanjay.jpg">', body = '';
    if (g.k === 'msg') body = '<div class="nv-gmsg">' + (g.file ? '<span class="nv-gf">' + IC.doc + esc(g.file) + '</span>' : '') + '<p>' + esc(g.t) + '</p></div>';
    else if (g.k === 'note') body = '<div class="nv-gnote"><i>' + IC.tick + '</i><p>' + esc(g.t) + '</p></div>';
    else if (g.k === 'answer') body = '<div class="nv-gq">' + J.face(D.P.jay, 22) + '<p>' + esc(g.q) + '</p></div><div class="nv-gmsg"><p>' + esc(g.t) + '</p></div>';
    else if (g.k === 'pages') body = '<div class="nv-gpg">' + g.t.map(function (t, i) { return '<span><em>' + (i + 1) + '</em>' + esc(t) + '</span>'; }).join('') + '</div>';
    else if (g.k === 'say') body = '<div class="nv-gsay">' + g.t.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('<i>pause</i>') + '</div>';
    var pts = m.keep ? m.keep[0] : m.stake && m.stake.pts;
    return '<div class="nv-good"><div class="nv-gh"><span>What good looks like</span>' + (pts ? '<em>' + COIN + '+' + n(pts) + '</em>' : '') + '</div>' + body + '</div>';
  }
  function gradeHTML() {
    return '<div class="nv-grade"><div class="nv-gh"><span>What Jay grades here</span></div>' + (D.GRADE || []).map(function (g) {
      return '<div class="nv-gr"><div><b>' + esc(g[0]) + '</b><span>' + esc(g[1]) + '</span></div><em>' + COIN + 'up to ' + n(g[2]) + '</em></div>';
    }).join('') + '<p class="nv-gt">All three: <b>3,000 skill points</b>, Rank 1 to Rank 4.</p></div>';
  }
  /* the points he kept: the stake turns green, and a coin flies into the level pill */
  async function kept(s, V) {
    var m = iv(V.id); if (!m.keep) return;
    var pts = m.keep[0];
    V.stk.className = 'nv-stk in nv-kept';
    V.stk.innerHTML = IC.tick + '<b>+' + n(pts) + ' ' + (m.earned ? 'earned' : 'kept') + '</b><span>' + esc(m.keep[1]) + '</span>';
    var lv = $('.dk .seg.lv');
    if (lv && !(J.P.moment && !J.P.moment.hit)) {
      var a = rectIn(V.stk), b = rectIn(lv), c = document.createElement('div'); c.className = 'nv-coin';
      c.innerHTML = COIN + '+' + n(pts);
      c.style.cssText = 'left:' + (a.x + a.w / 2 - 34) + 'px;top:' + a.y + 'px';
      NV.root.appendChild(c); void c.offsetWidth;
      c.style.transform = 'translate(' + (b.x + 14 - (a.x + a.w / 2 - 34)) + 'px,' + (b.y + 8 - a.y) + 'px) scale(.6)';
      /* the coin lands before anything moves on, at any speed */
      await new Promise(function (r) { setTimeout(r, 900); });
      c.remove(); if (window.DK && DK.kept) DK.kept(pts);
    } else if (window.DK && DK.kept) DK.kept(pts);
    await s.wait(1100);
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
      var pick = st.pick || 0, b = $$('.nv-key', V.act)[pick];
      pick = await s.press(b, 160, V.act); if (typeof pick !== 'number') pick = st.pick || 0;
      s.hideCursor();
      b = $$('.nv-key', V.act)[pick]; if (b) b.classList.add('chosen');
      await s.wait(250);
      V.act.innerHTML = '';
      var then = st.then && st.then[pick];
      if (then && !(st.opts[pick] && st.opts[pick].pri)) extend(V, then);
      if (then) for (var k = 0; k < then.length; k++) await step(s, then[k], V);
      return;
    }
    if (st.stake) { V.stk.innerHTML = stakeHTML(V.id); requestAnimationFrame(function () { V.stk.classList.add('in'); }); await s.wait(500); return; }
    if (st.good) { V.x.innerHTML = goodHTML(V.id); requestAnimationFrame(function () { V.x.classList.add('nv-xin'); }); await s.wait(900); return; }
    if (st.grade) { V.x.innerHTML = gradeHTML(); requestAnimationFrame(function () { V.x.classList.add('nv-xin'); }); await s.wait(1400); return; }
    if (st.kept) { await kept(s, V); return; }
    if (st.path) { V.x.innerHTML = pathHTML(st.path); requestAnimationFrame(function () { V.x.classList.add('nv-xin'); var f = $('.nv-pf i', V.x); if (f) f.style.width = f.getAttribute('data-w'); }); await s.wait(st.path.hold || 600); return; }
    if (st.drill) { await drill(s, st.drill, V); return; }
    if (st.feedback) { await feedback(s, st.feedback, V); return; }
    if (st.ask) { await ask(s, st.ask, V); return; }
    if (st.fn) { V.act.innerHTML = ''; await st.fn(s, V); await s.wait(400); return; }
  }

  function pathHTML(p) {
    var goal = p.goal || 6, top = Math.max(goal, p.at), pct = Math.round((p.at - 1) / (top - 1) * 100), dots = '';
    for (var k = 1; k <= top; k++) dots += '<span class="' + (k <= p.at ? 'got' : '') + (k === goal ? ' goal' : '') + '" style="left:' + ((k - 1) / (top - 1) * 100) + '%"></span>';
    return '<div class="nv-path"><div class="nv-pt"><span>Rank ' + p.at + '</span><b>' + esc(p.goalName || 'GTM Engineer') + ' · Rank ' + goal + '</b></div>' +
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

  /* how did it feel: one tap, a line, sent */
  async function feedback(s, f, V) {
    V.x.innerHTML = '<div class="nv-fb"><div class="nv-fbo">' + f.opts.map(function (o, i) { return '<button data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<div class="nv-fin"><p class="nv-ft"></p><button class="nv-send">Send</button></div></div>';
    requestAnimationFrame(function () { V.x.classList.add('nv-xin'); });
    await s.wait(900);
    var pick = await s.press($$('.nv-fbo button', V.x)[f.pick || 0], 150, $('.nv-fbo', V.x));
    if (typeof pick !== 'number') pick = f.pick || 0;
    var b = $$('.nv-fbo button', V.x)[pick]; b.classList.add('on');
    await s.wait(300);
    await s.press($('.nv-fin', V.x), 80); s.hideCursor();
    await s.type($('.nv-ft', V.x), typeof f.text === 'string' ? f.text : (f.text[pick] || ''), 38);
    await s.wait(300);
    await s.press($('.nv-send', V.x), 200); s.hideCursor();
    V.x.innerHTML = '<div class="nv-sent">' + IC.tick + 'Sent to Navid</div>';
    if (f.thanks) { await s.wait(300); await speak(s, f.thanks[pick] || f.thanks.d, V); }
  }

  /* a first taste of asking him: three questions he can answer now, chat comes later */
  async function ask(s, q, V) {
    V.cap.innerHTML = '<p><span class="on">Ask me anything about where you are.</span></p>';
    V.x.innerHTML = '<div class="nv-ask">' + q.q.slice(0, 1).map(function (t, i) { return '<button data-i="' + i + '">' + esc(t) + '</button>'; }).join('') +
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
    if (c.alt && J.P.notesGood) c = c.alt;
    if (c.fx) s.fx();
    var target = J.P.moment && J.P.moment.id === c.id;
    if (target) { J.speed(J.P.moment.restore); J.P.moment.hit = true; }
    if (window.CT && CT.at && c.click && (!J.P.moment || J.P.moment.hit)) CT.at(c.id, J.P.i);
    pulse(c.id, c);
    if (!c.click) return;                              // ignored: he keeps pulsing
    if (c.auto) await s.wait(1100);                    // the third time he does not wait to be asked
    else { await s.wait(c.delay || 2000); await s.press($('.dk .seg.co') || face(), 140); }
    var V = await openSide(s, c);
    try {
      for (var i = 0; i < c.steps.length; i++) await step(s, c.steps[i], V);
    } finally {
      if (NV.open) await closeSide(s, V).catch(function () { shut(); });
    }
    if (window.CT && CT.done) CT.done(c.id);
    if (target && J.P.moment && J.P.moment.hit) { J.P.moment = null; if (!J.P.live) J.pause(true); }
  }
  function sync(i) {
    var b = J.beats(), ch = b[i] && b[i].ch, pend = null;
    for (var k = 0; k < i; k++) { if (b[k].ch !== ch || !b[k].cc) continue; b[k].cc.forEach(function (c) { pend = c.kind === 'side' && !c.click ? c.id : null; }); }
    NV.pending = pend; NV.pendingC = null; paint();
  }
  function reset() { NV.pending = null; NV.pendingC = null; shut(); paint(); }

  /* the viewer clicks a pulsing face themselves: he plays it, they answer */
  function manual() {
    var id = NV.pending, c = NV.pendingC; if (!id || !c) return false;
    var was = J.P.paused; J.pause(true);
    var h = { manual: true, wait: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
      press: function (el, ms, group) {
        if (group) return new Promise(function (r) { $$('.nv-key', group).forEach(function (b, i) { b.addEventListener('click', function () { r(i); }, { once: true }); }); });
        return new Promise(function (r) { el.addEventListener('click', r, { once: true }); });
      }, hideCursor: function () {}, fx: function () {}, type: function (el, t) { el.textContent = t; return Promise.resolve(); } };
    (async function () {
      var V = await openSide(h, c); V.manual = true;
      try { for (var i = 0; i < c.steps.length; i++) await step(h, c.steps[i], V); } finally { await closeSide(h, V); J.P.paused = was; if (window.CT) CT.show(J.P.i); }
    })();
    return true;
  }

  /* the speaker in the bar */
  NV.setSound = function (v) { NV.sound = !!v; if (NV.audio) NV.audio.muted = !NV.sound; };
  NV.est = est;
  NV.mount = mount; NV.run = run; NV.pulse = pulse; NV.clear = clear; NV.speak = speak; NV.reset = reset; NV.paint = paint; NV.manual = manual; NV.shut = shut;
  window.NV = NV;
})();
