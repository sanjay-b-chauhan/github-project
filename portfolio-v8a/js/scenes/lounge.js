import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { panelTextures, ceilingTexture, posterTexture, blobTexture } from '../textures.js';
import { makeTrack, pointer } from '../track.js';
import { damp } from '../util.js';

// SET 3: a lounge. Panelled wall, three hanging posters (Work, About, Services),
// low leather furniture and a floor lamp. Dark and warm.
export const POSTER = { w: 1.55, h: 2.98, y: 3.42, z: -5.93, xs: [-3.45, 0, 3.45] };
export const POSTER_KINDS = ['work', 'about', 'services'];

export async function createLounge(renderer, { mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050403);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 120);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.22;

  // ---------- room shell ----------
  const wall = panelTextures({ base: [44, 42, 40], vary: 5, seam: 14, seamW: 8, repeat: [9, 2.6], seed: 12 });
  const wallMat = new THREE.MeshStandardMaterial({ map: wall.map, bumpMap: wall.bump, bumpScale: 1.6, roughness: 0.86, metalness: 0.0 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(28, 8.4), wallMat);
  back.position.set(0, 4.2, -6);
  scene.add(back);
  const sideMat = wallMat.clone();
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(30, 8.4), sideMat);
    side.rotation.y = -s * Math.PI / 2; side.position.set(s * 12, 4.2, 9);
    scene.add(side);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x1c1a19, roughness: 0.62, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 8;
  scene.add(floor);
  const ceilTex = ceilingTexture();
  ceilTex.repeat.set(4, 4);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: ceilTex, color: new THREE.Color(1.15, 1.08, 0.98) }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 6.6, 8);
  scene.add(ceil);
  // dark cove between wall and ceiling
  const cove = new THREE.Mesh(new THREE.BoxGeometry(28, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  cove.position.set(0, 6.55, -5.9);
  scene.add(cove);
  const rug = new THREE.Mesh(new RoundedBoxGeometry(8.4, 0.03, 5.2, 2, 0.015), new THREE.MeshStandardMaterial({ color: 0x2a2725, roughness: 1 }));
  rug.position.set(0.3, 0.015, -1.4);
  scene.add(rug);

  // ---------- posters ----------
  const posters = [];
  const texs = await Promise.all(POSTER_KINDS.map((k) => posterTexture(k)));
  const shadowTex = blobTexture(256, 0.6);
  POSTER.xs.forEach((x, i) => {
    const g = new THREE.Group();
    g.position.set(x, POSTER.y, POSTER.z);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(POSTER.w * 1.35, POSTER.h * 1.18), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false }));
    sh.position.set(0.06, -0.1, -0.02);
    g.add(sh);
    const mat = new THREE.MeshBasicMaterial({ map: texs[i], color: new THREE.Color(0.9, 0.9, 0.9) });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(POSTER.w, POSTER.h), mat);
    g.add(m);
    scene.add(g);
    posters.push({ group: g, mesh: m, mat, hover: 0, target: 0 });
  });

  // ---------- furniture ----------
  const leather = new THREE.MeshStandardMaterial({ color: 0x5c3423, roughness: 0.52, metalness: 0.0 });
  const leather2 = new THREE.MeshStandardMaterial({ color: 0x6b3e2a, roughness: 0.5 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x2c2b2a, roughness: 0.66, metalness: 0.05 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.42, metalness: 0.55 });
  const blob = blobTexture(256, 0.45);
  const addShadow = (x, z, w, d, o = 0.75) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blob, transparent: true, opacity: o, depthWrite: false }));
    s.rotation.x = -Math.PI / 2; s.position.set(x, 0.035, z); scene.add(s);
  };

  // modular curved sofa: seat modules on an arc, backs behind them
  const sofa = new THREE.Group();
  const R = 5.4, cz = 2.4, cx = 1.0;
  const angles = [-0.5, -0.08, 0.34];
  angles.forEach((a, i) => {
    const mod = new THREE.Group();
    const x = cx + Math.sin(a) * R, z = cz - Math.cos(a) * R;
    mod.position.set(x, 0, z);
    mod.rotation.y = -a;
    const seat = new THREE.Mesh(new RoundedBoxGeometry(2.25, 0.46, 1.12, 5, 0.18), leather);
    seat.position.set(0, 0.36, 0);
    mod.add(seat);
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.14, 1.0, 2, 0.05), black);
    plinth.position.set(0, 0.07, 0);
    mod.add(plinth);
    const backr = new THREE.Mesh(new RoundedBoxGeometry(2.28, 0.62, 0.34, 5, 0.15), leather);
    backr.position.set(0, 0.8, -0.44);
    mod.add(backr);
    if (i === 0 || i === 1) {
      const pil = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.62, 0.22, 5, 0.1), leather2);
      pil.position.set(i === 0 ? 0.3 : 0.45, 0.85, -0.18); pil.rotation.x = -0.28; pil.rotation.z = i === 0 ? 0.05 : -0.06;
      mod.add(pil);
    }
    sofa.add(mod);
  });
  // rounded arm ends
  for (const a of [angles[0] - 0.235, angles[2] + 0.235]) {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.7, 1.12, 5, 0.16), leather);
    arm.position.set(cx + Math.sin(a) * R, 0.42, cz - Math.cos(a) * R);
    arm.rotation.y = -a;
    sofa.add(arm);
  }
  scene.add(sofa);
  addShadow(cx, cz - R + 0.3, 8.4, 2.8, 0.8);

  // round lounge chair, front left
  const chair = new THREE.Group();
  const tubProfile = [[0.001, 0.12], [0.62, 0.12], [0.82, 0.2], [0.93, 0.42], [0.95, 0.7], [0.88, 0.86], [0.76, 0.9], [0.66, 0.82], [0.64, 0.58], [0.6, 0.5], [0.001, 0.5]].map(([x, y]) => new THREE.Vector2(x, y));
  const tub = new THREE.Mesh(new THREE.LatheGeometry(tubProfile, 64, Math.PI * 0.18, Math.PI * 1.64), new THREE.MeshStandardMaterial({ color: 0x6b3e2a, roughness: 0.5, side: THREE.DoubleSide }));
  tub.scale.set(1.05, 1, 1);
  chair.add(tub);
  const cush = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.2, 48), leather);
  cush.position.y = 0.6; chair.add(cush);
  chair.position.set(-3.05, 0, 1.75);
  chair.rotation.y = 1.25;
  scene.add(chair);
  addShadow(-3.05, 1.75, 2.6, 2.6, 0.85);

  // coffee table with a bowl, two stones and a book
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.14, 64), stone);
  top.position.y = 0.46; top.scale.z = 0.8;
  table.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.4, 48), stone);
  leg.position.y = 0.2; leg.scale.z = 0.8;
  table.add(leg);
  const bowl = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.2, 0.01), new THREE.Vector2(0.34, 0.1), new THREE.Vector2(0.36, 0.14), new THREE.Vector2(0.3, 0.1), new THREE.Vector2(0.001, 0.04)], 48), black);
  bowl.position.set(0.35, 0.53, 0.05);
  table.add(bowl);
  for (const [x, z, r] of [[-0.35, -0.1, 0.09], [-0.18, 0.02, 0.08]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), black); s.position.set(x, 0.53 + r, z); table.add(s);
  }
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.36), new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.8 }));
  book.position.set(-0.3, 0.56, 0.2); book.rotation.y = 0.3;
  table.add(book);
  table.position.set(0.2, 0, 0.6);
  scene.add(table);
  addShadow(0.2, 0.6, 2.8, 2.3, 0.8);

  // side table
  const st = new THREE.Group();
  const stTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40), black); stTop.position.y = 0.62; st.add(stTop);
  const stLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 12), black); stLeg.position.y = 0.31; st.add(stLeg);
  const stBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 32), black); stBase.position.y = 0.01; st.add(stBase);
  const stBook = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.32), new THREE.MeshStandardMaterial({ color: 0x2f2c29, roughness: 0.8 }));
  stBook.position.y = 0.68; stBook.rotation.y = -0.2; st.add(stBook);
  st.position.set(-3.6, 0, -2.4);
  scene.add(st);

  // floor lamp with a wide shade
  const lamp = new THREE.Group();
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.05, 40), black); lb.position.y = 0.025; lamp.add(lb);
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.0, 12), black); ls.position.y = 1.5; lamp.add(ls);
  const shadeGeo = new THREE.LatheGeometry([new THREE.Vector2(0.1, 0.36), new THREE.Vector2(0.46, 0.31), new THREE.Vector2(0.8, 0.06), new THREE.Vector2(0.82, 0.0)], 64);
  const shade = new THREE.Mesh(shadeGeo, new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide }));
  shade.position.y = 2.95; lamp.add(shade);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.74, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.1, 1.1) }));
  glow.rotation.x = Math.PI / 2; glow.position.y = 2.97; lamp.add(glow);
  lamp.position.set(5.1, 0, -3.5);
  scene.add(lamp);
  addShadow(5.1, -3.5, 1.2, 1.2, 0.6);

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x16110d, 0.55));
  const lampLight = new THREE.PointLight(0xffb070, 9, 9, 2);
  lampLight.position.set(5.1, 2.6, -3.5);
  scene.add(lampLight);
  const spots = POSTER.xs.map((x) => {
    const s = new THREE.SpotLight(0xfff0d8, 40, 12, 0.42, 0.85, 2);
    s.position.set(x, 6.3, -3.4);
    s.target.position.set(x, 3.2, -6);
    scene.add(s); scene.add(s.target);
    return s;
  });
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.35);
  fill.position.set(-2, 6, 6);
  scene.add(fill);

  // ---------- camera ----------
  const track = makeTrack([
    { p: 0.56, pos: [-3.8, 3.4, 10.5], look: [-1.8, 2.9, -6] },
    { p: 0.746, pos: [0, 2.72, 8.2], look: [0, 2.86, -6] },
    { p: 0.84, pos: [0.2, 3.1, 6.4], look: [0.2, 6.0, -6] },
    { p: 0.93, pos: [0.3, 3.4, 5.2], look: [0.3, 12, -3] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1, portrait = false;
  function applyAspect(aspect) {
    camera.aspect = aspect;
    portrait = aspect < 0.8;
    camera.fov = portrait ? 46 : aspect < 1.2 ? 44 : 40;
    camera.updateProjectionMatrix();
    // on phones the posters hang closer together so each one stays big enough to tap
    const k = portrait ? 0.54 : 1;
    posters.forEach((pt, i) => { pt.group.position.x = POSTER.xs[i] * k; spots[i].position.x = spots[i].target.position.x = POSTER.xs[i] * k; });
    const halfW = portrait ? 2.75 : 5.3;
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect);
    const need = halfW / Math.tan(hfov / 2);
    dScale = Math.max(1, need / 14.2);
  }

  const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const local = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  return {
    name: 'lounge', scene, camera, applyAspect, posters,
    setHover(i) { posters.forEach((p, k) => (p.target = k === i ? 1 : 0)); },
    posterQuad(i, w, h) {
      const g = posters[i].group;
      g.updateMatrixWorld();
      const out = [];
      for (let k = 0; k < 4; k++) {
        corners[k].set((local[k][0] * POSTER.w) / 2, (local[k][1] * POSTER.h) / 2, 0).applyMatrix4(g.matrixWorld);
        corners[k].project(camera);
        if (corners[k].z > 1) return null;
        out.push([(corners[k].x * 0.5 + 0.5) * w, (-corners[k].y * 0.5 + 0.5) * h]);
      }
      return out;
    },
    update(dt, t, p) {
      track.at(p, vPos, vLook);
      if (portrait) { vLook.y -= 0.9; vPos.y -= 0.35; }
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += Math.sin(t * 0.19) * 0.06 + pointer.x * 0.3; vPos.y += Math.sin(t * 0.23) * 0.04 - pointer.y * 0.14;
      camera.position.copy(vPos);
      camera.lookAt(vLook);
      posters.forEach((pt) => {
        pt.hover = damp(pt.hover, pt.target, 8, dt);
        pt.group.position.z = POSTER.z + pt.hover * 0.16;
        pt.group.scale.setScalar(1 + pt.hover * 0.025);
        const b = 0.9 + pt.hover * 0.22;
        pt.mat.color.setRGB(b, b, b);
      });
      lampLight.intensity = 9 + Math.sin(t * 2.1) * 0.15;
    },
  };
}
