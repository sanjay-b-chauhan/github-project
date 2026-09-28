import * as THREE from 'three';
import { canvas2d, mulberry, speckle, svgImage } from '../util.js';
import { makeTrack, pointer } from '../track.js';

// THOUGHTS: a brick wall at night with six neon signs, one per belief. The wet floor carries
// their reflections, the signs flicker on as you arrive. q: 0 in from the left, 0.5 facing the wall, 1 out to the right.
const COLORS = [[1.0, 0.1, 0.05], [1.0, 0.86, 0.7], [1.0, 0.1, 0.05], [1.0, 0.86, 0.7], [1.0, 0.1, 0.05], [1.0, 0.86, 0.7]];

function wrap(g, text, max) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function neonTexture(num, text) {
  const W = 1280, H = 440;
  const [c, g] = canvas2d(W, H);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '400 92px Fraunces, Georgia, serif';
  const lines = wrap(g, text, W - 140).slice(0, 2);
  const y0 = H / 2 - (lines.length - 1) * 52 + 18;
  const pass = (blur, alpha, width) => {
    g.shadowColor = `rgba(255,255,255,${alpha})`; g.shadowBlur = blur;
    g.strokeStyle = `rgba(255,255,255,${alpha})`; g.lineWidth = width; g.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
    lines.forEach((l, i) => { g.strokeText(l, W / 2, y0 + i * 104); g.fillText(l, W / 2, y0 + i * 104); });
  };
  pass(60, 0.35, 6); pass(26, 0.6, 4); pass(8, 1, 2);
  g.shadowBlur = 14; g.shadowColor = 'rgba(255,255,255,0.8)';
  g.font = '500 30px "JetBrains Mono", monospace'; g.fillStyle = '#fff';
  g.fillText(num, W / 2, 46);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function brickTexture() {
  const W = 1024, H = 1024;
  const [c, g] = canvas2d(W, H);
  const r = mulberry(8);
  g.fillStyle = '#141010'; g.fillRect(0, 0, W, H);
  const bw = 128, bh = 44;
  for (let y = 0, row = 0; y < H; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < W; x += bw) {
    const v = 36 + r() * 22;
    g.fillStyle = `rgb(${v + 14},${v * 0.62},${v * 0.52})`;
    g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 3, y + bh - 9, bw - 6, 6);
  }
  speckle(g, W, H, 0.12, 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export async function createNeon(renderer, { mobile, thoughts }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030303);
  scene.fog = new THREE.Fog(0x030303, 18, 44);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 150);
  const uTime = { value: 0 };

  const brick = brickTexture(); brick.repeat.set(9, 3.2);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 13), new THREE.MeshStandardMaterial({ map: brick, roughness: 0.92, color: 0xbfb3ab }));
  wall.position.set(0, 6.5, -5); scene.add(wall);
  // wet floor: dark, glossy and half transparent, so the mirrored signs below read as reflections
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 10; floor.renderOrder = 2; scene.add(floor);

  const signs = [];
  const mkSign = (tex, w, h, color) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, uCol: { value: new THREE.Color(...color) }, uI: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `uniform sampler2D map; uniform vec3 uCol; uniform float uI; varying vec2 vUv;
        void main(){ float a = texture2D(map, vUv).r; vec3 core = mix(uCol, vec3(1.0), smoothstep(0.75, 1.0, a) * 0.6);
          gl_FragColor = vec4(core * (a * a * 2.6 + a * 0.4) * uI, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    const refl = new THREE.Mesh(m.geometry, mat.clone());
    refl.material.uniforms = { map: mat.uniforms.map, uCol: mat.uniforms.uCol, uI: { value: 0 } };
    refl.scale.y = -1; refl.renderOrder = 1;
    scene.add(m); scene.add(refl);
    return { m, refl, mat };
  };
  thoughts.forEach(([h], i) => {
    const s = mkSign(neonTexture(String(i + 1).padStart(2, '0'), h), 6.4, 2.2, COLORS[i]);
    const light = new THREE.PointLight(new THREE.Color(...COLORS[i]), 0, 9, 2);
    scene.add(light);
    signs.push({ ...s, light, on: 0, seed: i * 1.7 });
  });
  // the monogram above them in red
  let mono = null;
  try {
    const im = await svgImage('assets/sc.svg', '#ffffff', 900);
    const [c, g] = canvas2d(im.w + 160, im.h + 160);
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    for (const [b, a] of [[50, 0.5], [20, 0.8], [0, 1]]) { g.shadowColor = `rgba(255,255,255,${a})`; g.shadowBlur = b; g.globalAlpha = a; g.drawImage(im.img, 80, 80, im.w, im.h); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    mono = mkSign(t, 3.4, 3.4 * c.height / c.width, [1.0, 0.08, 0.04]);
  } catch (e) { /* signs only */ }

  // mist
  const rnd = mulberry(3);
  const NM = mobile ? 160 : 320;
  const mp = new Float32Array(NM * 3);
  for (let i = 0; i < NM; i++) mp.set([(rnd() - 0.5) * 30, rnd() * 9, -4 + rnd() * 14], i * 3);
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const mist = new THREE.Points(mg, new THREE.ShaderMaterial({
    uniforms: { uTime },
    vertexShader: /* glsl */ `uniform float uTime; void main(){ vec3 p = position; p.x += sin(uTime*0.1 + p.y)*0.6; p.y = mod(p.y + uTime*0.15, 9.0);
      vec4 mv = modelViewMatrix*vec4(p,1.0); gl_PointSize = clamp(40.0 / -mv.z, 1.0, 5.0); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(0.5,0.12,0.1)*smoothstep(0.5,0.0,d)*0.5, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  mist.frustumCulled = false; scene.add(mist);
  scene.add(new THREE.HemisphereLight(0x221816, 0x000000, 0.35));

  let portrait = false;
  function layout() {
    const pos = portrait
      ? [[0, 8.2], [0, 6.75], [0, 5.3], [0, 3.85], [0, 2.4], [0, 0.95]]
      : [[-7.2, 5.6], [0, 5.6], [7.2, 5.6], [-7.2, 2.6], [0, 2.6], [7.2, 2.6]];
    const k = portrait ? 0.66 : 1;
    signs.forEach((s, i) => {
      const [x, y] = pos[i];
      s.m.position.set(x, y + (portrait ? 0.9 : 0), -4.9); s.m.scale.set(k, k, 1);
      s.refl.position.set(x, -(y + (portrait ? 0.9 : 0)), -4.9); s.refl.scale.set(k, -k, 1);
      s.light.position.set(x, y, -3.6);
    });
    if (mono) { const y = portrait ? 10.2 : 8.6; mono.m.position.set(0, y, -4.9); mono.refl.position.set(0, -y, -4.9); const mk = portrait ? 0.7 : 1; mono.m.scale.set(mk, mk, 1); mono.refl.scale.set(mk, -mk, 1); }
  }
  const track = makeTrack([
    { p: 0.0, pos: [-12, 2.4, 11], look: [-3, 4.4, -5] },
    { p: 0.5, pos: [0, 4.3, 13.6], look: [0, 4.4, -5] },
    { p: 1.0, pos: [11, 3.6, 8], look: [6, 4.2, -5] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1;
  const flick = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : [0, 1, 0, 0.3, 1, 0, 1][Math.floor(x * 7)]);
  return {
    name: 'neon', scene, camera, exposure: 1,
    applyAspect(a) {
      camera.aspect = a; portrait = a < 0.8;
      camera.fov = portrait ? 58 : a < 1.2 ? 50 : 40; camera.updateProjectionMatrix();
      dScale = portrait ? 1.05 : 1;
      layout();
    },
    update(dt, t, q) {
      uTime.value = t;
      track.at(q, vPos, vLook);
      if (portrait) { vLook.y += 0.9; vPos.y += 0.9; vPos.x *= 0.5; vLook.x *= 0.5; }
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += pointer.x * 0.7; vPos.y += -pointer.y * 0.25;
      camera.position.copy(vPos); camera.lookAt(vLook);
      // signs switch on one by one as you arrive
      signs.forEach((s, i) => {
        const x = (q - 0.18 - i * 0.035) / 0.1;
        const hum = 0.94 + 0.06 * Math.sin(t * 13 + s.seed) * Math.sin(t * 7.3 + s.seed * 2);
        const I = flick(x) * hum;
        s.mat.uniforms.uI.value = I;
        s.refl.material.uniforms.uI.value = I * 0.35;
        s.light.intensity = I * 26;
      });
      if (mono) { const I = flick((q - 0.12) / 0.1) * (0.96 + 0.04 * Math.sin(t * 9)); mono.mat.uniforms.uI.value = I * 1.2; mono.refl.material.uniforms.uI.value = I * 0.4; }
    },
  };
}
