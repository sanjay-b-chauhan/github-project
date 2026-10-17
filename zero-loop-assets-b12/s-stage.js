/* s-stage: the stage screen, rebuilt from the real app (09 to 12).
   Left: the stage panel (stage card, TIME LEFT, REQUIREMENTS or FOLLOW ALONG, resources, SHARED IN CHAT).
   Centre: the manager header, "Your plan", one continuous chat, and the composer.
   Steps: plan / test / submit / block / guided / resubmit (scenario 1) and the short form (scenarios 2 and 3).
   The coach holds a weak message inside the composer (block). Guided mode turns the screen light. */
(function () {
  'use strict';
  var J = window.J, D = J.D, $ = J.$, $$ = J.$$, esc = J.esc, IC = J.IC;

  var SV = {
    doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"><path d="M4.3 1.9h7.4c.8 0 1.4.6 1.4 1.4v6.3l-3.9 4.5H4.3c-.8 0-1.4-.6-1.4-1.4V3.3c0-.8.6-1.4 1.4-1.4z"/><path d="M13.1 9.6h-2.6c-.8 0-1.3.6-1.3 1.3v3.2M5.6 5.2h4.8M5.6 7.6h3.2"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 2.2h5.6M6.3 2.2v4.1L4.6 8.9h6.8L9.7 6.3V2.2M8 8.9v4.9"/></svg>',
    shot: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 3.6v3M2 5.1h3"/><path d="M9 4.5h2.2M14 4.5h.6c.8 0 1.4.6 1.4 1.4v.7M16 9.2v2.2M16 14v.6c0 .8-.6 1.4-1.4 1.4H14M11.2 16H9M6.4 16h-.6c-.8 0-1.4-.6-1.4-1.4V14M4.4 11.4V9.2"/></svg>',
    up: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.6V3.4M6.4 6.8 10 3.2l3.6 3.6M3.6 12v2.6c0 .9.7 1.6 1.6 1.6h9.6c.9 0 1.6-.7 1.6-1.6V12"/></svg>',
    send: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 16V4.2M4.8 9.2 10 4l5.2 5.2"/></svg>',
    mic: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="7" y="2.6" width="6" height="9.6" rx="3"/><path d="M4.4 9.6a5.6 5.6 0 0 0 11.2 0M10 15.2v2.4M11 6.2h2M11 8.6h2"/></svg>',
    talk: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.4c3.3 0 5.8 2.3 5.8 5.2S11.3 12.8 8 12.8c-.8 0-1.6-.1-2.3-.4L2.6 13.6l.9-2.6C2.6 10 2.2 8.9 2.2 7.6 2.2 4.7 4.7 2.4 8 2.4z"/><path d="M5.6 7.7h.1M8 7.7h.1M10.4 7.7h.1" stroke-width="1.6"/></svg>',
    eye: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8z"/><circle cx="8" cy="8" r="1.9"/></svg>',
    pen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M11.2 2.6 4 11.8l-.6 1.8 1.8-.6 7.2-9.2M3 14.4h10"/></svg>',
    spark: IC.spark,
    up2: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg>'
  };

  function scOf(d) { return D.SC[d.sc] || D.SC.router; }
  function mgrOf(d) { return D.P[scOf(d).mgr] || D.P.jay; }
  function coach() { return (window.DK && DK.CO) ? DK.CO() : D.COACH; }
  function secs(t) { var p = String(t || '1:00:00').split(':').map(Number); while (p.length < 3) p.unshift(0); return p[0] * 3600 + p[1] * 60 + p[2]; }
  function hms(x) { x = Math.max(0, Math.round(x)); var h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return h + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2); }
  function readMs(t) { return Math.min(4200, 600 + String(t || '').length * 34); }

  /* this scenario's stage beats, and what the earlier ones left behind */
  function chapter(ctx) {
    var out = [], ch = ctx.beat && ctx.beat.ch;
    J.beats().forEach(function (x, i) { if (x.ch === ch && x.screen === 'stage') out.push({ i: i, d: x.d || {} }); });
    return out;
  }
  function info(d, ctx) {
    var s = scOf(d), before = chapter(ctx).filter(function (x) { return x.i < ctx.i; }), k = before.length;
    var ticks = {}, files = [], done = false;
    before.forEach(function (x) {
      (x.d.tick || []).forEach(function (t) { ticks[t] = true; });
      if (x.d.done) done = true;
      if (x.d.submit && x.d.submit.file) files.push(x.d.submit.file);
    });
    if (done) (s.reqs || []).forEach(function (r, i) { ticks[i] = true; });
    var total = secs(s.stageTime), rem = Math.round(total * (0.87 - 0.13 * k)) - (k * 41) % 60;
    return { s: s, k: k, before: before, ticks: ticks, files: files, total: total, rem: Math.max(90, rem), base: s.id === 'router' ? 2 : 1 };
  }

  /* everything a finished stage beat leaves in the chat, in order */
  function items(d) {
    var out = [];
    (d.chat || []).forEach(function (m) { out.push({ k: 'm', who: m.who, t: m.t, file: m.file }); });
    if (d.guide) {
      var g = d.guide;
      if (g.say) out.push({ k: 'm', who: 'mgr', t: g.say });
      if (g.callout) out.push({ k: 'call', c: g.callout });
      if (g.code) out.push({ k: 'code', t: g.code });
      if (g.chips && g.chips[0]) out.push({ k: 'm', who: 'me', t: g.chips[0] });
    }
    if (d.block) {
      out.push({ k: 'm', who: 'me', t: d.block.good });
      (d.after || []).forEach(function (m) { out.push({ k: 'm', who: m.who, t: m.t }); });
    }
    if (d.submit) {
      out.push({ k: 'm', who: 'me', t: d.submit.t, file: d.submit.file });
      out.push({ k: 'rev', file: d.submit.file });
      if (d.feedback) {
        if (d.feedback.say) out.push({ k: 'm', who: 'mgr', t: d.feedback.say });
        out.push({ k: 'fb', fb: d.feedback });
      }
      if (d.done) out.push({ k: 'done', stage: d.stage });
    }
    return out;
  }

  /* ---------- pieces ---------- */
  function thumb(d) {
    var c = (D.CO[scOf(d).co] || [])[2] || '#E07A4F';
    var bars = [[78, c], [44], [30], [16]].map(function (x) { return '<span class="st-tg"><i class="st-tk"></i><i class="st-tb" style="width:' + x[0] + '%' + (x[1] ? ';background:' + x[1] : '') + '"></i></span>'; }).join('');
    var rows = [0, 1, 2, 3].map(function () { return '<span class="st-tg st-tw"><i></i><i></i><i></i><i></i></span>'; }).join('');
    return '<i class="st-t1"></i>' + bars + '<i class="st-t2"></i>' + rows + '<i class="st-tr"></i>';
  }
  function fileRow(f, d) {
    return '<span class="st-fr"><span class="st-th st-ths">' + thumb(d) + '</span><span class="st-fn"><b>' + esc(f) + '</b><em class="st-lab">PDF</em></span></span>';
  }
  function code(t) {
    return String(t).split('\n').map(function (l) { return /^\s*\/\//.test(l) ? '<span class="st-cmt">' + esc(l) + '</span>' : esc(l); }).join('\n');
  }
  function rev(f, ing) {
    return '<div class="st-rv' + (ing ? ' st-ing' : '') + '"><span class="st-ics"><i>' + IC.doc + '</i><i>' + SV.eye + '</i><i>' + SV.pen + '</i><i>' + SV.spark + '</i></span>' +
      '<span class="st-rvt">' + (ing ? 'Reviewing ' : 'Reviewed ') + esc(f) + '</span><span class="st-rvc">' + IC.chev + '</span></div>';
  }
  function fbCard(fb) {
    var its = (fb && fb.items) || [];
    if (!its.length) return '<div class="st-fb st-fbok"><span class="st-lab">Feedback</span><div class="st-ok"><i>' + IC.check + '</i><b>This is ready</b></div></div>';
    return '<div class="st-fb"><span class="st-lab">Feedback</span>' + its.map(function (x, i) {
      var sev = String(x.sev || 'LOW').toUpperCase(), open = i === 0;
      return '<div class="st-fi' + (open ? ' st-open' : '') + '"><div class="st-ft">' + esc(x.t) + '</div>' +
        '<div class="st-tags"><span class="st-cat">Content</span><span class="st-sev st-' + sev.toLowerCase() + '">' + esc(sev) + '</span>' +
        (open ? '<span class="st-tmm">' + SV.talk + 'Tell me more</span>' : '') + '<span class="st-fc' + (open ? ' st-upc' : '') + '">' + IC.chev + '</span></div>' +
        (open ? '<div class="st-fx">' + (x.why ? '<span class="st-lab">Why this feedback</span><p>' + esc(x.why) + '</p>' : '') + (x.how ? '<span class="st-lab">Approach</span><p>' + esc(x.how) + '</p>' : '') + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }
  function sideOf(it) { return it.k === 'm' ? it.who : it.k === 'rev' ? 'sys' : it.k === 'done' ? 'done' : 'mgr'; }
  function row(it, d) {
    var h = '';
    if (it.k === 'm') h = '<div class="st-b' + (it.file ? ' st-bf' : '') + '">' + (it.file ? fileRow(it.file, d) : '') + '<span class="st-bt">' + esc(it.t) + '</span></div>';
    else if (it.k === 'ty') h = '<div class="st-b st-ty" aria-label="typing"><i></i><i></i><i></i></div>';
    else if (it.k === 'call') h = '<div class="st-call"><div class="st-clt">' + esc(it.c[0]) + '</div><p>' + esc(it.c[1]) + '</p></div>';
    else if (it.k === 'code') h = '<pre class="st-code">' + code(it.t) + '</pre>';
    else if (it.k === 'rev') h = rev(it.file, it.ing);
    else if (it.k === 'fb') h = fbCard(it.fb);
    else if (it.k === 'done') h = '<div class="st-dn"><span class="st-dnl"><i>' + IC.check + '</i><b>Stage complete</b><span>' + esc(it.stage || '') + '</span></span></div>';
    var sd = it.k === 'ty' ? 'mgr' : sideOf(it);
    return '<div class="st-r st-k-' + it.k + ' st-s-' + sd + '" data-side="' + sd + '">' + h + '</div>';
  }
  function tightAll(list) {
    var prev = null;
    $$('.st-r', list).forEach(function (r) { setTight(r, prev); prev = r; });
  }
  function setTight(r, prev) {
    var sd = r.getAttribute('data-side');
    r.classList.toggle('st-tight', !!prev && prev.getAttribute('data-side') === sd && (sd === 'mgr' || sd === 'me'));
  }

  /* ---------- the left panel ---------- */
  function leftHTML(d, I) {
    var s = I.s, reqs = s.reqs || [], res = s.resources || {}, g = d.guide;
    var reqH = '<div class="st-rqs"><span class="st-lab st-rql">Requirements</span>' + reqs.map(function (r, i) {
      var sub = r.sub || [], open = i === 0 && sub.length > 0;
      return '<div class="st-rq' + (I.ticks[i] ? ' st-done' : '') + (open ? ' st-open' : '') + '" data-i="' + i + '"><div class="st-rqh"><span class="st-ck">' + IC.check + '</span><span class="st-rqt">' + esc(r.t) + '</span>' +
        (sub.length ? '<span class="st-rqc' + (open ? ' st-upc' : '') + '">' + IC.chev + '</span>' : '') + '</div>' +
        (open ? '<ul class="st-sub">' + sub.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }).join('') + '</div>';
    var faH = '';
    if (g && g.steps) {
      /* he is one step behind when he gets stuck; his reply moves the follow along to guide.at */
      var at = Math.max(0, (g.at == null ? 0 : g.at) - (g.chips && g.chips.length ? 1 : 0));
      faH = '<div class="st-fa"><div class="st-li st-fam">' + SV.doc + '<span>Meeting notes</span></div><span class="st-lab st-fal">Follow along · ' + g.steps.length + ' steps</span><ol class="st-steps">' +
        g.steps.map(function (t, i) { return '<li class="' + (i < at ? 'st-sd' : i === at ? 'st-sa' : 'st-sf') + '"><i></i><span>' + esc(t) + '</span></li>'; }).join('') + '</ol></div>';
    }
    function list(label, arr, cls) {
      return '<div class="st-hr"></div><div class="st-sec ' + (cls || '') + '"><span class="st-lab">' + label + '</span><div class="st-res">' +
        (arr && arr.length ? arr.map(function (t) { return '<div class="st-li">' + SV.doc + '<span>' + esc(t) + '</span></div>'; }).join('') : '<div class="st-li st-none"><span>Nothing shared yet</span></div>') + '</div></div>';
    }
    return '<aside class="st-left">' +
      '<button class="st-back" aria-label="Back">' + IC.left + '</button>' +
      '<div class="st-ttl"><span class="st-lgw">' + J.logo(s.co, 22) + '</span><b>' + esc(s.full || s.title) + '</b></div>' +
      '<div class="st-cpr">' + IC.chev + '<span class="st-lab">Completed</span><b class="st-cnt">' + I.base + '</b></div>' +
      '<div class="st-card">' +
        '<div class="st-sn">' + esc(d.stage || s.stage) + '</div>' +
        '<div class="st-tl"><span class="st-tla">' + IC.clock + '<span class="st-lab">Time left</span><b class="st-tm">' + hms(I.rem) + '</b></span>' +
          '<span class="st-tlb">' + IC.check + '<span class="st-lab">Stage complete</span></span></div>' +
        '<div class="st-pb"><i style="width:' + (I.rem / I.total * 100).toFixed(2) + '%"></i></div>' +
        '<div class="st-hr st-hr0"></div>' + reqH + faH +
        list('Project resources', res.project) + list('Task resources', res.task) + list('Shared in chat', I.files, 'st-shared') +
      '</div></aside>';
  }

  /* ---------- the centre: header, pinned plan, chat, composer ---------- */
  function mainHTML(d, I, m, hist) {
    return '<section class="st-main">' +
      '<header class="st-hd">' + J.face(m, 35) + '<div class="st-hn"><b>' + esc(m.name) + '</b><span>Manager</span></div></header>' +
      '<div class="st-pin">' + SV.pin + '<span class="st-pt">Your plan</span><span class="st-lab">Tap to view</span></div>' +
      '<div class="st-feed"><div class="st-list">' + hist.map(function (it) { return row(it, d); }).join('') + '</div></div>' +
      '<div class="st-chips"></div>' +
      '<div class="st-cmp">' +
        '<div class="st-cc"><div class="st-ccw"></div></div>' +
        '<div class="st-att"><div class="st-attw"></div></div>' +
        '<div class="st-in"><div class="st-tx"></div><div class="st-ph">Ask for help</div></div>' +
        '<div class="st-row"><button class="st-ib st-upl" aria-label="Upload a file">' + SV.up + '</button><button class="st-ib st-sht" aria-label="Screenshot">' + SV.shot + '</button>' +
          '<button class="st-stk">I’m stuck</button><button class="st-rts">Ready to submit</button><span class="st-gap"></span>' +
          '<button class="st-snd" aria-label="Send"><span class="st-mic">' + SV.mic + '</span><span class="st-arr">' + SV.send + '</span></button></div>' +
      '</div></section>';
  }

  function draw(el, d, ctx) {
    var I = info(d, ctx), m = mgrOf(d), hist = [];
    I.before.forEach(function (x) { hist = hist.concat(items(x.d)); });
    el.innerHTML = leftHTML(d, I) + mainHTML(d, I, m, hist);
    var V = el._v = {
      el: el, d: d, I: I, m: m, rem: I.rem, stop: false,
      left: $('.st-left', el), feed: $('.st-feed', el), list: $('.st-list', el), cmp: $('.st-cmp', el), inp: $('.st-in', el), tx: $('.st-tx', el), ph: $('.st-ph', el),
      send: $('.st-snd', el), up: $('.st-upl', el), stk: $('.st-stk', el), cc: $('.st-cc', el), ccw: $('.st-ccw', el), att: $('.st-att', el), attw: $('.st-attw', el),
      chips: $('.st-chips', el), tm: $('.st-tm', el), pb: $('.st-pb i', el), card: $('.st-card', el), cnt: $('.st-cnt', el), shared: $('.st-shared .st-res', el)
    };
    tightAll(V.list);
    new MutationObserver(function () { V.cmp.classList.toggle('st-has', V.tx.textContent.length > 0); }).observe(V.tx, { childList: true, characterData: true, subtree: true });
    /* guided mode opens when he presses "I'm stuck": until then the stage looks as it always does */
    if (d.step === 'guided') { var app = $('#app'); if (app) app.setAttribute('data-theme', 'dark'); }
  }

  /* ---------- motion helpers ---------- */
  function addRow(V, it) {
    var w = document.createElement('div'); w.innerHTML = row(it, V.d);
    var r = w.firstChild, last = V.list.lastElementChild;
    V.list.appendChild(r); setTight(r, last); r.classList.add('st-pop');
    return r;
  }
  function bottom(V) { V.feed.scrollTo({ top: V.feed.scrollHeight, behavior: 'smooth' }); }
  function reveal(V, r) {
    var f = V.feed, max = f.scrollHeight - f.clientHeight;
    f.scrollTo({ top: Math.max(0, Math.min(max, r.offsetTop - 18)), behavior: 'smooth' });
  }
  function pin(V, ms) {
    var t0 = performance.now();
    (function f() { V.feed.scrollTop = V.feed.scrollHeight; if (performance.now() - t0 < ms && V.el.isConnected) requestAnimationFrame(f); })();
  }
  function paintClock(V) { V.tm.textContent = hms(V.rem); V.pb.style.width = (V.rem / V.I.total * 100).toFixed(2) + '%'; }
  function clock(V, s) {
    (async function () {
      try { while (!V.stop) { await s.wait(1000); if (V.stop) return; V.rem = Math.max(0, V.rem - 1); paintClock(V); } } catch (e) { /* the beat moved on */ }
    })();
  }

  /* Sanjay writes and sends */
  async function write(V, t, s, cps) {
    await s.point(V.inp);
    await s.wait(160);
    s.hideCursor();
    if (t.length > 180) {
      /* a long paragraph is pasted, not typed */
      V.tx.innerHTML = '<span class="st-sel">' + esc(t) + '</span>';
      V.tx.scrollTop = V.tx.scrollHeight;
      await s.wait(700);
      V.tx.textContent = t;
      await s.wait(900);
    } else await s.type(V.tx, t, V.short ? 46 : (cps || 38));
  }
  async function sendIt(V, m, s) {
    await s.press(V.send, 60);
    V.tx.textContent = '';
    var r = addRow(V, { k: 'm', who: 'me', t: m.t, file: m.file });
    bottom(V);
    await s.wait(650);
    return r;
  }
  async function meSend(V, m, s) {
    await write(V, m.t, s);
    await s.wait(380);
    return sendIt(V, m, s);
  }
  async function mgrSay(V, t, s) {
    var ty = addRow(V, { k: 'ty' }); bottom(V);
    await s.wait((V.short ? 650 : 800) + Math.min(500, t.length * 4));
    ty.remove();
    var r = addRow(V, { k: 'm', who: 'mgr', t: t }); reveal(V, r);
    await s.wait(readMs(t));
    return r;
  }
  async function chat(V, msgs, s) {
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].who === 'me') await meSend(V, msgs[i], s);
      else await mgrSay(V, msgs[i].t, s);
    }
  }
  async function tick(V, arr, s) {
    for (var i = 0; i < arr.length; i++) {
      var r = $('.st-rq[data-i="' + arr[i] + '"]', V.el);
      if (r && !r.classList.contains('st-done')) { r.classList.add('st-done', 'st-flash'); await s.wait(320); }
    }
    await s.wait(400);
  }

  /* the coach moment: the weak message is held inside the composer */
  function coachCard(b) {
    var c = coach();
    return '<div class="st-ccx" role="alert">' +
      '<div class="st-cch"><span class="st-cca"><img alt="" src="' + c.photo + '"></span><b>' + esc(c.name) + ', your coach</b><span class="st-ccp">' + IC.pause + 'Not sent</span></div>' +
      '<div class="st-cct">I would not send this yet.</div>' +
      '<p class="st-ccy">' + esc(b.why) + '</p>' +
      '<div class="st-cctr"><em>Try this instead:</em><p>' + esc(b.good) + '</p></div>' +
      '<div class="st-ccb"><button class="st-use">' + IC.check + 'Use this</button><button class="st-any">Send anyway</button></div>' +
    '</div>';
  }
  async function block(V, d, s) {
    var b = d.block;
    await write(V, b.bad, s, 30);
    await s.wait(450);
    await s.press(V.send, 0);
    /* the send is held: the composer shakes and the coach steps in, inside it */
    V.cmp.classList.add('st-held');
    V.el.classList.add('st-focus');
    V.cmp.classList.remove('st-shake'); void V.cmp.offsetWidth; V.cmp.classList.add('st-shake');
    s.vibrate();
    await s.wait(420);
    V.ccw.innerHTML = coachCard(b);
    V.cc.classList.add('on'); pin(V, 760);
    await s.wait(900 + Math.min(5400, (String(b.why).length + String(b.good).length) * 22));
    if (b.anyway) {
      /* worst case: he ignores the coach and sends it anyway */
      var any = $('.st-any', V.cc);
      await s.point(any);
      await s.wait(350);
      await s.press(any, 80);
      V.cmp.classList.remove('st-held', 'st-shake');
      V.el.classList.remove('st-focus');
      V.cc.classList.remove('on'); pin(V, 760);
      await s.wait(500);
      await sendIt(V, { t: b.bad }, s);
    } else {
    var use = $('.st-use', V.cc);
    await s.point(use);
    await s.wait(250);
    await s.press(use, 80);
    V.tx.innerHTML = '<span class="st-new">' + esc(b.good) + '</span>';
    V.cmp.classList.remove('st-held', 'st-shake');
    V.el.classList.remove('st-focus');
    V.cc.classList.add('st-used'); V.cc.classList.remove('on'); pin(V, 760);
    await s.wait(1500);
    V.cc.classList.remove('st-used');
    await sendIt(V, { t: b.good }, s);
    }
    for (var i = 0; i < (d.after || []).length; i++) {
      var m = d.after[i];
      if (m.who === 'me') await meSend(V, m, s); else await mgrSay(V, m.t, s);
    }
  }

  /* he attaches the file, sends it, and the manager's feedback comes back */
  function attachCard(f, d) {
    return '<div class="st-af"><div class="st-th">' + thumb(d) + '</div><b>' + esc(f) + '</b><em class="st-lab">PDF</em><i class="st-ax">' + IC.x + '</i></div>';
  }
  function share(V, f, s) {
    var none = $('.st-none', V.shared); if (none) none.remove();
    var li = document.createElement('div'); li.className = 'st-li st-pop st-new2'; li.innerHTML = SV.doc + '<span>' + esc(f) + '</span>';
    V.shared.appendChild(li);
    s.scroll(V.left);
  }
  async function complete(V, d, s) {
    var r = addRow(V, { k: 'done', stage: d.stage || V.I.s.stage }); bottom(V);
    s.scroll(V.left, 0);
    await s.wait(600);
    var rows = $$('.st-rq', V.el);
    for (var i = 0; i < rows.length; i++) if (!rows[i].classList.contains('st-done')) { rows[i].classList.add('st-done', 'st-flash'); await s.wait(300); }
    V.stop = true;
    V.card.classList.add('st-cpl');
    V.cnt.textContent = String(V.I.base + 1); V.cnt.classList.add('st-bump');
    await s.wait(V.short ? 1700 : 2000);
    return r;
  }
  async function submit(V, d, s) {
    var sub = d.submit, fb = d.feedback || { items: [] };
    await s.press(V.up, 160);
    V.attw.innerHTML = attachCard(sub.file, d);
    V.att.classList.add('on'); pin(V, 650);
    await s.wait(V.short ? 600 : 800);
    await write(V, sub.t, s, 40);
    await s.wait(380);
    await s.press(V.send, 60);
    V.tx.textContent = ''; V.att.classList.remove('on');
    addRow(V, { k: 'm', who: 'me', t: sub.t, file: sub.file }); pin(V, 650);
    if (sub.file) share(V, sub.file, s);
    await s.wait(1000);
    var rv = addRow(V, { k: 'rev', file: sub.file, ing: true }); bottom(V);
    await s.wait(V.short ? 1100 : 1500);
    var rb = $('.st-rv', rv); rb.classList.remove('st-ing'); $('.st-rvt', rb).textContent = 'Reviewed ' + (sub.file || '');
    s.scroll(V.left, 0);
    await s.wait(350);
    if (fb.say) await mgrSay(V, fb.say, s);
    var card = addRow(V, { k: 'fb', fb: fb }); reveal(V, card);
    var its = fb.items || [], f0 = its[0];
    await s.wait(f0 ? Math.min(6400, 1400 + (String(f0.t).length + String(f0.why || '').length + String(f0.how || '').length) * 21) : 1100);
    if (d.done) await complete(V, d, s);
  }

  /* guided mode: he presses "I'm stuck", the screen turns light, Jay walks him through it */
  async function guided(V, d, s) {
    var g = d.guide || {};
    await s.wait(500);
    await s.press(V.stk, 300);
    var app = $('#app'); if (app) app.setAttribute('data-theme', 'light');
    V.el.classList.add('st-flip', 'st-g');
    s.hideCursor();
    V.ph.textContent = 'reply to ' + V.m.name.toLowerCase() + ', or tap an answer above';
    pin(V, 600);
    setTimeout(function () { V.el.classList.remove('st-flip'); }, 900);
    await s.wait(1100);
    if (g.say) await mgrSay(V, g.say, s);
    if (g.callout) { var c = addRow(V, { k: 'call', c: g.callout }); reveal(V, c); await s.wait(readMs(g.callout[0] + ' ' + g.callout[1])); }
    if (g.code) { var k = addRow(V, { k: 'code', t: g.code }); reveal(V, k); await s.wait(2800); }
    if (g.chips && g.chips.length) {
      V.chips.innerHTML = g.chips.map(function (x) { return '<button class="st-chip">' + esc(x) + '</button>'; }).join('');
      V.chips.classList.add('on'); pin(V, 500);
      await s.wait(2100);
      var c0 = $('.st-chip', V.chips);
      await s.press(c0, 120);
      V.chips.classList.remove('on');
      addRow(V, { k: 'm', who: 'me', t: g.chips[0] }); bottom(V);
      await s.wait(500);
      var li = $$('.st-steps li', V.el), to = g.at == null ? 0 : g.at;
      li.forEach(function (x, i) { x.className = i < to ? 'st-sd' : i === to ? 'st-sa' : 'st-sf'; });
      s.hideCursor();
      await s.wait(1300);
    }
  }

  async function play(el, d, s) {
    var V = el._v; if (!V) return;
    V.feed.scrollTop = V.feed.scrollHeight;
    V.left.scrollTop = 0;
    V.short = !d.step;
    clock(V, s);
    await s.wait(V.short ? 450 : 700);
    if (d.step === 'guided' || d.stuck) { await guided(V, d, s); return; }
    if (d.chat) await chat(V, d.chat, s);
    if (d.block) await block(V, d, s);
    if (d.tick && d.tick.length && !d.done) { await s.wait(250); await tick(V, d.tick, s); }
    if (d.coach) { await s.wait(450); await s.coach(d.coach); await s.wait(d.coach.freeze ? 600 : V.short ? 1300 : d.submit ? 2400 : 3000); }
    if (d.submit) await submit(V, d, s);
    if (d.coachAfter) { await s.wait(700); await s.coach(d.coachAfter); await s.wait(d.coachAfter.freeze ? 500 : 2600); }
  }

  J.screen('stage', {
    theme: function (d) { return d && d.step === 'guided' ? 'light' : 'dark'; },
    /* stage to stage is one continuous screen (a cut, no fade), except coming out of guided mode */
    get keep() {
      var b = J.beats(), p = b[J.P.i - 1];
      return !(p && p.screen === 'stage' && p.d && p.d.step === 'guided');
    },
    draw: draw,
    play: play
  });
})();
