import * as THREE from 'three';

// Chapter 0: the loader sky. Brand red fbm nebula with the curved rim of a dark planet
// (after v8C). Rendered straight to the screen by the shared renderer, no post pass.
const VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const FS = /* glsl */ `
uniform vec2 uRes, uBuf; uniform float uTime, uFade, uWake;
varying vec2 vUv;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1., 0.)), u.x), mix(hash12(i + vec2(0., 1.)), hash12(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = m * p; a *= .5; } return v; }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float asp = uRes.x / uRes.y;
  vec2 p = (px - .5 * uRes) / uRes.y; p.y = -p.y;
  float t = uTime * .035;
  vec2 w = vec2(fbm(p * 1.6 + vec2(0., t)), fbm(p * 1.6 + vec2(5.2, 1.3) - vec2(t, 0.)));
  float n = fbm(p * 1.35 + (w - .5) * 1.8 + vec2(t * .6, -t * .2));
  float n2 = fbm(p * 3.1 - w * 1.3 + vec2(-t, t * .5) + 3.1);
  vec3 col = vec3(.03, .018, .018);
  col = mix(col, vec3(.2, .014, .01), smoothstep(.2, .55, n));
  col = mix(col, vec3(.6, .025, .014), smoothstep(.42, .72, n));
  col = mix(col, vec3(1., .03, .015), smoothstep(.58, .86, n) * .85);
  col += vec3(1., .34, .22) * pow(smoothstep(.55, .95, n * .7 + n2 * .35), 2.) * .3;
  col *= .5 + .5 * smoothstep(.22, .62, n2);
  vec2 sp = floor(px / 2.);
  float sh = hash12(sp);
  float star = step(.9972, sh) * (.35 + .65 * hash12(sp + 3.7)) * (.65 + .35 * sin(uTime * 2.3 + sh * 90.));
  col += vec3(1., .95, .88) * star * (1. - smoothstep(.3, .62, n));
  // the planet: a dark body on the right with a hot cream rim, lit from the upper left
  vec2 pc = asp > 1. ? vec2(.56, -.04) : vec2(.5, .16);
  float Rp = asp > 1. ? .8 : .56;
  vec2 pv = p - pc; float pl = length(pv);
  float pd = pl - Rp;
  vec2 nrm = pv / max(pl, 1e-4);
  float lit = smoothstep(-.35, .95, dot(nrm, normalize(vec2(-1., .55))));
  float inside = 1. - smoothstep(-.0015, .0015, pd);
  float n3 = fbm(pv * 2.4 + vec2(t * .4, 0.) + 7.);
  vec3 body = mix(vec3(.018, .008, .008), vec3(.11, .012, .01), n3);
  body += vec3(.6, .045, .025) * smoothstep(-.2, 0., pd) * lit * .5;
  col = mix(col, body, inside);
  float rim = exp(-abs(pd) * 420.) * lit;
  float atm = exp(-max(pd, 0.) * 15.) * lit * (1. - inside);
  col += vec3(1., .95, .85) * rim * (1.2 + uWake * 1.5) + vec3(1., .1, .05) * atm * (.42 + uWake * .5);
  float n4 = fbm(p * 1.1 + vec2(-t * .8, t * .3) + 11.);
  float haze = smoothstep(.42, .9, n4) * smoothstep(.45, -.55, p.y);
  col = mix(col, vec3(.8, .035, .02), haze * .5);
  float veil = smoothstep(.46, .86, n4 * .6 + n * .5) * inside;
  col = mix(col, vec3(.62, .03, .018), veil * .55);
  col *= 1. - smoothstep(.55, 1.3, length(p * vec2(.78, 1.))) * .5;
  // a darker well behind the numerals keeps them readable
  col *= 1. - .32 * exp(-dot(p * vec2(.55, 1.1), p * vec2(.55, 1.1)) * 3.2);
  float g = hash12(gl_FragCoord.xy + fract(uTime * 7.31) * 431.) - .5;
  col += g * .05;
  gl_FragColor = vec4(max(col, 0.) * uFade, 1.);
}`;

export function createIntro(renderer) {
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uBuf: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 }, uFade: { value: 0 }, uWake: { value: 0 },
  };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false }));
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const buf = new THREE.Vector2();
  return {
    U,
    resize(w, h) { renderer.getDrawingBufferSize(buf); U.uRes.value.set(w, h); U.uBuf.value.copy(buf); },
    render(t) {
      U.uTime.value = t;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, cam);
    },
    dispose() { mesh.geometry.dispose(); mesh.material.dispose(); },
  };
}
