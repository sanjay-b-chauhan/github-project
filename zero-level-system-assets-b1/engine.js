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

  var SKILLS = [
    { key: 'understanding', name: 'Understanding', asks: 'Do you get why the work matters, not only what to do?',
      reads: 'The check after kickoff, your plan, your proof of understanding answers.' },
    { key: 'quality',       name: 'Quality',       asks: 'How solid is the work when it lands?',
      reads: 'Each submission against the requirements, and how many rounds it took.' },
    { key: 'communication', name: 'Communication', asks: 'Does your manager always know where you are?',
      reads: 'Your messages, the write-up, the presentation and its questions.' },
    { key: 'independence',  name: 'Independence',  asks: 'How far do you get before asking?',
      reads: 'Help asked for, hints and walkthroughs opened, time spent stuck.' }
  ];

  /* what each band looks like, per skill. Index 0 is Underperforming, 4 is Exceptional. */
  var RUBRIC = {
    understanding: [
      'Cannot say what the task is.',
      'Repeats the brief back. Misses the goal behind it.',
      'Explains the goal and the plan in their own words.',
      'Explains the why, and catches something the brief left out.',
      'Sees the risk or the better question before the manager does.'
    ],
    quality: [
      'Required parts are missing or wrong.',
      'Passes only after several rounds of fixes.',
      'Meets every requirement within one round of feedback.',
      'Meets every requirement first time.',
      'The first submission could go to a client as it is.'
    ],
    communication: [
      'Goes quiet. The manager has to chase.',
      'Updates come late or are hard to follow.',
      'Clear when asked. The presentation covers the points.',
      'Updates before being asked. Leads with the answer.',
      'The room leaves knowing the decision and why.'
    ],
    independence: [
      'Needs a walkthrough for most steps.',
      'Asks before trying. Leans on hints at every stage.',
      'Tries first, asks when truly stuck.',
      'Rarely needs help. Asks sharp questions when it does.',
      'Finds the answer alone and brings a fix, not a question.'
    ]
  };

  /* the numbers from the founder call: best case 3, 6, 9, 10 in four scenarios; work that never improves gets stuck */
  var DEFAULTS = {
    perLevel: 1000,
    maxLevel: 10,
    pay: [0, 500, 1000, 2000, 3000],   /* per band, lowest first */
    gates: [3, 6, 9],                   /* levels where roles open and the bar rises */
    bars: [2, 3, 4],                    /* band needed to pass each gate: Meeting, Exceeding, Exceptional */
    hold: true,                         /* gates hold weaker work */
    lambda: 0.5                         /* how hard one weak skill pulls the score down */
  };

  /* roles that open. Counts and companies are stand-ins. */
  var ROLE_TIERS = [
    { at: 0, title: 'First roles',     what: 'Internships, apprenticeships, associate roles.', n: 40, cos: ['duolingo', 'shopify', 'canva', 'monzo'] },
    { at: 1, title: 'Junior roles',    what: 'Full time junior roles at growing companies.',   n: 72, cos: ['notion', 'klarna', 'intercom', 'linear'] },
    { at: 2, title: 'Strong roles',    what: 'Roles at companies most people apply to.',       n: 58, cos: ['figma', 'airbnb', 'stripe', 'spotify'] },
    { at: 3, title: 'Every role',      what: 'All of them, the hardest companies included.',   n: 42, cos: ['apple', 'google', 'openai', 'netflix'] }
  ];

  var LEARNERS = [
    { key: 'best',   name: 'Best case',         line: 'Exceptional from the first scenario.',          weak: null,
      seq: [4, 4, 4, 4] },
    { key: 'steady', name: 'Improves steadily', line: 'Starts average, gets better every few scenarios.', weak: 'independence',
      seq: [1, 2, 2, 2, 2, 3, 2, 3, 3, 4] },
    { key: 'slow',   name: 'Improves slowly',   line: 'Gets there, with long flat stretches.',          weak: 'quality',
      seq: [0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 4] },
    { key: 'flat',   name: 'Never improves',    line: 'Solid work every time. Never better than solid.', weak: 'communication',
      seq: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { key: 'worst',  name: 'Worst case',        line: 'Leans on help and misses the brief.',            weak: 'understanding',
      seq: [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1] }
  ];

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
        heldGate: h >= 0 ? cfg.gates[h] : 0 });
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

  var api = { BANDS: BANDS, SKILLS: SKILLS, RUBRIC: RUBRIC, DEFAULTS: DEFAULTS, ROLE_TIERS: ROLE_TIERS, LEARNERS: LEARNERS,
    clone: clone, start: start, step: step, level: level, cap: cap, heldAt: heldAt, holdGate: holdGate, earnBar: earnBar, run: run, steady: steady,
    score: score, bandFor: bandFor, coach: coach, config: config, rolesOpen: rolesOpen, rolesTotal: rolesTotal, tierLevel: tierLevel, top: top };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ZL = api;
})(typeof window !== 'undefined' ? window : this);
