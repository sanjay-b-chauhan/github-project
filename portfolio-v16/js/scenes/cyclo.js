import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvas2d, loadSVGText } from '../util.js';
import { makeTrack, pointer } from '../track.js';

// STUDIO: Vision Beyond Ordinary as a white infinity cove. Product prints stand on plinths,
// the sunburst turns in glossy red in the middle. The only daylight room in the night.
export async function createCyclo(renderer, { mobile, shots }) {
  const scene = new THREE.Scene();
  const BG = new THREE.Color(0.86, 0.845, 0.82);
  scene.background = BG;
  scene.fog = new THREE.Fog(BG, 26, 70);
  const camera = new THREE.PerspectiveCamera(36, 1.6, 0.1, 200);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environmentIntensity = 0.5;

  // the cove: floor, a quarter cylinder, wall
  const white = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 1, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), white);
  floor.rotation.x = -Math.PI / 2; floor.position.z = 4; floor.receiveShadow = true; scene.add(floor);
  const R = 5, WZ = -16;
  const cove = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 120, 48, 1, true, Math.PI, Math.PI / 2), white);
  cove.rotation.z = Math.PI / 2; cove.position.set(0, R, WZ + R); cove.receiveShadow = true; scene.add(cove);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(120, 30), white);
  wall.position.set(0, R + 15, WZ); scene.add(wall);
  // the studio name, embossed large on the wall
  {
    const [c, g] = canvas2d(4096, 700);
    g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 4096, 700);
    g.font = '400 300px Telgra, "Inter Tight", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillStyle = 'rgba(30,26,22,0.07)'; g.fillText('BEYOND ORDINARY', 2048, 360);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const word = new THREE.Mesh(new THREE.PlaneGeometry(34, 34 * 700 / 4096), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    word.position.set(0, 8.4, WZ + 0.05); scene.add(word);
  }

  // plinths and prints
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f1, roughness: 0.85 });
  const loader = new THREE.TextureLoader();
  const spots = [[-7.4, -5.2, 1.1, 0.28], [-3.9, -3.2, 0.7, 0.12], [3.9, -3.2, 0.9, -0.12], [7.4, -5.2, 1.25, -0.28]];
  const prints = [];
  spots.forEach(([x, z, h, ry], i) => {
    const pl = new THREE.Mesh(new RoundedBoxGeometry(1.9, h, 1.9, 3, 0.04), plinthMat);
    pl.position.set(x, h / 2, z); pl.castShadow = pl.receiveShadow = true; scene.add(pl);
    const g = new THREE.Group();
    g.position.set(x, h + 1.3, z); g.rotation.set(-0.06, ry, 0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.66, 2.66, 0.08), new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.5 }));
    back.castShadow = true; g.add(back);
    const tex = loader.load(shots[i % shots.length][0]); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const img = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.94, 0.94, 0.94) }));
    img.position.z = 0.045; g.add(img);
    // a thin stand behind the print
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.06), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    leg.position.set(0, -1.3 + 0.65 - 0.65, -0.3); leg.rotation.x = 0.35; g.add(leg);
    scene.add(g); prints.push(g);
  });

  // the sunburst in glossy red on a tall plinth
  const hero = new THREE.Group();
  const heroPl = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.5, 64), plinthMat);
  heroPl.position.set(0, 0.75, -1.2); heroPl.castShadow = heroPl.receiveShadow = true; scene.add(heroPl);
  try {
    const svg = (await loadSVGText('assets/sunburst.svg')).replace(/currentColor/g, '#000');
    const data = new SVGLoader().parse(svg);
    const red = new THREE.MeshPhysicalMaterial({ color: '#ff2a0c', roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
    const m = new THREE.Group();
    data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((sh) => {
      const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 60, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 6, curveSegments: 24 }), red);
      mesh.castShadow = true; m.add(mesh);
    }));
    const box = new THREE.Box3().setFromObject(m), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
    m.children.forEach((mm) => mm.geometry.translate(-c.x, -c.y, -c.z));
    const k = 2.6 / s.x; m.scale.set(k, -k, k);
    hero.add(m);
  } catch (e) { /* the plinth stands alone */ }
  hero.position.set(0, 1.5 + 1.1, -1.2);
  scene.add(hero);

  // soft studio light
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c7, 1.4));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.4);
  key.position.set(-8, 14, 10); key.target.position.set(0, 0, -3);
  key.castShadow = true; key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 12, bottom: -8, near: 1, far: 50 });
  key.shadow.radius = 6; key.shadow.bias = -0.0005;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.PointLight(0xffffff, 30, 14, 2); rim.position.set(3, 5, -5); scene.add(rim);

  const track = makeTrack([
    { p: 0.0, pos: [-10, 3.2, 9.5], look: [-1, 1.8, -3] },
    { p: 0.5, pos: [0.4, 2.9, 13.8], look: [0.4, 1.35, -3] },
    { p: 1.0, pos: [9.5, 2.9, 7.5], look: [1.5, 2.2, -3] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1;
  return {
    name: 'cyclo', scene, camera, exposure: 0.92,
    applyAspect(a) {
      camera.aspect = a; camera.fov = a < 0.8 ? 56 : a < 1.2 ? 46 : 36; camera.updateProjectionMatrix();
      dScale = a < 0.8 ? 1.5 : a < 1.2 ? 1.15 : 1;
    },
    update(dt, t, q) {
      track.at(q, vPos, vLook);
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += pointer.x * 0.8; vPos.y += -pointer.y * 0.3;
      camera.position.copy(vPos); camera.lookAt(vLook);
      hero.rotation.y = t * 0.35 + pointer.x * 0.4;
      hero.position.y = 2.6 + Math.sin(t * 0.9) * 0.08;
      prints.forEach((g, i) => { g.position.y += (Math.sin(t * 0.7 + i) * 0.002); });
    },
  };
}
