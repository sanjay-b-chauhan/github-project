import * as THREE from 'three';
import { HASH } from '../glsl.js';
import { makeTrack, pointer } from '../track.js';

// THE OBJECT: a warm dark studio with one thing in it, the sunburst. It is drawn first as a vector,
// then stands up as chrome and turns as you scroll. The mark itself is the companion (drawn on top);
// this set gives it a floor, a pool of light and a contact shadow. q: 0 beat one, 1 beat two, 1.7 gone.
export function createObject(renderer, { mobile }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0605);
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 200);
  const U = { uTime: { value: 0 }, uShadow: { value: 1 }, uLight: { value: 0 }, uRot: { value: 0 } };

  // back wall: a soft vertical falloff, warm at the floor line
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `uniform float uLight; varying vec2 vUv; ${HASH}
      void main(){ vec2 d = (vUv - vec2(0.5, 0.36)) * vec2(1.6, 1.0);
        float pool = exp(-dot(d,d)*14.0);
        vec3 c = vec3(0.012, 0.007, 0.006) + vec3(0.13, 0.03, 0.014) * pool * uLight;
        c += (hash12(gl_FragCoord.xy) - 0.5) * 0.004;
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  wall.position.set(0, 8, -14); scene.add(wall);

  // floor: a spotlight pool and the mark's shadow
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform float uLight; uniform float uShadow; uniform float uRot; varying vec3 vW;
      void main(){
        vec2 p = vW.xz;
        float pool = exp(-dot(p*vec2(0.22,0.34), p*vec2(0.22,0.34))*1.2);
        vec3 c = vec3(0.014, 0.008, 0.007) + vec3(0.24, 0.07, 0.035) * pool * uLight;
        // contact shadow: an ellipse that narrows as the mark turns edge-on
        float w = mix(2.5, 0.7, abs(sin(uRot)));
        vec2 q = p / vec2(w, 0.62);
        float sh = exp(-dot(q,q)*2.2) * 0.85 * uShadow;
        c *= 1.0 - sh;
        c += vec3(0.9, 0.2, 0.06) * exp(-dot(q,q)*9.0) * 0.08 * uLight * uShadow; // red bounce from the chrome
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  // dust in the light
  const N = mobile ? 140 : 260;
  const pp = new Float32Array(N * 3), pr = new Float32Array(N);
  for (let i = 0; i < N; i++) { pp.set([(Math.random() - 0.5) * 12, Math.random() * 7, (Math.random() - 0.5) * 6], i * 3); pr[i] = Math.random(); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); dg.setAttribute('aR', new THREE.BufferAttribute(pr, 1));
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `uniform float uTime; attribute float aR; varying float vA;
      void main(){ vec3 p = position; p.y = mod(p.y + uTime*(0.05 + aR*0.08), 7.0); p.x += sin(uTime*0.2 + aR*20.0)*0.3;
        vec4 mv = modelViewMatrix*vec4(p,1.0); vA = (0.2 + 0.8*aR) * exp(-length(p.xz)*0.25);
        gl_PointSize = clamp(18.0 / -mv.z, 0.6, 3.0); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `uniform float uLight; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(1.0,0.7,0.5)*vA*uLight*0.35*smoothstep(0.5,0.0,d), 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.frustumCulled = false; scene.add(dust);

  const track = makeTrack([
    { p: 0, pos: [0, 1.9, 10.5], look: [0, 1.45, 0] },
    { p: 1, pos: [0.4, 1.6, 9.2], look: [0, 1.45, 0] },
    { p: 1.7, pos: [0, 3.4, 7.4], look: [0, 3.2, 0] },
  ]);
  const vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  const st = { q: 0, intro: 0 };
  let portrait = false;
  return {
    name: 'object', scene, camera, exposure: 0.92,
    setIntro(v) { st.intro = v; },
    // the mark stands in the light: big for beat one, turning as you scroll, then it lifts and leaves
    anchor(o) {
      const q = st.q, lift = Math.max(0, q - 1.05) / 0.65;
      o.pos.set(portrait ? 0 : 0, 1.45 + lift * 3.2, 0);
      o.size = (portrait ? 3.3 : 4.6) * (1 - Math.min(0.55, lift * 0.55));
      o.k = 1; o.spin = 0;
      o.rot = q * 0.85 * (1 - Math.min(1, lift)) + lift * 3.1; // yaw driven by scroll, Oryzo style
      o.tilt = 0.08 - q * 0.05;
      o.ndc = null;
    },
    applyAspect(a) { camera.aspect = a; portrait = a < 0.8; camera.fov = portrait ? 48 : a < 1.2 ? 40 : 32; camera.updateProjectionMatrix(); },
    update(dt, t, q) {
      st.q = q;
      U.uTime.value = t;
      U.uLight.value = Math.min(1, st.intro);
      U.uRot.value = q * 0.85;
      U.uShadow.value = Math.max(0, 1 - Math.max(0, q - 1.05) * 2.2) * Math.min(1, st.intro);
      track.at(q, vPos, vLook);
      vPos.x += pointer.x * 0.35; vPos.y += -pointer.y * 0.18;
      camera.position.copy(vPos); camera.lookAt(vLook);
    },
  };
}
