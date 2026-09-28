// Content bank, v12. Facts only, short copy, sentence case, no dashes.
export const EMAIL = 'chauhansanjayofficial@gmail.com';
export const ZERO_TEAM = 'With Atul Khola, Akshai Shyju, Hamsa Rasheem, Vengada Sabareesan and Vishnu Roy at ZERO.';

// Work. img = the still (poster for videos), mob = the phone still when there is one.
export const PROJECTS = [
  {
    id: 'whyzero', title: 'Why Zero', year: '2026', kicker: '2026, website in Three.js', tags: ['Website', 'Three.js'],
    line: 'You draw a zero to get in. The loader counts down, because degrees are losing their value.',
    url: 'https://why.zero.university', img: 'assets/work/why-zero-cover.jpg', video: 'assets/media/why-zero.mp4', credit: ZERO_TEAM + ' Built with Bunq Labs.',
  },
  {
    id: 'zeroapp', title: 'ZERO app', year: '2026', kicker: '2026, live for beta users', tags: ['Product', 'Learning by doing'],
    line: 'Not a dashboard. You learn by doing the actual job, inside a simulated company.',
    url: null, img: 'assets/work/zero-cover-island.jpg', video: 'assets/media/zero-app.mp4', credit: ZERO_TEAM,
  },
  {
    id: 'portal', title: 'ZERO Job Portal', year: '2026', kicker: '2026, AI agent', tags: ['AI agent', 'Web app'],
    line: 'An agent that job hunts for you, and asks before every move.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html', img: 'assets/work/portal.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'workspace', title: 'ZERO Workspace', year: '2025', kicker: '2025, AI manager', tags: ['AI manager', 'Simulation'],
    line: 'Real job scenarios, with an AI manager beside you.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html', img: 'assets/work/scenario.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'recruiter', title: 'ZERO for recruiters', year: '2026', kicker: '2026, product motion', tags: ['Motion', 'Launch reel'],
    line: 'The hiring side, where roles find the right people.',
    url: null, img: 'assets/work/zero-cover-island.jpg', video: 'assets/media/zero-recruiter.mp4', credit: ZERO_TEAM,
  },
  {
    id: 'onboard', title: 'Voice first onboarding', year: '2026', kicker: '2026, prototype in code', tags: ['Voice', 'Prototype'],
    line: 'Talk, and your profile builds itself.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html', img: 'assets/work/onboard.jpg', credit: ZERO_TEAM,
  },
  {
    id: 'curio', title: 'Curio', year: '2026', kicker: '2026, twenty hand drawn films on one engine', tags: ['Film engine', 'My own product'],
    line: 'Explainer films you can talk back to.',
    url: 'https://sanjay-curio.vercel.app/', img: 'assets/work/curio.jpg', mob: 'assets/work/curio-m.jpg',
  },
  {
    id: 'anyo', title: 'anyo', year: '2026', kicker: '2026, iOS app', tags: ['iOS app', 'Video and voice'],
    line: 'Close friends, no texting. Video and voice only.',
    url: 'https://getanyo.vercel.app/', img: 'assets/work/anyo.jpg', mob: 'assets/work/anyo-m.jpg',
  },
  {
    id: 'tea', title: 'Tea®', year: '2026', kicker: '2026, brand concept', tags: ['Brand', 'Identity'],
    line: 'A chai brand with one variable: heat. Boiled, not brewed.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/tea-foam-b2.html', img: 'assets/work/tea.jpg',
  },
  {
    id: 'stack', title: 'Stack FX', year: '2026', kicker: '2026, motion tool', tags: ['Motion tool', 'Code'],
    line: 'A card dealer for motion studies. Drag the tempo and the pile re-choreographs itself.',
    url: 'https://sanjay-trace-fx.vercel.app/stack', img: 'assets/work/stack.jpg',
  },
];

// Top to ground. Stops are scroll positions; a section can own several.
export const SECTIONS = [
  { id: 'hello', name: 'Hello', stop: 0 },
  { id: 'do', name: 'What I do', stop: 1 },
  { id: 'work', name: 'Work', stop: 6 },
  { id: 'journey', name: 'Journey', stop: 7 },
  { id: 'roots', name: 'Roots', stop: 10 },
  { id: 'contact', name: "Let's build", stop: 11 },
];
export const STOP_SET = [0, 1, 1, 1, 1, 1, 2, 3, 3, 3, 4, 5];
export const SET_FIRST = [0, 1, 6, 7, 10, 11];
export const SET_LAST = [0, 5, 6, 9, 10, 11];

export const SKILLS = [
  { h: 'I shoot.', p: 'Photo and film. I light it, frame it and cut it myself.' },
  { h: 'I brand.', p: 'Identity, type and systems that hold up at every size.' },
  { h: 'I build.', p: 'Websites and apps in real code, so nothing gets lost in handoff.' },
  { h: 'I move.', p: 'Motion and 3D. If it can move with meaning, it should.' },
  { h: 'I think.', p: 'AI and strategy. Thinker and doer, in that order.' },
];

export const PLACES = [
  { name: 'Dubai', cap: 'The skyline.' },
  { name: 'Mumbai', cap: 'The city.' },
  { name: 'Valdara', cap: 'The desert, where it started.' },
];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO', '2025 to now'],
  ['Head of Design', 'Intent, formerly DesignAR', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
];

export const GREETINGS = [['khamma ghani', 'en'], ['नमस्ते', 'hi'], ['नमस्कार', 'mr'], ['hello', 'en']];
