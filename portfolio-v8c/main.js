/* Sanjay Chauhan Designs, v8C
   One WebGL2 renderer (three r170): red nebula loader, a velocity-bent looping work strip,
   and a full-screen water ripple layer for projects and Info. */
import * as THREE from 'three';

const W = window, D = document, html = D.documentElement;
W.__v8cState = 'boot';

/* ------------------------------------------------------------------ data */
const EMAIL = 'chauhansanjayofficial@gmail.com';
const PROJECTS = [
  { name: 'ZERO Job Portal', kicker: '2026', line: 'An agent that job-hunts for you, and asks before every move.', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html', img: 'portal' },
  { name: 'ZERO Workspace', kicker: '2025', line: 'Real job scenarios, with an AI manager beside you.', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html', img: 'scenario' },
  { name: 'Curio', kicker: '2026, twenty hand-drawn films on one engine', line: 'Explainer films you can talk back to.', url: 'https://sanjay-curio.vercel.app/', img: 'curio', mob: 'curio-m' },
  { name: 'anyo', kicker: '2026, iOS app', line: 'Close friends, no texting. Video and voice only.', url: 'https://getanyo.vercel.app/', img: 'anyo', mob: 'anyo-m' },
  { name: 'Stack FX', kicker: 'Tool', line: 'A card dealer for motion studies.', url: 'https://sanjay-trace-fx.vercel.app/stack', img: 'stack' },
  { name: 'Signal', kicker: 'WebGL site', line: 'A portfolio built on live shaders.', url: 'https://sanjay-b-chauhan.github.io/github-project/portfolio-v4/', img: 'signal' },
  { name: 'Voice-first onboarding', kicker: 'Prototype', line: 'Talk, and the profile builds itself.', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html', img: 'onboard' },
];
const NP = PROJECTS.length;
const ABOUT = 7;                         // the gallery card opens Info
const ITEMS = [...PROJECTS.map((p) => `assets/work/${p.img}.jpg`), 'assets/work/gallery.jpg'];
const N = ITEMS.length;

const SUN_PATHS = '<path d="M0.25 141.85L122.96 212.7C126.25 189 138.75 168.25 156.74 154.19L34.03 83.35Z"/><path d="M178.4 141.67C188.83 137.45 200.23 135.12 212.18 135.12C224.12 135.12 235.52 137.45 245.96 141.67V0H178.4Z"/><path d="M267.61 154.19C285.59 168.25 298.1 189 301.39 212.69L424.09 141.85L390.31 83.35Z"/><rect x="0" y="233.45" width="424.1" height="67.56"/>';
const MARK = `<svg class="ov-mark" viewBox="0 0 424 301" fill="currentColor" aria-hidden="true" style="--d:0s">${SUN_PATHS}</svg>`;

const projectHTML = (p) => `${MARK}
  <h2 class="ov-h" id="ovTitle" style="--d:.05s">${p.name}</h2>
  <p class="ov-y" style="--d:.14s">${p.kicker}</p>
  <p class="ov-l" style="--d:.18s">${p.line}</p>
  <div class="ov-act" style="--d:.26s">
    <a class="ov-btn" href="${p.url}" target="_blank" rel="noopener">Open live build <span class="ar" aria-hidden="true">&#8599;</span></a>
    <button type="button" class="ov-nx" data-act="next">Next<span class="ar" aria-hidden="true">&#8594;</span></button>
  </div>`;

const ABOUT_HTML = `${MARK}
  <h2 class="ov-h" id="ovTitle" style="--d:.05s">Design that survives engineering.</h2>
  <p class="ov-bio" style="--d:.14s">Senior product designer at ZERO, an AI-native hiring and job-simulation platform. Based in Mumbai. 5+ years, 100+ brands.</p>
  <div class="ov-act" style="--d:.22s">
    <a class="ov-btn" href="mailto:${EMAIL}">Email me <span class="ar" aria-hidden="true">&#8599;</span></a>
    <a class="ov-lnk" href="https://linkedin.com/in/sanjaybchauhan" target="_blank" rel="noopener">LinkedIn</a>
    <a class="ov-lnk" href="https://instagram.com/sanjay.b.chauhan" target="_blank" rel="noopener">Instagram</a>
    <button type="button" class="ov-nx" data-act="work">See the work<span class="ar" aria-hidden="true">&#8594;</span></button>
  </div>
  <div class="ov-side l" style="--d:.3s">
    <div class="grp"><h3>Experience</h3><ul>
      <li>Senior Product Designer, ZERO<span class="yr">2025 to now</span></li>
      <li>Head of Design, Intent (formerly DesignAR)<span class="yr">2021 to 2025</span></li>
      <li>Visual Designer, Peppermint Robotics<span class="yr">2022 to 2024</span></li>
      <li>Founder, Vision Beyond Ordinary<span class="yr">2020 to now</span></li>
    </ul></div>
  </div>
  <div class="ov-side r" style="--d:.36s">
    <div class="grp"><h3>Services</h3><ul><li>Product strategy</li><li>AI interaction design</li><li>Design systems</li><li>Prototypes in code</li></ul></div>
    <div class="grp"><h3>Before ZERO</h3><ul><li>Manish Malhotra, luxury fashion</li><li>LimeRoad, marketplace</li><li>MG Motors, automotive</li><li>Peppermint Robotics, industrial</li></ul></div>
  </div>`;

/* ------------------------------------------------------------------ helpers */
const $ = (s) => D.querySelector(s);
const $$ = (s) => [...D.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mod = (a, n) => ((a % n) + n) % n;
const pad = (n) => String(n).padStart(2, '0');
const ease = {
  lin: (x) => x,
  out3: (x) => 1 - Math.pow(1 - x, 3),
  out4: (x) => 1 - Math.pow(1 - x, 4),
  io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/* loop clock + tiny tween/timer system (driven by the render loop) */
let now = 0;
const tweens = [];
const timers = [];
const hooks = new Set();
function tween(from, to, dur, fn, e = ease.io3, delay = 0) {
  return new Promise((res) => tweens.push({ from, to, dur: Math.max(dur, 1e-4), fn, e, t0: now + delay, res }));
}
function after(sec, fn) { timers.push({ t: now + sec, fn }); }
const wait = (sec) => new Promise((r) => after(sec, r));
function stepTime() {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    if (now < tw.t0) continue;
    const x = Math.min(1, (now - tw.t0) / tw.dur);
    tw.fn(tw.from + (tw.to - tw.from) * tw.e(x), x);
    if (x >= 1) { tweens.splice(i, 1); tw.res(); }
  }
  for (let i = timers.length - 1; i >= 0; i--) {
    if (now >= timers[i].t) { const f = timers[i].fn; timers.splice(i, 1); f(); }
  }
}

/* ------------------------------------------------------------------ dom */
const canvas = $('#gl');
const stripEl = $('#strip');
const pageEl = $('#page');
const ov = $('#ov');
const ovBody = $('#ovBody');
const ovScroll = $('#ovScroll');
const ovClose = $('#ovClose');
const tagT = $('#ovTagT');
const tagB = $('#ovTagB');
const courtSvg = $('#court');
const ovImgA = $('#ovImgA');
const ovImgB = $('#ovImgB');
const idxLinks = $$('.index a[data-i]');
const pvImg = $('#pvImg');
const infoBtn = $('#infoBtn');
const contactBtn = $('#contactBtn');
const copiedEl = $('#copied');
const loaderEl = $('#loader');
const ldEl = $('.ld');
const ldSun = $('.ld-sun');
const pctEl = $('#pct');
const rays = $$('.ld-sun .ray');
const disc = $('.ld-sun .disc');

const RMQ = W.matchMedia('(prefers-reduced-motion: reduce)');
let reduce = RMQ.matches;
const MQ = W.matchMedia('(max-width: 899px), (max-height: 520px)');
const COARSE = W.matchMedia('(hover: none)').matches;
let vw = W.innerWidth, vh = W.innerHeight;
let mobile = MQ.matches;
const DPR = Math.min(W.devicePixelRatio || 1, 1.75);

function revealFallback() {
  html.classList.remove('loading', 'gl');
  html.classList.add('failsafe', 'nogl', 'in', 'done');
  W.__v8cState = 'ready';
}

/* ------------------------------------------------------------------ webgl2 check */
function hasWebGL2() {
  try {
    const c = D.createElement('canvas');
    const g = c.getContext('webgl2');
    if (!g) return false;
    const ext = g.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    return true;
  } catch (e) { return false; }
}
let renderer = null;
let GL = false;
if (hasWebGL2()) {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    GL = typeof WebGL2RenderingContext !== 'undefined' && renderer.getContext() instanceof WebGL2RenderingContext;
  } catch (e) { GL = false; renderer = null; }
}
html.classList.add(GL ? 'gl' : 'nogl');

/* ------------------------------------------------------------------ shaders */
const NOISE = /* glsl */ `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1., 0.)), u.x), mix(hash12(i + vec2(0., 1.)), hash12(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = m * p; a *= .5; } return v; }
float easeOutR(float x){ return 1. - pow(1. - x, 2.2); }
`;

const FSQ_VS = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

const BLUR_FS = /* glsl */ `
uniform sampler2D tSrc; uniform vec2 uDir; uniform float uMode;
varying vec2 vUv;
void main(){
  if (uMode < .5){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.); return; }
  vec3 c = texture2D(tSrc, vUv).rgb * .2270270270;
  c += texture2D(tSrc, vUv + uDir * 1.3846153846).rgb * .3162162162;
  c += texture2D(tSrc, vUv - uDir * 1.3846153846).rgb * .3162162162;
  c += texture2D(tSrc, vUv + uDir * 3.2307692308).rgb * .0702702703;
  c += texture2D(tSrc, vUv - uDir * 3.2307692308).rgb * .0702702703;
  gl_FragColor = vec4(c, 1.);
}
`;

/* loader: brand-red fbm nebula, a dark planet with a hot rim, a ripple, then the cream panel */
const LOADER_FS = /* glsl */ `
uniform vec2 uRes, uBuf; uniform float uTime, uFade, uPanel, uNow, uDropD; uniform vec4 uDrop;
uniform vec4 uPlanet; uniform vec2 uLight;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float diag = length(uRes);
  float h = 0., sl = 0.;
  vec2 dv = px - uDrop.xy; float d = length(dv); vec2 dir = dv / max(d, 1.);
  float age = uNow - uDrop.z;
  if (uDrop.w > 0. && age > 0.){
    float R = uDropD * 1.1 * easeOutR(clamp(age / 1.25, 0., 1.));
    float b = R - d;
    if (b > 0.){
      float lam = diag * .1;
      float env = exp(-b / (diag * .4)) * smoothstep(0., lam * .3, b) * exp(-age * 1.1);
      float ph = b * 6.2831853 / lam;
      h = sin(ph) * env;
      sl = cos(ph) * env * dot(dir, normalize(vec2(-.6, -.8)));
    }
  }
  vec2 q = px - dir * h * diag * .016;
  float asp = uRes.x / uRes.y;
  vec2 p = (q - .5 * uRes) / uRes.y; p.y = -p.y;
  float t = uTime * .035;
  vec2 w = vec2(fbm(p * 1.6 + vec2(0., t)), fbm(p * 1.6 + vec2(5.2, 1.3) - vec2(t, 0.)));
  float n = fbm(p * 1.35 + (w - .5) * 1.8 + vec2(t * .6, -t * .2));
  float n2 = fbm(p * 3.1 - w * 1.3 + vec2(-t, t * .5) + 3.1);
  vec3 col = vec3(.03, .018, .018);
  col = mix(col, vec3(.2, .014, .01), smoothstep(.2, .55, n));
  col = mix(col, vec3(.6, .025, .014), smoothstep(.42, .72, n));
  col = mix(col, vec3(1., .03, .015), smoothstep(.58, .86, n) * .85);
  col += vec3(1., .34, .22) * pow(smoothstep(.55, .95, n * .7 + n2 * .35), 2.) * .3;
  col *= .5 + .5 * smoothstep(.22, .62, n2);
  vec2 sp = floor(q / 2.);
  float sh = hash12(sp);
  float star = step(.9972, sh) * (.35 + .65 * hash12(sp + 3.7)) * (.65 + .35 * sin(uTime * 2.3 + sh * 90.));
  col += vec3(1., .95, .88) * star * (1. - smoothstep(.3, .62, n));
  vec2 pc = uPlanet.w > .5 ? uPlanet.xy : (asp > 1. ? vec2(.56, -.04) : vec2(.5, .16));
  float Rp = uPlanet.w > .5 ? uPlanet.z : (asp > 1. ? .8 : .56);
  vec2 pv = p - pc; float pl = length(pv);
  float pd = pl - Rp;
  vec2 nrm = pv / max(pl, 1e-4);
  float lit = smoothstep(-.35, .95, dot(nrm, normalize(uLight)));
  float inside = 1. - smoothstep(-.0015, .0015, pd);
  float n3 = fbm(pv * 2.4 + vec2(t * .4, 0.) + 7.);
  vec3 body = mix(vec3(.018, .008, .008), vec3(.11, .012, .01), n3);
  body += vec3(.6, .045, .025) * smoothstep(-.2, 0., pd) * lit * .5;
  col = mix(col, body, inside);
  float rim = exp(-abs(pd) * 420.) * lit;
  float atm = exp(-max(pd, 0.) * 15.) * lit * (1. - inside);
  col += vec3(1., .95, .85) * rim * 1.2 + vec3(1., .1, .05) * atm * .42;
  float n4 = fbm(p * 1.1 + vec2(-t * .8, t * .3) + 11.);
  float haze = smoothstep(.42, .9, n4) * smoothstep(.45, -.55, p.y);
  col = mix(col, vec3(.8, .035, .02), haze * .5);
  float veil = smoothstep(.46, .86, n4 * .6 + n * .5) * inside;
  col = mix(col, vec3(.62, .03, .018), veil * .55);
  col *= 1. + sl * .5;
  col += vec3(1., .8, .7) * pow(max(sl, 0.), 2.) * .15;
  col *= 1. - smoothstep(.55, 1.3, length(p * vec2(.78, 1.))) * .5;
  col *= uFade;
  if (uPanel > 0.){
    float e = uPanel;
    float top = uRes.y * (1. - e) * 1.02 - 3. + h * diag * .012;
    float ins = uRes.x * .085 * (1. - e);
    float inP = smoothstep(top - .75, top + .75, px.y) * smoothstep(ins - .75, ins + .75, px.x) * (1. - smoothstep(uRes.x - ins - .75, uRes.x - ins + .75, px.x));
    col = mix(col, vec3(1., .9922, .8863), inP);
  }
  gl_FragColor = vec4(col, 1.);
}
`;

/* strip: textured planes, duotone ink to cream with print grain; bend toward the camera by scroll velocity */
const STRIP_VS = /* glsl */ `
uniform float uBend, uBendK, uAxis; uniform vec2 uView;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.);
  float s;
  if (uAxis < .5){ float yN = wp.y / (uView.y * .5); s = uBend >= 0. ? (1. - yN) * .5 : (1. + yN) * .5; }
  else { float xN = wp.x / (uView.x * .5); s = uBend >= 0. ? (1. + xN) * .5 : (1. - xN) * .5; }
  s = clamp(s, 0., 1.25);
  wp.z += abs(uBend) * uBendK * s * s;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const STRIP_FS = /* glsl */ `
uniform sampler2D uTex; uniform float uHas, uColor, uR; uniform vec2 uSize, uHover; uniform vec3 uDark, uLight;
varying vec2 vUv;
${NOISE}
void main(){
  vec3 c = texture2D(uTex, vUv).rgb;
  float l = dot(c, vec3(.2126, .7152, .0722));
  l = smoothstep(.03, .96, l);
  float g = hash12(floor(vUv * uSize * 1.4)) - .5;
  float lg = clamp(l + g * .22 * (1. - abs(l - .5)), 0., 1.);
  vec3 duo = mix(uDark, uLight, lg);
  vec2 a = vec2(uSize.x / uSize.y, 1.);
  float dist = length((vUv - uHover) * a);
  float m = (1. - smoothstep(uR - .32, uR, dist)) * uColor;
  vec3 col = mix(duo, c, m);
  col = mix(vec3(.93, .918, .82), col, uHas);
  gl_FragColor = vec4(col, 1.);
}
`;

/* the ripple layer: blurred screenshot + grain, radial water displacement from each drop,
   an expanding front that reveals / swaps / drains the layer, and court lines bent by the water */
const OV_FS = /* glsl */ `
uniform vec2 uRes, uBuf;
uniform float uTime, uNow;
uniform sampler2D uTA, uTB, uSB;
uniform float uAspA, uAspB, uDarkA, uDarkB;
uniform float uMode;
uniform vec2 uC; uniform float uT, uDur, uD;
uniform float uFadeOn, uFadeT, uFocus, uLines;
uniform vec4 uDrops[6]; uniform vec2 uDropP[6];
uniform vec4 uSeg[14];
uniform float uAmpPx, uLam, uDecL;
varying vec2 vUv;
${NOISE}
vec2 cover(vec2 px, float asp){
  vec2 uv = px / uRes;
  float sa = uRes.x / uRes.y;
  if (sa > asp) uv.y = (uv.y - .5) * (asp / sa) + .5; else uv.x = (uv.x - .5) * (sa / asp) + .5;
  uv = (uv - .5) * .93 + .5;
  return vec2(uv.x, 1. - uv.y);
}
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0., 1.); return length(pa - ba * h); }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float pxs = uRes.x / uBuf.x;
  vec2 disp = vec2(0.); float sl = 0.;
  vec2 Ld = normalize(vec2(-.6, -.8));
  for (int j = 0; j < 6; j++){
    vec4 dr = uDrops[j]; vec2 dp = uDropP[j];
    float age = uNow - dr.z;
    if (dr.w <= 0. || age <= 0. || age > 4.6) continue;
    float k = dp.y;
    float dur = mix(.8, 1.25, k);
    float R = dp.x * 1.1 * easeOutR(clamp(age / dur, 0., 1.));
    vec2 dv = px - dr.xy; float d = length(dv);
    float b = R - d;
    if (b <= 0.) continue;
    vec2 dir = dv / max(d, 1.);
    float lam = uLam * mix(.42, 1., k);
    float L = uDecL * mix(.3, 1., k);
    float env = exp(-b / L) * smoothstep(0., lam * .3, b) * dr.w * exp(-age * 1.15) * (1. - smoothstep(2.4, 4.4, age));
    float ph = b * 6.2831853 / lam;
    disp += dir * sin(ph) * env;
    sl += cos(ph) * env * dot(dir, Ld);
  }
  vec2 idle = vec2(vnoise(px * .0021 + vec2(uTime * .05, 0.)), vnoise(px * .0021 + vec2(5.3, 2.1) - vec2(0., uTime * .045))) - .5;
  vec2 off = disp * uAmpPx + idle * 12.;
  vec2 q = px - off;
  vec2 ca = disp * uAmpPx * .1;
  vec3 cB = vec3(texture2D(uTB, cover(q + ca, uAspB)).r, texture2D(uTB, cover(q, uAspB)).g, texture2D(uTB, cover(q - ca, uAspB)).b);
  if (uFocus > .002) cB = mix(cB, texture2D(uSB, cover(q, uAspB)).rgb, uFocus);
  cB *= uDarkB;
  vec3 cA = vec3(0.);
  if (uMode > .5) cA = vec3(texture2D(uTA, cover(q + ca, uAspA)).r, texture2D(uTA, cover(q, uAspA)).g, texture2D(uTA, cover(q - ca, uAspA)).b) * uDarkA;
  float x = clamp(uT / uDur, 0., 1.);
  float R = uD * 1.1 * easeOutR(x);
  vec2 cv = px - uC; float cd = length(cv);
  vec2 dn = cv / max(cd, 1.);
  float wob = ((vnoise(dn * 1.7 + vec2(17.3, uT * 1.3)) - .5) * 30. + (vnoise(dn * 4.6 + vec2(3.1, 9. + uT * 2.)) - .5) * 8.) * (1. - x);
  float e = mix(8., 22., 1. - x);
  float dm = cd + wob;
  float m = 1. - smoothstep(R - e, R + e, dm);
  if (uT <= 0.) m = 0.;
  float crest = exp(-abs(dm - R) / 6.) * (1. - x * .85);
  if (uT <= 0.) crest = 0.;
  if (uFadeOn > .5){ m = uFadeT; crest = 0.; }
  vec3 col; float alpha;
  if (uMode < .5){ col = cB; alpha = m; }
  else if (uMode < 1.5){ col = mix(cA, cB, m); alpha = 1.; }
  else { col = cA; alpha = 1. - m; }
  col = mix(vec3(dot(col, vec3(.2126, .7152, .0722))), col, 1.18);
  col *= 1. + sl * .6;
  col += vec3(1., .97, .9) * pow(max(sl, 0.), 2.) * .3;
  vec2 vu = px / uRes - .5;
  col *= 1. - smoothstep(.28, .9, length(vu * vec2(1., .85))) * .36;
  col += .01;
  vec2 lp = px - disp * uAmpPx * .85 - idle * 2.;
  float lc = 0.;
  for (int i = 0; i < 14; i++){
    vec4 s = uSeg[i];
    float g = clamp((uLines - float(i) * .03) / .5, 0., 1.);
    g = 1. - pow(1. - g, 3.);
    if (g <= 0.) continue;
    float dd = segD(lp, s.xy, mix(s.xy, s.zw, g));
    lc = max(lc, clamp((.5 + .5 * pxs - dd) / pxs, 0., 1.));
  }
  float vis = uMode < .5 ? m : (uMode > 1.5 ? 1. - m : 1.);
  lc *= smoothstep(.35, .9, vis);
  col = mix(col, vec3(1., .992, .886), lc * .78);
  col += vec3(1., .99, .93) * crest * .5;
  float gr = hash12(floor(gl_FragCoord.xy) + fract(uTime * 7.31) * 431.) - .5;
  col += gr * .085;
  if (uMode < .5) alpha = clamp(alpha + crest * .35, 0., 1.);
  else if (uMode > 1.5) alpha = clamp(alpha + crest * .35, 0., 1.);
  gl_FragColor = vec4(clamp(col, 0., 1.) * alpha, alpha);
}
`;

/* ------------------------------------------------------------------ state */
const S = { s: 0, target: 0, prev: 0, vel: 0, bend: 0, intro: true, drag: null };
const L = { axis: 0, x0: 0, w: 400, h: 250, gap: 20, step: 270, lead: 20, total: 2160, docTop: 0 };
let active = 0, hoverItem = -1, idxPointer = -1, idxFocus = -1;
let ovOpen = false, ovKind = null, ovCur = -1, ovTrigger = null, ovLock = 0, frontT0 = -1;
let stripVisible = false, loaderActive = true, focusWant = 0, MANUAL = false;
const ptr = { x: -1, y: -1, in: false };
const FRONT = 1.25;
const items = ITEMS.map((src, i) => ({ i, src, x: 0, y: 0, w: 0, h: 0, vis: false, col: 0, r: 0 }));

/* ------------------------------------------------------------------ three setup */
let scene, cam, orthoCam, quadGeo, loaderMat, loaderMesh, ovMat, ovMesh, stripMats = [], blurScene, blurMat, PH;
const LU = {}; const OU = {};
const T = ITEMS.map(() => ({ tex: null, blur: null, asp: 1.6, dark: 0.6, mob: null }));
let nebRT = null, nebScene = null, nebFor = '';
const tmpV2 = new THREE.Vector2();

function initGL() {
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(reduce ? DPR : Math.min(DPR, 1));
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(30, vw / vh, 1, 10000);
  orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quadGeo = new THREE.PlaneGeometry(2, 2);
  PH = new THREE.DataTexture(new Uint8Array([26, 22, 20, 255]), 1, 1);
  PH.needsUpdate = true;

  Object.assign(LU, {
    uRes: { value: new THREE.Vector2(vw, vh) }, uBuf: { value: new THREE.Vector2(vw, vh) },
    uTime: { value: 0 }, uFade: { value: 0 }, uPanel: { value: 0 }, uNow: { value: 0 },
    uDrop: { value: new THREE.Vector4(0, 0, 0, 0) }, uDropD: { value: 1 },
    uPlanet: { value: new THREE.Vector4(0, 0, 0, 0) }, uLight: { value: new THREE.Vector2(-1, 0.55) },
  });
  loaderMat = new THREE.ShaderMaterial({ uniforms: LU, vertexShader: FSQ_VS, fragmentShader: LOADER_FS, depthTest: false, depthWrite: false });
  loaderMesh = new THREE.Mesh(quadGeo, loaderMat);
  loaderMesh.frustumCulled = false;
  loaderMesh.renderOrder = 0;
  scene.add(loaderMesh);

  const stripGeo = new THREE.PlaneGeometry(1, 1, 10, 24);
  const dark = new THREE.Vector3(11 / 255, 11 / 255, 11 / 255);
  const light = new THREE.Vector3(0.962, 0.952, 0.848);
  items.forEach((it) => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: PH }, uHas: { value: 0 }, uSize: { value: new THREE.Vector2(400, 250) }, uColor: { value: 0 },
        uHover: { value: new THREE.Vector2(0.5, 0.5) }, uR: { value: 0 }, uBend: { value: 0 }, uBendK: { value: 300 },
        uAxis: { value: 0 }, uView: { value: new THREE.Vector2(vw, vh) }, uDark: { value: dark }, uLight: { value: light },
      },
      vertexShader: STRIP_VS, fragmentShader: STRIP_FS, depthTest: false, depthWrite: false,
    });
    stripMats.push(m);
    const mesh = new THREE.Mesh(stripGeo, m);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    mesh.visible = false;
    it.mesh = mesh;
    scene.add(mesh);
  });

  Object.assign(OU, {
    uRes: { value: new THREE.Vector2(vw, vh) }, uBuf: { value: new THREE.Vector2(vw, vh) },
    uTime: { value: 0 }, uNow: { value: 0 },
    uTA: { value: PH }, uTB: { value: PH }, uSB: { value: PH },
    uAspA: { value: 1.6 }, uAspB: { value: 1.6 }, uDarkA: { value: 0.6 }, uDarkB: { value: 0.6 },
    uMode: { value: 0 }, uC: { value: new THREE.Vector2() }, uT: { value: 0 }, uDur: { value: FRONT }, uD: { value: 1000 },
    uFadeOn: { value: 0 }, uFadeT: { value: 0 }, uFocus: { value: 0 }, uLines: { value: 0 },
    uDrops: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
    uDropP: { value: Array.from({ length: 6 }, () => new THREE.Vector2(1, 1)) },
    uSeg: { value: Array.from({ length: 14 }, () => new THREE.Vector4()) },
    uAmpPx: { value: 36 }, uLam: { value: 140 }, uDecL: { value: 700 },
  });
  ovMat = new THREE.ShaderMaterial({ uniforms: OU, vertexShader: FSQ_VS, fragmentShader: OV_FS, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false });
  ovMesh = new THREE.Mesh(quadGeo, ovMat);
  ovMesh.frustumCulled = false;
  ovMesh.renderOrder = 10;
  ovMesh.visible = false;
  scene.add(ovMesh);

  blurScene = new THREE.Scene();
  blurMat = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() }, uMode: { value: 0 } }, vertexShader: FSQ_VS, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false });
  const bq = new THREE.Mesh(quadGeo, blurMat);
  bq.frustumCulled = false;
  blurScene.add(bq);

  // compile everything up front so the first ripple does not hitch
  const vis = [];
  scene.traverse((o) => { if (o.isMesh) { vis.push([o, o.visible]); o.visible = true; } });
  try { renderer.compile(scene, cam); renderer.compile(blurScene, orthoCam); } catch (e) { /* not fatal */ }
  vis.forEach(([o, v]) => { o.visible = v; });
}

function makeBlur(tex, w = 480, h = 300) {
  const opts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
  const a = new THREE.WebGLRenderTarget(w, h, opts);
  const b = new THREE.WebGLRenderTarget(w, h, opts);
  const prev = renderer.getRenderTarget();
  const u = blurMat.uniforms;
  u.uMode.value = 0; u.tSrc.value = tex;
  renderer.setRenderTarget(a); renderer.render(blurScene, orthoCam);
  u.uMode.value = 1;
  const spread = 2.6;
  for (let k = 0; k < 4; k++) {
    u.tSrc.value = a.texture; u.uDir.value.set(spread / w, 0);
    renderer.setRenderTarget(b); renderer.render(blurScene, orthoCam);
    u.tSrc.value = b.texture; u.uDir.value.set(0, spread / h);
    renderer.setRenderTarget(a); renderer.render(blurScene, orthoCam);
  }
  renderer.setRenderTarget(prev);
  b.dispose();
  return a.texture;
}

function meanLum(img) {
  try {
    const c = D.createElement('canvas'); c.width = 24; c.height = 15;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, 24, 15);
    const d = x.getImageData(0, 0, 24, 15).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    return s / (d.length / 4);
  } catch (e) { return 0.5; }
}
const darkFor = (lum) => clamp(0.36 / Math.max(lum, 0.05), 0.42, 0.95);

let nLoaded = 0;
const NEED = N + 1;
/* phones get 1024px copies: the cards are small and the layer is blurred, so full size only costs GPU memory */
function fitTexture(tex, maxW) {
  const img = tex.image;
  if (!img || img.width <= maxW) return tex;
  try {
    const c = D.createElement('canvas');
    c.width = maxW; c.height = Math.round(img.height * (maxW / img.width));
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    tex.dispose();
    return new THREE.CanvasTexture(c);
  } catch (e) { return tex; }
}
function loadTextures() {
  const tl = new THREE.TextureLoader();
  const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  ITEMS.forEach((src, i) => {
    tl.load(src, (loaded) => {
      const tex = (mobile || COARSE) ? fitTexture(loaded, 1024) : loaded;
      tex.colorSpace = THREE.NoColorSpace;
      tex.anisotropy = aniso;
      T[i].tex = tex;
      T[i].asp = tex.image.width / tex.image.height;
      T[i].dark = darkFor(meanLum(tex.image));
      T[i].blur = makeBlur(tex);
      stripMats[i].uniforms.uTex.value = tex;
      tween(0, 1, 0.7, (v) => { stripMats[i].uniforms.uHas.value = v; }, ease.out3);
      nLoaded++;
      if (i < NP && PROJECTS[i].mob && vh > vw * 1.1) loadMobile(i);
    }, undefined, () => { nLoaded++; });
  });
  D.fonts.ready.then(() => { nLoaded++; }).catch(() => { nLoaded++; });
}
function loadMobile(i) {
  if (T[i].mob) return;
  T[i].mob = { pending: true };
  new THREE.TextureLoader().load(`assets/work/${PROJECTS[i].mob}.jpg`, (loaded) => {
    const tex = fitTexture(loaded, 640);
    tex.colorSpace = THREE.NoColorSpace;
    T[i].mob = { tex, blur: makeBlur(tex, 240, 520), asp: tex.image.width / tex.image.height, dark: darkFor(meanLum(tex.image)) };
  }, undefined, () => {});
}

/* the Info layer sits on a still of the loader's nebula */
function nebulaTex() {
  const port = vh > vw * 1.1;
  const key = port ? 'p' : 'l';
  if (nebRT && nebFor === key) return nebRT.texture;
  const w = port ? 560 : 1200, h = port ? 1080 : 750;
  if (!nebRT) {
    nebRT = new THREE.WebGLRenderTarget(w, h, { depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
    nebScene = new THREE.Scene();
    const m = new THREE.Mesh(quadGeo, loaderMat); m.frustumCulled = false; nebScene.add(m);
  } else nebRT.setSize(w, h);
  const keep = { res: LU.uRes.value.clone(), buf: LU.uBuf.value.clone(), fade: LU.uFade.value, panel: LU.uPanel.value, time: LU.uTime.value, drop: LU.uDrop.value.w };
  LU.uRes.value.set(w, h); LU.uBuf.value.set(w, h); LU.uFade.value = 1; LU.uPanel.value = 0; LU.uTime.value = 21; LU.uDrop.value.w = 0;
  if (port) LU.uPlanet.value.set(0, -1.02, 0.66, 1); else LU.uPlanet.value.set(0.08, -1.66, 1.26, 1);
  LU.uLight.value.set(-0.25, 1);
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(nebRT); renderer.render(nebScene, orthoCam); renderer.setRenderTarget(prev);
  LU.uRes.value.copy(keep.res); LU.uBuf.value.copy(keep.buf); LU.uFade.value = keep.fade; LU.uPanel.value = keep.panel; LU.uTime.value = keep.time; LU.uDrop.value.w = keep.drop;
  LU.uPlanet.value.set(0, 0, 0, 0); LU.uLight.value.set(-1, 0.55);
  nebFor = key;
  return nebRT.texture;
}

function texInfo(i) {
  if (i === ABOUT) return { blur: nebulaTex(), sharp: nebRT.texture, asp: nebRT.width / nebRT.height, dark: 0.8 };
  const t = T[i];
  if (vh > vw * 1.1 && t.mob && t.mob.tex) return { blur: t.mob.blur, sharp: t.mob.tex, asp: t.mob.asp, dark: t.mob.dark };
  return { blur: t.blur || PH, sharp: t.tex || PH, asp: t.asp, dark: t.dark };
}

/* ------------------------------------------------------------------ layout */
function layoutStrip() {
  mobile = MQ.matches;
  const r = stripEl.getBoundingClientRect();
  if (!mobile) {
    L.axis = 0; L.x0 = r.left; L.w = r.width; L.h = L.w / 1.6; L.gap = L.w * 0.0438; L.step = L.h + L.gap; L.lead = L.gap;
  } else {
    L.axis = 1; L.h = r.height; L.w = L.h * 1.6; L.gap = 12; L.step = L.w + L.gap; L.lead = Math.max(16, (vw - L.w) / 2); L.docTop = r.top + W.scrollY;
  }
  L.total = L.step * N;
}

let court = null;
function courtLayout() {
  const land = !mobile && vw > vh * 0.9;
  const cx = vw / 2;
  let c;
  if (land) c = { xL: 0.2722 * vw, xR: 0.7271 * vw, y1: 0.0933 * vh, y2: 0.1933 * vh, y3: 0.8133 * vh, y4: 0.9067 * vh, ym: 0.4889 * vh, gap: 0.042 * vw, tick: 0.0528 * vw };
  else c = { xL: 0.055 * vw, xR: 0.945 * vw, y1: Math.max(60, 0.075 * vh), y2: Math.max(104, 0.135 * vh), y3: 0.875 * vh, y4: 0.94 * vh, ym: 0.5 * vh, gap: 0.1 * vw, tick: 0.07 * vw };
  const segs = [
    [cx - c.gap, c.y1, 0, c.y1], [cx + c.gap, c.y1, vw, c.y1],
    [cx - c.gap, c.y2, 0, c.y2], [cx + c.gap, c.y2, vw, c.y2],
    [cx, c.y1, cx, c.y2],
    [c.xL, c.y2, c.xL, c.y3], [c.xR, c.y2, c.xR, c.y3],
    [c.xL, c.ym, c.xL + c.tick, c.ym], [c.xR, c.ym, c.xR - c.tick, c.ym],
    [cx - c.gap, c.y3, 0, c.y3], [cx + c.gap, c.y3, vw, c.y3],
    [cx - c.gap, c.y4, 0, c.y4], [cx + c.gap, c.y4, vw, c.y4],
    [cx, c.y4, cx, c.y3],
  ];
  court = { ...c, cx, segs, land };
  if (GL) segs.forEach((s, i) => OU.uSeg.value[i].set(s[0], s[1], s[2], s[3]));
  // DOM court for the no-WebGL fallback
  courtSvg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  courtSvg.innerHTML = segs.map((s) => `<line x1="${s[0].toFixed(1)}" y1="${s[1].toFixed(1)}" x2="${s[2].toFixed(1)}" y2="${s[3].toFixed(1)}"/>`).join('');
  // labels sit on the court like the reference's small court labels
  tagT.style.left = `${cx + c.gap + 4}px`; tagT.style.top = `${c.y2 - 8}px`; tagT.style.transform = 'translateY(-100%)';
  tagB.style.right = `${vw - (cx - c.gap - 4)}px`; tagB.style.left = 'auto'; tagB.style.top = `${c.y3 + 8}px`;
}

let lastSize = '';
function sizeAll() {
  vw = W.innerWidth; vh = W.innerHeight; mobile = MQ.matches;
  if (GL) {
    const pr = loaderActive && !reduce ? Math.min(DPR, 1) : DPR;
    const key = `${vw}x${vh}@${pr}`;
    if (key !== lastSize) { lastSize = key; renderer.setPixelRatio(pr); renderer.setSize(vw, vh, true); }
    cam.aspect = vw / vh;
    cam.position.set(0, 0, (vh / 2) / Math.tan((15 * Math.PI) / 180));
    cam.near = 1; cam.far = cam.position.z * 4;
    cam.updateProjectionMatrix();
    renderer.getDrawingBufferSize(tmpV2);
    LU.uRes.value.set(vw, vh); LU.uBuf.value.copy(tmpV2);
    OU.uRes.value.set(vw, vh); OU.uBuf.value.copy(tmpV2);
    const diag = Math.hypot(vw, vh);
    OU.uAmpPx.value = diag * 0.0175; OU.uLam.value = diag * 0.1; OU.uDecL.value = diag * 0.42;
    stripMats.forEach((m) => m.uniforms.uView.value.set(vw, vh));
  }
  layoutStrip();
  courtLayout();
  needRender = true;
}

/* ------------------------------------------------------------------ strip */
function itemAt(x, y) {
  for (const it of items) if (it.vis && x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h) return it;
  return null;
}
function scrollToItem(i) {
  const size = L.axis ? L.w : L.h;
  const c = L.axis ? vw / 2 : vh / 2;
  let s = L.lead + i * L.step + size / 2 - c;
  s += Math.round((S.target - s) / L.total) * L.total;
  S.target = s;
}
function setActive(i) {
  if (i === active || i < 0 || i >= N) return;
  active = i;
  idxLinks.forEach((a, k) => a.classList.toggle('on', k === i));
  const src = ITEMS[i];
  if (pvImg.getAttribute('src') !== src) {
    pvImg.setAttribute('src', src);
    pvImg.classList.remove('swap'); void pvImg.offsetWidth; pvImg.classList.add('swap');
  }
}
function setHover(i, x, y) {
  if (i !== hoverItem) {
    hoverItem = i;
    if (i >= 0) items[i].r = 0;
    stripEl.classList.toggle('hov', i >= 0);
  }
  if (i >= 0 && GL) {
    const it = items[i];
    stripMats[i].uniforms.uHover.value.set((x - it.x) / it.w, 1 - (y - it.y) / it.h);
  }
}
let needRender = true;
function updateStrip(dt) {
  if (!S.intro && !S.drag) S.s = reduce ? S.target : S.s + (S.target - S.s) * (1 - Math.exp(-dt * 7));
  const v = dt > 0 ? (S.s - S.prev) / dt : 0;
  S.prev = S.s;
  S.vel += (v - S.vel) * (1 - Math.exp(-dt * 10));
  const bendT = reduce ? 0 : clamp(S.vel / (S.intro ? 1700 : L.axis ? 2600 : 3400), -1.2, 1.2);
  S.bend += (bendT - S.bend) * (1 - Math.exp(-dt * 12));
  const bendK = L.axis ? vw * 0.3 : vh * 0.5;
  const center = L.axis ? vw / 2 : vh / 2;
  const top0 = L.axis ? L.docTop - W.scrollY : 0;
  const idx = idxPointer >= 0 ? idxPointer : idxFocus;
  let best = 0, bestD = 1e9, moving = Math.abs(S.target - S.s) > 0.05 || Math.abs(S.bend) > 0.0005;
  for (const it of items) {
    const base = L.lead + it.i * L.step - S.s;
    const pos = S.intro ? base : mod(base + L.step, L.total) - L.step;
    if (L.axis === 0) { it.x = L.x0; it.y = pos; } else { it.x = pos; it.y = top0; }
    it.w = L.w; it.h = L.h;
    it.vis = it.x < vw && it.x + it.w > 0 && it.y < vh && it.y + it.h > 0;
    const c = L.axis ? it.x + it.w / 2 : it.y + it.h / 2;
    const dd = Math.abs(c - center);
    if (dd < bestD) { bestD = dd; best = it.i; }
    const want = (it.i === hoverItem || it.i === idx || (COARSE && it.i === active && !S.drag && !S.intro)) ? 1 : 0;
    const pc = it.col;
    it.col += (want - it.col) * (1 - Math.exp(-dt * (want ? 6 : 3.5)));
    if (want && it.r < 2.6) { it.r = Math.min(2.6, it.r + dt * 1.9 * (1 + it.r)); moving = true; }
    if (Math.abs(it.col - pc) > 1e-4) moving = true;
    if (GL) {
      const m = it.mesh, u = m.material.uniforms;
      m.visible = it.vis && stripVisible;
      if (m.visible) {
        m.position.set(it.x + it.w / 2 - vw / 2, vh / 2 - (it.y + it.h / 2), 0);
        m.scale.set(it.w, it.h, 1);
        u.uBend.value = S.bend; u.uBendK.value = bendK; u.uAxis.value = L.axis;
        u.uSize.value.set(it.w, it.h); u.uColor.value = it.col; u.uR.value = it.r;
        if (it.i === idx) u.uHover.value.set(0.5, 0.5);
      }
    }
  }
  if (ptr.in && !S.drag && !ovOpen && !S.intro && moving) {
    const hit = itemAt(ptr.x, ptr.y);
    setHover(hit ? hit.i : -1, ptr.x, ptr.y);
  }
  if (!S.intro) {
    const show = idx >= 0 ? idx : hoverItem >= 0 ? hoverItem : best;
    setActive(show);
  }
  if (moving || S.intro || S.drag) needRender = true;
}

/* ------------------------------------------------------------------ ripple layer */
const drops = Array.from({ length: 6 }, () => ({ x: 0, y: 0, t0: -99, amp: 0, D: 1, k: 1 }));
let bigSlot = 0, smallSlot = 2, curTex = null, fbFront = null;
function maxCorner(x, y) { return Math.max(Math.hypot(x, y), Math.hypot(vw - x, y), Math.hypot(x, vh - y), Math.hypot(vw - x, vh - y)); }
function coverTime(Dm) {
  const need = Math.min(0.999, (Dm + 26) / (Dm * 1.1));
  return (1 - Math.pow(1 - need, 1 / 2.2)) * FRONT;
}
function bigDrop(x, y) {
  const d = drops[bigSlot]; bigSlot = (bigSlot + 1) % 2;
  Object.assign(d, { x, y, t0: now, amp: 1, D: maxCorner(x, y), k: 1 });
}
function smallDrop(x, y, amp = 0.2) {
  const d = drops[smallSlot]; smallSlot = smallSlot >= 5 ? 2 : smallSlot + 1;
  Object.assign(d, { x, y, t0: now, amp, D: Math.hypot(vw, vh) * 0.3, k: 0.35 });
}
function startFront(mode, x, y) {
  OU.uMode.value = mode; OU.uC.value.set(x, y); OU.uD.value = maxCorner(x, y); frontT0 = now;
  bigDrop(x, y);
}
function setB(i) {
  const t = texInfo(i);
  OU.uTB.value = t.blur; OU.uSB.value = t.sharp; OU.uAspB.value = t.asp; OU.uDarkB.value = t.dark;
  curTex = t;
}
function setAFromCur() {
  if (!curTex) return;
  OU.uTA.value = curTex.blur; OU.uAspA.value = curTex.asp; OU.uDarkA.value = curTex.dark;
}
function fillLayer(kind, i) {
  if (kind === 'about') {
    ovBody.className = 'ov-body about'; ovBody.innerHTML = ABOUT_HTML; tagT.textContent = 'Info';
  } else {
    ovBody.className = 'ov-body'; ovBody.innerHTML = projectHTML(PROJECTS[i]); tagT.textContent = `${pad(i + 1)} / ${pad(NP)}`;
  }
  tagB.textContent = COARSE ? '' : 'Esc to close';
  ovScroll.scrollTop = 0;
}
function fbShow(i) {
  const src = ITEMS[i];
  const next = fbFront === ovImgA ? ovImgB : ovImgA;
  next.style.backgroundImage = `url("${src}")`;
  next.classList.add('on');
  if (fbFront) fbFront.classList.remove('on');
  fbFront = next;
}
function openLayer(kind, i, x, y, trigger) {
  if (ovOpen) { swapLayer(kind, i, x, y); return; }
  if (S.intro) return;
  ovOpen = true; ovKind = kind; ovCur = i; ovTrigger = trigger || null;
  const Dm = maxCorner(x, y);
  ovLock = now + (reduce ? 0.35 : coverTime(Dm) + 0.05);
  fillLayer(kind, i);
  ov.classList.add('open', 'chrome'); ov.removeAttribute('inert'); ov.setAttribute('aria-hidden', 'false');
  pageEl.inert = true;
  setHover(-1); idxPointer = -1; idxFocus = -1; focusWant = 0;
  if (GL) {
    setB(i); ovMesh.visible = true; OU.uFocus.value = 0; OU.uLines.value = 0;
    if (reduce) {
      OU.uMode.value = 0; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; OU.uLines.value = 1;
      tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; }, ease.lin);
    } else {
      OU.uFadeOn.value = 0; startFront(0, x, y);
      tween(0, 1, 1.6, (v) => { OU.uLines.value = v; }, ease.lin, 0.16);
    }
    after(reduce ? 0.32 : coverTime(Dm) + 0.02, () => { if (ovOpen && ovLock < now + 5) stripVisible = false; });
  } else fbShow(i);
  after(reduce ? 0.02 : 0.34, () => { if (ovOpen) ov.classList.add('txt'); });
  after(0.05, () => ov.focus({ preventScroll: true }));
}
function swapLayer(kind, i, x, y) {
  if (!ovOpen || now < ovLock) return;
  const Dm = maxCorner(x, y);
  ovLock = now + (reduce ? 0.35 : coverTime(Dm) + 0.05);
  ovKind = kind; ovCur = i; focusWant = 0;
  const hadNext = D.activeElement && D.activeElement.dataset && D.activeElement.dataset.act === 'next';
  ov.classList.remove('txt');
  if (GL) {
    setAFromCur(); setB(i); OU.uFocus.value = 0;
    if (reduce) { OU.uMode.value = 1; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; }, ease.lin); }
    else startFront(1, x, y);
  } else fbShow(i);
  after(reduce ? 0.04 : 0.3, () => {
    fillLayer(kind, i);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ov.classList.add('txt');
      const nx = ovBody.querySelector('[data-act="next"]');
      if (hadNext && nx) nx.focus({ preventScroll: true });
      else if (!ov.contains(D.activeElement)) ov.focus({ preventScroll: true });
    }));
  });
}
function closeLayer(x, y) {
  if (!ovOpen || now < ovLock) return;
  ovLock = now + 99;
  ov.classList.remove('txt', 'chrome');
  pageEl.inert = false; stripVisible = true; focusWant = 0;
  const done = () => {
    ovOpen = false; ovKind = null; ovLock = 0;
    ov.classList.remove('open'); ov.setAttribute('inert', ''); ov.setAttribute('aria-hidden', 'true');
    if (GL) { ovMesh.visible = false; frontT0 = -1; }
    if (fbFront) { fbFront.classList.remove('on'); fbFront = null; }
    const t = ovTrigger; ovTrigger = null;
    if (t && t.focus && D.contains(t)) t.focus({ preventScroll: true });
    needRender = true;
  };
  if (GL) {
    setAFromCur(); OU.uFocus.value = 0;
    if (reduce) { OU.uMode.value = 2; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; }, ease.lin).then(done); }
    else { startFront(2, x, y); after(coverTime(maxCorner(x, y)) + 0.05, done); }
  } else after(0.62, done);
}
const openProject = (i, x, y, trig) => openLayer('p', i, x, y, trig);
const openAbout = (x, y, trig) => openLayer('about', ABOUT, x, y, trig);
function activateItem(i, x, y, trig) { if (i === ABOUT) openAbout(x, y, trig); else openProject(i, x, y, trig); }

/* ------------------------------------------------------------------ loader */
function setPct(p) {
  pctEl.textContent = String(Math.round(p * 100));
  rays.forEach((r, i) => r.classList.toggle('on', p >= [0.2, 0.52, 0.84][i]));
  disc.setAttribute('cy', (233.45 + (1 - ease.out3(p)) * 112).toFixed(2));
}
async function runLoader() {
  tween(0, 1, 1.3, (v) => { LU.uFade.value = v; }, ease.io3, 0.12);
  let disp = 0;
  const t0 = now;
  await new Promise((res) => {
    const h = (dt) => {
      const tt = now - t0;
      const cap = clamp((tt - 0.3) / 2.2, 0, 1);
      const real = tt > 6.5 ? 1 : nLoaded / NEED;
      const target = Math.min(cap, real);
      disp += (target - disp) * (1 - Math.exp(-dt * 9));
      if (target >= 1 && disp > 0.994) disp = 1;
      setPct(disp);
      if (disp >= 1) { hooks.delete(h); res(); }
    };
    hooks.add(h);
  });
  await wait(0.22);
  ldEl.classList.add('out');
  const r = ldSun.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height * 0.78;
  LU.uDrop.value.set(x, y, now + 0.04, 1); LU.uDropD.value = maxCorner(x, y);
  await wait(0.34);
  await tween(0, 1, 1.05, (v) => { LU.uPanel.value = v; }, ease.io3);
  finishLoader();
}
function finishLoader() {
  loaderActive = false;
  if (GL) loaderMesh.visible = false;
  html.classList.remove('loading');
  html.classList.add('done');
  sizeAll();
  pageIntro();
}
function pageIntro() {
  html.classList.add('in');
  stripVisible = true;
  if (reduce || !GL) { S.intro = false; S.s = S.target = S.prev = 0; html.classList.add('settled'); W.__v8cState = 'ready'; return; }
  const from = -(L.axis ? vw * 1.02 : vh + L.gap * 2);
  S.intro = true; S.s = S.target = S.prev = from;
  tween(from, 0, 1.75, (v) => { S.s = v; S.target = v; }, ease.out4, 0.05).then(() => { S.intro = false; S.target = S.s = 0; });
  after(1.9, () => html.classList.add('settled'));
  W.__v8cState = 'ready';
}
function noGLLoader() {
  const imgs = $$('.strip img');
  let done = 0;
  imgs.forEach((im) => {
    if (im.complete) done++;
    else { im.addEventListener('load', () => done++, { once: true }); im.addEventListener('error', () => done++, { once: true }); }
  });
  let disp = 0;
  const t0 = now;
  const h = (dt) => {
    const tt = now - t0;
    const target = Math.min(clamp((tt - 0.2) / 1.6, 0, 1), tt > 5 ? 1 : done / imgs.length);
    disp += (target - disp) * (1 - Math.exp(-dt * 8));
    if (target >= 1 && disp > 0.99) disp = 1;
    setPct(disp);
    if (disp >= 1) {
      hooks.delete(h);
      after(0.25, () => {
        ldEl.classList.add('out'); loaderEl.classList.add('gone');
        html.classList.remove('loading'); html.classList.add('in');
        loaderActive = false; S.intro = false;
        after(0.9, () => { html.classList.add('done'); W.__v8cState = 'ready'; });
        after(1.9, () => html.classList.add('settled'));
      });
    }
  };
  hooks.add(h);
}

/* ------------------------------------------------------------------ input */
function bindInput() {
  W.addEventListener('wheel', (e) => {
    if (ovOpen || S.intro || !GL) return;
    const k = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? vh : 1;
    if (!mobile) {
      e.preventDefault();
      S.target += (e.deltaY + e.deltaX) * k; idxFocus = -1;
    } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && stripEl.contains(e.target)) {
      e.preventDefault(); S.target += e.deltaX * k;
    }
  }, { passive: false });

  stripEl.addEventListener('pointerdown', (e) => {
    if (!GL || ovOpen || S.intro || e.button > 0) return;
    S.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, v: 0, lt: performance.now(), cap: false };
  });
  stripEl.addEventListener('pointermove', (e) => {
    if (!GL) return;
    const d = S.drag;
    if (d && e.pointerId === d.id) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY;
      d.moved += Math.abs(dx) + Math.abs(dy);
      if (d.moved > 7 && !d.cap) {
        try { stripEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        d.cap = true; stripEl.classList.add('drag'); setHover(-1); idxFocus = -1;
      }
      if (d.cap) {
        const delta = L.axis ? dx : dy;
        S.s -= delta; S.target = S.s;
        const t = performance.now(), idt = Math.max(8, t - d.lt) / 1000;
        d.v = d.v * 0.55 + (-delta / idt) * 0.45; d.lt = t;
      }
      return;
    }
    if (ovOpen || S.intro || e.pointerType === 'touch') return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true;
    const it = itemAt(e.clientX, e.clientY);
    setHover(it ? it.i : -1, e.clientX, e.clientY);
  });
  const endDrag = (e, cancel) => {
    const d = S.drag;
    if (!d || e.pointerId !== d.id) return;
    S.drag = null; stripEl.classList.remove('drag');
    if (cancel) return;
    if (!d.cap) {
      const it = itemAt(e.clientX, e.clientY);
      if (it) activateItem(it.i, e.clientX, e.clientY, null);
    } else if (performance.now() - d.lt < 90) S.target = S.s + clamp(d.v, -7000, 7000) * 0.28;
  };
  stripEl.addEventListener('pointerup', (e) => endDrag(e, false));
  stripEl.addEventListener('pointercancel', (e) => endDrag(e, true));
  stripEl.addEventListener('pointerleave', () => { ptr.in = false; if (!S.drag) setHover(-1); });

  // no-WebGL: cards open the fallback layer
  $$('.strip .card').forEach((c) => c.addEventListener('click', (e) => {
    if (GL || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const i = +c.dataset.item;
    activateItem(i, e.clientX, e.clientY, c);
  }));

  idxLinks.forEach((a, k) => {
    a.addEventListener('pointerenter', (e) => {
      if (S.intro || e.pointerType === 'touch') return;
      idxPointer = k; items[k].r = 0; scrollToItem(k);
    });
    a.addEventListener('pointerleave', () => { idxPointer = -1; });
    a.addEventListener('focus', () => { if (S.intro) return; idxFocus = k; items[k].r = 0; scrollToItem(k); });
    a.addEventListener('blur', () => { idxFocus = -1; });
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const r = a.getBoundingClientRect();
      const kb = e.detail === 0;
      openProject(k, kb ? r.left + r.width / 2 : e.clientX, kb ? r.top + r.height / 2 : e.clientY, a);
    });
  });

  infoBtn.addEventListener('click', (e) => {
    const r = infoBtn.getBoundingClientRect();
    const kb = e.detail === 0;
    openAbout(kb ? r.left + r.width / 2 : e.clientX, kb ? r.top + r.height / 2 : e.clientY, infoBtn);
  });
  let flashT = 0;
  contactBtn.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (!navigator.clipboard || !W.isSecureContext) return; // plain mailto
    e.preventDefault();
    navigator.clipboard.writeText(EMAIL).then(() => {
      copiedEl.textContent = 'Email copied';
      copiedEl.classList.add('on');
      clearTimeout(flashT);
      flashT = setTimeout(() => copiedEl.classList.remove('on'), 1800);
    }).catch(() => { W.location.href = `mailto:${EMAIL}`; });
  });

  ovBody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const kb = e.detail === 0;
    const x = kb ? r.left + r.width / 2 : e.clientX, y = kb ? r.top + r.height / 2 : e.clientY;
    if (b.dataset.act === 'next') swapLayer('p', ovKind === 'p' ? (ovCur + 1) % NP : 0, x, y);
    else if (b.dataset.act === 'work') swapLayer('p', 0, x, y);
  });
  ovBody.addEventListener('pointerover', (e) => { if (e.target.closest('.ov-btn') && ovKind === 'p') focusWant = 1; });
  ovBody.addEventListener('pointerout', (e) => { if (e.target.closest('.ov-btn')) focusWant = 0; });
  ovBody.addEventListener('focusin', (e) => { if (e.target.closest('.ov-btn') && ovKind === 'p') focusWant = 1; });
  ovBody.addEventListener('focusout', () => { focusWant = 0; });
  ovClose.addEventListener('click', (e) => {
    const r = ovClose.getBoundingClientRect();
    closeLayer(r.left + r.width / 2, r.top + r.height / 2);
  });
  let last = { x: -999, y: -999, t: -9 };
  ov.addEventListener('pointermove', (e) => {
    if (!GL || reduce || !ovOpen || e.pointerType === 'touch') return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (now - last.t > 0.12 && dx * dx + dy * dy > 6400) { smallDrop(e.clientX, e.clientY, 0.2); last = { x: e.clientX, y: e.clientY, t: now }; }
  });
  ov.addEventListener('pointerdown', (e) => {
    if (!GL || reduce || !ovOpen || e.target.closest('a, button')) return;
    smallDrop(e.clientX, e.clientY, 0.5);
  });

  W.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ovOpen) { e.preventDefault(); closeLayer(vw / 2, vh / 2); return; }
    if (ovOpen) {
      if (ovKind === 'p' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        swapLayer('p', mod(ovCur + (e.key === 'ArrowRight' ? 1 : -1), NP), vw / 2, vh / 2);
      }
      return;
    }
    if (S.intro || mobile || !GL) return;
    let d = 0;
    if (e.key === 'ArrowDown') d = L.step; else if (e.key === 'ArrowUp') d = -L.step;
    else if (e.key === 'PageDown') d = L.step * 2; else if (e.key === 'PageUp') d = -L.step * 2;
    if (d) { e.preventDefault(); S.target += d; idxFocus = -1; }
  });

  let rsT = 0;
  W.addEventListener('resize', () => { sizeAll(); clearTimeout(rsT); rsT = setTimeout(sizeAll, 120); });
  W.addEventListener('scroll', () => { needRender = true; }, { passive: true });
  RMQ.addEventListener && RMQ.addEventListener('change', (e) => { reduce = e.matches; });
  D.addEventListener('visibilitychange', () => {
    if (D.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
  });
}

/* ------------------------------------------------------------------ loop */
let raf = 0, lastT = performance.now();
function frame(t) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.25, Math.max(0, (t - lastT) / 1000));
  lastT = t;
  if (MANUAL) return;
  tick(dt, true);
}
function tick(dt, draw) {
  now += dt;
  stepTime();
  hooks.forEach((f) => f(dt));
  if (!GL) return;
  updateStrip(dt);
  LU.uTime.value = now; LU.uNow.value = now;
  if (ovMesh.visible) {
    OU.uTime.value = now; OU.uNow.value = now;
    OU.uT.value = frontT0 >= 0 ? now - frontT0 : 0;
    const want = ovKind === 'p' ? focusWant * 0.86 : 0;
    ov.classList.toggle('peek', want > 0);
    OU.uFocus.value += (want - OU.uFocus.value) * (1 - Math.exp(-dt * 5));
    drops.forEach((d, j) => { OU.uDrops.value[j].set(d.x, d.y, d.t0, d.amp); OU.uDropP.value[j].set(d.D, d.k); });
    needRender = true;
  }
  if (loaderActive || tweens.length) needRender = true;
  if (needRender && draw) { renderer.render(scene, cam); needRender = false; }
}
function advance(sec) {
  const n = Math.max(1, Math.round(sec * 60));
  for (let i = 0; i < n; i++) tick(sec / n, i === n - 1);
}

/* ------------------------------------------------------------------ boot */
function boot() {
  if (GL) initGL();
  sizeAll();
  active = -1; setActive(0);
  bindInput();
  W.__v8cState = 'running';
  if (W.__v8cManual) MANUAL = true;
  raf = requestAnimationFrame(frame);
  if (GL) loadTextures();
  if (reduce) {
    loaderActive = false;
    if (GL) loaderMesh.visible = false;
    html.classList.remove('loading'); html.classList.add('done');
    sizeAll(); pageIntro();
  } else if (GL) runLoader();
  else noGLLoader();
  // expose a tiny hook for automated checks
  W.__v8c = { openProject, openAbout, next: () => swapLayer('p', (ovCur + 1) % NP, vw / 2, vh / 2), close: () => closeLayer(vw / 2, vh / 2), S, get open() { return ovOpen; }, get now() { return now; }, get active() { return active; }, manual(on) { MANUAL = !!on; lastT = performance.now(); }, advance };
}
try { boot(); } catch (err) { revealFallback(); }
