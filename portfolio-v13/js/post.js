import * as THREE from 'three';

// Every set renders linear HDR into its own target. The composite mixes two sets through a
// jaali: a lattice of eight point stars that opens from the bottom up while you go down,
// with a hot orange rim on every star. Then bloom, tone mapping, grain and vignette.

const VERT = 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const HASH = 'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}';

const COMPOSITE = /* glsl */`
precision highp float;
uniform sampler2D tA, tB; uniform float uMix, uCell; uniform vec2 uRes; varying vec2 vUv;
${HASH}
float sdBox(vec2 p, float r){ vec2 d = abs(p) - vec2(r); return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdStar(vec2 p, float r){ vec2 q = vec2(p.x - p.y, p.x + p.y) * 0.70710678; return min(sdBox(p, r), sdBox(q, r)); }
void main(){
  vec3 a = texture2D(tA, vUv).rgb;
  if (uMix <= 0.0005) { gl_FragColor = vec4(a, 1.0); return; }
  vec3 b = texture2D(tB, vUv).rgb;
  vec2 px = gl_FragCoord.xy;
  vec2 cell = floor(px / uCell);
  vec2 lp = (px - (cell + 0.5) * uCell) / uCell;
  float n = hash12(cell + 3.7);
  float cy = clamp((cell.y + 0.5) * uCell / uRes.y, 0.0, 1.0);
  float thr = clamp(uMix * 2.1 - cy * 0.8 - n * 0.3, 0.0, 1.0);
  float r = thr * 0.54;
  float d = sdStar(lp, r);
  float aa = 1.5 / uCell;
  float m = thr >= 0.999 ? 1.0 : smoothstep(aa, -aa, d);
  float rim = smoothstep(0.03, 0.0, abs(d)) * step(0.002, thr) * (1.0 - smoothstep(0.7, 1.0, thr));
  vec3 col = mix(a, b, m) + vec3(1.0, 0.012, 0.004) * rim * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

const BRIGHT = /* glsl */`
precision highp float;
uniform sampler2D tIn; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
vec3 pick(vec2 o){ vec3 c = texture2D(tIn, vUv + o * uTexel).rgb; float l = max(c.r, max(c.g, c.b)); return c * smoothstep(uThr, uThr + 0.6, l); }
void main(){ vec3 c = pick(vec2(-1.0,-1.0)) + pick(vec2(1.0,-1.0)) + pick(vec2(-1.0,1.0)) + pick(vec2(1.0,1.0)); gl_FragColor = vec4(c * 0.25, 1.0); }`;

const BLUR = /* glsl */`
precision highp float;
uniform sampler2D tIn; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tIn, vUv).rgb * 0.2270270270;
  c += texture2D(tIn, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tIn, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tIn, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(tIn, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}`;

const FINAL = /* glsl */`
precision highp float;
uniform sampler2D tC, tB1, tB2; uniform vec2 uRes; uniform float uTime, uBloom, uExposure, uGrain, uVig, uCA, uFade;
varying vec2 vUv;
${HASH}
vec3 neutral(vec3 color){
  const float sc = 0.76; const float des = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= off;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < sc) return color;
  const float d = 1.0 - sc;
  float np = 1.0 - d * d / (peak + d - sc);
  color *= np / peak;
  float g = 1.0 - 1.0 / (des * (peak - np) + 1.0);
  return mix(color, vec3(np), g);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 d = vUv - 0.5;
  float asp = uRes.x / uRes.y;
  float r2 = dot(d * vec2(asp, 1.0), d * vec2(asp, 1.0));
  vec2 off = d * uCA * (0.3 + r2 * 1.6);
  vec3 col = vec3(texture2D(tC, vUv - off).r, texture2D(tC, vUv).g, texture2D(tC, vUv + off).b);
  col += (texture2D(tB1, vUv).rgb * 0.55 + texture2D(tB2, vUv).rgb * 0.75) * uBloom;
  col = neutral(max(col * uExposure, 0.0));
  col = toSRGB(clamp(col, 0.0, 1.0));
  float vig = smoothstep(1.25, 0.25, length(d * vec2(1.0, 0.9)) * 1.4);
  col *= mix(1.0, vig, uVig);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += (hash12(gl_FragCoord.xy + fract(uTime * 7.13) * 1000.0) - 0.5) * uGrain * (0.35 + 0.65 * sqrt(lum));
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

export function createPost(renderer, { mobile }) {
  const HF = THREE.HalfFloatType;
  const mk = (samples = 0, depth = false) => new THREE.WebGLRenderTarget(4, 4, { type: HF, samples, depthBuffer: depth, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const rtA = mk(mobile ? 0 : 4, true), rtB = mk(0, true), rtC = mk();
  const q1 = mk(), q2 = mk(), e1 = mk(), e2 = mk();
  const bloomOn = !mobile;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const quad = new THREE.Mesh(geo);
  quad.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const sm = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });

  const comp = sm(COMPOSITE, { tA: { value: rtA.texture }, tB: { value: rtB.texture }, uMix: { value: 0 }, uCell: { value: 80 }, uRes: { value: new THREE.Vector2(1, 1) } });
  const bright = sm(BRIGHT, { tIn: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 1.15 } });
  const blur = sm(BLUR, { tIn: { value: null }, uDir: { value: new THREE.Vector2() } });
  const uniforms = {
    tC: { value: rtC.texture }, tB1: { value: q1.texture }, tB2: { value: e1.texture }, uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 }, uBloom: { value: bloomOn ? 0.75 : 0 }, uExposure: { value: 1 }, uGrain: { value: 0.055 }, uVig: { value: 0.6 }, uCA: { value: 0.0018 }, uFade: { value: 0 },
  };
  const fin = sm(FINAL, uniforms);

  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(scene, cam); };
  let W = 4, H = 4;

  return {
    uniforms,
    resize(w, h, dpr) {
      W = Math.round(w * dpr); H = Math.round(h * dpr);
      rtA.setSize(W, H); rtB.setSize(W, H); rtC.setSize(W, H);
      q1.setSize(W >> 2, H >> 2); q2.setSize(W >> 2, H >> 2);
      e1.setSize(W >> 3, H >> 3); e2.setSize(W >> 3, H >> 3);
      comp.uniforms.uRes.value.set(W, H);
      comp.uniforms.uCell.value = Math.round(Math.max(64, Math.min(150, Math.min(w, h) * 0.15)) * dpr);
      uniforms.uRes.value.set(W, H);
    },
    render(A, B, mix) {
      renderer.setRenderTarget(rtA); renderer.clear();
      renderer.render(A.scene, A.camera);
      if (B && mix > 0.0005) { renderer.setRenderTarget(rtB); renderer.clear(); renderer.render(B.scene, B.camera); }
      comp.uniforms.uMix.value = B ? mix : 0;
      pass(comp, rtC);
      if (bloomOn) {
        bright.uniforms.tIn.value = rtC.texture; bright.uniforms.uTexel.value.set(1 / W, 1 / H);
        pass(bright, q1);
        blur.uniforms.tIn.value = q1.texture; blur.uniforms.uDir.value.set(4 / W, 0); pass(blur, q2);
        blur.uniforms.tIn.value = q2.texture; blur.uniforms.uDir.value.set(0, 4 / H); pass(blur, q1);
        blur.uniforms.tIn.value = q1.texture; blur.uniforms.uDir.value.set(8 / W, 0); pass(blur, e2);
        blur.uniforms.tIn.value = e2.texture; blur.uniforms.uDir.value.set(0, 8 / H); pass(blur, e1);
      }
      pass(fin, null);
    },
  };
}
