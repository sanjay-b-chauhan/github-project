/* Zero home: the world, with one level chip and the coach beside it.
   Tap the level: the Level tab. Tap Zero's face: the Coach tab. One panel, two tabs, nothing scrolls. */
(function () {
  'use strict';
  var D = window.SP_DATA;
  var AS = 'zero-skill-path-home-assets-b7/';
  /* a url inside a CSS variable resolves against the stylesheet that reads it, so logos get a full address */
  var ABS = new URL(AS, location.href).href;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var DREAM = { co: 'openai', rung: 'mid' };

  /* ---------- the four moments of Maya's run (prototype control, outside the app) ---------- */
  var MOMENTS = {
    day1: {
      label: 'Day 1', pts: 0, done: 0, cur: 0, stage: 'Not started', curPts: 0,
      coach: {
        when: 'Before your first scenario',
        think: 'I have not seen your work yet. Finish Airbnb and I will tell you what I see, the good and the gaps.',
        watch: [['Understanding', 'You get what the manager is really asking'], ['Quality', 'The work holds up when someone checks it'],
                ['Communication', 'Your updates are clear without a follow up'], ['Independence', 'You make the call, then explain it']],
        why: 'Your first scenario. One solid run opens 12 roles.'
      }
    },
    l2: {
      label: 'Level 2', pts: 2480, done: 2, cur: 2, stage: '2 of 4 stages', curPts: 480,
      coach: {
        when: 'After Uber',
        think: 'You build systems that work, and you test them before they ship. Your updates read rushed, and that is what keeps your reviews at Meeting.',
        well: [['Your router sent every lead to the right rep', 'airbnb'], ['You tested the score on last month’s leads first', 'uber']],
        improve: [['Write updates in full sentences', 'Say what you did, what you found and what you need.', 'Communication'],
                  ['Show the number before and after', '“26 hours to 90 seconds” lands. “Much faster” does not.', 'Quality']],
        why: 'Builds on your Uber score with live buying signals.'
      }
    },
    l5: {
      label: 'Level 5', pts: 5400, done: 4, cur: 4, stage: '1 of 4 stages', curPts: 400,
      coach: {
        when: 'After SpaceX',
        think: 'Your data work is the strongest part of what you build. You still check in before you finish a stage, and managers notice.',
        well: [['Your waterfall filled the gaps on 8,000 accounts', 'spacex'], ['You found the accounts ready to buy this week', 'stripe']],
        improve: [['Finish a stage before you ask', 'Make the call, then tell your manager why you made it.', 'Independence'],
                  ['Present without reading your slides', 'Know your three numbers by heart.', 'Communication']],
        why: 'Trains working with sales, the read that holds you back.'
      }
    },
    l9: {
      label: 'Level 9', pts: 9300, done: 8, cur: 8, stage: '1 of 4 stages', curPts: 300,
      coach: {
        when: 'After Meta',
        think: 'One scenario from the job you want. Your systems are ready for OpenAI. How you present them is the last gap.',
        well: [['Your call notes agent filled deal fields with 96% accuracy', 'meta'], ['You finished every stage at Netflix without asking', 'netflix']],
        improve: [['Open with the answer', 'Lead with the result, then how you got there.', 'Communication']],
        why: 'One solid run takes you to Level 10. OpenAI opens.'
      }
    }
  };

  /* what each level opens, in one line (the roles themselves come from the data) */
  var OPENS = {
    1: 'Your first paid work: GTM internships', 2: 'More internships, in Austin and New York', 3: 'Your first full time roles',
    4: 'Associate roles, most above $100,000', 5: 'GTM Engineer titles open', 6: 'GTM Engineer at growth startups',
    7: 'Senior and forward deployed roles', 8: 'Senior roles at Clay, Modal and LangChain', 9: 'Staff roles and AI architects',
    10: 'OpenAI and Anthropic. Every role is open'
  };

  var I = {
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>',
    play: '<svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.6 5z" fill="currentColor"/></svg>',
    l: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
    r: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg>',
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3"/></svg>',
    folio: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 3 17 6.5 10 10 3 6.5z"/><path d="m3 10 7 3.5 7-3.5M3 13.5 10 17l7-3.5"/></svg>',
    jobs: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="6" width="14" height="10.5" rx="2.5"/><path d="M7.5 6V4.8c0-.7.5-1.3 1.2-1.3h2.6c.7 0 1.2.6 1.2 1.3V6"/></svg>'
  };

  function logo(co, z) {
    z = z || 28;
    var nm = esc(D.CO[co] || co);
    if (D.MONO && D.MONO[co]) return '<span class="lg mono" style="--z:' + z + 'px;--c:' + (D.TINT[co] || '#111') + '" title="' + nm + '"><b>' + D.MONO[co] + '</b></span>';
    if (D.PNG && D.PNG[co]) return '<span class="lg png" style="--z:' + z + 'px" title="' + nm + '"><img src="' + AS + 'logo/' + co + '.png" alt=""></span>';
    var c = D.TINT[co] || '#111113', ink = D.INK[co];
    var inner = co === 'microsoft'
      ? '<svg viewBox="0 0 20 20"><rect x="1" y="1" width="8.4" height="8.4" fill="#F25022"/><rect x="10.6" y="1" width="8.4" height="8.4" fill="#7FBA00"/><rect x="1" y="10.6" width="8.4" height="8.4" fill="#00A4EF"/><rect x="10.6" y="10.6" width="8.4" height="8.4" fill="#FFB900"/></svg>'
      : '<i style="--u:url(' + ABS + 'logo/' + co + '.svg)' + (typeof ink === 'string' ? ';--m:' + ink : '') + '"></i>';
    return '<span class="lg" style="--z:' + z + 'px;--c:' + c + '" title="' + nm + '">' + inner + '</span>';
  }
  function face(z) { return '<span class="face" style="--z:' + z + 'px"></span>'; }

  /* ---------- levels ---------- */
  function level(pts) { return Math.max(0, Math.min(10, Math.floor(pts / 1000))); }
  function rolesAt(L) {
    var r = D.rolesAt(DREAM, L).slice();
    r.sort(function (a, b) { return (b.target ? 1 : 0) - (a.target ? 1 : 0); });
    return r;
  }
  function payTop(rs) {
    var best = 0;
    rs.forEach(function (r) {
      if (!/^\$/.test(r.pay || '') || /month|hour/.test(r.pay)) return;
      var n = (r.pay.match(/[\d,]+/g) || []).map(function (x) { return +x.replace(/,/g, ''); });
      best = Math.max(best, n[n.length - 1] || 0);
    });
    return best;
  }
  function places(rs) {
    var c = {};
    rs.forEach(function (r) { var p = /^Remote/.test(r.loc) ? 'Remote' : r.loc; c[p] = (c[p] || 0) + 1; });
    return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 3);
  }
  function companies(rs, n) {
    var seen = {}, out = [];
    rs.forEach(function (r) { if (!seen[r.co]) { seen[r.co] = 1; out.push(r.co); } });
    return out.slice(0, n);
  }

  /* ---------- state ---------- */
  var S = { m: 'l2', tab: 'level', open: true, rung: null, seen: false };
  try {
    var q = new URLSearchParams(location.search);
    if (MOMENTS[q.get('m')]) S.m = q.get('m');
    var h = location.hash.slice(1);
    if (h === 'coach' || h === 'level') S.tab = h; else if (h === 'closed') S.open = false;
  } catch (e) {}
  function M() { return MOMENTS[S.m]; }

  /* ---------- the world ---------- */
  var W = 3456, H = 1944, SW = 1440, SH = 862;
  function drawWorld() {
    var sc = D.SCENARIOS[M().cur], p = D.PLACE[sc.co] || D.PLACE.zero;
    var px = p[0] / 100 * W, py = p[1] / 100 * H;
    var ox = Math.min(0, Math.max(SW - W, 640 - px)), oy = Math.min(0, Math.max(SH - H, 500 - py));
    $('#world').style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    var pin = $('#pin'), beam = $('#beam');
    pin.style.left = px + 'px'; pin.style.top = py + 'px'; pin.innerHTML = logo(sc.co, 26);
    beam.style.left = px + 'px'; beam.style.top = (py - 430) + 'px';
  }

  /* ---------- HUD ---------- */
  function drawHud() {
    var m = M(), lv = level(m.pts), frac = lv >= 10 ? 1 : (m.pts - lv * 1000) / 1000;
    $('#chipLv').innerHTML = '<span class="st">✦</span><b>L' + lv + '</b><span class="bar"><i style="width:' + Math.round(frac * 100) + '%"></i></span>';
    $('#chipCo').innerHTML = face(30) + '<span class="dot' + (S.seen ? ' off' : '') + '"></span>';
    $('#hud').className = 'hud' + (S.open ? (S.tab === 'level' ? ' lv' : ' co') : '');
  }

  /* ---------- the Level tab ---------- */
  function drawLevel() {
    var m = M(), lv = level(m.pts), next = Math.min(10, lv + 1), into = m.pts - lv * 1000, left = lv >= 10 ? 0 : (next * 1000 - m.pts);
    if (S.rung == null) S.rung = lv >= 10 ? 10 : next;
    var h = '<div class="lv-h"><h2>Level ' + lv + '</h2><div class="pts"><b>' + fmt(m.pts) + '</b>skill points</div></div>' +
      '<div class="lv-bar"><i style="width:' + (lv >= 10 ? 100 : Math.round(into / 10)) + '%"></i></div>' +
      '<div class="lv-to"><span>' + (lv >= 10 ? 'Every role is open' : fmt(left) + ' to Level ' + next) + '</span><span>' + (lv >= 10 ? '' : 'about 1 scenario') + '</span></div>';
    h += '<div class="ladder" id="ladder"><i class="rail-l"></i><i class="rail-f"></i>';
    for (var L = 1; L <= 10; L++) {
      var rs = rolesAt(L), cls = L < lv ? 'past' : L === lv ? 'past here' : L === 10 ? 'goal' : 'ahead', n = D.BUCKET[L] || rs.length;
      var band = L === 10 ? 'Your goal' : (D.GATES[L] ? D.GATES[L].name : '');
      h += '<div class="rung ' + cls + (S.rung === L ? ' open' : '') + '" data-l="' + L + '" role="button" tabindex="0">' +
        '<div class="rw"><span class="nd"></span>' +
        '<span class="nm"><b>Level ' + L + '</b>' + (L === lv ? '<span class="you">You</span>' : '<span>' + esc(band) + '</span>') + '</span>' +
        '<span class="rt"><span class="stack">' + companies(rs, 3).map(function (c) { return logo(c, 20); }).join('') + '</span>' +
        '<span class="n">' + (L <= lv ? n + ' open' : '+' + n + ' roles') + '</span><span class="pt">' + fmt(L * 1000) + '</span></span></div>' +
        opens(L, rs, n, lv) + '</div>';
    }
    h += '</div>';
    var sc = D.SCENARIOS[m.cur];
    h += '<div class="pn-foot"><p>Scenarios pay skill points.</p><button class="btn" type="button">' + I.play + (m.curPts ? 'Continue: ' : 'Start: ') + esc(D.CO[sc.co]) + '</button></div>';
    $('#pgLevel').innerHTML = h;
    railFill();
  }
  function opens(L, rs, n, lv) {
    var top = payTop(rs), pl = places(rs), show = rs.slice(0, 2);
    var chips = [];
    chips.push('<span class="k">' + (L <= lv ? n + ' roles open to you' : n + ' new roles') + '</span>');
    if (top) chips.push('<span>Pay up to $' + fmt(top) + '</span>'); else chips.push('<span>Paid internships</span>');
    if (pl.length) chips.push('<span>' + pl.map(esc).join(' · ') + '</span>');
    var m = M(), how = '';
    if (L === lv + 1) { var sc = D.SCENARIOS[m.cur]; how = '<p class="op-how">' + fmt(L * 1000 - m.pts) + ' skill points away. Finish ' + esc(D.CO[sc.co]) + ' at Meeting or better.</p>'; }
    return '<div class="op"><p class="op-line">' + esc(OPENS[L]) + '</p>' + how + '<div class="op-roles">' + show.map(function (r) {
      return '<div>' + logo(r.co, 24) + '<span class="t"><b>' + esc(r.title) + (r.target ? ' · the job you want' : '') + '</b><span>' + esc(D.CO[r.co]) + ' · ' + esc(r.loc) + '</span></span><span class="p">' + esc(short(r.pay)) + '</span></div>';
    }).join('') + '</div><div class="op-more">' + chips.join('') + '</div></div>';
  }
  function short(p) {
    if (!p || /not posted/.test(p)) return '';
    var m = p.match(/^(CA)?\$([\d,]+)( to ([\d,]+))?/);
    if (!m) return p;
    if (/month|hour/.test(p)) return p.replace(' a month', '/mo').replace(' an hour', '/hr');
    var k = function (s) { return Math.round(+s.replace(/,/g, '') / 1000) + 'k'; };
    return (m[1] || '') + '$' + k(m[2]) + (m[4] ? ' to ' + k(m[4]) : '');
  }
  /* the gold line runs from Level 1 down to where she stands, part way to the next level */
  function railFill() {
    var lad = $('#ladder'); if (!lad) return;
    var rows = lad.querySelectorAll('.rung'), base = lad.getBoundingClientRect(), sc = scale();
    function y(el) { var r = el.querySelector('.nd').getBoundingClientRect(); return (r.top + r.height / 2 - base.top) / sc; }
    var y1 = y(rows[0]), y10 = y(rows[9]), m = M(), lv = level(m.pts);
    var l = lad.querySelector('.rail-l'), f = lad.querySelector('.rail-f');
    l.style.top = y1 + 'px'; l.style.height = (y10 - y1) + 'px';
    var end = y1;
    if (lv >= 1) {
      end = y(rows[lv - 1]);
      if (lv < 10) end += (y(rows[lv]) - end) * ((m.pts - lv * 1000) / 1000);
    }
    f.style.top = y1 + 'px'; f.style.height = Math.max(0, end - y1) + 'px';
  }

  /* ---------- the Coach tab ---------- */
  function drawCoach() {
    var m = M(), c = m.coach, lv = level(m.pts), sc = D.SCENARIOS[m.cur];
    var h = '<div class="co-h">' + face(30) + '<b>Your coach</b><span>' + esc(c.when) + '</span></div>' +
      '<p class="co-think">' + esc(c.think) + '</p>';
    if (c.well) h += '<div class="co-sec"><h4>Doing well</h4>' + c.well.map(function (w) {
      return '<div class="co-row"><span class="ic ok">' + I.tick + '</span><span class="t"><b>' + esc(w[0]) + '</b></span><span class="tg">' + logo(w[1], 18) + esc(D.CO[w[1]]) + '</span></div>';
    }).join('') + '</div>';
    if (c.improve) h += '<div class="co-sec"><h4>To improve</h4>' + c.improve.map(function (w) {
      return '<div class="co-row"><span class="ic wk"></span><span class="t"><b>' + esc(w[0]) + '</b><p><em>Try this:</em> ' + esc(w[1]) + '</p></span><span class="tg">' + esc(w[2]) + '</span></div>';
    }).join('') + '</div>';
    if (c.watch) h += '<div class="co-sec"><h4>What I will look for</h4>' + c.watch.map(function (w) {
      return '<div class="co-row"><span class="ic wk"></span><span class="t"><b>' + esc(w[0]) + '</b><p>' + esc(w[1]) + '</p></span><span class="tg"></span></div>';
    }).join('') + '</div>';
    var next = Math.min(10, lv + 1), left = next * 1000 - m.pts;
    h += '<div class="co-next"><h4>' + (lv >= 10 ? 'Keep sharp' : 'To reach Level ' + next + ' · ' + fmt(left) + ' skill points') + '</h4>' +
      '<div class="nx">' + logo(sc.co, 36) + '<span class="tt"><b>' + esc(sc.title) + '</b><span class="sub">' + esc(D.CO[sc.co]) + ' · up to 3,000 skill points</span></span>' +
      '<button class="btn" type="button">' + I.play + (m.curPts ? 'Continue' : 'Start') + '</button></div>' +
      '<p class="why">' + esc(c.why) + '</p></div>';
    $('#pgCoach').innerHTML = h;
  }

  /* ---------- the scenario card and the capsule ---------- */
  function drawCard() {
    var m = M(), sc = D.SCENARIOS[m.cur], n = D.SCENARIOS.length;
    var rows = m.curPts
      ? [['Progress', esc(m.stage)], ['So far', '<span class="st">✦</span>' + fmt(m.curPts)], ['Pays up to', '<span class="st">✦</span>3,000']]
      : [['Time', 'about ' + sc.mins + ' min'], ['Pays up to', '<span class="st">✦</span>3,000'], ['Tools', esc(sc.tools.join(', '))]];
    $('#card').innerHTML = '<div class="cd-pg">' + I.l + '<span>' + String(m.cur + 1).padStart(2, '0') + ' / ' + n + '</span>' + I.r + '</div>' +
      '<div class="cd-art"><img src="' + AS + 'img/b/' + sc.co + '.webp" alt=""></div>' +
      '<div class="cd-t"><h3>' + esc(sc.title) + '</h3><p>at ' + esc(D.CO[sc.co]) + '</p></div>' +
      '<dl class="cd-rows">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="cd-go"><button class="btn" type="button">' + I.play + (m.curPts ? 'Continue' : 'Start') + '</button></div>';
    $('#capsule').innerHTML = D.SCENARIOS.map(function (s, i) {
      var st = i < m.done ? 'done' : i === m.cur ? 'cur' : 'ahead';
      return '<span class="s ' + st + '" title="' + esc(D.CO[s.co] + ', ' + s.title) + '">' + logo(s.co, 26) + '</span>';
    }).join('');
  }

  /* ---------- the panel: open, close, switch tabs without redrawing ---------- */
  function setTab(t, instant) {
    S.tab = t;
    if (t === 'coach') S.seen = true;
    $('#tabs').classList.toggle('coach', t === 'coach');
    [].forEach.call(document.querySelectorAll('#tabs button'), function (b) { b.classList.toggle('on', b.dataset.tab === t); });
    var pl = $('#pgLevel'), pc = $('#pgCoach');
    pl.hidden = t !== 'level'; pc.hidden = t !== 'coach';
    sizeBody(instant);
    drawHud();
    if (t === 'level') requestAnimationFrame(railFill);
  }
  function sizeBody(instant) {
    var body = $('.pn-body'), pg = S.tab === 'level' ? $('#pgLevel') : $('#pgCoach');
    if (instant) body.style.transition = 'none';
    body.style.height = pg.offsetHeight + 'px';
    if (instant) { body.offsetHeight; body.style.transition = ''; }
  }
  function setOpen(o) {
    S.open = o;
    $('#panel').classList.toggle('open', o);
    drawHud();
    try { history.replaceState(null, '', location.pathname + location.search + '#' + (o ? S.tab : 'closed')); } catch (e) {}
  }
  function openTab(t) {
    if (S.open && S.tab === t) { setOpen(false); return; }
    setTab(t, !S.open);
    setOpen(true);
  }

  /* ---------- the prototype control ---------- */
  function drawMoments() {
    $('#moments').innerHTML = Object.keys(MOMENTS).map(function (k) {
      return '<button type="button" data-m="' + k + '"' + (k === S.m ? ' class="on"' : '') + '>' + MOMENTS[k].label + '</button>';
    }).join('');
  }
  function setMoment(k) {
    S.m = k; S.rung = null; S.seen = false;
    drawMoments(); drawAll();
    try { history.replaceState(null, '', location.pathname + '?m=' + k + '#' + (S.open ? S.tab : 'closed')); } catch (e) {}
  }
  function drawAll() {
    drawWorld(); drawHud(); drawLevel(); drawCoach(); drawCard();
    setTab(S.tab, true);
  }

  /* ---------- fit the app window to the screen ---------- */
  function scale() { var a = $('#app'); return a._s || 1; }
  function fit() {
    var st = $('#stage'), a = $('#app');
    var s = Math.min((st.clientWidth - 40) / 1440, (st.clientHeight - 32) / 900);
    a._s = s;
    a.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  /* ---------- wire up ---------- */
  $('#city').src = AS + 'img/city.webp';
  $('.wm').src = AS + 'img/zero-wordmark.svg';
  $('.tb-av').src = AS + 'img/maya.jpg';
  $('#rail').innerHTML = '<button type="button" class="on" title="World">' + I.world + '</button><button type="button" title="Portfolio">' + I.folio + '</button><button type="button" title="Jobs">' + I.jobs + '</button>';
  $('#chipLv').addEventListener('click', function (e) { e.stopPropagation(); openTab('level'); });
  $('#chipCo').addEventListener('click', function (e) { e.stopPropagation(); openTab('coach'); });
  $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });
  $('#panel').addEventListener('click', function (e) {
    e.stopPropagation();
    var r = e.target.closest('.rung');
    if (!r || e.target.closest('.op')) return;
    var L = +r.dataset.l;
    S.rung = S.rung === L ? 0 : L;
    [].forEach.call(document.querySelectorAll('.rung'), function (x) { x.classList.toggle('open', +x.dataset.l === S.rung); });
    sizeBody(); railFill();
  });
  $('#panel').addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('rung')) { e.preventDefault(); e.target.click(); } });
  $('#screen').addEventListener('click', function () { if (S.open) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) setOpen(false); });
  $('#moments').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMoment(b.dataset.m); });
  window.addEventListener('resize', function () { fit(); railFill(); });

  fit(); drawMoments(); drawAll();
  $('#panel').classList.toggle('open', S.open);
  drawHud();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizeBody(true); railFill(); });
  window.__ready = true;
})();
