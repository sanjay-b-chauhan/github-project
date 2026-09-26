import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { HASH } from '../glsl.js';
import { panelTextures, radialTexture, ledTexture } from '../textures.js';
import { makeTrack, pointer } from '../track.js';
import { clamp, damp, smooth } from '../util.js';

// SET 2: a dark tiled screening room. A huge lit screen plays the current project,
// a projector pedestal with an LED ring scrolls text in front of it, and the room
// takes its light from whatever is on screen.
export const SCREEN = { w: 15, h: 9.375, x: 0, y: 6.35, z: -8 };

export function createRoom(renderer, { mobile, projects }) {
  RectAreaLightUniformsLib.init();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010101);
  scene.fog = new THREE.Fog(0x000000, 28, 62);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 200);

  const accent = new THREE.Color(projects[0].accent);
  const accentTarget = accent.clone();
  const uTime = { value: 0 };
  const uAccent = { value: accent };

  // ---------- architecture ----------
  const wall = panelTextures({ base: [34, 34, 35], vary: 7, seam: 5, seamW: 16, repeat: [12.5, 5], seed: 4 });
  const wallMat = new THREE.MeshStandardMaterial({ map: wall.map, bumpMap: wall.bump, bumpScale: 2.2, roughness: 0.72, metalness: 0.12 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), wallMat);
  back.position.set(0, 8, SCREEN.z - 0.25);
  scene.add(back);
  const sideMat = wallMat.clone();
  sideMat.map = wall.map.clone(); sideMat.map.repeat.set(15, 5); sideMat.map.needsUpdate = true;
  sideMat.bumpMap = wall.bump.clone(); sideMat.bumpMap.repeat.set(15, 5); sideMat.bumpMap.needsUpdate = true;
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(48, 16), sideMat);
    side.rotation.y = -s * Math.PI / 2;
    side.position.set(s * 17, 8, 16);
    scene.add(side);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.38, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 20;
  scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.8 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 12.0, 20);
  scene.add(ceil);
  // ceiling beams and floor slats run front to back so they converge like the reference's
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.55, metalness: 0.3 });
  const beamGeo = new THREE.BoxGeometry(0.55, 0.8, 44);
  for (const x of [-15, -11.5, -8, -4.5, 4.5, 8, 11.5, 15]) {
    const b = new THREE.Mesh(beamGeo, beamMat); b.position.set(x, 11.6, 14); scene.add(b);
  }
  const slatGeo = new THREE.BoxGeometry(0.34, 0.08, 44);
  const slatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.4 });
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) {
    const b = new THREE.Mesh(slatGeo, slatMat); b.position.set(s * (7.2 + i * 1.05), 0.04, 14); scene.add(b);
  }

  // ---------- screen ----------
  const loader = new THREE.TextureLoader();
  const texCache = new Map();
  const blank = new THREE.DataTexture(new Uint8Array([8, 8, 8, 255]), 1, 1);
  blank.needsUpdate = true;
  function getTex(i) {
    const pr = projects[i];
    if (!texCache.has(pr.id)) {
      const t = loader.load(pr.img, (tt) => { tt.needsUpdate = true; });
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      texCache.set(pr.id, t);
    }
    return texCache.get(pr.id);
  }
  const screenU = {
    tA: { value: blank }, tB: { value: blank }, uMix: { value: 1 }, uTime, uSeed: { value: 1 }, uBright: { value: 1.12 },
  };
  const screenMat = new THREE.ShaderMaterial({
    uniforms: screenU,
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tA; uniform sampler2D tB; uniform float uMix; uniform float uTime; uniform float uSeed; uniform float uBright;
      varying vec2 vUv;
      ${HASH}
      void main(){
        vec2 uv = vUv;
        float g = sin(clamp(uMix,0.0,1.0)*3.14159);
        float slice = floor(uv.y*42.0);
        float on = step(0.55, hash12(vec2(slice*1.7, uSeed + floor(uTime*18.0))));
        float jitter = (hash12(vec2(slice, floor(uTime*24.0) + uSeed)) - 0.5) * 0.08 * g * on;
        vec2 u2 = uv + vec2(jitter, 0.0);
        float ca = 0.007*g;
        vec3 a = vec3(texture2D(tA, u2 + vec2(ca,0.0)).r, texture2D(tA, u2).g, texture2D(tA, u2 - vec2(ca,0.0)).b);
        vec3 b = vec3(texture2D(tB, u2 + vec2(ca,0.0)).r, texture2D(tB, u2).g, texture2D(tB, u2 - vec2(ca,0.0)).b);
        float blk = hash12(floor(uv*vec2(56.0, 35.0)) + uSeed*13.0);
        float m = smoothstep(blk*0.7, blk*0.7 + 0.3, uMix);
        vec3 col = mix(a, b, m);
        col += g * 0.08 * vec3(hash12(floor(uv*vec2(160.0,100.0)) + floor(uTime*30.0)));
        float top = smoothstep(0.7, 1.0, uv.y);
        float bot = smoothstep(0.3, 0.0, uv.y);
        col *= 1.0 - 0.34*top - 0.38*bot;
        // corner scrims where the overlay text sits
        float tl = smoothstep(0.62, 0.0, length((uv - vec2(0.0, 1.0))*vec2(1.0, 2.1)));
        float tr = smoothstep(0.42, 0.0, length((uv - vec2(1.0, 1.0))*vec2(1.25, 2.3)));
        float bl = smoothstep(0.4, 0.0, length((uv - vec2(0.0, 0.0))*vec2(1.3, 2.3)));
        float br = smoothstep(0.55, 0.0, length((uv - vec2(1.0, 0.0))*vec2(1.05, 2.2)));
        col *= 1.0 - 0.8*max(max(tl, tr), max(bl, br));
        col *= 0.95 + 0.05*sin(uv.y*1100.0);
        vec2 d = uv - 0.5; col *= 1.0 - dot(d,d)*0.45;
        gl_FragColor = vec4(col*uBright, 1.0);
      }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), screenMat);
  screen.position.set(SCREEN.x, SCREEN.y, SCREEN.z);
  scene.add(screen);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(SCREEN.w + 0.3, SCREEN.h + 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.4, metalness: 0.5 }));
  bezel.position.set(SCREEN.x, SCREEN.y, SCREEN.z - 0.17);
  scene.add(bezel);
  // halo around the screen (fake bloom on the wall)
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w * 1.9, SCREEN.h * 2.1), new THREE.ShaderMaterial({
    uniforms: { uHalf: { value: new THREE.Vector2(SCREEN.w / 2, SCREEN.h / 2) }, uAccent },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec2 uHalf; uniform vec3 uAccent; varying vec2 vP;
      float sdBox(vec2 p, vec2 b){ vec2 d = abs(p)-b; return length(max(d,0.0)) + min(max(d.x,d.y),0.0); }
      void main(){ float sd = sdBox(vP, uHalf); float g = exp(-max(sd,0.0)*0.55)*step(0.0, sd); gl_FragColor = vec4(uAccent*g*0.22, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.position.set(SCREEN.x, SCREEN.y, SCREEN.z - 0.02);
  scene.add(halo);

  // ---------- projector pedestal + LED ring ----------
  const ped = new THREE.Group();
  ped.position.set(0, 0, -3.6);
  scene.add(ped);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.3, 96), [
    new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.5, metalness: 0.4 }),
    new THREE.MeshStandardMaterial({ map: radialTexture(), roughness: 0.55, metalness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0x121212 }),
  ]);
  plat.position.y = 0.15;
  ped.add(plat);
  const metal = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.42, metalness: 0.7 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.55, 1.35, 96), metal);
  base.position.y = 0.3 + 0.675;
  ped.add(base);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.18, 0.14, 96), metal);
  collar.position.y = 1.72;
  ped.add(collar);
  const RING_R = 2.08, BAND_H = 0.82, BAND_Y = 1.79 + BAND_H / 2;
  const led = ledTexture('SELECTED WORK · SANJAY CHAUHAN DESIGNS · ');
  const ledMat = new THREE.ShaderMaterial({
    uniforms: { uText: { value: led }, uTime, uAccent },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uText; uniform float uTime; uniform vec3 uAccent; varying vec2 vUv;
      void main(){
        vec2 grid = vec2(430.0, 19.0);
        vec2 gpos = vUv*grid;
        vec2 cell = floor(gpos);
        vec2 f = fract(gpos) - 0.5;
        vec2 suv = (cell + 0.5)/grid;
        suv.x = fract(suv.x + uTime*0.011);
        suv.y = (suv.y - 0.5)*1.05 + 0.5;
        vec2 hd = 0.3/grid;
        float cov = texture2D(uText, suv + vec2(-hd.x,-hd.y)).r + texture2D(uText, suv + vec2(hd.x,-hd.y)).r
                  + texture2D(uText, suv + vec2(-hd.x,hd.y)).r + texture2D(uText, suv + vec2(hd.x,hd.y)).r;
        float lit = smoothstep(1.0, 2.8, cov);
        float dm = smoothstep(0.48, 0.18, length(f));
        vec3 off = vec3(0.028);
        vec3 on = vec3(1.25) + uAccent*1.1;
        gl_FragColor = vec4(mix(off, on, lit)*dm, 1.0);
      }`,
  });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(RING_R, RING_R, BAND_H, 160, 1, true), ledMat);
  band.position.y = BAND_Y;
  ped.add(band);
  const rimMat = new THREE.MeshBasicMaterial({ color: accent.clone().multiplyScalar(2.2) });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(RING_R + 0.02, 0.07, 12, 160), rimMat);
  rim.rotation.x = Math.PI / 2; rim.position.y = BAND_Y + BAND_H / 2 + 0.02;
  ped.add(rim);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(RING_R + 0.02, 0.05, 10, 160), metal);
  rim2.rotation.x = Math.PI / 2; rim2.position.y = BAND_Y - BAND_H / 2 - 0.01;
  ped.add(rim2);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(RING_R - 0.05, 96), new THREE.ShaderMaterial({
    uniforms: { uAccent, uTime },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent; uniform float uTime; varying vec2 vUv;
      void main(){ float r = length(vUv-0.5)*2.0; float g = pow(1.0-r, 1.6); float ringy = 0.5+0.5*sin(r*40.0 - uTime*2.0);
        vec3 col = uAccent*(0.25 + 1.6*g) + vec3(1.0)*pow(g,4.0)*0.8; col *= 0.85 + 0.15*ringy; gl_FragColor = vec4(col, 1.0); }`,
  }));
  lens.rotation.x = -Math.PI / 2; lens.position.y = BAND_Y + BAND_H / 2 + 0.005;
  ped.add(lens);
  // light beam + rising motes
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.85, 6.6, 64, 1, true), new THREE.ShaderMaterial({
    uniforms: { uAccent, uTime },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent; uniform float uTime; varying vec2 vUv;
      void main(){ float a = pow(1.0 - vUv.y, 2.2) * 0.075; float s = 0.6 + 0.4*sin(vUv.x*80.0 + uTime*0.6)*sin(vUv.x*23.0 - uTime*0.3);
        gl_FragColor = vec4(uAccent*a*s, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  beam.position.y = BAND_Y + BAND_H / 2 + 3.3;
  ped.add(beam);
  const NM = mobile ? 180 : 360;
  const mp = new Float32Array(NM * 3), mr = new Float32Array(NM * 3);
  for (let i = 0; i < NM; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.75;
    mp[i * 3] = Math.cos(a) * r; mp[i * 3 + 1] = Math.random(); mp[i * 3 + 2] = Math.sin(a) * r;
    mr[i * 3] = Math.random(); mr[i * 3 + 1] = Math.random(); mr[i * 3 + 2] = Math.random();
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  mg.setAttribute('aRnd', new THREE.BufferAttribute(mr, 3));
  const motes = new THREE.Points(mg, new THREE.ShaderMaterial({
    uniforms: { uAccent, uTime, uPx: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPx; attribute vec3 aRnd; varying float vA;
      void main(){ vec3 p = position; float h = fract(p.y + uTime*(0.05 + aRnd.x*0.08)); p.y = h*7.0; p.xz *= 1.0 - h*0.12;
        vA = smoothstep(0.0, 0.1, h)*(1.0 - smoothstep(0.55, 1.0, h))*(0.3 + 0.7*aRnd.y);
        vec4 mv = modelViewMatrix*vec4(p,1.0); gl_PointSize = clamp((1.2 + aRnd.z*1.6)*uPx*16.0/-mv.z, 0.7, 3.0*uPx); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `uniform vec3 uAccent; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4((uAccent*1.4+0.3)*vA*smoothstep(0.5,0.0,d), 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  motes.position.y = BAND_Y + BAND_H / 2;
  motes.frustumCulled = false;
  ped.add(motes);

  // ---------- light ----------
  const area = new THREE.RectAreaLight(accent, 3.6, SCREEN.w, SCREEN.h);
  area.position.set(SCREEN.x, SCREEN.y, SCREEN.z + 0.05);
  area.lookAt(SCREEN.x, SCREEN.y, 20);
  scene.add(area);
  const lensLight = new THREE.PointLight(accent, 12, 11, 2);
  lensLight.position.set(0, BAND_Y + 1.2, -3.6);
  scene.add(lensLight);
  scene.add(new THREE.HemisphereLight(0x2a2a2a, 0x050505, 0.16));
  const spill = [];
  for (const [x, y] of [[-9.6, 6.3], [9.6, 6.3]]) {
    const l = new THREE.PointLight(accent, 9, 10, 2);
    l.position.set(x, y, SCREEN.z + 1.1);
    scene.add(l); spill.push(l);
  }

  // ---------- camera ----------
  const track = makeTrack([
    { p: 0.28, pos: [0, 9.2, 27], look: [0, 7.0, -8] },
    { p: 0.465, pos: [0, 5.3, 13.4], look: [0, 6.05, -8] },
    { p: 0.56, pos: [3.4, 5.7, 11.6], look: [6.2, 6.3, -8] },
    { p: 0.66, pos: [7, 6.4, 9.4], look: [12, 6.6, -8] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1, portrait = false;
  function applyAspect(aspect) {
    camera.aspect = aspect;
    portrait = aspect < 0.8;
    camera.fov = aspect < 0.8 ? 50 : aspect < 1.2 ? 44 : 40;
    camera.updateProjectionMatrix();
    // keep the screen at ~62% of the width on wide screens, ~94% on phones
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect);
    const frac = aspect < 0.8 ? 0.94 : aspect < 1.2 ? 0.8 : aspect < 1.45 ? 0.72 : 0.62;
    const need = (SCREEN.w / 2) / (frac * Math.tan(hfov / 2));
    dScale = Math.max(1, need / 21.4);
  }

  // ---------- project switching ----------
  let cur = 0, mixV = 1, seed = 1;
  function setProject(i, instant = false) {
    const n = projects.length;
    i = ((i % n) + n) % n;
    if (i === cur && !instant) return;
    screenU.tA.value = instant ? getTex(i) : getTex(cur);
    screenU.tB.value = getTex(i);
    seed = (seed + 1.37) % 97;
    screenU.uSeed.value = seed;
    mixV = instant ? 1 : 0;
    cur = i;
    accentTarget.set(projects[i].accent);
    // warm the neighbours
    getTex((i + 1) % n); getTex((i + n - 1) % n);
  }
  screenU.tA.value = getTex(0);
  screenU.tB.value = getTex(0);

  const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const local = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  return {
    name: 'room', scene, camera, applyAspect, setProject,
    get index() { return cur; },
    preload() { projects.forEach((_, i) => getTex(i)); },
    // screen corners in CSS px (tl, tr, br, bl); null if behind the camera
    screenQuad(w, h) {
      const out = [];
      for (let k = 0; k < 4; k++) {
        corners[k].set(SCREEN.x + (local[k][0] * SCREEN.w) / 2, SCREEN.y + (local[k][1] * SCREEN.h) / 2, SCREEN.z + 0.01);
        corners[k].project(camera);
        if (corners[k].z > 1) return null;
        out.push([(corners[k].x * 0.5 + 0.5) * w, (-corners[k].y * 0.5 + 0.5) * h]);
      }
      return out;
    },
    update(dt, t, p) {
      uTime.value = t;
      track.at(p, vPos, vLook);
      if (portrait) { vLook.y -= 2.2; vPos.y -= 0.6; }
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += Math.sin(t * 0.21) * 0.08 + pointer.x * 0.45; vPos.y += Math.sin(t * 0.17) * 0.06 - pointer.y * 0.22;
      camera.position.copy(vPos);
      camera.lookAt(vLook);
      if (mixV < 1) { mixV = Math.min(1, mixV + dt / 0.95); screenU.uMix.value = mixV; if (mixV >= 1) screenU.tA.value = screenU.tB.value; }
      else screenU.uMix.value = 1;
      const k = 1 - Math.exp(-3.2 * dt);
      accent.lerp(accentTarget, k);
      rimMat.color.copy(accent).multiplyScalar(2.2);
      area.color.copy(accent);
      lensLight.color.copy(accent);
      for (const l of spill) l.color.copy(accent);
      area.intensity = 3.4 + Math.sin(t * 1.3) * 0.18;
    },
  };
}
