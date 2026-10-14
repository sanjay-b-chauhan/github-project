/* The map: how the three systems connect. Labels and numbers only. */
(function () {
  'use strict';
  var Z = ZS, S = Z.SYS, esc = Z.esc;
  function sys(n) { return S[n - 1]; }
  function dot(n) { return '<i class="m-dot" style="--c:' + sys(n).c + '"></i>'; }
  function sname(n) { return '<span class="m-sn" style="--c:' + sys(n).c + ';--cbg:' + sys(n).cbg + '">' + dot(n) + esc(sys(n).name) + '</span>'; }

  /* ---------- 1. the loop ---------- */
  var C = { x: 500, y: 326, r: 236 };
  var NODE = { 1: -90, 2: 30, 3: 150 };
  function pt(a, r) { var t = a * Math.PI / 180; return [C.x + (r || C.r) * Math.cos(t), C.y + (r || C.r) * Math.sin(t)]; }
  function arc(a0, a1, r) {
    var p0 = pt(a0, r), p1 = pt(a1, r);
    return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + (r || C.r) + ' ' + (r || C.r) + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
  }
  /* main flows ride the circle; quieter flows cut across inside it */
  var FLOWS = [
    { from: 1, to: 2, a0: -62, a1: 2, mid: -30, t: '+2,000 skill points', main: true },
    { from: 2, to: 3, a0: 58, a1: 122, mid: 90, t: 'Level 4 opens 35 roles', main: true },
    { from: 3, to: 1, a0: 178, a1: 242, mid: 210, t: 'Opens at Level 6', main: true }
  ];
  var CHORDS = [
    { from: 2, to: 1, d: 'M668 312 Q 640 214 560 150', lx: 646, ly: 236, t: 'Coach notes|Next scenario' },
    { from: 1, to: 3, d: 'M440 150 Q 360 214 332 312', lx: 354, ly: 236, t: 'Proof' }
  ];
  function loopHTML() {
    var svg = '<svg class="m-loop-svg" viewBox="0 0 1000 620" aria-hidden="true"><defs>' +
      S.map(function (s) { return '<marker id="ah' + s.n + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 8 5 1 8.5" fill="none" stroke="' + s.hex + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>'; }).join('') +
      '</defs>' +
      '<circle cx="' + C.x + '" cy="' + C.y + '" r="' + C.r + '" class="m-track"/>' +
      FLOWS.map(function (f, i) { return '<path class="m-flow" data-f="' + i + '" d="' + arc(f.a0, f.a1) + '" stroke="' + sys(f.from).hex + '" marker-end="url(#ah' + f.from + ')"/>'; }).join('') +
      CHORDS.map(function (c, i) { return '<path class="m-chord" data-c="' + i + '" d="' + c.d + '" stroke="' + sys(c.from).hex + '" marker-end="url(#ah' + c.from + ')"/>'; }).join('') +
      '</svg>';
    var labels = FLOWS.map(function (f, i) {
      var p = pt(f.mid, C.r + (f.mid === 90 ? 0 : 40));
      return '<span class="m-fl" data-f="' + i + '" style="left:' + p[0] + 'px;top:' + p[1] + 'px;--c:' + sys(f.from).c + ';--cbg:' + sys(f.from).cbg + '">' + esc(f.t) + '</span>';
    }).join('') + CHORDS.map(function (c) {
      return '<span class="m-cl" style="left:' + c.lx + 'px;top:' + c.ly + 'px;--c:' + sys(c.from).c + '">' + c.t.split('|').map(esc).join('<br>') + '</span>';
    }).join('');
    var art = {
      1: Z.stack(['hubspot.com', 'notion.so', 'shopify.com', 'stripe.com'], 26) + '<span class="m-na">4 of 10 done</span>',
      2: '<span class="m-ring">' + ringBig(4500) + '<b>4</b></span><span class="m-na">Level 4 · 4,500</span>',
      3: Z.stack(['ramp.com', 'brex.com', 'webflow.com', 'gong.io'], 26, 72) + '<span class="m-na">76 open to her</span>'
    };
    var nodes = S.map(function (s) {
      var p = pt(NODE[s.n]);
      return '<a class="m-node" href="' + s.href + '" data-n="' + s.n + '" style="left:' + p[0] + 'px;top:' + p[1] + 'px;--c:' + s.c + ';--cbg:' + s.cbg + '">' +
        '<span class="m-nh"><span class="m-num">' + s.n + '</span><b>' + esc(s.name) + '</b></span>' +
        '<span class="m-nv">' + esc(s.verb) + '</span><span class="m-art">' + art[s.n] + '</span><span class="m-go">Open ' + Z.IC.arrow + '</span></a>';
    }).join('');
    return '<div class="m-loop"><div class="m-loop-in">' + svg + labels +
      '<div class="m-core">' + Z.zero(92) + '</div>' +
      '<span class="m-maya" aria-hidden="true">' + Z.av('maya', 30) + '</span>' + nodes + '</div></div>';
  }
  function ringBig(pts) {
    var segs = '', r = 15, gap = 5;
    for (var i = 0; i < 10; i++) {
      var a0 = -90 + i * 36 + gap / 2, a1 = a0 + 36 - gap, t0 = a0 * Math.PI / 180, t1 = a1 * Math.PI / 180;
      var on = i < Math.floor(pts / 1000);
      segs += '<path d="M' + (18 + r * Math.cos(t0)).toFixed(2) + ' ' + (18 + r * Math.sin(t0)).toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (18 + r * Math.cos(t1)).toFixed(2) + ' ' + (18 + r * Math.sin(t1)).toFixed(2) + '" class="' + (on ? 'on' : '') + '"/>';
    }
    return '<svg viewBox="0 0 36 36">' + segs + '</svg>';
  }

  /* ---------- 2. what crosses between them ---------- */
  var WIRES = [
    { from: 1, to: 2, ev: 'Scenario done', carries: ['Band', 'Four reads', 'Skill points'], when: 'End of every scenario' },
    { from: 1, to: 2, ev: 'Stage done', carries: ['Credits'], when: 'End of every stage' },
    { from: 1, to: 2, ev: 'Signals', carries: ['How messages read', 'Asks', 'AI use', 'Time'], when: 'While she works' },
    { from: 1, to: 3, ev: 'Proof', carries: ['Portfolio project'], when: 'Scenario done' },
    { from: 2, to: 1, ev: 'Coach note', carries: ['Praise or a nudge'], when: 'After the fact, never blocks' },
    { from: 2, to: 1, ev: 'Next scenario', carries: ['Two to pick from'], when: 'After a scenario or a level' },
    { from: 2, to: 3, ev: 'Level up', carries: ['That level’s roles'], when: 'Every level, 1 to 10' },
    { from: 3, to: 1, ev: 'Locked role', carries: ['The level it needs'], when: 'She wants a role above her level' },
    { from: 3, to: 2, ev: 'Lost', carries: ['The reason'], when: 'Later, not V1', later: true }
  ];
  function wiresHTML() {
    return '<div class="m-wires">' + WIRES.map(function (w, i) {
      return '<div class="m-w' + (w.later ? ' later' : '') + '" style="--d:' + (i * 40) + 'ms">' +
        '<span class="m-wf">' + sname(w.from) + '<span class="m-wa" style="--c:' + sys(w.from).c + '">' + Z.IC.arrow + '</span>' + sname(w.to) + '</span>' +
        '<b class="m-we">' + esc(w.ev) + '</b>' +
        '<span class="m-wc">' + w.carries.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</span>' +
        '<span class="m-ww">' + esc(w.when) + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------- 3. one day: a sequence diagram, the three systems as columns, time running down ---------- */
  var SEQ = [
    { t: '8:40', lane: 2, l: 'Day 4, +20 credits', go: 'grow#1' },
    { t: '8:45', lane: 3, l: '20 new roles', go: 'jobs#1' },
    { t: '8:48', lane: 3, l: 'Applies to 3', go: 'jobs#4', inn: [{ from: 1, l: 'Proof from 3 scenarios' }] },
    { t: '9:00', lane: 1, l: 'Picks Stripe', go: 'learn#2', inn: [{ from: 2, l: 'Unlocked at Level 2' }] },
    { t: '9:30', lane: 1, l: 'Rushed message', go: 'learn#4', out: [{ to: 2, l: 'Message read' }] },
    { t: '9:31', lane: 2, l: 'Coach note', go: 'grow#4', out: [{ to: 1, l: 'After the fact' }] },
    { t: '10:30', lane: 1, l: 'Plan done', go: 'learn#5', out: [{ to: 2, l: '+50 credits' }] },
    { t: '11:20', lane: 3, l: 'Calendly replies', go: 'jobs#6' },
    { t: '1:10', lane: 1, l: 'Build done', go: 'learn#6', out: [{ to: 2, l: '+50 credits' }] },
    { t: '3:20', lane: 1, l: 'Review: Exceeding', go: 'learn#7' },
    { t: '3:40', lane: 1, l: 'Scenario done', go: 'learn#8', out: [{ to: 2, l: '+2,000 skill points' }, { to: 3, l: 'New proof' }] },
    { t: '3:41', lane: 2, l: 'Level 4', go: 'grow#7', out: [{ to: 3, l: '35 roles open' }, { to: 1, l: 'Next scenario' }] },
    { t: '3:42', lane: 2, l: 'Coach updates', go: 'grow#8' },
    { t: '3:45', lane: 3, l: 'Vercel at Level 6', go: 'jobs#9', out: [{ to: 1, l: 'Go to Learn' }] }
  ];
  var GUT = 64, ROW = 50, ARR = 30, HEAD = 46;
  function dayHTML() {
    var y = HEAD + 18, rows = '';
    SEQ.forEach(function (e, i) {
      var arrows = (e.out || []).length + (e.inn || []).length, h = ROW + Math.max(0, arrows - 1) * ARR + (arrows ? 8 : 0);
      e.y = y; e.h = h;
      var s = sys(e.lane), key = e.go.split('#');
      var href = S.filter(function (q) { return q.key === key[0]; })[0].href + '#' + key[1];
      rows += '<span class="m-sq-t" style="top:' + (y + 15) + 'px">' + esc(e.t) + '</span>' +
        '<a class="m-sq-ev" data-i="' + i + '" href="' + href + '" style="top:' + (y + 4) + 'px;--k:' + e.lane + ';--c:' + s.c + ';--cbg:' + s.cbg + '"><i></i>' + esc(e.l) + '</a>';
      y += h;
    });
    var H = y + 10;
    var heads = S.map(function (s) { return '<div class="m-sq-h" style="--k:' + s.n + ';--c:' + s.c + ';--cbg:' + s.cbg + '">' + dot(s.n) + esc(s.name) + '</div>'; }).join('');
    return '<div class="m-seq" style="height:' + H + 'px">' + heads + '<svg class="m-sq-svg" aria-hidden="true"></svg>' + rows + '<div class="m-sq-chips"></div></div>';
  }
  /* arrows are drawn after layout, from the real size of each event pill */
  function drawDay() {
    var box = Z.$('.m-seq'); if (!box) return;
    var W = box.clientWidth, H = box.clientHeight, laneW = (W - GUT) / 3, svg = Z.$('.m-sq-svg', box), chips = Z.$('.m-sq-chips', box);
    function lx(k) { return GUT + laneW * (k - .5); }
    var out = '<defs>' + S.map(function (s) { return '<marker id="sq' + s.n + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1.5 8.5 5 1 8.5" fill="none" stroke="' + s.hex + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></marker>'; }).join('') + '</defs>';
    S.forEach(function (s) { out += '<line x1="' + lx(s.n) + '" y1="' + (HEAD + 4) + '" x2="' + lx(s.n) + '" y2="' + (H - 6) + '" class="m-sq-life"/>'; });
    var ch = '';
    SEQ.forEach(function (e, i) {
      var pill = Z.$('.m-sq-ev[data-i="' + i + '"]', box), pw = pill ? pill.offsetWidth : 120, cx = lx(e.lane), k = 0;
      function arrow(from, to, label) {
        /* the first arrow runs level with the pill; later ones step down one row each */
        var mid = e.y + 20, yk = mid + k * ARR, dir = to > from ? 1 : -1, c = sys(from).hex, d, x0, x1;
        if (from === e.lane) {
          x0 = cx + dir * (pw / 2 + 2); x1 = lx(to) - dir * 2;
          d = k ? 'M' + x0 + ' ' + mid + ' C ' + (x0 + dir * 22) + ' ' + mid + ', ' + (x0 + dir * 8) + ' ' + yk + ', ' + (x0 + dir * 34) + ' ' + yk + ' L ' + x1 + ' ' + yk : 'M' + x0 + ' ' + mid + ' L ' + x1 + ' ' + yk;
          out += '<path d="' + d + '" class="m-sq-a" stroke="' + c + '" marker-end="url(#sq' + from + ')"/>';
        } else {
          x0 = lx(from); x1 = cx - dir * (pw / 2 + 4);
          d = 'M' + x0 + ' ' + yk + ' L ' + x1 + ' ' + yk;
          out += '<circle cx="' + x0 + '" cy="' + yk + '" r="3.5" class="m-sq-o" stroke="' + c + '"/>';
          out += '<path d="' + d + '" class="m-sq-a" stroke="' + c + '" marker-end="url(#sq' + from + ')"/>';
        }
        /* the label sits on the stretch between the two lifelines nearest the pill */
        var a = from === e.lane ? x0 + dir * 34 : x0, b = from === e.lane ? lx(from + dir) : x1;
        var mx = from === e.lane ? (cx + dir * (pw / 2) + lx(from + dir)) / 2 + dir * 10 : (x0 + x1) / 2;
        ch += '<span class="m-sq-c" style="left:' + mx + 'px;top:' + yk + 'px;--c:' + sys(from).c + ';--cbg:' + sys(from).cbg + '">' + esc(label) + '</span>';
        k++;
      }
      (e.inn || []).forEach(function (a) { arrow(a.from, e.lane, a.l); });
      (e.out || []).forEach(function (a) { arrow(e.lane, a.to, a.l); });
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.width = W + 'px'; svg.style.height = H + 'px';
    svg.innerHTML = out; chips.innerHTML = ch;
  }

  /* ---------- 3b. how the coach talks ---------- */
  function noteHTML(x, good) {
    return '<div class="m-saw">' + esc(x.saw) + '</div><div class="m-note' + (good ? ' good' : '') + '"><div class="m-nh2">' + Z.zero(20, good ? 'working' : 'default') + 'Coach<span class="m-kind">' + (good ? 'Praise' : 'Nudge') + '</span></div><p>' + esc(x.say) + '</p><div class="m-try"><b>' + (good ? 'Keep' : 'Try') + '</b> ' + esc(x.try) + '</div></div>';
  }
  function coachHTML() {
    var B = Z.BANDS;
    var scale = '<div class="m-scale">' + B.map(function (b, i) {
      return '<span class="m-sb"><i style="background:' + b.c + '"></i><em>' + esc(b.short) + '</em></span>';
    }).join('') +
      '<span class="m-sz" style="--a:0;--b:2"><b>Nudge</b></span><span class="m-sz q" style="--a:2;--b:3"><b>Silent</b></span><span class="m-sz g" style="--a:3;--b:5"><b>Praise</b></span></div>';
    var rules = '<div class="m-crules">' + Z.COACH_RULES.map(function (r) { return '<span class="chip">' + esc(r) + '</span>'; }).join('') + '</div>';
    var grid = '<div class="m-coach">' + Z.COACH.map(function (c, i) {
      return '<section class="m-cc" style="--d:' + (i * 70) + 'ms"><header><b>' + esc(c.key) + '</b>' + (c.key === 'AI slop' || c.key === 'Understanding' ? '' : '') + '</header>' +
        '<div class="m-watch">' + c.watches.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>' +
        noteHTML(c.low, false) + noteHTML(c.high, true) + '</section>';
    }).join('') + '</div>';
    return '<div class="m-ctop">' + scale + rules + '</div>' + grid;
  }

  /* ---------- 4. each system: where it lives, what it owns, what it never does ---------- */
  var COLS = [
    { n: 1, voice: 'Her manager', vav: Z.av(Z.DAY.pick.manager, 26),
      where: [['Zero map', 'Learn'], ['Pick one of two', 'Learn'], ['Kickoff', 'Learn'], ['Workspace and the one chat', 'Learn'], ['Proof of understanding', 'Learn'], ['Review', 'Learn'], ['Scenario done', 'Learn']],
      owns: ['The scenario', 'The manager', 'The one chat', 'Feedback on the work', 'The proof'],
      never: ['Skill point math', 'Coach talk'] },
    { n: 2, voice: 'Zero, as coach', vav: Z.zero(26),
      where: [['Level pill', 'Every screen'], ['Credits pill', 'Every screen'], ['Coach floater', 'Every screen'], ['Notes after the fact', 'Workspace'], ['Level view', 'From the pill'], ['Daily streak', 'First open'], ['Level up', 'After a scenario']],
      owns: ['Skill points', 'Levels', 'Credits', 'Streak', 'The coach', 'Six private reads'],
      never: ['Grades a submission', 'A chat', 'Shows the reads'] },
    { n: 3, voice: 'Zero, as agent', vav: Z.zero(26),
      where: [['Home: new roles, action items', 'Jobs'], ['New roles box', 'Jobs'], ['Explore: your focus', 'Jobs'], ['Apply: Zero tailors, sends', 'Jobs'], ['Tracker', 'Jobs']],
      owns: ['Role bank', 'Matches and fit', 'Hearts', 'Applications', 'Action items'],
      never: ['Decides a level', 'Auto applies', 'Talks to recruiters'] }
  ];
  function colsHTML() {
    return '<div class="m-cols">' + COLS.map(function (c) {
      var s = sys(c.n);
      return '<section class="m-col" style="--c:' + s.c + ';--cbg:' + s.cbg + '">' +
        '<header class="m-ch"><span class="m-num">' + s.n + '</span><b>' + esc(s.name) + '</b><span class="m-voice">' + c.vav + esc(c.voice) + '</span></header>' +
        '<div class="m-sub">Where</div><ul class="m-where">' + c.where.map(function (w) { return '<li><span>' + esc(w[0]) + '</span><em>' + esc(w[1]) + '</em></li>'; }).join('') + '</ul>' +
        '<div class="m-sub">Owns</div><div class="m-chips">' + c.owns.map(function (o) { return '<span class="chip">' + esc(o) + '</span>'; }).join('') + '</div>' +
        '<div class="m-sub">Never</div><div class="m-chips">' + c.never.map(function (o) { return '<span class="chip m-never">' + esc(o) + '</span>'; }).join('') + '</div>' +
        '<a class="btn-l sm m-open" href="' + s.href + '">Open ' + esc(s.name) + Z.IC.arrow + '</a></section>';
    }).join('') + '</div>';
  }

  /* ---------- 5. the rules, as numbers ---------- */
  function rulesHTML() {
    var B = Z.BANDS;
    return '<div class="m-rules">' +
      '<div class="m-rule"><span class="m-rk">Levels</span><b class="big">0 to 10</b><span class="m4">1,000 skill points each · start at 0</span></div>' +
      '<div class="m-rule wide"><span class="m-rk">Skill points per scenario</span><div class="m-pay">' + B.slice(1).map(function (b, i) {
        return '<span><i style="background:' + b.c + '"></i><em>' + esc(b.short) + '</em><b>' + Z.n(b.pay) + '</b></span>';
      }).join('') + '</div><span class="m4">Only from scenarios · never bought, never free</span></div>' +
      '<div class="m-rule"><span class="m-rk">Roles open</span><b class="big">212</b><span class="m4">At Level 10 · 24 at Level 1</span></div>' +
      '<div class="m-rule wide"><span class="m-rk">Credits</span><div class="m-pay cr">' +
      [['Stage', 50], ['Scenario', 150], ['Level', 100], ['Streak', 20], ['Invite', 100]].map(function (r) { return '<span><span class="coin"></span><em>' + r[0] + '</em><b>' + r[1] + '</b></span>'; }).join('') +
      '</div><span class="m4">Start a scenario: 100</span></div>' +

      '</div>';
  }

  /* ---------- 6. parked and open ---------- */
  var PARKED = ['Coach chat', 'Mini missions', 'Coach call, 2 minutes a day', 'Referral codes for AI apps', 'Meetings with real employees', 'Interview stages and offers', 'Recruiter side', 'Auto apply', 'Who viewed your portfolio'];
  var OPEN = [
    ['Roles per level', 'Navid'], ['How often new roles come', 'Navid'], ['How points are paid', 'Engineering'], ['Recruiter talk outside Zero?', 'Navid'],
    ['Does starting a scenario cost credits?', 'Navid'], ['Start at Level 0 or 1', 'Sanjay and Navid'], ['Every level or gates at 3, 6, 9', 'Sanjay and Navid'], ['Coach face: Zero or a picked coach', 'Sanjay']
  ];
  function laterHTML() {
    return '<div class="m-later"><section><h3 class="m-h3">Not now</h3><div class="m-chips">' + PARKED.map(function (p) { return '<span class="chip">' + esc(p) + '</span>'; }).join('') + '</div></section>' +
      '<section><h3 class="m-h3">To decide</h3><ul class="m-open">' + OPEN.map(function (o) { return '<li><span>' + esc(o[0]) + '</span><em>' + esc(o[1]) + '</em></li>'; }).join('') + '</ul></section></div>';
  }

  /* ---------- page ---------- */
  function page() {
    return '<div class="scroll m-scroll"><div class="m-page">' +
      '<section class="m-hero"><h1 class="h">Three systems, one loop</h1>' + loopHTML() + '</section>' +
      '<section class="m-sec"><h2 class="h">What crosses between them</h2>' + wiresHTML() + '</section>' +
      '<section class="m-sec"><h2 class="h">One day with Maya</h2>' + dayHTML() + '</section>' +
      '<section class="m-sec"><h2 class="h">How the coach talks</h2>' + coachHTML() + '</section>' +
      '<section class="m-sec"><h2 class="h">Where each one lives</h2>' + colsHTML() + '</section>' +
      '<section class="m-sec"><h2 class="h">The numbers</h2>' + rulesHTML() + '</section>' +
      '<section class="m-sec last">' + laterHTML() + '</section>' +
      '</div></div>';
  }

  /* fit the loop to the first screen */
  function fit() {
    var box = Z.$('.m-loop'), inn = Z.$('.m-loop-in'), hero = Z.$('.m-hero'), body = Z.$('#body');
    if (!box || !inn) return;
    var availW = box.clientWidth, availH = body.clientHeight - 112;
    var k = Math.max(.55, Math.min(1.12, availW / 1000, availH / 620));
    inn.style.transform = 'scale(' + k + ')';
    box.style.height = (620 * k) + 'px';
  }

  /* Maya walks the loop twice, lighting each flow as she passes it, then rests at Scenarios */
  var walk = { a: -90, laps: 0, on: true, t0: 0 };
  function step(t) {
    var m = Z.$('.m-maya'); if (!m) return;
    if (!walk.t0) walk.t0 = t;
    var dt = Math.min(48, t - (walk.last || t)); walk.last = t;
    if (walk.on) {
      walk.a += dt * 0.024;
      if (walk.a >= 270) { walk.a -= 360; walk.laps++; if (walk.laps >= 2) { walk.on = false; walk.a = -90; } }
    }
    var p = pt(walk.a, C.r);
    m.style.left = p[0] + 'px'; m.style.top = p[1] + 'px';
    FLOWS.forEach(function (f, i) {
      var lit = walk.on && walk.a > f.a0 - 6 && walk.a < f.a1 + 14;
      Z.$$('[data-f="' + i + '"]').forEach(function (x) { x.classList.toggle('lit', lit); });
    });
    S.forEach(function (s) {
      var d = Math.abs(((walk.a - NODE[s.n]) % 360 + 540) % 360 - 180);
      var nd = Z.$('.m-node[data-n="' + s.n + '"]'); if (nd) nd.classList.toggle('here', d < 16);
    });
    requestAnimationFrame(step);
  }

  Z.loadWord().then(function () {
    var body = Z.shell({ sys: 0, bare: true });
    body.innerHTML = page();
    Z.mountZero();
    fit(); drawDay(); addEventListener('resize', function () { fit(); drawDay(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawDay);
    var loop = Z.$('.m-loop');
    loop.addEventListener('mouseenter', function () { if (!walk.on) { walk.on = true; walk.laps = 1; } });
    requestAnimationFrame(step);
    /* sections rise as they come into view */
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { root: Z.$('.m-scroll'), threshold: .18 });
    Z.$$('.m-sec').forEach(function (s) { io.observe(s); });
    window.ZSHUB = { fit: fit, walk: walk };
  });
})();
