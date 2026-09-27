import * as THREE from 'three';
import { getTex } from '../tex.js';

// SET 6 (chapter VI, after v8C): the day page. A cream ground and a looping strip of the
// work printed as ink on cream duotone; it bends toward the camera with scroll speed and
// a hovered card blooms back into full colour. Rendered straight to the screen.
const FSQ_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const SRGB = /* glsl */ `vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }`;
const HASH = /* glsl */ `float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }`;
const BG_FS = /* glsl */ `
uniform float uTime; varying vec2 vUv;
${HASH}
void main(){
  vec3 c = vec3(1., .9922, .8863);
  float g = hash12(floor(gl_FragCoord.xy) + fract(uTime * 3.1) * 97.) - .5;
  gl_FragColor = vec4(c + g * .016, 1.);
}`;
const STRIP_VS = /* glsl */ `
uniform float uBend, uBendK, uAxis; uniform vec2 uView;
varying vec2 vUv; varying vec2 vPx;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.);
  vPx = vec2(wp.x + uView.x * .5, uView.y * .5 - wp.y);
  float s;
  if (uAxis < .5){ float yN = wp.y / (uView.y * .5); s = uBend >= 0. ? (1. - yN) * .5 : (1. + yN) * .5; }
  else { float xN = wp.x / (uView.x * .5); s = uBend >= 0. ? (1. + xN) * .5 : (1. - xN) * .5; }
  s = clamp(s, 0., 1.25);
  wp.z += abs(uBend) * uBendK * s * s;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const STRIP_FS = /* glsl */ `
