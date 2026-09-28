import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, damp, ease, input, mulberry, loadGLB, lightShaft } from '../util.js';

// 05 Roots. Three generations, three materials, one craft: my grandfather's wood, my father's
// concrete, and my pixels (a glass block holding a lattice of red light). One white light comes
// on for each. The red thread runs across all three.
export async function createRoots({ env, neutral, mobile, gltf, audio }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = neutral; scene.environmentIntensity = 0.12;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const row = new THREE.Group(); scene.add(row);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshStandardMaterial({ color: '#060606', roughness: 0.42, metalness: 0.2, envMapIntensity: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !mobile; scene.add(floor);
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(90, 24), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; void main(){ float a = exp(-pow((vUv.y - 0.12) * 6.0, 2.0)) * (1.0 - smoothstep(0.2, 0.5, abs(vUv.x - 0.5))); gl_FragColor = vec4(vec3(0.05, 0.0, 0.0) * a, 1.0); }',
  }));
  haze.position.set(0, 2, -16); scene.add(haze);
  scene.add(new THREE.HemisphereLight('#8a8fa8', '#000000', 0.06));

  const PH = 0.5, CUBE = 1.05;
  const plinthMat = new THREE.MeshStandardMaterial({ color: '#0f0e0d', roughness: 0.6, metalness: 0.2 });
  const items = [0, 1, 2].map(() => {
    const g = new THREE.Group(); row.add(g);
    const pl = new THREE.Mesh(new RoundedBoxGeometry(1.5, PH, 1.5, 3, 0.03), plinthMat);
    pl.position.y = PH / 2; pl.castShadow = pl.receiveShadow = !mobile; g.add(pl);
    const spot = new THREE.SpotLight('#fff3e6', 0, 12, 0.3, 0.8, 1.2);
    spot.position.set(0, 5.6, 1.0); spot.target.position.set(0, PH + 0.5, 0); g.add(spot); g.add(spot.target);
    if (!mobile) { spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0006; spot.shadow.radius = 3; }
    const shaft = lightShaft({ rTop: 0.1, rBot: 1.1, height: 5.4, color: '#fff1e2', strength: 0 }); shaft.position.set(0, 5.6, 0.1); g.add(shaft);
    return { g, spot, shaft, obj: null, on: 0, lit: false, t: 0 };
  });

  const load = async (url, k, e) => {
    try {
      const m = await loadGLB(gltf, url, CUBE, { shadow: !mobile, env: e });
      m.position.y = PH; m.children[0].rotation.y = k === 0 ? -0.55 : 0.5; items[k].g.add(m); items[k].obj = m;
    } catch (err) { console.warn('roots model failed', url, err); }
  };
  await Promise.all([load('assets/models/wood.glb', 0, 0.6), load('assets/models/concrete.glb', 1, 0.5)]);

  // pixels: a glass block with a 6 x 6 x 6 lattice of red points that fly into place
  const px = new THREE.Group(); px.position.y = PH + CUBE / 2; items[2].g.add(px); items[2].obj = px;
  const glass = new THREE.Mesh(new RoundedBoxGeometry(CUBE, CUBE, CUBE, 3, 0.02), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.1, clearcoat: 1, envMap: env, envMapIntensity: 1.2, depthWrite: false }));
  px.add(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE, CUBE, CUBE)), new THREE.LineBasicMaterial({ color: new THREE.Color('#fffde2').multiplyScalar(0.55), transparent: true, opacity: 0.8 }));
  px.add(edges);
  const G = 6, NP = G * G * G, STEP = (CUBE * 0.78) / (G - 1);
  const base = new Float32Array(NP * 3), scat = new Float32Array(NP * 3), ph = new Float32Array(NP);
  const vr = mulberry(17);
  let k = 0;
  for (let x = 0; x < G; x++) for (let y = 0; y < G; y++) for (let z = 0; z < G; z++, k++) {
    base[k * 3] = (x - (G - 1) / 2) * STEP; base[k * 3 + 1] = (y - (G - 1) / 2) * STEP; base[k * 3 + 2] = (z - (G - 1) / 2) * STEP;
    scat[k * 3] = (vr() - 0.5) * 3.2; scat[k * 3 + 1] = 0.5 + vr() * 2.8; scat[k * 3 + 2] = (vr() - 0.5) * 2.4;
    ph[k] = vr();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(base, 3));
  pg.setAttribute('scat', new THREE.BufferAttribute(scat, 3));
  pg.setAttribute('ph', new THREE.BufferAttribute(ph, 1));
  const pu = { uAsm: { value: 0 }, uOn: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 } };
  const points = new THREE.Points(pg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: pu,
    vertexShader: /* glsl */`
      attribute vec3 scat; attribute float ph; uniform float uAsm, uOn, uTime, uPx; varying float vA;
      float io(float t){ return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
      void main(){
        float a = io(clamp(uAsm * 1.4 - ph * 0.4, 0.0, 1.0));
        vec3 p = mix(scat, position, a);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float blink = pow(max(0.0, sin(uTime * 0.8 + ph * 40.0)), 24.0);
        vA = a * (0.55 + 0.45 * uOn) + blink * a;
        gl_PointSize = uPx * (7.0 + 5.0 * blink) * (6.0 / -mv.z);
      }`,
    fragmentShader: 'varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q,q); if (d > 0.25) discard; float c = smoothstep(0.25, 0.0, d); gl_FragColor = vec4(vec3(1.0, 0.02, 0.01) * (c * 1.8 + pow(c, 6.0) * 2.0) * vA, 1.0); }',
  }));
  points.frustumCulled = false; px.add(points);
  const pxLight = new THREE.PointLight('#ff0101', 0, 3, 1.8); px.add(pxLight);

  // the thread across the three tops
  const threadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0101').multiplyScalar(1.9) });
  let thread = null;
  function buildThread(xs) {
    if (thread) { row.remove(thread); thread.geometry.dispose(); }
    const top = PH + CUBE + 0.012, pts = [new THREE.Vector3(xs[0] - 6, top + 1.6, 0.1)];
    xs.forEach((x, i) => {
      pts.push(new THREE.Vector3(x, top, 0));
      if (i < xs.length - 1) pts.push(new THREE.Vector3((x + xs[i + 1]) / 2, top - 0.32, 0.02));
    });
    pts.push(new THREE.Vector3(xs[2] + 6, top + 1.6, 0.1));
    thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 220, 0.0065, 6, false), threadMat);
    row.add(thread);
  }

  const S = { gap: 2.45, rowX: 1.6, camZ: 9.2, camY: 2.35, lookY: 1.3, T: 0, portrait: false };
  const look = new THREE.Vector3(), tmp = new THREE.Vector3();
  function layout() {
    const xs = [-S.gap, 0, S.gap];
    items.forEach((it, i) => it.g.position.set(xs[i], 0, 0));
    row.position.x = S.rowX;
    buildThread(xs);
  }
  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 40 : 30; camera.updateProjectionMatrix();
    S.gap = S.portrait ? 1.62 : 2.45;
    S.rowX = S.portrait ? 0 : a > 1.9 ? 2.2 : 1.75;
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    S.camZ = S.portrait ? (S.gap * 2 + 1.9) / 2 / (vt * a) : 9.2;
    S.camY = S.portrait ? 3.4 : 2.35;
    S.lookY = S.portrait ? -0.2 : 1.3;
    layout();
  }
  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 0 ? ease.inOut(clamp(local)) : 0;
    if (st.settled) S.T += dt; else if (!st.visible) S.T = 0;
    if (st.ff && st.visible) S.T = Math.max(S.T, 9);
    items.forEach((it, i) => {
      const want = S.T > 0.35 + i * 0.95 || st.reduced ? 1 : 0;
      if (want && !it.lit) { it.lit = true; it.t = 0; audio.ding(i); }
      if (!want) it.lit = false;
      it.t += dt;
      if (st.ff && it.lit) it.t = Math.max(it.t, 3);
      const flick = it.t < 0.28 ? (Math.sin(it.t * 90) > 0 ? 0.9 : 0.12) : 1;
      it.on = it.lit ? flick : damp(it.on, 0, 5, dt);
      it.spot.intensity = 70 * it.on;
      it.shaft.material.uniforms.uStrength.value = 0.035 * it.on;
      it.shaft.material.uniforms.uTime.value = t;
      if (it.obj && i < 2) it.obj.rotation.y = Math.sin(t * 0.3 + i) * 0.08;
    });
    pu.uAsm.value = items[2].lit ? ease.out(clamp(items[2].t * 0.8)) : damp(pu.uAsm.value, 0, 4, dt);
    pu.uOn.value = items[2].on; pu.uTime.value = t;
    pxLight.intensity = 3 * items[2].on * pu.uAsm.value;
    px.rotation.y = Math.sin(t * 0.25) * 0.25 + 0.4;
    const mx = input.x * 0.4, my = input.y * 0.15;
    camera.position.set(S.rowX * 0.55 + mx, S.camY + my + inE * 3.4 - outE * 2.4, S.camZ + inE);
    look.set(S.rowX * 0.75 + mx * 0.3, S.lookY + inE * 1.8 - outE * 3.2, 0);
    camera.lookAt(look);
  }
  return {
    scene, camera, applyAspect, update,
    setPx(v) { pu.uPx.value = v; },
    lit: () => items.map((it) => it.lit),
    labels(w, h, out) {
      items.forEach((it, i) => { it.g.getWorldPosition(tmp); tmp.y = 0; tmp.z = 0.9; tmp.project(camera); out[i] = [(tmp.x * 0.5 + 0.5) * w, (-tmp.y * 0.5 + 0.5) * h]; });
      return out;
    },
  };
}
