/* ZERO, three systems · the data, after the Sanjay and Navid call of 14 Oct 2026.
   One source of truth so every screen of all three sites agrees.

   SYSTEM 1  Scenarios       do the work, build proof            (kickoff, POP, workspace, present, review)
   SYSTEM 2  Levels + Coach  know where you stand, get better    (skill points, level, coach, credits)
   SYSTEM 3  Jobs            get matched, apply, hear back       (role bank, Home, Explore, Tracker)

   DECIDED ON THE CALL
     Skill points only come from scenarios. Never free, never bought.
     You start at Level 0. Level 1 opens your first roles, and every level opens a bucket of roles. Level 10 is Apple, OpenAI.
     The coach holds the reads in its head (Independence, Communication, Quality, Speed, AI slop) and says two things:
       what I think so far, and what I need to see. After the fact, never blocking. No coach chat: one chat, with the manager.
     Credits are the reward currency: a stage or scenario done, a level up, a streak, an invite.
     Jobs V1: new roles land in a role bank every day or two, opened like a box. Apply is one click (tailored, then sent
       on the company's own page), not auto apply. Tracker has three states: Applied, Connected, Lost. No recruiter side.
   Pay per band, role counts, credit amounts and every role and company here are STAND-INS: engineering owns the points engine. */
