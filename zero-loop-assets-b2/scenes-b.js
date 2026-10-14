/* scenes-b.js: System 3, Jobs. The job portal inside Zero (Home with the new roles box, the opened list, one click apply,
   the Tracker, Explore), then the offer by email outside Zero, then the end. Every class is prefixed b-. */
(function () {
  'use strict';
  var J = window.J, D = J.D, IC = J.IC, esc = J.esc;
  function $(s, r) { return r.querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call(r.querySelectorAll(s)); }
  function role(id) { return D.role(id); }
  function first(name) { return String(name || '').split(' ')[0]; }
  function idx(beats, beat) { return beats.indexOf(beat); }

  /* ---------- icons of our own ---------- */
  function line(p, vb) { return '<svg viewBox="0 0 ' + (vb || 16) + ' ' + (vb || 16) + '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var BI = {
    world: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 7 11.1 11.1 7 13 8.9 8.9z" fill="currentColor"/></svg>',
    gym: '<svg viewBox="0 0 20 20" aria-hidden="true"><g transform="rotate(-45 10 10)" fill="currentColor"><rect x="1.6" y="7.4" width="2.6" height="5.2" rx="1.1"/><rect x="4.6" y="5.6" width="3" height="8.8" rx="1.3"/><rect x="12.4" y="5.6" width="3" height="8.8" rx="1.3"/><rect x="15.8" y="7.4" width="2.6" height="5.2" rx="1.1"/><rect x="7.2" y="9" width="5.6" height="2" rx=".7"/></g></svg>',
    bag: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.4 5.4V4.3c0-.9.7-1.6 1.6-1.6h2c.9 0 1.6.7 1.6 1.6v1.1" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="2.4" y="5.4" width="15.2" height="11.4" rx="3.2" fill="currentColor"/><path class="b-bagln" d="M2.6 10.4h14.8" stroke-width="1.3"/></svg>',
    gear: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.4" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="2.55 2.48"/><circle cx="10" cy="10" r="4.3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    mail: line('<rect x="2.5" y="3.5" width="11" height="9" rx="1.8"/><path d="M3.2 4.6 8 8.4l4.8-3.8"/>'),
    inbox: line('<path d="M2.5 9.2h3l1 1.8h3l1-1.8h3"/><path d="M4.2 3.5h7.6l1.7 5.7V12a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2.5 12V9.2z"/>'),
    star: line('<path d="M8 2.6l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 10.8l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"/>'),
    sent: line('<path d="M13.6 2.4 2.4 7.1l4.4 1.8 1.9 4.6z"/><path d="M6.8 8.9l6.8-6.5"/>'),
    draft: line('<path d="M9.5 2.5H4.6a1.1 1.1 0 0 0-1.1 1.1v8.8a1.1 1.1 0 0 0 1.1 1.1h6.8a1.1 1.1 0 0 0 1.1-1.1V5.5z"/><path d="M9.5 2.5v3h3"/>'),
    archive: line('<rect x="2.5" y="3" width="11" height="3" rx="1"/><path d="M3.5 6v6a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6M6.6 8.6h2.8"/>'),
    trash: line('<path d="M3 4.6h10M6.4 4.6V3.2h3.2v1.4M4.4 4.6l.6 8.4h6l.6-8.4"/>'),
    reply: line('<path d="M6.5 4 3 7.5 6.5 11"/><path d="M3 7.5h6.2a3.8 3.8 0 0 1 3.8 3.8v.7"/>'),
    pen: line('<path d="M10.6 3.2l2.2 2.2L6.2 12H4v-2.2z"/>'),
    search: line('<circle cx="7.2" cy="7.2" r="4.2"/><path d="M10.4 10.4 13.2 13.2"/>'),
    file: line('<path d="M9.5 2.5H4.6a1.1 1.1 0 0 0-1.1 1.1v8.8a1.1 1.1 0 0 0 1.1 1.1h6.8a1.1 1.1 0 0 0 1.1-1.1V5.5z"/><path d="M9.5 2.5v3h3"/>'),
    open: line('<rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M2.4 4.3 8 8.6l5.6-4.3"/>'),
    lock: '<svg class="b-lki" viewBox="0 0 16 16" aria-hidden="true"><path class="b-shk" d="M5.5 7.2V5.3a2.5 2.5 0 0 1 5 0v1.9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="3.5" y="7" width="9" height="6.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
  };
  var SPIN = '<i class="b-spin"></i>', RING = '<i class="b-ring"></i>', OK = '<span class="b-ok">' + IC.check + '</span>';

  /* ---------- motion helpers that follow the story's speed, pause and jumps ---------- */
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function tween(s, ms, fn) {
    var tok = s.tok;
    return new Promise(function (res) {
      var t0 = performance.now(), d = ms / J.story.speed, held = 0;
      (function f(t) {
        if (tok !== J.story.tok) return res();
        if (J.story.paused) { if (!held) held = t; return requestAnimationFrame(f); }
        if (held) { t0 += t - held; held = 0; }
        var k = Math.min(1, Math.max(0, (t - t0) / d));
        fn(ease(k), k);
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  function glide(s, sc, to, ms) {
    var from = sc.scrollTop, max = sc.scrollHeight - sc.clientHeight;
    to = Math.max(0, Math.min(max, Math.round(to)));
    if (Math.abs(to - from) < 2) return Promise.resolve();
    return tween(s, ms || 900, function (e) { sc.scrollTop = from + (to - from) * e; });
  }
  /* an element's box in canvas pixels, relative to the view (the window is scaled) */
  function at(el, view) {
    var v = view.getBoundingClientRect(), r = el.getBoundingClientRect(), k = v.width / J.CANVAS.w || 1;
    return { x: (r.left - v.left) / k, y: (r.top - v.top) / k, w: r.width / k, h: r.height / k };
  }
  function dur(ms) { return ms / J.story.speed; }
  function bump(x) { if (!x) return; x.classList.remove('b-bump'); void x.offsetWidth; x.classList.add('b-bump'); }

  /* ---------- the job portal shell: dark rail over the world, the light page, nav, HUD ---------- */
  var NAV = [['home', 'Home'], ['explore', 'Explore'], ['tracker', 'Tracker']];
  function shell(page, inner) {
    return '<div class="b-app">' +
      '<div class="b-bg" aria-hidden="true"><img alt="" src="' + J.A + 'world.jpg"></div>' +
      '<aside class="b-rail">' +
        '<span class="b-wm">' + J.wordmark('b-wms') + '</span>' +
        '<nav class="b-ico" aria-label="Zero">' +
          '<button aria-label="World">' + BI.world + '</button>' +
          '<button aria-label="Practice">' + BI.gym + '</button>' +
          '<button class="on" aria-label="Jobs" aria-current="page">' + BI.bag + '</button>' +
        '</nav>' +
        '<button class="b-gear" aria-label="Settings">' + BI.gear + '</button>' +
      '</aside>' +
      '<main class="b-main">' +
        '<header class="b-top"><button class="b-back" aria-label="Back">' + IC.back + '</button>' +
          '<nav class="b-nav" aria-label="Jobs">' + NAV.map(function (p) {
            return '<button' + (p[0] === page ? ' class="on" aria-current="page"' : '') + '>' + p[1] + '</button>';
          }).join('') + '</nav>' + J.hud({ light: true }) + '</header>' +
        '<div class="b-page">' + inner + '</div>' +
      '</main></div>';
  }
  function heartBtn(on) {
    return '<button class="b-ht' + (on ? ' on' : '') + '" aria-pressed="' + !!on + '" aria-label="' + (on ? 'Liked' : 'Like') + '">' + (on ? IC.heartf : IC.heart) + '</button>';
  }
  function fitMark(r) { return '<span class="b-fit">' + (r.fit ? IC[r.fit] : '') + '</span>'; }
  function setHeart(btn, on) {
    btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? 'Liked' : 'Like');
    btn.innerHTML = on ? IC.heartf : IC.heart;
    if (on) bump(btn);
  }
  /* the visitor can tick and heart by hand too */
  function bindLocal(view) {
    view.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !view.contains(t)) return;
      if (t.classList.contains('b-ht') && !t.closest('.b-lock')) { setHeart(t, !t.classList.contains('on')); return; }
      if (t.classList.contains('b-ck')) { setTick(view, t.closest('.b-r'), !t.classList.contains('on')); }
    });
  }

  /* ---------- Home: the new roles box, or the locked card, and the tracker counts ---------- */
  function fan(doms) {
    var k = doms.length;
    return doms.map(function (dm, i) {
      var o = i - (k - 1) / 2, z = 20 - Math.round(Math.abs(o) * 2);
      return '<span class="b-bx-tile" style="--x:' + (o * 46).toFixed(1) + 'px;--y:' + (Math.abs(o) * Math.abs(o) * 2.6).toFixed(1) + 'px;--r:' + (o * 6.5).toFixed(1) + 'deg;--i:' + i + ';z-index:' + z + '">' + J.logo(dm, 52) + '</span>';
    }).join('');
  }
  function boxHTML(n, why, doms) {
    return '<div class="b-box">' +
      '<span class="b-bx-floor" aria-hidden="true"></span>' +
      '<span class="b-bx-l2" aria-hidden="true"></span><span class="b-bx-l1" aria-hidden="true"></span>' +
      '<span class="b-bx-zero">' + J.zero(56) + '</span>' +
      '<div class="b-bx-body">' +
        '<div class="b-bx-win" aria-hidden="true">' + fan(doms.slice(0, 6)) + '</div>' +
        '<div class="b-bx-n"><b class="b-bx-num">' + n + '</b><span class="b-bx-t"><span class="b-bx-l">new roles</span><span class="b-bx-why">' + esc(why) + '</span></span></div>' +
        '<button class="b-key b-wide b-open">Open</button>' +
      '</div>' +
      '<div class="b-bx-lid"><span class="b-bx-seam" aria-hidden="true"></span>' + J.wordmark('b-bx-wm') + '</div>' +
    '</div>';
  }
  function lockedHTML(lk, st) {
    var need = (lk.need || 1) * 1000, have = Math.min(st.pts, need);
    var prev = D.ROLES.filter(function (r) { return r.lvl === (lk.need || 1); }).slice(0, 4);
    return '<section class="b-lock" aria-label="Jobs open at Level ' + (lk.need || 1) + '">' +
      '<div class="b-lk-h"><span class="b-lk-ic">' + BI.lock + '</span><span class="b-lk-t">Jobs open at Level ' + (lk.need || 1) + '</span></div>' +
      '<div class="b-lk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + need + '" aria-valuenow="' + have + '"><i style="--p:' + (have / need).toFixed(3) + '"></i></div>' +
      '<div class="b-lk-m">' + IC.star + '<span><span class="b-lk-pts">' + J.n(have) + '</span> of ' + J.n(need) + ' skill points</span></div>' +
      '<div class="b-lk-lab">' + (D.OPEN[lk.need || 1] - D.OPEN[(lk.need || 1) - 1]) + ' roles at Level ' + (lk.need || 1) + '</div>' +
      '<ul class="b-lk-list">' + prev.map(function (r) {
        return '<li class="b-lk-r">' + J.logo(r.dom, 36) + '<span class="b-who b-lk-who" aria-hidden="true"><span class="b-tt">' + esc(r.title) + '</span><span class="b-co">' + esc(r.co) + '</span></span>' +
          '<span class="b-lk-pay" aria-hidden="true">' + esc(r.pay) + '</span><span class="b-lk-l">' + BI.lock + '</span></li>';
      }).join('') + '</ul></section>';
  }
  var STATES = [['applied', 'Applied'], ['connected', 'Connected'], ['lost', 'Lost']];
  var HINT = { applied: 'Sent on their job page', connected: 'They replied by email', lost: 'Closed or no reply' };
  function countsHTML(st) {
    var c = J.counts(st);
    return '<div class="b-cnts">' + STATES.map(function (p, i) {
      var ids = st.order.filter(function (id) { return st.apps[id] && st.apps[id].state === p[0]; }).slice(0, 4);
      return '<button class="b-cnt" data-s="' + p[0] + '" style="--i:' + i + '"><span class="b-cnt-l">' + p[1] + '</span><span class="b-cnt-go" aria-hidden="true">' + IC.arrow + '</span>' +
        '<span class="b-cnt-n' + (c[p[0]] ? '' : ' z') + '">' + c[p[0]] + '</span>' +
        (ids.length ? '<span class="b-cnt-lg">' + ids.map(function (id) { return J.logo(role(id).dom, 26, 'round'); }).join('') + '</span>' : '') +
        '</button>';
    }).join('') + '</div>';
  }
  function actionsHTML(acts) {
    return '<section class="b-acard"><header class="b-acard-h"><span>Action items</span><span class="b-coln">' + acts.length + '</span></header><ul>' + acts.map(function (a) {
      return '<li class="b-ai">' + J.logo(a.dom, 36) + '<span class="b-who"><span class="b-tt">' + esc(a.t) + '</span><span class="b-co">' + esc(a.line || '') + '</span></span><button class="b-btn b-sm">' + esc(a.btn || 'Open email') + '</button></li>';
    }).join('') + '</ul></section>';
  }
  /* the logos inside the box: the roles the next beat opens, or any role open at her level */
  function boxDoms(beats, i, st) {
    for (var k = i + 1; k < beats.length && k < i + 3; k++) if (beats[k].screen === 'roles') return beats[k].d.list.map(function (id) { return role(id).dom; });
    return D.ROLES.filter(function (r) { return r.lvl <= Math.max(1, st.level); }).map(function (r) { return r.dom; });
  }
  function homeHTML(box, st, d, cls) {
    var right = d.actions && d.actions.length ? actionsHTML(d.actions) : countsHTML(st);
    return '<div class="b-hrow"><h1 class="b-h1">Today</h1></div>' +
      '<div class="b-home ' + (cls || '') + (d.locked ? ' lk' : '') + '">' + (d.locked ? lockedHTML(d.locked, st) : box) + right + '</div>';
  }

  J.screen('jobsHome', {
    theme: 'light',
    draw: function (view, d, st, beat, beats) {
      var i = idx(beats, beat);
      var box = d.box ? boxHTML(d.box.n, d.box.why || '', boxDoms(beats, i, st)) : '';
      view.innerHTML = shell('home', homeHTML(box, st, d, 'b-enter'));
      bindLocal(view);
    },
    play: async function (s, view, d, st) {
      if (d.box) {
        var num = $('.b-bx-num', view);
        num.textContent = '0';
        await s.wait(900);
        await s.count(num, 0, d.box.n, 1100);
        await s.wait(1700);
        await s.press($('.b-open', view), 1300);
        $('.b-box', view).classList.add('b-tap');
        await s.wait(250);
      } else {
        var bar = $('.b-lk-bar', view), pts = $('.b-lk-pts', view), have = Math.min(st.pts, (d.locked.need || 1) * 1000);
        pts.textContent = '0';
        await s.wait(700);
        bar.classList.add('go');
        await s.count(pts, 0, have, 1100);
        await s.wait(1600);
      }
    }
  });

  /* ---------- the box opens: the new roles list ---------- */
  function rowHTML(r, o, i) {
    return '<div class="b-r' + (o.on ? ' on' : '') + '" data-id="' + r.id + '" style="--i:' + (i || 0) + '">' +
      '<button class="b-ck' + (o.on ? ' on' : '') + '" role="checkbox" aria-checked="' + !!o.on + '" aria-label="Select ' + esc(r.title + ', ' + r.co) + '">' + IC.check + '</button>' +
      J.logo(r.dom, 36) +
      '<span class="b-who"><span class="b-tt">' + esc(r.title) + '</span><span class="b-co">' + esc(r.co) + '</span></span>' +
      '<span class="b-lv">Level ' + r.lvl + '</span>' +
      '<span class="b-pay">' + esc(r.pay) + '</span>' +
      '<span class="b-mode">' + esc(r.mode) + '</span>' +
      fitMark(r) + heartBtn(o.heart) +
    '</div>';
  }
  function applyLabel(n) { return n ? 'Apply to ' + n : 'Apply'; }
  function listHTML(d, o) {
    o = o || {};
    var sel = o.sel || [], more = Math.max(0, d.n - d.list.length);
    return '<div class="b-hrow"><h1 class="b-h1">' + d.n + ' new roles</h1><div class="b-acts">' +
      '<button class="b-btn b-sall">Select all ' + IC.fire + '</button>' +
      '<button class="b-key b-apply"' + (sel.length ? '' : ' aria-disabled="true"') + '>' + applyLabel(sel.length) + '</button></div></div>' +
      '<section class="b-lc"><div class="b-ls">' + d.list.map(function (id, i) {
        return rowHTML(role(id), { on: sel.indexOf(id) >= 0, heart: o.heart === id }, i);
      }).join('') + '</div>' + (more ? '<button class="b-more">Show ' + more + ' more</button>' : '') + '</section>';
  }
  function setTick(view, row, on) {
    if (!row) return;
    var ck = $('.b-ck', row);
    row.classList.toggle('on', on); ck.classList.toggle('on', on); ck.setAttribute('aria-checked', on);
    var n = $$('.b-ck.on', view).length, a = $('.b-apply', view);
    if (a) { a.textContent = applyLabel(n); if (n) a.removeAttribute('aria-disabled'); else a.setAttribute('aria-disabled', 'true'); }
  }

  J.screen('roles', {
    theme: 'light',
    draw: function (view, d, st, beat, beats) {
      var i = idx(beats, beat), why = 'Level ' + st.level + ' opened them';
      for (var k = i - 1; k >= 0 && k > i - 3; k--) if (beats[k].screen === 'jobsHome' && beats[k].d.box) { why = beats[k].d.box.why || why; break; }
      var box = boxHTML(d.n, why, d.list.map(function (id) { return role(id).dom; }));
      view.innerHTML = shell('home', '<div class="b-lay b-lay-home">' + homeHTML(box, st, {}) + '</div><div class="b-lay b-lay-list">' + listHTML(d) + '</div>');
      bindLocal(view);
      $('.b-sall', view).addEventListener('click', function () {
        var fire = $$('.b-r', view).filter(function (r) { return role(r.getAttribute('data-id')).fit === 'fire'; });
        var all = fire.every(function (r) { return r.classList.contains('on'); });
        fire.forEach(function (r) { setTick(view, r, !all); });
      });
    },
    play: async function (s, view, d) {
      var home = $('.b-lay-home', view), list = $('.b-lay-list', view);
      await s.wait(450);
      home.classList.add('open');
      await s.wait(520);
      /* the roles come out of the box and land in their rows */
      var tiles = $$('.b-bx-tile', home), rows = $$('.b-r', list), flights = [];
      tiles.forEach(function (t, k) {
        var dst = rows[k] && $('.jlg', rows[k]); if (!dst) return;
        var A = at(t, view), B = at(dst, view), g = t.cloneNode(true);
        var ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y - 10 + B.h / 2, r = parseFloat(t.style.getPropertyValue('--r')) || 0;
        g.className = 'b-flylg'; g.style.cssText = 'left:' + (ax - 26) + 'px;top:' + (ay - 26) + 'px;width:52px;height:52px';
        view.appendChild(g); dst.style.visibility = 'hidden'; t.style.visibility = 'hidden';
        flights.push({ g: g, dst: dst, a: g.animate([
          { transform: 'translate(0,0) rotate(' + r + 'deg) scale(1)' },
          { transform: 'translate(' + (bx - ax).toFixed(1) + 'px,' + (by - ay).toFixed(1) + 'px) rotate(0deg) scale(' + (B.w / 52).toFixed(3) + ')' }
        ], { duration: dur(820), delay: dur(k * 45), easing: 'cubic-bezier(.625,.05,0,1)', fill: 'both' }) });
      });
      home.classList.add('out'); list.classList.add('in');
      await s.wait(820 + tiles.length * 45 + 60);
      flights.forEach(function (f) { f.dst.style.visibility = ''; f.a.cancel(); f.g.remove(); });
      await s.wait(500);
      var hr = $('.b-r[data-id="' + d.heart + '"]', view);
      if (hr) {
        var hb = $('.b-ht', hr);
        await s.press(hb, 600);
        setHeart(hb, true);
        var chip = J.el('<span class="b-mlt' + (hr.previousElementSibling ? '' : ' below') + '" aria-hidden="true">More like this</span>');
        hr.appendChild(chip);
        await s.wait(1500);
        chip.classList.add('gone');
        await s.wait(300);
      }
      for (var k = 0; k < d.select.length; k++) {
        var row = $('.b-r[data-id="' + d.select[k] + '"]', view);
        if (!row) continue;
        await s.press($('.b-ck', row), 520);
        setTick(view, row, true);
      }
      await s.wait(700);
      await s.press($('.b-apply', view), 1000);
      await s.wait(200);
    }
  });

  /* ---------- apply: Zero tailors each one and sends it on the company's own job page ---------- */
  /* the portfolio Zero reorders: the scenarios she has done, the one that fits this role moves to the top */
  function portfolio(beats, i, top) {
    var done = [];
    for (var k = 0; k < i; k++) if (beats[k].screen === 'review' && D.SC[beats[k].d.sc]) done.push(beats[k].d.sc);
    var pick = null;
    done.forEach(function (k) { if (D.SC[k].title === top) pick = k; });
    var tp = pick ? { t: D.SC[pick].title, dom: D.SC[pick].dom } : { t: top };
    var others = done.filter(function (k) { return k !== pick; }).slice(-2).map(function (k) { return { t: D.SC[k].title, dom: D.SC[k].dom }; });
    var fill = [{ t: 'About me', me: 1 }, { t: 'Work experience', bag: 1 }].slice(0, Math.max(0, 2 - others.length));
    return fill.concat(others).concat([tp]);
  }
  function tileHTML(p, slot, isTop) {
    var face = p.dom ? J.logo(p.dom, 16) : p.me ? J.av('maya', 16) : '<span class="b-tile-ic">' + IC.bag + '</span>';
    return '<span class="b-tile' + (isTop ? ' tp' : '') + '" style="--s:' + slot + '">' + face + '<span class="b-tile-t">' + esc(p.t) + '</span></span>';
  }
  function careers(dom) { return dom + '/careers'; }
  function panelHTML(d, items) {
    var n = d.roles.length;
    return '<aside class="b-pn" aria-label="Applying to ' + n + '">' +
      '<header class="b-pn-h">' + J.zero(36, 'working') + '<span class="b-pn-t">Applying to ' + n + '</span><span class="b-pn-c"><span class="b-pn-k">0</span> of ' + n + ' sent</span></header>' +
      '<ol class="b-pn-l">' + d.roles.map(function (id) {
        var r = role(id);
        return '<li class="b-ap" data-id="' + id + '" data-st="wait">' +
          '<div class="b-ap-h">' + J.logo(r.dom, 32) + '<span class="b-who"><span class="b-tt">' + esc(r.title) + '</span><span class="b-co b-ap-co">' + esc(r.co) + '</span></span><span class="b-ap-s">' + RING + '</span></div>' +
          '<div class="b-ap-b"><div class="b-ap-in"><ol class="b-steps">' +
            '<li class="b-st" data-s="wait"><span class="b-sd">' + RING + '</span><span class="b-stx"><span class="b-stt">Portfolio: ' + esc(d.top) + ' moves to the top</span>' +
              '<span class="b-tiles"><span class="b-ranks" aria-hidden="true"><i>1</i><i>2</i><i>3</i></span><span class="b-tset">' + items.map(function (p, k) { return tileHTML(p, k, k === items.length - 1); }).join('') + '</span></span></span></li>' +
            '<li class="b-st" data-s="wait"><span class="b-sd">' + RING + '</span><span class="b-stx"><span class="b-stt">Resume matched to the role</span></span></li>' +
            '<li class="b-st" data-s="wait"><span class="b-sd">' + RING + '</span><span class="b-stx"><span class="b-stt b-st3">Send on ' + esc(careers(r.dom)) + '</span></span></li>' +
          '</ol></div></div></li>';
      }).join('') + '</ol>' +
      '<footer class="b-pn-f"><button class="b-key b-wide b-done" aria-disabled="true">Done</button></footer></aside>';
  }
  function mark(el, st) { if (el) el.innerHTML = st === 'work' ? SPIN : st === 'done' ? OK : RING; }
  function step(li, st) { li.setAttribute('data-s', st); mark($('.b-sd', li), st); }
  async function tailor(s, li, f) {
    var r = role(li.getAttribute('data-id')), steps = $$('.b-st', li);
    li.setAttribute('data-st', 'work'); mark($('.b-ap-s', li), 'work');
    var pl = li.closest('.b-pn-l');
    await s.wait(300 * f);
    if (pl) await glide(s, pl, li.offsetTop - 6, 380);
    step(steps[0], 'work'); await s.wait(650 * f);
    var tiles = $$('.b-tile', li), last = tiles.length - 1;
    tiles.forEach(function (t, k) { t.style.setProperty('--s', k === last ? 0 : k + 1); });
    await s.wait(950 * f);
    step(steps[0], 'done'); step(steps[1], 'work'); await s.wait(700 * f);
    step(steps[1], 'done'); step(steps[2], 'work');
    $('.b-st3', steps[2]).textContent = 'Sending on ' + careers(r.dom);
    await s.wait(750 * f);
    $('.b-st3', steps[2]).textContent = 'Sent on ' + careers(r.dom);
    step(steps[2], 'done'); await s.wait(450 * f);
    li.setAttribute('data-st', 'done'); mark($('.b-ap-s', li), 'done');
    $('.b-ap-co', li).textContent = 'Sent on ' + careers(r.dom);
    await s.wait(380 * f);
  }

  /* once Done is pressed, the page behind shows what was sent */
  function sentOnPage(view, ids, wk) {
    ids.forEach(function (id) {
      var row = $('.b-r[data-id="' + id + '"]', view);
      if (row) {
        var ck = $('.b-ck', row);
        row.classList.remove('on'); row.classList.add('sent');
        ck.outerHTML = '<span class="b-ckd" aria-label="Applied">' + OK + '</span>';
        var co = $('.b-co', row); if (co) co.insertAdjacentHTML('beforeend', '<i></i><span class="b-sentx">Applied</span>');
      }
      var er = $('.b-er[data-id="' + id + '"]', view);
      if (er) { var b = $('.b-eap', er); if (b) b.outerHTML = '<span class="b-did">' + OK + '<span>Applied</span></span>'; }
    });
    var a = $('.b-apply', view);
    if (a) { a.textContent = applyLabel(0); a.setAttribute('aria-disabled', 'true'); }
    var col = $('.b-col[data-s="applied"]', view);
    if (col) {
      var l = $('.b-coll', col), n = $('.b-coln', col);
      ids.forEach(function (id, k) {
        if ($('.b-tk[data-id="' + id + '"]', l)) return;
        var c = J.el(tkHTML(id, { state: 'applied', note: '', wk: wk }));
        c.classList.add('b-new-in'); c.style.setProperty('--k', ids.length - 1 - k);
        l.insertBefore(c, l.firstChild);
      });
      n.textContent = $$('.b-tk', l).length; bump(n);
      l.scrollTop = 0;
    }
  }

  J.screen('apply', {
    theme: 'light',
    draw: function (view, d, st, beat, beats) {
      var i = idx(beats, beat), prev = beats[i - 1], page, behind;
      if (prev && prev.screen === 'roles') { page = 'home'; behind = listHTML(prev.d, { sel: prev.d.select, heart: prev.d.heart }); }
      else if (prev && prev.screen === 'explore') { page = 'explore'; behind = exploreHTML(prev.d, Math.max(st.level, prev.d.to)); }
      else { page = 'tracker'; behind = trackerHTML(st, beats, i); }
      view.innerHTML = shell(page, behind) + '<div class="b-scrim"></div>' + panelHTML(d, portfolio(beats, i, d.top));
      if (page === 'explore') { var w = $('.b-er[data-id="' + prev.d.want + '"]', view), es = $('.b-es', view); if (w && es) es.scrollTop = Math.max(0, w.closest('.b-grp').offsetTop); }
    },
    play: async function (s, view, d, st, beat) {
      var pn = $('.b-pn', view), k = $('.b-pn-k', view);
      await s.wait(200);
      $('.b-scrim', view).classList.add('on'); pn.classList.add('in');
      await s.wait(800);
      var rows = $$('.b-ap', view);
      for (var i = 0; i < rows.length; i++) {
        await tailor(s, rows[i], i === 0 ? 1 : rows.length > 3 ? .5 : .62);
        k.textContent = i + 1; bump(k.parentNode);
      }
      var pl = $('.b-pn-l', view); if (pl) await glide(s, pl, 0, 500);
      var done = $('.b-done', view);
      done.removeAttribute('aria-disabled');
      await s.wait(500);
      await s.press(done, 1000);
      pn.classList.remove('in'); $('.b-scrim', view).classList.remove('on');
      sentOnPage(view, d.roles, beat.wk);
      await s.wait(900);
    }
  });

  /* ---------- the tracker: Applied, Connected, Lost ---------- */
  /* newest change first: the beat that last touched each application */
  function sorted(st, beats, i, state) {
    var last = {};
    for (var k = 0; k < i; k++) {
      var b = beats[k];
      if (b.screen === 'apply') b.d.roles.forEach(function (id) { last[id] = k; });
      if (b.screen === 'tracker') b.d.move.forEach(function (m) { last[m.id] = k; });
    }
    return st.order.filter(function (id) { return st.apps[id] && st.apps[id].state === state; })
      .sort(function (a, b) { return (last[b] || 0) - (last[a] || 0) || st.order.indexOf(a) - st.order.indexOf(b); });
  }
  function tkHTML(id, a) {
    var r = role(id);
    return '<div class="b-tk ' + a.state + '" data-id="' + id + '">' +
      '<div class="b-tk-r">' + J.logo(r.dom, 32) + '<span class="b-who"><span class="b-tt">' + esc(r.title) + '</span><span class="b-co">' + esc(r.co) + '<i></i><span class="b-wk">' + esc(a.wk) + '</span></span></span></div>' +
      (a.state === 'connected' ? '<div class="b-tk-x"><span class="b-tk-note">' + BI.mail + '<span>' + esc(a.note) + '</span></span><button class="b-btn b-sm">Open email</button></div>' : '') +
      (a.state === 'lost' ? '<div class="b-tk-x"><span class="b-tk-why">' + esc(a.note) + '</span></div>' : '') +
    '</div>';
  }
  function trackerHTML(st, beats, i) {
    return '<div class="b-hrow"><h1 class="b-h1">Tracker</h1></div><div class="b-trk">' + STATES.map(function (p) {
      var ids = sorted(st, beats, i, p[0]);
      return '<section class="b-col" data-s="' + p[0] + '"><header class="b-colh"><span>' + p[1] + '</span><span class="b-coln">' + ids.length + '</span></header>' +
        '<div class="b-coll">' + ids.map(function (id) { return tkHTML(id, st.apps[id]); }).join('') + '</div></section>';
    }).join('') + '</div>';
  }
  async function move(s, view, m, wk) {
    var card = $('.b-tk[data-id="' + m.id + '"]', view); if (!card) return;
    var from = card.closest('.b-col'), to = $('.b-col[data-s="' + m.to + '"]', view); if (!to || from === to) return;
    var fl = $('.b-coll', from), tl = $('.b-coll', to);
    /* bring the card into view first if its column has scrolled it away */
    var bottom = card.offsetTop + card.offsetHeight;
    if (bottom > fl.scrollTop + fl.clientHeight || card.offsetTop < fl.scrollTop) await glide(s, fl, bottom - fl.clientHeight + 4, 600);
    card.classList.add('b-lift');
    await s.wait(420);
    var A = at(card, view);
    var ghost = card.cloneNode(true);
    ghost.classList.add('b-ghost');
    ghost.style.cssText = 'left:' + A.x + 'px;top:' + A.y + 'px;width:' + A.w + 'px;height:' + A.h + 'px';
    view.appendChild(ghost);
    card.style.visibility = 'hidden';
    /* the new card opens its place at the top of the other column; the old place closes */
    var nc = J.el(tkHTML(m.id, { state: m.to, note: m.note, wk: wk }));
    nc.classList.add('b-landing');
    tl.insertBefore(nc, tl.firstChild);
    var h = nc.offsetHeight;
    nc.style.height = '0px'; nc.style.marginBottom = '-6px';
    var oh = card.offsetHeight;
    card.style.height = oh + 'px';
    void nc.offsetWidth;
    nc.classList.add('b-grow'); card.classList.add('b-grow');
    nc.style.height = h + 'px'; nc.style.marginBottom = '0px';
    card.style.height = '0px'; card.style.paddingTop = '0px'; card.style.paddingBottom = '0px'; card.style.marginBottom = '-6px';
    if (tl.scrollTop > 0) glide(s, tl, 0, 450);
    await s.wait(500);
    var B = at(nc, view);
    var an = ghost.animate([
      { transform: 'translate(0,0) scale(1.02)' },
      { transform: 'translate(' + (B.x - A.x) / 2 + 'px,' + (Math.min(0, B.y - A.y) / 2 - 24) + 'px) scale(1.04)', offset: .5 },
      { transform: 'translate(' + (B.x - A.x) + 'px,' + (B.y - A.y) + 'px) scale(1)' }
    ], { duration: dur(720), easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' });
    await s.wait(740);
    an.cancel(); ghost.remove(); card.remove();
    nc.classList.remove('b-landing', 'b-grow'); nc.style.height = ''; nc.style.marginBottom = '';
    nc.classList.add('b-fresh');
    var fn = $('.b-coln', from), tn = $('.b-coln', to);
    fn.textContent = Math.max(0, +fn.textContent - 1); tn.textContent = +tn.textContent + 1;
    bump(fn); bump(tn);
  }

  J.screen('tracker', {
    theme: 'light',
    draw: function (view, d, st, beat, beats) {
      view.innerHTML = shell('tracker', trackerHTML(st, beats, idx(beats, beat)));
    },
    play: async function (s, view, d, st, beat) {
      await s.wait(900);
      for (var k = 0; k < d.move.length; k++) {
        await move(s, view, d.move[k], beat.wk);
        await s.wait(650);
      }
      await s.wait(300);
    }
  });

  /* ---------- Explore: every role, by the level that opens it ---------- */
  function levels() {
    var out = [];
    D.ROLES.forEach(function (r) { if (out.indexOf(r.lvl) < 0) out.push(r.lvl); });
    return out.sort(function (a, b) { return a - b; });
  }
  function exRow(r, open, want) {
    return '<div class="b-er' + (open ? '' : ' lk') + (want ? ' want' : '') + '" data-id="' + r.id + '">' + J.logo(r.dom, 36) +
      '<span class="b-who"><span class="b-tl"><span class="b-tt">' + esc(r.title) + '</span>' + (want ? '<span class="b-want">The one she wants</span>' : '') + '</span>' +
      '<span class="b-co">' + esc(r.co) + '<i></i>' + esc(r.mode) + '</span></span>' +
      '<span class="b-pay">' + esc(r.pay) + '</span>' + fitMark(r) + heartBtn(want) +
      '<span class="b-ac"><span class="b-lkd">' + BI.lock + '<span>Opens at Level ' + r.lvl + '</span></span><button class="b-btn b-sm b-eap"' + (open ? '' : ' tabindex="-1"') + '>Apply</button></span></div>';
  }
  function exploreHTML(d, openLv) {
    return '<div class="b-hrow"><h1 class="b-h1">Explore</h1></div>' +
      '<div class="b-focus"><span class="b-focus-l">Your focus</span>' + D.MAYA.focus.map(function (f) { return '<span class="b-chip">' + esc(f) + '</span>'; }).join('') + '</div>' +
      '<section class="b-ec"><div class="b-es">' + levels().map(function (L) {
        return '<section class="b-grp" data-l="' + L + '"><header class="b-gh"><span class="b-gh-t">Level ' + L + '</span><span class="b-gh-n">' + (D.OPEN[L] - D.OPEN[L - 1]) + ' roles</span></header>' +
          D.ROLES.filter(function (r) { return r.lvl === L; }).map(function (r) { return exRow(r, r.lvl <= openLv, r.id === d.want); }).join('') + '</section>';
      }).join('') + '</div></section>';
  }

  J.screen('explore', {
    theme: 'light',
    draw: function (view, d) {
      view.innerHTML = shell('explore', exploreHTML(d, d.from));
      var es = $('.b-es', view), g = $('.b-grp[data-l="' + d.from + '"]', view);
      if (g) es.scrollTop = g.offsetTop;
    },
    play: async function (s, view, d) {
      var es = $('.b-es', view);
      await s.wait(1100);
      for (var L = d.from + 1; L <= d.to; L++) {
        var g = $('.b-grp[data-l="' + L + '"]', view); if (!g) continue;
        var rows = $$('.b-er.lk', g);
        var need = g.offsetTop + g.offsetHeight - es.clientHeight;
        if (g.offsetTop < es.scrollTop || need > es.scrollTop) await glide(s, es, L === d.from + 1 ? Math.max(es.scrollTop, need) : g.offsetTop, 900);
        await s.wait(300);
        for (var k = 0; k < rows.length; k++) {
          rows[k].classList.add('turn');
          await s.wait(280);
          rows[k].classList.remove('lk');
          var b = $('.b-eap', rows[k]); if (b) b.removeAttribute('tabindex');
          await s.wait(220);
        }
        await s.wait(450);
      }
      var w = $('.b-er[data-id="' + d.want + '"]', view);
      if (w) {
        await glide(s, es, w.closest('.b-grp').offsetTop, 800);
        await s.wait(200);
        w.classList.add('hl');
        await s.wait(1400);
      }
    }
  });

  /* ---------- the offer arrives by email, outside Zero: a plain mail client ---------- */
  function mItem(o) {
    return '<div class="b-mi' + (o.cls ? ' ' + o.cls : '') + '" role="button" tabindex="0"><div class="b-mi-in">' +
      (o.logo ? J.logo(o.logo, 32, 'round') : J.av({ ini: o.ini, t: o.t || 't2' }, 32)) +
      '<span class="b-mi-tx"><span class="b-mi-r1"><span class="b-mi-who">' + esc(o.who) + '</span><span class="b-mi-t">' + esc(o.time) + '</span></span>' +
      '<span class="b-mi-sub">' + esc(o.sub) + '</span><span class="b-mi-sn">' + esc(o.snip) + '</span></span>' +
      (o.dot ? '<i class="b-mi-dot"></i>' : '') + '</div></div>';
  }
  J.screen('mail', {
    theme: 'light',
    draw: function (view, d) {
      var f = d.from, r = role(d.role), fn = first(f.name);
      var subj = 'Offer: ' + r.title + ' at ' + f.co;
      var boxes = [['inbox', 'Inbox'], ['star', 'Starred'], ['sent', 'Sent'], ['draft', 'Drafts'], ['archive', 'Archive']];
      view.innerHTML = '<div class="b-mail">' +
        '<aside class="b-ms">' +
          '<div class="b-ms-me">' + J.av('maya', 28) + '<span>Maya Reyes</span></div>' +
          '<button class="b-btn b-ms-new">' + BI.pen + '<span>New message</span></button>' +
          '<nav class="b-ms-nav" aria-label="Mailboxes">' + boxes.map(function (b) {
            return '<button class="b-ms-b' + (b[0] === 'inbox' ? ' on' : '') + '">' + BI[b[0]] + '<span>' + b[1] + '</span>' + (b[0] === 'inbox' ? '<span class="b-ms-n"></span>' : '') + '</button>';
          }).join('') + '</nav>' +
        '</aside>' +
        '<section class="b-ml"><header class="b-ml-h"><span class="b-ml-t">Inbox</span><span class="b-ml-s">' + BI.search + '</span></header><div class="b-ml-l">' +
          mItem({ cls: 'b-new pre', logo: f.dom, who: f.name, time: '9:41 AM', sub: subj, snip: 'Hi Maya, we are thrilled to offer you the role.', dot: 1 }) +
          mItem({ logo: f.dom, who: f.name, time: 'Fri', sub: 'Re: Final round', snip: 'Thanks for walking us through your work today. We will be in touch soon.' }) +
          mItem({ logo: f.dom, who: f.co + ' Recruiting', time: 'Wed', sub: 'Your interviews for ' + r.title, snip: 'Here are the times for your calls with the team.' }) +
          mItem({ ini: 'AG', t: 't3', who: 'Austin GTM Meetup', time: 'Tue', sub: 'This month: AI agents in RevOps', snip: 'Thursday at 6pm. Three short demos, then drinks.' }) +
        '</div></section>' +
        '<section class="b-mv">' +
          '<div class="b-mv-e">' + BI.open + '<span>No message selected</span></div>' +
          '<article class="b-msg" aria-label="' + esc(subj) + '">' +
            '<div class="b-mv-bar"><button class="b-ib" aria-label="Reply">' + BI.reply + '</button><button class="b-ib" aria-label="Archive">' + BI.archive + '</button><button class="b-ib" aria-label="Delete">' + BI.trash + '</button></div>' +
            '<h2 class="b-msg-sub">' + esc(subj) + '</h2>' +
            '<div class="b-msg-from">' + J.logo(f.dom, 40, 'round') + '<span class="b-who"><span class="b-tt">' + esc(f.name) + '</span><span class="b-co">' + esc(f.title + ', ' + f.co) + '</span></span><span class="b-msg-t">9:41 AM</span></div>' +
            '<div class="b-msg-body"><p>Hi Maya,</p><p>We are thrilled to offer you the ' + esc(r.title) + ' role at ' + esc(f.co) + '.</p>' +
              '<p>Your salary is ' + esc(d.pay) + ' a year, and your first day is ' + esc(d.start) + '.</p><p>We would love to have you.</p><p>' + esc(fn) + '</p></div>' +
            '<div class="b-att">' + BI.file + '<span class="b-att-t">Offer letter.pdf</span><span class="b-att-s">84 KB</span></div>' +
            '<div class="b-rp"><div class="b-rp-to">To ' + esc(f.name) + '</div><div class="b-rp-tx" data-ph="Write a reply"></div><div class="b-rp-f"><button class="b-key b-send">Send' + IC.send + '</button></div></div>' +
            '<div class="b-sent">' + J.av('maya', 28) + '<span class="b-sent-tx"><span class="b-sent-r1"><span class="b-tt">Maya Reyes</span><span class="b-msg-t">Now</span></span><span class="b-sent-m">Yes! I accept. Thank you so much.</span></span></div>' +
          '</article>' +
        '</section></div>';
    },
    play: async function (s, view) {
      var item = $('.b-new', view), cnt = $('.b-ms-n', view), mv = $('.b-mv', view);
      await s.wait(900);
      item.classList.remove('pre');
      cnt.textContent = '1'; bump(cnt);
      await s.wait(1400);
      await s.press(item, 700);
      item.classList.add('sel', 'read'); mv.classList.add('open');
      cnt.textContent = '';
      await s.wait(2800);
      var rp = $('.b-rp', view), tx = $('.b-rp-tx', view);
      rp.classList.add('focus');
      await s.wait(400);
      await s.type(tx, 'Yes! I accept. Thank you so much.', 24);
      await s.wait(500);
      await s.press($('.b-send', view), 700);
      mv.classList.add('sent');
      await s.wait(900);
    }
  });

  /* ---------- the end: hired ---------- */
  function seeded(n) { var x = n; return function () { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
  function confetti() {
    var rnd = seeded(7), cols = ['#F2C14E', '#E9A21F', '#3E63DD', '#8E4EC6', '#E5484D', '#F5C9A8', '#C7D2F7', '#DCC6F2'], out = '';
    for (var i = 0; i < 46; i++) {
      var w = 5 + rnd() * 5, h = rnd() > .5 ? w * 1.7 : w;
      out += '<i style="left:' + (2 + rnd() * 96).toFixed(1) + '%;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;background:' + cols[i % cols.length] +
        ';border-radius:' + (rnd() > .6 ? '99px' : '2px') + ';--x:' + ((rnd() - .5) * 120).toFixed(0) + 'px;--r:' + ((rnd() - .5) * 720).toFixed(0) + 'deg;--t:' + (2.4 + rnd() * 1.6).toFixed(2) + 's;--d:' + (rnd() * .9).toFixed(2) + 's"></i>';
    }
    return '<div class="b-cf" aria-hidden="true">' + out + '</div>';
  }
  J.screen('hired', {
    theme: 'light',
    draw: function (view, d) {
      var key = D.CASES[d.caseKey] ? d.caseKey : J.story.caseKey, o = D.CASES[key].outcome;
      var facts = [['Time', o.weeks + ' weeks'], ['Scenarios done', o.scenarios], ['Level reached', 'Level ' + o.level], ['Applications', o.applied], ['Coach stepped in', o.coach + (o.coach === 1 ? ' time' : ' times')]];
      view.innerHTML = '<div class="b-hd">' + confetti() +
        '<header class="b-hd-top"><span class="b-hd-wm">' + J.wordmark('b-hd-wms') + '</span>' + J.hud({ light: true }) + '</header>' +
        '<div class="b-hd-main">' +
          '<div class="b-hd-pair b-rise" style="--d:0">' + J.av('maya', 60) + J.logo(o.dom, 60, 'round') + '</div>' +
          '<div class="b-hd-tw b-rise" style="--d:1"><h1 class="b-hd-t">Hired</h1><span class="b-hd-z">' + J.zero(64, 'working') + '</span></div>' +
          '<p class="b-hd-role b-rise" style="--d:2">' + esc(o.role) + ' at ' + esc(o.co) + '</p>' +
          '<p class="b-hd-pay b-rise" style="--d:2">' + esc(o.pay) + ' a year</p>' +
          '<div class="b-hd-facts">' + facts.map(function (f, i) {
            return '<div class="b-fact b-rise" style="--d:' + (3 + i * .5) + '"><span class="b-fact-l">' + esc(f[0]) + '</span><span class="b-fact-v">' + esc(f[1]) + '</span></div>';
          }).join('') + '</div>' +
          '<div class="b-hd-cmp">' + ['best', 'mid', 'worst'].map(function (k, i) {
            var c = D.CASES[k], oc = c.outcome, cur = k === key;
            return '<div class="b-cc b-rise' + (cur ? ' cur' : '') + '" style="--d:' + (6 + i * .5) + '">' +
              '<div class="b-cc-h"><span class="b-cc-n">' + esc(c.name) + '</span></div>' +
              '<div class="b-cc-r">' + J.logo(oc.dom, 36, 'round') + '<span class="b-who"><span class="b-tt">' + esc(oc.role) + '</span><span class="b-co">' + esc(oc.co) + '</span></span></div>' +
              '<div class="b-cc-f"><span>Hired in ' + oc.weeks + ' weeks</span><span>Level ' + oc.level + '</span></div>' +
              (cur ? '<span class="b-cc-now"><i></i>Watching</span>' : '<button class="b-btn b-sm b-cc-go" data-k="' + k + '">Watch the ' + esc(c.short.toLowerCase()) + ' case</button>') +
            '</div>';
          }).join('') + '</div>' +
        '</div></div>';
      $$('.b-cc-go', view).forEach(function (b) { b.addEventListener('click', function () { J.loadCase(b.getAttribute('data-k')); }); });
    },
    play: async function (s, view) {
      await s.wait(80);
      $('.b-hd', view).classList.add('go');
      await s.wait(3200);
    }
  });
})();
