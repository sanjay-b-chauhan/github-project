// Every sound is made in the browser: no files, no licences. Silent until the visitor turns it on.
// Music: a tanpura-like drone on C# with a slow pentatonic pluck on top. SFX: thread plucks, wood knocks, dings.
export function createAudio() {
  let ctx = null, master = null, droneGain = null, windGain = null, musicGain = null, on = false, melodyT = 0;
  const SA = 138.59;
  const PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2];

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.connect(master);
    // a short convolution tail so plucks sit in a room
    const verb = ctx.createConvolver(); const len = ctx.sampleRate * 2.4; const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    verb.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.32; verb.connect(wet); wet.connect(comp);
    musicGain = ctx.createGain(); musicGain.gain.value = 1; musicGain.connect(comp); musicGain.connect(verb);

    // no music: only small interaction sounds
  }
  function env(g, t0, a, peak, dcy) { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dcy); }
  function noiseBurst(dur) { const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate); const c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = b; return s; }
  function pluck(freq, vol = 0.3, bright = 3000) {
    const t = ctx.currentTime;
    const src = noiseBurst(0.03); const dl = ctx.createDelay(); dl.delayTime.value = 1 / freq;
    const fb = ctx.createGain(); fb.gain.value = 0.984; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = bright;
    const out = ctx.createGain(); out.gain.setValueAtTime(vol, t); out.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    src.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(out); out.connect(musicGain);
    src.start(t); setTimeout(() => { try { out.disconnect(); fb.disconnect(); } catch (e) { /* gone */ } }, 3200);
  }
  function tone(freq, type, peak, dcy, when = 0) { const t = ctx.currentTime + when; const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; const g = ctx.createGain(); env(g, t, 0.006, peak, dcy); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + dcy + 0.1); }
  function thump(freq, peak, dcy, bpF, noiseAmt) {
    const t = ctx.currentTime; tone(freq, 'sine', peak, dcy);
    const n = noiseBurst(0.12); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = bpF; bp.Q.value = 1.2; const g = ctx.createGain(); env(g, t, 0.002, noiseAmt, 0.12); n.connect(bp); bp.connect(g); g.connect(musicGain); n.start(t);
  }
  function swoosh(dur = 0.9, from = 300, to = 1600, vol = 0.07) {
    const t = ctx.currentTime; const n = noiseBurst(dur); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6); bp.frequency.exponentialRampToValueAtTime(from * 0.8, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.45); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(bp); bp.connect(g); g.connect(musicGain); n.start(t);
  }

  return {
    get on() { return on; },
    async toggle(v = !on) {
      init(); on = v;
      if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { /* blocked */ } }
      const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? 0.85 : 0, t + 0.7);
      return on;
    },
    // a slow pluck melody, roughly one note every few seconds
    tick() {},
    section() { if (on) swoosh(1.0, 260, 1300, 0.045); },
    thread() { if (on) pluck(SA * 4 * PENTA[Math.floor(Math.random() * 4)], 0.18, 3800); },
    knock() { if (on) thump(210, 0.14, 0.12, 900, 0.2); },
    land() { if (on) { thump(90, 0.22, 0.2, 400, 0.18); } },
    ding(k = 0) { if (!on) return; const f = [880, 1046.5, 1318.5][k % 3]; tone(f, 'sine', 0.12, 1.5); tone(f * 1.5, 'sine', 0.05, 1.2, 0.02); },
    tickUI() { if (on) tone(2400, 'sine', 0.03, 0.05); },
    open() { if (on) { swoosh(0.7, 500, 2600, 0.05); thump(160, 0.06, 0.12, 1800, 0.08); } },
    breeze() {},
    drone() {},
  };
}
