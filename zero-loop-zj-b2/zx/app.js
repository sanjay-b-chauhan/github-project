/* Zero, the scenario app (b2). One scenario, played by hand: home, kickoff, the check, the work, the final meeting, the review.
   Click fills, you press Send. Navid speaks only when points are at stake; every fix keeps points; the review banks them. */
(function () {
  'use strict';
  var C = window.ZC, V = window.ZV || {}, SC = C.sc, A = window.ZXA || 'zx/', BUILD = 'b2';
  var src = function (p) { return A + String(p).replace(/^zx\//, ''); };
  var abs = function (p) { return new URL(src(p), location.href).href; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = function (n) { return '<i data-lucide="' + n + '"></i>'; };
  var icons = function (r) { if (window.zj) zj.icons(r); };
  /* ?speed=N runs every clock N times faster, for headless test sweeps only */
  var SPD = Math.max(1, +(new URLSearchParams(location.search).get('speed') || 1));
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms / SPD); }); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var mq = window.matchMedia('(max-width:900px)');
  var phone = function () { return mq.matches; };
  var mk = function (p, c, s) { return '<span class="zx-mk" style="--m:url(\'' + abs(p) + '\');--c:' + (c || '#131417') + (s ? ';--s:' + s + 'px' : '') + '"></span>'; };
  var face = function (p, alt) { return '<img class="zx-face" src="' + src(p) + '" alt="' + esc(alt || '') + '">'; };

  /* ─── state ─── */
  var RANKS = [0, 1000, 2500, 4500];
  function rankOf(x) { var r = 1; RANKS.forEach(function (v, i) { if (x >= v) r = i + 1; }); return r; }
  var ORDER = ['kickoff', 'check', 'work', 'present', 'review'];
  var KEPT_AT = { kickoff: 0, check: 200, work: 300, present: 1000, review: 1000 };
  var STEPS = [['kickoff', 'Kickoff', SC.kickMins + ' min'], ['check', 'Understanding check', ''], ['work', 'Routing plan', 'Due 2pm'], ['present', 'Final meeting', '4 min'], ['review', 'Review', '']];
  var S = { route: '', bank: C.xp0, kept: 0, sound: true, done: {}, after: false, intro: false, gesture: false, t: 0, paused: false, plan: 1, fx: { size: 0, test: 0 }, reqs: [0, 0, 0] };

  /* the words in the work, from b30's worst day: what he drafts, and what good looks like */
  var BAD1 = 'yo whats up!! router stuff going good';
  var GOOD1 = 'Hi Jay. Plan for the router: trigger on form submit, route by region, then deal size. Full plan to you by 2pm.';
  var ASK = "I'm stuck on the routing step. Where should I start?";
  var GOOD3 = 'Here is the September lead export I am testing on. Is September the right month to test with?';
  var BAD4 = 'here is the plan';
  var GOOD4 = 'Routing plan, three pages: the wait and what it costs, the cause, and the router with how I will test it.';
  var GOOD5 = 'Added the deal size rule and tested it on September leads: median 4 minutes.';
  var FILE1 = { name: 'Lead export, September.csv', meta: 'CSV · 1,212 rows', icon: 'sheet' };
  var planFile = function (n) { return n === 4 ? { name: 'Routing plan v2.pdf', meta: 'PDF · 3 pages', icon: 'file-text' } : { name: 'Routing plan.pdf', meta: 'PDF · ' + (n === 1 ? '1 page' : '3 pages'), icon: 'file-text' }; };
  var KW = [/reply|3 ?h|three hours|two minutes|2 min/i, /size|seat|big|enterprise|fifty|50/i, /test|september|1,?200|last month|median/i];
  var FIXQ = ['Missed. The number is reply time: 3 h 10 m today, under 2 minutes when done.', 'Missed. Region alone sends big deals to whoever is free; deal size picks the right rep.', 'Missed. Run it on the 1,200 September leads and show the median reply time.'];
  var RES = [['notebook-pen', 'Your kickoff notes: three on the problem, three on the outcome'], ['sheet', 'Lead export: 1,212 leads from September'], ['route', 'Ramp routes by region, then deal size'], ['book-open', 'HubSpot: start a workflow on form submit, not a nightly sync'], ['map', 'Territory map: 4 regions, 18 reps']];
  var NEXT = [{ t: 'Enrichment waterfall', co: 'Notion', logo: 'logo/notion.svg', c: '#131417', rank: 2, blurb: 'Half our target accounts have no email. Fill them in, and say what each one costs.', time: '~1 hr 15 min', diff: 'Intermediate' },
    { t: 'Outbound agent with evals', co: 'Shopify', logo: 'logo/shopify.svg', c: '#5E8E3E', rank: 3 }];

  /* ─── flows: a route change cancels whatever was running ─── */
  var RUN = 0, ABORT = { abort: true }, TM = [];
  function flow(fn) {
    var t = ++RUN, live = function () { return t === RUN; };
    var w = function (ms) { return wait(ms).then(function () { if (!live()) throw ABORT; }); };
    var until = function (p) { return p.then(function (v) { if (!live()) throw ABORT; return v; }); };
    fn({ live: live, w: w, until: until }).catch(function (e) { if (e !== ABORT) console.error(e); });
  }
  function every(fn, ms) { TM.push(setInterval(fn, ms)); }
  function stopAll() { RUN++; Voice.stop(); TM.forEach(clearInterval); TM = []; S.paused = false; }

  /* ─── Navid's voice: the audio when the browser allows it, the same word clock when it does not ─── */
  var Voice = {
    a: null, raf: 0,
    play: function (key, o) {
      var self = this; o = o || {}; this.stop();
      var v = V[key];
      return new Promise(function (res) {
        if (!v) { res(); return; }
        var a = new Audio(src('voice/' + key + '.mp3')), on = false, t0 = performance.now(), tt = 0, n = -1;
        a.muted = !S.sound; self.a = a;
        a.addEventListener('playing', function () { on = true; });
        if (SPD === 1) { var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); }
        var tick = function () {
          var c = (performance.now() - t0) / 1000 * SPD, t = on && !a.paused ? a.currentTime : c;
          if (on && a.ended) t = v.d + 1;
          tt = Math.max(tt, t);
          var k = 0; while (k < v.w.length && v.w[k][0] <= tt) k++;
          if (k !== n) { n = k; if (o.onWord) o.onWord(k); }
          if (o.onTime) o.onTime(Math.min(1, tt / v.d));
          var end = (on ? (a.ended || a.currentTime >= v.d - 0.02) : c >= v.d + 0.2) || c > v.d + 3;
          if (end) { self.raf = 0; if (o.onWord) o.onWord(v.w.length); if (o.onTime) o.onTime(1); res(); return; }
          self.raf = requestAnimationFrame(tick);
        };
        self.raf = requestAnimationFrame(tick);
      });
    },
    stop: function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; if (this.a) { try { this.a.pause(); } catch (e) {} this.a = null; } },
    mute: function () { if (this.a) this.a.muted = !S.sound; }
  };

  /* ─── Navid, one dark capsule beside the work ─── */
  function capsule(host, o) {
    o = o || {};
    var el = document.createElement('div');
    el.className = 'zx-cap'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="zx-cap-h"><span class="zx-cv"><video src="' + src(C.coach.video) + '" poster="' + src(C.coach.photo) + '" muted loop playsinline autoplay></video>' +
      '<svg viewBox="0 0 58 58" aria-hidden="true"><circle class="zx-rt" cx="29" cy="29" r="27"/><circle class="zx-rf" cx="29" cy="29" r="27"/></svg></span>' +
      '<span class="zx-cap-n"><b>' + esc(C.coach.name) + '</b><span>' + esc(o.hook || C.coach.role) + '</span></span>' +
      (o.stake ? '<span class="zx-stake">' + ic('coins') + esc(o.stake) + '</span>' : '') + '</div>' +
      '<p class="zx-say"></p><div class="zx-cap-x"></div><div class="zx-cap-a"></div>';
    host.appendChild(el); icons(el); scrollEnd();
    var vid = $('video', el); if (vid) { var vp = vid.play(); if (vp && vp.catch) vp.catch(function () {}); }
    var say = $('.zx-say', el), ring = $('.zx-rf', el), acts = $('.zx-cap-a', el), x = $('.zx-cap-x', el);
    var words = function (key) { var v = V[key]; say.innerHTML = v ? v.w.map(function (w) { return '<i>' + esc(w[2]) + '</i>'; }).join(' ') : ''; return $$('i', say); };
    var api = {
      el: el,
      preview: function (key) { words(key); },
      speak: function (key) {
        acts.innerHTML = ''; var ws = words(key);
        return Voice.play(key, {
          onWord: function (n) { ws.forEach(function (w, i) { w.classList.toggle('zx-on', i < n); }); },
          onTime: function (f) { ring.style.strokeDashoffset = 170 * (1 - f); }
        });
      },
      acts: function (list) {
        acts.innerHTML = list.map(function (a) { return '<button type="button" class="zx-ca' + (a[2] ? ' zx-pri' : '') + '">' + (a[3] ? ic(a[3]) : '') + esc(a[0]) + '</button>'; }).join('');
        icons(acts);
        return new Promise(function (res) { $$('button', acts).forEach(function (b, i) { b.onclick = function () { acts.innerHTML = ''; res(i); }; }); });
      },
      good: function (t) { x.innerHTML = t ? '<div class="zx-try"><span>What good looks like</span><p>' + esc(t) + '</p></div>' : ''; },
      close: function () { return new Promise(function (res) { el.classList.add('zx-gone'); setTimeout(function () { el.remove(); res(); }, 240); }); }
    };
    return api;
  }
  /* a hold: Navid says what is at stake, Why? gives the reason and what good looks like, the fix is one press */
  async function coachFix(f, host, o) {
    var c = capsule(host, { stake: o.stake, hook: o.hook || 'Hold on' });
    await f.until(c.speak(o.key));
    var why = o.why;
    for (;;) {
      var list = why ? [['Why?'], [o.fix, null, 1, o.icon]] : [[o.fix, null, 1, o.icon]];
      var i = await f.until(c.acts(list));
      if (why && i === 0) { await f.until(c.speak(why)); c.good(o.good); why = null; continue; }
      break;
    }
    if (o.after) await o.after(c);
    await f.until(c.close());
  }

  /* ─── the composer: click fills the draft, you press Send ─── */
  function Comp(host, o) {
    o = o || {};
    var el = document.createElement('div');
    el.className = 'zx-comp' + (o.small ? ' zx-small' : '');
    el.innerHTML = '<div class="zx-att"></div><div class="zx-ta" contenteditable="true" role="textbox" aria-multiline="true" aria-label="' + esc(o.ph || 'Message') + '" data-ph="' + esc(o.ph || '') + '"></div>' +
      '<div class="zx-cbar">' + (o.small ? '' : '<button class="zj-round" type="button" aria-label="Attach a file">' + ic('plus') + '</button><span class="zx-grow"></span>') +
      '<button class="zx-send" type="button" aria-label="Send" disabled>' + ic('arrow-up') + '</button></div>';
    host.appendChild(el); icons(el); scrollEnd();
    var ta = $('.zx-ta', el), send = $('.zx-send', el), att = $('.zx-att', el);
    var draft = o.draft || null, file = null, typing = false, held = false, waiter = null, pend = null;
    var val = function () { return ta.innerText.replace(/\s+/g, ' ').trim(); };
    var upd = function () { send.disabled = held || typing || (!val() && !file); };
    var fire = function () { if (send.disabled) return; var v = { text: val(), file: file }; if (!waiter) { pend = v; send.disabled = true; return; } var w = waiter; waiter = null; w(v); };
    ta.addEventListener('input', upd);
    var take = function () { if (draft && !val() && !typing) api.fill(draft); };
    ta.addEventListener('focus', take); ta.addEventListener('click', take);
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); } });
    send.onclick = fire;
    var plus = $('.zx-cbar .zj-round', el); if (plus) plus.onclick = function () { zj.toast('Files you can send show up as suggestions above', { icon: 'paperclip' }); };
    var api = {
      el: el, ta: ta,
      fill: async function (t) {
        typing = true; draft = null; upd(); ta.textContent = '';
        var step = Math.max(1, Math.ceil(t.length / 60));
        for (var i = 0; i < t.length; i += step) { ta.textContent = t.slice(0, i + step); await wait(14); }
        ta.textContent = t; typing = false; upd();
        if (document.activeElement === ta) { try { var r = document.createRange(); r.selectNodeContents(ta); r.collapse(false); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} }
      },
      set: function (o2) { if ('draft' in o2) draft = o2.draft; if ('ph' in o2) { ta.dataset.ph = o2.ph; ta.setAttribute('aria-label', o2.ph); } upd(); },
      attach: function (fl) {
        file = fl || null;
        att.innerHTML = fl ? '<span class="zx-chip"><span class="zx-fi">' + ic(fl.icon || 'file-text') + '</span><span><b>' + esc(fl.name) + '</b><span class="zj-m">' + esc(fl.meta) + '</span></span></span>' : '';
        icons(att); upd();
      },
      hold: function (on) {
        held = on; ta.contentEditable = on ? 'false' : 'true'; el.classList.toggle('zx-held', on);
        if (on) { el.classList.remove('zx-shake'); void el.offsetWidth; el.classList.add('zx-shake'); }
        upd();
      },
      next: function () { return new Promise(function (r) { if (pend) { var v = pend; pend = null; r(v); } else waiter = r; }); },
      clear: function () { ta.textContent = ''; api.attach(null); upd(); },
      focus: function () { ta.focus(); },
      destroy: function () { el.remove(); }
    };
    return api;
  }

  /* ─── the thread ─── */
  function clock() { var m = 540 + S.t, h = Math.floor(m / 60); return (h > 12 ? h - 12 : h) + ':' + String(m % 60).padStart(2, '0'); }
  function scrollEnd() { var sc = $('.zx-scroll'); if (sc) sc.scrollTop = sc.scrollHeight; }
  function add(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); var n = d.firstElementChild; $('#th').appendChild(n); icons(n); scrollEnd(); return n; }
  var jayHead = function () { return '<div class="zx-who">' + face(C.jay.photo) + '<b>' + esc(C.jay.name) + '</b><span class="zj-m">' + clock() + '</span></div>'; };
  async function jay(html, f, ms) {
    var t = add('<div class="zx-msg">' + jayHead() + '<div class="zx-txt"><span class="zx-dots3" aria-label="Jay is typing"><i></i><i></i><i></i></span></div></div>');
    await f.w(ms || 900);
    S.t += 1;
    var d = document.createElement('div'); d.innerHTML = '<div class="zx-msg">' + jayHead() + '<div class="zx-txt">' + html + '</div></div>';
    var m = d.firstElementChild; t.replaceWith(m); icons(m); scrollEnd(); return m;
  }
  function me(v) {
    S.t += 1;
    var fl = v.file ? '<span class="zx-file"><span class="zx-fi">' + ic(v.file.icon || 'file-text') + '</span><span><b>' + esc(v.file.name) + '</b><span class="zj-m">' + esc(v.file.meta) + '</span></span></span>' : '';
    return add('<div class="zx-msg zx-me">' + fl + (v.text ? '<div class="zx-txt">' + esc(v.text) + '</div>' : '') + '</div>');
  }
  function sys(text, icn) { return add('<div class="zx-sys">' + (icn ? ic(icn) : '') + '<span>' + esc(text) + '</span></div>'); }
  /* suggestions above the composer. With onPick, every press counts (pick again to change your mind) */
  function sugs(list, onPick) {
    var h = $('#sugs'); if (!h) return Promise.resolve(-1);
    h.innerHTML = list.map(function (s, i) { return '<button type="button" class="zx-sug" data-i="' + i + '">' + (s[1] ? ic(s[1]) : '') + '<span>' + esc(s[0]) + '</span></button>'; }).join('');
    icons(h);
    return new Promise(function (res) { $$('button', h).forEach(function (b) { b.onclick = function () { if (onPick) onPick(+b.dataset.i); else res(+b.dataset.i); }; }); });
  }
  function clearSugs() { var h = $('#sugs'); if (h) h.innerHTML = ''; }

  /* ─── points: kept now, banked at the review ─── */
  function keep(pts, label, host) {
    S.kept += pts;
    var row = document.createElement('div'); row.className = 'zx-sys';
    row.innerHTML = '<span class="zx-coin">' + ic('coins') + '+' + pts + ' · ' + esc(label) + '</span>';
    (host || $('#th')).appendChild(row); icons(row); scrollEnd();
    setTimeout(function () { fly($('.zx-coin', row)); }, 450);
  }
  function zr() { var p = document.createElement('div'); p.style.cssText = 'position:fixed;left:100px;top:0;width:1px;height:1px'; document.body.appendChild(p); var k = p.getBoundingClientRect().left / 100; p.remove(); return k || 1; }
  function fly(coin) {
    var to = phone() ? $('.zx-menu') : $('.zx-rank .zx-rbar');
    if (!coin || !to || !coin.isConnected) { paintRank(); return; }
    var k = zr(), a = coin.getBoundingClientRect(), b = to.getBoundingClientRect();
    var c = coin.cloneNode(true); c.classList.add('zx-fly'); c.style.left = a.left / k + 'px'; c.style.top = a.top / k + 'px';
    document.body.appendChild(c);
    var dx = (b.left + b.width / 2 - a.left - a.width / 2) / k, dy = (b.top + b.height / 2 - a.top - a.height / 2) / k;
    var an = c.animate([{ transform: 'none' }, { transform: 'translate(' + dx * 0.55 + 'px,' + (dy * 0.55 - 36) + 'px) scale(.85)', offset: 0.55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)' }], { duration: 760, easing: 'cubic-bezier(.45,0,.25,1)' });
    an.onfinish = function () { c.remove(); paintRank(); };
  }
  function band() { var r = rankOf(S.bank), lo = RANKS[r - 1], hi = RANKS[r] || lo + 2000; return { r: r, lo: lo, hi: hi }; }
  function paintRank() {
    var el = $('.zx-rank'); if (!el) return;
    var b = band(), pb = (S.bank - b.lo) / (b.hi - b.lo) * 100, pk = Math.min(100, (S.bank + S.kept - b.lo) / (b.hi - b.lo) * 100);
    $('.zx-rk img', el).src = src('badge/b' + Math.min(b.r, 2) + '.webp');
    $('.zx-rk b', el).textContent = 'Rank ' + b.r;
    $('.zx-xp', el).textContent = fmt(S.bank) + ' of ' + fmt(b.hi) + (S.kept ? ' · +' + fmt(S.kept) + ' today' : '');
    $('.zx-rbar i', el).style.width = pb + '%'; $('.zx-rbar u', el).style.width = pk + '%';
  }

  /* ─── the shell: sidebar, top bar, body ─── */
  function shell() {
    if ($('.zx-app')) return;
    $('#zx').innerHTML = '<div class="zx-app">' +
      '<aside class="zx-side" aria-label="Scenario">' +
        '<div class="zx-sh">' + zj.logoMark() + '<span class="zx-sb">' + BUILD + '</span><button class="zj-round" type="button" data-go="home" aria-label="Home">' + ic('house') + '</button></div>' +
        '<div class="zx-scn"><span class="zx-co">' + mk(SC.logo, SC.color, 18) + '</span><div><b>' + esc(SC.art) + '</b><span class="zj-m">' + esc(SC.co) + ' · ' + esc(SC.time) + '</span></div></div>' +
        '<nav class="zx-steps">' + STEPS.map(function (s) {
          return '<button type="button" class="zx-stp" data-step="' + s[0] + '"><span class="zx-si">' + ic('check') + '</span><span>' + esc(s[1]) + '</span><span class="zj-m">' + esc(s[2]) + '</span></button>' +
            (s[0] === 'work' ? '<div class="zx-sub zx-hide" id="reqs">' + SC.reqs.map(function (r, i) { return '<div class="zx-req" data-r="' + i + '">' + ic('circle') + '<span>' + esc(r.t) + '</span></div>'; }).join('') + '</div>' : '');
        }).join('') + '</nav>' +
        '<div class="zx-res zx-shut"><button type="button" class="zx-sl" data-act="res">Resources' + ic('chevron-right') + '</button>' + SC.resources.map(function (r, i) { return '<a data-res="' + i + '">' + ic(RES[i][0]) + '<span>' + esc(r) + '</span></a>'; }).join('') + '</div>' +
        '<div class="zx-sfoot">' +
          '<div class="zx-rank"><div class="zx-rk"><img src="' + src('badge/b1.webp') + '" alt=""><div><b>Rank 1</b><span class="zx-xp"></span></div></div><div class="zx-rbar"><u></u><i></i></div></div>' +
          '<div class="zx-user">' + face(C.me.photo) + '<div><b>' + esc(C.me.name) + '</b><span class="zj-m">GTM Engineer path</span></div><button class="zj-round" type="button" data-act="sound" aria-label="Sound">' + ic(S.sound ? 'volume-2' : 'volume-x') + '</button></div>' +
        '</div>' +
      '</aside><div class="zx-scrim" data-act="menu"></div>' +
      '<main class="zx-main"><header class="zx-top"><button class="zj-round zx-menu" type="button" data-act="menu" aria-label="Menu">' + ic('menu') + '</button><div class="zx-tt"><b id="tt"></b><span class="zj-m" id="ts"></span></div><div class="zx-tr" id="tr"></div></header><div class="zx-body" id="body"></div></main>' +
    '</div>';
    icons($('#zx'));
  }
  function paintSide() {
    var cur = S.route;
    STEPS.forEach(function (s) {
      var b = $('.zx-stp[data-step="' + s[0] + '"]'); if (!b) return;
      var done = !!S.done[s[0]], on = s[0] === cur;
      b.classList.toggle('zx-done', done); b.classList.toggle('zx-on', on); b.classList.toggle('zx-lock', !done && !on);
    });
    var rq = $('#reqs'); if (rq) {
      rq.classList.toggle('zx-hide', !(cur === 'work' || S.done.work));
      $$('.zx-req', rq).forEach(function (r, i) {
        var ok = !!S.reqs[i]; if (r.classList.contains('zx-ok') === ok) return;
        r.classList.toggle('zx-ok', ok); r.querySelector('svg, i').outerHTML = ic(ok ? 'circle-check' : 'circle'); icons(r);
      });
    }
    paintRank();
  }
  function setTop(t, sub, right) { $('#tt').textContent = t; $('#ts').textContent = sub || ''; $('#tr').innerHTML = right || ''; icons($('#tr')); }
  var people = function (list) { return '<span class="zx-people">' + list.map(function (p) { return face(p.photo, p.name); }).join('') + '</span>'; };
  var artBtn = function (label) { return '<button class="zx-pill zx-artbtn" type="button" data-act="art">' + ic('panel-right') + esc(label) + '</button>'; };
  var cta = function (label, go, icn) { return '<button class="zj-key zx-cta" type="button"' + (go ? ' data-go="' + go + '"' : '') + '>' + esc(label) + ic(icn || 'arrow-right') + '</button>'; };
  /* the dock grows when Navid or a file shows up: keep the newest message in view */
  function watchDock() { var d = $('#dock'); if (d && window.ResizeObserver) new ResizeObserver(scrollEnd).observe(d); }
  function chatBody(art) {
    return '<div class="zx-pane"><div class="zx-scroll"><div class="zx-col"><div class="zx-thread" id="th"></div></div></div>' +
      '<div class="zx-dock" id="dock"><div id="caph"></div><div class="zx-sugs" id="sugs"></div><div id="comph"></div></div></div>' + (art || '');
  }

  /* ═══ HOME ═══ */
  function scrHome() {
    var b = band(), pct = (S.bank - b.lo) / (b.hi - b.lo) * 100, two = S.after, n = NEXT[0];
    var hero = two
      ? '<div class="zx-kick"><span class="zx-co">' + mk(n.logo, n.c, 14) + '</span><span>Scenario two · ' + esc(n.co) + '</span></div>' +
        '<h1>' + esc(n.t) + '</h1><p class="zx-bl">' + esc(n.blurb) + '</p>' +
        '<div class="zx-meta"><span>' + ic('clock-3') + '<b>' + esc(n.time) + '</b></span><span>' + ic('signal') + '<b>' + esc(n.diff) + '</b></span><span>' + ic('coins') + 'Up to <b>3,000</b> points</span></div>' +
        '<div class="zx-hact"><button class="zx-wkey" type="button" data-act="two">Start the kickoff' + ic('arrow-right') + '</button><button class="zx-dghost" type="button" data-act="again">' + ic('rotate-ccw') + 'Play Lead Rush again</button></div>' +
        '<div class="zx-next"><span class="zx-done"><span class="zx-co">' + mk(SC.logo, SC.color, 12) + '</span>Lead Rush · Meets expectations</span><span><span class="zx-co">' + mk(NEXT[1].logo, NEXT[1].c, 12) + '</span>' + esc(NEXT[1].t) + ic('lock') + 'Rank 3</span></div>'
      : '<div class="zx-kick"><span class="zx-co">' + mk(SC.logo, SC.color, 14) + '</span><span>Scenario one · ' + esc(SC.co) + '</span></div>' +
        '<h1>' + esc(SC.art) + '</h1><p class="zx-bl">' + esc(SC.blurb) + '</p>' +
        '<div class="zx-meta"><span>' + ic('clock-3') + '<b>' + esc(SC.time) + '</b></span><span>' + ic('signal') + '<b>' + esc(SC.diff) + '</b></span><span>' + ic('coins') + 'Up to <b>' + esc(SC.pays) + '</b> points</span><span>' + face(C.jay.photo) + 'With <b>' + esc(C.jay.name) + '</b></span></div>' +
        '<div class="zx-hact"><button class="zx-wkey" type="button" data-go="kickoff">Start the kickoff' + ic('arrow-right') + '</button></div>' +
        '<div class="zx-next"><span>Next</span>' + NEXT.map(function (x) { return '<span><span class="zx-co">' + mk(x.logo, x.c, 12) + '</span>' + esc(x.t) + ic('lock') + 'Rank ' + x.rank + '</span>'; }).join('') + '</div>';
    $('#zx').innerHTML = '<div class="zx-home"><div class="zx-world"></div>' +
      '<header class="zx-htop">' + zj.logoMark() + '<span class="zx-hb">' + BUILD + '</span>' +
        '<div class="zx-hpill"><img class="zx-b" src="' + src('badge/b' + Math.min(b.r, 2) + '.webp') + '" alt=""><span class="zx-pt"><b>Rank ' + b.r + '</b><span class="zx-hbar"><i style="width:' + pct + '%"></i></span></span><span class="zj-m" style="color:rgba(255,255,255,.6)">' + fmt(S.bank) + ' of ' + fmt(b.hi) + '</span></div>' +
        '<button class="zx-hround" type="button" data-act="sound" aria-label="Sound">' + ic(S.sound ? 'volume-2' : 'volume-x') + '</button></header>' +
      '<section class="zx-hero">' + hero + '</section><div class="zx-hcoach" id="hc"></div></div>';
    icons($('#zx'));
    document.querySelector('meta[name=theme-color]').content = '#0B0B0C';
    if (S.intro || two) return;
    flow(async function (f) {
      await f.w(1100);
      var c = capsule($('#hc'), { hook: C.coach.role });
      if (!S.gesture) { c.preview('intro'); await f.until(c.acts([['Hear Navid', null, 1, 'play']])); }
      await f.until(c.speak('intro'));
      await f.until(c.acts([['Got it', null, 1]]));
      S.intro = true;
      await f.until(c.close());
    });
  }

  /* ═══ KICKOFF ═══ */
  function scrKick() {
    setTop('Kickoff', C.jay.name + ' · ' + SC.kickMins + ' min', people([C.jay]));
    $('#body').innerHTML = '<div class="zx-pane"><div class="zx-scroll"><div class="zx-col">' +
      '<div class="zx-video"><img src="' + src(C.jay.wide) + '" alt="Jay Shah on the kickoff call"><span class="zx-live"><i></i><span id="kclock">0:00</span></span>' +
        '<span class="zx-tag" id="ktag">' + face(C.jay.photo) + '<b>' + esc(C.jay.name) + '</b><span class="zx-eq"><i></i><i></i><i></i></span></span></div>' +
      '<p class="zx-caption" id="cap"></p>' +
      '<div class="zx-nums">' + SC.big.map(function (b, i) { return '<div class="zx-num' + (i < 3 ? ' zx-bad' : '') + '"><b>' + esc(b.n) + '</b><span>' + esc(b.l) + '</span></div>'; }).join('') + '</div>' +
      '<div class="zx-ctrl"><div class="zx-prog"><i></i><i></i><i></i><i></i></div><span class="zj-m" id="kstate">Jay is talking</span><span class="zx-grow"></span><button class="zj-round" type="button" id="kpause" aria-label="Pause">' + ic('pause') + '</button></div>' +
      '<div id="kmob"></div><div class="zx-kend" id="kend"></div>' +
      '</div></div></div>' +
      '<aside class="zx-art" id="art"><div class="zx-art-h">' + ic('notebook-pen') + '<b>Your notes</b><span class="zj-m">Kickoff with Jay</span></div>' +
      '<div class="zx-art-b" id="artb"><div class="zx-notes" id="notes"><div><h3>The problem</h3><div class="zx-ns" id="np"></div></div><div><h3>The outcome</h3><div class="zx-ns" id="no"></div></div><div class="zx-notedock" id="nd"></div></div></div></aside>';
    icons($('#body'));
    placeNotes();
    var pb = $('#kpause');
    pb.onclick = function () { S.paused = !S.paused; pb.innerHTML = ic(S.paused ? 'play' : 'pause'); pb.setAttribute('aria-label', S.paused ? 'Play' : 'Pause'); icons(pb); $('#kstate').textContent = S.paused ? 'Paused' : 'Jay is talking'; $('#ktag').classList.toggle('zx-quiet', S.paused); };
    var sec = 0;
    every(function () { if (S.paused) return; sec++; var k = $('#kclock'); if (k) k.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }, 1000);
    flow(async function (f) {
      var cap = $('#cap'), nums = $$('.zx-num'), prog = $$('.zx-prog i');
      for (var i = 0; i < 4; i++) {
        prog[i].classList.add('zx-on');
        await f.w(i ? 700 : 900);
        var words = SC.kick[i].split(' ');
        cap.innerHTML = words.map(function (w) { return '<i>' + esc(w) + '</i>'; }).join(' ');
        var ws = $$('i', cap);
        for (var k = 0; k < ws.length; k++) {
          while (S.paused) await f.w(200);
          ws[k].classList.add('zx-on');
          if (k === Math.min(3, ws.length - 1)) nums[i].classList.add('zx-on');
          await f.w(320);
        }
        if (i < 2) { await f.w(250); note('#np', SC.notes.problem[i]); }
        if (i === 2) { await f.w(400); await notesHold(f); }
        if (i === 3) { for (var j = 0; j < SC.notes.outcome.length; j++) { await f.w(380); note('#no', SC.notes.outcome[j]); } }
      }
      $('#kstate').textContent = 'Kickoff done'; $('#ktag').classList.add('zx-quiet'); pb.remove();
      S.done.kickoff = true; paintSide();
      $('#kend').innerHTML = cta('Take the understanding check', 'check'); icons($('#kend'));
      if (phone()) $('#kend').scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
  }
  function placeNotes() {
    var n = $('#notes'); if (!n) return;
    var art = $('#art');
    if (phone()) { $('#kmob').appendChild(n); if (art) art.classList.add('zx-hide'); }
    else { $('#artb').appendChild(n); if (art) art.classList.remove('zx-hide'); }
  }
  function note(sel, t, mine) {
    var n = document.createElement('div'); n.className = 'zx-nn';
    n.innerHTML = '<div><span>' + esc(t) + '</span><span class="zx-by' + (mine ? ' zx-yours' : '') + '">' + (mine ? ic('pen-line') + 'You wrote this' : ic('sparkles') + 'Zero wrote this') + '</span></div>';
    $(sel).appendChild(n); icons(n);
  }
  async function notesHold(f) {
    $('#kstate').textContent = 'Waiting for your note'; $('#ktag').classList.add('zx-quiet');
    var wr = document.createElement('div'); wr.className = 'zx-nwait'; wr.textContent = 'Your turn: the third number'; $('#np').appendChild(wr);
    var nd = $('#nd');
    if (phone()) nd.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await coachFix(f, nd, { key: 'notes_hold', stake: '+200 if you write it', fix: 'Write it', icon: 'pen-line' });
    var comp = Comp(nd, { ph: 'The third number, in your words', small: true });
    comp.focus(); comp.fill(SC.notes.problem[2]);
    var v = await f.until(comp.next());
    comp.destroy(); wr.remove(); note('#np', v.text, true);
    keep(200, 'Wrote the note yourself', nd);
    await f.w(1300);
    nd.innerHTML = '';
    $('#kstate').textContent = 'Jay is talking'; $('#ktag').classList.remove('zx-quiet');
  }

  /* ═══ THE UNDERSTANDING CHECK ═══ */
  function scrCheck() {
    setTop('Understanding check', '3 questions from the kickoff', people([C.jay]));
    $('#body').innerHTML = chatBody(); watchDock();
    S.t = 13;
    flow(async function (f) {
      var comp = Comp($('#comph'), { ph: 'Answer in your own words' });
      sys('Understanding check · 3 questions', 'list-checks');
      await jay('Quick check before you build. Three questions, all from the kickoff.', f, 800);
      var right = 0;
      for (var i = 0; i < 3; i++) {
        var q = SC.pop[i];
        await jay(esc(q.q), f, 900);
        var opts = i === 1 ? [q.good, q.weak] : [q.weak, q.good];
        sugs(opts.map(function (t) { return [t, 'corner-down-right']; }), function (k) { comp.fill(opts[k]); });
        var v = await f.until(comp.next());
        clearSugs(); comp.clear();
        var m = me(v);
        var ok = v.text === q.good || (v.text !== q.weak && KW[i].test(v.text));
        if (ok) right++;
        var vd = document.createElement('span'); vd.className = 'zx-verdict' + (ok ? '' : ' zx-miss');
        vd.innerHTML = ic(ok ? 'circle-check' : 'circle-alert') + '<span>' + (ok ? 'Right' : esc(FIXQ[i])) + '</span>';
        m.appendChild(vd); icons(vd); scrollEnd();
        await f.w(500);
      }
      comp.destroy();
      await jay(right === 3 ? 'Three for three. Go build it.' : right === 2 ? 'Two of three. Good enough to start.' : right === 1 ? 'One of three. Read your notes back before you build.' : 'None of those landed. Read your notes back before you build.', f, 900);
      var c = capsule($('#caph'), { stake: '+100 for the check', hook: right === 3 ? 'Three for three' : 'Quick one' });
      await f.until(c.speak(right === 3 ? 'pou_good' : 'pou_low'));
      await f.until(c.acts([['Got it', null, 1]]));
      await f.until(c.close());
      keep(100, 'Understanding check · ' + right + ' of 3 right');
      S.done.check = true; paintSide();
      $('#comph').innerHTML = '<div class="zx-goal">' + cta('Start the routing plan', 'work') + '</div>'; icons($('#comph'));
    });
  }

  /* ═══ THE WORK: the chat with Jay, the plan open beside it ═══ */
  function planHTML() {
    var thin = S.plan === 1, N = thin ? 1 : 3;
    var pn = function (i) { return '<span class="zx-pn">' + i + ' of ' + N + '</span>'; };
    var nw = function (t) { return '<span class="zx-tagnew">' + ic('plus') + esc(t) + '</span>'; };
    if (thin) return '<div class="zx-page" id="pg1"><h4>Routing plan</h4><p>Trigger on form submit, route by region, first reply from the rep.</p>' + pn(1) + '</div>';
    var d1 = SC.deck[1];
    var max = d1.rows[0][2];
    return '<div class="zx-page" id="pg1"><h4>The wait, and what it costs</h4><p>Inbound leads wait 3 h 10 m for a first reply, up from 47 minutes six months ago. Every hour a lead waits cuts the chance of a meeting by about 8%.</p><div class="zx-pbig">$2.4M of pipeline a quarter</div>' + pn(1) + '</div>' +
      '<div class="zx-page" id="pg2"><h4>The cause</h4><p>' + esc(d1.title) + '. ' + esc(d1.callout[1]) + '</p><div class="zx-bars">' + d1.rows.map(function (r) { return '<div class="zx-bar"><span>' + esc(r[0]) + '</span><i><b style="width:' + (r[2] / max * 100) + '%"></b></i><span>' + r[2] + '%</span></div>'; }).join('') + '</div>' + pn(2) + '</div>' +
      pg3();
    function pg3() {
      var rows = [['Form submit', 'Triggers the workflow'], [S.fx.size ? 'Region, then deal size' : 'Region', S.fx.size ? 'Picks the rep. 50 seats and up go to Enterprise' : 'Picks the rep', S.fx.size], ['First reply from that rep', 'Target: under 2 minutes'], ['No match or away', 'Goes to the team lead']];
      return '<div class="zx-page" id="pg3"><h4>The router, and how I will test it</h4><div class="zx-prows">' + rows.map(function (r) { return '<div class="zx-prow"><b>' + esc(r[0]) + (r[2] ? nw('Added') : '') + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>' +
        (S.fx.test ? '<div class="zx-ptest">' + ic('flask-conical') + '<span>Tested on 1,200 September leads: median reply in 4 minutes.</span>' + nw('Added') + '</div>' : '<div class="zx-ptest zx-none">' + ic('flask-conical') + '<span>Test: not run yet</span></div>') + pn(3) + '</div>';
    }
  }
  function paintPlan(rise) {
    var b = $('#artb'); if (!b) return;
    b.innerHTML = '<div class="zx-doc">' + planHTML() + '</div>';
    if (rise) rise.forEach(function (id) { var p = $('#' + id); if (p) p.classList.add('zx-rise'); });
    icons(b);
    $('#artm').textContent = S.plan === 1 ? 'Draft · 1 page' : S.plan === 4 ? 'v2 · 3 pages' : '3 pages';
    var ab = $('.zx-artbtn'); if (ab) ab.lastChild.textContent = S.plan === 1 ? 'Plan' : 'Plan · 3 pages';
  }
  function patchPage3() { var p = $('#pg3'); if (!p) return; var d = document.createElement('div'); d.innerHTML = planHTML(); var n = d.querySelector('#pg3'); n.classList.add('zx-new'); p.replaceWith(n); icons(n); }
  function openArt(on) { var a = $('.zx-app'); if (a) a.classList.toggle('zx-artopen', on == null ? !a.classList.contains('zx-artopen') : on); }

  function scrWork() {
    S.plan = 1; S.fx = { size: 0, test: 0 }; S.reqs = [0, 0, 0];
    setTop('Routing plan', 'For ' + C.jay.name + ' · due 2pm', people([C.jay]) + artBtn('Plan'));
    $('#body').innerHTML = chatBody('<aside class="zx-art" id="art"><div class="zx-art-h">' + ic('file-text') + '<b>Routing plan.pdf</b><span class="zj-m" id="artm"></span><button class="zj-round zx-artx" type="button" data-act="art" aria-label="Close the plan">' + ic('x') + '</button></div><div class="zx-art-b" id="artb"></div></aside>');
    $('#dock').insertAdjacentHTML('beforeend', '<p class="zx-hint">Navid reads each message before Jay does.</p>'); watchDock();
    icons($('#body'));
    paintPlan(); paintSide();
    S.t = 20;
    flow(async function (f) {
      var comp = Comp($('#comph'), { ph: 'Reply to Jay' }), v, cap = $('#caph');
      sys('Today · Routing plan due 2pm', 'calendar-clock');
      await jay('Morning. What is your plan for the router?', f, 1000);

      /* 1. the tone: "yo whats up" held at Send */
      comp.set({ draft: BAD1 });
      v = await f.until(comp.next());
      var casual = /\b(yo|sup|wassup|whats up)\b|!!/i.test(v.text) || v.text.length < 30;
      if (casual) {
        comp.hold(true);
        await coachFix(f, cap, { key: 'casual', why: 'casual_why', stake: '+200 if you rewrite it', fix: 'Rewrite it', good: GOOD1, icon: 'pen-line' });
        comp.hold(false); await comp.fill(GOOD1);
        v = await f.until(comp.next());
      }
      comp.clear(); me(v); keep(200, casual ? 'Rewrote the update' : 'A clear first update');
      await jay('Clear. Go.', f, 900);

      /* 2. stuck for twelve minutes: ask */
      await f.w(1000); S.t += 12; sys('12 minutes later', 'clock-3');
      await f.w(600);
      await coachFix(f, cap, { key: 'stuck', stake: '+100 if you ask now', fix: 'Ask Jay', hook: 'Need a hand?', icon: 'message-circle' });
      await comp.fill(ASK);
      v = await f.until(comp.next()); comp.clear(); me(v); keep(100, 'Asked Jay');
      var g = SC.guide, m = await jay(esc(g.say), f, 1400);
      m.insertAdjacentHTML('beforeend', '<div class="zx-note"><b>' + esc(g.callout[0]) + '</b><p>' + esc(g.callout[1]) + '</p></div><pre class="zx-code">' + esc(g.code) + '</pre>' +
        '<div class="zx-list">' + g.steps.map(function (s, i) { return '<div class="zx-li' + (i === 0 ? ' zx-now' : '') + '"><span class="zx-n">' + (i + 1) + '</span><div><span>' + esc(s) + '</span></div></div>'; }).join('') + '</div>');
      scrollEnd();

      /* 3. a file with no words */
      await f.w(700);
      await f.until(sugs([['Send Jay the September export', 'paperclip']])); clearSugs();
      comp.attach(FILE1); comp.set({ ph: 'Add a message, or just send the file' });
      v = await f.until(comp.next());
      var bare = !v.text;
      if (bare) {
        comp.hold(true);
        await coachFix(f, cap, { key: 'nofile', why: 'why_nofile', stake: '+100 if you add the words', fix: 'Add the words', good: GOOD3, icon: 'pen-line' });
        comp.hold(false); await comp.fill(GOOD3);
        v = await f.until(comp.next());
      }
      comp.clear(); comp.set({ ph: 'Reply to Jay' }); me(v); keep(100, bare ? 'Added the words' : 'Said what the file is');
      await jay('Yes, September is the right month. Good question.', f, 1000);

      /* 4. a one page plan for a three part brief */
      await f.w(700);
      await f.until(sugs([['Send the plan to Jay', 'file-up']])); clearSugs();
      comp.attach(planFile(1)); await comp.fill(BAD4);
      v = await f.until(comp.next());
      comp.hold(true); $('#pg1').classList.add('zx-flag');
      await coachFix(f, cap, {
        key: 'thin', why: 'why_thin', stake: '+300 if it has all three parts', fix: 'Fix it', hook: 'Before you submit', icon: 'wand-sparkles',
        good: 'Three pages: the wait and what it costs, the cause, and the router with how you will test it.',
        after: async function (c) {
          S.plan = 3; paintPlan(['pg1', 'pg2', 'pg3']);
          if (phone()) zj.toast('Your plan is three pages now', { icon: 'file-text', action: 'Open', onAction: function () { openArt(true); } });
          comp.attach(planFile(3)); comp.hold(false); comp.fill(GOOD4);
          await f.until(c.speak('thin_ok'));
        }
      });
      v = await f.until(comp.next()); comp.clear(); me(v); keep(300, 'All three parts');
      var fb = SC.feedback, fm = await jay(esc(fb.say), f, 1500);
      fm.insertAdjacentHTML('beforeend', '<div class="zx-list">' + fb.items.map(function (it, i) { return '<div class="zx-li" data-fb="' + i + '"><span class="zx-n">' + (i + 1) + '</span><div><span class="zx-h">High priority</span><span>' + esc(it.t) + '</span><span class="zj-m">' + esc(it.why) + ' ' + esc(it.how) + '</span></div></div>'; }).join('') + '</div>');
      scrollEnd();

      /* 5. fix both, send v2 */
      var left = [0, 1];
      var FX = [['Run the test on September leads', 'flask-conical', 'test', 'Test run on 1,200 September leads: median reply in 4 minutes'], ['Add the deal size rule', 'list-plus', 'size', 'Deal size rule added: 50 seats and up go to Enterprise']];
      while (left.length) {
        await f.w(500);
        var k = await f.until(sugs(left.map(function (i) { return [FX[i][0], FX[i][1]]; })));
        var idx = left[k]; left.splice(k, 1); clearSugs();
        S.fx[FX[idx][2]] = 1; S.plan = 3; patchPage3();
        sys(FX[idx][3], FX[idx][1]);
        var li = $('[data-fb="' + idx + '"]', fm);
        if (li) { li.classList.add('zx-ok'); $('.zx-n', li).innerHTML = ic('check'); var h = $('.zx-h', li); h.textContent = 'Fixed'; h.classList.add('zx-fixed'); icons(li); }
        if (phone()) zj.toast(idx === 0 ? 'Test added to page 3' : 'Deal size added to page 3', { icon: 'file-text', action: 'Open', onAction: function () { openArt(true); } });
      }
      await f.w(500);
      await f.until(sugs([['Send v2 to Jay', 'send']])); clearSugs();
      S.plan = 4; paintPlan();
      comp.attach(planFile(4)); await comp.fill(GOOD5);
      v = await f.until(comp.next()); comp.clear(); me(v);
      await jay(esc(fb.pass), f, 1300);
      S.reqs = [1, 1, 0]; S.done.work = true; paintSide();
      sys('Routing plan done · two of three requirements met', 'circle-check');
      comp.destroy(); var hint = $('#dock .zx-hint'); if (hint) hint.remove();
      $('#comph').innerHTML = '<div class="zx-goal">' + cta('Go to the final meeting', 'present', 'video') + '</div>'; icons($('#comph'));
    });
  }

  /* ═══ THE FINAL MEETING ═══ */
  function slideHTML(i) {
    var d = SC.deck[i], inner = '';
    if (d.kind === 'big') inner = '<div class="zx-huge">' + esc(d.num) + '</div><p class="zx-ssub">' + esc(d.sub) + '</p>';
    if (d.kind === 'bars') { var max = d.rows[0][2]; inner = '<div class="zx-bars">' + d.rows.map(function (r) { return '<div class="zx-bar"><span>' + esc(r[0]) + '</span><i><b style="width:' + (r[2] / max * 100) + '%"></b></i><span>' + r[2] + '%</span></div>'; }).join('') + '</div>'; }
    if (d.kind === 'steps') inner = '<div class="zx-srows">' + d.rows.map(function (r, k) { return '<div><span class="zx-n">' + (k + 1) + '</span><div><b>' + esc(r[0]) + '</b><span class="zj-m">' + esc(r[1]) + '</span></div></div>'; }).join('') + '</div>';
    return '<h3>' + esc(d.title) + '</h3>' + inner + '<div class="zx-slfoot"><span>' + esc(SC.deckTitle) + '</span><span>' + (i + 1) + ' of 3</span></div>';
  }
  function scrPresent() {
    setTop('Final meeting', 'With ' + C.jay.name + ' and ' + C.avery.name, '<span class="zx-rec"><i></i><span id="rec">REC 0:00</span></span>');
    $('#body').innerHTML = '<div class="zx-pane"><div class="zx-scroll"><div class="zx-stagebox"><div class="zx-slide" id="slide"></div></div>' +
      '<div class="zx-room">' + [['jay', C.jay.wide, C.jay.first], ['avery', C.avery.wide, C.avery.first], ['me', C.me.photo, 'You']].map(function (p) { return '<div class="zx-tile" data-p="' + p[0] + '"><img src="' + src(p[1]) + '" alt=""><span>' + esc(p[2]) + '</span></div>'; }).join('') + '</div>' +
      '<p class="zx-sayline" id="say"></p><div class="zx-pctl" id="pctl"></div><div class="zx-capdock" id="caph"></div><div class="zx-capdock" id="comph"></div><div style="height:40px"></div></div></div>';
    var sec = 0;
    every(function () { sec++; var r = $('#rec'); if (r) r.textContent = 'REC ' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }, 1000);
    var talk = function (p) { $$('.zx-tile').forEach(function (t) { t.classList.toggle('zx-talk', t.dataset.p === p); }); };
    var show = function (i) { var s = $('#slide'); s.innerHTML = slideHTML(i); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; };
    var btn = function (label, icn) {
      var h = $('#pctl'); h.innerHTML = '<span class="zx-dots">' + [0, 1, 2].map(function (k) { return '<i class="' + (k === cur ? 'zx-on' : '') + '"></i>'; }).join('') + '</span>' + cta(label, null, icn);
      icons(h); return new Promise(function (res) { $('button', h).onclick = function () { h.innerHTML = ''; res(); }; });
    };
    var cur = 0;
    flow(async function (f) {
      for (var i = 0; i < 3; i++) {
        cur = i; show(i); talk('me');
        await f.w(500);
        await sayWords('You', SC.said[i], f, 300);
        talk(null);
        await f.until(btn(i < 2 ? 'Next slide' : "I'm done presenting", i < 2 ? 'arrow-right' : 'check'));
      }
      await f.w(500); talk('avery');
      await sayWords(C.avery.name, SC.qa.q, f, 230);
      talk(null);
      var comp = Comp($('#comph'), { ph: 'Answer Avery', draft: SC.qa.a });
      var v = await f.until(comp.next()); comp.destroy();
      talk('me'); await sayWords('You', v.text, f, 280);
      await f.w(700); talk('jay');
      await sayWords(C.jay.name, 'Thanks, Sanjay. Feedback in a minute.', f, 260);
      talk(null); TM.forEach(clearInterval); TM = [];
      await f.w(700);
      await coachFix(f, $('#caph'), { key: 'ums', why: 'why_ums', stake: '+300 next time, with pauses', fix: 'Got it', hook: 'Right after', good: 'Leads wait three hours ten for a first reply. Half of that is a person deciding who gets the lead.' });
      report();
    });
  }
  async function sayWords(who, text, f, per) {
    var s = $('#say'), ws = text.split(' ');
    s.innerHTML = '<span class="zx-sw">' + esc(who) + '</span>' + ws.map(function (w) { return '<i' + (w.replace(/[^a-z]/gi, '').toLowerCase() === 'um' ? ' class="zx-um"' : '') + '>' + esc(w) + '</i>'; }).join(' ');
    var is = $$('i', s);
    for (var k = 0; k < is.length; k++) { is[k].classList.add('zx-on'); await f.w(per); }
  }
  function report() {
    var R = SC.report;
    setTop('Final meeting', "Jay's feedback", people([C.jay, C.avery]));
    var fbr = function (kind) { return function (r) { return '<div class="zx-fb zx-' + kind + '">' + ic(kind === 'y' ? 'circle-check' : 'circle-alert').replace('<i ', '<i class="zx-ic" ') + '<div><p>' + esc(r[0]) + '</p><div class="zx-ts"><span class="zx-t">' + ic('play') + esc(r[1]) + '</span><span>' + esc(r[2]) + '</span></div></div></div>'; }; };
    $('#body').innerHTML = '<div class="zx-pane"><div class="zx-scroll"><div class="zx-col zx-docpage">' +
      '<div class="zx-who">' + face(C.jay.photo) + '<b>' + esc(C.jay.name) + '</b><span class="zj-m">sent you feedback</span></div>' +
      '<h1>Your final meeting</h1><p class="zx-lead">' + esc(R.overview) + '</p>' +
      '<section class="zx-sec2"><h2>What worked</h2>' + R.liked.map(fbr('y')).join('') + '</section>' +
      '<section class="zx-sec2"><h2>To work on</h2>' + R.work.map(fbr('w')).join('') + '</section>' +
      '<div class="zx-acts"><button class="zj-sec zx-cta" type="button" id="pf">' + ic('folder-plus') + 'Add to my portfolio</button>' + cta('See my review', 'review') + '</div>' +
      '</div></div></div>';
    icons($('#body'));
    $('#pf').onclick = function () { var b = $('#pf'); b.disabled = true; b.innerHTML = ic('check') + 'In your portfolio'; icons(b); zj.toast('Added to your portfolio', { icon: 'check' }); };
  }

  /* ═══ THE REVIEW ═══ */
  function scrReview() {
    var Rv = SC.review;
    setTop('Review', SC.art + ' · ' + SC.co, '');
    var tool = function (t) { var L = { HubSpot: ['logo/hubspot.svg', '#FF7A59'], n8n: ['logo/n8n.svg', '#EA4B71'], Claude: ['logo/anthropic.svg', '#D97757'] }[t]; return '<span>' + (L ? mk(L[0], L[1], 14) : '<img src="https://www.google.com/s2/favicons?sz=64&domain=sheets.google.com" alt="">') + esc(t) + '</span>'; };
    $('#body').innerHTML = '<div class="zx-pane"><div class="zx-scroll"><div class="zx-col">' +
      '<div class="zx-celebrate"><div class="zx-badges"><img class="zx-old" src="' + src('badge/b1.webp') + '" alt="Rank 1">' + ic('chevrons-right') + '<img class="zx-pop" src="' + src('badge/b2.webp') + '" alt="Rank 2"></div>' +
        '<span class="zj-status">' + esc(Rv.band) + '</span><h1>Rank 2</h1>' +
        '<div class="zx-pts"><div><b>+' + esc(Rv.points) + '</b><span class="zj-m">points kept</span></div><div><b>900</b><span class="zj-m">from your fixes</span></div><div><b>' + fmt(C.xp0 + 1000) + '</b><span class="zj-m">points in all</span></div></div></div>' +
      '<div class="zx-capdock" id="caph"></div>' +
      '<section class="zx-sec2"><h2>From Jay</h2><div class="zx-quote">' + face(C.jay.photo) + '<div><p>' + esc(Rv.note) + '</p><span class="zj-m">' + esc(C.jay.name) + ', ' + esc(C.jay.title) + '</span></div></div></section>' +
      '<section class="zx-sec2"><h2>Skills you showed</h2><div class="zx-grid2">' + Rv.skills.map(function (s) { return '<div class="zx-skrow"><span>' + esc(s[0]) + '</span><span class="zj-m">' + esc(s[1]) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="zx-sec2"><h2>Tools you used</h2><div class="zx-tools">' + Rv.tools.map(tool).join('') + '</div></section>' +
      '<section class="zx-sec2"><h2>Up next</h2>' + NEXT.map(function (x) { return '<div class="zx-nextrow"><span class="zx-co">' + mk(x.logo, x.c, 18) + '</span><div><b>' + esc(x.t) + '</b><span class="zj-m">' + esc(x.co) + '</span></div><span class="zj-status">' + (x.rank <= 2 ? 'Open now' : ic('lock') + 'Rank ' + x.rank) + '</span></div>'; }).join('') + '</section>' +
      '<div class="zx-acts">' + cta('Back home', 'home', 'house') + '</div>' +
      '</div></div></div>';
    icons($('#body'));
    flow(async function (f) {
      await f.w(500);
      S.bank = C.xp0 + 1000; S.kept = 0; S.after = true; S.done.review = true; paintSide();
      await f.w(1100);
      var c = capsule($('#caph'), { hook: 'Rank 2' });
      await f.until(c.speak('up_b15'));
      await f.until(c.acts([['Got it', null, 1]]));
      await f.until(c.close());
    });
  }

  /* ─── routing ─── */
  var SCREENS = { kickoff: scrKick, check: scrCheck, work: scrWork, present: scrPresent, review: scrReview };
  function route() { var h = (location.hash || '#home').slice(1).split('/')[0]; return h === 'home' || SCREENS[h] ? h : 'home'; }
  function nav(r) { if (location.hash === '#' + r) go(r); else location.hash = r; }
  function go(r) {
    stopAll(); zj.unpop && zj.unpop();
    var tst = document.getElementById('zj-toast'); if (tst) tst.innerHTML = '';
    S.route = r;
    if (r === 'home') { scrHome(); return; }
    var i = ORDER.indexOf(r);
    ORDER.forEach(function (k, j) { S.done[k] = j < i; });
    if (r !== 'review') S.after = false;
    S.bank = C.xp0; S.kept = KEPT_AT[r];
    if (r !== 'work') S.reqs = r === 'present' || r === 'review' ? [1, 1, 0] : [0, 0, 0];
    shell();
    var app = $('.zx-app'); app.classList.remove('zx-open', 'zx-artopen');
    document.querySelector('meta[name=theme-color]').content = '#FFFFFF';
    SCREENS[r]();
    paintSide();
    var sc = $('.zx-scroll'); if (sc) sc.scrollTop = 0;
  }

  /* ─── one listener for every press ─── */
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); nav(g.dataset.go); return; }
    var st = e.target.closest('.zx-stp'); if (st) { if (!st.classList.contains('zx-lock')) nav(st.dataset.step); return; }
    var rs = e.target.closest('[data-res]'); if (rs) { var R = RES[+rs.dataset.res]; zj.toast(R[1], { icon: R[0] }); return; }
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act;
    if (act === 'sound') { S.sound = !S.sound; Voice.mute(); $$('[data-act=sound]').forEach(function (b) { b.innerHTML = ic(S.sound ? 'volume-2' : 'volume-x'); icons(b); }); zj.toast(S.sound ? 'Sound on' : 'Sound off', { icon: S.sound ? 'volume-2' : 'volume-x' }); }
    if (act === 'menu') { var app = $('.zx-app'); if (app) app.classList.toggle('zx-open'); }
    if (act === 'art') openArt();
    if (act === 'res') a.parentNode.classList.toggle('zx-shut');
    if (act === 'two') zj.toast('Scenario two is not in this prototype yet', { icon: 'info' });
    if (act === 'again') { S.after = false; S.bank = C.xp0; S.kept = 0; S.done = {}; nav('kickoff'); }
  });
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { S.gesture = true; }, { capture: true, once: true }); });

  /* the dev panel lives behind Control+D, never in the product */
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey && (e.key === 'd' || e.key === 'D'))) return;
    e.preventDefault();
    var d = $('#zxdev'); if (d) { d.remove(); return; }
    d = document.createElement('div'); d.id = 'zxdev'; d.className = 'zx-dev';
    d.innerHTML = '<b>Jump to</b>' + [['home', 'Home'], ['kickoff', 'Kickoff'], ['check', 'Understanding check'], ['work', 'Routing plan'], ['present', 'Final meeting'], ['report', "Jay's feedback"], ['review', 'Review'], ['after', 'Home, after the review']].map(function (j) { return '<button type="button" data-j="' + j[0] + '">' + esc(j[1]) + '</button>'; }).join('');
    document.body.appendChild(d);
    d.onclick = function (ev) {
      var b = ev.target.closest('[data-j]'); if (!b) return; var j = b.dataset.j;
      if (j === 'after') { S.after = true; S.intro = true; S.bank = C.xp0 + 1000; S.kept = 0; nav('home'); return; }
      if (j === 'home') { S.after = false; S.bank = C.xp0; S.kept = 0; }
      if (j === 'report') { nav('present'); setTimeout(function () { stopAll(); S.kept = 1000; S.done.work = true; paintSide(); report(); }, 30); return; }
      nav(j);
    };
  });

  /* fit: the same layout, a touch bigger on a big screen */
  function fit() {
    var w = innerWidth, h = innerHeight, z = w <= 900 ? 1 : Math.min(1.35, Math.max(1, Math.min(w / 1440, h / 860)));
    document.documentElement.style.zoom = z; document.documentElement.style.setProperty('--z', z);
  }
  addEventListener('resize', fit);
  mq.addEventListener('change', function () { placeNotes(); });
  addEventListener('hashchange', function () { go(route()); });
  fit();
  go(route());
  window.ZX = { S: S, go: go, nav: nav, BUILD: BUILD };
})();
