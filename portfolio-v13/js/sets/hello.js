import * as THREE from 'three';
import { clamp, lerp, smooth, ease, input, mulberry, canvas2d, texFrom } from '../util.js';

// 01 Hello. The name, built in light: six letters rise out of the dark one by one, a red glow
// breathes behind them, and the sutradhar's thread drops from the mark in the nav with a chrome
// plumb bob that swings in front of the name. Scrolling down drops the bob; the camera follows.
const WM_W = 3453.26, WM_H = 481.051;
const LETTERS = [
  { x0: 0, x1: 520.71, d: 'M184.777 304.102H335.93C353.946 304.102 362.955 310.053 362.955 321.954C362.955 334.899 353.946 341.371 335.93 341.371H15.3981V481.051H335.93C398.569 481.051 444.973 469.046 475.141 445.035C505.518 421.024 520.707 382.398 520.707 329.157C520.707 275.916 505.518 237.29 475.141 213.279C444.973 189.059 398.569 176.95 335.93 176.95H184.777C166.76 176.95 157.752 170.999 157.752 159.098C157.752 146.153 166.76 139.681 184.777 139.681H505.309V0.000938625H184.777C122.137 0.000938625 75.6287 12.0063 45.2515 36.0171C15.0838 60.0278 0 98.6538 0 151.895C0 205.136 15.0838 243.867 45.2515 268.086C75.6287 292.097 122.137 304.102 184.777 304.102Z' },
  { x0: 554.33, x1: 1107.72, d: 'M589.841 139.681H880.833C926.713 139.681 949.653 155.758 949.653 187.911V223.301C913.829 192.4 857.998 176.95 782.16 176.95H739.108C676.468 176.95 629.96 189.059 599.583 213.279C569.415 237.29 554.331 275.916 554.331 329.157C554.331 382.398 569.415 421.024 599.583 445.035C629.96 469.046 676.468 481.051 739.108 481.051H782.16C857.998 481.051 913.829 464.348 949.653 430.942V481.051H1107.72V187.911C1107.72 121.934 1089.07 74.1211 1051.78 44.473C1014.7 14.825 957.719 0.000938625 880.833 0.000938625H589.841V139.681ZM921.999 341.371H739.108C720.672 341.371 711.454 335.107 711.454 322.58C711.454 310.262 720.672 304.102 739.108 304.102H921.999C940.435 304.102 949.653 310.262 949.653 322.58C949.653 335.107 940.435 341.371 921.999 341.371Z' },
  { x0: 1166.8, x1: 1705.1, d: 'M1166.8 0.000938625H1325.18L1546.72 259.63V0.000938625H1705.1V481.051H1546.72L1325.18 221.422V481.051H1166.8V0.000938625Z' },
  { x0: 1755.64, x1: 2254.41, d: 'M2096.02 139.301L1755.64 139.301V0L2254.41 0.000437552V293.141C2254.41 359.118 2235.76 406.931 2198.47 436.579C2161.39 466.227 2104.3 481.051 2027.2 481.051H1983.21C1906.32 481.051 1849.24 466.227 1811.95 436.579C1774.66 406.931 1756.01 359.118 1756.01 293.141V240.526H1914.39V293.141C1914.39 325.294 1937.33 341.371 1983.21 341.371H2027.2C2073.08 341.371 2096.02 325.294 2096.02 293.141V139.301Z' },
  { x0: 2304.68, x1: 2858.07, d: 'M2631.19 139.681H2340.19V0.000938625H2631.19C2708.07 0.000938625 2765.06 14.825 2802.14 44.473C2839.43 74.1211 2858.07 121.934 2858.07 187.911V481.051H2700.01V430.942C2664.18 464.348 2608.35 481.051 2532.51 481.051H2489.46C2426.82 481.051 2380.31 469.046 2349.94 445.035C2319.77 421.024 2304.68 382.398 2304.68 329.157C2304.68 275.916 2319.77 237.29 2349.94 213.279C2380.31 189.059 2426.82 176.95 2489.46 176.95H2532.51C2608.35 176.95 2664.18 192.4 2700.01 223.301V187.911C2700.01 155.758 2677.07 139.681 2631.19 139.681ZM2489.46 341.371H2672.35C2690.79 341.371 2700.01 335.107 2700.01 322.58C2700.01 310.262 2690.79 304.102 2672.35 304.102H2489.46C2471.03 304.102 2461.81 310.262 2461.81 322.58C2461.81 335.107 2471.03 341.371 2489.46 341.371Z' },
  { x0: 2906.47, x1: 3453.26, d: 'M3064.53 0.000938625H2906.47V116.192C2906.47 182.169 2925.11 229.982 2962.4 259.63C2999.69 289.278 3056.78 304.102 3133.67 304.102H3167.61C3226.06 304.102 3268.58 290.844 3295.19 264.328V293.141C3295.19 325.294 3272.15 341.371 3226.06 341.371H2937.26V481.051H3226.06C3302.94 481.051 3360.03 466.227 3397.32 436.579C3434.61 406.931 3453.26 359.118 3453.26 293.141V0.000938625H3295.19V116.192C3295.19 148.137 3272.15 164.109 3226.06 164.109H3133.67C3087.58 164.109 3064.53 148.137 3064.53 116.192V0.000938625Z' },
];
const SB_SMALL = ['M30.1592 81.9976L83.3429 112.399C84.769 102.23 90.1903 93.3266 97.9867 87.292L44.8006 56.889L30.1592 81.9976ZM107.372 81.9176C111.894 80.1055 116.836 79.1076 122.014 79.1076C127.191 79.1076 132.134 80.1055 136.655 81.9176V21.1218H107.372V81.9176ZM146.04 87.2912C153.836 93.3256 159.258 102.229 160.684 112.398L213.866 81.9976L199.224 56.889L146.04 87.2912Z', 'M29.2846 121.389L214.743 121.389V143.134L29.2846 143.134V121.389Z'];

