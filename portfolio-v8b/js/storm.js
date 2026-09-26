// Storm transition: a dark cloud front with red branching lightning on its crest
// rises through the loader and resolves to black. Raw WebGL2, no three.js needed.

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uP; uniform float uDown;
out vec4 o;
float h(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ v+=a*n(p); p=m*p; a*=.5; } return v; }
float ridge(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.7,1.1,-1.1,1.7); for(int i=0;i<5;i++){ v+=a*abs(n(p)*2.-1.); p=m*p; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  if (uDown > .5) uv.y = 1. - uv.y;
  float asp = uRes.x/uRes.y;
  vec2 p = vec2(uv.x*asp, uv.y);
  float t = uTime;
  // the storm front rises from below the screen to above it
  float front = mix(-0.38, 1.42, uP);
  float big = fbm(vec2(p.x*1.6 + t*.05, t*.18));
  float mid = fbm(vec2(p.x*4.5 - t*.12, t*.35));
  float edge = front + (big-.5)*.34 + (mid-.5)*.09;
  float d = uv.y - edge;                  // > 0 above the front, < 0 inside the storm
  // billowing cloud body
  vec2 q = vec2(p.x*2.4, p.y*2.8 - t*.55);
  float cl = fbm(q + fbm(q*1.3 + t*.12)*1.4);
  float body = smoothstep(.10, -.10, d + (cl-.5)*.16);
  float deep = smoothstep(-.02, -.42, d);
  vec3 cloud = mix(vec3(.26,.0,.0), vec3(.035,0.,0.), smoothstep(.25,.75,cl));
  cloud *= mix(1., .35, smoothstep(0.,-.18,d));
  vec3 col = mix(cloud, vec3(0.), deep);
  // smoke tendrils climbing ahead of the front
  float sm = fbm(vec2(p.x*3.2, p.y*3.6 - t*.8) + mid);
  float sm2 = fbm(vec2(p.x*1.8 + t*.1, p.y*2.2 - t*.45));
  float smoke = smoothstep(.42, 0., d) * (1.-body) * smoothstep(.38,.8,sm*.6 + sm2*.55);
  // main bolt riding the crest: a jagged glowing line
  float jag = (ridge(vec2(p.x*6.5, t*1.7))-.5)*.07 + (n(vec2(p.x*38., t*9.))-.5)*.012;
  float ld = abs(d + .035 + jag);
  float flick = .62 + .38*step(.38, n(vec2(t*11., 3.1)));
  float bolt = (.0022/(ld+.0016)) * flick;
  // secondary branches forking down into the cloud
  float b2 = abs(d + .11 + (ridge(vec2(p.x*9.+11., t*2.3))-.5)*.10);
  float br = (.0012/(b2+.0015)) * smoothstep(.55,.8, n(vec2(p.x*3.+t*.7, 5.)));
  float b3 = abs(d + .2 + (ridge(vec2(p.x*12.-7., t*2.9))-.5)*.12);
  float br3 = (.0008/(b3+.0016)) * smoothstep(.62,.86, n(vec2(p.x*2.2-t*.5, 9.)));
  float glow = bolt + br*.8 + br3*.6;
  // lightning lights up the cloud around it
  float lit = exp(-abs(d+.05)*6.5) * (1.-deep) * flick;
  // premultiplied output: cloud body + smoke darken, lightning adds light
  float aSmoke = smoke*.78*(1.-body);
  vec3 pm = col*body + vec3(.07,0.,0.)*aSmoke + vec3(.35,0.,0.)*aSmoke*exp(-abs(d)*10.)*flick;
  float a = clamp(body + aSmoke, 0., 1.);
  pm += vec3(.55,.0,.0)*lit*(.35+.65*cl);
  pm += vec3(1.,.07,.03)*glow;
  pm += vec3(1.,.55,.4)*pow(bolt*.5,2.)*.35;
  o = vec4(pm, a);
}`;

export function runStorm(canvas, { duration = 2100, down = false, onCover, onDone } = {}) {
  let gl;
  try { gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false }); } catch (e) { gl = null; }
  if (!gl) return false;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('storm shader', e); return false; }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime'), uP = gl.getUniformLocation(prog, 'uP');
  gl.uniform1f(gl.getUniformLocation(prog, 'uDown'), down ? 1 : 0);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const size = () => { canvas.width = Math.round(innerWidth * dpr * .75); canvas.height = Math.round(innerHeight * dpr * .75); gl.viewport(0, 0, canvas.width, canvas.height); };
  size();
  canvas.style.display = 'block';
  const t0 = performance.now();
  let covered = false, raf = 0;
  const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const frame = now => {
    const k = Math.min(1, (now - t0) / duration);
    const p = ease(k);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - t0) / 1000 + 3.7);
    gl.uniform1f(uP, p);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!covered && p > .9) { covered = true; onCover && onCover(); }
    if (k < 1) raf = requestAnimationFrame(frame);
    else { if (!covered) { covered = true; onCover && onCover(); } onDone && onDone(() => { cancelAnimationFrame(raf); const x = gl.getExtension('WEBGL_lose_context'); x && x.loseContext(); canvas.remove(); }); }
  };
  raf = requestAnimationFrame(frame);
  addEventListener('resize', size, { passive: true });
  return true;
}
