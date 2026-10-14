/* Zero, the whole way to a job. engine.js = the frame (strip with the case switch and the caption, the desktop window,
   the timeline under it), the story player, the state each beat starts from, and helpers the screens share.
   Screens register with J.screen(name, {theme, draw, play}). They live in scenes-a.js (scenarios, levels) and scenes-b.js (jobs). */
(function () {
  'use strict';
  var D = window.JD, A = D.A;
  var CANVAS = { w: 1180, h: 660 };   /* every screen is designed on this canvas; the window scales it to fit */

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function levelOf(pts) { return Math.min(10, Math.floor(pts / 1000)); }
  function logo(dom, size, cls) {
    var s = size || 32;
    return '<span class="jlg ' + (cls || '') + '" style="--l:' + s + 'px"><img alt="" loading="lazy" src="https://www.google.com/s2/favicons?domain=' + esc(dom) + '&sz=128"></span>';
  }
  function av(p, size) {
    var s = size || 32;
    if (!p || p === 'maya') return '<span class="jav" style="--a:' + s + 'px"><img alt="" src="' + D.MAYA.photo + '"></span>';
    return '<span class="jav ' + (p.t || 't1') + '" style="--a:' + s + 'px;font-size:' + Math.max(11, Math.round(s * .34)) + 'px">' + esc(p.ini) + '</span>';
  }
  function bands(i, dark) { return '<span class="jbands' + (dark ? ' dk' : '') + ' on' + i + '"><i></i><i></i><i></i><i></i><i></i></span>'; }
  function zero(size, state) { return '<span class="zf" data-zero="' + (state || 'default') + '" style="--z:' + (size || 40) + 'px" role="img" aria-label="Zero"><i class="zff"></i></span>'; }
  var WORD = '';
  function wordmark(cls) { return WORD ? WORD.replace('<svg', '<svg class="' + (cls || '') + '"') : '<b class="' + (cls || '') + '">zero</b>'; }
  var IC = {
    play: '<svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 16 16"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    redo: '<svg viewBox="0 0 16 16"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.8v2.6h2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 16 16"><path d="M8 1.2c.4 3.5 1.8 5.4 6.8 6.8-5 1.4-6.4 3.3-6.8 6.8-.4-3.5-1.8-5.4-6.8-6.8C6.2 6.6 7.6 4.7 8 1.2z" fill="url(#jstar)"/><defs><linearGradient id="jstar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE38A"/><stop offset="1" stop-color="#E9A21F"/></linearGradient></defs></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 16 16"><rect x="3.5" y="7" width="9" height="6.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    bag: '<svg viewBox="0 0 16 16"><rect x="2.5" y="5" width="11" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    arrow: '<svg viewBox="0 0 16 16"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 16 16"><path d="M8 13.2S2.6 10 2.6 6.2A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.4 1.5C13.4 10 8 13.2 8 13.2z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    heartf: '<svg viewBox="0 0 16 16"><path d="M8 13.2S2.6 10 2.6 6.2A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.4 1.5C13.4 10 8 13.2 8 13.2z" fill="#E5484D" stroke="#E5484D" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    mic: '<svg viewBox="0 0 16 16"><rect x="5.6" y="2" width="4.8" height="8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 16 16"><path d="M8 13V3.5M4 7.5l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 16 16"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7m0-7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    fire: '<span class="jemo" role="img" aria-label="Strong fit">🔥</span>',
    up: '<span class="jemo" role="img" aria-label="Good fit">👍</span>'
  };

  /* ---------- the state each beat starts from ---------- */
  /* folds every earlier beat: skill points, credits, streak, scenarios done, and every application with its state */
  function stateAt(beats, i) {
    var st = { pts: 0, credits: 0, streak: 1, done: 0, apps: {}, order: [], wk: beats[0].wk };
    for (var k = 0; k < i; k++) {
      var b = beats[k], fx = b.fx || {};
      st.pts += fx.pts || 0; st.credits += fx.credits || 0; st.streak += fx.streak || 0; st.done += fx.done || 0;
      if (b.screen === 'apply') (b.d.roles || []).forEach(function (id) { if (!st.apps[id]) st.order.unshift(id); st.apps[id] = { state: 'applied', note: '', wk: b.wk }; });
      if (b.screen === 'tracker') (b.d.move || []).forEach(function (m) { if (st.apps[m.id]) { st.apps[m.id].state = m.to; st.apps[m.id].note = m.note; st.apps[m.id].wk = b.wk; } });
    }
    st.level = levelOf(st.pts); st.open = D.OPEN[st.level]; st.wk = beats[i].wk;
    return st;
  }
  function counts(st) {
    var c = { applied: 0, connected: 0, lost: 0 };
    Object.keys(st.apps).forEach(function (id) { c[st.apps[id].state]++; });
    return c;
  }

  /* ---------- the HUD every screen shows top right: credits, level, coach, Maya ---------- */
  var live = { pts: 0, credits: 0 };
  function hud(o) {
    o = o || {};
    return '<div class="jhud ' + (o.light ? 'lt' : '') + '">' +
      '<span class="jpill jcr" aria-label="Credits"><span class="jcoin"></span><b>' + n(live.credits) + '</b></span>' +
      '<span class="jpill jlv" aria-label="Level">' + IC.star + '<b>L' + levelOf(live.pts) + '</b></span>' +
      (o.coach === false ? '' : '<button class="jcoachb" aria-label="Coach">' + zero(26) + (o.dot ? '<i class="jdot"></i>' : '') + '</button>') +
      av('maya', 30) + '</div>';
  }
  var pills = {
    level: function (pts, animate) {
      var was = levelOf(live.pts); live.pts = pts;
      $$('.jlv b').forEach(function (b) { b.textContent = 'L' + levelOf(pts); });
      if (animate || was !== levelOf(pts)) $$('.jlv').forEach(bump);
    },
    credits: function (c, animate) {
      live.credits = c;
      $$('.jcr b').forEach(function (b) { b.textContent = n(c); });
      if (animate) $$('.jcr').forEach(bump);
    },
    coachDot: function (on) { $$('.jcoachb').forEach(function (b) { var d = $('.jdot', b); if (on && !d) b.insertAdjacentHTML('beforeend', '<i class="jdot"></i>'); if (!on && d) d.remove(); }); }
  };
  function bump(x) { x.classList.remove('jbump'); void x.offsetWidth; x.classList.add('jbump'); }

  /* ---------- motion helpers (pause and jump aware) ---------- */
  function count(node, from, to, ms, fmt) {
    var tok = story.tok;
    return new Promise(function (res) {
      var t0 = performance.now(), d = (ms || 900) / story.speed;
      (function f(t) {
        if (tok !== story.tok) return res();
        var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
        node.textContent = (fmt || n)(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  function fly(fromEl, toEl, html, ms) {
    return new Promise(function (res) {
      if (!fromEl || !toEl) return res();
      var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      var f = el('<div class="jfly">' + html + '</div>'); document.body.appendChild(f);
      var w = f.offsetWidth, h = f.offsetHeight;
      var x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2, x1 = b.left + b.width / 2 - w / 2, y1 = b.top + b.height / 2 - h / 2;
      var an = f.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 },
        { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 60) + 'px) scale(1.05)', opacity: 1, offset: .55 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.6)', opacity: .15 }
      ], { duration: (ms || 900) / story.speed, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
      an.onfinish = function () { f.remove(); res(); };
    });
  }

  /* ---------- screens ---------- */
  var SCREENS = {};
  function screen(name, def) { SCREENS[name] = def; }

  /* ---------- the story player ---------- */
  var story = { beats: [], i: 0, paused: false, speed: 1, tok: 0, caseKey: 'best' };
  function Stopped() { this.stopped = true; }
  function mkS(tok) {
    var s = {
      alive: function () { if (tok !== story.tok) throw new Stopped(); return true; },
      wait: function (ms) {
        return new Promise(function (res, rej) {
          var left = ms / story.speed, last = performance.now();
          (function t() {
            if (tok !== story.tok) return rej(new Stopped());
            var now = performance.now(); if (!story.paused) left -= (now - last); last = now;
            if (left <= 0) res(); else setTimeout(t, 40);
          })();
        });
      },
      /* wait for the visitor to press node, or press it for them after ms */
      press: function (node, ms) {
        return new Promise(function (res, rej) {
          if (!node) return res();
          var done = false;
          function go(byHand) { if (done) return; done = true; node.removeEventListener('click', h); if (!byHand) { node.classList.add('jpress'); setTimeout(function () { node.classList.remove('jpress'); }, 200); } setTimeout(res, 170); }
          function h() { go(true); }
          node.addEventListener('click', h);
          s.wait(ms == null ? 2200 : ms).then(function () { go(false); }, function (e) { done = true; node.removeEventListener('click', h); rej(e); });
        });
      },
      type: function (node, text, cps) {
        var i = 0, per = 1000 / (cps || 38);
        return new Promise(function (res, rej) {
          (function t() {
            if (tok !== story.tok) return rej(new Stopped());
            if (story.paused) return setTimeout(t, 60);
            i++; var v = text.slice(0, i);
            if ('value' in node && node.tagName !== 'DIV') node.value = v; else node.textContent = v;
            if (i < text.length) setTimeout(t, per / story.speed); else res();
          })();
        });
      },
      count: count, fly: fly, tok: tok
    };
    return s;
  }

  function app() { return $('.jx-app'); }
  function go(i) {
    if (i < 0 || i >= story.beats.length) return;
    story.tok++; story.i = i; var tok = story.tok, b = story.beats[i], def = SCREENS[b.screen];
    var st = stateAt(story.beats, i);
    live.pts = st.pts; live.credits = st.credits;
    setStrip(b, st); setRail(i);
    $$('.jfly').forEach(function (f) { f.remove(); });
    var root = app();
    root.setAttribute('data-theme', def && def.theme || 'dark');
    root.innerHTML = '';
    var view = el('<div class="jx-view jx-in"></div>'); root.appendChild(view);
    try { if (def) def.draw(view, b.d || {}, st, b, story.beats); else view.innerHTML = '<div class="jx-missing">' + esc(b.screen) + '</div>'; }
    catch (e) { console.error(e); }
    mountZero();
    var s = mkS(tok);
    Promise.resolve().then(function () { return def && def.play ? def.play(s, view, b.d || {}, st, b, story.beats) : null; }).then(function () {
      if (tok !== story.tok) return;
      window.__played = i;
      return s.wait(b.hold == null ? 2400 : b.hold).then(function () {
        if (tok !== story.tok) return;
        if (story.i < story.beats.length - 1) go(story.i + 1); else setPaused(true);
      });
    }).catch(function (e) { if (!(e instanceof Stopped)) console.error(e); });
  }
  function setPaused(p) {
    story.paused = p; var b = $('.jx-pp');
    if (b) { b.innerHTML = p ? IC.play : IC.pause; b.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
  }

  /* ---------- strip: case switch, caption, controls ---------- */
  function setStrip(b, st) {
    var sys = D.SYS[b.sys];
    var cap = $('.jx-cap');
    if (cap) {
      cap.innerHTML = '<span class="jx-tag" style="--c:' + sys.c + ';--cbg:' + sys.bg + '"><i></i>' + b.sys + ' ' + esc(sys.name) + '</span><span class="jx-ct">' + esc(b.cap) + '</span>';
      cap.classList.remove('jx-capin'); void cap.offsetWidth; cap.classList.add('jx-capin');
    }
    var wk = $('.jx-wk');
    if (wk && wk.textContent !== b.wk) { wk.textContent = b.wk; bump(wk); }
    var ct = $('.jx-ct2'); if (ct) ct.textContent = (story.i + 1) + ' / ' + story.beats.length;
    try { history.replaceState(null, '', '?case=' + story.caseKey + '#' + (story.i + 1)); } catch (e) {}
  }
  function stripHTML() {
    return '<header class="jx-strip">' +
      '<div class="jx-cases" role="tablist" aria-label="Case">' + ['best', 'mid', 'worst'].map(function (k) {
        var c = D.CASES[k];
        return '<button role="tab" data-case="' + k + '"' + (k === story.caseKey ? ' class="on" aria-selected="true"' : '') + '><b>' + esc(c.name) + '</b><span>Hired in ' + c.outcome.weeks + ' weeks</span></button>';
      }).join('') + '</div>' +
      '<div class="jx-cap" aria-live="polite"></div>' +
      '<div class="jx-ctl"><span class="jx-wk"></span><button class="jib jx-prev" aria-label="Back">' + IC.prev + '</button><button class="jib jx-pp" aria-label="Pause">' + IC.pause + '</button><button class="jib jx-next" aria-label="Next">' + IC.next + '</button>' +
      '<span class="jx-ct2"></span><button class="jx-speed" aria-label="Speed">1x</button><button class="jib jx-restart" aria-label="Start over">' + IC.redo + '</button><span class="jx-stamp">b2</span></div>' +
      '</header>';
  }

  /* ---------- the timeline: every chapter of her road, click to jump ---------- */
  function chapters(beats) {
    var out = [], seen = {};
    beats.forEach(function (b, i) {
      if (!seen[b.ch]) { seen[b.ch] = { key: b.ch, first: i, last: i, beats: [] }; out.push(seen[b.ch]); }
      seen[b.ch].last = i; seen[b.ch].beats.push(i);
    });
    return out;
  }
  function chNode(c, beats) {
    var b0 = beats[c.first];
    if (c.key === 'start') return { kind: 'start', label: 'Start', sub: b0.wk.replace(' · ', ' ') };
    if (c.key === 'hired') { var o = D.CASES[story.caseKey].outcome; return { kind: 'hired', label: 'Hired', sub: o.co, dom: o.dom }; }
    if (c.key.charAt(0) === 's') {
      var rv = null; c.beats.forEach(function (i) { if (beats[i].screen === 'review') rv = beats[i]; });
      var sc = D.SC[rv ? rv.d.sc : (beats[c.beats[c.beats.length - 1]].d.sc || beats[c.first].d.choose)];
      return { kind: 'sc', label: sc ? sc.co : 'Scenario', dom: sc && sc.dom, band: rv ? rv.d.band : null, lv: rv && rv.d.lvTo > rv.d.lvFrom ? rv.d.lvTo : null };
    }
    /* jobs: what happened in it */
    var applied = 0, conn = 0, lost = 0, locked = false;
    c.beats.forEach(function (i) {
      var b = beats[i];
      if (b.screen === 'apply') applied += b.d.roles.length;
      if (b.screen === 'tracker') b.d.move.forEach(function (m) { if (m.to === 'connected') conn++; if (m.to === 'lost') lost++; });
      if (b.screen === 'jobsHome' && b.d.locked) locked = true;
    });
    var bits = [];
    if (locked) bits.push('Locked');
    if (applied) bits.push(applied + ' applied');
    if (conn) bits.push(conn + ' connected');
    if (lost) bits.push(lost + ' lost');
    return { kind: 'jobs', label: 'Jobs', sub: bits.join(', ') || 'Roles open' };
  }
  function railHTML() {
    var beats = story.beats, chs = chapters(beats);
    return '<footer class="jx-rail"><div class="jx-track"><i class="jx-fill"></i>' + chs.map(function (c, k) {
      var nd = chNode(c, beats), b0 = beats[c.first];
      var col = D.SYS[b0.sys].c;
      var face = nd.kind === 'sc' ? logo(nd.dom, 22, 'round') : nd.kind === 'hired' ? '<span class="jx-hstar">' + IC.star + '</span>' : nd.kind === 'jobs' ? '<span class="jx-bag">' + IC.bag + '</span>' : av('maya', 22);
      return '<button class="jx-ch k-' + nd.kind + '" data-first="' + c.first + '" data-last="' + c.last + '" style="--c:' + col + (nd.band != null ? ';--band:' + D.BANDS[nd.band].c : '') + '">' +
        '<span class="jx-node">' + face + (nd.lv ? '<em class="jx-lv">L' + nd.lv + '</em>' : '') + '</span>' +
        '<span class="jx-lab"><b>' + esc(nd.label) + '</b><span>' + esc(nd.kind === 'sc' && nd.band != null ? D.BANDS[nd.band].short : nd.sub || '') + '</span></span>' +
        '<span class="jx-dots">' + c.beats.map(function (i) { return '<i data-i="' + i + '"></i>'; }).join('') + '</span></button>';
    }).join('') + '</div></footer>';
  }
  function setRail(i) {
    $$('.jx-ch').forEach(function (c) {
      var f = +c.getAttribute('data-first'), l = +c.getAttribute('data-last');
      c.classList.toggle('now', i >= f && i <= l); c.classList.toggle('past', i > l);
    });
    $$('.jx-dots i').forEach(function (d) { var k = +d.getAttribute('data-i'); d.classList.toggle('on', k === i); d.classList.toggle('past', k < i); });
    var cur = $('.jx-ch.now'), track = $('.jx-track'), fill = $('.jx-fill');
    if (cur && track && fill) {
      var tr = track.getBoundingClientRect(), cr = $('.jx-node', cur).getBoundingClientRect();
      fill.style.width = Math.max(0, (cr.left + cr.width / 2 - tr.left) / (J.railK || 1) - 48 + track.scrollLeft) + 'px';
    }
  }

  /* ---------- the window and its fit ---------- */
  function frameHTML() {
    return '<div class="jx">' + stripHTML() +
      '<div class="jx-stage"><div class="jx-win"><div class="jx-bar"><i></i><i></i><i></i></div><div class="jx-app" data-theme="dark"></div></div></div>' +
      '<div class="jx-railwrap"></div></div>';
  }
  function fit() {
    var stage = $('.jx-stage'), win = $('.jx-win'); if (!stage || !win) return;
    var W = stage.clientWidth - 8, H = stage.clientHeight - 8;
    var k = Math.min(W / CANVAS.w, H / (CANVAS.h + 28), 1.7);
    win.style.transform = 'scale(' + k + ')';
    win.style.width = CANVAS.w + 'px'; win.style.height = (CANVAS.h + 28) + 'px';
    win.style.left = ((stage.clientWidth - CANVAS.w * k) / 2) + 'px';
    win.style.top = ((stage.clientHeight - (CANVAS.h + 28) * k) / 2) + 'px';
    J.scale = k;
    setRail(story.i);
  }

  function loadCase(k, at) {
    story.caseKey = D.CASES[k] ? k : 'best';
    story.beats = D.CASES[story.caseKey].beats;
    $$('.jx-cases button').forEach(function (b) { var on = b.getAttribute('data-case') === story.caseKey; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    $('.jx-railwrap').innerHTML = railHTML();
    $$('.jx-ch').forEach(function (c) { c.addEventListener('click', function (e) { var d = e.target.closest('.jx-dots i'); setPaused(false); go(d ? +d.getAttribute('data-i') : +c.getAttribute('data-first')); }); });
    go(Math.max(0, Math.min(story.beats.length - 1, at || 0)));
  }

  function boot() {
    document.body.innerHTML = frameHTML();
    $$('.jx-cases button').forEach(function (b) { b.addEventListener('click', function () { setPaused(false); loadCase(b.getAttribute('data-case'), 0); }); });
    $('.jx-pp').addEventListener('click', function () { if (story.i === story.beats.length - 1 && story.paused) { setPaused(false); go(0); } else setPaused(!story.paused); });
    $('.jx-prev').addEventListener('click', function () { setPaused(false); go(Math.max(0, story.i - 1)); });
    $('.jx-next').addEventListener('click', function () { setPaused(false); go(Math.min(story.beats.length - 1, story.i + 1)); });
    $('.jx-restart').addEventListener('click', function () { setPaused(false); go(0); });
    $('.jx-speed').addEventListener('click', function () { var sp = $('.jx-speed'); story.speed = story.speed === 1 ? 1.5 : story.speed === 1.5 ? 2 : 1; sp.textContent = story.speed + 'x'; });
    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === ' ') { e.preventDefault(); setPaused(!story.paused); }
      if (e.key === 'ArrowRight') { setPaused(false); go(Math.min(story.beats.length - 1, story.i + 1)); }
      if (e.key === 'ArrowLeft') { setPaused(false); go(Math.max(0, story.i - 1)); }
    });
    var q = new URLSearchParams(location.search), h = parseInt((location.hash || '').slice(1), 10);
    if (q.get('still') === '1') setPaused(true);
    addEventListener('resize', fit);
    fit();
    loadCase(q.get('case') || 'best', h > 0 ? h - 1 : 0);
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* ---------- Zero's plush face, mounted into every .zf ---------- */
  var LV = null;
  function mountZero() {
    if (!LV) return;
    $$('.zf:not(.lv)').forEach(function (z) {
      try {
        var size = parseFloat(getComputedStyle(z).getPropertyValue('--z')) || 40;
        var st = z.getAttribute('data-zero') || 'default';
        var host = document.createElement('span'); host.className = 'zfh'; z.appendChild(host);
        LV.createRoot(host).render(LV.React.createElement(LV.BotAvatar, Object.assign({}, LV.FUR, LV.BOT, { size: Math.round(size), state: st === 'still' ? 'default' : st, paused: st === 'still', interactive: false, 'aria-hidden': true })));
        z.classList.add('lv');
      } catch (e) { }
    });
  }
  function bootZero(x) {
    try {
      if (x.botAvatarPresets && x.botAvatarPresets.circle) x.botAvatarPresets.circle.faceScale = 1.3;
      LV = { React: x.React, createRoot: x.createRoot, BotAvatar: x.BotAvatar,
        FUR: { shading: 'fabric', shadow: .18, highlight: 1.2, lightFront: 78, rim: 2, spread: 2.5, furLength: .75, furFuzz: .85, furClumps: .15, turn: .4, jumpEvery: 14, theme: 'light' },
        BOT: { type: 'circle', color: '#38C674', ink: '#FFFFFF', brightness: 1, saturation: 1.15 } };
      mountZero();
      new MutationObserver(function () { mountZero(); }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { LV = null; }
  }

  var J = window.J = {
    D: D, A: A, CANVAS: CANVAS, $: $, $$: $$, esc: esc, n: n, el: el, levelOf: levelOf, logo: logo, av: av, bands: bands, zero: zero, wordmark: wordmark, IC: IC,
    stateAt: stateAt, counts: counts, hud: hud, pills: pills, count: count, fly: fly, screen: screen, SCREENS: SCREENS,
    story: story, go: go, setPaused: setPaused, loadCase: function (k, at) { setPaused(false); loadCase(k, at || 0); }, bootZero: bootZero, mountZero: mountZero, live: live, scale: 1,
    start: function () {
      fetch(A + 'zero-wordmark.svg').then(function (r) { return r.text(); }).then(function (t) { WORD = t.replace(/<\?xml[^>]*>/, ''); }).catch(function () {}).then(boot);
    }
  };
})();
