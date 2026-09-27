import * as THREE from 'three';
import { clamp, lerp, damp, smooth, ease, input, canvas2d, texFrom, lightShaft, dust, mulberry } from '../util.js';

// 01 Hello. The sutradhar's thread: a brass plumb bob on an orange line, swinging in a shaft of light
// in front of the name. Scrolling down drops the bob and the camera follows it.
export function createHello({ env, mobile, audio }) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.5;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);

  // ---- back wall glow: keeps the black from feeling flat
  const back = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uA: { value: new THREE.Color('#150a05') }, uB: { value: new THREE.Color('#030203') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; varying vec2 vUv; void main(){ float d = length((vUv - vec2(0.5, 0.56)) * vec2(1.6, 1.0)); gl_FragColor = vec4(mix(uA, uB, smoothstep(0.0, 0.42, d)), 1.0); }',
  }));
  back.position.z = -9; scene.add(back);

  // ---- a few stars: we start at the top, at night
  {
    const r = mulberry(11), n = 420, p = new Float32Array(n * 3), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (r() - 0.5) * 40; p[i * 3 + 1] = (r() - 0.35) * 22; p[i * 3 + 2] = -8.5; s[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: 'attribute float rnd; uniform float uTime, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; vA = (0.25 + 0.75 * rnd) * (0.6 + 0.4 * sin(uTime * (0.6 + rnd) + rnd * 40.0)); gl_PointSize = (1.0 + rnd * 2.2) * uPx; }',
      fragmentShader: 'varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; gl_FragColor = vec4(vec3(0.95, 0.85, 0.75) * vA * 0.5 * smoothstep(0.25, 0.0, d), 1.0); }',
    });
    const stars = new THREE.Points(g, m); stars.frustumCulled = false; scene.add(stars);
    scene.userData.stars = m;
  }

  // ---- the name, drawn in Telgra, lit by the bob
  const [nc, nx] = canvas2d(2400, 1120);
  function drawName() {
    nx.clearRect(0, 0, nc.width, nc.height);
    nx.fillStyle = '#fff';
    nx.textAlign = 'center'; nx.textBaseline = 'alphabetic';
    let fs = 420;
    nx.font = `400 ${fs}px Telgra`;
    const w = Math.max(nx.measureText('CHAUHAN').width, nx.measureText('SANJAY').width);
    fs = Math.floor(fs * (nc.width * 0.985) / w);
    nx.font = `400 ${fs}px Telgra`;
    nx.fillText('SANJAY', nc.width / 2, nc.height * 0.45);
    nx.fillText('CHAUHAN', nc.width / 2, nc.height * 0.45 + fs * 1.02);
  }
  drawName();
  const nameTex = texFrom(nc, { aniso: 8 });
  const nameMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { map: { value: nameTex }, uReveal: { value: 0 }, uBob: { value: new THREE.Vector3() }, uBase: { value: 0.4 }, uGain: { value: 0.8 }, uColor: { value: new THREE.Color('#f3e7d3') }, uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: /* glsl */`
      uniform sampler2D map; uniform float uReveal, uBase, uGain, uTime; uniform vec3 uBob, uColor; varying vec2 vUv; varying vec3 vW;
      void main(){
        float a = texture2D(map, vUv).a;
        float x = vUv.x * 0.78 + (1.0 - vUv.y) * 0.22;
        float rv = smoothstep(x - 0.12, x + 0.02, uReveal * 1.25 - 0.1);
        vec2 d = (vW.xy - uBob.xy) * vec2(0.55, 0.8);
        float l = uBase + uGain * exp(-dot(d, d) * 0.9);
        vec3 c = uColor * l;
        // a warm edge where the reveal is still travelling
        float edge = smoothstep(0.0, 0.08, rv) * (1.0 - smoothstep(0.08, 0.5, rv));
        c += vec3(1.0, 0.36, 0.02) * edge * 2.0;
        gl_FragColor = vec4(c * a * rv, a * rv);
      }`,
  });
  const name = new THREE.Mesh(new THREE.PlaneGeometry(1, nc.height / nc.width), nameMat);
  name.position.z = -2.6; scene.add(name);

  // ---- thread + plumb bob on a pendulum pivot
  const pivot = new THREE.Group(); scene.add(pivot);
  const orange = new THREE.Color('#ff5c00').multiplyScalar(2.0);
  const threadGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 6, 1, true); threadGeo.translate(0, -0.5, 0);
  const thread = new THREE.Mesh(threadGeo, new THREE.MeshBasicMaterial({ color: orange })); pivot.add(thread);
  // bob: knurled cap, collar, long cone
  const prof = [[0, 0], [0.03, 0], [0.034, -0.004], [0.036, -0.012], [0.036, -0.075], [0.032, -0.08], [0.027, -0.085], [0.03, -0.09], [0.046, -0.1], [0.05, -0.11], [0.05, -0.15], [0.047, -0.165], [0.002, -0.458], [0, -0.46]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const bobGeo = new THREE.LatheGeometry(prof, 72);
  const [kc, kx] = canvas2d(256, 256);
  kx.fillStyle = '#808080'; kx.fillRect(0, 0, 256, 256);
  const v0 = (1 - 4 / 13) * 256, v1 = (1 - 3 / 13) * 256;
  for (let i = 0; i < 64; i++) { kx.fillStyle = i % 2 ? '#303030' : '#d0d0d0'; kx.fillRect(i * 4, v1 - (v1 - v0) - 2, 2, (v1 - v0) + 4); }
  const bump = texFrom(kc, { srgb: false });
  const brass = new THREE.MeshStandardMaterial({ color: '#d6a257', metalness: 1, roughness: 0.3, bumpMap: bump, bumpScale: 1.2, envMapIntensity: 0.95 });
  const bob = new THREE.Mesh(bobGeo, brass);
  const BOB_S = 2.7; bob.scale.setScalar(BOB_S);
  pivot.add(bob);
  const bobLight = new THREE.PointLight('#ffb070', 0.12, 2, 2); pivot.add(bobLight);

  // ---- light
  const shaft = lightShaft({ rTop: 0.1, rBot: 2.0, height: 7.5, color: '#ffd3a6', strength: 0.06 });
  scene.add(shaft);
  const spot = new THREE.SpotLight('#ffdcae', 30, 14, 0.42, 0.95, 1.1); spot.position.set(0, 4.2, 1.8); scene.add(spot); scene.add(spot.target);
  const rim = new THREE.PointLight('#ff5c00', 5, 6, 1.6); rim.position.set(1.1, 0.0, -1.4); scene.add(rim);
  const rim2 = new THREE.PointLight('#ff8a3d', 2.5, 6, 1.6); rim2.position.set(-1.2, -0.8, -1.0); scene.add(rim2);
  scene.add(new THREE.HemisphereLight('#5b6391', '#120a06', 0.22));
  const motes = dust({ count: mobile ? 380 : 900, radius: 2.4, yMin: -3, yMax: 3.4, beam: 0.95, size: 34, color: '#ffd6a0' });
  scene.add(motes);

  // ---- state
  const S = { anchorY: 3.4, L: 3.5, len: 0.25, lenV: 0, thx: 0, wx: 0, thz: 0, wz: 0, landed: false, lastX: 0, nameY: 0.35, camZ: 8 };
  const tmp = new THREE.Vector3(), look = new THREE.Vector3();

  function applyAspect(a) {
    camera.aspect = a;
    camera.fov = a < 0.8 ? 42 : 32;
    camera.updateProjectionMatrix();
    const D = S.camZ - name.position.z;
    const vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), vw = vh * a;
    const w = a < 0.8 ? vw * 0.94 : Math.min(vw * 0.74, vh * 1.5);
    name.scale.set(w, w, 1);
    S.nameY = a < 0.8 ? 1.25 : 0.32;
    name.position.y = S.nameY;
    S.L = a < 0.8 ? 4.2 : 3.55;
    S.anchorY = a < 0.8 ? 4.6 : 3.4;
    shaft.position.set(0, S.anchorY + 0.3, 0);
  }

  function update(dt, t, local, st) {
    const intro = st.intro;
    const exit = ease.inOut(clamp(local)); // 0..1 while leaving for the next floor
    // --- drop in: spring the thread from a stub to full length when the visitor enters
    const target = (intro > 0.02 ? S.L : 0.25) + exit * 4.2;
    const k = 38, c = 5.2;
    S.lenV += (k * (target - S.len) - c * S.lenV) * dt;
    S.len += S.lenV * dt;
    if (!S.landed && intro > 0.02 && S.lenV < 0 && S.len > S.L * 0.9) { S.landed = true; audio.land(); }
    // --- pendulum
    const L = Math.max(0.5, S.len);
    const vx = (input.x - S.lastX) / Math.max(dt, 1e-3); S.lastX = input.x;
    const drive = Math.sin(t * 0.9) * 0.018;
    S.wx += (-(9.8 / L) * Math.sin(S.thx) - 0.32 * S.wx + clamp(vx, -6, 6) * 0.22 + drive) * dt;
    S.wz += (-(9.8 / L) * Math.sin(S.thz) - 0.32 * S.wz + clamp(input.vy, -40, 40) * 0.004) * dt;
    S.thx = clamp(S.thx + S.wx * dt, -0.5, 0.5); S.thz = clamp(S.thz + S.wz * dt, -0.4, 0.4);
    pivot.position.set(0, S.anchorY, 0);
    pivot.rotation.set(S.thz, 0, S.thx);
    thread.scale.y = Math.max(0.01, S.len);
    bob.position.y = -S.len;
    bob.rotation.y = t * 0.25;
    bobLight.position.y = -S.len - 0.3;
    // world position of the bob drives the name's light
    bob.getWorldPosition(tmp); tmp.y -= 0.35 * BOB_S * Math.cos(S.thx);
    nameMat.uniforms.uBob.value.copy(tmp);
    nameMat.uniforms.uReveal.value = smooth(0.25, 1, intro);
    nameMat.uniforms.uBase.value = 0.4 * (1 - exit * 0.7);
    nameMat.uniforms.uTime.value = t;
    spot.target.position.copy(tmp);
    // --- camera: intro crane from the anchor down to the name, then follow the bob down on exit
    const ci = ease.inOut(clamp(intro));
    const px = input.x * 0.35, py = input.y * 0.2;
    camera.position.set(
      lerp(0, px, ci),
      lerp(S.anchorY - 0.6, py, ci) - exit * 3.4,
      lerp(4.2, S.camZ, ci) - exit * 0.8,
    );
    look.set(0, lerp(S.anchorY - 0.2, -0.12, ci) - exit * 4.6, 0);
    camera.lookAt(look);
    shaft.material.uniforms.uTime.value = t;
    shaft.material.uniforms.uStrength.value = 0.06 * (0.4 + 0.6 * ci);
    motes.material.uniforms.uTime.value = t;
    scene.userData.stars.uniforms.uTime.value = t;
  }

  return {
    scene, camera, applyAspect, update,
    setPx(px) { motes.material.uniforms.uPx.value = px; scene.userData.stars.uniforms.uPx.value = px; },
    redrawName() { drawName(); nameTex.needsUpdate = true; },
    pluck() { S.wx += 0.9 * (Math.random() > 0.5 ? 1 : -1); audio.thread(); },
    bobScreen(out) { bob.getWorldPosition(out); out.y -= 0.3 * BOB_S; return out.project(camera); },
  };
}
