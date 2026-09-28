import * as THREE from 'three';
import { clamp, lerp, ease, input, mulberry, loadImage, canvas2d } from '../util.js';

// 04 Journey. The same lights become Dubai, then Mumbai, then the dunes of Valdara: cream points,
// with one in seven burning red like the thread.
// Each city is sampled from its own night photograph, placed as a 2.5D relief so the camera can
// drift around it while the straight-on view stays true to the photo.
const D0 = 12.5, WD = 17;

async function samplePhoto(url, n, { gamma = 1.6, horizon = 0.7, depth = 7, back = 1.6, seed = 1, boost = 1 }) {
  const img = await loadImage(url);
  const w = 760, h = Math.round((w * img.height) / img.width);
  const [, x] = canvas2d(w, h); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  const cdf = new Float32Array(w * h); let acc = 0;
  for (let i = 0; i < w * h; i++) {
    const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    acc += l > 0.04 ? Math.pow(l, gamma) : 0; cdf[i] = acc;
  }
  const r = mulberry(seed), pos = new Float32Array(n * 3), val = new Float32Array(n);
  const HW = (WD * h) / w;
  for (let k = 0; k < n; k++) {
    const u = r() * acc; let lo = 0, hi = w * h - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m; }
    const px = (lo % w) + r(), py = Math.floor(lo / w) + r();
    const v = py / h;
    let z = v > horizon ? ((v - horizon) / (1 - horizon)) * depth : -r() * back - (horizon - v) * 0.8;
    z += (r() - 0.5) * 0.25;
    const s = (D0 - z) / D0; // keep the straight-on view identical to the photo
    pos[k * 3] = (px / w - 0.5) * WD * s;
    pos[k * 3 + 1] = (0.5 - v) * HW * s;
    pos[k * 3 + 2] = z;
    const R = Math.pow(d[lo * 4] / 255, 2.2), G = Math.pow(d[lo * 4 + 1] / 255, 2.2), B = Math.pow(d[lo * 4 + 2] / 255, 2.2);
    const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    val[k] = (0.28 + 0.72 * Math.min(1, lum * 2.4)) * boost;
  }
  return { pos, val };
}

