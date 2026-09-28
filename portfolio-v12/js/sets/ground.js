import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, damp, ease, input, mulberry, loadGLB, dust } from '../util.js';

// 06 Let's build. The ground, at a red dawn. Vishwakarma on a black stone plinth, a diya burning,
// the sunburst rising over the dunes as light, and the plumb bob from the top of the page finally
// resting on the ground at his feet.
export async function createGround({ env, neutral, mobile, gltf }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = neutral; scene.environmentIntensity = 0.16;
  scene.fog = new THREE.Fog('#000000', 10, 30);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 160);
  const S = { stageX: 1.9, camZ: 8.4, camY: 1.45, lookY: 1.5, rise: 0, portrait: false, horY: 0.9 };
  const Z_SKY = -60, Z_SUN = -56, Z_FAR = -44, Z_NEAR = -26;

  // sky: black above, a deep red breath along the horizon
  const skyU = { uHor: { value: 0.5 }, uRise: { value: 0 }, uTime: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    fog: false, depthWrite: false, uniforms: skyU,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform float uHor, uRise, uTime; varying vec2 vUv;
      void main(){
        float d = vUv.y - uHor;
        float glow = exp(-max(d, 0.0) * 7.0) * step(-0.02, d);
        float core = exp(-max(d, 0.0) * 26.0) * exp(-pow((vUv.x - 0.5) * 2.4, 2.0));
        vec3 c = vec3(0.06, 0.001, 0.0) * glow * (0.55 + 0.45 * uRise) + vec3(0.9, 0.05, 0.02) * core * 0.4 * uRise;
        c += vec3(0.02, 0.0, 0.0) * smoothstep(0.0, 0.5, d) * (1.0 - smoothstep(0.5, 1.0, vUv.y));
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.position.z = Z_SKY; scene.add(sky);

  // the sun and the sunburst as light, clipped at the horizon
  const clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const sunGroup = new THREE.Group(); scene.add(sunGroup);
  const rayMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, clipping: true, clippingPlanes: [clip],
    uniforms: { uAmt: { value: 0 }, uTime: { value: 0 } },
    vertexShader: '#include <clipping_planes_pars_vertex>\nvarying vec2 vP; void main(){ vP = position.xy; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mvPosition;\n#include <clipping_planes_vertex>\n}',
    fragmentShader: '#include <clipping_planes_pars_fragment>\nuniform float uAmt, uTime; varying vec2 vP; void main(){\n#include <clipping_planes_fragment>\n float d = length(vec2(vP.x, vP.y + 20.7)); float a = pow(1.0 - clamp(d / 250.0, 0.0, 1.0), 1.6); a *= 0.93 + 0.07 * sin(uTime * 0.7 + d * 0.03); gl_FragColor = vec4(vec3(1.0, 0.03, 0.01) * a * uAmt, 1.0); }',
  });
  {
    const txt = await (await fetch('assets/brand/sunburst.svg')).text();
    const data = new SVGLoader().parse(txt);
    const shapes = []; data.paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
    const geo = new THREE.ShapeGeometry(shapes, 24); geo.computeBoundingBox();
    const bb = geo.boundingBox; geo.translate(-(bb.min.x + bb.max.x) / 2, -233.45, 0);
    const m = new THREE.Mesh(geo, rayMat); m.scale.set(1, -1, 1);
    const rays = new THREE.Group(); rays.add(m); rays.userData.w = bb.max.x - bb.min.x; sunGroup.add(rays); sunGroup.userData.rays = rays;
  }
  const discU = { uRise: { value: 0 }, uTime: { value: 0 } };
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, clipping: true, clippingPlanes: [clip], uniforms: discU,
    vertexShader: '#include <clipping_planes_pars_vertex>\nvarying vec2 vUv; void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mvPosition;\n#include <clipping_planes_vertex>\n}',
    fragmentShader: '#include <clipping_planes_pars_fragment>\nuniform float uRise, uTime; varying vec2 vUv; void main(){\n#include <clipping_planes_fragment>\n vec2 p = (vUv - 0.5) * 2.0; float r = length(p); float R = 0.22; float body = smoothstep(R, R - 0.01, r); float corona = exp(-max(r - R * 0.6, 0.0) / 0.22); vec3 core = mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.3, 0.1), smoothstep(0.0, R, r)); vec3 c = core * body * 1.4 + vec3(1.0, 0.05, 0.02) * corona * (0.7 + 0.05 * sin(uTime * 2.0)); gl_FragColor = vec4(c * uRise * smoothstep(1.0, 0.6, r), 1.0); }',
  }));
  sunGroup.add(disc); sunGroup.userData.disc = disc;

  // dunes: two dark silhouettes
  const dune = (w, h, seed, color, z) => {
    const r = mulberry(seed), sh = new THREE.Shape();
    sh.moveTo(-w / 2, -h); sh.lineTo(-w / 2, 0);
    const n = 60, amps = [r() * 0.5 + 0.4, r() * 0.3 + 0.2, r() * 0.2], fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4], phs = [r() * 6, r() * 6, r() * 6];
    for (let i = 0; i <= n; i++) {
      const x = -w / 2 + (w * i) / n, u = i / n;
      const y = amps[0] * Math.sin(u * fr[0] + phs[0]) + amps[1] * Math.sin(u * fr[1] + phs[1]) + amps[2] * Math.sin(u * fr[2] + phs[2]);
      sh.lineTo(x, y * (h * 0.08));
    }
    sh.lineTo(w / 2, -h); sh.lineTo(-w / 2, -h);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 4), new THREE.MeshBasicMaterial({ color, fog: false }));
    m.position.z = z; scene.add(m); return m;
  };
  const far = dune(260, 30, 3, '#0a0101', Z_FAR);
  const near = dune(160, 20, 8, '#030000', Z_NEAR);

  // ground, plinth, statue
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.MeshStandardMaterial({ color: '#0a0706', roughness: 0.95, envMapIntensity: 0.1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.z = -10; ground.receiveShadow = !mobile; scene.add(ground);
  const stage = new THREE.Group(); scene.add(stage);
  const PH = 0.56;
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.75, PH, 1.3, 3, 0.03), new THREE.MeshStandardMaterial({ color: '#0e0c0b', roughness: 0.55, metalness: 0.2 }));
  plinth.position.y = PH / 2; plinth.castShadow = plinth.receiveShadow = !mobile; stage.add(plinth);
  try {
    const statue = await loadGLB(gltf, 'assets/models/vishwakarma.glb', 2.25, { shadow: !mobile, env: 0.7 });
    statue.position.y = PH + 0.004; stage.add(statue);
  } catch (e) { console.warn('statue failed', e); }

  // diya
  const diya = new THREE.Group(); diya.position.set(0.25, 0, 1.05); stage.add(diya);
  {
    const prof = [[0, 0], [0.07, 0.005], [0.11, 0.03], [0.13, 0.07], [0.125, 0.075], [0.1, 0.045], [0.06, 0.03], [0, 0.028]].map(([x, y]) => new THREE.Vector2(x, y));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshStandardMaterial({ color: '#5a2412', roughness: 0.9, side: THREE.DoubleSide }));
    bowl.scale.setScalar(1.2); bowl.castShadow = !mobile; diya.add(bowl);
  }
  const flameMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uTime; varying vec2 vUv; void main(){ vec2 p = vUv - vec2(0.5, 0.18); p.x += sin(uTime * 9.0 + p.y * 12.0) * 0.03 * p.y; float w = 0.22 * (1.0 - smoothstep(0.0, 0.78, p.y)) * smoothstep(-0.18, 0.05, p.y); float f = smoothstep(w, w * 0.2, abs(p.x)) * step(-0.16, p.y); vec3 c = mix(vec3(3.6, 0.5, 0.1), vec3(4.5, 3.4, 1.8), smoothstep(0.25, 0.0, length(p * vec2(1.6, 1.0)))); gl_FragColor = vec4(c * f, 1.0); }',
  });
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.28), flameMat); flame.position.set(0.12, 0.2, 0); diya.add(flame);
  const flameLight = new THREE.PointLight('#ff8a3a', 1.2, 2.6, 1.8); flameLight.position.set(0.12, 0.3, 0.1); diya.add(flameLight);

  // the thread comes down one last time; the bob rests on the ground
  const bobG = new THREE.Group(); bobG.position.set(-1.25, 0, 0.95); stage.add(bobG);
  const prof = [[0, 0], [0.03, 0], [0.034, -0.004], [0.036, -0.012], [0.036, -0.075], [0.032, -0.08], [0.027, -0.085], [0.03, -0.09], [0.046, -0.1], [0.05, -0.11], [0.05, -0.15], [0.047, -0.165], [0.002, -0.458], [0, -0.46]].map(([x, y]) => new THREE.Vector2(x, y));
  const bob = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1, clearcoat: 0.4, envMap: env, envMapIntensity: 1.1 }));
  const BS = 1.1; bob.scale.setScalar(BS); bob.position.y = 0.46 * BS + 0.002; bob.castShadow = !mobile; bobG.add(bob);
  const threadGeo = new THREE.CylinderGeometry(0.005, 0.005, 1, 6, 1, true); threadGeo.translate(0, 0.5, 0);
  const thread = new THREE.Mesh(threadGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff0101').multiplyScalar(1.9), fog: false }));
  thread.position.y = 0.46 * BS; thread.scale.y = 12; bobG.add(thread);

  // light
  const key = new THREE.DirectionalLight('#fff1e6', 1.6); key.position.set(-4.5, 3.6, 5.5); key.target.position.set(0, 1.2, 0);
  stage.add(key); stage.add(key.target);
  if (!mobile) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -3.5; key.shadow.camera.right = 3; key.shadow.camera.top = 4; key.shadow.camera.bottom = -1; key.shadow.bias = -0.0008; }
  const rim = new THREE.PointLight('#ff0101', 12, 8, 1.4); rim.position.set(0.6, 2.8, -1.5); stage.add(rim);
  const rim2 = new THREE.PointLight('#ff2a10', 4, 7, 1.4); rim2.position.set(-1.2, 1.4, -1.3); stage.add(rim2);
  scene.add(new THREE.HemisphereLight('#6a6f88', '#0a0000', 0.2));
  const embers = dust({ count: mobile ? 50 : 110, radius: 0.5, yMin: 0.2, yMax: 3.2, beam: 0.3, size: 18, color: '#ff2a10', axisX: 0.25, axisZ: 1.05, seed: 9 });
  stage.add(embers);

  const look = new THREE.Vector3();
  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 40 : 30; camera.updateProjectionMatrix();
    S.stageX = S.portrait ? 0 : a > 1.9 ? 2.4 : 1.95;
    S.camZ = S.portrait ? 11 : 8.4;
    S.camY = S.portrait ? 1.3 : 1.45;
    S.lookY = S.portrait ? 2.8 : 1.5;
    stage.position.x = S.stageX;
    bobG.visible = !S.portrait;
    const camX = S.stageX * 0.35;
    // horizon a little under the statue's shoulders; everything far sits on the camera line through the statue
    const hor = S.portrait ? 1.35 : 1.6;
    const along = (z) => camX + (S.stageX - camX) * (S.camZ - z) / S.camZ;
    const yAt = (z) => S.camY + (hor - S.camY) * (S.camZ - z) / S.camZ;
    const D = S.camZ - Z_SKY, vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.2;
    sky.scale.set(vh * a * 1.2, vh, 1); sky.position.set(along(Z_SKY), yAt(Z_SKY), Z_SKY);
    skyU.uHor.value = 0.5 - (yAt(Z_SKY) - yAt(Z_SKY)) / vh; // horizon through the middle of the plate
    S.horY = yAt(Z_SUN);
    clip.constant = -S.horY;
    const sw = S.portrait ? 16 : 22;
    const rays = sunGroup.userData.rays; rays.scale.setScalar(sw / rays.userData.w);
    sunGroup.userData.disc.scale.set(sw * 0.9, sw * 0.9, 1);
    sunGroup.position.set(along(Z_SUN), S.horY, Z_SUN);
    far.position.set(along(Z_FAR), yAt(Z_FAR) - 0.2, Z_FAR);
    near.position.set(along(Z_NEAR) - 4, yAt(Z_NEAR) - 1.2, Z_NEAR);
  }
  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    S.rise = damp(S.rise, st.visible && local > -0.35 ? 1 : 0, 0.9, dt);
    if (st.ff) S.rise = st.visible ? 1 : 0;
    const r = ease.out(S.rise);
    const rays = sunGroup.userData.rays;
    rays.position.y = -(1 - r) * 250 * rays.scale.y;
    rayMat.uniforms.uAmt.value = 0.45 * r; rayMat.uniforms.uTime.value = t;
    const disc = sunGroup.userData.disc; disc.position.y = lerp(-disc.scale.y * 0.3, disc.scale.y * 0.02, r);
    discU.uRise.value = r; discU.uTime.value = t;
    skyU.uRise.value = r; skyU.uTime.value = t;
    flameMat.uniforms.uTime.value = t;
    flameLight.intensity = 1.2 * (0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1.2));
    embers.material.uniforms.uTime.value = t;
    const mx = input.x * 0.35, my = input.y * 0.12;
    camera.position.set(S.stageX * 0.35 + mx, S.camY + my + inE * 3.6, S.camZ + inE * 1.4);
    look.set(S.stageX * 0.55 + mx * 0.3, S.lookY + inE * 1.5, 0);
    camera.lookAt(look);
  }
  return { scene, camera, applyAspect, update, setPx(px) { embers.material.uniforms.uPx.value = px; } };
}
