import * as THREE from 'three';
import { SNOISE3, HASH, FS_VERT } from '../glsl.js';
import { makeNoise2D, mulberry, smooth, clamp, ease } from '../util.js';
import { makeTrack, pointer } from '../track.js';

// SET 1: star field, a particle mountain (points over a dark veined massif) and a
// tall thin portal on the ridge that glows brand red.
const DOM = { x0: -90, x1: 90, z0: -70, z1: 40 };
const RED = new THREE.Color(1.0, 0.004, 0.004);

export function createMountain(renderer, { mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 1400);

  // ---------- height field (CPU) ----------
  const noise = makeNoise2D(11);
  const fbm = (x, z, o) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise(x * f, z * f); f *= 2.02; a *= 0.5; } return s; };
  const ridged = (x, z, o) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { const n = 1 - Math.abs(noise(x * f, z * f)); s += a * n * n; f *= 2.03; a *= 0.5; } return s; };
  function height(x, z) {
    const r = Math.hypot(x * 0.9, z * 1.1);
    let h = 13.5 * Math.exp(-Math.pow(r / 33, 1.3));
    h += 2.6 * Math.exp(-(r * r) / (5.2 * 5.2));
    h += 2.4 * Math.exp(-((x - 15) ** 2 + (z + 3) ** 2) / 70) + 1.8 * Math.exp(-((x + 18) ** 2 + (z - 1) ** 2) / 90);
    const w = fbm(x * 0.03, z * 0.03, 2);
    h += (ridged(x * 0.06 + w * 0.9, z * 0.06 - w * 0.9, 5) - 0.42) * 4.6 * smooth(1.0, 13, r) * (1 - 0.62 * smooth(16, 38, r));
    h += fbm(x * 0.24, z * 0.24, 3) * 0.55 * smooth(0, 5, r);
    return h;
  }
  const summitY = height(0, 0);

  // ---------- vein texture (GPU bake, once) ----------
  const VW = mobile ? 1024 : 1536;
  const VH = Math.round((VW * (DOM.z1 - DOM.z0)) / (DOM.x1 - DOM.x0));
  const veinRT = new THREE.WebGLRenderTarget(VW, VH, {
    type: THREE.UnsignedByteType, depthBuffer: false,
    minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true,
  });
  veinRT.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  {
    const bake = new THREE.Mesh(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)),
      new THREE.ShaderMaterial({
        uniforms: { uDom: { value: new THREE.Vector4(DOM.x0, DOM.x1, DOM.z0, DOM.z1) } },
        vertexShader: FS_VERT,
        fragmentShader: /* glsl */ `
          uniform vec4 uDom; varying vec2 vUv;
          ${SNOISE3}
          void main(){
            float x = mix(uDom.x, uDom.y, vUv.x);
            float z = mix(uDom.z, uDom.w, vUv.y);
            float r = length(vec2(x*0.92, z*1.08));
            float th = atan(z, x);
            vec3 w = vec3(snoise(vec3(x*0.035, z*0.035, 1.3)), snoise(vec3(x*0.035, z*0.035, 5.1)), snoise(vec3(x*0.02, z*0.02, 8.7)));
            vec3 q = vec3(cos(th)*5.2, sin(th)*5.2, log(r+2.5)*2.6) + w*0.9;
            float s = 0.0, a = 0.75, f = 1.0;
            for (int i = 0; i < 5; i++) { float n = 1.0 - abs(snoise(q*f + float(i)*3.1)); s += a*pow(n, 6.5); f *= 2.13; a *= 0.62; }
            float v = clamp(s*1.25, 0.0, 1.0);
            float mask = smoothstep(1.2, 7.0, r) * (1.0 - smoothstep(55.0, 88.0, r));
            float cap = smoothstep(8.0, 1.0, r) * (0.55 + 0.45*snoise(vec3(x*0.6, z*0.6, 9.0)));
            float fine = snoise(vec3(x*1.1, z*1.1, 2.0))*0.5 + 0.5;
            gl_FragColor = vec4(v*mask, fine, clamp(cap,0.0,1.0), 1.0);
          }`,
        depthTest: false, depthWrite: false,
      })
    );
    bake.frustumCulled = false;
    const bs = new THREE.Scene(); bs.add(bake);
    renderer.setRenderTarget(veinRT);
    renderer.render(bs, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    renderer.setRenderTarget(null);
    bake.geometry.dispose(); bake.material.dispose();
  }

  const uDom = { value: new THREE.Vector4(DOM.x0, DOM.x1, DOM.z0, DOM.z1) };
  const portalBase = new THREE.Vector3(0.2, summitY - 0.4, 0.4);
  const shared = {
    uVein: { value: veinRT.texture }, uDom, uPortal: { value: portalBase }, uGlow: { value: 0 },
    uRed: { value: RED }, uTime: { value: 0 }, uPx: { value: 1 },
  };

  // ---------- terrain mesh ----------
  const NX = mobile ? 200 : 300;
  const NZ = Math.round((NX * (DOM.z1 - DOM.z0)) / (DOM.x1 - DOM.x0));
  const tg = new THREE.PlaneGeometry(DOM.x1 - DOM.x0, DOM.z1 - DOM.z0, NX, NZ);
  tg.rotateX(-Math.PI / 2);
  {
    const pos = tg.attributes.position;
    const cx = (DOM.x0 + DOM.x1) / 2, cz = (DOM.z0 + DOM.z1) / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
      pos.setXYZ(i, x, height(x, z), z);
    }
    tg.computeVertexNormals();
  }
  const terrainMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying float vDist;
      void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vN = normal; vec4 mv = viewMatrix*w; vDist = -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uVein; uniform vec4 uDom; uniform vec3 uPortal; uniform float uGlow; uniform vec3 uRed;
      varying vec3 vW; varying vec3 vN; varying float vDist;
      void main(){
        vec2 uv = vec2((vW.x-uDom.x)/(uDom.y-uDom.x), (vW.z-uDom.z)/(uDom.w-uDom.z));
        vec4 v = texture2D(uVein, uv);
        vec3 n = normalize(vN);
        float lam = max(dot(n, normalize(vec3(-0.45, 0.75, 0.4))), 0.0);
        vec3 col = vec3(0.003) + vec3(0.006)*lam*lam;
        col += vec3(0.17, 0.17, 0.175) * v.r * (0.45 + 0.55*v.g) * (0.45 + 0.55*lam);
        col += vec3(0.04) * v.b * (0.5 + 0.5*v.g);
        float dp = length(vW - uPortal);
        col += uRed * uGlow * exp(-dp*dp/9.0) * 0.16;
        float fog = smoothstep(170.0, 60.0, vDist) * (0.28 + 0.72*smoothstep(-1.0, 11.0, vW.y));
        float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) * smoothstep(0.0, 0.12, uv.y);
        gl_FragColor = vec4(col*fog*edge, 1.0);
      }`,
  });
  const terrain = new THREE.Mesh(tg, terrainMat);
  scene.add(terrain);

  // ---------- particle mountain ----------
  const rnd = mulberry(5);
  const NP = mobile ? 42000 : 80000;
  const pp = new Float32Array(NP * 3), pr = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    let x, z;
    for (;;) {
      const r = 64 * Math.pow(rnd(), 1.25);
      const th = rnd() * Math.PI * 2;
      x = (Math.cos(th) * r) / 0.92; z = (Math.sin(th) * r) / 1.08;
      if (z > -14 && x > DOM.x0 + 4 && x < DOM.x1 - 4 && z < DOM.z1 - 2) break;
    }
    pp[i * 3] = x; pp[i * 3 + 1] = height(x, z) + 0.06; pp[i * 3 + 2] = z;
    pr[i * 3] = rnd(); pr[i * 3 + 1] = rnd(); pr[i * 3 + 2] = rnd();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  pg.setAttribute('aRnd', new THREE.BufferAttribute(pr, 3));
  const pointsMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: /* glsl */ `
      uniform sampler2D uVein; uniform vec4 uDom; uniform float uPx; uniform float uTime; uniform vec3 uPortal; uniform float uGlow;
      attribute vec3 aRnd; varying float vB; varying float vRed;
      void main(){
        vec4 w = modelMatrix*vec4(position,1.0);
        vec2 uv = vec2((w.x-uDom.x)/(uDom.y-uDom.x), (w.z-uDom.z)/(uDom.w-uDom.z));
        vec4 v = textureLod(uVein, uv, 1.0);
        float b = 0.1 + 0.9*pow(aRnd.x, 2.2);
        b *= 0.22 + 2.7*v.r + 0.9*v.b;
        float tw = 0.72 + 0.28*sin(uTime*(0.8 + aRnd.z*2.2) + aRnd.z*40.0);
        vec4 mv = viewMatrix*w;
        float fog = smoothstep(160.0, 50.0, -mv.z) * (0.35 + 0.65*smoothstep(-1.0, 10.0, w.y));
        vB = clamp(b, 0.0, 1.8) * tw * fog;
        float dp = length(w.xyz - uPortal);
        vRed = uGlow * exp(-dp*dp/10.0);
        float size = (0.55 + 1.9*aRnd.y*aRnd.y + v.r*1.1) * uPx;
        gl_PointSize = clamp(size*30.0 / -mv.z, 0.8, 4.5*uPx);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uRed; varying float vB; varying float vRed;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        vec3 col = mix(vec3(1.0, 0.98, 0.94), uRed*1.8 + vec3(0.25,0.0,0.0), clamp(vRed, 0.0, 1.0)) * vB;
        gl_FragColor = vec4(col*a, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pg, pointsMat);
  points.frustumCulled = false;
  scene.add(points);

  // ---------- stars + drifting dust ----------
  const NS = mobile ? 1800 : 3200;
  const sp = new Float32Array(NS * 3), sr = new Float32Array(NS * 3);
  for (let i = 0; i < NS; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2;
    const y = Math.abs(u) * 0.95 + 0.02; const rr = Math.sqrt(1 - y * y);
    const R = 420;
    sp[i * 3] = Math.cos(th) * rr * R; sp[i * 3 + 1] = y * R - 30; sp[i * 3 + 2] = Math.sin(th) * rr * R;
    sr[i * 3] = rnd(); sr[i * 3 + 1] = rnd(); sr[i * 3 + 2] = rnd();
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sg.setAttribute('aRnd', new THREE.BufferAttribute(sr, 3));
  const starMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPx; attribute vec3 aRnd; varying float vB; varying vec3 vTint;
      void main(){
        vec4 mv = modelViewMatrix*vec4(position,1.0);
        float big = pow(aRnd.x, 9.0);
        vB = (0.25 + 0.75*aRnd.y) * (0.65 + 0.35*sin(uTime*(0.6+aRnd.z*3.0) + aRnd.y*50.0));
        vTint = mix(vec3(1.0,0.95,0.88), vec3(0.85,0.9,1.0), aRnd.z);
        gl_PointSize = (1.0 + big*3.2 + aRnd.y*0.8) * uPx;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vB; varying vec3 vTint;
      void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vTint*vB*a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(sg, starMat);
  stars.frustumCulled = false;
  scene.add(stars);

  const ND = mobile ? 220 : 420;
  const dp = new Float32Array(ND * 3), dr = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) {
    dp[i * 3] = (rnd() - 0.5) * 60; dp[i * 3 + 1] = summitY - 8 + rnd() * 30; dp[i * 3 + 2] = -10 + rnd() * 48;
    dr[i * 3] = rnd(); dr[i * 3 + 1] = rnd(); dr[i * 3 + 2] = rnd();
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  dg.setAttribute('aRnd', new THREE.BufferAttribute(dr, 3));
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPx; attribute vec3 aRnd; varying float vB;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.07 + aRnd.x*30.0)*1.5;
        p.y += sin(uTime*0.05 + aRnd.y*20.0)*1.2 + uTime*0.03*(aRnd.z-0.5);
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        vB = 0.18 + 0.4*aRnd.y;
        gl_PointSize = clamp((1.0 + aRnd.z*1.6)*uPx*22.0/-mv.z, 0.6, 3.0*uPx);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `varying float vB; void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor=vec4(vec3(vB)*smoothstep(0.5,0.0,d),1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  // ---------- the portal ----------
  const PW = 6.2, PH = 9.8;
  const portal = new THREE.Group();
  portal.position.set(portalBase.x, summitY - 1.6 + PH / 2, portalBase.z);
  portal.rotation.y = -0.34;
  const portalU = { uHalf: { value: new THREE.Vector2(PW / 2, PH / 2) }, uI: { value: 0 }, uTime: shared.uTime, uRed: shared.uRed, uHaze: { value: 1 } };
  const portalMat = new THREE.ShaderMaterial({
    uniforms: portalU,
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec2 uHalf; uniform float uI; uniform float uTime; uniform vec3 uRed; uniform float uHaze;
      varying vec2 vP;
      float sdBox(vec2 p, vec2 b){ vec2 d = abs(p)-b; return length(max(d,0.0)) + min(max(d.x,d.y),0.0); }
      void main(){
        float sd = sdBox(vP, uHalf);
        float d = abs(sd);
        float px = max(fwidth(sd), 1e-4);
        float core = smoothstep(px*1.4, px*0.2, d);
        float g1 = exp(-d*5.5);
        float g2 = exp(-d*1.1);
        float inside = step(sd, 0.0);
        float hy = (vP.y + uHalf.y) / (2.0*uHalf.y);
        float haze = inside * (0.035 + 0.16*pow(1.0-hy, 2.2)) * uHaze;
        float flick = 0.95 + 0.05*sin(uTime*11.0)*sin(uTime*6.3);
        vec3 col = uRed*(g1*0.75 + g2*0.12 + haze) + (uRed*3.2 + vec3(0.55,0.12,0.1))*core;
        gl_FragColor = vec4(col * uI * flick, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const portalMesh = new THREE.Mesh(new THREE.PlaneGeometry(PW + 12, PH + 12), portalMat);
  portal.add(portalMesh);
  scene.add(portal);

  // ---------- camera track ----------
  const Y = summitY;
  const track = makeTrack([
    { p: 0.0, pos: [0, Y - 4.4, 30.5], look: [0, Y + 2.1, 0] },
    { p: 0.134, pos: [-1.7, Y - 3.2, 27.5], look: [0, Y + 2.5, 0] },
    { p: 0.24, pos: [-1.0, Y - 0.2, 14], look: [0, Y + 3.6, 0] },
    { p: 0.33, pos: [-0.3, Y + 2.2, 5.2], look: [0.2, Y + 3.4, -6] },
    { p: 0.40, pos: [0.1, Y + 2.8, 1.6], look: [0.2, Y + 3.2, -10] },
  ]);
  const introPos = new THREE.Vector3(0, Y + 16, 84), introLook = new THREE.Vector3(0, Y + 8, 0);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  let fovBase = 40, dScale = 1;

  function applyAspect(aspect) {
    camera.aspect = aspect;
    fovBase = aspect < 0.8 ? 56 : aspect < 1.2 ? 48 : 40;
    dScale = aspect < 0.8 ? 1.05 : 1;
    camera.fov = fovBase;
    camera.updateProjectionMatrix();
  }

  let flickT = -1;
  return {
    name: 'mountain', scene, camera, applyAspect, summitY,
    setPx(v) { shared.uPx.value = v; },
    ignite() { flickT = 0; },
    update(dt, t, p, introK) {
      shared.uTime.value = t;
      track.at(p, vPos, vLook);
      if (dScale !== 1) vPos.sub(vLook).multiplyScalar(dScale).add(vLook);
      const k = ease.inOutSine(clamp(introK));
      vPos.lerpVectors(introPos, vPos, k);
      vLook.lerpVectors(introLook, vLook, k);
      // idle drift
      vPos.x += Math.sin(t * 0.13) * 0.25 + pointer.x * 0.7 * k; vPos.y += Math.sin(t * 0.17) * 0.12 - pointer.y * 0.35 * k;
      camera.position.copy(vPos);
      camera.lookAt(vLook);
      stars.rotation.y = t * 0.004;
      // portal ignition flicker, then a slow breath
      let I = 0;
      if (flickT >= 0) {
        flickT += dt;
        const f = flickT;
        if (f < 1.3) {
          const seq = [0, 0.9, 0.1, 0.0, 1.0, 0.25, 1.0, 0.6, 1.0];
          I = seq[Math.min(seq.length - 1, Math.floor((f / 1.3) * seq.length))];
        } else I = 1;
      }
      I *= 0.92 + 0.08 * Math.sin(t * 0.9);
      portalU.uI.value = I;
      shared.uGlow.value = I;
      // the portal empties its haze as the camera nears it
      portalU.uHaze.value = 1 - smooth(0.2, 0.36, p) * 0.6;
    },
  };
}
