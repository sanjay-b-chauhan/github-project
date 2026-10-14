/* Zero, the whole way to a job. One learner, three cases (best, mid, worst), every beat from day one to hired.
   Plain data. The engine (engine.js) folds each beat's effects (fx) into the state the next beat starts from. */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

  var MAYA = { name: 'Maya Reyes', first: 'Maya', photo: A + 'maya.jpg', wants: 'GTM Engineer', city: 'Austin',
    focus: ['GTM Engineer', 'Revenue Operations', 'Sales Systems', 'Marketing Operations'] };

  /* the three systems, for the caption tag and the timeline */
  var SYS = {
    1: { name: 'Scenarios', verb: 'Do the work', c: '#3E63DD', bg: '#EEF2FD' },
    2: { name: 'Levels & Coach', verb: 'Get better', c: '#C98714', bg: '#FCF4E4' },
    3: { name: 'Jobs', verb: 'Get hired', c: '#8E4EC6', bg: '#F5EEFB' }
  };

  var BANDS = [
    { name: 'Underperforming', short: 'Under', c: '#D06632', pay: 0 },
    { name: 'Below Expectations', short: 'Below', c: '#EBA640', pay: 500 },
    { name: 'Meeting Expectations', short: 'Meeting', c: '#EDBE52', pay: 1000 },
    { name: 'Exceeding Expectations', short: 'Exceeding', c: '#46A056', pay: 2000 },
    { name: 'Exceptional', short: 'Exceptional', c: '#18743C', pay: 3000 }
  ];
  var READS = ['Understanding', 'Quality', 'Communication', 'Independence'];
  /* roles open at each level, counted up (stand-ins until Navid has the real numbers) */
  var OPEN = [0, 24, 41, 58, 76, 95, 118, 140, 163, 188, 212];

  /* the scenarios. pays = the most it can pay (Exceptional) */
  function P(name, title, ini, t) { return { name: name, title: title, ini: ini, t: t }; }
  var SC = {
    hubspot: { co: 'HubSpot', dom: 'hubspot.com', title: 'Inbound lead router', mins: 150, diff: 2,
      manager: P('Priya Nair', 'Head of Revenue Operations', 'PN', 't3'),
      tools: [['HubSpot', 'hubspot.com'], ['n8n', 'n8n.io'], ['Claude', 'claude.ai']],
      brief: 'Send every new lead to the right rep in under two minutes.',
      reqs: ['Route by region and deal size', 'Reply in under 2 minutes', 'Test it on last month of leads'],
      kick: 'Leads wait three hours for a rep. I want that under two minutes, and to the right person.',
      pop: ['Why route by deal size before region?', 'What happens when two reps match?', 'How did you test it?'] },
    notion: { co: 'Notion', dom: 'notion.so', title: 'Enrichment waterfall', mins: 180, diff: 2,
      manager: P('Leo Park', 'GTM Systems Lead', 'LP', 't1'),
      tools: [['Clay', 'clay.com'], ['Apollo', 'apollo.io'], ['Snowflake', 'snowflake.com']],
      brief: 'Fill in missing emails and titles on 8,000 accounts.',
      reqs: ['Three sources in order', 'Verified emails above 85%', 'A cost per account'],
      kick: 'Half our accounts have no email. Fill them in, and tell me what it costs.',
      pop: ['Why that order of sources?', 'How do you know an email is real?', 'What does one account cost?'] },
    shopify: { co: 'Shopify', dom: 'shopify.com', title: 'Outbound agent with evals', mins: 200, diff: 3,
      manager: P('Sam Ortiz', 'Head of Outbound', 'SO', 't2'),
      tools: [['Claude', 'claude.ai'], ['HubSpot', 'hubspot.com'], ['Slack', 'slack.com']],
      brief: 'Build an email agent and prove it is safe to send.',
      reqs: ['50 test cases', 'No made up facts', 'A send or hold rule'],
      kick: 'I will not let an agent email a customer until you show me it behaves.',
      pop: ['Which test failed first?', 'What makes it hold an email?', 'How would a rep override it?'] },
    stripe: { co: 'Stripe', dom: 'stripe.com', title: 'Intent signal scoring', mins: 180, diff: 3,
      manager: P('Dana Okafor', 'Head of GTM Systems', 'DO', 't1'),
      tools: [['Snowflake', 'snowflake.com'], ['HubSpot', 'hubspot.com'], ['Clay', 'clay.com']],
      brief: 'Score accounts by buying intent for the sales team.',
      reqs: ['Pick 3 intent signals', 'Score 8,000 accounts', 'Show sales the top 50'],
      kick: 'We need to know which accounts are ready to buy this quarter.',
      pop: ['Why weigh seats added above page visits?', 'What could push an account up by mistake?', 'How will sales use the top 50?'] },
    datadog: { co: 'Datadog', dom: 'datadoghq.com', title: 'Account research agent', mins: 150, diff: 3,
      manager: P('Ava Lindqvist', 'Director of Sales Strategy', 'AL', 't4'),
      tools: [['Claude', 'claude.ai'], ['Salesforce', 'salesforce.com'], ['Slack', 'slack.com']],
      brief: 'Brief every rep on an account before the call.',
      reqs: ['One page per account', 'Sources linked', 'Ready 30 minutes before'],
      kick: 'Reps walk into calls blind. Fix that.',
      pop: ['Where does the agent get its facts?', 'What does a rep read first?', 'How do you catch a wrong fact?'] },
    figma: { co: 'Figma', dom: 'figma.com', title: 'Product qualified lead score', mins: 180, diff: 3,
      manager: P('Noah Kim', 'Head of Growth Ops', 'NK', 't5'),
      tools: [['Snowflake', 'snowflake.com'], ['Hightouch', 'hightouch.com'], ['HubSpot', 'hubspot.com']],
      brief: 'Find the free teams most likely to pay.',
      reqs: ['Usage signals only', 'A score from 0 to 100', 'Synced to the CRM nightly'],
      kick: 'Sales calls the wrong free teams. Tell them who to call.',
      pop: ['Which signal matters most?', 'Why not use company size?', 'How often does it refresh?'] },
    zendesk: { co: 'Zendesk', dom: 'zendesk.com', title: 'Renewal risk agent', mins: 160, diff: 2,
      manager: P('Mia Torres', 'VP of Customer Success', 'MT', 't2'),
      tools: [['Snowflake', 'snowflake.com'], ['Claude', 'claude.ai'], ['Slack', 'slack.com']],
      brief: 'Flag accounts likely to cancel 60 days before renewal.',
      reqs: ['Three risk signals', 'A weekly list', 'One action per account'],
      kick: 'We find out customers are leaving when they leave. I want 60 days of warning.',
      pop: ['Which signal warned first?', 'What does the CSM do with the list?', 'How many false alarms?'] }
  };

  /* roles. lvl = the level that opens it. fit: 'fire' strong, 'up' good */
  function R(id, title, co, dom, lvl, fit, pay, mode) { return { id: id, title: title, co: co, dom: dom, lvl: lvl, fit: fit || '', pay: pay, mode: mode || 'Remote' }; }
  var ROLES = [
    R('gong-sdr', 'Sales Development Representative', 'Gong', 'gong.io', 1, 'up', '$58k to $70k'),
    R('loom-cs', 'Customer Success Operations Analyst', 'Loom', 'loom.com', 1, 'up', '$78k to $95k'),
    R('miro-pls', 'Product Led Sales Analyst', 'Miro', 'miro.com', 1, 'fire', '$80k to $98k'),
    R('webflow-mo', 'Marketing Operations Analyst', 'Webflow', 'webflow.com', 1, 'fire', '$76k to $94k'),
    R('calendly-dd', 'Deal Desk Analyst', 'Calendly', 'calendly.com', 1, '', '$75k to $92k'),
    R('calendly-ss', 'Sales Systems Analyst', 'Calendly', 'calendly.com', 2, 'fire', '$82k to $100k'),
    R('airtable-ra', 'Revenue Operations Analyst', 'Airtable', 'airtable.com', 2, 'up', '$85k to $105k'),
    R('clari-da', 'Data Analyst, GTM', 'Clari', 'clari.com', 2, 'up', '$88k to $110k', 'Hybrid'),
    R('gong-ai', 'AI Automation Specialist', 'Gong', 'gong.io', 3, 'fire', '$98k to $125k'),
    R('rippling-so', 'Sales Strategy and Operations Analyst', 'Rippling', 'rippling.com', 3, 'up', '$90k to $112k', 'San Francisco'),
    R('zapier-gtm', 'GTM Automation Engineer', 'Zapier', 'zapier.com', 3, 'fire', '$95k to $120k'),
    R('ramp-gtm', 'GTM Engineer', 'Ramp', 'ramp.com', 4, 'fire', '$105k to $135k'),
    R('brex-out', 'GTM Engineer, Outbound', 'Brex', 'brex.com', 4, 'up', '$102k to $130k', 'New York'),
    R('webflow-rev', 'RevOps Engineer', 'Webflow', 'webflow.com', 4, 'fire', '$100k to $128k'),
    R('vercel-gtm', 'GTM Engineer', 'Vercel', 'vercel.com', 6, 'fire', '$110k to $140k'),
    R('retool-ae', 'Analytics Engineer, Revenue', 'Retool', 'retool.com', 6, 'up', '$115k to $145k'),
    R('attio-se', 'Solutions Engineer', 'Attio', 'attio.com', 7, 'up', '$120k to $150k', 'London'),
    R('linear-ge', 'Growth Engineer', 'Linear', 'linear.app', 8, 'fire', '$130k to $165k'),
    R('openai-gtm', 'GTM Systems Engineer', 'OpenAI', 'openai.com', 10, 'fire', '$170k to $220k', 'San Francisco')
  ];
  function role(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return null; }

  /* how the coach talks, per read. low = a nudge below the bar, high = praise above it */
  var COACH = {
    Communication: {
      low: { saw: 'Second short reply to her manager', say: 'That read rushed. Your manager reads every word you send.', try: 'Say what, by when, and why.' },
      high: { saw: 'Updated her manager before being asked', say: 'You told your manager where you were before they asked. That is how trust gets built.', try: 'One update at the end of every stage.' } },
    Independence: {
      low: { saw: '4 questions in 20 minutes, 2 answered in the brief', say: 'Two of your questions were already in the brief.', try: 'Read the brief first, then ask the one thing it does not say.' },
      high: { saw: 'Made the call herself and said why', say: 'You made the call and explained it. That is what a lead does.', try: 'Decide first, then share your reasoning.' } },
    Quality: {
      low: { saw: 'Sent with 2 of 3 requirements met', say: 'One requirement is missing. Your manager asked for three things.', try: 'Check the brief line by line before you send.' },
      high: { saw: 'Tested it before sending', say: 'You tested it before you sent it. Right the first time.', try: 'Test before you ship, every time.' } },
    Speed: {
      low: { saw: 'Plan took 2 h 40 m, most take about 1 h', say: 'The plan took close to three hours. Most people send it in one.', try: 'Give it 45 minutes, then send what you have.' },
      high: { saw: 'Build done in 70 minutes', say: 'Done in 70 minutes and it still holds up.', try: 'Same pace, same checks.' } },
    'AI slop': {
      low: { saw: 'Pasted a long AI paragraph into the chat', say: 'That message reads like AI wrote it. Your manager will notice.', try: 'Let AI draft it, then cut it to three lines in your own words.' },
      high: { saw: 'Used AI for the first draft and checked every line', say: 'Good use of AI. You checked every line.', try: 'AI for the draft, you for the judgment.' } }
  };

  /* ---------------- the cases ---------------- */
  /* A beat: { wk: 'Week 1 · Mon', sys: 1|2|3, cap: one line on what is happening, ch: chapter key for the timeline,
       screen: which screen draws it, d: that screen's data, fx: what changes when it ends, hold: ms } */

  var CASES = {};

  function opening(c) {
    /* every case starts the same way: she tells Zero the job she wants, then picks her first scenario */
    return [
      { wk: 'Week 1 · Mon', sys: 1, ch: 'start', cap: 'Day one. Maya tells Zero the job she wants.', screen: 'onboard',
        d: { ask: 'What do you want to be hired as?', options: ['GTM Engineer', 'Revenue Operations', 'Data Analyst', 'Product Manager', 'Solutions Engineer', 'Marketing Operations'], pick: 'GTM Engineer' },
        fx: { credits: 100 } },
      { wk: 'Week 1 · Mon', sys: 1, ch: 'start', cap: 'Zero is her home. Her first scenario is unlocked: she picks one of two. The company hooks her, then the project.', screen: 'world',
        d: { mode: 'pick', road: road(c, 0), pick: ['hubspot', 'notion'], choose: 'hubspot' }, fx: { credits: -100 } }
    ];
  }
  /* the road of scenarios at the bottom of the world: done ones carry their band */
  function road(c, upto) {
    var seq = CASES_ROAD[c];
    return seq.map(function (k, i) { return { sc: k, done: i < upto, band: i < upto ? CASES_BANDS[c][i] : null, current: i === upto }; });
  }
  var CASES_ROAD = {
    best: ['hubspot', 'notion', 'stripe', 'figma', 'datadog'],
    mid: ['hubspot', 'notion', 'shopify', 'stripe', 'figma'],
    worst: ['hubspot', 'notion', 'shopify', 'zendesk', 'stripe', 'figma']
  };
  var CASES_BANDS = { best: [4, 4, 3], mid: [2, 1, 3, 2], worst: [1, 0, 2, 1, 2] };

  /* a full scenario: kickoff, the work with the coach, proof of understanding, done, review */
  function scenario(o) {
    /* o = {c, i, k, wk, full, band, chat, coach, card, before (pts), after, lvUp, credits, capWork, capReview} */
    var sc = SC[o.k], ch = 's' + (o.i + 1), out = [];
    if (o.full) out.push({ wk: o.wk, sys: 1, ch: ch, cap: 'Kickoff. Her manager joins and sets the brief.', screen: 'kickoff', d: { sc: o.k } });
    out.push({ wk: o.wk, sys: 1, ch: ch, cap: o.capWork, screen: 'stage', d: { sc: o.k, stage: o.stageName || 'Plan', chat: o.chat, coach: o.coach, card: o.card },
      fx: { credits: CREDIT.stage } });
    if (o.full) out.push({ wk: o.wk, sys: 1, ch: ch, cap: 'Proof of understanding: three voice questions from her manager.', screen: 'pop', d: { sc: o.k, qs: sc.pop, good: o.band >= 2 } });
    out.push({ wk: o.wk, sys: 1, ch: ch, cap: 'Scenario done.', screen: 'complete', d: { sc: o.k }, hold: 1600 });
    var lvFrom = Math.floor(o.before / 1000), lvTo = Math.floor((o.before + BANDS[o.band].pay) / 1000);
    out.push({ wk: o.wk, sys: 2, ch: ch, cap: o.capReview, screen: 'review',
      d: { sc: o.k, band: o.band, reads: o.reads, note: o.note, pts: BANDS[o.band].pay, before: o.before, lvFrom: lvFrom, lvTo: lvTo, open: OPEN[lvTo], newRoles: OPEN[lvTo] - OPEN[lvFrom] },
      fx: { pts: BANDS[o.band].pay, credits: CREDIT.scenario + (lvTo - lvFrom) * CREDIT.level, done: 1 }, hold: 3200 });
    return out;
  }
  var CREDIT = { stage: 50, scenario: 150, level: 100, streak: 20, start: 100 };

  function msg(from, t) { return { from: from, t: t }; }

  /* ===== BEST: everything lands, hired in 3 weeks ===== */
  CASES.best = { key: 'best', name: 'Best case', short: 'Best', line: 'Exceptional from the start',
    outcome: { role: 'GTM Engineer', co: 'Vercel', dom: 'vercel.com', pay: '$124,000', weeks: 3, scenarios: 3, level: 8, applied: 6, coach: 1 },
    beats: [].concat(
      opening('best'),
      scenario({ c: 'best', i: 0, k: 'hubspot', wk: 'Week 1 · Mon', full: true, band: 4, before: 0,
        capWork: 'She does the work. One chat, with her manager. The coach watches and speaks after the fact.',
        chat: [msg('mgr', 'When can I see your routing plan?'), msg('me', 'By 3pm today. Region first, then deal size, and I will test it on last month of leads.'), msg('mgr', 'That is exactly what I needed.')],
        coach: { read: 'Communication', kind: 'high' },
        reads: [4, 4, 4, 3], note: 'Fast, tested and clear. You told me the plan before I asked.',
        capReview: 'Her manager grades the work: Exceptional. That pays 3,000 skill points. Level 0 to Level 3.' }),
      [{ wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'Level 3 opens 58 roles. They wait for her in Jobs.', screen: 'jobsHome',
         d: { box: { n: 58, why: 'Level 3 opened them' }, actions: [], counts: { applied: 0, connected: 0, lost: 0 } } },
       { wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'She opens the box, hearts what she likes, and picks three strong fits.', screen: 'roles',
         d: { n: 58, list: ['gong-ai', 'zapier-gtm', 'rippling-so', 'calendly-ss', 'airtable-ra', 'clari-da', 'miro-pls', 'webflow-mo'], heart: 'zapier-gtm', select: ['gong-ai', 'zapier-gtm', 'rippling-so'] } },
       { wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'One click. Zero tailors her portfolio and resume for each role and sends it on the company’s own job page.', screen: 'apply',
         d: { roles: ['gong-ai', 'zapier-gtm', 'rippling-so'], top: 'Inbound lead router' }, fx: { applied: 3 } },
       { wk: 'Week 1 · Tue', sys: 2, ch: 'j1', cap: 'She comes back the next day: a streak, credits, and new roles.', screen: 'world',
         d: { mode: 'checkin', day: 2, reward: 20, road: road('best', 1) }, fx: { credits: 20, streak: 1 } },
       { wk: 'Week 1 · Wed', sys: 1, ch: 's2', cap: 'Her next scenario is unlocked: two to pick from again.', screen: 'world',
         d: { mode: 'pick', road: road('best', 1), pick: ['notion', 'datadog'], choose: 'notion' }, fx: { credits: -100 } }],
      scenario({ c: 'best', i: 1, k: 'notion', wk: 'Week 1 · Wed', band: 4, before: 3000, stageName: 'Build',
        capWork: 'Second scenario. She makes the calls herself, and the coach notices.',
        chat: [msg('me', 'I ordered the sources Clay, then Apollo, then a pattern guess. Cheapest first, and I stop once an email verifies.'), msg('mgr', 'Good call. Ship it.')],
        coach: { read: 'Independence', kind: 'high' },
        reads: [4, 4, 4, 4], note: 'Verified emails went from 54% to 91%. This is ready for the team.',
        capReview: 'Exceptional again: 3,000 more. Level 3 to Level 6.' }),
      [{ wk: 'Week 1 · Wed', sys: 3, ch: 'j2', cap: 'Level 6 opens the role she wants: GTM Engineer at Vercel.', screen: 'explore',
         d: { from: 3, to: 6, want: 'vercel-gtm' } },
       { wk: 'Week 1 · Wed', sys: 3, ch: 'j2', cap: 'She applies to Vercel and Ramp. Zero tailors both.', screen: 'apply',
         d: { roles: ['vercel-gtm', 'ramp-gtm', 'retool-ae'], top: 'Enrichment waterfall' }, fx: { applied: 3 } },
       { wk: 'Week 2 · Tue', sys: 3, ch: 'j2', cap: 'Teams reply by email. Vercel and Gong connect. Rippling closed the role.', screen: 'tracker',
         d: { move: [{ id: 'vercel-gtm', to: 'connected', note: 'Replied by email' }, { id: 'gong-ai', to: 'connected', note: 'Wants a call' }, { id: 'rippling-so', to: 'lost', note: 'Role closed' }] },
         fx: { connected: 2, lost: 1, applied: -3 } },
       { wk: 'Week 2 · Wed', sys: 1, ch: 's3', cap: 'She keeps going while she waits. Third scenario.', screen: 'world',
         d: { mode: 'pick', road: road('best', 2), pick: ['stripe', 'figma'], choose: 'stripe' }, fx: { credits: -100 } }],
      scenario({ c: 'best', i: 2, k: 'stripe', wk: 'Week 2 · Wed', band: 3, before: 6000, stageName: 'Plan',
        capWork: 'Even at her best the coach nudges once: her plan took too long.',
        chat: [msg('mgr', 'Where is the scoring plan?'), msg('me', 'Sending it now, with the three signals and why.')],
        coach: { read: 'Speed', kind: 'low' },
        reads: [4, 3, 4, 4], note: 'Strong model. Get the plan to me sooner next time.',
        capReview: 'Exceeding pays 2,000. Level 8.' }),
      [{ wk: 'Week 3 · Mon', sys: 3, ch: 'hired', cap: 'Vercel interviews her outside Zero, by email and calls. Then the offer arrives.', screen: 'mail',
         d: { from: { name: 'Jess Morgan', title: 'Head of GTM Engineering', co: 'Vercel', dom: 'vercel.com' }, role: 'vercel-gtm', pay: '$124,000', start: 'Mon 2 Nov' } },
       { wk: 'Week 3 · Mon', sys: 3, ch: 'hired', cap: 'Hired in 3 weeks: GTM Engineer at Vercel.', screen: 'hired', d: { caseKey: 'best' }, hold: 9000 }]
    ) };

  /* ===== MID: a slip, the coach steps in, it lands. Hired in 7 weeks ===== */
  CASES.mid = { key: 'mid', name: 'Mid case', short: 'Mid', line: 'Uneven, then the coach helps',
    outcome: { role: 'GTM Engineer', co: 'Ramp', dom: 'ramp.com', pay: '$112,000', weeks: 7, scenarios: 4, level: 4, applied: 8, coach: 3 },
    beats: [].concat(
      opening('mid'),
      scenario({ c: 'mid', i: 0, k: 'hubspot', wk: 'Week 1 · Mon', full: true, band: 2, before: 0,
        capWork: 'She does the work. Her reply to her manager is rushed, and the coach says so after she sends it.',
        chat: [msg('mgr', 'When can I see your routing plan?'), msg('me', 'ok will send it tmrw'), msg('mgr', 'Thanks.')],
        coach: { read: 'Communication', kind: 'low' },
        reads: [2, 2, 1, 2], note: 'It works. I had to chase you for it.',
        capReview: 'Meeting Expectations pays 1,000. Level 0 to Level 1: her first 24 roles open.' }),
      [{ wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'Level 1 opens 24 entry roles.', screen: 'jobsHome',
         d: { box: { n: 24, why: 'Level 1 opened them' }, actions: [], counts: { applied: 0, connected: 0, lost: 0 } } },
       { wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'She picks three and applies with one click.', screen: 'roles',
         d: { n: 24, list: ['miro-pls', 'webflow-mo', 'loom-cs', 'gong-sdr', 'calendly-dd'], heart: 'webflow-mo', select: ['miro-pls', 'webflow-mo', 'loom-cs'] } },
       { wk: 'Week 1 · Mon', sys: 3, ch: 'j1', cap: 'Zero tailors her portfolio for each and sends them.', screen: 'apply',
         d: { roles: ['miro-pls', 'webflow-mo', 'loom-cs'], top: 'Inbound lead router' }, fx: { applied: 3 } },
       { wk: 'Week 2 · Mon', sys: 1, ch: 's2', cap: 'Next scenario: two to pick from.', screen: 'world',
         d: { mode: 'pick', road: road('mid', 1), pick: ['notion', 'shopify'], choose: 'notion' }, fx: { credits: -100 } }],
      scenario({ c: 'mid', i: 1, k: 'notion', wk: 'Week 2 · Mon', band: 1, before: 1000, stageName: 'Build',
        capWork: 'Same habit, second time. Now it is a pattern, so the coach steps in with the one thing to fix.',
        chat: [msg('mgr', 'Status?'), msg('me', 'working on it'), msg('mgr', 'I need to know where you are.')],
        coach: { read: 'Communication', kind: 'low' },
        card: { think: 'Your builds are solid. Your manager keeps having to ask where you are.', need: 'One update to your manager before they ask.', read: 'Communication' },
        reads: [2, 1, 1, 2], note: 'The waterfall is half done and I found out late.',
        capReview: 'Below Expectations pays only 500. No level up. Better work pays more.' }),
      [{ wk: 'Week 2 · Thu', sys: 3, ch: 'j2', cap: 'First replies. Miro connects by email. Loom says no.', screen: 'tracker',
         d: { move: [{ id: 'miro-pls', to: 'connected', note: 'Replied by email' }, { id: 'loom-cs', to: 'lost', note: 'Said no by email' }] }, fx: { connected: 1, lost: 1, applied: -2 } },
       { wk: 'Week 3 · Mon', sys: 1, ch: 's3', cap: 'Third scenario.', screen: 'world',
         d: { mode: 'pick', road: road('mid', 2), pick: ['shopify', 'zendesk'], choose: 'shopify' }, fx: { credits: -100 } }],
      scenario({ c: 'mid', i: 2, k: 'shopify', wk: 'Week 3 · Mon', band: 3, before: 1500, stageName: 'Test',
        capWork: 'She updates her manager before being asked. The coach’s advice landed, and it says so.',
        chat: [msg('me', 'Quick update: 46 of 50 tests pass. Fixing the four tone failures now, done by 4pm.'), msg('mgr', 'Love that. Thanks for the heads up.')],
        coach: { read: 'Communication', kind: 'high' },
        card: { think: 'Your updates landed before anyone asked. That is the habit.', need: 'Make one decision alone before you ask.', read: 'Independence' },
        reads: [3, 3, 3, 2], note: 'Tested and clear. This is the work I wanted.',
        capReview: 'Exceeding pays 2,000. Level 1 to Level 3.' }),
      [{ wk: 'Week 3 · Mon', sys: 3, ch: 'j3', cap: 'Level 3 opens 34 more roles. She applies to Gong and Rippling.', screen: 'apply',
         d: { roles: ['gong-ai', 'rippling-so'], top: 'Outbound agent with evals' }, fx: { applied: 2 } },
       { wk: 'Week 4 · Wed', sys: 3, ch: 'j3', cap: 'Miro talked to her outside Zero, then chose someone else. Not every yes ends in an offer.', screen: 'tracker',
         d: { move: [{ id: 'miro-pls', to: 'lost', note: 'Chose another candidate' }] }, fx: { connected: -1, lost: 1 } },
       { wk: 'Week 5 · Mon', sys: 1, ch: 's4', cap: 'Fourth scenario.', screen: 'world',
         d: { mode: 'pick', road: road('mid', 3), pick: ['stripe', 'figma'], choose: 'stripe' }, fx: { credits: -100 } }],
      scenario({ c: 'mid', i: 3, k: 'stripe', wk: 'Week 5 · Mon', band: 2, before: 3500, stageName: 'Plan',
        capWork: 'Steady work. Nothing for the coach to say, so it stays quiet.',
        chat: [msg('me', 'Plan attached: three signals, weights and why. Scoring runs tonight.'), msg('mgr', 'Looks right.')],
        reads: [2, 2, 3, 2], note: 'Solid. Show me more of your own thinking next time.',
        capReview: 'Meeting pays 1,000. Level 4: Ramp’s GTM Engineer role opens.' }),
      [{ wk: 'Week 5 · Mon', sys: 3, ch: 'j4', cap: 'She applies to Ramp and Brex.', screen: 'apply',
         d: { roles: ['ramp-gtm', 'brex-out', 'webflow-rev'], top: 'Intent signal scoring' }, fx: { applied: 3 } },
       { wk: 'Week 6 · Tue', sys: 3, ch: 'j4', cap: 'Ramp replies by email. Connected.', screen: 'tracker',
         d: { move: [{ id: 'ramp-gtm', to: 'connected', note: 'Replied by email' }] }, fx: { connected: 1, applied: -1 } },
       { wk: 'Week 7 · Thu', sys: 3, ch: 'hired', cap: 'Ramp interviews her outside Zero. Then the offer arrives.', screen: 'mail',
         d: { from: { name: 'Nadia Rahman', title: 'Head of Revenue Systems', co: 'Ramp', dom: 'ramp.com' }, role: 'ramp-gtm', pay: '$112,000', start: 'Mon 7 Dec' } },
       { wk: 'Week 7 · Thu', sys: 3, ch: 'hired', cap: 'Hired in 7 weeks: GTM Engineer at Ramp.', screen: 'hired', d: { caseKey: 'mid' }, hold: 9000 }]
    ) };

  /* ===== WORST: stuck at the start, the coach pulls her through. Hired in 12 weeks ===== */
  CASES.worst = { key: 'worst', name: 'Worst case', short: 'Worst', line: 'Stuck early, the coach pulls her through',
    outcome: { role: 'Sales Development Representative', co: 'Gong', dom: 'gong.io', pay: '$64,000', weeks: 12, scenarios: 5, level: 3, applied: 9, coach: 4 },
    beats: [].concat(
      opening('worst'),
      scenario({ c: 'worst', i: 0, k: 'hubspot', wk: 'Week 1 · Mon', full: true, band: 1, before: 0,
        capWork: 'She pastes a long AI answer to her manager. The coach flags it after she sends it.',
        chat: [msg('mgr', 'What is your plan for the routing?'), msg('me', 'Great question! Lead routing is a critical part of any modern revenue organization. In this plan, I will leverage best practices to ensure seamless, efficient and scalable distribution of leads across...'), msg('mgr', 'Can you say that in two lines?')],
        coach: { read: 'AI slop', kind: 'low' },
        reads: [1, 1, 1, 1], note: 'The router misses deal size, and I could not follow your plan.',
        capReview: 'Below Expectations pays 500. Level 1 needs 1,000, so no roles open yet.' }),
      [{ wk: 'Week 1 · Mon', sys: 3, ch: 'j0', cap: 'Jobs stay locked until Level 1. She can see them, not apply.', screen: 'jobsHome',
         d: { locked: { need: 1, short: 500 }, actions: [], counts: { applied: 0, connected: 0, lost: 0 } } },
       { wk: 'Week 2 · Mon', sys: 1, ch: 's2', cap: 'Next scenario.', screen: 'world',
         d: { mode: 'pick', road: road('worst', 1), pick: ['notion', 'shopify'], choose: 'notion' }, fx: { credits: -100 } }],
      scenario({ c: 'worst', i: 1, k: 'notion', wk: 'Week 2 · Mon', band: 0, before: 500, stageName: 'Build',
        capWork: 'She sends it with a requirement missing. Two weak scenarios: the coach steps in with one thing to fix.',
        chat: [msg('me', 'done, sent it'), msg('mgr', 'Where is the cost per account? That was one of three things.')],
        coach: { read: 'Quality', kind: 'low' },
        card: { think: 'You are rushing. The work goes out before it covers the brief.', need: 'Check the brief line by line before you send.', read: 'Quality' },
        reads: [1, 0, 1, 1], note: 'Two of three requirements. I cannot use this yet.',
        capReview: 'Underperforming pays nothing. Still Level 0. The coach has given her one thing to fix.' }),
      [{ wk: 'Week 3 · Mon', sys: 2, ch: 's3', cap: 'A week away. Her streak starts over, and Zero welcomes her back with credits.', screen: 'world',
         d: { mode: 'checkin', day: 1, reward: 20, broke: true, road: road('worst', 2) }, fx: { credits: 20 } },
       { wk: 'Week 3 · Mon', sys: 1, ch: 's3', cap: 'Third scenario.', screen: 'world',
         d: { mode: 'pick', road: road('worst', 2), pick: ['shopify', 'zendesk'], choose: 'shopify' }, fx: { credits: -100 } }],
      scenario({ c: 'worst', i: 2, k: 'shopify', wk: 'Week 3 · Mon', band: 2, before: 500, stageName: 'Test',
        capWork: 'She checks the brief line by line before sending. The coach sees it.',
        chat: [msg('me', 'Checked all three: 50 tests, no made up facts, and a hold rule for anything unsure. Sending now.'), msg('mgr', 'Much better. Thank you.')],
        coach: { read: 'Quality', kind: 'high' },
        reads: [2, 2, 2, 1], note: 'All three requirements this time. Keep going.',
        capReview: 'Meeting pays 1,000. Level 1 at last: 24 entry roles open.' }),
      [{ wk: 'Week 3 · Tue', sys: 3, ch: 'j1', cap: 'She applies to five entry roles.', screen: 'apply',
         d: { roles: ['gong-sdr', 'loom-cs', 'miro-pls', 'webflow-mo', 'calendly-dd'], top: 'Outbound agent with evals' }, fx: { applied: 5 } },
       { wk: 'Week 5 · Fri', sys: 3, ch: 'j1', cap: 'Three say no or never reply. Lost. Two are still waiting.', screen: 'tracker',
         d: { move: [{ id: 'loom-cs', to: 'lost', note: 'No reply in 21 days' }, { id: 'miro-pls', to: 'lost', note: 'Said no by email' }, { id: 'webflow-mo', to: 'lost', note: 'Role closed' }] }, fx: { lost: 3, applied: -3 } },
       { wk: 'Week 6 · Mon', sys: 1, ch: 's4', cap: 'Fourth scenario.', screen: 'world',
         d: { mode: 'pick', road: road('worst', 3), pick: ['zendesk', 'stripe'], choose: 'zendesk' }, fx: { credits: -100 } }],
      scenario({ c: 'worst', i: 3, k: 'zendesk', wk: 'Week 6 · Mon', band: 1, before: 1500, stageName: 'Plan',
        capWork: 'She asks before she tries. The coach names the next thing to work on.',
        chat: [msg('me', 'Which signals should I use?'), msg('me', 'Should it be weekly?'), msg('mgr', 'Both are in the brief.')],
        coach: { read: 'Independence', kind: 'low' },
        card: { think: 'Your quality is back. You still ask before you try.', need: 'Make one decision alone before you ask.', read: 'Independence' },
        reads: [2, 2, 2, 0], note: 'Fine work, but you leaned on me for every step.',
        capReview: 'Below pays 500. Level 2.' }),
      [{ wk: 'Week 8 · Mon', sys: 1, ch: 's5', cap: 'Fifth scenario.', screen: 'world',
         d: { mode: 'pick', road: road('worst', 4), pick: ['stripe', 'figma'], choose: 'stripe' }, fx: { credits: -100 } }],
      scenario({ c: 'worst', i: 4, k: 'stripe', wk: 'Week 8 · Mon', band: 2, before: 2000, stageName: 'Plan',
        capWork: 'She makes the call on the weights herself. The coach notices.',
        chat: [msg('me', 'I set seats added at 45% because it predicted upgrades best last quarter. Plan attached.'), msg('mgr', 'Good reasoning.')],
        coach: { read: 'Independence', kind: 'high' },
        reads: [2, 2, 2, 2], note: 'Steady and clear. This is a real improvement.',
        capReview: 'Meeting pays 1,000. Level 3: 34 more roles open.' }),
      [{ wk: 'Week 8 · Tue', sys: 3, ch: 'j2', cap: 'She applies to four more.', screen: 'apply',
         d: { roles: ['calendly-ss', 'airtable-ra', 'clari-da', 'gong-ai'], top: 'Intent signal scoring' }, fx: { applied: 4 } },
       { wk: 'Week 10 · Wed', sys: 3, ch: 'j2', cap: 'Gong replies about the SDR role. Connected.', screen: 'tracker',
         d: { move: [{ id: 'gong-sdr', to: 'connected', note: 'Replied by email' }] }, fx: { connected: 1, applied: -1 } },
       { wk: 'Week 12 · Mon', sys: 3, ch: 'hired', cap: 'Gong interviews her outside Zero. Then the offer arrives.', screen: 'mail',
         d: { from: { name: 'Noa Feldman', title: 'Director of Sales Development', co: 'Gong', dom: 'gong.io' }, role: 'gong-sdr', pay: '$64,000', start: 'Mon 18 Jan' } },
       { wk: 'Week 12 · Mon', sys: 3, ch: 'hired', cap: 'Hired in 12 weeks: Sales Development Representative at Gong. A first job, and the road keeps going.', screen: 'hired', d: { caseKey: 'worst' }, hold: 9000 }]
    ) };

  /* chapter labels for the timeline */
  var CH = { start: 'Start', hired: 'Hired', j0: 'Jobs locked', j1: 'Jobs', j2: 'Jobs', j3: 'Jobs', j4: 'Jobs' };

  window.JD = { A: A, MAYA: MAYA, SYS: SYS, BANDS: BANDS, READS: READS, OPEN: OPEN, SC: SC, ROLES: ROLES, role: role, COACH: COACH, CASES: CASES, CH: CH, CREDIT: CREDIT,
    ROAD: CASES_ROAD, ROADBANDS: CASES_BANDS };
})();
