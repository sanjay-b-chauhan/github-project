import * as THREE from 'three';
import { HASH, SNOISE3 } from '../glsl.js';
import { mulberry, svgImage, canvas2d } from '../util.js';
import { makeTrack, pointer } from '../track.js';

// THE STORY: three generations, one stage. q is local: 1 = Rajasthan (sand), 2 = Mumbai (a brick
// tower rises out of the sand, the city grows behind it), 3 = Dubai (the bricks lift off and turn
// into pixels that form the sunburst). 0 and 4 are the way in and out.
const BW = 0.3, BH = 0.1, BD = 0.15, FACE = 9, ROWS = 44;

export async function createLineage(renderer, { mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 600);
  const U = { uTime: { value: 0 }, uK1: { value: 0 }, uK2: { value: 0 }, uPx: { value: 1 } };

  // ---------- sky: desert dusk -> city blue hour -> digital black
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `varying vec3 vD; uniform float uK1; uniform float uK2; uniform float uTime; ${HASH}
      void main(){ float e = vD.y;
        vec3 d1 = mix(vec3(0.95,0.42,0.14), mix(vec3(0.22,0.07,0.06), vec3(0.015,0.012,0.03), smoothstep(0.1,0.5,e)), smoothstep(-0.02,0.12,e));
        vec3 d2 = mix(vec3(0.34,0.2,0.32), mix(vec3(0.06,0.06,0.14), vec3(0.01,0.012,0.035), smoothstep(0.1,0.5,e)), smoothstep(-0.02,0.14,e));
        vec3 d3 = vec3(0.004) + vec3(0.6,0.02,0.01) * exp(-abs(e)*40.0) * 0.5;
        vec3 c = mix(mix(d1, d2, uK1), d3, uK2);
        vec2 sp = vec2(atan(vD.z, vD.x)*110.0, e*120.0); float h = hash12(floor(sp));
        c += step(0.97, h) * smoothstep(0.25, 0.6, e) * smoothstep(0.3, 0.0, length(fract(sp)-0.5)) * 0.6 * (1.0 - uK2*0.7);
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false,
  }));
  sky.renderOrder = -2; sky.frustumCulled = false; scene.add(sky);

  // ---------- ground: dunes that settle flat, then turn into a lit grid
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, mobile ? 160 : 260, mobile ? 160 : 260), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `uniform float uK1; ${SNOISE3} varying vec3 vW; varying float vH; varying vec3 vN;
      float H(vec2 q){ float r = length(q); float flat_ = smoothstep(5.0, 16.0, r);
        float u = dot(q, normalize(vec2(0.86,0.5)))*0.07 + snoise(vec3(q*0.02, 1.0))*1.2;
        float s = fract(u); float prof = s < 0.8 ? s/0.8 : (1.0-s)/0.2;
        prof = smoothstep(0.0, 1.0, prof);
        return (pow(prof,1.6)*2.6 + snoise(vec3(q*0.05, 3.0))*0.8) * flat_ * (1.0 - uK1*0.75); }
      void main(){ vec4 w = modelMatrix*vec4(position,1.0);
        float h = H(w.xz), e = 0.35;
        vN = normalize(vec3(H(w.xz - vec2(e,0.0)) - H(w.xz + vec2(e,0.0)), 2.0*e, H(w.xz - vec2(0.0,e)) - H(w.xz + vec2(0.0,e))));
        w.y += h; vH = h; vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform float uK1; uniform float uK2; uniform float uTime; varying vec3 vW; varying float vH; varying vec3 vN;
      void main(){
        vec3 n = normalize(vN);
        float lam = max(dot(n, normalize(vec3(-0.7, 0.45, -0.35))), 0.0);
        float rip = sin(dot(vW.xz, normalize(vec2(0.86,0.5)))*6.0 + sin(vW.x*0.6)*1.2);
        vec3 sand = vec3(0.66,0.44,0.26);
        vec3 lit1 = mix(vec3(1.0,0.62,0.34), vec3(0.55,0.55,0.75), uK1);
        vec3 col = sand * (lit1 * pow(lam,1.2) * mix(0.75, 0.32, uK1) * (0.9 + 0.1*rip) + vec3(0.03,0.025,0.035));
        float d = length(vW.xz);
        // the digital floor: a fine red grid breathing out from the centre
        vec2 g = abs(fract(vW.xz*0.5) - 0.5) / fwidth(vW.xz*0.5);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        float pulse = 0.55 + 0.45*sin(d*0.9 - uTime*2.0);
        vec3 grid = vec3(0.012) + vec3(1.0,0.08,0.04) * line * pulse * 0.9 * exp(-d*0.035);
        col = mix(col, grid, uK2);
        float fog = exp(-d*0.012);
        gl_FragColor = vec4(col*fog, 1.0);
      }`,
  }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);

  // ---------- the city that grows behind the tower (Mumbai)
  const NB = mobile ? 90 : 160;
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `uniform float uK1; uniform float uK2; attribute vec3 aR; varying vec3 vL; varying vec3 vR; varying float vY;
      void main(){ vec3 p = position; vL = p; vR = aR;
        float rise = clamp((uK1*1.3 - aR.x*0.3), 0.0, 1.0) * (1.0 - uK2);
        vec4 w = instanceMatrix * vec4(p.x, (p.y + 0.5) * max(rise, 0.0001) - 0.5, p.z, 1.0);
        vY = (p.y + 0.5); gl_Position = projectionMatrix*viewMatrix*modelMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform float uK1; uniform float uTime; varying vec3 vL; varying vec3 vR; varying float vY; ${HASH}
      void main(){ vec2 f = vec2(vL.x + vL.z, vL.y) * vec2(10.0, 30.0 + vR.y*20.0);
        float win = step(0.35, fract(f.x)) * step(0.4, fract(f.y)) * step(0.55, hash12(floor(f) + vR.z*91.0));
        vec3 c = vec3(0.012, 0.013, 0.02) + vec3(1.0, 0.72, 0.4) * win * 0.9 * uK1;
        gl_FragColor = vec4(c, 1.0); }`,
  }), NB);
  {
    const r = mulberry(12), m = new THREE.Matrix4(), aR = new Float32Array(NB * 3);
    for (let i = 0; i < NB; i++) {
      const a = Math.PI * (0.15 + r() * 0.7) + (r() < 0.5 ? 0 : Math.PI * 0.0), rad = 55 + r() * 60;
      const ang = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5;
      const h = 8 + Math.pow(r(), 1.6) * 38, w = 4 + r() * 7;
      m.compose(new THREE.Vector3(Math.cos(ang) * rad, h / 2, Math.sin(ang) * rad), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 3, 0)), new THREE.Vector3(w, h, w * (0.7 + r() * 0.6)));
      city.setMatrixAt(i, m); aR.set([r(), r(), r()], i * 3);
      void a;
    }
    city.geometry.setAttribute('aR', new THREE.InstancedBufferAttribute(aR, 3));
    city.frustumCulled = false; scene.add(city);
  }

  // ---------- sand heap at the centre (Rajasthan), sinking as the bricks rise
  const NS = mobile ? 7000 : 14000;
  const sp = new Float32Array(NS * 3), sr = new Float32Array(NS * 3);
  const rs = mulberry(3);
  for (let i = 0; i < NS; i++) {
    const a = rs() * Math.PI * 2, rr = Math.pow(rs(), 0.7) * 3.4;
    sp.set([Math.cos(a) * rr, Math.max(0, 1.5 * Math.exp(-rr * rr / 3.2) + (rs() - 0.5) * 0.08), Math.sin(a) * rr], i * 3);
    sr.set([rs(), rs(), rs()], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sg.setAttribute('aR', new THREE.BufferAttribute(sr, 3));
  const sand = new THREE.Points(sg, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `uniform float uTime; uniform float uK1; uniform float uPx; attribute vec3 aR; varying float vA;
      void main(){ vec3 p = position;
        float ang = uTime*0.08*(0.4 + aR.x) + p.y*0.4; float c = cos(ang), s = sin(ang);
        p.xz = mat2(c, -s, s, c) * p.xz;
        p.y += sin(uTime*1.3 + aR.y*30.0)*0.03;
        float blow = uK1; p.x += blow * (4.0 + aR.x*14.0); p.y += blow * aR.y * 2.5; // the wind takes the sand away
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        vA = (0.25 + 0.75*pow(aR.z, 3.0)) * (1.0 - smoothstep(0.4, 1.0, uK1)) * (0.6 + 0.4*sin(uTime*(1.0 + aR.x*3.0) + aR.z*40.0));
        gl_PointSize = clamp(uPx*(1.0 + aR.y*1.8)*22.0 / -mv.z, 0.7, 4.0*uPx); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(1.3,0.78,0.4)*vA*smoothstep(0.5,0.0,d), 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  sand.frustumCulled = false; scene.add(sand);

  // ---------- bricks: a tower laid row by row, which later lifts off into pixels
  const build = [], rot = [], rowK = [];
  const half = (FACE * BW) / 2;
  for (let row = 0; row < ROWS; row++) {
    const y = row * BH + BH / 2, off = row % 2 ? BW / 2 : 0;
    const floor_ = Math.floor(row / 11), inWinRow = row % 11 >= 3 && row % 11 <= 8;
    for (let f = 0; f < 4; f++) for (let k = 0; k < FACE; k++) {
      const along = -half + off + k * BW + BW / 2;
      if (along > half + 0.01) continue;
      const win = inWinRow && floor_ < 4 && (k === 2 || k === 3 || k === 5 || k === 6);
      if (win) continue;
      const out = half + BD / 2 - 0.02;
      let x, z, ry;
      if (f === 0) { x = along; z = out; ry = 0; } else if (f === 1) { x = -along; z = -out; ry = 0; } else if (f === 2) { x = out; z = -along; ry = 1; } else { x = -out; z = along; ry = 1; }
      build.push([x, y, z]); rot.push(ry); rowK.push(row / ROWS);
    }
  }
  const NBR = build.length;
  // pixel targets: the sunburst, sampled into a grid of cells
  const pix = [];
  try {
    const im = await svgImage('assets/sunburst.svg', '#ffffff', 96);
    const [c, g] = canvas2d(im.w, im.h); g.drawImage(im.img, 0, 0, im.w, im.h);
    const d = g.getImageData(0, 0, im.w, im.h).data;
    const cell = 2, W = 6.4 / im.w;
    for (let y = 0; y < im.h; y += cell) for (let x = 0; x < im.w; x += cell) if (d[(y * im.w + x) * 4 + 3] > 120) pix.push([(x - im.w / 2) * W, 5.2 - (y - im.h / 2) * W * 1.0 - 0.3, 0]);
  } catch (e) { /* grid only */ }
  const rp = mulberry(9);
  const pixPos = new Float32Array(NBR * 3);
  for (let i = 0; i < NBR; i++) {
    const t = pix.length ? pix[Math.floor((i / NBR) * pix.length * 1.0) % pix.length] : null;
    if (t && i < NBR * 0.82) pixPos.set([t[0] + (rp() - 0.5) * 0.02, t[1] + (rp() - 0.5) * 0.02, (rp() - 0.5) * 0.25], i * 3);
    else { const a = rp() * Math.PI * 2, rr = 4 + rp() * 6; pixPos.set([Math.cos(a) * rr, 0.6 + rp() * 7, Math.sin(a) * rr * 0.5 - 2], i * 3); }
  }
  const bgeo = new THREE.BoxGeometry(1, 1, 1);
  const bmat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `uniform float uK1; uniform float uK2; uniform float uTime;
      attribute vec3 aB; attribute vec3 aP; attribute float aRot; attribute float aRow; attribute vec3 aR;
      varying vec3 vN; varying float vE; varying vec3 vR; varying float vY;
      void main(){
        float t1 = clamp((uK1*1.25 - aRow)*5.0, 0.0, 1.0); float e1 = 1.0 - pow(1.0 - t1, 3.0);
        float t2 = clamp((uK2*1.4 - aR.x*0.4)*2.4, 0.0, 1.0); float e2 = t2*t2*(3.0 - 2.0*t2);
        vec3 size = mix(vec3(${BW - 0.02}, ${BH - 0.018}, ${BD}), vec3(0.11), e2);
        vec3 p = position * size * step(0.001, t1);
        vec3 n = normal;
        if (aRot > 0.5) { p.xz = p.zx; n.xz = n.zx; }
        vec3 at = mix(aB + vec3(0.0, (1.0 - e1)*2.5, 0.0), aP + vec3(0.0, sin(uTime*1.2 + aR.y*20.0)*0.04*e2, 0.0), e2);
        // on the way between, bricks tumble a little
        float sw = sin(e2*3.14159) * (aR.z - 0.5) * 2.0;
        float c = cos(sw), s = sin(sw); p.xy = mat2(c, -s, s, c) * p.xy;
        vN = n; vE = e2; vR = aR; vY = aB.y;
        gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(p + at, 1.0);
      }`,
    fragmentShader: /* glsl */ `uniform float uK1; varying vec3 vN; varying float vE; varying vec3 vR; varying float vY;
      void main(){
        vec3 brick = mix(vec3(0.42,0.13,0.06), vec3(0.62,0.24,0.1), vR.y) * (0.8 + 0.3*vR.z);
        float key = max(dot(normalize(vN), normalize(vec3(-0.6, 0.55, 0.6))), 0.0);
        float fill = max(dot(normalize(vN), normalize(vec3(0.7, 0.2, -0.3))), 0.0);
        vec3 lit = brick * (vec3(1.0,0.78,0.6)*key*1.3 + vec3(0.35,0.4,0.6)*fill*0.35 + 0.06) * (0.55 + 0.45*smoothstep(0.0, 1.2, vY));
        vec3 px = mix(vec3(2.4,0.18,0.08), vec3(2.2,2.0,1.7), step(0.82, vR.x)) * (0.8 + 0.4*key);
        gl_FragColor = vec4(mix(lit, px, vE), 1.0);
      }`,
  });
  const bricks = new THREE.InstancedMesh(bgeo, bmat, NBR);
  {
    const aB = new Float32Array(NBR * 3), aRot = new Float32Array(NBR), aRow = new Float32Array(NBR), aR = new Float32Array(NBR * 3);
    const rr = mulberry(21);
    for (let i = 0; i < NBR; i++) { aB.set(build[i], i * 3); aRot[i] = rot[i]; aRow[i] = rowK[i]; aR.set([rr(), rr(), rr()], i * 3); }
    bgeo.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 3));
    bgeo.setAttribute('aP', new THREE.InstancedBufferAttribute(pixPos, 3));
    bgeo.setAttribute('aRot', new THREE.InstancedBufferAttribute(aRot, 1));
    bgeo.setAttribute('aRow', new THREE.InstancedBufferAttribute(aRow, 1));
    bgeo.setAttribute('aR', new THREE.InstancedBufferAttribute(aR, 3));
    bricks.frustumCulled = false; scene.add(bricks);
  }

  // ---------- camera: a slow orbit across the three chapters
  const track = makeTrack([
    { p: 0, pos: [-18, 9, 26], look: [0, 1.6, 0] },
    { p: 1, pos: [-6.5, 2.6, 12.5], look: [0, 1.3, 0] },
    { p: 2, pos: [3.2, 3.1, 12.8], look: [0, 2.6, 0] },
    { p: 3, pos: [0, 4.4, 13.5], look: [0, 3.8, 0] },
    { p: 4, pos: [0, 4.6, 5.5], look: [0, 4.4, -2] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let dScale = 1;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  return {
    name: 'lineage', scene, camera, exposure: 1,
    anchor(o) { o.pos.set(0, 5, 0); o.size = 0; o.k = 0; },
    applyAspect(a) { camera.aspect = a; camera.fov = a < 0.8 ? 56 : a < 1.2 ? 46 : 38; camera.updateProjectionMatrix(); dScale = a < 0.8 ? 1.35 : 1; U.uPx.value = Math.min(devicePixelRatio || 1, 1.5); },
    update(dt, t, q) {
      U.uTime.value = t;
      U.uK1.value = sm(1.15, 1.85, q);
      U.uK2.value = sm(2.15, 2.85, q);
      track.at(q, vPos, vLook);
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      vPos.x += pointer.x * 0.8; vPos.y += -pointer.y * 0.3;
      camera.position.copy(vPos); camera.lookAt(vLook);
    },
  };
}
