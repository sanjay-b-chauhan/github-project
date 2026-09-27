import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { pointer } from '../track.js';
import { clamp, smooth, lerp, mulberry } from '../util.js';

// SET 2 (chapter II, after v8B): a red volumetric beam rising from a backlit sunburst,
// standing on a field of red low-poly shards. A chrome sunburst assembles in the beam
// and turns once per heading. Custom shaders write linear light for the shared post pass.
const SUN_D = [
  'M0.252134 141.854L122.955 212.697C126.245 189.001 138.753 168.254 156.741 154.192L34.0322 83.3457L0.252134 141.854ZM178.395 141.668C188.826 137.445 200.229 135.12 212.175 135.12C224.12 135.12 235.523 137.445 245.955 141.668V2.95315e-06L178.395 0L178.395 141.668ZM267.606 154.189C285.594 168.251 298.102 188.998 301.394 212.694L424.091 141.854L390.311 83.3457L267.606 154.189Z',
  'M0 233.45H424.098V301.009H0V233.45Z',
];
const SUN_W = 424.098, SUN_H = 301.009, SUN_CX = 212.175, SUN_CY = 233.45;
const LIN = /* glsl */ `vec3 lin(vec3 c){ return pow(max(c, 0.), vec3(2.2)); }`;
const NOISE = /* glsl */ `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
`;
const VS_UV = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const easeOut3 = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sunPieces() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SUN_W} ${SUN_H}"><path d="${SUN_D[0]}"/><path d="${SUN_D[1]}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const out = [];
  data.paths.forEach((path) => {
    SVGLoader.createShapes(path).forEach((shape) => {
      const ex = shape.extractPoints(24);
      const flip = (pts) => pts.map((v) => new THREE.Vector2(v.x - SUN_CX, SUN_CY - v.y));
      const s = new THREE.Shape(flip(ex.shape));
      ex.holes.forEach((h) => s.holes.push(new THREE.Path(flip(h))));
      let cx = 0, cy = 0; ex.shape.forEach((v) => { cx += v.x; cy += v.y; }); cx /= ex.shape.length; cy /= ex.shape.length;
      out.push({ shape: s, cx, cy });
    });
  });
  const bar = out.find((p) => p.cy > 225);
  const rays = out.filter((p) => p !== bar).sort((a, b) => a.cx - b.cx);
  return { left: rays[0], center: rays[1], right: rays[2], bar };
}
function extrude(shape, scale, o) {
  let g = new THREE.ExtrudeGeometry(shape, {
    depth: o.depth, bevelEnabled: o.bevel > 0, bevelThickness: o.bevelT || o.bevel, bevelSize: o.bevel,
    bevelOffset: o.bevel > 0 ? -o.bevel : 0, bevelSegments: o.seg || 1, curveSegments: 24, steps: 1,
  });
  g.translate(0, 0, -o.depth / 2);
  g.scale(scale, scale, scale);
  if (o.crease) g = toCreasedNormals(g, o.crease);
  g.computeBoundingBox();
  return g;
}
function sunMaskCanvas(w = 512) {
  const h = Math.round((w * SUN_H) / SUN_W);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.scale(w / SUN_W, h / SUN_H); g.fillStyle = '#fff';
  SUN_D.forEach((d) => g.fill(new Path2D(d), 'evenodd'));
  return c;
}
// a studio environment for the chrome: softbox, two thin strips, red beams
function makeEnv(renderer) {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float az = atan(d.x, d.z);
        vec3 c = vec3(0.);
        c += vec3(1.,.97,.9) * smoothstep(.70,.80,d.y) * 3.2;
        float band = smoothstep(-.15,.25,d.y) * (1.-smoothstep(.55,.7,d.y));
        c += vec3(1.,.98,.95) * exp(-pow((az-.52)*16.,2.)) * band * 2.6;
        c += vec3(1.,.98,.95) * exp(-pow((az+.9)*20.,2.)) * band * 1.8;
        c += vec3(1.,.04,.02) * exp(-pow((abs(az)-1.7)*3.2,2.)) * smoothstep(-.4,.3,d.y) * 2.6;
        c += vec3(1.,.03,.01) * exp(-pow((abs(az)-3.1416)*2.4,2.)) * 3.2;
        c += vec3(.30,.0,.0) * exp(-pow(d.y*3.2,2.));
        c += vec3(.85,.02,.01) * smoothstep(-.08,-.55,d.y) * .8;
        gl_FragColor = vec4(c,1.); }`,
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 32), mat);
  scene.add(sphere);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(scene, 0.035);
  pm.dispose(); mat.dispose(); sphere.geometry.dispose();
  rt.texture.userData.keep = true;
  return rt.texture;
}

export function createBeam(renderer, { mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 400);
  const env = makeEnv(renderer);
  const P = sunPieces();
  const U = { uTime: { value: 0 }, uAmp: { value: 1 } };

  // haze behind the beam
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(220, 110), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: NOISE + LIN + `uniform float uTime, uAmp; varying vec2 vUv;
      void main(){ float x=(vUv.x-.5)*220., y=vUv.y*110.;
        float hz = exp(-x*x/(2.*16.*16.));
        float st = fbm(vec2(x*.55, y*.018 - uTime*.02));
        float st2 = fbm(vec2(x*2.2+4., y*.01));
        float hz2 = exp(-x*x/(2.*9.*9.));
        vec3 c = vec3(.085,0.,0.)*hz*(.25+.9*st) + vec3(.12,0.,0.)*hz2*(.3+.8*st) + vec3(.014,0.,0.)*st2*smoothstep(6.,40.,y);
        c *= smoothstep(4., 26., y);
        gl_FragColor = vec4(lin(c*uAmp)*1.6,1.); }`,
  }));
  haze.position.set(0, 42, -14);
  scene.add(haze);

  // the beam
  const BW = 26, BH = 74;
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: NOISE + LIN + `uniform float uTime, uAmp; varying vec2 vUv;
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
        float base = smoothstep(0., 1.2, y);
        float prof = .72 + .55*exp(-y*.10) + .3*smoothstep(18.,40.,y)*(1.-smoothstep(50.,${BH}.0,y));
        prof *= 1. - smoothstep(${BH - 12}.0, ${BH}.0, y);
        float I = (core*1.05 + glow*.34 + wide*.035) * streak * prof * base * uAmp;
        vec3 c = vec3(.92,.018,.01)*I + vec3(1.,.30,.16)*pow(core,6.)*.26*streak*base*uAmp;
        gl_FragColor = vec4(lin(c)*1.35 + vec3(.9,.05,.02)*pow(core,4.)*streak*prof*base*uAmp*.9, 1.); }`,
  }));
  beam.position.set(0, BH / 2 + 0.35, -0.9);
  scene.add(beam);

  // the shard field, lit by the beam: a pool of light, the long shadow of the mark, glints and glowing edges
  const maskTex = new THREE.CanvasTexture(sunMaskCanvas(512));
  const BASE_W = 3.0, BASE_S = BASE_W / SUN_W, BASE_H = SUN_H * BASE_S, PIVOT_Y = (SUN_H - SUN_CY) * BASE_S;
  const R = mulberry(11), Wd = 160, Dp = 210, cell = mobile ? 1.95 : 1.55, Z0 = 44;
  const nx = Math.ceil(Wd / cell), nz = Math.ceil(Dp / cell);
  const grid = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const jx = i > 0 && i < nx ? (R() - 0.5) * cell * 0.85 : 0, jz = j > 0 && j < nz ? (R() - 0.5) * cell * 0.85 : 0;
    grid.push([-Wd / 2 + i * cell + jx, Z0 - j * cell + jz]);
  }
  const pos = [], bar = [];
  const B = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const tri = (a, b, c) => {
    const cx = (a[0] + b[0] + c[0]) / 3, cz = (a[1] + b[1] + c[1]) / 3;
    const plaza = smooth(2.2, 5.5, Math.hypot(cx, cz * 1.2));
    const lift = (R() * 0.32 + (Math.sin(a[0] * 0.21) + Math.cos(a[1] * 0.17)) * 0.08) * plaza;
    const vs = [a, b, c].map((v) => [v[0], lift + (R() - 0.5) * 0.42 * plaza, v[1]]);
    const offPath = Math.abs(cx) > 6.5 || cz < -12;
    if (plaza > 0.9 && R() < (offPath ? 0.03 : 0.006)) { const k = Math.floor(R() * 3); vs[k][1] += (offPath ? 0.6 : 0.3) + R() * (offPath ? 1.3 : 0.5); }
    vs.forEach((v, k) => { pos.push(v[0], v[1], v[2]); bar.push(...B[k]); });
  };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = grid[j * (nx + 1) + i], b = grid[j * (nx + 1) + i + 1], c = grid[(j + 1) * (nx + 1) + i], d = grid[(j + 1) * (nx + 1) + i + 1];
    if (R() < 0.5) { tri(a, b, d); tri(a, d, c); } else { tri(a, b, c); tri(b, d, c); }
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  tg.setAttribute('bary', new THREE.Float32BufferAttribute(bar, 3));
  const floorU = { uTime: U.uTime, uMask: { value: maskTex }, uFloor: { value: 1 }, uFogA: { value: new THREE.Color(0.2, 0.004, 0.002) }, uFogB: { value: new THREE.Color(0.035, 0.0, 0.0) } };
  const terrain = new THREE.Mesh(tg, new THREE.ShaderMaterial({
    uniforms: floorU, side: THREE.DoubleSide,
    vertexShader: `attribute vec3 bary; varying vec3 vB; varying vec3 vW; varying float vDepth;
      void main(){ vB=bary; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mv=viewMatrix*w; vDepth=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: LIN + `uniform sampler2D uMask; uniform float uFloor, uTime; uniform vec3 uFogA, uFogB;
      varying vec3 vB; varying vec3 vW; varying float vDepth;
      void main(){
        vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if (n.y < 0.) n = -n;
        vec2 p = vW.xz;
        float pool = exp(-(p.x*p.x)/(2.*3.6*3.6) - (p.y*p.y)/(2.*2.4*2.4));
        float hot  = exp(-(p.x*p.x)/(2.*1.1*1.1) - (p.y*p.y)/(2.*.8*.8));
        float wl = 1.5 + max(p.y,0.)*.16;
        float lane = exp(-(p.x*p.x)/(2.*wl*wl)) * exp(-max(p.y,0.)*.11) * smoothstep(-.6,.6,p.y);
        float far  = exp(-(p.x*p.x)/(2.*11.*11.) - (p.y*p.y)/(2.*8.*8.));
        float sh = 0.;
        if (p.y > 0.) {
          float hh = p.y / 3.5;
          float xm = p.x / (1. + p.y*.05);
          vec2 uv = vec2(xm/${BASE_W.toFixed(3)} + .5, hh/${BASE_H.toFixed(4)});
          float bl = .002 + p.y*.0016;
          float m = 0.;
          for (int i=-2;i<=2;i++) m += texture2D(uMask, uv + vec2(float(i)*bl, 0.)).a;
          m *= .2;
          sh = m * step(0.,uv.x) * step(uv.x,1.) * step(0.,uv.y) * step(uv.y,1.);
        }
        float light = (pool*.62 + hot*1.1 + lane*.5 + far*.09) * uFloor * (1. - sh*.93);
        vec3 toB = vec3(0., 2.2, -.9) - vW; float dB = length(toB); toB /= dB;
        float lam = max(dot(n, toB), 0.);
        float fall = 1. / (1. + dB*dB*.01);
        vec3 v = normalize(vW - cameraPosition);
        vec3 r = reflect(v, n);
        vec2 ax = normalize(-vW.xz + vec2(0., -.9));
        float glint = pow(max(dot(normalize(r.xz + 1e-4), ax), 0.), 70.) * smoothstep(0., .3, r.y);
        vec3 c = vec3(.012, .0, .0);
        c += vec3(.85,.022,.012) * light * (.45 + .55*lam);
        c += vec3(.62,.02,.012) * pow(lam, 3.) * fall * (1. - sh*.8);
        c += vec3(1.,.06,.03) * glint * fall * 1.6 * (1. - sh);
        float e = min(min(vB.x,vB.y),vB.z); float fw = fwidth(e);
        float line = 1. - smoothstep(fw*.4, fw*1.6, e);
        c += vec3(1.,.26,.07) * line * (.1 + .75*fall + light*.5) * exp(-vDepth*.018) * (1. - sh*.7);
        vec3 fogC = mix(uFogA, uFogB, smoothstep(40., 150., vDepth));
        c = mix(c, fogC, smoothstep(26., 130., vDepth));
        gl_FragColor = vec4(lin(c), 1.);
      }`,
  }));
  scene.add(terrain);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  under.rotation.x = -Math.PI / 2; under.position.y = -0.35;
  scene.add(under);

  // the glowing sunburst at the base: a black silhouette with a hot sun rising behind its bar
  const base = new THREE.Group();
  base.position.set(0, PIVOT_Y, 0);
  const silMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  ['left', 'center', 'right', 'bar'].forEach((k) => base.add(new THREE.Mesh(extrude(P[k].shape, BASE_S, { depth: 10, bevel: 0 }), silMat)));
  scene.add(base);
  const sunU = { uAmp: U.uAmp, uTime: U.uTime, uRise: { value: 0 } };
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShaderMaterial({
    uniforms: sunU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: VS_UV,
    fragmentShader: LIN + `uniform float uAmp, uTime, uRise; varying vec2 vUv;
      void main(){ vec2 p=(vUv-.5)*5.; float r=length(p);
        float R=.56;
        float disc = smoothstep(R, R-.025, r);
        float corona = exp(-pow(max(r-R*.55,0.)/.5,1.25));
        float halo = exp(-r*r/(2.*1.25*1.25));
        vec3 core = mix(vec3(1.,.98,.9), vec3(1.,.34,.12), smoothstep(0.,R,r));
        float fl = .94 + .06*sin(uTime*2.3);
        float edge = smoothstep(2.5, 1.5, r);
        vec3 c = core*disc*1.35 + vec3(1.,.07,.03)*(corona*.95 + halo*.55)*fl*edge;
        gl_FragColor = vec4(lin(c)*1.5*uRise, 1.); }`,
  }));
  sun.position.set(0, PIVOT_Y, -0.12);
  scene.add(sun);

  // dust rising in the beam
  const DN = mobile ? 220 : 420, rnd = mulberry(7);
  const dPos = new Float32Array(DN * 3), dSeed = new Float32Array(DN);
  for (let i = 0; i < DN; i++) {
    const g = (rnd() + rnd() + rnd() - 1.5) * 1.6;
    dPos[i * 3] = g; dPos[i * 3 + 1] = rnd() * 30; dPos[i * 3 + 2] = (rnd() - 0.5) * 3 - 0.4; dSeed[i] = rnd();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustU = { ...U, uPx: { value: 1 } };
  const dust = new THREE.Points(dGeo, new THREE.ShaderMaterial({
    uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime, uAmp, uPx; attribute float aSeed; varying float vA;
      void main(){ vec3 p=position; p.y = mod(p.y + uTime*(.18+aSeed*.32), 30.); p.x += sin(uTime*.35+aSeed*23.)*.18;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        gl_PointSize = uPx*(1.2+aSeed*2.6)*(26./-mv.z);
        vA = exp(-p.x*p.x/1.6)*(.3+.7*(.5+.5*sin(uTime*1.7+aSeed*40.)))*uAmp*smoothstep(0.,2.,p.y)*(1.-smoothstep(22.,30.,p.y)); }`,
    fragmentShader: 'varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vec3(1.,.12,.05)*a*vA*.8,1.); }',
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  // the chrome sunburst over the beam
  const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1, envMap: env, envMapIntensity: 1.15, clearcoat: 0.35, clearcoatRoughness: 0.06 });
  chromeMat.onBeforeCompile = (sh) => {
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
        normal = normalize(normal + pn*0.2); }`);
  };
  const CH_S = 8.0 / SUN_W;
  const chromeOpts = { depth: 10, bevel: 13, bevelT: 11, seg: 8, crease: 0.75 };
  const orn = new THREE.Group();
  const pieces = {};
  ['left', 'center', 'right', 'bar'].forEach((k) => { const m = new THREE.Mesh(extrude(P[k].shape, CH_S, chromeOpts), chromeMat); pieces[k] = m; orn.add(m); });
  const FLY = {
    left: { p: [-17, 3.5, 5], r: [0.6, -1.6, 0.9] },
    right: { p: [17, 3.5, 5], r: [0.6, 1.6, -0.9] },
    center: { p: [0, 15, 3], r: [1.4, 0.3, 0] },
    bar: { p: [0, -9, 6], r: [-1.2, 0, 0.25] },
  };
  const ornWrap = new THREE.Group(); ornWrap.add(orn);
  ornWrap.position.set(0, 7.0, 5);
  scene.add(ornWrap);

  // ---------- camera ----------
  let portrait = false;
  function applyAspect(aspect) {
    camera.aspect = aspect;
    portrait = aspect < 1;
    camera.fov = portrait ? 48 : aspect < 1.3 ? 38 : 32;
    camera.updateProjectionMatrix();
  }
  const S = [0.19, 0.25, 0.31, 0.37];
  const tmp = new THREE.Vector3();
  const spinAt = (p) => {
    // one half turn per heading, resting a little angled toward the text
    if (p <= S[0]) return -Math.PI * 0.7 * (1 - smooth(0.13, S[0], p));
    for (let k = 0; k < 3; k++) if (p < S[k + 1]) return (k + easeInOut(clamp((p - S[k]) / (S[k + 1] - S[k])))) * Math.PI;
    return 3 * Math.PI + smooth(S[3], 0.45, p) * 0.9;
  };
  const leanAt = (p) => {
    const k = clamp(Math.round((clamp(p, S[0], S[3]) - S[0]) / 0.06), 0, 3);
    return (k % 2 === 0 ? -1 : 1) * 0.32;
  };
  let lean = -0.32;

  return {
    name: 'beam', scene, camera, applyAspect,
    setPx(v) { dustU.uPx.value = v; },
    update(dt, t, p) {
      U.uTime.value = t;
      sunU.uRise.value = 0.35 + 0.65 * smooth(0.13, 0.2, p);
      // arrive in the glow of the beam and pull back; dolly through the headings; tilt to the base
      const arrive = easeOut3(clamp((p - 0.125) / (S[0] - 0.125)));
      const m = smooth(S[0], S[3], p);
      const f = easeInOut(smooth(S[3] + 0.01, 0.455, p));
      const hz = lerp(portrait ? 34 : 30.5, portrait ? 30 : 27, m), hy = lerp(3.0, 3.8, m);
      const ly = lerp(portrait ? 8.4 : 6.7, portrait ? 9.1 : 7.4, m);
      const az = lerp(portrait ? 9 : 7.5, hz, arrive), ay = lerp(9.5, hy, arrive), aly = lerp(10.5, ly, arrive);
      const fy = portrait ? 12.5 : 9.0, fz = portrait ? 23 : 19.5, flz = portrait ? 5.8 : 4.8;
      camera.position.set(pointer.x * 0.7, lerp(ay, fy, f) - pointer.y * 0.35, lerp(az, fz, f));
      tmp.set(pointer.x * 0.25, lerp(aly, 0, f) - pointer.y * 0.15, lerp(0, flz, f));
      camera.lookAt(tmp);
      // chrome: assembles as we land, then turns once per heading
      const a = clamp((p - 0.128) / (S[0] - 0.128 - 0.004));
      ['left', 'right', 'center', 'bar'].forEach((k, idx) => {
        const local = easeOut3(clamp((a - idx * 0.08) / 0.72));
        const fl = FLY[k], mesh = pieces[k];
        const inv = 1 - local;
        mesh.position.set(fl.p[0] * inv, fl.p[1] * inv, fl.p[2] * inv);
        mesh.rotation.set(fl.r[0] * inv, fl.r[1] * inv, fl.r[2] * inv);
        mesh.visible = local > 0.001;
      });
      const fitW = portrait ? Math.min(1, (2 * 26 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * 0.66) / 8.0) : 1;
      ornWrap.scale.setScalar(fitW);
      ornWrap.position.y = (portrait ? 11.2 : 6.6) + Math.sin(t * 0.8) * 0.12;
      lean += (leanAt(p) - lean) * (1 - Math.exp(-3 * dt));
      orn.rotation.y = spinAt(p) + lean + Math.sin(t * 0.5) * 0.08 + pointer.x * 0.2;
      orn.rotation.x = Math.sin(t * 0.4) * 0.05 - pointer.y * 0.1 + (1 - a) * 0.2;
    },
  };
}
