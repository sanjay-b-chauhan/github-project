/* Zero b8, builder C: the end of a scenario.
   complete (refs 17 then 18): the celebration, then Project completed with the skills read.
   review (refs 19 and 20): the performance review from the manager, the reward counted in, and the Level N! pop.
   Classes are dn-*, scoped under .sc-complete / .sc-review. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC, n = J.n;
  var SKILLS = ['Understanding', 'Quality', 'Communication', 'Independence'];
  var WORD = { 5: 'Exceptional', 4: 'Exceeding Expectations', 3: 'Meeting Expectations', 2: 'Below Expectations', 1: 'Underperforming' };

  function scOf(d) { return D.SC[d.sc] || D.SC.router; }
  function titleCase(t) { return String(t).replace(/\b([a-z])([a-z]*)/g, function (m, a, b) { return /^(at|with|and|of|to|the|a|in|on|for|by)$/.test(m) ? m : a.toUpperCase() + b; }); }
  /* the coach's read of this scenario: what he knew before, plus what the review adds */
  function readsOf(st, fx) {
    var r = {}, a = (st.coach && st.coach.reads) || {}, b = (fx && fx.coach && fx.coach.reads) || {}, k;
    for (k in a) r[k] = a[k];
    for (k in b) r[k] = b[k];
    return r;
  }
  function reviewAfter(c) {
    var b = D.CASES[c.key].beats;
    for (var k = c.i + 1; k < b.length; k++) if (b[k].screen === 'review') return b[k];
    return null;
  }
  function kindOf(x) {
    var k = x.kind;
    if (/^internships$/i.test(k)) return 'internships';
    if (/roles$/i.test(k)) return k.charAt(0).toLowerCase() + k.slice(1);
    if (/^top/i.test(k)) return 'roles at the top of the field';
    return k + ' roles';
  }

  var STAR = '<svg class="dn-star" viewBox="0 0 100 100" aria-hidden="true"><defs>' +
    '<linearGradient id="dnStA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".5" stop-color="#FAC955"/><stop offset="1" stop-color="#EEA43C"/></linearGradient></defs>' +
    '<path d="M50 3C53.5 33 67 46.5 97 50 67 53.5 53.5 67 50 97 46.5 67 33 53.5 3 50 33 46.5 46.5 33 50 3z" fill="url(#dnStA)"/>' +
    '<path d="M50 3C53.5 33 67 46.5 97 50H50z" fill="#fff" opacity=".28"/><path d="M50 97C46.5 67 33 53.5 3 50H50z" fill="#B86E14" opacity=".16"/>' +
    '<path d="M3 50C33 46.5 46.5 33 50 3V50z" fill="#fff" opacity=".12"/></svg>';
  var TROPHY = '<svg class="dn-tro" viewBox="0 0 64 64" aria-hidden="true"><defs>' +
    '<linearGradient id="dnTrA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC66A"/><stop offset=".55" stop-color="#F3AFC4"/><stop offset="1" stop-color="#C8B6F6"/></linearGradient>' +
    '<linearGradient id="dnTrB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9DBBFF"/><stop offset="1" stop-color="#6E8CEB"/></linearGradient></defs>' +
    '<path d="M14.5 15.5h-4c0 6.5 3.4 10.6 8.6 11.2M49.5 15.5h4c0 6.5-3.4 10.6-8.6 11.2" fill="none" stroke="#F6C2A2" stroke-width="1.7" stroke-linecap="round"/>' +
    '<path d="M17 11.5h30v8.5c0 9.6-6.7 16.6-15 16.6S17 29.6 17 20z" fill="url(#dnTrA)"/>' +
    '<path d="M28.6 36h6.8v8.6h-6.8z" fill="#E4C3EC"/><path d="M22 44.6h20l1.6 7.6H20.4z" fill="#D8C8F6"/>' +
    '<ellipse cx="17.5" cy="46.5" rx="10.5" ry="5.2" fill="url(#dnTrB)" opacity=".92"/></svg>';
  var SPARK = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C21 15 25 19 40 20 25 21 21 25 20 40 19 25 15 21 0 20 15 19 19 15 20 0z" fill="#fff"/></svg>';

  /* ================= complete (17, then 18) ================= */
  J.screen('complete', {
    theme: 'light',
    draw: function (el, d, c) {
      var s = scOf(d), st = c.st, L = J.lvl(st), into = L >= 10 ? 1000 : st.pts - D.startOf(L);
      var rb = reviewAfter(c), reads = readsOf(st, rb && rb.fx);
      var rows = SKILLS.map(function (k) {
        var v = Math.max(1, Math.min(5, reads[k] || 3)), f = Math.round(v / 5 * 20), seg = '';
        for (var i = 0; i < 23; i++) seg += '<i class="' + (i < f ? 'dn-on' : i === f ? 'dn-mk' : '') + '" style="--i:' + i + '"></i>';
        return '<div class="dn-sk dn-v' + v + '"><div class="dn-skh"><b>' + esc(k) + '</b><span><i></i>' + esc(WORD[v]) + '</span></div>' +
          '<div class="dn-sg">' + seg + '<u></u></div></div>';
      }).join('');
      el.innerHTML =
        '<div class="dn-pc">' +
          '<div class="dn-pc-lab">' + J.logo(s.co, 18) + '<span>' + esc(s.full) + '</span></div>' +
          '<div class="dn-pc-l"><div class="dn-pc-k"><i></i><span>Project completed</span><i></i></div>' +
            '<div class="dn-pc-lv"><span>RANK</span><b>' + L + '</b></div>' +
            '<div class="dn-pc-bar"><i style="width:' + (into / 10) + '%"></i></div>' +
            '<div class="dn-pc-m"><span><b>' + n(into) + '</b> / 1,000 skill points</span><span>' + (L >= 10 ? 'Top level' : n(1000 - into) + ' to Level ' + (L + 1)) + '</span></div></div>' +
          '<div class="dn-pc-r"><div class="dn-pc-k2"><span>Your skills</span><i></i></div><div class="dn-skc">' + rows + '</div></div>' +
          '<button class="dn-recap">' + IC.play + '<span>Recap your journey</span></button><button class="dn-cont">Continue</button>' +
        '</div>' +
        '<div class="dn-cel">' +
          '<i class="dn-cv dn-cv1"></i><i class="dn-cv dn-cv2"></i><i class="dn-rg dn-rg1"></i><i class="dn-rg dn-rg2"></i><i class="dn-rg dn-rg3"></i><i class="dn-sw"></i><i class="dn-glow"></i>' +
          '<span class="dn-sp dn-sp1">' + SPARK + '</span><span class="dn-sp dn-sp2">' + SPARK + '</span><span class="dn-sp dn-sp3">' + SPARK + '</span><i class="dn-bub dn-bub1"></i><i class="dn-bub dn-bub2"></i>' +
          '<div class="dn-ttl">' +
            '<svg class="dn-fl" viewBox="0 0 640 300" aria-hidden="true"><path d="M182 238C120 262 52 236 62 178 72 116 168 92 262 98 330 102 380 112 398 96 408 86 398 74 384 80"/></svg>' +
            STAR + '<span class="dn-scn">Scenario</span><span class="dn-cmp">Complete</span>' +
          '</div>' +
          '<div class="dn-cel-sc">' + J.logo(s.co, 22) + '<span>' + esc(s.full) + '</span></div>' +
        '</div>';
    },
    play: async function (el, d, s) {
      el.classList.add('dn-go');
      await s.wait(3600);
      el.classList.add('dn-b');
      await s.wait(800);
      el.classList.add('dn-fill');
      await s.wait(3600);
      await s.press($('.dn-cont', el));
      await s.wait(200);
    }
  });

  /* ================= review (19, and the level up 20) ================= */
  function split(total, reads) {
    var base = Math.min(500, total), units = Math.round((total - base) / 50), ks = ['Quality', 'Communication', 'Independence'];
    var w = ks.map(function (k) { return reads[k] || 3; }), sum = w.reduce(function (a, b) { return a + b; }, 0);
    var raw = w.map(function (x) { return units * x / sum; }), fl = raw.map(Math.floor);
    var left = units - fl.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (x, i) { return [x - fl[i], i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, left).forEach(function (x) { fl[x[1]]++; });
    return [['Base skill points', base]].concat(ks.map(function (k, i) { return [k, fl[i] * 50]; }));
  }
  function toolKey(name) { for (var k in D.CO) if (D.CO[k][0] === name) return k; return null; }
  var LVCLS = { Proficient: 'dn-pro', Competent: 'dn-com', Developing: 'dn-dev' };
  /* the skill levels in data.js are the strong run; a weaker grade shows them a step lower */
  var STEP = ['Developing', 'Competent', 'Proficient'];
  function skillAt(lv, band) {
    var i = STEP.indexOf(lv); if (i < 0) return lv;
    if (band === 'below' || band === 'under') i -= 1; else if (band === 'meeting' && i === 2) i = 1;
    return STEP[Math.max(0, i)];
  }

  J.screen('review', {
    theme: 'light',
    draw: function (el, d, c) {
      var s = scOf(d), b = D.band(d.band), m = D.P[d.mgr || s.mgr || 'jay'] || D.P.jay, fx = c.beat.fx || {};
      var reads = readsOf(c.st, fx), rows = split(b.pts, reads);
      var pts0 = c.st.pts, L0 = J.lvl(c.st), pts1 = pts0 + b.pts, L1 = D.levelOf(pts1), x = D.LEVELS[L1 - 1];
      var how = b.key === 'exceptional' ? '' : b.key === 'exceeding' ? 'Here’s how to reach Exceptional' : 'Here’s how to Exceed Expectations';
      var tries = ((fx.coach && fx.coach.fix) || []).map(function (f) { return f.try; }).filter(Boolean).slice(0, 2);
      if (!tries.length) tries = ['Keep doing what got you here, and send your plan inside the first hour.'];
      var after = L1 > L0
        ? J.badge(L1) + '<b>Level ' + L1 + '</b><span>Up from Level ' + L0 + '</span>'
        : J.badge(L0) + '<b>Still Level ' + L0 + '</b><span>' + (L0 >= 10 ? 'Top level' : n(D.startOf(L0 + 1) - pts1) + ' more to Level ' + (L0 + 1)) + '</span>';
      el.innerHTML = '<div class="dn-rv">' +
        '<div class="dn-main">' +
          '<div class="dn-eye">Performance review</div>' +
          '<h1 class="dn-h1">' + esc(titleCase(s.full)) + '</h1>' +
          '<div class="dn-ov"><div class="dn-eye">Overall performance</div>' +
            '<div class="dn-ovb">' + TROPHY + '<b>' + esc(b.review) + '</b></div>' +
            (how ? '<div class="dn-how"><button class="dn-howb"><span>' + how + '</span>' + IC.chev + '</button>' +
              '<div class="dn-howx"><div>' + tries.map(function (t) { return '<p>' + IC.arrow + '<span>' + esc(t) + '</span></p>'; }).join('') + '</div></div></div>' : '') +
          '</div>' +
          '<div class="dn-hr"></div>' +
          '<div class="dn-mgr"><img alt="" src="' + m.photo + '"><div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span></div></div>' +
          '<p class="dn-note">' + esc(d.note || '') + '</p>' +
        '</div>' +
        '<div class="dn-side">' +
          '<div class="dn-card dn-rw"><div class="dn-eye">Reward</div>' +
            '<div class="dn-tot">' + STAR + '<b class="dn-num">0</b><span>skill points</span></div>' +
            '<div class="dn-rows">' + rows.map(function (r) { return '<div class="dn-row" data-v="' + r[1] + '"><span>' + esc(r[0]) + '</span><b' + (r[1] ? '' : ' class="dn-zero"') + '>+' + n(r[1]) + '</b></div>'; }).join('') + '</div>' +
            '<div class="dn-after' + (L1 > L0 ? ' dn-upr' : '') + '">' + after + '</div></div>' +
          '<div class="dn-card"><div class="dn-eye">Skills learned</div><div class="dn-chips">' + (s.skills || []).map(function (k) {
            var lv = skillAt(k[1], b.key);
            return '<span class="dn-chip ' + (LVCLS[lv] || 'dn-com') + '">' + esc(k[0]) + '<em>' + esc(lv) + '</em></span>'; }).join('') + '</div></div>' +
          '<div class="dn-card"><div class="dn-eye">Tools used</div><div class="dn-tools">' + (s.toolsUsed || []).map(function (t) {
            var k = toolKey(t); return '<span class="dn-tool">' + (k ? J.logo(k, 24) : '<i class="dn-ltr">' + esc(t.charAt(0)) + '</i>') + esc(t) + '</span>'; }).join('') + '</div></div>' +
        '</div></div>' +
        '<div class="dn-veil"></div>' +
        '<div class="dn-pop" role="status"><div class="dn-ring">' + J.badge(L1) + '</div><b>Level ' + L1 + '!</b>' +
          '<span class="dn-pts">+' + n(b.pts) + ' skill points</span><span class="dn-roles">' + x.roles + ' ' + esc(kindOf(x)) + ' open to you</span></div>';
    },
    play: async function (el, d, s, c) {
      var b = D.band(d.band), short = !!d.short, pts0 = c.st.pts, L0 = J.lvl(c.st), L1 = D.levelOf(pts0 + b.pts);
      var num = $('.dn-num', el), rows = $$('.dn-row', el);
      await s.wait(short ? 1100 : 1700);
      var hb = $('.dn-howb', el);
      if (!short && hb) {
        await s.press(hb);
        $('.dn-how', el).classList.add('dn-open');
        await s.wait(700); s.hideCursor();
        await s.wait(2600);
      } else if (!short) await s.wait(2400);
      /* the reward comes in row by row, and the total counts with it */
      var tot = 0;
      for (var i = 0; i < rows.length; i++) {
        var v = +rows[i].getAttribute('data-v');
        rows[i].classList.add('dn-in');
        if (v) { await s.count(num, tot, tot + v, short ? 420 : 620); tot += v; }
        else await s.wait(short ? 220 : 340);
      }
      num.textContent = n(b.pts);
      s.fx();
      $('.dn-rw', el).classList.add('dn-landed');
      $('.dn-after', el).classList.add('dn-in');
      if (L1 > L0) {
        await s.wait(short ? 380 : 600);
        el.classList.add('dn-up');
        await s.wait(short ? 2200 : 2600);
      } else await s.wait(1800);
    }
  });
})();
