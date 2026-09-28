import * as THREE from 'three';
import { clamp, damp, ease, input, mulberry } from '../util.js';
import { PROJECTS } from '../data.js';

// 03 Work. Every project hangs on two red threads in the dark, over a black mirror floor.
// The case title is mapped onto the active frame; arrows slide the row and the frames swing.
export function createWork({ env, neutral, mobile, texLoader }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = neutral; scene.environmentIntensity = 0.25;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 140);
  const N = PROJECTS.length, W = 3.2, H = 2.0, CY = 1.6, TH = 8, SP = 4.2;

  // far stars and a red haze low behind the row
  {
    const r = mulberry(5), n = mobile ? 300 : 600, p = new Float32Array(n * 3), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = -30 + r() * (N * SP + 60); p[i * 3 + 1] = 1 + r() * 18; p[i * 3 + 2] = -30 - r() * 10; s[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: 'attribute float rnd; uniform float uTime, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; vA = (0.15 + 0.85 * rnd * rnd) * (0.7 + 0.3 * sin(uTime * (0.4 + rnd) + rnd * 30.0)); gl_PointSize = (0.8 + rnd * 1.6) * uPx; }',
      fragmentShader: 'varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * vA * 0.45 * smoothstep(0.25, 0.0, d), 1.0); }',
    });
    const stars = new THREE.Points(g, m); stars.frustumCulled = false; scene.add(stars);
    scene.userData.stars = m;
  }
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(260, 16), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; void main(){ float a = exp(-pow((vUv.y - 0.3) * 5.0, 2.0)); gl_FragColor = vec4(vec3(0.05, 0.0, 0.0) * a, 1.0); }',
  }));
  haze.position.set(N * SP / 2, 3, -28); scene.add(haze);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 90), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(N * SP / 2, 0, -12); floor.renderOrder = 2; scene.add(floor);

  const screenVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
  const screenFS = /* glsl */`
    uniform sampler2D map; uniform float uDim, uTex, uPlane, uReady, uMirror, uShade; varying vec2 vUv;
    void main(){
      vec2 uv = vUv; float ra = uPlane / max(uTex, 0.01);
      if (ra < 1.0) uv.x = (uv.x - 0.5) * ra + 0.5; else uv.y = (uv.y - 0.5) / ra + 0.5;
      vec3 c = texture2D(map, uv).rgb;
      c = mix(vec3(0.02), c, uReady) * uDim;
      // a soft shade at the corners so the title and tags read on any screenshot
      float sh = smoothstep(0.55, 0.0, length((vUv - vec2(0.0, 1.0)) * vec2(1.0, 1.5))) + smoothstep(0.5, 0.0, length((vUv - vec2(1.0, 0.0)) * vec2(1.0, 1.6))) * 0.8 + smoothstep(0.35, 0.0, length((vUv - vec2(0.0, 0.0)) * vec2(1.0, 1.4))) * 0.6;
      c *= 1.0 - clamp(sh, 0.0, 1.0) * 0.82 * uShade;
      if (uMirror > 0.5) c *= pow(1.0 - vUv.y, 3.5) * 0.12;
      gl_FragColor = vec4(c, 1.0);
    }`;

  const threadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0101').multiplyScalar(1.9) });
  const frameMat = new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.35, metalness: 0.8 });
  const clipMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, clearcoat: 0.3, envMap: env, envMapIntensity: 1 });
  const threadGeo = new THREE.CylinderGeometry(0.006, 0.006, TH, 6, 1, true);
  const screenGeo = new THREE.PlaneGeometry(W, H);
  const panels = [], screens = [], videos = [];

  PROJECTS.forEach((pj, i) => {
    const pivot = new THREE.Group(); pivot.position.set(i * SP, CY + H / 2 + TH, 0); scene.add(pivot);
    const pg = new THREE.Group(); pg.position.y = -(TH + H / 2); pivot.add(pg);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, H + 0.06, 0.045), frameMat); frame.position.z = -0.025; pg.add(frame);
    const u = { map: { value: null }, uDim: { value: 0.3 }, uTex: { value: 1.6 }, uPlane: { value: W / H }, uReady: { value: 0 }, uMirror: { value: 0 }, uShade: { value: 0 } };
    const screen = new THREE.Mesh(screenGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: screenVS, fragmentShader: screenFS }));
    screen.userData.index = i; pg.add(screen); screens.push(screen);
    const mu = { ...u, uMirror: { value: 1 }, uShade: { value: 0 } };
    const mirror = new THREE.Mesh(screenGeo, new THREE.ShaderMaterial({ uniforms: mu, vertexShader: screenVS, fragmentShader: screenFS, depthWrite: false }));
    mirror.position.y = -2 * CY; mirror.scale.y = -1; mirror.renderOrder = 1; pg.add(mirror);
    for (const sx of [-1, 1]) {
      const th = new THREE.Mesh(threadGeo, threadMat); th.position.set(sx * W * 0.38, H / 2 + TH / 2, 0); pg.add(th);
      const clip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 20), clipMat); clip.position.set(sx * W * 0.38, H / 2 + 0.03, 0); pg.add(clip);
    }
    const setTex = (tex, aspect) => { u.map.value = tex; u.uTex.value = aspect; };
    texLoader.load(pj.img, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      if (!u.map.value || !u.map.value.isVideoTexture) setTex(tex, tex.image.width / tex.image.height);
      u.uReady.value = 1;
    });
    if (pj.video) {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'none' });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.src = pj.video;
      v.addEventListener('playing', () => {
        if (u.map.value && u.map.value.isVideoTexture) return;
        const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace;
        setTex(vt, (v.videoWidth || 16) / (v.videoHeight || 10)); u.uReady.value = 1;
      });
      videos[i] = v;
    }
    panels.push({ pivot, pg, u, screen, ang: 0, w: 0, angX: 0, wx: 0, z: 0 });
  });

  const S = { active: 0, camX: 0, camZ: 7, camY: 1.62, lookY: 1.5, lastCamX: 0, videoOn: -1 };
  const look = new THREE.Vector3(), ray = new THREE.Raycaster(), v3 = new THREE.Vector3();
  const corners = [new THREE.Vector3(-W / 2, H / 2, 0.002), new THREE.Vector3(W / 2, H / 2, 0.002), new THREE.Vector3(W / 2, -H / 2, 0.002), new THREE.Vector3(-W / 2, -H / 2, 0.002)];

  function setActive(i) {
    i = ((i % N) + N) % N;
    const dir = Math.sign(i - S.active) || 1;
    S.active = i;
    panels.forEach((p) => { p.w += -dir * (0.1 + Math.random() * 0.06); p.wx += (Math.random() - 0.5) * 0.08; });
    return i;
  }
  function applyAspect(a) {
    camera.aspect = a;
    const portrait = a < 0.8;
    camera.fov = portrait ? 40 : 30; camera.updateProjectionMatrix();
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    S.camZ = portrait ? (W * 1.08) / 2 / (vt * a) : Math.max((H / 0.5) / 2 / vt, (W / 0.52) / 2 / (vt * a));
    S.lookY = portrait ? CY - 0.9 : CY - 0.42;
    S.camY = portrait ? CY + 0.1 : CY + 0.08;
  }
  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 0 ? ease.inOut(clamp(local)) : 0;
    S.camX = damp(S.camX, S.active * SP, 3.4, dt);
    const vx = (S.camX - S.lastCamX) / Math.max(dt, 1e-3); S.lastCamX = S.camX;
    panels.forEach((p, i) => {
      const on = i === S.active;
      p.u.uDim.value = damp(p.u.uDim.value, on ? 0.9 : 0.14, 4, dt);
      p.z = damp(p.z, on ? 0.3 : 0, 4, dt);
      p.w += (-9 * p.ang - 1.1 * p.w - vx * 0.0024) * dt; p.ang += p.w * dt;
      p.wx += (-9 * p.angX - 1.1 * p.wx) * dt; p.angX += p.wx * dt;
      p.pivot.rotation.set(p.angX * 0.4, 0, p.ang * 0.35);
      p.pg.position.z = p.z;
    });
    const want = st.visible && videos[S.active] ? S.active : -1;
    if (want !== S.videoOn) {
      videos.forEach((v, i) => { if (v && i !== want && !v.paused) v.pause(); });
      if (want >= 0) { const v = videos[want]; v.preload = 'auto'; v.play().catch(() => {}); }
      S.videoOn = want;
    }
    const px = input.x * 0.25, py = input.y * 0.1;
    camera.position.set(S.camX + px, S.camY + py + inE * 3.2 - outE * 1.6, S.camZ + inE * 1.0 - outE * 0.6);
    look.set(S.camX + px * 0.4, S.lookY + inE * 1.6 - outE * 3.4, 0);
    camera.lookAt(look);
    scene.userData.stars.uniforms.uTime.value = t;
  }

  return {
    scene, camera, applyAspect, update, setActive, N,
    get active() { return S.active; },
    setPx(px) { scene.userData.stars.uniforms.uPx.value = px; },
    pick(ndc) { ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(screens, false)[0]; return h ? h.object.userData.index : -1; },
    pauseAll() { videos.forEach((v) => v && !v.paused && v.pause()); S.videoOn = -1; },
    // the active screen's corners in CSS pixels: tl, tr, br, bl
    screenQuad(w, h) {
      const s = panels[S.active].screen;
      s.updateWorldMatrix(true, false);
      return corners.map((c) => { v3.copy(c).applyMatrix4(s.matrixWorld).project(camera); return [(v3.x * 0.5 + 0.5) * w, (-v3.y * 0.5 + 0.5) * h]; });
    },
  };
}
