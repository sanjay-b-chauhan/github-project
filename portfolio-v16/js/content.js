// Content for v14. Facts come from chauhansanjay.com, the resume on Notion and Sanjay's own notes.
// First person, specific, sentence case, no dashes.

export const FLOORS = [
  { id: 'hello', n: '10', name: 'Hello' },
  { id: 'work', n: '09', name: 'Work', label: 'mere kaam' },
  { id: 'snaps', n: '08', name: 'Snapshots', label: 'snapshots' },
  { id: 'wins', n: '07', name: 'Clients', label: 'mere clients' },
  { id: 'studio', n: '06', name: 'Studio', label: 'mera studio' },
  { id: 'about', n: '05', name: 'About', label: 'mein kaun' },
  { id: 'clicks', n: '04', name: 'Clicks', label: 'meri clicks' },
  { id: 'break', n: '03', name: 'Off screen', label: 'mera break' },
  { id: 'thoughts', n: '02', name: 'Thoughts', label: 'mere vichar' },
  { id: 'contact', n: 'G', name: 'Contact', label: 'baat karein' },
];

const ZERO_TEAM = 'Made with Atul Khola, Akshai Shyju, Hamsa Rasheem, Vengada Sabareesan and Vishnu Roy at ZERO.';

export const PROJECTS = [
  {
    id: 'zero', title: 'ZERO', sub: 'Learn by doing the actual job. Get hired on proof of work.',
    client: 'ZERO', role: 'Senior Product Designer, lead designer on Why Zero', year: '2025 to now', industry: 'AI and education',
    services: ['Product design', 'AI native prototyping', 'Brand and motion', 'Design engineering'],
    video: 'assets/media/case-zero.mp4', poster: 'assets/media/case-zero.jpg', cover: 'assets/work/zero.jpg', url: 'https://zero.university/',
    body: [
      ['The problem', 'Four years of college, often in debt, and still no job. ZERO exists to break that. An AI native learning and talent platform: learn, build and get hired in one app, across eight career tracks.'],
      ['What I design', 'The core product: simulation driven learning, where people complete real world scenarios with the actual tools of the job. Build an AI rewrite prototype for Gmail. Find out why ChatGPT users are not upgrading. Forecast demand for a Nike launch. Every scenario ends in proof of work instead of a certificate.'],
      ['How we work', 'Design and build are one job here. We prototype in code and ship production pull requests alongside engineers. When the beta needed a waitlist, we turned a sign up form into a generative toy. It grew past 10,000 people worldwide.'],
      ['Why Zero', 'I was the lead designer on Why Zero, the story site that explains why ZERO needs to exist, built with Sindhur Dutta of Bunq Labs and Atul Khola. The founders shelved it once. We built it anyway, after hours. The site went on to earn Awwwards Site of the Day, the Awwwards Developer Award, FWA of the Month, CSS Design Awards Website of the Day and a Codrops feature on its engineering.'],
      ['What it taught me', 'A small team that designs in code can ship things a large team would still be scoping.'],
    ],
    credit: ZERO_TEAM,
  },
  {
    id: 'manish-malhotra', title: 'Manish Malhotra', sub: 'One couture house, two worlds, one site.',
    client: 'Manish Malhotra, while at Intent', role: 'Lead UI/UX Designer', year: '2022', industry: 'Luxury fashion and e-commerce',
    services: ['UI/UX design', 'Customisation experience', 'UX research'],
    video: 'assets/media/case-manish-malhotra.mp4', poster: 'assets/media/case-manish-malhotra.jpg', cover: 'assets/work/manish-malhotra.jpg', url: 'https://manishmalhotra.in/',
    body: [
      ['The brief', 'One of India’s most iconic couture houses needed a website that held its luxury status while reaching a younger, fashion forward audience that shops very differently.'],
      ['What I did', 'I led the UX transformation around one idea: one brand, two distinct worlds. Couture, built on exclusivity and grandeur. Diffuse, a modern and edgier experience for Gen Z.'],
      ['The experience', 'Interactive runway shopping, so you can shop straight from the show. Multi country pricing for an international clientele. Celebrity inspired styling, because that is how people actually find fashion.'],
      ['The result', 'A site that feels like couture and shops like modern e-commerce.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'limeroad', title: 'LimeRoad', sub: 'Thirty percent more logins. Three times the engagement.',
    client: 'LimeRoad, while at Intent', role: 'Senior UI/UX Designer, UX consultant', year: '2023 to 2024', industry: 'E-commerce and fashion retail',
    services: ['E-commerce UI/UX', 'UX optimisation', 'Product strategy', 'Design system'],
    video: 'assets/media/case-limeroad.mp4', poster: 'assets/media/case-limeroad.jpg', cover: 'assets/work/limeroad.jpg', url: null,
    body: [
      ['The brief', 'A fashion platform losing people at every stage: low engagement, drop offs on product pages, abandoned carts and a design language that had drifted.'],
      ['How it started', 'We opened with a motion pitch that showed what the product could feel like. It won the room and turned into a long partnership, with our team working as LimeRoad’s in-house UI/UX team.'],
      ['What I did', 'A new design system, a redesigned checkout, a rethought login strategy and product pages people explored instead of bounced off. Motion was part of the product language, not decoration.'],
      ['The result', '30% more logins, 3x product page engagement, 12% less cart abandonment and 20% longer sessions. Every change was measured.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'unthread', title: 'Unthread', sub: 'The project that made me a product designer.',
    client: 'Unthread, while at Intent', role: 'Solo Product Designer, Product Manager', year: '2022 to 2024', industry: 'SaaS and e-commerce',
    services: ['Branding and identity', 'SaaS dashboard UI/UX', 'Pitch deck', 'Agile product management'],
    video: 'assets/media/case-unthread.mp4', poster: 'assets/media/case-unthread.jpg', cover: 'assets/work/unthread.jpg', url: 'https://www.kisna.com/',
    body: [
      ['The product', 'A SaaS platform for brands that outgrow off the shelf tools: multi country pricing, real time inventory, omnichannel retail and bulk editing in one place.'],
      ['My role', 'Solo product designer, and I ran product management too. UX research, feature analysis, dashboard architecture, and delivery with engineering through Agile Scrum.'],
      ['The pivot', 'When the business chose jewellery brands, the product followed: dynamic pricing tied to live gold rates, automated discount schemes, store specific inventory.'],
      ['The result', 'Kisna Jewellery runs on Unthread. This is the project that made me a product designer, not just a UI designer.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'mg', title: 'MG Motors', sub: 'It started as banners. It became the homepage.',
    client: 'MG Motors, while at Intent', role: 'Lead UX and Interactive Designer', year: '2023 to 2024', industry: 'Automotive',
    services: ['UI/UX design', 'Interactive UX', 'Design system', '3D concept film'],
    video: null, poster: 'assets/work/mg-hero.jpg', cover: 'assets/work/mg-hero.jpg', url: null,
    body: [
      ['The brief', 'MG came to us for banner design. It grew into a full homepage revamp to fix the storytelling and the usability.'],
      ['What I did', 'Cleaned up navigation, layouts and dated visuals. Interactive car showcases, dynamic banners and a clearer journey, on a new UI system aligned with MG’s international identity.'],
      ['Beyond the site', 'A 3D concept film that pushed the digital experience toward something more immersive.'],
      ['The result', 'Premium visuals and a journey people could actually follow, on a system the brand could keep building on.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'okno', title: 'Okno Modhomes', sub: 'Designed it. Then built it myself.',
    client: 'Okno Modhomes, while at Intent', role: 'Lead UI/UX Designer, Webflow Developer', year: '2023', industry: 'Real estate and modular housing',
    services: ['Website UI/UX', 'Home customisation', 'Webflow development'],
    video: null, poster: 'assets/work/okno-hero.jpg', cover: 'assets/work/okno-hero.jpg', url: 'https://www.oknomodhomes.com/',
    body: [
      ['The brief', 'Buying a modular home is a big, unfamiliar decision. The site had to make customising one feel simple, visual and trustworthy.'],
      ['What I did', 'Led the design and built it myself in Webflow, from interaction design to testing, so nothing in the design was lost in the build.'],
      ['The result', 'A fast, responsive site that makes owning a modular home feel approachable.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'dohtakkeh', title: 'Dohtakkeh', sub: 'Where Instagram became Instaग्राम.',
    client: 'Dohtakkeh, while at Intent', role: 'UI/UX Designer', year: '2023', industry: 'Fashion and lifestyle',
    services: ['UI/UX design', 'Website revamp'],
    video: 'assets/media/case-dohtakkeh.mp4', poster: 'assets/media/case-dohtakkeh.jpg', cover: 'assets/work/dohtakkeh.jpg', url: null,
    body: [
      ['The brief', 'Less a fashion label, more a statement club: raw, eclectic, unapologetic. The old site was none of those things.'],
      ['What we did', 'Research and personas first, then a street style interface in pop colours, with sticker graphics, ticket stubs, grunge textures and mixed language details.'],
      ['The result', 'A website that feels like joining the club.'],
    ],
    credit: 'Worked with Saniya Shaikh, co-founder of Intent.',
  },
  {
    id: 'curio', title: 'Curio', sub: 'Explainer films you can talk back to. Mine.',
    client: 'My own product', role: 'Designer, writer, builder', year: '2026', industry: 'AI and learning',
    services: ['Product', 'AI films', 'Engineering'],
    video: null, poster: 'assets/work/curio.jpg', cover: 'assets/work/curio.jpg', url: 'https://sanjay-curio.vercel.app/',
    body: [
      ['What it is', 'Twenty hand drawn explainer films running on one engine. The narrator asks you a question before the check appears, then reacts to your answer.'],
      ['What I did', 'Designed it, wrote it and built it. My own product, so nobody else to blame.'],
    ],
    credit: '',
  },
  {
    id: 'anyo', title: 'anyo', sub: 'Close friends, no texting. Video and voice only.',
    client: 'My own product', role: 'Designer and builder', year: '2026', industry: 'Social, iOS',
    services: ['iOS app', 'Brand', 'Website'],
    video: null, poster: 'assets/work/anyo.jpg', cover: 'assets/work/anyo.jpg', url: 'https://getanyo.vercel.app/',
    body: [
      ['What it is', 'An app for your closest circle where you only send video and voice. No typing, no performing.'],
      ['What I did', 'Designed and built the iOS app and the site that sells it. It has a penguin. That is most of the pitch.'],
    ],
    credit: '',
  },
];

export const SNAPS = [
  ['assets/work/sunburst-chrome.jpg', 'Sunburst, 3D'], ['assets/work/manish-malhotra.jpg', 'Manish Malhotra'], ['assets/work/scd-key.jpg', 'SCD key, Blender'],
  ['assets/work/limeroad.jpg', 'LimeRoad'], ['assets/work/threads.jpg', 'Threads, Blender'], ['assets/work/curio.jpg', 'Curio'],
  ['assets/work/nike-bottle.jpg', 'Nike bottle, Blender'], ['assets/work/unthread.jpg', 'Unthread'], ['assets/work/gopro.jpg', 'GoPro, Blender'],
  ['assets/work/zero.jpg', 'Why Zero'], ['assets/work/lettering.jpg', 'Lettering'], ['assets/work/okno.jpg', 'Okno Modhomes'],
  ['assets/work/gameboy.jpg', 'Game boy, 3D'], ['assets/work/dohtakkeh.jpg', 'Dohtakkeh'], ['assets/work/ocean.jpg', 'Ocean, experiment'],
  ['assets/work/anyo.jpg', 'anyo'], ['assets/work/d7.jpg', 'Arrays, Spline'], ['assets/work/mg.jpg', 'MG Motors'],
  ['assets/vbo/carvesx-1.jpg', 'CarvesX'], ['assets/work/stack.jpg', 'Stack FX'], ['assets/work/portal.jpg', 'ZERO Job Portal'],
  ['assets/work/tea.jpg', 'Tea®'], ['assets/work/scenario.jpg', 'ZERO Workspace'], ['assets/vbo/carvesx-2.jpg', 'CarvesX'],
];

export const CLIENTS = ['Manish Malhotra', 'Disha Patani', 'Superdry', 'MG Motors', 'LimeRoad', 'RBL Bank', 'Hamleys', 'Warner Music', 'Peppermint Robotics', 'Kisna', 'Okno Modhomes', 'Dohtakkeh', 'ZERO', 'CarvesX'];

export const WINS = [
  ['Why Zero', 'Awwwards Site of the Day and the Developer Award'],
  ['Why Zero', 'FWA of the Month'],
  ['Why Zero', 'CSS Design Awards Website of the Day, plus UI, UX and Innovation'],
  ['Why Zero', 'Orpetron Site of the Month and a Codrops feature'],
  ['LimeRoad', '30% more logins, 3x product page engagement, 12% less cart abandonment'],
  ['Workshops', 'Trained 300+ students in Photoshop, UI/UX and motion'],
  ['DJ Sanghvi', 'Electronics and telecom engineering, CGPA 9.84'],
];

export const PHOTOS = [
  ['assets/photos/sunset-rocks.jpg', 'Sunset, on the rocks'], ['assets/photos/hill.jpg', 'Golden hour'], ['assets/photos/mumbai.jpg', 'Mumbai, from above'],
  ['assets/photos/dubai-burj.jpg', 'Dubai, chapter two'], ['assets/photos/chai.jpg', 'Kulhad chai on the highway'], ['assets/photos/football.jpg', 'Sunday football'],
  ['assets/photos/car.jpg', 'Road trip'], ['assets/photos/mirror-orange.jpg', 'Orange, always'], ['assets/people/cat.jpg', 'The boss of the house'],
];

export const PEOPLE = [
  ['assets/people/zero-fam.jpg', 'ZERO fam'], ['assets/people/friends-sofa.jpg', 'Friends'], ['assets/people/designar-team.jpg', 'The DesignAR team'],
  ['assets/people/zero-night.jpg', 'Launch night'], ['assets/people/friends-selfie.jpg', 'Chai break'],
];

export const THOUGHTS = [
  ['Design is not decoration.', 'It should change what people can do, understand, feel or build.'],
  ['Designers should build.', 'When a designer can prototype the thing, the whole conversation changes.'],
  ['The prototype is the argument.', 'Instead of explaining an idea for thirty minutes, build something that makes it obvious.'],
  ['Two hands and the rest.', 'Vishnu has four arms. Two hands do the design. The others do what you cannot imagine. That is how I think about AI.'],
  ['Nice or radical.', 'You either become very nice or very radical. Radical is how people recognise you.'],
  ['Figure out how to figure out things.', 'Nobody hands you the manual. Learning how to learn is the actual job.'],
];

export const GREETINGS = [['khamma ghani', 'en'], ['नमस्ते', 'hi'], ['नमस्कार', 'mr'], ['hello', 'en']];

export const LINKS = {
  email: 'chauhansanjayofficial@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sanjaybchauhan/',
  instagram: 'https://www.instagram.com/sanjay.b.chauhan/',
  x: 'https://x.com/whossanjay',
  studio: 'https://www.instagram.com/visionbeyondordinary/',
  resume: 'https://drive.google.com/file/d/1JooppIjRPT1m5FwYPhm47mVbiCyjJb4Y/view?usp=sharing',
};

// ---------------------------------------------------------------- v15: the journey
// the light each project throws into the screening room
export const ACCENTS = { zero: '#7ee0a1', 'manish-malhotra': '#e0a45a', limeroad: '#b9e34f', unthread: '#7b93ff', mg: '#ff4a36', okno: '#e7b98c', dohtakkeh: '#ff5fa8', curio: '#43d1a6', anyo: '#4a90fa' };

export const HALL = [
  { src: 'assets/people/zero-fam.jpg', cap: 'ZERO fam', a: 1.423 },
  { src: 'assets/photos/sunset-rocks.jpg', cap: 'Sunset, on the rocks', a: 0.75 },
  { src: 'assets/photos/chai.jpg', cap: 'Kulhad chai on the highway', a: 0.562 },
  { src: 'assets/photos/mumbai.jpg', cap: 'Mumbai, from above', a: 0.75 },
  { src: 'assets/people/zero-night.jpg', cap: 'Launch night', a: 1.334 },
  { src: 'assets/photos/football.jpg', cap: 'Sunday football', a: 0.75 },
  { src: 'assets/photos/dubai-burj.jpg', cap: 'Dubai, chapter two', a: 0.5625 },
  { src: 'assets/people/friends-sofa.jpg', cap: 'Friends', a: 0.75 },
  { src: 'assets/photos/hill.jpg', cap: 'Golden hour', a: 0.75 },
  { src: 'assets/people/zero-team.jpg', cap: 'The ZERO team', a: 1.776 },
  { src: 'assets/people/cat.jpg', cap: 'The boss of the house', a: 0.45 },
  { src: 'assets/photos/car.jpg', cap: 'Road trip', a: 0.5625 },
  { src: 'assets/people/designar-team.jpg', cap: 'The DesignAR team', a: 0.75 },
  { src: 'assets/photos/mirror-orange.jpg', cap: 'Orange, always', a: 0.562 },
];

export const EXPERIENCE = [
  ['Senior Product Designer', 'ZERO, Dubai', '2025 to now'],
  ['Head of Design', 'Intent, formerly DesignAR', '2021 to 2025'],
  ['Visual Designer', 'Peppermint Robotics', '2022 to 2024'],
  ['Founder', 'Vision Beyond Ordinary', '2020 to now'],
  ['B.E. Electronics and Telecom', 'DJ Sanghvi, CGPA 9.84', 'Mumbai'],
];

export const STUDIO_SHOTS = [
  ['assets/vbo/carvesx-1.jpg', 'CarvesX, product visual'], ['assets/vbo/carvesx-5.jpg', 'CarvesX, launch ad'],
  ['assets/vbo/carvesx-6.jpg', 'CarvesX, campaign'], ['assets/vbo/carvesx-2.jpg', 'CarvesX, detail'],
];

// scroll stops (fraction of the whole ride) and the dissolve windows between sets
export const STOPS = [0, 0.07, 0.19, 0.31, 0.43, 0.555, 0.68, 0.81, 1];
export const STOP_NAMES = ['Intro', 'Clients', 'Work', 'Roots', 'Studio', 'Clicks', 'Thoughts', 'About', 'Contact'];
// dissolve windows between sets, and how each one changes rooms: 0 dots, 1 blinds, 2 iris, 3 scan
export const WINDOWS = [[0.124, 0.156], [0.24, 0.272], [0.36, 0.392], [0.482, 0.515], [0.607, 0.64], [0.735, 0.768], [0.89, 0.94]];
export const STYLES = [0, 2, 1, 0, 3, 1, 0];
// each set keeps its own camera clock: global progress -> the set's local progress
export const REMAP = {
  mountain: [[0, 0], [0.07, 0.11], [0.124, 0.23], [0.156, 0.30]],
  room: [[0.124, 0.23], [0.156, 0.30], [0.19, 0.375], [0.24, 0.45], [0.272, 0.51]],
  stepwell: [[0.24, 0], [0.31, 0.5], [0.392, 1]],
  cyclo: [[0.36, 0], [0.43, 0.5], [0.515, 1]],
  gallery: [[0.482, 0.45], [0.515, 0.51], [0.555, 0.585], [0.607, 0.66], [0.64, 0.72]],
  neon: [[0.607, 0], [0.68, 0.5], [0.768, 1]],
  lounge: [[0.735, 0.66], [0.768, 0.72], [0.81, 0.79], [0.89, 0.86], [0.94, 0.93]],
  ocean: [[0.89, 0.86], [0.94, 0.93], [1, 1]],
};
