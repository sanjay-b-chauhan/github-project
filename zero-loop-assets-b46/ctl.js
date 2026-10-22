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
      var took = window.CFG && CFG.notes === 'took';   /* b31: notes taken = he stays quiet at the notes and at the check */
      (b.cc || []).forEach(function (c) { if (c.click && c.at === 'pre' && !(took && c.quietIfNotes)) out.push({ i: i, id: c.id }); });
      if (d.notesMode === 'auto2' && !took) out.push({ i: i, id: 'notes_hold' });
      (d.chat || []).forEach(function (m) { if (m.hold) out.push({ i: i, id: m.hold.id }); });
      if (d.submit && d.submit.hold) out.push({ i: i, id: d.submit.hold.id });
      (b.cc || []).forEach(function (c) { if (c.click && c.at !== 'pre' && !(took && c.quietIfNotes)) out.push({ i: i, id: c.id }); });
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
    P.halt = false;
    J.go(M[k].i, { cut: true, jump: true });
    show(M[k].i);
  }
  function mount(el) {
    root = el;
    veil = document.createElement('div'); veil.className = 'ct-veil'; document.body.appendChild(veil);
    /* b26: no play, no speed. Click a point and Navid comes in there; that is the only thing that ever runs */
    /* b29: previous and next step through the moments; the gear holds every setting */
    el.innerHTML = (window.CTMODE ? CTMODE(false) : '') + '<button class="ct-xp" aria-label="Level simulator" aria-expanded="false"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h6M12 5h1M3 11h1M7 11h6"/><circle cx="10.5" cy="5" r="1.5"/><circle cx="5.5" cy="11" r="1.5"/></svg><span>Simulator</span></button>' +
      '<span class="ct-turn" aria-live="polite"><i></i>Your turn</span>' +
      '<button class="ct-nx" data-d="-1" aria-label="Previous moment">' + IC.left + '</button>' +
      '<div class="ct-iv" role="group" aria-label="Where Navid steps in"></div>' +
      '<button class="ct-nx" data-d="1" aria-label="Next moment">' + IC.right + '</button>' +
      '<button class="ct-gear" aria-label="Settings" aria-expanded="false">' + IC.gear + '</button>' +
      '<button class="ct-snd" aria-label="Sound"></button>' +
      '<a class="ct-doc" href="zero-loop-coach-b46.html" target="_blank" rel="noopener">The spec</a><span class="ct-v">b46</span>' +
      '<div class="ct-tip" aria-hidden="true"></div>';
    tip = $('.ct-tip', el);
    $$('.ct-nx', el).forEach(function (b) { b.addEventListener('click', function () { var d = +b.getAttribute('data-d'); jump(cur < 0 ? (d > 0 ? 0 : 0) : cur + d); }); });
    settings(el);
    if (window.SIM) SIM.mount(el);
    /* b43 Explore: the top of the app is where it starts: your level, the leaderboard and your coach */
    setTimeout(function () {
      var sk = document.getElementById('skin'); if (!sk || $('.ex-hint')) return;
      var h = document.createElement('div'); h.className = 'ex-hint'; h.innerHTML = '<b>Start here</b><span>Your level and your coach</span>';
      sk.appendChild(h); requestAnimationFrame(function () { h.classList.add('on'); });
      document.addEventListener('pointerdown', function off() { h.classList.remove('on'); setTimeout(function () { h.remove(); }, 400); document.removeEventListener('pointerdown', off); });
    }, 900);
    $('.ct-snd', el).addEventListener('click', function () { if (window.NV) NV.setSound(!NV.sound); show(J.P.i); });
    chips(el);
  }
  function chips(el) {
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
    if (el.__keys) return; el.__keys = true;
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
  /* ---------- b29: the settings, to see every coach style, part and state ---------- */
  var CF = window.CFG || {};
  CF.entry = 'push';   /* always the push: it takes your attention (no overlay panels) */
  function apply() {
    var app = document.getElementById('app'); if (!app) return;
    ['push', 'mask', 'over'].forEach(function (k) { app.classList.toggle('nv-entry-' + k, CF.entry === k); });
    app.classList.toggle('cfg-noring', CF.ring === false);
  }
  function seg(k, label, opts) {
    return '<div class="zs-r">' + (label ? '<span>' + esc(label) + '</span>' : '') + '<div class="zs-seg" data-k="' + k + '">' + opts.map(function (o) {
      return '<button data-v="' + esc(String(o[0])) + '"' + (String(CF[k]) === String(o[0]) ? ' class="on"' : '') + '>' + esc(o[1]) + '</button>';
    }).join('') + '</div></div>';
  }
  function tog(k, label) { return '<button class="zs-t' + (CF[k] !== false ? ' on' : '') + '" data-t="' + k + '"><span>' + esc(label) + '</span><i></i></button>'; }
  function settings(el) {
    var box = document.createElement('div'); box.className = 'ct-set'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Coach settings');
    el.appendChild(box);
    function draw() {
      box.innerHTML = '<div class="zs-h"><b>Coach settings</b><span>Every style, part and state</span></div>' +
        '<div class="zs-g"><h6>In his panel</h6><div class="zs-ts">' + tog('ring', 'Timer ring') + tog('stake', 'Skill points at stake') + tog('why', 'Why? answer') + tog('good', 'What good looks like') + tog('coin', 'Coin to your level') + '</div></div>' +
        '<div class="zs-g"><h6>Navid\u2019s lines</h6>' + seg('lines', '', [['asks', 'Asks'], ['tells', 'Tells']]) + '<p class="zs-n">Asks: what he saw, one question that makes you think, one push. Tells: the lines he used to say.</p></div>' +
        '<div class="zs-g"><h6>Kickoff notes</h6>' + seg('notes', '', [['skip', 'Skipped'], ['took', 'Taken']]) + '<p class="zs-n">Skipped: he comes in about your notes. Taken: he stays quiet at the notes and at the check. No small praise.</p></div>' +
        '<div class="zs-g"><h6>Coach panel</h6>' + seg('coach', '', [['auto', 'Live'], ['0', 'Watching'], ['1', 'Stage'], ['2', 'Talk'], ['3', 'Review']]) + seg('coachPal', 'Colours', [['muted', 'Muted (b43)'], ['bright', 'Bright (b42)']]) +
          '<button class="zs-b" data-open="coach">Open the coach panel</button></div>' +
        '<div class="zs-g"><h6>Level</h6>' + seg('rankDesign', 'Level panel', [['brief', 'Condensed (b42)'], ['ladder', 'Before (b40)']]) + seg('rankView', 'Open a level (before)', [['big', 'Big view'], ['inline', 'Inline']]) + '<button class="zs-b" data-sim="1">Open the simulator</button><button class="zs-b" data-open="level">Open the level panel</button></div>';
      $$('.zs-seg button', box).forEach(function (b) { b.addEventListener('click', function () {
        var k = b.parentNode.getAttribute('data-k'), v = b.getAttribute('data-v');
        CF[k] = k === 'xp' ? +v : v; CF.save && CF.save(); draw(); changed(k);
      }); });
      $$('.zs-t', box).forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-t'); CF[k] = CF[k] === false; CF.save && CF.save(); draw(); changed(k); }); });
      $$('.zs-b', box).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); box.classList.remove('on'); $('.ct-gear', root).classList.remove('on'); if (b.getAttribute('data-sim')) { if (window.SIM) SIM.show(true); return; } if (window.DK) DK.open(b.getAttribute('data-open')); }); });
    }
    function changed(k) {
      apply();
      if (k === 'notes') { cur = -1; chips(root); show(J.P.i); }
      if (k === 'xp') { D.XP0 = CF.xp; J.P.st = J.stateAt(J.P.i); if (window.DK) DK.update(J.P.st, { quiet: true }); }
      if ((k === 'coach' || k === 'coachPal') && window.DK && DK.S.tab) DK.render(false);
      if ((k === 'rankDesign' || k === 'rankView') && window.DK && DK.S.tab === 'level') DK.render(false);
    }
    draw(); apply();
    var gear = $('.ct-gear', el);
    gear.addEventListener('click', function (e) { e.stopPropagation(); var on = !box.classList.contains('on'); if (on && window.SIM) SIM.show(false); box.classList.toggle('on', on); gear.classList.toggle('on', on); gear.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.ct-set,.ct-gear,.dk')) { box.classList.remove('on'); gear.classList.remove('on'); } });
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
