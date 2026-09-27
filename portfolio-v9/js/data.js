// Content bank for Sanjay Chauhan Designs (v9). Facts only, short copy, no dashes.
export const EMAIL = 'chauhansanjayofficial@gmail.com';
export const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('New project')}`;
export const LINKEDIN = 'https://linkedin.com/in/sanjaybchauhan';
export const INSTAGRAM = 'https://instagram.com/sanjay.b.chauhan';

// accent = the light a project casts into the screening room (kept subtle in the scene)
export const PROJECTS = [
  {
    id: 'portal', title: 'ZERO Job Portal', short: 'ZERO Job Portal', year: '2026', cat: 'Hiring', kicker: '2026',
    tags: ['AI agent', 'Web app'],
    line: 'An agent that job-hunts for you, and asks before every move.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html',
    img: 'assets/work/portal.jpg', accent: '#8fb8a2',
  },
  {
    id: 'scenario', title: 'ZERO Workspace', short: 'ZERO Workspace', year: '2025', cat: 'Hiring', kicker: '2025',
    tags: ['AI manager', 'Simulation'],
    line: 'Real job scenarios, with an AI manager beside you.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html',
    img: 'assets/work/scenario.jpg', accent: '#8a95ab',
  },
  {
    id: 'curio', title: 'Curio', short: 'Curio', year: '2026', cat: 'Learning', kicker: '2026, twenty hand-drawn films on one engine',
    tags: ['Film engine', 'Web app'],
    line: 'Explainer films you can talk back to.',
    url: 'https://sanjay-curio.vercel.app/',
    img: 'assets/work/curio.jpg', mob: 'assets/work/curio-m.jpg', accent: '#7cc8ae',
  },
  {
    id: 'anyo', title: 'anyo', short: 'anyo', year: '2026', cat: 'Social', kicker: '2026, iOS app',
    tags: ['iOS app', 'Video and voice'],
    line: 'Close friends, no texting. Video and voice only.',
    url: 'https://getanyo.vercel.app/',
    img: 'assets/work/anyo.jpg', mob: 'assets/work/anyo-m.jpg', accent: '#7fa3dc',
  },
  {
    id: 'stack', title: 'Stack FX', short: 'Stack FX', year: 'Tool', cat: 'Motion', kicker: 'Tool',
    tags: ['Motion tool', 'Web'],
    line: 'A card dealer for motion studies.',
    url: 'https://sanjay-trace-fx.vercel.app/stack',
    img: 'assets/work/stack.jpg', accent: '#e0775c',
  },
  {
    id: 'signal', title: 'Signal', short: 'Signal', year: 'Site', cat: 'WebGL', kicker: 'WebGL site',
    tags: ['WebGL', 'Live shaders'],
    line: 'A portfolio built on live shaders.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/portfolio-v4/',
    img: 'assets/work/signal.jpg', accent: '#e05a48',
  },
  {
    id: 'onboard', title: 'Voice-first onboarding', short: 'Onboarding', year: 'Prototype', cat: 'Hiring', kicker: 'Prototype',
    tags: ['Voice', 'Prototype'],
    line: 'Talk, and the profile builds itself.',
    url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html',
    img: 'assets/work/onboard.jpg', accent: '#d8d2c2',
  },
];

export const CLIENTS = ['ZERO', 'Manish Malhotra', 'LimeRoad', 'MG Motors', 'Peppermint Robotics'];

export const BEFORE = [
  ['Manish Malhotra', 'Luxury fashion'],
  ['LimeRoad', 'Marketplace'],
  ['MG Motors', 'Automotive'],
  ['Peppermint Robotics', 'Industrial'],
  ['Intent', 'Head of Design, 2021 to 2025'],
];

export const SERVICES = ['Product strategy', 'AI interaction design', 'Design systems', 'Prototypes in code'];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO', '2025 to now'],
  ['Head of Design', 'Intent, formerly DesignAR', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
];

// Chapter II: what I do (script heading + one line)
export const STEPS = [
  ['Product strategy', 'Start with the job the product has to do, then cut everything else.'],
  ['AI interaction', 'Agents that show their work and ask before every move.'],
  ['Design systems', 'Tokens and parts that engineers can ship without guessing.'],
  ['Launch & ship', 'Prototypes in real code, so nothing gets lost in handoff.'],
];

// Scroll stops (fraction of the film's scroll). One flick moves one stop.
//          I name  I clients  II a   II b   II c   II d   III    IV     V      V sun  VI
export const STOPS = [0, 0.07, 0.19, 0.25, 0.31, 0.37, 0.5, 0.64, 0.78, 0.88, 1];
export const STOP_CHAPTER = [0, 0, 1, 1, 1, 1, 2, 3, 4, 4, 5];
export const CHAPTERS = ['Night', 'What I do', 'Work', 'About', 'Dawn', 'Day'];
export const CHAPTER_STOP = [0, 2, 6, 7, 8, 10];

// set order and the scroll windows where one set dissolves into the next
export const WINDOWS = [[0.125, 0.165], [0.415, 0.455], [0.555, 0.595], [0.695, 0.735]];
// dawn to day: the sun rises into the ring, then its light floods the screen cream
export const RISE = [0.78, 0.88];
export const FLOOD = [0.905, 0.975];