const VS = 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';

export function createHello({ env, neutral, mobile, audio }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = env; scene.environmentIntensity = 0.85;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  const name = new THREE.Group(); scene.add(name);

  // faint stars
  {
    const r = mulberry(11), n = mobile ? 260 : 520, p = new Float32Array(n * 3), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (r() - 0.5) * 46; p[i * 3 + 1] = (r() - 0.42) * 26; p[i * 3 + 2] = -10 - r() * 4; s[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uAmt: { value: 0 } },
      vertexShader: 'attribute float rnd; uniform float uTime, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; vA = (0.2 + 0.8 * rnd * rnd) * (0.65 + 0.35 * sin(uTime * (0.5 + rnd) + rnd * 40.0)); gl_PointSize = (0.8 + rnd * 1.6) * uPx; }',
      fragmentShader: 'uniform float uAmt; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * vA * 0.45 * uAmt * smoothstep(0.25, 0.0, d), 1.0); }',
    });
    const stars = new THREE.Points(g, m); stars.frustumCulled = false; scene.add(stars);
    scene.userData.stars = m;
  }

  // the letters: one texture each, so each can rise on its own
  const PX = 0.9; // texture px per SVG unit
  const letters = LETTERS.map((L) => {
    const w = L.x1 - L.x0, pad = 8;
    const [c, x] = canvas2d(Math.ceil((w + pad * 2) * PX), Math.ceil((WM_H + pad * 2) * PX));
    x.scale(PX, PX); x.translate(pad - L.x0, pad); x.fillStyle = '#fff'; x.fill(new Path2D(L.d), 'evenodd');
    const tex = texFrom(c, { aniso: 8 });
    const u = { map: { value: tex }, uRise: { value: 0 }, uBaseY: { value: 0 }, uBob: { value: new THREE.Vector3(0, -9, 0) }, uTime: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: u, vertexShader: VS,
      fragmentShader: /* glsl */`
        uniform sampler2D map; uniform float uRise, uBaseY, uTime; uniform vec3 uBob; varying vec2 vUv; varying vec3 vW;
        void main(){
          if (vW.y < uBaseY) discard;              // the letters rise out of a slot, like the page version
          float a = texture2D(map, vUv).a;
          vec2 d = (vW.xy - uBob.xy) * vec2(0.9, 1.2);
          float near = exp(-dot(d, d) * 2.2);       // the bob throws a little light on the name
          vec3 cream = vec3(1.0, 0.975, 0.84);
          vec3 c = cream * (0.9 + 0.35 * near) + vec3(1.0, 0.08, 0.02) * near * 0.25;
          gl_FragColor = vec4(c * a * uRise, a * uRise);
        }`,
    });
    const aspect = c.width / c.height;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(aspect, 1), mat);
    name.add(mesh);
    return { L, mesh, u, pad, w, cw: c.width, ch: c.height };
  });

  // a red glow behind the whole word
  const [gc, gx] = canvas2d(1400, Math.round(1400 * (WM_H + 260) / (WM_W + 260)));
  {
    const k = gc.width / (WM_W + 260);
    gx.scale(k, k); gx.translate(130, 130);
    gx.shadowColor = 'rgba(255,1,1,1)'; gx.shadowBlur = 34; gx.fillStyle = '#ff0101';
    LETTERS.forEach((L) => gx.fill(new Path2D(L.d), 'evenodd'));
  }
  const glowU = { map: { value: texFrom(gc) }, uAmt: { value: 0 } };
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, gc.height / gc.width), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: glowU,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float uAmt; varying vec2 vUv; void main(){ vec4 t = texture2D(map, vUv); gl_FragColor = vec4(vec3(1.0, 0.02, 0.01) * t.a * 0.42 * uAmt, 1.0); }',
  }));
  glow.position.z = -0.25; name.add(glow);

  // the lockup: CHAUHAN, the small sunburst, DESIGNS, tracked wide across the word
  const [lc, lx] = canvas2d(2800, 120);
  function drawLockup() {
    lx.clearRect(0, 0, lc.width, lc.height);
    const fs = 64; lx.font = `400 ${fs}px Telgra`; lx.fillStyle = '#fff'; lx.textBaseline = 'middle';
    const track = fs * 0.8, y = lc.height / 2;
    const run = (word, x0, dir) => {
      const chars = [...word]; let x = x0;
      if (dir < 0) { const wsum = chars.reduce((a, ch) => a + lx.measureText(ch).width + track, -track); x = x0 - wsum; }
      chars.forEach((ch) => { lx.fillText(ch, x, y); x += lx.measureText(ch).width + track; });
    };
    run('CHAUHAN', 4, 1); run('DESIGNS', lc.width - 4, -1);
    lx.save(); const s = 0.7; lx.translate(lc.width / 2 - 122 * s, y - 82 * s); lx.scale(s, s); lx.fillStyle = '#ff0101';
    SB_SMALL.forEach((d) => lx.fill(new Path2D(d), 'evenodd')); lx.restore();
  }
  drawLockup();
  const lockTex = texFrom(lc, { aniso: 8 });
  const lockU = { map: { value: lockTex }, uAmt: { value: 0 } };
  const lockup = new THREE.Mesh(new THREE.PlaneGeometry(1, lc.height / lc.width), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: lockU,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float uAmt; varying vec2 vUv; void main(){ vec4 t = texture2D(map, vUv); vec3 c = mix(vec3(1.0, 0.975, 0.84), vec3(1.4, 0.03, 0.015), step(0.5, t.r - t.g) ); gl_FragColor = vec4(c * t.a * uAmt, t.a * uAmt); }',
  }));
  name.add(lockup);

  // thread + chrome plumb bob, hanging in front of the name
  const pivot = new THREE.Group(); scene.add(pivot);
  const threadGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 6, 1, true); threadGeo.translate(0, -0.5, 0);
  const thread = new THREE.Mesh(threadGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0101').multiplyScalar(2.2) }));
  pivot.add(thread);
  const prof = [[0, 0], [0.03, 0], [0.034, -0.004], [0.036, -0.012], [0.036, -0.075], [0.032, -0.08], [0.027, -0.085], [0.03, -0.09], [0.046, -0.1], [0.05, -0.11], [0.05, -0.15], [0.047, -0.165], [0.002, -0.458], [0, -0.46]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.07, clearcoat: 0.5, clearcoatRoughness: 0.04, envMap: neutral, envMapIntensity: 1.05 });
  const bob = new THREE.Mesh(new THREE.LatheGeometry(prof, 112), chrome);
  const BOB_S = 2.5; bob.scale.setScalar(BOB_S);
  pivot.add(bob);
  const red = new THREE.PointLight('#ff0101', 0.9, 3.2, 1.6); scene.add(red);
  const white = new THREE.PointLight('#fff4ea', 2.2, 6, 1.6); scene.add(white);

  // dust in front of the name, catching a little light
  const DN = mobile ? 120 : 260, dr = mulberry(4);
  const dp = new Float32Array(DN * 3), ds = new Float32Array(DN);
  for (let i = 0; i < DN; i++) { dp[i * 3] = (dr() - 0.5) * 9; dp[i * 3 + 1] = (dr() - 0.5) * 5; dp[i * 3 + 2] = -0.6 + dr() * 2.2; ds[i] = dr(); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('rnd', new THREE.BufferAttribute(ds, 1));
  const dustU = { uTime: { value: 0 }, uPx: { value: 1 }, uAmt: { value: 0 } };
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: dustU,
    vertexShader: 'attribute float rnd; uniform float uTime, uPx; varying float vA; varying float vR; void main(){ vec3 p = position; p.y += mod(uTime * (0.03 + rnd * 0.05) + rnd * 5.0, 5.0) - 2.5 - p.y * 0.0; p.x += sin(uTime * 0.2 + rnd * 20.0) * 0.2; vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv; vA = 0.25 + 0.75 * rnd; vR = step(0.82, rnd); gl_PointSize = uPx * (1.0 + rnd * 2.2) * (7.0 / -mv.z); }',
    fragmentShader: 'uniform float uAmt; varying float vA; varying float vR; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; vec3 c = mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.04, 0.02), vR); gl_FragColor = vec4(c * vA * 0.5 * uAmt * smoothstep(0.25, 0.0, d), 1.0); }',
  }));
  dust.frustumCulled = false; scene.add(dust);

  const S = { anchorY: 3, L: 3.3, len: 0.05, lenV: 0, thx: 0, wx: 0, thz: 0, wz: 0, landed: false, lastX: 0, camZ: 8, portrait: false, baseY: 0, wmW: 5 };
  const look = new THREE.Vector3(), tmp = new THREE.Vector3();
  const BZ = 0.9; // the bob hangs a little in front of the name

  function layout() {
    const half = S.camZ * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), a = camera.aspect;
    const vw = 2 * half * a;
    S.wmW = S.portrait ? vw * 0.88 : Math.min(vw * 0.76, half * 2 * 1.72);
    const k = S.wmW / WM_W; // world units per SVG unit
    const cy = (0.5 - (S.portrait ? 0.315 : 0.38)) * 2 * half; // centre of the word
    const top = cy + (WM_H * k) / 2;
    S.baseY = cy - (WM_H * k) / 2;
    letters.forEach((l) => {
      const hW = (l.ch / PX) * k, wW = (l.cw / PX) * k;
      l.mesh.scale.set(hW, hW, 1);
      l.cx = (l.L.x0 - l.pad + (l.cw / PX) / 2 - WM_W / 2) * k;
      l.cy = top + l.pad * k - hW / 2;
      l.h = WM_H * k;
      l.mesh.position.set(l.cx, l.cy, 0);
      l.u.uBaseY.value = S.baseY - 0.002;
      l.wW = wW;
    });
    glow.scale.setScalar(S.wmW * (WM_W + 260) / WM_W); glow.position.set(0, cy, -0.25);
    lockup.scale.setScalar(S.wmW); lockup.position.set(0, S.baseY - S.wmW * 0.034 - (S.wmW * lc.height / lc.width) / 2, 0);
    // the bob: its top sits over the lower half of the word
    const bobTop = S.portrait ? cy - (WM_H * k) * 0.15 : cy - (WM_H * k) * 0.1;
    S.anchorY = half * ((S.camZ - BZ) / S.camZ) + 0.5;
    S.L = S.anchorY - bobTop;
  }
  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 42 : 32; camera.updateProjectionMatrix();
    layout();
  }

  function update(dt, t, local, st) {
    const since = st.since ?? 0, on = since > 0;
    const exit = ease.inOut(clamp(local));
    // letters rise one by one, like the page version did
    letters.forEach((l, i) => {
      const e = on ? ease.expoOut(clamp((since - 0.75 - i * 0.075) / 1.35)) : 0;
      l.u.uRise.value = Math.min(1, e * 1.4);
      l.mesh.position.y = l.cy - (1 - e) * l.h * 1.18;
      l.mesh.rotation.z = (1 - e) * 0.1;
      l.u.uTime.value = t;
    });
    glowU.uAmt.value = on ? smooth(1.4, 2.6, since) * (1 - exit * 0.6) : 0;
    lockU.uAmt.value = on ? smooth(1.5, 2.4, since) : 0;
    lockup.scale.x = S.wmW * (0.86 + 0.14 * ease.out(clamp((since - 1.5) / 1.6)));
    scene.userData.stars.uniforms.uAmt.value = on ? smooth(0.2, 1.8, since) : 0;
    dustU.uAmt.value = on ? smooth(1.2, 3, since) : 0;
    // the thread drops from the mark in the nav, the bob lands and swings
    const target = (on && since > 0.25 ? S.L : 0.05) + exit * 4.6;
    S.lenV += (34 * (target - S.len) - 4.6 * S.lenV) * dt;
    S.len += S.lenV * dt;
    if (!S.landed && on && since > 0.25 && S.lenV < 0 && S.len > S.L * 0.9) { S.landed = true; audio.land(); }
    const Lc = Math.max(0.5, S.len);
    const vx = (input.x - S.lastX) / Math.max(dt, 1e-3); S.lastX = input.x;
    S.wx += (-(9.8 / Lc) * Math.sin(S.thx) - 0.28 * S.wx + clamp(vx, -6, 6) * 0.22 + Math.sin(t * 0.9) * 0.014) * dt;
    S.wz += (-(9.8 / Lc) * Math.sin(S.thz) - 0.3 * S.wz + clamp(input.vy, -40, 40) * 0.004) * dt;
    S.thx = clamp(S.thx + S.wx * dt, -0.45, 0.45); S.thz = clamp(S.thz + S.wz * dt, -0.35, 0.35);
    pivot.position.set(0, S.anchorY, BZ);
    pivot.rotation.set(S.thz, 0, S.thx);
    thread.scale.y = Math.max(0.01, S.len);
    bob.position.y = -S.len;
    bob.rotation.y = t * 0.3;
    bob.getWorldPosition(tmp); tmp.y -= 0.5;
    letters.forEach((l) => l.u.uBob.value.copy(tmp));
    red.position.set(tmp.x + 0.9, tmp.y - 0.2, BZ + 0.9);
    white.position.set(tmp.x - 1.2, tmp.y + 1.4, BZ + 1.8);
    dustU.uTime.value = t; scene.userData.stars.uniforms.uTime.value = t;
    // camera: a slow breath, the pointer, then down with the bob
    const px = input.x * 0.3, py = input.y * 0.14;
    camera.position.set(px, py - exit * 3.6 + Math.sin(t * 0.25) * 0.03, S.camZ - exit * 0.6);
    look.set(0, -exit * 4.8, 0);
    camera.lookAt(look);
  }

  return {
    scene, camera, applyAspect, update,
    setPx(px) { scene.userData.stars.uniforms.uPx.value = px; dustU.uPx.value = px; },
    pluck() { S.wx += 0.8 * (Math.random() > 0.5 ? 1 : -1); audio.thread(); },
    redraw() { drawLockup(); lockTex.needsUpdate = true; },
  };
}
