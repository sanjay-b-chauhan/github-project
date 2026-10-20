/* Lead Rush b4: the portal's top bar on every screen, real logos, and a settings menu that picks a screen. */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var top = function (home) {
    return '<div class="zj-top-l">' + zj.logoMark() + '<span class="z3-bld">b4</span><div class="zj-mode"><button type="button" class="zj-on">Learn</button><button type="button">Jobs</button></div></div>' +
      (home ? '<span></span>' : '<div class="z3-crumb"><span data-lg="hubspot.com"></span>Inbound lead router at HubSpot</div>') +
      '<div class="zj-top-r"><button class="zj-round" type="button" data-set aria-label="Settings"><i data-lucide="settings"></i></button><button class="zj-round" type="button" aria-label="Sound"><i data-lucide="volume-2"></i></button>' +
      '<button class="zj-level" type="button"><span class="zj-level-t"><i data-lucide="award"></i><span>Rank 1</span><span class="zj-level-bar"><i style="width:16px"></i></span></span></button>' +
      '<button class="z3-coach" type="button"><img src="zx/coach/navid.jpg" alt=""><span>Coach</span></button>' +
      '<button class="zj-who" type="button"><span>Sanjay</span><span class="zj-av"><img src="zx/img/sanjay.jpg" alt=""></span></button></div>';
  };
  $$('[data-top]').forEach(function (h) { h.innerHTML = top(h.dataset.top === 'home'); });
  $$('[data-lg]').forEach(function (e) { e.outerHTML = zj.logo(e.dataset.lg, e.dataset.s || ''); });
  zj.icons();

  var N = 5, cur = 1, NAMES = ['Home', 'Kickoff', 'Understanding check', 'Routing plan', 'Presenting'];
  function closeSet() { var o = document.getElementById('set'); if (o) o.remove(); }
  function openSet() {
    closeSet();
    var sheet = document.querySelector('.z3-scr.z3-on .zj-sheet'), o = document.createElement('div');
    o.id = 'set'; o.className = 'z3-set'; o.setAttribute('role', 'menu');
    o.innerHTML = '<span class="z3-lab">Screens</span>' + NAMES.map(function (n, i) { return '<button type="button" role="menuitem" data-s="' + (i + 1) + '"><em>' + (i + 1) + '</em>' + n + (i + 1 === cur ? '<i data-lucide="check"></i>' : '') + '</button>'; }).join('') +
      '<div class="z3-sk"><span>Lead Rush</span><span>Build b4</span></div>';
    sheet.appendChild(o); zj.icons(o);
  }
  function show(n) {
    closeSet();
    cur = Math.min(N, Math.max(1, n));
    $$('.z3-scr').forEach(function (s) { s.classList.toggle('z3-on', +s.dataset.s === cur); });
    document.body.classList.toggle('z3-dark', cur === 1);
    if (location.hash !== '#' + cur) history.replaceState(null, '', '#' + cur);
    var m = document.querySelector('.z3-scr.z3-on #msgs'); if (m) m.scrollTop = m.scrollHeight;
  }
  document.addEventListener('click', function (e) {
    var s = e.target.closest('#set [data-s]'); if (s) { show(+s.dataset.s); return; }
    if (e.target.closest('[data-set]')) { if (document.getElementById('set')) closeSet(); else openSet(); return; }
    if (!e.target.closest('#set')) closeSet();
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'Escape') closeSet();
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
