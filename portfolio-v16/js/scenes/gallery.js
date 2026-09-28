import * as THREE from 'three';
import { panelTextures, blobTexture, plaqueTexture } from '../textures.js';
import { pointer } from '../track.js';
import { clamp, damp, smooth } from '../util.js';

// SET 3: the hall. A long gallery wall of photographs behind a colonnade of concrete
// pillars. The camera glides along it like a dolly, so the pillars slide past faster
// than the wall. Drag or use the arrows to walk the hall.
const WALL_Z = -6, CAM_Z = 6.2, GAP = 5.4, PILLAR_Z = -1.9, H = 7.2;

export function createGallery(renderer, { mobile, photos }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.Fog(0x020202, 16, 46);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 200);
  const n = photos.length;
  const x0 = -((n - 1) * GAP) / 2;
  const xs = photos.map((_, i) => x0 + i * GAP);
  const span = [xs[0], xs[n - 1]];
  const L = span[1] - span[0] + 60;

  // ---------- architecture ----------
  const wall = panelTextures({ base: [30, 29, 28], vary: 5, seam: 12, seamW: 6, repeat: [L / 6, 1.2], seed: 21 });
  const wallMat = new THREE.MeshStandardMaterial({ map: wall.map, bumpMap: wall.bump, bumpScale: 1.4, roughness: 0.8, metalness: 0.05 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat);
  back.position.set(0, H / 2, WALL_Z);
  scene.add(back);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(L, 40), new THREE.MeshStandardMaterial({ color: 0x0d0c0c, roughness: 0.34, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 10;
  scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(L, 40), new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 0.9 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 10);
  scene.add(ceil);
  // linear light strips run the length of the hall: the leading lines
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.2, 1.9), fog: false });
  for (const z of [-4.1, 1.2, 5.6]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(L, 0.04, 0.09), stripMat);
    s.position.set(0, H - 0.03, z); scene.add(s);
  }

  // colonnade: square pillars between the frames
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.86, metalness: 0.02 });
  const pillarGeo = new THREE.BoxGeometry(0.72, H, 0.72);
  const blob = blobTexture(256, 0.5);
  const shadowMat = new THREE.MeshBasicMaterial({ map: blob, transparent: true, opacity: 0.9, depthWrite: false });
  for (let i = -1; i < n + 4; i++) {
    const x = x0 - GAP * 1.5 + i * GAP;
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(x, H / 2, PILLAR_Z);
    scene.add(p);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.6), shadowMat);
    sh.rotation.x = -Math.PI / 2; sh.position.set(x, 0.02, PILLAR_Z - 0.4);
    scene.add(sh);
  }

  // ---------- frames ----------
  const loader = new THREE.TextureLoader();
  const washMat = (w, hh) => new THREE.ShaderMaterial({
    uniforms: { uHalf: { value: new THREE.Vector2(w / 2, hh / 2) }, uK: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec2 uHalf; uniform float uK; varying vec2 vP;
      void main(){
        float y = (vP.y + uHalf.y) / (2.0*uHalf.y);            // 0 bottom, 1 top
        float cone = uHalf.x * (0.25 + 0.75*(1.0 - y));        // wider as the light falls
        float x = abs(vP.x) / max(cone, 0.001);
        float a = smoothstep(1.0, 0.2, x) * smoothstep(0.0, 0.35, y) * (0.35 + 0.65*y);
        gl_FragColor = vec4(vec3(1.0, 0.86, 0.68) * a * 0.3 * uK, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const frames = [];
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.45, metalness: 0.4 });
  const matMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.78, 0.76, 0.7) });
  photos.forEach((ph, i) => {
    const g = new THREE.Group();
    const hgt = ph.a >= 1 ? 2.35 : 2.9;
    const w = Math.min(3.9, hgt * ph.a);
    const hh = w / ph.a;
    g.position.set(xs[i], 3.0 + (i % 2 ? 0.08 : -0.06), WALL_Z + 0.06);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, hh + 0.34, 0.07), frameMat);
    frame.position.z = 0.02; g.add(frame);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.22, hh + 0.22), matMat);
    mat.position.z = 0.058; g.add(mat);
    const tex = loader.load(ph.src);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const photoMat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.86, 0.86, 0.86) });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), photoMat);
    photo.position.z = 0.062; photo.userData.i = i; g.add(photo);
    // the plaque
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.24), new THREE.MeshBasicMaterial({ map: plaqueTexture(String(i + 1).padStart(2, '0'), ph.cap), transparent: true, depthWrite: false }));
    pl.position.set(-w / 2 + 0.95 - 0.11, -hh / 2 - 0.42, 0.01); g.add(pl);
    scene.add(g);
    // light falling from the ceiling onto the wall and a pool on the floor
    const wash = new THREE.Mesh(new THREE.PlaneGeometry(w + 3.4, H - 0.2), washMat(w + 3.4, H - 0.2));
    wash.position.set(xs[i], (H - 0.2) / 2, WALL_Z + 0.02); scene.add(wash);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(w + 2.4, 2.6), new THREE.MeshBasicMaterial({ map: blob, color: new THREE.Color(0.5, 0.42, 0.32), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(xs[i], 0.015, WALL_Z + 1.6); scene.add(pool);
    frames.push({ group: g, photo, photoMat, wash, hover: 0, target: 0, baseZ: g.position.z });
  });

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0x4a4540, 0x050505, 0.7));
  for (let x = span[0] - 10; x <= span[1] + 10; x += 10.8) {
    const l = new THREE.PointLight(0xffd9b0, 16, 14, 2);
    l.position.set(x, H - 0.8, 1.4); scene.add(l);
  }

  // ---------- camera: a dolly along the wall ----------
  let gx = xs[0], gxT = xs[0], fovK = 1;
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  function applyAspect(aspect) {
    camera.aspect = aspect;
    camera.fov = aspect < 0.8 ? 52 : aspect < 1.2 ? 46 : 40;
    fovK = aspect < 0.8 ? 1.25 : 1;
    camera.updateProjectionMatrix();
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hits = frames.map((f) => f.photo);
  const nearest = () => { let b = 0, d = 1e9; xs.forEach((x, i) => { const e = Math.abs(x - gxT); if (e < d) { d = e; b = i; } }); return b; };

  return {
    name: 'gallery', scene, camera, applyAspect, frames,
    get index() { return nearest(); },
    // walk the hall: step by frames, or drag by metres
    step(d) { gxT = clamp(xs[clamp(nearest() + d, 0, n - 1)], span[0], span[1]); },
    drag(dm) { gxT = clamp(gxT + dm, span[0], span[1]); },
    settle() { gxT = xs[nearest()]; },
    pick(x, y) {
      ndc.set(x, y); ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(hits, false)[0];
      return h ? h.object.userData.i : -1;
    },
    setHover(i) { frames.forEach((f, k) => (f.target = k === i ? 1 : 0)); },
    update(dt, t, p) {
      gx = damp(gx, gxT, 3.2, dt);
      const inK = smooth(0.44, 0.585, p), outK = smooth(0.585, 0.74, p);
      const x = gx - 15 * (1 - inK) + 17 * outK;
      const z = (CAM_Z + 3.5 * (1 - inK) + 1.5 * outK) * fovK;
      vPos.set(x + pointer.x * 0.5 + Math.sin(t * 0.2) * 0.06, 2.55 - pointer.y * 0.18 + Math.sin(t * 0.17) * 0.04, z);
      vLook.set(x + 2.6 * (1 - inK) + 2.6 * outK + pointer.x * 0.2, 2.75, WALL_Z);
      camera.position.copy(vPos);
      camera.lookAt(vLook);
      frames.forEach((f) => {
        f.hover = damp(f.hover, f.target, 8, dt);
        f.group.position.z = f.baseZ + f.hover * 0.14;
        const b = 0.86 + f.hover * 0.14;
        f.photoMat.color.setRGB(b, b, b);
        f.wash.material.uniforms.uK.value = 1 + f.hover * 0.8;
      });
    },
  };
}
