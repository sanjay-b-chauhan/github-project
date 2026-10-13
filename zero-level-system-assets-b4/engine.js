/* ZERO levels · the brain, as pure functions.
   One place for every rule and number, so the page and the backend can agree.

   THE CHAIN
     scenario  ->  four skills (0 to 100 each)  ->  one band of five  ->  skill points  ->  level 1 to 10  ->  roles

   THE RULES
     1. Only a finished scenario pays skill points.
     2. The band sets the pay.
     3. 1,000 skill points is a level. Level 10 is the top.
     4. Roles open at gates. Level 10 opens every role.
     5. A gate takes two things: the points, and one scenario at its bar. Points from weaker work stop at the gate.
     6. A level never drops. */
(function (root) {
  'use strict';

  var BANDS = [
    { key: 'underperforming',        name: 'Underperforming',        short: 'Under',       max: 20 },
    { key: 'below_expectations',     name: 'Below Expectations',     short: 'Below',       max: 40 },
    { key: 'meeting_expectations',   name: 'Meeting Expectations',   short: 'Meeting',     max: 60 },
    { key: 'exceeding_expectations', name: 'Exceeding Expectations', short: 'Exceeding',   max: 80 },
    { key: 'exceptional',            name: 'Exceptional',            short: 'Exceptional', max: 100 }
  ];

  /* the three things the coach reads and speaks to */
  var SKILLS = [
    { key: 'quality',       name: 'Quality',       asks: 'How solid is the work when it lands?',
      reads: ['Parts of the brief are missing.', 'Covers the brief after one fix.', 'Right the first time.'],
      tip: 'check the brief line by line before you send.' },
    { key: 'communication', name: 'Communication', asks: 'Does your manager always know where you are?',
      reads: ['Jay had to chase you.', 'Clear, but only when asked.', 'You update before he asks.'],
      tip: 'send Jay one update before he asks.' },
    { key: 'independence',  name: 'Independence',  asks: 'How far do you get before asking?',
      reads: ['You ask before you try.', 'You try first, then ask.', 'You only ask when truly stuck.'],
      tip: 'make one decision alone before you ask.' }
  ];

  /* the numbers from the founder call: best case 3, 6, 9, 10 in four scenarios; work that never improves gets stuck */
  var DEFAULTS = {
    perLevel: 1000,
    maxLevel: 10,
    pay: [0, 500, 1000, 2000, 3000],   /* per band, lowest first */
    gates: [3, 6, 9],                   /* levels where roles open and the bar rises */
    bars: [2, 3, 4],                    /* band needed to pass each gate: Meeting, Exceeding, Exceptional */
    hold: true,                         /* gates hold weaker work */
    lambda: 0.5,                        /* how hard one weak skill pulls the score down */
    coachAfter: 2,                      /* the coach steps in after this many scenarios in a row with no movement */
    coachLift: 1,                       /* how many bands the work rises once the coach's advice lands */
    /* motivation, 0 to 100: what each kind of scenario does to it */
    mot: { start: 60, level: 8, gate: 14, earn: 2, stall: [12, 16, 20, 24], coach: [24, 12, 6], quit: 10 }
  };

  /* the jobs that open at each gate. These are the 18 roles in the job portal prototype, grouped by pay.
     at = which gate (0, 1, 2) or 3 for the top level. pay is in thousands of dollars a year. */
  function J(title, co, dom, lo, hi) { return { title: title, co: co, dom: dom, pay: lo ? '$' + lo + 'k to $' + hi + 'k' : '' }; }
  var ROLE_TIERS = [
    { at: 0, title: 'First roles', jobs: [
      J('Sales Development Representative', 'Gong', 'gong.io', 58, 70),
      J('Deal Desk Analyst', 'Calendly', 'calendly.com', 75, 92),
      J('Marketing Operations Analyst', 'Webflow', 'webflow.com', 76, 94),
      J('Customer Success Operations Analyst', 'Loom', 'loom.com', 78, 95),
      J('Product Led Sales Analyst', 'Miro', 'miro.com', 80, 98)] },
    { at: 1, title: 'Core roles', jobs: [
      J('GTM Engineer', 'Ramp', 'ramp.com', 105, 135),
      J('AI Automation Specialist', 'Gong', 'gong.io', 98, 125),
      J('RevOps Engineer', 'Webflow', 'webflow.com', 100, 128),
      J('GTM Engineer, Outbound', 'Brex', 'brex.com', 102, 130),
      J('Revenue Operations Analyst', 'Airtable', 'airtable.com', 85, 105),
      J('Data Analyst (GTM)', 'Clari', 'clari.com', 88, 110),
      J('Sales Systems Analyst', 'Calendly', 'calendly.com', 82, 100),
      J('Sales Strategy and Operations Analyst', 'Rippling', 'rippling.com', 90, 112)] },
    { at: 2, title: 'Hard to get roles', jobs: [
      J('GTM Engineer', 'Vercel', 'vercel.com', 110, 140),
      J('Analytics Engineer, Revenue', 'Retool', 'retool.com', 115, 145),
      J('Solutions Engineer', 'Attio', 'attio.com')] },
    { at: 3, title: 'Every role', jobs: [
      J('Growth Engineer', 'Linear', 'linear.app', 130, 165),
      J('Revenue Operations Manager', 'Clari', 'clari.com')] }
  ];
  ROLE_TIERS.forEach(function (t) { t.n = t.jobs.length; });

  /* the scenarios a learner works through, in order. Titles and companies are the projects in the job portal prototype. */
  var SCENARIOS = [
    ['Inbound lead router', 'HubSpot', 'hubspot.com'], ['Enrichment waterfall', 'Notion', 'notion.so'],
    ['Outbound agent with evals', 'Shopify', 'shopify.com'], ['Intent signal scoring', 'Stripe', 'stripe.com'],
    ['Product qualified lead score', 'Figma', 'figma.com'], ['Call notes agent', 'Slack', 'slack.com'],
    ['CRM data model', 'Canva', 'canva.com'], ['Renewal risk agent', 'Zendesk', 'zendesk.com'],
    ['Account research agent', 'Datadog', 'datadoghq.com'], ['Lead scoring model', 'Asana', 'asana.com'],
    ['Enrichment pipeline', 'Twilio', 'twilio.com'], ['Agent eval suite', 'Dropbox', 'dropbox.com'],
    ['Meeting prep agent', 'Okta', 'okta.com'], ['Outbound list builder', 'Gusto', 'gusto.com'],
    ['Lead routing rules', 'DocuSign', 'docusign.com'], ['Pipeline health dashboard', 'Zoom', 'zoom.com'],
    ['Account dedupe and ownership', 'Box', 'box.com'], ['Territory rebalance', 'Toast', 'toasttab.com'],
    ['Lead to account matching', 'ServiceNow', 'servicenow.com'], ['Round robin routing rebuild', 'Intercom', 'intercom.com']
  ].map(function (x) { return { title: x[0], co: x[1], dom: x[2] }; });

  /* five kinds of learner. nat = how each scenario would go with nobody helping. coachable = how many times advice lifts their work. */
  function pad(a, v) { a = a.slice(); while (a.length < 20) a.push(v == null ? a[a.length - 1] : v[(a.length) % v.length]); return a; }
  var LEARNERS = [
    { key: 'best',   name: 'Best case',         weak: null,            coachable: 0, nat: pad([4, 4, 4, 4]) },
    { key: 'steady', name: 'Improves steadily', weak: 'independence',  coachable: 1, nat: pad([1, 2, 2, 2, 2, 3, 2, 3, 3, 4]) },
    { key: 'slow',   name: 'Improves slowly',   weak: 'quality',       coachable: 1, nat: pad([0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 4]) },
    { key: 'flat',   name: 'Plateaus',          weak: 'communication', coachable: 2, nat: pad([2]) },
    { key: 'worst',  name: 'Worst case',        weak: 'quality',       coachable: 1, nat: pad([0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [0, 1, 1, 1]) }
  ];
  LEARNERS.forEach(function (L) { L.seq = L.nat; });

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function top(cfg) { return cfg.maxLevel * cfg.perLevel; }

  /* where a learner stands: the points, and which gates their work has cleared */
  function start(cfg) { return { pts: 0, passed: cfg.gates.map(function () { return false; }) }; }

  /* the gate a band cannot pass: the first one whose bar is above it. -1 when nothing holds it. */
  function holdGate(band, cfg) {
    if (!cfg.hold) return -1;
    for (var i = 0; i < cfg.gates.length; i++) if (cfg.bars[i] > band) return i;
    return -1;
  }

  /* the most points work in this band can ever bank */
  function cap(band, cfg) {
    var g = holdGate(band, cfg);
    return g < 0 ? top(cfg) : cfg.gates[g] * cfg.perLevel;
  }

  /* the gate holding the level right now: the points are there, the work at its bar is not. -1 when free. */
  function heldAt(s, cfg) {
    if (!cfg.hold) return -1;
    for (var i = 0; i < cfg.gates.length; i++) if (!s.passed[i]) return s.pts >= cfg.gates[i] * cfg.perLevel ? i : -1;
    return -1;
  }

  /* a gate takes two things: the points, and one scenario at its bar */
  function level(s, cfg) {
    var lv = clamp(Math.floor(s.pts / cfg.perLevel), 1, cfg.maxLevel), h = heldAt(s, cfg);
    return h < 0 ? lv : Math.min(lv, cfg.gates[h] - 1);
  }

  /* finish one scenario in this band */
  function step(s, band, cfg) {
    var after = Math.min(top(cfg), Math.max(s.pts, Math.min(s.pts + cfg.pay[band], cap(band, cfg))));
    return { pts: after, passed: s.passed.map(function (p, i) { return p || (band >= cfg.bars[i] && after >= cfg.gates[i] * cfg.perLevel); }) };
  }

  /* the weakest band that still earns points from here */
  function earnBar(s, cfg) {
    for (var b = 1; b < BANDS.length; b++) if (cfg.pay[b] > 0 && cap(b, cfg) > s.pts) return b;
    return BANDS.length - 1;
  }

  function rolesOpen(lv, cfg) {
    var n = 0;
    ROLE_TIERS.forEach(function (t) { if (lv >= tierLevel(t, cfg)) n += t.n; });
    return n;
  }
  function rolesTotal() { return ROLE_TIERS.reduce(function (a, t) { return a + t.n; }, 0); }
  function tierLevel(t, cfg) { return t.at < cfg.gates.length ? cfg.gates[t.at] : cfg.maxLevel; }

  /* play a list of bands, one per finished scenario */
  function run(seq, cfg) {
    var s = start(cfg), rows = [];
    seq.forEach(function (band, i) {
      var lvBefore = level(s, cfg), n = step(s, band, cfg), lv = level(n, cfg), h = heldAt(n, cfg);
      var gain = n.pts - s.pts, pay = cfg.pay[band], opened = [];
      ROLE_TIERS.forEach(function (t) { var L = tierLevel(t, cfg); if (lvBefore < L && lv >= L) opened.push(t); });
      rows.push({ i: i + 1, band: band, pay: pay, gain: gain, pts: n.pts, level: lv, levelBefore: lvBefore, opened: opened,
        status: lv > lvBefore ? 'up' : h >= 0 ? 'held' : (gain === 0 && pay > 0) ? 'under' : pay === 0 ? 'nopay' : 'same',
        heldGate: h >= 0 ? cfg.gates[h] : 0, passed: n.passed.slice() });
      s = n;
    });
    var hh = heldAt(s, cfg), lvl = level(s, cfg);
    return { rows: rows, state: s, pts: s.pts, level: lvl, roles: rolesOpen(lvl, cfg),
      held: hh >= 0 ? cfg.gates[hh] : 0, heldBar: hh >= 0 ? cfg.bars[hh] : -1 };
  }

  /* one band, repeated: where does it stop, and after how many scenarios */
  function steady(band, cfg) {
    var s = start(cfg), n = 0, moved = 0;
    while (n < 80 && level(s, cfg) < cfg.maxLevel) {
      var nx = step(s, band, cfg); n++;
      if (nx.pts === s.pts && level(nx, cfg) === level(s, cfg)) break;
      moved = n; s = nx;
    }
    return { level: level(s, cfg), scenarios: moved, reachesTop: level(s, cfg) >= cfg.maxLevel, pts: s.pts };
  }

  /* the weakest band that lifts the level from here, and how many scenarios of it that takes */
  function nextUp(s, cfg) {
    var target = level(s, cfg) + 1, best = null;
    for (var b = 1; b < BANDS.length && !best; b++) {
      var t = s;
      for (var k = 1; k <= 12; k++) { t = step(t, b, cfg); if (level(t, cfg) >= target) { best = { band: b, n: k }; break; } }
    }
    for (var b2 = 1; b2 < BANDS.length; b2++) if (level(step(s, b2, cfg), cfg) >= target) return { band: b2, n: 1, slow: best };
    return best;
  }

  /* one learner's whole run. o.coach = is the coach on; o.coachable = how many times advice can lift the work.
     Each row is one finished scenario. It stops at the top level, or when motivation runs out. */
  function simulate(nat, cfg, o) {
    var M = cfg.mot, s = start(cfg), rows = [], lifts = 0, dry = 0, since = 0, nudges = 0, mot = M.start, quit = 0, topAt = 0;
    var can = o.coachable == null ? 9 : o.coachable;
    for (var i = 0; i < nat.length; i++) {
      var coached = false, lifted = false;
      if (o.coach && since >= cfg.coachAfter) {
        coached = true; since = 0; dry = 0;
        if (lifts < can) { lifts++; lifted = true; }
        mot = Math.min(100, mot + M.coach[Math.min(nudges, M.coach.length - 1)]); nudges++;
      }
      var motBefore = mot, band = Math.min(BANDS.length - 1, nat[i] + lifts * cfg.coachLift);
      var lvBefore = level(s, cfg), n = step(s, band, cfg), lv = level(n, cfg), h = heldAt(n, cfg), gain = n.pts - s.pts, opened = [];
      ROLE_TIERS.forEach(function (t) { var L = tierLevel(t, cfg); if (lvBefore < L && lv >= L) opened.push(t); });
      var stalled = lv === lvBefore && (gain === 0 || h >= 0);
      if (lv > lvBefore) { mot += opened.length ? M.gate : M.level; dry = 0; since = 0; nudges = 0; }
      else if (stalled) { mot -= M.stall[Math.min(dry, M.stall.length - 1)]; dry++; since++; }
      else { mot += M.earn; dry = 0; since = 0; }
      mot = clamp(mot, 0, 100);
      rows.push({ i: i + 1, band: band, natural: nat[i], lift: band - nat[i], lifts: lifts, gain: gain, pts: n.pts, level: lv, levelBefore: lvBefore, opened: opened,
        heldGate: h >= 0 ? cfg.gates[h] : 0, heldBar: h >= 0 ? cfg.bars[h] : -1, passed: n.passed.slice(), stalled: stalled, since: since,
        coached: coached, lifted: lifted, motBefore: motBefore, mot: mot });
      s = n;
      if (lv >= cfg.maxLevel) { topAt = i + 1; break; }
      if (mot <= M.quit) { quit = i + 1; break; }
    }
    var last = rows[rows.length - 1];
    return { rows: rows, n: rows.length, pts: s.pts, level: level(s, cfg), top: topAt, quit: quit, held: last ? last.heldGate : 0,
      wouldCoach: !!(o.coach && !topAt && !quit && since >= cfg.coachAfter) };
  }

  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function spread(a) { var m = mean(a); return Math.sqrt(mean(a.map(function (v) { return (v - m) * (v - m); }))); }
  function bandFor(score) { for (var i = 0; i < BANDS.length; i++) if (score <= BANDS[i].max) return i; return BANDS.length - 1; }

  /* four skill scores make one scenario score: the average, minus a penalty for an uneven profile */
  function score(skills, cfg) {
    var m = mean(skills), s = spread(skills), v = clamp(m - cfg.lambda * s, 0, 100);
    var weakest = 0;
    skills.forEach(function (x, i) { if (x < skills[weakest]) weakest = i; });
    var others = skills.filter(function (_, i) { return i !== weakest; });
    var fixed = skills.slice(); fixed[weakest] = Math.round(mean(others));
    var fm = mean(fixed), fs = spread(fixed), fv = clamp(fm - cfg.lambda * fs, 0, 100);
    return { mean: m, spread: s, penalty: m - v, score: v, band: bandFor(v),
      weakest: weakest, ifFixed: { to: fixed[weakest], score: fv, band: bandFor(fv) } };
  }

  /* the one line the coach leads with, from where a run stands */
  function coach(r, cfg, weakKey) {
    var n = function (v) { return Math.round(v).toLocaleString('en-US'); };
    var weak = null;
    SKILLS.forEach(function (s) { if (s.key === weakKey) weak = s.name; });
    if (!r.rows.length) return { state: 'start', head: 'Level 1. Nothing earned yet.', body: 'The first scenario can pay up to ' + n(Math.max.apply(null, cfg.pay)) + ' skill points.' };
    if (r.level >= cfg.maxLevel) return { state: 'top', head: 'Level ' + cfg.maxLevel + '. Every role is open.', body: 'Nothing left to level. From here it is about landing the job.' };
    if (r.held) return { state: 'held', head: 'Level ' + r.level + ' is full. Level ' + r.held + ' takes one ' + BANDS[r.heldBar].name + ' scenario.',
      body: (weak ? 'The missing piece is ' + weak + '. ' : '') + 'More scenarios at the same standard will not move it.' };
    var last = r.rows[r.rows.length - 1], next = r.level + 1, need = next * cfg.perLevel - r.pts, up = nextUp(r.state, cfg), body = '';
    if (up && up.n === 1) body = 'One ' + BANDS[up.band].name + ' scenario gets there.';
    else if (up) body = up.n + ' more at ' + BANDS[up.band].name + ' get there.';
    if (last.status === 'under') { var eb = earnBar(r.state, cfg); body = 'That last one paid nothing. From here only ' + BANDS[eb].name + (eb < BANDS.length - 1 ? ' or better' : '') + ' counts.' + (weak ? ' Work on ' + weak + '.' : ''); }
    else if (weak) body += ' Fastest lift: ' + weak + '.';
    return { state: 'climb', head: n(need) + (need === 1 ? ' skill point' : ' skill points') + ' to Level ' + next + '.', body: body };
  }

  function config(cfg) {
    return {
      points_per_level: cfg.perLevel,
      max_level: cfg.maxLevel,
      skills: SKILLS.map(function (s) { return s.key; }),
      scenario_score: 'mean(skills) - ' + cfg.lambda + ' * stddev(skills)',
      band_score_cuts: BANDS.map(function (b) { return b.max; }),
      pays: BANDS.reduce(function (o, b, i) { o[b.key] = cfg.pay[i]; return o; }, {}),
      gates: cfg.gates.map(function (g, i) { return { level: g, bar: BANDS[cfg.bars[i]].key }; }),
      gates_hold_weaker_work: cfg.hold,
      levels_can_drop: false
    };
  }

  var api = { BANDS: BANDS, SKILLS: SKILLS, DEFAULTS: DEFAULTS, ROLE_TIERS: ROLE_TIERS, LEARNERS: LEARNERS, SCENARIOS: SCENARIOS,
    clone: clone, start: start, step: step, simulate: simulate, level: level, cap: cap, heldAt: heldAt, holdGate: holdGate, earnBar: earnBar, run: run, steady: steady,
    score: score, bandFor: bandFor, coach: coach, config: config, rolesOpen: rolesOpen, rolesTotal: rolesTotal, tierLevel: tierLevel, top: top };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ZL = api;
})(typeof window !== 'undefined' ? window : this);
