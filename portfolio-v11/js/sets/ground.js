import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, damp, ease, input, mulberry, loadGLB, glowDisc, dust } from '../util.js';

// 06 Let's build. The ground, at dawn. Vishwakarma on a stone plinth, a diya burning in front,
// marigold petals falling, and the sunburst rising over the dunes of the Thar.
export async function createGround({ env, mobile, gltf, texLoader }) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.28;
  scene.fog = new THREE.Fog('#0a0606', 9, 26);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const S = { stageX: 1.9, camZ: 8.4, camY: 1.5, lookY: 1.45, rise: 0, portrait: false, horY: 0 };

  // dawn plate
  const PZ = -34;
  const plateMat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, depthWrite: false });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), plateMat); plate.position.z = PZ; scene.add(plate);
  let plateAspect = 1344 / 576;
  let ready = false;
  texLoader.load('assets/env/dawn.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; plateMat.map = t; plateMat.needsUpdate = true; plateAspect = t.image.width / t.image.height; if (ready) applyAspect(camera.aspect); });
  const HOR = 0.62; // horizon, from the top of the photo

  // the sunburst, rising from behind the horizon
  const clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  // rays of light in the shape of the mark: bright where they leave the horizon, fading as they climb
  const sunMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, clipping: true, clippingPlanes: [clip],
    uniforms: { uColor: { value: new THREE.Color('#ff5c00') }, uAmt: { value: 0 }, uTime: { value: 0 } },
    vertexShader: '#include <clipping_planes_pars_vertex>\nvarying vec2 vP; void main(){ vP = position.xy; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mvPosition;\n#include <clipping_planes_vertex>\n}',
    fragmentShader: '#include <clipping_planes_pars_fragment>\nuniform vec3 uColor; uniform float uAmt, uTime; varying vec2 vP; void main(){\n#include <clipping_planes_fragment>\n float d = length(vec2(vP.x, vP.y + 20.7)); float a = pow(1.0 - clamp(d / 250.0, 0.0, 1.0), 1.7); a *= 0.92 + 0.08 * sin(uTime * 0.8 + d * 0.03); gl_FragColor = vec4(uColor * a * uAmt, 1.0); }',
  });
  const sun = new THREE.Group(); scene.add(sun);
  {
    const txt = await (await fetch('assets/brand/sunburst.svg')).text();
    const data = new SVGLoader().parse(txt);
    const shapes = []; data.paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
    const geo = new THREE.ShapeGeometry(shapes, 24); geo.computeBoundingBox();
    const bb = geo.boundingBox; geo.translate(-(bb.min.x + bb.max.x) / 2, -233.45, 0); // the base bar's top edge sits on y = 0
    const m = new THREE.Mesh(geo, sunMat); m.scale.set(1, -1, 1); sun.add(m);
    sun.userData.w = bb.max.x - bb.min.x;
  }
  const sunHalo = glowDisc({ size: 1, color: '#ff6a1a', strength: 0.55, falloff: 2.4 }); sunHalo.material.fog = false; scene.add(sunHalo);

  // ground + plinth + statue
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshStandardMaterial({ color: '#1a100b', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.z = -10; ground.receiveShadow = !mobile; scene.add(ground);
  const stage = new THREE.Group(); scene.add(stage);
  const PH = 0.56;
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.75, PH, 1.3, 3, 0.04), new THREE.MeshStandardMaterial({ color: '#2b211b', roughness: 0.85 }));
  plinth.position.y = PH / 2; plinth.castShadow = plinth.receiveShadow = !mobile; stage.add(plinth);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 1.3), new THREE.MeshStandardMaterial({ color: '#6e1f07', roughness: 0.95 }));
  cloth.position.set(0, PH + 0.006, 0); stage.add(cloth);
  try {
    const statue = await loadGLB(gltf, 'assets/models/vishwakarma.glb', 2.25, { shadow: !mobile, env: 0.9 });
    statue.position.y = PH + 0.012; stage.add(statue);
  } catch (e) { console.warn('statue failed', e); }

  // diya
  const diya = new THREE.Group(); diya.position.set(0, 0, 1.05); stage.add(diya);
  {
    const prof = [[0, 0], [0.07, 0.005], [0.11, 0.03], [0.13, 0.07], [0.125, 0.075], [0.1, 0.045], [0.06, 0.03], [0, 0.028]].map(([x, y]) => new THREE.Vector2(x, y));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshStandardMaterial({ color: '#8a3a1a', roughness: 0.9, side: THREE.DoubleSide }));
    bowl.scale.set(1.25, 1.25, 1.25); bowl.castShadow = !mobile; diya.add(bowl);
  }
  const flameMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }',
    fragmentShader: /* glsl */`
      uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 p = vUv - vec2(0.5, 0.18);
        p.x += sin(uTime * 9.0 + p.y * 12.0) * 0.03 * p.y;
        float w = 0.22 * (1.0 - smoothstep(0.0, 0.78, p.y)) * smoothstep(-0.18, 0.05, p.y);
        float f = smoothstep(w, w * 0.2, abs(p.x)) * step(-0.16, p.y);
        vec3 c = mix(vec3(4.0, 1.4, 0.25), vec3(5.0, 3.8, 1.8), smoothstep(0.25, 0.0, length(p * vec2(1.6, 1.0))));
        gl_FragColor = vec4(c * f, 1.0);
      }`,
  });
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.3), flameMat); flame.position.set(0.12, 0.2, 0); diya.add(flame);
  const flameLight = new THREE.PointLight('#ffa24a', 1.4, 3, 1.8); flameLight.position.set(0.12, 0.3, 0.1); diya.add(flameLight);
  const diyaGlow = glowDisc({ size: 1.6, color: '#ff9a3c', strength: 0.35, falloff: 3 }); diyaGlow.material.fog = false; diyaGlow.position.set(0.12, 0.22, 0); diya.add(diyaGlow);

  // light
  const key = new THREE.DirectionalLight('#ffc6a0', 1.5); key.position.set(-4.5, 3.8, 5.5); key.target.position.set(0, 1.2, 0);
  stage.add(key); stage.add(key.target);
  if (!mobile) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 4; key.shadow.camera.bottom = -1; key.shadow.bias = -0.0008; }
  const rim = new THREE.PointLight('#ff5c00', 16, 7, 1.4); rim.position.set(0.7, 2.9, -1.4); stage.add(rim);
  const rim2 = new THREE.PointLight('#ff9a4a', 7, 6, 1.4); rim2.position.set(-1.2, 1.6, -1.2); stage.add(rim2);
  scene.add(new THREE.HemisphereLight('#3b4675', '#150b06', 0.42));

  // marigold petals
  const PN = mobile ? 30 : 64;
  const petalGeo = new THREE.PlaneGeometry(0.075, 0.055, 2, 1);
  { const p = petalGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.abs(p.getX(i)) * -0.35); petalGeo.computeVertexNormals(); }
  const petals = new THREE.InstancedMesh(petalGeo, new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, side: THREE.DoubleSide }), PN);
  const pr = mulberry(31), P = [];
  const cols = [new THREE.Color('#e0660a'), new THREE.Color('#f09a14'), new THREE.Color('#c94a06')];
  for (let i = 0; i < PN; i++) {
    P.push({ x: (pr() - 0.5) * 5, y: pr() * 6, z: (pr() - 0.5) * 2.4 - 0.2, s: 0.25 + pr() * 0.35, r: pr() * 6.28, sp: 0.6 + pr() * 1.4, ph: pr() * 6.28 });
    petals.setColorAt(i, cols[i % 3]);
  }
  stage.add(petals);
  const embers = dust({ count: mobile ? 60 : 140, radius: 0.5, yMin: 0.2, yMax: 3.4, beam: 0.3, size: 20, color: '#ffb060', axisZ: 1.05, seed: 9 });
  stage.add(embers);

  const look = new THREE.Vector3(), dummy = new THREE.Object3D();

  function applyAspect(a) {
    camera.aspect = a; S.portrait = a < 0.8;
    camera.fov = S.portrait ? 40 : 30; camera.updateProjectionMatrix();
    S.stageX = S.portrait ? 0 : a > 1.9 ? 2.3 : 1.85;
    S.camZ = S.portrait ? 10.8 : 8.4;
    S.camY = S.portrait ? 1.35 : 1.5;
    S.lookY = S.portrait ? 2.05 : 1.45;
    stage.position.x = S.stageX;
    // the plate covers the whole view at its depth
    const D = S.camZ - PZ, vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.12, vw = vh * a;
    let pw = vw, ph = vw / plateAspect; if (ph < vh) { ph = vh; pw = vh * plateAspect; }
    plate.scale.set(pw, ph, 1);
    // put the photo's horizon a little under the statue's shoulders
    const horWorld = S.lookY + (S.portrait ? -1.0 : -0.2);
    plate.position.y = horWorld + (HOR - 0.5) * ph;
    // the sun and the photo's glow sit on the line from the camera through the statue
    const camX = S.stageX * 0.35, sx = camX + (S.stageX - camX) * (S.camZ - PZ) / S.camZ;
    plate.position.x = sx;
    S.horY = horWorld;
    clip.constant = -horWorld;
    const sw = S.portrait ? 10 : 14;
    const s = sw / sun.userData.w;
    sun.scale.set(s, s, s);
    sun.position.set(sx, horWorld, PZ + 1);
    sunHalo.scale.set(sw * 1.5, sw * 0.6, 1); sunHalo.position.set(sx, horWorld, PZ + 0.5);
  }

  function update(dt, t, local, st) {
    const inE = local < 0 ? ease.inOut(clamp(-local)) : 0;
    S.rise = damp(S.rise, st.visible && local > -0.35 ? 1 : 0, 0.9, dt);
    if (st.ff) S.rise = st.visible ? 1 : 0;
    const r = ease.out(S.rise);
    sun.position.y = S.horY - (1 - r) * 250 * sun.scale.y;
    sunMat.uniforms.uAmt.value = 1.35 * r; sunMat.uniforms.uTime.value = t;
    sunHalo.material.uniforms.uStrength.value = 0.1 + 0.28 * r;
    flameMat.uniforms.uTime.value = t;
    const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1.2);
    flameLight.intensity = 2.4 * fl; diyaGlow.material.uniforms.uStrength.value = 0.3 * fl;
    for (let i = 0; i < PN; i++) {
      const p = P[i];
      p.y -= dt * p.sp * 0.28; if (p.y < 0.05) { p.y = 5.5 + pr() * 1.5; p.x = (pr() - 0.5) * 5; }
      dummy.position.set(p.x + Math.sin(t * 0.7 + p.ph) * 0.25, p.y, p.z + Math.cos(t * 0.5 + p.ph) * 0.2);
      dummy.rotation.set(t * p.sp + p.r, t * 0.7 * p.sp + p.ph, p.r);
      dummy.scale.setScalar(p.s * 1.3);
      dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;
    embers.material.uniforms.uTime.value = t;
    const px = input.x * 0.35, py = input.y * 0.12;
    camera.position.set(S.stageX * 0.35 + px, S.camY + py + inE * 3.6, S.camZ + inE * 1.4);
    look.set(S.stageX * 0.55 + px * 0.3, S.lookY + inE * 1.5, 0);
    camera.lookAt(look);
  }

  ready = true;
  return { scene, camera, applyAspect, update, setPx(px) { embers.material.uniforms.uPx.value = px; } };
}
