/* b32: the rank simulator. Keep adding XP and watch your rank move the way it does in the app: the bar in the pill
   fills, a new rank lands with its badge and what it opens, and the rank panel follows. It lives on the prototype bar,
   apart from the app, and it remembers where you left it. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, n = J.n, CF = window.CFG || {};
  var MAX = 10000, box, btn, tok = 0, from = 0;
  function st() { return J.P.st; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* the simulator is an offset on top of the flow, so moving through the moments keeps it */
  function set(p) { var s = st(), d = p - s.pts; s.pts = p; CF.sim = (+CF.sim || 0) + d; if (CF.save) CF.save(); }
  function grow() {
    var i = $('.dk .seg.lv .mini i'); if (!i) return;
    var w = i.style.width; i.style.width = '0%'; void i.offsetWidth; i.style.width = w;
  }
  function landed(L, was) {
    DK.update(st(), { from: was });
    grow();
    DK.rankUp(L);
  }
  async function add(d) {
    var my = ++tok, s = st(), was = D.levelOf(s.pts), to = Math.max(0, Math.min(MAX, s.pts + d)), L = D.levelOf(to);
    if (L > was) {
      /* the bar fills to the top of this rank first, then the new rank lands */
      set(D.startOf(was + 1) - 1); DK.patch(); read();
      await wait(950);
      if (my !== tok) return;
      set(to); landed(L, was);
    } else { set(to); DK.patch(); }
    read();
  }
  function read() {
    if (!box) return;
    var p = st().pts, L = D.levelOf(p), top = L >= 10;
    $('.sm-hd', box).innerHTML = DK.rb(L) + '<div><b>Rank ' + L + '</b><span>' + n(p) + ' XP' + (top ? ' · Top rank' : ' · ' + n(D.startOf(L + 1) - p) + ' to Rank ' + (L + 1)) + '</span></div>';
    var r = $('.sm-rg', box); if (+r.value !== p) r.value = p;
    r.style.setProperty('--v', (p / MAX * 100) + '%');
    $$('.sm-tk span', box).forEach(function (x) { x.classList.toggle('on', +x.textContent <= L); });
    var o = $('[data-sm=open]', box); if (o) o.textContent = DK.S.tab === 'level' ? 'Close the rank panel' : 'Open the rank panel';
  }
  function show(on) {
    if (!box) return;
    box.classList.toggle('on', on); btn.classList.toggle('on', on); btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { var g = $('.ct-set.on'); if (g) { g.classList.remove('on'); var gb = $('.ct-gear'); if (gb) gb.classList.remove('on'); } read(); }
  }
  function mount(el) {
    btn = $('.ct-xp', el); if (!btn) return;
    box = document.createElement('div'); box.className = 'ct-sim'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Rank simulator');
    var ticks = ''; for (var k = 1; k <= 10; k++) ticks += '<span style="left:' + ((k - 1) * 1000 / MAX * 100) + '%">' + k + '</span>';
    var bands = (D.BANDS || []).filter(function (b) { return b.pts > 0; });
    box.innerHTML = '<div class="zs-h"><b>Rank simulator</b></div>' +
      '<div class="sm-hd"></div>' +
      '<div class="sm-tr"><input class="sm-rg" type="range" min="0" max="' + MAX + '" step="10" aria-label="Total XP"><div class="sm-tk">' + ticks + '</div></div>' +
      '<div class="zs-g"><h6>Add XP</h6><div class="sm-row">' + [100, 250, 1000].map(function (v) { return '<button data-add="' + v + '">+' + n(v) + '</button>'; }).join('') + '<button data-add="next">Next rank</button></div></div>' +
      '<div class="zs-g"><h6>Finish a scenario</h6><div class="sm-row sm-gr">' + bands.map(function (b) { return '<button data-add="' + b.pts + '"><b>' + esc(b.short) + '</b><span>+' + n(b.pts) + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="sm-ft"><button data-sm="reset">Reset</button><button data-sm="open">Open the rank panel</button></div>';
    el.appendChild(box);
    btn.addEventListener('click', function (e) { e.stopPropagation(); show(!box.classList.contains('on')); });
    box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.ct-sim,.ct-xp,.dk')) show(false); });
    $$('[data-add]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-add'), p = st().pts;
        add(v === 'next' ? (D.levelOf(p) >= 10 ? MAX - p : D.startOf(D.levelOf(p) + 1) - p) : +v);
      });
    });
    var r = $('.sm-rg', box);
    r.addEventListener('pointerdown', function () { from = D.levelOf(st().pts); });
    r.addEventListener('input', function () { ++tok; set(+r.value); DK.patch(); read(); });
    r.addEventListener('change', function () { var L = D.levelOf(st().pts); if (L > from) landed(L, from); from = L; read(); });
    $('[data-sm=reset]', box).addEventListener('click', function () { ++tok; set(st().pts - (+CF.sim || 0)); DK.patch(); read(); });
    $('[data-sm=open]', box).addEventListener('click', function () { if (DK.S.tab === 'level') DK.close(); else DK.open('level'); setTimeout(read, 30); });
    read();
  }
  window.SIM = { mount: mount, show: show, add: add, read: read };
})();
