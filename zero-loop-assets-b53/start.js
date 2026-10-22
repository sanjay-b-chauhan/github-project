/* b53: the prototype opens on a choice, for the developers it is handed to. Levels and skills: the Level pill and panel,
   and the Simulator to push XP and stats and watch them react. Coach: the moments where Navid steps in, from the bar.
   Links can skip it: ?see=levels or ?see=coach. Story mode never shows it. */
(function () {
  'use strict';
  var J = window.J; if (!J || J.P.story) return;
  var LV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.3l5-.7z"/></svg>';
  var CO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5C4 5.1 5.1 4 6.5 4h11C18.9 4 20 5.1 20 6.5v7c0 1.4-1.1 2.5-2.5 2.5H12l-4.5 4v-4h-1C5.1 16 4 14.9 4 13.5z"/><path d="M8.5 9h7M8.5 12h4.5"/></svg>';
  function levels() { if (window.DK) DK.open('level'); setTimeout(function () { if (window.SIM) SIM.show(true); }, 450); }
  function coach() { if (window.CT && CT.moments().length) CT.jump(0); }
  function go(k) { var g = document.querySelector('.st-gate'); if (g) { g.classList.remove('on'); setTimeout(function () { g.remove(); }, 400); } setTimeout(k === 'coach' ? coach : levels, 300); }
  function boot() {
    var see = new URLSearchParams(location.search).get('see');
    if (see === 'levels' || see === 'coach') { setTimeout(function () { go(see); }, 900); return; }
    var app = document.getElementById('app'); if (!app) return;
    var g = document.createElement('div'); g.className = 'st-gate';
    g.innerHTML = '<div class="st-in"><h1>What do you want to see?</h1>' +
      '<div class="st-opts"><button data-k="levels"><i>' + LV + '</i><b>Levels and skills</b><span>The Level pill and panel. Push XP and stats in the Simulator and watch them react.</span></button>' +
      '<button data-k="coach"><i>' + CO + '</i><b>Coach</b><span>Every moment Navid steps in. Click a point on the bar and he comes in.</span></button></div>' +
      '<a class="st-ho" href="zero-loop-handover-b53.html" target="_blank" rel="noopener">The developer handover</a></div>';
    app.appendChild(g); requestAnimationFrame(function () { g.classList.add('on'); });
    Array.prototype.forEach.call(g.querySelectorAll('[data-k]'), function (b) { b.addEventListener('click', function () { if (window.SFX) SFX.play('button'); go(b.getAttribute('data-k')); }); });
  }
  /* the app is drawn by J.boot() at the end of the page: show the choice as soon as it exists, not after every image loads */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else setTimeout(boot, 0);
})();
