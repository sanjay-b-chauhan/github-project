/* b46: the product's sound. One library across everything: SND01 "sine" from snd.dev (Dentsu; free for commercial use,
   no credit needed). Taps, buttons, selections, toggles, panels opening and closing, Navid stepping in, typing, and the
   level up. No swipe sound (he found it harsh). It follows the bar's speaker: when Navid is muted, so is this. */
(function () {
  'use strict';
  var snd = null, ready = false, VOL = 0.5, last = {};
  function quiet() { var J = window.J; return (window.NV && !NV.sound) || (J && J.P.moment && !J.P.moment.hit); }
  function play(key, vol, gap) {
    if (!ready || quiet()) return;
    var t = performance.now(); if (last[key] && t - last[key] < (gap || 40)) return; last[key] = t;
    try { snd.play(key, { volume: vol == null ? VOL : vol }); } catch (e) {}
  }
  if (window.Snd) { snd = new Snd({ easySetup: false, muteOnWindowBlur: true }); snd.load(Snd.KITS.SND01).then(function () { ready = true; }, function () {}); }
  window.SFX = { play: play };
  /* every click in the app and its bar gets the sound of what it does, decided before the click changes anything */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button, a, [role=button], .rk-h, .cv-mh'); if (!t || t.disabled) return;
    var exp = t.getAttribute('aria-expanded');
    if (t.matches('.ct-snd')) { if (window.NV && !NV.sound) setTimeout(function () { play('toggle_on'); }, 30); return; }
    if (t.matches('.seg')) { var dk = document.querySelector('.dk'), open = dk && dk.classList.contains('open'); play(!open ? 'transition_up' : t.classList.contains('on') ? 'transition_down' : 'select'); return; }
    if (t.matches('.cv-all, .cv-mh, .rk-h')) { play(exp === 'true' ? 'toggle_off' : 'toggle_on'); return; }
    if (t.matches('.zs-t')) { play(t.classList.contains('on') ? 'toggle_off' : 'toggle_on'); return; }
    if (t.matches('.rx-back')) { play('transition_down'); return; }
    if (t.matches('.rb-see, .nx-all, .rb-where, [data-rk]')) { play('transition_up'); return; }
    if (t.matches('.zs-seg button, .ct-mode a, .st-spd button, .sm-tab button, .nv-cc, [data-rx]')) { play('select'); return; }
    if (t.matches('.nv-key.pri, .zx-hint, .key, .pri')) { play('button'); return; }
    play('tap');
  }, true);
})();
