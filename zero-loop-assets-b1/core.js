/* Zero, three systems. One learner, one day, three systems that talk to each other.
   core.js = the data every site shares, the app shell, the prototype strip, the story player,
   Zero's face, the coach floater, the level and credits pills, and the wire (what crossed between systems). */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

  /* ================= data ================= */
  var SYS = [
    { n: 1, key: 'learn', name: 'Scenarios', verb: 'Do the work, build proof', c: 'var(--s1)', cbg: 'var(--s1bg)', hex: '#3E63DD', href: 'zero-loop-scenarios-b1.html' },
    { n: 2, key: 'grow', name: 'Levels & Coach', verb: 'Know where you stand, get better', c: 'var(--s2)', cbg: 'var(--s2bg)', hex: '#D4911C', href: 'zero-loop-levels-b1.html' },
    { n: 3, key: 'jobs', name: 'Jobs', verb: 'Get matched, apply, hear back', c: 'var(--s3)', cbg: 'var(--s3bg)', hex: '#8E4EC6', href: 'zero-loop-jobs-b1.html' }
  ];
  var HUB = 'zero-loop-b1.html';

  /* the app's five bands, its colour ramp, and what each pays (engineering owns the real engine; these are stand-ins) */
  var BANDS = [
    { name: 'Underperforming', short: 'Under', c: '#D06632', pay: 0 },
    { name: 'Below Expectations', short: 'Below', c: '#EBA640', pay: 500 },
    { name: 'Meeting Expectations', short: 'Meeting', c: '#EDBE52', pay: 1000 },
    { name: 'Exceeding Expectations', short: 'Exceeding', c: '#46A056', pay: 2000 },
    { name: 'Exceptional', short: 'Exceptional', c: '#18743C', pay: 3000 }
  ];
  /* what the learner sees after a scenario, and what the coach keeps in its head (never shown as a dashboard) */
  var SKILLS = ['Understanding', 'Quality', 'Communication', 'Independence'];
  var HEAD = ['Understanding', 'Quality', 'Communication', 'Independence', 'Speed', 'AI slop'];

  /* levels: you start at 0, 1,000 skill points a level, ten levels. open = roles open at that level (cumulative, stand-in counts) */
  var LEVELS = [
    { n: 0, open: 0, cos: [] },
    { n: 1, open: 24, cos: ['gong.io', 'calendly.com', 'webflow.com', 'loom.com', 'miro.com'] },
    { n: 2, open: 41, cos: ['airtable.com', 'clari.com', 'calendly.com'] },
    { n: 3, open: 58, cos: ['rippling.com', 'airtable.com', 'gong.io'] },
    { n: 4, open: 76, cos: ['ramp.com', 'brex.com', 'webflow.com'] },
    { n: 5, open: 95, cos: ['gong.io', 'clari.com', 'hubspot.com'] },
    { n: 6, open: 118, cos: ['vercel.com', 'retool.com', 'notion.so'] },
    { n: 7, open: 140, cos: ['attio.com', 'figma.com', 'stripe.com'] },
    { n: 8, open: 163, cos: ['datadoghq.com', 'linear.app', 'snowflake.com'] },
    { n: 9, open: 188, cos: ['anthropic.com', 'notion.so', 'stripe.com'] },
    { n: 10, open: 212, cos: ['apple.com', 'openai.com', 'google.com'] }
  ];

  /* credits: a reward currency. Skill points can only be earned in a scenario. */
  var CREDITS = { stage: 50, scenario: 150, level: 100, streak: 20, chest7: 100, invite: 100, start: 100 };

  var MAYA = {
    name: 'Maya Reyes', first: 'Maya', photo: A + 'maya.jpg', wants: 'GTM Engineer', city: 'Austin',
    focus: ['GTM Engineer', 'Revenue Operations', 'Sales Systems', 'Marketing Operations']
  };

  /* the one day every site tells: Tue 14 Oct */
  var DAY = {
    date: 'Tue 14 Oct',
    before: { pts: 2500, level: 2, credits: 340, streak: 3, done: 3, open: 41 },
    after: { pts: 4500, level: 4, credits: 710, streak: 4, done: 4, open: 76 },
    /* the scenario Maya picks today, and the one she leaves */
    pick: {
      co: 'Stripe', dom: 'stripe.com', title: 'Intent signal scoring', mins: 180, band: 3, pays: 2000,
      brief: 'Score accounts by buying intent for the sales team.',
      manager: { name: 'Dana Okafor', title: 'Head of GTM Systems', ini: 'DO', t: 't1' },
      tools: [['Snowflake', 'snowflake.com'], ['HubSpot', 'hubspot.com'], ['Clay', 'clay.com']],
      stages: ['Kickoff', 'Plan', 'Build', 'Present'],
      reads: [3, 3, 2, 3] /* Understanding, Quality, Communication, Independence */
    },
    alt: {
      co: 'Datadog', dom: 'datadoghq.com', title: 'Account research agent', mins: 150, pays: 3000,
      brief: 'Brief every rep on an account before the call.',
      tools: [['Claude', 'anthropic.com'], ['Salesforce', 'salesforce.com'], ['Slack', 'slack.com']]
    },
    /* the road so far, and what is ahead */
    road: [
      { co: 'HubSpot', dom: 'hubspot.com', title: 'Inbound lead router', band: 2, pts: 1000, done: true },
      { co: 'Notion', dom: 'notion.so', title: 'Enrichment waterfall', band: 1, pts: 500, done: true },
      { co: 'Shopify', dom: 'shopify.com', title: 'Outbound agent with evals', band: 2, pts: 1000, done: true },
      { co: 'Stripe', dom: 'stripe.com', title: 'Intent signal scoring', today: true },
      { co: 'Figma', dom: 'figma.com', title: 'Product qualified lead score' },
      { co: 'Slack', dom: 'slack.com', title: 'Call notes agent' },
      { co: 'Canva', dom: 'canva.com', title: 'CRM data model' },
      { co: 'Zendesk', dom: 'zendesk.com', title: 'Renewal risk agent' },
      { co: 'Twilio', dom: 'twilio.com', title: 'Enrichment pipeline' },
      { co: 'Okta', dom: 'okta.com', title: 'Meeting prep agent' }
    ],
    coach: {
      morning: { think: 'Your builds are strong. Your updates come late.', need: 'One update to your manager before she asks.' },
      during: { say: 'That read rushed. Your manager reads every word.', try: 'Full sentences: what, by when, and why.' },
      better: { say: 'That one was clear. Keep doing that.', try: 'Same again on the next update.', good: true },
      evening: { think: 'Your updates landed before Dana asked. That is the habit.', need: 'Make one decision alone before you ask.' }
    }
  };

  /* how the coach talks. Per read: what it watched, a nudge when she is below the bar, praise when she is above it.
     It speaks after the fact, on a pattern (not one slip), about one thing at a time, and never grades the work. */
  var COACH = [
    { key: 'Communication', watches: ['Messages to the manager', 'Updates before asked', 'Full sentences'],
      low: { saw: 'Second short reply to Dana today', say: 'That read rushed. Dana reads every word you send.', try: 'Say what, by when, and why. Scoring plan by 10am tomorrow, three signals and why.' },
      high: { saw: 'Updated Dana before she asked', say: 'You told Dana where you were before she asked. That is how trust gets built.', try: 'One update at the end of every stage.' } },
    { key: 'Independence', watches: ['Questions asked', 'Answers already in the brief', 'Calls made alone'],
      low: { saw: '4 questions in 20 minutes, 2 answered in the brief', say: 'Two of your questions were already in the brief.', try: 'Read the brief first, then ask the one thing it does not say.' },
      high: { saw: 'Set the weights herself and said why', say: 'You made the call on the weights and explained it. That is what a lead does.', try: 'Decide first, then share your reasoning.' } },
    { key: 'Quality', watches: ['Goals met', 'Checks before sending', 'Fixes after feedback'],
      low: { saw: 'Sent with 2 of 3 goals met', say: 'The top 50 list is missing. Dana asked for three things.', try: 'Check the brief line by line before you send.' },
      high: { saw: 'Tested the model on last quarter before sending', say: 'You tested it on last quarter before sending. Right the first time.', try: 'Test before you ship, every time.' } },
    { key: 'Speed', watches: ['Time per stage', 'Time to first draft', 'Stalls'],
      low: { saw: 'Plan took 2 h 40 m, most take about 1 h', say: 'The plan took close to three hours. Most people send it in one.', try: 'Give it 45 minutes, then send what you have.' },
      high: { saw: 'Build done in 70 minutes', say: 'Build done in 70 minutes and it still holds up.', try: 'Same pace, same checks.' } },
    { key: 'Understanding', watches: ['Proof of understanding answers', 'Why behind choices'],
      low: { saw: 'Guessed on why seats beat page visits', say: 'Your answer on seats added was a guess.', try: 'Say in one sentence why it beats page visits.' },
      high: { saw: 'Explained the trade off without notes', say: 'You explained the trade off without notes. You get it.', try: 'Keep saying the why out loud.' } },
    { key: 'AI slop', watches: ['Pasted AI text', 'Unchecked AI output'],
      low: { saw: 'Pasted a long AI paragraph into the chat', say: 'That message reads like AI wrote it. Dana will notice.', try: 'Let AI draft it, then cut it to three lines in your own words.' },
      high: { saw: 'Used AI for the SQL and checked every line', say: 'Good use of AI on the SQL. You checked every line.', try: 'AI for the draft, you for the judgment.' } }
  ];
  var COACH_RULES = ['After the fact, never blocks', 'A pattern, not one slip', 'One thing at a time', 'Silent when on track', 'Never grades the work', 'No chat'];

  /* roles the agents found. lvl = the level that opens it. fit: 'fire' strong, 'up' good, '' plain */
  function R(id, title, co, dom, lvl, fit, pay, mode) { return { id: id, title: title, co: co, dom: dom, lvl: lvl, fit: fit || '', pay: pay || '', mode: mode || 'Remote' }; }
  var ROLES = [
    R('ramp-gtm', 'GTM Engineer', 'Ramp', 'ramp.com', 4, 'fire', '$105k to $135k'),
    R('gong-ai', 'AI Automation Specialist', 'Gong', 'gong.io', 3, 'fire', '$98k to $125k'),
    R('webflow-rev', 'RevOps Engineer', 'Webflow', 'webflow.com', 4, 'fire', '$100k to $128k'),
    R('brex-out', 'GTM Engineer, Outbound', 'Brex', 'brex.com', 4, 'up', '$102k to $130k', 'New York'),
    R('airtable-ra', 'Revenue Operations Analyst', 'Airtable', 'airtable.com', 2, 'up', '$85k to $105k'),
    R('clari-data', 'Data Analyst, GTM', 'Clari', 'clari.com', 2, 'up', '$88k to $110k', 'Hybrid'),
    R('calendly-ss', 'Sales Systems Analyst', 'Calendly', 'calendly.com', 2, 'fire', '$82k to $100k'),
    R('rippling-so', 'Sales Strategy and Operations Analyst', 'Rippling', 'rippling.com', 3, 'up', '$90k to $112k', 'San Francisco'),
    R('loom-cs', 'Customer Success Operations Analyst', 'Loom', 'loom.com', 1, '', '$78k to $95k'),
    R('miro-pls', 'Product Led Sales Analyst', 'Miro', 'miro.com', 1, 'up', '$80k to $98k'),
    R('webflow-mo', 'Marketing Operations Analyst', 'Webflow', 'webflow.com', 1, 'up', '$76k to $94k'),
    R('gong-sdr', 'Sales Development Representative', 'Gong', 'gong.io', 1, '', '$58k to $70k'),
    R('calendly-dd', 'Deal Desk Analyst', 'Calendly', 'calendly.com', 2, '', '$75k to $92k'),
    R('hubspot-mo', 'Marketing Operations Specialist', 'HubSpot', 'hubspot.com', 2, 'up', '$80k to $96k'),
    R('zapier-gtm', 'GTM Automation Engineer', 'Zapier', 'zapier.com', 3, 'fire', '$95k to $120k'),
    R('vercel-gtm', 'GTM Engineer', 'Vercel', 'vercel.com', 6, 'fire', '$110k to $140k'),
    R('retool-ae', 'Analytics Engineer, Revenue', 'Retool', 'retool.com', 6, 'up', '$115k to $145k'),
    R('attio-se', 'Solutions Engineer', 'Attio', 'attio.com', 7, 'up', '$120k to $150k', 'London'),
    R('linear-ge', 'Growth Engineer', 'Linear', 'linear.app', 8, 'fire', '$130k to $165k'),
    R('openai-gtm', 'GTM Systems Engineer', 'OpenAI', 'openai.com', 10, 'fire', '$170k to $220k', 'San Francisco'),
    R('apple-so', 'Sales Operations Engineer', 'Apple', 'apple.com', 10, 'up', '$160k to $205k', 'Cupertino')
  ];

  /* where her applications stand this morning */
  var APPS = [
    { id: 'gong-ai', state: 'connected', when: 'Mon', note: 'Noa replied by email' },
    { id: 'airtable-ra', state: 'connected', when: 'Fri', note: 'Asked for a call' },
    { id: 'calendly-ss', state: 'applied', when: '2 days ago' },
    { id: 'clari-data', state: 'applied', when: '3 days ago' },
    { id: 'hubspot-mo', state: 'applied', when: '4 days ago' },
    { id: 'miro-pls', state: 'applied', when: '6 days ago' },
    { id: 'webflow-mo', state: 'applied', when: '8 days ago' },
    { id: 'rippling-so', state: 'applied', when: '12 days ago' },
    { id: 'calendly-dd', state: 'applied', when: '14 days ago' },
    { id: 'loom-cs', state: 'lost', when: '3 weeks ago', note: 'No reply in 21 days' },
    { id: 'gong-sdr', state: 'lost', when: '2 weeks ago', note: 'Said no by email' },
    { id: 'zapier-gtm', state: 'lost', when: 'Last week', note: 'Role closed' }
  ];

  /* ================= helpers ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function role(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return null; }
  function levelOf(pts) { return Math.min(10, Math.floor(pts / 1000)); }
  function bandOf(i) { return BANDS[i]; }

  function logo(dom, size, cls) {
    var s = size || 32;
    return '<span class="lg ' + (cls || '') + '" style="--l:' + s + 'px"><img alt="" loading="lazy" src="https://www.google.com/s2/favicons?domain=' + esc(dom) + '&sz=128"></span>';
  }
  function stack(doms, size, more) {
    return '<span class="stack" style="--l:' + (size || 24) + 'px">' + doms.map(function (d) { return logo(d, size || 24, 'round'); }).join('') + (more ? '<span class="more">+' + more + '</span>' : '') + '</span>';
  }
  function av(p, size) {
    var s = size || 32;
    if (p === 'maya' || (p && p.photo)) return '<span class="av" style="--a:' + s + 'px"><img alt="" src="' + MAYA.photo + '"></span>';
    return '<span class="av ' + (p.t || 't1') + '" style="--a:' + s + 'px;font-size:' + Math.max(11, Math.round(s * .34)) + 'px">' + esc(p.ini) + '</span>';
  }
  function bands(i) { return '<span class="bands on' + i + '"><i></i><i></i><i></i><i></i><i></i></span>'; }
  function zero(size, state) { return '<span class="zf" data-zero="' + (state || 'default') + '" style="--z:' + (size || 40) + 'px" role="img" aria-label="Zero"><i class="zff"></i></span>'; }

  var IC = {
    play: '<svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 16 16"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    redo: '<svg viewBox="0 0 16 16"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.8v2.6h2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7m0-7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 16 16"><rect x="3.5" y="7" width="9" height="6.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 16 16"><path d="M8 13.2S2.6 10 2.6 6.2A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.4 1.5C13.4 10 8 13.2 8 13.2z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    heartf: '<svg viewBox="0 0 16 16"><path d="M8 13.2S2.6 10 2.6 6.2A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.4 1.5C13.4 10 8 13.2 8 13.2z" fill="#E5484D" stroke="#E5484D" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 16 16"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mic: '<svg viewBox="0 0 16 16"><rect x="5.6" y="2" width="4.8" height="8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 16 16"><path d="M8 13V3.5M4 7.5l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fire: '<span aria-label="Strong fit" role="img">🔥</span>',
    up: '<span aria-label="Good fit" role="img">👍</span>'
  };

  /* ================= wire: what crossed between systems ================= */
  var wireLog = [];
  function wire(o) {
    /* o = {to: 1|2|3} or {from: 1|2|3}, text */
    var s = SYS[(o.to || o.from) - 1], box = $('.zs-wire');
    wireLog.push({ at: story.clock || '', dir: o.to ? 'to' : 'from', sys: s.n, text: o.text });
    if (!box) return;
    $$('.wchip', box).forEach(function (c) { c.remove(); });
    var c = el('<span class="wchip" style="--c:' + s.c + ';--cbg:' + s.cbg + '"><span class="wd"><i></i>' + (o.to ? 'To ' : 'From ') + esc(s.name) + '</span><b>' + esc(o.text) + '</b></span>');
    box.appendChild(c);
    clearTimeout(wire.t); wire.t = setTimeout(function () { c.classList.add('old'); }, 7000);
  }

  /* ================= shell ================= */
  var WORD = '';
  function wordmark(cls) { return WORD ? WORD.replace('<svg', '<svg class="' + (cls || '') + '"') : '<b class="' + (cls || '') + '">zero</b>'; }
  function ringSvg(pts) {
    var into = (pts % 1000) / 1000, L = 2 * Math.PI * 9;
    if (pts >= 10000) into = 1;
    return '<svg class="lring" viewBox="0 0 22 22"><circle class="rt" cx="11" cy="11" r="9"/><circle class="rv" cx="11" cy="11" r="9" stroke-dasharray="' + L.toFixed(2) + '" stroke-dashoffset="' + (L * (1 - into)).toFixed(2) + '" transform="rotate(-90 11 11)"/></svg>';
  }
  var me = { pts: DAY.before.pts, credits: DAY.before.credits };
  function pillHTML() {
    return '<button class="pill zs-cr" aria-label="Credits"><span class="coin"></span><span class="v">' + n(me.credits) + '</span></button>' +
      '<button class="pill zs-lv" aria-label="Your level">' + ringSvg(me.pts) + '<span>Level <span class="v">' + levelOf(me.pts) + '</span></span></button>' +
      '<span class="zs-me">' + av('maya', 34) + '</span>';
  }

  function shell(o) {
    /* o = {sys: 0..3, tab: 'learn'|'jobs'|'', level: true (level pill pressed), coach: true, title} */
    o = o || {};
    var root = document.body;
    root.innerHTML =
      '<div class="zs">' +
      '<div class="zs-strip"><div class="zs-strip-l"><nav class="zs-sys" aria-label="The three systems">' +
      '<a href="' + HUB + '"' + (o.sys === 0 ? ' class="on"' : '') + ' aria-label="How the three connect">' + wordmark('zl') + '<span class="nm">Map</span></a>' +
      SYS.map(function (s) { return '<a href="' + s.href + '" style="--c:' + s.c + '"' + (o.sys === s.n ? ' class="on"' : '') + '><i class="sd"></i><span class="nm">' + s.n + ' ' + esc(s.name) + '</span></a>'; }).join('') +
      '</nav></div>' +
      (o.sys ? '<div class="zs-play"><button class="ib zs-prev" aria-label="Back">' + IC.prev + '</button><button class="ib zs-pp" aria-label="Pause">' + IC.pause + '</button><span class="tm">' + DAY.date + '</span><span class="ct"></span><button class="ib zs-next" aria-label="Next">' + IC.next + '</button></div>' : '<div></div>') +
      '<div class="zs-strip-r"><div class="zs-wire"></div>' + (o.sys ? '<button class="zs-speed" aria-label="Speed">1x</button><button class="ib zs-restart" aria-label="Start over">' + IC.redo + '</button>' : '') + '<span class="zs-stamp">b1</span></div></div>' +
      '<div class="zs-stage"><div class="zs-sheet">' +
      (o.bare ? '' : '<header class="zs-top"><div class="zs-top-l">' + wordmark('zlogo') + '</div>' +
        '<nav class="tabs" aria-label="Zero"><button data-tab="learn"' + (o.tab === 'learn' ? ' class="on"' : '') + '>Learn</button><button data-tab="jobs"' + (o.tab === 'jobs' ? ' class="on"' : '') + '>Jobs</button></nav>' +
        '<div class="zs-top-r">' + pillHTML() + '</div></header>') +
      '<main class="zs-body" id="body"></main>' +
      (o.coach ? '<div class="coachf"><div class="coach-notes"></div><button class="coach-btn" aria-label="Your coach">' + zero(40) + '</button></div>' : '') +
      '</div></div></div>';
    if (o.level) { var lv = $('.zs-lv'); if (lv) lv.classList.add('on'); }
    $$('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-tab');
        if (t === 'learn' && o.sys !== 1) location.href = SYS[0].href;
        if (t === 'jobs' && o.sys !== 3) location.href = SYS[2].href;
      });
    });
    var lvb = $('.zs-lv'); if (lvb && o.sys !== 2) lvb.addEventListener('click', function () { location.href = SYS[1].href; });
    var cb = $('.coach-btn'); if (cb) cb.addEventListener('click', function () { coach.toggle(); });
    mountZero();
    return $('#body');
  }

  /* level and credits pills: the Levels system shows up in every screen through these two */
  var pill = {
    set: function (pts, animate) {
      var was = levelOf(me.pts); me.pts = pts;
      var b = $('.zs-lv'); if (!b) return;
      var ring = $('.lring', b); if (ring) ring.outerHTML = ringSvg(pts);
      var v = $('span.v', b); if (v) v.textContent = levelOf(pts);
      if (animate || levelOf(pts) !== was) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    },
    credits: function (c, animate) {
      me.credits = c; var b = $('.zs-cr'); if (!b) return;
      var v = $('span.v', b); if (v) v.textContent = n(c);
      if (animate) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    },
    me: me
  };

  /* ================= the coach floater ================= */
  var coach = {
    say: function (o) {
      /* o = {say, try, good} : a note after the fact, never a block */
      var box = $('.coach-notes'); if (!box) return null;
      $$('.cnote', box).forEach(function (x) { x.remove(); });
      var c = el('<div class="cnote' + (o.good ? ' good' : '') + '" role="status"><div class="ch">' + zero(22, o.good ? 'working' : 'default') + 'Coach</div><p>' + esc(o.say) + '</p>' + (o.try ? '<div class="try"><b>' + (o.good ? 'Keep' : 'Try') + '</b> ' + esc(o.try) + '</div>' : '') + '<button class="cx" aria-label="Close">' + IC.x + '</button></div>');
      box.appendChild(c); mountZero();
      $('.cx', c).addEventListener('click', function () { coach.hide(); });
      var d = $('.coach-btn .dot'); if (!d) { var b = $('.coach-btn'); if (b) b.insertAdjacentHTML('beforeend', '<i class="dot"></i>'); }
      return c;
    },
    hide: function () { $$('.cnote,.ccard', $('.coach-notes') || document).forEach(function (c) { c.classList.add('out'); setTimeout(function () { c.remove(); }, 360); }); var d = $('.coach-btn .dot'); if (d) d.remove(); },
    card: function (o) {
      /* o = {think, need} */
      var box = $('.coach-notes'); if (!box) return null;
      $$('.cnote,.ccard', box).forEach(function (x) { x.remove(); });
      var c = el('<div class="ccard"><div class="ch">' + zero(30) + '<div><b>Coach</b><br><span>With you across Zero</span></div></div>' +
        '<div class="cb"><div class="cl">What I think so far</div><p>' + esc(o.think) + '</p></div>' +
        '<div class="cb need"><div class="cl">What I need to see</div><p>' + esc(o.need) + '</p></div></div>');
      box.appendChild(c); mountZero(); return c;
    },
    toggle: function () { var box = $('.coach-notes'); if (box && box.children.length) coach.hide(); else coach.card(coach.last || DAY.coach.morning); },
    last: null
  };

  /* ================= motion helpers ================= */
  function count(node, from, to, ms, fmt) {
    return new Promise(function (res) {
      var t0 = performance.now(), d = (ms || 900) / story.speed;
      (function f(t) {
        var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
        node.textContent = (fmt || n)(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  /* send a small chip from one element to another (points to the level pill, a role to the tracker) */
  function fly(fromEl, toEl, html, ms) {
    return new Promise(function (res) {
      if (!fromEl || !toEl) return res();
      var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      var f = el('<div class="fly">' + html + '</div>'); document.body.appendChild(f);
      var w = f.offsetWidth, h = f.offsetHeight;
      var x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2, x1 = b.left + b.width / 2 - w / 2, y1 = b.top + b.height / 2 - h / 2;
      var an = f.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 },
        { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 60) + 'px) scale(1.05)', opacity: 1, offset: .55 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.6)', opacity: .2 }
      ], { duration: (ms || 900) / story.speed, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
      an.onfinish = function () { f.remove(); res(); };
    });
  }

  /* ================= the story player ================= */
  /* A site is a list of beats. Each beat has:
       at:    the time on the strip ("9:40 AM")
       enter: function () -> draws the beat's first frame from nothing (so any beat can be opened directly)
       play:  async function (s) -> animates it. Use s.wait, s.press, s.type, s.alive.
       hold:  ms to rest on the last frame before the next beat (default 2400)
     The player runs by itself. Pause, back and next live in the strip; Space and the arrow keys work too. */
  var story = { beats: [], i: 0, paused: false, speed: 1, tok: 0, clock: '' };
  function Stopped() { this.stopped = true; }
  function mkS(tok) {
    var s = {
      alive: function () { if (tok !== story.tok) throw new Stopped(); return true; },
      wait: function (ms) {
        return new Promise(function (res, rej) {
          var left = ms / story.speed, last = performance.now();
          (function t() {
            if (tok !== story.tok) return rej(new Stopped());
            var now = performance.now(); if (!story.paused) left -= (now - last); last = now;
            if (left <= 0) res(); else setTimeout(t, 40);
          })();
        });
      },
      /* wait for the visitor to press el, or press it for them after ms. Resolves either way. */
      press: function (node, ms) {
        return new Promise(function (res, rej) {
          if (!node) return res();
          var done = false;
          function go(byHand) { if (done) return; done = true; node.removeEventListener('click', h); if (!byHand) { node.classList.add('press'); setTimeout(function () { node.classList.remove('press'); }, 180); } setTimeout(res, 160); }
          function h() { go(true); }
          node.addEventListener('click', h);
          s.wait(ms == null ? 2200 : ms).then(function () { go(false); }, function (e) { done = true; node.removeEventListener('click', h); rej(e); });
        });
      },
      /* type into an input or a div, one character at a time */
      type: function (node, text, cps) {
        var i = 0, per = 1000 / (cps || 34);
        return new Promise(function (res, rej) {
          (function t() {
            if (tok !== story.tok) return rej(new Stopped());
            if (story.paused) return setTimeout(t, 60);
            i++; var v = text.slice(0, i);
            if ('value' in node && node.tagName !== 'DIV') node.value = v; else node.textContent = v;
            if (i < text.length) setTimeout(t, per / story.speed); else res();
          })();
        });
      },
      tok: tok
    };
    return s;
  }
  function setClock() {
    var b = story.beats[story.i]; story.clock = b && b.at || '';
    var tm = $('.zs-play .tm'); if (tm) tm.textContent = DAY.date + (story.clock ? ' · ' + story.clock : '');
    var ct = $('.zs-play .ct'); if (ct) ct.textContent = (story.i + 1) + ' / ' + story.beats.length;
    try { history.replaceState(null, '', '#' + (story.i + 1)); } catch (e) {}
  }
  function go(i) {
    if (i < 0 || i >= story.beats.length) return;
    story.tok++; story.i = i; var tok = story.tok, b = story.beats[i];
    setClock();
    $$('.zs-wire .wchip').forEach(function (c) { c.remove(); });
    if (story.onBeat) story.onBeat(i, b);
    try { b.enter && b.enter(); } catch (e) { console.error(e); }
    mountZero();
    var s = mkS(tok);
    Promise.resolve().then(function () { return b.play ? b.play(s) : null; }).then(function () {
      if (tok !== story.tok) return;
      return s.wait(b.hold == null ? 2400 : b.hold).then(function () { if (tok === story.tok && story.i < story.beats.length - 1) go(story.i + 1); else if (tok === story.tok) setPaused(true); });
    }).catch(function (e) { if (!(e instanceof Stopped)) console.error(e); });
  }
  function setPaused(p) {
    story.paused = p; var b = $('.zs-pp');
    if (b) { b.innerHTML = p ? IC.play : IC.pause; b.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
  }
  function run(beats, opts) {
    story.beats = beats; opts = opts || {}; story.onBeat = opts.onBeat;
    var pp = $('.zs-pp'), pv = $('.zs-prev'), nx = $('.zs-next'), rs = $('.zs-restart'), sp = $('.zs-speed');
    if (pp) pp.addEventListener('click', function () { if (story.i === story.beats.length - 1 && story.paused) { setPaused(false); go(0); } else setPaused(!story.paused); });
    if (pv) pv.addEventListener('click', function () { setPaused(false); go(Math.max(0, story.i - 1)); });
    if (nx) nx.addEventListener('click', function () { setPaused(false); go(Math.min(story.beats.length - 1, story.i + 1)); });
    if (rs) rs.addEventListener('click', function () { setPaused(false); go(0); });
    if (sp) sp.addEventListener('click', function () { story.speed = story.speed === 1 ? 1.5 : story.speed === 1.5 ? 2 : 1; sp.textContent = story.speed + 'x'; });
    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === ' ') { e.preventDefault(); setPaused(!story.paused); }
      if (e.key === 'ArrowRight') { setPaused(false); go(Math.min(story.beats.length - 1, story.i + 1)); }
      if (e.key === 'ArrowLeft') { setPaused(false); go(Math.max(0, story.i - 1)); }
    });
    var h = parseInt((location.hash || '').slice(1), 10), q = new URLSearchParams(location.search);
    var start = h > 0 && h <= beats.length ? h - 1 : 0;
    if (q.get('still') === '1') setPaused(true);
    go(start);
  }

  /* ================= Zero's face: the plush bot avatar, mounted into every .zf ================= */
  var LV = null;
  function mountZero() {
    if (!LV) return;
    $$('.zf:not(.lv)').forEach(function (z) {
      try {
        var size = parseFloat(getComputedStyle(z).getPropertyValue('--z')) || z.offsetWidth || 40;
        var st = z.getAttribute('data-zero') || 'default';
        var host = document.createElement('span'); host.className = 'zfh'; z.appendChild(host);
        LV.createRoot(host).render(LV.React.createElement(LV.BotAvatar, Object.assign({}, LV.FUR, LV.BOT, { size: Math.round(size), state: st === 'still' ? 'default' : st, paused: st === 'still', interactive: false, 'aria-hidden': true })));
        z.classList.add('lv');
      } catch (e) { /* the drawn face stays */ }
    });
  }
  function bootZero(x) {
    try {
      if (x.botAvatarPresets && x.botAvatarPresets.circle) x.botAvatarPresets.circle.faceScale = 1.3;
      LV = {
        React: x.React, createRoot: x.createRoot, BotAvatar: x.BotAvatar,
        FUR: { shading: 'fabric', shadow: .18, highlight: 1.2, lightFront: 78, rim: 2, spread: 2.5, furLength: .75, furFuzz: .85, furClumps: .15, turn: .4, jumpEvery: 14, theme: 'light' },
        BOT: { type: 'circle', color: '#38C674', ink: '#FFFFFF', brightness: 1, saturation: 1.15 }
      };
      mountZero();
      new MutationObserver(function () { mountZero(); }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { LV = null; }
  }
  /* the wordmark, inlined so it takes the ink colour */
  function loadWord() {
    return fetch(A + 'zero-wordmark.svg').then(function (r) { return r.text(); }).then(function (t) { WORD = t.replace(/<\?xml[^>]*>/, ''); }).catch(function () {});
  }

  window.ZS = {
    A: A, COACH: COACH, COACH_RULES: COACH_RULES, SYS: SYS, HUB: HUB, BANDS: BANDS, SKILLS: SKILLS, HEAD: HEAD, LEVELS: LEVELS, CREDITS: CREDITS, MAYA: MAYA, DAY: DAY, ROLES: ROLES, APPS: APPS,
    $: $, $$: $$, esc: esc, n: n, el: el, role: role, levelOf: levelOf, bandOf: bandOf,
    logo: logo, stack: stack, av: av, bands: bands, zero: zero, IC: IC, wordmark: wordmark,
    shell: shell, pill: pill, coach: coach, wire: wire, wireLog: wireLog, count: count, fly: fly,
    run: run, story: story, go: go, setPaused: setPaused, bootZero: bootZero, mountZero: mountZero, loadWord: loadWord
  };
})();
