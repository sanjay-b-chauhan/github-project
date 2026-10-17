/* s-kick: the kickoff (refs 03 to 07) and the understanding check (ref 08).
   kickCard: the project kickoff card, Sanjay presses Join now.
   kickVideo: Jay on video, live captions of the kickoff, no audio.
   kickSlides: the brief, slide by slide, with Meeting Notes filling in and ticking green.
   understand: Jay asks three things by voice, Sanjay answers by voice, the mastery bar fills. */
(function () {
  'use strict';
  var J = window.J, D = J.D, esc = J.esc, IC = J.IC, $ = J.$, $$ = J.$$;

  /* a small loop that respects pause and speed (s.wait), and stops when the viewer jumps */
  async function run(s, ms, fn) { var t = 0; fn(0); while (t < ms) { var st = Math.min(50, ms - t); await s.wait(st); t += st; fn(t / ms); } }
  function bg(p) { p.catch(function (e) { if (e !== J.CANCEL) { console.error(e); window.__err = String(e && e.stack || e); } }); return p; }
  function SC(d) { return D.SC[d.sc || 'router'] || D.SC.router; }
  function MGR(sc) { return D.P[sc.mgr] || D.P.jay; }

  var NOTEPAD = '<svg viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12.5" height="14.5" rx="2.6" fill="#FFF7DC" stroke="#3A2F12" stroke-width="1.4"/><path d="M4 6.2h12.5" stroke="#3A2F12" stroke-width="1.4"/><path d="M7 9.6h6.2M7 12.6h4.4" stroke="#E9B949" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var OK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8.2"/><path d="M6.6 10.2 8.9 12.4 13.4 7.8"/></svg>';
  var PLAYF = '<svg viewBox="0 0 12 12"><path d="M3 1.6v8.8L10.2 6z" fill="currentColor"/></svg>';
  var PAUSEF = '<svg viewBox="0 0 12 12"><path d="M2.8 1.8h2.4v8.4H2.8zM6.8 1.8h2.4v8.4H6.8z" fill="currentColor"/></svg>';
  var BRAIN = '<svg viewBox="-1 -1 32 32" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(1 4)"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18"/></g><path d="M25 .2c.45 2.9 1.45 4 4.5 4.8-3.05.8-4.05 1.9-4.5 4.8-.45-2.9-1.45-4-4.5-4.8 3.05-.8 4.05-1.9 4.5-4.8z" fill="currentColor" stroke="#fff" stroke-width="1.6"/></svg>';

  /* ======================= kickCard (ref 03) ======================= */
  J.screen('kickCard', {
    theme: 'dark',
    draw: function (el, d) {
      var sc = SC(d), m = MGR(sc);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-kc">' +
          '<div class="kk-eb">Project kickoff</div>' +
          '<h1 class="kk-h">' + esc(sc.kickTitle || 'Understand the scope and what comes next.') + '</h1>' +
          '<div class="kk-av"><img alt="" src="' + m.photo + '"></div>' +
          '<b class="kk-nm">' + esc(m.name) + '</b><span class="kk-tl">' + esc(m.title) + '</span>' +
          '<span class="kk-tm">' + IC.clock + '~' + (sc.kickMins || 12) + ' min</span>' +
          '<button class="kk-join">Join now</button>' +
        '</div>';
    },
    play: async function (el, d, s) {
      await s.wait(2600);
      await s.press($('.kk-join', el), 260);
      s.hideCursor();
      $('.kk-kc', el).classList.add('kk-gone');
      await s.wait(500);
    }
  });

  /* ======================= kickVideo (ref 04) ======================= */
  var WORD_MS = 230, LINE_HOLD = 1100;
  J.screen('kickVideo', {
    theme: 'dark',
    dock: false,
    draw: function (el, d) {
      var sc = SC(d), m = MGR(sc), lines = sc.kick || [];
      el.innerHTML = '<div class="kk-vid"><img class="kk-vimg" alt="" src="' + (m.wide || m.photo) + '"></div><div class="kk-vshade"></div>' +
        '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<button class="kk-skip">' + IC.next + 'Skip</button>' +
        '<div class="kk-tag">' + J.face(m, 38) + '<div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span></div></div>' +
        '<div class="kk-cap" aria-live="polite"><span></span></div>' +
        '<div class="kk-vc"><span>' + IC.pause + '</span><span class="kk-segs">' + lines.map(function (l) { return '<i style="--g:' + l.split(' ').length + '"><b></b></i>'; }).join('') + '</span><span class="kk-sp">1x</span><span class="kk-cc">CC</span></div>';
    },
    play: async function (el, d, s) {
      var sc = SC(d), lines = sc.kick || [], img = $('.kk-vimg', el), cap = $('.kk-cap span', el), segs = $$('.kk-segs b', el);
      var total = 900, words = lines.map(function (l) { return l.split(' '); });
      words.forEach(function (w) { total += w.length * WORD_MS + LINE_HOLD; });
      // a slow push in on Jay for the whole call
      var push = bg(run(s, total + 200, function (p) { img.style.transform = 'scale(' + (1 + .075 * p).toFixed(4) + ')'; }));
      await s.wait(900);
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        for (var k = 1; k <= w.length; k++) {
          cap.textContent = w.slice(0, k).join(' ');
          segs[i].style.width = (k / w.length * 100) + '%';
          await s.wait(WORD_MS);
        }
        await s.wait(LINE_HOLD);
        if (i < words.length - 1) { cap.textContent = ''; await s.wait(180); }
      }
      await push;
    }
  });

  /* ======================= kickSlides (refs 05, 06, 07) ======================= */
  function notesHTML(sc, opt) {
    opt = opt || {};
    var n = sc.notes || { problem: [], outcome: [] };
    function li(t, done) { return '<li class="kk-li' + (done ? ' kk-done' : '') + '"><i class="kk-bu"></i><span class="kk-ok">' + OK + '</span><span class="kk-t">' + esc(t) + '</span></li>'; }
    var pr = opt.empty ? [] : n.problem, oc = opt.empty ? [] : n.outcome;
    return '<aside class="kk-notes"><div class="kk-nh">' + NOTEPAD + 'Meeting Notes</div><div class="kk-nb">' +
      '<div class="kk-sec" data-k="problem"><h3>Problem</h3><ul class="kk-ul">' + pr.map(function (t) { return li(t, opt.ticked); }).join('') + '</ul></div>' +
      '<div class="kk-sec' + (opt.empty ? ' kk-hid' : '') + '" data-k="outcome"><h3>Outcome</h3><ul class="kk-ul">' + oc.map(function (t) { return li(t, opt.ticked); }).join('') + '</ul></div>' +
      '</div></aside>';
  }
  function slideHTML(x, i) {
    var h = '';
    if (x.kind === 'line') {
      h = '<div class="kk-st">' + esc(x.title) + '</div>' +
        '<div class="kk-chart"><svg viewBox="0 0 690 250" aria-hidden="true">' +
          '<path class="kk-path" d="M0 196 L234 190 L392 136 L690 60" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
          '<circle class="kk-d0" cx="0" cy="196" r="8.5" fill="#fff"/><circle class="kk-d1" cx="690" cy="60" r="8.5" fill="#fff" opacity="0"/>' +
          '<path d="M0 250 H690" stroke="#444" stroke-width="2"/></svg>' +
          '<span class="kk-v kk-l" style="left:1.4%;top:52%">' + esc(x.from) + '</span>' +
          '<span class="kk-v kk-r" style="right:-1%;top:3%">' + esc(x.to) + '</span>' +
          '<div class="kk-xl"><span>' + esc(x.l) + '</span><span>' + esc(x.r) + '</span></div></div>';
    } else if (x.kind === 'big') {
      h = '<div class="kk-pre">' + esc(x.pre) + '</div><div class="kk-num">' + esc(x.num) + '</div>' + (x.post ? '<div class="kk-post">' + esc(x.post) + '</div>' : '');
    } else if (x.kind === 'quote') {
      h = '<div class="kk-q">' + (x.parts || []).map(function (p, k) { return k % 2 ? '<em>' + esc(p) + '</em>' : esc(p); }).join('') + '</div>';
    }
    return '<div class="kk-sl" data-i="' + i + '" data-kind="' + x.kind + '">' + h + '</div>';
  }
  /* how long each slide plays, and which note it writes */
  var SL_MS = [5200, 4000, 4000, 4400];

  J.screen('kickSlides', {
    theme: 'light',
    draw: function (el, d) {
      var sc = SC(d), sl = sc.slides || [], m = MGR(sc);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-grid">' +
          '<section class="kk-deck">' +
            '<div class="kk-brand">' + J.logo(sc.co, 26) + '<b>' + esc(J.coName(sc.co)) + '</b></div>' +
            sl.map(slideHTML).join('') +
            '<div class="kk-bsegs"><span class="kk-segs">' + sl.map(function (x, i) { return '<i style="--g:' + (SL_MS[i] || 4000) + '"><b></b></i>'; }).join('') + '</span></div>' +
            '<div class="kk-bar">' + PLAYF + '<span class="kk-segs">' + sl.map(function (x, i) { return '<i style="--g:' + (SL_MS[i] || 4000) + '"><b></b></i>'; }).join('') + '</span><span>1x</span><span>CC</span></div>' +
            '<div class="kk-cont">' + J.face(m, 48) + '<button class="kk-cbtn">Continue</button></div>' +
          '</section>' +
          notesHTML(sc, { empty: true }) +
        '</div>';
      var first = $('.kk-sl', el); if (first) first.classList.add('on');
    },
    play: async function (el, d, s) {
      var sc = SC(d), sl = $$('.kk-sl', el), segs = $$('.kk-bsegs .kk-segs b', el), n = sc.notes || { problem: [], outcome: [] };
      var pUl = $('[data-k=problem] .kk-ul', el), oSec = $('[data-k=outcome]', el), oUl = $('.kk-ul', oSec);
      function show(i) {
        sl.forEach(function (x, k) { x.classList.toggle('on', k === i); x.classList.toggle('kk-gone', k < i); });
        segs.forEach(function (b, k) { if (k < i) b.style.width = '100%'; });
        return bg(run(s, SL_MS[i] || 4000, function (p) { if (segs[i]) segs[i].style.width = (p * 100) + '%'; }));
      }
      async function note(ul, text) {
        var li = document.createElement('li'); li.className = 'kk-li kk-new';
        li.innerHTML = '<i class="kk-bu"></i><span class="kk-ok">' + OK + '</span><span class="kk-t"></span>';
        ul.appendChild(li);
        await s.type($('.kk-t', li), text, 58);
        return li;
      }
      /* b13: notes, by behaviour. After each point Jay makes there is a line to write it, and Continue.
         Skip it and press Continue: Zero writes the note for you (twice). The third time, Navid comes in: hold on,
         write this one yourself. Best writes his own; mid skips the first and then writes; worst skips until Navid steps in. */
      var skipped = 0, mode = d.notesMode || 'self';
      function skips(i) { return mode === 'auto2' || (mode === 'auto1' && i === 0); }
      async function skip(ul, i) {
        var li = document.createElement('li'); li.className = 'kk-li kk-wr kk-new';
        li.innerHTML = '<i class="kk-bu"></i><span class="kk-ok">' + OK + '</span><span class="kk-t"><em class="kk-ph">Write what Jay just said</em></span><button class="kk-cont">Continue</button>';
        ul.appendChild(li);
        await s.wait(1100);
        skipped++;
        var cont = $('.kk-cont', li), t = $('.kk-t', li);
        await s.press(cont, 160);
        if (mode === 'auto2' && skipped === 3) {
          /* the third time, he does not let it go */
          await s.navid({ kind: 'side', id: 'notes_hold', click: true, auto: true, steps: [
            { say: 'notes_hold' }, { opts: [{ t: 'I\u2019ll write it', pri: true }], pick: 0 },
            { fn: async function () { cont.remove(); li.classList.remove('kk-wr'); t.textContent = ''; await s.type(t, n.problem[i], 50); } },
            { say: 'notes3_ok' }, { opts: [{ t: 'Got it', pri: true }], pick: 0 }] });
          return;
        }
        /* Zero writes it for him, and says so */
        cont.remove(); li.classList.remove('kk-wr'); li.classList.add('kk-auto');
        t.textContent = '';
        await s.type(t, n.problem[i], 95);
        li.insertAdjacentHTML('beforeend', '<em class="kk-by">Written by Zero</em>');
        if (mode === 'auto2' && skipped === 2 && window.NV) NV.pulse('notes_hold');   // he has noticed
        await s.wait(500);
      }
      async function tick(ul) { var lis = $$('.kk-li', ul); for (var i = 0; i < lis.length; i++) { lis[i].classList.add('kk-done'); await s.wait(320); } }

      // slide 1: the line chart draws, the first note
      var t1 = show(0), path = $('.kk-path', sl[0]), d1 = $('.kk-d1', sl[0]), lv = $('.kk-v.kk-l', sl[0]), rv = $('.kk-v.kk-r', sl[0]);
      if (lv) lv.classList.add('on');
      await s.wait(500);
      if (path) await run(s, 1500, function (p) { path.setAttribute('stroke-dashoffset', (1 - (1 - Math.pow(1 - p, 3))).toFixed(3)); });
      if (d1) d1.setAttribute('opacity', '1');
      if (rv) rv.classList.add('on');
      await s.wait(500);
      if (n.problem[0]) { if (skips(0)) await skip(pUl, 0); else if (!d.lateNotes && !d.noNotes) await note(pUl, n.problem[0]); }
      await t1;
      // slides 2 and 3: the numbers
      for (var i = 1; i <= 2; i++) {
        var t = show(i);
        await s.wait(1100);
        /* worst case: no notes until the coach says so */
        if (d.lateNotes && i === 1) { await s.coach(d.lateNotes); await s.wait(1600); if (n.problem[0]) await note(pUl, n.problem[0]); }
        if (n.problem[i]) { if (skips(i)) await skip(pUl, i); else if (!d.noNotes) await note(pUl, n.problem[i]); }
        await t;
      }
      await tick(pUl);
      // slide 4: the quote, then the outcome
      var t4 = show(3);
      await s.wait(1300);
      if (!d.noNotes) { oSec.classList.remove('kk-hid'); oSec.classList.add('kk-show'); }
      await s.wait(350);
      for (var k = 0; k < n.outcome.length && !d.noNotes; k++) await note(oUl, n.outcome[k]);
      await t4;
      await tick(oUl);
      // the end: the player bar and Continue
      $('.kk-deck', el).classList.add('kk-end');
      await s.wait(1100);
      await s.press($('.kk-cbtn', el), 300);
      s.hideCursor();
    }
  });

  /* ======================= understand (ref 08) ======================= */
  function bars(seed, n) {
    var h = '', x = seed * 9301 + 49297;
    for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var v = 10 + Math.round((x / 233280) * 16); if (i % 6 === 3) v = 9; h += '<i style="height:' + v + 'px"></i>'; }
    return h;
  }
  function secs(n) { return '00:' + ('0' + n).slice(-2); }
  function vn(who, text, dur, seed, opt) {
    opt = opt || {};
    var jay = who === 'jay', m = opt.m;
    return '<div class="kk-vn ' + (jay ? 'kk-jay' : 'kk-me') + (opt.open ? ' kk-open' : '') + '">' +
      (jay ? '<img class="kk-vav" alt="" src="' + m.photo + '">' : '') +
      '<div class="kk-vb"><span class="kk-pl">' + PLAYF + '</span><span class="kk-wv">' + bars(seed, 18) + '</span><span class="kk-du">' + secs(dur) + '</span>' + (opt.rx ? '<span class="kk-rx">' + opt.rx + '</span>' : '') + '</div>' +
      '<button class="kk-tr">Transcript' + IC.chev + '</button><p class="kk-tx">' + esc(text) + '</p></div>';
  }
  var RX = ['👍', '🔥', '👏'];
  function plan(d) {
    var score = d.score == null ? 2 : d.score, good = score >= 4 ? [0, 1, 2] : score >= 2 ? [0] : [];
    var w = [0, 1, 2].map(function (i) { return good.indexOf(i) >= 0 ? 2 : 1; }), sum = w[0] + w[1] + w[2], c = 0;
    return { good: good, fill: w.map(function (x) { c += x; return score / 4 * c / sum * 100; }) };
  }
  function qdur(t) { return Math.max(3, Math.min(9, Math.round(t.length / 11))); }
  function adur(t) { return Math.max(2, Math.min(14, Math.round(t.length / 14))); }

  J.screen('understand', {
    theme: 'light',
    draw: function (el, d) {
      var sc = SC(d);
      el.innerHTML = '<button class="kk-back" aria-label="Back">' + IC.left + '</button>' +
        '<div class="kk-mast" aria-label="Understanding"><span class="kk-mtr"><i></i></span><span class="kk-brain">' + BRAIN + '</span></div>' +
        '<div class="kk-ug">' +
          '<div class="kk-col"><div class="kk-chat"><div class="kk-th"></div></div>' +
            '<div class="kk-micw"><button class="kk-mic" aria-label="Hold to talk">' + IC.mic + '</button><span class="kk-mh">Hold ‘space’ to talk</span></div></div>' +
          notesHTML(sc) +
        '</div>';
    },
    play: async function (el, d, s) {
      var sc = SC(d), m = MGR(sc), qs = sc.pop || [], ans = d.answers || [], pl = plan(d);
      var chat = $('.kk-chat', el), th = $('.kk-th', el), mic = $('.kk-mic', el), mh = $('.kk-mh', el), fill = $('.kk-mtr i', el);
      function add(html) { th.insertAdjacentHTML('beforeend', html); var x = th.lastElementChild; s.scroll(chat); return x; }
      await s.wait(600);
      for (var i = 0; i < qs.length; i++) {
        // Jay's voice note arrives and plays, its transcript opens word by word
        var q = qs[i], qd = qdur(q), jv = add(vn('jay', '', qd, i + 3, { m: m }));
        await s.wait(550);
        var jp = $('.kk-pl', jv), jb = $$('.kk-wv i', jv), jt = $('.kk-tx', jv), jw = q.split(' '), du = $('.kk-du', jv);
        jp.innerHTML = PAUSEF; jp.classList.add('kk-pz'); jv.classList.add('kk-open');
        s.scroll(chat);
        await run(s, Math.max(2000, jw.length * 235), function (p) {
          var on = Math.round(p * jb.length); jb.forEach(function (b, k) { b.classList.toggle('on', k < on); });
          jt.textContent = jw.slice(0, Math.max(1, Math.ceil(p * jw.length))).join(' ');
          du.textContent = secs(Math.round(p * qd));
          chat.scrollTop = chat.scrollHeight;
        });
        jp.innerHTML = PLAYF; jp.classList.remove('kk-pz'); jb.forEach(function (b) { b.classList.remove('on'); });
        s.scroll(chat);
        await s.wait(550);
        // Sanjay holds the mic and answers; his words are transcribed as he talks
        var a = ans[i] || '', ad = adur(a);
        await s.press(mic, 0);
        mic.classList.add('kk-rec'); mh.textContent = 'Release to send';
        var me = add(vn('me', '', 0, i + 11, {}));
        me.classList.add('kk-open');
        var mp = $('.kk-pl', me), mb = $$('.kk-wv i', me), mt = $('.kk-tx', me), md = $('.kk-du', me);
        mp.innerHTML = ''; mp.classList.add('kk-live');
        mb.forEach(function (b) { b.classList.add('kk-hid'); });
        var grow = bg(run(s, Math.max(1200, a.length * 1000 / 50), function (p) {
          var on = Math.round(p * mb.length); mb.forEach(function (b, k) { b.classList.toggle('kk-hid', k >= on); });
          md.textContent = secs(Math.round(p * ad));
          chat.scrollTop = chat.scrollHeight;
        }));
        s.scroll(chat);
        await s.type(mt, a, 46);
        await grow;
        // he lets go: it sends
        mic.classList.remove('kk-rec'); mh.textContent = 'Hold ‘space’ to talk';
        mp.classList.remove('kk-live'); mp.innerHTML = PLAYF; md.textContent = secs(ad);
        s.hideCursor();
        s.scroll(chat);
        await s.wait(500);
        // Jay reacts to a good answer, and the mastery bar fills
        if (pl.good.indexOf(i) >= 0) { $('.kk-vb', me).insertAdjacentHTML('beforeend', '<span class="kk-rx">' + RX[pl.good.indexOf(i) % RX.length] + '</span>'); }
        fill.style.width = pl.fill[i].toFixed(1) + '%';
        await s.wait(1150);
      }
      await s.wait(300);
    }
  });
})();
