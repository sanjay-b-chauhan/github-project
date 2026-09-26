import * as THREE from 'three';

// smoothed pointer (-1..1), written by main.js, read by every set for a little parallax
export const pointer = { x: 0, y: 0 };

// Camera track: Catmull-Rom through keyed positions/targets, parameterised by scroll progress.
export function makeTrack(keys) {
  const P = keys.map((k) => new THREE.Vector3(...k.pos));
  const L = keys.map((k) => new THREE.Vector3(...k.look));
  const n = keys.length;
  const cr = (a, b, c, d, t, out) => {
    const t2 = t * t, t3 = t2 * t;
    const f = (A, B, C, D) => 0.5 * (2 * B + (-A + C) * t + (2 * A - 5 * B + 4 * C - D) * t2 + (-A + 3 * B - 3 * C + D) * t3);
    return out.set(f(a.x, b.x, c.x, d.x), f(a.y, b.y, c.y, d.y), f(a.z, b.z, c.z, d.z));
  };
  const sample = (arr, p, out) => {
    if (p <= keys[0].p) return out.copy(arr[0]);
    if (p >= keys[n - 1].p) return out.copy(arr[n - 1]);
    let i = 0;
    while (i < n - 2 && p > keys[i + 1].p) i++;
    const t = (p - keys[i].p) / (keys[i + 1].p - keys[i].p);
    return cr(arr[Math.max(0, i - 1)], arr[i], arr[i + 1], arr[Math.min(n - 1, i + 2)], t, out);
  };
  return {
    keys,
    at(p, outPos, outLook) { sample(P, p, outPos); sample(L, p, outLook); },
    setKey(i, pos, look) { P[i].set(...pos); L[i].set(...look); },
  };
}
