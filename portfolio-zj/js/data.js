/* Zero portfolio. Sample candidate on the GTM Engineer track.
   Every surface reads from this one object. Levels run 1 to 10. */
window.ZP = window.ZP || {};

ZP.logos = {
  /* mask = single colour mark tinted with its brand colour, img = full colour file */
  clay:      { t: 'Clay',      img: 'logos/fav-clay.png' },
  n8n:       { t: 'n8n',       mask: 'logos/si-n8n.svg', c: '#EA4B71' },
  claude:    { t: 'Claude',    mask: 'logos/si-claude.svg', c: '#D97757' },
  hubspot:   { t: 'HubSpot',   mask: 'logos/m-hubspot.svg', c: '#FF7A59' },
  apollo:    { t: 'Apollo.io', img: 'logos/fav-apollo.png' },
  instantly: { t: 'Instantly', img: 'logos/fav-instantly.png' },
  snowflake: { t: 'Snowflake', mask: 'logos/si-snowflake.svg', c: '#29B5E8' },
  hightouch: { t: 'Hightouch', img: 'logos/fav-hightouch.png' },
  cursor:    { t: 'Cursor',    mask: 'logos/si-cursor.svg', c: '#111113' },
  python:    { t: 'Python',    mask: 'logos/si-python.svg', c: '#3776AB' },
  slack:     { t: 'Slack',     mask: 'logos/m-slack.svg', c: '#4A154B' },
  openai:    { t: 'OpenAI',    mask: 'logos/m-openai.svg', c: '#111113' },
  notion:    { t: 'Notion',    mask: 'logos/m-notion.svg', c: '#111113' },
  figma:     { t: 'Figma',     mask: 'logos/m-figma.svg', c: '#F24E1E' },
  stripe:    { t: 'Stripe',    mask: 'logos/m-stripe.svg', c: '#635BFF' },
  shopify:   { t: 'Shopify',   mask: 'logos/m-shopify.svg', c: '#5E8E3E' },
  canva:     { t: 'Canva',     mask: 'logos/m-canva.svg', c: '#00C4CC' },
  zapier:    { t: 'Zapier',    mask: 'logos/si-zapier.svg', c: '#FF4F00' },
  salesforce:{ t: 'Salesforce',mask: 'logos/si-salesforce.svg', c: '#00A1E0' },
  google:    { t: 'Google',    mask: 'logos/m-google.svg', c: '#4285F4' },
  utexas:    { t: 'UT Austin', img: 'logos/fav-utexas.png' },
  meet:      { t: 'Google Meet', mask: 'logos/si-googlemeet.svg', c: '#00897B' }
};

ZP.person = {
  name: 'Maya Reyes',
  first: 'Maya',
  role: 'GTM AI Engineer',
  place: 'Austin, Texas',
  photo: 'img/maya.jpg', photoS: 'img/maya-s.jpg',
  level: 8,
  levelLine: 'Delivers on her own',
  open: 'Open to GTM engineering roles. Remote in the US, or Austin.',
  about: 'I build the agents and data pipelines that sales teams run on. I start from the rep’s day, wire the data, then put a number on what changed.',
  aboutLead: 'A GTM AI engineer who builds the agents and data pipelines that sales teams run on,',
  aboutTail: 'and puts a number on what changed.',
  track: 'GTM Engineer track',
  short: 'I build the agents and data pipelines that sales teams run on.',
  facts: [['Location', 'Austin, Texas'], ['Work style', 'Remote in the US, or Austin'], ['Work authorization', 'Authorized to work in the US'], ['Available', 'From November 2026'], ['Languages', 'English, native. Spanish, professional.']],
  zeroWhen: 'Mar 2026 to Sep 2026',
  stats: [
    { n: '7', l: 'Scenarios completed' },
    { n: '6 of 7', l: 'Rated Exceeds or higher' },
    { n: '46 min', l: 'Of recorded presentations' }
  ]
};

/* what each band of levels means. one line each, written for a recruiter */
ZP.levelBands = [
  { from: 1, to: 2, t: 'Learning the tools' },
  { from: 3, to: 4, t: 'Follows a clear brief' },
  { from: 5, to: 6, t: 'Delivers with some guidance' },
  { from: 7, to: 8, t: 'Delivers on her own' },
  { from: 9, to: 10, t: 'Leads the work' }
];

