import * as THREE from 'three';

// One GPU texture per screenshot, shared by the screening room, the ripple view and the
// day strip. Phones get 1024px copies. Textures are sRGB (hardware decode on sampling).
const cache = new Map();
let MAXW = 1800, ANISO = 4;

export function initTex(renderer, { mobile }) {
  MAXW = mobile ? 1024 : 1800;
  ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function meanLum(src) {
  try {
    const c = document.createElement('canvas'); c.width = 24; c.height = 15;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0, 24, 15);
    const d = x.getImageData(0, 0, 24, 15).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    return s / (d.length / 4);
  } catch (e) { return 0.5; }
}

export function getTex(src, maxW = MAXW) {
  const key = `${src}@${maxW}`;
  if (cache.has(key)) return cache.get(key);
  const tex = new THREE.Texture();
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = ANISO;
  tex.userData.keep = true;
  tex.userData.lum = 0.5;
  tex.userData.asp = 1.6;
  const entry = { tex, loaded: false };
  entry.ready = new Promise((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      let source = img;
      if (img.naturalWidth > maxW) {
        const c = document.createElement('canvas');
        c.width = maxW; c.height = Math.round(img.naturalHeight * (maxW / img.naturalWidth));
        const g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, 0, 0, c.width, c.height);
        source = c;
      }
      tex.image = source;
      tex.userData.asp = img.naturalWidth / img.naturalHeight;
      tex.userData.lum = meanLum(source);
      tex.needsUpdate = true;
      entry.loaded = true;
      res(tex);
    };
    img.onerror = () => { entry.loaded = false; res(null); };
    img.src = src;
  });
  cache.set(key, entry);
  return entry;
}
