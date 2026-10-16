/* Zero home b5. One pill (level + Navid, the coach) that grows into the panel.
   The coach reads you after every stage and says so in short notes; the simulations play a learner's first weeks live. */
(function () {
  'use strict';
  var D = window.HD, A = D.A;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Math.round(x).toLocaleString('en-US'); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lvOf(p) { return Math.min(10, Math.floor(p / 1000)); }
  function coName(k) { return (D.CO[k] || [k])[0]; }

  var IC = {
    phone: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5.3 2.6 6.6 5.5c.2.4.1.9-.3 1.2l-1 .8a8.2 8.2 0 0 0 3.2 3.2l.8-1c.3-.4.8-.5 1.2-.3l2.9 1.3c.4.2.6.6.5 1l-.4 1.6c-.1.5-.5.8-1 .8C6.8 14.1 1.9 9.2 1.9 3.5c0-.5.3-.9.8-1l1.6-.4c.4-.1.8.1 1 .5z"/></svg>',
    swap: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5h9.5M10 3l2.5 2.5L10 8M13 10.5H3.5M6 8l-2.5 2.5L6 13"/></svg>',
    end: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5.6c2.6 0 4.8.8 6.1 2 .4.4.4.9.1 1.3l-1 1.1c-.3.3-.8.4-1.2.2l-1.7-.8c-.4-.2-.6-.5-.6-.9V7.4A7.8 7.8 0 0 0 8 7.1c-.6 0-1.2.1-1.7.3v1.1c0 .4-.2.7-.6.9l-1.7.8c-.4.2-.9.1-1.2-.2l-1-1.1c-.3-.4-.3-.9.1-1.3 1.3-1.2 3.5-2 6.1-2z"/></svg>',
    micon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5.7" y="2" width="4.6" height="7.6" rx="2.3"/><path d="M3.6 7.8a4.4 4.4 0 0 0 8.8 0M8 12.3V14"/></svg>',
    micoff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5.7" y="2" width="4.6" height="7.6" rx="2.3"/><path d="M3.6 7.8a4.4 4.4 0 0 0 8.8 0M8 12.3V14M2.5 2.5l11 11"/></svg>',
    tick: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    brief: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="5" width="11" height="8.5" rx="2"/><path d="M6 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1"/></svg>',
    cash: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="4.2" width="12" height="7.6" rx="1.8"/><circle cx="8" cy="8" r="1.7"/></svg>',
    coin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="5.5" rx="5" ry="2.3"/><path d="M3 5.5v5c0 1.3 2.2 2.3 5 2.3s5-1 5-2.3v-5M3 8c0 1.3 2.2 2.3 5 2.3S13 9.3 13 8"/></svg>',
    sparkle: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 1.8c.4 2.9 1.6 4.3 5.6 6-4 1.7-5.2 3.1-5.6 6-.4-2.9-1.6-4.3-5.6-6 4-1.7 5.2-3.1 5.6-6z"/></svg>',
    world: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M3.5 10h13M10 3c2 2.2 2.9 4.6 2.9 7s-.9 4.8-2.9 7c-2-2.2-2.9-4.6-2.9-7S8 5.2 10 3z"/></svg>',
    spark: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 2.5c.5 3.6 2 5.4 7 7.5-5 2.1-6.5 3.9-7 7.5-.5-3.6-2-5.4-7-7.5 5-2.1 6.5-3.9 7-7.5z"/></svg>',
    bag: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6.5" width="14" height="10" rx="2.5"/><path d="M7.5 6.5V5.2c0-.9.7-1.7 1.7-1.7h1.6c1 0 1.7.8 1.7 1.7v1.3"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg>',
    bang: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 3.5v5.5M8 12.4v.1"/></svg>',
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"/></svg>',
    play: '<svg viewBox="0 0 12 12"><path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 12 12"><rect x="2.8" y="2.8" width="6.4" height="6.4" rx="1.2" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.8 4.2c0-.9.7-1.6 1.6-1.6h7.2c.9 0 1.6.7 1.6 1.6v5c0 .9-.7 1.6-1.6 1.6H7l-2.8 2.4v-2.4h0c-.8 0-1.4-.7-1.4-1.6z"/></svg>',
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 2 3 3.8v3.8c0 3 2.1 5.3 5 6.4 2.9-1.1 5-3.4 5-6.4V3.8z"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2 1.4"/></svg>'
  };

  function logo(k, size) {
    var c = D.CO[k] || [k, ''], s = size || 24;
    if (c[1] === 'png') return '<span class="lg png" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><img alt="" src="' + A + 'logo/' + k + '.png"></span>';
    if (c[1] === 'svg') return '<span class="lg" style="--l:' + s + 'px" title="' + esc(c[0]) + '"><i class="mk" style="--c:' + (c[2] || '#111') + ';--m:url(' + A + 'logo/' + k + '.svg)"></i></span>';
    return '<span class="lg ltr" style="--l:' + s + 'px;--c:' + (c[2] || '#111') + '" title="' + esc(c[0]) + '"><span class="lt">' + esc(c[0].charAt(0)) + '</span></span>';
  }
  function badge(lv) { return lv < 1 ? '<span class="bdg0">0</span>' : '<img class="bdg" alt="Level ' + lv + ' badge" src="' + A + 'badge/b' + lv + '.webp">'; }

  /* ---------- state ---------- */
  function CO() { for (var i = 0; i < D.COACHES.length; i++) if (D.COACHES[i].key === S.coachKey) return D.COACHES[i]; return D.COACHES[0]; }
  var S = { coachKey: 'navi', call: null, tab: null, openLv: null, openChip: null, pop: null, dot: false, gain: 0, sim: null, now: null };
  function rest() {
    var r = D.REST;
    S.pts = r.pts; S.done = r.done.slice(); S.reads = clone(r.reads); S.notes = clone(r.notes); S.think = r.think; S.when = r.when; S.usual = r.usual;
    S.live = false; S.dot = true; S.now = null; S.openLv = null; S.openChip = null;
  }
  function dayOne(sim) {
    S.pts = 0; S.done = []; S.notes = []; S.usual = sim.usual; S.now = null; S.live = false; S.openLv = null; S.openChip = null;
    S.reads = {}; D.READS.forEach(function (r) { S.reads[r.key] = { v: 0 }; });
    S.think = 'I have not seen you work yet. I start reading you after your first stage, and I will tell you what I see as it happens.';
    S.when = 'Day one';
  }
  function lv() { return lvOf(S.pts); }
  function into() { return lv() >= 10 ? 1 : (S.pts - lv() * 1000) / 1000; }
  function W() { return Math.min(456, innerWidth - 40); }

  /* ---------- the page ---------- */
  function page() {
    document.body.innerHTML =
      '<div class="h-world" aria-hidden="true"></div><div class="h-shade" aria-hidden="true"></div>' +
      '<div class="h-word" aria-label="Zero"></div>' +
      '<nav class="h-rail" aria-label="Zero"><button class="on" aria-label="World">' + IC.world + '</button><button aria-label="Skills">' + IC.spark + '</button><button aria-label="Jobs">' + IC.bag + '</button></nav>' +
      '<div class="h-road" aria-label="Your scenarios"></div>' +
      '<div class="toasts" aria-live="polite"></div>' +
      '<div class="dk"><div class="dk-bg"></div>' +
        '<div class="pill" role="tablist" aria-label="Level and coach">' +
          '<button class="seg lv" role="tab" data-tab="level"></button><i class="sep"></i>' +
          '<button class="seg co" role="tab" data-tab="coach" aria-label="Your coach"><span class="me"><img alt="" src="' + CO().photo + '"><i class="dot"></i></span><span class="lbl">Coach</span></button>' +
        '</div>' +
        '<div class="dk-body"><div><div class="dk-sc"></div></div></div>' +
      '</div>' +
      '<div class="sim"><div class="sim-now"></div><div class="sim-row">' +
        ['best', 'mid', 'worst'].map(function (k) { return '<button data-sim="' + k + '"></button>'; }).join('') + '<em>b5</em></div></div>';
    document.documentElement.style.setProperty('--W', W() + 'px');
    fetch(A + 'zero-wordmark.svg').then(function (r) { return r.text(); }).then(function (t) { $('.h-word').innerHTML = t.replace(/<\?xml[^>]*>/, ''); }).catch(function () {});
    $$('.seg').forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-tab')); }); });
    $$('.sim-row [data-sim]').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-sim'); if (S.sim && S.sim.key === k && !S.sim.over) stop(); else start(k); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.call) endCall(); else if (S.pop) setPop(null); else close(); } });
    document.addEventListener('pointerdown', function (e) {
      if (S.pop && !e.target.closest('.pop,.q,.ib.swap')) setPop(null);
      if (S.tab && !e.target.closest('.dk,.sim,.toasts')) close();
    });
    $('.dk-sc').addEventListener('scroll', fade);
    addEventListener('resize', function () { document.documentElement.style.setProperty('--W', W() + 'px'); if (S.tab) $('.dk').style.width = W() + 'px'; else fitClosed(); });
    draw();
  }

  function draw() {
    var L = lv();
    $('.seg.lv').innerHTML = badge(L) + '<span class="tx"><b>Level ' + L + '</b><span class="mini"><i style="width:' + Math.round(into() * 100) + '%"></i></span></span>';
    $('.seg.lv').setAttribute('aria-label', 'Level ' + L + ', ' + n(S.pts) + ' skill points');
    $('.dot').classList.toggle('on', S.dot);
    var cur = S.now && S.done.indexOf(S.now.sc) < 0 ? S.now.sc : null;
    $('.h-road').innerHTML = S.done.map(function (k, i) { return '<span class="rd' + (S.newDone === k ? ' new' : '') + '" title="' + esc(coName(k)) + '">' + logo(k, 22) + '<i class="ck">' + IC.check + '</i></span><span class="ln"></span>'; }).join('') +
      (cur ? '<span class="rd work" title="Working on ' + esc(coName(cur)) + '">' + logo(cur, 22) + '</span>' : '<span class="rd next" title="Your next scenario"></span>') +
      '<span class="ln"></span><span class="bag" title="Jobs">' + IC.bag + '</span>';
    S.newDone = null;
    $$('.sim-row [data-sim]').forEach(function (b) {
      var k = b.getAttribute('data-sim'), run = S.sim && S.sim.key === k && !S.sim.over;
      b.classList.toggle('on', !!run);
      b.innerHTML = (run ? IC.stop + 'Stop' : IC.play + 'Simulate ' + D.SIMS[k].label.toLowerCase());
    });
    if (!S.tab) fitClosed();
  }
  function closedW() {
    var g = document.createElement('div'); g.className = 'dk';
    g.style.cssText = 'visibility:hidden;left:-9999px;right:auto;width:auto;transition:none;pointer-events:none';
    var p = $('.pill').cloneNode(true); $$('.seg', p).forEach(function (x) { x.classList.remove('on'); });
    g.appendChild(p); document.body.appendChild(g);
    var w = Math.ceil(g.getBoundingClientRect().width / (parseFloat(getComputedStyle(g).zoom) || 1)); g.remove(); return w;
  }
  function fitClosed() { $('.dk').style.width = closedW() + 'px'; }

  /* ---------- open, switch, close ---------- */
  function toggle(tab) { if (S.tab === tab) close(); else open(tab); }
  function open(tab) {
    var was = S.tab; S.tab = tab;
    var dk = $('.dk'); dk.classList.add('open'); dk.style.width = W() + 'px';
    $('.toasts').classList.add('beside');
    $$('.seg').forEach(function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (tab === 'coach' && S.dot) { S.dot = false; $('.dot').classList.remove('on'); }
    if (was !== tab) { S.pop = null; render(true); }
  }
  function close() {
    if (!S.tab) return;
    if (S.call) endCall();
    S.tab = null; S.pop = null;
    $('.dk').classList.remove('open'); $('.toasts').classList.remove('beside');
    $$('.seg').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    fitClosed();
  }
  /* render the open view. anim = the tab just changed; otherwise a live update: keep the scroll, no entrance */
  function render(anim, hl) {
    if (!S.tab) return;
    var sc = $('.dk-sc'), top = sc.scrollTop;
    sc.innerHTML = '<div class="' + (anim ? 'view' : '') + '">' + (S.tab === 'level' ? levelView(hl || {}) : coachView(hl || {})) + '</div>';
    sc.scrollTop = anim ? 0 : top;
    if (S.tab === 'level') wireLevel(anim); else wireCoach();
    wirePop();
    setTimeout(fade, 520);
  }
  function fade() { var sc = $('.dk-sc'); if (sc) sc.classList.toggle('more', sc.scrollHeight - sc.scrollTop - sc.clientHeight > 4); }
  function setPop(k) {
    S.pop = k;
    $$('.q').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-q') === k); });
    var sb = $('.ib.swap'); if (sb) sb.classList.toggle('on', k === 'sw');
    $$('.pop').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-q') === k); });
  }
  function wirePop() { $$('.q').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-q'); setPop(S.pop === k ? null : k); }); }); }

  /* ---------- Level ---------- */
  function ringHTML(x) {
    var ring = x.cos.slice(0, 6), R = 54;
    return '<div class="ring6"><div class="ring6-c"><b>' + x.roles + '</b><span>roles</span></div>' +
      ring.map(function (k, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / ring.length;
        return logo(k, 32).replace('<span class="lg', '<span style="left:' + (70 + R * Math.cos(a)).toFixed(1) + 'px;top:' + (70 + R * Math.sin(a)).toFixed(1) + 'px;animation-delay:' + (i * 45) + 'ms" class="lg'); }).join('') + '</div>';
  }
  function unlockHTML(x, L) {
    var need = x.n * 1000, state = x.n <= L ? 'have' : x.n === L + 1 ? 'next' : 'later';
    var into = state === 'next' ? Math.max(0, Math.min(1, (S.pts - L * 1000) / 1000)) : 0;
    var xp = state === 'have'
      ? '<div class="ux-xp"><span class="ux-ok">' + IC.tick + '</span><div><b>Unlocked</b><span>at ' + n(need) + ' skill points</span></div></div>'
      : '<div class="ux-xp"><div class="ux-big">' + n(need) + '<span>skill points</span></div>' +
        '<div class="ux-bar"><i style="width:' + Math.round((state === 'next' ? into : S.pts / need) * 100) + '%"></i></div>' +
        '<div class="ux-to">' + n(need - S.pts) + ' to go</div></div>';
    var items = [
      [IC.brief, x.roles + ' roles', x.kind],
      [IC.cash, x.pay, 'Pay range']
    ];
    if (x.also) items.push([IC.sparkle, x.also, 'New scenarios to pick from']);
    items.push([IC.coin, '100 credits', 'When you reach it']);
    return '<div class="ux">' + ringHTML(x) +
      '<div class="ux-r">' + xp +
        '<div class="ux-k">Unlocks</div><ul class="ux-list">' + items.map(function (it) { return '<li><span class="ux-ic">' + it[0] + '</span><div><b>' + esc(it[1]) + '</b><span>' + esc(it[2]) + '</span></div></li>'; }).join('') + '</ul>' +
        '<a class="all" href="' + D.PORTAL + '" target="_blank" rel="noopener">View all roles' + IC.out + '</a>' +
      '</div></div>';
  }
  function levelView(hl) {
    var L = lv(), next = Math.min(10, L + 1);
    if (S.openLv == null) S.openLv = L < 10 ? next : 10;
    var at = { Under: 0, Below: 12.5, Meeting: 37.5, Exceeding: 62.5, Exceptional: 87.5 }[S.usual] || 37.5;
    var h = '<div class="lv-hero">' + badge(L) + '<div><h2>Level ' + L + '</h2><div class="pts">' + n(S.pts) + ' skill points' + (S.gain ? '<span class="gain">+' + n(S.gain) + '</span>' : '') + '</div></div>' +
      '<button class="q' + (S.pop === 'lv' ? ' on' : '') + '" data-q="lv" aria-label="How skill points work">?</button>' +
      '<div class="pop' + (S.pop === 'lv' ? ' on' : '') + '" data-q="lv" role="dialog" aria-label="How skill points work">' +
        '<p>Skill points come only from finished scenarios. Your manager grades the work, and better work pays more.</p>' +
        '<div class="scale"><span class="yo" style="left:' + at + '%">You, usually</span><div class="bar"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i></div>' +
        '<div class="lbls"><span>Below<b>500</b></span><span>Meeting<b>1,000</b></span><span>Exceeding<b>2,000</b></span><span>Exceptional<b>3,000</b></span></div></div>' +
        '<div class="foot">Every 1,000 skill points is a level, and every level opens new roles.</div></div></div>' +
      '<div class="lv-prog"><div class="lv-track"><i data-w="' + Math.round(into() * 100) + '"></i></div>' +
      '<div class="lv-meta">' + (L >= 10 ? '<b>Top level</b>' : '<b>' + n(next * 1000 - S.pts) + ' more</b> to Level ' + next) + '</div></div>' +
      '<div class="lv-list"><span class="lv-line" aria-hidden="true"><i></i></span>' +
      D.LEVELS.map(function (x) {
        var state = x.n === L ? 'now' : x.n < L ? 'past' : 'fut', op = S.openLv === x.n;
        var sub = state === 'fut' ? '<span class="lv-sub">' + n(x.n * 1000) + ' skill points</span>' : '';
        return '<div class="lv-row ' + state + (op ? ' open' : '') + (hl.up === x.n ? ' up' : '') + '" data-n="' + x.n + '">' +
          '<button class="lv-btn" aria-expanded="' + op + '">' + badge(x.n) +
          '<span class="lv-tw"><span class="lv-nm">Level ' + x.n + (state === 'now' ? '<span class="you">You</span>' : '') + '</span>' + sub + '</span>' +
          '<span class="stk">' + x.cos.slice(0, 3).map(function (k) { return logo(k, 26); }).join('') + '</span><span class="lv-cv">' + IC.chev + '</span></button>' +
          '<div class="lv-more"><div>' + (op ? unlockHTML(x, L) : '') + '</div></div></div>';
      }).join('') + '</div>';
    return h;
  }
  function wireLevel(anim) {
    requestAnimationFrame(function () { var b = $('.lv-track i'); if (b) b.style.width = b.getAttribute('data-w') + '%'; line(anim); });
    $$('.lv-row').forEach(function (r) {
      $('.lv-btn', r).addEventListener('click', function () {
        var k = +r.getAttribute('data-n'); S.openLv = S.openLv === k ? -1 : k;
        $$('.lv-row').forEach(function (o) {
          var nn = +o.getAttribute('data-n'), on = nn === S.openLv; o.classList.toggle('open', on); $('.lv-btn', o).setAttribute('aria-expanded', on);
          var box = $('.lv-more>div', o); if (on && !box.innerHTML) box.innerHTML = unlockHTML(D.LEVELS[nn - 1], lv());
        });
        var t0 = performance.now(); (function f() { line(false); if (performance.now() - t0 < 650) requestAnimationFrame(f); })();
        if (S.openLv === k) setTimeout(function () { var sc = $('.dk-sc'), rr = r.getBoundingClientRect(), br = sc.getBoundingClientRect(); if (rr.bottom > br.bottom - 8) sc.scrollBy({ top: rr.bottom - br.bottom + 20, behavior: 'smooth' }); fade(); }, 420);
        else setTimeout(fade, 460);
      });
    });
  }
  function line(grow) {
    var list = $('.lv-list'), ln = $('.lv-line'); if (!list || !ln) return;
    var rows = $$('.lv-row'), lt = list.getBoundingClientRect().top;
    var mid = function (k) { var b = $('.lv-btn .bdg,.lv-btn .bdg0', rows[k]).getBoundingClientRect(); return b.top + b.height / 2 - lt; };
    var top = mid(0), bot = mid(rows.length - 1); ln.style.top = top + 'px'; ln.style.height = Math.max(0, bot - top) + 'px';
    var L = lv(), fill = 0;
    if (L >= 1) { fill = mid(L - 1) - top; if (L < 10) fill += (mid(L) - mid(L - 1)) * into(); }
    var i = $('i', ln);
    if (grow) { i.style.transition = 'none'; i.style.height = '0px'; void i.offsetHeight; i.style.transition = ''; } else i.style.transition = 'none';
    i.style.height = Math.max(0, fill) + 'px';
  }

  /* ---------- Coach ---------- */
  function tone(v) { return v === 0 ? '' : v >= 4 ? 'hi' : v <= 2 ? 'lo' : 'mid'; }
  function word(v) { return v === 0 ? 'Not seen yet' : v >= 5 ? 'Strong' : v >= 4 ? 'Good' : v >= 3 ? 'Steady' : 'Needs work'; }
  function chip(rd, hl) {
    var x = S.reads[rd.key] || { v: 0 };
    return '<button class="chip' + (S.openChip === rd.key ? ' on' : '') + (hl.read === rd.key ? ' pulse' : '') + '" data-k="' + rd.key + '"' + (x.v ? '' : ' disabled') + ' aria-expanded="' + (S.openChip === rd.key) + '">' +
      '<span class="ring ' + tone(x.v) + '" style="--p:' + (x.v * 20) + '">' + IC[rd.icon] + '</span>' + esc(rd.short) + '</button>';
  }
  function chipDetail() {
    var k = S.openChip, x = k && S.reads[k];
    if (!x || !x.v) return '';
    return '<div class="chip-in"><div class="hd">' + esc(k) + '<span>' + word(x.v) + '</span></div><div class="saw">' + esc(x.saw || '') + '</div>' + (x.tip ? '<div class="try"><b>Try</b>' + esc(x.tip) + '</div>' : '') + '</div>';
  }
  function nextLine() {
    var L = lv(); if (L >= 10) return 'Every role is open to you.';
    var need = (L + 1) * 1000 - S.pts, g = D.GRADES.filter(function (x) { return x.pts >= Math.max(need, 1000); })[0];
    return n(need) + ' more skill points to Level ' + (L + 1) + '. One scenario at ' + g.name + ' or better gets you there.';
  }
  function coachView(hl) {
    var L = lv(), c = CO();
    return '<div class="co-hd"><img class="co-face" alt="" src="' + c.photo + '"><div class="co-nm"><b>' + esc(c.name) + '</b><span>' + esc(c.style) + ' coach</span></div>' +
        '<button class="ib call" aria-label="Call ' + esc(c.name) + '">' + IC.phone + '</button>' +
        '<button class="ib swap' + (S.pop === 'sw' ? ' on' : '') + '" aria-label="Change coach">' + IC.swap + '</button>' +
        '<div class="pop sw' + (S.pop === 'sw' ? ' on' : '') + '" data-q="sw" role="dialog" aria-label="Change coach"><div class="sw-hd">Pick your coach</div>' +
          D.COACHES.map(function (x) { return '<button class="sw-it' + (x.key === c.key ? ' on' : '') + '" data-c="' + x.key + '"><img alt="" src="' + x.photo + '"><div><b>' + esc(x.name) + ' <em>' + esc(x.style) + '</em></b><span>' + esc(x.line) + '</span></div><i>' + IC.tick + '</i></button>'; }).join('') +
        '</div></div>' +
      '<div class="co-think"><div class="co-tl"><span class="lab">What I think about you</span><button class="q' + (S.pop === 'co' ? ' on' : '') + '" data-q="co" aria-label="How your coach reads you">?</button></div>' +
        '<p' + (hl.think ? ' class="in"' : '') + '>' + esc(S.think) + '</p>' +
        '<div class="co-when"><i class="live' + (S.live ? ' on' : '') + '"></i>' + esc(S.when) + '</div>' +
        '<div class="pop' + (S.pop === 'co' ? ' on' : '') + '" data-q="co" role="dialog" aria-label="How your coach reads you">' +
          '<p>After every stage I look at four things: how you keep your manager in the loop, how much you do on your own, the quality of what you send, and your pace.</p>' +
          '<p style="margin-top:6px">I tell you right after it happens. Your manager grades the work; I help you get better at it.</p></div></div>' +
      '<div class="chips">' + D.READS.map(function (r) { return chip(r, hl); }).join('') + '</div>' +
      '<div class="chip-x' + (S.openChip ? ' on' : '') + '"><div>' + chipDetail() + '</div></div>' +
      (S.notes.length ? '<div class="feed"><div class="cap">Notes</div>' + S.notes.slice(0, 6).map(function (x, i) {
        return '<div class="fd ' + x.kind + (hl.note && i === 0 ? ' new' : '') + '"><i></i><div><b>' + esc(x.title) + '</b><span>' + esc(x.text) + '</span></div><em>' + esc(x.ago || '') + '</em></div>';
      }).join('') + '</div>' : '') +
      '<div class="co-next">' + badge(Math.min(10, L + 1)) + '<span>' + esc(nextLine()) + '</span></div>';
  }
  function wireCoach() {
    var cb = $('.ib.call'); if (cb) cb.addEventListener('click', call);
    var sb = $('.ib.swap'); if (sb) sb.addEventListener('click', function () { setPop(S.pop === 'sw' ? null : 'sw'); });
    $$('.sw-it').forEach(function (b) { b.addEventListener('click', function () { pickCoach(b.getAttribute('data-c')); }); });
    $$('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        var k = b.getAttribute('data-k'); S.openChip = S.openChip === k ? null : k;
        $$('.chip').forEach(function (c) { var on = c.getAttribute('data-k') === S.openChip; c.classList.toggle('on', on); c.setAttribute('aria-expanded', on); });
        var x = $('.chip-x'); if (S.openChip) $('div', x).innerHTML = chipDetail(); x.classList.toggle('on', !!S.openChip);
        setTimeout(fade, 450);
      });
    });
  }

  /* ---------- your coach: change it, call it ---------- */
  function pickCoach(k) {
    S.coachKey = k; setPop(null);
    var img = $('.seg.co .me img'); if (img) img.src = CO().photo;
    render(false);
    toast({ kind: 'praise', title: 'Hi, I am ' + CO().name, text: CO().line });
  }
  var WORDS = null;
  fetch(A + 'coach/words.json').then(function (r) { return r.json(); }).then(function (j) { WORDS = j; }).catch(function () {});
  function call() {
    var c = CO(); if (S.call) return;
    var ov = document.createElement('div'); ov.className = 'callv';
    ov.innerHTML = '<div class="cl-v"><video playsinline preload="auto" src="' + c.video + '" poster="' + c.photo + '"></video><div class="cl-ring"><img alt="" src="' + c.photo + '"></div></div>' +
      '<div class="cl-nm"><b>' + esc(c.name) + '</b><span class="cl-st">Calling...</span></div>' +
      '<div class="cl-cap" aria-live="polite"></div>' +
      '<div class="cl-bt"><button class="cl-mute" aria-label="Mute">' + IC.micon + '</button><button class="cl-end" aria-label="End call">' + IC.end + '</button></div>';
    $('.dk').appendChild(ov);
    if (!S.tab) open('coach');
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var v = $('video', ov), st = $('.cl-st', ov), cap = $('.cl-cap', ov), t0 = 0, words = (WORDS || {})[c.key] || [];
    S.call = { ov: ov, timer: 0 };
    $('.cl-mute', ov).addEventListener('click', function () { var b = this, m = b.classList.toggle('on'); b.innerHTML = m ? IC.micoff : IC.micon; b.setAttribute('aria-label', m ? 'Unmute' : 'Mute'); });
    $('.cl-end', ov).addEventListener('click', endCall);
    setTimeout(function () {
      if (!S.call) return;
      ov.classList.add('cl-on'); t0 = performance.now();
      try { var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); }); } catch (e) {}
      S.call.timer = setInterval(function () {
        var sec = Math.floor((performance.now() - t0) / 1000);
        st.textContent = Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
        var t = v.currentTime, said = words.filter(function (w) { return w[0] <= t; }).map(function (w) { return w[2]; });
        if (v.ended) said = words.map(function (w) { return w[2]; });
        cap.textContent = said.slice(-14).join(' ');
        ov.classList.toggle('cl-talk', !v.paused && !v.ended);
      }, 120);
    }, 1400);
  }
  function endCall() {
    if (!S.call) return;
    var ov = S.call.ov, sec = $('.cl-st', ov).textContent; clearInterval(S.call.timer);
    var v = $('video', ov); try { v.pause(); } catch (e) {}
    ov.classList.remove('on'); setTimeout(function () { ov.remove(); }, 400);
    S.call = null;
    if (/\d:\d\d/.test(sec)) { S.notes.unshift({ kind: 'call', title: 'Call with ' + CO().name, text: 'You talked for ' + sec + '.', ago: 'Just now' }); if (S.tab === 'coach') render(false, { note: true }); }
  }

  /* ---------- short notes from the coach ---------- */
  function toast(o) {
    var box = $('.toasts');
    var av = o.kind === 'level' ? badge(o.level) : o.kind === 'grade' ? logo(o.co, 36) : '<img alt="" src="' + CO().photo + '"><i class="k">' + (o.kind === 'nudge' ? IC.bang : IC.check) + '</i>';
    var t = document.createElement('div');
    t.className = 'toast ' + o.kind; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="av">' + av + '</span><div><b>' + esc(o.title) + '</b><span class="tt">' + esc(o.text) + '</span>' + (o.extra || '') + '</div>';
    t.addEventListener('click', function () { open(o.kind === 'level' || o.kind === 'grade' ? 'level' : 'coach'); dismiss(t); });
    box.appendChild(t);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(function () { dismiss(t); }, o.ms || 6000);
  }
  function dismiss(t) { if (!t.parentNode || t.classList.contains('out')) return; t.classList.add('out'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 360); }

  /* ---------- the simulations ---------- */
  function start(key) {
    stop(true);
    var sim = D.SIMS[key];
    dayOne(sim);
    S.sim = { key: key, t0: performance.now(), i: 0, over: false, end: sim.steps[sim.steps.length - 1].at + 3 };
    S.dot = false;
    $$('.toast').forEach(dismiss);
    draw(); render(false);
    $('.sim-now').classList.add('on');
    status();
    S.sim.timer = setInterval(tick, 100);
  }
  function stop(quiet) {
    if (!S.sim) return;
    clearInterval(S.sim.timer);
    if (!quiet) { S.sim = null; $('.sim-now').classList.remove('on'); draw(); }
  }
  function tick() {
    var sim = D.SIMS[S.sim.key], t = (performance.now() - S.sim.t0) / 1000;
    while (S.sim.i < sim.steps.length && sim.steps[S.sim.i].at <= t) apply(sim.steps[S.sim.i++], t);
    var bar = $('.sim-now .bar i'); if (bar) bar.style.width = Math.min(100, t / S.sim.end * 100) + '%';
    if (t >= S.sim.end) { clearInterval(S.sim.timer); S.sim.over = true; S.now = null; status(true); draw(); }
  }
  function status(over) {
    var el = $('.sim-now'), sim = D.SIMS[S.sim.key];
    if (over) { el.innerHTML = '<span class="st">' + esc(sim.label) + ' done</span> Level ' + lv() + ' · ' + n(S.pts) + ' skill points'; return; }
    var now = S.now, sc = now && D.SC[now.sc];
    var idle = S.done.length ? 'Scenario done · Level ' + lv() + ' · ' + n(S.pts) + ' skill points' : 'Day one';
    el.innerHTML = (sc ? logo(sc.co, 24) + '<span><span class="st">' + esc(now.stage) + ' ·</span> ' + esc(sc.title) + ' at ' + esc(coName(sc.co)) + '</span>' : '<span><span class="st">' + esc(sim.label) + ' ·</span> ' + esc(idle) + '</span>') +
      '<span class="bar"><i></i></span>';
  }
  function apply(st) {
    if (st.type === 'work') { S.now = { sc: st.sc, stage: st.stage }; status(); draw(); return; }
    var sc = S.now && D.SC[S.now.sc];
    if (st.type === 'note') {
      if (st.read) S.reads[st.read] = { v: st.v, saw: st.saw, tip: st.tip };
      S.notes.unshift({ kind: st.kind, title: st.title, text: st.text, ago: sc ? S.now.stage + ' · ' + coName(sc.co) : '' });
      S.when = sc ? 'After ' + S.now.stage + ' at ' + coName(sc.co) + ', just now' : 'Just now'; S.live = true;
      toast({ kind: st.kind, title: st.title, text: st.text });
      if (S.tab !== 'coach') { S.dot = true; draw(); }
      if (S.tab === 'coach') render(false, { read: st.read, note: true });
      return;
    }
    if (st.type === 'think') {
      S.think = st.text; S.live = true;
      if (S.tab === 'coach') render(false, { think: true }); else { S.dot = true; draw(); }
      return;
    }
    if (st.type === 'done') {
      var g = D.GRADES.filter(function (x) { return x.key === st.grade; })[0], was = lv(), s2 = D.SC[st.sc];
      S.pts += g.pts; S.gain = g.pts; S.done.push(st.sc); S.newDone = st.sc; S.now = null;
      toast({ kind: 'grade', co: s2.co, title: s2.mgr + ' graded your ' + coName(s2.co) + ' scenario', text: s2.title, extra: '<span class="grade">' + esc(g.name) + (g.pts ? ' · +' + n(g.pts) + ' skill points' : ' · no skill points') + '</span>' });
      draw(); status();
      var L = lv();
      if (L > was) {
        S.openLv = null;
        var seg = $('.seg.lv'); seg.classList.remove('bump'); void seg.offsetWidth; seg.classList.add('bump');
        setTimeout(function () {
          var x = D.LEVELS[L - 1];
          toast({ kind: 'level', level: L, title: 'Level ' + L, text: x.roles + ' new ' + (x.kind === 'Internships' ? 'internships' : 'roles') + ' open to you', extra: '<span class="stk">' + x.cos.slice(0, 5).map(function (k) { return logo(k, 22); }).join('') + '</span>', ms: 7000 });
        }, 1100);
      }
      if (S.tab === 'level') render(false, { up: L > was ? L : 0 }); else if (S.tab === 'coach') render(false, {});
      setTimeout(function () { S.gain = 0; }, 200);
    }
  }

  window.H = { S: S, open: open, close: close, start: start, stop: stop, call: call, endCall: endCall, pickCoach: pickCoach };
  rest();
  page();
  var q = new URLSearchParams(location.search), op = q.get('open');
  if (q.get('sim')) setTimeout(function () { start(q.get('sim')); }, 400);
  if (op === 'level' || op === 'coach') setTimeout(function () { open(op); if (q.get('pop')) setPop(op === 'level' ? 'lv' : 'co'); if (q.get('chip')) { var c = $('.chip[data-k="' + q.get('chip') + '"]'); if (c) c.click(); } }, 600);
})();
