/* b32: the rank simulator. Keep adding XP and watch your rank move the way it does in the app: the bar in the pill
   fills, a new rank lands with its badge and what it opens, and the rank panel follows.
   b34: a second tab for the coach's stats. Push any stat from Developing to Exceptional and the coach panel follows,
   cell by cell, with the points that fit that band. It lives on the prototype bar, apart from the app, and it
   remembers where you left it. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, n = J.n, CF = window.CFG || {};
  var MAX = 10000, box, btn, tok = 0, from = 0;
  function st() { return J.P.st; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* ---------- rank ---------- */
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
  /* ---------- stats ---------- */
  function stats() { return CF.stats && CF.stats.length === DK.STATS.length ? CF.stats : null; }
  /* where the coach has you now (his read after the first stage when the scenario has not got there yet) */
  function live() { var k = Math.max(1, DK.cstate()); return DK.STATS.map(function (x, i) { return DK.statVal(i, k); }); }
  var ALL = { Developing: 30, Good: 50, Great: 70, Exceptional: 92 };
  function setStats(a) { CF.stats = a; if (CF.save) CF.save(); DK.patchStats(); readStats(); }
  function readStats() {
    if (!box) return;
    var a = stats() || live();
    $$('.sm-st', box).forEach(function (r, i) {
      var v = a[i], b = DK.band(v), rg = $('input', r);
      if (+rg.value !== v) rg.value = v;
      rg.style.setProperty('--v', v + '%'); rg.style.setProperty('--bc', 'rgb(' + b.c.join(',') + ')');
      var w = $('.sm-sw', r); w.textContent = b.w; w.style.color = 'rgb(' + b.c.map(function (q) { return Math.round(q + (255 - q) * .25); }).join(',') + ')';
    });
    $('[data-sm=real]', box).disabled = !stats();
  }
  /* ---------- the sheet ---------- */
  function read() {
    if (!box) return;
    var p = st().pts, L = D.levelOf(p), top = L >= 10;
    $('.sm-hd', box).innerHTML = DK.rb(L) + '<div><b>Level ' + L + '</b><span>' + n(p) + ' XP' + (top ? ' · Top level' : ' · ' + n(D.startOf(L + 1) - p) + ' to Level ' + (L + 1)) + '</span></div>';
    var r = $('.sm-rg', box); if (+r.value !== p) r.value = p;
    r.style.setProperty('--v', (p / MAX * 100) + '%');
    $$('.sm-tk span', box).forEach(function (x) { x.classList.toggle('on', +x.textContent <= L); });
    $$('[data-sm=open]', box).forEach(function (o) { var t = o.getAttribute('data-t'); o.textContent = (DK.S.tab === t ? 'Close the ' : 'Open the ') + (t === 'level' ? 'level' : 'coach') + ' panel'; });
  }
  function tab(t) {
    CF.simTab = t; if (CF.save) CF.save();
    $$('.sm-tab button', box).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-p') === t); });
    $$('.sm-p', box).forEach(function (p) { p.hidden = p.getAttribute('data-p') !== t; });
    if (t === 'stats') readStats(); else read();
  }
  function show(on) {
    if (!box) return;
    box.classList.toggle('on', on); btn.classList.toggle('on', on); btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { var g = $('.ct-set.on'); if (g) { g.classList.remove('on'); var gb = $('.ct-gear'); if (gb) gb.classList.remove('on'); } read(); readStats(); }
  }
  function mount(el) {
    btn = $('.ct-xp', el); if (!btn) return;
    box = document.createElement('div'); box.className = 'ct-sim'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Simulator');
    var ticks = ''; for (var k = 1; k <= 10; k++) ticks += '<span style="left:' + ((k - 1) * 1000 / MAX * 100) + '%">' + k + '</span>';
    var bands = (D.BANDS || []).filter(function (b) { return b.pts > 0; });
    box.innerHTML = '<div class="sm-top"><b>Simulator</b><div class="sm-tab zs-seg"><button data-p="rank">Level</button><button data-p="stats">Stats</button></div></div>' +
      '<div class="sm-p" data-p="rank">' +
        '<div class="sm-hd"></div>' +
        '<div class="sm-tr"><input class="sm-rg" type="range" min="0" max="' + MAX + '" step="10" aria-label="Total XP"><div class="sm-tk">' + ticks + '</div></div>' +
        '<div class="zs-g"><h6>Add XP</h6><div class="sm-row">' + [100, 250, 1000].map(function (v) { return '<button data-add="' + v + '">+' + n(v) + '</button>'; }).join('') + '<button data-add="next">Next level</button></div></div>' +
        '<div class="zs-g"><h6>Finish a scenario</h6><div class="sm-row sm-gr">' + bands.map(function (b) { return '<button data-add="' + b.pts + '"><b>' + esc(b.short) + '</b><span>+' + n(b.pts) + '</span></button>'; }).join('') + '</div></div>' +
        '<div class="sm-ft"><button data-sm="reset">Reset</button><button data-sm="open" data-t="level">Open the level panel</button></div>' +
      '</div>' +
      '<div class="sm-p" data-p="stats" hidden>' +
        '<div class="sm-sts">' + DK.STATS.map(function (x, i) {
          return '<label class="sm-st"><span class="sm-sn">' + esc(x.n) + '</span><em class="sm-sw"></em>' +
            '<input type="range" min="0" max="100" step="1" data-i="' + i + '" aria-label="' + esc(x.n) + '"></label>';
        }).join('') + '</div>' +
        '<div class="zs-g"><h6>Set every stat to</h6><div class="sm-row sm-bd">' + DK.SCALE.map(function (b) {
          return '<button data-all="' + ALL[b.w] + '"><i style="background:rgb(' + b.c.join(',') + ')"></i>' + esc(b.w) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="sm-ft"><button data-sm="real">The real read</button><button data-sm="open" data-t="coach">Open the coach panel</button></div>' +
      '</div>';
    el.appendChild(box);
    btn.addEventListener('click', function (e) { e.stopPropagation(); show(!box.classList.contains('on')); });
    box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.ct-sim,.ct-xp,.dk')) show(false); });
    $$('.sm-tab button', box).forEach(function (b) { b.addEventListener('click', function () { tab(b.getAttribute('data-p')); }); });
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
    /* stats: drag one, or set all six to a band; the real read is the founder's numbers again */
    $$('.sm-st input', box).forEach(function (rg) {
      rg.addEventListener('input', function () { var a = (stats() || live()).slice(); a[+rg.getAttribute('data-i')] = +rg.value; setStats(a); });
    });
    $$('[data-all]', box).forEach(function (b) { b.addEventListener('click', function () { var v = +b.getAttribute('data-all'); setStats(DK.STATS.map(function () { return v; })); }); });
    $('[data-sm=real]', box).addEventListener('click', function () { CF.stats = null; if (CF.save) CF.save(); DK.render(false); readStats(); });
    $$('[data-sm=open]', box).forEach(function (o) {
      o.addEventListener('click', function () {
        var t = o.getAttribute('data-t');
        if (t === 'coach' && !stats() && DK.cstate() < 1) { CF.stats = live(); if (CF.save) CF.save(); readStats(); }   /* from here you came to see the stats, so show them */
        if (DK.S.tab === t) DK.close(); else DK.open(t); setTimeout(read, 30);
      });
    });
    tab(CF.simTab === 'stats' ? 'stats' : 'rank');
  }
  window.SIM = { mount: mount, show: show, add: add, read: read };
})();
