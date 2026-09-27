import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, damp, ease, input, mulberry, loadGLB, lightShaft } from '../util.js';

// 05 Roots. Three generations, three materials, one craft: my grandfather's wood, my father's
// concrete, my pixels. One light comes on for each. An orange thread runs across all three.
export async function createRoots({ env, mobile, gltf, audio }) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.16;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const row = new THREE.Group(); scene.add(row);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(80, 36), new THREE.ShaderMaterial({
    depthWrite: false, uniforms: { uA: { value: new THREE.Color('#140a05') }, uB: { value: new THREE.Color('#040303') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; varying vec2 vUv; void main(){ float d = length((vUv - vec2(0.5, 0.42)) * vec2(1.2, 1.4)); gl_FragColor = vec4(mix(uA, uB, smoothstep(0.0, 0.35, d)), 1.0); }',
  }));
  back.position.set(0, 4, -12); scene.add(back);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: '#0c0a09', roughness: 0.55, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !mobile; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#3e4466', '#0b0604', 0.12));

  const PH = 0.5, CUBE = 1.05;
  const plinthMat = new THREE.MeshStandardMaterial({ color: '#161311', roughness: 0.7, metalness: 0.1 });
  const items = [0, 1, 2].map((k) => {
    const g = new THREE.Group(); row.add(g);
    const pl = new THREE.Mesh(new RoundedBoxGeometry(1.5, PH, 1.5, 3, 0.03), plinthMat);
    pl.position.y = PH / 2; pl.castShadow = pl.receiveShadow = !mobile; g.add(pl);
    const spot = new THREE.SpotLight('#ffe0b8', 0, 12, 0.3, 0.75, 1.2);
    spot.position.set(0, 5.6, 1.0); spot.target.position.set(0, PH + 0.5, 0); g.add(spot); g.add(spot.target);
    if (!mobile) { spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0006; spot.shadow.radius = 3; }
    const shaft = lightShaft({ rTop: 0.1, rBot: 1.15, height: 5.4, color: '#ffcf9c', strength: 0 }); shaft.position.set(0, 5.6, 0.1); g.add(shaft);
    return { g, spot, shaft, obj: null, on: 0, lit: false, t: 0 };
  });

  const load = async (url, k, env2) => {
    try {
      const m = await loadGLB(gltf, url, CUBE, { shadow: !mobile, env: env2 });
      m.position.y = PH; m.children[0].rotation.y = k === 0 ? -0.55 : 0.5; items[k].g.add(m); items[k].obj = m;
    } catch (e) { console.warn('roots model failed', url, e); }
  };
  await Promise.all([load('assets/models/wood.glb', 0, 0.8), load('assets/models/concrete.glb', 1, 0.6)]);

  // pixels: a 5 x 5 x 5 cube of voxels that assembles when its light comes on
  const G = 5, VS = 0.19, STEP = CUBE / G;
  const vox = new THREE.InstancedMesh(new RoundedBoxGeometry(VS, VS, VS, 2, 0.02), new THREE.MeshStandardMaterial({ color: '#ff5c00', emissive: '#ff3c00', emissiveIntensity: 0.32, roughness: 0.38, metalness: 0.1 }), G * G * G);
  vox.castShadow = !mobile;
  const vr = mulberry(17), base = [], scat = [], phase = [];
  for (let x = 0; x < G; x++) for (let y = 0; y < G; y++) for (let z = 0; z < G; z++) {
    base.push(new THREE.Vector3((x - (G - 1) / 2) * STEP, PH + STEP / 2 + y * STEP, (z - (G - 1) / 2) * STEP));
    scat.push(new THREE.Vector3((vr() - 0.5) * 3.4, PH + 0.6 + vr() * 3.2, (vr() - 0.5) * 2.6));
    phase.push(vr());
  }
  items[2].g.add(vox); items[2].obj = vox;
  const vcol = new THREE.Color();
  for (let i = 0; i < G * G * G; i++) vox.setColorAt(i, vcol.setRGB(1, 1, 1));

  // the thread across the three tops
  const threadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5c00').multiplyScalar(2.2) });
  let thread = null;
  function buildThread(xs) {
    if (thread) { row.remove(thread); thread.geometry.dispose(); }
    const top = PH + CUBE + 0.012, pts = [new THREE.Vector3(xs[0] - 6, top + 1.6, 0.1)];
    xs.forEach((x, i) => {
      pts.push(new THREE.Vector3(x, top, 0));
      if (i < xs.length - 1) pts.push(new THREE.Vector3((x + xs[i + 1]) / 2, top - 0.32, 0.02));
    });
    pts.push(new THREE.Vector3(xs[2] + 6, top + 1.6, 0.1));
    thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 220, 0.0075, 6, false), threadMat);
    row.add(thread);
  }

  const S = { gap: 2.45, rowX: 1.3, camZ: 9, camY: 2.6, lookY: 1.0, T: 0, wasVisible: false, portrait: false };
  const dummy = new THREE.Object3D(), look = new THREE.Vector3(), tmp = new THREE.Vector3();

  function layout() {
    const xs = [-S.gap, 0, S.gap];
    items.forEach((it, k) => it.g.position.set(xs[k], 0, 0));
    row.position.x = S.rowX;
    buildThread(xs);
  }
  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 40 : 30; camera.updateProjectionMatrix();
    S.gap = S.portrait ? 1.62 : 2.45;
    S.rowX = S.portrait ? 0 : a > 1.9 ? 2.1 : 1.75;
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    S.camZ = S.portrait ? (S.gap * 2 + 1.9) / 2 / (vt * a) : 9.2;
    S.camY = S.portrait ? 3.4 : 2.35;
    S.lookY = S.portrait ? -0.2 : 1.3;
    layout();
  }

  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 0 ? ease.inOut(clamp(local)) : 0;
    // the reveal clock runs while this floor is on screen, and rewinds when you leave
    if (st.settled) S.T += dt; else if (!st.visible) S.T = 0;
    if (st.ff && st.visible) S.T = Math.max(S.T, 9);
    items.forEach((it, k) => {
      const at = 0.35 + k * 0.95;
      const want = S.T > at || st.reduced ? 1 : 0;
      if (want && !it.lit) { it.lit = true; it.t = 0; audio.ding(k); }
      if (!want) it.lit = false;
      it.t += dt;
      if (st.ff && it.lit) it.t = Math.max(it.t, 3);
      // flicker on like a workshop tube light, then hold
      const flick = it.lit ? (it.t < 0.28 ? (Math.sin(it.t * 90) > 0 ? 0.9 : 0.15) : 1) : 0;
      it.on = it.lit ? (it.t < 0.28 ? flick : 1) : damp(it.on, 0, 5, dt);
      it.spot.intensity = 72 * it.on;
      it.shaft.material.uniforms.uStrength.value = 0.05 * it.on;
      it.shaft.material.uniforms.uTime.value = t;
      if (it.obj && k < 2) it.obj.rotation.y = Math.sin(t * 0.3 + k) * 0.08;
    });
    // voxels
    const asm = ease.out(clamp(items[2].t * 0.9)) * (items[2].lit ? 1 : 0);
    for (let i = 0; i < base.length; i++) {
      const b = base[i], s = scat[i], ph = phase[i];
      const a2 = clamp(asm * 1.35 - ph * 0.35);
      tmp.lerpVectors(s, b, ease.inOut(a2));
      const br = Math.sin(t * 1.4 + ph * 6.28) * 0.012 * a2;
      dummy.position.set(tmp.x * (1 + br), tmp.y + br, tmp.z * (1 + br));
      dummy.rotation.set((1 - a2) * ph * 6, (1 - a2) * ph * 4, 0);
      const sc = clamp(asm * 2.2 - ph * 0.9);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix(); vox.setMatrixAt(i, dummy.matrix);
      const blink = Math.pow(Math.max(0, Math.sin(t * 0.9 + ph * 40)), 30);
      vox.setColorAt(i, vcol.setRGB(1, 1, 1).multiplyScalar(0.3 + 0.45 * items[2].on + blink * 0.8));
    }
    vox.instanceMatrix.needsUpdate = true; vox.instanceColor.needsUpdate = true;
    // camera
    const px = input.x * 0.4, py = input.y * 0.15;
    camera.position.set(S.rowX * 0.55 + px, S.camY + py + inE * 3.4 - outE * 2.4, S.camZ + inE);
    look.set(S.rowX * 0.75 + px * 0.3, S.lookY + inE * 1.8 - outE * 3.2, 0);
    camera.lookAt(look);
  }

  return {
    scene, camera, applyAspect, update,
    lit: () => items.map((it) => it.lit),
    labels(w, h, out) {
      items.forEach((it, k) => { it.g.getWorldPosition(tmp); tmp.y = 0; tmp.z = 0.9; tmp.project(camera); out[k] = [(tmp.x * 0.5 + 0.5) * w, (-tmp.y * 0.5 + 0.5) * h]; });
      return out;
    },
  };
}
