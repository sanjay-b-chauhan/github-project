import * as THREE from 'three';
import { HASH } from '../glsl.js';
import { canvas2d, mulberry, speckle } from '../util.js';
import { makeTrack, pointer } from '../track.js';

// ROOTS: a Rajasthani stepwell at dusk. Sandstone terraces with zigzag stairs fall to dark
// water, a three storey arcade glows on the far side, diyas flicker on the steps.
// q is local: 0 arriving from above, 0.5 standing on the rim, 1 walking down to the water.
const N = 12, STEP = 0.7, RING = 0.95, R0 = 12.5;

function sandstone(w, h, seed, zig) {
  const [c, g] = canvas2d(w, h);
  const r = mulberry(seed);
  g.fillStyle = '#7a5238'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,220,180' : '60,30,15'},${0.03 + r() * 0.05})`; g.fillRect(r() * w, r() * h, 2 + r() * 20, 1 + r() * 4); }
  if (zig) {
    // two flights meeting in a peak, drawn as little treads and risers
    const unit = w / 2, steps = 7, sw = unit / 2 / steps, sh = h / steps;
    for (let u = 0; u < 2; u++) for (let k = 0; k < steps; k++) {
      const y = h - (k + 1) * sh;
      const xl = u * unit + k * sw, xr = u * unit + unit - (k + 1) * sw;
      for (const x of [xl, xr]) {
        g.fillStyle = 'rgba(255,214,160,0.28)'; g.fillRect(x, y, sw, 3);
        g.fillStyle = 'rgba(30,12,4,0.42)'; g.fillRect(x, y + 3, sw, sh - 3);
      }
    }
  }
  speckle(g, w, h, 0.08, seed + 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

function arcadeTexture() {
  const W = 2048, H = 1024;
  const [c, g] = canvas2d(W, H);
  const [ce, ge] = canvas2d(W, H);
  g.fillStyle = '#8f613f'; g.fillRect(0, 0, W, H);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  const rows = 3, cols = 9, rh = H / rows, cw = W / cols;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * cw + cw * 0.18, y = j * rh + rh * 0.2, w = cw * 0.64, h = rh * 0.68;
    const arch = (ctx) => { ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); };
    g.fillStyle = '#1a0d06'; arch(g); g.fill();
    g.strokeStyle = 'rgba(255,215,160,0.35)'; g.lineWidth = 6; arch(g); g.stroke();
    // lamp light deep in some of the arches
    const lit = (i * 7 + j * 3) % 4 !== 0;
    if (lit) { const gr = ge.createRadialGradient(x + w / 2, y + h * 0.7, 2, x + w / 2, y + h * 0.7, w * 0.8); gr.addColorStop(0, 'rgba(255,170,80,1)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); ge.fillStyle = gr; arch(ge); ge.fill(); }
    g.fillStyle = 'rgba(40,18,6,0.5)'; g.fillRect(i * cw, (j + 1) * rh - 14, cw, 14);
  }
  speckle(g, W, H, 0.06, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const e = new THREE.CanvasTexture(ce); e.colorSpace = THREE.SRGBColorSpace;
  return { map: t, emissive: e };
}

export function createStepwell(renderer, { mobile }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 400);
  const uTime = { value: 0 };

  // dusk sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    uniforms: { uTime },
    vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `varying vec3 vD; uniform float uTime; ${HASH}
      void main(){ float e = vD.y; vec3 top = vec3(0.012,0.014,0.04); vec3 mid = vec3(0.09,0.05,0.08); vec3 hor = vec3(0.9,0.32,0.1);
        vec3 c = mix(hor, mid, smoothstep(-0.02, 0.18, e)); c = mix(c, top, smoothstep(0.18, 0.7, e));
        float sunG = exp(-pow(atan(vD.z, vD.x) + 2.4, 2.0) * 3.0) * exp(-abs(e) * 9.0); c += vec3(1.0,0.4,0.1) * sunG * 0.8;
        vec2 sp = vec2(atan(vD.z, vD.x) * 120.0, e * 130.0); vec2 cl = floor(sp); float h = hash12(cl);
        c += step(0.965, h) * smoothstep(0.3, 0.6, e) * smoothstep(0.35, 0.0, length(fract(sp) - 0.5)) * 0.7;
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false,
  }));
  sky.renderOrder = -2; sky.frustumCulled = false; scene.add(sky);

  // the ground around the well
  const top = sandstone(512, 512, 2, false); top.repeat.set(14, 14);
  const groundMat = new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 });
  const ground = new THREE.Mesh(new THREE.RingGeometry(R0 + RING, 90, 4, 1, Math.PI / 4), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.scale.set(Math.SQRT2, Math.SQRT2, 1);
  scene.add(ground);

  // terraces: three stepped sides, the fourth is the arcade
  const zigBase = sandstone(512, 128, 7, true);
  const tread = sandstone(256, 256, 9, false);
  const boxes = [];
  for (let k = 0; k < N; k++) {
    const r = R0 - k * RING, y = -k * STEP - STEP / 2;
    const mk = (len, axis) => {
      const zt = zigBase.clone(); zt.needsUpdate = true; zt.repeat.set(len / 2.2, 1);
      const tt = tread.clone(); tt.needsUpdate = true; tt.repeat.set(len / 3, 0.4);
      const side = new THREE.MeshStandardMaterial({ map: zt, roughness: 0.92 });
      const topM = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.92, color: 0xb08a68 });
      const geo = axis === 'x' ? new THREE.BoxGeometry(len, STEP, RING) : new THREE.BoxGeometry(RING, STEP, len);
      const m = new THREE.Mesh(geo, axis === 'x' ? [topM, topM, topM, topM, side, side] : [side, side, topM, topM, topM, topM]);
      m.castShadow = !mobile; m.receiveShadow = !mobile;
      scene.add(m); boxes.push(m); return m;
    };
    mk(2 * (r + RING), 'x').position.set(0, y, r + RING / 2);
    mk(2 * r, 'z').position.set(-(r + RING / 2), y, -0.0);
    mk(2 * r, 'z').position.set(r + RING / 2, y, 0);
  }
  const depth = N * STEP;
  // arcade wall on the north side
  const arc = arcadeTexture();
  const arcade = new THREE.Mesh(new THREE.PlaneGeometry(2 * R0 + 2, depth + 3.2), new THREE.MeshStandardMaterial({ map: arc.map, emissiveMap: arc.emissive, emissive: new THREE.Color(1.5, 0.72, 0.28), roughness: 0.9 }));
  arcade.position.set(0, (3.2 - depth) / 2, -R0 + 0.2);
  arcade.receiveShadow = !mobile;
  scene.add(arcade);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(2 * R0 + 3, 0.5, 1.4), groundMat);
  cap.position.set(0, 3.45, -R0 + 0.2); scene.add(cap);

  // water
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * (R0 - N * RING) + 2, 2 * R0), new THREE.ShaderMaterial({
    uniforms: { uTime },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `varying vec3 vW; uniform float uTime;
      void main(){ float r = sin(vW.x*3.0 + uTime*1.2)*sin(vW.z*2.3 - uTime*0.9)*0.5 + sin(length(vW.xz)*4.0 - uTime*2.0)*0.5;
        vec3 c = vec3(0.01, 0.025, 0.03) + vec3(0.9, 0.4, 0.12) * pow(0.5 + 0.5*r, 8.0) * 0.22; gl_FragColor = vec4(c, 1.0); }`,
  }));
  water.rotation.x = -Math.PI / 2; water.position.y = -depth + 0.05; scene.add(water);

  // diyas on the steps
  const rnd = mulberry(4);
  const ND = mobile ? 90 : 170;
  const dp = new Float32Array(ND * 3), dr = new Float32Array(ND);
  for (let i = 0; i < ND; i++) {
    const k = Math.floor(rnd() * N), r = R0 - k * RING + 0.2, side = Math.floor(rnd() * 3), t = (rnd() * 2 - 1) * r * 0.95;
    const y = -k * STEP + 0.08;
    if (side === 0) dp.set([t, y, r], i * 3); else if (side === 1) dp.set([-r, y, t], i * 3); else dp.set([r, y, t], i * 3);
    dr[i] = rnd();
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  dg.setAttribute('aR', new THREE.BufferAttribute(dr, 1));
  const diyas = new THREE.Points(dg, new THREE.ShaderMaterial({
    uniforms: { uTime, uPx: { value: 1 } },
    vertexShader: /* glsl */ `uniform float uTime; uniform float uPx; attribute float aR; varying float vA;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vA = 0.75 + 0.25*sin(uTime*(6.0+aR*5.0) + aR*40.0)*sin(uTime*3.1 + aR*9.0);
        gl_PointSize = clamp(90.0*uPx / -mv.z, 2.0, 22.0); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = exp(-d*d*38.0) + exp(-d*d*6.0)*0.25;
      gl_FragColor = vec4(vec3(2.4,1.2,0.45)*a*vA, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  diyas.frustumCulled = false; scene.add(diyas);

  // light: low warm sun raking across the steps, cool sky fill, warmth from the arcade
  scene.add(new THREE.HemisphereLight(0x46507a, 0x1a0c06, 0.5));
  const sun = new THREE.DirectionalLight(0xff9a50, 2.3);
  sun.position.set(-26, 14, 10); sun.target.position.set(0, -4, 0);
  if (!mobile) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
  }
  scene.add(sun); scene.add(sun.target);
  const glow = new THREE.PointLight(0xff9a4a, 60, 30, 2); glow.position.set(0, -3, -R0 + 3); scene.add(glow);

  const track = makeTrack([
    { p: 0.0, pos: [0, 20, 8], look: [0, -6, -1] },
    { p: 0.5, pos: [2.5, 4.2, 15.5], look: [-0.5, -2.4, -8] },
    { p: 1.0, pos: [0, -4.8, 4.5], look: [0, -7.6, -6] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1;
  return {
    name: 'stepwell', scene, camera, exposure: 0.82,
    applyAspect(a) {
      camera.aspect = a; camera.fov = a < 0.8 ? 60 : a < 1.2 ? 50 : 42; camera.updateProjectionMatrix();
      dScale = a < 0.8 ? 1.25 : 1;
      diyas.material.uniforms.uPx.value = Math.min(devicePixelRatio || 1, 1.5);
    },
    update(dt, t, q) {
      uTime.value = t;
      track.at(q, vPos, vLook);
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += pointer.x * 0.9 + Math.sin(t * 0.15) * 0.15; vPos.y += -pointer.y * 0.35;
      camera.position.copy(vPos); camera.lookAt(vLook);
      glow.intensity = 60 + Math.sin(t * 2.3) * 4;
    },
  };
}
