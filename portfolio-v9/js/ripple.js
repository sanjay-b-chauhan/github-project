import * as THREE from 'three';
import { getTex } from './tex.js';

// The ripple layer (after v8C). A project opens as a full-screen water front from the
// click point: a blurred, grainy screenshot, concentric rings, cream court lines and an
// serif title. Next ripples to the next project, close drains back to the page.
// The same water carries the dawn flood: the sun's light spreading cream over the sea.
const FSQ_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const NOISE = /* glsl */ `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1., 0.)), u.x), mix(hash12(i + vec2(0., 1.)), hash12(i + vec2(1., 1.)), u.x), u.y); }
float easeOutR(float x){ return 1. - pow(1. - x, 2.2); }
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
`;
const BLUR_FS = /* glsl */ `
uniform sampler2D tSrc; uniform vec2 uDir; uniform float uMode;
varying vec2 vUv;
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
void main(){
  if (uMode < .5){ gl_FragColor = vec4(toSRGB(texture2D(tSrc, vUv).rgb), 1.); return; }
  vec3 c = texture2D(tSrc, vUv).rgb * .2270270270;
  c += texture2D(tSrc, vUv + uDir * 1.3846153846).rgb * .3162162162;
  c += texture2D(tSrc, vUv - uDir * 1.3846153846).rgb * .3162162162;
  c += texture2D(tSrc, vUv + uDir * 3.2307692308).rgb * .0702702703;
  c += texture2D(tSrc, vUv - uDir * 3.2307692308).rgb * .0702702703;
  gl_FragColor = vec4(c, 1.);
}`;
const OV_FS = /* glsl */ `
uniform vec2 uRes, uBuf;
uniform float uTime, uNow;
uniform sampler2D uTA, uTB, uSB;
uniform float uAspA, uAspB, uDarkA, uDarkB;
uniform float uMode;
uniform vec2 uC; uniform float uT, uDur, uD;
uniform float uFadeOn, uFadeT, uFocus, uLines;
uniform vec4 uDrops[6]; uniform vec2 uDropP[6];
uniform vec4 uSeg[14];
uniform float uAmpPx, uLam, uDecL;
varying vec2 vUv;
${NOISE}
vec2 cover(vec2 px, float asp){
  vec2 uv = px / uRes;
  float sa = uRes.x / uRes.y;
  if (sa > asp) uv.y = (uv.y - .5) * (asp / sa) + .5; else uv.x = (uv.x - .5) * (sa / asp) + .5;
  uv = (uv - .5) * .93 + .5;
  return vec2(uv.x, 1. - uv.y);
}
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0., 1.); return length(pa - ba * h); }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float pxs = uRes.x / uBuf.x;
  vec2 disp = vec2(0.); float sl = 0.;
  vec2 Ld = normalize(vec2(-.6, -.8));
  for (int j = 0; j < 6; j++){
    vec4 dr = uDrops[j]; vec2 dp = uDropP[j];
    float age = uNow - dr.z;
    if (dr.w <= 0. || age <= 0. || age > 4.6) continue;
    float k = dp.y;
    float dur = mix(.8, 1.25, k);
    float R = dp.x * 1.1 * easeOutR(clamp(age / dur, 0., 1.));
    vec2 dv = px - dr.xy; float d = length(dv);
    float b = R - d;
    if (b <= 0.) continue;
    vec2 dir = dv / max(d, 1.);
    float lam = uLam * mix(.42, 1., k);
    float L = uDecL * mix(.3, 1., k);
    float env = exp(-b / L) * smoothstep(0., lam * .3, b) * dr.w * exp(-age * 1.15) * (1. - smoothstep(2.4, 4.4, age));
    float ph = b * 6.2831853 / lam;
    disp += dir * sin(ph) * env;
    sl += cos(ph) * env * dot(dir, Ld);
  }
  vec2 idle = vec2(vnoise(px * .0021 + vec2(uTime * .05, 0.)), vnoise(px * .0021 + vec2(5.3, 2.1) - vec2(0., uTime * .045))) - .5;
  vec2 off = disp * uAmpPx + idle * 12.;
  vec2 q = px - off;
  vec2 ca = disp * uAmpPx * .1;
  vec3 cB = vec3(texture2D(uTB, cover(q + ca, uAspB)).r, texture2D(uTB, cover(q, uAspB)).g, texture2D(uTB, cover(q - ca, uAspB)).b);
  if (uFocus > .002) cB = mix(cB, toSRGB(texture2D(uSB, cover(q, uAspB)).rgb), uFocus);
  cB *= uDarkB;
  vec3 cA = vec3(0.);
  if (uMode > .5) cA = vec3(texture2D(uTA, cover(q + ca, uAspA)).r, texture2D(uTA, cover(q, uAspA)).g, texture2D(uTA, cover(q - ca, uAspA)).b) * uDarkA;
  float x = clamp(uT / uDur, 0., 1.);
  float R = uD * 1.1 * easeOutR(x);
  vec2 cv = px - uC; float cd = length(cv);
  vec2 dn = cv / max(cd, 1.);
  float wob = ((vnoise(dn * 1.7 + vec2(17.3, uT * 1.3)) - .5) * 30. + (vnoise(dn * 4.6 + vec2(3.1, 9. + uT * 2.)) - .5) * 8.) * (1. - x);
  float e = mix(8., 22., 1. - x);
  float dm = cd + wob;
  float m = 1. - smoothstep(R - e, R + e, dm);
  if (uT <= 0.) m = 0.;
  float crest = exp(-abs(dm - R) / 6.) * (1. - x * .85);
  if (uT <= 0.) crest = 0.;
  if (uFadeOn > .5){ m = uFadeT; crest = 0.; }
  vec3 col; float alpha;
  if (uMode < .5){ col = cB; alpha = m; }
  else if (uMode < 1.5){ col = mix(cA, cB, m); alpha = 1.; }
  else { col = cA; alpha = 1. - m; }
  col = mix(vec3(dot(col, vec3(.2126, .7152, .0722))), col, 1.18);
  col *= 1. + sl * .6;
  col += vec3(1., .97, .9) * pow(max(sl, 0.), 2.) * .3;
  vec2 vu = px / uRes - .5;
  col *= 1. - smoothstep(.28, .9, length(vu * vec2(1., .85))) * .36;
  col += .01;
  vec2 lp = px - disp * uAmpPx * .85 - idle * 2.;
  float lc = 0.;
  for (int i = 0; i < 14; i++){
    vec4 s = uSeg[i];
    float g = clamp((uLines - float(i) * .03) / .5, 0., 1.);
    g = 1. - pow(1. - g, 3.);
    if (g <= 0.) continue;
    float dd = segD(lp, s.xy, mix(s.xy, s.zw, g));
    lc = max(lc, clamp((.5 + .5 * pxs - dd) / pxs, 0., 1.));
  }
  float vis = uMode < .5 ? m : (uMode > 1.5 ? 1. - m : 1.);
  lc *= smoothstep(.35, .9, vis);
  col = mix(col, vec3(1., .992, .886), lc * .78);
  col += vec3(1., .99, .93) * crest * .5;
  float gr = hash12(floor(gl_FragCoord.xy) + fract(uTime * 7.31) * 431.) - .5;
  col += gr * .085;
  if (uMode < .5) alpha = clamp(alpha + crest * .35, 0., 1.);
  else if (uMode > 1.5) alpha = clamp(alpha + crest * .35, 0., 1.);
  gl_FragColor = vec4(clamp(col, 0., 1.) * alpha, alpha);
}`;
// the dawn flood: scroll-driven, so it plays backward just as well
const FLOOD_FS = /* glsl */ `
uniform vec2 uRes, uBuf, uC; uniform float uK, uD, uTime, uLam;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float x = clamp(uK, 0., 1.);
  float R = uD * 1.08 * easeOutR(x);
  vec2 cv = px - uC; float cd = length(cv);
  vec2 dn = cv / max(cd, 1.);
  float wob = ((vnoise(dn * 1.7 + vec2(17.3, x * 3.)) - .5) * 34. + (vnoise(dn * 4.6 + vec2(3.1, 9. + x * 5.)) - .5) * 9.) * (1. - x);
  float dm = cd + wob;
  float e = mix(9., 26., 1. - x);
  float m = 1. - smoothstep(R - e, R + e, dm);
  float b = R - cd;
  float env = exp(-max(b, 0.) / (uD * .32)) * smoothstep(0., uLam * .3, b) * (1. - x * .85);
  float ph = b * 6.2831853 / uLam;
  float sl = cos(ph) * env * dot(dn, normalize(vec2(-.6, -.8)));
  vec3 cream = vec3(1., .9922, .8863);
  vec3 col = cream * (1. + sl * .09) + vec3(1., .99, .93) * pow(max(sl, 0.), 2.) * .05;
  float crest = exp(-abs(dm - R) / 8.) * (1. - x * .75);
  col = mix(col, vec3(1.), crest * .35);
  float gr = hash12(floor(gl_FragCoord.xy) + fract(uTime * 7.31) * 431.) - .5;
  col += gr * .018;
  float alpha = clamp(m + crest * .45, 0., 1.);
  if (x <= 0.) alpha = 0.;
  gl_FragColor = vec4(clamp(col, 0., 1.) * alpha, alpha);
}`;

