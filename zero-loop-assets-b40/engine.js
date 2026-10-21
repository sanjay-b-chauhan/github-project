/* Zero b12 engine: the app canvas, the story player, and the state every screen reads.
   A screen registers with J.screen(name, { theme, dock, draw(el, d, ctx), play(el, d, s, ctx) }).
   draw paints the screen as it looks when the beat starts. play animates it (async) using the s helpers,
   and the beat ends when play resolves. Every helper throws J.CANCEL when the viewer jumps, so play never needs to check. */
(function () {
  'use strict';
  var D = window.ZD, A = D.A;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var CANCEL = { cancel: true };

  /* ---------- shared pieces every screen uses ---------- */
  function logo(k, size, cls) {
    var c = D.CO[k] || [k, ''], s = size || 24;
    if (c[1] === 'png') return '<span class="lg png ' + (cls || '') + '" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><img alt="" src="' + A + 'logo/' + k + '.png"></span>';
    if (c[1] === 'svg') return '<span class="lg ' + (cls || '') + '" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><i class="mk" style="--c:' + (c[2] || '#111') + ';--m:url(' + A + 'logo/' + k + '.svg)"></i></span>';
    return '<span class="lg ltr ' + (cls || '') + '" style="--l:' + s + 'px;--c:' + (c[2] || '#111') + '" title="' + esc(c[0]) + '"><span class="lt">' + esc(c[0].charAt(0)) + '</span></span>';
  }
  function badge(lv, cls) { return '<img class="bdg ' + (cls || '') + '" alt="Rank ' + lv + ' badge" src="' + A + 'badge/b' + Math.max(1, Math.min(10, lv)) + '.webp">'; }
  function face(p, size, cls) { return '<img class="fc ' + (cls || '') + '" alt="" style="--f:' + (size || 36) + 'px" src="' + p.photo + '">'; }
  function coName(k) { return (D.CO[k] || [k])[0]; }
  var IC = {
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M3.5 10h13M10 3c2 2.2 2.9 4.6 2.9 7s-.9 4.8-2.9 7c-2-2.2-2.9-4.6-2.9-7S8 5.2 10 3z"/></svg>',
    spark: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 2.5c.5 3.6 2 5.4 7 7.5-5 2.1-6.5 3.9-7 7.5-.5-3.6-2-5.4-7-7.5 5-2.1 6.5-3.9 7-7.5z"/></svg>',
    bag: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6.5" width="14" height="10" rx="2.5"/><path d="M7.5 6.5V5.2c0-.9.7-1.7 1.7-1.7h1.6c1 0 1.7.8 1.7 1.7v1.3"/></svg>',
    gear: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.8v2M10 15.2v2M2.8 10h2M15.2 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    left: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
    right: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    tick: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    bang: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 3.5v5.5M8 12.4v.1"/></svg>',
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>',
    up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3.5M3.8 7.6 8 3.4l4.2 4.2"/></svg>',
    play: '<svg viewBox="0 0 12 12"><path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 12 12"><path d="M3 2.2h2.2v7.6H3zM6.8 2.2H9v7.6H6.8z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 12 12"><path d="M2.5 2.2h1.6v7.6H2.5zM9.8 2.2v7.6L4.6 6z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 12 12"><path d="M7.9 2.2h1.6v7.6H7.9zM2.2 2.2v7.6L7.4 6z" fill="currentColor"/></svg>',
    redo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.8v2.6h2.6"/></svg>',
    phone: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5.3 2.6 6.6 5.5c.2.4.1.9-.3 1.2l-1 .8a8.2 8.2 0 0 0 3.2 3.2l.8-1c.3-.4.8-.5 1.2-.3l2.9 1.3c.4.2.6.6.5 1l-.4 1.6c-.1.5-.5.8-1 .8C6.8 14.1 1.9 9.2 1.9 3.5c0-.5.3-.9.8-1l1.6-.4c.4-.1.8.1 1 .5z"/></svg>',
    edit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.4 3.1a1.6 1.6 0 0 1 2.3 2.3l-7.2 7.2-3 .7.7-3z"/><path d="M9.3 4.2l2.5 2.5"/></svg>',
    end: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5.6c2.6 0 4.8.8 6.1 2 .4.4.4.9.1 1.3l-1 1.1c-.3.3-.8.4-1.2.2l-1.7-.8c-.4-.2-.6-.5-.6-.9V7.4A7.8 7.8 0 0 0 8 7.1c-.6 0-1.2.1-1.7.3v1.1c0 .4-.2.7-.6.9l-1.7.8c-.4.2-.9.1-1.2-.2l-1-1.1c-.3-.4-.3-.9.1-1.3 1.3-1.2 3.5-2 6.1-2z"/></svg>',
    mic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5.7" y="2" width="4.6" height="7.6" rx="2.3"/><path d="M3.6 7.8a4.4 4.4 0 0 0 8.8 0M8 12.3V14"/></svg>',
    micoff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5.7" y="2" width="4.6" height="7.6" rx="2.3"/><path d="M3.6 7.8a4.4 4.4 0 0 0 8.8 0M8 12.3V14M2.5 2.5l11 11"/></svg>',
    cam: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="1.8" y="4.2" width="9" height="7.6" rx="1.8"/><path d="m10.8 7 3.4-2v6l-3.4-2"/></svg>',
    camoff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><rect x="1.8" y="4.2" width="9" height="7.6" rx="1.8"/><path d="m10.8 7 3.4-2v6l-3.4-2M2 2l12 12"/></svg>',
    cc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.8" y="3.5" width="12.4" height="9" rx="2"/><path d="M7 7a1.6 1.6 0 1 0 0 2M11.4 7a1.6 1.6 0 1 0 0 2" stroke-linecap="round"/></svg>',
    doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 1.8h5.2L12.5 5v8.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V2.8c0-.6.4-1 1-1z"/><path d="M9 1.8V5h3.4M5.4 8h5M5.4 10.4h5"/></svg>',
    upload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10.5V2.8M4.8 5.6 8 2.4l3.2 3.2M2.8 10v2.4c0 .6.4 1 1 1h8.4c.6 0 1-.4 1-1V10"/></svg>',
    shot: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 2"><rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2 1.4"/></svg>',
    gauge: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.6 11a5.6 5.6 0 1 1 10.8 0"/><path d="m8 9 2.4-2.6"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h4l-.6 3.7 2.2 2.1H4.4l2.2-2.1zM8 8.3v5.2"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.8 4.2c0-.9.7-1.6 1.6-1.6h7.2c.9 0 1.6.7 1.6 1.6v5c0 .9-.7 1.6-1.6 1.6H7l-2.8 2.4v-2.4h0c-.8 0-1.4-.7-1.4-1.6z"/></svg>',
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 2 3 3.8v3.8c0 3 2.1 5.3 5 6.4 2.9-1.1 5-3.4 5-6.4V3.8z"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>',
    bulb: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5h4M6.6 14.2h2.8M5.4 10.2C4.4 9.4 3.8 8.2 3.8 6.9a4.2 4.2 0 0 1 8.4 0c0 1.3-.6 2.5-1.6 3.3-.4.3-.6.8-.6 1.3H6c0-.5-.2-1-.6-1.3z"/></svg>',
    trophy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M4.8 2.5h6.4v3.6a3.2 3.2 0 0 1-6.4 0zM4.8 3.8H2.6c0 2 1 3 2.4 3.2M11.2 3.8h2.2c0 2-1 3-2.4 3.2M8 9.3v2.6M5.6 13.5h4.8M6.4 11.9h3.2"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    wave: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 7v2M5 5v6M7.5 3.5v9M10 5.5v5M12.5 7v2"/></svg>'
  };

  /* ---------- state: folded from the beats ---------- */
  function fresh() {
    return { pts: (D.XP0 || 0) + (+(window.CFG && CFG.sim) || 0), kept: 0, credits: 100, done: [], apps: 0, coach: clone(D.START), last: null, notes: 0, coachOn: true, track: null, lastTrack: null };
  }
  function lvl(st) { return D.levelOf(st.pts); }
  function fold(st, fx, beat) {
    if (!fx) return st;
    if (fx.pts != null && beat && beat.d && beat.d.band) { st.usual = beat.d.band; st.grades = (st.grades || []).concat([beat.d.band]); }
    if (fx.pts != null) {
      var was = lvl(st); st.pts += fx.pts; var now = lvl(st);
      st.last = { from: was, to: now, gain: fx.pts };
      if (now > was) st.credits += now * 100;
    }
    if (fx.kept != null) st.kept = fx.kept;
    if (fx.coachOn) st.coachOn = true;
    if (fx.goal) st.goal = fx.goal;
    if (fx.pace) st.pace = fx.pace;
    if (fx.eta) st.eta = fx.eta;
    if (fx.track) { var t = { sc: fx.track, s: {} }; (D.TG[fx.track] || []).forEach(function (x) { t.s[x.id] = null; }); st.track = t; }
    if (fx.tgt && st.track) for (var g in fx.tgt) st.track.s[g] = fx.tgt[g];
    if (fx.pts != null && st.track) { st.lastTrack = st.track; st.track = null; }
    if (fx.done && st.done.indexOf(fx.done) < 0) st.done.push(fx.done);
    if (fx.coach) {
      var r = st.coach.reads || {};
      for (var k in fx.coach.reads) r[k] = fx.coach.reads[k];
      st.coach = { think: fx.coach.think, like: fx.coach.like.slice(), fix: fx.coach.fix.slice(), reads: r };
    }
    if (fx.apps) st.apps += fx.apps;
    return st;
  }

  /* ---------- the player ---------- */
  var P = { free: !/[?&]story=1/.test(location.search), live: !/[?&]auto=1/.test(location.search), key: Object.keys(D.CASES)[0], i: 0, st: fresh(), tok: 0, paused: false, speed: 1, applied: false, el: null };
  function beats() { return D.CASES[P.key].beats; }
  function stateAt(i) { var st = fresh(), b = beats(); for (var k = 0; k < i; k++) fold(st, b[k].fx, b[k]); return st; }

  var SCREENS = {};
  function screen(name, def) { SCREENS[name] = def; }

  function sleep(ms, tok) {
    return new Promise(function (res, rej) {
      var left = ms, t0 = performance.now();
      (function loop() {
        if (tok !== P.tok) return rej(CANCEL);
        if (P.paused) { t0 = performance.now(); return setTimeout(loop, 80); }
        var now = performance.now(); left -= (now - t0) * P.speed; t0 = now;
        if (left <= 0) return res();
        setTimeout(loop, Math.min(80, left / P.speed));
      })();
    });
  }

  function helpers(tok, beat) {
    var s = {
      tok: tok,
      wait: function (ms) { return sleep(ms, tok); },
      alive: function () { return tok === P.tok; },
      /* type text into an element, one character at a time, with a caret */
      type: async function (el, text, cps) {
        el.classList.add('typing');
        var per = 1000 / (cps || 38);
        for (var i = 1; i <= text.length; i++) {
          el.textContent = text.slice(0, i);
          if (el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight;
          await sleep(text[i - 1] === ' ' ? per * .6 : per, tok);
        }
        el.classList.remove('typing');
      },
      /* b16: you play it. A press waits for your click on the target (a soft ring shows it; Enter works too).
         With a group, any button in it counts and the index you chose comes back. Running up to a jump, or in
         ?auto=1, it presses by itself. There is no cursor. */
      press: async function (target, ms, group) {
        if (!target) return;
        if (P.halt) { halt(); throw CANCEL; }          // b28: after the moment you asked for, stop at the next thing that would need you
        var pick;
        if (live()) pick = await yourTurn(target, group, tok);
        else { await sleep(160, tok); }
        var hit = group && typeof pick === 'number' ? group.querySelectorAll('button')[pick] || target : target;
        hit.classList.add('pressed'); await sleep(160, tok); hit.classList.remove('pressed');
        await sleep(ms == null ? 220 : ms, tok);
        return pick;
      },
      live: function () { return live(); },
      point: function () { return Promise.resolve(); },
      hideCursor: function () { cursorHide(); },
      count: async function (el, from, to, ms, fmt) {
        var t0 = performance.now(), dur = ms || 1200; fmt = fmt || n;
        while (true) {
          if (tok !== P.tok) throw CANCEL;
          var k = Math.min(1, (performance.now() - t0) * P.speed / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(from + (to - from) * e);
          if (k >= 1) break;
          await new Promise(function (r) { requestAnimationFrame(r); });
        }
      },
      /* the coach speaks: a short note under the dock */
      coach: function (note) {
        if (!note || !window.DK) return Promise.resolve();
        if (note.freeze || !(beat.d && beat.d.coachAfter)) applyFx(beat);
        if (note.freeze) return DK.freeze(note, s);
        DK.note(note); return Promise.resolve();
      },
      /* apply this beat's fx now (points, level, the coach's new read); the engine skips it at the end */
      fx: function () { applyFx(beat); },
      navid: function (c) { return window.NV ? NV.run(c, s) : Promise.resolve(); },
      vibrate: function () { try { navigator.vibrate && navigator.vibrate([60, 40, 60]); } catch (e) {} },
      scroll: function (el, top) { el.scrollTo({ top: top == null ? el.scrollHeight : top, behavior: 'smooth' }); }
    };
    return s;
  }

  /* b16: is the viewer playing (not a run-up to a jump, not ?auto=1) */
  function live() { return P.live && !(P.moment && !P.moment.hit); }
  /* wait for the viewer: ring the target, resolve on its click (or a click on any button in the group), Enter clicks it */
  function yourTurn(target, group, tok) {
    return new Promise(function (res, rej) {
      var btns = group ? Array.prototype.slice.call(group.querySelectorAll('button')) : [target];
      var r = target.getBoundingClientRect();
      if (!r.width && !r.height) { res(group ? btns.indexOf(target) : undefined); return; }
      target.classList.add('zx-hint');                       // the ring on the suggested one; any choice in the group works
      document.documentElement.classList.add('zx-turn');
      if (window.CT && CT.turn) CT.turn(true);
      var done = false;
      function end(v) {
        if (done) return; done = true;
        target.classList.remove('zx-hint'); btns.forEach(function (b) { b.removeEventListener('click', on); });
        document.removeEventListener('keydown', key, true);
        document.documentElement.classList.remove('zx-turn');
        if (window.CT && CT.turn) CT.turn(false);
        clearInterval(iv);
      }
      function on(e) { e.preventDefault(); e.stopPropagation(); var k = btns.indexOf(e.currentTarget); end(); res(group ? k : undefined); }
      function key(e) {
        if (e.key !== 'Enter' || (e.target && e.target.closest && e.target.closest('textarea,input'))) return;
        e.preventDefault(); end(); res(group ? btns.indexOf(target) : undefined);
      }
      btns.forEach(function (b) { b.addEventListener('click', on); });
      document.addEventListener('keydown', key, true);
      var iv = setInterval(function () {
        if (tok !== P.tok) { end(); rej(CANCEL); return; }
        if (!live()) { end(); res(group ? btns.indexOf(target) : undefined); }
      }, 120);
    });
  }

  /* the visible pointer: it shows that Sanjay does each thing */
  var cur = null;
  function cursorTo(target, tok) {
    if (!cur) return Promise.resolve();
    var app = $('#app'), z = parseFloat(app.style.zoom) || 1, r = target.getBoundingClientRect(), ar = app.getBoundingClientRect();
    var x = (r.left + r.width / 2) / z - ar.left / z, y = (r.top + r.height / 2) / z - ar.top / z;
    var was = cur.classList.contains('on');
    cur.classList.add('on');
    if (!was) { cur.style.transition = 'none'; cur.style.transform = 'translate(' + (x + 60) + 'px,' + (y + 70) + 'px)'; void cur.offsetWidth; cur.style.transition = ''; }
    cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    return sleep(was ? 560 : 620, tok);
  }
  function cursorHide() { if (cur) cur.classList.remove('on'); }

  function applyFx(beat) {
    if (P.applied || !beat.fx) return;
    P.applied = true;
    var was = lvl(P.st);
    fold(P.st, beat.fx, beat);
    if (window.DK) DK.update(P.st, { from: was, gain: beat.fx.pts, coach: !!beat.fx.coach });
  }

  function ctx(i) { var b = beats()[i]; return { st: P.st, beat: b, i: i, key: P.key, D: D, J: J }; }

  /* b28: stop where you are, cancel what the screen was doing, wait for the next click on the bar */
  function halt() { P.halt = false; P.tok++; P.paused = true; P.moment = null; P.speed = 1; if (window.CT) CT.show(P.i); }
  async function go(i, opt) {
    opt = opt || {};
    if (P.halt && !opt.jump) { halt(); return; }
    var b = beats(); i = Math.max(0, Math.min(b.length - 1, i));
    var tok = ++P.tok;
    /* a jump to a Navid moment runs up to it fast; anything else puts the speed back */
    if (P.moment && P.moment.i !== i) { P.speed = P.moment.restore; P.moment = null; }
    P.i = i; P.applied = false;
    P.st = stateAt(i);
    var beat = b[i], def = SCREENS[beat.screen];
    var host = $('#scr'), prev = host.firstElementChild;
    var el = document.createElement('div');
    el.className = 'sc sc-' + beat.screen;
    var theme = def ? (typeof def.theme === 'function' ? def.theme(beat.d, ctx(i)) : def.theme) : 'dark';
    $('#app').setAttribute('data-theme', theme || 'dark');
    $('#app').classList.toggle('no-dock', !!(def && def.dock === false));
    cursorHide();
    if (window.DK) DK.update(P.st, { quiet: true });
    document.dispatchEvent(new CustomEvent('jbeat', { detail: { screen: beat.screen, i: i } }));
    if (def) def.draw(el, beat.d || {}, ctx(i));
    else el.innerHTML = '<div class="missing">' + esc(beat.screen) + '</div>';
    var same = prev && prev.getAttribute('data-screen') === beat.screen && def && def.keep;
    el.setAttribute('data-screen', beat.screen);
    host.appendChild(el);
    if (prev) {
      if (opt.cut || same) prev.remove();
      else { prev.classList.add('leave'); setTimeout(function () { prev.remove(); }, 520); el.classList.add('enter'); }
    }
    P.el = el;
    if (window.CT) CT.show(i);
    location.replace('#' + P.key + '/' + i);
    /* b26: nothing plays by itself. A screen is just drawn unless the bottom bar asked for one of Navid's moments */
    if (opt.still || (P.free && !P.moment)) { P.paused = true; return; }
    try {
      var hs = helpers(tok, beat);
      if (beat.live) beat.live.forEach(function (lv) { sleep(lv.at, tok).then(function () { if (tok === P.tok && window.DK) DK.note(lv); }, function () {}); });
      if (beat.pre) { await sleep(beat.pre.wait || 900, tok); applyFx(beat); await DK.freeze(beat.pre, hs); }
      if (beat.cc && window.NV) for (var ci = 0; ci < beat.cc.length; ci++) if (beat.cc[ci].at === 'pre') { await sleep(500, tok); await NV.run(beat.cc[ci], hs); }
      if (def && def.play) await def.play(el, beat.d || {}, hs, ctx(i));
      if (beat.cc && window.NV) for (var cj = 0; cj < beat.cc.length; cj++) if (beat.cc[cj].at === 'post') { await sleep(700, tok); await NV.run(beat.cc[cj], hs); }
      if (beat.toast && window.DK) { DK.note(beat.toast); await sleep(1800, tok); }
      if (beat.post) { applyFx(beat); await sleep(600, tok); await DK.freeze(beat.post, hs); }
      await sleep(beat.hold == null ? 1400 : beat.hold, tok);
      applyFx(beat);
      if (tok !== P.tok) return;
      if (i < b.length - 1) go(i + 1);
      else { P.paused = true; if (window.CT) CT.show(i, true); }
    } catch (e) {
      if (e !== CANCEL) { console.error(e); window.__err = String(e && e.stack || e); }
    }
  }

  function setCase(k) {
    var ch = beats()[P.i] && beats()[P.i].ch;
    P.key = k;
    var b = beats(), to = 0;
    for (var i = 0; i < b.length; i++) if (b[i].ch === ch) { to = i; break; }
    P.paused = false;
    if (window.DK) DK.reset();
    go(to, { cut: true });
  }

  /* ---------- the canvas: one design size, zoomed to the screen ---------- */
  var BAR = 56;
  function fit() {
    var app = $('#app'), w = innerWidth, h = innerHeight - BAR;
    /* b17: the whole app sits 20% smaller (the design canvas grows by 1 / 0.8) */
    var z = Math.max(1, Math.min(w / 1440, h / 744)) * .8;
    app.style.zoom = z;
    app.style.width = (w / z) + 'px';
    app.style.height = (h / z) + 'px';
    app.style.setProperty('--apph', (h / z) + 'px');
    document.documentElement.style.setProperty('--z', z);
  }

  function boot() {
    document.body.innerHTML = '<div id="app" data-theme="dark"><div id="skin"><div id="scr"></div></div><div class="cur" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3.2v15.4l4.1-3.9 2.6 6 2.6-1.1-2.6-5.9h5.7z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg></div></div><div id="ctl"></div>';
    cur = $('.cur');
    fit(); addEventListener('resize', fit);
    if (window.DK) DK.mount($('#skin'));
    if (window.NV) NV.mount($('#app'));
    if (window.CT) CT.mount($('#ctl'));
    var h = (location.hash || '').replace('#', '').split('/');
    if (D.CASES[h[0]]) P.key = h[0];
    var i = parseInt(h[1], 10) || 0;
    var q = new URLSearchParams(location.search);
    if (q.get('pause')) P.paused = true;
    if (P.free) { go(i, { cut: true, still: true }); return; }
    if (!q.get('nogate') && window.NV) {
      P.paused = true;
      var g = document.createElement('div'); g.className = 'nv-gate';
      g.innerHTML = '<div><img alt="" src="' + D.COACH.photo + '"><h1>Eleven times Navid steps in</h1><p>You play Sanjay. Click what glows, or press Enter. Every fix Navid catches is skill points you keep.</p><div class="row"><button data-s="0">Play muted</button><button class="pri" data-s="1">Play with sound</button></div></div>';
      $('#app').appendChild(g);
      Array.prototype.forEach.call(g.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { NV.sound = b.getAttribute('data-s') === '1'; g.remove(); P.paused = false; if (window.CT) CT.show(P.i); }); });
    }
    go(i, { cut: true });
  }

  window.J = {
    D: D, A: A, P: P, $: $, $$: $$, esc: esc, n: n, clone: clone, logo: logo, badge: badge, face: face, coName: coName, IC: IC,
    CANCEL: CANCEL, screen: screen, SCREENS: SCREENS, go: go, setCase: setCase, beats: beats, lvl: lvl, stateAt: stateAt, fresh: fresh,
    pause: function (v) { P.paused = v == null ? !P.paused : v; if (window.CT) CT.show(P.i); },
    stop: function () { P.tok++; P.paused = true; P.moment = null; P.speed = 1; if (window.CT) CT.show(P.i); },
    halt: function () { halt(); },
    speed: function (v) { P.speed = v; },
    next: function () { go(P.i + 1, { cut: false }); }, prev: function () { go(P.i - 1, { cut: true }); },
    boot: boot
  };
})();