uniform sampler2D uTex; uniform float uHas, uColor, uR; uniform vec2 uSize, uHover; uniform vec3 uDark, uLight; uniform vec4 uClip; uniform float uAxis;
varying vec2 vUv; varying vec2 vPx;
${HASH}
${SRGB}
void main(){
  vec3 c = toSRGB(texture2D(uTex, vUv).rgb);
  float l = dot(c, vec3(.2126, .7152, .0722));
  l = smoothstep(.03, .96, l);
  float g = hash12(floor(vUv * uSize * 1.4)) - .5;
  float lg = clamp(l + g * .22 * (1. - abs(l - .5)), 0., 1.);
  vec3 duo = mix(uDark, uLight, lg);
  vec2 a = vec2(uSize.x / uSize.y, 1.);
  float dist = length((vUv - uHover) * a);
  float m = (1. - smoothstep(uR - .32, uR, dist)) * uColor;
  vec3 col = mix(duo, c, m);
  vec3 cream = vec3(1., .9922, .8863);
  col = mix(vec3(.93, .918, .82), col, uHas);
  // soft edges where the strip slides under the nav and the bar
  float f = uAxis < .5 ? smoothstep(uClip.x, uClip.x + 48., vPx.y) * (1. - smoothstep(uClip.y - 48., uClip.y, vPx.y))
                       : smoothstep(uClip.z, uClip.z + 24., vPx.x) * (1. - smoothstep(uClip.w - 24., uClip.w, vPx.x));
  gl_FragColor = vec4(mix(cream, col, f), 1.);
}`;

const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const out4 = (x) => 1 - Math.pow(1 - x, 4);

export function createDay(renderer, { projects, stripEl, coarse }) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 1, 10000);
  const uTime = { value: 0 };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uTime }, vertexShader: FSQ_VS, fragmentShader: BG_FS, depthTest: false, depthWrite: false }));
  bg.frustumCulled = false; bg.renderOrder = -1;
  scene.add(bg);

  const N = projects.length;
  const geo = new THREE.PlaneGeometry(1, 1, 10, 24);
  const dark = new THREE.Vector3(11 / 255, 11 / 255, 11 / 255);
  const light = new THREE.Vector3(0.962, 0.952, 0.848);
  const PH = new THREE.DataTexture(new Uint8Array([230, 226, 200, 255]), 1, 1); PH.needsUpdate = true;
  const view = new THREE.Vector2(1, 1);
  const clip = new THREE.Vector4(0, 1, 0, 1);
  const items = projects.map((pr, i) => {
    const u = {
      uTex: { value: PH }, uHas: { value: 0 }, uSize: { value: new THREE.Vector2(400, 250) }, uColor: { value: 0 },
      uHover: { value: new THREE.Vector2(0.5, 0.5) }, uR: { value: 0 }, uBend: { value: 0 }, uBendK: { value: 300 },
      uAxis: { value: 0 }, uView: { value: view }, uDark: { value: dark }, uLight: { value: light }, uClip: { value: clip },
    };
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: STRIP_VS, fragmentShader: STRIP_FS, depthTest: false, depthWrite: false }));
    mesh.frustumCulled = false; mesh.renderOrder = 2; mesh.visible = false;
    scene.add(mesh);
    const e = getTex(pr.img);
    e.ready.then((t) => { if (t) { u.uTex.value = t; it.fadeIn = 0; dirty = true; } });
    const it = { i, x: 0, y: 0, w: 0, h: 0, vis: false, col: 0, r: 0, mesh, u, fadeIn: -1 };
    return it;
  });

  const S = { s: 0, target: 0, prev: 0, vel: 0, bend: 0, intro: false, introT: -1, introFrom: 0, drag: null };
  const L = { axis: 0, x0: 0, y0: 0, w: 400, h: 250, gap: 20, step: 270, lead: 20, total: 2160, top: 0, bottom: 1, left: 0, right: 1 };
  let vw = 1, vh = 1, dirty = true, hover = -1, active = 0, pointerIdx = -1, focusIdx = -1;
  const ptr = { x: -1, y: -1, in: false };
  let onActive = () => {}, onOpen = () => {};

  function layout() {
    const r = stripEl.getBoundingClientRect();
    if (r.top !== L.top || r.left !== L.left || r.bottom !== L.bottom || r.right !== L.right) dirty = true;
    L.top = r.top; L.bottom = r.bottom; L.left = r.left; L.right = r.right;
    if (r.height >= r.width) {
      L.axis = 0; L.x0 = r.left; L.w = r.width; L.h = L.w / 1.6; L.gap = L.w * 0.0438; L.step = L.h + L.gap; L.lead = r.top + L.gap;
    } else {
      L.axis = 1; L.h = r.height; L.w = L.h * 1.6; L.gap = 12; L.step = L.w + L.gap; L.lead = Math.max(16, (vw - L.w) / 2); L.y0 = r.top;
    }
    L.total = L.step * N;
    clip.set(L.axis ? 0 : r.top, L.axis ? vh : r.bottom, L.axis ? 0 : r.left, L.axis ? vw : r.right);
  }
  function resize(w, h) {
    vw = w; vh = h;
    cam.aspect = w / h;
    cam.position.set(0, 0, (h / 2) / Math.tan((15 * Math.PI) / 180));
    cam.near = 1; cam.far = cam.position.z * 4;
    cam.updateProjectionMatrix();
    view.set(w, h);
    layout();
    dirty = true;
  }
  function itemAt(x, y) {
    for (const it of items) if (it.vis && x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h && y >= L.top && y <= L.bottom) return it;
    return null;
  }
  function scrollToItem(i) {
    const size = L.axis ? L.w : L.h;
    const c = L.axis ? vw / 2 : (L.top + L.bottom) / 2;
    let s = L.lead + i * L.step + size / 2 - c;
    s += Math.round((S.target - s) / L.total) * L.total;
    S.target = s;
    dirty = true;
  }
  function setHover(i, x, y) {
    if (i !== hover) { hover = i; if (i >= 0) items[i].r = 0; stripEl.classList.toggle('hov', i >= 0); dirty = true; }
    if (i >= 0) { const it = items[i]; it.u.uHover.value.set((x - it.x) / it.w, 1 - (y - it.y) / it.h); dirty = true; }
  }
  function setActive(i) {
    if (i === active || i < 0 || i >= N) return;
    active = i;
    onActive(i);
  }

  function update(dt, t) {
    uTime.value = t;
    // the strip keeps its place in the page when the day overlay scrolls on phones
    layout();
    if (S.introT >= 0) {
      S.introT += dt;
      const k = Math.min(1, S.introT / 1.75);
      S.s = S.target = S.introFrom * (1 - out4(k));
      if (k >= 1) { S.introT = -1; S.intro = false; S.s = S.target = 0; }
    } else if (!S.drag) S.s += (S.target - S.s) * (1 - Math.exp(-dt * 7));
    const v = dt > 0 ? (S.s - S.prev) / dt : 0;
    S.prev = S.s;
    S.vel += (v - S.vel) * (1 - Math.exp(-dt * 10));
    const bendT = clamp(S.vel / (S.intro ? 1700 : L.axis ? 2600 : 3400), -1.2, 1.2);
    S.bend += (bendT - S.bend) * (1 - Math.exp(-dt * 12));
    const bendK = L.axis ? vw * 0.3 : vh * 0.5;
    const center = L.axis ? vw / 2 : (L.top + L.bottom) / 2;
    const idx = pointerIdx >= 0 ? pointerIdx : focusIdx;
    let best = 0, bestD = 1e9, moving = Math.abs(S.target - S.s) > 0.05 || Math.abs(S.bend) > 0.0005 || S.intro;
    for (const it of items) {
      const base = L.lead + it.i * L.step - S.s;
      const pos = S.intro ? base : mod(base - L.lead + L.step, L.total) - L.step + L.lead;
      if (L.axis === 0) { it.x = L.x0; it.y = pos; } else { it.x = pos; it.y = L.y0; }
      it.w = L.w; it.h = L.h;
      it.vis = it.x < vw && it.x + it.w > 0 && it.y < vh && it.y + it.h > 0;
      const c = L.axis ? it.x + it.w / 2 : it.y + it.h / 2;
      const dd = Math.abs(c - center);
      if (dd < bestD) { bestD = dd; best = it.i; }
      const want = it.i === hover || it.i === idx || (coarse && it.i === active && !S.drag && !S.intro) ? 1 : 0;
      const pc = it.col;
      it.col += (want - it.col) * (1 - Math.exp(-dt * (want ? 6 : 3.5)));
      if (want && it.r < 2.6) { it.r = Math.min(2.6, it.r + dt * 1.9 * (1 + it.r)); moving = true; }
      if (Math.abs(it.col - pc) > 1e-4) moving = true;
      if (it.fadeIn >= 0 && it.fadeIn < 1) { it.fadeIn = Math.min(1, it.fadeIn + dt / 0.7); it.u.uHas.value = 1 - Math.pow(1 - it.fadeIn, 3); moving = true; }
      const m = it.mesh, u = it.u;
      m.visible = it.vis;
      if (m.visible) {
        m.position.set(it.x + it.w / 2 - vw / 2, vh / 2 - (it.y + it.h / 2), 0);
        m.scale.set(it.w, it.h, 1);
        u.uBend.value = S.bend; u.uBendK.value = bendK; u.uAxis.value = L.axis;
        u.uSize.value.set(it.w, it.h); u.uColor.value = it.col; u.uR.value = it.r;
        if (it.i === idx) u.uHover.value.set(0.5, 0.5);
      }
    }
    if (ptr.in && !S.drag && !S.intro && moving) {
      const hit = itemAt(ptr.x, ptr.y);
      setHover(hit ? hit.i : -1, ptr.x, ptr.y);
    }
    if (!S.intro) setActive(idx >= 0 ? idx : hover >= 0 ? hover : best);
    if (moving || S.drag) dirty = true;
  }

  // ---------- input ----------
  function bind() {
    stripEl.addEventListener('wheel', (e) => {
      if (S.intro || L.axis === 1) return;
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? vh : 1;
      S.target += (e.deltaY + e.deltaX) * k; focusIdx = -1; dirty = true;
    }, { passive: false });
    stripEl.addEventListener('pointerdown', (e) => {
      if (S.intro || e.button > 0) return;
      S.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0, v: 0, lt: performance.now(), cap: false };
    });
    stripEl.addEventListener('pointermove', (e) => {
      const d = S.drag;
      if (d && e.pointerId === d.id) {
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        d.x = e.clientX; d.y = e.clientY;
        d.moved += Math.abs(dx) + Math.abs(dy);
        const along = L.axis ? Math.abs(e.clientX - d.sx) : Math.abs(e.clientY - d.sy);
        const across = L.axis ? Math.abs(e.clientY - d.sy) : Math.abs(e.clientX - d.sx);
        if (!d.cap && d.moved > 7) {
          // on phones a vertical swipe belongs to the page, not the strip
          if (L.axis === 1 && across > along) { S.drag = null; return; }
          try { stripEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
          d.cap = true; stripEl.classList.add('drag'); setHover(-1); focusIdx = -1;
        }
        if (d.cap) {
          const delta = L.axis ? dx : dy;
          S.s -= delta; S.target = S.s;
          const tt = performance.now(), idt = Math.max(8, tt - d.lt) / 1000;
          d.v = d.v * 0.55 + (-delta / idt) * 0.45; d.lt = tt;
          dirty = true;
        }
        return;
      }
      if (S.intro || e.pointerType === 'touch') return;
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true;
      const it = itemAt(e.clientX, e.clientY);
      setHover(it ? it.i : -1, e.clientX, e.clientY);
    });
    const endDrag = (e, cancel) => {
      const d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      S.drag = null; stripEl.classList.remove('drag');
      if (cancel) return;
      if (!d.cap) {
        const it = itemAt(e.clientX, e.clientY);
        if (it) onOpen(it.i, e.clientX, e.clientY);
      } else if (performance.now() - d.lt < 90) S.target = S.s + clamp(d.v, -7000, 7000) * 0.28;
    };
    stripEl.addEventListener('pointerup', (e) => endDrag(e, false));
    stripEl.addEventListener('pointercancel', (e) => endDrag(e, true));
    stripEl.addEventListener('pointerleave', () => { ptr.in = false; if (!S.drag) setHover(-1); });
  }
  bind();

  return {
    name: 'day', scene, camera: cam, resize, update,
    get active() { return active; },
    get hovered() { return hover; },
    set onActive(f) { onActive = f; },
    set onOpen(f) { onOpen = f; },
    get dirty() { return dirty; },
    flyIn() {
      layout();
      S.intro = true; S.introT = 0;
      S.introFrom = -(L.axis ? vw * 1.02 : (L.bottom - L.top) + L.gap * 2);
      S.s = S.target = S.prev = S.introFrom;
      dirty = true;
    },
    settle() { S.intro = false; S.introT = -1; S.s = S.target = S.prev = 0; dirty = true; },
    hoverIndex(i) { pointerIdx = i; if (i >= 0) { items[i].r = 0; scrollToItem(i); } dirty = true; },
    focusIndex(i) { focusIdx = i; if (i >= 0) { items[i].r = 0; scrollToItem(i); } dirty = true; },
    render() {
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
      dirty = false;
    },
  };
}
