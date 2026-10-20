/* Lead Rush b3: the portal's top bar on every screen, real logos, and the strip that picks a screen. */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var top = function (home) {
    return '<div class="zj-top-l">' + zj.logoMark() + '<div class="zj-mode"><button type="button" class="zj-on">Learn</button><button type="button">Jobs</button></div></div>' +
      (home ? '<span></span>' : '<div class="z3-crumb"><span data-lg="hubspot.com"></span>Inbound lead router at HubSpot</div>') +
      '<div class="zj-top-r"><button class="zj-round" type="button" aria-label="Sound"><i data-lucide="volume-2"></i></button>' +
      '<button class="zj-level" type="button"><span class="zj-level-t"><i data-lucide="award"></i><span>Rank 1</span><span class="zj-level-bar"><i style="width:16px"></i></span></span></button>' +
      '<button class="z3-coach" type="button"><img src="zx/coach/navid.jpg" alt=""><span>Coach</span></button>' +
      '<button class="zj-who" type="button"><span>Sanjay</span><span class="zj-av"><img src="zx/img/sanjay.jpg" alt=""></span></button></div>';
  };
  $$('[data-top]').forEach(function (h) { h.innerHTML = top(h.dataset.top === 'home'); });
  $$('[data-lg]').forEach(function (e) { e.outerHTML = zj.logo(e.dataset.lg, e.dataset.s || ''); });
  zj.icons();

  var N = 5, cur = 1;
  function show(n) {
    cur = Math.min(N, Math.max(1, n));
    $$('.z3-scr').forEach(function (s) { s.classList.toggle('z3-on', +s.dataset.s === cur); });
    $$('#pick button').forEach(function (b) { b.classList.toggle('zj-on', +b.dataset.s === cur); });
    document.body.classList.toggle('z3-dark', cur === 1);
    if (location.hash !== '#' + cur) history.replaceState(null, '', '#' + cur);
    var m = document.getElementById('msgs'); if (m) m.scrollTop = m.scrollHeight;
  }
  document.getElementById('pick').onclick = function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.s); };
  document.getElementById('prev').onclick = function () { show(cur - 1); };
  document.getElementById('next').onclick = function () { show(cur + 1); };
  addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });

  /* the same layout, a touch bigger on a big screen */
  function fit() {
    var w = innerWidth, h = innerHeight, z = w <= 900 ? 1 : Math.min(1.35, Math.max(1, Math.min(w / 1440, h / 860)));
    document.documentElement.style.zoom = z; document.documentElement.style.setProperty('--z', z);
  }
  addEventListener('resize', fit); fit();
  show(+(location.hash || '#1').slice(1) || 1);
})();