export async function createJourney({ mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
  const N = mobile ? 26000 : 64000;
  const [a, b, c] = await Promise.all([
    samplePhoto('assets/env/dubai.jpg', N, { gamma: 1.5, horizon: 0.74, depth: 5, seed: 3, boost: 1.1 }),
    samplePhoto('assets/env/mumbai.jpg', N, { gamma: 1.5, horizon: 0.575, depth: 6, seed: 5, boost: 1.1 }),
    samplePhoto('assets/env/valdara.jpg', N, { gamma: 1.25, horizon: 0.35, depth: 8, seed: 7, boost: 0.95 }),
  ]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(a.pos, 3));
  g.setAttribute('pB', new THREE.BufferAttribute(b.pos, 3));
  g.setAttribute('pC', new THREE.BufferAttribute(c.pos, 3));
  const rnd = new Float32Array(N); const rr = mulberry(9); for (let i = 0; i < N; i++) rnd[i] = rr();
  // cream points; one in seven is red, and it stays red through every city
  const CREAM = [1, 0.97, 0.84], RED = [1.6, 0.02, 0.01];
  const paint = (src) => { const out = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const hue = (i * 0.61803) % 1 < 0.14 ? RED : CREAM; for (let k = 0; k < 3; k++) out[i * 3 + k] = hue[k] * src.val[i]; } return out; };
  g.setAttribute('cA', new THREE.BufferAttribute(paint(a), 3));
  g.setAttribute('cB', new THREE.BufferAttribute(paint(b), 3));
  g.setAttribute('cC', new THREE.BufferAttribute(paint(c), 3));
  g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uM: { value: 0 }, uTime: { value: 0 }, uSize: { value: mobile ? 30 : 34 }, uPx: { value: 1 }, uGain: { value: 0.5 }, uWarm: { value: 0 } },
    vertexShader: /* glsl */`
      attribute vec3 pB, pC, cA, cB, cC; attribute float rnd;
      uniform float uM, uTime, uSize, uPx, uGain, uWarm; varying vec3 vC;
      float io(float t){ return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
      void main(){
        float d = rnd * 0.42;
        float t1 = io(clamp((uM - d) / 0.58, 0.0, 1.0));
        float t2 = io(clamp((uM - 1.0 - d) / 0.58, 0.0, 1.0));
        vec3 p = mix(mix(position, pB, t1), pC, t2);
        vec3 c = mix(mix(cA, cB, t1), cC, t2);
        float s = sin(3.14159 * t1) + sin(3.14159 * t2);
        p += vec3(sin(p.y * 1.3 + uTime * 0.7 + rnd * 12.0), cos(p.x * 0.8 + uTime * 0.6 + rnd * 9.0) * 0.7, sin(p.x * 0.9 + p.y * 1.1 + rnd * 5.0)) * 1.1 * s;
        p.y += sin(uTime * 0.9 + rnd * 50.0) * 0.008;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.78 + 0.22 * sin(uTime * (1.2 + rnd * 2.0) + rnd * 70.0);
        gl_PointSize = uSize * uPx * (0.45 + rnd * 0.9) * tw / -mv.z;
        vec3 warm = vec3(1.0, 0.42, 0.08) * dot(c, vec3(0.33));
        vC = mix(c, warm, uWarm) * uGain * (1.0 + s * 0.8);
      }`,
    fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float r = dot(q,q); if (r > 0.25) discard; gl_FragColor = vec4(vC * smoothstep(0.25, 0.02, r), 1.0); }',
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; scene.add(pts);

  // a glow along the horizon, recoloured per place
  const glowU = { uCol: { value: new THREE.Color('#2a1206') }, uY: { value: 0.46 } };
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), new THREE.ShaderMaterial({
    depthWrite: false, uniforms: glowU,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uCol; uniform float uY; varying vec2 vUv; void main(){ float a = exp(-pow((vUv.y - uY) * 7.0, 2.0)); gl_FragColor = vec4(uCol * a, 1.0); }',
  }));
  glow.position.z = -14; scene.add(glow);
  const COLS = [new THREE.Color('#0e0101'), new THREE.Color('#0a0002'), new THREE.Color('#120101')];
  const YS = [0.44, 0.5, 0.56];

  const S = { camD: D0, portrait: false };
  const look = new THREE.Vector3();
  function applyAspect(asp) {
    camera.aspect = asp; S.portrait = asp < 0.8;
    camera.fov = S.portrait ? 40 : 35; camera.updateProjectionMatrix();
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    // landscape: the photo slightly wider than the screen; portrait: crop into the centre
    S.camD = S.portrait ? 6.4 / 2 / vt : Math.min(D0, (WD * 0.86) / 2 / (vt * asp));
  }
  function update(dt, t, local, st) {
    const m = clamp(local, 0, 2);
    mat.uniforms.uM.value = m;
    mat.uniforms.uTime.value = t;
    const i0 = Math.min(1, Math.floor(m)), f = m - i0;
    glowU.uCol.value.copy(COLS[i0]).lerp(COLS[i0 + 1], f);
    glowU.uY.value = lerp(YS[i0], YS[i0 + 1], f);
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 2 ? ease.inOut(clamp(local - 2)) : 0;
    const yaw = input.x * 0.16 + Math.sin(t * 0.07) * 0.05, pitch = input.y * 0.06;
    const dist = S.camD * (1 - outE * 0.35) + inE * 2;
    camera.position.set(Math.sin(yaw) * dist, Math.sin(pitch) * dist + inE * 4 - outE * 1.6, Math.cos(yaw) * dist);
    look.set(0, inE * 0.4 - outE * 1.8 - (S.portrait ? 0.3 : 0), 0);
    camera.lookAt(look);
  }
  return { scene, camera, applyAspect, update, setPx(px) { mat.uniforms.uPx.value = px; } };
}
