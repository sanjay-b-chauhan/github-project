/* =============================================================
   Volumetric background field. Raw WebGL2, no libraries.

   Light build. Nothing glows here. The volume behaves like ink
   and sunlight in warm paper: density removes light instead of
   adding it, and the structured lattice is a faint sienna rule
   pressed into the sheet. Same thesis, opposite physics.

   Budget: the field renders at roughly half resolution and 30fps.
   It is a background, nobody can see the difference, and it keeps
   the raymarch affordable on integrated graphics.
   ============================================================= */
(function () {
  "use strict";

  var canvas = document.getElementById("field");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ?debug keeps the drawing buffer so pixels can be read back and checked.
  // Off by default because preserving it costs memory bandwidth every frame.
  var DEBUG = location.search.indexOf("debug") !== -1;
  var gl = canvas.getContext("webgl2", {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: "low-power", preserveDrawingBuffer: DEBUG
  });

  // No WebGL2 available: the CSS gradient underneath is the fallback.
  if (!gl) { document.documentElement.classList.add("no-gl"); return; }

  var VERT = `#version 300 es
  precision highp float;
  const vec2 P[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));
  void main(){ gl_Position = vec4(P[gl_VertexID], 0., 1.); }`;

  var FRAG = `#version 300 es
  precision highp float;
  out vec4 O;

  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uMouse;   // -1..1, eased
  uniform float uMix;     // 0 organic .. 1 structured
  uniform int   uSteps;

  const vec3 PAPER  = vec3(0.937, 0.906, 0.855);  // warm beige sheet
  const vec3 SHADE  = vec3(0.400, 0.320, 0.235);  // the warm brown a shadow leaves
  const vec3 SIENNA = vec3(0.659, 0.251, 0.122);  // the one accent

  float hash31(vec3 p){
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise3(vec3 x){
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  // three octaves is enough for smoke. More just costs frames.
  float fbm3(vec3 p){
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++){ s += a * vnoise3(p); p *= 2.03; a *= 0.5; }
    return s;
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

    vec3 ro = vec3(uMouse * 0.22, -2.4);
    vec3 rd = normalize(vec3(uv, 1.35));

    float t = 0.55;
    float dens = 0.0;   // how much sheet the volume occupies
    float warm = 0.0;   // how much of that is the organic half

    for (int i = 0; i < 24; i++){
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      p.z += uTime * 0.045;

      float d = fbm3(p * 0.85);
      d = smoothstep(0.44, 0.80, d);

      // the organic half rises, the structured half settles
      float h = smoothstep(-0.55, 0.65, p.y + 0.18 * sin(uTime * 0.09));

      dens += d * 0.085;
      warm += d * h * 0.085;
      t += 0.17;
    }
    dens = clamp(dens, 0.0, 1.0);
    warm = clamp(warm, 0.0, 1.0);

    // start from the sheet and take light away
    vec3 col = PAPER - SHADE * dens * 0.50;

    // where the organic field is strongest the paper warms toward sienna
    col = mix(col, mix(col, SIENNA, 0.30), warm);

    // the lattice: pressed into the sheet, never floating on it
    vec2 g  = uv * 9.0 + vec2(0.0, uTime * 0.05);
    vec2 gd = abs(fract(g) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.055, min(gd.x, gd.y));
    col -= SIENNA * line * smoothstep(0.10, 0.75, dens) * 0.21 * uMix;

    // daylight falling where the cursor is. A lift, not a glow.
    float d0 = length(uv - uMouse * vec2(0.42, 0.26));
    col += vec3(0.055, 0.045, 0.030) * exp(-d0 * 2.7);

    col *= 1.0 - 0.085 * dot(uv, uv);                // the faintest vignette
    col += (hash31(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0;  // kill banding

    O = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { document.documentElement.classList.add("no-gl"); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    document.documentElement.classList.add("no-gl"); return;
  }
  gl.useProgram(prog);

  var U = {
    res:   gl.getUniformLocation(prog, "uRes"),
    time:  gl.getUniformLocation(prog, "uTime"),
    mouse: gl.getUniformLocation(prog, "uMouse"),
    mix:   gl.getUniformLocation(prog, "uMix"),
    steps: gl.getUniformLocation(prog, "uSteps")
  };

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var W = 0, H = 0;
  function resize() {
    // half resolution, hard capped. It is a soft field, not a photograph.
    var scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
    var w = Math.max(320, Math.min(Math.round(window.innerWidth  * scale), 1100));
    var h = Math.max(240, Math.min(Math.round(window.innerHeight * scale), 760));
    if (w === W && h === H) return false;
    W = w; H = h;
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.res, W, H);
    // march count follows the screen, so a phone never pays desktop cost
    gl.uniform1i(U.steps, window.innerWidth < 760 ? 10 : 16);
    return true;
  }
  resize();
  var t0 = performance.now();

  var mx = 0, my = 0, tx = 0, ty = 0;
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = 1 - (e.clientY / window.innerHeight) * 2;
    }, { passive: true });
  }

  // Scroll decides how much structure the field shows. Set by the page.
  var mixTarget = 0, mixNow = 0;
  window.__fieldMix = function (v) { mixTarget = Math.max(0, Math.min(1, v)); };

  function draw(time) {
    gl.uniform1f(U.time, time);
    gl.uniform2f(U.mouse, mx, my);
    gl.uniform1f(U.mix, mixNow);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (reduce) {
    // one composed frame, no loop, no motion
    mixNow = 0.35; mx = 0; my = 0;
    draw(12.0);
    window.addEventListener("resize", function () { resize(); draw(12.0); }, { passive: true });
    return;
  }

  // Paint once immediately. The loop may be throttled or slow to start, and
  // an empty canvas behind the hero is worse than a still frame.
  draw(0);
  window.addEventListener("resize", function () {
    if (resize()) draw((performance.now() - t0) / 1000);
  }, { passive: true });

  var last = 0, running = true;
  var FRAME = 1000 / 30; // 30fps is plenty for something this slow

  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;

    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    mixNow += (mixTarget - mixNow) * 0.05;

    resize();
    draw((now - t0) / 1000);
  }
  requestAnimationFrame(loop);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      if (!running) { running = true; last = 0; requestAnimationFrame(loop); }
    } else {
      running = false; // never burn a phone battery in a background tab
    }
  });
})();
