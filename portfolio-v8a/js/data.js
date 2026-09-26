// Content bank for Sanjay Chauhan Designs (v8A). Facts only, short copy, no dashes.
export const EMAIL = 'chauhansanjayofficial@gmail.com';
export const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('New project')}`;
export const LINKEDIN = 'https://linkedin.com/in/sanjaybchauhan';
export const INSTAGRAM = 'https://instagram.com/sanjay.b.chauhan';

// accent = the light the project casts into the screening room
export const PROJECTS = [
  {
    id: 'portal', title: 'ZERO Job Portal', year: '2026', cat: 'Hiring',
    tags: ['AI agent', 'Web app'],
    line: 'An agent that job-hunts for you, and asks before every move.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html',
    img: 'assets/work/portal.jpg', accent: '#86b39c', screen: true,
  },
  {
    id: 'scenario', title: 'ZERO Workspace', year: '2025', cat: 'Hiring',
    tags: ['AI manager', 'Simulation'],
    line: 'Real job scenarios, with an AI manager beside you.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html',
    img: 'assets/work/scenario.jpg', accent: '#7486a6', screen: true,
  },
  {
    id: 'curio', title: 'Curio', year: '2026', cat: 'Learning',
    tags: ['Film engine', 'Web app'],
    line: 'Explainer films you can talk back to.',
    url: 'https://sanjay-curio.vercel.app/',
    img: 'assets/work/curio.jpg', accent: '#43d1a6', screen: true,
  },
  {
    id: 'anyo', title: 'anyo', year: '2026', cat: 'Social',
    tags: ['iOS app', 'Video and voice'],
    line: 'Close friends, no texting. Video and voice only.',
    url: 'https://getanyo.vercel.app/',
    img: 'assets/work/anyo.jpg', accent: '#3f86f7', screen: true,
  },
  {
    id: 'stack', title: 'Stack FX', year: 'Tool', cat: 'Motion',
    tags: ['Motion tool', 'Web'],
    line: 'A card dealer for motion studies.',
    url: 'https://sanjay-trace-fx.vercel.app/stack',
    img: 'assets/work/stack.jpg', accent: '#ff4a22', screen: true,
  },
  {
    id: 'signal', title: 'Signal', year: 'Site', cat: 'WebGL',
    tags: ['WebGL', 'Live shaders'],
    line: 'A portfolio built on live shaders.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/portfolio-v4/',
    img: 'assets/work/signal.jpg', accent: '#ff2410', screen: true,
  },
  {
    id: 'onboard', title: 'Voice-first onboarding', year: 'Prototype', cat: 'Hiring',
    tags: ['Voice', 'Prototype'],
    line: 'Talk, and the profile builds itself.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html',
    img: 'assets/work/onboard.jpg', accent: '#d9d4c7', screen: false,
  },
];

export const SCREEN_PROJECTS = PROJECTS.filter((p) => p.screen);

export const CLIENTS = ['ZERO', 'Manish Malhotra', 'LimeRoad', 'MG Motors', 'Peppermint Robotics'];

export const SERVICES = [
  ['Product strategy', 'What to build, and what to leave out.'],
  ['AI interaction design', 'Agents and assistants people can trust.'],
  ['Design systems', 'Tokens and components that hold up in code.'],
  ['Prototypes in code', 'Real builds, so decisions get made on the thing itself.'],
];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO', '2025 to now'],
  ['Head of Design', 'Intent, formerly DesignAR', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
];

// scroll stops (fraction of total scroll), matching the reference's pacing
export const STOPS = [0, 0.134, 0.465, 0.746, 1];
export const STOP_NAMES = ['Intro', 'Clients', 'Work', 'About', 'Contact'];
