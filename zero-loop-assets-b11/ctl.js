/* Zero b11 prototype bar: under the app, apart from it. Best / mid / worst, play and step, the chapters, what is happening. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;
  var root;
  function chapters() {
    var b = J.beats(), out = [];
    b.forEach(function (x, i) { var last = out[out.length - 1]; if (!last || last.ch !== x.ch) out.push({ ch: x.ch, from: i, to: i }); else last.to = i; });
    return out;
  }
  function label(ch) {
    if (ch.ch.charAt(0) === 'j') return '<span class="ji">' + IC.bag + '</span><span class="nm">Jobs</span>';
    var sc = D.SC[D.ROAD[+ch.ch.slice(1) - 1]];
    return J.logo(sc.co, 20) + '<span class="nm">' + esc(J.coName(sc.co)) + '</span>';
  }
  function mount(el) {
    root = el;
    el.innerHTML = '<div class="ct-case" role="group" aria-label="Which case">' + ['best', 'mid', 'worst'].map(function (k) { return '<button data-case="' + k + '">' + esc(D.CASES[k].name.replace(' case', '')) + '</button>'; }).join('') + '</div>' +
      '<div class="ct-tr"><button data-t="prev" aria-label="Back one step">' + IC.prev + '</button><button data-t="play" aria-label="Pause"></button><button data-t="next" aria-label="Forward one step">' + IC.next + '</button></div>' +
      '<div class="ct-ch" role="group" aria-label="Chapters"></div>' +
      '<div class="ct-cap" aria-live="polite"></div>' +
      '<button class="ct-sp" data-t="speed">1x</button><a class="ct-doc" href="zero-loop-coach-b11.html" target="_blank" rel="noopener">How Navid works</a><span class="ct-v">b11</span>';
    $$('[data-case]', el).forEach(function (b) { b.addEventListener('click', function () { J.setCase(b.getAttribute('data-case')); }); });
    $('[data-t=prev]', el).addEventListener('click', function () { J.prev(); });
    $('[data-t=next]', el).addEventListener('click', function () { J.next(); });
    $('[data-t=play]', el).addEventListener('click', function () {
      if (J.P.paused && J.P.i === J.beats().length - 1) { J.P.paused = false; J.go(0, { cut: true }); return; }
      J.pause();
    });
    $('[data-t=speed]', el).addEventListener('click', function () { var v = J.P.speed === 1 ? 2 : J.P.speed === 2 ? 4 : 1; J.speed(v); this.textContent = v + 'x'; });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === ' ') { e.preventDefault(); J.pause(); } else if (e.key === 'ArrowRight') J.next(); else if (e.key === 'ArrowLeft') J.prev();
    });
  }
  function show(i, ended) {
    if (!root) return;
    var P = J.P, b = J.beats(), beat = b[i];
    $$('[data-case]', root).forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-case') === P.key); });
    var pb = $('[data-t=play]', root), end = ended || (P.paused && i === b.length - 1);
    pb.innerHTML = end ? IC.redo : P.paused ? IC.play : IC.pause;
    pb.setAttribute('aria-label', end ? 'Play again' : P.paused ? 'Play' : 'Pause');
    var chs = chapters();
    $('.ct-ch', root).innerHTML = chs.map(function (c) {
      var on = i >= c.from && i <= c.to, w = on ? ((i - c.from + 1) / (c.to - c.from + 1) * 100) : i > c.to ? 100 : 0;
      return '<button class="' + (on ? 'on' : i > c.to ? 'past' : '') + '" data-go="' + c.from + '">' + label(c) + '<i class="bar"><b style="--w:' + w + '%"></b></i></button>';
    }).join('');
    $$('[data-go]', root).forEach(function (x) { x.addEventListener('click', function () { J.P.paused = false; J.go(+x.getAttribute('data-go'), { cut: true }); }); });
    $('.ct-cap', root).innerHTML = '<span>' + (i + 1) + ' / ' + b.length + '</span>' + esc(beat.cap);
  }
  window.CT = { mount: mount, show: show };
})();
