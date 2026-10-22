/* b43: the Story way in. The whole scenario plays start to end by itself; the mouse does every click and Navid steps
   in where he does. The bar holds only what a viewer needs: play and pause, the chapters, speed, sound. In Explore the
   bar keeps the moments and gets the same switch at its left. */
(function () {
  'use strict';
  var J = window.J, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var CH = [['Start', ['home']], ['Kickoff', ['kickCard', 'kickVideo', 'kickSlides']], ['Check', ['understand']], ['Build', ['stage']],
    ['Talk', ['room', 'present', 'qa']], ['Feedback', ['report']], ['Level up', ['complete', 'review']], ['The job', ['home']]];
  function chapters() {
    var b = J.beats(), out = [], c = 0;
    b.forEach(function (x, i) {
      while (c < CH.length - 1 && CH[c][1].indexOf(x.screen) < 0 && CH[c + 1][1].indexOf(x.screen) >= 0) c++;
      if (i === b.length - 1 && x.screen === 'home') c = CH.length - 1;
      if (!out[c]) out[c] = { name: CH[c][0], from: i, to: i };
      out[c].to = i;
    });
    return out.filter(Boolean);
  }
  var SPK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.9a5.8 5.8 0 0 1 0 8.2"/></svg>';
  var MUTE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 6.2l3.4 3.6M14 6.2l-3.4 3.6"/></svg>';
  var PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.6 8z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 3.2h2.4v9.6H4.6zM9 3.2h2.4v9.6H9z" fill="currentColor"/></svg>';
  function modeSwitch(story) {
    var base = location.pathname.split('/').pop();
    return '<div class="ct-mode zs-seg" role="tablist" aria-label="How to see it"><a href="' + base + '"' + (story ? '' : ' class="on"') + '>Explore</a><a href="' + base + '?mode=story"' + (story ? ' class="on"' : '') + '>Story</a></div>';
  }
  window.CTMODE = modeSwitch;
  if (!J.P.story) return;
  var root, base = window.CT;
  function mount(el) {
    root = el; el.classList.add('ct-story');
    var app = document.getElementById('app'); if (app) app.classList.add('nv-entry-push');   /* the same push the Explore settings apply */
    var C = chapters();
    el.innerHTML = modeSwitch(true) + '<button class="st-play" aria-label="Pause"></button>' +
      '<div class="st-ch" role="group" aria-label="Chapters">' + C.map(function (c, k) { return '<button data-c="' + k + '" style="flex:' + (c.to - c.from + 1) + '"><i><b></b></i><span>' + esc(c.name) + '</span></button>'; }).join('') + '</div>' +
      '<div class="st-spd" role="group" aria-label="Speed">' + [1, 1.5, 2].map(function (v) { return '<button data-sp="' + v + '">' + v + 'x</button>'; }).join('') + '</div>' +
      '<button class="ct-snd" aria-label="Sound"></button><a class="ct-doc" href="zero-loop-coach-b47.html" target="_blank" rel="noopener">The spec</a><span class="ct-v">b47</span>';
    $('.st-play', el).addEventListener('click', function () {
      var b = J.beats();
      if (J.P.paused && J.P.i === b.length - 1) { J.P.paused = false; J.go(0, { cut: true }); return; }
      J.pause();
    });
    $$('[data-c]', el).forEach(function (b) { b.addEventListener('click', function () { var c = C[+b.getAttribute('data-c')]; J.P.paused = false; J.go(c.from, { cut: true }); }); });
    $$('[data-sp]', el).forEach(function (b) { b.addEventListener('click', function () { J.speed(+b.getAttribute('data-sp')); show(J.P.i); }); });
    $('.ct-snd', el).addEventListener('click', function () { if (window.NV) NV.setSound(!NV.sound); show(J.P.i); });
    document.addEventListener('keydown', function (e) { if (e.key === ' ' && !(e.target.closest && e.target.closest('input,textarea'))) { e.preventDefault(); $('.st-play', el).click(); } });
    /* the fill moves on its own between beats, so the bar never looks stuck */
    var t0 = performance.now(), lastI = -1;
    (function tick() {
      if (J.P.i !== lastI) { lastI = J.P.i; t0 = performance.now(); }
      var into = J.P.paused ? 0 : Math.min(.92, (performance.now() - t0) / 9000 * J.P.speed);
      C.forEach(function (c, k) {
        var seg = $$('[data-c]', el)[k], f = J.P.i > c.to ? 1 : J.P.i < c.from ? 0 : (J.P.i - c.from + into) / (c.to - c.from + 1);
        seg.querySelector('b').style.width = (f * 100).toFixed(1) + '%'; seg.classList.toggle('on', J.P.i >= c.from && J.P.i <= c.to);
      });
      requestAnimationFrame(tick);
    })();
    show(J.P.i);
  }
  function show(i, ended) {
    if (!root) return;
    var P = J.P, end = ended || (P.paused && i === J.beats().length - 1), pb = $('.st-play', root);
    pb.innerHTML = end ? IC.redo || PLAY : P.paused ? PLAY : PAUSE; pb.setAttribute('aria-label', end ? 'Play again' : P.paused ? 'Play' : 'Pause');
    $$('[data-sp]', root).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-sp') === P.speed); });
    var snd = $('.ct-snd', root), on1 = !window.NV || NV.sound; snd.innerHTML = on1 ? SPK : MUTE; snd.classList.toggle('off', !on1);
  }
  function noop() {}
  window.CT = { mount: mount, show: show, moments: function () { return []; }, jump: noop, at: noop, done: noop, prog: noop, turn: noop };
})();
