/* Zero home: the level and the coach, one chip, two tabs.
   Plain data. Roles are real GTM roles posted in October 2026 (from the skill path research); counts per level
   and the points engine are stand-ins until engineering has the real numbers. */
(function () {
  'use strict';
  var A = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

  var ME = { name: 'Sanjay Chauhan', first: 'Sanjay', photo: A + 'sanjay.jpg', focus: 'GTM Engineer' };

  /* logos: svg = one colour mark drawn in its brand colour, png = the company's own icon, none = a letter */
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
    shopify: ['Shopify', 'svg', '#5E8E3E']
  };

  /* every level: the skill points it starts at, how many roles it opens, what they are called,
     three real roles from it, the companies to show, and anything else it opens (my proposal) */
  function R(co, title, pay, loc) { return { co: co, title: title, pay: pay, loc: loc }; }
  var LEVELS = [
    { n: 1, pts: 1000, roles: 12, kind: 'Internships', pay: '$6,000 a month',
      cos: ['peec', 'basepower', 'lyft'],
      eg: [R('peec', 'GTM Intern', '$6,000 a month', 'New York'), R('lyft', 'Business Systems Engineer Intern', 'CA$40 to 43 an hour', 'Toronto'), R('basepower', 'Growth Intern', 'Pay not posted', 'Austin')] },
    { n: 2, pts: 2000, roles: 18, kind: 'Internships',  pay: '$6,000 a month',
      cos: ['peec', 'basepower', 'lyft'],
      eg: [R('peec', 'GTM Enablement Intern', '$6,000 a month', 'New York'), R('basepower', 'Business Operations Intern', 'Pay not posted', 'Austin')] },
    { n: 3, pts: 3000, roles: 30, kind: 'Analyst roles', pay: '$95k to $133k', also: 'Intermediate scenarios',
      cos: ['newrelic', 'datadog', 'lansweeper'],
      eg: [R('newrelic', 'GTM AI Engineer', '$95,000 to $119,000', 'Austin'), R('datadog', 'GTM Strategy and Operations Associate', '$100,000 to $133,000', 'New York'), R('lansweeper', 'GTM AI Applications Engineer', 'Pay not posted', 'Austin')] },
    { n: 4, pts: 4000, roles: 40, kind: 'Analyst roles', pay: '$100k to $162k',
      cos: ['ashby', 'doordash', 'peec', 'wealthsimple'],
      eg: [R('ashby', 'GTM Systems Analyst', '$115,000 to $162,438', 'Remote, US'), R('peec', 'Associate GTM Engineer', '$125,000 to $155,000', 'New York'), R('doordash', 'Senior Associate, GTM Systems', '$100,600 to $148,000', 'Remote, US')] },
    { n: 5, pts: 5000, roles: 50, kind: 'Associate roles', pay: '$114k to $179k',
      cos: ['boulevard', 'growtherapy', 'dnsfilter'],
      eg: [R('boulevard', 'GTM Engineer', '$119,000 to $179,000', 'Remote, US'), R('growtherapy', 'GTM Engineer', '$114,000 to $142,500', 'New York'), R('dnsfilter', 'GTM Systems Engineer', '$130,000 to $155,000', 'Remote, US')] },
    { n: 6, pts: 6000, roles: 60, kind: 'GTM Engineer', pay: '$100k to $200k', also: 'Advanced scenarios',
      cos: ['plaid', 'toast', 'zip', 'faire'],
      eg: [R('plaid', 'GTM Technology Engineer', '$145,200 to $172,800', 'New York'), R('zip', 'GTM Engineer', '$150,000 to $190,000', 'New York'), R('toast', 'GTM Engineer, Sales Workflow Automation', '$120,000 to $192,000', 'Remote, US')] },
    { n: 7, pts: 7000, roles: 55, kind: 'GTM Engineer', pay: '$120k to $200k',
      cos: ['digitalocean', 'attio', 'warp', 'workos'],
      eg: [R('attio', 'Forward Deployed GTM Engineer', '$150,000 to $200,000', 'New York'), R('workos', 'GTM Engineer', '$175,000 to $200,000', 'Remote, US'), R('digitalocean', 'Senior GTM Engineer', '$120,000 to $140,000', 'Austin')] },
    { n: 8, pts: 8000, roles: 45, kind: 'GTM Engineer', pay: '$140k to $250k',
      cos: ['clay', 'modal', 'langchain', 'baseten'],
      eg: [R('clay', 'GTM Engineer, Systems and Infrastructure', '$140,000 to $200,000', 'New York'), R('modal', 'GTM Engineer, Data Platform', '$200,000 to $220,000', 'New York'), R('langchain', 'GTM Engineer', '$160,000 to $180,000', 'Austin')] },
    { n: 9, pts: 9000, roles: 30, kind: 'Senior roles', pay: '$113k to $309k', also: 'Expert scenarios',
      cos: ['cloudflare', 'vanta', 'onepassword', 'adyen'],
      eg: [R('vanta', 'Senior AI GTM Engineer', '$195,000 to $229,000', 'Remote, US'), R('adyen', 'GTM Engineer', '$169,000 to $222,000', 'New York'), R('onepassword', 'Senior GTM Engineering Analyst', '$113,000 to $158,000', 'Remote, US')] },
    { n: 10, pts: 10000, roles: 20, kind: 'Top of the field', pay: '$127k to $405k',
      cos: ['anthropic', 'openai', 'ramp', 'stripe'],
      eg: [R('anthropic', 'Staff Software Engineer, GTM AI', '$320,000 to $405,000', 'Remote, US'), R('openai', 'Analytics Engineer, GTM', '$220,000 to $335,000', 'New York'), R('ramp', 'GTM Business Systems Engineer', '$151,200 to $230,000', 'New York')] }
  ];

  /* skill points per finished scenario, by how the manager grades it */
  var PAY = [
    { name: 'Below', pts: 500, c: '#EBA640' },
    { name: 'Meeting', pts: 1000, c: '#E2B13C' },
    { name: 'Exceeding', pts: 2000, c: '#46A056' },
    { name: 'Exceptional', pts: 3000, c: '#18743C' }
  ];

  /* the reads the coach keeps. It only ever shows the ones it is talking about. */
  var READS = {
    Communication: { icon: 'chat' }, Independence: { icon: 'shield' }, Quality: { icon: 'star' },
    Speed: { icon: 'clock' }, Understanding: { icon: 'bulb' }, 'AI use': { icon: 'spark' }
  };

  var SCN = {
    hubspot: { co: 'hubspot', title: 'Inbound lead router', pays: 3000, time: '2 h 30 min', trains: 'Communication' },
    datadog: { co: 'datadog', title: 'Account research agent', pays: 3000, time: '2 h 30 min', trains: 'Communication' },
    figma: { co: 'figma', title: 'Product qualified lead score', pays: 3000, time: '3 h', trains: 'Speed' }
  };

  /* three moments in the same person's life on Zero */
  var STATES = {
    new: {
      label: 'New', pts: 0, done: [],
      coach: {
        based: 'Before your first scenario', when: 'I am ready when you are',
        think: 'I have not seen you work yet. In your first scenario I will watch how you plan, how you keep your manager in the loop, and how you check your work before you send it.',
        watch: ['Communication', 'Independence', 'Quality', 'Speed'],
        well: [], improve: [],
        next: { to: 1, line: 'Finish your first scenario at Meeting or above.', pts: 'That pays 1,000 skill points and opens 12 internships.' },
        rec: 'hubspot'
      }
    },
    l2: {
      label: 'Level 2', pts: 2500, done: ['hubspot', 'notion', 'stripe'], fresh: true,
      coach: {
        based: 'After Intent signal scoring at Stripe',
        think: 'You build things that work. Your Stripe model was the strongest work you have shown so far. What keeps you at Level 2 is how you talk about your work: Dana had to ask for your plan twice.',
        well: [
          { read: 'Quality', line: 'You tested the model on last quarter before you sent it.', from: 'Stripe' },
          { read: 'Understanding', line: 'You explained why seats added beats page visits, without notes.', from: 'Stripe' }
        ],
        improve: [
          { read: 'Communication', line: 'Your updates come after your manager asks.', tip: 'End every stage with one line: what is done, what is next, by when.' },
          { read: 'Independence', line: 'Two of your four questions were already in the brief.', tip: 'Read the brief first, then ask the one thing it does not say.' }
        ],
        next: { to: 3, line: 'Send one update before your manager asks, in your next scenario.', pts: 'One scenario at Meeting pays 1,000 and gets you to Level 3.' },
        rec: 'datadog'
      }
    },
    l6: {
      label: 'Level 6', pts: 6500, done: ['hubspot', 'notion', 'stripe', 'figma'],
      coach: {
        based: 'After Product qualified lead score at Figma', when: 'Updated yesterday',
        think: 'You are one of the strongest builders I have seen this month. Your work lands right the first time and your manager always knows where you are. The one thing between you and the senior roles is pace.',
        well: [
          { read: 'Quality', line: 'Four scenarios in a row with every requirement met.', from: 'Figma' },
          { read: 'Communication', line: 'You told Noah the plan before he asked, every stage.', from: 'Figma' },
          { read: 'Independence', line: 'You picked the scoring signals yourself and said why.', from: 'Figma' }
        ],
        improve: [
          { read: 'Speed', line: 'Your plans take close to three hours. Most people send them in one.', tip: 'Give the plan 45 minutes, then send what you have.' }
        ],
        next: { to: 7, line: 'Keep your quality and send your plan inside an hour.', pts: '500 more skill points gets you to Level 7.' },
        rec: 'figma'
      }
    }
  };

  window.HD = { A: A, ME: ME, CO: CO, LEVELS: LEVELS, PAY: PAY, READS: READS, SCN: SCN, STATES: STATES };
})();
