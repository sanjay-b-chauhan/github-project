import * as THREE from 'three';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
export function mulberry(seed = 7) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const isMobile = () => innerWidth < 761;

// pointer + scroll velocity, written by main.js, read by every set
export const input = { x: 0, y: 0, ax: 0, ay: 0, vy: 0, drag: 0 };

export function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
export function texFrom(c, { srgb = true, repeat = false, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  return t;
}
export function loadImage(url) {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = url; });
}

// GLB, normalised to a height, centred on x/z, standing on y = 0
export async function loadGLB(loader, url, height, { shadow = false, env = 1 } = {}) {
  const g = await loader.loadAsync(url);
  const root = g.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = shadow; o.receiveShadow = shadow;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    ms.forEach((m) => { if (m) { m.envMapIntensity = env; if (m.map) m.map.anisotropy = 4; } });
  });
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(height / size.y);
  box.setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x; root.position.z -= c.z; root.position.y -= box.min.y;
  const wrap = new THREE.Group(); wrap.add(root);
  return wrap;
}

// ---------------------------------------------------------------- shared light effects
// A soft volumetric shaft of light: an open cone, additive, bright at its axis and fading downward.
export function lightShaft({ rTop = 0.15, rBot = 1.4, height = 6, color = '#ffcf99', strength = 0.08 } = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBot, height, 64, 1, true);
  geo.translate(0, -height / 2, 0); // origin at the top
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength }, uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uStrength; uniform float uTime;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);
        float along = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.9, 1.0, vUv.y) * 0.6);
        float flick = 0.9 + 0.1 * sin(vUv.y * 18.0 - uTime * 0.8 + vUv.x * 30.0);
        gl_FragColor = vec4(uColor * f * along * flick * uStrength, 1.0);
      }`,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 5;
  return m;
}

// Dust motes; brighter near a vertical axis so they read as dust caught in a beam.
export function dust({ count = 800, radius = 2, yMin = -1, yMax = 3, color = '#ffd9a8', size = 26, axisX = 0, axisZ = 0, beam = 1.1, seed = 3 } = {}) {
  const r = mulberry(seed);
  const pos = new Float32Array(count * 3), rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
    pos[i * 3] = axisX + Math.cos(a) * d; pos[i * 3 + 1] = yMin + r() * (yMax - yMin); pos[i * 3 + 2] = axisZ + Math.sin(a) * d;
    rnd[i] = r();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uPx: { value: 1 }, uAxis: { value: new THREE.Vector2(axisX, axisZ) }, uBeam: { value: beam }, uH: { value: yMax - yMin }, uY0: { value: yMin }, uAmt: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float rnd; uniform float uTime, uSize, uPx, uBeam, uH, uY0; uniform vec2 uAxis; varying float vA;
      void main(){
        vec3 p = position;
        p.y = uY0 + mod(p.y - uY0 + uTime * (0.04 + rnd * 0.06), uH);
        p.x += sin(uTime * 0.3 + rnd * 20.0) * 0.12; p.z += cos(uTime * 0.25 + rnd * 13.0) * 0.12;
        float d = length(p.xz - uAxis);
        vA = (0.15 + 0.85 * exp(-d * d / (uBeam * uBeam))) * (0.4 + 0.6 * rnd);
        vA *= smoothstep(0.0, 0.12, (p.y - uY0) / uH) * (1.0 - smoothstep(0.85, 1.0, (p.y - uY0) / uH));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPx * (0.35 + rnd * 0.9) / -mv.z;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uAmt; varying float vA;
      void main(){ vec2 q = gl_PointCoord - 0.5; float r = dot(q,q); if (r > 0.25) discard; gl_FragColor = vec4(uColor * smoothstep(0.25, 0.0, r) * vA * uAmt, 1.0); }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return pts;
}

// Soft radial glow on a plane (floor pools, halos, the diya's glow).
export function glowDisc({ size = 3, color = '#ffb070', strength = 0.4, falloff = 2.2 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength }, uFall: { value: falloff } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uStrength, uFall; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), uFall); gl_FragColor = vec4(uColor * a * uStrength, 1.0); }`,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
}

// Fit helper: distance so that a w x h rectangle fills a fraction of the view
export function fitDistance(cam, w, h, fill = 1) {
  const vt = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
  const dH = (h / fill) / 2 / vt;
  const dW = (w / fill) / 2 / (vt * cam.aspect);
  return Math.max(dH, dW);
}
