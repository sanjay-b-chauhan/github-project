/* Zero home: the world, with two chips at the top right. They are the tabs.
   The level chip opens how far the job is. Your photo opens your coach. The panel holds only the content. */
(function () {
  'use strict';
  var D = window.SP_DATA;
  var AS = 'zero-skill-path-home-assets-b8/';
  /* a url inside a CSS variable resolves against the stylesheet that reads it, so logos get a full address */
  var ABS = new URL(AS, location.href).href;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var DREAM = { co: 'openai', rung: 'mid' };

  /* the five bands, the app's own names and colours */
  var BAND = [null,
    { n: 'Underperforming', c: '#D06632' }, { n: 'Below expectations', c: '#EBA640' }, { n: 'Meeting expectations', c: '#EDBE52' },
    { n: 'Exceeding expectations', c: '#46A056' }, { n: 'Exceptional', c: '#2FA35A' }];
  var READS = {
    comm: { n: 'Communication', i: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.5v-2.5H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z"/></svg>' },
    indep: { n: 'Independence', i: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 1.8 13 3.6v4c0 3.1-2.1 5.4-5 6.6-2.9-1.2-5-3.5-5-6.6v-4z"/></svg>' },
    quality: { n: 'Quality', i: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="m8 2 1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4L2.2 6.3l4-.6z"/></svg>' },
    speed: { n: 'Speed', i: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M9 1.8 3.5 9H8l-1 5.2L12.5 7H8z"/></svg>' }
  };

  /* ---------- Maya at four moments (prototype control, outside the app) ----------
     reads: band 1 to 5 (0 = not seen yet). at = where it happened. saw = what happened. try = try this instead. */
  var MOMENTS = {
    day1: {
      label: 'Day 1', pts: 0, done: 0, cur: 0, stage: 'Not started', curPts: 0,
      when: 'Before your first scenario',
      think: 'I have not seen your work yet. These are the four things I watch, with one habit for each from day one.',
      reads: [
        { k: 'comm', b: 0, sub: 'Not seen yet', saw: 'Your updates to your manager: clear, short, and they ask for what you need.', try: 'Write every update as: what I did, what I found, what I need.' },
        { k: 'indep', b: 0, sub: 'Not seen yet', saw: 'Whether you make the call yourself, or wait to be told.', try: 'Make the call, then tell your manager why you made it.' },
        { k: 'quality', b: 0, sub: 'Not seen yet', saw: 'Whether the work holds up when someone checks it.', try: 'Put a number on every result.' },
        { k: 'speed', b: 0, sub: 'Not seen yet', saw: 'How long a stage takes against the time it has.', try: 'Ship a first version early, then make it better.' }
      ],
      lift: 'A clear first update can lift your first review to Exceeding. That pays 2,000 skill points: Level 2 on day one.'
    },
    l2: {
      label: 'Level 2', pts: 2480, done: 2, cur: 2, stage: '2 of 4 stages', curPts: 480,
      when: 'After Uber, today',
      think: 'You build things that work and you test them first. Your messages are what keep your reviews at Meeting.',
      reads: [
        { k: 'comm', b: 2, sub: 'Below expectations', at: 'Airbnb, stage 3', saw: '“hey u there? need crm access”', try: '“Hi Jay, I mapped the lead flow. To build the router I need HubSpot access. Could you add me today?”' },
        { k: 'quality', b: 3, sub: 'Meeting expectations', at: 'Uber, review', saw: 'You said the new score was “much better”. Your manager asked by how much.', try: 'Say the number before and after: “Reps now call 41% of hot leads within an hour, up from 12%.”' },
        { k: 'indep', b: 4, sub: 'Exceeding expectations', at: 'Uber, stage 2', well: 'You tested the score on last month’s leads before anyone asked.', try: 'To reach Exceptional, say which leads the score gets wrong, before your manager finds them.' },
        { k: 'speed', b: 4, sub: 'Exceeding expectations', at: 'Uber', well: 'You finished in 68 minutes, 7 under the time.', try: 'Keep it. Spend the spare minutes checking your numbers.' }
      ],
      lift: 'Write one clear update at Stripe. <span>Meeting takes you to Level 3. Exceeding pays 2,000 and takes you to Level 4.</span>'
    },
    l5: {
      label: 'Level 5', pts: 5400, done: 4, cur: 4, stage: '1 of 4 stages', curPts: 400,
      when: 'After SpaceX, yesterday',
      think: 'Your data work is the best part of what you build. You still check in too often before you finish a stage.',
      reads: [
        { k: 'indep', b: 2, sub: 'Below expectations', at: 'SpaceX, stage 2', saw: 'You asked your manager six times before you finished the stage.', try: 'Make the call, write down why, and ask once at the end with your reasons.' },
        { k: 'comm', b: 3, sub: 'Meeting expectations', at: 'SpaceX, presentation', saw: 'You read your slides word for word.', try: 'Know your three numbers by heart and talk to the room.' },
        { k: 'speed', b: 3, sub: 'Meeting expectations', at: 'SpaceX', saw: 'You took 104 minutes, 14 over the time.', try: 'Ship the first version at the halfway mark, then improve it.' },
        { k: 'quality', b: 5, sub: 'Exceptional', at: 'SpaceX, review', well: 'Your waterfall filled the gaps on 8,000 accounts, checked against a sample of 200.', try: 'Keep checking a sample. It is why managers trust your numbers.' }
      ],
      lift: 'Finish one stage at Spotify without asking. <span>Exceeding pays 2,000 and takes you to Level 7.</span>'
    },
    l9: {
      label: 'Level 9', pts: 9300, done: 8, cur: 8, stage: '1 of 4 stages', curPts: 300,
      when: 'After Meta, today',
      think: 'One scenario from the job you want. Your work is ready for OpenAI. Open with the answer and you are there.',
      reads: [
        { k: 'comm', b: 3, sub: 'Meeting expectations', at: 'Meta, presentation', saw: 'You explained the agent for four minutes before you gave the result.', try: 'Open with the answer: “Reps save three hours a week.” Then show how.' },
        { k: 'speed', b: 4, sub: 'Exceeding expectations', at: 'Meta', well: 'You finished in 88 minutes, 7 under the time.', try: 'Keep it.' },
        { k: 'indep', b: 4, sub: 'Exceeding expectations', at: 'Netflix', well: 'You finished every stage without asking.', try: 'Keep it. Say what you decided and why in one line.' },
        { k: 'quality', b: 5, sub: 'Exceptional', at: 'Meta, review', well: 'Your call notes agent filled deal fields with 96% accuracy.', try: 'Keep showing the accuracy next to the result.' }
      ],
      lift: 'Meeting at Tesla takes you to Level 10. <span>OpenAI opens.</span>'
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
    cv: '<svg class="cv" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg>',
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
  function short(p) {
    if (!p || /not posted/.test(p)) return '';
    if (/month|hour/.test(p)) return p.replace(' a month', ' a month').replace(' an hour', ' an hour');
    var m = p.match(/^(CA)?\$([\d,]+)( to ([\d,]+))?/);
    if (!m) return p;
    var k = function (s) { return Math.round(+s.replace(/,/g, '') / 1000) + 'k'; };
    return (m[1] || '') + '$' + k(m[2]) + (m[4] ? ' to ' + k(m[4]) : '');
  }

  /* ---------- state ---------- */
  var S = { m: 'l2', tab: 'level', open: true, rung: 0, read: null, seen: false };
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
    var ox = Math.min(0, Math.max(SW - W, 600 - px)), oy = Math.min(0, Math.max(SH - H, 500 - py));
    $('#world').style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    var pin = $('#pin');
    pin.style.left = px + 'px'; pin.style.top = py + 'px'; pin.innerHTML = logo(sc.co, 26);
  }

  /* ---------- the chips ---------- */
  function drawHud() {
    var m = M(), lv = level(m.pts), frac = lv >= 10 ? 1 : (m.pts - lv * 1000) / 1000;
    $('#chipLv').innerHTML = '<span class="st">✦</span><b>L' + lv + '</b><span class="bar"><i style="width:' + Math.round(frac * 100) + '%"></i></span>';
    $('#chipMe').innerHTML = '<img src="' + AS + 'img/navid-face.jpg" alt=""><span class="dot' + (S.seen ? ' off' : '') + '"></span>';
    $('#hud').className = 'hud' + (S.open ? (S.tab === 'level' ? ' lv' : ' co') : '');
  }

  /* ---------- Level: how far the job is, and what to do next ---------- */
  function drawLevel() {
    var m = M(), lv = level(m.pts), next = Math.min(10, lv + 1), left = Math.max(0, 10000 - m.pts), sc = D.SCENARIOS[m.cur];
    var h = '<div class="goal">' + logo('openai', 40) + '<span class="t"><b>GTM Engineer at OpenAI</b><span>Your goal · opens at Level 10</span></span></div>';
    h += '<div class="far"><h2>Level ' + lv + '</h2><div class="to"><b>' + (lv >= 10 ? 'Open' : fmt(left)) + '</b>' + (lv >= 10 ? 'every role' : 'skill points to go') + '</div></div>';
    h += '<div class="segs">';
    for (var i = 1; i <= 10; i++) {
      var f = lv >= i ? 1 : i === lv + 1 ? (m.pts - lv * 1000) / 1000 : 0;
      h += '<i' + (i === 10 && lv < 10 ? ' class="goal-s"' : '') + '><b style="width:' + Math.round(f * 100) + '%"></b></i>';
    }
    h += '</div>';
    if (lv < 10) {
      var nm = Math.ceil(left / 1000), ne = Math.ceil(left / 2000);
      h += '<p class="pace">' + (nm === ne ? 'One scenario at Meeting or better.' : nm + ' scenarios at Meeting. ' + ne + (ne === 1 ? ' scenario' : '') + ' at Exceeding.') + '</p>';
    }
    if (lv < 10) {
      var meet = level(m.pts + 1000), exc = level(m.pts + 2000);
      h += '<div class="next"><span class="kick">Next · Level ' + next + ', ' + fmt(next * 1000 - m.pts) + ' skill points away</span>' +
        '<p>Finish ' + esc(D.CO[sc.co]) + ' at Meeting or better. <span>' +
        (next === 10 ? 'OpenAI opens.' : exc > meet ? 'Exceeding takes you to Level ' + exc + '.' : '') + '</span></p></div>';
    }
    /* the levels, folded until you open one */
    h += '<div class="ladder">';
    if (lv >= 2) {
      var passed = 0; for (var k = 1; k < lv; k++) passed += D.BUCKET[k] || 0;
      h += rung('past', 'p', lv === 2 ? 'Level 1' : 'Levels 1 to ' + (lv - 1), 'Done', passed + ' roles', 'open to you', pastList(lv));
    }
    for (var L = Math.max(1, lv); L <= 10; L++) {
      var rs = rolesAt(L), n = D.BUCKET[L] || rs.length, here = L === lv;
      var cls = here ? 'here' : L === 10 ? 'goal' : 'ahead';
      var name = 'Level ' + L + (here ? '<span class="you">You</span>' : '');
      var sub = L === 10 ? 'GTM Engineer at OpenAI' : (D.GATES[L] ? D.GATES[L].name : '');
      h += rung(cls, L, name, sub, n + ' roles', here ? 'open to you' : fmt(L * 1000) + ' points', opens(L, rs, n, here));
    }
    h += '</div>';
    $('#pgLevel').innerHTML = h;
  }
  function rung(cls, id, name, sub, right, right2, body) {
    return '<div class="rung ' + cls + (String(S.rung) === String(id) ? ' open' : '') + '" data-r="' + id + '">' +
      '<button type="button" aria-expanded="' + (String(S.rung) === String(id)) + '"><span class="nd"></span>' +
      '<span class="nm"><b>' + name + '</b><span>' + esc(sub) + '</span></span>' +
      '<span class="rt"><b>' + right + '</b><span>' + right2 + '</span></span>' + I.cv + '</button>' +
      '<div class="op">' + body + '</div></div>';
  }
  function pastList(lv) {
    var h = '<div class="op-roles">';
    for (var L = 1; L < lv; L++) {
      var rs = rolesAt(L), c = rs[0] ? rs[0].co : 'zero';
      h += '<div>' + logo(c, 28) + '<span class="t"><b>Level ' + L + ' · ' + esc(D.GATES[L].name) + '</b><span>' + esc(OPENS[L]) + '</span></span><span class="p">' + (D.BUCKET[L] || 0) + ' roles</span></div>';
    }
    return h + '</div>';
  }
  function opens(L, rs, n, here) {
    var top = payTop(rs), pl = places(rs), show = rs.slice(0, 3), chips = [];
    chips.push('<span>' + (top ? 'Pay up to $' + fmt(top) : 'Paid internships') + '</span>');
    if (pl.length) chips.push('<span>' + pl.map(esc).join(' · ') + '</span>');
    if (n > show.length) chips.push('<span>' + (n - show.length) + ' more roles</span>');
    return '<p class="op-line">' + esc(OPENS[L]) + '</p><div class="op-roles">' + show.map(function (r) {
      return '<div>' + logo(r.co, 28) + '<span class="t"><b>' + esc(r.title) + '</b><span>' + esc(D.CO[r.co]) + ' · ' + esc(r.loc) + (r.target ? ' · the job you want' : '') + '</span></span><span class="p">' + esc(short(r.pay)) + '</span></div>';
    }).join('') + '</div><div class="op-more">' + chips.join('') + '</div>';
  }

  /* ---------- Coach: what I think, the four reads, how to level up faster ---------- */
  function drawCoach() {
    var m = M();
    if (S.read == null) {
      var weakest = m.reads.slice().sort(function (a, b) { return a.b - b.b; })[0];
      S.read = weakest.k;
    }
    var h = '<div class="co-top"><span class="who"><img src="' + AS + 'img/navid-face.jpg" alt=""><span><b>Navid</b><span>Your coach</span></span></span><span class="kick">' + esc(m.when) + '</span></div>' +
      '<p class="co-think">' + esc(m.think) + '</p><div class="reads">';
    m.reads.forEach(function (r) {
      var R = READS[r.k], B = BAND[r.b], pips = '';
      for (var i = 1; i <= 5; i++) pips += '<i' + (B && i <= r.b ? ' style="background:' + B.c + '"' : '') + '></i>';
      var body;
      if (r.well) body = '<h5>What you did well' + (r.at ? ' · ' + esc(r.at) : '') + '</h5><p>' + esc(r.well) + '</p><div class="gap"></div><h5>' + (r.b >= 5 ? 'Keep doing' : 'Try this to go higher') + '</h5><blockquote class="try">' + esc(r.try) + '</blockquote>';
      else if (r.b) body = '<h5>What happened' + (r.at ? ' · ' + esc(r.at) : '') + '</h5><blockquote>' + esc(r.saw) + '</blockquote><div class="gap"></div><h5>Try this instead</h5><blockquote class="try">' + esc(r.try) + '</blockquote>';
      else body = '<h5>What I watch</h5><p>' + esc(r.saw) + '</p><div class="gap"></div><h5>Try this from day one</h5><blockquote class="try">' + esc(r.try) + '</blockquote>';
      h += '<div class="read' + (S.read === r.k ? ' open' : '') + '" data-k="' + r.k + '"><button type="button" aria-expanded="' + (S.read === r.k) + '">' +
        '<span class="ri">' + R.i + '</span><span class="rn"><b>' + R.n + '</b><span>' + esc(r.sub) + '</span></span><span class="pips">' + pips + '</span>' + I.cv + '</button>' +
        '<div class="rd">' + body + '</div></div>';
    });
    h += '</div><div class="lift"><span class="kick">Level up faster</span><p>' + m.lift + '</p></div>';
    $('#pgCoach').innerHTML = h;
  }

  /* ---------- the scenario card and the capsule (the real home, unchanged) ---------- */
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

  /* ---------- the panel ---------- */
  function scale() { return $('#app')._s || 1; }
  /* the little notch points at the chip you tapped */
  function caret() {
    var p = $('#panel'), chip = S.tab === 'level' ? $('#chipLv') : $('#chipMe');
    var pr = p.getBoundingClientRect(), cr = chip.getBoundingClientRect(), s = scale();
    p.style.setProperty('--cx', ((pr.right - (cr.left + cr.width / 2)) / s) + 'px');
  }
  function fade() {
    var sc = $('#pnScroll');
    $('#panel').classList.toggle('more', sc.scrollTop + sc.clientHeight < sc.scrollHeight - 4);
  }
  /* change what the panel holds, and let its height follow smoothly */
  function morph(fn) {
    var p = $('#panel');
    if (!p.classList.contains('open')) { fn(); return; }
    var h0 = p.offsetHeight;
    fn();
    p.style.height = 'auto';
    var h1 = p.offsetHeight;
    p.style.height = h0 + 'px';
    p.offsetHeight;
    p.style.height = h1 + 'px';
    clearTimeout(p._t); p._t = setTimeout(function () { p.style.height = ''; fade(); }, 340);
  }
  function show(tab) {
    S.tab = tab;
    if (tab === 'coach') S.seen = true;
    $('#pgLevel').hidden = tab !== 'level'; $('#pgCoach').hidden = tab !== 'coach';
    var pg = tab === 'level' ? $('#pgLevel') : $('#pgCoach');
    pg.classList.remove('in'); pg.offsetWidth; pg.classList.add('in');
    $('#pnScroll').scrollTop = 0;
    drawHud(); caret(); fade();
  }
  function setOpen(o) {
    S.open = o;
    $('#panel').classList.toggle('open', o);
    drawHud();
    if (o) { caret(); fade(); }
    try { history.replaceState(null, '', location.pathname + location.search + '#' + (o ? S.tab : 'closed')); } catch (e) {}
  }
  function openTab(t) {
    if (S.open && S.tab === t) { setOpen(false); return; }
    if (S.open) morph(function () { show(t); });
    else { show(t); setOpen(true); }
    try { history.replaceState(null, '', location.pathname + location.search + '#' + t); } catch (e) {}
  }

  /* ---------- the prototype control ---------- */
  function drawMoments() {
    $('#moments').innerHTML = Object.keys(MOMENTS).map(function (k) {
      return '<button type="button" data-m="' + k + '"' + (k === S.m ? ' class="on"' : '') + '>' + MOMENTS[k].label + '</button>';
    }).join('');
  }
  function setMoment(k) {
    S.m = k; S.rung = 0; S.read = null; S.seen = false;
    drawMoments();
    morph(drawAll);
    try { history.replaceState(null, '', location.pathname + '?m=' + k + '#' + (S.open ? S.tab : 'closed')); } catch (e) {}
  }
  function drawAll() { drawWorld(); drawHud(); drawLevel(); drawCoach(); drawCard(); show(S.tab); }

  function fit() {
    var st = $('#stage'), a = $('#app');
    var s = Math.min((st.clientWidth - 40) / 1440, (st.clientHeight - 32) / 900);
    a._s = s;
    a.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  /* ---------- wire up ---------- */
  $('#city').src = AS + 'img/city.webp';
  $('.wm').src = AS + 'img/zero-wordmark.svg';
  $('#rail').innerHTML = '<button type="button" class="on" title="World">' + I.world + '</button><button type="button" title="Portfolio">' + I.folio + '</button><button type="button" title="Jobs">' + I.jobs + '</button>';
  $('#chipLv').addEventListener('click', function (e) { e.stopPropagation(); openTab('level'); });
  $('#chipMe').addEventListener('click', function (e) { e.stopPropagation(); openTab('coach'); });
  $('#panel').addEventListener('click', function (e) {
    e.stopPropagation();
    var b = e.target.closest('.rung>button, .read>button'); if (!b) return;
    var row = b.parentNode;
    morph(function () {
      if (row.classList.contains('rung')) {
        var id = row.dataset.r;
        S.rung = String(S.rung) === id ? 0 : id;
        $$('.rung').forEach(function (x) { var on = x.dataset.r === String(S.rung); x.classList.toggle('open', on); x.firstChild.setAttribute('aria-expanded', on); });
      } else {
        S.read = S.read === row.dataset.k ? '' : row.dataset.k;
        $$('.read').forEach(function (x) { var on = x.dataset.k === S.read; x.classList.toggle('open', on); x.firstChild.setAttribute('aria-expanded', on); });
      }
    });
  });
  $('#pnScroll').addEventListener('scroll', fade, { passive: true });
  $('#screen').addEventListener('click', function () { if (S.open) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) setOpen(false); });
  $('#moments').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMoment(b.dataset.m); });
  window.addEventListener('resize', function () { fit(); caret(); fade(); });

  fit(); drawMoments(); drawAll();
  $('#panel').classList.toggle('open', S.open);
  drawHud(); caret(); fade();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { caret(); fade(); });
  window.__ready = true;
})();
