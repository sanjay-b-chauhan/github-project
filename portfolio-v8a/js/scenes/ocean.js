import * as THREE from 'three';
import { HASH } from '../glsl.js';
import { sunburstMask } from '../textures.js';
import { makeTrack, pointer } from '../track.js';
import { clamp, smooth } from '../util.js';

// SET 4: a night sea. The sunburst mark rises on the horizon as a red sun and
// lays a path of red light across the water.
const SUN_DIST = 2400;

export async function createOcean(renderer, { mobile }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.5, 9000);
  const uTime = { value: 0 };
  const uSunDir = { value: new THREE.Vector3(0, 0.02, -1).normalize() };
  const uSunUp = { value: 0 };
  const uCam = { value: new THREE.Vector3() };
  const SKY = /* glsl */ `
    uniform vec3 uSunDir; uniform float uSunUp;
    vec3 skyCol(vec3 dir){
      float e = dir.y;
      vec3 top = vec3(0.004, 0.0045, 0.006);
      vec3 mid = vec3(0.028, 0.026, 0.027);
      vec3 hor = vec3(0.13, 0.11, 0.105);
      vec3 c = mix(hor, mid, smoothstep(0.0, 0.07, e));
      c = mix(c, top, smoothstep(0.07, 0.42, e));
      c = mix(c, hor*0.55, smoothstep(0.0, -0.08, e));
      // warm red glow around the sun, stronger along the horizon
      vec2 dh = normalize(dir.xz); vec2 sh = normalize(uSunDir.xz);
      float az = acos(clamp(dot(dh, sh), -1.0, 1.0));
      float el = e - uSunDir.y;
      float glow = exp(-az*az/0.018 - el*el/0.004) * 0.34 + exp(-az*az/0.12 - el*el/0.012) * 0.07 + exp(-az*az/0.9 - abs(e)*16.0)*0.022;
      c += vec3(1.0, 0.035, 0.02) * glow * uSunUp;
      return c;
    }`;

  // sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 48, 24), new THREE.ShaderMaterial({
    uniforms: { uSunDir, uSunUp, uTime },
    vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir; uniform float uTime;
      ${HASH}
      ${SKY}
      void main(){
        vec3 d = normalize(vDir);
        vec3 c = skyCol(d);
        // sparse stars high up
        vec2 sp = vec2(atan(d.z, d.x)*140.0, d.y*150.0);
        vec2 cell = floor(sp);
        float h = hash12(cell);
        vec2 ctr = vec2(hash12(cell + 3.7), hash12(cell + 9.1));
        float dd = length(fract(sp) - ctr);
        float st = step(0.93, h) * smoothstep(0.045, 0.0, dd) * smoothstep(0.06, 0.4, d.y);
        c += vec3(st) * (0.5 + 0.4*sin(uTime*1.3 + h*60.0)) * 0.8;
        gl_FragColor = vec4(c, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false,
  }));
  sky.frustumCulled = false;
  sky.renderOrder = -2;
  scene.add(sky);

  // the sun: sunburst mark, HDR red, clipped at the waterline
  const mask = await sunburstMask();
  const sunH = 290, sunW = sunH * mask.aspect;
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(sunW, sunH), new THREE.ShaderMaterial({
    uniforms: { uMask: { value: mask.tex }, uTime },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vY; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vY = w.y; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMask; uniform float uTime; varying vec2 vUv; varying float vY;
      void main(){
        if (vY < 0.0) discard;
        float a = texture2D(uMask, vUv).a;
        float heat = 0.92 + 0.08*sin(uTime*1.7 + vUv.x*6.0);
        vec3 col = vec3(1.0, 0.004, 0.004) * 1.32 * heat;
        gl_FragColor = vec4(col*a, a);
      }`,
    transparent: true, depthWrite: false,
  }));
  sun.renderOrder = 1;
  scene.add(sun);
  // soft halo behind the mark
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(sunW * 3.2, sunH * 3.2), new THREE.ShaderMaterial({
    uniforms: { uSunUp },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vY; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vY = w.y; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `
      uniform float uSunUp; varying vec2 vUv; varying float vY;
      void main(){ if (vY < 0.0) discard; vec2 d = (vUv - vec2(0.5, 0.42))*vec2(1.0, 1.35); float r = length(d);
        float g = exp(-r*r*60.0)*0.55 + exp(-r*12.0)*0.16; gl_FragColor = vec4(vec3(1.0,0.03,0.02)*g*uSunUp, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.renderOrder = 0;
  scene.add(halo);

  // water
  const waterU = { uTime, uSunDir, uSunUp, uCam };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000, 1, 1), new THREE.ShaderMaterial({
    uniforms: waterU,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uCam;
      varying vec3 vW;
      ${HASH}
      ${SKY}
      vec2 waveGrad(vec2 p, float t, float fade){
        vec2 g = vec2(0.0);
        // long swell to short chop
        vec2 D[6]; D[0]=normalize(vec2(0.2,1.0)); D[1]=normalize(vec2(-0.6,1.0)); D[2]=normalize(vec2(0.9,0.7)); D[3]=normalize(vec2(-1.0,0.25)); D[4]=normalize(vec2(0.35,-1.0)); D[5]=normalize(vec2(-0.3,-0.8));
        float F[6]; F[0]=0.16; F[1]=0.23; F[2]=0.41; F[3]=0.67; F[4]=1.13; F[5]=1.9;
        float A[6]; A[0]=0.42; A[1]=0.3; A[2]=0.17; A[3]=0.1; A[4]=0.055; A[5]=0.03;
        for (int i = 0; i < 6; i++){
          float w = F[i];
          float ph = dot(D[i], p)*w + t*sqrt(9.8*w)*0.55 + float(i)*1.7;
          float k = (i > 3) ? fade : 1.0;
          g += D[i]*w*A[i]*cos(ph)*k;
        }
        return g;
      }
      void main(){
        vec3 V = normalize(vW - uCam);
        float dist = length(vW.xz - uCam.xz);
        float fade = 1.0 - smoothstep(60.0, 420.0, dist);
        vec2 g = waveGrad(vW.xz, uTime, fade);
        float strength = mix(0.25, 1.0, fade);
        vec3 N = normalize(vec3(-g.x*strength, 1.0, -g.y*strength));
        vec3 R = reflect(V, N);
        R.y = abs(R.y);
        float fres = 0.02 + 0.98*pow(1.0 - max(dot(-V, N), 0.0), 5.0);
        vec3 deep = vec3(0.004, 0.005, 0.007);
        vec3 col = deep + skyCol(R)*fres*1.15;
        // glitter from the sun
        vec3 H = normalize(uSunDir - V);
        float s = max(dot(N, H), 0.0);
        float spark = pow(s, 1400.0)*9.0 + pow(s, 160.0)*0.55;
        col += vec3(1.0, 0.03, 0.02) * spark * uSunUp;
        // faint silver sheen near the horizon
        col += vec3(0.05) * pow(1.0 - max(dot(-V, N), 0.0), 6.0) * 0.5;
        float haze = smoothstep(500.0, 5200.0, dist);
        col = mix(col, skyCol(vec3(V.x, 0.0, V.z)), haze);
        gl_FragColor = vec4(col, 1.0);
      }`,
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.z = -4000;
  scene.add(water);

  // camera
  const track = makeTrack([
    { p: 0.83, pos: [0, 6.5, 14], look: [0, 180, -400] },
    { p: 0.92, pos: [0, 4.6, 6], look: [0, 90, -900] },
    { p: 1.0, pos: [0, 3.4, 0], look: [0, 3.4 + Math.tan(THREE.MathUtils.degToRad(4.2)) * 1000, -1000] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  function applyAspect(aspect) {
    camera.aspect = aspect;
    camera.fov = aspect < 0.8 ? 58 : aspect < 1.2 ? 48 : 40;
    camera.updateProjectionMatrix();
  }

  return {
    name: 'ocean', scene, camera, applyAspect,
    update(dt, t, p) {
      uTime.value = t;
      track.at(p, vPos, vLook);
      vPos.y += Math.sin(t * 0.5) * 0.06 - pointer.y * 0.15;
      vPos.x += pointer.x * 0.5;
      camera.position.copy(vPos);
      camera.lookAt(vLook);
      uCam.value.copy(vPos);
      // rise: sun climbs from below the waterline to sit on it
      const k = smooth(0.87, 1.0, p);
      const rise = 1 - Math.pow(1 - k, 3);
      const cy = -sunH * 0.55 + rise * (sunH * 0.55 + sunH / 2 - 12);
      sun.position.set(0, cy, -SUN_DIST);
      halo.position.set(0, cy - sunH * 0.08, -SUN_DIST - 10);
      sun.lookAt(camera.position.x, sun.position.y, camera.position.z);
      halo.lookAt(camera.position.x, halo.position.y, camera.position.z);
      uSunUp.value = 0.25 + 0.75 * rise;
      uSunDir.value.set(0, Math.max(0.004, (cy - sunH * 0.18) / SUN_DIST), -1).normalize();
    },
  };
}
