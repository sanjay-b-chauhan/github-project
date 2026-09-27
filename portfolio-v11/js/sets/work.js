import * as THREE from 'three';
import { clamp, lerp, damp, ease, input, mulberry, glowDisc } from '../util.js';
import { CASES, WORK } from '../data.js';

// 03 Work. Every project hangs on two orange threads in the dark, over a black mirror floor,
// with the city out of focus behind. Arrows slide the row; the frames swing when it moves.
export function createWork({ mobile, texLoader }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const N = WORK.length, W = 3.2, H = 2.0, CY = 1.6, TH = 7;
  let SP = 3.9;

  // distant city, out of focus
  {
    const r = mulberry(21), n = mobile ? 160 : 300, p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n);
    const warm = [new THREE.Color('#ff9a3c'), new THREE.Color('#ffd08a'), new THREE.Color('#ff5c00'), new THREE.Color('#9fb0ff')];
    for (let i = 0; i < n; i++) {
      p[i * 3] = -18 + r() * (N * 4 + 36); p[i * 3 + 1] = 0.4 + Math.pow(r(), 1.8) * 9; p[i * 3 + 2] = -22 - r() * 16;
      const col = warm[r() < 0.05 ? 3 : Math.floor(r() * 3)]; c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; s[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uPx: { value: 1 }, uTime: { value: 0 } },
      vertexShader: 'attribute vec3 color; attribute float rnd; uniform float uPx, uTime; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; vC = color * (0.04 + 0.08 * rnd) * (0.8 + 0.2 * sin(uTime * 0.5 + rnd * 30.0)); gl_PointSize = (28.0 + rnd * 70.0) * uPx * 10.0 / -mv.z; }',
      fragmentShader: 'varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = length(q) * 2.0; if (d > 1.0) discard; float a = smoothstep(1.0, 0.82, d) * 0.7 + smoothstep(0.9, 0.0, d) * 0.3; gl_FragColor = vec4(vC * a, 1.0); }',
    });
    const bokeh = new THREE.Points(g, m); bokeh.frustumCulled = false; scene.add(bokeh);
    scene.userData.bokeh = m;
  }
  // haze band along the horizon
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(200, 14), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; void main(){ float a = exp(-pow((vUv.y - 0.32) * 5.0, 2.0)); gl_FragColor = vec4(vec3(0.09, 0.035, 0.012) * a, 1.0); }',
  }));
  haze.position.set(N * 2, 3, -24); scene.add(haze);

  // mirror floor tint
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 80), new THREE.MeshBasicMaterial({ color: '#050404', transparent: true, opacity: 0.55, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(N * 2, 0, -10); floor.renderOrder = 2; scene.add(floor);
  const pool = glowDisc({ size: 7, color: '#ffe0bf', strength: 0.18, falloff: 2.6 });
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.01; pool.scale.set(1, 0.55, 1); pool.renderOrder = 3; scene.add(pool);

  const screenVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
  const screenFS = /* glsl */`
    uniform sampler2D map; uniform float uDim, uTex, uPlane, uContain, uReady, uMirror; uniform vec3 uBg; varying vec2 vUv;
    void main(){
      vec2 uv = vUv; float ra = uPlane / max(uTex, 0.01);
      bool inside = true;
      if (uContain > 0.5) { if (ra > 1.0) { uv.x = (uv.x - 0.5) * ra + 0.5; inside = uv.x > 0.0 && uv.x < 1.0; } else { uv.y = (uv.y - 0.5) / ra + 0.5; inside = uv.y > 0.0 && uv.y < 1.0; } }
      else { if (ra < 1.0) uv.x = (uv.x - 0.5) * ra + 0.5; else uv.y = (uv.y - 0.5) / ra + 0.5; }
      vec3 c = inside ? texture2D(map, uv).rgb : uBg;
      c = mix(vec3(0.02), c, uReady) * uDim;
      if (uMirror > 0.5) c *= pow(1.0 - vUv.y, 2.2) * 0.2;
      gl_FragColor = vec4(c, 1.0);
    }`;

  const threadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5c00').multiplyScalar(2.2) });
  const frameMat = new THREE.MeshStandardMaterial({ color: '#0e0c0b', roughness: 0.5, metalness: 0.6 });
  const clipMat = new THREE.MeshStandardMaterial({ color: '#c8963e', roughness: 0.3, metalness: 1 });
  const threadGeo = new THREE.CylinderGeometry(0.006, 0.006, TH, 6, 1, true);
  const screenGeo = new THREE.PlaneGeometry(W, H);
  const panels = [], screens = [], videos = [];
  scene.add(new THREE.HemisphereLight('#8088a8', '#100a06', 0.6));
  const key = new THREE.DirectionalLight('#ffe6cc', 0.9); key.position.set(2, 6, 8); scene.add(key);

  WORK.forEach((id, i) => {
    const cs = CASES[id];
    const pivot = new THREE.Group(); pivot.position.set(i * SP, CY + H / 2 + TH, 0); scene.add(pivot);
    const pg = new THREE.Group(); pg.position.y = -(TH + H / 2); pivot.add(pg);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(W + 0.07, H + 0.07, 0.045), frameMat); frame.position.z = -0.025; pg.add(frame);
    const u = {
      map: { value: null }, uDim: { value: 0.3 }, uTex: { value: 1.6 }, uPlane: { value: W / H }, uContain: { value: cs.media.contain ? 1 : 0 },
      uReady: { value: 0 }, uMirror: { value: 0 }, uBg: { value: new THREE.Color('#efe6d6') },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: screenVS, fragmentShader: screenFS });
    const screen = new THREE.Mesh(screenGeo, mat); screen.userData.index = i; pg.add(screen); screens.push(screen);
    const mu = { ...u, uMirror: { value: 1 } };
    const mirror = new THREE.Mesh(screenGeo, new THREE.ShaderMaterial({ uniforms: mu, vertexShader: screenVS, fragmentShader: screenFS, depthWrite: false }));
    mirror.position.y = -2 * CY; mirror.scale.y = -1; mirror.renderOrder = 1; pg.add(mirror);
    for (const sx of [-1, 1]) {
      const th = new THREE.Mesh(threadGeo, threadMat); th.position.set(sx * W * 0.38, H / 2 + TH / 2, 0); pg.add(th);
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.07), clipMat); clip.position.set(sx * W * 0.38, H / 2 + 0.02, 0); pg.add(clip);
    }
    const setTex = (tex, aspect) => { u.map.value = tex; mu.map.value = tex; u.uTex.value = aspect; mu.uTex.value = aspect; };
    const poster = cs.media.poster || cs.media.image;
    texLoader.load(poster, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      if (!u.map.value || !u.map.value.isVideoTexture) setTex(tex, tex.image.width / tex.image.height);
      u.uReady.value = 1; mu.uReady.value = 1;
    });
    if (cs.media.video) {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'none', crossOrigin: 'anonymous' });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.src = cs.media.video;
      v.addEventListener('playing', () => {
        if (u.map.value && u.map.value.isVideoTexture) return;
        const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace;
        setTex(vt, (v.videoWidth || 16) / (v.videoHeight || 10));
        u.uReady.value = 1; mu.uReady.value = 1;
      });
      videos[i] = v;
    }
    panels.push({ pivot, pg, u, mu, ang: 0, w: 0, angX: 0, wx: 0, z: 0 });
  });

  const S = { active: 0, camX: 0, camZ: 6.4, camY: 1.62, lookY: 1.42, lastCamX: 0, videoOn: -1, off: 0 };
  const look = new THREE.Vector3();
  const ray = new THREE.Raycaster();

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
    camera.fov = portrait ? 40 : 30;
    camera.updateProjectionMatrix();
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    S.camZ = portrait ? (W * 1.1) / 2 / (vt * a) : Math.max((H / 0.5) / 2 / vt, (W / 0.52) / 2 / (vt * a));
    S.off = portrait ? 0 : Math.min(1.25, (S.camZ * vt * a) * 0.36);
    S.lookY = portrait ? CY - 0.55 : CY - 0.12;
    S.camY = portrait ? CY + 0.3 : CY + 0.05;
  }

  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 0 ? ease.inOut(clamp(local)) : 0;
    const tx = S.active * SP;
    S.camX = damp(S.camX, tx, 3.4, dt);
    const vx = (S.camX - S.lastCamX) / Math.max(dt, 1e-3); S.lastCamX = S.camX;
    panels.forEach((p, i) => {
      const on = i === S.active;
      p.u.uDim.value = p.mu.uDim.value = damp(p.u.uDim.value, on ? 0.9 : 0.2, 4, dt);
      p.z = damp(p.z, on ? 0.35 : 0, 4, dt);
      p.w += (-9 * p.ang - 1.1 * p.w - vx * 0.0025) * dt; p.ang += p.w * dt;
      p.wx += (-9 * p.angX - 1.1 * p.wx) * dt; p.angX += p.wx * dt;
      p.pivot.rotation.set(p.angX * 0.4, 0, p.ang * 0.35);
      p.pg.position.z = p.z;
    });
    pool.position.x = S.camX;
    // play only the video on screen
    const want = st.visible && videos[S.active] ? S.active : -1;
    if (want !== S.videoOn) {
      videos.forEach((v, i) => { if (v && i !== want && !v.paused) v.pause(); });
      if (want >= 0) { const v = videos[want]; v.preload = 'auto'; v.play().catch(() => {}); }
      S.videoOn = want;
    }
    const px = input.x * 0.28, py = input.y * 0.12;
    camera.position.set(S.camX - S.off + px, S.camY + py + inE * 3.2 - outE * 1.6, S.camZ + inE * 1.0 - outE * 0.6);
    look.set(S.camX - S.off + px * 0.4, S.lookY + inE * 1.6 - outE * 3.4, 0);
    camera.lookAt(look);
    scene.userData.bokeh.uniforms.uTime.value = t;
  }

  return {
    scene, camera, applyAspect, update, setActive, N,
    get active() { return S.active; },
    setPx(px) { scene.userData.bokeh.uniforms.uPx.value = px; },
    pick(ndc) { ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(screens, false)[0]; return h ? h.object.userData.index : -1; },
    pauseAll() { videos.forEach((v) => v && !v.paused && v.pause()); S.videoOn = -1; },
  };
}
