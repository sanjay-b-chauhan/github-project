// v8B WebGL world: one fixed canvas, three scenes rendered into their DOM rects.
//   stage  : red volumetric beam, the sunburst mark as a backlit sunrise, long shadows on the floor,
//            a chrome sunburst that assembles over the beam
//   cases  : case-study plates standing in a red low-poly shard field under a red sky
//   foot   : a red-chrome sunburst over the footer gradient
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const SUN_D = [
  'M0.252134 141.854L122.955 212.697C126.245 189.001 138.753 168.254 156.741 154.192L34.0322 83.3457L0.252134 141.854ZM178.395 141.668C188.826 137.445 200.229 135.12 212.175 135.12C224.12 135.12 235.523 137.445 245.955 141.668V2.95315e-06L178.395 0L178.395 141.668ZM267.606 154.189C285.594 168.251 298.102 188.998 301.394 212.694L424.091 141.854L390.311 83.3457L267.606 154.189Z',
  'M0 233.45H424.098V301.009H0V233.45Z'
];
const SC_D = [
  'M265.617 0H726.382V201.231H265.617C239.718 201.231 226.769 210.555 226.769 229.204C226.769 246.35 239.718 254.922 265.617 254.922H482.9C572.944 254.922 639.65 272.368 683.016 307.26C726.683 341.851 748.517 397.498 748.517 474.2C748.517 550.903 726.683 606.549 683.016 641.141C639.65 675.732 572.944 693.027 482.9 693.027H22.1348V491.797H482.9C508.799 491.797 521.748 482.472 521.748 463.823C521.748 446.678 508.799 438.105 482.9 438.105H265.617C175.572 438.105 108.716 420.81 65.0491 386.218C21.683 351.326 0 295.529 0 218.827C0 142.125 21.683 86.478 65.0491 51.8868C108.716 17.2956 175.572 0 265.617 0Z',
  'M1478.78 0V201.231H1084.88C1018.62 201.231 985.494 224.392 985.494 270.714V422.314C985.494 468.636 1018.62 491.797 1084.88 491.797H1478.78V693.027H1084.88C974.352 693.027 892.287 671.671 838.682 628.959C785.077 586.246 758.274 517.364 758.274 422.314V270.714C758.274 175.663 785.077 106.782 838.682 64.069C892.287 21.3563 974.352 0 1084.88 0H1478.78Z'
];
const SUN_W = 424.098, SUN_H = 301.009, SUN_CX = 212.175, SUN_CY = 233.45;

export const PLATES = [
  { n: '01', a: '2026.', t: 'ZERO Job Portal', kind: 'Web app', line: 'An agent that job-hunts for you, and asks before every move.', img: 'assets/img/portal.jpg', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-job-portal.html', cw: 'red' },
  { n: '02', a: '2025.', t: 'ZERO Workspace', kind: 'Web app', line: 'Real job scenarios, with an AI manager beside you.', img: 'assets/img/scenario.jpg', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-independent-scenario.html', cw: 'cream' },
  { n: '03', a: '2026.', t: 'Curio', kind: 'Films', line: 'Explainer films you can talk back to.', img: 'assets/img/curio.jpg', url: 'https://sanjay-curio.vercel.app/', cw: 'black' },
  { n: '04', a: '2026.', t: 'anyo', kind: 'iOS app', line: 'Close friends, no texting. Video and voice only.', img: 'assets/img/anyo.jpg', url: 'https://getanyo.vercel.app/', cw: 'red' },
  { n: '05', a: 'Tool.', t: 'Stack FX', kind: 'Tool', line: 'A card dealer for motion studies.', img: 'assets/img/stack.jpg', url: 'https://sanjay-trace-fx.vercel.app/stack', cw: 'cream' },
  { n: '06', a: 'WebGL site.', t: 'Signal', kind: 'WebGL', line: 'A portfolio built on live shaders.', img: 'assets/img/signal.jpg', url: 'https://sanjay-b-chauhan.github.io/github-project/portfolio-v4/', cw: 'black' },
  { n: '07', a: 'Prototype.', t: 'Voice-first onboarding', kind: 'Prototype', line: 'Talk, and the profile builds itself.', img: 'assets/img/onboard.jpg', url: 'https://sanjay-b-chauhan.github.io/github-project/zero-onboarding-flow.html', cw: 'red' }
];
const CW = {
  red:   { bg: '#FF0101', a: '#8A0000', b: '#FFFDE2', s: '#5c0000' },
  cream: { bg: '#FFFDE2', a: '#FF0101', b: '#0B0B0B', s: '#6d6a5a' },
  black: { bg: '#0F0F0F', a: '#FF0101', b: '#FFFDE2', s: '#8e8a7a' }
};

const NOISE = /* glsl */`
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
`;
const VS_UV = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut3 = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ───────── sunburst geometry ───────── */
function sunPieces() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SUN_W} ${SUN_H}"><path d="${SUN_D[0]}"/><path d="${SUN_D[1]}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const out = [];
  data.paths.forEach(path => {
    SVGLoader.createShapes(path).forEach(shape => {
      const ex = shape.extractPoints(24);
      const flip = pts => pts.map(v => new THREE.Vector2(v.x - SUN_CX, SUN_CY - v.y));
      const s = new THREE.Shape(flip(ex.shape));
      ex.holes.forEach(h => s.holes.push(new THREE.Path(flip(h))));
      let cx = 0, cy = 0; ex.shape.forEach(v => { cx += v.x; cy += v.y; }); cx /= ex.shape.length; cy /= ex.shape.length;
      out.push({ shape: s, cx, cy });
    });
  });
  const bar = out.find(p => p.cy > 225);
  const rays = out.filter(p => p !== bar).sort((a, b) => a.cx - b.cx);
  return { left: rays[0], center: rays[1], right: rays[2], bar };
}
function extrude(shape, scale, o) {
  let g = new THREE.ExtrudeGeometry(shape, {
    depth: o.depth, bevelEnabled: o.bevel > 0, bevelThickness: o.bevelT || o.bevel, bevelSize: o.bevel,
    bevelOffset: o.bevel > 0 ? -o.bevel : 0, bevelSegments: o.seg || 1, curveSegments: 24, steps: 1
  });
  g.translate(0, 0, -o.depth / 2);
  g.scale(scale, scale, scale);
  if (o.crease) g = toCreasedNormals(g, o.crease);
  g.computeBoundingBox();
  return g;
}
function sunMaskCanvas(w = 512) {
  const h = Math.round(w * SUN_H / SUN_W);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.scale(w / SUN_W, h / SUN_H); g.fillStyle = '#fff';
  SUN_D.forEach(d => g.fill(new Path2D(d), 'evenodd'));
  return c;
}

