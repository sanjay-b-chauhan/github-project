import * as THREE from 'three';
import { pointer } from '../track.js';
import { damp, canvas2d } from '../util.js';

// THE ARCHIVE: every project, render and photograph on one endless wall. It bends away like the
// inside of a sphere, drifts on its own, follows the page scroll, and can be thrown in any direction.
// Tiles wrap around, so it never ends. Each piece carries its caption under it.
const VERT = /* glsl */ `uniform float uBend; uniform vec2 uVel; uniform float uHover; varying vec2 vUv; varying float vD;
  void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position*(1.0 + uHover*0.04), 1.0);
    vec4 v = viewMatrix*w; float r2 = dot(v.xy, v.xy);
    v.z -= r2 * uBend;
    v.xy += uVel * (0.3 + r2*0.012);
    vD = r2; gl_Position = projectionMatrix*v; }`;

function captionTexture(title, cat, n) {
  const W = 1024, H = 72;
  const [c, g] = canvas2d(W, H);
  g.textBaseline = 'middle';
  g.font = '500 30px "Inter Tight", sans-serif'; g.fillStyle = 'rgba(244,241,234,0.92)';
  g.fillText(title, 4, H / 2);
  g.font = '400 22px Telgra, "Inter Tight", sans-serif'; g.fillStyle = 'rgba(244,241,234,0.45)';
  const right = `${cat.toUpperCase()}  ${String(n).padStart(2, '0')}`;
  g.fillText(right, W - 4 - g.measureText(right).width, H / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function createArchive(renderer, { mobile, items }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  const camera = new THREE.PerspectiveCamera(36, 1.6, 0.1, 200);
  const TW = mobile ? 2.5 : 3.3, TH = TW / 1.5, GX = mobile ? 0.34 : 0.46, GY = mobile ? 0.62 : 0.74;
  const SX = TW + GX, SY = TH + GY;
  const C = mobile ? 6 : 9, R = mobile ? 8 : 7;
  const WX = C * SX, WY = R * SY;
  const loader = new THREE.TextureLoader();
  const cache = new Map(), caps = new Map();
  const tex = (src) => {
    if (!cache.has(src)) {
      const rec = { t: null, a: 1.5 };
      rec.t = loader.load(src, (t) => { rec.a = t.image.width / t.image.height; });
      rec.t.colorSpace = THREE.SRGBColorSpace; rec.t.anisotropy = 8;
      cache.set(src, rec);
    }
    return cache.get(src);
  };
  const cap = (it, idx) => { const k = it.src; if (!caps.has(k)) caps.set(k, captionTexture(it.title, it.cat === 'life' ? 'Life' : 'Work', idx + 1)); return caps.get(k); };
  const U = { uBend: { value: mobile ? 0.02 : 0.013 }, uVel: { value: new THREE.Vector2() }, uTime: { value: 0 } };
  const geo = new THREE.PlaneGeometry(TW, TH, 20, 14);
  const cgeo = new THREE.PlaneGeometry(TW, TW * 72 / 1024, 20, 2);
  const tiles = [];
  for (let i = 0; i < C * R; i++) {
    const hover = { value: 0 };
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...U, map: { value: null }, uAsp: { value: 1.5 }, uTile: { value: TW / TH }, uHover: hover, uIn: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `uniform sampler2D map; uniform float uAsp; uniform float uTile; uniform float uHover; uniform float uIn; uniform vec2 uVel; varying vec2 vUv; varying float vD;
        void main(){
          vec2 s = uAsp > uTile ? vec2(uTile/uAsp, 1.0) : vec2(1.0, uAsp/uTile);
          vec2 uv = (vUv - 0.5)*s*(1.0 - uHover*0.05) + 0.5;
          float sh = length(uVel)*0.01;
          vec3 c = vec3(texture2D(map, uv + vec2(sh,0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(sh,0.0)).b);
          c *= (0.78 + 0.22*uHover) * uIn;
          c *= 1.0 - smoothstep(55.0, 170.0, vD)*0.9;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const m = new THREE.Mesh(geo, mat);
    const cm = new THREE.Mesh(cgeo, new THREE.ShaderMaterial({
      uniforms: { ...U, map: { value: null }, uHover: hover, uIn: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `uniform sampler2D map; uniform float uIn; uniform float uHover; varying vec2 vUv; varying float vD;
        void main(){ vec4 t = texture2D(map, vUv); float a = t.a * uIn * (0.7 + 0.3*uHover) * (1.0 - smoothstep(55.0, 170.0, vD)*0.9);
          gl_FragColor = vec4(t.rgb, a); }`,
      transparent: true, depthWrite: false,
    }));
    cm.position.y = -TH / 2 - TW * 36 / 1024 - 0.12;
    m.add(cm);
    m.userData = { i, cell: null, item: -1, hover: 0, target: 0, pop: 0, cap: cm };
    scene.add(m); tiles.push(m);
  }
  let list = items;
  const off = new THREE.Vector2(0, 0), vel = new THREE.Vector2(0.3, 0), drift = new THREE.Vector2(0.3, 0);
  let drag = false, scrollV = 0;
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  const mod = (a, n) => ((a % n) + n) % n;
  function layout(dt) {
    tiles.forEach((m) => {
      const c = m.userData.i % C, r = Math.floor(m.userData.i / C);
      const x = mod(c * SX + off.x + WX / 2, WX) - WX / 2;
      const cellX = Math.round((x - off.x) / SX);
      const stag = mod(cellX, 2) ? SY / 2 : 0;
      const y = mod(r * SY + off.y + stag + WY / 2, WY) - WY / 2;
      const cellY = Math.round((y - off.y - stag) / SY);
      m.position.set(x, y, 0);
      const key = `${cellX},${cellY}`;
      if (m.userData.cell !== key) {
        m.userData.cell = key;
        const idx = mod(cellX * 7 + cellY * 11 + mod(cellY, 3) * 3, list.length);
        m.userData.item = idx;
        const rec = tex(list[idx].src);
        m.material.uniforms.map.value = rec.t; m.userData.rec = rec;
        m.userData.cap.material.uniforms.map.value = cap(list[idx], idx);
        m.userData.pop = 0;
      }
      m.material.uniforms.uAsp.value = m.userData.rec.a;
      m.userData.pop = Math.min(1, m.userData.pop + dt * 2.2);
      m.material.uniforms.uIn.value = m.userData.pop;
      m.userData.cap.material.uniforms.uIn.value = m.userData.pop;
      m.userData.hover = damp(m.userData.hover, m.userData.target, 9, dt);
      m.material.uniforms.uHover.value = m.userData.hover;
    });
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let pAspect = 1.6, last = { x: 0, y: 0, t: 0 };
  return {
    name: 'archive', scene, camera, exposure: 1,
    applyAspect(a) { pAspect = a; camera.aspect = a; camera.fov = a < 0.8 ? 50 : 36; camera.updateProjectionMatrix(); },
    setItems(next) { list = next; tiles.forEach((m) => { m.userData.cell = null; }); },
    grab(on) { drag = on; if (!on) vel.set(last.x, last.y); },
    // dx, dy in world units for this frame of dragging; remembered as the throw velocity
    push(dx, dy, dt = 1 / 60) { off.x += dx; off.y += dy; last.x = dx / Math.max(dt, 1 / 120); last.y = dy / Math.max(dt, 1 / 120); },
    scrollVel(v) { scrollV = v; },
    pick(x, y) {
      ndc.set(x, y); ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(tiles, false)[0];
      return h ? h.object.userData.item : -1;
    },
    setHover(item) { tiles.forEach((m) => { m.userData.target = m.userData.item === item && item >= 0 ? 1 : 0; }); },
    update(dt, t) {
      U.uTime.value = t;
      if (!drag) {
        vel.x = damp(vel.x, drift.x, 1.4, dt); vel.y = damp(vel.y, drift.y + scrollV * 0.9, 2.5, dt);
        off.x += vel.x * dt; off.y += vel.y * dt;
      }
      U.uVel.value.set(damp(U.uVel.value.x, -vel.x * 0.018, 6, dt), damp(U.uVel.value.y, -vel.y * 0.018, 6, dt));
      layout(dt);
      vPos.set(pointer.x * 0.5, -pointer.y * 0.35, pAspect < 0.8 ? 14 : 12);
      vLook.set(pointer.x * 0.15, 0, 0);
      camera.position.copy(vPos); camera.lookAt(vLook);
    },
  };
}
