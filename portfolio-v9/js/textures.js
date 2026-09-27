import * as THREE from 'three';
import { canvas2d, mulberry, speckle, svgImage } from './util.js';

const tex = (c, srgb = true, repeat) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
};

// square wall panels with seams; returns a colour map and a bump map
export function panelTextures({ size = 1024, n = 2, base = [40, 40, 40], vary = 6, seam = 10, seamW = 10, seed = 3, repeat = [1, 1] } = {}) {
  const [c, g] = canvas2d(size, size);
  const [cb, gb] = canvas2d(size, size);
  const r = mulberry(seed);
  const cell = size / n;
  g.fillStyle = `rgb(${seam},${seam},${seam})`; g.fillRect(0, 0, size, size);
  gb.fillStyle = '#000'; gb.fillRect(0, 0, size, size);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = (r() - 0.5) * vary;
    const x = i * cell + seamW / 2, y = j * cell + seamW / 2, w = cell - seamW, h = cell - seamW;
    const grd = g.createLinearGradient(x, y, x + w, y + h);
    grd.addColorStop(0, `rgb(${base[0] + v + 5},${base[1] + v + 5},${base[2] + v + 5})`);
    grd.addColorStop(1, `rgb(${base[0] + v - 4},${base[1] + v - 4},${base[2] + v - 4})`);
    g.fillStyle = grd; g.fillRect(x, y, w, h);
    // bevel light / shadow
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, y, w, 3); g.fillRect(x, y, 3, h);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + h - 3, w, 3); g.fillRect(x + w - 3, y, 3, h);
    const gg = gb.createLinearGradient(x, y, x, y + h);
    gg.addColorStop(0, '#d8d8d8'); gg.addColorStop(0.08, '#ffffff'); gg.addColorStop(0.92, '#ffffff'); gg.addColorStop(1, '#bcbcbc');
    gb.fillStyle = gg; gb.fillRect(x, y, w, h);
  }
  speckle(g, size, size, 0.05, seed + 1);
  return { map: tex(c, true, repeat), bump: tex(cb, false, repeat) };
}

