/* Zero b9, Sanjay's way through: the real app's screens, three scenarios, best / mid / worst, and his job portal.
   Plain data. Everyone starts at Level 1. Level N starts at (N - 1) x 1,000 skill points. */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  var I = A + 'img/';

  var ME = { name: 'Sanjay Chauhan', first: 'Sanjay', ini: 'SC', photo: I + 'sanjay.jpg' };
  var COACH = { name: 'Navid', style: 'Direct', photo: A + 'coach/navid.jpg', video: A + 'coach/navi.mp4' };
  var COACHES = [
    { key: 'navi', name: 'Navid', style: 'Direct', photo: A + 'coach/navid.jpg', video: A + 'coach/navi.mp4', line: 'Tells you what is costing you, plainly.' },
    { key: 'jenna', name: 'Jenna', style: 'Warm', photo: A + 'coach/jenna.jpg', video: A + 'coach/jenna.mp4', line: 'Notices what is going well, not just what is missing.' },
    { key: 'ian', name: 'Ian', style: 'Motivational', photo: A + 'coach/ian.jpg', video: A + 'coach/ian.mp4', line: 'Picks the one thing that gets you a jump.' },
    { key: 'jessica', name: 'Jessica', style: 'Strategic', photo: A + 'coach/jessica.jpg', video: A + 'coach/jessica.mp4', line: 'Finds the habit behind the pattern.' }
  ];

  /* logos: svg = one colour mark in its brand colour, png = the company's own icon, '' = a letter */
  var CO = {
    hubspot: ['HubSpot', 'svg', '#FF7A59'], notion: ['Notion', 'svg', '#111113'], shopify: ['Shopify', 'svg', '#5E8E3E'], stripe: ['Stripe', 'svg', '#635BFF'],
    figma: ['Figma', 'svg', '#1E1E1E'], slack: ['Slack', 'svg', '#4A154B'], snowflake: ['Snowflake', 'svg', '#29B5E8'], salesforce: ['Salesforce', 'svg', '#00A1E0'],
    n8n: ['n8n', 'svg', '#EA4B71'], clay: ['Clay', 'png'], anthropic: ['Claude', 'svg', '#D97757'], openai: ['OpenAI', 'svg', '#111113'],
    ramp: ['Ramp', 'png'], peec: ['Peec AI', 'png'], basepower: ['Base Power', 'png'], lyft: ['Lyft', 'svg', '#FF00BF'], newrelic: ['New Relic', 'svg', '#1D252C'],
    datadog: ['Datadog', 'svg', '#632CA6'], lansweeper: ['Lansweeper', 'png'], ashby: ['Ashby', 'png'], doordash: ['DoorDash', 'svg', '#FF3008'],
    jobber: ['Jobber', 'png'], wealthsimple: ['Wealthsimple', 'png'], boulevard: ['Boulevard', 'png'], growtherapy: ['Grow Therapy', '', '#2E7D5B'],
    dnsfilter: ['DNSFilter', '', '#1F6FEB'], plaid: ['Plaid', 'png'], toast: ['Toast', '', '#FF4C00'], zip: ['Zip', 'png'], eliseai: ['EliseAI', 'png'],
    faire: ['Faire', 'png'], dualentry: ['DualEntry', 'png'], digitalocean: ['DigitalOcean', 'svg', '#0080FF'], attio: ['Attio', '', '#111113'],
    warp: ['Warp', 'png'], workos: ['WorkOS', 'png'], baseten: ['Baseten', 'png'], siro: ['Siro', 'png'], rogo: ['Rogo', 'png'], modal: ['Modal', 'svg', '#111113'],
    langchain: ['LangChain', 'svg', '#1C3C3C'], motive: ['Motive', 'png'], navan: ['Navan', '', '#111113'], upside: ['Upside', 'png'], cloudflare: ['Cloudflare', 'svg', '#F38020'],
    vanta: ['Vanta', 'png'], onepassword: ['1Password', 'svg', '#0572EC'], samsara: ['Samsara', '', '#0A2240'], mongodb: ['MongoDB', 'svg', '#00684A'], adyen: ['Adyen', 'svg', '#0ABF53'],
    rippling: ['Rippling', 'png'], perplexity: ['Perplexity', 'svg', '#20808D'], zendesk: ['Zendesk', '', '#03363D']
  };

  /* every level from 1: where it starts, what it opens (stand-in counts), and who is hiring */
  var LEVELS = [
    { n: 1, roles: 12, kind: 'Internships', pay: '$6k a month', cos: ['peec', 'basepower', 'lyft'] },
    { n: 2, roles: 18, kind: 'Internships', pay: '$6k a month', cos: ['lyft', 'peec', 'basepower'] },
    { n: 3, roles: 30, kind: 'Analyst roles', pay: '$95k to $133k', cos: ['newrelic', 'datadog', 'lansweeper'] },
    { n: 4, roles: 40, kind: 'Analyst roles', pay: '$100k to $162k', cos: ['ashby', 'doordash', 'jobber', 'wealthsimple'] },
    { n: 5, roles: 50, kind: 'Associate roles', pay: '$114k to $179k', cos: ['boulevard', 'growtherapy', 'dnsfilter'] },
    { n: 6, roles: 60, kind: 'GTM Engineer', pay: '$100k to $200k', cos: ['plaid', 'zip', 'toast', 'eliseai', 'faire'] },
    { n: 7, roles: 55, kind: 'GTM Engineer', pay: '$120k to $200k', cos: ['attio', 'workos', 'digitalocean', 'warp'] },
    { n: 8, roles: 45, kind: 'GTM Engineer', pay: '$140k to $250k', cos: ['clay', 'modal', 'langchain', 'baseten'] },
    { n: 9, roles: 30, kind: 'Senior roles', pay: '$113k to $309k', cos: ['cloudflare', 'vanta', 'onepassword', 'adyen'] },
    { n: 10, roles: 20, kind: 'Top of the field', pay: '$127k to $405k', cos: ['anthropic', 'openai', 'ramp', 'stripe'] }
  ];
  function levelOf(pts) { return Math.min(10, Math.floor(pts / 1000) + 1); }
  function startOf(n) { return (n - 1) * 1000; }

  /* how a scenario is graded, and what it pays */
  var BANDS = [
    { key: 'under', name: 'Underperforming', short: 'Under', review: 'Below expectations', pts: 0, c: '#D06632' },
    { key: 'below', name: 'Below Expectations', short: 'Below', review: 'Below expectations', pts: 500, c: '#EBA640' },
    { key: 'meeting', name: 'Meeting Expectations', short: 'Meeting', review: 'Meets expectations', pts: 1000, c: '#D9A93A' },
    { key: 'exceeding', name: 'Exceeding Expectations', short: 'Exceeding', review: 'Above expectations', pts: 2000, c: '#46A056' },
    { key: 'exceptional', name: 'Exceptional', short: 'Exceptional', review: 'Exceptional', pts: 3000, c: '#18743C' }
  ];
  function band(k) { for (var i = 0; i < BANDS.length; i++) if (BANDS[i].key === k) return BANDS[i]; return BANDS[2]; }

  /* the people */
  var P = {
    jay: { name: 'Jay Shah', first: 'Jay', title: 'Director of Revenue Operations', photo: I + 'nadeem.jpg', wide: I + 'nadeem-wide.jpg' },
    avery: { name: 'Avery Lin', first: 'Avery', title: 'Data Analyst', photo: I + 'avery.jpg', wide: I + 'avery-wide.jpg' },
    esther: { name: 'Esther Park', first: 'Esther', title: 'GTM Systems Lead', photo: I + 'esther.jpg', wide: I + 'esther-wide.jpg' },
    daniel: { name: 'Daniel Ross', first: 'Daniel', title: 'Head of Outbound', photo: I + 'daniel.jpg' }
  };

  /* the three scenarios: the same projects the job portal counts (router, waterfall, evals) */
  var SC = {
    router: {
      id: 'router', co: 'hubspot', title: 'Inbound lead router', full: 'Inbound lead router at HubSpot', art: 'LEAD RUSH',
      blurb: 'New leads wait three hours for a rep. Get every lead to the right rep in under two minutes.',
      pays: 3000, time: '~1 hr', diff: 1, diffName: 'Beginner', mgr: 'jay', analyst: 'avery',
      kickMins: 12, kickTitle: 'Understand the scope and what comes next.',
      kick: [
        'Inbound leads wait three hours and ten minutes for a first reply. Six months ago it was forty seven minutes.',
        'Every hour a lead waits, our chance of booking a meeting drops by about eight percent.',
        'That is about two point four million dollars of pipeline a quarter, from leads we already paid for.',
        'I want every new lead to get a reply from the right rep in under two minutes.'
      ],
      slides: [
        { kind: 'line', title: 'The wait climbed fast.', from: '47 min', to: '3 h 10 m', l: '6 months ago', r: 'today' },
        { kind: 'big', pre: 'Every hour a lead waits costs us', num: '8%', post: 'of the chance to book a meeting' },
        { kind: 'big', pre: 'That adds up to', num: '$2.4M', post: 'of pipeline a quarter' },
        { kind: 'quote', parts: ['We pay for ', 'leads', ' and then make them ', 'wait', '.'] }
      ],
      notes: {
        problem: ['Inbound leads wait 3 h 10 m for a first reply, up from 47 min', 'Each hour of wait cuts meeting rates by about 8%', 'About $2.4M of pipeline lost a quarter'],
        outcome: ['Every new lead gets a reply in under 2 minutes', 'Routed to the right rep by region and deal size', 'Tested on last month of leads before it goes live']
      },
      pop: ['What is the one number we are trying to move?', 'Why route by deal size, and not just region?', 'How will you know it works before it goes live?'],
      stage: 'Routing plan', stageTime: '1:00:00',
      reqs: [
        { t: 'Reply to every lead in under 2 minutes', sub: ['Trigger on form submit, not a nightly sync', 'Name the rep, not just the team', 'Send the first reply from that rep'] },
        { t: 'Back it with last month of leads', sub: ['Run it on the 1,200 leads from September', 'Show the median reply time'] },
        { t: 'Say what breaks, and what happens then', sub: ['No rep matches', 'The rep is away'] }
      ],
      resources: { project: ['Meeting notes', 'Lead export, last 30 days', 'Example router, Ramp'], task: ['HubSpot workflow guide', 'Rep territory map'] },
      tools: [['HubSpot', 'hubspot'], ['n8n', 'n8n'], ['Claude', 'anthropic']],
      file: 'Routing plan.pdf',
      deckTitle: 'Reply to every lead in under 2 minutes',
      deck: [
        { kind: 'big', eyebrow: 'Where we are', title: 'Leads wait', num: '3 h 10 m', sub: 'Median time to first reply, last 30 days' },
        { kind: 'bars', eyebrow: 'Why leads wait', title: 'Manual triage causes 52% of the wait', sub: 'Share of total wait time, by cause', rows: [['Manual triage', 'A person picks the rep', 52], ['Wrong rep first', 'Lead is passed on', 23], ['Rep out of office', 'No cover set', 14], ['Nightly sync', 'Leads arrive next day', 11]], callout: ['52%', 'Half the wait is a person deciding who gets the lead. That is the part a router removes.'] },
        { kind: 'steps', eyebrow: 'The router', title: '88 seconds, to the right rep', rows: [['Form submit', 'Triggers the workflow'], ['Region, then deal size', 'Picks the rep'], ['First reply from that rep', 'Sent in 88 seconds'], ['No match or away', 'Goes to the team lead']] }
      ],
      qa: { who: 'avery', q: 'The 88 seconds is from last month. What happens at the end of the quarter, when inbound volume doubles?' },
      skills: [['Workflow automation', 'Proficient'], ['Lead routing', 'Proficient'], ['Testing on real data', 'Competent'], ['Stakeholder communication', 'Competent']],
      toolsUsed: ['HubSpot', 'n8n', 'Claude', 'Google Sheets']
    },
    waterfall: {
      id: 'waterfall', co: 'notion', title: 'Enrichment waterfall', full: 'Enrichment waterfall at Notion', art: 'MISSING DATA',
      blurb: 'Half our target accounts have no email. Fill them in, and say what each one costs.',
      pays: 3000, time: '~1 hr 15 min', diff: 2, diffName: 'Intermediate', mgr: 'esther',
      stage: 'Build', stageTime: '1:15:00',
      reqs: [{ t: 'Three sources, in order', sub: ['Cheapest first', 'Stop when an email verifies'] }, { t: 'Verified emails above 85%' }, { t: 'A cost per account' }],
      resources: { project: ['Meeting notes', 'Target accounts, 8,400 rows'], task: ['Clay waterfall guide'] },
      tools: [['Clay', 'clay'], ['Snowflake', 'snowflake'], ['Claude', 'anthropic']],
      file: 'Enrichment waterfall.pdf',
      skills: [['Data enrichment', 'Proficient'], ['Cost modelling', 'Competent'], ['SQL', 'Competent']],
      toolsUsed: ['Clay', 'Snowflake', 'Claude']
    },
    evals: {
      id: 'evals', co: 'shopify', title: 'Outbound agent with evals', full: 'Outbound agent with evals at Shopify', art: 'SAFE TO SEND',
      blurb: 'Build an email agent for outbound, and prove it is safe to send before a customer sees it.',
      pays: 3000, time: '~1 hr 30 min', diff: 3, diffName: 'Advanced', mgr: 'daniel',
      stage: 'Test', stageTime: '1:30:00',
      reqs: [{ t: '50 test cases' }, { t: 'No made up facts' }, { t: 'A send or hold rule' }],
      resources: { project: ['Meeting notes', 'Past outbound emails'], task: ['Eval checklist'] },
      tools: [['Claude', 'anthropic'], ['HubSpot', 'hubspot'], ['Slack', 'slack']],
      file: 'Agent eval report.pdf',
      skills: [['AI agents', 'Proficient'], ['Evaluation', 'Proficient'], ['Prompt writing', 'Competent']],
      toolsUsed: ['Claude', 'HubSpot', 'Slack']
    }
  };
  var ROAD = ['router', 'waterfall', 'evals'];

  /* ---------- beats ----------
     A beat: { cap: what is happening (shown in the prototype control, not the app), screen, d: that screen's data,
       fx: what changes when it ends {pts, done, coach}, hold, ch: chapter } */
  function msg(who, t, x) { var m = { who: who, t: t }; if (x) for (var k in x) m[k] = x[k]; return m; }

  /* coach updates: think = 2 or 3 lines about you; like / fix = what it saw (fix carries a try); reads = 1..5 */
  function coach(think, like, fix, reads) { return { think: think, like: like || [], fix: fix || [], reads: reads || {} }; }

  function S1(c) {
    var sc = 'router', mgr = 'jay';
    var b = [];
    b.push({ ch: 's1', cap: 'Day one at Level 1. He enters his first scenario, and his coach joins.', screen: 'home', d: { mode: 'first', sc: sc } });
    b.push({ ch: 's1', cap: 'The kickoff: Jay sets the scope.', screen: 'kickCard', d: { sc: sc } });
    b.push({ ch: 's1', cap: 'Jay joins on video.', screen: 'kickVideo', d: { sc: sc } });
    b.push({ ch: 's1', cap: 'The brief, with Meeting Notes filling in as Jay talks.', screen: 'kickSlides', d: { sc: sc } });
    b.push({ ch: 's1', cap: 'Understanding check: Jay asks three things by voice.', screen: 'understand', d: { sc: sc, answers: c.pop, score: c.popScore } });
    c.stage.forEach(function (st) { b.push(st); });
    b.push({ ch: 's1', cap: 'The final meeting: Jay and Avery are in the room.', screen: 'room', d: { sc: sc } });
    b.push({ ch: 's1', cap: 'Sanjay presents his deck.', screen: 'present', d: { sc: sc, lines: c.present } });
    b.push({ ch: 's1', cap: 'Questions: Avery asks the hard one.', screen: 'qa', d: { sc: sc, answer: c.qa } });
    b.push({ ch: 's1', cap: 'Feedback from Jay and Avery.', screen: 'report', d: { sc: sc, band: c.band, overview: c.overview, liked: c.liked, work: c.work } });
    b.push({ ch: 's1', cap: 'Scenario complete.', screen: 'complete', d: { sc: sc }, hold: 1800 });
    b.push({ ch: 's1', cap: c.reviewCap, screen: 'review', d: { sc: sc, band: c.band, note: c.note, mgr: mgr }, fx: { pts: band(c.band).pts, done: sc, coach: c.after } , hold: 3600 });
    return b;
  }

  /* a shorter scenario: enter, the work with one coach moment, the grade */
  function Sn(n, c) {
    var sc = ROAD[n - 1], s = SC[sc], ch = 's' + n;
    var b = [];
    b.push({ ch: ch, cap: 'Sanjay enters ' + s.title + ' at ' + CO[s.co][0] + '.', screen: 'home', d: { mode: 'enter', sc: sc } });
    b.push({ ch: ch, cap: c.workCap, screen: 'stage', d: { sc: sc, stage: s.stage, chat: c.chat, coach: c.coach, block: c.block, submit: c.submit, feedback: c.feedback, done: !(c.feedback && c.feedback.items && c.feedback.items.length && c.feedback.items.some(function (x) { return x.sev === 'HIGH'; })) }, fx: c.stageFx });
    b.push({ ch: ch, cap: c.reviewCap, screen: 'review', d: { sc: sc, band: c.band, note: c.note, mgr: s.mgr, short: true }, fx: { pts: band(c.band).pts, done: sc, coach: c.after }, hold: 3600 });
    return b;
  }
  function jobs(n, cap, d) { return { ch: 'j' + n, cap: cap, screen: 'jobs', d: d || {}, hold: d && d.hold || 7000 }; }
  function home(n, cap, d) { return { ch: 's' + n, cap: cap, screen: 'home', d: d }; }

  var CASES = {};

  /* =============== BEST =============== */
  CASES.best = { key: 'best', name: 'Best case', line: 'Exceptional from the start', end: 'Level 9 in three scenarios',
    beats: [].concat(
      S1({
        pop: [
          'Reply time. Three hours ten today, under two minutes when we are done.',
          'Because the right rep for a fifty seat deal is not the right rep for a five seat one. Region alone sends big deals to whoever is free.',
          'I will run it on the twelve hundred leads from September and show the median reply time before anything goes live.'
        ], popScore: 4,
        stage: [
          { ch: 's1', cap: 'The work. One chat, with Jay. Sanjay tells him the plan before he asks.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'plan',
            chat: [msg('mgr', 'Morning. What is your plan for the router?'), msg('me', 'Plan: trigger on form submit, route by region then deal size, first reply from the named rep. I will test it on last month of leads and send it by 2pm.'), msg('mgr', 'That is the order I would do it in. Go.')],
            coach: { kind: 'praise', read: 'Communication', title: 'Great work', text: 'You told Jay the plan before he asked. That is the habit.' }, tick: [0] },
            fx: { coach: coach('You plan before you build, and you keep Jay in the loop. That is rare this early.', ['You told Jay the plan before he asked.'], [], { Communication: 4, Understanding: 4 }) } },
          { ch: 's1', cap: 'He tests it on real leads and finds the misroutes himself.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'test',
            chat: [msg('me', 'Tested on 1,200 leads from September: median reply 88 seconds. 3 misroutes, all leads with no country. Fixing that now.'), msg('mgr', 'Love that you found the misroutes yourself.')],
            coach: { kind: 'praise', read: 'Quality', title: 'Right the first time', text: 'You tested on real leads before you sent it.' }, tick: [1] },
            fx: { coach: coach('You test before you ship and you find your own mistakes. Keep the pace.', ['You tested on 1,200 real leads before you sent it.'], [], { Quality: 5, Independence: 4 }) } },
          { ch: 's1', cap: 'He submits. Jay: ready, with one small note.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'submit',
            submit: msg('me', 'Here is the router plan and the test on last month of leads.', { file: 'Routing plan.pdf' }),
            feedback: { say: 'This is ready. One small thing before it goes up: say what happens when the rep is away.', items: [{ t: 'Say what happens when the rep is away', sev: 'LOW', why: 'The plan routes by region and deal size, but a rep on leave still gets the lead.', how: 'Add one rule: if the rep is away, send it to the team lead.' }] },
            tick: [2], done: true } }
        ],
        present: ['Leads wait three hours ten for a first reply.', 'Half of that wait is a person deciding who gets the lead.', 'The router answers in 88 seconds, from the right rep, and it was tested on last month of leads.'],
        qa: 'I tested that. I replayed September at double volume: the median went from 88 to 96 seconds, because the workflow queues, it does not drop leads.',
        band: 'exceptional',
        overview: 'You opened with the one number that matters, 3 h 10 m, and you showed where the wait comes from before you showed the fix. When Avery asked about volume you had already tested it at double. This is ready for the team.',
        liked: [['You named the number you wanted to move in the first twenty seconds.', '0:20', 'DELIVERY', 'EXCEPTIONAL'], ['You had tested double volume before anyone asked.', '7:40', 'UNDERSTANDING', 'EXCEPTIONAL']],
        work: [['Say what happens when a rep is away on the slide, not only in your notes.', '5:10', 'QUALITY', 'EXCEEDS', 'EXCEPTIONAL']],
        note: 'Sanjay, this is the router I wanted. You tested it on real leads, you found your own misroutes, and you told me the plan before I asked. Next time, put the edge cases on the slide.',
        reviewCap: 'Jay grades it Exceptional: 3,000 skill points. Level 1 to Level 4.',
        after: coach('You plan before you build, you test on real data, and Jay always knows where you are. Keep that and the senior roles come fast.', ['You tested the router on 1,200 real leads before sending it.', 'You answered Avery with a test you had already run.'], [{ t: 'Your edge cases were in your notes, not on the slide.', try: 'Put what breaks, and what happens then, on the slide.' }], { Understanding: 5, Quality: 5, Communication: 4, Independence: 4, Speed: 4 })
      }),
      [home(1, 'Back home at Level 4. A new scenario is unlocked, and his coach has a new read.', { mode: 'unlocked', sc: 'waterfall', openCoach: true }),
       jobs(1, 'Jobs: Level 4 opens new roles. The job portal plays its level up.', { levelUp: true })],
      Sn(2, { workCap: 'Notion. He picks the order of the sources himself, and the coach notices.',
        chat: [msg('mgr', 'How will you order the sources?'), msg('me', 'Clay first, then Apollo, then a pattern guess. Cheapest first, and I stop as soon as an email verifies. That keeps the cost under five cents an account.'), msg('mgr', 'Good call. Ship it.')],
        coach: { kind: 'praise', read: 'Independence', title: 'You made the call', text: 'You picked the order yourself and said why.' },
        submit: msg('me', 'Waterfall is live: verified emails went from 54% to 91% on 8,400 accounts, at 4.2 cents an account.', { file: 'Enrichment waterfall.pdf' }),
        feedback: { say: 'This is ready for the team.', items: [] },
        band: 'exceptional', note: 'Verified emails from 54% to 91%, and you told me the cost before I asked. Ready for the team.',
        reviewCap: 'Exceptional again: 3,000 skill points. Level 4 to Level 7.',
        after: coach('Two scenarios, every requirement met, and you make the calls yourself. GTM Engineer roles are open to you now.', ['You chose the source order yourself and said why.', 'You gave the cost per account before Esther asked.'], [], { Independence: 5, Quality: 5 }) }),
      [home(2, 'Level 7. The next scenario is unlocked.', { mode: 'unlocked', sc: 'evals' }),
       jobs(2, 'Jobs: Level 7 opens GTM Engineer roles. He applies to the strong fits.', { levelUp: true, apply: 2 })],
      Sn(3, { workCap: 'Shopify. Even at his best, the coach nudges once: the plan took too long.',
        chat: [msg('mgr', 'Where is the eval plan?'), msg('me', 'Sending it now: 50 cases, a no made up facts check, and a hold rule for anything unsure.')],
        coach: { kind: 'nudge', read: 'Speed', title: 'A small one', text: 'The plan took close to three hours. Send a rough draft sooner.', try: 'Give the plan 45 minutes, then send what you have.' },
        submit: msg('me', 'Eval report: 46 of 50 cases pass, and the four that fail are held, not sent.', { file: 'Agent eval report.pdf' }),
        feedback: { say: 'Strong. Get me the plan sooner next time.', items: [{ t: 'Send the plan sooner', sev: 'LOW', why: 'The plan arrived after three hours.', how: 'A rough plan in the first hour is enough.' }] },
        band: 'exceeding', note: 'Strong agent and a real eval. Get the plan to me sooner next time.',
        reviewCap: 'Exceeding: 2,000 skill points. Level 9.',
        after: coach('You are one of the strongest builders I have seen this month. The last gap is pace: send the plan inside the hour.', ['Your agent holds anything it is unsure of.'], [{ t: 'Your plans take close to three hours.', try: 'Give the plan 45 minutes, then send what you have.' }], { Speed: 3, Quality: 5 }) }),
      [jobs(3, 'Jobs at Level 9: senior roles are open, and the teams he applied to reply.', { levelUp: true, apply: 2, end: true, hold: 9000 })]
    ) };

  /* =============== MID =============== */
  CASES.mid = { key: 'mid', name: 'Mid case', line: 'A slip, the coach steps in, it lands', end: 'Level 4 in three scenarios',
    beats: [].concat(
      S1({
        pop: [
          'Reply time, I think.',
          'Because big deals should go to senior reps.',
          'I will test it before it goes live.'
        ], popScore: 2,
        stage: [
          { ch: 's1', cap: 'The work. Sanjay sends a rushed reply. It goes through, and the coach says so after.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'plan',
            chat: [msg('mgr', 'Morning. What is your plan for the router?'), msg('me', 'ok will send it soon'), msg('mgr', 'Thanks. When, and what will it cover?')],
            coach: { kind: 'nudge', read: 'Communication', title: 'Try this instead', text: 'Jay had to ask again. Say what you will send, and by when.', try: 'Plan by 2pm: the trigger, the routing rules, and a test on last month of leads.' }, tick: [0] },
            fx: { coach: coach('Your plan is sound. Your update to Jay came late, and he had to ask again.', [], [{ t: 'Jay had to ask again after "ok will send it soon".', try: 'Say what you will send, and by when.' }], { Communication: 2, Understanding: 3 }) } },
          { ch: 's1', cap: 'The same slip, second time. The coach stops it before it sends.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'block',
            chat: [msg('mgr', 'How is the router coming along?')],
            block: { bad: 'done sending it', good: 'The router is built. It routes by region, then deal size, and replies from the named rep. Testing it on last month of leads now, done by 4pm.', why: 'Last time Jay had to ask again. "done sending it" does not tell him what is done.' },
            after: [msg('mgr', 'Perfect, that is what I needed.')],
            coach: { kind: 'praise', read: 'Communication', title: 'That is it', text: 'That is the update Jay was waiting for.' }, tick: [0] },
            fx: { coach: coach('You turned it around. Your second update told Jay what was done, what was next, and by when.', ['Your update to Jay: what is done, what is next, by when.'], [{ t: 'Jay had to ask again after "ok will send it soon".', try: 'Say what you will send, and by when.' }], { Communication: 3 }) } },
          { ch: 's1', cap: 'He submits. Jay sends feedback: two things to fix.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'submit',
            submit: msg('me', 'Here is the router plan.', { file: 'Routing plan.pdf' }),
            feedback: { say: 'Close. Two things stop me sending it up: there is no test on real leads, and you did not say what happens when no rep matches. Fix those and it is ready.', items: [
              { t: 'There is no test behind the 2 minutes', sev: 'HIGH', why: 'The plan says leads get a reply in under 2 minutes, but it was never run on real leads. Leadership will ask how you know.', how: 'Run it on the 1,200 leads from September and put the median reply time on page one.' },
              { t: 'Say what happens when no rep matches', sev: 'MEDIUM', why: 'Leads with no country have no rule.', how: 'Send them to the team lead, and say so.' }] },
            tick: [], fix: true } },
          { ch: 's1', cap: 'He fixes both and sends it again. Ready.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'resubmit',
            submit: msg('me', 'Fixed both: tested on 1,200 September leads, median 2 min 40 s. No match goes to the team lead.', { file: 'Routing plan v2.pdf' }),
            feedback: { say: 'Good. 2 minutes 40 is close enough to start. Ready.', items: [] }, tick: [1, 2], done: true } }
        ],
        present: ['Leads wait three hours ten for a first reply.', 'Most of it is manual triage.', 'The router gets them to a rep in about two and a half minutes.'],
        qa: 'I have not tested double volume yet. I think the workflow queues them, but I would want to check.',
        band: 'meeting',
        overview: 'The router works and the test on September leads backs it up. You found the number, but it took Jay two asks to get your plan, and in Q&A you had not tested double volume. Lead with the number and the test, and say what you have not checked yet.',
        liked: [['Your test on 1,200 real leads backed up the claim.', '2:30', 'QUALITY', 'MEETS']],
        work: [['Jay had to ask twice for your plan.', '0:00', 'COMMUNICATION', 'BELOW', 'MEETS'], ['You had not tested double volume.', '7:40', 'UNDERSTANDING', 'MEETS', 'EXCEEDS']],
        note: 'It works, and the test backs it up. I had to ask you twice where things were. Tell me before I ask, and test the edge cases before the meeting.',
        reviewCap: 'Jay grades it Meeting: 1,000 skill points. Level 1 to Level 2.',
        after: coach('Your work holds up. Your updates come late, and it showed in your grade. One habit fixes it: tell your manager where you are before they ask.', ['Your test on 1,200 real leads backed up the router.', 'Your second update told Jay what, by when.'], [{ t: 'Jay had to ask twice for your plan.', try: 'End each stage with one line: what is done, what is next, by when.' }, { t: 'You had not tested double volume before the meeting.', try: 'Test the edge case you would be asked about.' }], { Understanding: 3, Quality: 3, Communication: 3, Independence: 3, Speed: 3 })
      }),
      [home(1, 'Level 2. A new scenario is unlocked, and the coach has a new read.', { mode: 'unlocked', sc: 'waterfall', openCoach: true }),
       jobs(1, 'Jobs: Level 2 opens more internships. The portal plays its level up.', { levelUp: true })],
      Sn(2, { workCap: 'Notion. He asks before he tries, and sends it with a requirement missing.',
        chat: [msg('me', 'Which sources should I use?'), msg('me', 'And what order?'), msg('mgr', 'Both are in the brief, Sanjay.')],
        coach: { kind: 'nudge', read: 'Independence', title: 'Try first', text: 'Two of your questions were already in the brief.', try: 'Read the brief first, then ask the one thing it does not say.' },
        submit: msg('me', 'Waterfall done.', { file: 'Enrichment waterfall.pdf' }),
        feedback: { say: 'The cost per account is missing. That was one of three asks.', items: [{ t: 'Cost per account is missing', sev: 'HIGH', why: 'Finance needs it before they approve the spend.', how: 'Add one line: total cost divided by accounts filled.' }] },
        band: 'below', note: 'The waterfall works, but you left out the cost, and you asked me two things the brief already answered.',
        reviewCap: 'Below Expectations: 500 skill points. Still Level 2. Better work pays more.',
        after: coach('You are leaning on your manager for things the brief already answers, and it is costing you points. Try before you ask.', ['Your waterfall lifted verified emails.'], [{ t: 'Two of your questions were already in the brief.', try: 'Read the brief first, then ask the one thing it does not say.' }, { t: 'The cost per account was missing.', try: 'Check the brief line by line before you send.' }], { Independence: 2, Quality: 2 }) }),
      [home(2, 'No level up this time. The coach names the one thing to fix.', { mode: 'unlocked', sc: 'evals', openCoach: true })],
      Sn(3, { workCap: 'Shopify. He makes the call himself, and checks the brief before sending.',
        chat: [msg('me', 'I set the hold rule myself: anything the agent is not sure of waits for a person. Plan attached, tests by 3pm.'), msg('mgr', 'Good reasoning.')],
        coach: { kind: 'praise', read: 'Independence', title: 'Much better', text: 'You made the call and said why. That is the fix working.' },
        submit: msg('me', 'All three requirements: 50 cases, a no made up facts check, and the hold rule.', { file: 'Agent eval report.pdf' }),
        feedback: { say: 'All three requirements this time. Ready.', items: [] },
        band: 'exceeding', note: 'You made the calls yourself and covered the brief. This is the work I wanted.',
        reviewCap: 'Exceeding: 2,000 skill points. Level 2 to Level 4.',
        after: coach('You try before you ask now, and you check the brief before you send. Next: send your plan inside the hour.', ['You made the hold rule call yourself.', 'You covered all three requirements.'], [{ t: 'Your plan arrived late in the day.', try: 'Send a rough plan in the first hour.' }], { Independence: 4, Quality: 4 }) }),
      [jobs(3, 'Jobs at Level 4: analyst roles are open. He applies to two strong fits.', { levelUp: true, apply: 2, end: true, hold: 9000 })]
    ) };

  /* =============== WORST =============== */
  CASES.worst = { key: 'worst', name: 'Worst case', line: 'Stuck early, the coach pulls him through', end: 'Level 3 in three scenarios',
    beats: [].concat(
      S1({
        pop: ['Leads, I guess.', 'Not sure.', 'I will check it.'], popScore: 1,
        stage: [
          { ch: 's1', cap: 'The work. Sanjay pastes an AI paragraph to Jay. It goes, and the coach flags it.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'plan',
            chat: [msg('mgr', 'Morning. What is your plan for the router?'), msg('me', 'Great question! Lead routing is a critical part of any modern revenue organization. In this plan, I will leverage best practices to ensure seamless, efficient and scalable distribution of leads across the funnel.', { paste: true }), msg('mgr', 'Can you say that in two lines? What will you build first?')],
            coach: { kind: 'nudge', read: 'Communication', title: 'Try this instead', text: 'That reads like AI wrote it. Jay wants your plan, in your words.', try: 'Two lines: what you build first, and by when.' }, tick: [] },
            fx: { coach: coach('You move fast, but your first message read like AI wrote it. Say it in your own words; Jay wants to hear you.', [], [{ t: 'Your plan to Jay read like AI wrote it.', try: 'Let AI draft it, then cut it to two lines in your own words.' }], { Communication: 1 }) } },
          { ch: 's1', cap: 'He is stuck, and asks for help. Jay walks him through it, step by step.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'guided',
            stuck: true,
            guide: { say: 'Start with the trigger. Open the form in HubSpot and add a workflow that runs on submit, not a nightly sync.', callout: ['ONE TRIGGER, NOT A NIGHTLY SYNC', 'A nightly sync is why leads arrive the next day. A workflow on form submit runs the moment the lead arrives.'], code: '// route by region, then deal size\nIF region = "NA" AND seats >= 50 THEN rep = "Enterprise NA"', steps: ['Open the form workflow', 'Add the submit trigger', 'Map regions to reps', 'Add the deal size rule', 'Test on last month of leads'], at: 2, chips: ['Trigger added. Mapping regions now', 'Where is the territory map?'] },
            tick: [] } },
          { ch: 's1', cap: 'The same slip again. The coach holds it; Sanjay sends it anyway, and loses the target.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'block',
            chat: [msg('mgr', 'How is it coming along?')],
            block: { bad: 'done sent it', good: 'The trigger and the region rules are in. Adding deal size now, then I will test it on last month of leads by 4pm.', why: 'Last time Jay could not tell what you meant. "done sent it" does not tell him what is done.', anyway: true },
            after: [msg('mgr', 'Done with what, Sanjay? Tell me what is in and what is left.')],
            coach: { kind: 'praise', read: 'Communication', title: 'Much better', text: 'Two lines, in your own words. Jay got it right away.' }, tick: [0] },
            fx: { coach: coach('Better. Your update was clear this time. The router still needs deal size and a test.', ['Two lines, in your own words.'], [{ t: 'Your first plan read like AI wrote it.', try: 'Let AI draft it, then cut it to two lines in your own words.' }], { Communication: 2 }) } },
          { ch: 's1', cap: 'He submits too early. Jay sends three things to fix.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'submit',
            submit: msg('me', 'done', { file: 'Routing plan.pdf' }),
            feedback: { say: 'This is not ready. There is no test, deal size is missing from the rules, and leads with no match have nowhere to go.', items: [
              { t: 'There is no test behind it', sev: 'HIGH', why: 'Nothing shows the router works on real leads.', how: 'Run it on the 1,200 September leads and show the median reply time.' },
              { t: 'Deal size is missing from the rules', sev: 'HIGH', why: 'Big deals go to whoever is free.', how: 'Add the seats rule after region.' },
              { t: 'Say what happens when no rep matches', sev: 'MEDIUM', why: 'Leads with no country are dropped.', how: 'Send them to the team lead.' }] },
            tick: [], fix: true } },
          { ch: 's1', cap: 'He fixes the two big ones and sends it again. It passes, just.', screen: 'stage', d: { sc: 'router', stage: 'Routing plan', step: 'resubmit',
            submit: msg('me', 'Added the deal size rule and tested it on September leads: median 4 minutes.', { file: 'Routing plan v2.pdf' }),
            feedback: { say: 'Better. Deal size is in and there is a test. 4 minutes is not 2, but this works for now.', items: [] }, tick: [0, 1], done: true } }
        ],
        present: ['So, um, leads take a while.', 'Um, I built a router.', 'It is, um, about four minutes now.'],
        qa: 'I am not sure. I did not test that.',
        band: 'below',
        overview: 'The router works, at four minutes. You did not open with the number, the deck did not show where the wait comes from, and you had not tested volume. Lead with the one number, show the cause, then the fix.',
        liked: [['You fixed both high priority items before the meeting.', '1:10', 'QUALITY', 'BELOW']],
        work: [['You did not open with the number you were moving.', '0:00', 'DELIVERY', 'BELOW', 'MEETS'], ['You had not tested volume.', '6:50', 'UNDERSTANDING', 'BELOW', 'MEETS']],
        note: 'The router works, but it took three rounds of feedback to get there, and the plan I got first was not yours. Read the brief line by line, and tell me what you are doing in your own words.',
        reviewCap: 'Below Expectations: 500 skill points. Still Level 1. Better work pays more.',
        after: coach('You move fast, but your work goes out before it covers the brief. That one habit is holding you at Level 1. Read the brief line by line before you send, and the next one lands.', ['You fixed both high priority items.'], [{ t: 'You sent the plan before it covered the brief.', try: 'Read the brief line by line before you send.' }, { t: 'Your first message read like AI.', try: 'Let AI draft it, then cut it to two lines in your own words.' }], { Understanding: 2, Quality: 1, Communication: 2, Independence: 2, Speed: 3 })
      }),
      [home(1, 'Still Level 1. The coach names the one habit to fix.', { mode: 'unlocked', sc: 'waterfall', openCoach: true }),
       jobs(1, 'Jobs: still Level 1. Only the first internships are open.', {})],
      Sn(2, { workCap: 'Notion. He checks the brief line by line before sending. The coach sees it.',
        chat: [msg('me', 'Which sources should I use first?'), msg('mgr', 'They are in the brief, Sanjay.'), msg('me', 'Got it. I checked all three asks against the brief. Sending at 3pm.'), msg('mgr', 'And the cost per account?'), msg('me', '6 cents. Adding it now.')],
        coach: { kind: 'praise', read: 'Quality', title: 'That is the fix working', text: 'You checked the brief line by line. All three asks are covered.' },
        submit: msg('me', 'Waterfall: verified emails 54% to 86%, at 6 cents an account.', { file: 'Enrichment waterfall.pdf' }),
        feedback: { say: 'All three asks this time. Good.', items: [] },
        band: 'meeting', note: 'All three asks, and a clear update. Keep going.',
        reviewCap: 'Meeting: 1,000 skill points. Level 1 to Level 2.',
        after: coach('Your work covers the brief now, and your updates are clear. Next: try before you ask.', ['You checked the brief line by line.'], [{ t: 'You still ask before you try.', try: 'Make one decision alone, then ask.' }], { Quality: 3, Communication: 3 }) }),
      [home(2, 'Level 2. The next scenario is unlocked.', { mode: 'unlocked', sc: 'evals' }),
       jobs(2, 'Jobs: Level 2 opens more internships. The portal plays its level up.', { levelUp: true })],
      Sn(3, { workCap: 'Shopify. He asks before trying, then catches himself. The coach notices both.',
        chat: [msg('me', 'Should the agent hold or send when it is unsure?'), msg('mgr', 'What do you think?'), msg('me', 'Hold. A wrong email to a customer costs more than a late one.')],
        coach: { kind: 'praise', read: 'Independence', title: 'Your call', text: 'You answered your own question with a reason. Do that first next time.' },
        submit: msg('me', 'Eval report: 42 of 50 pass, the rest are held.', { file: 'Agent eval report.pdf' }),
        feedback: { say: 'Good. The hold rule is right.', items: [] },
        band: 'meeting', note: 'Steady work, and you made the call on the hold rule yourself. Keep going.',
        reviewCap: 'Meeting: 1,000 skill points. Level 3.',
        after: coach('Your work covers the brief and your updates are clear. You are making your own calls now. Keep going.', ['You made the hold rule call yourself.'], [{ t: 'You asked before you answered your own question.', try: 'Decide first, then share your reason.' }], { Independence: 3, Quality: 3 }) }),
      [jobs(3, 'Jobs at Level 3: analyst roles open. He applies to his first role.', { levelUp: true, apply: 1, end: true, hold: 9000 })]
    ) };


  /* ================= the coach layer (b9) =================
     The coach has one job: earn Sanjay skill points. Each scenario has three targets, the three things the manager grades.
     Targets hit decide the band: 3 = Exceptional 3,000, 2 = Exceeding 2,000, 1 = Meeting 1,000, 0 = Below 500.
     The coach PAUSES the app (freeze) only when points are at stake: the first time, a strike, a lost target, a save, and why you got your points.
     Wins and tips are short notes. Opening the coach answers: how do I get more skill points, and how do I level up faster. */
  var TG = {
    router: [
      { id: 'upd', t: 'Every update tells Jay what is done, what is next, and by when', short: 'Clear updates', how: 'One message: what you built, what comes next, and the time.' },
      { id: 'test', t: 'Back the 2 minutes with a test on real leads before you send', short: 'Tested before sending', how: 'Run it on the 1,200 September leads. Put the median on page one.' },
      { id: 'ready', t: 'Walk into the meeting ready for the hard question', short: 'Ready for the hard question', how: 'Test the edge cases first: double volume, no match, rep away.' }
    ],
    waterfall: [
      { id: 'try', t: 'Try before you ask: only ask what the brief does not answer', short: 'Try before you ask', how: 'Read the brief first. Ask the one thing it does not say.' },
      { id: 'brief', t: 'Cover every ask in the brief before you send', short: 'Every ask covered', how: 'Check the three asks line by line before you press send.' },
      { id: 'cost', t: 'Give Esther the cost before she asks', short: 'Cost up front', how: 'One line: total cost divided by accounts filled.' }
    ],
    evals: [
      { id: 'pace', t: 'Send a rough plan inside the first hour', short: 'Plan inside the hour', how: 'Give the plan 45 minutes, then send what you have.' },
      { id: 'call', t: 'Make the send or hold call yourself, with a reason', short: 'Your call, your reason', how: 'Decide, then tell Daniel why in one line.' },
      { id: 'cases', t: '50 test cases, and no made up facts in any of them', short: '50 clean cases', how: 'Check every fact against the account record before it ships.' }
    ]
  };
  var LADDER = [500, 1000, 2000, 3000];
  function upTo(t) { if (!t) return 0; var h = 0, open = 0; for (var k in t.s) { var v = t.s[k]; if (v === 'hit') h++; else if (v !== 'lost') open++; } return LADDER[h + open]; }
  function floorOf(t) { if (!t) return 0; var h = 0; for (var k in t.s) if (t.s[k] === 'hit') h++; return LADDER[h]; }

  function F(kind, o) { o.freeze = true; o.kind = kind; return o; }
  var INTRO = F('intro', { title: 'Hi Sanjay, I am Navid, your coach.', text: 'Jay is your manager: he gives you the work and grades it. I am on your team: my job is to get you skill points, so you level up and unlock roles. I only stop you when points are at stake.', targets: true, ladder: true, lead: 'This one is worth up to 3,000. Finish and you get 500; every target you hit moves you up.' });

  var LAYER = {
    best: [
      { m: { ch: 's1', screen: 'home' }, post: INTRO, fx: { coachOn: true, track: 'router' } },
      { m: { ch: 's1', step: 'plan' }, coach: { kind: 'on', title: 'On track: clear updates', text: 'Jay knew the plan before he asked. Keep every update like that.' }, tgt: { upd: 'on' } },
      { m: { ch: 's1', step: 'test' }, coach: { kind: 'hit', title: 'Target hit: tested before sending', text: '1 of 3 locked in. Your floor is now 1,000.' }, tgt: { test: 'hit' } },
      { m: { ch: 's1', step: 'submit' }, coachAfter: { kind: 'hit', title: 'Target hit: clear updates', text: '2 of 3 locked in. Your floor is now 2,000.' }, tgt: { upd: 'hit' } },
      { m: { ch: 's1', screen: 'qa' }, toast: { kind: 'hit', title: 'Target hit: ready for the hard question', text: '3 of 3. That is the 3,000 band.' }, tgt: { ready: 'hit' } },
      { m: { ch: 's1', screen: 'review' }, post: F('post', { title: 'You earned 3,000.', text: 'All three targets. That is why Jay gave you Exceptional, and why you jumped to Level 4.', targets: 'last', next: 'Next, Notion: same three habits, new manager.' }) },
      { m: { ch: 's2', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 in Notion.', text: 'Esther grades three things. Hit all three again and you are Level 7. Clear updates is a habit now, so I will stop reminding you.', targets: true }), fx: { track: 'waterfall' } },
      { m: { ch: 's2', screen: 'stage' }, coach: { kind: 'hit', title: 'Three for three', text: 'You chose the order yourself, covered every ask, and gave the cost first.' }, tgt: { try: 'hit', brief: 'hit', cost: 'hit' } },
      { m: { ch: 's2', screen: 'review' }, post: F('post', { title: 'You earned 3,000 again.', text: 'Three for three. GTM Engineer roles are open to you now.', targets: 'last', next: 'Next, Shopify: watch your pace.' }) },
      { m: { ch: 's3', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 at Shopify.', text: 'One habit to watch: your plans take close to three hours. Here that is a target.', targets: true }), fx: { track: 'evals' } },
      { m: { ch: 's3', screen: 'stage' }, coach: F('lost', { title: 'Target lost: plan inside the hour', text: 'The plan took close to three hours. That cost you 1,000. The other two are locked in.', try: 'Give the plan 45 minutes, then send what you have.' }), tgt: { pace: 'lost', call: 'hit', cases: 'hit' } },
      { m: { ch: 's3', screen: 'review' }, post: F('post', { title: 'You earned 2,000.', text: 'Two of three. The 1,000 you left was pace, nothing else. Senior roles are open at Level 9.', targets: 'last' }) }
    ],
    mid: [
      { m: { ch: 's1', screen: 'home' }, post: INTRO, fx: { coachOn: true, track: 'router' } },
      { m: { ch: 's1', step: 'plan' }, coach: { kind: 'miss', title: 'Strike one: Jay had to ask again', text: 'It did not say what, or when. One more and clear updates is gone: that is 1,000.', try: 'Plan by 2pm: the trigger, the routing rules, and a test on last month of leads.', ms: 9000 }, tgt: { upd: 'strike' } },
      { m: { ch: 's1', step: 'block' }, coach: F('save', { title: 'Saved: 1,000 kept', text: 'That send was your second strike. The update you sent instead says what is in, what is next, and when. Clear updates is still alive.' }) },
      { m: { ch: 's1', step: 'submit' }, coachAfter: F('lost', { id: 'test', title: 'Target lost: tested before sending', text: 'Jay found the missing test, not you. That cost you 1,000.', try: 'Before the meeting, test the edge cases Avery will ask about: double volume, no match.' }), tgt: { test: 'lost' } },
      { m: { ch: 's1', step: 'resubmit' }, coachAfter: { kind: 'hit', title: 'Target hit: clear updates', text: 'After one strike. 1 of 3 locked in: your floor is 1,000.' }, tgt: { upd: 'hit' } },
      { m: { ch: 's1', screen: 'report' }, pre: F('lost', { id: 'ready', title: 'Target lost: ready for the hard question', text: 'Avery asked about double volume and you had not tested it. That cost you 1,000.', try: 'Before every final meeting, test the one edge case you would be asked about.' }), fx: { tgt: { ready: 'lost' } } },
      { m: { ch: 's1', screen: 'review' }, post: F('post', { title: 'You earned 1,000.', text: 'You left 2,000 on the table: the test and the hard question. Both are one habit: check it before someone else does.', targets: 'last', next: 'Next, Notion: hit 2 of 3 and you are Level 4.' }) },
      { m: { ch: 's2', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 in Notion.', text: 'Last time, checking cost you 2,000. Here it is target two.', targets: true }), fx: { track: 'waterfall' } },
      { m: { ch: 's2', screen: 'stage' }, coach: { kind: 'miss', title: 'Both questions were in the brief', text: 'Try before you ask is worth 1,000 here. Read it first, then ask the one thing it does not say.' }, coachAfter: F('lost', { title: 'All three targets lost here', text: 'Both questions were in the brief, the cost per account was missing, and Esther had to send it back. That is 2,500 left on the table.', try: 'Read the brief first. Then ask the one thing it does not say.' }), tgt: { try: 'lost', brief: 'lost', cost: 'lost' } },
      { m: { ch: 's2', screen: 'review' }, post: F('post', { title: 'You earned 500.', text: 'Still Level 2. One habit fixes most of it: try before you ask, and check the brief before you send.', targets: 'last' }) },
      { m: { ch: 's3', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 at Shopify.', text: 'Last time asking first cost you. Here that is the call target: make it yourself.', targets: true }), fx: { track: 'evals' } },
      { m: { ch: 's3', screen: 'stage' }, coach: { kind: 'hit', title: 'Target hit: your call, your reason', text: 'You set the hold rule yourself. That is the fix working.' }, coachAfter: F('lost', { id: 'pace', title: 'One target lost: plan inside the hour', text: 'Your plan came in late in the day. The other two are locked in: 2,000.', try: 'Send a rough plan in the first hour.' }), tgt: { pace: 'lost', call: 'hit', cases: 'hit' } },
      { m: { ch: 's3', screen: 'review' }, post: F('post', { title: 'You earned 2,000.', text: 'Two of three, and Level 4. Analyst roles are open to you.', targets: 'last' }) }
    ],
    worst: [
      { m: { ch: 's1', screen: 'home' }, post: INTRO, fx: { coachOn: true, track: 'router' } },
      { m: { ch: 's1', screen: 'kickSlides' }, lateNotes: { kind: 'tip', title: 'No notes in the problem yet', text: 'Write down the numbers Jay gives you. The check right after this asks about them.' } },
      { m: { ch: 's1', step: 'plan' }, coach: { kind: 'miss', title: 'Strike one: that reads like AI wrote it', text: 'Jay could not tell what you build first, or when. One more and clear updates is gone: that is 1,000.', try: 'Two lines, your words: what you build first, and by when.', ms: 9000 }, tgt: { upd: 'strike' } },
      { m: { ch: 's1', step: 'guided' }, toast: { kind: 'tip', title: 'Asking for help costs nothing', text: 'Being stuck is fine. Staying stuck is what costs points.' } },
      { m: { ch: 's1', step: 'block' }, coach: F('lost', { id: 'upd', title: 'Target lost: clear updates', text: 'That was your second strike, and you sent it anyway. That cost you 1,000.', try: 'When I hold a send, use what I suggest. It is there to keep your points.' }), tgt: { upd: 'lost' } },
      { m: { ch: 's1', step: 'submit' }, coachAfter: F('lost', { id: 'test', title: 'Target lost: tested before sending', text: 'You sent "done" with no test behind it. That cost you 1,000.', try: 'Keep the last one: test the edge cases before the meeting.' }), tgt: { test: 'lost' } },
      { m: { ch: 's1', screen: 'present' }, live: [{ at: 7000, kind: 'tip', title: 'That is three ums in a minute', text: 'Pause instead. A pause sounds sure; an um sounds unsure.' }] },
      { m: { ch: 's1', screen: 'report' }, pre: F('lost', { id: 'ready', title: 'Target lost: ready for the hard question', text: 'Avery asked about volume and you had not tested it. That cost you 500.', try: 'Before every final meeting, test the one thing you would be asked.' }), fx: { tgt: { ready: 'lost' } } },
      { m: { ch: 's1', screen: 'review' }, post: F('post', { title: 'You earned 500.', text: 'You left 2,500 on the table. One habit cost you the most: sending before it covers the brief.', targets: 'last', next: 'Next, Notion: cover every ask before you send. That alone is worth 1,000.' }) },
      { m: { ch: 's2', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 in Notion.', text: 'Get one habit right first: cover every ask before you send. That alone gets you to Level 2.', targets: true }), fx: { track: 'waterfall' } },
      { m: { ch: 's2', screen: 'stage' }, coach: { kind: 'hit', title: 'Target hit: every ask covered', text: 'You checked the brief line by line. 1,000 locked in.' }, coachAfter: F('lost', { title: 'One hit, two lost', text: 'The sources were in the brief, and Esther had to ask for the cost.', try: 'Decide first, then share your reason. Say the cost before anyone asks.' }), tgt: { try: 'lost', brief: 'hit', cost: 'lost' } },
      { m: { ch: 's2', screen: 'review' }, post: F('post', { title: 'You earned 1,000.', text: 'Level 2. That is last time’s habit, fixed.', targets: 'last', next: 'Next, Shopify: make the call yourself.' }) },
      { m: { ch: 's3', screen: 'home', mode: 'enter' }, post: F('pre', { title: 'Up to 3,000 at Shopify.', text: 'Last time you asked before you tried. Here that is the call target: make it yourself.', targets: true }), fx: { track: 'evals' } },
      { m: { ch: 's3', screen: 'stage' }, coach: { kind: 'hit', title: 'Target hit: your call, your reason', text: 'You answered your own question with a reason. Next time, lead with it.' }, coachAfter: F('lost', { title: 'Two targets lost', text: 'The plan came late, and 8 of 50 cases failed the facts check.', try: 'Check every fact against the account record before it ships.' }), tgt: { pace: 'lost', call: 'hit', cases: 'lost' } },
      { m: { ch: 's3', screen: 'review' }, post: F('post', { title: 'You earned 1,000.', text: 'Level 3, and analyst roles are open. You make your own calls now. Next: pace.', targets: 'last' }) }
    ]
  };
  function matches(b, m) {
    for (var k in m) {
      var v = k === 'step' ? b.d && b.d.step : k === 'mode' ? b.d && b.d.mode : b[k];
      if (v !== m[k]) return false;
    }
    return true;
  }
  function applyLayer(key) {
    var beats = CASES[key].beats, used = {};
    LAYER[key].forEach(function (r, ri) {
      for (var i = 0; i < beats.length; i++) {
        var b = beats[i];
        if (!matches(b, r.m) || used[ri]) continue;
        used[ri] = 1;
        b.d = b.d || {};
        if (r.coach !== undefined) b.d.coach = r.coach;
        if (r.coachAfter) b.d.coachAfter = r.coachAfter;
        if (r.pre) b.pre = r.pre;
        if (r.post) b.post = r.post;
        if (r.toast) b.toast = r.toast;
        if (r.live) b.live = r.live;
        if (r.lateNotes) b.d.lateNotes = r.lateNotes;
        if (r.fx || r.tgt) { b.fx = b.fx || {}; var f = r.fx || {}; for (var k in f) b.fx[k] = f[k]; if (r.tgt) b.fx.tgt = r.tgt; }
        b.d.openCoach = b.d.openCoach;
        break;
      }
      if (!used[ri]) throw new Error('coach layer: no beat for ' + key + ' ' + JSON.stringify(r.m));
    });
  }
  ['best', 'mid', 'worst'].forEach(applyLayer);
  /* the home after each scenario opens the coach: the reactive question, how do I level up faster */
  ['best', 'mid', 'worst'].forEach(function (k) { CASES[k].beats.forEach(function (b) { if (b.screen === 'home' && b.d && b.d.mode === 'unlocked') b.d.openCoach = true; }); });

  /* the levels, from the portal's real roles */
  (window.ZROLES || []).forEach(function (r) { var L = LEVELS[r.n - 1]; if (L) { L.roles = r.count; L.kind = r.kind; L.pay = r.pay; L.top = r.top; } });

  /* the coach's read before anything has happened */
  var START = { pts: 0, think: 'I have not seen you work yet. I will start reading you in your first scenario, and tell you what I see as it happens.', like: [], fix: [], reads: {} };

  window.ZD = { TG: TG, LADDER: LADDER, upTo: upTo, floorOf: floorOf, A: A, ME: ME, COACH: COACH, COACHES: COACHES, CO: CO, LEVELS: LEVELS, levelOf: levelOf, startOf: startOf, BANDS: BANDS, band: band, P: P, SC: SC, ROAD: ROAD, CASES: CASES, START: START,
    PORTAL: A + 'portal.html' };
})();