ZP.projects = [
  {
    id: 'router',
    me: 'I built a workflow for HubSpot’s sales team that reads every new form fill, scores how good a fit the lead is, and sends it to the right rep with a reply already drafted. Leads used to wait about four hours for a first reply, and in my test on 1,200 past leads that dropped to about a minute and a half.', co: 'hubspot', coName: 'HubSpot', cat: 'AI agents for GTM',
    title: 'Inbound lead router that replies in 90 seconds',
    short: 'Inbound lead router',
    big: '1 min 34 s', bigL: 'median first reply, down from 4 h 12 min',
    result: 'Median first reply fell from 4 h 12 min to 1 min 34 s on 1,200 replayed leads.',
    sum: 'An n8n workflow reads each form fill, has Claude score the fit, and sends it to the right rep with a drafted reply. Anything the model is unsure about goes to a person.',
    tools: ['n8n', 'claude', 'hubspot', 'slack'],
    dur: '6:48', date: 'Sep 2026', verdict: 'Exceptional', cam: 'img/cam-1.jpg', camS: 'img/cam-1-s.jpg', camX: 55, screen: 'n8n',
    by: 'Dana Whitfield', byRole: 'Director of Revenue Operations',
    quote: 'She replayed last quarter’s real leads through the router before she showed it to anyone. The human queue for unsure scores is the part I would ship first.',
    files: ['lead-router.json', 'replay-1200-leads.csv'],
    said: ['So every form fill lands here, in the HubSpot trigger.', 'Claude scores the fit from 0 to 100 and gives one reason.', 'Under 70, it never goes to a rep. It goes to this review queue.', 'On 1,200 replayed leads the median reply was 1 minute 34.']
  },
  {
    id: 'waterfall',
    me: 'Notion’s sales team had a list of 8,400 companies it wanted to reach, but only about half had an email address we could trust. I set up a table that checks four data providers one at a time, cheapest first, and stops as soon as one returns a verified email, which took coverage from 54% to 91%.', co: 'notion', coName: 'Notion', cat: 'Data enrichment',
    title: 'Enrichment waterfall for 8,400 target accounts',
    short: 'Enrichment waterfall',
    big: '54% to 91%', bigL: 'verified email coverage',
    result: 'Verified email coverage went from 54% to 91% at $0.07 a contact.',
    sum: 'A Clay table tries four data providers in order of cost and stops at the first verified hit. Claude writes one line on why each account fits.',
    tools: ['clay', 'apollo', 'claude', 'hubspot'],
    dur: '5:21', date: 'Aug 2026', verdict: 'Exceeds', cam: 'img/cam-2.jpg', camS: 'img/cam-2-s.jpg', camX: 62, screen: 'clay',
    by: 'Marcus Hale', byRole: 'Head of Growth',
    quote: 'Cheapest provider first, stop at the first verified hit. She priced every step, so I could see what a contact costs before we ran it.',
    files: ['waterfall-table.csv', 'coverage-report.pdf'],
    said: ['Each row is one target account. 8,400 in total.', 'Apollo runs first because it is the cheapest.', 'If it misses, the next provider tries. Then it stops.', 'Coverage went from 54 to 91 percent at 7 cents a contact.']
  },
  {
    id: 'evals',
    me: 'I built an agent for Shopify’s outbound team that writes the first email to each account from a short brief. Before it could send anything, I ran it against 50 test cases that check the facts, the tone and the length, so I knew where it failed and fixed that first.', co: 'shopify', coName: 'Shopify', cat: 'AI outbound',
    title: 'Outbound email agent with its own eval suite',
    short: 'Outbound agent with evals',
    big: '46 of 50', bigL: 'rubric checks passed before any send',
    result: 'Passed 46 of 50 rubric checks, and positive replies rose from 2.1% to 5.4% in the simulated send.',
    sum: 'Claude drafts each first email from the account brief. A set of 50 test cases checks facts, tone and length before anything is queued in Instantly.',
    tools: ['claude', 'instantly', 'cursor', 'python'],
    dur: '8:12', date: 'Sep 2026', verdict: 'Exceptional', cam: 'img/cam-4.jpg', camS: 'img/cam-4-s.jpg', camX: 60, screen: 'evals',
    by: 'Tom Becker', byRole: 'VP, Sales Development',
    quote: 'Most people show me their best email. She showed me the four that failed and what she changed because of them.',
    files: ['eval-run-14.pdf', 'outbound-agent.py'],
    said: ['This is run 14. Fifty cases, same rubric every time.', 'Forty-six passed. I want to show you the four that did not.', 'All four were tone. The facts were right every time.', 'In the simulated send, positive replies went from 2.1 to 5.4 percent.']
  },
  {
    id: 'intent',
    me: 'Stripe’s reps had more accounts than they could call, so I turned three signs of buying interest into one score per account: pricing page visits, new sales hires and funding news. The ten best accounts post in Slack at 8 every morning with the reason, and in a four week test the top scoring accounts booked meetings about three times as often.', co: 'stripe', coName: 'Stripe', cat: 'Intent signals',
    title: 'Intent signals that tell reps who to call today',
    short: 'Intent signal scoring',
    big: '3.1x', bigL: 'meeting rate for the top tenth of accounts',
    result: 'The top tenth of scored accounts booked meetings at 3.1x the base rate in a four week backtest.',
    sum: 'Pricing page visits, new sales hires and funding news roll into one account score. The top ten land in Slack at 8 am with the reason attached.',
    tools: ['clay', 'snowflake', 'claude', 'slack'],
    dur: '7:05', date: 'Jul 2026', verdict: 'Exceeds', cam: 'img/cam-3.jpg', camS: 'img/cam-3-s.jpg', camX: 50, screen: 'slack',
    by: 'Priya Nair', byRole: 'Senior Manager, Sales Strategy',
    quote: 'Reps do not read dashboards. Putting ten accounts and a reason in Slack at 8 am was the right call.',
    files: ['signal-score.sql', 'backtest-4-weeks.pdf'],
    said: ['Three signals go into one score per account.', 'Every morning the top ten post here, with the reason.', 'I backtested it on four weeks of meetings.', 'The top tenth booked at 3.1 times the base rate.']
  },
  {
    id: 'pql',
    me: 'I wanted Figma’s sales team to know which free workspaces were most likely to upgrade, so I scored each one on seats, shared files and how often people edit. I tested the score on a month of data it had never seen, and the top 5% of workspaces held 38% of the upgrades.', co: 'figma', coName: 'Figma', cat: 'Product led sales',
    title: 'Product qualified lead score from workspace usage',
    short: 'Product qualified lead score',
    big: '38%', bigL: 'of upgrades sat in the top 5% of scores',
    result: 'The top 5% of scored workspaces held 38% of upgrades in the holdout month.',
    sum: 'A SQL model in Snowflake turns seats, shared files and editor activity into one score. Hightouch syncs it to HubSpot so reps see it on the account.',
    tools: ['snowflake', 'hightouch', 'hubspot', 'python'],
    dur: '6:02', date: 'Jul 2026', verdict: 'Exceeds', cam: 'img/cam-5.jpg', camS: 'img/cam-5-s.jpg', camX: 50, screen: 'lift',
    by: 'Elena Sokolova', byRole: 'Growth Analytics Lead',
    quote: 'She held out a full month and scored it blind. That is the only number I trust.',
    files: ['pql-score.sql', 'holdout-month.pdf'],
    said: ['Three inputs. Seats, shared files, editor activity.', 'I trained on six months and held out the seventh.', 'The top five percent of scores held 38 percent of upgrades.', 'Hightouch pushes the score to HubSpot every night.']
  },
  {
    id: 'notes',
    me: 'Reps at Slack were typing their notes into the CRM by hand after every sales call, so I built an agent that reads the transcript and fills in the seven deal fields for them. Every answer links back to the exact line in the call, and two human reviewers agreed with it 94% of the time.', co: 'slack', coName: 'Slack', cat: 'AI agents for GTM',
    title: 'Call notes agent that fills the CRM and shows its sources',
    short: 'Call notes agent',
    big: '94%', bigL: 'agreement with two human reviewers',
    result: 'Filled seven deal fields per call at 94% agreement with two human reviewers across 60 calls.',
    sum: 'After each sales call, Claude reads the transcript, fills the deal fields in HubSpot and links every answer to the line it came from.',
    tools: ['claude', 'hubspot', 'n8n', 'python'],
    dur: '7:36', date: 'Jun 2026', verdict: 'Exceeds', cam: 'img/cam-7.jpg', camS: 'img/cam-7-s.jpg', camX: 55, screen: 'crm',
    by: 'Rachel Kim', byRole: 'Director of Sales Enablement',
    quote: 'Every field links to the line in the call. My managers stopped asking where the answer came from.',
    files: ['notes-agent.py', 'reviewer-agreement.csv'],
    said: ['The call ends and the transcript comes in here.', 'Claude fills seven fields. Each one has a source line.', 'Click the time stamp and you hear that part of the call.', 'Two reviewers agreed with it 94 percent of the time.']
  },
  {
    id: 'model',
    me: 'Canva’s CRM listed the same company several times over, and about one in five accounts had no owner. I wrote three rules for when two records are the same company, merged 3,180 duplicates and brought accounts with no owner down to 3%.', co: 'canva', coName: 'Canva', cat: 'CRM data model',
    title: 'CRM data model for one clean view of each account',
    short: 'CRM data model',
    big: '22% to 3%', bigL: 'accounts with no owner',
    result: 'Merged 3,180 duplicate accounts and cut accounts with no owner from 22% to 3%.',
    sum: 'Three match rules and a parent and child account structure in HubSpot, with a weekly check that flags new duplicates.',
    tools: ['hubspot', 'snowflake', 'n8n'],
    dur: '5:40', date: 'May 2026', verdict: 'Meets', cam: 'img/cam-6.jpg', camS: 'img/cam-6-s.jpg', camX: 68, screen: 'erd',
    by: 'James Okafor', byRole: 'RevOps Manager',
    quote: 'The model is right. The rollout plan needed owners and dates, and she added them after the review.',
    files: ['account-model.pdf', 'match-rules.md'],
    said: ['One parent account. Regions sit under it as children.', 'Three rules decide if two records are the same company.', 'That merged 3,180 duplicates.', 'Accounts with no owner went from 22 percent to 3.']
  }
];

