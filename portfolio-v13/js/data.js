// Content bank, v13. First person, specific, a little cheeky; every block ends on a line with a spine.
// Sentence case, no dashes, no invented numbers.
export const EMAIL = 'chauhansanjayofficial@gmail.com';
export const ZERO_TEAM = 'Made with Atul Khola, Akshai Shyju, Hamsa Rasheem, Vengada Sabareesan and Vishnu Roy at ZERO.';

// story = what it is and what I did; close = the line that stays with you
export const PROJECTS = [
  {
    id: 'whyzero', title: 'Why Zero', year: '2026', kicker: '2026, website', tags: ['ZERO', 'Website, Three.js'],
    story: 'You draw a zero to get in. The loader counts down, because degrees are losing their value. I ideated, designed and directed it, and we built it in Three.js with Bunq Labs.',
    close: 'A website that argues with you. Politely.',
    url: 'https://why.zero.university', img: 'assets/work/why-zero-cover.jpg', video: 'assets/media/why-zero.mp4', credit: ZERO_TEAM,
  },
  {
    id: 'zeroapp', title: 'ZERO app', year: '2026', kicker: '2026, product', tags: ['ZERO', 'Product'],
    story: 'Not a dashboard. You learn by doing the actual job inside a simulated company, with an AI coworker beside you, not above you. Designed start to finish, now live for beta users.',
    close: 'Most of my year lives in here.',
    url: null, img: 'assets/work/zero-cover-island.jpg', video: 'assets/media/zero-app.mp4', credit: ZERO_TEAM,
  },
  {
    id: 'portal', title: 'ZERO Job Portal', year: '2026', kicker: '2026, AI agent', tags: ['ZERO', 'AI agent'],
    story: 'An agent that job hunts for you and asks before every move. Seven beats from matched to hired, with approval cards so nothing happens without your yes.',
    close: 'Trust is the feature.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html', img: 'assets/work/portal.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'workspace', title: 'ZERO Workspace', year: '2025', kicker: '2025, simulation', tags: ['ZERO', 'Simulation'],
    story: 'Real job scenarios with an AI manager who reviews like a real one. The brief, the team chat and the requirements nobody mentions, all in one room.',
    close: 'It feels like work because it is.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html', img: 'assets/work/scenario.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'recruiter', title: 'ZERO for recruiters', year: '2026', kicker: '2026, product film', tags: ['ZERO', 'Motion'],
    story: 'The hiring side, where roles find the right people. Matching, shortlist and proof in one flow, cut into motion for the launch.',
    close: 'It explains itself without a voiceover.',
    url: null, img: 'assets/work/zero-cover-island.jpg', video: 'assets/media/zero-recruiter.mp4', credit: ZERO_TEAM,
  },
  {
    id: 'onboard', title: 'Voice first onboarding', year: '2026', kicker: '2026, prototype', tags: ['ZERO', 'Prototype in code'],
    story: 'You talk and your profile builds itself. It starts with drawing a zero, then the board fills in live while you speak.',
    close: 'Forms were never the point.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html', img: 'assets/work/onboard.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'curio', title: 'Curio', year: '2026', kicker: '2026, my own product', tags: ['Mine', 'AI films'],
    story: 'Explainer films you can talk back to. Twenty hand drawn films running on one engine. I designed it, wrote it and built it.',
    close: 'My own product, so nobody else to blame.',
    url: 'https://sanjay-curio.vercel.app/', img: 'assets/work/curio.jpg', mob: 'assets/work/curio-m.jpg',
  },
  {
    id: 'anyo', title: 'anyo', year: '2026', kicker: '2026, iOS app', tags: ['Mine', 'iOS app'],
    story: 'Close friends, no texting. Video and voice only. I designed and built the iOS app and the site that sells it.',
    close: 'It has a penguin. That is most of the pitch.',
    url: 'https://getanyo.vercel.app/', img: 'assets/work/anyo.jpg', mob: 'assets/work/anyo-m.jpg',
  },
  {
    id: 'tea', title: 'Tea®', year: '2026', kicker: '2026, brand', tags: ['Brand', 'Identity'],
    story: 'A chai brand with one variable: heat. A palette, a serif and a circled R with attitude, held together by a thirty five page guide.',
    close: 'Boiled, not brewed.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/tea-foam-b2.html', img: 'assets/work/tea.jpg',
  },
  {
    id: 'stack', title: 'Stack FX', year: '2026', kicker: '2026, motion tool', tags: ['Mine', 'Motion tool'],
    story: 'A card dealer for motion studies. Drag the tempo and the pile re-choreographs itself, with spring physics tuned by hand.',
    close: 'Built because I needed it. Kept because it is fun.',
    url: 'https://sanjay-trace-fx.vercel.app/stack', img: 'assets/work/stack.jpg',
  },
];

// Top to ground.
export const SECTIONS = [
  { id: 'hello', name: 'Hello', stop: 0 },
  { id: 'do', name: 'The trade', stop: 1 },
  { id: 'work', name: 'Work', stop: 6 },
  { id: 'journey', name: 'The road', stop: 7 },
  { id: 'roots', name: 'Roots', stop: 10 },
  { id: 'contact', name: "Let's build", stop: 11 },
];
export const STOP_SET = [0, 1, 1, 1, 1, 1, 2, 3, 3, 3, 4, 5];
export const SET_FIRST = [0, 1, 6, 7, 10, 11];
export const SET_LAST = [0, 5, 6, 9, 10, 11];

// The trade: five beliefs, one per turn of the sunburst
export const SKILLS = [
  { h: 'One person, many trades.', p: 'I shoot, brand, design, animate, model in 3D and write the code. Specialists find it suspicious. Deadlines find it useful.' },
  { h: 'The job comes first.', p: 'Before a single pixel, I ask what has to be true for someone to come back tomorrow. Then I design for that and cut the rest.' },
  { h: 'Design that survives engineering.', p: 'I prototype in real code, so nothing dies in handoff. If it cannot ship, it is not finished.' },
  { h: 'It has to move.', p: 'Motion, 3D and film are how a product feels. Flat is a choice. I rarely make it.' },
  { h: 'AI with manners.', p: 'Agents that show their work and ask before every move. I design the part where you say yes.' },
];

export const PLACES = [
  { name: 'Dubai', cap: 'Taller than anything back home.' },
  { name: 'Mumbai', cap: 'The city that taught me speed.' },
  { name: 'Valdara', cap: 'The desert, where it started.' },
];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO', '2025 to now'],
  ['Head of Design', 'Intent, formerly DesignAR', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
];

export const GREETINGS = [['khamma ghani', 'en'], ['नमस्ते', 'hi'], ['नमस्कार', 'mr'], ['hello', 'en']];
