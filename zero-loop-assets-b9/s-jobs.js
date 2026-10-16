/* Zero b8 jobs: Sanjay's own job portal (portal.html, his ZERO Job Portal v75), inside the app.
   One warm iframe lives above the screens; each jobs beat seeds it with Sanjay's level, skill points, credits and finished
   scenarios, then plays the portal's own level up (badge, new roles, credits), and applies or opens the inbox.
   The portal counts levels from 0 at 0 points; Zero counts from Level 1, so the portal gets points + 1,000. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, esc = J.esc;
  var PB = { frame: null, layer: null, ready: false, on: false };

  function mount() {
    var app = $('#app');
    var layer = document.createElement('div'); layer.className = 'jb-layer';
    layer.innerHTML = '<iframe title="Sanjay’s job portal" src="' + D.PORTAL + '?as=start&embed=1"></iframe><div class="jb-hit"></div><button class="jb-back" hidden>' + J.IC.left + 'Back to Zero</button>';
    app.insertBefore(layer, $('.cur', app));
    PB.layer = layer; PB.frame = $('iframe', layer); PB.hit = $('.jb-hit', layer);
    PB.frame.addEventListener('load', function () {
      var w = PB.frame.contentWindow;
      try {
        var st = w.document.createElement('style');
        st.textContent = '.strip{display:none!important}.stagewrap{padding:0!important}.stagewrap>*{border-radius:0!important;box-shadow:none!important}';
        w.document.head.appendChild(st);
        (function wait() { try { if (w.eval('typeof S') === 'object' && w.eval('typeof lu3Next') === 'function') { PB.ready = true; return; } } catch (e) {} setTimeout(wait, 120); })();
      } catch (e) { console.error(e); }
    });
    $('.jb-back', layer).addEventListener('click', function () { hide(); J.pause(false); });
    document.addEventListener('jbeat', function (e) { if (e.detail.screen !== 'jobs') hide(); });
  }
  function show() { PB.on = true; PB.layer.classList.add('on'); }
  function hide() { PB.on = false; if (PB.layer) PB.layer.classList.remove('on'); var b = PB.layer && $('.jb-back', PB.layer); if (b) b.hidden = true; }
  function ev(code) { return PB.frame.contentWindow.eval(code); }
  function q(sel) { try { return PB.frame.contentWindow.document.querySelector(sel); } catch (e) { return null; } }

  /* the pointer cannot enter the iframe, so it presses a stand-in placed over the portal's own button, then the button is clicked */
  async function tap(s, el) {
    if (!el) return false;
    var r = el.getBoundingClientRect(), h = PB.hit;
    h.style.left = r.left + 'px'; h.style.top = r.top + 'px'; h.style.width = r.width + 'px'; h.style.height = r.height + 'px';
    await s.press(h, 120);
    el.click();
    return true;
  }
  async function until(s, fn, ms) { var t = 0; while (!fn() && t < (ms || 12000)) { await s.wait(150); t += 150; } }

  /* the portal's own level up (v75): badge, new roles, the credit box (several taps), the summary. Only "Tap to continue" moves on. */
  function lx(k) { try { return ev(k); } catch (e) { return null; } }
  async function celebrate(s) {
    await until(s, function () { return lx('!!LXS.el'); }, 4000);
    var guard = 0;
    while (lx('!!LXS.el&&!LXS.closing') && guard++ < 40) {
      await until(s, function () { return lx('LXS.ph') === 'rev' || !lx('!!LXS.el'); }, 6000);
      var step = lx('S.lu&&S.lu.step');
      if (!step) break;
      if (step === 'credits' && !lx('LXS.cdone')) {
        await s.wait(1200);
        for (var t = 0; t < 8 && !lx('LXS.cdone'); t++) { await tap(s, q('#lvx .lvx-st:not(.leave) .lvx-boxw'), 80); await s.wait(380); }
        await s.wait(2600);
        continue;
      }
      await s.wait(step === 'badge' ? 2600 : step === 'roles' ? 3400 : 3000);
      await tap(s, q('#lvx .lvx-next'));
      await until(s, function () { return lx('S.lu&&S.lu.step') !== step || !lx('!!LXS.el'); }, 4000);
    }
    await until(s, function () { return !lx('!!LXS.el'); }, 4000);
    await s.wait(1400);
  }

  function seed(o) {
    ev('if(typeof lxKill==="function")lxKill();PERSONAS.zl={label:"Sanjay",lvl:' + o.lvl + ',pts:' + (o.pts + 1000) + ',done:' + o.done + '};A.persona("zl");S.credits=' + o.credits + ';S.crShown=S.credits;S.lu=null;drawLU();render(true)');
  }

  J.screen('jobs', {
    theme: 'light', dock: false,
    draw: function (el, d, ctx) {
      el.innerHTML = '<div class="jb-wait"><span></span></div>';
      if (!PB.layer) mount();
      show();
      if (PB.ready) {
        var st = ctx.st, up = d.levelUp && st.last && st.last.to > st.last.from;
        try { seed({ lvl: up ? st.last.from : J.lvl(st), pts: up ? st.pts - st.last.gain : st.pts, done: Math.max(0, st.done.length - (up ? 1 : 0)), credits: up ? st.credits - st.last.to * 100 : st.credits }); } catch (e) { console.error(e); }
      }
    },
    play: async function (el, d, s, ctx) {
      await until(s, function () { return PB.ready; }, 20000);
      var st = ctx.st, up = d.levelUp && st.last && st.last.to > st.last.from;
      var from = up ? st.last.from : J.lvl(st), to = J.lvl(st);
      seed({ lvl: from, pts: up ? st.pts - st.last.gain : st.pts, done: Math.max(0, st.done.length - (up ? 1 : 0)), credits: up ? st.credits - st.last.to * 100 : st.credits });
      await s.wait(2600);
      if (up) {
        var ids = [];
        for (var k = from + 1; k <= to; k++) ids = ids.concat(ev('lvRoles(' + k + ').filter(function(r){return !r.hide}).map(function(r){return r.id})'));
        ev('S.pts=' + (st.pts + 1000) + ';S.lvl=' + to + ';S.done=ME.projects.slice(0,' + st.done.length + ').map(function(x){return x[0]});applyDone();S.lvup={from:' + from + ',to:' + to + ',gain:' + st.last.gain + ',ids:' + JSON.stringify(ids) + '};render()');
        await celebrate(s);
      } else {
        await tap(s, q('[data-a="go"][data-id="jobs"]'));
        await s.wait(3200);
      }
      if (d.apply) {
        if (ev('S.page.student') !== 'jobs') { await tap(s, q('[data-a="go"][data-id="jobs"]')); await s.wait(1600); }
        for (var i = 0; i < d.apply; i++) {
          /* the highest level role open to him, best fit first: at Level 9 that is a senior role, not an internship */
          var ids = ev('DATA.roles.filter(function(r){return !r.hide&&!locked(r)&&!S.apps[r.id]}).sort(function(a,b){return (lvOf(b)-lvOf(a))||(score(b)-score(a))}).map(function(r){return r.id})');
          var b = null;
          for (var j = 0; j < ids.length && !b; j++) b = q('button.eg-ap[data-k="yes"][data-id="' + ids[j] + '"]');
          if (!b) b = q('button.eg-ap[data-k="yes"]');
          if (!b) break;
          var had = ev('Object.keys(S.apps).length');
          b.scrollIntoView({ block: 'center', behavior: 'smooth' });
          await s.wait(800);
          await tap(s, b);
          await until(s, function () { return ev('Object.keys(S.apps).length') > had && !ev('S.qa'); }, 30000);
          await s.wait(1600);
        }
      }
      if (d.end) {
        await until(s, function () { return !ev('S.qa'); }, 30000);
        await tap(s, q('[data-a="go"][data-id="inbox"]'));
        await s.wait(3000);
      } else {
        await s.wait(1800);
      }
      s.hideCursor();
    }
  });

  /* "View all" in the level panel: a look at the portal as he is now, the story waits */
  PB.peek = function () {
    if (!PB.ready) return;
    J.pause(true);
    var st = J.P.st;
    seed({ lvl: J.lvl(st), pts: st.pts, done: st.done.length, credits: st.credits });
    ev('S.page.student="jobs";S.lm="jobs";render(true)');
    if (window.DK) DK.close();
    show(); $('.jb-back', PB.layer).hidden = false;
  };

  window.PB = PB;
  var boot = J.boot; J.boot = function () { boot(); if (!PB.layer) mount(); };
})();
