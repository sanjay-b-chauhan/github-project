/* Zero home b5: the level, the coach, and a live simulation of a learner's first weeks (best, mid, worst).
   Companies are real (GTM roles posted in October 2026); counts per level and the points engine are stand-ins. */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  var PORTAL = 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html';
  var COACH = { name: 'Navid', photo: A + 'navid.jpg' };

  var CO = {
    basepower: ['Base Power', 'png'], peec: ['Peec AI', 'png'], lyft: ['Lyft', 'svg', '#FF00BF'], newrelic: ['New Relic', 'svg', '#1D252C'],
    datadog: ['Datadog', 'svg', '#632CA6'], lansweeper: ['Lansweeper', 'png'], ashby: ['Ashby', 'png'], doordash: ['DoorDash', 'svg', '#FF3008'],
    jobber: ['Jobber', 'png'], wealthsimple: ['Wealthsimple', 'png'], boulevard: ['Boulevard', 'png'], growtherapy: ['Grow Therapy', '', '#2E7D5B'],
    dnsfilter: ['DNSFilter', '', '#1F6FEB'], plaid: ['Plaid', 'png'], toast: ['Toast', '', '#FF4C00'], zip: ['Zip', 'png'], eliseai: ['EliseAI', 'png'],
    faire: ['Faire', 'png'], dualentry: ['DualEntry', 'png'], digitalocean: ['DigitalOcean', 'svg', '#0080FF'], attio: ['Attio', '', '#111113'],
    warp: ['Warp', 'png'], workos: ['WorkOS', 'png'], clay: ['Clay', 'png'], baseten: ['Baseten', 'png'], siro: ['Siro', 'png'], rogo: ['Rogo', 'png'],
    modal: ['Modal', 'svg', '#111113'], langchain: ['LangChain', 'svg', '#1C3C3C'], motive: ['Motive', 'png'], navan: ['Navan', '', '#111113'],
    upside: ['Upside', 'png'], cloudflare: ['Cloudflare', 'svg', '#F38020'], vanta: ['Vanta', 'png'], onepassword: ['1Password', 'svg', '#0572EC'],
    samsara: ['Samsara', '', '#0A2240'], mongodb: ['MongoDB', 'svg', '#00684A'], adyen: ['Adyen', 'svg', '#0ABF53'], anthropic: ['Anthropic', 'svg', '#D97757'],
    openai: ['OpenAI', 'svg', '#111113'], ramp: ['Ramp', 'png'], stripe: ['Stripe', 'svg', '#635BFF'], figma: ['Figma', 'svg', '#1E1E1E'],
    rippling: ['Rippling', 'png'], perplexity: ['Perplexity', 'svg', '#20808D'], hubspot: ['HubSpot', 'svg', '#FF7A59'], notion: ['Notion', 'svg', '#111113'],
    shopify: ['Shopify', 'svg', '#5E8E3E'], zendesk: ['Zendesk', '', '#03363D']
  };

  var LEVELS = [
    { n: 1, roles: 12, kind: 'Internships', pay: '$6k a month', cos: ['peec', 'basepower', 'lyft'] },
    { n: 2, roles: 18, kind: 'Internships', pay: '$6k a month', cos: ['lyft', 'peec', 'basepower'] },
    { n: 3, roles: 30, kind: 'Analyst roles', pay: '$95k to $133k', cos: ['newrelic', 'datadog', 'lansweeper'] },
    { n: 4, roles: 40, kind: 'Analyst roles', pay: '$100k to $162k', cos: ['ashby', 'doordash', 'jobber', 'wealthsimple', 'peec'] },
    { n: 5, roles: 50, kind: 'Associate roles', pay: '$114k to $179k', cos: ['boulevard', 'growtherapy', 'dnsfilter'] },
    { n: 6, roles: 60, kind: 'GTM Engineer', pay: '$100k to $200k', cos: ['plaid', 'zip', 'toast', 'eliseai', 'faire', 'dualentry'] },
    { n: 7, roles: 55, kind: 'GTM Engineer', pay: '$120k to $200k', cos: ['attio', 'workos', 'digitalocean', 'warp'] },
    { n: 8, roles: 45, kind: 'GTM Engineer', pay: '$140k to $250k', cos: ['clay', 'modal', 'langchain', 'baseten', 'navan', 'motive'] },
    { n: 9, roles: 30, kind: 'Senior roles', pay: '$113k to $309k', cos: ['cloudflare', 'vanta', 'onepassword', 'adyen', 'mongodb', 'samsara'] },
    { n: 10, roles: 20, kind: 'Top of the field', pay: '$127k to $405k', cos: ['anthropic', 'openai', 'ramp', 'stripe', 'figma', 'perplexity'] }
  ];

  /* how a scenario is graded, and what it pays */
  var GRADES = [
    { key: 'Under', name: 'Underperforming', pts: 0 },
    { key: 'Below', name: 'Below', pts: 500 },
    { key: 'Meeting', name: 'Meeting', pts: 1000 },
    { key: 'Exceeding', name: 'Exceeding', pts: 2000 },
    { key: 'Exceptional', name: 'Exceptional', pts: 3000 }
  ];

  /* what the coach reads, after every stage. Shown as chips; a chip opens to what it saw. */
  var READS = [
    { key: 'Communication', short: 'Communication', icon: 'chat' },
    { key: 'Independence', short: 'Independence', icon: 'shield' },
    { key: 'Quality', short: 'Quality', icon: 'star' },
    { key: 'Speed', short: 'Speed', icon: 'clock' }
  ];

  var SC = {
    hubspot: { co: 'hubspot', title: 'Inbound lead router', mgr: 'Priya' },
    notion: { co: 'notion', title: 'Enrichment waterfall', mgr: 'Leo' },
    shopify: { co: 'shopify', title: 'Outbound agent with evals', mgr: 'Sam' },
    stripe: { co: 'stripe', title: 'Intent signal scoring', mgr: 'Dana' },
    zendesk: { co: 'zendesk', title: 'Renewal risk agent', mgr: 'Mia' }
  };

  /* the resting state: Sanjay at Level 2, so the page has something to show before a simulation */
  var REST = {
    pts: 2500, done: ['hubspot', 'notion', 'stripe'], usual: 'Meeting',
    think: 'You build things that work, and your Stripe model was your best so far. Your updates reach your manager late. Fix that one habit and Level 3 is one scenario away.',
    when: 'After Intent signal scoring at Stripe',
    reads: {
      Communication: { v: 2, saw: 'Dana asked for your plan twice.', tip: 'End each stage with one line: what is done, what is next, by when.' },
      Independence: { v: 3, saw: 'Two of your four questions were already in the brief.', tip: 'Read the brief first, then ask the one thing it does not say.' },
      Quality: { v: 4, saw: 'You tested the model on last quarter before sending it.' },
      Speed: { v: 3, saw: 'Plan in 1 h 10 m, build in 2 h. On pace.' }
    },
    notes: [
      { kind: 'nudge', title: 'Try this instead', text: 'Dana asked for your plan twice. End each stage with one line: done, next, by when.', ago: '2 h' },
      { kind: 'praise', title: 'Great work', text: 'You tested the model on last quarter before you sent it.', ago: '3 h' }
    ]
  };

  /* ---------- the simulations ----------
     Each starts from day one (Level 0). Steps play in order; `at` is seconds from the start.
     work = what he is doing right now; note = a coach notification (nudge, praise, cheer);
     done = a scenario finishes with a grade; think = the coach's longer read updates. */
  function work(at, sc, stage) { return { at: at, type: 'work', sc: sc, stage: stage }; }
  function note(at, kind, title, text, read, v, saw, tip) { return { at: at, type: 'note', kind: kind, title: title, text: text, read: read, v: v, saw: saw, tip: tip }; }
  function done(at, sc, grade) { return { at: at, type: 'done', sc: sc, grade: grade }; }
  function think(at, text) { return { at: at, type: 'think', text: text }; }

  var SIMS = {
    best: { label: 'Best case', usual: 'Exceptional', steps: [
      work(0.5, 'hubspot', 'Kickoff'),
      note(4, 'praise', 'Great start', 'You asked the one question the brief did not answer. Sharp.', 'Independence', 4, 'One question in the kickoff, and it was not in the brief.'),
      think(6, 'Early read: you read the brief before you asked anything. That is a strong start. I will tell you more after your plan.'),
      work(8, 'hubspot', 'Plan'),
      note(11, 'praise', 'Great work', 'You told Priya your plan before she asked. That is the habit.', 'Communication', 4, 'Plan sent to Priya before she asked.'),
      work(15, 'hubspot', 'Build'),
      note(18, 'praise', 'Right the first time', 'You tested the router on last month of leads before sending.', 'Quality', 5, 'Tested on 1,200 past leads before sending.'),
      done(23, 'hubspot', 'Exceptional'),
      think(25, 'You plan before you build and you keep your manager in the loop. That is rare this early. Keep the pace and the senior roles come fast.'),
      work(31, 'notion', 'Plan'),
      note(34, 'nudge', 'A small one', 'The plan is good. Send it sooner, a rough draft is fine.', 'Speed', 3, 'Plan took 1 h 40 m.', 'Give the plan 45 minutes, then send what you have.'),
      work(38, 'notion', 'Build'),
      note(41, 'praise', 'That landed', 'You sent the draft in 40 minutes this time. Exactly right.', 'Speed', 4, 'Plan draft in 40 minutes.'),
      done(46, 'notion', 'Exceptional'),
      work(54, 'stripe', 'Build'),
      note(57, 'praise', 'You made the call', 'You picked the scoring weights yourself and said why.', 'Independence', 5, 'Set the weights and explained them to Dana.'),
      done(62, 'stripe', 'Exceeding'),
      think(64, 'Three scenarios, every requirement met, and your manager always knows where you are. GTM Engineer roles are open to you now.')
    ] },
    mid: { label: 'Mid case', usual: 'Meeting', steps: [
      work(0.5, 'hubspot', 'Plan'),
      note(4, 'nudge', 'Try this instead', 'Priya had to ask for your plan. End each stage with one line: done, next, by when.', 'Communication', 2, 'Priya asked for the plan once.', 'End each stage with one line: what is done, what is next, by when.'),
      think(6, 'Early read: your plan is clear, and your update came late. That is the one thing to watch.'),
      work(8, 'hubspot', 'Build'),
      note(11, 'praise', 'Good call', 'You tested it on last month of leads before sending.', 'Quality', 4, 'Tested on past leads before sending.'),
      done(15, 'hubspot', 'Meeting'),
      think(17, 'Your first scenario landed at Meeting. Your work holds up; your updates still come after Priya asks.'),
      work(21, 'notion', 'Plan'),
      note(24, 'nudge', 'Same thing again', 'Leo asked where you were. Send the update before he does.', 'Communication', 2, 'Second scenario where your manager had to ask.', 'One line at the end of every stage: done, next, by when.'),
      note(28, 'nudge', 'Before you ask', 'Two of your questions were already in the brief. Read it first.', 'Independence', 2, 'Two of four questions were in the brief.', 'Read the brief first, then ask the one thing it does not say.'),
      done(32, 'notion', 'Below'),
      think(34, 'You build things that work. Your updates come late, and it is costing you points. One habit fixes it: tell your manager where you are before they ask.'),
      work(40, 'shopify', 'Plan'),
      note(43, 'praise', 'That is it', 'You updated Sam before he asked. Keep doing that.', 'Communication', 3, 'Update sent to Sam before he asked.'),
      work(47, 'shopify', 'Test'),
      note(50, 'praise', 'Your call, your reason', 'You chose the hold rule yourself and explained it.', 'Independence', 3, 'Decided the hold rule alone.'),
      done(54, 'shopify', 'Exceeding'),
      work(60, 'stripe', 'Plan'),
      note(63, 'cheer', 'Keep going', 'Two good scenarios in a row. Your updates are on time now.', 'Communication', 4, 'Updates on time, two scenarios running.'),
      done(67, 'stripe', 'Meeting'),
      think(69, 'Your updates are on time now and your work holds up. The next step is pace: send your plan inside the hour.')
    ] },
    worst: { label: 'Worst case', usual: 'Below', steps: [
      work(0.5, 'hubspot', 'Plan'),
      note(4, 'nudge', 'Try this instead', 'That message reads like AI wrote it. Say it in two lines, in your own words.', 'Communication', 1, 'Pasted a long AI paragraph into the chat.', 'Let AI draft it, then cut it to two lines in your own words.'),
      think(6, 'Early read: you move fast. Slow down a little and say things in your own words; your manager wants to hear you, not the AI.'),
      work(8, 'hubspot', 'Build'),
      note(11, 'nudge', 'Check the brief', 'Deal size is missing from the routing. Priya asked for it.', 'Quality', 1, 'Sent with one of three requirements missing.', 'Read the brief line by line before you send.'),
      done(15, 'hubspot', 'Below'),
      think(17, 'Your first scenario came in Below: a requirement was missing. Read the brief line by line and the next one lands.'),
      work(21, 'notion', 'Build'),
      note(24, 'nudge', 'One more time', 'Cost per account is missing. That was one of three asks.', 'Quality', 1, 'Second scenario with a requirement missing.', 'Read the brief line by line before you send.'),
      done(28, 'notion', 'Under'),
      think(30, 'You move fast, but your work goes out before it covers the brief. That one habit is holding you at Level 0. Read the brief line by line before you send, and the next one lands.'),
      note(33, 'cheer', 'You can do this', 'Slow starts are normal. One fix and your next scenario lands.', null),
      work(38, 'shopify', 'Test'),
      note(41, 'praise', 'That is the fix working', 'All three requirements met this time. Great work.', 'Quality', 3, 'All three requirements in the submission.'),
      note(45, 'praise', 'Much better', 'Two lines, in your own words. Sam got it right away.', 'Communication', 3, 'Short, clear update to Sam.'),
      done(49, 'shopify', 'Meeting'),
      work(55, 'zendesk', 'Plan'),
      note(58, 'nudge', 'Try first', 'You asked before you tried. Make one call on your own.', 'Independence', 2, 'Three questions before starting.', 'Make one decision alone, then ask.'),
      done(62, 'zendesk', 'Meeting'),
      think(64, 'Your work covers the brief now and your updates are clear. Next: try before you ask. You are on your way.')
    ] }
  };

  window.HD = { A: A, PORTAL: PORTAL, COACH: COACH, CO: CO, LEVELS: LEVELS, GRADES: GRADES, READS: READS, SC: SC, REST: REST, SIMS: SIMS };
})();
