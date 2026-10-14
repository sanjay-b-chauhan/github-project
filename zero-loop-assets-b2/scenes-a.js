/* scenes-a.js: the Scenarios and Levels screens of Maya's path, drawn as the real Zero app.
   onboard (day one), world (home: pick a scenario, daily check in), kickoff, stage (the work, the coach),
   pop (understanding check), complete (the splash), review (performance review, level up).
   Every class starts with a-. Story timing only through s.wait / s.press / s.type / s.count / s.fly. */
(function () {
  'use strict';
  var D = J.D, IC = J.IC, esc = J.esc, n = J.n;
  function q(s, r) { return r.querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call(r.querySelectorAll(s)); }
  function on(el, c) { if (el) el.classList.add(c || 'a-in'); }

  /* ---------- small data kept here (not in data.js) ---------- */
  /* the soft brand glow behind a company's logo on its scenario card */
  var BRAND = { hubspot: '#FF7A59', notion: '#D9D4C7', shopify: '#95BF47', stripe: '#7A73FF', datadog: '#8A5CF0', figma: '#A259FF', zendesk: '#3FB59E' };
  var DIFF = ['', 'Beginner', 'Intermediate', 'Advanced'];
  var STAGES = ['Plan', 'Build', 'Test'];

  /* ---------- icons this file adds ---------- */
  var AI = {
    home: '<svg viewBox="0 0 16 16"><rect x="3.4" y="3.4" width="9.2" height="9.2" rx="3.6" transform="rotate(-24 8 8)" fill="none" stroke="currentColor" stroke-width="2.3"/></svg>',
    gym: '<svg viewBox="0 0 16 16"><path d="M5.6 10.4l4.8-4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3.3 8.6l4.1 4.1M8.6 3.3l4.1 4.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M2.4 11.5l2.1 2.1M11.5 2.4l2.1 2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    case: '<svg viewBox="0 0 16 16"><path d="M5.6 4.6V3.8c0-.7.5-1.2 1.2-1.2h2.4c.7 0 1.2.5 1.2 1.2v.8" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="4.6" width="12" height="8.8" rx="2.4" fill="currentColor"/><path d="M2 8.4h12" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>',
    gear: '<svg viewBox="0 0 16 16"><path d="M8 5.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.6v1.6M8 12.8v1.6M14.4 8h-1.6M3.2 8H1.6M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1M12.5 12.5l-1.1-1.1M4.6 4.6 3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.9" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.9V8l2 1.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    notes: '<svg viewBox="0 0 16 16"><rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.4 6h5.2M5.4 8.4h5.2M5.4 10.8h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    up: '<svg viewBox="0 0 16 16"><path d="M8 10.6V3M4.8 6 8 2.8 11.2 6M3 10.4v1.4c0 .8.6 1.4 1.4 1.4h7.2c.8 0 1.4-.6 1.4-1.4v-1.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shot: '<svg viewBox="0 0 16 16"><path d="M2.8 5.4V4.2c0-.8.6-1.4 1.4-1.4h1.2M10.6 2.8h1.2c.8 0 1.4.6 1.4 1.4v1.2M13.2 10.6v1.2c0 .8-.6 1.4-1.4 1.4h-1.2M5.4 13.2H4.2c-.8 0-1.4-.6-1.4-1.4v-1.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    chev: '<svg viewBox="0 0 16 16"><path d="M4.5 6.2 8 9.7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tri: '<svg viewBox="0 0 16 16"><path d="M5.5 3.8v8.4l6.6-4.2z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 16 16"><path d="M8 4.5v7M4.5 8h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };
  /* one round icon per read the coach can talk about */
  var READ = {
    Understanding: '<svg viewBox="0 0 16 16"><path d="M8 2.1a4.4 4.4 0 0 0-2.7 7.9c.5.4.8.9.8 1.5v.5h3.8v-.5c0-.6.3-1.1.8-1.5A4.4 4.4 0 0 0 8 2.1z" fill="currentColor"/><path d="M6.4 13.7h3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    Quality: '<svg viewBox="0 0 16 16"><path d="M8 1.9l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.2l-3.7 2 .8-4.1L2 6.2l4.2-.5z" fill="currentColor"/></svg>',
    Communication: '<svg viewBox="0 0 16 16"><path d="M3.6 2.9h8.8c.9 0 1.6.7 1.6 1.6v5.2c0 .9-.7 1.6-1.6 1.6H7.3l-3 2.3v-2.3h-.7c-.9 0-1.6-.7-1.6-1.6V4.5c0-.9.7-1.6 1.6-1.6z" fill="currentColor"/></svg>',
    Independence: '<svg viewBox="0 0 16 16"><path d="M8 1.7l5 1.9v3.9c0 3.1-2.1 5.5-5 6.8-2.9-1.3-5-3.7-5-6.8V3.6z" fill="currentColor"/></svg>',
    Speed: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8.6" r="5.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 5.8v2.9l1.9 1.2M6.4 1.8h3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'AI slop': '<svg viewBox="0 0 16 16"><path d="M6.6 1.9c.4 3 1.6 4.5 5.5 5.3-3.9.8-5.1 2.3-5.5 5.3-.4-3-1.6-4.5-5.5-5.3 3.9-.8 5.1-2.3 5.5-5.3z" fill="currentColor"/><path d="M12.3 9.8c.2 1.2.6 1.8 2.1 2.1-1.5.3-1.9.9-2.1 2.1-.2-1.2-.6-1.8-2.1-2.1 1.5-.3 1.9-.9 2.1-2.1z" fill="currentColor"/></svg>'
  };
  /* a gold four point star, faceted like the real celebration star */
  function star4(cls) {
    return '<svg class="' + cls + '" viewBox="0 0 120 120" aria-hidden="true"><defs>' +
      '<linearGradient id="a-s1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE9A6"/><stop offset="1" stop-color="#F4B93A"/></linearGradient>' +
      '<linearGradient id="a-s2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7C24A"/><stop offset="1" stop-color="#D98E12"/></linearGradient></defs>' +
      '<path d="M60 4 70 50 60 60z" fill="url(#a-s1)"/><path d="M60 4 50 50 60 60z" fill="#FFF1C2"/>' +
      '<path d="M116 60 70 70 60 60z" fill="url(#a-s2)"/><path d="M116 60 70 50 60 60z" fill="url(#a-s1)"/>' +
      '<path d="M60 116 50 70 60 60z" fill="#E59E1E"/><path d="M60 116 70 70 60 60z" fill="url(#a-s2)"/>' +
      '<path d="M4 60 50 50 60 60z" fill="#FFE39A"/><path d="M4 60 50 70 60 60z" fill="#F2B232"/></svg>';
  }

  /* ---------- shared bits ---------- */
  function hudw(o) { return '<div class="a-hudw">' + J.hud(o) + '</div>'; }
  function hm(mins) { var h = Math.floor(mins / 60), m = mins % 60; return '~' + (h ? h + ' hr' : '') + (m ? (h ? ' ' : '') + m + ' min' : ''); }
  function clock(sec) { sec = Math.max(0, sec); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function mmss(x) { x = Math.round(x); return '00:' + (x < 10 ? '0' : '') + x; }
  function wave(nb, seed) {
    var s = '';
    for (var i = 0; i < nb; i++) {
      var h = .28 + .72 * Math.abs(Math.sin((i + seed) * 1.71) * Math.cos((i + seed) * .53 + .4));
      s += '<i style="--h:' + h.toFixed(2) + ';--k:' + i + '"></i>';
    }
    return '<span class="a-wave">' + s + '</span>';
  }
  /* coins (or a star) flying to a HUD pill; the last flight is awaited */
  async function rain(s, from, to, html, k) {
    for (var i = 0; i < (k || 3) - 1; i++) { s.fly(from, to, html, 820); await s.wait(110); }
    await s.fly(from, to, html, 820);
  }
  var COIN = '<span class="jcoin a-fc"></span>';
  var STARF = '<span class="a-fs">' + IC.star + '</span>';
  function crPill() { return document.querySelector('.jx-app .jcr'); }
  function lvPill() { return document.querySelector('.jx-app .jlv'); }
  function idx(beat, beats) { return beats.indexOf(beat); }
  /* the review that closes this scenario, so the coach's pips match the grade she gets */
  function reviewOf(beat, beats, sc) {
    for (var i = idx(beat, beats) + 1; i < beats.length; i++) if (beats[i].screen === 'review' && beats[i].d.sc === sc) return beats[i];
    return null;
  }
  function pipsFor(read, kind, rv) {
    var k = D.READS.indexOf(read), band = rv && k >= 0 ? rv.d.reads[k] : (kind === 'high' ? 3 : 1);
    var p = band + 1;
    return kind === 'high' ? Math.max(4, p) : Math.max(1, Math.min(2, p));
  }

  /* the left panel of the stage (and the understanding check, so it reads as the same place) */
  function leftPanel(sc, name, si, ticked, total, left) {
    var reqs = sc.reqs.map(function (r, i) {
      return '<li class="a-req' + (i < ticked ? ' a-ok' : '') + (i === si ? ' a-now' : '') + '"><i class="a-req-ck">' + IC.check + '</i><span>' + esc(r) + '</span></li>';
    }).join('');
    var tools = sc.tools.map(function (t) { return '<li>' + J.logo(t[1], 20, 'round') + '<span>' + esc(t[0]) + '</span></li>'; }).join('');
    return '<aside class="a-lp">' +
      '<button class="a-back" aria-label="Back">' + IC.back + '</button>' +
      '<div class="a-lp-sc">' + J.logo(sc.dom, 36, 'round') + '<b>' + esc(sc.title) + ' at ' + esc(sc.co) + '</b></div>' +
      (si > 0 ? '<div class="a-lp-done"><span class="a-lp-dl">' + AI.chev + '<span class="a-mono">Completed</span></span><span class="a-lp-dn">' + si + '</span></div>' : '') +
      '<div class="a-stg">' +
        '<div class="a-stg-h"><b>' + esc(name) + '</b><span class="a-stg-ok">' + IC.check + 'Done</span></div>' +
        '<div class="a-stg-t"><span class="a-mono">' + AI.clock + 'Time left</span><span class="a-clock">' + clock(left) + '</span></div>' +
        '<div class="a-stg-bar"><i style="width:' + (left / total * 100).toFixed(1) + '%"></i></div>' +
        '<div class="a-stg-sep"></div>' +
        '<div class="a-mono a-lbl">Requirements</div><ul class="a-reqs">' + reqs + '</ul>' +
      '</div>' +
      '<div class="a-mono a-lbl a-lp-tl">Tools</div><ul class="a-lp-tools">' + tools + '</ul>' +
    '</aside>';
  }
  /* the stage clock ticks down while the beat plays; it stops on a jump or when the stage is done */
  function tick(s, view, total, left) {
    var c = q('.a-clock', view), bar = q('.a-stg-bar i', view);
    (async function () {
      try {
        while (!view.__aStop) {
          await s.wait(1000); if (view.__aStop) return;
          left--; c.textContent = clock(left); bar.style.width = (left / total * 100).toFixed(2) + '%';
        }
      } catch (e) { /* the beat moved on */ }
    })();
  }

  /* ======================= 1. onboard ======================= */
  J.screen('onboard', {
    theme: 'dark',
    draw: function (view, d) {
      view.innerHTML = '<div class="a-ob">' +
        '<div class="a-ob-wm">' + J.wordmark('a-wm') + '</div>' +
        '<div class="a-ob-c">' +
          '<div class="a-ob-me">' + J.av('maya', 44) + '</div>' +
          '<h1 class="a-ob-q">' + esc(d.ask) + '</h1>' +
          '<div class="a-ob-opts">' + d.options.map(function (o, i) {
            return '<button class="a-opt" style="--i:' + i + '" data-v="' + esc(o) + '"><span>' + esc(o) + '</span><i class="a-opt-ck">' + IC.check + '</i></button>';
          }).join('') + '</div>' +
          '<button class="a-key a-ob-go">Continue' + IC.arrow + '</button>' +
        '</div></div>';
    },
    play: async function (s, view, d) {
      var root = q('.a-ob', view), opts = qa('.a-opt', view), go = q('.a-ob-go', view);
      var pi = Math.max(0, d.options.indexOf(d.pick)), pick = opts[pi];
      await s.wait(80); on(root);
      await s.wait(1300);
      var path = [opts[(pi + 1) % opts.length], opts[(pi + 4) % opts.length], pick];
      for (var i = 0; i < path.length; i++) {
        opts.forEach(function (o) { o.classList.remove('a-hov'); });
        path[i].classList.add('a-hov');
        await s.wait(i < 2 ? 620 : 520);
      }
      await s.press(pick, 0);
      pick.classList.remove('a-hov'); pick.classList.add('a-sel');
      opts.forEach(function (o) { if (o !== pick) o.classList.add('a-dim'); });
      await s.wait(520);
      on(go);
      await s.wait(500);
      await s.press(go, 900);
      await s.wait(300);
    }
  });

  /* ======================= 2. world ======================= */
  function roadHTML(road) {
    var h = '', shown = road.filter(function (r) { return r.done || r.current; });
    shown.forEach(function (r, i) {
      var sc = D.SC[r.sc];
      if (r.done) {
        h += '<span class="a-rs a-rd" style="--band:' + D.BANDS[r.band].c + '" title="' + esc(sc.co) + '">' + J.logo(sc.dom, 28, 'round') + '<i class="a-rtk">' + IC.check + '</i></span>';
      } else {
        h += '<span class="a-rs a-rc" data-sc="' + r.sc + '"><span class="a-rc-e">' + AI.plus + '</span><span class="a-rc-f">' + J.logo(sc.dom, 28, 'round') + '<b>' + esc(sc.co) + '</b></span></span>';
      }
      h += '<i class="a-rl' + (r.done ? ' a-rl-on' : '') + '"></i>';
    });
    return '<div class="a-road">' + h + '<span class="a-rs a-rbag" aria-label="Jobs">' + AI.case + '</span></div>';
  }
  function cardHTML(k, i) {
    var sc = D.SC[k];
    var diff = '<span class="a-diff">' + [1, 2, 3].map(function (p) { return '<i' + (p <= sc.diff ? ' class="a-p"' : '') + '></i>'; }).join('') + '<span>' + DIFF[sc.diff] + '</span></span>';
    var tools = '<span class="a-tools">' + sc.tools.map(function (t) { return J.logo(t[1], 22, 'round'); }).join('') + '</span>';
    var conf = '';
    for (var c = 0; c < 26; c++) {
      var a = (c * 137.5 + i * 40) % 360, r = 70 + (c * 53 % 90), x = Math.cos(a * Math.PI / 180) * r, y = Math.sin(a * Math.PI / 180) * r * .7;
      var col = ['#FF7AA8', '#FFD45C', '#6FD3FF', '#9C7BFF', '#7BE08A', '#FF9E57'][c % 6];
      conf += '<i style="--x:' + x.toFixed(0) + 'px;--y:' + (y - 40).toFixed(0) + 'px;--f:' + (150 + c * 11 % 120) + 'px;--r:' + (c * 67 % 360) + 'deg;--c:' + col + ';--dl:' + (c * 17 % 160) + 'ms;--w:' + (c % 3 ? 7 : 5) + 'px"></i>';
    }
    return '<article class="a-sc" data-k="' + k + '" style="--brand:' + (BRAND[k] || '#ffffff') + ';--i:' + i + '">' +
      '<div class="a-sc-art"><i class="a-sc-glow"></i>' + J.logo(sc.dom, 72, 'round') + '</div>' +
      '<h3 class="a-sc-t">' + esc(sc.title) + '</h3>' +
      '<div class="a-sc-co">at ' + esc(sc.co) + '</div>' +
      '<div class="a-sc-rows">' +
        '<div class="a-row"><span class="a-mono">Skill points up to</span><span class="a-xp">' + IC.star + n(D.BANDS[4].pay) + '</span></div>' +
        '<div class="a-row"><span class="a-mono">Time</span><span>' + hm(sc.mins) + '</span></div>' +
        '<div class="a-row"><span class="a-mono">Difficulty</span>' + diff + '</div>' +
        '<div class="a-row"><span class="a-mono">Tools</span>' + tools + '</div>' +
      '</div>' +
      '<button class="a-enter"><span class="a-enter-l">' + AI.tri + 'Enter</span><span class="a-enter-c"><span class="jcoin"></span>' + D.CREDIT.start + '</span></button>' +
      '<div class="a-conf" aria-hidden="true">' + conf + '</div>' +
    '</article>';
  }
  function checkinHTML(d) {
    var day = d.broke ? 1 : d.day, slots = '';
    for (var i = 1; i <= 7; i++) {
      var cls = i < day ? 'a-dd' : i === day ? 'a-dt' : 'a-df';
      var face = i === 7 ? '<span class="a-chest"><i class="a-chest-l"></i><i class="a-chest-b"></i><i class="a-chest-k"></i></span>' :
        i < day ? '<span class="a-dck">' + IC.check + '</span>' : '<span class="jcoin"></span>';
      slots += '<div class="a-day ' + cls + (i === 7 ? ' a-d7' : '') + '"><span class="a-dbox">' + face + '</span><span class="a-dl">Day ' + i + '</span></div>';
    }
    return '<div class="a-ck"><h2 class="a-ck-t">' + (d.broke ? 'Welcome back' : 'Day ' + day) + '</h2>' +
      '<div class="a-days">' + slots + '</div>' +
      '<button class="a-key a-collect"><span class="jcoin"></span><span class="a-collect-t">Collect ' + d.reward + '</span></button></div>';
  }
  J.screen('world', {
    theme: 'world',
    draw: function (view, d, st) {
      var mid = '';
      if (d.mode === 'pick') mid = '<div class="a-pk"><h2 class="a-pk-t">' + (st.done === 0 ? 'Pick your first scenario' : 'Pick your next scenario') + '</h2>' +
        '<div class="a-pk-cards">' + d.pick.map(cardHTML).join('') + '</div></div>';
      if (d.mode === 'checkin') mid = checkinHTML(d);
      view.innerHTML = '<div class="a-w a-w-' + d.mode + '">' +
        '<img class="a-w-img" data-ok alt="" src="' + J.A + 'world.jpg">' +
        '<div class="a-w-dim"></div>' +
        '<div class="a-w-wm">' + J.wordmark('a-wm') + '</div>' +
        '<nav class="a-rail"><span class="a-rb a-rb-on">' + AI.home + '</span><span class="a-rb">' + AI.gym + '</span><span class="a-rb">' + AI.case + '</span></nav>' +
        '<span class="a-gear">' + AI.gear + '</span>' +
        hudw() + mid + roadHTML(d.road) + '</div>';
    },
    play: async function (s, view, d, st) {
      var w = q('.a-w', view), cur = q('.a-rc', view);
      await s.wait(60); on(w);
      if (d.mode === 'pick') {
        var cards = qa('.a-sc', view), chosen = cards.filter(function (c) { return c.getAttribute('data-k') === d.choose; })[0] || cards[0];
        var other = cards.filter(function (c) { return c !== chosen; })[0];
        await s.wait(500);
        cards.forEach(function (c) { on(c); });
        await s.wait(250);
        cards.forEach(function (c) { on(c, 'a-boom'); });
        await s.wait(1500);
        if (other) { other.classList.add('a-hov'); await s.wait(1100); other.classList.remove('a-hov'); }
        chosen.classList.add('a-hov');
        await s.wait(800);
        var btn = q('.a-enter', chosen);
        await s.press(btn, 700);
        await rain(s, q('.a-enter-c .jcoin', chosen), crPill(), COIN, 3);
        J.pills.credits(st.credits - D.CREDIT.start, true);
        chosen.classList.remove('a-hov');
        if (other) other.classList.add('a-out');
        chosen.classList.add('a-lift');
        chosen.style.setProperty('--dx', (chosen === cards[0] ? 1 : -1) * (chosen.offsetWidth / 2 + 10) + 'px');
        await s.wait(500);
        if (cur) cur.classList.add('a-fill');
        await s.wait(900);
      }
      if (d.mode === 'checkin') {
        var ck = q('.a-ck', view), today = q('.a-dt', view), btn2 = q('.a-collect', view);
        await s.wait(400); on(ck);
        await s.wait(900); on(today, 'a-glow');
        await s.wait(900);
        await s.press(btn2, 900);
        await rain(s, q('.jcoin', today), crPill(), COIN, 3);
        J.pills.credits(st.credits + d.reward, true);
        today.classList.add('a-got');
        q('.a-dbox', today).innerHTML = '<span class="a-dck">' + IC.check + '</span>';
        btn2.classList.add('a-did'); q('.a-collect-t', btn2).textContent = 'Collected';
        var cn = q('.jcoin', btn2); if (cn) cn.outerHTML = '<span class="a-cdone">' + IC.check + '</span>';
        await s.wait(700);
      }
    }
  });

  /* ======================= 3. kickoff ======================= */
  J.screen('kickoff', {
    theme: 'dark',
    draw: function (view, d) {
      var sc = D.SC[d.sc], m = sc.manager;
      var reqs = sc.reqs.map(function (r, i) { return '<li style="--i:' + i + '"><span class="a-bn">' + (i + 1) + '</span><span>' + esc(r) + '</span></li>'; }).join('');
      view.innerHTML = '<div class="a-ko">' +
        '<button class="a-back a-ko-back" aria-label="Back">' + IC.back + '</button>' + hudw() +
        '<div class="a-vid ' + (m.t || 't1') + '">' +
          '<div class="a-vid-room" data-ok aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
          '<div class="a-vid-p">' + J.av(m, 120) + '</div>' +
          '<div class="a-vid-name"><b>' + esc(m.name) + '<span class="a-spk" aria-hidden="true"><i></i><i></i><i></i></span></b><span>' + esc(m.title) + '</span></div>' +
          '<div class="a-self"><img alt="" src="' + D.MAYA.photo + '"></div>' +
        '</div>' +
        '<div class="a-cap">' + J.av(m, 24) + '<p class="a-cap-t"></p></div>' +
        '<aside class="a-brief">' +
          '<div class="a-brief-h">' + AI.notes + '<span>Brief</span></div>' +
          '<div class="a-brief-in">' +
            '<div class="a-brief-sc">' + J.logo(sc.dom, 36, 'round') + '<div><b>' + esc(sc.title) + '</b><span>at ' + esc(sc.co) + '</span></div></div>' +
            '<div class="a-mono a-lbl">Goal</div><p class="a-brief-g">' + esc(sc.brief) + '</p>' +
            '<div class="a-mono a-lbl">Requirements</div><ol class="a-breqs">' + reqs + '</ol>' +
            '<div class="a-mono a-lbl">Tools</div><div class="a-btools">' + sc.tools.map(function (t) { return '<span>' + J.logo(t[1], 18, 'round') + esc(t[0]) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '<button class="a-key a-start">Start the work' + IC.arrow + '</button>' +
        '</aside></div>';
    },
    play: async function (s, view, d) {
      var sc = D.SC[d.sc], vid = q('.a-vid', view), cap = q('.a-cap-t', view);
      await s.wait(500); on(vid, 'a-join');
      await s.wait(900); on(q('.a-cap', view));
      vid.classList.add('a-talk');
      await s.type(cap, sc.kick, 34);
      vid.classList.remove('a-talk');
      await s.wait(500);
      var rows = qa('.a-breqs li', view);
      for (var i = 0; i < rows.length; i++) { on(rows[i]); await s.wait(520); }
      var start = q('.a-start', view);
      on(start);
      await s.wait(600);
      await s.press(start, 900);
    }
  });

  /* ======================= 4. stage ======================= */
  function coachHTML(d, beat, beats) {
    var c = d.coach, card = d.card, w = D.COACH[c.read][c.kind], rv = reviewOf(beat, beats, d.sc);
    var p = pipsFor(c.read, c.kind, rv), pips = '';
    for (var i = 0; i < 5; i++) pips += '<i' + (i < p ? ' class="a-pl"' : '') + '></i>';
    var blocks = '';
    if (card) {
      blocks = '<div class="a-cb"><div class="a-cbh">What I think so far</div><p>' + esc(card.think) + '</p></div>' +
        '<div class="a-cb a-need"><div class="a-cbh">What I need to see' + (card.read !== c.read ? '<span class="a-ctag">' + READ[card.read] + esc(card.read) + '</span>' : '') + '</div><p>' + esc(card.need) + '</p></div>' +
        '<div class="a-csep"></div>';
    }
    return '<aside class="a-coach">' +
      '<header class="a-coach-h"><span class="a-mono">Coach</span><i class="a-rdot"></i><button class="a-x" aria-label="Close">' + IC.x + '</button></header>' +
      blocks +
      '<p class="a-say">' + esc(w.say) + '</p>' +
      (card && card.need === w.try ? '' : '<p class="a-try a-' + c.kind + '"><b>' + (c.kind === 'low' ? 'Try' : 'Keep') + '</b><span>' + esc(w.try) + '</span></p>') +
      '<div class="a-read a-' + c.kind + '" style="--p:' + (p / 5) + '"><span class="a-ric"><span>' + READ[c.read] + '</span></span>' +
        '<div class="a-rb2"><div class="a-rh"><span class="a-mono">' + esc(c.read) + '</span><span class="a-pips">' + pips + '</span></div>' +
        '<p class="a-saw">Saw: ' + esc(w.saw) + '</p></div></div>' +
    '</aside>';
  }
  J.screen('stage', {
    theme: 'dark',
    draw: function (view, d, st, beat, beats) {
      var sc = D.SC[d.sc], m = sc.manager, si = Math.max(0, STAGES.indexOf(d.stage));
      var total = Math.round(sc.mins / 3) * 60, left = Math.round(total * .62);
      view.__aT = { total: total, left: left };
      view.innerHTML = '<div class="a-st' + (d.coach ? ' a-has-coach' : '') + '">' +
        leftPanel(sc, d.stage, si, si, total, left) +
        '<section class="a-chat">' +
          '<header class="a-mh">' + J.av(m, 36) + '<div><b>' + esc(m.name) + '</b><span>Manager</span></div></header>' +
          '<div class="a-thread"><div class="a-thr"></div></div>' +
          '<div class="a-comp"><div class="a-comp-t"><span data-ph="Reply to ' + esc(m.name.split(' ')[0]) + '"></span></div>' +
            '<div class="a-comp-b"><span class="a-ci">' + AI.up + '</span><span class="a-ci">' + AI.shot + '</span><button class="a-stuck">I’m stuck</button><button class="a-send" aria-label="Send">' + IC.send + '</button></div></div>' +
        '</section>' +
        hudw({ dot: false }) +
        (d.coach ? coachHTML(d, beat, beats) : '') +
      '</div>';
    },
    play: async function (s, view, d, st, beat, beats) {
      var sc = D.SC[d.sc], m = sc.manager, si = Math.max(0, STAGES.indexOf(d.stage));
      var thr = q('.a-thr', view), comp = q('.a-comp-t', view), ct = q('.a-comp-t span', view), send = q('.a-send', view);
      tick(s, view, view.__aT.total, view.__aT.left);
      function bubble(cls, text) {
        var b = J.el('<div class="a-b ' + cls + '"></div>'); b.textContent = text; thr.appendChild(b); return b;
      }
      await s.wait(700);
      var chat = d.chat || [];
      for (var i = 0; i < chat.length; i++) {
        var msg = chat[i];
        if (msg.from === 'mgr') {
          var dots = J.el('<div class="a-b a-mgr a-dots"><i></i><i></i><i></i></div>'); thr.appendChild(dots);
          await s.wait(1000);
          dots.remove(); bubble('a-mgr', msg.t);
          await s.wait(1100);
        } else {
          comp.classList.add('a-typing');
          await s.type(ct, msg.t, msg.t.length > 120 ? 75 : 40);
          comp.classList.remove('a-typing');
          send.classList.add('a-live');
          await s.wait(250);
          await s.press(send, 300);
          ct.textContent = ''; send.classList.remove('a-live');
          bubble('a-me', msg.t);
          await s.wait(900);
        }
      }
      await s.wait(400);
      if (d.coach) {
        J.pills.coachDot(true);
        await s.wait(900);
        on(q('.a-st', view), 'a-coach-on');
        await s.wait(3600);
      }
      /* the stage is done: the requirement ticks, the stage closes, credits come in */
      view.__aStop = true;
      /* if her manager will grade this scenario below Meeting, the requirement is sent but not met: amber, no tick */
      var rv = null; for (var k = idx(beat, beats) + 1; k < beats.length; k++) if (beats[k].screen === 'review' && beats[k].d.sc === d.sc) { rv = beats[k]; break; }
      var weak = rv && rv.d.band < 2;
      var req = qa('.a-req', view)[si];
      if (req) { req.classList.remove('a-now'); req.classList.add(weak ? 'a-miss' : 'a-ok', 'a-tk'); }
      await s.wait(500);
      var stg = q('.a-stg', view); on(stg, 'a-done');
      await s.wait(350);
      await rain(s, q('.a-stg-ok', view), crPill(), COIN, 2);
      J.pills.credits(st.credits + D.CREDIT.stage, true);
      await s.wait(500);
    }
  });

  /* ======================= 5. pop: understanding check ======================= */
  J.screen('pop', {
    theme: 'dark',
    draw: function (view, d, st, beat, beats) {
      /* the left panel shows the stage she just finished, closed, so it reads as the same place */
      var sc = D.SC[d.sc], m = sc.manager, prev = null;
      for (var k = idx(beat, beats) - 1; k >= 0; k--) if (beats[k].screen === 'stage' && beats[k].d.sc === d.sc) { prev = beats[k]; break; }
      var pname = prev ? prev.d.stage : 'Plan', psi = Math.max(0, STAGES.indexOf(pname));
      var total = Math.round(sc.mins / 3) * 60, left = Math.round(total * .62) - 23;
      var qs = d.qs.map(function (t, i) {
        return '<div class="a-vq" style="--i:' + i + '">' +
          '<div class="a-vr a-vm">' + J.av(m, 32) + '<div class="a-vb"><span class="a-pl2">' + AI.tri + '</span>' + wave(22, i * 5 + 1) + '<span class="a-dur">' + mmss(6 + i) + '</span></div></div>' +
          '<p class="a-vtx">' + esc(t) + '</p>' +
          '<div class="a-vr a-vme"><div class="a-vb a-vbm"><span class="a-mic">' + IC.mic + '</span>' + wave(20, i * 7 + 3) + '<span class="a-dur">00:00</span></div><span class="a-vok">' + IC.check + '</span></div>' +
          (i === d.qs.length - 1 && !d.good ? '<p class="a-vneed">Needs more</p>' : '') +
        '</div>';
      }).join('');
      view.innerHTML = '<div class="a-st a-pv">' +
        leftPanel(sc, pname, psi, prev ? psi + 1 : psi, total, left).replace('class="a-stg"', 'class="a-stg' + (prev ? ' a-done' : '') + '"') +
        '<section class="a-pc">' +
          '<header class="a-pc-h"><h2 class="a-pc-t">Understanding check</h2>' +
            '<div class="a-meter" aria-label="Checks">' + [0, 1, 2, 3].map(function () { return '<i>' + IC.check + '</i>'; }).join('') + '</div></header>' +
          '<div class="a-vlist">' + qs + '</div>' +
          '<div class="a-talk"><span class="a-talkb">' + IC.mic + '</span></div>' +
        '</section>' + hudw() + '</div>';
    },
    play: async function (s, view, d) {
      var blocks = qa('.a-vq', view), meter = qa('.a-meter i', view), talk = q('.a-talkb', view);
      await s.wait(600);
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i], last = i === blocks.length - 1;
        on(q('.a-vm', b));
        await s.wait(450);
        q('.a-vm .a-vb', b).classList.add('a-playing');
        await s.wait(1200);
        on(q('.a-vtx', b));
        await s.wait(550);
        var me = q('.a-vme', b), vb = q('.a-vbm', b);
        on(me); vb.classList.add('a-rec'); talk.classList.add('a-on');
        await s.count(q('.a-dur', vb), 0, 5 + i, 1350, mmss);
        vb.classList.remove('a-rec'); talk.classList.remove('a-on');
        await s.wait(250);
        if (d.good || !last) { on(q('.a-vok', b)); on(meter[i]); }
        else on(q('.a-vneed', b));
        await s.wait(550);
      }
      if (d.good) { await s.wait(300); on(meter[3]); }
      await s.wait(500);
    }
  });

  /* ======================= 6. complete ======================= */
  J.screen('complete', {
    theme: 'light',
    draw: function (view) {
      view.innerHTML = '<div class="a-cp">' +
        '<i class="a-cp-l" data-ok></i><i class="a-cp-r" data-ok></i><i class="a-cp-bloom" data-ok></i>' +
        '<svg class="a-cp-arcs" viewBox="0 0 1180 660" aria-hidden="true"><defs>' +
          '<linearGradient id="a-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="a-gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="a-gb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient></defs>' +
          '<ellipse class="a-arc a-arc1" cx="590" cy="250" rx="470" ry="560" fill="url(#a-gf)" stroke="url(#a-ga)" stroke-width="2.4"/>' +
          '<ellipse class="a-arc a-arc2" cx="590" cy="230" rx="300" ry="380" fill="url(#a-gf)" stroke="url(#a-ga)" stroke-width="1.8"/>' +
          '<circle class="a-arc a-arc3" cx="590" cy="214" r="150" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/>' +
          '<circle class="a-arc a-arc4" cx="590" cy="214" r="96" fill="rgba(255,250,220,.16)" stroke="rgba(255,240,190,.7)" stroke-width="1.2"/>' +
          '<path class="a-arc a-swoosh" d="M330 330 C 520 270, 820 250, 940 330 S 900 520, 760 560" fill="none" stroke="url(#a-gb)" stroke-width="2.2" stroke-linecap="round"/>' +
        '</svg>' +
        '<div class="a-cp-mid">' + star4('a-cp-star') + '<div class="a-cp-k">Scenario</div><div class="a-cp-w">Complete</div></div>' +
        '<svg class="a-cp-sp a-cp-sp1" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c1.2 13 6 18 20 20-14 2-18.8 7-20 20-1.2-13-6-18-20-20 14-2 18.8-7 20-20z" fill="#fff"/></svg>' +
        '<svg class="a-cp-sp a-cp-sp2" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c1.2 13 6 18 20 20-14 2-18.8 7-20 20-1.2-13-6-18-20-20 14-2 18.8-7 20-20z" fill="#fff"/></svg>' +
        '<i class="a-cp-dot a-cp-d1"></i><i class="a-cp-dot a-cp-d2"></i>' +
      '</div>';
    },
    play: async function (s, view) {
      await s.wait(60); on(q('.a-cp', view));
      await s.wait(1500);
    }
  });

  /* ======================= 7. review ======================= */
  J.screen('review', {
    theme: 'light',
    draw: function (view, d, st) {
      var sc = D.SC[d.sc], m = sc.manager, B = D.BANDS[d.band], lvd = d.lvTo - d.lvFrom;
      var reads = D.READS.map(function (r, i) { return '<li><span>' + esc(r) + '</span>' + J.bands(d.reads[i]) + '</li>'; }).join('');
      var cr = D.CREDIT.scenario;
      var quiet = '';
      if (lvd <= 0) {
        var have = d.before + d.pts, next = d.lvFrom + 1, need = next * 1000 - have, frac = Math.max(0, Math.min(1, (have - d.lvFrom * 1000) / 1000));
        quiet = '<div class="a-rq"><div class="a-rq-h"><span>' + n(need) + ' more to Level ' + next + '</span><span class="a-rq-n">L' + next + '</span></div>' +
          '<div class="a-rq-bar"><i style="--w:' + (frac * 100).toFixed(1) + '%"></i></div>' +
          (d.lvTo === 0 ? '<div class="a-rq-z">' + IC.lock + 'No roles open yet</div>' : '') + '</div>';
      }
      var pop = lvd > 0 ? '<div class="a-veil"></div><div class="a-lvp"><span class="a-lvp-ring">' + star4('a-lvp-star') + '</span><b>Level ' + d.lvTo + '!</b>' +
        '<span class="a-lvp-l"><span>+' + n(d.newRoles) + ' roles open</span><span class="a-lvp-c"><span class="jcoin"></span>+' + n(lvd * D.CREDIT.level) + ' credits</span></span></div>' : '';
      view.innerHTML = '<div class="a-rv">' + hudw({ light: true }) +
        '<div class="a-rv-l">' +
          '<div class="a-mono a-rv-k">Performance review</div>' +
          '<h1 class="a-rv-t">' + esc(sc.title) + ' at ' + esc(sc.co) + '</h1>' +
          '<div class="a-op"><div class="a-mono">Overall performance</div><div class="a-op-in" style="--bc:' + B.c + '"><span class="a-op-dot"></span><b>' + esc(B.name) + '</b>' + J.bands(d.band) + '</div></div>' +
          '<div class="a-rvm">' + J.av(m, 44) + '<div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span></div></div>' +
          '<p class="a-note">' + esc(d.note) + '</p>' +
        '</div>' +
        '<aside class="a-rw">' +
          '<div class="a-mono">Reward</div>' +
          '<div class="a-rw-big"><span class="a-rw-s">' + IC.star + '</span><b class="a-rw-n">+0</b><span class="a-rw-u">skill points</span></div>' +
          '<div class="a-rw-cr"><span class="jcoin"></span><span>+' + n(cr) + ' credits</span></div>' +
          '<ul class="a-rw-reads">' + reads + '</ul>' + quiet +
        '</aside>' + pop + '</div>';
    },
    play: async function (s, view, d, st) {
      var lvd = d.lvTo - d.lvFrom, num = q('.a-rw-n', view);
      await s.wait(60); on(q('.a-rv', view));
      await s.wait(900);
      if (d.pts > 0) await s.count(num, 0, d.pts, 1400, function (x) { return '+' + n(x); });
      else num.textContent = '+0';
      await s.wait(350);
      if (d.pts > 0) await rain(s, q('.a-rw-s', view), lvPill(), STARF, 3);
      J.pills.level(st.pts + d.pts, true);
      await s.wait(250);
      await rain(s, q('.a-rw-cr .jcoin', view), crPill(), COIN, 3);
      J.pills.credits(st.credits + D.CREDIT.scenario + lvd * D.CREDIT.level, true);
      await s.wait(500);
      if (lvd > 0) { on(q('.a-veil', view)); on(q('.a-lvp', view)); await s.wait(1200); }
      else { on(q('.a-rq', view)); await s.wait(900); }
    }
  });
})();
