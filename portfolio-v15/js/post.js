import * as THREE from 'three';
import { HASH, FS_VERT } from './glsl.js';

// Every set renders into an HDR target; this pass mixes two sets with a halftone
// dot dissolve (the reference's scene change), then tone maps, adds chromatic
// aberration, vignette and film grain.
const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uMix;
uniform vec2 uRes;
uniform float uTime;
uniform float uGrain;
uniform float uCA;
uniform float uVig;
uniform float uFade;
uniform float uDpr;
uniform float uExposure;
varying vec2 vUv;
${HASH}
vec3 sampleCA(sampler2D t, vec2 uv, vec2 off){
  return vec3(texture2D(t, uv - off).r, texture2D(t, uv).g, texture2D(t, uv + off).b);
}
// Khronos PBR Neutral tone mapping
vec3 neutralTone(vec3 color){
  const float startCompression = 0.76;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < startCompression) return color;
  const float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 uv = vUv;
  vec2 d = uv - 0.5;
  float asp = uRes.x / uRes.y;
  float r2 = dot(d * vec2(asp, 1.0), d * vec2(asp, 1.0));
  float energy = uMix * (1.0 - uMix) * 4.0;
  vec2 off = d * (uCA * (0.2 + r2 * 1.4) + energy * 0.012);
  vec3 col = sampleCA(tA, uv, off);
  if (uMix > 0.0005) {
    float cell = 12.0 * uDpr;
    vec2 p = gl_FragCoord.xy / cell;
    vec2 rr = vec2(1.0, 1.7320508);
    vec2 h = rr * 0.5;
    vec2 a = mod(p, rr) - h;
    vec2 b = mod(p - h, rr) - h;
    vec2 g = dot(a, a) < dot(b, b) ? a : b;
    vec2 ctr = p - g;
    float dist = length(g);
    float cy = clamp(ctr.y * cell / uRes.y, 0.0, 1.0);
    float n = hash12(floor(ctr * 2.0) + 7.0);
    float thr = uMix * 2.35 - (1.0 - cy) * 1.05 - n * 0.3;
    float R = clamp(thr, 0.0, 1.0) * 0.64;
    float m = smoothstep(R, R - 0.08, dist);
    if (uMix > 0.9995) m = 1.0;
    vec3 colB = sampleCA(tB, uv, off * 1.8);
    float ring = smoothstep(0.07, 0.0, abs(dist - R)) * step(0.02, R) * step(R, 0.6);
    col = mix(col, colB, m);
    col *= 1.0 - ring * 0.6;
  }
  col = max(col * uExposure, 0.0);
  col = neutralTone(col);
  col = toSRGB(clamp(col, 0.0, 1.0));
  float vig = smoothstep(1.3, 0.2, length(d * vec2(1.0, 0.92)) * 1.45);
  col *= mix(1.0, vig, uVig);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float gr = hash12(gl_FragCoord.xy + fract(uTime * 7.13) * 1000.0) - 0.5;
  col += gr * uGrain * (0.35 + 0.65 * sqrt(lum));
  col *= uFade;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createPost(renderer, { mobile }) {
  // MSAA only on the main target; the incoming set is hidden behind the dot mask anyway
  const rtA = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: mobile ? 0 : 2, depthBuffer: true });
  const rtB = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 0, depthBuffer: true });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const uniforms = {
    tA: { value: rtA.texture }, tB: { value: rtB.texture }, uMix: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uGrain: { value: 0.07 },
    uCA: { value: 0.0022 }, uVig: { value: 0.55 }, uFade: { value: 0 }, uDpr: { value: 1 }, uExposure: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: FS_VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    uniforms,
    resize(w, h, dpr) {
      rtA.setSize(Math.round(w * dpr), Math.round(h * dpr));
      rtB.setSize(Math.round(w * dpr), Math.round(h * dpr));
      uniforms.uRes.value.set(w * dpr, h * dpr);
      uniforms.uDpr.value = dpr;
    },
    render(a, b, mix) {
      renderer.setRenderTarget(rtA);
      renderer.render(a.scene, a.camera);
      if (b && mix > 0.0005) {
        renderer.setRenderTarget(rtB);
        renderer.render(b.scene, b.camera);
      }
      uniforms.uMix.value = b ? mix : 0;
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
    },
  };
}
