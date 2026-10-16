/* Zero home, b9. Two chips at the top right are the tabs: the level opens how far the job is, Navid opens your coach.
   A simulator above the app plays Maya's run (best, mid, worst case) through every level: the work as it happens,
   Navid's short notes while she works, his live read of her, the level filling and the roles opening. */
(function () {
  'use strict';
  var D = window.SP_DATA;
  var AS = 'zero-skill-path-home-assets-b9/';
  /* a url inside a CSS variable resolves against the stylesheet that reads it, so logos get a full address */
  var ABS = new URL(AS, location.href).href;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var DREAM = { co: 'openai', rung: 'mid' };
  var COACH = { name: 'Navid', img: AS + 'img/navid-face.jpg' };
  var MGR = { name: 'Jordan', img: AS + 'img/cast-jordan.jpg' };
  var ME = { name: 'Maya', img: AS + 'img/maya.jpg' };

  /* what a scenario's result pays, in skill points */
  var BANDS = [null, { n: 'Below', pay: 500 }, { n: 'Meeting', pay: 1000 }, { n: 'Exceeding', pay: 2000 }, { n: 'Exceptional', pay: 3000 }];

  /* the four things Navid reads. Learners see a mark, not a word, until they open it. */
  var READS = {
    comm: { n: 'Communication', i: '<path d="M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.5v-2.5H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z"/>',
      strong: 'Your updates are clear, and Jordan never has to ask twice.', weak: 'Your messages read rushed, and that is what holds your reviews back.',
      work: 'Your messages read rushed', fix: 'Write one clear update', watch: 'Clear, short updates that ask for what you need.', first: 'Write every update as: what I did, what I found, what I need.' },
    indep: { n: 'Independence', i: '<path d="M8 1.8 13 3.6v4c0 3.1-2.1 5.4-5 6.6-2.9-1.2-5-3.5-5-6.6v-4z"/>',
      strong: 'You make the call yourself and say why.', weak: 'You check in before you finish a stage, and managers notice.',
      work: 'You ask before you decide', fix: 'Finish one stage without asking', watch: 'Whether you make the call, or wait to be told.', first: 'Make the call, then tell your manager why.' },
    quality: { n: 'Quality', i: '<path d="m8 2 1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4L2.2 6.3l4-.6z"/>',
      strong: 'Your work holds up when someone checks it.', weak: 'Small gaps reach review that you could catch first.',
      work: 'Gaps reach review', fix: 'Check your work once before you send it', watch: 'Whether the work holds up when someone checks it.', first: 'Put a number on every result.' },
    speed: { n: 'Speed', i: '<path d="M9 1.8 3.5 9H8l-1 5.2L12.5 7H8z"/>',
      strong: 'You ship early and use the spare time to check.', weak: 'You run over time, so the last stage gets rushed.',
      work: 'You run over time', fix: 'Ship a first version at the halfway mark', watch: 'How long a stage takes against the time it has.', first: 'Ship a first version early, then make it better.' }
  };
  var RK = ['comm', 'indep', 'quality', 'speed'];

  /* each scenario's live moments: the manager's question, a good and a rushed answer, the gap and its fix */
  var TXT = {
    s1: { q: 'How will reps know a lead is theirs?', good: 'Each rep gets a Slack alert with the lead and a draft reply.', rush: 'slack i guess', gap: 'Two edge cases land with no owner.', fix: 'Route them to a fallback rep.', tool: 'n8n' },
    s2: { q: 'Which leads should reps call first?', good: 'Fleet accounts over 50 cars that score 80 or more.', rush: 'the good ones', gap: 'The score was never tested on old leads.', fix: 'Run it on last month’s leads first.', tool: 'Snowflake' },
    s3: { q: 'What counts as a buying signal?', good: 'Pricing page twice in a week, plus a new finance hire.', rush: 'visits?', gap: 'Half the signals come from one source.', fix: 'Add a second source before you trust it.', tool: 'Clay' },
    s4: { q: 'How full are the account records now?', good: '62% complete. The waterfall gets us to 91%.', rush: 'pretty full', gap: 'Two sources return different phone numbers.', fix: 'Pick one source of truth and say why.', tool: 'Clay' },
    s5: { q: 'How do you know the emails are safe to send?', good: 'Every draft is tested against 40 real replies first.', rush: 'they look fine', gap: 'The agent has no test set yet.', fix: 'Score 20 drafts by hand before you trust it.', tool: 'Claude' },
    s6: { q: 'Which record wins when two clash?', good: 'The one with the newest order. Here is the rule.', rush: 'the first one', gap: 'Merging will drop 300 contacts.', fix: 'Export them first, then merge.', tool: 'Salesforce' },
    s7: { q: 'Where do deals stall?', good: 'At legal review: 11 days, three times longer than any other stage.', rush: 'in the middle somewhere', gap: 'The report has no week over week change.', fix: 'Show this week against last week.', tool: 'Looker' },
    s8: { q: 'How accurate is the agent on deal fields?', good: '96% on 200 calls, checked by hand.', rush: 'very accurate', gap: 'No one checks the agent’s output.', fix: 'Spot check ten calls a week.', tool: 'Gong' },
    s9: { q: 'What happens to a lead with no rep in its region?', good: 'It goes to the regional lead within five minutes.', rush: 'not sure yet', gap: 'Fleet leads over 500 cars skip routing.', fix: 'Send those straight to the fleet team.', tool: 'Salesforce' },
    s10: { q: 'Where do new merchants drop off?', good: 'Menu upload. 38% never finish it.', rush: 'early on', gap: 'The follow up goes to every merchant.', fix: 'Send it only to the ones stuck at menu upload.', tool: 'n8n' }
  };

  /* the three runs. b = result (1 Below, 2 Meeting, 3 Exceeding, 4 Exceptional). The coach turns the worst run around. */
  var G = { c: 'good', q: 'caught', i: 'good', s: 'fast' };
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
    l: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
    r: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg>',
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3"/></svg>',
    folio: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 3 17 6.5 10 10 3 6.5z"/><path d="m3 10 7 3.5 7-3.5M3 13.5 10 17l7-3.5"/></svg>',
    jobs: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="6" width="14" height="10.5" rx="2.5"/><path d="M7.5 6V4.8c0-.7.5-1.3 1.2-1.3h2.6c.7 0 1.2.6 1.2 1.3V6"/></svg>'
  };
  function readIcon(k) { return '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">' + READS[k].i + '</svg>'; }

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
  function rolesAt(L) {
    var r = D.rolesAt(DREAM, L).slice();
    r.sort(function (a, b) { return (b.target ? 1 : 0) - (a.target ? 1 : 0); });
    return r;
  }
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
  function places(rs) {
    var c = {};
    rs.forEach(function (r) { var p = /^Remote/.test(r.loc) ? 'Remote' : r.loc; c[p] = (c[p] || 0) + 1; });
    return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 3);
  }
  function short(p) {
    if (!p || /not posted/.test(p) || /month|hour/.test(p)) return /month|hour/.test(p || '') ? p : '';
    var m = p.match(/^(CA)?\$([\d,]+)( to ([\d,]+))?/);
    if (!m) return p;
    var k = function (s) { return Math.round(+s.replace(/,/g, '') / 1000) + 'k'; };
    return (m[1] || '') + '$' + k(m[2]) + (m[4] ? ' to ' + k(m[4]) : '');
  }

  /* ---------- the run's state ---------- */
  var ST;
  function reset(caseKey) {
    ST = { k: caseKey, pts: 0, done: 0, cur: 0, stage: 0, notes: [], live: [], r: {} };
    RK.forEach(function (k) { ST.r[k] = { v: 50, seen: false, last: null, d: 0 }; });
  }
  function nudge(k, dv, last) {
    var R = ST.r[k]; R.v = Math.max(12, Math.min(95, R.v + dv)); R.seen = true; R.d = dv; if (last) { R.last = last; if (last.saw) R.saw = last; else R.well = last; }
  }
  function tint(v) { return v < 40 ? ['#E07A45', 'rgba(224,122,69,.32)'] : v < 58 ? ['#F0B94D', 'rgba(240,185,77,.28)'] : v < 80 ? ['#4CC27A', 'rgba(76,194,122,.26)'] : ['#2FB866', 'rgba(47,184,102,.34)']; }
  function seenReads() { return RK.filter(function (k) { return ST.r[k].seen; }); }
  function think() {
    var lv = level(ST.pts), s = seenReads();
    if (lv >= 10) return 'You reached Level 10. GTM Engineer at OpenAI is open to you. Everything I flagged, you fixed.';
    if (!s.length) return 'I have not seen your work yet. Finish your first scenario and I will tell you what I see, the good and the gaps.';
    var by = s.slice().sort(function (a, b) { return ST.r[b].v - ST.r[a].v; }), top = by[0], low = by[by.length - 1];
    if (ST.r[low].v < 55) return READS[top].strong + ' ' + READS[low].weak + ' Fix that and your next review can pay double.';
    return READS[top].strong + ' ' + READS[by[1] || top].strong + ' Keep this up and Level ' + (lv + 1) + ' is close.';
  }
  function lift() {
    var lv = level(ST.pts); if (lv >= 10) return 'Nothing left to unlock. Keep your scenarios sharp for interviews.';
    var s = seenReads().sort(function (a, b) { return ST.r[a].v - ST.r[b].v; }), low = s[0] || 'comm', sc = D.SCENARIOS[ST.cur];
    var meet = level(ST.pts + 1000), exc = level(ST.pts + 2000);
    return READS[low].fix + ' at ' + esc(D.CO[sc.co]) + '. Meeting takes you to Level ' + meet + (exc > meet ? '. Exceeding takes you to Level ' + exc + '.' : '.');
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
  /* apply one beat. live = play it on screen (notes, the live card, the points); otherwise only the state moves */
  var QUIET = false;
  function apply(b, live) {
    QUIET = !live;
    var sc = D.SCENARIOS[b.i], t = TXT[sc.id], co = D.CO[sc.co], p = b.p, at;
    if (b.k === 'start') {
      ST.cur = b.i; ST.stage = 0;
      ST.live = []; say('sys', 'Kickoff · ' + sc.title + ' at ' + co); say('mgr', sc.ask, 500);
    }
    if (b.k === 'ask') {
      ST.stage = 1; at = co + ', kickoff';
      var good = p.comm === 'good';
      nudge('comm', good ? 8 : -10, good ? { well: 'You answered “' + t.q + '” in one clear line.', at: at, try: 'Keep answering with the number first.' } : { saw: '“' + t.rush + '”', at: at, try: '“' + t.good + '”' });
      {
        say('mgr', t.q);
        say('me', good ? t.good : t.rush, 1100, true);
        note(good ? 'praise' : 'nudge', good ? 'Clear answer to Jordan. That is what an Exceeding review sounds like.' : 'That reply to Jordan reads rushed.', good ? '' : t.good, at, 2100);
      }
    }
    if (b.k === 'work') {
      ST.stage = 2; at = co + ', stage 2';
      var caught = p.qual === 'caught';
      nudge('quality', caught ? 7 : -9, caught ? { well: 'You caught it before review: ' + t.fix.charAt(0).toLowerCase() + t.fix.slice(1), at: at, try: 'Keep checking once before you send.' } : { saw: t.gap, at: at, try: t.fix });
      {
        say('sys', ME.name + ' is building it in ' + t.tool + '.');
        note(caught ? 'praise' : 'heads', caught ? 'You found the gap before Jordan did and fixed it. Great work.' : 'Heads up: ' + t.gap + ' Jordan will catch it in review.', caught ? '' : t.fix, at, 700);
      }
    }
    if (b.k === 'check') {
      ST.stage = 3; at = co + ', stage 3';
      var asks = p.indep === 'asks', slow = p.speed === 'slow';
      nudge('indep', asks ? -9 : 6, asks ? { saw: 'You asked Jordan three times before you finished the stage.', at: at, try: 'Make the call, write down why, ask once at the end.' } : { well: 'You decided the rule yourself and said why.', at: at, try: 'Keep it. Say what you decided in one line.' });
      nudge('speed', slow ? -8 : 5, slow ? { saw: 'You ran 15 minutes over the time.', at: at, try: 'Ship a first version at the halfway mark, then improve it.' } : { well: 'You finished ahead of time.', at: at, try: 'Use the spare minutes to check your numbers.' });
      {
        if (asks) { say('me', 'quick q, which rule should I use?'); note('nudge', 'Third question to Jordan this stage. Make the call, then tell him why.', 'Make the call, write down why, ask once at the end.', at, 900); }
        else if (slow) { say('sys', 'Stage 3 is running long.'); note('nudge', 'You are 15 minutes over.', 'Ship a first version now, then improve it.', at, 600); }
        else { say('sys', 'Stage 3 sent to Jordan, ahead of time.'); note('praise', 'You made the call yourself and finished early. Exactly right.', '', at, 600); }
      }
    }
    if (b.k === 'review') {
      ST.stage = 4;
      var B = BANDS[p.b], before = level(ST.pts);
      ST.pts += B.pay; ST.done = b.i + 1;
      var after = level(ST.pts);
      {
        say('mgr', 'My review: ' + B.n + '.');
        gain(B.pay);
        var tl = CASES[ST.k].runs, nextSc = D.SCENARIOS[Math.min(b.i + 1, D.SCENARIOS.length - 1)];
        if (after > before) later(function () { levelUp(after); }, 700);
        if (b.i < tl.length - 1 && after < 10) {
          var msg = p.b <= 1 ? 'Below this time. It happens. Fix the one thing I flagged and the next one pays double.'
            : p.b >= 3 ? 'That is the work that gets hired. ' + (level(ST.pts + 2000) > after ? 'One more like this and Level ' + level(ST.pts + 2000) + ' opens.' : '')
            : 'Solid. ' + lowFix() + ' and the next review can be Exceeding.';
          note(p.b <= 1 ? 'nudge' : 'praise', msg, '', D.CO[nextSc.co] + ', next', after > before ? 2200 : 900);
        }
      }
    }
  }
  function lowFix() { var s = seenReads().sort(function (a, b) { return ST.r[a].v - ST.r[b].v; }); return READS[s[0] || 'comm'].fix; }

  /* ---------- the player ---------- */
  var P = { tl: [], i: 0, t: null, subs: [], playing: false, speed: 2, k: null, ended: false };
  function later(fn, ms) { if (QUIET) { fn(); return 0; } var id = setTimeout(fn, ms / P.speed); P.subs.push(id); return id; }
  function clearAll() { clearTimeout(P.t); P.subs.forEach(clearTimeout); P.subs = []; }
  function start(k) {
    clearAll(); reset(k);
    P.tl = timeline(k); P.i = 0; P.k = k; P.playing = true; P.ended = false;
    $('#toasts').innerHTML = ''; $('#live').hidden = false;
    S.read = null; S.seen = false;
    renderLevel(); renderCoach(); refresh(true);
    step();
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
    note('level', lv >= 10 ? 'Level 10 in ' + n + ' scenarios. GTM Engineer at OpenAI is open to you. Proud of this.' : 'Level ' + lv + ' after ' + n + ' scenarios.', '', 'The run', 300);
    say('sys', 'Level ' + lv + ' in ' + n + ' scenarios. ' + (lv >= 10 ? 'OpenAI is open.' : ''), 300);
    drawRun();
  }
  function togglePlay() {
    if (P.ended) { start(P.k); return; }
    P.playing = !P.playing;
    if (P.playing) step(); else clearTimeout(P.t);
    drawRun();
  }
  /* the screen before any run: the mid case after two scenarios, still */
  function still() {
    clearAll(); reset('mid'); P.k = null; P.playing = false; P.ended = false;
    timeline('mid').slice(0, 10).forEach(function (b) { apply(b, false); });
    ST.cur = 2; ST.stage = 0;
    renderLevel(); renderCoach(); refresh(true);
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
      }).join('') + '</div><div class="lv-st">' + [1, 2, 3, 4].map(function (n) { return '<i' + (ST.stage >= n ? ' class="on"' : '') + '></i>'; }).join('') + '</div>';
  }

  /* ---------- Navid's notes: short, while you work ---------- */
  function note(type, text, tryText, at, delay) {
    var go = function () {
      ST.notes.unshift({ type: type, text: text, try: tryText, at: at });
      if (QUIET) return;
      toast(type, text, tryText);
      if (!S.open || S.tab !== 'coach') { S.seen = false; }
      refresh();
    };
    if (delay) later(go, delay); else go();
  }
  var TYPE = { praise: 'Great work', nudge: 'Try this instead', heads: 'Heads up', level: 'Level up' };
  function toast(type, text, tryText, extra) {
    var box = $('#toasts'), el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = '<img src="' + COACH.img + '" alt=""><div><div class="h"><i></i>' + COACH.name + ' · ' + TYPE[type] + '</div><p>' + esc(text) + '</p>' +
      (tryText ? '<div class="try">' + esc(tryText) + '</div>' : '') + (extra || '') + '</div>';
    box.insertBefore(el, box.firstChild);
    while (box.children.length > 2) box.removeChild(box.lastChild);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, Math.max(2600, 5600 / P.speed));
  }
  function levelUp(L) {
    var n = D.BUCKET[L] || 0, rs = rolesAt(L), r0 = rs[0];
    if (!QUIET) { var hud = $('#hud'); hud.classList.remove('up'); hud.offsetWidth; hud.classList.add('up'); }
    var text = 'Level ' + L + '. ' + n + ' new roles' + (r0 ? ', including ' + D.CO[r0.co] + (/^Remote/.test(r0.loc) ? ', remote' : ' in ' + r0.loc) : '') + '.';
    ST.notes.unshift({ type: 'level', text: text, at: 'Level ' + L });
    if (QUIET) return;
    toast('level', text, '', circles(L, 5, 24));
    refresh();
  }
  function gain(n) { if (QUIET) return; var g = $('#gain'); g.innerHTML = '✦ +' + fmt(n); g.classList.remove('go'); g.offsetWidth; g.classList.add('go'); }

  /* ---------- the Level page ---------- */
  function renderLevel() {
    var h = '<div class="goal">' + logo('openai', 40) + '<span class="t"><b>GTM Engineer at OpenAI</b><span>Your goal · opens at Level 10</span></span></div>' +
      '<div class="far"><h2 id="lvH">Level 0</h2><div class="to"><b id="lvTo">10,000</b><span id="lvToS">skill points to go</span></div></div><div class="segs" id="segs">';
    for (var i = 1; i <= 10; i++) h += '<i' + (i === 10 ? ' class="goal-s"' : '') + '><b></b></i>';
    h += '</div><p class="pace" id="lvPace"></p><div class="next" id="lvNext"></div><div class="ladder">';
    for (var L = 1; L <= 10; L++) {
      var rs = rolesAt(L), n = D.BUCKET[L] || rs.length, top = payTop(rs), pl = places(rs);
      h += '<div class="rung" data-l="' + L + '"><button type="button" aria-expanded="false"><span class="nd"></span><span class="nm">Level ' + L + '</span>' + circles(L, 4, 26) + I.cv + '</button>' +
        '<div class="op"><div class="op-h"><b>' + n + ' roles</b><span>' + esc(OPENS[L]) + (top ? ' · pay up to $' + fmt(top) : '') + (pl.length ? ' · ' + pl.map(esc).join(', ') : '') + '</span></div>' +
        '<div class="op-roles">' + rs.slice(0, 3).map(function (r) {
          return '<div>' + logo(r.co, 28) + '<span class="t"><b>' + esc(r.title) + '</b><span>' + esc(D.CO[r.co]) + ' · ' + esc(r.loc) + (r.target ? ' · the job you want' : '') + '</span></span><span class="p">' + esc(short(r.pay)) + '</span></div>';
        }).join('') + '</div></div></div>';
    }
    h += '</div>';
    $('#pgLevel').innerHTML = h;
  }
  function updateLevel() {
    var lv = level(ST.pts), left = Math.max(0, 10000 - ST.pts), sc = D.SCENARIOS[ST.cur];
    $('#lvH').textContent = 'Level ' + lv;
    $('#lvTo').textContent = lv >= 10 ? 'Open' : fmt(left);
    $('#lvToS').textContent = lv >= 10 ? 'every role' : 'skill points to go';
    $$('#segs b').forEach(function (b, i) { var n = i + 1; b.style.width = (lv >= n ? 100 : n === lv + 1 ? (ST.pts - lv * 1000) / 10 : 0) + '%'; });
    $('#lvPace').textContent = lv >= 10 ? 'Every role is open to you.' : 'About ' + Math.max(1, Math.ceil(left / 2000)) + ' to ' + Math.ceil(left / 1000) + ' scenarios to go.';
    var nx = $('#lvNext');
    if (lv >= 10) nx.innerHTML = '<span class="kick">Done</span><p>GTM Engineer at OpenAI is open. <span>Apply from Jobs.</span></p>';
    else {
      var meet = level(ST.pts + 1000), exc = level(ST.pts + 2000);
      nx.innerHTML = '<span class="kick">Next · Level ' + (lv + 1) + ', ' + fmt((lv + 1) * 1000 - ST.pts) + ' skill points away</span>' +
        '<p>Finish ' + esc(D.CO[sc.co]) + ' at Meeting or better.<button class="q" type="button" data-pop="bands" aria-label="What Meeting means">?</button> <span>' +
        (lv + 1 === 10 ? 'OpenAI opens.' : exc > meet ? 'Exceeding takes you to Level ' + exc + '.' : '') + '</span></p>';
    }
    $$('.rung').forEach(function (r) {
      var L = +r.dataset.l, cls = L < lv ? 'past' : L === lv ? 'here' : L === 10 ? 'goal' : 'ahead';
      r.className = 'rung ' + cls + (S.rung === L ? ' open' : '');
      r.querySelector('.nm').innerHTML = 'Level ' + L + (L === lv ? '<span class="you">You</span>' : '');
    });
  }

  /* ---------- the Coach page, two versions ---------- */
  function renderCoach() {
    var h = '<div class="co-top"><span class="who"><img src="' + COACH.img + '" alt=""><span><b>' + COACH.name + '</b><em>Your coach</em></span></span><span class="livedot" id="coLive"><i></i><span></span></span></div>' +
      '<p class="think" id="think"></p>';
    if (S.v === 'a') {
      h += '<div class="glows" id="glows">' + RK.map(function (k) {
        return '<button class="gl" type="button" data-k="' + k + '" title="' + READS[k].n + '"><svg class="rg" viewBox="0 0 48 48"><circle class="tr" cx="24" cy="24" r="21" pathLength="100"/><circle class="ar" cx="24" cy="24" r="21" pathLength="100"/></svg>' + readIcon(k) + '</button>';
      }).join('') + '<span class="sp"></span><button class="q" type="button" data-pop="bands" aria-label="How Navid reads your work">?</button></div><div id="gd"></div>';
    } else {
      h += '<div class="ins" id="insWell"></div><div class="ins" id="insWork"></div>';
    }
    h += '<div class="notes" id="notes"></div><div class="lift"><span class="kick">Level up faster</span><p id="lift"></p></div>';
    if (S.v === 'b') {
      h += '<div class="cal"><h4><span>Live calibration</span><span>Only Navid sees this</span></h4>' + RK.map(function (k) {
        return '<div class="mt" data-k="' + k + '"><span>' + READS[k].n + '</span><div class="scale sm"><i class="ln"></i><i class="fl"></i><i class="bar"></i><i class="me"></i></div><b></b></div>';
      }).join('') + '</div>';
    }
    $('#pgCoach').innerHTML = h;
  }
  function updateCoach() {
    var th = $('#think'), t = think();
    if (th.textContent !== t) {
      if (th.textContent) { th.classList.add('swap'); setTimeout(function () { th.textContent = t; th.classList.remove('swap'); }, 220); }
      else th.textContent = t;
    }
    var lv = $('#coLive'), sc = D.SCENARIOS[Math.max(0, ST.done - 1)];
    lv.className = 'livedot' + (P.playing ? ' on' : '');
    lv.lastChild.textContent = P.playing ? 'Live' : ST.done ? 'After ' + D.CO[sc.co] : 'Day 1';
    if (S.v === 'a') {
      $$('.gl').forEach(function (g) {
        var R = ST.r[g.dataset.k], c = tint(R.v);
        g.style.setProperty('--v', R.seen ? (R.v / 100).toFixed(3) : 0);
        g.style.setProperty('--c', c[0]); g.style.setProperty('--g', R.seen ? c[1] : 'rgba(255,255,255,.05)');
        g.classList.toggle('unseen', !R.seen); g.classList.toggle('open', S.read === g.dataset.k);
        if (R.d && R.seen && P.playing && R._d !== R.v) { g.classList.remove('pulse'); g.offsetWidth; g.classList.add('pulse'); }
        R._d = R.v;
      });
      var gd = $('#gd');
      if (!S.read) gd.innerHTML = '';
      else {
        var k = S.read, R = ST.r[k], c = tint(R.v), L = (R.v < 58 ? R.saw || R.well : R.well || R.saw), body;
        if (!R.seen) body = '<h5>What I watch</h5><p>' + esc(READS[k].watch) + '</p><h5>Try this from day one</h5><blockquote class="try">' + esc(READS[k].first) + '</blockquote>';
        else if (L && L.saw) body = '<h5>What happened · ' + esc(L.at) + '</h5><blockquote>' + esc(L.saw) + '</blockquote><h5>Try this instead</h5><blockquote class="try">' + esc(L.try) + '</blockquote>';
        else body = '<h5>What you did well · ' + esc(L.at) + '</h5><p>' + esc(L.well) + '</p><h5>Try this to go higher</h5><blockquote class="try">' + esc(L.try) + '</blockquote>';
        var key = k + R.v + (L ? L.at + (L.saw || L.well) : '');
        if (gd.dataset.key !== key) {
          gd.dataset.key = key;
          gd.innerHTML = '<div class="gd"><div class="gd-h"><b>' + READS[k].n + '</b></div>' + scale(R, c, true) + body + '</div>';
        }
      }
    } else {
      var s = seenReads(), well = s.filter(function (k) { return ST.r[k].v >= 58; }).sort(function (a, b) { return ST.r[b].v - ST.r[a].v; }).slice(0, 2);
      var work = s.filter(function (k) { return ST.r[k].v < 58 && ST.r[k].saw; }).sort(function (a, b) { return ST.r[a].v - ST.r[b].v; }).slice(0, 2);
      $('#insWell').innerHTML = !s.length ? '<h4>What I will watch</h4>' + RK.slice(0, 2).map(function (k) { return '<div class="row"><span class="ic wk"></span><span><b>' + READS[k].watch + '</b><p>Try this from day one: ' + esc(READS[k].first) + '</p></span></div>'; }).join('')
        : well.length ? '<h4>Going well</h4>' + well.map(function (k) { var L = ST.r[k].well; return '<div class="row"><span class="ic ok">' + I.tick + '</span><span><b>' + READS[k].strong + '</b>' + (L && L.well ? '<p>' + esc(L.at) + ': ' + esc(L.well) + '</p>' : '') + '</span></div>'; }).join('') : '';
      $('#insWork').innerHTML = work.length ? '<h4>To work on</h4>' + work.map(function (k) { var L = ST.r[k].saw; return '<div class="row"><span class="ic wk"></span><span><b>' + READS[k].work + '</b>' + (L && L.saw ? '<p>' + esc(L.at) + ': ' + esc(L.saw) + '</p><blockquote class="try">' + esc(L.try) + '</blockquote>' : '') + '</span></div>'; }).join('') : '';
      $$('.cal .mt').forEach(function (m) {
        var R = ST.r[m.dataset.k], c = tint(R.v), sc2 = m.querySelector('.scale'), b = m.querySelector('b');
        sc2.style.setProperty('--c', c[0]);
        m.querySelector('.fl').style.width = (R.seen ? R.v : 0) + '%';
        m.querySelector('.me').style.left = (R.seen ? R.v : 0) + '%';
        m.querySelector('.me').style.opacity = R.seen ? 1 : 0;
        b.textContent = R.seen ? (R.d > 0 ? '+' : '') + R.d : '';
        b.className = R.d > 0 ? 'up' : R.d < 0 ? 'dn' : '';
      });
    }
    var nt = ST.notes;
    $('#notes').innerHTML = '<h4><span>From ' + COACH.name + '</span><span>' + (nt.length > 3 ? 'All ' + nt.length : '') + '</span></h4>' +
      (nt.length ? nt.slice(0, 3).map(function (n, i) { return '<div class="note ' + n.type + (i === 0 && P.playing ? ' fresh' : '') + '"><i></i><p>' + esc(n.text) + (n.try ? ' Try this: ' + esc(n.try) : '') + '<em>' + esc(n.at) + '</em></p></div>'; }).join('')
        : '<p class="none">Notes appear here while you work.</p>');
    $('#lift').innerHTML = lift();
  }
  function scale(R, c, big) {
    var v = R.seen ? R.v : 0;
    return '<div class="scale' + (big ? '' : ' sm') + '" style="--c:' + c[0] + '"><i class="ln"></i><i class="fl" style="width:' + v + '%"></i><i class="bar"><span>Meeting</span></i>' +
      (R.seen ? '<i class="me" style="left:' + v + '%"><span>You</span></i>' : '') + '</div>';
  }

  /* ---------- the chips, the world, the card, the capsule ---------- */
  function updateHud() {
    var lv = level(ST.pts), frac = lv >= 10 ? 1 : (ST.pts - lv * 1000) / 1000;
    $('#lvNum').textContent = 'L' + lv;
    $('#lvBar').style.width = Math.round(frac * 100) + '%';
    $('#meDot').classList.toggle('off', S.seen || !ST.notes.length && ST.done === 0);
    $('#hud').classList.toggle('lv', S.open && S.tab === 'level');
    $('#hud').classList.toggle('co', S.open && S.tab === 'coach');
  }
  var W = 3456, H = 1944, SW = 1440, SH = 862;
  function updateWorld() {
    var sc = D.SCENARIOS[ST.cur], p = D.PLACE[sc.co] || D.PLACE.zero, px = p[0] / 100 * W, py = p[1] / 100 * H;
    var ox = Math.min(0, Math.max(SW - W, 640 - px)), oy = Math.min(0, Math.max(SH - H, 470 - py));
    $('#world').style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    var pin = $('#pin');
    pin.style.left = px + 'px'; pin.style.top = py + 'px';
    if (pin.dataset.co !== sc.co) { pin.dataset.co = sc.co; pin.innerHTML = logo(sc.co, 26); }
  }
  function updateCard() {
    var sc = D.SCENARIOS[ST.cur], n = P.k ? CASES[P.k].runs.length : D.SCENARIOS.length, key = sc.id + ST.stage;
    var c = $('#card'); if (c.dataset.key === key) return; c.dataset.key = key;
    var rows = ST.stage ? [['Progress', ST.stage >= 4 ? 'Reviewed' : ST.stage + ' of 4 stages'], ['Pays up to', '<span class="st">✦</span>3,000'], ['Tools', esc(sc.tools.join(', '))]]
      : [['Time', 'about ' + sc.mins + ' min'], ['Pays up to', '<span class="st">✦</span>3,000'], ['Tools', esc(sc.tools.join(', '))]];
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
  function refresh() { updateHud(); updateWorld(); updateCard(); updateCapsule(); updateLevel(); updateCoach(); drawRun(); if (S.open) { caret(); } }

  /* ---------- the panel ---------- */
  var S = { tab: 'coach', open: true, rung: 0, read: null, seen: false, v: 'a' };
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('v') === 'b') S.v = 'b';
    var h = location.hash.slice(1);
    if (h === 'coach' || h === 'level') S.tab = h; else if (h === 'closed') S.open = false;
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
    var h0 = p.offsetHeight; fn(); p.style.height = 'auto';
    var h1 = p.offsetHeight; p.style.height = h0 + 'px'; p.offsetHeight; p.style.height = h1 + 'px';
    clearTimeout(p._t); p._t = setTimeout(function () { p.style.height = ''; }, 340);
  }
  function show(tab) {
    S.tab = tab; closePop();
    if (tab === 'coach') S.seen = true;
    $('#pgLevel').hidden = tab !== 'level'; $('#pgCoach').hidden = tab !== 'coach';
    var pg = tab === 'level' ? $('#pgLevel') : $('#pgCoach');
    pg.classList.remove('in'); pg.offsetWidth; pg.classList.add('in');
    $('#pnScroll').scrollTop = 0;
    updateHud(); caret();
  }
  function setOpen(o) {
    S.open = o; closePop();
    $('#panel').classList.toggle('open', o);
    $('#screen').classList.toggle('po', o);
    updateHud(); if (o) caret();
    try { history.replaceState(null, '', location.pathname + location.search + '#' + (o ? S.tab : 'closed')); } catch (e) {}
  }
  function openTab(t) {
    if (S.open && S.tab === t) { setOpen(false); return; }
    if (S.open) morph(function () { show(t); }); else { show(t); setOpen(true); }
    try { history.replaceState(null, '', location.pathname + location.search + '#' + t); } catch (e) {}
  }
  /* the scale explained, on top of the panel: nothing below it moves */
  function openPop(btn) {
    var pop = $('#pop'), pr = $('#panel').getBoundingClientRect(), br = btn.getBoundingClientRect(), s = scaleF();
    pop.innerHTML = '<h4>How ' + COACH.name + ' reads your work</h4><p>Every scenario ends with one of four results. The line shows where you are against Meeting, the bar to clear.</p>' +
      '<div class="bands">' + BANDS.slice(1).map(function (b) { return '<div' + (b.n === 'Meeting' ? ' class="bar"' : '') + '><b>' + b.n + '</b><span>✦ ' + fmt(b.pay) + '</span></div>'; }).join('') + '</div>';
    pop.style.top = ((br.bottom - pr.top) / s + 10) + 'px';
    pop.hidden = false;
  }
  function closePop() { var p = $('#pop'); if (p) p.hidden = true; }

  /* ---------- the prototype controls ---------- */
  function drawCases() {
    $('#cases').innerHTML = Object.keys(CASES).map(function (k) {
      return '<button type="button" data-case="' + k + '"' + (P.k === k ? ' class="on"' : '') + '><span class="pl"></span>Simulate ' + CASES[k].n.toLowerCase() + '</button>';
    }).join('');
    $('#variant').innerHTML = [['a', 'Coach A'], ['b', 'Coach B']].map(function (v) { return '<button type="button" data-v="' + v[0] + '"' + (S.v === v[0] ? ' class="on"' : '') + '>' + v[1] + '</button>'; }).join('');
  }
  function drawRun() {
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
  $('#chipMe img').src = COACH.img;
  $('#rail').innerHTML = '<button type="button" class="on" title="World">' + I.world + '</button><button type="button" title="Portfolio">' + I.folio + '</button><button type="button" title="Jobs">' + I.jobs + '</button>';
  $('#chipLv').addEventListener('click', function (e) { e.stopPropagation(); openTab('level'); });
  $('#chipMe').addEventListener('click', function (e) { e.stopPropagation(); openTab('coach'); });
  $('#panel').addEventListener('click', function (e) {
    e.stopPropagation();
    var qb = e.target.closest('[data-pop]');
    if (qb) { if ($('#pop').hidden) openPop(qb); else closePop(); return; }
    if (!e.target.closest('#pop')) closePop();
    var rb = e.target.closest('.rung>button');
    if (rb) { var L = +rb.parentNode.dataset.l; morph(function () { S.rung = S.rung === L ? 0 : L; $$('.rung').forEach(function (x) { var on = +x.dataset.l === S.rung; x.classList.toggle('open', on); x.firstChild.setAttribute('aria-expanded', on); }); }); return; }
    var gb = e.target.closest('.gl');
    if (gb) { morph(function () { S.read = S.read === gb.dataset.k ? null : gb.dataset.k; updateCoach(); }); }
  });
  $('#pnScroll').addEventListener('scroll', closePop, { passive: true });
  $('#screen').addEventListener('click', function () { if (S.open) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#pop').hidden) closePop(); else if (S.open) setOpen(false); } });
  $('#dev').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.case) { start(b.dataset.case); drawCases(); }
    if (b.dataset.v) { S.v = b.dataset.v; drawCases(); morph(function () { renderCoach(); updateCoach(); }); try { history.replaceState(null, '', location.pathname + (S.v === 'b' ? '?v=b' : '') + location.hash); } catch (err) {} }
    if (b.dataset.run === 'play') togglePlay();
    if (b.dataset.run === 'again') { start(P.k); }
    if (b.dataset.run === 'speed') { P.speed = P.speed === 1 ? 2 : P.speed === 2 ? 4 : 1; drawRun(); }
  });
  window.addEventListener('resize', function () { fit(); if (S.open) caret(); });

  fit(); drawCases(); still();
  $('#panel').classList.toggle('open', S.open); $('#screen').classList.toggle('po', S.open);
  show(S.tab); updateHud();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S.open) caret(); });
  try { var c0 = new URLSearchParams(location.search).get('case'); if (CASES[c0]) { start(c0); drawCases(); } } catch (e) {}
  window.__ready = true;
  window.__sim = { start: start, P: P, S: S, get ST() { return ST; } };
})();
