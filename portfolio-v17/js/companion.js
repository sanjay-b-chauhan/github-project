import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { pointer } from './track.js';

// The companion: one chrome SC that travels the whole site, the way a single object carries
// a story from the top of a page to the bottom. Each set gives it an anchor in its own world;
// it is drawn on top of both sets during a dissolve, so it stays solid while the rooms change.
const SC = [
  'M265.617 0H726.382V201.231H265.617C239.718 201.231 226.769 210.555 226.769 229.204C226.769 246.35 239.718 254.922 265.617 254.922H482.9C572.944 254.922 639.65 272.368 683.016 307.26C726.683 341.851 748.517 397.498 748.517 474.2C748.517 550.903 726.683 606.549 683.016 641.141C639.65 675.732 572.944 693.027 482.9 693.027H22.1348V491.797H482.9C508.799 491.797 521.748 482.472 521.748 463.823C521.748 446.678 508.799 438.105 482.9 438.105H265.617C175.572 438.105 108.716 420.81 65.0491 386.218C21.683 351.326 0 295.529 0 218.827C0 142.125 21.683 86.478 65.0491 51.8868C108.716 17.2956 175.572 0 265.617 0Z',
  'M1478.78 0V201.231H1084.88C1018.62 201.231 985.494 224.392 985.494 270.714V422.314C985.494 468.636 1018.62 491.797 1084.88 491.797H1478.78V693.027H1084.88C974.352 693.027 892.287 671.671 838.682 628.959C785.077 586.246 758.274 517.364 758.274 422.314V270.714C758.274 175.663 785.077 106.782 838.682 64.069C892.287 21.3563 974.352 0 1084.88 0H1478.78Z',
];

export function createCompanion(renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.1, 100);
  camera.position.set(0, 0, 12);
  // chrome needs something to reflect: a red doorway, a white softbox, a warm side card
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  const card = (w, h, col, pos, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(...col), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); env.add(m); };
  card(14, 20, [6, 0.15, 0.08], [0, 0, -6], [0, 0, 0]);
  card(12, 3, [2.6, 2.5, 2.4], [-2, 7, 3], [Math.PI / 2.4, 0, 0]);
  card(3, 10, [0.9, 0.35, 0.2], [7, 0, 2], [0, -Math.PI / 2.5, 0]);
  card(3, 8, [1.6, 1.6, 1.7], [-7, -1, 1], [0, Math.PI / 2.3, 0]);
  card(16, 9, [1.25, 1.2, 1.15], [0, 1, 9], [0, 0, 0]); // behind the viewer: the face reads silver
  const pm = new THREE.PMREMGenerator(renderer);
  const envMap = pm.fromScene(env, 0.02).texture; pm.dispose();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.05, envMap, envMapIntensity: 1.25 });
  const mono = new THREE.Group();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1478.78 693.027">${SC.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
  const data = new SVGLoader().parse(svg);
  const inner = new THREE.Group();
  data.paths.forEach((pth) => SVGLoader.createShapes(pth).forEach((sh) => {
    inner.add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 170, bevelEnabled: true, bevelThickness: 26, bevelSize: 18, bevelSegments: 8, curveSegments: 32 }), mat));
  }));
  const box = new THREE.Box3().setFromObject(inner), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
  inner.children.forEach((m) => m.geometry.translate(-c.x, -c.y, -c.z));
  const k = 1 / sz.x; inner.scale.set(k, -k, k); // unit width
  mono.add(inner);
  scene.add(mono);

  const tmp = new THREE.Vector3(), right = new THREE.Vector3();
  const A = { pos: new THREE.Vector3(), size: 1, k: 1, spin: 0, ndc: null };
  const B = { pos: new THREE.Vector3(), size: 1, k: 1, spin: 0, ndc: null };
  const cur = { x: 0, y: 0, s: 0, k: 0, spin: 0 }, turn = { a: 0 };
  let aspect = 1.6, halfH = 12 * Math.tan(THREE.MathUtils.degToRad(15));
  // anchor in a set's world -> pose in screen space (x, y in NDC, s = width in half heights)
  function pose(set, o, out) {
    o.ndc = null; o.k = 1; o.spin = 0;
    if (!set.anchor) { out.x = 0; out.y = 0; out.s = 0; out.k = 0; out.spin = 0; return out; }
    set.anchor(o);
    if (o.ndc) { out.x = o.ndc[0]; out.y = o.ndc[1]; out.s = o.ndc[2]; }
    else {
      const cam = set.camera;
      cam.updateMatrixWorld();
      tmp.copy(o.pos).project(cam);
      right.setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(o.size / 2).add(o.pos).project(cam);
      const behind = tmp.z > 1;
      out.x = tmp.x; out.y = tmp.y;
      out.s = behind ? 0 : Math.min(0.95, Math.abs(right.x - tmp.x) * 2 * aspect);
    }
    out.k = o.k; out.spin = o.spin;
    return out;
  }
  const pa = {}, pb = {};
  return {
    scene, camera,
    resize(w, h) { aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix(); },
    // mix two sets' anchors, then place the mark
    update(dt, t, setA, setB, mix) {
      pose(setA, A, pa);
      if (setB) { pose(setB, B, pb); for (const key of ['x', 'y', 's', 'k', 'spin']) pa[key] += (pb[key] - pa[key]) * mix; }
      const f = 1 - Math.exp(-dt * 10);
      for (const key of ['x', 'y', 's', 'k', 'spin']) cur[key] += (pa[key] - cur[key]) * f;
      mono.position.set(cur.x * halfH * aspect, cur.y * halfH + Math.sin(t * 0.8) * 0.03 * cur.s * halfH, 0);
      const s = Math.max(0.0001, cur.s * halfH * cur.k);
      mono.scale.setScalar(s);
      mono.rotation.set(Math.sin(t * 0.27) * 0.07 - pointer.y * 0.14, Math.sin(t * 0.35) * 0.38 + pointer.x * 0.3, 0);
      mono.visible = s > 0.002;
      mat.envMapIntensity = 0.2 + 1.05 * cur.k;
    },
  };
}
