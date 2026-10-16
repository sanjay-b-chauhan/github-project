/* Zero home b4: one pill for the level and the coach. Plain data.
   Companies are real (GTM roles posted in October 2026); counts per level and the points engine are stand-ins. */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  var PORTAL = 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html';

  var ME = { name: 'Sanjay Chauhan', first: 'Sanjay', photo: A + 'sanjay.jpg' };
  /* the coach has a face: Navid */
  var COACH = { name: 'Navid', photo: A + 'navid.jpg' };

  /* logos: svg = a one colour mark in its brand colour, png = the company's own icon, '' = a letter */
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

  /* every level: where it starts, how many roles it opens, what they are, the pay, and who is hiring */
  var LEVELS = [
    { n: 1, pts: 1000, roles: 12, kind: 'Internships', pay: '$6k a month', cos: ['peec', 'basepower', 'lyft'] },
    { n: 2, pts: 2000, roles: 18, kind: 'Internships', pay: '$6k a month', cos: ['peec', 'basepower', 'lyft'] },
    { n: 3, pts: 3000, roles: 30, kind: 'Analyst roles', pay: '$95k to $133k', cos: ['newrelic', 'datadog', 'lansweeper'] },
    { n: 4, pts: 4000, roles: 40, kind: 'Analyst roles', pay: '$100k to $162k', cos: ['ashby', 'doordash', 'peec', 'jobber', 'wealthsimple'] },
    { n: 5, pts: 5000, roles: 50, kind: 'Associate roles', pay: '$114k to $179k', cos: ['boulevard', 'growtherapy', 'dnsfilter'] },
    { n: 6, pts: 6000, roles: 60, kind: 'GTM Engineer', pay: '$100k to $200k', cos: ['plaid', 'toast', 'zip', 'eliseai', 'faire', 'dualentry'] },
    { n: 7, pts: 7000, roles: 55, kind: 'GTM Engineer', pay: '$120k to $200k', cos: ['digitalocean', 'attio', 'warp', 'workos'] },
    { n: 8, pts: 8000, roles: 45, kind: 'GTM Engineer', pay: '$140k to $250k', cos: ['clay', 'modal', 'langchain', 'baseten', 'siro', 'rogo', 'motive', 'navan', 'upside'] },
    { n: 9, pts: 9000, roles: 30, kind: 'Senior roles', pay: '$113k to $309k', cos: ['cloudflare', 'vanta', 'onepassword', 'adyen', 'samsara', 'mongodb', 'toast', 'lyft'] },
    { n: 10, pts: 10000, roles: 20, kind: 'Top of the field', pay: '$127k to $405k', cos: ['anthropic', 'openai', 'ramp', 'stripe', 'figma', 'rippling', 'perplexity', 'datadog'] }
  ];

  /* skill points per finished scenario, by how the manager grades it */
  var PAY = [
    { name: 'Below', pts: 500, c: '#EBA640' },
    { name: 'Meeting', pts: 1000, c: '#D9A93A' },
    { name: 'Exceeding', pts: 2000, c: '#46A056' },
    { name: 'Exceptional', pts: 3000, c: '#18743C' }
  ];

  /* the four things the coach reads, after every stage */
  var READS = [
    { key: 'Communication', icon: 'chat' }, { key: 'Independence', icon: 'shield' },
    { key: 'Quality', icon: 'star' }, { key: 'Speed', icon: 'clock' }
  ];

  /* a read: v = 1 to 5 (0 = not seen yet), t = trend since the last scenario (1 up, -1 down, 0 same),
     line = what the coach thinks, saw = what it saw, tip = what to try (only where there is something to fix) */
  function r(v, t, line, saw, tip) { return { v: v, t: t, line: line, saw: saw, tip: tip }; }

  var STATES = {
    new: {
      label: 'New', pts: 0, done: [],
      coach: {
        think: 'I have not seen you work yet.', when: 'Before your first scenario',
        reads: { Communication: r(0), Independence: r(0), Quality: r(0), Speed: r(0) },
        next: 'Finish your first scenario to reach Level 1.'
      },
      play: [
        { kind: 'stage', when: 'After Plan at HubSpot, just now', think: 'Good start. Your plan was clear and your update came late.',
          reads: { Communication: r(2, 0, 'Your update came after Priya asked.', 'Priya asked for the plan once.', 'End each stage with one line: what is done, what is next, by when.'),
                   Independence: r(3, 0, 'You tried before you asked.', 'One question, not in the brief.'),
                   Quality: r(3, 0, 'Covers the brief.', 'All three requirements in the plan.'),
                   Speed: r(3, 0, 'On pace.', 'Plan in 1 h 5 m.') }, focus: 'Communication' },
        { kind: 'scenario', band: 'Meeting', pts: 1000, co: 'hubspot', when: 'After Inbound lead router at HubSpot',
          think: 'You finished your first scenario. Level 1 opens your first internships.', next: '1,000 more skill points to Level 2.' }
      ]
    },
    l2: {
      label: 'Level 2', pts: 2500, done: ['hubspot', 'notion', 'stripe'], fresh: true,
      coach: {
        think: 'Your work is strong. Your updates come late.', when: 'After Stripe, 2 hours ago',
        reads: {
          Communication: r(2, -1, 'Your updates come after your manager asks.', 'Dana asked for your plan twice.', 'End each stage with one line: what is done, what is next, by when.'),
          Independence: r(3, 0, 'You try first, then ask.', 'Two of your four questions were in the brief.'),
          Quality: r(4, 1, 'Right the first time.', 'You tested the model on last quarter before sending.'),
          Speed: r(3, 0, 'On pace.', 'Plan in 1 h 10 m, build in 2 h.')
        },
        focus: 'Communication',
        next: 'One scenario at Meeting gets you to Level 3.'
      },
      play: [
        { kind: 'stage', when: 'After Plan at Datadog, just now', think: 'That update reached Ava before she asked. Keep doing that.',
          reads: { Communication: r(3, 1, 'You updated Ava before she asked.', 'One line at the end of Plan: done, next, by when.') }, focus: 'Independence',
          tips: { Independence: 'Read the brief first, then ask the one thing it does not say.' } },
        { kind: 'scenario', band: 'Meeting', pts: 1000, co: 'datadog', when: 'After Account research agent at Datadog',
          think: 'Level 3. Your communication caught up with your work.', next: '1,000 more skill points to Level 4.' }
      ]
    },
    l6: {
      label: 'Level 6', pts: 6500, done: ['hubspot', 'notion', 'stripe', 'figma'],
      coach: {
        think: 'One of the strongest builders this month. Pace is the last gap.', when: 'After Figma, yesterday',
        reads: {
          Communication: r(4, 1, 'Your manager always knows where you are.', 'You told Noah the plan before he asked, every stage.'),
          Independence: r(5, 0, 'You make the call and say why.', 'You picked the scoring signals yourself.'),
          Quality: r(5, 0, 'Every requirement met, four scenarios running.', 'No fixes asked on the Figma submission.'),
          Speed: r(2, -1, 'Your plans take close to three hours.', 'Most people send the plan in one.', 'Give the plan 45 minutes, then send what you have.')
        },
        focus: 'Speed',
        next: '500 more skill points gets you to Level 7.'
      },
      play: [
        { kind: 'stage', when: 'After Plan at Zendesk, just now', think: 'Plan in 50 minutes, and it held up. That was the gap.',
          reads: { Speed: r(3, 1, 'Plan in 50 minutes.', 'You sent it inside the hour and nothing came back.') }, focus: null },
        { kind: 'scenario', band: 'Exceeding', pts: 2000, co: 'zendesk', when: 'After Renewal risk agent at Zendesk',
          think: 'Level 8. Senior GTM Engineer roles are close now.', next: '500 more skill points to Level 9.' }
      ]
    }
  };

  window.HD = { A: A, PORTAL: PORTAL, ME: ME, COACH: COACH, CO: CO, LEVELS: LEVELS, PAY: PAY, READS: READS, STATES: STATES };
})();