(function () {
  'use strict';

  var PER_LEVEL = 1000, SCENARIO_MAX = 3000, PACE = 1000, START = 0;

  /* the five skills a product designer is hired on. Every scenario pays into three of them. */
  var SKILLS = {
    agents:    { name: 'AI agents',          can: 'Builds agents that do real sales work, tested before they send' },
    data:      { name: 'Data and enrichment', can: 'Turns messy accounts into complete, scored lists' },
    crm:       { name: 'CRM and systems',    can: 'Keeps the CRM clean and wired to every tool' },
    analytics: { name: 'SQL and analytics',  can: 'Answers revenue questions with SQL and one clear chart' },
    comms:     { name: 'Working with sales', can: 'Explains a system so reps actually use it' }
  };

  /* where things stand on the city, in percent of the map image */
  var PLACE = {
    zero:      [49.4, 51.0],
    airbnb:    [56.5, 65.2], uber:   [53.5, 71.4], stripe:  [63.4, 76.4], spacex:   [69.4, 66.6],
    spotify:   [63.2, 60.9], nintendo: [62.4, 57.4], netflix: [63.5, 47.3], meta:   [66.3, 44.5],
    tesla:     [63.4, 36.4], doordash: [53.6, 35.3],
    apple:     [54.2, 45.0], google: [41.6, 34.8], microsoft: [45.7, 44.6], amazon: [41.6, 47.9],
    openai:    [42.8, 57.2], samsung: [46.2, 57.3]
  };
  /* where the card for the job you want hangs, and on which side of that point: above a roof, or below the Apple lawn */
  var ROOF = { apple: [54.2, 45.0, 'b'], google: [39.5, 29.8, 't'], microsoft: [44.3, 35.0, 't'], amazon: [38.5, 41.4, 't'], openai: [40.5, 57.5, 't'], samsung: [45.3, 56.4, 't'] };
  /* the middle of that building, where the light stands */
  var HEART = { apple: [54.6, 41.0], google: [39.5, 33.2], microsoft: [44.4, 40.4], amazon: [38.6, 46.4], openai: [40.6, 63.0], samsung: [45.4, 61.6] };
  /* the pool of light a building stands in when it is yours: centre x, centre y, radius x, radius y, in percent of the map */
  var SPOT = {
    airbnb: [55.9, 60.4, 4.6, 6.2], uber: [53.5, 66.6, 3.2, 6.0], stripe: [66.3, 71.2, 3.8, 6.6], spacex: [70.7, 60.6, 4.6, 6.0],
    spotify: [64.6, 57.8, 3.2, 3.8], nintendo: [61.2, 52.8, 3.0, 5.6], netflix: [62.4, 41.6, 2.9, 6.6], meta: [68.0, 41.4, 4.2, 4.8],
    tesla: [63.4, 32.2, 2.8, 6.0], doordash: [55.2, 32.3, 4.4, 4.6],
    apple: [54.6, 40.4, 4.6, 5.2], google: [39.6, 32.4, 3.9, 4.6], microsoft: [44.4, 39.6, 4.4, 5.6], amazon: [38.6, 45.4, 4.4, 5.4],
    openai: [40.6, 62.0, 3.0, 6.4], samsung: [45.4, 60.8, 3.8, 5.0], zero: [49.4, 50.8, 6.0, 7.2]
  };
  /* which side of its stop a company's name hangs on */
  var SIDE = { airbnb: 'b', uber: 'l', stripe: 'b', spacex: 'r', spotify: 'r', nintendo: 'l', netflix: 'r', meta: 'r', tesla: 'r', doordash: 't' };
  /* the road bends through these points so it runs along the streets, not across a building */
  var W1 = [[51.4, 36.4], [49.7, 38.6], [49.5, 42.4]];
  var VIA = {
    'airbnb>uber':      [[55.2, 68.4]],
    'uber>stripe':      [[56.6, 69.4], [58.6, 68.6], [61.2, 71.2], [63.2, 73.6]],
    'stripe>spacex':    [[66.4, 78.4], [69.4, 76.2], [70.2, 72.2], [69.7, 69.2]],
    'spacex>spotify':   [[67.6, 66.7], [65.4, 64.5], [63.7, 62.6]],
    'spotify>nintendo': [[62.5, 59.4]],
    'nintendo>netflix': [[63.3, 54.8], [63.9, 51.4], [63.9, 48.9]],
    'netflix>meta':     [[65.0, 46.4]],
    'meta>tesla':       [[64.7, 42.7], [64.2, 40.0], [63.9, 38.0]],
    'tesla>doordash':   [[60.8, 36.7], [58.4, 36.5], [56.0, 36.2]],
    'doordash>apple':     [[51.7, 36.3], [50.9, 38.6], [50.9, 41.8], [52.0, 44.2]],
    'doordash>google':    [[51.4, 36.2], [49.7, 34.4], [49.5, 31.2], [47.3, 30.0], [45.2, 31.2], [43.3, 33.2]],
    'doordash>microsoft': W1.concat([[48.9, 45.4], [47.3, 46.1]]),
    'doordash>amazon':    W1.concat([[48.6, 45.6], [45.6, 45.9], [43.2, 46.6]]),
    'doordash>samsung':   W1.concat([[48.2, 45.8], [45.6, 48.2], [44.3, 51.6], [44.6, 55.0]]),
    'doordash>openai':    W1.concat([[48.2, 45.8], [45.4, 48.0], [43.6, 51.6], [43.0, 54.8]])
  };

  /* the scenarios, in the order the road runs. Problems mirror Zero's real catalogue, seen from a designer's seat. */
  var SCENARIOS = [
    { id: 's1',  co: 'airbnb',   title: 'Inbound Lead Router',        ask: 'Get every new host lead to the right rep in under two minutes.', skills: ['agents', 'crm', 'comms'],      mins: 90,  tools: ['n8n', 'HubSpot', 'Claude'] },
    { id: 's2',  co: 'uber',     title: 'Business Lead Score',        ask: 'Score Uber for Business leads so reps call the best ones first.', skills: ['data', 'analytics', 'comms'], mins: 75,  tools: ['SQL', 'Snowflake', 'HubSpot'] },
    { id: 's3',  co: 'stripe',   title: 'Intent Signals',             ask: 'Find the accounts showing buying intent this week.',              skills: ['data', 'analytics', 'agents'], mins: 100, tools: ['Clay', 'SQL', 'Slack'] },
    { id: 's4',  co: 'spacex',   title: 'Enrichment Waterfall',       ask: 'Fill missing company fields on 8,000 Starlink business accounts.', skills: ['data', 'crm', 'agents'],      mins: 90,  tools: ['Clay', 'Apollo', 'HubSpot'] },
    { id: 's5',  co: 'spotify',  title: 'Outbound Agent with Evals',  ask: 'Draft first emails to ad buyers, tested before any send.',         skills: ['agents', 'comms', 'analytics'], mins: 110, tools: ['Claude', 'n8n', 'Gmail'] },
    { id: 's6',  co: 'nintendo', title: 'CRM Cleanup',                ask: 'Merge duplicate retail partners and give every field one owner.',  skills: ['crm', 'data', 'comms'],       mins: 80,  tools: ['Salesforce', 'SQL', 'Sheets'] },
    { id: 's7',  co: 'netflix',  title: 'Ads Pipeline Report',        ask: 'Show the ads team where deals stall, every Monday.',               skills: ['analytics', 'comms', 'data'], mins: 100, tools: ['SQL', 'Looker', 'Slack'] },
    { id: 's8',  co: 'meta',     title: 'Call Notes Agent',           ask: 'Fill deal fields from call transcripts, checked by people.',      skills: ['agents', 'crm', 'analytics'], mins: 95,  tools: ['Claude', 'Gong', 'Salesforce'] },
    { id: 's9',  co: 'tesla',    title: 'Fleet Sales Routing',        ask: 'Route fleet inquiries by region and size, with no lead left owner-less.', skills: ['crm', 'agents', 'analytics'], mins: 110, tools: ['Salesforce', 'n8n', 'SQL'] },
    { id: 's10', co: 'doordash', title: 'Merchant Onboarding Funnel', ask: 'Find where new merchants drop off and automate the follow up.',    skills: ['analytics', 'agents', 'comms'], mins: 120, tools: ['SQL', 'n8n', 'HubSpot'] }
  ];

  /* what each project shows a hiring team, in one line */
  var SHOWED = { s1: 'Routes every lead to the right rep', s2: 'Scores leads the reps trust', s3: 'Turns intent signals into alerts',
    s4: 'Fills missing data from four sources', s5: 'An outbound agent, tested before it sends', s6: 'One clean record per partner',
    s7: 'Shows where deals stall, every week', s8: 'Fills deal fields from calls', s9: 'Routes fleet leads by region and size', s10: 'Finds where merchants drop off' };
  SCENARIOS.forEach(function (x) { x.showed = SHOWED[x.id]; });

  var CO = {
    apple: 'Apple', google: 'Google', microsoft: 'Microsoft', amazon: 'Amazon', openai: 'OpenAI', samsung: 'Samsung',
    airbnb: 'Airbnb', uber: 'Uber', stripe: 'Stripe', figma: 'Figma', duolingo: 'Duolingo', notion: 'Notion',
    spotify: 'Spotify', netflix: 'Netflix', tesla: 'Tesla', doordash: 'DoorDash', spacex: 'SpaceX', nintendo: 'Nintendo',
    shopify: 'Shopify', canva: 'Canva', klarna: 'Klarna', monzo: 'Monzo', intercom: 'Intercom', linear: 'Linear',
    pinterest: 'Pinterest', dropbox: 'Dropbox', wise: 'Wise', nike: 'Nike', meta: 'Meta', zero: 'Zero',
    webflow: 'Webflow', framer: 'Framer', miro: 'Miro', loom: 'Loom', atlassian: 'Atlassian', squarespace: 'Squarespace', etsy: 'Etsy',
    headspace: 'Headspace', strava: 'Strava', revolut: 'Revolut', coinbase: 'Coinbase', robinhood: 'Robinhood', discord: 'Discord',
    reddit: 'Reddit', slack: 'Slack', instacart: 'Instacart', lyft: 'Lyft', deliveroo: 'Deliveroo', zalando: 'Zalando', paypal: 'PayPal',
    adobe: 'Adobe', twitch: 'Twitch',
    peec: 'Peec AI', basepower: 'Base Power', newrelic: 'New Relic', datadog: 'Datadog', lansweeper: 'Lansweeper', jobber: 'Jobber', ashby: 'Ashby',
    wealthsimple: 'Wealthsimple', growtherapy: 'Grow Therapy', boulevard: 'Boulevard', dnsfilter: 'DNSFilter', toast: 'Toast', zip: 'Zip', eliseai: 'EliseAI',
    plaid: 'Plaid', faire: 'Faire', dualentry: 'DualEntry', attio: 'Attio', warp: 'Warp', workos: 'WorkOS', digitalocean: 'DigitalOcean', baseten: 'Baseten',
    siro: 'Siro', rogo: 'Rogo', modal: 'Modal', langchain: 'LangChain', motive: 'Motive', navan: 'Navan', upside: 'Upside', clay: 'Clay', vanta: 'Vanta',
    onepassword: '1Password', samsara: 'Samsara', mongodb: 'MongoDB', cloudflare: 'Cloudflare', adyen: 'Adyen', anthropic: 'Anthropic', ramp: 'Ramp',
    rippling: 'Rippling', perplexity: 'Perplexity'
  };
  /* brand colour behind a white mark, for the small logo tiles */
  var TINT = {
    apple: '#111113', google: '#4285F4', microsoft: '#FFFFFF', amazon: '#FF9900', openai: '#111113', samsung: '#1428A0',
    airbnb: '#FF385C', uber: '#111113', stripe: '#635BFF', figma: '#1E1E1E', duolingo: '#58CC02', notion: '#FFFFFF',
    spotify: '#1ED760', netflix: '#111113', tesla: '#E82127', doordash: '#FF3008', spacex: '#111113', nintendo: '#E60012',
    shopify: '#7AB55C', canva: '#00C4CC', klarna: '#FFB3C7', monzo: '#14233C', intercom: '#111113', linear: '#5E6AD2',
    pinterest: '#BD081C', dropbox: '#0061FF', wise: '#9FE870', nike: '#111113', meta: '#0467DF',
    webflow: '#146EF5', framer: '#111113', miro: '#FFD02F', loom: '#625DF5', atlassian: '#0052CC', squarespace: '#111113', etsy: '#F1641E',
    headspace: '#F47D31', strava: '#FC4C02', revolut: '#111113', coinbase: '#0052FF', robinhood: '#111113', discord: '#5865F2', reddit: '#FF4500',
    slack: '#4A154B', instacart: '#0AAD0A', lyft: '#FF00BF', deliveroo: '#00CCBC', zalando: '#FF6900', paypal: '#003087', adobe: '#FF0000', twitch: '#9146FF',
    newrelic: '#1D252C', datadog: '#632CA6', digitalocean: '#0080FF', onepassword: '#0572EC', langchain: '#1C3C3C', adyen: '#0ABF53', modal: '#111113',
    mongodb: '#00684A', cloudflare: '#F38020', perplexity: '#20808D', anthropic: '#D97757',
    growtherapy: '#0F3B2E', dnsfilter: '#2B44E8', toast: '#FF4C00', attio: '#111113', navan: '#4E3DF5', samsara: '#0A1F44',
    peec: '#FFFFFF', basepower: '#FFFFFF', lansweeper: '#FFFFFF', jobber: '#FFFFFF', ashby: '#FFFFFF', wealthsimple: '#FFFFFF', boulevard: '#FFFFFF',
    zip: '#FFFFFF', eliseai: '#FFFFFF', plaid: '#FFFFFF', faire: '#FFFFFF', dualentry: '#FFFFFF', warp: '#FFFFFF', workos: '#FFFFFF', baseten: '#FFFFFF',
    siro: '#FFFFFF', rogo: '#FFFFFF', motive: '#FFFFFF', upside: '#FFFFFF', clay: '#FFFFFF', vanta: '#FFFFFF', ramp: '#FFFFFF', rippling: '#FFFFFF'
  };
  /* companies with no single colour mark: their own icon (logo/<co>.png), or a letter on their colour when the icon is too small to be sharp */
  var PNG = {}, MONO = { growtherapy: 'G', dnsfilter: 'D', toast: 'T', attio: 'A', navan: 'N', samsara: 'S' };
  ['peec', 'basepower', 'lansweeper', 'jobber', 'ashby', 'wealthsimple', 'boulevard', 'zip', 'eliseai', 'plaid', 'faire', 'dualentry', 'warp', 'workos',
   'baseten', 'siro', 'rogo', 'motive', 'upside', 'clay', 'vanta', 'ramp', 'rippling'].forEach(function (k) { PNG[k] = 1; });
  var INK = { microsoft: 1, notion: '#111113', klarna: '#17120F', wise: '#163300', spotify: '#111113', netflix: '#E50914', miro: '#111113', modal: '#7FEE64' };

  /* the companies a learner can aim at. They come from the vision board made in onboarding, so nothing is asked twice. */
  var DREAMS = ['openai', 'google', 'microsoft', 'amazon', 'apple', 'samsung'];

  /* the job you want sits in the top bucket: Level 10 is Apple, OpenAI */
  var RUNGS = [
    { id: 'mid', title: 'GTM Engineer', level: 10, pay: '$220,000 to 310,000', band: 'Top of the field' }
  ];

  /* Real GTM roles, open on 14 October 2026, from the companies' own job boards (url). The level each opens at is our call.
     today: found by the agents this morning (the New pile in Explore). needs: what the posting asks, each tied to a skill. */
  var ROLES = [
    {"id": "r-base1", "co": "basepower", "title": "Growth Intern", "level": 1, "loc": "Austin", "mode": "On site", "pay": "Pay not posted", "posted": "26d", "about": ["Joins the GTM team on outbound leads, campaigns and customer follow up.", "Reviews customer conversations in HubSpot to sharpen the sales process."], "needs": [{"t": "Clear written and spoken English", "k": "comms"}, {"t": "Familiar with HubSpot and Zapier", "k": "crm"}, {"t": "Interest in sales and customers", "k": "comms"}], "url": "https://jobs.ashbyhq.com/base-power/21470d4f-c3bd-4e04-a15a-2b45f8fe7b64"},
    {"id": "r-peec1", "co": "peec", "title": "GTM Intern", "level": 1, "loc": "New York", "mode": "On site", "pay": "$6,000 a month", "posted": "21d", "about": ["Helps the US sales team close deals and keep the CRM clean.", "Builds small automations across the sales stack for 3 to 6 months."], "needs": [{"t": "Curious about AI and automation tools", "k": "agents"}, {"t": "HubSpot, Clay or n8n basics", "k": "crm"}, {"t": "Works closely with sellers", "k": "comms"}], "url": "https://jobs.ashbyhq.com/peec/5d1bbe62-8dff-4ccd-a46d-d9f8b912d04c"},
    {"id": "r-lyft1", "co": "lyft", "title": "Business Systems Engineer Intern", "level": 1, "loc": "Toronto", "mode": "Hybrid", "pay": "CA$40 to 43 an hour", "posted": "16d", "about": ["Builds Workato and Python automations that remove manual business work.", "Writes SQL checks and tests AI prototypes for internal teams."], "needs": [{"t": "Working Python and SQL", "k": "analytics"}, {"t": "Interest in Workato or iPaaS tools", "k": "agents"}, {"t": "Enrolled at a Canadian university", "k": "comms"}], "url": "https://app.careerpuck.com/job-board/lyft/job/8802222002?gh_jid=8802222002"},
    {"id": "r-peec2", "co": "peec", "title": "GTM Enablement Intern", "level": 2, "loc": "New York", "mode": "On site", "pay": "$6,000 a month", "posted": "21d", "about": ["Keeps sales decks, case studies and competitor notes sharp and current.", "Helps build and test time saving workflows for the GTM team."], "needs": [{"t": "Good judgment on AI output", "k": "agents"}, {"t": "Strong eye for detail", "k": "data"}, {"t": "HubSpot, Clay, Claude automations", "k": "crm"}], "url": "https://jobs.ashbyhq.com/peec/d55340b2-c87f-4d06-b9a9-7ca3ff2fe2f3"},
    {"id": "r-base2", "co": "basepower", "title": "Business Operations Intern", "level": 2, "loc": "Austin", "mode": "On site", "pay": "Pay not posted", "posted": "Sep 8", "about": ["Builds analysis tools on partner performance and automates operations steps.", "Helps launch new growth partnerships from zero."], "needs": [{"t": "Python, SQL and dashboards", "k": "analytics"}, {"t": "CRMs and Excel", "k": "crm"}, {"t": "Data driven business judgment", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/base-power/0545cb76-f49c-4390-a1c5-2b7adb5e927a"},
    {"id": "r-nr", "co": "newrelic", "title": "GTM AI Engineer", "level": 3, "loc": "Austin", "mode": "Hybrid", "pay": "$95,000 to 119,000", "posted": "5d", "about": ["Builds automations that turn product signals into sales actions.", "Runs CRM enrichment and hygiene, and tests GTM workflows."], "needs": [{"t": "Clay, Claude or Gemini workflows", "k": "agents"}, {"t": "CRM enrichment and hygiene", "k": "data"}, {"t": "Turns sales needs into workflows", "k": "comms"}], "url": "https://job-boards.greenhouse.io/newrelic/jobs/5436245008"},
    {"id": "r-dd3", "co": "datadog", "title": "GTM Strategy and Operations Associate", "level": 3, "loc": "New York", "mode": "Hybrid", "pay": "$100,000 to 133,000", "posted": "Sep 1", "about": ["Builds quota models and KPI dashboards for the global sales team.", "Analyzes GTM data to guide planning and growth bets."], "needs": [{"t": "Strong quantitative modeling", "k": "analytics"}, {"t": "KPI dashboards", "k": "analytics"}, {"t": "Clear with senior leaders", "k": "comms"}], "url": "https://careers.datadoghq.com/detail/8171303/?gh_jid=8171303"},
    {"id": "r-lans", "co": "lansweeper", "title": "GTM AI Applications Engineer", "level": 3, "loc": "Austin", "mode": "Hybrid", "pay": "Pay not posted", "posted": "20d", "about": ["Runs the GTM app stack and its integrations into Salesforce.", "Ships and monitors AI agents with human checkpoints."], "needs": [{"t": "Built an agent in n8n or LangChain", "k": "agents"}, {"t": "Salesforce integrations", "k": "crm"}, {"t": "Workato or Zapier", "k": "data"}], "url": "https://builtin.com/job/gtm-ai-applications-engineer/11349065", "today": true},
    {"id": "r-ashby", "co": "ashby", "title": "GTM Systems Analyst", "level": 4, "loc": "Remote, US", "mode": "Remote", "pay": "$115,000 to 162,438", "posted": "Aug 27", "about": ["Keeps the CRM, integrations and data quality healthy for GTM teams.", "Turns business requests into system configuration that scales."], "needs": [{"t": "CRM admin and workflow automation", "k": "crm"}, {"t": "Integration troubleshooting", "k": "agents"}, {"t": "Data governance discipline", "k": "data"}], "url": "https://jobs.ashbyhq.com/ashby/c62ec47a-8de9-4781-b1f7-563a229c4e90"},
    {"id": "r-peec4", "co": "peec", "title": "Associate GTM Engineer", "level": 4, "loc": "New York", "mode": "On site", "pay": "$125,000 to 155,000", "posted": "1d", "about": ["Builds the HubSpot workflows, lead scoring and routing for US sales.", "Connects HubSpot to the stack with Zapier or n8n."], "needs": [{"t": "Complex HubSpot workflows", "k": "crm"}, {"t": "Lead scoring and routing", "k": "crm"}, {"t": "Zapier or n8n", "k": "agents"}], "url": "https://jobs.ashbyhq.com/peec/699fbf03-f3c6-473e-a543-a6b126cd9535"},
    {"id": "r-7r", "co": "doordash", "title": "Senior Associate, GTM Systems", "level": 4, "loc": "Remote, US", "mode": "Remote", "pay": "$100,600 to 148,000", "posted": "Aug 6", "about": ["Owns the RevOps systems for SevenRooms, part of DoorDash.", "Brings AI features into the GTM tool stack."], "needs": [{"t": "Hands on GTM systems admin", "k": "crm"}, {"t": "Turns process needs into specs", "k": "comms"}, {"t": "Trains and coaches users", "k": "comms"}], "url": "https://job-boards.greenhouse.io/doordashusa/jobs/8105742", "today": true},
    {"id": "r-jobber", "co": "jobber", "title": "Revenue Technology Manager", "level": 4, "loc": "Toronto", "mode": "Hybrid", "pay": "CA$98,300 to 133,100", "posted": "Aug 27", "about": ["Runs access and first line support across the revenue tool stack.", "Spots repeat issues and automates them with AI."], "needs": [{"t": "Salesforce and HubSpot admin", "k": "crm"}, {"t": "Organized troubleshooter", "k": "data"}, {"t": "AI enabled automation", "k": "agents"}], "url": "https://jobs.ashbyhq.com/jobber/ad09f434-cd51-4779-ad29-9c823d959bbd", "today": true},
    {"id": "r-ws", "co": "wealthsimple", "title": "Marketing Automation Developer", "level": 4, "loc": "Remote, Canada", "mode": "Remote", "pay": "CA$116,000 to 145,000", "posted": "6d", "about": ["Builds lifecycle journeys and templates in Braze, on an 18 month contract.", "Acts as technical owner of the marketing automation stack."], "needs": [{"t": "Braze or a similar platform", "k": "crm"}, {"t": "HTML email and Liquid", "k": "data"}, {"t": "Works well with marketers", "k": "comms"}], "url": "https://jobs.ashbyhq.com/wealthsimple/ffa5e79d-f585-428a-a916-930450533fb5", "today": true},
    {"id": "r-blvd", "co": "boulevard", "title": "GTM Engineer", "level": 5, "loc": "Remote, US", "mode": "Remote", "pay": "$119,000 to 179,000", "posted": "Sep 8", "about": ["Owns automations across Salesforce, Clay, LeanData, Gong and Outreach.", "Builds AI enrichment and outbound personalization."], "needs": [{"t": "Clay enrichment with prompt logic", "k": "data"}, {"t": "Salesforce and LeanData routing", "k": "crm"}, {"t": "Monitoring and error handling", "k": "agents"}], "url": "https://job-boards.greenhouse.io/boulevard/jobs/4711825006", "today": true},
    {"id": "r-grow", "co": "growtherapy", "title": "GTM Engineer", "level": 5, "loc": "New York", "mode": "Hybrid", "pay": "$114,000 to 142,500", "posted": "26d", "about": ["Designs the data model and automation for one commercial motion.", "Builds Claude agents for referral triage and account research."], "needs": [{"t": "Builds agents, not just workflows", "k": "agents"}, {"t": "HubSpot, n8n or Workato", "k": "crm"}, {"t": "Tests before shipping", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/grow-therapy/edc00402-3fa2-4a0e-8e47-aacb3d170c58", "today": true},
    {"id": "r-dnsf", "co": "dnsfilter", "title": "GTM Systems Engineer", "level": 5, "loc": "Remote, US", "mode": "Remote", "pay": "$130,000 to 155,000", "posted": "21d", "about": ["Owns the daily setup and health of Salesforce and HubSpot.", "Runs lead and account routing and system monitoring."], "needs": [{"t": "Strong Salesforce and HubSpot admin", "k": "crm"}, {"t": "Routing rules and round robins", "k": "crm"}, {"t": "Tests and documents every change", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/dnsfilter/f2cf2d2a-b206-44c8-afe2-e4e3e3210529", "today": true},
    {"id": "r-plaid", "co": "plaid", "title": "GTM Technology Engineer", "level": 6, "loc": "New York", "mode": "Hybrid", "pay": "$145,200 to 172,800", "posted": "6d", "about": ["Builds Apex, Flows and integrations behind revenue critical Salesforce data.", "Prototypes AI agents that automate RevOps checks."], "needs": [{"t": "Salesforce development", "k": "crm"}, {"t": "REST APIs and middleware", "k": "data"}, {"t": "LLM APIs and MCP servers", "k": "agents"}], "url": "https://jobs.ashbyhq.com/plaid/10c3bc9a-0c32-46c6-982e-89e66e0d0a89"},
    {"id": "r-toast6", "co": "toast", "title": "GTM Engineer, Sales Workflow Automation", "level": 6, "loc": "Remote, US", "mode": "Remote", "pay": "$120,000 to 192,000", "posted": "Jun 1", "about": ["Builds agents that automate rep follow ups, CRM updates and alerts.", "Pipes call transcripts into Snowflake for next best actions."], "needs": [{"t": "Shipped an LLM agent in production", "k": "agents"}, {"t": "Python and strong SQL", "k": "analytics"}, {"t": "Evals and observability", "k": "agents"}], "url": "https://careers.toasttab.com/jobs?gh_jid=7947082"},
    {"id": "r-zip", "co": "zip", "title": "GTM Engineer", "level": 6, "loc": "New York", "mode": "Hybrid", "pay": "$150,000 to 190,000", "posted": "14d", "about": ["Builds Clay and n8n workflows that create presales pipeline.", "Turns sales goals into AI projects reps actually use."], "needs": [{"t": "Clay and n8n builds", "k": "data"}, {"t": "Salesforce and Gong data", "k": "crm"}, {"t": "Owns projects idea to rollout", "k": "comms"}], "url": "https://jobs.ashbyhq.com/zip/de102ffc-3b93-4b8c-a165-d4a016136b50"},
    {"id": "r-base6", "co": "basepower", "title": "GTM Systems Engineer", "level": 6, "loc": "Austin", "mode": "On site", "pay": "Pay not posted", "posted": "1d", "about": ["Builds systems that move leads and members 5 to 10 times faster.", "Keeps CRM data pipelines clean with engineering."], "needs": [{"t": "Strong data fundamentals", "k": "data"}, {"t": "Real software skills, not just prompts", "k": "agents"}, {"t": "Sales ops background", "k": "crm"}], "url": "https://jobs.ashbyhq.com/base-power/f2061575-5656-4117-88b5-8745d490da63"},
    {"id": "r-elise", "co": "eliseai", "title": "GTM Engineer", "level": 6, "loc": "New York", "mode": "On site", "pay": "$100,000 to 190,000", "posted": "Aug 31", "about": ["Founding GTM engineer rebuilding revenue systems with AI.", "Tracks adoption and return on every system shipped."], "needs": [{"t": "Clay, Attention, Zapier", "k": "data"}, {"t": "APIs, Python or JavaScript", "k": "agents"}, {"t": "Runs experiments end to end", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/eliseai/ff53b687-1943-4f54-9d09-66098c20db1a"},
    {"id": "r-faire", "co": "faire", "title": "Marketing Engineer, Growth Platform", "level": 6, "loc": "Toronto", "mode": "Hybrid", "pay": "CA$140,000 to 192,500", "posted": "26d", "about": ["An engineer inside marketing building pages, campaign and data tools.", "Puts agents into marketing workflows with evals and monitoring."], "needs": [{"t": "Production code on a real stack", "k": "agents"}, {"t": "Agent evals and monitoring", "k": "agents"}, {"t": "Works with marketers", "k": "comms"}], "url": "https://boards.greenhouse.io/faire/jobs/8821336002?gh_jid=8821336002"},
    {"id": "r-dual", "co": "dualentry", "title": "GTM Engineer", "level": 6, "loc": "New York", "mode": "On site", "pay": "$135,000 to 200,000", "posted": "15d", "about": ["Runs HubSpot and outbound tools, sequences and lead routing.", "Builds Clay, Smartlead and HeyReach outbound workflows."], "needs": [{"t": "Strong HubSpot workflows", "k": "crm"}, {"t": "Clay outbound", "k": "data"}, {"t": "Writes and tests outbound copy", "k": "comms"}], "url": "https://jobs.ashbyhq.com/dualentry/e6146a1a-ca77-478f-8376-9fa92611997a"},
    {"id": "r-do", "co": "digitalocean", "title": "Senior GTM Engineer", "level": 7, "loc": "Austin", "mode": "Hybrid", "pay": "$120,000 to 140,000", "posted": "13d", "about": ["Delivers integrations and AI workflows across the GTM stack.", "Fixes flow and integration failures at the root."], "needs": [{"t": "Complex Salesforce flows", "k": "crm"}, {"t": "iPaaS and APIs", "k": "data"}, {"t": "MCP integrations", "k": "agents"}], "url": "https://www.digitalocean.com/careers/position/apply/?gh_jid=8234404"},
    {"id": "r-attio", "co": "attio", "title": "Forward Deployed GTM Engineer", "level": 7, "loc": "New York", "mode": "Hybrid", "pay": "$150,000 to 200,000", "posted": "May 29", "about": ["Works inside customer teams to build their Attio CRM setups.", "Builds API integrations and Zapier or n8n automations."], "needs": [{"t": "Deep GTM tooling knowledge", "k": "crm"}, {"t": "Builds API integrations", "k": "agents"}, {"t": "Works with customers", "k": "comms"}], "url": "https://jobs.ashbyhq.com/attio/cef00929-63ab-4927-8a3c-1ea1d4224606"},
    {"id": "r-warp", "co": "warp", "title": "GTM Engineer, Revenue Systems", "level": 7, "loc": "New York", "mode": "On site", "pay": "$125,000 to 180,000", "posted": "Aug 27", "about": ["First GTM engineer, owning Salesforce and the AI layer above it.", "Builds agents, commission systems and data quality rules."], "needs": [{"t": "Salesforce objects, flows, reports", "k": "crm"}, {"t": "APIs and webhooks", "k": "data"}, {"t": "Clay, Gumloop, Claude agents", "k": "agents"}], "url": "https://jobs.ashbyhq.com/warp/6b4c450d-ab42-426e-afef-32396b9560a6"},
    {"id": "r-workos", "co": "workos", "title": "GTM Engineer", "level": 7, "loc": "Remote, US", "mode": "Remote", "pay": "$175,000 to 200,000", "posted": "Apr 10", "about": ["Owns enrichment and fit scoring pipelines into Snowflake and Salesforce.", "Builds event and campaign sync tooling in code."], "needs": [{"t": "TypeScript or Python in production", "k": "agents"}, {"t": "Clay, Apollo, Salesforce", "k": "data"}, {"t": "Fit scoring", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/workos/990c41b1-e3c3-4a75-83c2-ca916899c110"},
    {"id": "r-clay8", "co": "clay", "title": "GTM Engineer, Systems and Infrastructure", "level": 8, "loc": "New York", "mode": "Hybrid", "pay": "$140,000 to 200,000", "posted": "Jun 9", "about": ["Builds Clay's own Salesforce and Clay setup, including billing.", "Sets uptime, observability and data quality standards."], "needs": [{"t": "Salesforce objects, flows, CPQ", "k": "crm"}, {"t": "Deep Clay building", "k": "data"}, {"t": "Systems reliability", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/claylabs/f90028b7-6c35-4392-824c-105967ccd406"},
    {"id": "r-baseten", "co": "baseten", "title": "GTM Engineer", "level": 8, "loc": "New York", "mode": "Hybrid", "pay": "$175,000 to 200,000", "posted": "Aug 25", "about": ["Ships AI workflows and rep insights for a fast growing sales team.", "Audits the stack and builds custom tools in Claude Code."], "needs": [{"t": "Clay plus custom code", "k": "data"}, {"t": "Salesforce and warehouse data", "k": "analytics"}, {"t": "Ships fast, owns the backlog", "k": "comms"}], "url": "https://jobs.ashbyhq.com/baseten/5cd2f489-b9ee-428b-b252-94e83d55f107"},
    {"id": "r-siro", "co": "siro", "title": "GTM Engineer", "level": 8, "loc": "New York", "mode": "On site", "pay": "$190,000 to 215,000", "posted": "16d", "about": ["First GTM engineer, building flows that source, enrich and sync.", "Owns CRM and warehouse data quality and funnel reporting."], "needs": [{"t": "Strong Python and SQL", "k": "analytics"}, {"t": "Reliable data pipelines", "k": "data"}, {"t": "Funnel reporting", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/siro/6bbf352a-32e0-487c-8b09-15b193f54006"},
    {"id": "r-rogo", "co": "rogo", "title": "GTM Systems Engineer", "level": 8, "loc": "New York", "mode": "On site", "pay": "$170,000 to 200,000", "posted": "Aug 27", "about": ["Owns Salesforce end to end plus Gong, Clay, Apollo and quote to cash.", "Builds scoring agents and MCP servers on GTM data."], "needs": [{"t": "Apex, SOQL, Flow", "k": "crm"}, {"t": "Quote to cash", "k": "crm"}, {"t": "Claude Code with discipline", "k": "agents"}], "url": "https://jobs.ashbyhq.com/rogo/f841b833-2bb0-444c-a41d-5bf16ace0612"},
    {"id": "r-modal", "co": "modal", "title": "GTM Engineer, Data Platform", "level": 8, "loc": "New York", "mode": "On site", "pay": "$200,000 to 220,000", "posted": "1d", "about": ["Builds a people graph to find future customers.", "Owns GTM data models, reverse ETL and enrichment."], "needs": [{"t": "SQL and Python", "k": "analytics"}, {"t": "Snowflake and dbt pipelines", "k": "data"}, {"t": "CRM architecture", "k": "crm"}], "url": "https://jobs.ashbyhq.com/modal/dd6fe63b-8265-474e-b1f0-fcc1c5a28daf"},
    {"id": "r-lc", "co": "langchain", "title": "GTM Engineer", "level": 8, "loc": "Austin", "mode": "Hybrid", "pay": "$160,000 to 180,000", "posted": "Apr 29", "about": ["Builds production agents for support, onboarding and deflection.", "Feeds gaps back into LangChain open source tools."], "needs": [{"t": "LangGraph and LangSmith agents", "k": "agents"}, {"t": "Production grade Python", "k": "agents"}, {"t": "Owns systems end to end", "k": "comms"}], "url": "https://jobs.ashbyhq.com/langchain/825b6d91-bc5e-4165-8a7c-2022a2248f7e"},
    {"id": "r-motive", "co": "motive", "title": "Senior GTM AI Engineer, Deal Desk", "level": 8, "loc": "Remote, US", "mode": "Remote", "pay": "$140,000 to 160,000", "posted": "26d", "about": ["Builds AI agents and automations for the Deal Desk team.", "Takes tools from prototype to production and measures adoption."], "needs": [{"t": "GTM or RevOps background", "k": "crm"}, {"t": "SQL, SOQL, basic Python", "k": "analytics"}, {"t": "Prompt engineering via APIs", "k": "agents"}], "url": "https://job-boards.greenhouse.io/gomotive/jobs/8693228002"},
    {"id": "r-navan", "co": "navan", "title": "Senior GTM Engineer", "level": 8, "loc": "Austin", "mode": "Hybrid", "pay": "Pay not posted", "posted": "29d", "about": ["Builds production AI agents for priority GTM problems.", "Adds evals, human review and rollback to every agent."], "needs": [{"t": "Salesforce, ZoomInfo, Slack integrations", "k": "crm"}, {"t": "Code beyond low code tools", "k": "agents"}, {"t": "Production agent controls", "k": "agents"}], "url": "https://navan.com/careers/openings?gh_jid=8204932"},
    {"id": "r-upside", "co": "upside", "title": "Staff Full Stack Engineer, GTM Systems", "level": 8, "loc": "Austin", "mode": "Hybrid", "pay": "$214,000 to 250,000", "posted": "Jun 8", "about": ["Builds AI native internal platforms for pipeline and revenue ops.", "Owns systems from front end to AI orchestration."], "needs": [{"t": "Full stack engineering depth", "k": "agents"}, {"t": "Prompt design for production", "k": "agents"}, {"t": "Python, SQL, Clay, n8n", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/upside/b586cbe0-5cbb-4e14-8ce0-c8463b936c86"},
    {"id": "r-cf", "co": "cloudflare", "title": "Principal Engineer, GTM Data Platform", "level": 9, "loc": "Austin", "mode": "Hybrid", "pay": "Pay not posted", "posted": "Jul 22", "about": ["Owns the data foundation and sales signals for developer GTM.", "Builds on Cloudflare Workers with Go, TypeScript and SQL."], "needs": [{"t": "Distributed systems", "k": "agents"}, {"t": "Data modeling", "k": "data"}, {"t": "Deep analytical SQL", "k": "analytics"}], "url": "https://boards.greenhouse.io/cloudflare/jobs/8054669?gh_jid=8054669"},
    {"id": "r-vanta", "co": "vanta", "title": "Senior AI GTM Engineer", "level": 9, "loc": "Remote, US", "mode": "Remote", "pay": "$195,000 to 229,000", "posted": "Jul 10", "about": ["Builds internal AI products that change how sales wins deals.", "Works with the CRO from prototype to production."], "needs": [{"t": "Full stack engineering", "k": "agents"}, {"t": "Python, TypeScript, SQL", "k": "analytics"}, {"t": "LLM APIs and workflow tools", "k": "agents"}], "url": "https://jobs.ashbyhq.com/vanta/91c73485-5d0c-4272-9643-401ebcfff9d1"},
    {"id": "r-clay9", "co": "clay", "title": "GTM Engineer, Marketing", "level": 9, "loc": "New York", "mode": "Hybrid", "pay": "$150,000 to 220,000", "posted": "2d", "about": ["Builds lead scoring, intent signals and speed to lead routing.", "Owns marketing to SDR handoffs and their numbers."], "needs": [{"t": "Expert Clay builder", "k": "data"}, {"t": "Funnel analytics and routing", "k": "analytics"}, {"t": "Knows the SDR motion", "k": "comms"}], "url": "https://jobs.ashbyhq.com/claylabs/9f8067d1-61cf-42cd-aad7-0ac54de8b345"},
    {"id": "r-1p", "co": "onepassword", "title": "Senior GTM Engineering Analyst", "level": 9, "loc": "Remote, US", "mode": "Remote", "pay": "$113,000 to 158,000", "posted": "14d", "about": ["Builds AI agents and data products for global GTM teams.", "Connects business systems and automates repeat analysis."], "needs": [{"t": "Shipped LLM agents in real use", "k": "agents"}, {"t": "RevOps or analytics", "k": "analytics"}, {"t": "Power BI and Claude Code", "k": "analytics"}], "url": "https://jobs.ashbyhq.com/1password/6f78b170-9600-4b2d-9682-feead160100d"},
    {"id": "r-1p2", "co": "onepassword", "title": "Staff AI Marketing Systems Engineer", "level": 9, "loc": "Remote, Canada", "mode": "Remote", "pay": "CA$124,000 to 180,000", "posted": "Aug 19", "about": ["Builds agent systems that give sellers live, tailored guidance.", "Runs retrieval, evals and monitoring for those agents."], "needs": [{"t": "LLM agent building", "k": "agents"}, {"t": "Builds eval frameworks", "k": "agents"}, {"t": "GTM systems roles", "k": "crm"}], "url": "https://jobs.ashbyhq.com/1password/c03b0c63-a5e1-49ad-9063-b05e50020acb"},
    {"id": "r-samsara", "co": "samsara", "title": "AI Architect, GTM Systems", "level": 9, "loc": "Remote, Canada", "mode": "Remote", "pay": "$135,575 to 175,450", "posted": "Aug 3", "about": ["Sets the AI architecture for the GTM technology team.", "Decides when to use Workato, Flow or custom agents."], "needs": [{"t": "Enterprise GTM systems architecture", "k": "crm"}, {"t": "Workato, Flow, LangGraph", "k": "agents"}, {"t": "Governance and evaluation", "k": "analytics"}], "url": "https://www.samsara.com/company/careers/roles/8104166?gh_jid=8104166"},
    {"id": "r-toast9", "co": "toast", "title": "Staff Software Engineer, GTM and AI", "level": 9, "loc": "Remote, US", "mode": "Remote", "pay": "$193,000 to 309,000", "posted": "Sep 8", "about": ["Builds LLM tools for account research, lead priority and quoting.", "Connects quoting, Salesforce and the data lake."], "needs": [{"t": "Staff level backend engineering", "k": "agents"}, {"t": "Agentic workflows and RAG", "k": "agents"}, {"t": "Observability", "k": "analytics"}], "url": "https://careers.toasttab.com/jobs?gh_jid=8159352"},
    {"id": "r-lyft9", "co": "lyft", "title": "Senior Business Systems Engineer, AI", "level": 9, "loc": "Toronto", "mode": "Hybrid", "pay": "CA$129,000 to 161,250", "posted": "23d", "about": ["Designs AI agents for sales, marketing and finance teams.", "Builds business cases and trains teams to adopt them."], "needs": [{"t": "Agentic workflow design", "k": "agents"}, {"t": "Business cases with ROI", "k": "analytics"}, {"t": "Change management", "k": "comms"}], "url": "https://app.careerpuck.com/job-board/lyft/job/8790689002?gh_jid=8790689002"},
    {"id": "r-mongo", "co": "mongodb", "title": "Senior Salesforce Engineer", "level": 9, "loc": "Austin", "mode": "Hybrid", "pay": "$118,000 to 231,000", "posted": "Jun 11", "about": ["Builds and maintains Salesforce for the MongoDB sales org.", "Owns delivery from design to production support."], "needs": [{"t": "Senior Salesforce development", "k": "crm"}, {"t": "Integrations and automation", "k": "agents"}, {"t": "Release discipline", "k": "analytics"}], "url": "https://www.mongodb.com/careers/job/?gh_jid=7991447"},
    {"id": "r-adyen", "co": "adyen", "title": "GTM Engineer", "level": 9, "loc": "New York", "mode": "On site", "pay": "$169,000 to 222,000", "posted": "Sep 8", "about": ["Builds internal apps where Salesforce or Marketo fall short.", "Connects GTM tools and LLM APIs through automations."], "needs": [{"t": "Rapid web app prototyping", "k": "agents"}, {"t": "REST APIs and webhooks", "k": "data"}, {"t": "AI coding tools daily", "k": "agents"}], "url": "https://job-boards.greenhouse.io/adyen/jobs/7939712"},
    {"id": "r-ant1", "co": "anthropic", "title": "Business Systems Analyst, GTM Systems", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$270,000 to 315,000", "posted": "15d", "about": ["Owns one funnel domain in Salesforce, such as lead to pipeline.", "Designs stages, routing, handoffs and guardrails."], "needs": [{"t": "Strategist, analyst and builder", "k": "analytics"}, {"t": "Hands on Salesforce configuration", "k": "crm"}, {"t": "Partners with RevOps leaders", "k": "comms"}], "url": "https://job-boards.greenhouse.io/anthropic/jobs/5436196008"},
    {"id": "r-ant2", "co": "anthropic", "title": "Salesforce Developer", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$270,000 to 315,000", "posted": "Sep 8", "about": ["Builds Salesforce automation for pipeline, routing and quote to cash.", "Connects Salesforce with Stripe, Metronome and NetSuite."], "needs": [{"t": "Apex, LWC and Flow", "k": "crm"}, {"t": "Order lifecycle", "k": "crm"}, {"t": "Ships code with Claude", "k": "agents"}], "url": "https://job-boards.greenhouse.io/anthropic/jobs/5413374008"},
    {"id": "r-ant3", "co": "anthropic", "title": "Staff Software Engineer, GTM AI", "level": 10, "loc": "Remote, US", "mode": "Remote", "pay": "$320,000 to 405,000", "posted": "Aug 25", "about": ["Builds agents that run inbound, outbound and pipeline work.", "Designs evals and human oversight for those agents."], "needs": [{"t": "Full stack plus MCP servers", "k": "agents"}, {"t": "Agent evaluation frameworks", "k": "agents"}, {"t": "Observability tied to revenue", "k": "analytics"}], "url": "https://job-boards.greenhouse.io/anthropic/jobs/5390966008"},
    {"id": "r-oai", "co": "openai", "title": "Analytics Engineer, GTM", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$220,000 to 335,000", "posted": "Aug 26", "about": ["Builds trusted GTM data models, metrics and dashboards.", "Sets data strategy for new sales areas."], "needs": [{"t": "Data modeling and pipelines", "k": "data"}, {"t": "Metric definition", "k": "analytics"}, {"t": "Clear storytelling with data", "k": "comms"}], "url": "https://jobs.ashbyhq.com/openai/bc0d4a9f-235f-4a4b-a854-c6cb0322ccaa"},
    {"id": "r-ramp1", "co": "ramp", "title": "GTM Business Systems Engineer, Post Sales", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$151,200 to 230,000", "posted": "Sep 3", "about": ["Builds the Salesforce products behind onboarding and expansion.", "Owns integrations with the Ramp revenue app."], "needs": [{"t": "Salesforce platform depth", "k": "crm"}, {"t": "Apex, LWC, Python", "k": "agents"}, {"t": "Workato or Clay", "k": "data"}], "url": "https://jobs.ashbyhq.com/ramp/696bc715-794c-4a0c-967d-d7f8b637b392"},
    {"id": "r-ramp2", "co": "ramp", "title": "GTM Business Systems Analyst, Post Sales", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$134,400 to 209,000", "posted": "Sep 4", "about": ["Runs Salesforce, LeanData, Outreach, Gong and Workato.", "Builds flows and specs for post sales teams."], "needs": [{"t": "Salesforce Admin skills", "k": "crm"}, {"t": "LeanData, Chili Piper, Hightouch", "k": "data"}, {"t": "RevOps or systems", "k": "comms"}], "url": "https://jobs.ashbyhq.com/ramp/196e4e25-c452-430d-8b2f-36a40f88a2ae"},
    {"id": "r-stripe", "co": "stripe", "title": "GTM Operations Process Architect", "level": 10, "loc": "Remote, US", "mode": "Remote", "pay": "Pay not posted", "posted": "Jun 18", "about": ["Owns automation for territory, quota and account assignment.", "Moves legacy tools to Stripe built systems."], "needs": [{"t": "Strong SQL and data architecture", "k": "analytics"}, {"t": "Salesforce and approval flows", "k": "crm"}, {"t": "Ops or systems leadership", "k": "comms"}], "url": "https://stripe.com/jobs/search?gh_jid=7993610"},
    {"id": "r-figma", "co": "figma", "title": "Marketing Engineer", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$127,000 to 296,000", "posted": "Jun 5", "about": ["Ships AI agents and automations that marketers use every week.", "Measured on agents live, hours saved and revenue."], "needs": [{"t": "Shipped AI agents in production", "k": "agents"}, {"t": "Gumloop, n8n, Workato or Zapier", "k": "data"}, {"t": "GTM systems", "k": "crm"}], "url": "https://boards.greenhouse.io/figma/jobs/6013495004?gh_jid=6013495004"},
    {"id": "r-dd10", "co": "datadog", "title": "Senior Business Systems Analyst", "level": 10, "loc": "New York", "mode": "Hybrid", "pay": "$135,000 to 169,000", "posted": "20d", "about": ["Owns a business domain such as GTM, like an internal PM.", "Finds automation and agent work early."], "needs": [{"t": "Turns processes into agent workflows", "k": "agents"}, {"t": "Reads API docs, writes specs", "k": "comms"}, {"t": "Business systems", "k": "crm"}], "url": "https://careers.datadoghq.com/detail/8231811/?gh_jid=8231811"},
    {"id": "r-rippling", "co": "rippling", "title": "Business Systems Developer", "level": 10, "loc": "Remote, US", "mode": "Remote", "pay": "$150,000 to 175,000", "posted": "", "about": ["Builds Salesforce solutions and AI assistants for business teams.", "Picks low code, code or AI for each problem."], "needs": [{"t": "Apex, SOQL, LWC, Flows", "k": "crm"}, {"t": "Git and CI/CD", "k": "agents"}, {"t": "AI assisted development", "k": "agents"}], "url": "https://ats.rippling.com/rippling/jobs/00dbe4a0-da1e-4696-8c15-d4724a402c42"},
    {"id": "r-pplx", "co": "perplexity", "title": "Sales Systems Engineer", "level": 10, "loc": "Austin", "mode": "Hybrid", "pay": "$200,000 to 230,000", "posted": "May 19", "about": ["Owns CPQ, lead and account scoring, routing and data pipelines.", "Pushes Snowflake scores into Salesforce."], "needs": [{"t": "Snowflake SQL and Salesforce flows", "k": "analytics"}, {"t": "Hightouch or Workato", "k": "data"}, {"t": "Python for data fixes", "k": "agents"}], "url": "https://jobs.ashbyhq.com/perplexity/6eedd99c-ff6a-470b-a7cc-3303e1c0b7fc"}
  ];
  /* how many roles each level's bucket holds, in her places (stand-ins: Navid is asking engineering). Few GTM internships exist, so Level 1 is small. */
  var BUCKET = { 1: 12, 2: 18, 3: 30, 4: 40, 5: 50, 6: 60, 7: 55, 8: 45, 9: 30, 10: 20 };
  /* what a bucket is called */
  var GATES = {};
  [[1, 'Internships'], [2, 'Internships'], [3, 'Analyst roles'], [4, 'Analyst roles'], [5, 'Associate roles'], [6, 'GTM Engineer'],
   [7, 'GTM Engineer'], [8, 'GTM Engineer'], [9, 'Senior roles'], [10, 'Top of the field']].forEach(function (x) {
    GATES[x[0]] = { name: x[1], say: BUCKET[x[0]] + ' roles open.' };
  });
  var MILES = {};

  /* what a level means to someone hiring. One line a recruiter can read. */
  var BANDS = [
    { from: 0,  to: 0,  name: 'Starting out', can: 'Building the first reviewed case.' },
    { from: 1,  to: 2,  name: 'Internships',  can: 'Has shipped one working GTM workflow, reviewed by a manager.' },
    { from: 3,  to: 5,  name: 'Analyst roles', can: 'Builds routing, enrichment and reports that sales teams use.' },
    { from: 6,  to: 8,  name: 'GTM Engineer', can: 'Owns a revenue workflow end to end, agents included.' },
    { from: 9,  to: 10, name: 'Top of the field', can: 'Sets direction and brings others along.' }
  ];

  /* the first scenario, graded. Used by the earn, review and level-up screens. */
  var RESULT = {
    scenario: 's1', band: 'Meeting Expectations', earned: 1000, max: SCENARIO_MAX,
    bySkill: [
      { skill: 'agents', pts: 400, max: 1000, why: 'Your router sends each lead to the right rep with a draft reply.' },
      { skill: 'crm',    pts: 350, max: 1100, why: 'The routing rules work. Two edge cases still land with no owner.' },
      { skill: 'comms',  pts: 250, max: 900,  why: 'Clear demo. You did not say how reps get told about a new lead.' }
    ],
    left: 2000, back: 1000, fix: 'Give every lead an owner, even the edge cases, and show how reps hear about it.'
  };

  /* the app's own performance bands, and what one scenario pays at each (13 Oct founder call stand-ins) */
  var PAYS = [
    { band: 'Below Expectations',     pts: 500 },
    { band: 'Meeting Expectations',   pts: 1000 },
    { band: 'Exceeding Expectations', pts: 2000 },
    { band: 'Exceptional',            pts: 3000 }
  ];

  /* the moments inside a scenario that pay, in order */
  var EARN = [
    { k: 'notes',   label: 'Kickoff notes',  max: 200,  got: 80 },
    { k: 'say',     label: 'Say it back',    max: 200,  got: 100 },
    { k: 'stage1',  label: 'Map the lead flow', max: 800,  got: 320 },
    { k: 'stage2',  label: 'Build the router',  max: 1000, got: 300 },
    { k: 'present', label: 'Present it',     max: 800,  got: 200 }
  ];

  /* credits: the reward currency. Earned for doing things, never for nothing (stand-in amounts) */
  var CREDITS = { stage: 50, scenario: 150, levelUp: 100, streakDay: 20, streakWeek: 100, invite: 100 };
  /* the daily check in: open Zero, collect the roles the agents found overnight. Seven days = 50 roles. (stand-ins) */
  var CHECKIN = [{ d: 1, roles: 5 }, { d: 2, roles: 6 }, { d: 3, roles: 6 }, { d: 4, roles: 7 }, { d: 5, roles: 8 }, { d: 6, roles: 8 }, { d: 7, roles: 10, chest: true }];

  /* the coach: one for all of Zero. The reads live in its head, never on screen as a dashboard. */
  var COACH = {
    name: 'Zero',
    reads: ['Independence', 'Communication', 'Quality', 'Speed', 'AI slop'],
    think: {
      day0:   'I have not seen your work yet. Show me what you can do.',
      won1:   'You build things that work. Your messages read rushed.',
      after1: 'You build things that work. Your messages read rushed.',
      mid:    'You are doing well. Your data work is the strongest part of what you build.',
      summit: 'You are ready for the top roles. Your systems hold up when people push on them.'
    },
    need: {
      day0:   ['Take notes in the kickoff', 'Ask your manager when you are stuck', 'Write in full sentences'],
      won1:   ['Write to your manager in full sentences', 'Test an agent before it sends anything', 'Say what a system costs to run'],
      after1: ['Write to your manager in full sentences', 'Test an agent before it sends anything', 'Say what a system costs to run'],
      mid:    ['Show the numbers before and after', 'Present without reading the slides', 'Finish a stage without asking'],
      summit: ['Keep your work this clear', 'Pick the roles you want most', 'Apply to the top bucket']
    },
    notes: {
      nudge:  { what: 'Communication', said: 'hey u there? need crm access', line: 'That read rushed. Write it the way you would to a real manager.' },
      praise: { what: 'Communication', said: 'I mapped the lead flow: 41% of leads wait more than a day. I will build the router next.', line: 'That was a clear update. Keep doing that.' },
      slop:   { what: 'AI slop', said: 'In today\'s fast-paced world, sales teams deserve a holistic, frictionless lead solution.', line: 'This reads like AI wrote it. Say it in your own words.' }
    }
  };


  /* ---------- derived, so no screen does its own maths ---------- */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  /* You start at Level 0. Every 1,000 skill points is one more level, up to Level 10. */
  function level(pts) { return Math.min(10, Math.floor(pts / PER_LEVEL)); }
  function into(pts) { return level(pts) >= 10 ? PER_LEVEL : pts - level(pts) * PER_LEVEL; }   // points into the current level
  function toNext(pts) { return PER_LEVEL - into(pts); }                   // points to the next level
  function at(lv) { return lv * PER_LEVEL; }                               // points a level starts at
  function scenariosTo(lv, pts) { return Math.max(0, Math.ceil((at(lv) - pts) / PACE)); }
  function rung(id) { return RUNGS.filter(function (r) { return r.id === id; })[0] || RUNGS[2]; }
  function band(lv) { return BANDS.filter(function (b) { return lv >= b.from && lv <= b.to; })[0] || BANDS[BANDS.length - 1]; }
  function scenario(id) { return SCENARIOS.filter(function (s) { return s.id === id; })[0]; }
  /* how many scenarios stand between day one and this job: a nearer job needs fewer stops on the road */
  function need(dream) { return Math.max(1, Math.min(SCENARIOS.length, scenariosTo(rung(dream.rung).level, START))); }
  /* the levels where roles open for this dream, and the next one above a level (null when there is none) */
  function gates(dream) { var g = []; roles(dream).forEach(function (r) { if (g.indexOf(r.level) < 0) g.push(r.level); }); return g.sort(function (a, b) { return a - b; }); }
  function nextGate(dream, lv) { return gates(dream).filter(function (g) { return g > lv; })[0] || null; }
  /* minutes of scenario work between now and a level, at about a level a scenario */
  function minsTo(lv, st) { var n = scenariosTo(lv, st.pts), m = 0; SCENARIOS.slice(st.done, st.done + n).forEach(function (x) { m += x.mins; }); return m; }

  /* every role on the path for this dream: the market roles plus the four rungs at the company you want */
  function roles(dream) {
    var mine = RUNGS.map(function (r) {
      return { id: 'd-' + r.id, co: dream.co, title: r.title, level: r.level, loc: DLOC[dream.co] || 'Remote', mode: 'Hybrid', pay: r.pay,
        posted: '2d', applicants: 180, dream: true, target: r.id === dream.rung };
    });
    return ROLES.concat(mine).sort(function (a, b) { return a.level - b.level || (a.dream ? 1 : 0) - (b.dream ? 1 : 0); });
  }
  var DLOC = { apple: 'Cupertino', google: 'Mountain View', microsoft: 'Redmond', amazon: 'Seattle', openai: 'New York', samsung: 'Mountain View' };
  function rolesAt(dream, lv) { return roles(dream).filter(function (r) { return r.level === lv; }); }
  function target(dream) { return roles(dream).filter(function (r) { return r.target; })[0]; }
  /* locked | open | applied */
  function roleState(role, st) {
    if ((st.applied || []).indexOf(role.id) >= 0) return 'applied';
    return role.level <= level(st.pts) ? 'open' : 'locked';
  }
  /* how well the work so far backs this role, 0 to 100. Scenarios done at that company count most. */
  function match(role, st) {
    var done = SCENARIOS.slice(0, st.done), n = 76 + (role.id.charCodeAt(2) * 7 + role.id.charCodeAt(3)) % 9;
    if (done.some(function (x) { return x.co === role.co; })) n += 10;
    n += Math.min(5, Math.max(0, level(st.pts) - role.level));
    return Math.max(70, Math.min(97, n));
  }
  /* the scenarios still ahead that close the gap to a locked role */
  function gap(role, st) {
    var n = scenariosTo(role.level, st.pts);
    return SCENARIOS.slice(st.done, st.done + n);
  }

  /* the moments of the story. Level 1 at the start, Level 2 after one scenario (portfolio live, no roles yet),
     Level 3 after two (the first roles open), Level 7 in the middle, Level 10 when the job opens. */
  /* the moments of the story. Level 0 at the start; one solid scenario is Level 1 and the first roles. */
  var MOMENTS = {
    day0:   { pts: 0,     done: 0, applied: [], credits: 0,     streak: 0 },
    won1:   { pts: 1000,  done: 1, applied: [], credits: 450,   streak: 3 },
    after1: { pts: 1000,  done: 1, applied: ['r-peec1', 'r-base1'], credits: 450, streak: 3 },
    mid:    { pts: 5000,  done: 4, applied: ['r-peec1', 'r-base1', 'r-dd3', 'r-nr', 'r-peec4', 'r-ashby'], credits: 1840, streak: 4 },
    summit: { pts: 10000, done: 9, applied: ['r-peec1', 'r-base1', 'r-dd3', 'r-nr', 'r-peec4', 'r-ashby', 'r-grow', 'r-zip', 'r-attio', 'r-clay9'], credits: 3760, streak: 9 }
  };
  /* what each finished scenario paid (Meeting 1,000, Exceeding 2,000) */
  var PAID = [1000, 1000, 1000, 2000, 1000, 1000, 1000, 1000, 1000, 1000];

  /* Tracker V1: three states only. Applied (within ten days or older), Connected (they wrote back), Lost. */
  var TRACK = {
    'r-base1': { st: 'lost',      when: 'Sep 30', note: 'Role filled' },
    'r-peec1': { st: 'lost',      when: 'Oct 9',  note: 'Not selected' },
    'r-dd3':   { st: 'applied',   when: 'Oct 6' },
    'r-nr':    { st: 'connected', when: 'Oct 3',  note: 'New Relic emailed you' },
    'r-peec4': { st: 'connected', when: 'Oct 13', note: 'Peec AI emailed you' },
    'r-ashby': { st: 'applied',   when: 'Oct 13' }
  };

  /* the role bank: what the agents bring in. Real roles, the ones her level has opened first. */
  function bank(lv, n) {
    var L = Math.max(1, lv), pool = ROLES.filter(function (r) { return r.level <= L; }).concat(ROLES.filter(function (r) { return r.level > L; }));
    return pool.slice(0, n).map(function (r, k) {
      return { id: 'b-' + r.id, co: r.co, title: r.title, level: r.level, loc: r.loc, mode: r.mode, pay: r.pay, posted: r.posted, about: r.about,
        fit: k % 5 === 0 ? 'fire' : k % 3 === 0 ? 'good' : '' };
    });
  }

  /* one application followed from the yes to the offer letter: the job you wanted, at Level 10 */
  var JOURNEY = {
    role: 'd-mid',
    stages: ['sent', 'viewed', 'invited', 'scheduled', 'interviewed', 'offer', 'hired'],
    recruiter: { name: 'Sam Okafor', title: 'GTM recruiter' },
    panel: [{ name: 'Daniel Ortiz', title: 'GTM Systems lead' }, { name: 'Priya Nair', title: 'Senior GTM Engineer' }],
    slots: [{ day: 'Tuesday', date: 'October 20', time: '10:00am' }, { day: 'Wednesday', date: 'October 21', time: '2:30pm' }, { day: 'Friday', date: 'October 23', time: '11:00am' }],
    length: '45 minutes on video',
    format: 'You walk through one system you built, then they ask about your decisions.',
    cases: ['s9', 's5', 's1'],
    offer: { salary: '$164,000', bonus: '$20,000 sign on', equity: 'Stock, vesting over four years', start: 'Monday, January 11', reply: 'Friday, November 6', sent: 'October 28' }
  };

  /* ---------- Jobs: applications, the inbox, what happened ----------
     Applications are one list. Each one is Applied, Replied (a recruiter wrote back: the conversation is in the Inbox)
     or Interview (a time is booked). Anything that ended (not selected, role filled, no reply in 30 days) goes to Archived. */
  var APPS = {
    'r-nr':    { st: 'interview', when: 'Oct 3',  note: 'Interview link sent', thread: 't-nr' },
    'r-peec4': { st: 'replied',   when: 'Oct 13', note: 'Peec AI replied', thread: 't-peec' },
    'r-dd3':   { st: 'applied',   when: 'Oct 6' },
    'r-ashby': { st: 'applied',   when: 'Oct 13' },
    'r-peec1': { st: 'archived',  when: 'Oct 9',  note: 'Not selected' },
    'r-base1': { st: 'archived',  when: 'Sep 30', note: 'Role filled' }
  };
  /* recruiters write here after an application. Zero never writes for the learner without a yes. */
  var INBOX = [
    { id: 't-nr', role: 'r-nr', co: 'newrelic', who: 'Priya Shah', title: 'Recruiter', photo: 'img/cast-priya.jpg', unread: true, when: '9:12am',
      msgs: [
        { from: 'them', at: 'Mon 9:40am', t: 'Hi Maya, thanks for applying. Your lead router stood out to our GTM Systems lead.' },
        { from: 'me',   at: 'Mon 10:02am', t: 'Thank you, Priya. Happy to walk through it.' },
        { from: 'them', at: 'Today 9:12am', t: 'Great. Pick a time for a 30 minute call with Tom, who leads GTM Systems.', invite: { len: '30 min', with: 'Tom Reid, GTM Systems lead', on: 'Zoom',
          slots: [{ d: 'Thu, Oct 16', t: '10:00am' }, { d: 'Thu, Oct 16', t: '2:30pm' }, { d: 'Fri, Oct 17', t: '11:00am' }] } }
      ] },
    { id: 't-peec', role: 'r-peec4', co: 'peec', who: 'Diego Alvarez', title: 'Talent partner', photo: 'img/cast-diego.jpg', unread: false, when: 'Yesterday',
      msgs: [
        { from: 'them', at: 'Oct 13', t: 'Hi Maya, we liked the HubSpot routing in your Airbnb project. Are you open to New York, on site?' },
        { from: 'me',   at: 'Oct 13', t: 'Yes. I can move to New York in January.' },
        { from: 'them', at: 'Yesterday', t: 'Perfect. Could you share one workflow you built that a sales team still uses?' }
      ] }
  ];
  /* what happened, newest first: Zero's work and the companies' replies */
  var ACTIVITY = [
    { at: '9:12am', co: 'newrelic', t: 'New Relic sent an interview link' },
    { at: '8:30am', zero: true, t: 'Zero found 7 new roles for you' },
    { at: 'Yesterday', co: 'peec', t: 'Peec AI replied' },
    { at: 'Oct 13', zero: true, t: 'Applied to Ashby, tailored with your Uber project' },
    { at: 'Oct 11', lv: 5, t: 'Level 5. 50 new roles opened' },
    { at: 'Oct 9', co: 'peec', t: 'Peec AI closed your internship application' }
  ];
  /* roles she has liked: two she can apply to, one her next level opens */
  var LIKED = ['r-grow', 'r-blvd', 'r-base6'];

  window.SP_DATA = {
    APPS: APPS, INBOX: INBOX, ACTIVITY: ACTIVITY, LIKED: LIKED, PNG: PNG, MONO: MONO,
    MOMENTS: MOMENTS, CHECKIN: CHECKIN, PAID: PAID, JOURNEY: JOURNEY, GATES: GATES, MILES: MILES, BUCKET: BUCKET, CREDITS: CREDITS, COACH: COACH, TRACK: TRACK, bank: bank,
    PER_LEVEL: PER_LEVEL, SCENARIO_MAX: SCENARIO_MAX, PACE: PACE, START: START,
    SKILLS: SKILLS, PLACE: PLACE, ROOF: ROOF, HEART: HEART, SPOT: SPOT, SIDE: SIDE, VIA: VIA, SCENARIOS: SCENARIOS, CO: CO, TINT: TINT, INK: INK, DREAMS: DREAMS, RUNGS: RUNGS,
    ROLES: ROLES, BANDS: BANDS, RESULT: RESULT, EARN: EARN, PAYS: PAYS, DLOC: DLOC,
    learner: { name: 'Maya', full: 'Maya Reyes', family: 'GTM Engineer', focus: ['GTM Engineer', 'RevOps Engineer', 'Growth Engineer'],
      city: 'Austin, Texas', places: ['Austin', 'Remote, US', 'New York', 'Toronto'], photo: 'img/maya.jpg',
      wants: ['Build the systems sales teams run on', 'Work with AI agents every day', 'A team that ships fast'] },
    fmt: fmt, level: level, into: into, toNext: toNext, at: at, scenariosTo: scenariosTo, rung: rung, band: band, scenario: scenario, need: need, gates: gates, nextGate: nextGate, minsTo: minsTo,
    roles: roles, rolesAt: rolesAt, target: target, roleState: roleState, match: match, gap: gap
  };
})();
