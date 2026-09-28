import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// The top floor: the SC monogram in glossy vermillion, floating on the right and following the cursor.
const SC = [
  'M265.617 0H726.382V201.231H265.617C239.718 201.231 226.769 210.555 226.769 229.204C226.769 246.35 239.718 254.922 265.617 254.922H482.9C572.944 254.922 639.65 272.368 683.016 307.26C726.683 341.851 748.517 397.498 748.517 474.2C748.517 550.903 726.683 606.549 683.016 641.141C639.65 675.732 572.944 693.027 482.9 693.027H22.1348V491.797H482.9C508.799 491.797 521.748 482.472 521.748 463.823C521.748 446.678 508.799 438.105 482.9 438.105H265.617C175.572 438.105 108.716 420.81 65.0491 386.218C21.683 351.326 0 295.529 0 218.827C0 142.125 21.683 86.478 65.0491 51.8868C108.716 17.2956 175.572 0 265.617 0Z',
  'M1478.78 0V201.231H1084.88C1018.62 201.231 985.494 224.392 985.494 270.714V422.314C985.494 468.636 1018.62 491.797 1084.88 491.797H1478.78V693.027H1084.88C974.352 693.027 892.287 671.671 838.682 628.959C785.077 586.246 758.274 517.364 758.274 422.314V270.714C758.274 175.663 785.077 106.782 838.682 64.069C892.287 21.3563 974.352 0 1084.88 0H1478.78Z',
];
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function createHero(canvas, { mobile }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1478.78 693.027">${SC.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
  const data = new SVGLoader().parse(svg);
  const mat = new THREE.MeshPhysicalMaterial({ color: '#ff2a0c', metalness: 0.45, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.2, sheenColor: new THREE.Color('#ff8a60') });
  const mono = new THREE.Group();
  data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((sh) => {
    const g = new THREE.ExtrudeGeometry(sh, { depth: 190, bevelEnabled: true, bevelThickness: 30, bevelSize: 20, bevelSegments: 10, curveSegments: 40 });
    mono.add(new THREE.Mesh(g, mat));
  }));
  const box = new THREE.Box3().setFromObject(mono), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  mono.children.forEach((m) => m.geometry.translate(-c.x, -c.y, -c.z));
  const unit = 1 / size.x; mono.scale.set(unit, -unit, unit);
  const holder = new THREE.Group(); holder.add(mono); scene.add(holder);

  // light: a soft key, a hot rim from behind, a warm fill from below
  const key = new THREE.DirectionalLight('#fff4ec', 2.6); key.position.set(-3, 4, 6); scene.add(key);
  const rim = new THREE.PointLight('#ff3a10', 40, 18, 1.6); rim.position.set(3, 1.5, -3); scene.add(rim);
  const rim2 = new THREE.PointLight('#ffffff', 14, 14, 1.6); rim2.position.set(-3.5, -1.2, -2.5); scene.add(rim2);
  const fill = new THREE.PointLight('#ff6a3a', 6, 12, 1.6); fill.position.set(0, -3, 4); scene.add(fill);

  // a quiet glow behind it
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    transparent: true, premultipliedAlpha: true, depthWrite: false, uniforms: { uA: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uA; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.4); float g = a * 0.3 * uA; gl_FragColor = vec4(vec3(1.0, 0.13, 0.02) * g, g); }',
  }));
  glow.position.z = -2.5; scene.add(glow);

  const S = { w: 1, x: 1.5, y: 0.25, scale: 3.6, enter: 0, t0: -1, px: 0, py: 0, spin: 0, spinV: 0 };
  function resize(w, h, dpr) {
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), vw = vh * camera.aspect;
    const portrait = w / h < 0.9;
    S.scale = portrait ? vw * 0.78 : Math.min(vw * 0.42, vh * 0.95);
    S.x = portrait ? 0 : vw * 0.2;
    S.y = portrait ? vh * 0.13 : vh * 0.05;
    glow.scale.set(S.scale * 2.2, S.scale * 1.6, 1); glow.position.set(S.x, S.y, -2.5);
  }
  function render(t, dt, pointer, visible) {
    if (!visible) return;
    if (S.t0 < 0) S.t0 = t;
    const e = easeOut(clamp((t - S.t0) / 2.2));
    S.px += (pointer.x - S.px) * (1 - Math.exp(-dt * 3));
    S.py += (pointer.y - S.py) * (1 - Math.exp(-dt * 3));
    S.spinV *= Math.exp(-dt * 2.2); S.spin += S.spinV * dt;
    const s = S.scale * (0.72 + 0.28 * e);
    holder.scale.setScalar(s);
    holder.position.set(S.x, S.y + Math.sin(t * 0.8) * 0.06 - (1 - e) * 0.8, 0);
    holder.rotation.set(0.1 - S.py * 0.28 + Math.sin(t * 0.5) * 0.04, -0.42 + S.px * 0.42 + (1 - easeInOut(clamp((t - S.t0) / 2.4))) * -1.6 + S.spin, 0.02 + Math.sin(t * 0.37) * 0.02);
    rim.position.set(S.x + 2.5 + S.px, 1.5, -3);
    glow.material.uniforms.uA.value = e;
    renderer.render(scene, camera);
  }
  return { resize, render, kick(v = 6) { S.spinV += v; }, restart() { S.t0 = -1; } };
}
