import * as THREE from 'three';
import { HASH, SNOISE3 } from '../glsl.js';
import { sunburstMask } from '../textures.js';
import { makeTrack, pointer } from '../track.js';

// HERO: the desert at first light. The sunburst climbs out of the horizon as the sun and throws
// its rays across a red sky. q: 0 before dawn, 1 the sun is up.
export async function createHero(renderer, { mobile }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.5, 6000);
  const U = { uTime: { value: 0 }, uRise: { value: 0 }, uSun: { value: new THREE.Vector3(0, 0.02, -1) } };

  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `varying vec3 vD; uniform float uRise; uniform vec3 uSun; uniform float uTime; ${HASH}
      void main(){ vec3 d = normalize(vD); float e = d.y;
        // his palette: black above, a deep red band, a hot orange horizon
        vec3 top = mix(vec3(0.004,0.003,0.004), vec3(0.02,0.006,0.006), uRise);
        vec3 mid = mix(vec3(0.08,0.008,0.004), vec3(0.42,0.03,0.01), uRise);
        vec3 hor = mix(vec3(0.5,0.06,0.02), vec3(1.9,0.42,0.08), uRise);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.14, e)); c = mix(c, top, smoothstep(0.1, 0.42, e));
        // god rays: the sunburst's own rays thrown across the sky
        vec2 sd = vec2(atan(d.x - uSun.x, 1.0), e - uSun.y);
        float ang = atan(sd.y, sd.x); float r = length(sd);
        float rays = pow(0.5 + 0.5*cos(ang*9.0 + sin(uTime*0.1)*0.3), 6.0) * step(0.0, sd.y);
        c += vec3(1.0,0.32,0.08) * rays * exp(-r*2.4) * 0.3 * uRise;
        c += vec3(1.0,0.3,0.06) * exp(-r*r*16.0) * 1.1 * uRise;
        vec2 sp = vec2(atan(d.z, d.x)*120.0, e*120.0); float h = hash12(floor(sp));
        c += step(0.975, h) * smoothstep(0.3, 0.6, e) * smoothstep(0.3, 0.0, length(fract(sp)-0.5)) * 0.6 * (1.0 - uRise);
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false,
  }));
  sky.renderOrder = -3; sky.frustumCulled = false; scene.add(sky);

  // the sun: the sunburst mark, white hot at the core, orange at the edges
  const mask = await sunburstMask();
  const sunH = 360, sunW = sunH * mask.aspect, SUN_D = 2600;
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(sunW, sunH), new THREE.ShaderMaterial({
    uniforms: { uMask: { value: mask.tex }, ...U },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vY; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vY = w.y; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform sampler2D uMask; uniform float uTime; uniform float uRise; varying vec2 vUv; varying float vY;
      void main(){ if (vY < 0.0) discard; float a = texture2D(uMask, vUv).a;
        vec3 col = mix(vec3(2.4, 0.3, 0.05), vec3(3.4, 2.5, 1.7), smoothstep(0.35, 1.0, uRise)) * (0.94 + 0.06*sin(uTime*1.5 + vUv.x*6.0));
        gl_FragColor = vec4(col*a, a); }`,
    transparent: true, depthWrite: false,
  }));
  sun.renderOrder = -1; scene.add(sun);

  // dunes at first light: backlit crests, violet shadows
  const dunes = new THREE.Mesh(new THREE.PlaneGeometry(3200, 2600, mobile ? 220 : 380, mobile ? 180 : 300), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `${SNOISE3} varying vec3 vW; varying vec3 vN;
      float H(vec2 q){ float u = dot(q, normalize(vec2(0.9,0.42)))*0.012 + snoise(vec3(q*0.004, 2.0))*1.4;
        float s = fract(u); float prof = smoothstep(0.0, 1.0, s < 0.78 ? s/0.78 : (1.0-s)/0.22);
        float amp = 9.0 + 14.0*smoothstep(-100.0, -700.0, q.y);
        return pow(prof,1.7)*amp + snoise(vec3(q*0.01, 5.0))*3.0 - 6.0; }
      void main(){ vec4 w = modelMatrix*vec4(position,1.0); float e = 1.5;
        vN = normalize(vec3(H(w.xz - vec2(e,0.0)) - H(w.xz + vec2(e,0.0)), 2.0*e, H(w.xz - vec2(0.0,e)) - H(w.xz + vec2(0.0,e))));
        w.y += H(w.xz); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform float uRise; uniform vec3 uSun; varying vec3 vW; varying vec3 vN;
      void main(){ vec3 n = normalize(vN);
        vec3 L = normalize(vec3(uSun.x, max(uSun.y, 0.05) + 0.12, uSun.z));
        float lam = max(dot(n, L), 0.0);
        float rim = pow(1.0 - max(dot(n, vec3(0.0,1.0,0.0)), 0.0), 2.0);
        vec3 sand = vec3(0.7,0.46,0.28);
        vec3 col = sand * (vec3(1.7,0.55,0.2) * pow(lam, 1.6) * (0.12 + 0.55*uRise) + vec3(0.025,0.01,0.012));
        col += vec3(1.0,0.3,0.08) * rim * lam * 0.55 * uRise;
        float d = length(vW.xz);
        vec3 haze = mix(vec3(0.25,0.03,0.01), vec3(1.4,0.32,0.07), uRise);
        col = mix(col, haze, smoothstep(250.0, 1500.0, d));
        gl_FragColor = vec4(col, 1.0); }`,
  }));
  dunes.rotation.x = -Math.PI / 2; dunes.position.z = -1100; scene.add(dunes);

  const track = makeTrack([
    { p: 0, pos: [0, 14, 34], look: [0, 44, -900] },
    { p: 1, pos: [0, 22, 20], look: [0, 60, -900] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  return {
    name: 'hero', scene, camera, exposure: 1,
    applyAspect(a) { camera.aspect = a; camera.fov = a < 0.8 ? 60 : a < 1.2 ? 48 : 40; camera.updateProjectionMatrix(); },
    update(dt, t, q) {
      U.uTime.value = t;
      track.at(q, vPos, vLook);
      vPos.x += pointer.x * 3; vPos.y += -pointer.y * 1.5;
      camera.position.copy(vPos); camera.lookAt(vLook);
      const rise = Math.min(1, Math.max(0, q));
      U.uRise.value = rise;
      const cy = -sunH * 0.62 + rise * (sunH * 0.62 + sunH * 0.95);
      sun.position.set(0, cy + 40, -SUN_D);
      sun.lookAt(camera.position.x, sun.position.y, camera.position.z);
      U.uSun.value.set(0, (cy + 40) / SUN_D, -1).normalize();
    },
  };
}