/* ───────── environment for chrome ───────── */
function makeEnv(renderer) {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float az = atan(d.x, d.z);
        vec3 c = vec3(0.);
        c += vec3(1.,.97,.9) * smoothstep(.70,.80,d.y) * 3.2;                                          // overhead softbox
        float band = smoothstep(-.15,.25,d.y) * (1.-smoothstep(.55,.7,d.y));
        c += vec3(1.,.98,.95) * exp(-pow((az-.52)*16.,2.)) * band * 2.6;                               // thin white strip, right
        c += vec3(1.,.98,.95) * exp(-pow((az+.9)*20.,2.)) * band * 1.8;                                 // thin white strip, left
        c += vec3(1.,.04,.02) * exp(-pow((abs(az)-1.7)*3.2,2.)) * smoothstep(-.4,.3,d.y) * 2.6;       // red beams, sides
        c += vec3(1.,.03,.01) * exp(-pow((abs(az)-3.1416)*2.4,2.)) * 3.2;                              // the beam behind
        c += vec3(.30,.0,.0) * exp(-pow(d.y*3.2,2.));                                                   // red horizon haze
        c += vec3(.85,.02,.01) * smoothstep(-.08,-.55,d.y) * .8;                                        // red floor pool
        gl_FragColor = vec4(c,1.); }`
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 64, 32), mat));
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(scene, 0.035);
  pm.dispose(); mat.dispose();
  return rt.texture;
}

/* ───────── plate texture ───────── */
function wrapLines(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function drawPlate(d, img) {
  const W = 1024, H = 1280, M = 80, C = CW[d.cw];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const sh = g.createLinearGradient(0, 0, W, H); sh.addColorStop(0, 'rgba(255,255,255,.07)'); sh.addColorStop(.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.10)');
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  // SC mark
  g.save(); g.translate(M, M); const s = 150 / 1478.78; g.scale(s, s); g.fillStyle = C.b; SC_D.forEach(p => g.fill(new Path2D(p))); g.restore();
  // number, top right
  g.fillStyle = C.a; g.textAlign = 'right'; g.font = '400 26px Telgra'; g.fillText('NO. ' + d.n, W - M, M + 44); g.textAlign = 'left';
  // headline block
  let y = 300;
  g.fillStyle = C.a; g.font = '700 84px Archivo';
  g.fillText('Case No. ' + d.n + '.', M - 4, y); y += 90;
  g.fillText(d.a, M - 4, y); y += 96;
  g.fillStyle = C.b; g.font = '400 70px Telgra';
  const tl = wrapLines(g, d.t.toUpperCase() + '.', W - 2 * M);
  tl.forEach(l => { g.fillText(l, M - 2, y); y += 78; });
  g.font = '600 32px Archivo'; g.fillText('By Sanjay Chauhan', M, y - 12); y += 34;
  // screenshot window
  const iy = Math.max(y + 18, 646), ih = 1062 - iy, iw = W - 2 * M;
  if (img && img.naturalWidth) {
    const r = iw / ih, ir = img.naturalWidth / img.naturalHeight;
    let sw, shh, sx, sy;
    if (ir > r) { shh = img.naturalHeight; sw = shh * r; sx = (img.naturalWidth - sw) / 2; sy = 0; } else { sw = img.naturalWidth; shh = sw / r; sx = 0; sy = 0; }
    g.drawImage(img, sx, sy, sw, shh, M, iy, iw, ih);
  } else { g.fillStyle = C.a; g.globalAlpha = .2; g.fillRect(M, iy, iw, ih); g.globalAlpha = 1; }
  g.strokeStyle = C.b; g.lineWidth = 3; g.strokeRect(M + 1.5, iy + 1.5, iw - 3, ih - 3);
  // footer: SCD. selected   +   one-liner
  g.font = '400 30px Telgra'; g.fillStyle = C.b; g.fillText('SCD.', M, H - M - 8);
  const sw2 = g.measureText('SCD. ').width; g.font = '600 30px Archivo'; g.fillStyle = C.a; g.fillText('selected', M + sw2, H - M - 8);
  g.font = '500 25px Archivo'; g.fillStyle = C.b; g.textAlign = 'right';
  const ll = wrapLines(g, d.line, 400); let ly = H - M - 8 - (ll.length - 1) * 31;
  ll.forEach(l => { g.fillText(l, W - M - 58, ly); ly += 31; });
  g.textAlign = 'left';
  // vertical label
  g.save(); g.translate(W - M + 10, H - M - 150); g.rotate(Math.PI / 2); g.fillStyle = C.b; g.fillRect(-64, -12, 44, 3);
  g.font = '400 20px Telgra'; g.fillText(d.kind.toUpperCase(), 0, -3); g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}
function loadImg(src) { return new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }

/* ═════════════════════════════════════════════════════════ */
export async function createWorld({ canvas, stageEl, casesEl, footEl, mobile }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const size = () => renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
  size();

  const env = makeEnv(renderer);
  const P = sunPieces();
  const t0 = performance.now();

  /* ════════ STAGE ════════ */
  const stage = new THREE.Scene();
  stage.background = new THREE.Color(0x000000);
  const stageCam = new THREE.PerspectiveCamera(32, 1, .1, 400);
  const U = { uTime: { value: 0 }, uAmp: { value: 0 }, uGrow: { value: 0 } };

  // haze backdrop
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(220, 110), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: NOISE + `uniform float uTime, uAmp; varying vec2 vUv;
      void main(){ float x=(vUv.x-.5)*220., y=vUv.y*110.;
        float hz = exp(-x*x/(2.*16.*16.));
        float st = fbm(vec2(x*.55, y*.018 - uTime*.02));
        float st2 = fbm(vec2(x*2.2+4., y*.01));
        float hz2 = exp(-x*x/(2.*9.*9.));
        vec3 c = vec3(.075,0.,0.)*hz*(.25+.9*st) + vec3(.11,0.,0.)*hz2*(.3+.8*st) + vec3(.012,0.,0.)*st2*smoothstep(6.,40.,y);
        c *= smoothstep(14., 32., y);
        gl_FragColor = vec4(c*uAmp,1.); }`
  }));
  haze.position.set(0, 42, -14);
  stage.add(haze);

  // beam
  const BW = 26, BH = 74;
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: NOISE + `uniform float uTime, uAmp, uGrow; varying vec2 vUv;
      void main(){
        float x=(vUv.x-.5)*${BW}.0, y=vUv.y*${BH}.0;
        float w = .46 + y*.009;
        float core = exp(-x*x/(2.*w*w));
        float wg = 1.7 + y*.03;
        float glow = exp(-x*x/(2.*wg*wg));
        float wide = exp(-x*x/(2.*5.5*5.5));
        float s1 = fbm(vec2(x*2.4, y*.05 - uTime*.12));
        float s2 = fbm(vec2(x*6.5+3., y*.022 - uTime*.05));
        float streak = .3 + 1.15*s1 + .35*s2;
        float grow = 1. - smoothstep(uGrow - 10., uGrow, y);
        float base = smoothstep(0., 1.2, y);
        float prof = .72 + .55*exp(-y*.10) + .3*smoothstep(18.,40.,y)*(1.-smoothstep(50.,${BH}.0,y));
        prof *= 1. - smoothstep(${BH - 12}.0, ${BH}.0, y);
        float I = (core*1.05 + glow*.34 + wide*.035) * streak * prof * grow * base * uAmp;
        vec3 c = vec3(.92,.018,.01)*I + vec3(1.,.30,.16)*pow(core,6.)*.26*streak*grow*base*uAmp;
        gl_FragColor = vec4(c,1.); }`
  }));
  beam.position.set(0, BH / 2 + .35, -.9);
  stage.add(beam);

  // floor with pool of light and the long shadow of the mark
  const maskTex = new THREE.CanvasTexture(sunMaskCanvas(512));
  const BASE_W = 3.0, BASE_S = BASE_W / SUN_W, BASE_H = SUN_H * BASE_S, PIVOT_Y = (SUN_H - SUN_CY) * BASE_S;
  const floorU = { ...U, uMask: { value: maskTex }, uFloor: { value: 0 } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShaderMaterial({
    uniforms: floorU,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform sampler2D uMask; uniform float uAmp, uTime, uFloor; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec2 p = vW.xz;
        float pool = exp(-(p.x*p.x)/(2.*3.4*3.4) - (p.y*p.y)/(2.*2.2*2.2));
        float hot  = exp(-(p.x*p.x)/(2.*1.05*1.05) - (p.y*p.y)/(2.*.75*.75));
        float wl = 1.5 + max(p.y,0.)*.16;
        float lane = exp(-(p.x*p.x)/(2.*wl*wl)) * exp(-max(p.y,0.)*.13) * smoothstep(-.6,.6,p.y);
        float far  = exp(-(p.x*p.x)/(2.*9.*9.) - (p.y*p.y)/(2.*6.*6.));
        float sh = 0.;
        if (p.y > 0.) {
          float L = 3.5;
          float hh = p.y / L;
          float xm = p.x / (1. + p.y*.05);
          vec2 uv = vec2(xm/${BASE_W.toFixed(3)} + .5, hh/${BASE_H.toFixed(4)});
          float bl = .002 + p.y*.0016;
          float m = 0.;
          for (int i=-2;i<=2;i++) m += texture2D(uMask, uv + vec2(float(i)*bl, 0.)).a;
          m *= .2;
          sh = m * step(0.,uv.x) * step(uv.x,1.) * step(0.,uv.y) * step(uv.y,1.);
        }
        float light = (pool*.62 + hot*1.1 + lane*.55 + far*.035) * uFloor * (.35 + .65*exp(-length(p)*.09));
        light *= 1. - sh*.93;
        float gr = h(floor(p*52.));
        float gr2 = h(floor(p*9.)+3.1);
        vec3 c = vec3(.84,.018,.01)*light*(.9+.14*gr)*(.94+.12*gr2) + vec3(1.,.36,.2)*hot*hot*.3*uFloor*(1.-sh);
        gl_FragColor = vec4(c,1.); }`
  }));
  floor.rotation.x = -Math.PI / 2;
  stage.add(floor);

  // the sunrise: backlit sunburst silhouette with a sun disc rising behind the bar
  const base = new THREE.Group();
  base.position.set(0, PIVOT_Y, 0);
  const silMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  ['left', 'center', 'right', 'bar'].forEach(k => base.add(new THREE.Mesh(extrude(P[k].shape, BASE_S, { depth: 10, bevel: 0 }), silMat)));
  stage.add(base);
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShaderMaterial({
    uniforms: { uAmp: U.uAmp, uTime: U.uTime, uRise: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: `uniform float uAmp, uTime, uRise; varying vec2 vUv;
      void main(){ vec2 p=(vUv-.5)*5.; float r=length(p);
        float R=.56;
        float disc = smoothstep(R, R-.025, r);
        float corona = exp(-pow(max(r-R*.55,0.)/.5,1.25));
        float halo = exp(-r*r/(2.*1.25*1.25));
        vec3 core = mix(vec3(1.,.98,.9), vec3(1.,.34,.12), smoothstep(0.,R,r));
        float fl = .94 + .06*sin(uTime*2.3);
        float edge = smoothstep(2.5, 1.5, r);
        vec3 c = core*disc*1.35 + vec3(1.,.07,.03)*(corona*.95 + halo*.55)*fl*edge;
        gl_FragColor = vec4(c*uRise, 1.); }`
  }));
  sun.position.set(0, PIVOT_Y, -.12);
  stage.add(sun);

  // dust drifting up the beam
  const DN = mobile ? 220 : 420, rnd = rng(7);
  const dPos = new Float32Array(DN * 3), dSeed = new Float32Array(DN);
  for (let i = 0; i < DN; i++) {
    const g = (rnd() + rnd() + rnd() - 1.5) * 1.6;
    dPos[i * 3] = g; dPos[i * 3 + 1] = rnd() * 30; dPos[i * 3 + 2] = (rnd() - .5) * 3 - .4; dSeed[i] = rnd();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustU = { ...U, uPx: { value: DPR } };
  const dust = new THREE.Points(dGeo, new THREE.ShaderMaterial({
    uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime, uAmp, uPx; attribute float aSeed; varying float vA;
      void main(){ vec3 p=position; p.y = mod(p.y + uTime*(.18+aSeed*.32), 30.); p.x += sin(uTime*.35+aSeed*23.)*.18;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        gl_PointSize = uPx*(1.2+aSeed*2.6)*(26./-mv.z);
        vA = exp(-p.x*p.x/1.6)*(.3+.7*(.5+.5*sin(uTime*1.7+aSeed*40.)))*uAmp*smoothstep(0.,2.,p.y)*(1.-smoothstep(22.,30.,p.y)); }`,
    fragmentShader: `varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vec3(1.,.22,.1)*a*vA*.9,1.); }`
  }));
  stage.add(dust);

  // the chrome sunburst over the beam
  const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: .1, envMap: env, envMapIntensity: 1.15, clearcoat: .35, clearcoatRoughness: .06 });
  const liquid = (mat, amt) => {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uTime = U.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vObj; uniform float uTime;
        float lh(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        float ln3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(mix(lh(i),lh(i+vec3(1,0,0)),f.x), mix(lh(i+vec3(0,1,0)),lh(i+vec3(1,1,0)),f.x), f.y),
                     mix(mix(lh(i+vec3(0,0,1)),lh(i+vec3(1,0,1)),f.x), mix(lh(i+vec3(0,1,1)),lh(i+vec3(1,1,1)),f.x), f.y), f.z)*2.-1.; }`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 q = vObj*.62 + vec3(0.,uTime*.12,uTime*.2);
          vec3 pn = vec3(ln3(q), ln3(q+vec3(7.1,3.3,1.7)), 0.);
          normal = normalize(normal + pn*${amt.toFixed(3)}); }`);
    };
  };
  liquid(chromeMat, .2);
  const CH_S = 8.0 / SUN_W;
  const chromeOpts = { depth: 10, bevel: 13, bevelT: 11, seg: 8, crease: .75 };
  const chromeGeo = {};
  ['left', 'center', 'right', 'bar'].forEach(k => { chromeGeo[k] = extrude(P[k].shape, CH_S, chromeOpts); });
  const orn = new THREE.Group();
  const ornPieces = {};
  ['left', 'center', 'right', 'bar'].forEach(k => { const m = new THREE.Mesh(chromeGeo[k], chromeMat); ornPieces[k] = m; orn.add(m); });
  const FLY = {
    left:   { p: [-17, 3.5, 5], r: [.6, -1.6, .9] },
    right:  { p: [17, 3.5, 5], r: [.6, 1.6, -.9] },
    center: { p: [0, 15, 3], r: [1.4, .3, 0] },
    bar:    { p: [0, -9, 6], r: [-1.2, 0, .25] }
  };
  const ornWrap = new THREE.Group(); ornWrap.add(orn);
  ornWrap.position.set(0, 7.0, 5);
  stage.add(ornWrap);

  /* ════════ FOOTER ════════ */
  const foot = new THREE.Scene();
  const footCam = new THREE.PerspectiveCamera(30, 1, .1, 200);
  const redChrome = new THREE.MeshPhysicalMaterial({ color: 0xff4436, metalness: 1, roughness: .14, envMap: env, envMapIntensity: 1.45, clearcoat: 1, clearcoatRoughness: .035 });
  liquid(redChrome, .24);
  const fOrn = new THREE.Group();
  ['left', 'center', 'right', 'bar'].forEach(k => fOrn.add(new THREE.Mesh(chromeGeo[k], redChrome)));
  const fWrap = new THREE.Group(); fWrap.add(fOrn); foot.add(fWrap);

  /* ════════ CASES (built lazily) ════════ */
  let cases = null;
  async function buildCases() {
    if (cases) return cases;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, .1, 300);
    // sky
    const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 512;
    const sg = sc.getContext('2d');
    let lg = sg.createLinearGradient(0, 0, 1024, 0);
    lg.addColorStop(0, '#9a0000'); lg.addColorStop(.3, '#650000'); lg.addColorStop(.62, '#220404'); lg.addColorStop(1, '#0c0a0a');
    sg.fillStyle = lg; sg.fillRect(0, 0, 1024, 512);
    let vg = sg.createLinearGradient(0, 0, 0, 512); vg.addColorStop(0, 'rgba(0,0,0,.5)'); vg.addColorStop(.5, 'rgba(0,0,0,.05)'); vg.addColorStop(.75, 'rgba(60,0,0,.15)'); vg.addColorStop(1, 'rgba(0,0,0,.2)');
    sg.fillStyle = vg; sg.fillRect(0, 0, 1024, 512);
    let rg = sg.createRadialGradient(0, 300, 0, 0, 300, 640); rg.addColorStop(0, 'rgba(230,10,0,.55)'); rg.addColorStop(1, 'rgba(200,0,0,0)');
    sg.fillStyle = rg; sg.fillRect(0, 0, 1024, 512);
    const skyTex = new THREE.CanvasTexture(sc); skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
    const res = new THREE.Vector2(1, 1);
    const FOG = { uRes: { value: res }, uFogA: { value: new THREE.Color(.36, .0, .0) }, uFogB: { value: new THREE.Color(.05, .015, .015) } };

    // shard field
    const R = rng(11), Wd = 150, Dp = 200, cell = mobile ? 1.9 : 1.55;
    const nx = Math.ceil(Wd / cell), nz = Math.ceil(Dp / cell), Z0 = 24;
    const grid = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const jx = (i > 0 && i < nx) ? (R() - .5) * cell * .85 : 0, jz = (j > 0 && j < nz) ? (R() - .5) * cell * .85 : 0;
      grid.push([-Wd / 2 + i * cell + jx, Z0 - j * cell + jz]);
    }
    const pos = [], bar = [];
    const B = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const tri = (a, b, c) => {
      const lift = (R() * .32) + (Math.sin(a[0] * .21) + Math.cos(a[1] * .17)) * .08;
      const vs = [a, b, c].map(v => [v[0], lift + (R() - .5) * .42, v[1]]);
      const offPath = Math.abs(a[0]) > 6.5 || a[1] > 12;
      if (R() < (offPath ? .03 : .006)) { const k = Math.floor(R() * 3); vs[k][1] += (offPath ? .6 : .3) + R() * (offPath ? 1.3 : .5); }
      vs.forEach((v, k) => { pos.push(v[0], v[1], v[2]); bar.push(...B[k]); });
    };
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = grid[j * (nx + 1) + i], b = grid[j * (nx + 1) + i + 1], c = grid[(j + 1) * (nx + 1) + i], d = grid[(j + 1) * (nx + 1) + i + 1];
      if (R() < .5) { tri(a, b, d); tri(a, d, c); } else { tri(a, b, c); tri(b, d, c); }
    }
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    tg.setAttribute('bary', new THREE.Float32BufferAttribute(bar, 3));
    const terrain = new THREE.Mesh(tg, new THREE.ShaderMaterial({
      uniforms: { ...FOG, uLight: { value: new THREE.Vector3(-.62, .5, -.6).normalize() } },
      side: THREE.DoubleSide,
      vertexShader: `attribute vec3 bary; varying vec3 vB; varying vec3 vW; varying float vDepth;
        void main(){ vB=bary; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mv=viewMatrix*w; vDepth=-mv.z; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uLight, uFogA, uFogB; uniform vec2 uRes; varying vec3 vB; varying vec3 vW; varying float vDepth;
        void main(){
          vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if (n.y < 0.) n = -n;
          float lam = max(dot(n, uLight), 0.);
          vec3 v = normalize(vW - cameraPosition);
          vec3 r = reflect(v, n);
          float sky = pow(max(dot(r, normalize(vec3(-.75,.28,-.6))),0.), 6.);
          vec3 c = vec3(.012,.0,.0) + vec3(.6,.02,.015)*pow(lam,3.)*.95 + vec3(.95,.04,.02)*sky*.95;
          float e = min(min(vB.x,vB.y),vB.z);
          float fw = fwidth(e);
          float line = 1. - smoothstep(fw*.4, fw*1.6, e);
          c += vec3(1.,.3,.08)*line*.85*exp(-vDepth*.03);
          vec2 sp = gl_FragCoord.xy/uRes;
          vec3 fogC = mix(uFogA, uFogB, smoothstep(0.,.85,sp.x));
          c = mix(c, fogC, smoothstep(16., 88., vDepth));
          gl_FragColor = vec4(c,1.); }`
    }));
    scene.add(terrain);
    const under = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    under.rotation.x = -Math.PI / 2; under.position.y = -.3; scene.add(under);

    // plates
    try { await Promise.all([document.fonts.load('70px Telgra'), document.fonts.load('700 84px Archivo'), document.fonts.load('600 32px Archivo'), document.fonts.load('500 25px Archivo')]); } catch (e) { }
    const imgs = await Promise.all(PLATES.map(p => loadImg(p.img)));
    const PW = 3.4, PH = 4.25, SP = 15;
    const X = [.9, -2.3, 2.3, -2.3, 2.3, -2.3, .9];
    const plates = [];
    const plateGeo = new THREE.BoxGeometry(PW, PH, .045);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x1a0000 });
    PLATES.forEach((d, i) => {
      const map = drawPlate(d, imgs[i]);
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const front = new THREE.ShaderMaterial({
        uniforms: { ...FOG, uMap: { value: map }, uHover: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying float vDepth; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vDepth=-mv.z; gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `uniform sampler2D uMap; uniform float uHover; uniform vec3 uFogA, uFogB; uniform vec2 uRes; varying vec2 vUv; varying float vDepth;
          void main(){ vec3 c = texture2D(uMap, vUv).rgb;
            c *= .84 + .2*vUv.y + uHover*.08;
            c = mix(c, c*vec3(1.,.55,.5), (1.-smoothstep(0.,.18,vUv.y))*.35);
            vec2 sp = gl_FragCoord.xy/uRes; vec3 fogC = mix(uFogA, uFogB, smoothstep(0.,.85,sp.x));
            gl_FragColor = vec4(mix(c, fogC, smoothstep(22., 80., vDepth)), 1.); }`
      });
      const mesh = new THREE.Mesh(plateGeo, [edgeMat, edgeMat, edgeMat, edgeMat, front, edgeMat]);
      const grp = new THREE.Group(); grp.add(mesh);
      const z = -i * SP;
      grp.position.set(X[i], PH / 2 - .12, z);
      grp.userData = { i, x: X[i], z, tilt: (R() - .5) * .07, ry: -X[i] * .05, hover: 0 };
      mesh.userData.i = i;
      scene.add(grp);
      plates.push({ grp, mesh, mat: front });
    });
    cases = { scene, cam, plates, X, FOG, res, raycaster: new THREE.Raycaster(), hovered: -1 };
    return cases;
  }

  /* ════════ views ════════ */
  const views = [
    { key: 'stage', el: stageEl, scene: stage, cam: stageCam, on: true },
    { key: 'cases', el: casesEl, scene: null, cam: null, on: false },
    { key: 'foot', el: footEl, scene: foot, cam: footCam, on: true }
  ];

  const state = { t: 0, intro: 0, stageP: 0, casesQ: 0, casesOpen: 0, casesU: 0, footP: 0, mx: 0, my: 0, smx: 0, smy: 0, vel: 0 };
  const tmpV = new THREE.Vector3();

  function updateStage(dt) {
    const p = state.stageP, t = state.t;
    const intro = state.intro;
    U.uTime.value = t;
    // sunrise first (the sun glows and climbs over the bar, the floor warms), then the beam shoots up
    const rise = easeOut3(clamp(intro / .55));
    sun.material.uniforms.uRise.value = sstep(0, .3, intro);
    sun.position.y = PIVOT_Y - .85 * (1 - rise);
    floorU.uFloor.value = sstep(.04, .5, intro);
    U.uAmp.value = sstep(.22, .62, intro);
    U.uGrow.value = lerp(0, BH + 12, easeInOut(clamp((intro - .24) / .58)));

    // camera: hero -> slow dolly through the steps -> tilt down to the floor
    const aspect = stageCam.aspect;
    const portrait = aspect < 1;
    stageCam.fov = portrait ? 46 : 32;
    const f = easeInOut(sstep(.79, .96, p));
    const m = sstep(0, .79, p);
    const hx = 0, hy = lerp(3.0, 3.7, m), hz = lerp(portrait ? 33 : 30, portrait ? 30 : 27, m);
    const lx = 0, ly = lerp(portrait ? 8.4 : 7.6, portrait ? 9.2 : 8.5, m), lz = 0;
    const fx = 0, fy = portrait ? 12.5 : 9.0, fz = portrait ? 23 : 19.5;
    const flx = 0, fly = 0, flz = portrait ? 5.8 : 4.8;
    stageCam.position.set(lerp(hx, fx, f) + state.smx * .7, lerp(hy, fy, f) - state.smy * .35, lerp(hz, fz, f));
    tmpV.set(lerp(lx, flx, f) + state.smx * .25, lerp(ly, fly, f) - state.smy * .15, lerp(lz, flz, f));
    stageCam.lookAt(tmpV);
    stageCam.updateProjectionMatrix();

    // chrome assembly (scroll) + slow spin
    const a = clamp((p - .045) / .15) * (1 - sstep(.79, .9, p));
    const pieces = ['left', 'right', 'center', 'bar'];
    pieces.forEach((k, idx) => {
      const local = easeOut3(clamp((a - idx * .08) / .72));
      const fl = FLY[k], mesh = ornPieces[k];
      const inv = 1 - local;
      mesh.position.set(fl.p[0] * inv, fl.p[1] * inv, fl.p[2] * inv);
      mesh.rotation.set(fl.r[0] * inv, fl.r[1] * inv, fl.r[2] * inv);
      mesh.visible = local > .001;
    });
    const fitW = portrait ? Math.min(1, (2 * 26 * Math.tan(THREE.MathUtils.degToRad(stageCam.fov / 2)) * aspect * .64) / 8.0) : 1;
    ornWrap.scale.setScalar(fitW);
    ornWrap.position.y = (portrait ? 11.2 : 7.0) + Math.sin(t * .8) * .12;
    const spin = sstep(.18, .79, p) * Math.PI * 2 * 1.25;
    orn.rotation.y = spin + Math.sin(t * .5) * .16 + state.smx * .28;
    orn.rotation.x = Math.sin(t * .4) * .05 - state.smy * .12 + (1 - a) * .2;
  }

  function updateCases() {
    if (!cases) return;
    const q = state.casesQ, t = state.t;
    const N = PLATES.length;
    const s = clamp((q - .12) / .76);
    const u = s * (N - 1);
    state.casesU = u;
    const i0 = Math.min(N - 1, Math.floor(u)), i1 = Math.min(N - 1, i0 + 1), fr = u - i0;
    const e = easeInOut(fr);
    const aspect = cases.cam.aspect;
    const needW = 3.4 / (aspect < 1 ? .64 : .72), D0 = 9.4, SP = 15;
    const D = Math.max(D0, needW / (2 * Math.tan(THREE.MathUtils.degToRad(cases.cam.fov / 2)) * aspect));
    const X = cases.X;
    const ez = fr * fr * fr * (fr * (fr * 6 - 15) + 10);
    const zc = lerp(-i0 * SP, -i1 * SP, ez);
    const xs = aspect < 1 ? .55 : 1;
    const xc = lerp(X[i0], X[i1], easeInOut(clamp(fr * 1.15 - .05))) * .9 * xs;
    const pull = (1 - sstep(.04, .16, q)) * 5 + sstep(.88, .99, q) * 3;
    cases.cam.position.set(xc + state.smx * .45, 2.05 + Math.sin(t * .6) * .04 - state.smy * .18 + pull * .12, zc + D + pull);
    tmpV.set(xc + (X[i1] - X[i0]) * .08 * Math.sin(Math.PI * fr) + state.smx * .15, 2.0, zc - 4);
    cases.cam.lookAt(tmpV);
    const cp = cases.cam.position;
    cases.plates.forEach(({ grp, mat }, i) => {
      const ud = grp.userData;
      const rel = u - i;
      const hv = (ud.hover = lerp(ud.hover, cases.hovered === i ? 1 : 0, .12));
      mat.uniforms.uHover.value = hv;
      // a featured plate drifts aside and turns away once the camera moves on
      const side = i === 0 ? -Math.sign(X[1]) : (Math.sign(X[i]) || 1);
      const out = sstep(.22, 1.05, rel);
      const px = X[i] * xs + side * out * (aspect < 1 ? 4.2 : 5.8);
      grp.position.x = px;
      const face = Math.atan2(cp.x - px, Math.max(1.5, cp.z - ud.z));
      grp.rotation.y = face * .55 + side * out * .95 + Math.sin(t * .55 + i * 1.7) * .05;
      grp.rotation.z = ud.tilt + Math.sin(t * .42 + i) * .018;
      grp.rotation.x = Math.sin(t * .35 + i * 2.1) * .015;
      grp.position.y = 4.25 / 2 - .12 + hv * .14 + Math.sin(t * .7 + i) * .03 - out * .5;
      grp.rotation.z += side * out * .06;
    });
  }

  function updateFoot() {
    const t = state.t, fp = state.footP;
    footCam.fov = footCam.aspect < 1 ? 44 : 30;
    footCam.position.set(state.smx * .6, .4 - state.smy * .3, 26);
    footCam.lookAt(0, .9, 0);
    footCam.updateProjectionMatrix();
    const k = easeOut3(clamp(fp));
    const portrait = footCam.aspect < 1;
    fWrap.scale.setScalar((portrait ? .78 : 1.14) * (.82 + .18 * k));
    fWrap.position.y = lerp(-6, .2, k) + Math.sin(t * .7) * .12;
    fOrn.rotation.y = (1 - k) * 2.4 + Math.sin(t * .42) * .42 + state.smx * .3;
    fOrn.rotation.x = .12 + Math.sin(t * .33) * .05 - state.smy * .1;
  }

  let lastDrew = 1;
  function render() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const vis = [];
    for (const v of views) {
      if (!v.on || !v.scene) continue;
      const r = v.el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= H || r.width < 2) continue;
      vis.push([v, r]);
    }
    if (!vis.length && !lastDrew) return 0;     // nothing on screen and the canvas is already clear
    renderer.setScissorTest(false);
    renderer.clear(true, true, true);
    renderer.setScissorTest(true);
    let drew = 0;
    for (const [v, r] of vis) {
      const top = Math.max(0, r.top), bot = Math.min(H, r.bottom);
      renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
      renderer.setScissor(r.left, H - bot, r.width, bot - top);
      const asp = r.width / r.height;
      if (Math.abs(v.cam.aspect - asp) > 1e-4) { v.cam.aspect = asp; v.cam.updateProjectionMatrix(); }
      if (v.key === 'cases') cases.res.set(W * DPR, H * DPR);
      renderer.render(v.scene, v.cam);
      drew++;
    }
    lastDrew = drew;
    return drew;
  }

  function frame(now) {
    const dt = Math.min(.05, (now - (frame.last || now)) / 1000); frame.last = now;
    state.t = (now - t0) / 1000;
    state.smx = lerp(state.smx, state.mx, .06); state.smy = lerp(state.smy, state.my, .06);
    const casesView = views[1];
    casesView.on = !!cases && state.casesOpen > .002;
    if (cases) { casesView.scene = cases.scene; casesView.cam = cases.cam; }
    updateStage(dt);
    if (casesView.on) updateCases();
    updateFoot();
    return render();
  }

  function pick(clientX, clientY) {
    if (!cases || state.casesOpen < .6) { if (cases) cases.hovered = -1; return -1; }
    const r = casesEl.getBoundingClientRect();
    const nx = ((clientX - r.left) / r.width) * 2 - 1, ny = -((clientY - r.top) / r.height) * 2 + 1;
    cases.raycaster.setFromCamera({ x: nx, y: ny }, cases.cam);
    const hit = cases.raycaster.intersectObjects(cases.plates.map(p => p.mesh), false)[0];
    cases.hovered = hit ? hit.object.userData.i : -1;
    return cases.hovered;
  }

  // compile everything up front so the first scroll frame does not hitch
  stageCam.aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
  footCam.aspect = stageCam.aspect;
  renderer.compile(stage, stageCam);
  renderer.compile(foot, footCam);

  return {
    renderer, state, frame, pick, buildCases, size,
    plateCount: PLATES.length,
    get cases() { return cases; },
    dispose() { renderer.dispose(); }
  };
}
