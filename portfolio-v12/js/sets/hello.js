import * as THREE from 'three';
import { clamp, lerp, smooth, ease, input, mulberry } from '../util.js';

// 01 Hello. The night at the top. The name hangs on a single red thread (the sutradhar's cord);
// a chrome plumb bob swings at its end. Scrolling down drops the bob and the camera follows it.
export function createHello({ env, mobile, audio }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = env; scene.environmentIntensity = 0.8;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);

  // stars and a low red breath at the horizon
  {
    const r = mulberry(11), n = mobile ? 380 : 720, p = new Float32Array(n * 3), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (r() - 0.5) * 46; p[i * 3 + 1] = (r() - 0.42) * 26; p[i * 3 + 2] = -10 - r() * 4; s[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: 'attribute float rnd; uniform float uTime, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; vA = (0.2 + 0.8 * rnd * rnd) * (0.65 + 0.35 * sin(uTime * (0.5 + rnd) + rnd * 40.0)); gl_PointSize = (0.8 + rnd * 1.8) * uPx; }',
      fragmentShader: 'varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * vA * 0.55 * smoothstep(0.25, 0.0, d), 1.0); }',
    });
    const stars = new THREE.Points(g, m); stars.frustumCulled = false; scene.add(stars);
    scene.userData.stars = m;
  }
  const hazeU = { uTime: { value: 0 }, uAmt: { value: 1 } };
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(90, 30), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: hazeU,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform float uTime, uAmt; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        float y = vUv.y, x = (vUv.x - 0.5) * 3.0;
        float band = exp(-pow((y - 0.18) * 5.5, 2.0));
        float cloud = n(vec2(x * 2.2 + uTime * 0.02, y * 6.0)) * 0.6 + n(vec2(x * 5.0 - uTime * 0.03, y * 12.0)) * 0.4;
        vec3 c = vec3(0.12, 0.002, 0.001) * band * (0.35 + 0.9 * cloud) * (1.0 - smoothstep(0.6, 1.6, abs(x)));
        gl_FragColor = vec4(c * uAmt, 1.0);
      }`,
  }));
  haze.position.set(0, -2.2, -9); scene.add(haze);

  // thread + chrome plumb bob on a pendulum pivot
  const pivot = new THREE.Group(); scene.add(pivot);
  const threadGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 6, 1, true); threadGeo.translate(0, -0.5, 0);
  const thread = new THREE.Mesh(threadGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0101').multiplyScalar(2.1) }));
  pivot.add(thread);
  const prof = [[0, 0], [0.03, 0], [0.034, -0.004], [0.036, -0.012], [0.036, -0.075], [0.032, -0.08], [0.027, -0.085], [0.03, -0.09], [0.046, -0.1], [0.05, -0.11], [0.05, -0.15], [0.047, -0.165], [0.002, -0.458], [0, -0.46]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.08, clearcoat: 0.4, clearcoatRoughness: 0.05, envMapIntensity: 1.25 });
  const bob = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), chrome);
  const BOB_S = 2.0; bob.scale.setScalar(BOB_S);
  pivot.add(bob);
  const red = new THREE.PointLight('#ff0101', 1.2, 4, 1.6); red.position.set(0.7, -0.4, 0.8); scene.add(red);

  const S = { anchorY: 3, L: 3.3, len: 0.2, lenV: 0, thx: 0, wx: 0, thz: 0, wz: 0, landed: false, lastX: 0, camZ: 8, portrait: false };
  const look = new THREE.Vector3(), tmp = new THREE.Vector3();

  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 42 : 32; camera.updateProjectionMatrix();
    const half = S.camZ * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    // the bob hangs just under the name: its top at 58% of the screen (48% on a phone)
    const topFrac = S.portrait ? 0.49 : 0.605;
    const bobTopY = (0.5 - topFrac) * 2 * half;
    S.anchorY = half + 0.4;
    S.L = S.anchorY - bobTopY;
  }

  function update(dt, t, local, st) {
    const intro = st.intro;
    const exit = ease.inOut(clamp(local));
    const target = (intro > 0.12 ? S.L : 0.2) + exit * 4.6;
    S.lenV += (36 * (target - S.len) - 5 * S.lenV) * dt;
    S.len += S.lenV * dt;
    if (!S.landed && intro > 0.12 && S.lenV < 0 && S.len > S.L * 0.9) { S.landed = true; audio.land(); }
    const L = Math.max(0.5, S.len);
    const vx = (input.x - S.lastX) / Math.max(dt, 1e-3); S.lastX = input.x;
    S.wx += (-(9.8 / L) * Math.sin(S.thx) - 0.3 * S.wx + clamp(vx, -6, 6) * 0.2 + Math.sin(t * 0.9) * 0.016) * dt;
    S.wz += (-(9.8 / L) * Math.sin(S.thz) - 0.3 * S.wz + clamp(input.vy, -40, 40) * 0.004) * dt;
    S.thx = clamp(S.thx + S.wx * dt, -0.45, 0.45); S.thz = clamp(S.thz + S.wz * dt, -0.35, 0.35);
    pivot.position.set(0, S.anchorY, 0);
    pivot.rotation.set(S.thz, 0, S.thx);
    thread.scale.y = Math.max(0.01, S.len);
    bob.position.y = -S.len;
    bob.rotation.y = t * 0.3;
    bob.getWorldPosition(tmp);
    red.position.set(tmp.x + 0.8, tmp.y - 0.3, 0.9);
    const px = input.x * 0.3, py = input.y * 0.16;
    camera.position.set(px, py - exit * 3.6, S.camZ - exit * 0.6);
    look.set(0, -exit * 4.8, 0);
    camera.lookAt(look);
    hazeU.uTime.value = t; hazeU.uAmt.value = smooth(0, 0.8, intro) * (1 - exit * 0.5);
    scene.userData.stars.uniforms.uTime.value = t;
  }

  return {
    scene, camera, applyAspect, update,
    setPx(px) { scene.userData.stars.uniforms.uPx.value = px; },
    pluck() { S.wx += 0.8 * (Math.random() > 0.5 ? 1 : -1); audio.thread(); },
  };
}
