import * as THREE from 'three';
import { pointer } from '../track.js';
import { damp } from '../util.js';

// THE ARCHIVE: every project, render and photograph on one endless wall. It bends away like the
// inside of a sphere, drifts on its own, and you can throw it in any direction. Tiles wrap around,
// so it never ends. q: 0 arriving, 0.5 here, 1 leaving.
export function createArchive(renderer, { mobile, items }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  const camera = new THREE.PerspectiveCamera(36, 1.6, 0.1, 200);
  const TW = mobile ? 2.3 : 3.2, TH = mobile ? 3.0 : 2.1, GX = mobile ? 0.28 : 0.34, GY = mobile ? 0.34 : 0.4;
  const SX = TW + GX, SY = TH + GY;
  const C = mobile ? 6 : 9, R = mobile ? 7 : 7;
  const WX = C * SX, WY = R * SY;
  const loader = new THREE.TextureLoader();
  const cache = new Map();
  const tex = (src) => {
    if (!cache.has(src)) {
      const rec = { t: null, a: 1.5 };
      rec.t = loader.load(src, (t) => { rec.a = t.image.width / t.image.height; });
      rec.t.colorSpace = THREE.SRGBColorSpace; rec.t.anisotropy = 8;
      cache.set(src, rec);
    }
    return cache.get(src);
  };
  const U = { uBend: { value: mobile ? 0.018 : 0.012 }, uVel: { value: new THREE.Vector2() }, uTime: { value: 0 }, uFade: { value: 0 } };
  const geo = new THREE.PlaneGeometry(TW, TH, 20, 14);
  const tiles = [];
  for (let i = 0; i < C * R; i++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...U, map: { value: null }, uAsp: { value: 1.5 }, uTile: { value: TW / TH }, uHover: { value: 0 }, uIn: { value: 0 } },
      vertexShader: /* glsl */ `uniform float uBend; uniform vec2 uVel; uniform float uHover; varying vec2 vUv; varying float vD;
        void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position*(1.0 + uHover*0.05), 1.0);
          vec4 v = viewMatrix*w; float r2 = dot(v.xy, v.xy);
          v.z -= r2 * uBend;                    // the wall curves away from the eye
          v.xy += uVel * (0.4 + r2*0.01);       // it smears a little when thrown
          vD = r2; gl_Position = projectionMatrix*v; }`,
      fragmentShader: /* glsl */ `uniform sampler2D map; uniform float uAsp; uniform float uTile; uniform float uHover; uniform float uIn; uniform vec2 uVel; uniform float uFade; varying vec2 vUv; varying float vD;
        void main(){
          vec2 s = uAsp > uTile ? vec2(uTile/uAsp, 1.0) : vec2(1.0, uAsp/uTile);
          vec2 uv = (vUv - 0.5)*s*(1.0 - uHover*0.06) + 0.5;
          float sh = length(uVel)*0.012;
          vec3 c = vec3(texture2D(map, uv + vec2(sh,0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(sh,0.0)).b);
          float l = dot(c, vec3(0.3,0.59,0.11));
          c = mix(vec3(l)*vec3(1.0,0.96,0.92), c, 0.55 + 0.45*uHover);   // quiet until you look at it
          c *= (0.62 + 0.38*uHover) * uIn * uFade;
          c *= 1.0 - smoothstep(60.0, 180.0, vD)*0.85;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const m = new THREE.Mesh(geo, mat);
    m.userData = { i, cell: null, item: -1, hover: 0, target: 0, pop: 0 };
    scene.add(m); tiles.push(m);
  }
  let list = items, off = new THREE.Vector2(0, 0), vel = new THREE.Vector2(0.35, 0.06), drag = false;
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  const mod = (a, n) => ((a % n) + n) % n;
  function layout(dt) {
    tiles.forEach((m) => {
      const c = m.userData.i % C, r = Math.floor(m.userData.i / C);
      let x = mod(c * SX + off.x + WX / 2, WX) - WX / 2;
      const cellX = Math.round((x - off.x) / SX);
      const stag = mod(cellX, 2) ? SY / 2 : 0;
      let y = mod(r * SY + off.y + stag + WY / 2, WY) - WY / 2;
      const cellY = Math.round((y - off.y - stag) / SY);
      m.position.set(x, y, 0);
      const key = `${cellX},${cellY}`;
      if (m.userData.cell !== key) {
        m.userData.cell = key;
        const idx = mod(cellX * 7 + cellY * 11 + (cellY % 3) * 3, list.length);
        m.userData.item = idx;
        const rec = tex(list[idx].src);
        m.material.uniforms.map.value = rec.t; m.userData.rec = rec;
        m.userData.pop = 0;
      }
      m.material.uniforms.uAsp.value = m.userData.rec.a;
      m.userData.pop = Math.min(1, m.userData.pop + dt * 2.5);
      m.material.uniforms.uIn.value = m.userData.pop;
      m.userData.hover = damp(m.userData.hover, m.userData.target, 8, dt);
      m.material.uniforms.uHover.value = m.userData.hover;
    });
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let pAspect = 1.6;
  return {
    name: 'archive', scene, camera, exposure: 1,
    anchor(o) { o.pos.set(0, 0, 0); o.size = 0; o.k = 0; },
    applyAspect(a) { pAspect = a; camera.aspect = a; camera.fov = a < 0.8 ? 52 : 36; camera.updateProjectionMatrix(); },
    setItems(next) { list = next; tiles.forEach((m) => { m.userData.cell = null; }); },
    grab(on) { drag = on; },
    push(dx, dy) { off.x += dx; off.y += dy; vel.set(dx * 30, dy * 30); },
    fling(dx, dy) { vel.set(dx, dy); },
    pick(x, y) {
      ndc.set(x, y); ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(tiles, false)[0];
      return h ? h.object.userData.item : -1;
    },
    setHover(item) { tiles.forEach((m) => { m.userData.target = m.userData.item === item && item >= 0 ? 1 : 0; }); },
    update(dt, t, q) {
      U.uTime.value = t;
      if (!drag) { vel.x = damp(vel.x, 0.35, 0.8, dt); vel.y = damp(vel.y, 0.06, 0.8, dt); off.x += vel.x * dt; off.y += vel.y * dt; }
      U.uVel.value.set(damp(U.uVel.value.x, -vel.x * 0.02, 6, dt), damp(U.uVel.value.y, -vel.y * 0.02, 6, dt));
      U.uFade.value = Math.min(1, Math.max(0, q * 2.2 - 0.1));
      layout(dt);
      const inK = Math.min(1, q / 0.5), outK = Math.max(0, (q - 0.5) / 0.5);
      const e = 1 - Math.pow(1 - inK, 3);
      const dist = (pAspect < 0.8 ? 13 : 11.5) + (1 - e) * 16 - outK * 7;
      vPos.set(pointer.x * 0.6, -pointer.y * 0.4 + outK * 2, dist);
      vLook.set(pointer.x * 0.2, outK * 3, 0);
      camera.position.copy(vPos); camera.lookAt(vLook);
      camera.rotation.z = (1 - e) * 0.12;
    },
  };
}
