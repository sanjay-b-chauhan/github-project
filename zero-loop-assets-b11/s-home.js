/* s-home: the Zero world, the road and the scenario card (refs 01, 02, 02c, 21).
   modes: first (day one, Level 1), enter (scenario 2 or 3), unlocked (the finished card, then the next one unlocks). */
(function () {
  'use strict';
  var J = window.J, D = J.D, esc = J.esc, IC = J.IC;

  /* where each scenario sits in world.jpg (fx, fy) and where the camera puts it on screen (cx, cy) */
  var SPOT = {
    router: { fx: .75, fy: .80, cx: .66, cy: .71 },
    waterfall: { fx: .592, fy: .378, cx: .5, cy: .5 },
    evals: { fx: .711, fy: .439, cx: .62, cy: .5 }
  };
  var SPENT = {
    router: { exceptional: '54 min', exceeding: '1 hr', meeting: '1 hr 12 min', below: '1 hr 38 min', under: '1 hr 50 min' },
    waterfall: { exceptional: '1 hr 6 min', exceeding: '1 hr 10 min', meeting: '1 hr 21 min', below: '1 hr 41 min', under: '1 hr 55 min' },
    evals: { exceptional: '1 hr 14 min', exceeding: '1 hr 25 min', meeting: '1 hr 34 min', below: '1 hr 52 min', under: '2 hr 5 min' }
  };
  var STAR = '<svg viewBox="0 0 16 16"><path d="M8 1.2c.5 3.4 1.7 4.8 6.2 6.8-4.5 2-5.7 3.4-6.2 6.8-.5-3.4-1.7-4.8-6.2-6.8 4.5-2 5.7-3.4 6.2-6.8z" fill="currentColor"/></svg>';
  var ICW = '<svg viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M10.4 3c4 0 6.6 2.6 6.6 6.3 0 4.4-3.1 7.7-7.4 7.7C5.6 17 3 14.4 3 10.7 3 6.3 6.1 3 10.4 3zm-.3 4.2c-1.9 0-3.2 1.5-3.2 3.4 0 1.4.9 2.3 2.3 2.3 1.9 0 3.2-1.5 3.2-3.4 0-1.4-.9-2.3-2.3-2.3z"/></svg>';
  var ICS = '<svg viewBox="0 0 20 20" fill="currentColor"><g transform="rotate(-45 10 10)"><rect x="1.6" y="7.4" width="2.6" height="5.2" rx="1"/><rect x="4.4" y="5.6" width="2.8" height="8.8" rx="1.1"/><rect x="7" y="9" width="6" height="2" rx=".6"/><rect x="12.8" y="5.6" width="2.8" height="8.8" rx="1.1"/><rect x="15.8" y="7.4" width="2.6" height="5.2" rx="1"/></g></svg>';
  var ICB = '<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5z"/><path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4z"/></svg>';
  var ICG = '<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"/></svg>';
  var PLAY = '<svg viewBox="0 0 12 12"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>';

  function idx(sc) { return D.ROAD.indexOf(sc); }
  function pad(n) { return ('0' + n).slice(-2); }
  function frame(sc) {
    var p = SPOT[sc] || SPOT.router;
    return 'left:' + (p.cx * 100) + '%;top:' + (p.cy * 100) + '%;transform:translate(' + (-p.fx * 100) + '%,' + (-p.fy * 100) + '%)';
  }
  function setFrame(w, sc) { var p = SPOT[sc] || SPOT.router; w.style.left = (p.cx * 100) + '%'; w.style.top = (p.cy * 100) + '%'; w.style.transform = 'translate(' + (-p.fx * 100) + '%,' + (-p.fy * 100) + '%)'; }

  /* the art title, two lines of chunky letters, sized to fit the card */
  function art(sc) {
    var words = String(D.SC[sc].art).split(' '), lines;
    if (words.length === 2) lines = words;
    else if (words.length === 3) lines = [words[0] + ' ' + words[1], words[2]];
    else lines = [words.join(' ')];
    var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    var size = Math.min(58, Math.floor(292 / (longest * .7)));
    var h = lines.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');
    return '<div class="hm-art" data-sc="' + sc + '" style="--as:' + size + 'px" aria-label="' + esc(D.SC[sc].art) + '"><div class="hm-a-sh" aria-hidden="true">' + h + '</div><div class="hm-a-fg">' + h + '</div></div>';
  }
  function diff(n) { var on = Math.min(4, (n || 1) + 1), s = ''; for (var i = 0; i < 4; i++) s += '<i class="' + (i < on ? 'on' : '') + '"></i>'; return s; }

  /* the card body: a scenario to enter, or one that is finished */
  function bodyEnter(sc) {
    var s = D.SC[sc];
    return '<div class="hm-body">' + art(sc) +
      '<h2 class="hm-tt">' + esc(s.full) + '</h2>' +
      '<p class="hm-ds">' + esc(s.blurb) + '</p>' +
      '<div class="hm-rows">' +
        '<div class="hm-row"><span class="hm-lb">Earn up to</span><span class="hm-xp">' + STAR + J.n(s.pays) + '</span></div>' +
        '<div class="hm-row"><span class="hm-lb">Time</span><span class="hm-v">' + esc(s.time) + '</span></div>' +
        '<div class="hm-row"><span class="hm-lb">Difficulty</span><span class="hm-df">' + diff(s.diff) + '</span><span class="hm-v">' + esc(s.diffName) + '</span></div>' +
      '</div>' +
      '<button class="hm-go" data-go="enter">' + PLAY + 'Enter</button></div>';
  }
  function bodyDone(sc, bandKey) {
    var s = D.SC[sc], b = D.band(bandKey);
    return '<div class="hm-body">' + art(sc) +
      '<h2 class="hm-tt">' + esc(s.full) + '</h2>' +
      '<div class="hm-rows">' +
        '<div class="hm-row"><span class="hm-lb">Performance</span><span class="hm-v">' + esc(b.name) + '</span></div>' +
        '<div class="hm-row"><span class="hm-lb">Time spent</span><span class="hm-v">' + esc((SPENT[sc] || {})[b.key] || s.time) + '</span></div>' +
        '<div class="hm-row"><span class="hm-lb">Skill points earned</span><span class="hm-xp">' + STAR + J.n(b.pts) + '</span></div>' +
      '</div>' +
      '<button class="hm-go" data-go="continue">' + PLAY + 'Continue</button></div>';
  }

  /* the road: done ones with a check, the current one with its name, the ones to come, then jobs */
  function road(cur, done) {
    var h = '';
    D.ROAD.forEach(function (k, i) {
      var st = k === cur ? 'hm-cur' : done.indexOf(k) >= 0 ? 'hm-done' : 'hm-fut';
      if (i) h += '<i class="hm-ln' + (st !== 'hm-fut' ? ' on' : '') + '" data-ln="' + k + '"></i>';
      h += '<span class="hm-st ' + st + '" data-st="' + k + '">' + J.logo(D.SC[k].co, 28) + '<b>' + esc(J.coName(D.SC[k].co)) + '</b><span class="hm-sck">' + IC.check + '</span>' +
        (k === cur ? brief(k) : '') + '</span>';
    });
    h += '<i class="hm-ln' + (done.length === D.ROAD.length ? ' on' : '') + '"></i><span class="hm-bag" aria-label="Jobs">' + ICB + '</span>';
    return h;
  }
  function brief(sc) {
    var s = D.SC[sc], m = D.P[s.mgr] || D.P.jay;
    return '<div class="hm-brief" role="tooltip"><b class="hm-bt">' + esc(s.full) + '</b>' +
      '<div class="hm-bm"><span>' + IC.clock + esc(s.time.replace('~', '')) + '</span><span>' + IC.gauge + esc(s.diffName) + '</span></div>' +
      '<div class="hm-bp">' + J.face(m, 24) + '<div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span></div></div>' +
      '<div class="hm-bl">Tools</div><div class="hm-tools">' + (s.tools || []).map(function (t) { return '<span>' + J.logo(t[1], 16) + esc(t[0]) + '</span>'; }).join('') + '</div>' +
      '<div class="hm-bl">Description</div><p>' + esc(s.blurb) + '</p></div>';
  }

  function markers(cur, done) {
    return D.ROAD.map(function (k) {
      var p = SPOT[k], on = k === cur || done.indexOf(k) >= 0;
      return '<i class="hm-beam' + (k === cur ? ' on' : '') + '" data-beam="' + k + '" style="left:' + (p.fx * 100) + '%;top:calc(' + (p.fy * 100) + '% - 12px)"></i>' +
        '<span class="hm-mk' + (on ? '' : ' hm-off') + '" data-mk="' + k + '" style="left:' + (p.fx * 100) + '%;top:' + (p.fy * 100) + '%">' + J.logo(D.SC[k].co, 26) +
        (done.indexOf(k) >= 0 ? '<i class="hm-mck">' + IC.check + '</i>' : '') + '</span>';
    }).join('');
  }

  function lastDone(ctx, d) {
    var done = (ctx.st.done || []).slice();
    if (done.length) return done[done.length - 1];
    var i = idx(d.sc); return i > 0 ? D.ROAD[i - 1] : D.ROAD[0];
  }
  function lastBand(ctx) { var g = ctx.st.grades || []; return g.length ? g[g.length - 1] : (ctx.st.usual || 'meeting'); }

  function draw(el, d, ctx) {
    var mode = d.mode || 'first', sc = d.sc || 'router', done = (ctx.st.done || []).slice();
    var showSc = sc, card, roadCur = sc, roadDone = done;
    if (mode === 'unlocked') {
      showSc = lastDone(ctx, d);
      card = bodyDone(showSc, lastBand(ctx));
      roadCur = null; roadDone = done;
    } else card = bodyEnter(sc);
    var n = idx(showSc) + 1, tot = D.ROAD.length;
    el.innerHTML =
      '<div class="hm-world"><div class="hm-w hm-in" style="' + frame(showSc) + '"><img alt="" src="' + D.A + 'world.jpg">' + markers(mode === 'unlocked' ? showSc : sc, done) + '</div></div>' +
      '<div class="hm-blur"></div><div class="hm-shade"></div>' +
      '<div class="hm-word" role="img" aria-label="Zero"></div>' +
      '<nav class="hm-rail" aria-label="Zero"><span class="on" aria-label="World">' + ICW + '</span><span aria-label="Skills">' + ICS + '</span><span aria-label="Jobs">' + ICB + '</span></nav>' +
      '<span class="hm-gear" aria-label="Settings">' + ICG + '</span>' +
      '<div class="hm-road" aria-label="Your scenarios">' + road(roadCur, roadDone) + '</div>' +
      '<section class="hm-card" aria-label="Scenario">' +
        '<div class="hm-nav"><span class="hm-ar' + (n > 1 ? '' : ' hm-dim') + '">' + IC.left + '</span><span class="hm-pg"><span><b>' + pad(n) + '</b> <em>/</em> <em>' + pad(tot) + '</em></span></span><span class="hm-ar' + (n < tot ? '' : ' hm-dim') + '">' + IC.right + '</span></div>' +
        '<div class="hm-bodyw">' + card + '</div>' +
      '</section>';
    if (mode === 'unlocked') {
      // the beam belongs to the scenario on the card
      J.$$('.hm-beam', el).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-beam') === showSc); });
    }
  }

  function confetti(el) {
    var box = document.createElement('div'); box.className = 'hm-conf';
    var C = ['#FF4F8B', '#8B5CF6', '#FACC15', '#38BDF8', '#4ADE80', '#FB923C', '#F43F5E', '#A3E635', '#ffffff'];
    var h = '';
    for (var i = 0; i < 90; i++) {
      var x = Math.random() * 420, w = 5 + Math.random() * 6, ht = 7 + Math.random() * 8;
      h += '<i style="left:' + x.toFixed(0) + 'px;width:' + w.toFixed(0) + 'px;height:' + ht.toFixed(0) + 'px;background:' + C[i % C.length] + ';--d:' + (2.6 + Math.random() * 1.8).toFixed(2) + 's;--dl:' + (Math.random() * .7).toFixed(2) +
        's;--x:' + ((Math.random() - .5) * 140).toFixed(0) + 'px;--y:' + (420 + Math.random() * 380).toFixed(0) + 'px;--r:' + ((Math.random() - .5) * 900).toFixed(0) + 'deg;border-radius:' + (i % 3 ? 2 : 99) + 'px"></i>';
    }
    box.innerHTML = h;
    el.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 5200);
  }

  /* hover the road (the brief shows), then press Enter */
  async function enter(el, s, short) {
    var cur = J.$('.hm-st.hm-cur', el), bf = J.$('.hm-brief', el), go = J.$('.hm-go', el);
    await s.wait(short ? 900 : 1300);
    if (cur && bf) {
      await s.point(J.$('.lg', cur) || cur);
      bf.classList.add('on');
      await s.wait(short ? 3600 : 4800);
      bf.classList.remove('on');
    }
    await s.wait(300);
    await s.press(go, 300);
    var w = J.$('.hm-w', el); if (w) w.classList.add('hm-zoom');
    await s.wait(700);
    s.hideCursor();
  }

  async function unlocked(el, d, s, ctx) {
    var next = d.sc, prev = lastDone(ctx, d), done = (ctx.st.done || []).slice();
    await s.wait(3400);
    await s.press(J.$('.hm-go', el), 200);
    s.hideCursor();
    // the card turns to the next scenario
    var wrap = J.$('.hm-bodyw', el), old = J.$('.hm-body', el);
    old.classList.add('hm-out');
    wrap.insertAdjacentHTML('beforeend', bodyEnter(next).replace('class="hm-body"', 'class="hm-body hm-in"'));
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 500);
    var n = idx(next) + 1, tot = D.ROAD.length;
    J.$('.hm-pg', el).innerHTML = '<span><b>' + pad(n) + '</b> <em>/</em> <em>' + pad(tot) + '</em></span>';
    var ars = J.$$('.hm-ar', el); ars[0].classList.toggle('hm-dim', n <= 1); ars[1].classList.toggle('hm-dim', n >= tot);
    // the road: the next one is current now
    var rd = J.$('.hm-road', el);
    rd.innerHTML = road(next, done);
    var st = J.$('.hm-st.hm-cur', rd); if (st) st.classList.add('hm-pop');
    // the camera moves to it, its marker and beam come on
    setFrame(J.$('.hm-w', el), next);
    var mk = J.$('[data-mk="' + next + '"]', el); if (mk) mk.classList.remove('hm-off');
    J.$$('.hm-beam', el).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-beam') === next); });
    confetti(el);
    await s.wait(4200);
    if (d.openCoach && window.DK) {
      var seg = J.$('.dk .seg.co');
      if (seg) await s.press(seg, 120);
      DK.open('coach');
      // close it even if the viewer jumps away while it is open
      try {
        await s.wait(2600);
        /* the question people open the coach for: where are my easiest points? */
        var qc = J.$('.qc [data-qc="easy"]');
        if (qc) await s.press(qc, 200);
        s.hideCursor();
        await s.wait(6400);
      } finally { DK.close(); }
      await s.wait(500);
    }
  }

  J.screen('home', {
    theme: 'dark',
    draw: draw,
    play: async function (el, d, s, ctx) {
      var mode = d.mode || 'first';
      if (mode === 'unlocked') return unlocked(el, d, s, ctx);
      return enter(el, s, mode === 'enter');
    }
  });
})();
