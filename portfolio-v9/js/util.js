// Small helpers shared by every scene.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
// visibility window: 0 before a, ramps to 1 by b, holds to c, back to 0 by d
export function win(p, a, b, c, d) {
  if (p <= a || p >= d) return 0;
  if (p < b) return smooth(a, b, p);
  if (p <= c) return 1;
  return 1 - smooth(c, d, p);
}

// --- 2D simplex noise (after Gustavson, public domain) ---
export function makeNoise2D(seed = 1) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const G = [1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1];
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  return function (xin, yin) {
    const s2 = (xin + yin) * F2;
    const i = Math.floor(xin + s2), j = Math.floor(yin + s2);
    const t = (i + j) * G2;
    const x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0, tt, g;
    tt = 0.5 - x0 * x0 - y0 * y0; if (tt > 0) { g = (perm[ii + perm[jj]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x0 + G[g + 1] * y0); }
    tt = 0.5 - x1 * x1 - y1 * y1; if (tt > 0) { g = (perm[ii + i1 + perm[jj + j1]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x1 + G[g + 1] * y1); }
    tt = 0.5 - x2 * x2 - y2 * y2; if (tt > 0) { g = (perm[ii + 1 + perm[jj + 1]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x2 + G[g + 1] * y2); }
    return 70 * n; // ~[-1,1]
  };
}

export function mulberry(seed = 7) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// --- SVG helpers ---
const svgCache = new Map();
export async function loadSVGText(url) {
  if (!svgCache.has(url)) svgCache.set(url, fetch(url).then((r) => r.text()));
  return svgCache.get(url);
}
// rasterize an SVG (fill=currentColor) into an Image in a given colour
export async function svgImage(url, color, width) {
  let txt = await loadSVGText(url);
  txt = txt.replace(/currentColor/g, color);
  const vb = /viewBox="([^"]+)"/.exec(txt)[1].split(/[\s,]+/).map(Number);
  const h = Math.round((width * vb[3]) / vb[2]);
  txt = txt.replace('<svg ', `<svg width="${width}" height="${h}" `);
  const blob = new Blob([txt], { type: 'image/svg+xml' });
  const u = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = 'async';
  img.src = u;
  await img.decode();
  URL.revokeObjectURL(u);
  return { img, w: width, h, aspect: vb[2] / vb[3] };
}

export function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// film grain speckle on a 2D canvas
export function speckle(ctx, w, h, amt = 0.06, seed = 3) {
  const r = mulberry(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 255 * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// CSS matrix3d that maps a W x H element onto the quad p0 (tl), p1 (tr), p2 (br), p3 (bl)
export function quadMatrix(W, H, p0, p1, p2, p3) {
  const x0 = p0[0], y0 = p0[1], x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], x3 = p3[0], y3 = p3[1];
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, h;
  const den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) < 1e-9) return null;
  g = (dx3 * dy2 - dx2 * dy3) / den;
  h = (dx1 * dy3 - dx3 * dy1) / den;
  a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0;
  d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
  // unit square -> quad, pre-scaled by the element size
  const m = [a / W, d / W, 0, g / W, b / H, e / H, 0, h / H, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-12 ? 0 : v.toFixed(9))).join(',')})`;
}

// text scramble (visual only; screen readers get the final text elsewhere)
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?';
export function scramble(el, text, dur = 700) {
  if (!el) return;
  cancelAnimationFrame(el._scr || 0);
  const reduce = document.documentElement.classList.contains('reduced');
  if (reduce) { el.textContent = text; return; }
  const t0 = performance.now();
  const tick = (now) => {
    const k = clamp((now - t0) / dur);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const at = (i / Math.max(1, text.length)) * 0.65 + 0.3;
      if (ch === ' ' || k >= at) out += ch;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) el._scr = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._scr = requestAnimationFrame(tick);
}

export function hexToVec(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