const pad = (n) => String(n).padStart(2, '0');
const SUN_PATHS = '<path d="M0.25 141.85L122.96 212.7C126.25 189 138.75 168.25 156.74 154.19L34.03 83.35Z"/><path d="M178.4 141.67C188.83 137.45 200.23 135.12 212.18 135.12C224.12 135.12 235.52 137.45 245.96 141.67V0H178.4Z"/><path d="M267.61 154.19C285.59 168.25 298.1 189 301.39 212.69L424.09 141.85L390.31 83.35Z"/><rect x="0" y="233.45" width="424.1" height="67.56"/>';
const MARK = `<svg class="rv-mark" viewBox="0 0 424 301" fill="currentColor" aria-hidden="true" style="--d:0s">${SUN_PATHS}</svg>`;
const FRONT = 1.25;

export function createRippleView({ renderer, projects, dom, reduce, coarse, mobile, onSwap, onOpen, onClose }) {
  const GL = !!renderer;
  const NP = projects.length;
  const { root, body, scroll, close: closeBtn, tagT, tagB, court: courtSvg, imgA, imgB } = dom;
  let vw = innerWidth, vh = innerHeight;
  let now = 0;
  const timers = [];
  const tweens = [];
  const after = (sec, fn) => timers.push({ t: now + sec, fn });
  const tween = (from, to, dur, fn, delay = 0) => new Promise((res) => tweens.push({ from, to, dur: Math.max(dur, 1e-4), fn, t0: now + delay, res }));

  let dead = false, open = false, cur = -1, trigger = null, lock = 0, frontT0 = -1, focusWant = 0, coverAt = Infinity, closing = false;
  let OU = null, ovScene = null, floodScene = null, FU = null, blurScene = null, blurMat = null, orthoCam = null, quadGeo = null;
  const info = new Map();
  let curInfo = null, fbFront = null;

  if (GL) {
    orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quadGeo = new THREE.PlaneGeometry(2, 2);
    const PH = new THREE.DataTexture(new Uint8Array([26, 22, 20, 255]), 1, 1); PH.needsUpdate = true;
    OU = {
      uRes: { value: new THREE.Vector2(vw, vh) }, uBuf: { value: new THREE.Vector2(vw, vh) },
      uTime: { value: 0 }, uNow: { value: 0 },
      uTA: { value: PH }, uTB: { value: PH }, uSB: { value: PH },
      uAspA: { value: 1.6 }, uAspB: { value: 1.6 }, uDarkA: { value: 0.6 }, uDarkB: { value: 0.6 },
      uMode: { value: 0 }, uC: { value: new THREE.Vector2() }, uT: { value: 0 }, uDur: { value: FRONT }, uD: { value: 1000 },
      uFadeOn: { value: 0 }, uFadeT: { value: 0 }, uFocus: { value: 0 }, uLines: { value: 0 },
      uDrops: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
      uDropP: { value: Array.from({ length: 6 }, () => new THREE.Vector2(1, 1)) },
      uSeg: { value: Array.from({ length: 14 }, () => new THREE.Vector4()) },
      uAmpPx: { value: 36 }, uLam: { value: 140 }, uDecL: { value: 700 },
    };
    const ovMat = new THREE.ShaderMaterial({ uniforms: OU, vertexShader: FSQ_VS, fragmentShader: OV_FS, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false });
    const ovMesh = new THREE.Mesh(quadGeo, ovMat); ovMesh.frustumCulled = false;
    ovScene = new THREE.Scene(); ovScene.add(ovMesh);
    FU = {
      uRes: OU.uRes, uBuf: OU.uBuf, uC: { value: new THREE.Vector2() }, uK: { value: 0 }, uD: { value: 1000 }, uTime: OU.uTime, uLam: { value: 140 },
    };
    const flMat = new THREE.ShaderMaterial({ uniforms: FU, vertexShader: FSQ_VS, fragmentShader: FLOOD_FS, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false });
    const flMesh = new THREE.Mesh(quadGeo, flMat); flMesh.frustumCulled = false;
    floodScene = new THREE.Scene(); floodScene.add(flMesh);
    blurMat = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() }, uMode: { value: 0 } }, vertexShader: FSQ_VS, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false });
    const bq = new THREE.Mesh(quadGeo, blurMat); bq.frustumCulled = false;
    blurScene = new THREE.Scene(); blurScene.add(bq);
    OU.__ph = PH;
  }

  function makeBlur(tex, w = 480, h = 300) {
    const opts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
    const a = new THREE.WebGLRenderTarget(w, h, opts);
    const b = new THREE.WebGLRenderTarget(w, h, opts);
    const prev = renderer.getRenderTarget();
    const u = blurMat.uniforms;
    u.uMode.value = 0; u.tSrc.value = tex;
    renderer.setRenderTarget(a); renderer.render(blurScene, orthoCam);
    u.uMode.value = 1;
    const spread = 2.6;
    for (let k = 0; k < 4; k++) {
      u.tSrc.value = a.texture; u.uDir.value.set(spread / w, 0);
      renderer.setRenderTarget(b); renderer.render(blurScene, orthoCam);
      u.tSrc.value = b.texture; u.uDir.value.set(0, spread / h);
      renderer.setRenderTarget(a); renderer.render(blurScene, orthoCam);
    }
    renderer.setRenderTarget(prev);
    b.dispose();
    return a.texture;
  }
  const darkFor = (lum) => Math.min(0.95, Math.max(0.42, 0.36 / Math.max(lum, 0.05)));
  const portrait = () => vh > vw * 1.1;
  // blurred + sharp textures for a project; phones in portrait use the phone screenshot when there is one
  function prepare(i) {
    const usePhone = portrait() && projects[i].mob;
    const key = `${i}${usePhone ? 'm' : ''}`;
    if (info.has(key)) return info.get(key);
    const e = usePhone ? getTex(projects[i].mob, 640) : getTex(projects[i].img);
    const rec = { key, ready: false, blur: null, sharp: e.tex, asp: 1.6, dark: 0.6 };
    rec.p = e.ready.then((t) => {
      if (!t || !GL) return rec;
      rec.asp = t.userData.asp; rec.dark = darkFor(t.userData.lum);
      rec.blur = makeBlur(t, usePhone ? 240 : 480, usePhone ? 520 : 300);
      rec.ready = true;
      return rec;
    });
    info.set(key, rec);
    return rec;
  }
  function setB(i) {
    const r = prepare(i);
    curInfo = r;
    const apply = () => { if (curInfo !== r) return; OU.uTB.value = r.blur || OU.__ph; OU.uSB.value = r.sharp; OU.uAspB.value = r.asp; OU.uDarkB.value = r.dark; };
    apply();
    if (!r.ready) r.p.then(apply);
  }
  function setAFromCur() {
    if (!curInfo) return;
    OU.uTA.value = curInfo.blur || OU.__ph; OU.uAspA.value = curInfo.asp; OU.uDarkA.value = curInfo.dark;
  }

  // ---------- court ----------
  function courtLayout() {
    const land = !mobile && vw > vh * 0.9;
    const cx = vw / 2;
    let c;
    if (land) c = { xL: 0.2722 * vw, xR: 0.7271 * vw, y1: 0.0933 * vh, y2: 0.1933 * vh, y3: 0.8133 * vh, y4: 0.9067 * vh, ym: 0.4889 * vh, gap: 0.042 * vw, tick: 0.0528 * vw };
    else c = { xL: 0.055 * vw, xR: 0.945 * vw, y1: Math.max(60, 0.075 * vh), y2: Math.max(104, 0.135 * vh), y3: 0.875 * vh, y4: 0.94 * vh, ym: 0.5 * vh, gap: 0.1 * vw, tick: 0.07 * vw };
    const segs = [
      [cx - c.gap, c.y1, 0, c.y1], [cx + c.gap, c.y1, vw, c.y1],
      [cx - c.gap, c.y2, 0, c.y2], [cx + c.gap, c.y2, vw, c.y2],
      [cx, c.y1, cx, c.y2],
      [c.xL, c.y2, c.xL, c.y3], [c.xR, c.y2, c.xR, c.y3],
      [c.xL, c.ym, c.xL + c.tick, c.ym], [c.xR, c.ym, c.xR - c.tick, c.ym],
      [cx - c.gap, c.y3, 0, c.y3], [cx + c.gap, c.y3, vw, c.y3],
      [cx - c.gap, c.y4, 0, c.y4], [cx + c.gap, c.y4, vw, c.y4],
      [cx, c.y4, cx, c.y3],
    ];
    if (GL) segs.forEach((s, i) => OU.uSeg.value[i].set(s[0], s[1], s[2], s[3]));
    courtSvg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    courtSvg.innerHTML = segs.map((s) => `<line x1="${s[0].toFixed(1)}" y1="${s[1].toFixed(1)}" x2="${s[2].toFixed(1)}" y2="${s[3].toFixed(1)}"/>`).join('');
    tagT.style.left = `${cx + c.gap + 4}px`; tagT.style.top = `${c.y2 - 8}px`; tagT.style.transform = 'translateY(-100%)';
    tagB.style.right = `${vw - (cx - c.gap - 4)}px`; tagB.style.left = 'auto'; tagB.style.top = `${c.y3 + 8}px`;
  }
  function resize(w, h) {
    vw = w; vh = h;
    if (GL) {
      const buf = new THREE.Vector2();
      renderer.getDrawingBufferSize(buf);
      OU.uRes.value.set(w, h); OU.uBuf.value.copy(buf);
      const diag = Math.hypot(w, h);
      OU.uAmpPx.value = diag * 0.0175; OU.uLam.value = diag * 0.1; OU.uDecL.value = diag * 0.42;
      FU.uLam.value = diag * 0.1;
    }
    courtLayout();
  }

  // ---------- drops ----------
  const drops = Array.from({ length: 6 }, () => ({ x: 0, y: 0, t0: -99, amp: 0, D: 1, k: 1 }));
  let bigSlot = 0, smallSlot = 2;
  const maxCorner = (x, y) => Math.max(Math.hypot(x, y), Math.hypot(vw - x, y), Math.hypot(x, vh - y), Math.hypot(vw - x, vh - y));
  const coverTime = (Dm) => { const need = Math.min(0.999, (Dm + 26) / (Dm * 1.1)); return (1 - Math.pow(1 - need, 1 / 2.2)) * FRONT; };
  function bigDrop(x, y) { const d = drops[bigSlot]; bigSlot = (bigSlot + 1) % 2; Object.assign(d, { x, y, t0: now, amp: 1, D: maxCorner(x, y), k: 1 }); }
  function smallDrop(x, y, amp = 0.2) { const d = drops[smallSlot]; smallSlot = smallSlot >= 5 ? 2 : smallSlot + 1; Object.assign(d, { x, y, t0: now, amp, D: Math.hypot(vw, vh) * 0.3, k: 0.35 }); }
  function startFront(mode, x, y) { OU.uMode.value = mode; OU.uC.value.set(x, y); OU.uD.value = maxCorner(x, y); frontT0 = now; bigDrop(x, y); }

  // ---------- content ----------
  function fill(i) {
    const p = projects[i];
    body.innerHTML = `${MARK}
      <h2 class="rv-h" id="rvTitle" style="--d:.05s">${p.title}</h2>
      <p class="rv-y" style="--d:.14s">${p.kicker}</p>
      <p class="rv-l" style="--d:.18s">${p.line}</p>
      <div class="rv-act" style="--d:.26s">
        <a class="rv-btn" href="${p.url}" target="_blank" rel="noopener">Open live build <span class="ar" aria-hidden="true">&#8599;</span></a>
        <button type="button" class="rv-nx" data-act="next">Next<span class="ar" aria-hidden="true">&#8594;</span></button>
      </div>`;
    tagT.textContent = `${pad(i + 1)} / ${pad(NP)}`;
    tagB.textContent = coarse ? '' : 'Esc to close';
    scroll.scrollTop = 0;
  }
  function fbShow(i) {
    const src = projects[i].img;
    const next = fbFront === imgA ? imgB : imgA;
    next.style.backgroundImage = `url("${src}")`;
    next.classList.add('on');
    if (fbFront) fbFront.classList.remove('on');
    fbFront = next;
  }

  function openAt(i, x, y, trig) {
    if (open) { swapTo(i, x, y); return; }
    open = true; closing = false; cur = i; trigger = trig || null;
    const Dm = maxCorner(x, y);
    const ct = reduce ? 0.32 : coverTime(Dm);
    lock = now + (reduce ? 0.35 : ct + 0.05);
    coverAt = now + ct + 0.02;
    fill(i);
    root.classList.add('open', 'chrome'); root.removeAttribute('inert'); root.setAttribute('aria-hidden', 'false');
    focusWant = 0;
    if (GL) {
      setB(i); OU.uFocus.value = 0; OU.uLines.value = 0;
      if (reduce) {
        OU.uMode.value = 0; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; OU.uLines.value = 1; frontT0 = now; OU.uC.value.set(x, y); OU.uD.value = Dm;
        tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; });
      } else {
        OU.uFadeOn.value = 0; startFront(0, x, y);
        tween(0, 1, 1.6, (v) => { OU.uLines.value = v; }, 0.16);
      }
    } else fbShow(i);
    after(reduce ? 0.02 : 0.34, () => { if (open) root.classList.add('txt'); });
    after(0.05, () => root.focus({ preventScroll: true }));
    onOpen && onOpen(i);
    [1, -1].forEach((d) => prepare((i + d + NP) % NP));
  }
  function swapTo(i, x, y) {
    if (!open || now < lock) return;
    const Dm = maxCorner(x, y);
    lock = now + (reduce ? 0.35 : coverTime(Dm) + 0.05);
    cur = i; focusWant = 0;
    const hadNext = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.act === 'next';
    root.classList.remove('txt');
    if (GL) {
      setAFromCur(); setB(i); OU.uFocus.value = 0;
      if (reduce) { OU.uMode.value = 1; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; }); }
      else startFront(1, x, y);
    } else fbShow(i);
    onSwap && onSwap(i);
    after(reduce ? 0.04 : 0.3, () => {
      fill(i);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.add('txt');
        const nx = body.querySelector('[data-act="next"]');
        if (hadNext && nx) nx.focus({ preventScroll: true });
        else if (!root.contains(document.activeElement)) root.focus({ preventScroll: true });
      }));
    });
    [1, -1].forEach((d) => prepare((i + d + NP) % NP));
  }
  function closeAt(x, y) {
    if (!open || now < lock) return;
    lock = now + 99; closing = true;
    root.classList.remove('txt', 'chrome');
    focusWant = 0;
    coverAt = Infinity;
    const done = () => {
      open = false; closing = false; lock = 0;
      root.classList.remove('open'); root.setAttribute('inert', ''); root.setAttribute('aria-hidden', 'true');
      if (GL) frontT0 = -1;
      if (fbFront) { fbFront.classList.remove('on'); fbFront = null; }
      const t = trigger; trigger = null;
      if (t && t.focus && document.contains(t)) t.focus({ preventScroll: true });
      onClose && onClose();
    };
    if (GL) {
      setAFromCur(); OU.uFocus.value = 0;
      if (reduce) { OU.uMode.value = 2; OU.uFadeOn.value = 1; OU.uFadeT.value = 0; frontT0 = now; tween(0, 1, 0.3, (v) => { OU.uFadeT.value = v; }).then(done); }
      else { startFront(2, x, y); after(coverTime(maxCorner(x, y)) + 0.05, done); }
    } else after(0.62, done);
  }

  // ---------- input ----------
  body.addEventListener('click', (e) => {
    if (dead) return;
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const kb = e.detail === 0;
    const x = kb ? r.left + r.width / 2 : e.clientX, y = kb ? r.top + r.height / 2 : e.clientY;
    if (b.dataset.act === 'next') swapTo((cur + 1) % NP, x, y);
  });
  body.addEventListener('pointerover', (e) => { if (e.target.closest('.rv-btn')) focusWant = 1; });
  body.addEventListener('pointerout', (e) => { if (e.target.closest('.rv-btn')) focusWant = 0; });
  body.addEventListener('focusin', (e) => { if (e.target.closest('.rv-btn')) focusWant = 1; });
  body.addEventListener('focusout', () => { focusWant = 0; });
  closeBtn.addEventListener('click', () => { if (dead) return; const r = closeBtn.getBoundingClientRect(); closeAt(r.left + r.width / 2, r.top + r.height / 2); });
  let last = { x: -999, y: -999, t: -9 };
  root.addEventListener('pointermove', (e) => {
    if (!GL || reduce || !open || e.pointerType === 'touch') return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (now - last.t > 0.12 && dx * dx + dy * dy > 6400) { smallDrop(e.clientX, e.clientY, 0.2); last = { x: e.clientX, y: e.clientY, t: now }; }
  });
  root.addEventListener('pointerdown', (e) => {
    if (!GL || reduce || !open || e.target.closest('a, button')) return;
    smallDrop(e.clientX, e.clientY, 0.5);
  });
  function onKey(e) {
    if (!open) return false;
    if (e.key === 'Escape') { e.preventDefault(); closeAt(vw / 2, vh / 2); return true; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); swapTo((cur + (e.key === 'ArrowRight' ? 1 : -1) + NP) % NP, vw / 2, vh / 2); return true; }
    if (e.key === 'Tab') {
      const f = [...root.querySelectorAll('a[href], button:not([disabled])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return true;
      const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      return true;
    }
    return false;
  }

  // ---------- per frame ----------
  function update(dt) {
    now += dt;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      if (now < tw.t0) continue;
      const x = Math.min(1, (now - tw.t0) / tw.dur);
      tw.fn(tw.from + (tw.to - tw.from) * x);
      if (x >= 1) { tweens.splice(i, 1); tw.res(); }
    }
    for (let i = timers.length - 1; i >= 0; i--) if (now >= timers[i].t) { const f = timers[i].fn; timers.splice(i, 1); f(); }
    if (!GL) return;
    OU.uTime.value = now; OU.uNow.value = now;
    if (open || closing) {
      OU.uT.value = frontT0 >= 0 ? now - frontT0 : 0;
      root.classList.toggle('peek', focusWant > 0);
      OU.uFocus.value += (focusWant * 0.86 - OU.uFocus.value) * (1 - Math.exp(-dt * 5));
      drops.forEach((d, j) => { OU.uDrops.value[j].set(d.x, d.y, d.t0, d.amp); OU.uDropP.value[j].set(d.D, d.k); });
    }
  }
  // the front radius for masking the DOM page underneath
  function front() {
    if (!(open || closing) || frontT0 < 0) return null;
    const mode = OU ? OU.uMode.value : 0;
    const t = now - frontT0;
    if (reduce || (OU && OU.uFadeOn.value > 0.5)) return { mode, fade: OU ? OU.uFadeT.value : 1 };
    const x = Math.min(1, t / FRONT);
    const R = OU.uD.value * 1.1 * (1 - Math.pow(1 - x, 2.2));
    return { mode, x: OU.uC.value.x, y: OU.uC.value.y, R };
  }

  return {
    kill() { dead = true; open = false; closing = false; },
    resize, update: (dt) => { if (!dead) update(dt); }, onKey: (e) => (dead ? false : onKey(e)), prepare,
    get isOpen() { return open; },
    get active() { return open || closing; },
    get index() { return cur; },
    fullCover() { return open && !closing && now >= coverAt; },
    front,
    open: openAt,
    swap: (i, x, y) => swapTo(i, x, y),
    next: (d = 1) => swapTo((cur + d + NP) % NP, vw / 2, vh / 2),
    close: (x = vw / 2, y = vh / 2) => closeAt(x, y),
    render() {
      if (!GL || !(open || closing)) return;
      renderer.setRenderTarget(null);
      renderer.render(ovScene, orthoCam);
    },
    // k in 0..1 (scroll driven), origin in CSS px
    renderFlood(k, x, y, t) {
      if (!GL || k <= 0) return;
      FU.uK.value = k; FU.uC.value.set(x, y); FU.uD.value = maxCorner(x, y); OU.uTime.value = t;
      renderer.setRenderTarget(null);
      renderer.render(floodScene, orthoCam);
    },
    floodRadius(k, x, y) { const D = maxCorner(x, y); return D * 1.08 * (1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 2.2)); },
  };
}
