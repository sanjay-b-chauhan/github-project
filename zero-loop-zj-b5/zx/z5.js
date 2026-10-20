/* Lead Rush b5: real logos, the icons-only cluster, Enter goes to the kickoff, back keys go back,
   and the five screens live in settings (the gear, Control+D, or the arrow keys). */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cluster = function (dark) {
    return '<div class="z5-cl' + (dark ? ' z5-ondark' : '') + '">' +
      '<button class="z5-ic" type="button" data-set aria-label="Settings"><i data-lucide="settings"></i></button>' +
      '<button class="z5-ic" type="button" aria-label="Sound"><i data-lucide="volume-2"></i></button>' +
      '<button class="z5-rank" type="button" aria-label="Rank 1, 470 of 1,000 skill points"><img src="zx/badge/b1.webp" alt=""><span class="z5-rb"><i style="width:47%"></i></span></button>' +
      '<button class="z5-nv" type="button" aria-label="Navid, your coach"><img src="zx/coach/navid.jpg" alt=""></button></div>';
  };
  $$('[data-cl]').forEach(function (h) { h.outerHTML = cluster(h.dataset.cl === 'dark'); });
  $$('[data-logo]').forEach(function (h) { h.outerHTML = zj.logoMark(); });
  $$('[data-lg]').forEach(function (e) { e.outerHTML = zj.logo(e.dataset.lg, e.dataset.s || ''); });
  zj.icons();

  var N = 5, cur = 1, NAMES = ['Home', 'Kickoff', 'Understanding check', 'Routing plan', 'Presenting'];
  function closeSet() { var o = document.getElementById('set'); if (o) o.remove(); }
  function openSet() {
    closeSet();
    var scr = document.querySelector('.z5-scr.z5-on'), o = document.createElement('div');
    o.id = 'set'; o.className = 'z5-set'; o.setAttribute('role', 'menu');
    o.innerHTML = '<span class="z5-lab">Screens</span>' + NAMES.map(function (n, i) { return '<button type="button" role="menuitem" data-pick="' + (i + 1) + '"><em>' + (i + 1) + '</em>' + n + (i + 1 === cur ? '<i data-lucide="check"></i>' : '') + '</button>'; }).join('') +
      '<div class="z5-sk"><span>Lead Rush</span><span>Build b5</span></div>';
    scr.appendChild(o); zj.icons(o);
  }
  function show(n) {
    closeSet();
    cur = Math.min(N, Math.max(1, n));
    $$('.z5-scr').forEach(function (s) {
      var on = +s.dataset.s === cur;
      s.classList.toggle('z5-on', on);
      s.classList.remove('z5-play'); if (on) { void s.offsetWidth; s.classList.add('z5-play'); }
    });
    document.body.classList.toggle('z5-bd', cur === 1 || cur === 4);
    if (location.hash !== '#' + cur) history.replaceState(null, '', '#' + cur);
    var m = document.querySelector('.z5-scr.z5-on #msgs'); if (m) m.scrollTop = m.scrollHeight;
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]'); if (p) { show(+p.dataset.pick); return; }
    var g = e.target.closest('[data-go]'); if (g) { show(+g.dataset.go); return; }
    if (e.target.closest('[data-set]')) { if (document.getElementById('set')) closeSet(); else openSet(); return; }
    if (!e.target.closest('#set')) closeSet();
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'Escape') closeSet();
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); if (document.getElementById('set')) closeSet(); else openSet(); }
  });

  /* the same layout, a touch bigger on a big screen */
  function fit() {
    var w = innerWidth, h = innerHeight, z = w <= 900 ? 1 : Math.min(1.35, Math.max(1, Math.min(w / 1440, h / 860)));
    document.documentElement.style.zoom = z; document.documentElement.style.setProperty('--z', z);
  }
  addEventListener('resize', fit); fit();
  show(+(location.hash || '#1').slice(1) || 1);
})();