ZP.skills = [
  { g: 'Agents and automation', items: [['AI agents in revenue workflows', 9], ['Workflow orchestration', 8], ['Prompt and context design', 8], ['Evals and guardrails', 8]] },
  { g: 'Data', items: [['Data enrichment waterfall', 9], ['Lead scoring', 8], ['SQL', 8], ['CRM data modeling', 7], ['Reverse ETL', 7]] },
  { g: 'GTM judgment', items: [['Intent signals', 8], ['Ideal customer profile', 7], ['Product led sales', 7], ['Cold email deliverability', 6]] },
  { g: 'Working with people', items: [['Presenting to a team', 8], ['Written updates', 8], ['Scoping a loose brief', 6]] }
];

ZP.tools = ['clay', 'n8n', 'claude', 'hubspot', 'apollo', 'snowflake', 'instantly', 'hightouch', 'cursor', 'python', 'slack', 'openai'];

ZP.work = [
  { co: 'zapier', org: 'Zapier', role: 'Sales Development Representative', when: 'Jun 2023 to Aug 2025', yrs: '2023 to 25', where: 'Remote',
    note: 'Booked 14 meetings a month on average. Built the team’s first Clay table for account research, which the whole pod picked up.',
    points: ['Booked 14 meetings a month on average across 60 named accounts.', 'Built the team’s first Clay table for account research. The whole pod of six picked it up.', 'Cut research time per account from 25 minutes to 6.'] },
  { co: 'salesforce', org: 'Salesforce', role: 'Sales Operations Intern', when: 'May 2022 to Aug 2022', yrs: '2022', where: 'Austin, Texas',
    note: 'Cleaned 40,000 lead records ahead of a territory change and wrote the dedupe rules the team kept using.',
    points: ['Cleaned 40,000 lead records ahead of a territory change.', 'Wrote the dedupe rules the operations team kept using after the internship.'] }
];
ZP.school = [
  { co: 'utexas', org: 'The University of Texas at Austin', role: 'BBA, Management Information Systems', when: '2019 to 2023', yrs: '2019 to 23', note: 'GPA 3.6', gpa: '3.6 of 4.0', honours: 'Dean’s List, five semesters', courses: 'Database Management, Business Analytics, Statistics for Business, Data Structures, Marketing Analytics' }
];
ZP.certs = [
  { co: 'hubspot', org: 'HubSpot Academy', role: 'Revenue Operations Certification', when: 'Mar 2026' },
  { co: 'google', org: 'Google', role: 'Google Data Analytics Professional Certificate', when: 'Nov 2024' }
];

