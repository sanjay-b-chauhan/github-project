// All copy and facts. Short, sentence case, no dashes.

export const ZERO_TEAM = 'With Atul Khola, Akshai Shyju, Hamsa Rasheem, Vengada Sabareesan and Vishnu Roy at ZERO.';

export const CASES = {
  whyzero: {
    title: 'Why Zero', year: '2026', kind: 'Website · Three.js',
    line: 'You draw a zero to get in. The loader counts down, because degrees are losing their value.',
    did: ['Ideated, designed and directed it end to end', 'A hand that follows your cursor, and it is you', 'Built in Three.js with Bunq Labs (Sindhur Dutta)'],
    media: { video: 'assets/media/why-zero.mp4', poster: 'assets/work/why-zero-cover.jpg' },
    url: 'https://why.zero.university', credit: ZERO_TEAM,
  },
  zeroapp: {
    title: 'ZERO app', year: '2026', kind: 'Product · learning by doing',
    line: 'Not a dashboard. You learn by doing the actual job, inside a simulated company.',
    did: ['Designed start to finish, live for beta users', 'Scenarios, XP and a portfolio that builds itself', 'An AI coworker that sits beside you, not above you'],
    media: { video: 'assets/media/zero-app.mp4', poster: 'assets/work/zero-cover-island.jpg' },
    url: null, credit: ZERO_TEAM,
  },
  recruiter: {
    title: 'ZERO for recruiters', year: '2026', kind: 'Product motion',
    line: 'The hiring side, where roles find the right people.',
    did: ['Motion that explains the product without words', 'Matching, shortlist and proof in one flow', 'Cut for the launch reel'],
    media: { video: 'assets/media/zero-recruiter.mp4', poster: 'assets/work/zero-cover-island.jpg' },
    url: null, credit: ZERO_TEAM,
  },
  portal: {
    title: 'ZERO Job Portal', year: '2026', kind: 'AI agent · web',
    line: 'An agent that job hunts for you, and asks before every move.',
    did: ['A seven beat story, from matched to hired', 'Approval cards, so nothing happens without a yes', 'A portfolio cut for each company'],
    media: { image: 'assets/work/portal.jpg' },
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html', credit: ZERO_TEAM,
  },
  workspace: {
    title: 'ZERO Workspace', year: '2025', kind: 'AI product',
    line: 'Real job scenarios, with an AI manager beside you.',
    did: ['Brief, team chat and hidden requirements in one room', 'Feedback that lands while the work still moves', 'A manager who reviews like a real one'],
    media: { image: 'assets/work/scenario.jpg' },
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html', credit: ZERO_TEAM,
  },
  onboard: {
    title: 'Voice first onboarding', year: '2026', kind: 'Prototype · AI',
    line: 'Talk, and your profile builds itself.',
    did: ['You speak, the board fills in live', 'It starts with drawing a zero', 'Prototyped in code, not in slides'],
    media: { image: 'assets/work/onboard.jpg' },
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html', credit: ZERO_TEAM,
  },
  curio: {
    title: 'Curio', year: '2026', kind: 'AI films · my own product',
    line: 'Explainer films you can talk back to.',
    did: ['Twenty hand drawn films on one engine', 'The narrator asks, then the check appears', 'Designed, written and built by me'],
    media: { image: 'assets/work/curio.jpg' },
    url: 'https://sanjay-curio.vercel.app/',
  },
  anyo: {
    title: 'anyo', year: '2026', kind: 'iOS app · my own',
    line: 'Close friends, no texting. Video and voice only.',
    did: ['Designed and built the app and its site', 'A penguin that reacts to you', 'Native iOS build, store ready'],
    media: { image: 'assets/work/anyo.jpg' },
    url: 'https://getanyo.vercel.app/',
  },
  tea: {
    title: 'Tea®', year: '2026', kind: 'Brand · concept',
    line: 'A chai brand with one variable: heat. Boiled, not brewed.',
    did: ['Palette, serif and a circled R with attitude', 'One slider runs the whole surface', 'A 35 page brand guide'],
    media: { image: 'assets/work/tea.jpg' },
    url: 'https://sanjay-b-chauhan.github.io/github-project/tea-foam-b2.html',
  },
  scd: {
    title: 'Sanjay Chauhan Designs', year: '2026', kind: 'Identity · my own',
    line: 'My own mark. A sunburst for the sun I grew up under, and a wordmark that means business.',
    did: ['Wordmark, monogram and sunburst', 'Three colourways, one system', 'This site wears it'],
    media: { image: 'assets/work/scd-board.png', contain: true },
    url: null,
  },
  stack: {
    title: 'Stack FX', year: '2026', kind: 'Motion tool · code',
    line: 'A card dealer for motion studies. Drag the tempo and the pile re-choreographs itself.',
    did: ['Spring physics tuned by hand', 'Six arrangements, one engine', 'Built as a real tool, not a mockup'],
    media: { image: 'assets/work/stack.jpg' },
    url: 'https://sanjay-trace-fx.vercel.app/stack',
  },
};
export const WORK = ['whyzero', 'zeroapp', 'recruiter', 'portal', 'workspace', 'onboard', 'curio', 'anyo', 'tea', 'scd', 'stack'];

// Six sections, top to ground. `stop` is the scroll stop the section starts on.
export const SECTIONS = [
  { id: 'hello', name: 'Hello', stop: 0 },
  { id: 'do', name: 'What I do', stop: 1 },
  { id: 'work', name: 'Work', stop: 2 },
  { id: 'journey', name: 'Journey', stop: 3 },
  { id: 'roots', name: 'Roots', stop: 6 },
  { id: 'contact', name: "Let's build", stop: 7 },
];
// scroll stop -> set index
export const STOP_SET = [0, 1, 2, 3, 3, 3, 4, 5];
export const SET_FIRST = [0, 1, 2, 3, 6, 7];

export const SKILLS = [
  { verb: 'I shoot.', cap: 'Photo and film', tool: 'camera' },
  { verb: 'I brand.', cap: 'Identity and type', tool: 'stamp' },
  { verb: 'I build.', cap: 'Websites and apps', tool: 'handplane' },
  { verb: 'I animate.', cap: 'Motion and 3D', tool: 'sunburst' },
  { verb: 'I code.', cap: 'Web dev', tool: 'anvil' },
  { verb: 'I think.', cap: 'AI and strategy', tool: 'armillary' },
];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO', '2025 to now'],
  ['Head of Design', 'Intent (formerly DesignAR)', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
];

export const GREETINGS = [['khamma ghani', 'Marwadi'], ['नमस्ते', 'Hindi'], ['नमस्कार', 'Marathi'], ['hello', 'English']];
