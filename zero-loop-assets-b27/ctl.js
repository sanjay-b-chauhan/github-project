/* Zero b27 prototype bar: under the app, apart from it.
   One flow, so the bar is only the intervention points: every place Navid steps in, by name, in order. Click one and
   you land on it: a short card says what triggers it while the app gets there, then Navid comes in and it stops.
   While he talks, his point fills like the ring around his face. Play, speed, sound. Nothing else. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC, n = J.n, IV = D.IV || {};
  var root, veil, tip;
  var KC = { fix: '#FF6A4D', win: '#4ADE80', brief: '#FFFFFF' };
  /* every intervention point in the flow, in order */
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
  var cur = -1, live = null, prog = 0;
  function pts(id) { var m = IV[id] || {}; return m.keep ? m.keep[0] : m.stake && m.stake.pts; }
  function jump(k) {
    var M = moments(); if (!M.length) return;
    k = Math.max(0, Math.min(M.length - 1, k));
    cur = k; live = null; prog = 0;
    var P = J.P, restore = 1, m = IV[M[k].id] || {};
    P.moment = { restore: restore, i: M[k].i, id: M[k].id };
    P.paused = false;
    veil.innerHTML = '<div class="ct-vc" style="--k:' + KC[m.kind || 'fix'] + '"><span class="ct-vn"><i></i>Intervention ' + (k + 1) + ' of ' + M.length + '</span><h4>' + esc(m.n || M[k].id) + '</h4><p>' + esc(m.trig || '') + '</p>' +
      (pts(M[k].id) ? '<em>+' + n(pts(M[k].id)) + ' skill points at stake</em>' : '') + '</div>';
    veil.classList.add('on');
    J.speed(16);                                   // the app gets there behind the card; Navid sets the speed back when he starts
    J.go(M[k].i, { cut: true });
    show(M[k].i);
  }
  function mount(el) {
    root = el;
    veil = document.createElement('div'); veil.className = 'ct-veil'; document.body.appendChild(veil);
    /* b26: no play, no speed. Click a point and Navid comes in there; that is the only thing that ever runs */
    el.innerHTML = '<span class="ct-turn" aria-live="polite"><i></i>Your turn</span>' +
      '<div class="ct-iv" role="group" aria-label="Where Navid steps in"></div>' +
      '<button class="ct-snd" aria-label="Sound"></button>' +
      '<a class="ct-doc" href="zero-loop-coach-b27.html" target="_blank" rel="noopener">The spec</a><span class="ct-v">b27</span>' +
      '<div class="ct-tip" aria-hidden="true"></div>';
    tip = $('.ct-tip', el);
    $('.ct-snd', el).addEventListener('click', function () { if (window.NV) NV.setSound(!NV.sound); show(J.P.i); });
    var M = moments();
    $('.ct-iv', el).innerHTML = M.map(function (x, k) {
      var m = IV[x.id] || {};
      return '<button data-m="' + k + '" style="--k:' + KC[m.kind || 'fix'] + '"><i></i><span>' + esc(m.n || x.id) + '</span></button>';
    }).join('');
    $$('.ct-iv button', el).forEach(function (b) {
      var k = +b.getAttribute('data-m');
      b.addEventListener('click', function () { jump(k); });
      b.addEventListener('mouseenter', function () {
        var x = moments()[k], m = IV[x.id] || {}, p = pts(x.id);
        tip.innerHTML = '<b>' + esc(m.n || x.id) + '</b><span>' + esc(m.trig || '') + '</span>' + (p ? '<em>+' + n(p) + '</em>' : '');
        tip.style.left = Math.max(8, Math.min(el.clientWidth - 340, b.offsetLeft + b.offsetWidth / 2 - 160)) + 'px';
        tip.classList.add('on');
      });
      b.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      var Mk = moments();
      if (e.key === 'ArrowRight') jump(cur < 0 ? Math.max(0, Mk.findIndex(function (m) { return m.i >= J.P.i; })) : cur + 1);
      else if (e.key === 'ArrowLeft') jump(cur <= 0 ? 0 : cur - 1);
      else if (e.key === 'm') $('.ct-snd', el).click();
    });
  }
  var SPK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.9a5.8 5.8 0 0 1 0 8.2"/></svg>';
  var MUTE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 6.2l3.4 3.6M14 6.2l-3.4 3.6"/></svg>';
  function show(i, ended) {
    if (!root) return;
    var P = J.P, b = J.beats();
    var snd = $('.ct-snd', root), on1 = !window.NV || NV.sound;
    snd.innerHTML = on1 ? SPK : MUTE; snd.classList.toggle('off', !on1); snd.setAttribute('aria-label', on1 ? 'Mute Navid' : 'Turn Navid’s voice on');
    /* where we are among the intervention points */
    var M = moments(), k = cur;
    if (P.moment) k = M.findIndex(function (m) { return m.i === P.moment.i && m.id === P.moment.id; });
    else if (live) k = M.findIndex(function (m) { return m.i === live.i && m.id === live.id; });
    if (k < 0 || (!P.moment && !live && M[k] && M[k].i > i)) { k = -1; for (var q = 0; q < M.length; q++) if (M[q].i < i) k = q; }
    var talking = !!(live && live.i === i);
    $$('.ct-iv button', root).forEach(function (x, q) {
      x.classList.toggle('on', q === k && (talking || !!P.moment));
      x.classList.toggle('past', q < k || (q === k && !talking && !P.moment));
      x.style.setProperty('--p', (q === k && talking ? Math.round(prog * 100) : 0) + '%');
    });
  }
  /* Navid calls these: a point starts, fills as his timer runs, ends */
  function at(id, i) {
    live = { id: id, i: i }; prog = 0;
    var M = moments(), k = M.findIndex(function (m) { return m.i === i && m.id === id; }); if (k >= 0) cur = k;
    if (veil) veil.classList.remove('on');
    show(i);
  }
  function progress(id, f) {
    if (!live || live.id !== id) return;
    prog = f;
    var b = $$('.ct-iv button', root)[cur]; if (b) b.style.setProperty('--p', Math.round(f * 100) + '%');
  }
  function done(id) { if (live && live.id === id) { live = null; prog = 0; show(J.P.i); } }
  /* the engine says when it is waiting for you */
  function turn(on) { var t = root && $('.ct-turn', root); if (t) t.classList.toggle('on', !!on); }
  window.CT = { turn: turn, mount: mount, show: show, moments: moments, jump: jump, at: at, done: done, prog: progress };
})();
