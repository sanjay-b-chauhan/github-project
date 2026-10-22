/* Zero b12 dock: the level and the coach in one pill, top right of the app. It grows into the panel.
   Level (from the meeting): where you are and how far to the next level; the NEXT level big, with real roles from the portal
   and "and N more"; later levels condensed (hover for the count); no past levels, no skill points per level, no View all.
   Coach (Navid): one job, earn you skill points. In a scenario the pill shows "Up to N" (what is still possible), the panel
   shows the three targets and their state; outside a scenario it answers "how do I level up faster". When points are at
   stake the coach pauses the app (freeze): the screen blurs, one card, Got it. Wins and tips are short notes. */
(function () {
  'use strict';
  var D = window.ZD, A = D.A, J = window.J;
  var $ = J.$, $$ = J.$$, esc = J.esc, n = J.n, logo = J.logo, badge = J.badge, IC = J.IC;
  var LADDER = D.LADDER;

  var S = { coachKey: 'navi', tab: null, pop: null, dot: false, call: null, st: J.fresh(), root: null, upShown: null, coachShown: false };
  function CO() { for (var i = 0; i < D.COACHES.length; i++) if (D.COACHES[i].key === S.coachKey) return D.COACHES[i]; return D.COACHES[0]; }
  function lv() { return D.levelOf(S.st.pts); }
  function into() { var L = lv(); return L >= 10 ? 1 : Math.min(1, (S.st.pts + (S.st.kept || 0) - D.startOf(L)) / 1000); }
  function W() { return S.tab === 'level' && S.rkx ? 800 : 432; }   /* b36: a rank opens wide */
  function fav(dom, size) { return '<span class="fv" style="--v:' + (size || 22) + 'px"><img alt="" src="https://www.google.com/s2/favicons?sz=64&domain=' + esc(dom) + '"></span>'; }
  function scName(k) { var s = D.SC[k]; return s ? s.title + ' at ' + J.coName(s.co) : ''; }
  function mgrName(k) { var s = D.SC[k]; return s ? D.P[s.mgr].first : 'your manager'; }
  var STATE = { hit: ['Locked in', 'hit'], on: ['On track', 'on'], strike: ['Strike one', 'strike'], lost: ['Lost', 'lost'] };

  function mount(app) {
    var el = document.createElement('div');
    el.innerHTML = '<div class="toasts" aria-live="polite"></div>' +
      '<div class="dk solo"><div class="dk-bg"></div>' +
        '<div class="pill" role="tablist" aria-label="Level and coach">' +
          '<button class="seg lv" role="tab" data-tab="level"></button><i class="sep"></i>' +
          '<button class="seg co" role="tab" data-tab="coach" aria-label="Your coach"><span class="me"><img alt="" src="' + CO().photo + '"><i class="dot"></i></span><span class="upt"><i>Up to</i><b></b></span><span class="lbl">Coach</span></button>' +
        '</div>' +
        '<div class="dk-body"><div><div class="dk-sc"></div></div></div>' +
      '</div>';
    while (el.firstChild) app.appendChild(el.firstChild);
    S.root = app;
    $$('.seg', app).forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.call) endCall(); else if (S.pop) setPop(null); else close(); } });
    document.addEventListener('pointerdown', function (e) {
      if (S.pop && !e.target.closest('.pop,.q,.ib.edit')) setPop(null);
      if (S.tab && !e.target.closest('.dk,.toasts,#ctl,.cz')) close();
    });
    $('.dk-sc').addEventListener('scroll', fade);
    draw();
    /* warm the company icons the level panel shows */
    D.LEVELS.forEach(function (x) { (x.top || []).forEach(function (r) { var i = new Image(); i.src = 'https://www.google.com/s2/favicons?sz=64&domain=' + r.dom; }); });
  }

  /* ---------- the pill ---------- */
  function upTo() { return S.st.track ? D.upTo(S.st.track) : 0; }
  function draw(anim) {
    var L = lv(), dk = $('.dk');
    /* b15: the points Navid's fixes keep show up here as they happen, in the reward colour, before the grade makes them real */
    var k = S.st.kept || 0, tt = S.st.pts + k;   /* b19: the pill shows total XP, the same number the rank panel shows */
    $('.seg.lv').innerHTML = rb(L) + '<span class="tl">Level</span><span class="tx"><b>Level ' + L + '</b><span class="pts"><span class="mini"><i style="width:' + Math.round(into() * 100) + '%"></i></span></span></span>';
    $('.seg.lv').setAttribute('aria-label', 'Level ' + L + (k ? ', ' + n(k) + ' skill points kept this scenario' : '') + ', ' + n(Math.max(0, D.startOf(Math.min(10, L + 1)) - S.st.pts - k)) + ' to the next level');
    var img = $('.seg.co .me img'); if (img && img.getAttribute('src') !== CO().photo) img.src = CO().photo;
    $('.dk .dot').classList.toggle('on', S.dot);
    var on = !!S.st.coachOn;
    if (on && !S.coachShown && anim) { dk.classList.remove('solo'); dk.classList.add('arrive'); setTimeout(function () { dk.classList.remove('arrive'); }, 900); }
    dk.classList.toggle('solo', !on);   /* b25: the coach is back in the pill. No pulse: he comes in on his own when he has something */
    dk.classList.toggle('cv-live', cstate() > 0);
    S.coachShown = on;
    var u = upTo(), up = $('.seg.co .upt');
    up.classList.toggle('on', !!u);
    if (u) {
      var b = $('b', up), was = S.upShown;
      if (anim && was != null && was !== u) {
        up.classList.remove('dn', 'upp'); void up.offsetWidth; up.classList.add(u < was ? 'dn' : 'upp');
        countTo(b, was, u);
      } else b.textContent = n(u);
      S.upShown = u;
    } else S.upShown = null;
    if (!S.tab) fitClosed();
  }
  function countTo(el, a, b) {
    var t0 = performance.now(), d = 900;
    (function f() { var k = Math.min(1, (performance.now() - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = n(a + (b - a) * e); if (k < 1) requestAnimationFrame(f); })();
  }
  function closedW() {
    var g = document.createElement('div'); g.className = $('.dk').className.replace(/\b(open|arrive)\b/g, '');
    g.style.cssText = 'visibility:hidden;left:-9999px;right:auto;width:auto;transition:none;pointer-events:none';
    var p = $('.pill').cloneNode(true); $$('.seg', p).forEach(function (x) { x.classList.remove('on'); });
    g.appendChild(p); S.root.appendChild(g);
    var w = Math.ceil(g.getBoundingClientRect().width / (parseFloat(getComputedStyle(document.getElementById('app')).zoom) || 1)); g.remove(); return w;
  }
  function fitClosed() { $('.dk').style.width = closedW() + 'px'; }

  function toggle(tab) { if (document.documentElement.classList.contains('zx-turn')) return; if (S.tab === tab) close(); else open(tab); }
  function open(tab) {
    if (tab === 'coach' && !S.st.coachOn) tab = 'level';
    var was = S.tab; S.tab = tab;
    var eh = $('.ex-hint'); if (eh) { eh.classList.remove('on'); setTimeout(function () { eh.remove(); }, 400); }
    var dk = $('.dk'); dk.classList.add('open'); dk.classList.toggle('dk-dark', tab === 'coach'); dk.style.width = W() + 'px';   /* b38: Coach is black, Rank is light */
    $('.toasts').classList.add('beside');
    $$('.seg').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (tab === 'coach' && S.dot) { S.dot = false; $('.dk .dot').classList.remove('on'); }
    if (was !== tab) { S.pop = null; S.ask = null; render(true); }
  }
  function close() {
    if (!S.tab) return;
    if (S.call) endCall();
    S.tab = null; S.pop = null; S.rkx = null;
    $('.dk').classList.remove('open', 'dk-dark'); $('.toasts').classList.remove('beside');
    $$('.seg').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    fitClosed();
  }
  function render(anim) {
    if (!S.tab) return;
    var sc = $('.dk-sc'), top = sc.scrollTop;
    sc.innerHTML = '<div class="' + (anim ? 'view' : '') + '">' + (S.tab === 'level' ? levelView() : coachView()) + '</div>';
    sc.scrollTop = anim ? 0 : top;
    if (S.tab === 'level') wireLevel(); else wireCoach();
    wirePop();
    setTimeout(fade, 520);
  }
  function fade() { var sc = $('.dk-sc'); if (sc) sc.classList.toggle('more', sc.scrollHeight - sc.scrollTop - sc.clientHeight > 4); }

  var popT = 0;
  function setPop(k) {
    S.pop = k;
    $$('.dk .q').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-q') === k); });
    var eb = $('.ib.edit'); if (eb) eb.classList.toggle('on', k === 'sw');
    $$('.dk .pop').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-q') === k); });
  }
  function wirePop() {
    $$('.dk .q').forEach(function (b) {
      var k = b.getAttribute('data-q');
      b.addEventListener('click', function () { setPop(S.pop === k ? null : k); });
      b.addEventListener('mouseenter', function () { clearTimeout(popT); setPop(k); });
      b.addEventListener('mouseleave', function () { popT = setTimeout(function () { if (S.pop === k) setPop(null); }, 220); });
      var p = $('.dk .pop[data-q="' + k + '"]');
      if (p) { p.addEventListener('mouseenter', function () { clearTimeout(popT); }); p.addEventListener('mouseleave', function () { popT = setTimeout(function () { if (S.pop === k) setPop(null); }, 220); }); }
    });
  }

  /* ---------- Level: where you are, what is next (big), what is later (small) ---------- */
  /* ================= b18: the rank panel =================
     Top: the badge, Rank N, your total XP on the right; the bar with where this rank starts and ends; how much to the next.
     Next rank: what it gets you and why it works, in two lines, then real roles (the third blurred, LinkedIn style).
     Every rank after it: what roles it opens and the XP it needs, locked; open one to see who is hiring (one role you
     can read, the rest blurred). No logos on their own, no "Later" label, no "?". */
  var LOCK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.6"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/></svg>';
  function total() { return S.st.pts + (S.st.kept || 0); }
  function topPay(p) { var m = /to \$?([A-Z]*\$?[\d.,]+k)/.exec(p || ''); return m ? (m[1].charAt(0) === '$' || /^[A-Z]/.test(m[1]) ? m[1] : '$' + m[1]) : ''; }
  function teams(x) { var c = []; (x.top || []).forEach(function (r) { if (c.indexOf(r.co) < 0) c.push(r.co); }); return c.slice(0, 2); }
  function role(r) { return '<div class="nx-r">' + fav(r.dom, 26) + '<div><b>' + esc(r.t) + '</b><span>' + esc(r.co) + (r.pay && r.pay !== 'Not posted' ? ' · ' + esc(r.pay) : '') + '</span></div></div>'; }
  /* b20: one way to show what a rank gets you: a line, two roles you can read, the rest blurred and locked */
  /* b34: an opened rank never repeats its number. It says what it takes (the XP, in real scenarios), who hires there
     and for what, and the two stats those teams hire for, next to where your coach has you now. Stand-in mapping. */
  var NEED = { 2: [['com', 'Good'], ['ind', 'Good']], 3: [['qua', 'Good'], ['und', 'Good']], 4: [['com', 'Great'], ['ai', 'Good']],
    5: [['qua', 'Great'], ['spd', 'Great']], 6: [['und', 'Great'], ['ind', 'Great']], 7: [['ai', 'Great'], ['com', 'Great']],
    8: [['qua', 'Exceptional'], ['und', 'Great']], 9: [['com', 'Exceptional'], ['ind', 'Exceptional']], 10: [['qua', 'Exceptional'], ['und', 'Exceptional']] };
  var WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function cnt(k) { return k <= 10 ? WORD[k] : n(k); }
  function pathText(r) {
    var need = D.startOf(r) - total();
    if (need <= 0) return 'You have the XP. It lands with your next grade.';
    var m = Math.ceil(need / 1000), e = Math.ceil(need / 2000);
    return '<b>' + n(need) + ' XP</b> away. ' + (m === 1 ? 'One Meeting scenario gets you there.' : 'About ' + cnt(m) + ' Meeting scenarios, or ' + cnt(e) + ' at Exceeding.');
  }
  function needHTML(y) {
    var k = cstate();
    return '<h5>Teams here hire for</h5>' + (NEED[y.n] || []).map(function (q) {
      var i = STATS.findIndex(function (x) { return x.i === q[0]; }), x = STATS[i], want = SCALE.filter(function (b) { return b.w === q[1]; })[0];
      var v = statVal(i, k), b = v == null ? null : band(v), met = b && b.at >= want.at;
      return '<div class="rk-nd"><b>' + esc(x.n) + '</b><em>' +
        (met ? '<span style="color:' + b.t + '">' + b.w + '</span><i class="ok">' + IC.tick + '</i>' :
          '<span' + (b ? ' style="color:' + b.t + '"' : ' class="cal"') + '>' + (b ? b.w : 'Calibrating') + '</span><i class="to">→</i><span style="color:' + want.t + '">' + want.w + '</span>') + '</em></div>';
    }).join('');
  }
  function gets(y) {
    var tm = teams(y), pay = topPay(y.pay);
    return '<p class="rk-path" data-n="' + y.n + '">' + pathText(y.n) + '</p>' +
      '<p class="rk-gets">' + (tm.length ? esc(tm.join(' and ')) + ' hire here' : 'More teams hire here') + (pay ? ', with pay up to <b>' + esc(pay) + '</b>' : '') + '.</p>';
  }
  function patchRank() {
    $$('.rk-path[data-n]').forEach(function (p) { p.innerHTML = pathText(+p.getAttribute('data-n')); });
    $$('.rx-go[data-n]').forEach(function (p) { p.innerHTML = goHTML(+p.getAttribute('data-n')); });
    $$('.rb-go[data-n]').forEach(function (p) { p.innerHTML = goShort(+p.getAttribute('data-n')); });
    $$('.rb-way[data-n]').forEach(function (p) { p.innerHTML = wayText(+p.getAttribute('data-n')); });
    $$('.lb').forEach(function (p) { var t = document.createElement('div'); t.innerHTML = leader(); if (p.outerHTML !== t.firstChild.outerHTML) p.replaceWith(t.firstChild); });
    $$('.rx-lad[data-n]').forEach(function (p) { var b = $('.rl-t b', p), w = ladHTML(+p.getAttribute('data-n')).match(/width:([\d.]+)%/)[1]; if (b) b.style.width = w + '%'; });
    $$('.rk-need[data-n]').forEach(function (p) { var y = D.LEVELS[+p.getAttribute('data-n') - 1]; if (y) p.innerHTML = needHTML(y); });
  }
  function roles(y, icon) {
    var t = y.top || [];
    return '<div class="nx-rs">' + t.slice(0, 2).map(role).join('') +
      (t[2] ? '<div class="nx-lock">' + role(t[2]) + '<em>' + icon + '<b>' + Math.max(0, y.roles - 2) + ' more roles</b></em></div>' : '') + '</div>';
  }
  /* b25: a badge with a number you can read */
  function rb(k, cls) { return '<span class="rkb' + (cls ? ' ' + cls : '') + '">' + badge(k) + '<b>' + k + '</b></span>'; }
  /* ================= b41: the rank panel from the boss's sketch =================
     Your rank and XP; then the next rank as the hero: what it opens, what is different about those jobs (the companies,
     the work, the salary, what they want to see from you), and the roles waiting (six to ten, real). Every rank after it
     says the same, but less. See details opens the wide view. The b40 panel stays one setting away. */
  function diffRows(y, z, L, full) {
    var cur = RK(L), cos = []; z.roles.forEach(function (o) { if (cos.indexOf(o.dom) < 0) cos.push(o.dom); });
    var up = z.est - cur.est;
    var rows = [];
    if (full) rows.push(['Companies', '<span class="rb-cos">' + cos.slice(0, 4).map(function (d) { return fav(d, 18); }).join('') + '</span><span>' + esc(z.co) + (z.size ? ' · ' + esc(z.size) : '') + '</span>']);
    rows.push(['The work', '<span>' + esc(z.work) + '</span>']);
    rows.push(['The salary', '<span><b>' + money(cur.est) + ' → ' + money(z.est) + '</b>' + (up > 0 ? ' <em>+' + money(up) + ' a year, est.</em>' : ' <em>est.</em>') + '</span>']);
    if (full) rows.push(['They want to see', '<span>' + esc(z.want) + '</span>']);
    return '<div class="rb-diff">' + rows.map(function (r) { return '<div class="rb-d"><span class="rb-l">' + r[0] + '</span><div class="rb-v">' + r[1] + '</div></div>'; }).join('') + '</div>';
  }
  function waiting(y, z, k) {
    var list = z.roles.slice(0, k), more = Math.max(0, (y.roles || z.count) - list.length);
    return '<div class="rb-roles">' + list.map(function (o) {
      return '<div class="rb-role">' + fav(o.dom, 22) + '<div><b>' + esc(o.t) + '</b><span>' + esc(o.co) + '</span></div><em>' + esc(o.pay) + '</em></div>';
    }).join('') + (more ? '<div class="rb-role rb-more"><span class="rb-lk">' + LOCK + '</span><b>' + more + ' more roles</b></div>' : '') + '</div>';
  }
  function goShort(r) { return '<b>' + n(Math.max(0, D.startOf(r) - total())) + ' XP</b> to go'; }
  function wayText(r) { return pathText(r).replace(/^<b>[^<]*<\/b> away\. /, ''); }
  /* the roles at a glance: a row of their logos, then how many open here */
  function rolesRow(y, z) {
    var doms = []; z.roles.forEach(function (o) { if (doms.indexOf(o.dom) < 0) doms.push(o.dom); });
    return '<div class="rb-rr"><span class="rb-cir">' + doms.slice(0, 6).map(function (d) { return fav(d, 26); }).join('') + '</span>' +
      '<span class="rb-rt"><b>' + (y.roles || z.count) + ' roles</b> open at this level</span></div>';
  }
  /* b44: the companies a level opens, named by kind, with two you would know */
  /* b48: the second fact is the KIND of role a level opens (from the portal's own roles), with the shortest real title as the example */
  function kindOf(y) { var k = y.kind || 'Roles'; return /^[A-Z][a-z]/.test(k) ? k : k.charAt(0).toUpperCase() + k.slice(1); }
  function roleLike(z, y) {
    var k = ((y && y.kind) || '').toLowerCase();
    var t = z.roles.slice(0, 3).map(function (o) { return o.t.replace(/\s*[-(].*$/, ''); }).sort(function (a, b) { return a.length - b.length; })
      .filter(function (x) { return k.indexOf(x.toLowerCase()) < 0; })[0];   /* never "GTM engineer roles, like GTM Engineer" */
    return t ? ', like ' + esc(t) : '';
  }
  function coLike(z) { var c = []; z.roles.forEach(function (o) { if (c.indexOf(o.co) < 0) c.push(o.co); }); return c.length > 1 ? ', like ' + esc(c[0]) + ' and ' + esc(c[1]) : ''; }
  /* two short facts: the salary jump and the kind of company */
  function facts(z, L, y) {
    y = y || {};
    var cur = RK(L), up = z.est - cur.est;
    return '<div class="rb-facts"><div><span>Est. salary</span><b>' + money(z.est) + '</b><em>' + (up > 0 ? '+' + money(up) + ' a year' : 'Same band') + '</em></div>' +
      '<div><span>Roles</span><p>' + esc(kindOf(y)) + '</p></div></div>';
  }
  /* ================= b43: levels 1 to 10, a leaderboard apart from them, learning first on the early levels ================= */
  function leader() {
    var T = total(), all = 312, pos = Math.max(1, Math.round(55 * 670 / (T + 200))), pct = Math.max(1, Math.round(pos / all * 100));
    var I = D.ME.photo.replace(/[^\/]*$/, ''), faces = ['avery', 'daniel', 'esther', 'nadeem'].map(function (f) { return I + f + '.jpg'; }).concat((D.COACHES || []).slice(1).map(function (c) { return c.photo; }));
    var rows = [];
    for (var p = pos - 2; p <= pos + 2; p++) if (p >= 1) rows.push(p);
    return '<section class="lb" data-pos="' + pos + '"><div class="lb-hd"><h4>Leaderboard</h4><span>This week · Top ' + pct + '% of ' + all + '</span></div><div class="lb-list">' + rows.map(function (p, i) {
      var me = p === pos, xp = me ? T : Math.max(0, T + (pos - p) * 41);
      return '<div class="lb-r' + (me ? ' lb-me' : ' lb-bl') + '"><b>#' + p + '</b><img alt="" src="' + (me ? D.ME.photo : faces[(p * 3) % faces.length]) + '"><span>' + (me ? 'You' : 'Learner') + '</span><em>' + n(xp) + ' XP</em></div>';
    }).join('') + '</div></section>';
  }
  function picks(z, k) {
    return '<h5 class="rb-h5">Picked for you</h5><div class="rb-picks">' + z.roles.slice(0, k).map(function (o) {
      return '<div class="rb-pk">' + fav(o.dom, 22) + '<div><b>' + esc(o.t) + '</b><span>' + esc(o.co) + ' · ' + esc(o.pay) + '</span></div></div>';
    }).join('') + '</div>';
  }
  function learnBlock(z) { return '<h5 class="rb-h5">What you’ll learn</h5><ul class="rb-learn">' + (z.learn || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  function salLine(z, L) { var up = z.est - RK(L).est; return '<p class="rb-sal">Est. salary <b>' + money(z.est) + '</b>' + (up > 0 ? ', +' + money(up) + ' a year' : '') + '</p>'; }
  function nextBody(y, z, L) { return y.n <= 3 ? learnBlock(z) + picks(z, 2) + salLine(z, L) : picks(z, 3) + facts(z, L); }
  function whereGoes() {
    var a = RK(9), b = RK(10), doms = [];
    a.roles.concat(b.roles).forEach(function (o) { if (doms.indexOf(o.dom) < 0) doms.push(o.dom); });
    return '<button class="rb-where" data-rk="10"><span class="rb-cir">' + doms.slice(0, 4).map(function (d) { return fav(d, 24); }).join('') + '</span>' +
      '<span class="rb-wt"><b>Where this goes</b><em>' + esc(a.roles[0].co) + ', ' + esc(a.roles[1].co) + ' and more, up to ' + money(Math.max(a.top, b.top)) + '</em></span>' + IC.right + '</button>';
  }
  /* b45: a level's row is its name, three company logos and a circle with how many more roles wait there */
  function logosMore(q, zq) {
    var doms = []; zq.roles.forEach(function (o) { if (doms.indexOf(o.dom) < 0) doms.push(o.dom); });
    var all = q.roles || zq.count, more = Math.max(0, all - 3);
    return '<span class="lt-s lt-m">' + doms.slice(0, 3).map(function (d) { return fav(d, 22); }).join('') + (more ? '<span class="lt-more" title="' + all + ' roles">+' + more + '</span>' : '') + '</span>';
  }
  function levelBrief() {
    var L = lv(), next = Math.min(10, L + 1), top = L >= 10, T = total(), a = D.startOf(L), into1 = Math.max(0, Math.min(1, (T - a) / 1000));
    var h = '<div class="rk-hero" data-l="' + L + '">' + rb(L) +
      '<div class="rk-m"><h2>Level ' + L + '</h2>' +
        '<div class="lv-track"><i data-w="' + Math.round(into1 * 100) + '"></i></div>' +
        '<div class="rk-ends"><span><b>' + n(T - a) + '</b> / ' + (top ? 'top level' : '1,000 XP') + '</span></div>' +
      '</div></div>';
    if (top) return h + '<div class="nx"><div class="nx-k">Every role in the portal is open to you.</div></div>';
    var y = D.LEVELS[next - 1], z = RK(next);
    /* b42: condensed. The card is what you see at a glance: the roles as a row of logos with the count, the salary and
       the work as two short facts, and See more details for everything else (companies, what they want, every role). */
    h += '<section class="rb-next rb42"><div class="rb-hd">' + rb(next, 'rkb-lock') + '<div class="rb-t"><span>Next</span><b>Level ' + next + '</b></div>' +
        '<div class="rb-go" data-n="' + next + '">' + goShort(next) + '</div></div>' +
      rolesRow(y, z) + facts(z, L, y) +
      '<button class="rb-see" data-rk="' + next + '">See more details' + IC.right + '</button></section>';
    var later = D.LEVELS.filter(function (q) { return q.n > next; });
    if (later.length) h += '<h4 class="rb-h4 rb-all">All levels</h4><div class="rk-list rb-list">' + later.map(function (q) {
      var zq = RK(q.n);
      return '<div class="rk-r" data-n="' + q.n + '"><button class="rk-h" aria-expanded="false">' + rb(q.n, 'rkb-lock') +
          '<span class="rk-hn"><b>Level ' + q.n + '</b></span>' + logosMore(q, zq) + '</button>' +
        '<div class="rk-b"><div><div class="rk-in rb-in rb42">' + rolesRow(q, zq) + facts(zq, L, q) +
          '<button class="rb-see rb-see2" data-rk="' + q.n + '">See more details' + IC.right + '</button></div></div></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function levelView() {
    if (S.rkx) return rankDetail(S.rkx);
    if (!window.CFG || CFG.rankDesign !== 'ladder') return levelBrief();
    var L = lv(), next = Math.min(10, L + 1), top = L >= 10, x = D.LEVELS[next - 1], T = total();
    var a = D.startOf(L), into1 = Math.max(0, Math.min(1, (T - a) / 1000));
    /* b25 (founder): the rank, the bar, and one line under it: 470 / 1,000 */
    var h = '<div class="rk-hero" data-l="' + L + '">' + rb(L) +
      '<div class="rk-m"><h2>Level ' + L + '</h2>' +
        '<div class="lv-track"><i data-w="' + Math.round(into1 * 100) + '"></i></div>' +
        '<div class="rk-ends"><span><b>' + n(T - a) + '</b> / ' + (top ? 'top level' : '1,000 XP') + '</span></div>' +
      '</div></div>';
    if (top) return h + '<div class="nx"><div class="nx-k">Every role in the portal is open to you.</div></div>';
    h += '<div class="nx"><div class="nx-hd">' + rb(next, 'rkb-lock') + '<div class="nx-t"><span class="cl">Next</span><b>Level ' + next + '</b></div><span class="nx-n">Opens <b>' + x.roles + '</b> roles</span></div>' +
      gets(x) + roles(x, LOCK) + '<button class="nx-all" data-rk="' + next + '">Everything this level gets you' + IC.right + '</button></div>';
    var later = D.LEVELS.filter(function (y) { return y.n > next; });
    if (later.length) h += '<div class="rk-list">' + later.map(function (y) {
      /* b27: locked ranks are greyed; the row is the rank and who hires; opened, it reads like the next rank: two lines, two roles, the rest locked */
      return '<div class="rk-r" data-n="' + y.n + '"><button class="rk-h" aria-expanded="false">' + rb(y.n, 'rkb-lock') +
          '<span class="rk-hn"><b>Level ' + y.n + '</b></span>' +
          '<span class="lt-s">' + (y.top || []).slice(0, 3).map(function (r) { return fav(r.dom, 22); }).join('') + '</span></button>' +
        '<div class="rk-b"><div><div class="rk-in">' + gets(y) + roles(y, LOCK) + '</div></div></div></div>';
    }).join('') + '</div>';
    return h;
  }
  /* ================= b36: the big rank view (Nadeem's thoughts, through the founder) =================
     Click a rank and the panel opens wide. The point is to make you want the next rank, and to show why it beats the one
     before: what the pay jump is, the real roles it opens (six to eight), what you will have shown by then, what the
     companies are like, and what those teams hire for. Data: ranks.js, from the job portal's own roles. */
  function RK(n) { return (window.ZRANKS || [])[n - 1] || { est: 0, roles: [], traits: [], shown: [], sc: ['', '', ''], count: 0 }; }
  function money(v) { return '$' + n(v) + 'k'; }
  function openRank(r) { S.rkx = r; $('.dk').style.width = W() + 'px'; render(true); }
  function shutRank() { S.rkx = null; $('.dk').style.width = W() + 'px'; render(true); }
  /* b37: one job, make you want the next rank, and show why it beats the one before. Three numbers that grow (pay
     now and at this rank, the best pay open, how many roles are open), the real roles, the scenario that gets you
     there, and what the companies are like. Hairlines divide; only the numbers sit on a surface. */
  /* how close you are: XP to go, a bar from where your rank starts to where this one does, and in scenarios */
  function goHTML(r) {
    var L = lv(), here = r <= L, T = total(), a = D.startOf(r), toGo = Math.max(0, a - T), s0 = D.startOf(L);
    var prog = here ? 1 : Math.max(0, Math.min(1, (T - s0) / Math.max(1, a - s0)));
    return (here ? '<b>' + (r === L ? 'You’re here' : 'Reached') + '</b>' : '<b>' + n(toGo) + ' XP to go</b>') +
      '<span>' + (here ? 'Every role here is open to you' : pathText(r).replace(/^<b>[^<]*<\/b> away\. /, '')) + '</span>';
  }
  /* b39: the climb, one to ten, in the header's middle: where you are, where this rank is, how far between them */
  function ladHTML(r) {
    var L = lv(), T = total(), s0 = D.startOf(L), a = D.startOf(r);
    var prog = r <= L ? 0 : Math.max(0, Math.min(1, (T - s0) / Math.max(1, a - s0)));
    var span = Math.max(1, 10 - L), fill = r <= L ? 0 : (prog * (r - L)) / span, h = '';
    for (var k = L; k <= 10; k++) h += '<span class="rl-n' + (k <= L ? ' done' : '') + (k === r ? ' rl-tg' : '') + (k > Math.max(r, L) ? ' far' : '') + '"><b>' + k + '</b>' + (k === L ? '<em>You</em>' : '') + '</span>';
    return '<div class="rl"><i class="rl-t"><b style="width:' + (fill * 100).toFixed(1) + '%"></b></i>' + h + '</div>';
  }
  function delta(v, unit) { return v > 0 ? '+' + (unit ? money(v) : n(v)) : 'Same'; }
  function rankDetail(r) {
    var y = D.LEVELS[r - 1] || {}, z = RK(r), L = lv(), here = r <= L, cur = RK(L), pv = RK(Math.max(1, r - 1)), more = Math.max(0, (y.roles || z.count) - z.roles.length);
    var vs = r - 1 === L || r === 1 ? 'vs now' : 'vs Level ' + (r - 1);
    var cos = []; z.roles.forEach(function (o) { if (cos.indexOf(o.dom) < 0) cos.push(o.dom); });
    return '<div class="rx rx37">' +
      '<div class="rx-top"><button class="rx-back">' + IC.left + 'All levels</button><div class="rx-nav">' +
        '<button data-rx="-1" aria-label="Previous level"' + (r <= lv() + 1 ? ' disabled' : '') + '>' + IC.left + '</button><button data-rx="1" aria-label="Next level"' + (r >= 10 ? ' disabled' : '') + '>' + IC.right + '</button></div></div>' +
      '<div class="rx-hero">' + rb(r, here ? '' : 'rkb-lock') +
        '<div class="rx-ht"><h2>Level ' + r + '</h2><p>' + esc(y.kind || '') + '</p></div>' +
        '<div class="rx-lad" data-n="' + r + '">' + ladHTML(r) + '</div>' +
        '<div class="rx-go" data-n="' + r + '">' + goHTML(r) + '</div></div>' +
      '<div class="rx-nums">' +
        '<div><span>Est. pay</span><b>' + money(z.est) + '</b><em class="' + (z.est > cur.est ? 'up' : '') + '">' + (r === L ? 'Your level' : delta(z.est - cur.est, 1) + ' vs now') + '</em></div>' +
        '<div><span>Top pay open</span><b>' + (z.top ? money(z.top) : 'Not posted') + '</b><em class="' + (z.top > pv.top && r > 1 ? 'up' : '') + '">' + (r > 1 ? (pv.top ? delta(z.top - pv.top, 1) + ' ' + vs : 'First level with posted pay') : 'Pay not posted yet') + '</em></div>' +
        '<div><span>Roles open</span><b>' + n(z.open) + '</b><em class="' + (r > 1 ? 'up' : '') + '">' + (r > 1 ? '+' + n(z.open - pv.open) + ' ' + vs : 'Where everyone starts') + '</em></div>' +
      '</div>' +
      '<section class="rx-s"><div class="rx-sh"><h4>' + (here ? 'Roles open to you' : 'Roles this level opens') + '</h4><span class="rx-cos">' + cos.slice(0, 6).map(function (d) { return fav(d, 20); }).join('') + '</span></div>' +
        '<div class="rx-list">' + z.roles.map(function (o) {
          return '<div class="rx-row">' + fav(o.dom, 24) + '<div><b>' + esc(o.t) + '</b><span>' + esc(o.co) + (o.mode ? ' · ' + esc(o.mode) : '') + '</span></div><em>' + esc(o.pay) + '</em></div>';
        }).join('') + (more ? '<div class="rx-row rx-more"><span class="rx-lk">' + LOCK + '</span><b>' + more + ' more roles</b></div>' : '') + '</div></section>' +
      '<div class="rx-two">' +
        '<section class="rx-s"><h4>' + (here ? 'What you’ve demonstrated' : 'What you’ll have demonstrated') + '</h4>' +
          '<div class="rx-sc">' + fav(z.sc[2], 20) + '<span><b>' + esc(z.sc[0]) + '</b> for ' + esc(z.sc[1]) + '</span></div>' +
          '<ul class="rx-ul">' + z.shown.map(function (t) { return '<li>' + (here ? '<i>' + IC.tick + '</i>' : '<i class="o"></i>') + esc(t) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="rx-s"><h4>What\u2019s different about these jobs</h4><dl class="rx-dl"><div><dt>The work</dt><dd>' + esc(z.work || '') + '</dd></div><div><dt>They want to see</dt><dd>' + esc(z.want || '') + '</dd></div><div><dt>The companies</dt><dd>' + z.traits.map(esc).join('. ') + '.</dd></div></dl></section>' +
      '</div>' +
    '</div>';
  }
  function wireRank() {
    var b = $('.rx-back'); if (b) b.addEventListener('click', shutRank);
    $$('[data-rx]').forEach(function (x) { x.addEventListener('click', function () { var r = Math.max(lv() + 1, Math.min(10, S.rkx + +x.getAttribute('data-rx'))); S.rkx = r; render(true); }); });
  }
  function wireLevel() {
    if (S.rkx) { wireRank(); return; }
    requestAnimationFrame(function () { var b = $('.lv-track i'); if (b) b.style.width = b.getAttribute('data-w') + '%'; });
    $$('[data-rk]').forEach(function (b) { b.addEventListener('click', function () { openRank(+b.getAttribute('data-rk')); }); });
    $$('.rk-h').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if ((!window.CFG || CFG.rankDesign !== 'ladder') ? false : (!window.CFG || CFG.rankView !== 'inline')) { openRank(+btn.parentNode.getAttribute('data-n')); return; }
        var r = btn.parentNode, open = !r.classList.contains('on');
        $$('.rk-r.on').forEach(function (o) { o.classList.remove('on'); $('.rk-h', o).setAttribute('aria-expanded', 'false'); });
        if (open) { r.classList.add('on'); btn.setAttribute('aria-expanded', 'true'); }
        setTimeout(fade, 420);
      });
    });
  }

  /* ---------- Coach: how you earn more skill points ---------- */
  function rowsFor(t, opts) {
    var sc = t.sc;
    return (D.TG[sc] || []).map(function (g, i) {
      var v = t.s[g.id], st = STATE[v] || ['To play', 'open'];
      var show = opts && opts.how && v !== 'hit' && v !== 'lost';
      if (v !== 'hit' && v !== 'lost') st = [(v ? st[0] + ' · ' : 'Worth ') + n(worth(t)), st[1]];
      return '<div class="tg ' + st[1] + '"><span class="tg-i">' + (v === 'hit' ? IC.tick : v === 'lost' ? IC.x : v === 'strike' ? IC.bang : v === 'on' ? IC.tick : (i + 1)) + '</span>' +
        '<div class="tg-b"><b>' + esc(opts && opts.full ? g.t : g.short) + '</b>' + (show ? '<span>' + esc(g.how) + '</span>' : '') + '</div><em>' + st[0] + '</em></div>';
    }).join('');
  }
  /* what one open target is worth: how far the ceiling drops if it is lost */
  function worth(t) { var h = 0, o = 0; for (var k in t.s) { if (t.s[k] === 'hit') h++; else if (t.s[k] !== 'lost') o++; } return o ? LADDER[h + o] - LADDER[h + o - 1] : 0; }
  function levelAfter(gain) { return D.levelOf(S.st.pts + gain); }
  function coachHead() {
    var c = CO();
    return '<div class="co-hd"><img class="co-face" alt="" src="' + c.photo + '"><div class="co-nm"><b>' + esc(c.name) + '</b><span>Your coach · on your team</span></div>' +
        '<button class="ib call" aria-label="Call ' + esc(c.name) + '">' + IC.phone + '</button>' +
        '<button class="ib edit" aria-label="Change your coach">' + IC.edit + '</button>' +
        '<div class="pop sw" data-q="sw" role="dialog" aria-label="Your coach"><div class="sw-hd">Your coach</div>' +
          D.COACHES.map(function (x) { return '<button class="sw-it' + (x.key === c.key ? ' on' : '') + '" data-c="' + x.key + '"><img alt="" src="' + x.photo + '"><div><b>' + esc(x.name) + ' <em>' + esc(x.style) + '</em></b><span>' + esc(x.line) + '</span></div><i>' + IC.tick + '</i></button>'; }).join('') +
        '</div></div>';
  }
  /* ================= b25: the coach panel (from the founder's notes) =================
     Before the first stage is done: "Watching how you work." and the sections greyed out. After it: what you are doing
     well, what he wants to see grow (one to three each, one or two sentences), and four stats on the real app's band
     meter (cells, amber to gold to green, left to right), named Calibrating, Developing, Good, Strong, Exceptional.
     It is always open, no dropdowns, and it changes as the scenario goes. */
  /* b36 (the founder: "feels like a LOT, simplify"): only what the coach sees, at a high level, and the stats.
     What you do well and where to grow now live inside the stats. */
  /* ================= b33: the founder's read, word for word =================
     His summary, what you are doing well, the areas he wants to see grow, and six stats (his four, plus AI Slop and
     Understanding). The scale never goes red or orange: Developing (yellow), Good (green), Great (deep green),
     Exceptional (indigo). Tap a stat and it opens to three ways to get better, written for this learner and this work. */
  var SCALE = [
    { w: 'Developing', at: 0, c: [231, 185, 10], t: '#E9C24A' },
    { w: 'Good', at: 40, c: [96, 214, 142], t: '#6FD69A' },
    { w: 'Great', at: 60, c: [32, 160, 88], t: '#2DB868' },
    { w: 'Exceptional', at: 80, c: [124, 122, 255], t: '#A3A1FF' }
  ];
  function band(v) { var b = SCALE[0]; SCALE.forEach(function (x) { if (v >= x.at) b = x; }); return b; }
  /* b34: each stat has its own mark, and three points for every band. The words change with where you are:
     Developing and Good say how to improve, Great says how to reach Exceptional, Exceptional says how to keep it. */
  var SI = {
    com: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.4C3 3.6 3.6 3 4.4 3h7.2c.8 0 1.4.6 1.4 1.4v5c0 .8-.6 1.4-1.4 1.4H7.6L4.8 13v-2.2h-.4c-.8 0-1.4-.6-1.4-1.4z"/><path d="M5.6 6h4.8M5.6 8.2h2.8"/></svg>',
    ind: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5.6"/><path d="M10.2 5.8 9 9 5.8 10.2 7 7z"/></svg>',
    qua: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h6l2.4 3.1L8 13 2.6 6.1z"/><path d="M2.6 6.1h10.8M6.4 3 5.6 6.1 8 13l2.4-6.9L9.6 3"/></svg>',
    spd: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 11.6a5.2 5.2 0 1 1 10.4 0"/><path d="M8 11.6l2.4-3.4"/><circle cx="8" cy="11.6" r=".6" fill="currentColor"/></svg>',
    ai: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 3.2 7.6 6l2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z"/><path d="M11.6 9.4l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/></svg>',
    und: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 12.4h3.6M6.7 14h2.6"/><path d="M8 2.4a3.9 3.9 0 0 0-2.3 7c.4.3.6.7.6 1.2v.2h3.4v-.2c0-.5.2-.9.6-1.2A3.9 3.9 0 0 0 8 2.4z"/></svg>'
  };
  var HEAD = { Developing: 'How you can improve', Good: 'How you can improve', Great: 'How to reach Exceptional', Exceptional: 'How to keep it' };
  var STATS = [
    { n: 'AI Slop', i: 'ai', v: [24, 26, 30], how: {
      Developing: [
        'Your plan opened with “Great question! Lead routing is a critical part of any modern revenue organization.” Jay stopped reading there.',
        'Write the first draft yourself, even if it’s rough. Use AI to check your thinking, not to do it.',
        'Delete any line that could sit in anyone’s plan. Keep the ones only you could write: your numbers, your leads, your test.'],
      Good: [
        'Your drafts sound like you now. Keep AI on the checks: numbers, typos, gaps.',
        'Read anything AI touched out loud. If you wouldn’t say it to Jay, cut it.',
        'Swap every buzzword for a fact. Not “efficient routing”, but “every lead to a rep in under two minutes.”'],
      Great: [
        'You think first and use AI to go faster. That’s the right order.',
        'Say how you checked what AI gave you. One line on it builds trust.',
        'Keep your own voice where it counts: the cause and the call.'],
      Exceptional: [
        'Nobody can tell where AI helped, because the thinking is all yours. Keep it that way.',
        'Save the prompts that save you time, and share them with the team.',
        'Review AI output like Jay would. Your name is on it, not the model’s.'] } },
    { n: 'Understanding', i: 'und', v: [36, 38, 40], how: {
      Developing: [
        'Read the brief twice before you build. Jay asked for three things, and two of your drafts missed one.',
        'Say it back first. Send Jay one line: “So the goal is every lead with a rep in under two minutes?”',
        'Keep the brief open beside your work and tick off each ask before you hit submit.'],
      Good: [
        'You get the ask. Now get why it matters: lost pipeline, not slow emails.',
        'Find the one number the work moves, and put it at the top.',
        'Check your plan against the why, not only the list of asks.'],
      Great: [
        'You know the why. Now spot what the brief missed and raise it early.',
        'Tie your fix to money: hours saved, pipeline kept.',
        'Ask who else this touches. Sales ops will care about the routing rules.'],
      Exceptional: [
        'You see the problem behind the problem. Keep asking “what happens next?”',
        'Explain the work to someone new in two minutes. If you can, you own it.',
        'Bring Jay the next project before he thinks of it.'] } },
    { n: 'Communication', i: 'com', v: [34, 36, 38], how: {
      Developing: [
        'Lead with the point. “Router plan is done, testing on September leads, results by 4pm” beats “yo, router stuff going good.”',
        'Write every update like Jay will forward it to his boss. Because he will.',
        'One message, one ask. Put the question in the first line and say when you need the answer.'],
      Good: [
        'Your updates are clear. Now make them short: two lines, what’s done and what’s next.',
        'Put the number in the update. “Reply time is down to 4 minutes” lands harder than “it’s going well.”',
        'Flag bad news early, with a fix. Jay hates surprises more than problems.'],
      Great: [
        'Write for the reader after Jay. Leadership should get it without asking him a thing.',
        'End every update with a decision Jay can say yes to.',
        'Cut every line that doesn’t change what Jay does next.'],
      Exceptional: [
        'Jay forwards your updates as they are. Hold that bar on the hard days too.',
        'Send the update Jay was about to ask for, before he asks.',
        'Show a teammate how you write a two line update. Teaching it keeps it sharp.'] } },
    { n: 'Independence', i: 'ind', v: [52, 54, 56], how: {
      Developing: [
        'Read the brief before you message Jay. Half of your questions are answered on page one.',
        'Stuck for twelve minutes? Ask. Waiting an hour is a choice, and Jay sees it.',
        'Ask one clear question, not three loose ones. Jay answers clear questions fast.'],
      Good: [
        'Bring a guess with every question. “I think September is right because it’s our biggest month. Agree?”',
        'Check the brief and your notes before you ask. Ask Jay only what isn’t written down.',
        'Make the small calls yourself, then tell Jay what you decided and why.'],
      Great: [
        'Make the call, then tell Jay why. Ask only when it’s his call to make.',
        'Spot the next problem before Jay does, and bring it with a fix.',
        'Batch your questions. One message at noon beats five through the morning.'],
      Exceptional: [
        'Jay hands you the problem, not the steps. Keep earning that.',
        'Write down the calls you made and why. That record gets you the bigger project.',
        'When you’re sure, move. When you’re not, say how sure you are.'] } },
    { n: 'Quality', i: 'qua', v: [36, 38, 42], how: {
      Developing: [
        'Three rounds of feedback on one plan. Find the gaps before Jay does: check your work against the brief, line by line.',
        'Every claim needs a number. “It works” means nothing. “Median reply time 1 min 50 on 1,200 leads” gets a yes.',
        'Say what happens when it breaks: a rep is away, no rep matches. That’s where plans get sent back.'],
      Good: [
        'Your plan covers the asks. Now test it on real leads before Jay sees it.',
        'Read it once as leadership. Anything they’d question, answer on the page.',
        'One page per idea: the problem, the cause, the fix. Don’t make Jay hunt.'],
      Great: [
        'Cover the cases nobody asked for: a rep on leave, a lead with no region.',
        'Show the before and after on one chart: three hours ten, down to under two minutes.',
        'Send it once. Exceptional work goes up without a second round.'],
      Exceptional: [
        'Your plans go up with zero edits. Keep checking every number, even when you’re sure.',
        'Add what to watch after launch: the number, who owns it, and when to check.',
        'Turn your plan into the template the next person starts from.'] } },
    { n: 'Speed', i: 'spd', v: [66, 72, 84], how: {
      Developing: [
        'Send a rough plan in the first hour. A finished one in the third hour is already late.',
        'Give the hard step twenty minutes. Then ask Jay, or move on.',
        'Start with the part you’re sure of. Momentum makes the hard part smaller.'],
      Good: [
        'Say your deadline out loud, “full plan by 2pm”, then hit it.',
        'Do the riskiest part first, so a surprise costs minutes, not the day.',
        'Fast only counts when it’s right. Test before you send, so speed never turns into a redo.'],
      Great: [
        'Beat your own deadline and spend the time you won on the test.',
        'Skip the steps that don’t change the answer. Speed is mostly what you leave out.',
        'Keep a two line update ready, so Jay never waits on you.'],
      Exceptional: [
        'You ship early and right. Never trade the test for the clock.',
        'Use the time you save to go one step past the ask.',
        'Your speed is a process. Write it down and share it with the team.'] } }
  ];
  var READ = {
    say: ['Based on what I’m seeing so far, you’re doing a really good job engaging with your manager and asking good questions.', 'But the way you communicate feels like you’re sending text messages to a friend.']
  };
  function howHTML(x, b) { var w = b ? b.w : 'Developing'; return '<h5>' + HEAD[w] + '</h5><ul>' + x.how[w].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  /* b34: the simulator moves a stat many times a second: patch the cells, the word and the points in place */
  function patchStats() {
    if (S.tab === 'level') { patchRank(); return; }
    if (S.tab !== 'coach') return;
    var k = cstate(), cv = $('.cv33');
    pal();
    if (!cv || !cv.hasAttribute('data-f') !== !k || (k && (+cv.getAttribute('data-f') !== focusIdx() || cv.getAttribute('data-fb') !== band(statVal(focusIdx(), k)).w))) { render(false); return; }
    STATS.forEach(function (x, i) {
      var row = $('.cv-m[data-k="' + i + '"]', cv); if (!row) return;
      var v = statVal(i, k), b = band(v);
      var m4 = $('.cv-m4', row); m4.classList.remove('cal'); m4.style.setProperty('--c', rgb(b.c));
      fills(v).forEach(function (f, j) { var x = $$('b', m4)[j]; x.setAttribute('data-w', Math.round(f * 100)); x.style.width = Math.round(f * 100) + '%'; });
      var wd = $('.cv-wd', row); wd.classList.remove('cal'); wd.textContent = b.w; wd.style.color = b.t;
      var mi = $('.cv-mi', row); if (mi.getAttribute('data-b') !== b.w) { mi.setAttribute('data-b', b.w); mi.innerHTML = howHTML(x, b); }
    });
  }
  /* b37: four boxes, one per band. The bands below you are full, yours fills by how far into it you are. Calibrating shimmers */
  function fills(v) { return SCALE.map(function (x, i) { var hi = i < 3 ? SCALE[i + 1].at : 100; return v == null ? 0 : v >= hi ? 1 : Math.max(0, Math.min(1, (v - x.at) / (hi - x.at))); }); }
  function meter(v, b) {
    return '<span class="cv-m4' + (v == null ? ' cal' : '') + '"' + (b && v != null ? ' style="--c:' + rgb(b.c) + '"' : '') + '>' +
      fills(v).map(function (f, i) { return '<i style="--i:' + i + '"><b data-w="' + Math.round(f * 100) + '"></b></i>'; }).join('') + '</span>';
  }
  function rgb(c) { return 'rgb(' + c.join(',') + ')'; }
  /* where the scenario is: 0 before the first stage is done, 1 after it, 2 after the presentation, 3 after the review */
  function simStats() { return window.CFG && CFG.stats && CFG.stats.length === STATS.length ? CFG.stats : null; }
  function statVal(i, k) { var m = simStats(); return m ? m[i] : k ? STATS[i].v[Math.min(2, k - 1)] : null; }
  function cstate() {
    if (simStats()) return Math.max(1, cstateRaw());   /* b34: simulating the stats shows them */
    return cstateRaw();
  }
  function cstateRaw() {
    if (window.CFG && CFG.coach !== 'auto') return +CFG.coach;   /* b29: the settings can pin a state */
    var b = J.beats(), i = J.P.i, f = function (q) { for (var k = 0; k < b.length; k++) if (q(b[k])) return k; return 99; };
    var st = f(function (x) { return x.d && x.d.step === 'resubmit'; }), rp = f(function (x) { return x.screen === 'report'; }), rv = f(function (x) { return x.screen === 'review'; });
    return i > rv ? 3 : i > rp ? 2 : i > st ? 1 : 0;
  }
  /* ================= b43 (the founders): the coach is a person, not a widget =================
     By default it is only Navid's message. He rates you only once he is sure (after you send Jay your plan); before
     that he says so, in his own words. Then ONE focus: the stat that matters most now, its boxes and how to move it.
     Every stat sits behind "All your stats". Colours: yellow, green, blue only, muted so black never reads as AI. */
  var PALS = { muted: [[214, 178, 92, '#DDBE6E'], [118, 190, 142, '#86CC9F'], [64, 158, 112, '#55B886'], [110, 152, 236, '#8FB1F4']],
    bright: [[231, 185, 10, '#E9C24A'], [96, 214, 142, '#6FD69A'], [32, 160, 88, '#2DB868'], [124, 122, 255, '#A3A1FF']] };
  function pal() { var p = PALS[(window.CFG && CFG.coachPal) || 'muted'] || PALS.muted; SCALE.forEach(function (x, i) { x.c = p[i].slice(0, 3); x.t = p[i][3]; }); }
  function focusIdx() {
    var m = simStats(); if (!m) return STATS.findIndex(function (x) { return x.i === 'com'; });   /* his read is about how you communicate */
    var lo = 0; m.forEach(function (v, i) { if (v < m[lo]) lo = i; }); return lo;
  }
  function statRow(x, i, k, open) {
    var v = statVal(i, k), b = band(v);
    return '<div class="cv-m' + (open ? ' on' : '') + '" data-k="' + i + '">' +
      '<button class="cv-mh" aria-expanded="' + (open ? 'true' : 'false') + '"><span class="cv-si">' + SI[x.i] + '</span><span class="cv-mn">' + esc(x.n) + '</span>' + meter(v, b) +
        '<em class="cv-wd" style="color:' + b.t + '">' + b.w + '</em><i class="cv-ch">' + IC.chev + '</i></button>' +
      '<div class="cv-mx"><div><div class="cv-mi" data-b="' + b.w + '">' + howHTML(x, b) + '</div></div></div></div>';
  }
  function coachView() {
    pal();
    var k = cstate();
    var h = '<div class="cv cv33 cv43"' + (k ? ' data-f="' + focusIdx() + '" data-fb="' + band(statVal(focusIdx(), k)).w + '"' : '') + '>' +
      '<div class="cv-msg"><img alt="" src="' + CO().photo + '"><div class="cv-bub"><div class="cv-bh"><b>' + esc(CO().name) + '</b><span>' + (k ? ['', 'After you sent your plan', 'After your talk', 'After the review'][k] : 'Watching') + '</span></div>' +
        (k ? '<p>' + esc(READ.say[0]) + ' <em>' + esc(READ.say[1]) + '</em></p>' : '<p>I’m still watching how you work. I’ll tell you what I see once you’ve sent Jay your plan.</p>') + '</div></div>';
    if (!k) return h + '</div>';
    var fi = focusIdx(), fx = STATS[fi], fb = band(statVal(fi, k)), up = SCALE[Math.min(3, SCALE.indexOf(fb) + 1)], top = fb === SCALE[3];
    h += '<section class="cv-f"><h4>Your focus</h4><p class="cv-ft">' + (top ? 'Keep <b>' + esc(fx.n) + '</b> at <b style="color:' + fb.t + '">' + fb.w + '</b>' : 'Get <b>' + esc(fx.n) + '</b> to <b style="color:' + up.t + '">' + up.w + '</b>') + '</p>' +
      '<div class="cv-ms">' + statRow(fx, fi, k, true) + '</div></section>';
    h += '<button class="cv-all' + (S.cvAll ? ' on' : '') + '" aria-expanded="' + (S.cvAll ? 'true' : 'false') + '"><span>All your stats</span>' + IC.chev + '</button>' +
      '<div class="cv-allx' + (S.cvAll ? ' on' : '') + '"><div><div class="cv-ms">' + STATS.map(function (x, i) { return i === fi ? '' : statRow(x, i, k, S.cvOpen === i); }).join('') + '</div></div></div>';
    return h + '</div>';
  }
  /* no chat: three fixed questions, each answered from what the coach already knows */
  function chips() {
    var L = lv(), q = [['easy', 'Where are my easiest points?']];
    if (S.st.lastTrack) q.push(['why', 'Why did I get my last grade?']);
    if (L < 10) q.push(['next', 'What does Level ' + (L + 1) + ' open?']);
    return '<div class="qc">' + q.map(function (x) { return '<button data-qc="' + x[0] + '"' + (S.ask === x[0] ? ' class="on"' : '') + '>' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
      (S.ask ? '<div class="qa-ans">' + answer(S.ask) + '</div>' : '');
  }
  function answer(k) {
    var t = S.st.track, lt = S.st.lastTrack, fx = S.st.coach.fix;
    if (k === 'easy') {
      if (t) {
        var g = (D.TG[t.sc] || []).filter(function (x) { return t.s[x.id] !== 'hit' && t.s[x.id] !== 'lost'; })[0];
        if (!g) return 'Every target here is settled. Finish strong: the points are locked in.';
        return '<b>' + esc(g.short) + '.</b> ' + esc(g.how) + ' That keeps ' + n(worth(t)) + ' in play.';
      }
      return fx.length ? '<b>' + esc(fx[0].try || fx[0].t) + '</b> It is the one you missed last time, so it is the cheapest points you can win back.' : 'Hit all three targets in your next scenario. That is 3,000.';
    }
    if (k === 'why' && lt) {
      var hits = (D.TG[lt.sc] || []).filter(function (x) { return lt.s[x.id] === 'hit'; }), miss = (D.TG[lt.sc] || []).filter(function (x) { return lt.s[x.id] !== 'hit'; });
      return 'You hit <b>' + hits.length + ' of 3</b>' + (hits.length ? ': ' + hits.map(function (x) { return esc(x.short.toLowerCase()); }).join(', ') : '') + '. That pays ' + n(LADDER[hits.length]) + '.' + (miss.length ? ' The ' + n(LADDER[3] - LADDER[hits.length]) + ' you left: ' + miss.map(function (x) { return esc(x.short.toLowerCase()); }).join(', ') + '.' : '');
    }
    return '';
  }
  function wireCoach() {
    /* the meters fill in, cell by cell, each time you open him */
    requestAnimationFrame(function () { $$('.cv-m4 b').forEach(function (x) { x.style.width = x.getAttribute('data-w') + '%'; }); });
    var al = $('.cv-all'); if (al) al.addEventListener('click', function () { S.cvAll = !S.cvAll; al.classList.toggle('on', S.cvAll); al.setAttribute('aria-expanded', S.cvAll ? 'true' : 'false'); $('.cv-allx').classList.toggle('on', S.cvAll); setTimeout(fade, 420); });
    $$('.cv-mh').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.parentNode, i = +m.getAttribute('data-k'), open = !m.classList.contains('on');
        $$('.cv-m.on').forEach(function (o) { o.classList.remove('on'); $('.cv-mh', o).setAttribute('aria-expanded', 'false'); });
        if (open) { m.classList.add('on'); b.setAttribute('aria-expanded', 'true'); }
        S.cvOpen = open ? i : null;
        setTimeout(fade, 420);
      });
    });
    $$('.tp[data-id]').forEach(function (b) { b.addEventListener('click', function () { var a = new Audio(A + 'voice/' + b.getAttribute('data-id') + '.mp3'); $$('.tp').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); a.play().catch(function () {}); a.addEventListener('ended', function () { b.classList.remove('on'); }); }); });
    $$('.pc button').forEach(function (b) { b.addEventListener('click', function () { $$('.pc button').forEach(function (x) { x.classList.toggle('on', x === b); }); }); });
    $$('.qc [data-qc]').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-qc'); if (k === 'next') { S.ask = null; open('level'); return; } S.ask = S.ask === k ? null : k; render(false); }); });
    var cb = $('.ib.call'); if (cb) cb.addEventListener('click', call);
    var eb = $('.ib.edit'); if (eb) eb.addEventListener('click', function () { setPop(S.pop === 'sw' ? null : 'sw'); });
    $$('.sw-it').forEach(function (b) { b.addEventListener('click', function () { pickCoach(b.getAttribute('data-c')); }); });
  }
  function pickCoach(k) {
    S.coachKey = k; setPop(null); draw(); render(false);
    toast({ kind: 'on', title: 'Hi, I am ' + CO().name, text: CO().line });
  }

  /* ---------- the call: a 1:1 with an agenda ---------- */
  var WORDS = null;
  fetch(A + 'coach/words.json').then(function (r) { return r.json(); }).then(function (j) { WORDS = j; }).catch(function () {});
  function call() {
    var c = CO(); if (S.call) return;
    if (!S.tab) open('coach');
    var ov = document.createElement('div'); ov.className = 'callv';
    ov.innerHTML = '<div class="cl-v"><video playsinline preload="auto" src="' + c.video + '"></video>' +
        '<div class="cl-ring"><span class="wv"></span><span class="wv"></span><span class="wv"></span><img alt="" src="' + c.photo + '"></div></div>' +
      '<div class="cl-nm"><b>' + esc(c.name) + '</b><span class="cl-st"><span class="cl-dots">Ringing<i>.</i><i>.</i><i>.</i></span></span></div>' +
      '<div class="cl-ag"><span>Agenda</span><b>Where you are</b><b>What is costing you points</b><b>Your target next</b></div>' +
      '<div class="cl-cap" aria-live="polite"></div>' +
      '<div class="cl-bt"><button class="cl-mute" aria-label="Mute">' + IC.mic + '</button><button class="cl-end" aria-label="End call">' + IC.end + '</button></div>';
    $('.dk').appendChild(ov); $('.dk').classList.add('calling');
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var v = $('video', ov), st = $('.cl-st', ov), cap = $('.cl-cap', ov), t0 = 0, words = (WORDS || {})[c.key] || [], ready = false, rang = false;
    S.call = { ov: ov, timer: 0 };
    v.addEventListener('canplaythrough', function () { ready = true; go(); }, { once: true });
    v.load();
    setTimeout(function () { rang = true; if (!ready) st.innerHTML = '<span class="cl-dots">Connecting<i>.</i><i>.</i><i>.</i></span>'; go(); }, 2200);
    $('.cl-mute', ov).addEventListener('click', function () { var b = this, m = b.classList.toggle('on'); b.innerHTML = m ? IC.micoff : IC.mic; });
    $('.cl-end', ov).addEventListener('click', endCall);
    function go() {
      if (!S.call || !ready || !rang || t0) return;
      ov.classList.add('cl-on'); t0 = performance.now();
      try { var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); }); } catch (e) {}
      S.call.timer = setInterval(function () {
        var sec = Math.floor((performance.now() - t0) / 1000);
        st.textContent = Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
        var tt = v.currentTime, said = words.filter(function (w) { return w[0] <= tt; }).map(function (w) { return w[2]; });
        if (v.ended) said = words.map(function (w) { return w[2]; });
        cap.textContent = said.slice(-14).join(' ');
        ov.classList.toggle('cl-talk', !v.paused && !v.ended);
      }, 120);
    }
  }
  function endCall() {
    if (!S.call) return;
    var ov = S.call.ov; clearInterval(S.call.timer);
    var v = $('video', ov); try { v.pause(); } catch (e) {}
    ov.classList.remove('on'); setTimeout(function () { ov.remove(); $('.dk').classList.remove('calling'); }, 400);
    S.call = null;
  }

  /* ---------- short notes: wins, saves and tips ---------- */
  var KIC = { on: 'tick', hit: 'tick', praise: 'tick', save: 'shield', tip: 'bulb', miss: 'bang', nudge: 'bang' };
  function toast(o) {
    var box = $('.toasts');
    var av = o.kind === 'level' ? badge(o.level) : '<img alt="" src="' + CO().photo + '"><i class="k">' + IC[KIC[o.kind] || 'tick'] + '</i>';
    var t = document.createElement('div');
    t.className = 'toast ' + o.kind; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="av">' + av + '</span><div><b>' + esc(o.title) + '</b><span class="tt">' + esc(o.text) + '</span>' +
      (o.try ? '<span class="tr"><em>Try this instead</em>' + esc(o.try) + '</span>' : '') + (o.extra || '') + '</div>';
    t.addEventListener('click', function () { open(o.kind === 'level' ? 'level' : 'coach'); dismiss(t); });
    box.appendChild(t);
    while (box.children.length > 2) box.removeChild(box.firstChild);
    setTimeout(function () { dismiss(t); }, o.ms || 6500);
    return t;
  }
  function dismiss(t) { if (!t.parentNode || t.classList.contains('out')) return; t.classList.add('out'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 360); }
  function note(o) {
    toast(o);
    if (S.tab === 'coach') render(false);
  }

  /* ---------- the freeze: the coach takes the floor, the app waits ---------- */
  var KIND = { intro: ['Meet your coach', 'cz-k-in'], pre: ['Before you start', 'cz-k-in'], strike: ['Strike one', 'cz-k-st'], lost: ['Target lost', 'cz-k-lo'], save: ['Saved', 'cz-k-ok'], post: ['Your points, explained', 'cz-k-ok'] };
  function freeze(o, s) {
    var app = S.root, st = S.st, c = CO();
    var t = o.targets === 'last' ? st.lastTrack : st.track;
    var k = KIND[o.kind] || KIND.pre;
    var u = t ? D.upTo(t) : 0;
    var body = '<div class="cz-hd"><img alt="" src="' + c.photo + '"><div><b>' + esc(c.name) + '</b><span>Your coach, on your team</span></div><em class="' + k[1] + '">' + k[0] + '</em></div>' +
      '<h3>' + esc(o.title) + '</h3>' + (o.text ? '<p class="cz-p">' + esc(o.text) + '</p>' : '') +
      (o.try ? '<div class="cz-try"><b>Try this instead</b>' + esc(o.try) + '</div>' : '') +
      (o.lead ? '<p class="cz-lead">' + esc(o.lead) + '</p>' : '') +
      (o.targets && t ? '<div class="cz-tg">' + rowsFor(t, { full: true }) + '</div>' : '') +
      (o.ladder ? '<div class="cz-lad">' + [3, 2, 1, 0].map(function (h2) { return '<span><b>' + n(LADDER[h2]) + '</b>' + h2 + ' of 3</span>'; }).join('') + '</div>' : '') +
      (o.next ? '<p class="cz-next">' + esc(o.next) + '</p>' : '') +
      '<div class="cz-ft">' + (o.kind !== 'post' && t ? '<span class="cz-up">Up to <b>' + n(u) + '</b> skill points</span>' : '<span></span>') + '<button class="cz-go">Got it</button></div>';
    var ov = document.createElement('div'); ov.className = 'cz';
    ov.innerHTML = '<div class="cz-bg"></div><div class="cz-card cz-' + o.kind + '" role="dialog" aria-label="' + esc(o.title) + '">' + body + '</div>';
    app.insertBefore(ov, $('.dk', app));
    close();
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var words = (o.title + ' ' + (o.text || '') + ' ' + (o.try || '') + ' ' + (o.lead || '') + ' ' + (o.next || '')).length + (o.targets ? 160 : 0);
    var btn = $('.cz-go', ov), clicked = new Promise(function (r) { btn.addEventListener('click', r, { once: true }); });
    return (async function () {
      try {
        await Promise.race([s.wait(2200 + words * 34), clicked]);
        if (ov.isConnected && !btn.classList.contains('pressed')) await s.press(btn, 120);
        s.hideCursor();
      } finally {
        ov.classList.remove('on'); setTimeout(function () { ov.remove(); }, 380);
      }
    })();
  }

  /* the engine hands over the state after every beat and every fx */
  function update(st, opt) {
    opt = opt || {};
    var was = lv();
    S.st = st;
    var L = lv();
    if (opt.quiet) { $$('.cz').forEach(function (x) { x.remove(); }); draw(false); if (S.tab) render(false); return; }
    draw(true);
    if (L > (opt.from || was)) { var seg = $('.seg.lv'); seg.classList.remove('bump'); void seg.offsetWidth; seg.classList.add('bump'); }
    if (S.tab) render(false);
  }
  function reset() { close(); S.dot = false; S.upShown = null; S.coachShown = false; $$('.toast').forEach(dismiss); $$('.cz').forEach(function (x) { x.remove(); }); }

  /* b15: a coin from Navid lands: count the pill up */
  function kept(pts) {
    var from = S.st.kept || 0; S.st.kept = from + pts;
    var seg = $('.seg.lv'); if (!seg) return;
    var em = $('.pts em', seg), bar = $('.mini i', seg);
    if (em) { em.classList.add('on'); countTo(em, S.st.pts + from, S.st.pts + S.st.kept); }
    if (bar) bar.style.width = Math.round(into() * 100) + '%';
    seg.classList.remove('nv-gain'); void seg.offsetWidth; seg.classList.add('nv-gain');
    setTimeout(function () { draw(false); }, 1000);
  }
  /* b32: a rank up, the way it lands: the new badge, the rank, what it opens */
  function rankUp(L) {
    var x = D.LEVELS[Math.min(10, L) - 1] || {}, app = S.root;
    $$('.rku').forEach(function (e) { e.remove(); });
    var c = document.createElement('div'); c.className = 'rku'; c.setAttribute('role', 'status');
    c.innerHTML = '<div class="rku-c"><span class="rku-b">' + rb(L) + '</span><b>Level ' + L + '</b><span>' + (x.roles ? 'Opens ' + x.roles + ' ' + esc(/^[A-Z][a-z]/.test(x.kind || '') ? x.kind.charAt(0).toLowerCase() + x.kind.slice(1) : (x.kind || 'roles')) : 'Every role is open') + '</span></div>';
    app.appendChild(c); void c.offsetWidth; c.classList.add('on');
    if (window.SFX) SFX.play('celebration', .6);
    setTimeout(function () { c.classList.remove('on'); setTimeout(function () { c.remove(); }, 450); }, 2400);
  }
  /* b32: the simulator moves XP many times a second: patch the pill and the rank panel, rebuild only when the rank changes */
  function patch() {
    var L = lv(), seg = $('.seg.lv'), num = seg && $('.rkb > b', seg);
    if (!num || +num.textContent !== L) draw(false);
    else { var i = $('.mini i', seg); if (i) i.style.width = Math.round(into() * 100) + '%'; }
    if (S.tab !== 'level') return;
    var hero = $('.rk-hero');
    if (!hero || +hero.getAttribute('data-l') !== L) { render(false); return; }
    var T = total(), a = D.startOf(L), t = $('.lv-track i'), b = $('.rk-ends b');
    if (t) t.style.width = Math.round(Math.max(0, Math.min(1, (T - a) / 1000)) * 100) + '%';
    if (b) b.textContent = n(T - a);
    patchRank();
  }
  window.DK = { setCoach: pickCoach, cstate: cstate, STATS: STATS, SI: SI, SCALE: SCALE, band: band, statVal: statVal, patchStats: patchStats, rb: rb, patch: patch, rankUp: rankUp, kept: kept, fit: function () { if (!S.tab) fitClosed(); }, S: S, mount: mount, update: update, note: note, toast: toast, freeze: freeze, open: open, close: close, reset: reset, call: call, endCall: endCall, render: render, CO: CO };
})();