ZP.awards = [
  { t: 'Dean’s List', s: 'McCombs School of Business, five semesters' },
  { t: 'Growth team lead, Texas Convergent', s: 'Student product studio, 2021 to 2023' }
];
/* her three biggest strengths: her highest rated skills, each with the project that shows it */
ZP.strengths = [
  { t: 'AI agents in revenue workflows', s: 'Her lead router replies in 1 min 34 s, down from 4 h 12 min.', id: 'router' },
  { t: 'Data enrichment', s: 'Took verified email coverage from 54% to 91% across 8,400 accounts.', id: 'waterfall' },
  { t: 'Evals and guardrails', s: 'Tested her email agent on 50 cases before it sent anything.', id: 'evals' }
];
/* when each level was reached */
ZP.levelLog = ['Mar 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
/* which projects show each skill */
ZP.proof = {
  'AI agents in revenue workflows': ['router', 'notes'], 'Workflow orchestration': ['router', 'model'], 'Prompt and context design': ['evals', 'notes'], 'Evals and guardrails': ['evals'],
  'Data enrichment waterfall': ['waterfall'], 'Lead scoring': ['pql', 'intent'], 'SQL': ['pql', 'intent'], 'CRM data modeling': ['model'], 'Reverse ETL': ['pql'],
  'Intent signals': ['intent'], 'Ideal customer profile': ['waterfall', 'intent'], 'Product led sales': ['pql'], 'Cold email deliverability': ['evals'],
  'Presenting to a team': ['router', 'waterfall', 'evals', 'intent', 'pql', 'notes', 'model'], 'Written updates': ['router', 'evals'], 'Scoping a loose brief': ['model']
};
/* the same skills as two columns, one heading each (a12 and later). ZP.skills above stays as the four groups older pages read */
ZP.skillCols = [
  { g: 'Agents and data', items: [['AI agents in revenue workflows'], ['Workflow orchestration'], ['Prompt and context design'], ['Evals and guardrails'], ['Data enrichment waterfall'], ['Lead scoring'], ['SQL'], ['CRM data modeling'], ['Reverse ETL']] },
  { g: 'GTM and working with people', items: [['Intent signals'], ['Ideal customer profile'], ['Product led sales'], ['Cold email deliverability'], ['Presenting to a team'], ['Written updates'], ['Scoping a loose brief']] }
];
/* the same skills as three columns (a13 and later) */
ZP.skillCols3 = [
  { g: 'Agents and automation', items: [['AI agents in revenue workflows'], ['Workflow orchestration'], ['Prompt and context design'], ['Evals and guardrails']] },
  { g: 'Data', items: [['Data enrichment waterfall'], ['Lead scoring'], ['SQL'], ['CRM data modeling'], ['Reverse ETL']] },
  { g: 'GTM and working with people', items: [['Intent signals'], ['Ideal customer profile'], ['Product led sales'], ['Cold email deliverability'], ['Presenting to a team'], ['Written updates'], ['Scoping a loose brief']] }
];
/* for the profile-card layouts (x-airbnb and later): the third number on the card, and the fact rows */
ZP.profile = {
  third: ['6', 'Months on Zero'],
  facts: [['work', 'My work: GTM AI Engineer'], ['speak', 'Speaks English and Spanish'], ['place', 'Lives in Austin, Texas'], ['clock', 'Available from November 2026'], ['shield', 'Work verified by Zero']],
  confirmed: ['Every project reviewed by a manager', 'Every presentation recorded', 'One rubric for every candidate']
};
