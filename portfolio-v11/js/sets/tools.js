import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { clamp, lerp, ease, input, loadGLB, lightShaft, dust } from '../util.js';
import { SKILLS } from '../data.js';

// 02 What I do. One tool at a time on a slow turntable under a single light. Tools sink into the
// plinth and the next one rises out of it. Drag to spin.
export async function createTools({ env, mobile, audio, gltf }) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.3;
  scene.fog = new THREE.Fog('#050404', 7, 15);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const stage = new THREE.Group(); scene.add(stage);

  // backdrop: a far wall with a warm breath behind the plinth
  const back = new THREE.Mesh(new THREE.PlaneGeometry(70, 36), new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uA: { value: new THREE.Color('#1a0c05') }, uB: { value: new THREE.Color('#040303') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; varying vec2 vUv; void main(){ float d = length((vUv - vec2(0.5, 0.47)) * vec2(1.5, 1.0)); gl_FragColor = vec4(mix(uA, uB, smoothstep(0.0, 0.3, d)), 1.0); }',
  }));
  back.position.set(0, 4, -14); stage.add(back);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: '#080707', roughness: 0.38, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !mobile; stage.add(floor);

  const PT = 0.34; // plinth top
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.36, PT, 96), new THREE.MeshStandardMaterial({ color: '#171412', roughness: 0.62, metalness: 0.15 }));
  plinth.position.y = PT / 2; plinth.castShadow = plinth.receiveShadow = !mobile; stage.add(plinth);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.02, 96), new THREE.MeshStandardMaterial({ color: '#241e1a', roughness: 0.4, metalness: 0.3 }));
  table.position.y = PT + 0.01; table.receiveShadow = !mobile; stage.add(table);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5c00').multiplyScalar(1.6) });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.305, 0.01, 8, 160), ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = PT + 0.002; stage.add(ring);

  // light
  const spot = new THREE.SpotLight('#ffe2bd', 70, 16, 0.34, 0.8, 1.2);
  spot.position.set(0, 6.6, 1.4); spot.target.position.set(0, 0.8, 0); stage.add(spot); stage.add(spot.target);
  spot.castShadow = !mobile; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; spot.shadow.radius = 4;
  const rimL = new THREE.PointLight('#ff5c00', 8, 4.5, 1.6); rimL.position.set(-1.1, 2.1, -1.5); stage.add(rimL);
  const rimR = new THREE.PointLight('#ff8a3d', 5, 4.5, 1.6); rimR.position.set(1.2, 1.3, -1.5); stage.add(rimR);
  scene.add(new THREE.HemisphereLight('#4a5070', '#0c0705', 0.16));
  const shaft = lightShaft({ rTop: 0.12, rBot: 1.75, height: 6.4, color: '#ffcf9c', strength: 0.06 });
  shaft.position.set(0, 6.5, 0.2); stage.add(shaft);
  const motes = dust({ count: mobile ? 320 : 700, radius: 2, yMin: 0.2, yMax: 6.2, beam: 0.9, size: 30 });
  stage.add(motes);

  // tools
  const clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(PT + 0.012));
  const holder = new THREE.Group(); holder.position.y = PT + 0.012; stage.add(holder);
  const HEIGHT = { camera: 1.9, stamp: 0.95, handplane: 0.72, anvil: 0.95, armillary: 1.75 };
  const TURN = { camera: -0.6, stamp: 0.5, handplane: 0.4, anvil: 0.5, armillary: 0 };
  const tools = new Array(SKILLS.length).fill(null);
  const prep = (obj) => {
    obj.traverse((o) => { if (o.isMesh) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { m.clippingPlanes = [clip]; m.clipShadows = true; }); } });
    obj.visible = false; holder.add(obj);
  };
  const jobs = SKILLS.map(async (s, i) => {
    if (s.tool === 'sunburst') return;
    try {
      const m = await loadGLB(gltf, `assets/models/${s.tool}.glb`, HEIGHT[s.tool], { shadow: !mobile, env: 0.9 });
      m.children[0].rotation.y = TURN[s.tool];
      prep(m); tools[i] = m;
    } catch (e) { console.warn('tool failed', s.tool, e); }
  });
  // the mark, extruded in orange
  const sunIdx = SKILLS.findIndex((s) => s.tool === 'sunburst');
  jobs.push((async () => {
    const txt = await (await fetch('assets/brand/sunburst.svg')).text();
    const data = new SVGLoader().parse(txt.replace(/currentColor/g, '#ff5c00'));
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: '#ff5a0a', roughness: 0.32, metalness: 0.25, emissive: '#ff3a00', emissiveIntensity: 0.28 });
    data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((sh) => {
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 46, bevelEnabled: true, bevelThickness: 5, bevelSize: 4, bevelSegments: 3, curveSegments: 24 });
      const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = !mobile; g.add(mesh);
    }));
    const box = new THREE.Box3().setFromObject(g); const c = box.getCenter(new THREE.Vector3()); const sz = box.getSize(new THREE.Vector3());
    g.children.forEach((m) => m.geometry.translate(-c.x, -c.y, -c.z));
    const s = 1.3 / sz.x; g.scale.set(s, -s, s);
    const w = new THREE.Group(); w.add(g); g.position.y = sz.y * s / 2 + 0.28;
    // a thin brass stem so it reads as an object on the table
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 12), new THREE.MeshStandardMaterial({ color: '#c8963e', metalness: 1, roughness: 0.3 }));
    stem.position.y = 0.15; w.add(stem);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 32), new THREE.MeshStandardMaterial({ color: '#1c1714', metalness: 0.5, roughness: 0.4 }));
    foot.position.y = 0.025; w.add(foot);
    w.userData.float = g;
    prep(w); tools[sunIdx] = w;
  })());
  await Promise.all(jobs);

  const S = { cur: 0, prev: -1, swapT: 1, knocked: true, spin: 0, spinV: 0, stageX: 1.35, camZ: 6.2, camY: 1.95, lookY: 1.0, lastDrag: 0 };
  if (tools[0]) tools[0].visible = true;
  const look = new THREE.Vector3();

  function setSkill(k) {
    if (k === S.cur && S.swapT >= 1) return;
    S.prev = S.cur; S.cur = k; S.swapT = 0; S.knocked = false;
    audio.tickUI();
  }

  function applyAspect(a) {
    camera.aspect = a;
    const portrait = a < 0.8;
    camera.fov = portrait ? 40 : 30;
    camera.updateProjectionMatrix();
    S.stageX = portrait ? 0 : a > 1.9 ? 1.9 : 1.45;
    S.camZ = portrait ? 8.6 : 6.3;
    S.camY = portrait ? 2.9 : 2.0;
    S.lookY = portrait ? 0.35 : 1.0;
    stage.position.x = S.stageX;
  }

  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    const outE = local > 0 ? ease.inOut(clamp(local)) : 0;
    // turntable
    S.spinV += (input.drag - S.lastDrag) * 0.012; S.lastDrag = input.drag;
    S.spinV *= Math.exp(-2.2 * dt);
    S.spin += (0.32 + S.spinV) * dt;
    holder.rotation.y = S.spin;
    // swap
    if (S.swapT < 1) S.swapT = Math.min(1, S.swapT + dt / 1.05);
    const tOut = clamp(S.swapT / 0.42), tIn = clamp((S.swapT - 0.28) / 0.72);
    tools.forEach((m, i) => {
      if (!m) return;
      const isCur = i === S.cur, isPrev = i === S.prev && S.swapT < 1;
      m.visible = isCur || isPrev;
      if (isPrev && !isCur) { m.position.y = -ease.in(tOut) * 2.4; m.rotation.y = tOut * 0.8; }
      if (isCur) { m.position.y = S.swapT >= 1 ? 0 : lerp(-2.5, 0, ease.back(tIn)); m.rotation.y = (1 - tIn) * -0.9; }
      if (m.userData.float) m.userData.float.position.y = 0.94 + Math.sin(t * 1.3) * 0.05;
    });
    if (!S.knocked && tIn > 0.5) { S.knocked = true; audio.knock(); }
    ringMat.color.setRGB(1, 0.107, 0).multiplyScalar(1.4 + 4 * Math.sin(Math.PI * clamp(S.swapT / 0.95)) + 0.3 * Math.sin(t * 2));
    // camera
    const px = input.x * 0.3, py = input.y * 0.14;
    camera.position.set(px * (1 - inE), S.camY + py + inE * 3.4 - outE * 2.7, S.camZ + inE * 1.2);
    look.set(S.stageX * 0.42 + px * 0.2, S.lookY + inE * 1.6 - outE * 3.5, 0);
    camera.lookAt(look);
    shaft.material.uniforms.uTime.value = t;
    motes.material.uniforms.uTime.value = t;
  }

  return { scene, camera, applyAspect, update, setSkill, setPx(px) { motes.material.uniforms.uPx.value = px; }, get cur() { return S.cur; } };
}
