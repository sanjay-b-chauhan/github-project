/* Zero home, b11. Two chips at the top right are the tabs.
   Level: skill points, the rules, every level with what it needs and the companies it opens. One progress, the vertical one.
   Coach: live only. Where the scenario you are in is heading right now, the points it would pay, and the one move to make.
   Call your coach for two minutes, or change your coach. A simulator above the app plays the best, mid and worst case. */
(function () {
  'use strict';
  var D = window.SP_DATA;
  var AS = 'zero-skill-path-home-assets-b17/';
  /* a url inside a CSS variable resolves against the stylesheet that reads it, so logos get a full address */
  var ABS = new URL(AS, location.href).href;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var DREAM = { co: 'openai', rung: 'mid' };
  var COACHES = [
    { id: 'navid', name: 'Navid', img: AS + 'img/navid-face.jpg', style: 'Direct. Tells you the one thing.' },
    { id: 'priya', name: 'Priya', img: AS + 'img/cast-priya.jpg', style: 'Warm. Cheers the wins first.' },
    { id: 'diego', name: 'Diego', img: AS + 'img/cast-diego.jpg', style: 'Calm. Fewer notes, more room.' }
  ];
  var MGR = { name: 'Jordan', img: AS + 'img/cast-jordan.jpg' };
  var ME = { name: 'Maya', img: AS + 'img/maya.jpg' };

  /* the rules: what a scenario pays, by how it went. 1,000 skill points is a level. */
  var BANDS = [null, { n: 'Below', pay: 500, at: 18 }, { n: 'Meeting', pay: 1000, at: 44 }, { n: 'Exceeding', pay: 2000, at: 68 }, { n: 'Exceptional', pay: 3000, at: 90 }];
  var CUT = [0, 30, 56, 80];
  function bandOf(f) { return f >= CUT[3] ? 4 : f >= CUT[2] ? 3 : f >= CUT[1] ? 2 : 1; }

  /* the four things the coach reads. Learners never see these meters: only the team's switch shows them. */
  var READS = {
    comm: { n: 'Communication', strong: 'Your messages are clear. Jordan rarely has to ask twice.', weak: 'Your messages read rushed, so Jordan has to ask again.', fix: 'Write one clear update', tip: 'Write every update as: what you did, what you found, what you need.', act: 'Make your ask clear', c: '#5B9BFF' },
    indep: { n: 'Independence', strong: 'You make the call yourself and say why.', weak: 'You check in before you finish a part.', fix: 'Make the call yourself, then say why', tip: 'Make the call, then tell Jordan why you made it.', act: 'Decide, then explain', c: '#B48CFF' },
    quality: { n: 'Quality', strong: 'Your work holds up when someone checks it.', weak: 'Small gaps reach review that you could catch first.', fix: 'Check your work once before you send it', tip: 'Put a number on every result, and check it once.', act: 'Catch it before review', c: '#FF8A65' },
    speed: { n: 'Speed', strong: 'You ship early and use the spare time to check.', weak: 'You run over time, so the last part gets rushed.', fix: 'Ship a first version at the halfway mark', tip: 'Send a first version early, then make it better.', act: 'Ship a first version sooner', c: '#F0B94D' }
  };
  var RK = ['comm', 'indep', 'quality', 'speed'];

  /* each scenario's live moments: the manager's question, a good and a rushed answer, the gap and its fix, the call to make */
  var TXT = {
    s1: { q: 'How will reps know a lead is theirs?', good: 'Each rep gets a Slack alert with the lead and a draft reply.', rush: 'slack i guess', gap: 'Two edge cases land with no owner.', fix: 'Route them to a fallback rep.', tool: 'n8n', pick: 'Unowned leads go to the fallback rep, so none wait. Tell me if you want another rule.' },
    s2: { q: 'Which leads should reps call first?', good: 'Fleet accounts over 50 cars that score 80 or more.', rush: 'the good ones', gap: 'The score was never tested on old leads.', fix: 'Run it on last month’s leads first.', tool: 'Snowflake', pick: 'I weight fleet size highest, because it predicts deal size. Tell me if you disagree.' },
    s3: { q: 'What counts as a buying signal?', good: 'Pricing page twice in a week, plus a new finance hire.', rush: 'visits?', gap: 'Half the signals come from one source.', fix: 'Add a second source before you trust it.', tool: 'Clay', pick: 'I count a signal only when two sources agree, so reps can trust it.' },
    s4: { q: 'How full are the account records now?', good: '62% complete. The waterfall gets us to 91%.', rush: 'pretty full', gap: 'Two sources return different phone numbers.', fix: 'Pick one source of truth and say why.', tool: 'Clay', pick: 'I take phone numbers from the newest source, because it is fresher.' },
    s5: { q: 'How do you know the emails are safe to send?', good: 'Every draft is tested against 40 real replies first.', rush: 'they look fine', gap: 'The agent has no test set yet.', fix: 'Score 20 drafts by hand before you trust it.', tool: 'Claude', pick: 'The agent only sends drafts that score 4 or more on my test set.' },
    s6: { q: 'Which record wins when two clash?', good: 'The one with the newest order. Here is the rule.', rush: 'the first one', gap: 'Merging will drop 300 contacts.', fix: 'Export them first, then merge.', tool: 'Salesforce', pick: 'The record with the newest order wins, because it is the live customer.' },
    s7: { q: 'Where do deals stall?', good: 'At legal review: 11 days, three times longer than any other stage.', rush: 'in the middle somewhere', gap: 'The report has no week over week change.', fix: 'Show this week against last week.', tool: 'Looker', pick: 'I start the report at signed proposals, where the stall begins.' },
    s8: { q: 'How accurate is the agent on deal fields?', good: '96% on 200 calls, checked by hand.', rush: 'very accurate', gap: 'No one checks the agent’s output.', fix: 'Spot check ten calls a week.', tool: 'Gong', pick: 'The agent fills a field only when it is 90% sure. The rest go to a person.' },
    s9: { q: 'What happens to a lead with no rep in its region?', good: 'It goes to the regional lead within five minutes.', rush: 'not sure yet', gap: 'Fleet leads over 500 cars skip routing.', fix: 'Send those straight to the fleet team.', tool: 'Salesforce', pick: 'Fleet leads over 500 cars go straight to the fleet team.' },
    s10: { q: 'Where do new merchants drop off?', good: 'Menu upload. 38% never finish it.', rush: 'early on', gap: 'The follow up goes to every merchant.', fix: 'Send it only to the ones stuck at menu upload.', tool: 'n8n', pick: 'Only merchants stuck at menu upload get the follow up.' }
  };

  /* the three runs. b = result (1 Below, 2 Meeting, 3 Exceeding, 4 Exceptional). The coach turns the worst run around. */
  function run(b, c, q, i, s) { return { b: b, comm: c || 'good', qual: q || 'caught', indep: i || 'good', speed: s || 'fast' }; }
  var CASES = {
    best: { n: 'Best case', runs: [run(4), run(4, 'good', 'caught', 'good', 'slow'), run(4), run(3)] },
    mid: { n: 'Mid case', runs: [run(2, 'rush'), run(2, 'rush', 'missed'), run(3), run(2, 'good', 'missed', 'asks', 'slow'), run(3), run(3), run(2, 'good', 'caught', 'good', 'slow')] },
    worst: { n: 'Worst case', runs: [run(1, 'rush', 'missed', 'asks', 'slow'), run(1, 'rush', 'missed', 'asks', 'slow'), run(2, 'good', 'missed', 'asks', 'slow'),
      run(2, 'good', 'caught', 'asks'), run(1, 'rush', 'missed', 'asks', 'slow'), run(2, 'good', 'caught', 'good'), run(3), run(2), run(2, 'good', 'missed'), run(3)] }
  };
  var OPENS = {
    1: 'Your first paid work: GTM internships', 2: 'More internships, in Austin and New York', 3: 'Your first full time roles',
    4: 'Associate roles, most above $100,000', 5: 'GTM Engineer titles open', 6: 'GTM Engineer at growth startups',
    7: 'Senior and forward deployed roles', 8: 'Senior roles at Clay, Modal and LangChain', 9: 'Staff roles and AI architects',
    10: 'OpenAI and Anthropic. Every role is open'
  };

  var I = {
    cv: '<svg class="cv" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg>',
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>',
    play: '<svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.6 5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="1.5" width="2.2" height="7" rx=".6"/><rect x="5.8" y="1.5" width="2.2" height="7" rx=".6"/></svg>',
    again: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 2v2.5H5"/></svg>',
    phone: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5.6 2.5 4 2.3c-.7-.1-1.4.5-1.4 1.2 0 5.5 4.4 9.9 9.9 9.9.7 0 1.3-.7 1.2-1.4l-.2-1.6a1 1 0 0 0-.8-.8l-2-.4a1 1 0 0 0-.9.3l-.8.8a8 8 0 0 1-3.3-3.3l.8-.8a1 1 0 0 0 .3-.9l-.4-2a1 1 0 0 0-.8-.8z"/></svg>',
    pen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.4 2.9 13 5.5 5.6 12.9l-3 .6.6-3z"/><path d="m9.2 4.1 2.6 2.6"/></svg>',
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.8"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/></svg>',
    arrow: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
    cal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>',
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
    return '<span class="lg" style="--z:' + z + 'px;--c:' + c + '" title="' + nm + '"><i style="--u:url(' + ABS + 'logo/' + co + '.svg)' + (typeof ink === 'string' ? ';--m:' + ink : '') + '"></i></span>';
  }

  /* ---------- levels ---------- */
  function level(pts) { return Math.max(0, Math.min(10, Math.floor(pts / 1000))); }
  function rolesAt(L) { var r = D.rolesAt(DREAM, L).slice(); r.sort(function (a, b) { return (b.target ? 1 : 0) - (a.target ? 1 : 0); }); return r; }
  function companies(rs, n) { var seen = {}, out = []; rs.forEach(function (r) { if (!seen[r.co]) { seen[r.co] = 1; out.push(r.co); } }); return out.slice(0, n); }
  function circles(L, n, z) { return '<span class="circles">' + companies(rolesAt(L), n || 4).map(function (c) { return logo(c, z || 26); }).join('') + '</span>'; }
  function payTop(rs) {
    var best = 0;
    rs.forEach(function (r) {
      if (!/^\$/.test(r.pay || '') || /month|hour/.test(r.pay)) return;
      var n = (r.pay.match(/[\d,]+/g) || []).map(function (x) { return +x.replace(/,/g, ''); });
      best = Math.max(best, n[n.length - 1] || 0);
    });
    return best;
  }
  function places(rs) { var c = {}; rs.forEach(function (r) { var p = /^Remote/.test(r.loc) ? 'Remote' : r.loc; c[p] = (c[p] || 0) + 1; }); return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 3); }
  function short(p) {
    if (!p || /not posted/.test(p)) return '';
    if (/month|hour/.test(p)) return p;
    var m = p.match(/^(CA)?\$([\d,]+)( to ([\d,]+))?/);
    if (!m) return p;
    var k = function (s) { return Math.round(+s.replace(/,/g, '') / 1000) + 'k'; };
    return (m[1] || '') + '$' + k(m[2]) + (m[4] ? ' to ' + k(m[4]) : '');
  }

  /* ---------- the run's state ---------- */
  var ST;
  function reset(caseKey) {
    ST = { coachOn: true, ch: [], k: caseKey, pts: 0, done: 0, cur: 0, stage: 0, live: [], r: {}, f: 50, fd: 0, now: null, moves: [], cnt: { praise: 0, nudge: 0, heads: 0, level: 0, catch: 0 } };
    RK.forEach(function (k) { ST.r[k] = { v: 50, seen: false, d: 0 }; });
  }
  /* The coach's challenges. Like a cricket coach: not "you are doing well" but "ten clean hits in a row".
     Each one is measurable, shows its count, and is worth a band at review (+1,000 skill points). */
  var CH = {
    comm: { t: '3 updates in a row Jordan does not ask about', n: 3, why: 'Clear updates are what move a review up a band.', streak: true },
    indep: { t: '2 parts in a row without asking Jordan', n: 2, why: 'Managers grade people who decide, then explain.', streak: true },
    quality: { t: 'Send proof with your work', n: 1, why: 'Proof is the difference between Exceeding and Exceptional.' },
    speed: { t: 'Send a first version by the halfway mark', n: 1, why: 'An early version leaves time to check your numbers.' }
  };
  function chNew(keys) {
    keys = keys || RK.filter(function (k) { return ST.r[k].seen; }).sort(function (a, b) { return ST.r[a].v - ST.r[b].v; }).slice(0, 2);
    if (keys.length < 2) keys = ['comm', 'quality'];
    ST.ch = keys.map(function (k) { return { k: k, got: 0, done: false, broke: false }; });
  }
  function chHit(k, ok) {
    var c = (ST.ch || []).filter(function (x) { return x.k === k && !x.done; })[0]; if (!c) return null;
    var C = CH[k];
    if (ok) { c.got = Math.min(C.n, c.got + 1); c.broke = false; if (c.got >= C.n) { c.done = true; return 'done'; } return 'up'; }
    if (C.streak && c.got > 0) { c.got = 0; c.broke = true; return 'broke'; }
    return null;
  }
  function lc(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function chDone() { return (ST.ch || []).filter(function (c) { return c.done; }); }
  function read(k, dv) { var R = ST.r[k]; R.v = Math.max(12, Math.min(95, R.v + dv)); R.seen = true; R.d = dv; }
  function weakest() { var s = RK.filter(function (k) { return ST.r[k].seen; }).sort(function (a, b) { return ST.r[a].v - ST.r[b].v; }); return s[0] || 'comm'; }
  function strongest() { var s = RK.filter(function (k) { return ST.r[k].seen; }).sort(function (a, b) { return ST.r[b].v - ST.r[a].v; }); return s[0] || 'comm'; }
  /* the live forecast: where the scenario you are in is heading */
  function move(df, kind, k) { ST.f = Math.max(6, Math.min(97, ST.f + df)); ST.fd = df; ST.moves.push(kind); }
  function tint(v) { return v < 40 ? '#E07A45' : v < 58 ? '#F0B94D' : v < 80 ? '#4CC27A' : '#2FB866'; }

  /* what the coach thinks, right now, in one or two lines */
  function think() {
    var lv = level(ST.pts), sc = D.SCENARIOS[ST.cur], co = D.CO[sc.co], b = bandOf(ST.f), C = coach();
    if (lv >= 10 && ST.stage >= 4) return 'Level 10. GTM Engineer at OpenAI is open to you. You earned every point of it.';
    if (ST.stage === 0 && !ST.done) return 'My job is to get you hired. At ' + co + ', two things earn you the most skill points. Hit them and this review moves up a band.';
    if (ST.stage === 0) return co + ' is next. Hit both of my challenges there and you skip a level.';
    if (ST.stage >= 4) {
      var B = BANDS[ST.lastBand || b];
      return ST.lastBand >= 4 ? 'Exceptional at ' + co + '. That is the work that gets people hired.'
        : ST.lastBand === 3 ? 'Exceeding at ' + co + '. You are moving faster than you think.'
        : ST.lastBand === 2 ? 'Meeting at ' + co + '. Solid, and you already know the one thing to sharpen.'
        : 'Below at ' + co + ', and that is how you learn it. One fix and the next one pays double.';
    }
    if (b >= 3) return 'This is going well. Keep it up and ' + co + ' pays ' + fmt(BANDS[b].pay) + ' skill points' + (level(ST.pts + BANDS[b].pay) > lv ? ', enough for Level ' + level(ST.pts + BANDS[b].pay) + '.' : '.');
    if (b === 2) return 'Solid so far. One sharper move turns this into Exceeding and doubles what it pays.';
    return 'This one is slipping, and it is fixable. ' + READS[weakest()].fix + ' and you are back on track.';
  }

  /* ---------- the timeline of a run: five beats a scenario ---------- */
  var DUR = { start: 1300, ask: 2800, work: 2200, check: 2200, review: 2700, up: 1900 };
  function timeline(caseKey) {
    var tl = [], pts = 0;
    CASES[caseKey].runs.forEach(function (p, i) {
      var pay = BANDS[p.b].pay, up = level(pts + pay) > level(pts); pts += pay;
      tl.push({ k: 'start', i: i, p: p, dur: DUR.start }, { k: 'ask', i: i, p: p, dur: DUR.ask }, { k: 'work', i: i, p: p, dur: DUR.work },
        { k: 'check', i: i, p: p, dur: DUR.check }, { k: 'review', i: i, p: p, dur: DUR.review + (up ? DUR.up : 0) });
    });
    return tl;
  }
  var QUIET = false;
  function apply(b, live) {
    QUIET = !live;
    var sc = D.SCENARIOS[b.i], t = TXT[sc.id], co = D.CO[sc.co], p = b.p;
    if (b.k === 'start') {
      ST.cur = b.i; ST.stage = 0; ST.f = 50; ST.fd = 0; ST.moves = []; ST.lastBand = 0;
      ST.now = { kind: 'tip', k: weakest() }; chNew(b.i === 0 ? ['comm', 'quality'] : null);
      ST.live = []; say('sys', 'Kickoff · ' + sc.title + ' at ' + co); say('mgr', sc.ask, 500);
    }
    if (b.k === 'ask') {
      ST.stage = 1;
      var good = p.comm === 'good';
      read('comm', good ? 8 : -10); move(good ? 12 : -14, good ? 'win' : 'miss'); var r1 = chHit('comm', good); if (good && r1 !== 'done') r1 = chHit('comm', true); chToast(r1, 'comm');
      ST.now = good ? { kind: 'win', k: 'comm', text: 'Your answer to Jordan was clear. He has nothing to ask back.' }
        : { kind: 'miss', k: 'comm', del: t.rush, ins: t.good, why: 'Jordan will have to ask what you mean. A clear answer the first time keeps this at Exceeding.', msg: true };
      say('mgr', t.q);
      say('me', good ? t.good : t.rush, 1100, true);
      note(good ? 'praise' : 'nudge', good ? 'That answer was clear. Jordan has nothing to ask back. That is Exceeding work.' : 'Jordan will have to ask what you mean. Try this instead:', good ? '' : t.good, 2100, 'ask');
    }
    if (b.k === 'work') {
      ST.stage = 2;
      var caught = p.qual === 'caught';
      read('quality', caught ? 7 : -9); move(caught ? 10 : -12, caught ? 'win' : 'miss'); chToast(chHit('quality', caught), 'quality');
      ST.now = caught ? { kind: 'win', k: 'quality', text: 'You found the gap before Jordan did and fixed it.' }
        : { kind: 'miss', k: 'quality', del: t.gap, ins: t.fix, why: 'Jordan will find it in review. Fix it now and it never costs you.' };
      say('sys', ME.name + ' is building it in ' + t.tool + '.');
      note(caught ? 'praise' : 'heads', caught ? 'You caught it before Jordan did. That is exactly the habit.' : 'Before you send: ' + t.gap.charAt(0).toLowerCase() + t.gap.slice(1), caught ? '' : t.fix, 700, 'work');
    }
    if (b.k === 'check') {
      ST.stage = 3;
      var asks = p.indep === 'asks', slow = p.speed === 'slow';
      read('indep', asks ? -9 : 6); read('speed', slow ? -8 : 5); var r2 = chHit('indep', !asks); if (!asks && r2 !== 'done') r2 = chHit('indep', true); chToast(r2, 'indep'); chToast(chHit('speed', !slow), 'speed'); chToast(chHit('comm', !asks), 'comm');
      move((asks ? -8 : 6) + (slow ? -6 : 4), asks || slow ? 'miss' : 'win');
      if (asks) {
        ST.now = { kind: 'miss', k: 'indep', del: 'quick q, which rule should I use?', ins: t.pick, why: 'Make the call and say why. Managers promote people who decide.', msg: true };
        say('me', 'quick q, which rule should I use?');
        note('nudge', 'Third question to Jordan here. Make the call, then tell him why:', t.pick, 900, 'check');
      } else if (slow) {
        ST.now = { kind: 'miss', k: 'speed', del: 'This part is running 15 minutes over.', ins: 'Send a first version now, then improve it.', why: 'A first version on time beats a perfect one late.' };
        say('sys', 'This part is running long.');
        note('nudge', 'You are 15 minutes over. Send a first version now:', 'Ship what you have, then improve it.', 600, 'check');
      } else {
        ST.now = { kind: 'win', k: 'indep', text: 'You made the call yourself and finished early.' };
        say('sys', 'Sent to Jordan, ahead of time.');
        note('praise', 'You made the call yourself and finished early. Exactly right.', '', 600, 'check');
      }
    }
    if (b.k === 'review') {
      ST.stage = 4;
      var B = BANDS[p.b], before = level(ST.pts);
      ST.f = B.at; ST.fd = 0; ST.lastBand = p.b;
      ST.pts += B.pay; ST.done = b.i + 1;
      var after = level(ST.pts);
      ST.now = { kind: 'review', b: p.b };
      say('mgr', 'My review: ' + B.n + '.');
      gain(B.pay);
      var tl = CASES[ST.k].runs, nextSc = D.SCENARIOS[Math.min(b.i + 1, D.SCENARIOS.length - 1)];
      if (after > before) later(function () { levelUp(after); }, 700);
      if (b.i < tl.length - 1 && after < 10) {
        var dn = chDone(), why = dn.length ? 'You hit ' + dn.map(function (c) { return '“' + lc(CH[c.k].t) + '”'; }).join(' and ') + '. ' : '';
        var msg = p.b <= 1 ? 'Below this time, and that is how you learn it. One fix and the next one pays double.'
          : p.b >= 3 ? '+' + fmt(B.pay) + '. Here is why: ' + (why || 'Jordan had nothing to ask. ') + (level(ST.pts + 2000) > after ? 'One more like it and Level ' + level(ST.pts + 2000) + ' opens.' : '')
          : 'Solid. ' + READS[weakest()].fix + ' at ' + D.CO[nextSc.co] + ' and it can be Exceeding.';
        note(p.b <= 1 ? 'nudge' : 'praise', msg, '', after > before ? 2200 : 900, 'review');
      }
    }
  }

  function chToast(r, k) {
    if (r === 'done') note('praise', 'Challenge done: ' + lc(CH[k].t) + '. That is +1,000 at review.', '', 1600, 'review');
  }

  /* ---------- the player ---------- */
  var P = { tl: [], i: 0, t: null, subs: [], playing: false, speed: 2, k: null, ended: false };
  function later(fn, ms) { if (QUIET) { fn(); return 0; } var id = setTimeout(fn, ms / P.speed); P.subs.push(id); return id; }
  function clearAll() { clearTimeout(P.t); P.subs.forEach(clearTimeout); P.subs = []; }
  function start(k) {
    clearAll(); reset(k);
    P.tl = timeline(k); P.i = 0; P.k = k; P.playing = true; P.ended = false;
    $('#toasts').innerHTML = ''; $('#live').hidden = false; S.seen = false; closeSheet();
    renderLevel(); renderCoach(); refresh();
    step();
  }
  function startFrom(k, from, speed) {
    clearAll();
    P.tl = timeline(k).filter(function (b) { return b.i >= from; }); P.i = 0; P.k = k; P.playing = true; P.ended = false;
    if (speed) P.speed = speed;
    $('#live').hidden = false;
    refresh(); step();
  }
  function step() {
    if (!P.playing) return;
    if (P.i >= P.tl.length) { finish(); return; }
    var b = P.tl[P.i++];
    apply(b, true); refresh();
    P.t = setTimeout(step, b.dur / P.speed);
  }
  function finish() {
    P.playing = false; P.ended = true;
    var lv = level(ST.pts), n = CASES[P.k].runs.length;
    note('level', lv >= 10 ? 'Level 10 in ' + n + ' scenarios. GTM Engineer at OpenAI is open to you. Proud of you.' : 'Level ' + lv + ' after ' + n + ' scenarios.', '', 300, 'review');
    say('sys', 'Level ' + lv + ' in ' + n + ' scenarios.' + (lv >= 10 ? ' OpenAI is open.' : ''), 300);
    drawRun();
    if (window.__J) window.__J.onFinish();
  }
  function togglePlay() { P.playing = !P.playing; if (P.playing) step(); else clearTimeout(P.t); drawRun(); updateCoach(); }
  /* before any run: the mid case after two scenarios, about to start Stripe */
  function still() {
    clearAll(); reset('mid'); P.k = null; P.playing = false; P.ended = false;
    timeline('mid').slice(0, 10).forEach(function (b) { apply(b, false); });
    apply({ k: 'start', i: 2, p: CASES.mid.runs[2] }, false);
    renderLevel(); renderCoach(); refresh();
  }

  /* ---------- the live card: the work as it happens ---------- */
  function say(who, text, delay, typing) {
    if (QUIET) return;
    var go = function () {
      if (typing) { ST.live.push({ who: who, typing: true }); drawLive(); later(function () { ST.live[ST.live.length - 1] = { who: who, text: text }; drawLive(); }, 700); }
      else { ST.live.push({ who: who, text: text }); drawLive(); }
    };
    if (delay) later(go, delay); else go();
  }
  function drawLive() {
    var el = $('#live'); if (el.hidden) return;
    var sc = D.SCENARIOS[ST.cur], msgs = ST.live.slice(-3);
    el.innerHTML = '<div class="lv-h"><span class="livedot"><i></i>Live</span><span>' + esc(D.CO[sc.co]) + ' · ' + esc(sc.title) + '</span></div><div class="lv-b">' +
      msgs.map(function (m) {
        if (m.who === 'sys') return '<div class="msg sys"><p>' + esc(m.text) + '</p></div>';
        var w = m.who === 'mgr' ? MGR : ME;
        return '<div class="msg ' + m.who + '"><img src="' + w.img + '" alt=""><p><em>' + w.name + '</em>' + (m.typing ? '<span class="typing"><i></i><i></i><i></i></span>' : esc(m.text)) + '</p></div>';
      }).join('') + '</div>';
  }

  /* ---------- the coach's notes: short, while you work. How often follows the coach settings. ---------- */
  var TYPE = { praise: 'Great work', nudge: 'Try this instead', heads: 'Heads up', level: 'Level up' };
  function note(type, text, tryText, delay, when) {
    if (QUIET) return;
    later(function () {
      if (S.nudges === 'review' && when !== 'review') return;
      if (S.nudges === 'stage' && when === 'ask') return;
      if (!S.celebrate && type === 'praise') return;
      if (ST.cnt[type] != null) ST.cnt[type]++;
      toast(type, text, tryText);
      if (!S.open || S.tab !== 'coach') S.seen = false;
      updateHud();
    }, delay || 0);
  }
  function toast(type, text, tryText, extra) {
    var box = $('#toasts'), el = document.createElement('div'), C = coach();
    el.className = 'toast ' + type;
    el.innerHTML = '<img src="' + C.img + '" alt=""><div><div class="h"><i></i>' + C.name + ' · ' + TYPE[type] + '</div><p>' + esc(text) + '</p>' +
      (tryText ? '<div class="try">' + esc(tryText) + '</div>' : '') + (extra || '') + '</div>';
    box.insertBefore(el, box.firstChild);
    while (box.children.length > 2) box.removeChild(box.lastChild);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, Math.max(2600, 5600 / P.speed));
  }
  function levelUp(L) {
    if (QUIET) return;
    var n = D.BUCKET[L] || 0, rs = rolesAt(L), r0 = rs[0];
    var hud = $('#hud'); hud.classList.remove('up'); hud.offsetWidth; hud.classList.add('up');
    toast('level', 'Level ' + L + '. ' + n + ' new roles just opened' + (r0 ? ', ' + D.CO[r0.co] + (/^Remote/.test(r0.loc) ? ' remote' : ' in ' + r0.loc) + ' among them' : '') + '.', '', '<span class="circles">' + companies(rs, 5).map(function (c) { return logo(c, 24); }).join('') + '</span>');
    refresh();
  }
  function gain(n) { if (QUIET) return; var g = $('#gain'); g.innerHTML = '✦ +' + fmt(n); g.classList.remove('go'); g.offsetWidth; g.classList.add('go'); }

  /* ---------- Level: where you are, what the next level unlocks, then the rest, small. No past levels. ---------- */
  function near(rs) {
    var a = rs.filter(function (r) { return /Austin/.test(r.loc); }).length, rm = rs.filter(function (r) { return /^Remote/.test(r.loc); }).length;
    if (a) return a === 1 ? 'One is in Austin, close to home.' : a + ' are in Austin, close to home.';
    if (rm) return rm === 1 ? 'One is remote, so Austin works.' : rm + ' are remote, so Austin works.';
    return rs[0] ? D.CO[rs[0].co] + ' is hiring for it now.' : '';
  }
  function badge(L, cls) { return '<span class="bdg ' + (cls || '') + '"><b>' + L + '</b></span>'; }
  function types(rs) {
    var t = rs.map(function (r) { return r.title.replace(/,.*$/, '').replace(/ \(.*\)$/, ''); }), seen = {}, out = [];
    t.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out.slice(0, 2).join(', ');
  }
  function renderLevel() { $('#pgLevel').innerHTML = '<div id="lvWrap"></div>'; }
  function updateLevel() {
    var lv = level(ST.pts), next = lv + 1, h, key = lv + ':' + Math.floor((ST.pts - lv * 1000) / 50) + ':' + S.coach;
    var w = $('#lvWrap'); if (!w || w.dataset.key === key) { railFill(); return; } w.dataset.key = key;
    var frac = lv >= 10 ? 1 : (ST.pts - lv * 1000) / 1000;
    h = '<div class="lv-cur">' + badge(lv, 'cur') + '<div><h2>Level ' + lv + '</h2><p>' + (lv >= 10 ? 'Every role is open to you' : '<b>' + fmt(next * 1000 - ST.pts) + '</b> skill points to Level ' + next) +
      '<button class="q" type="button" data-pop="bands" aria-label="How skill points work">?</button></p></div></div>' +
      '<div class="lv-bar"><i style="width:' + Math.round(frac * 100) + '%"></i></div>';
    if (lv < 10) {
      var rs = rolesAt(next), n = D.BUCKET[next] || rs.length, cos = companies(rs, 5), meet = level(ST.pts + 1000), exc = level(ST.pts + 2000), C = coach(), sc = D.SCENARIOS[ST.cur];
      h += '<div class="nx-card"><div class="nx-h">' + badge(next, 'nx') + '<div><span class="k">Unlocks at Level ' + next + '</span><b>' + n + ' roles</b></div></div>' +
        '<div class="nx-co"><span class="circles big">' + cos.map(function (c) { return logo(c, 32); }).join('') + '</span><span class="nx-more">and ' + Math.max(0, n - cos.length) + ' more</span></div>' +
        '<p class="nx-t">' + esc(types(rs)) + '</p><p class="nx-n">' + esc(near(rs)) + '</p>' +
        '<div class="nx-tip"><img src="' + C.img + '" alt=""><p><b>' + C.name + ':</b> ' + (exc > meet ? 'Exceeding at ' + esc(D.CO[sc.co]) + ' takes you to Level ' + exc + ' in one go. Meeting gets you to ' + meet + '.' : 'Meeting at ' + esc(D.CO[sc.co]) + ' gets you there.') + '</p></div></div>';
      if (next < 10) {
        h += '<div class="later">';
        for (var L = next + 1; L <= 10; L++) {
          var r2 = rolesAt(L), n2 = D.BUCKET[L] || r2.length;
          h += '<div class="lt" data-tip="' + n2 + ' more roles to unlock">' + badge(L, L === 10 ? 'goal' : '') + '<span class="nm">Level ' + L + (L === 10 ? ' <em>GTM Engineer at OpenAI</em>' : '') + '</span>' +
            '<span class="circles">' + companies(r2, 3).map(function (c) { return logo(c, 22); }).join('') + '</span></div>';
        }
        h += '</div>';
      }
    } else h += '<div class="nx-card done"><p class="nx-t">GTM Engineer at OpenAI is open to you, with every other role.</p></div>';
    w.innerHTML = h;
  }
  function railFill() {}

  /* ---------- Coach: on your team, to get you the role. What I think, what I need to see, keep doing. ---------- */
  function coach() { return COACHES[S.coach] || COACHES[0]; }
  /* the journey coach: his voice notes so far, your pace, and a way to tell him how it is going. No chat yet. */
  function renderCoach() {
    var C = coach();
    $('#pgCoach').innerHTML = '<div class="co-top"><span class="who"><img id="coImg" src="' + C.img + '" alt=""><span><b id="coName">' + C.name + '</b><em>Your coach, all the way to the job</em></span></span>' +
      '<span class="co-act"><button type="button" class="ib" data-sheet="set" aria-label="How I coach you">' + I.pen + '</button></span></div><div id="coBody"></div>';
  }
  function updateCoach() {
    var C = coach(), body = $('#coBody'); if (!body) return;
    $('#coImg').src = C.img; $('#coName').textContent = C.name;
    var tips = ST.tips || [], lv = level(ST.pts), pace = ST.pace || '1 hour';
    var key = tips.length + '|' + lv + '|' + pace + '|' + (ST.tipNew || '');
    if (body.dataset.key === key) return; body.dataset.key = key;
    var eta = { '30 minutes': 'December 22', '1 hour': 'December 4', '2 hours': 'November 21' }[pace] || 'December 4';
    var h = '<div class="jr"><div class="jr-r"><span>Goal</span><b>GTM Engineer at OpenAI</b></div><div class="jr-r"><span>Your pace</span><b>' + esc(pace) + ' a day</b></div>' +
      '<div class="jr-r"><span>Level 10 by</span><b class="g">' + eta + '</b></div></div>';
    h += '<div class="vn"><h4>From ' + C.name + '</h4>' + (tips.length ? tips.slice().reverse().slice(0, 5).map(function (t) {
      var i = tips.indexOf(t);
      return '<button type="button" class="vn-r' + (ST.tipNew === t.id ? ' new' : '') + '" data-tip-i="' + i + '"><span class="pl">' + I.play + '</span><span class="t"><b>' + esc(t.t) + '</b><em>' + esc(t.at) + ' · ' + t.len + '</em></span></button>';
    }).join('') : '<p class="none">When I have something for you, my face lights up. Tap it and I will tell you.</p>') + '</div>';
    h += '<button type="button" class="fb" data-fb="1">Tell ' + C.name + ' how it is going</button>';
    body.innerHTML = h;
  }

  /* ---------- the coach's call and settings, on top of the panel ---------- */
  function openSheet(kind) {
    var sh = $('#sheet'), C = coach(), sc = D.SCENARIOS[ST.cur];
    if (kind === 'call') {
      sh.innerHTML = '<div class="sh-h"><b>Talk to ' + C.name + '</b><button type="button" class="ib" data-close="1" aria-label="Close">' + I.x + '</button></div>' +
        '<div class="call"><span class="av"><img src="' + C.img + '" alt=""></span><b>' + C.name + '</b><span class="sub">Two minutes on what you are doing right now</span>' +
        '<button type="button" class="go" data-call="now">' + I.phone + 'Call now</button></div>' +
        '<div class="slots"><span class="kick">Or book two minutes</span><div>' + ['Today, 4:30pm', 'Today, 6:00pm', 'Tomorrow, 9:00am'].map(function (t) { return '<button type="button" data-slot="' + t + '">' + I.cal + t + '</button>'; }).join('') + '</div></div>';
    } else {
      sh.innerHTML = '<div class="sh-h"><b>How I coach you</b><button type="button" class="ib" data-close="1" aria-label="Close">' + I.x + '</button></div>' +
        '<div class="opt"><span class="kick">My feedback</span><div class="seg two">' + [['straight', 'Straight to the point'], ['context', 'With more context']].map(function (o) { return '<button type="button" data-style="' + o[0] + '"' + ((S.style || 'straight') === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div></div>' +
        '<div class="opt"><span class="kick">When I have something</span><div class="seg two">' + [['pulse', 'Light up my face'], ['take', 'Take the screen']].map(function (o) { return '<button type="button" data-when="' + o[0] + '"' + ((S.when || 'pulse') === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div></div>' +
        '<label class="tog"><span>Play my voice notes out loud</span><input type="checkbox" checked><i></i></label>' + '<div class="pick" hidden>' + COACHES.map(function (c, i) { return '<button type="button" data-coach="' + i + '"' + (S.coach === i ? ' class="on"' : '') + '><img src="' + c.img + '" alt=""><span><b>' + c.name + '</b><em>' + c.style + '</em></span><i>' + I.tick + '</i></button>'; }).join('') + '</div>' +
        '<div class="opt"><span class="kick">Notes while you work</span><div class="seg">' + [['live', 'Live'], ['stage', 'After each part'], ['review', 'Only at review']].map(function (o) { return '<button type="button" data-nudges="' + o[0] + '"' + (S.nudges === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div></div>' +
        '<label class="tog"><span>Celebrate my wins</span><input type="checkbox" data-celebrate="1"' + (S.celebrate ? ' checked' : '') + '><i></i></label>';
    }
    sh.hidden = false; sh.dataset.kind = kind; $('#panel').classList.add('sh');
  }
  function closeSheet() { var s = $('#sheet'); if (!s) return; s.hidden = true; clearInterval(s._t); $('#panel').classList.remove('sh'); }
  function ringCall() {
    var sh = $('#sheet'), C = coach(), sc = D.SCENARIOS[ST.cur], w = READS[weakest()];
    sh.querySelector('.call').innerHTML = '<span class="av ring"><img src="' + C.img + '" alt=""></span><b>Calling ' + C.name + '</b><span class="sub">Connecting</span>';
    setTimeout(function () {
      if (sh.hidden) return;
      var sec = 0;
      sh.querySelector('.call').innerHTML = '<span class="av on"><img src="' + C.img + '" alt=""></span><b>' + C.name + '</b><span class="sub" id="clock">0:00</span>' +
        '<span class="wave">' + Array(14).join('<i></i>') + '</span><p class="cap">“Hey Maya. Quick one on ' + esc(D.CO[sc.co]) + ': ' + esc(w.tip.charAt(0).toLowerCase() + w.tip.slice(1)) + ' Want me to stay on while you do it?”</p>' +
        '<button type="button" class="end" data-close="1">End call</button>';
      sh._t = setInterval(function () { sec++; var c = $('#clock'); if (c) c.textContent = '0:' + String(sec).padStart(2, '0'); if (sec >= 120) closeSheet(); }, 1000);
    }, 1400);
  }

  /* ---------- the chips, the world, the card, the capsule ---------- */
  function updateHud() {
    var lv = level(ST.pts), frac = lv >= 10 ? 1 : (ST.pts - lv * 1000) / 1000;
    $('#lvNum').textContent = 'L' + lv;
    $('#lvBar').style.width = Math.round(frac * 100) + '%';
    $('#chipMe img').src = coach().img; $('#chipMe').classList.toggle('lockd', !ST.coachOn);
    $('#meDot').classList.toggle('off', S.seen);
    $('#hud').classList.toggle('lv', S.open && S.tab === 'level');
    $('#hud').classList.toggle('co', S.open && S.tab === 'coach');
  }
  var W = 3456, H = 1944, SW = 1440, SH = 862;
  function updateWorld() {
    var sc = D.SCENARIOS[ST.cur], p = D.PLACE[sc.co] || D.PLACE.zero, px = p[0] / 100 * W, py = p[1] / 100 * H;
    var ox = Math.min(0, Math.max(SW - W, 640 - px)), oy = Math.min(0, Math.max(SH - H, 470 - py));
    $('#world').style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    var pin = $('#pin'); pin.style.left = px + 'px'; pin.style.top = py + 'px';
    if (pin.dataset.co !== sc.co) { pin.dataset.co = sc.co; pin.innerHTML = logo(sc.co, 26); }
  }
  function updateCard() {
    var sc = D.SCENARIOS[ST.cur], n = P.k ? CASES[P.k].runs.length : D.SCENARIOS.length, key = sc.id + ST.stage;
    var c = $('#card'); if (c.dataset.key === key) return; c.dataset.key = key;
    var rows = [['Progress', ST.stage >= 4 ? 'Reviewed' : ST.stage ? ST.stage + ' of 4 parts' : 'Not started'], ['Pays up to', '<span class="st">✦</span>3,000'], ['Tools', esc(sc.tools.join(', '))]];
    c.innerHTML = '<div class="cd-pg">' + I.l + '<span>' + String(ST.cur + 1).padStart(2, '0') + ' / ' + n + '</span>' + I.r + '</div>' +
      '<div class="cd-art"><img src="' + AS + 'img/b/' + sc.co + '.webp" alt=""></div><div class="cd-t"><h3>' + esc(sc.title) + '</h3><p>at ' + esc(D.CO[sc.co]) + '</p></div>' +
      '<dl class="cd-rows">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="cd-go"><button class="btn" type="button">' + I.play + (ST.stage ? 'Continue' : 'Start') + '</button></div>';
  }
  function updateCapsule() {
    var n = P.k ? CASES[P.k].runs.length : D.SCENARIOS.length, cap = $('#capsule');
    if (!cap.children.length) cap.innerHTML = D.SCENARIOS.map(function (s) { return '<span class="s" title="' + esc(D.CO[s.co] + ', ' + s.title) + '">' + logo(s.co, 26) + '</span>'; }).join('');
    [].forEach.call(cap.children, function (el, i) { el.className = 's ' + (i >= n ? 'hide' : i < ST.done ? 'done' : i === ST.cur ? 'cur' : 'ahead'); });
  }
  function refresh() { updateHud(); updateWorld(); updateCard(); updateCapsule(); updateLevel(); updateCoach(); drawRun(); if (S.open) caret(); }

  /* ---------- the panel ---------- */
  var S = { tab: 'coach', open: true, rung: 0, seen: false, cv: false, coach: 0, nudges: 'live', celebrate: true };
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('view') === 'coach') S.cv = true;
    var h0 = location.hash.slice(1);
    if (h0 === 'coach' || h0 === 'level') S.tab = h0; else if (h0 === 'closed') S.open = false;
  } catch (e) {}
  function scaleF() { return $('#app')._s || 1; }
  function caret() {
    var p = $('#panel'), chip = S.tab === 'level' ? $('#chipLv') : $('#chipMe');
    var pr = p.getBoundingClientRect(), cr = chip.getBoundingClientRect();
    p.style.setProperty('--cx', ((pr.right - (cr.left + cr.width / 2)) / scaleF()) + 'px');
  }
  function morph(fn) {
    var p = $('#panel');
    if (!p.classList.contains('open')) { fn(); return; }
    var hA = p.offsetHeight; fn(); p.style.height = 'auto';
    var hB = p.offsetHeight; p.style.height = hA + 'px'; p.offsetHeight; p.style.height = hB + 'px';
    clearTimeout(p._t); p._t = setTimeout(function () { p.style.height = ''; railFill(); }, 340);
  }
  function show(tab) {
    S.tab = tab; closePop(); closeSheet();
    if (tab === 'coach') S.seen = true;
    $('#pgLevel').hidden = tab !== 'level'; $('#pgCoach').hidden = tab !== 'coach';
    var pg = tab === 'level' ? $('#pgLevel') : $('#pgCoach');
    pg.classList.remove('in'); pg.offsetWidth; pg.classList.add('in');
    $('#pnScroll').scrollTop = 0;
    updateHud(); caret(); if (tab === 'level') requestAnimationFrame(railFill);
  }
  function setOpen(o) {
    S.open = o; closePop(); closeSheet();
    $('#panel').classList.toggle('open', o); $('#screen').classList.toggle('po', o);
    updateHud(); if (o) { caret(); requestAnimationFrame(railFill); }
    try { history.replaceState(null, '', location.pathname + location.search + '#' + (o ? S.tab : 'closed')); } catch (e) {}
  }
  function openTab(t) {
    if (S.open && S.tab === t) { setOpen(false); return; }
    if (S.open) morph(function () { show(t); }); else { show(t); setOpen(true); }
    try { history.replaceState(null, '', location.pathname + location.search + '#' + t); } catch (e) {}
  }
  /* the rules, on top of the panel: nothing below it moves */
  function openPop(btn) {
    var pop = $('#pop'), pr = $('#panel').getBoundingClientRect(), br = btn.getBoundingClientRect(), s = scaleF();
    pop.innerHTML = '<h4>How a scenario pays</h4><p>Your manager reviews every scenario. The better it went, the more skill points it pays. 1,000 skill points is a level.</p>' +
      '<div class="bands">' + BANDS.slice(1).map(function (b) { return '<div><b>' + b.n + '</b><span>✦ ' + fmt(b.pay) + '</span></div>'; }).join('') + '</div>';
    pop.style.top = ((br.bottom - pr.top) / s + 10) + 'px';
    pop.hidden = false;
  }
  function closePop() { var p = $('#pop'); if (p) p.hidden = true; }

  /* ---------- the prototype controls ---------- */
  function drawCases() {
    if (window.__J) { window.__J.drawBar(); return; }
    $('#cases').innerHTML = Object.keys(CASES).map(function (k) { return '<button type="button" data-case="' + k + '"' + (P.k === k ? ' class="on"' : '') + '><span class="pl"></span>Simulate ' + CASES[k].n.toLowerCase() + '</button>'; }).join('');
    $('#variant').innerHTML = '<button type="button" data-cv="1"' + (S.cv ? ' class="on"' : '') + ' title="What the coach reads, for the team. Learners never see it.">Coach’s view</button>';
  }
  function drawRun() {
    if (window.__J) { window.__J.drawBar(); return; }
    var el = $('#run');
    if (!P.k) { el.innerHTML = ''; return; }
    var n = CASES[P.k].runs.length, lv = level(ST.pts);
    var st = P.ended ? 'Level ' + lv + ' in ' + n + ' scenarios' : 'Scenario ' + Math.min(n, ST.cur + 1) + ' of ' + n + ' · Level ' + lv;
    var key = st + P.playing + P.speed + P.ended;
    if (el.dataset.key === key) return; el.dataset.key = key;
    el.innerHTML = '<span class="st">' + st + '</span>' + (P.ended ? '' : '<button type="button" data-run="play" aria-label="' + (P.playing ? 'Pause' : 'Play') + '">' + (P.playing ? I.pause : I.play) + '</button>') +
      '<button type="button" data-run="again" aria-label="Start over">' + I.again + '</button><button type="button" class="sp" data-run="speed">' + P.speed + 'x</button>';
  }
  function fit() {
    var st = $('#stage'), a = $('#app');
    var s = Math.min((st.clientWidth - 40) / 1440, (st.clientHeight - 32) / 900);
    a._s = s; a.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  /* ---------- wire up ---------- */
  $('#city').src = AS + 'img/city.webp';
  $('.wm').src = AS + 'img/zero-wordmark.svg';
  $('#rail').innerHTML = '<button type="button" class="on" title="World">' + I.world + '</button><button type="button" title="Portfolio">' + I.folio + '</button><button type="button" title="Jobs">' + I.jobs + '</button>';
  $('#chipLv').addEventListener('click', function (e) { e.stopPropagation(); openTab('level'); });
  $('#chipMe').addEventListener('click', function (e) { e.stopPropagation(); openTab('coach'); });
  $('#panel').addEventListener('click', function (e) {
    e.stopPropagation();
    var t = e.target;
    var qb = t.closest('[data-pop]');
    if (qb) { if ($('#pop').hidden) openPop(qb); else closePop(); return; }
    if (!t.closest('#pop')) closePop();
    var sb = t.closest('[data-sheet]'); if (sb) { openSheet(sb.dataset.sheet); return; }
    if (t.closest('.vj')) return;
    if (t.closest('[data-close]')) { closeSheet(); return; }
    if (t.closest('[data-call]')) { ringCall(); return; }
    var sl = t.closest('[data-slot]');
    if (sl) { $('#sheet .slots').innerHTML = '<p class="booked">' + I.cal + 'Booked: ' + esc(sl.dataset.slot) + ' with ' + coach().name + '. Two minutes.</p>'; return; }
    var tp = t.closest('[data-tip-i]'); if (tp && window.__J) { window.__J.replay(+tp.dataset.tipI); return; }
    if (t.closest('[data-fb]') && window.__J) { window.__J.feedback(); return; }
    var sb2 = t.closest('[data-style]'); if (sb2) { S.style = sb2.dataset.style; $$('[data-style]').forEach(function (x) { x.classList.toggle('on', x === sb2); }); return; }
    var wb = t.closest('[data-when]'); if (wb) { S.when = wb.dataset.when; $$('[data-when]').forEach(function (x) { x.classList.toggle('on', x === wb); }); return; }
    var cb = t.closest('[data-coach]');
    if (cb) { S.coach = +cb.dataset.coach; $$('.pick button').forEach(function (x) { x.classList.toggle('on', x === cb); }); updateHud(); updateCoach(); return; }
    var nb = t.closest('[data-nudges]');
    if (nb) { S.nudges = nb.dataset.nudges; $$('.seg button').forEach(function (x) { x.classList.toggle('on', x === nb); }); return; }
    var ce = t.closest('[data-celebrate]'); if (ce) { S.celebrate = ce.checked; return; }
    var rb = t.closest('.rung>button');
    if (rb) { var L = +rb.parentNode.dataset.l; morph(function () { S.rung = S.rung === L ? 0 : L; $$('.rung').forEach(function (x) { var on = +x.dataset.l === S.rung; x.classList.toggle('open', on); x.firstChild.setAttribute('aria-expanded', on); }); }); }
  });
  $('#pnScroll').addEventListener('scroll', closePop, { passive: true });
  $('#screen').addEventListener('click', function () { if (S.open) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#pop').hidden) closePop(); else if (!$('#sheet').hidden) closeSheet(); else if (S.open) setOpen(false); } });
  $('#dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.case && !window.__J) { start(b.dataset.case); drawCases(); }
    if (b.dataset.cv) { S.cv = !S.cv; drawCases(); morph(function () { updateCoach(); }); }
    if (window.__J) return;
    if (b.dataset.run === 'play') togglePlay();
    if (b.dataset.run === 'again') start(P.k);
    if (b.dataset.run === 'speed') { P.speed = P.speed === 1 ? 2 : P.speed === 2 ? 4 : 1; drawRun(); }
  });
  window.addEventListener('resize', function () { fit(); if (S.open) { caret(); railFill(); } });

  fit(); drawCases(); still();
  $('#panel').classList.toggle('open', S.open); $('#screen').classList.toggle('po', S.open);
  show(S.tab); updateHud();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S.open) { caret(); railFill(); } });
  try { var c0 = new URLSearchParams(location.search).get('case'); if (CASES[c0]) { start(c0); drawCases(); } } catch (e) {}
  window.__ready = true;
  window.__sim = { start: start, P: P, S: S, get ST() { return ST; } };
  window.__home = {
    D: D, AS: AS, MGR: MGR, ME: ME, READS: READS, BANDS: BANDS, TXT: TXT, CASES: CASES, P: P, S: S,
    get ST() { return ST; }, esc: esc, fmt: fmt, logo: logo, circles: circles, companies: companies, rolesAt: rolesAt, level: level, coach: coach,
    reset: function (k) { clearAll(); reset(k); P.k = k; P.playing = false; P.ended = false; $('#toasts').innerHTML = ''; $('#live').hidden = true; S.seen = false; closeSheet(); renderLevel(); renderCoach(); refresh(); },
    quiet: function (k, i) { timeline(k).filter(function (b) { return b.i === i; }).forEach(function (b) { apply(b, false); }); refresh(); },
    startFrom: startFrom, clearAll: clearAll, togglePlay: togglePlay, refresh: refresh, toast: function (t, a, b, x) { if (ST.cnt[t] != null) ST.cnt[t]++; toast(t, a, b, x); },
    levelUp: levelUp, gain: gain, openTab: openTab, setOpen: setOpen, caret: caret, railFill: railFill,
    setNow: function (n, df) { ST.now = n; if (df) { ST.f = Math.max(6, Math.min(97, ST.f + df)); ST.fd = df; } updateCoach(); },
    setStage: function (i, st) { ST.cur = i; ST.stage = st; refresh(); },
    updateCoach: function () { updateCoach(); },
    CH: CH, chNew: function (k) { chNew(k); updateCoach(); }, chHit: function (k, ok) { var r = chHit(k, ok); updateCoach(); return r; },
    coachOn: function (on) { ST.coachOn = on; updateHud(); updateCoach(); updateLevel(); }
  };
})();