// radial slats for the projector platform
export function radialTexture(size = 1024, rays = 96) {
  const [c, g] = canvas2d(size, size);
  g.fillStyle = '#161616'; g.fillRect(0, 0, size, size);
  g.translate(size / 2, size / 2);
  for (let i = 0; i < rays; i++) {
    g.rotate((Math.PI * 2) / rays);
    g.fillStyle = i % 2 ? '#0b0b0b' : '#1d1d1d';
    g.fillRect(size * 0.2, -3, size * 0.3, 6);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.strokeStyle = '#0a0a0a'; g.lineWidth = 8;
  for (const rr of [0.2, 0.35, 0.49]) { g.beginPath(); g.arc(size / 2, size / 2, size * rr, 0, Math.PI * 2); g.stroke(); }
  speckle(g, size, size, 0.05, 9);
  return tex(c);
}

// LED ring text: one pass of the text around the full circumference, in Telgra
export function ledTexture(text, font = 'Telgra') {
  const W = 2048, H = 64;
  const [c, g] = canvas2d(W, H);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  g.textBaseline = 'middle';
  g.font = `400 40px ${font}, sans-serif`;
  // spread the characters evenly around the ring (Telgra has no middle dot, so draw one)
  const chars = [...text];
  const step = W / chars.length;
  chars.forEach((ch, i) => {
    if (ch === '·') { g.beginPath(); g.arc(i * step + step / 2, H / 2 + 1, 5, 0, Math.PI * 2); g.fill(); return; }
    const w = g.measureText(ch).width;
    const sx = Math.min(1, (step * 0.94) / Math.max(1, w));
    g.save(); g.translate(i * step + step / 2, H / 2 + 2); g.scale(sx, 1.28); g.fillText(ch, -w / 2, 0); g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return t;
}

export function blobTexture(size = 256, soft = 0.5) {
  const [c, g] = canvas2d(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)');
  grd.addColorStop(soft, 'rgba(0,0,0,0.45)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  return t;
}

// luminous ceiling: warm panels with thin seams and a few long diagonals
export function ceilingTexture(size = 1024) {
  const [c, g] = canvas2d(size, size);
  const grd = g.createLinearGradient(0, 0, size, size);
  grd.addColorStop(0, '#f6f2e6'); grd.addColorStop(1, '#ece6d6');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  g.strokeStyle = 'rgba(90,86,78,0.55)'; g.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { const v = (i * size) / 4; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, size); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(size, v); g.stroke(); }
  g.strokeStyle = 'rgba(90,86,78,0.35)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(size, size); g.stroke();
  g.beginPath(); g.moveTo(size, 0); g.lineTo(0, size); g.stroke();
  speckle(g, size, size, 0.035, 4);
  return tex(c, true, [1, 1]);
}

// posters for the lounge: Experience (red, SC), About (cream, sunburst), Before ZERO (black, globe)
export async function posterTexture(kind) {
  const W = 800, H = 1540;
  const [c, g] = canvas2d(W, H);
  const cfg = {
    experience: { bg: ['#ff1a0d', '#e00000', '#a30000'], ink: '#FFFDE2', mark: 'assets/sc.svg', mw: 0.62, title: 'Experience', idx: '01', note: '2020 to now' },
    about: { bg: ['#fffde2', '#f6f0cf', '#e7ddb6'], ink: '#1E1E1E', mark: 'assets/sunburst.svg', markColor: '#FF0101', mw: 0.56, title: 'About', idx: '02', note: 'Mumbai, IN' },
    before: { bg: ['#2a2a2a', '#141414', '#0b0b0b'], ink: '#FFFDE2', mark: 'assets/globe.svg', markColor: '#FF0101', mw: 0.66, title: 'Before ZERO', idx: '03', note: 'Clients' },
  }[kind];
  const grd = g.createLinearGradient(0, 0, W * 0.3, H);
  grd.addColorStop(0, cfg.bg[0]); grd.addColorStop(0.55, cfg.bg[1]); grd.addColorStop(1, cfg.bg[2]);
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // soft light pool behind the mark
  const rg = g.createRadialGradient(W / 2, H * 0.52, 0, W / 2, H * 0.52, W * 0.75);
  rg.addColorStop(0, kind === 'about' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.10)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const mark = await svgImage(cfg.mark, cfg.markColor || cfg.ink, Math.round(W * cfg.mw));
  g.drawImage(mark.img, (W - mark.w) / 2, H * 0.52 - mark.h / 2, mark.w, mark.h);
  g.fillStyle = cfg.ink;
  g.textBaseline = 'alphabetic';
  let fs = 108;
  g.font = `400 ${fs}px "Instrument Serif", Georgia, serif`;
  while (g.measureText(cfg.title).width > W - 110 && fs > 60) { fs -= 4; g.font = `400 ${fs}px "Instrument Serif", Georgia, serif`; }
  g.fillText(cfg.title, 54, 166);
  g.font = '400 24px Telgra, sans-serif';
  g.globalAlpha = 0.8;
  g.fillText(cfg.idx, 58, H - 64);
  const note = cfg.note.toUpperCase();
  const nw = g.measureText(note).width;
  g.fillText(note, W - 58 - nw, H - 64);
  g.globalAlpha = 1;
  speckle(g, W, H, 0.07, kind.length);
  const t = tex(c);
  return t;
}

// the sunburst as an alpha mask for the rising sun
export async function sunburstMask() {
  const m = await svgImage('assets/sunburst.svg', '#ffffff', 1024);
  const pad = 40;
  const [c, g] = canvas2d(m.w + pad * 2, m.h + pad * 2);
  g.drawImage(m.img, pad, pad, m.w, m.h);
  const t = new THREE.CanvasTexture(c);
  return { tex: t, aspect: c.width / c.height };
}
