/* System 3, Jobs. Get matched, apply, hear back. One morning and afternoon of Maya's day, told from the Jobs side:
   the new roles box, one click apply (Zero tailors her portfolio and resume and sends it on the company's own job page),
   the tracker (Applied, Connected, Lost), and Explore, where the level she earns opens roles. No chat, no recruiter side. */
(function () {
  'use strict';
  var Z = window.ZS, IC = Z.IC, esc = Z.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }

  /* ================= data ================= */
  /* core roles plus the ones the agents found overnight (all open at Level 2 or below) and a few above her level for Explore */
  function R(id, title, co, dom, lvl, fit, pay, mode) { return { id: id, title: title, co: co, dom: dom, lvl: lvl, fit: fit || '', pay: pay || '', mode: mode || 'Remote' }; }
  var EXTRA = [
    R('apollo-oa', 'Outbound Automation Analyst', 'Apollo', 'apollo.io', 2, 'fire', '$84k to $102k'),
    R('clay-gtm', 'Associate GTM Engineer', 'Clay', 'clay.com', 2, 'fire', '$88k to $108k'),
    R('pipedrive-ss', 'Sales Systems Specialist', 'Pipedrive', 'pipedrive.com', 2, 'fire', '$78k to $95k'),
    R('zoominfo-do', 'Data Operations Analyst', 'ZoomInfo', 'zoominfo.com', 2, 'fire', '$80k to $98k', 'Hybrid'),
    R('outreach-ss', 'Sales Systems Administrator', 'Outreach', 'outreach.io', 2, 'up', '$80k to $96k'),
    R('docusign-ss', 'Sales Systems Analyst', 'Docusign', 'docusign.com', 2, 'up', '$84k to $100k', 'Hybrid'),
    R('amplitude-ga', 'GTM Data Analyst', 'Amplitude', 'amplitude.com', 2, 'up', '$85k to $104k', 'San Francisco'),
    R('mixpanel-mo', 'Marketing Operations Analyst', 'Mixpanel', 'mixpanel.com', 2, 'up', '$82k to $98k', 'San Francisco'),
    R('front-ro', 'RevOps Analyst', 'Front', 'front.com', 2, 'up', '$80k to $98k'),
    R('pendo-ga', 'GTM Analyst', 'Pendo', 'pendo.io', 2, 'up', '$78k to $94k', 'Hybrid'),
    R('klaviyo-mo', 'Marketing Automation Specialist', 'Klaviyo', 'klaviyo.com', 1, 'up', '$70k to $86k', 'Boston'),
    R('typeform-ro', 'Revenue Operations Associate', 'Typeform', 'typeform.com', 1, 'up', '$68k to $84k'),
    R('gusto-ba', 'Business Systems Analyst', 'Gusto', 'gusto.com', 2, '', '$80k to $96k', 'Denver'),
    R('dropbox-ca', 'CRM Administrator', 'Dropbox', 'dropbox.com', 1, '', '$66k to $80k'),
    R('squarespace-ro', 'Revenue Operations Coordinator', 'Squarespace', 'squarespace.com', 1, '', '$64k to $78k', 'New York'),
    R('zoom-so', 'Sales Operations Coordinator', 'Zoom', 'zoom.us', 1, '', '$60k to $74k'),
    R('monday-sd', 'Sales Development Analyst', 'monday.com', 'monday.com', 1, '', '$60k to $72k', 'New York'),
    R('mailchimp-mo', 'Email Operations Specialist', 'Mailchimp', 'mailchimp.com', 1, '', '$62k to $76k', 'Atlanta'),
    R('hootsuite-mo', 'Marketing Operations Coordinator', 'Hootsuite', 'hootsuite.com', 1, '', '$58k to $72k'),
    /* stands in for core's calendly-ss "applied 2 days ago": here Calendly is one of today's new roles */
    R('asana-so', 'Sales Operations Analyst', 'Asana', 'asana.com', 2, 'up', '$84k to $102k'),
    /* Explore: what the levels above hers open */
    R('airtable-gtm', 'GTM Systems Engineer', 'Airtable', 'airtable.com', 3, 'fire', '$92k to $115k'),
    R('gong-ro', 'Revenue Operations Engineer', 'Gong', 'gong.io', 3, 'up', '$95k to $118k'),
    R('rippling-ga', 'GTM Automation Analyst', 'Rippling', 'rippling.com', 3, 'up', '$90k to $112k', 'San Francisco'),
    R('hubspot-gtm', 'GTM Engineer', 'HubSpot', 'hubspot.com', 5, 'fire', '$105k to $132k'),
    R('clari-rs', 'Revenue Systems Engineer', 'Clari', 'clari.com', 5, 'up', '$108k to $134k', 'Hybrid'),
    R('figma-go', 'Growth Operations Engineer', 'Figma', 'figma.com', 7, 'fire', '$125k to $155k', 'San Francisco'),
    R('anthropic-gtm', 'GTM Engineer', 'Anthropic', 'anthropic.com', 9, 'fire', '$160k to $210k', 'San Francisco')
  ];
  var ROLES = Z.ROLES.concat(EXTRA);
  function role(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return null; }

  /* the 20 found overnight: strong fits first, then good, then plain. Never above her level. */
  var NEW20 = ['calendly-ss', 'apollo-oa', 'clay-gtm', 'pipedrive-ss', 'zoominfo-do',
    'outreach-ss', 'docusign-ss', 'amplitude-ga', 'mixpanel-mo', 'front-ro', 'pendo-ga', 'klaviyo-mo', 'typeform-ro',
    'gusto-ba', 'dropbox-ca', 'squarespace-ro', 'zoom-so', 'monday-sd', 'mailchimp-mo', 'hootsuite-mo'];
  /* the three she applies to, and which of her projects Zero puts first for each */
  var PICKS = ['calendly-ss', 'apollo-oa', 'clay-gtm'];
  var PROJ = Z.DAY.road.filter(function (r) { return r.done; }); /* Inbound lead router, Enrichment waterfall, Outbound agent with evals */
  var LEAD = { 'calendly-ss': 1, 'apollo-oa': 2, 'clay-gtm': 1 };

  /* her applications this morning (core APPS, with the Calendly entry swapped, see above) */
  var APPS0 = Z.APPS.map(function (a) { return a.id === 'calendly-ss' ? { id: 'asana-so', state: 'applied', when: a.when } : clone(a); });
  function appsAt(stage) {
    /* 0 this morning, 1 after the three new ones, 2 after Calendly replies */
    var a = APPS0.map(clone);
    if (stage >= 1) a = PICKS.map(function (id) { return { id: id, state: 'applied', when: 'Today' }; }).concat(a);
    if (stage >= 2) { a[0].state = 'connected'; a[0].note = 'Replied by email'; }
    return a;
  }
  function byState(apps, st) {
    var l = apps.filter(function (a) { return a.state === st; });
    return st === 'lost' ? l.reverse() : l;
  }

  /* Explore: her field, by the level that opens it. Roles already in her tracker live there, not here. */
  var GROUPS = [
    [1, ['klaviyo-mo', 'typeform-ro']],
    [2, ['pipedrive-ss', 'zoominfo-do', 'outreach-ss']],
    [3, ['airtable-gtm', 'gong-ro', 'rippling-ga']],
    [4, ['ramp-gtm', 'webflow-rev', 'brex-out']],
    [5, ['hubspot-gtm', 'clari-rs']],
    [6, ['vercel-gtm', 'retool-ae']],
    [7, ['figma-go', 'attio-se']],
    [8, ['linear-ge']],
    [9, ['anthropic-gtm']],
    [10, ['openai-gtm', 'apple-so']]
  ];
  function opensAt(n) { return Z.LEVELS[n].open - Z.LEVELS[n - 1].open; }

  /* the pills by time of day (ZS.DAY): 360 at 8:45, 260 after the 9:00 start, 310 after the 10:30 stage, 360 after 1:10, 710 at 3:41 */
  var PILL = { morning: [2500, 360], noon: [2500, 310], afternoon: [2500, 360], after: [4500, 710] };

  /* ================= state + small helpers ================= */
  var body = null, S = null;
  function fresh(o) {
    S = { page: 'home', picks: {}, hearts: { 'vercel-gtm': true }, apps: appsAt(0), dot: false, open: 2, fast: S && S.fast };
    for (var k in o) S[k] = o[k];
  }
  function pills(p) { Z.pill.set(p[0]); Z.pill.credits(p[1]); }
  function clearWire() { $$('.zs-wire .wchip').forEach(function (c) { c.remove(); }); }
  function nPicked() { return Object.keys(S.picks).filter(function (k) { return S.picks[k]; }).length; }
  function tweenScroll(el, to, ms) {
    return new Promise(function (res) {
      var from = el.scrollTop, t0 = performance.now(), d = (ms || 1200) / Z.story.speed;
      (function f(t) {
        var k = Math.min(1, (t - t0) / d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        el.scrollTop = from + (to - from) * e;
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  /* open a space for a card that is about to land, or close the space a card leaves */
  function openSpace(el) {
    var h = el.offsetHeight;
    el.style.overflow = 'hidden'; el.style.height = '0px'; el.style.paddingTop = '0px'; el.style.paddingBottom = '0px'; el.style.marginBottom = '-6px';
    void el.offsetWidth;
    el.style.height = h + 'px'; el.style.paddingTop = ''; el.style.paddingBottom = ''; el.style.marginBottom = '';
    setTimeout(function () { el.style.height = ''; el.style.overflow = ''; }, 520);
  }
  function closeSpace(el) {
    el.style.overflow = 'hidden'; el.style.height = el.offsetHeight + 'px';
    void el.offsetWidth;
    el.classList.add('gone'); el.style.height = '0px'; el.style.paddingTop = '0px'; el.style.paddingBottom = '0px'; el.style.marginBottom = '-6px';
    setTimeout(function () { if (el.parentNode) el.remove(); }, 520);
  }

  /* ================= the frame: sub navigation, the one serif line, the page ================= */
  var PAGES = [['home', 'Home'], ['explore', 'Explore'], ['tracker', 'Tracker']];
  function seg(page) {
    return '<nav class="j-seg" aria-label="Jobs">' + PAGES.map(function (p) {
      var d = p[0] === 'home' && S.dot, c = (page === p[0] ? 'on' : '') + (d ? ' has' : '');
      return '<button data-p="' + p[0] + '"' + (c ? ' class="' + c.trim() + '"' : '') + (page === p[0] ? ' aria-current="page"' : '') + '>' + p[1] + (d ? '<i class="j-dot"></i>' : '') + '</button>';
    }).join('') + '</nav>';
  }
  function frame(page, title, acts, main, o) {
    o = o || {}; S.page = page;
    body.innerHTML = '<div class="j-root"><div class="j-col"><header class="j-head">' + seg(page) +
      '<div class="j-tr"><h1 class="h' + (o.fade ? ' j-fade' : '') + '">' + esc(title) + '</h1><div class="j-acts">' + (acts || '') + '</div></div></header>' +
      '<div class="j-main' + (o.fade ? ' j-fade' : '') + '">' + main + '</div></div></div>';
  }
  function heart(id) {
    var h = !!S.hearts[id];
    return '<button class="j-ht' + (h ? ' on' : '') + '" aria-pressed="' + h + '" aria-label="' + (h ? 'Liked' : 'Like') + '">' + (h ? IC.heartf : IC.heart) + '</button>';
  }
  function fit(r) { return '<span class="j-fit">' + (r.fit ? IC[r.fit] : '') + '</span>'; }

  /* ================= Home ================= */
  function counts(apps) { return { applied: byState(apps, 'applied').length, connected: byState(apps, 'connected').length, lost: byState(apps, 'lost').length }; }
  function homeMain(o) {
    var c = counts(S.apps), logos = ['calendly.com', 'apollo.io', 'clay.com', 'pipedrive.com', 'zoominfo.com', 'outreach.io'];
    function ai(dom, t, line, b) { return '<li class="j-ai"><div class="row">' + Z.logo(dom, 36) + '<div class="grow"><span class="i">' + esc(t) + '</span><span class="m">' + esc(line) + '</span></div></div><button class="btn-l sm">' + esc(b) + '</button></li>'; }
    function cnt(t, v) { return '<button class="j-cnt" data-go="tracker">' + t + ' <b>' + v + '</b></button>'; }
    return '<div class="j-homew"><div class="j-home">' +
      '<section class="j-box' + (o.rise ? ' rise' : '') + '" aria-label="20 new roles">' +
      '<div class="j-box-peek' + (o.hid ? ' hid' : '') + '">' + Z.zero(64) + '</div>' +
      '<div class="j-box-lid">' + Z.wordmark('j-box-mark') + '</div>' +
      '<div class="j-box-body"><div class="j-box-win">' + Z.stack(logos, 40) + '</div>' +
      '<div class="j-box-n"><span class="big">20</span><span class="i">new roles</span></div>' +
      '<p class="m j-box-sub">Found overnight</p>' +
      '<button class="btn j-open">Open</button></div></section>' +
      '<section class="card j-acard' + (o.rise ? ' rise d2' : '') + '"><div class="j-ah"><span class="i">Action items</span><span class="j-n">2</span></div><ul class="j-alist">' +
      ai('gong.io', 'Gong replied', 'Noa wants to talk', 'Open email') +
      ai('airtable.com', 'Airtable asked for a call', 'Revenue Operations Analyst', 'Pick a time') +
      '</ul></section></div>' +
      '<div class="j-counts' + (o.rise ? ' rise d3' : '') + '">' + cnt('Applied', c.applied) + cnt('Connected', c.connected) + cnt('Lost', c.lost) + '</div></div>';
  }
  function drawHome(o) { frame('home', 'Today', '', homeMain(o || {})); }

  /* ================= 20 new roles ================= */
  function nrRow(r, i, anim) {
    var on = !!S.picks[r.id], a = anim && i < 11;
    return '<div class="j-nr' + (on ? ' on' : '') + (a ? ' rise' : '') + '" data-id="' + r.id + '"' + (a ? ' style="animation-delay:' + (i * 35) + 'ms"' : '') + '>' +
      '<button class="j-ck' + (on ? ' on' : '') + '" role="checkbox" aria-checked="' + on + '" aria-label="Select ' + esc(r.co + ', ' + r.title) + '">' + IC.check + '</button>' +
      Z.logo(r.dom, 36) +
      '<div class="j-who"><span class="j-tt">' + esc(r.title) + '</span><span class="j-co">' + esc(r.co) + '</span></div>' +
      '<span class="j-tag">Level ' + r.lvl + '</span><span class="j-pay">' + esc(r.pay) + '</span><span class="j-mode">' + esc(r.mode) + '</span>' +
      fit(r) + heart(r.id) + '</div>';
  }
  function listActs() {
    var n = nPicked();
    return '<button class="btn-l sm j-sall">Select all ' + IC.fire + '</button><button class="btn sm j-apply"' + (n ? '' : ' disabled') + '>' + (n ? 'Apply to ' + n : 'Apply') + '</button>';
  }
  function drawList(o) {
    o = o || {};
    frame('home', '20 new roles', listActs(),
      '<div class="card j-lc"><div class="j-ls">' + NEW20.map(function (id, i) { return nrRow(role(id), i, o.anim); }).join('') + '</div></div>' + (o.sheet ? sheetHTML() : ''), { fade: o.anim });
  }
  function rowOf(id) { return $('.j-nr[data-id="' + id + '"]', body); }
  function setPick(id, on) {
    S.picks[id] = on; var r = rowOf(id); if (!r) return;
    r.classList.toggle('on', on); var c = $('.j-ck', r); c.classList.toggle('on', on); c.setAttribute('aria-checked', on);
    var a = $('.j-apply', body), n = nPicked(); if (a) { a.disabled = !n; a.textContent = n ? 'Apply to ' + n : 'Apply'; }
  }
  function setHeart(btn, id, on, flourish) {
    S.hearts[id] = on; if (!btn) return;
    btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? 'Liked' : 'Like');
    btn.innerHTML = on ? IC.heartf : IC.heart;
    btn.classList.remove('beat'); void btn.offsetWidth; if (on) btn.classList.add('beat');
    if (on && flourish) { var m = Z.el('<span class="j-more" aria-hidden="true">More like this</span>'); btn.appendChild(m); setTimeout(function () { m.remove(); }, 2500); }
  }

  /* the side sheet: Zero tailors each one and sends it on the company's own job page */
  function sheetHTML() {
    function tiles() {
      return '<span class="j-ixs" aria-hidden="true"><i>1</i><i>2</i><i>3</i></span>' + PROJ.map(function (p, i) {
        return '<div class="j-tile" data-i="' + i + '" style="--y:' + (i * 31) + 'px">' + Z.logo(p.dom, 18) + '<span>' + esc(p.title) + '</span></div>';
      }).join('');
    }
    function step(t, cls) { return '<li class="j-step" data-s="wait"><span class="j-sd"><i class="j-ring"></i></span><div class="grow"><span class="' + (cls || '') + '">' + esc(t) + '</span></div></li>'; }
    return '<aside class="j-sheet" aria-label="Applying to 3"><header class="j-sh"><span class="j-shz">' + Z.zero(40, 'working') + '</span><p class="i j-sht">Applying to 3</p></header><ol class="j-sl">' +
      PICKS.map(function (id) {
        var r = role(id), lead = PROJ[LEAD[id]];
        return '<li class="j-sr" data-id="' + id + '" data-st="wait"><div class="row j-srh">' + Z.logo(r.dom, 36) + '<div class="grow"><span class="j-tt">' + esc(r.title) + '</span><span class="j-co j-srm">' + esc(r.co) + '</span></div><span class="j-srs"><i class="j-ring"></i></span></div>' +
          '<div class="j-srb"><div><ul class="j-steps">' +
          '<li class="j-step" data-s="wait"><span class="j-sd"><i class="j-ring"></i></span><div class="grow"><span>Portfolio: ' + esc(lead.title) + ' moves to the top</span><div class="j-tiles">' + tiles() + '</div></div></li>' +
          step('Resume matched to the role') + step('Sending on ' + r.dom + '/careers', 'j-s3') +
          '</ul></div></div></li>';
      }).join('') + '</ol><footer class="j-sf"><button class="btn j-donebtn">Done</button></footer></aside>';
  }
  function mark(node, st) {
    if (!node) return;
    node.innerHTML = st === 'work' ? '<i class="j-spin"></i>' : st === 'done' ? '<span class="j-ok in">' + IC.check + '</span>' : '<i class="j-ring"></i>';
  }
  function setStep(li, st) { li.setAttribute('data-s', st); mark($('.j-sd', li), st); }
  async function tailor(s, li, id) {
    var r = role(id), steps = $$('.j-step', li), lead = LEAD[id];
    li.setAttribute('data-st', 'work'); mark($('.j-srs', li), 'work');
    setStep(steps[0], 'work'); await s.wait(750);
    var order = [lead].concat([0, 1, 2].filter(function (x) { return x !== lead; }));
    $$('.j-tile', li).forEach(function (t) { var i = +t.getAttribute('data-i'); t.style.setProperty('--y', order.indexOf(i) * 31 + 'px'); t.classList.toggle('lead', i === lead); });
    await s.wait(900);
    setStep(steps[0], 'done'); setStep(steps[1], 'work'); await s.wait(700);
    setStep(steps[1], 'done'); setStep(steps[2], 'work'); await s.wait(700);
    $('.j-s3', steps[2]).textContent = 'Sent on ' + r.dom + '/careers'; setStep(steps[2], 'done'); await s.wait(450);
    li.setAttribute('data-st', 'done'); $('.j-srm', li).textContent = 'Sent on ' + r.dom + '/careers'; mark($('.j-srs', li), 'done');
    await s.wait(420);
  }

  /* ================= Tracker ================= */
  function tk(a, extra) {
    var r = role(a.id), h = '<div class="j-tk ' + a.state + (extra ? ' ' + extra : '') + '" data-id="' + a.id + '"><div class="row">' + Z.logo(r.dom, 32) +
      '<div class="grow j-who"><span class="j-tt">' + esc(r.title) + '</span><span class="j-sub"><span class="j-co">' + esc(r.co) + '</span><span class="j-wh">' + esc(a.when) + '</span></span></div></div>';
    if (a.state === 'connected') h += '<p class="j-nt">' + esc(a.note) + '</p><button class="btn-l sm">Open email</button>';
    if (a.state === 'lost') h += '<p class="j-nt">' + esc(a.note) + '</p>';
    return h + '</div>';
  }
  function col(st, label) {
    var l = byState(S.apps, st);
    return '<section class="j-tc" data-s="' + st + '"><header class="j-tch"><span class="i">' + label + '</span><span class="j-tn">' + l.length + '</span></header><div class="j-tl">' + l.map(function (a) { return tk(a); }).join('') + '</div></section>';
  }
  function drawTracker(o) {
    o = o || {};
    frame('tracker', 'Tracker', '', '<div class="j-trk">' + col('applied', 'Applied') + col('connected', 'Connected') + col('lost', 'Lost') + '</div>' + (o.anchor ? '<div class="j-anchor"></div>' : ''));
  }
  function colEl(st) { return $('.j-tc[data-s="' + st + '"]', body); }
  function setCount(st, v) { var n = $('.j-tn', colEl(st)); if (n) n.textContent = v; }

  /* ================= Explore ================= */
  function erRow(r) {
    var lk = r.lvl > S.open;
    return '<div class="j-er' + (lk ? ' lk' : '') + '" data-id="' + r.id + '">' + Z.logo(r.dom, 36) +
      '<div class="j-who"><span class="j-tt">' + esc(r.title) + '</span><span class="j-co">' + esc(r.co + ' · ' + r.mode) + '</span></div>' +
      '<span class="j-pay">' + esc(r.pay) + '</span>' + fit(r) + heart(r.id) +
      '<div class="j-ac"><span class="j-lk">' + IC.lock + '<span>Opens at Level ' + r.lvl + '</span></span><button class="btn-l sm j-eapply"' + (lk ? ' tabindex="-1"' : '') + '>Apply</button></div></div>';
  }
  function exploreMain() {
    return '<div class="j-ex"><div class="j-focus"><span class="m">Your focus</span>' + Z.MAYA.focus.map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') +
      '<button class="j-txt">Edit</button></div><div class="card j-ec"><div class="j-es">' +
      GROUPS.map(function (g) {
        return '<section class="j-grp" data-l="' + g[0] + '"><header class="j-gh"><span class="i">Level ' + g[0] + '</span><span class="m4">' + opensAt(g[0]) + ' roles</span></header><div class="j-gl">' +
          g[1].map(function (id) { return erRow(role(id)); }).join('') + '</div></section>';
      }).join('') + '</div></div></div>';
  }
  function mboxHTML() { return '<div class="j-mbox"><span class="j-mb" aria-hidden="true"><i class="l1"></i><i class="l2"></i></span><span class="i">35 roles opened</span><button class="btn sm">Open</button></div>'; }
  function drawExplore(o) {
    o = o || {};
    frame('explore', 'Explore', o.box ? mboxHTML() : '', exploreMain());
    if (o.at) { var es = $('.j-es', body); if (es) es.scrollTop = o.at === 'end' ? endTop() : grpTop(o.at); }
  }
  function grpTop(l) { var g = $('.j-grp[data-l="' + l + '"]', body); return g ? g.offsetTop : 0; }
  /* Level 3 and Level 4 both in view if they fit, else Level 4 whole at the bottom */
  var PITCH = 62; /* a row and its gap */
  function endTop() {
    var es = $('.j-es', body), g3 = $('.j-grp[data-l="3"]', body), g4 = $('.j-grp[data-l="4"]', body);
    var need = g4.offsetTop + g4.offsetHeight - es.clientHeight, t = g3.offsetTop;
    /* scroll whole rows only, so nothing sits half hidden under the sticky level header */
    if (need > t) { var k = Math.ceil((need - t) / PITCH); t = k >= $$('.j-er', g3).length ? g4.offsetTop : t + k * PITCH; }
    return Math.max(0, Math.min(es.scrollHeight - es.clientHeight, t));
  }
  async function unlock(s, lvl) {
    var rows = $$('.j-grp[data-l="' + lvl + '"] .j-er', body);
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.add('turn'); await s.wait(320);
      rows[i].classList.remove('lk'); var b = $('.j-eapply', rows[i]); if (b) b.removeAttribute('tabindex');
      await s.wait(180);
    }
  }
  function nextHTML() {
    var r = role('vercel-gtm');
    return '<div class="j-dim"></div><div class="j-nextw"><div class="j-next" data-id="vercel-gtm" role="dialog" aria-label="' + esc(r.title + ', ' + r.co) + '">' +
      '<div class="row">' + Z.logo(r.dom, 48) + '<div class="grow"><span class="i">' + esc(r.title) + '</span><span class="m">' + esc(r.co) + '</span></div>' + fit(r) + heart(r.id) + '</div>' +
      '<div class="j-nx-pay"><span>' + esc(r.pay) + '</span><i></i><span>' + esc(r.mode) + '</span></div>' +
      '<div class="j-nx-lock">' + IC.lock + '<span>Opens at Level ' + r.lvl + '</span></div>' +
      '<div class="j-prog" role="progressbar" aria-valuemin="0" aria-valuemax="6000" aria-valuenow="4500"><i></i></div>' +
      '<div class="j-nx-meta"><span class="grow">4,500 of 6,000 skill points</span><span class="m">About 1 scenario</span></div>' +
      '<a class="btn wide" href="' + Z.SYS[0].href + '">Go to Learn' + IC.arrow + '</a></div></div>';
  }

  /* ================= the visitor's own clicks (the story never needs them) ================= */
  var PAGE_BEAT = { home: 0, tracker: 4, explore: 6 };
  function bind() {
    body.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !body.contains(t)) return;
      var row = t.closest('[data-id]'), id = row && row.getAttribute('data-id');
      if (t.matches('.j-seg button') || t.matches('.j-cnt')) {
        var p = t.getAttribute('data-p') || t.getAttribute('data-go');
        if (p && p !== S.page) { Z.setPaused(false); Z.go(PAGE_BEAT[p]); }
        return;
      }
      if (t.matches('.j-ck')) { setPick(id, !S.picks[id]); return; }
      if (t.matches('.j-ht')) { setHeart(t, id, !S.hearts[id], !S.hearts[id] && t.closest('.j-nr')); return; }
      if (t.matches('.j-sall')) {
        var fire = NEW20.filter(function (x) { return role(x).fit === 'fire'; }), all = fire.every(function (x) { return S.picks[x]; });
        fire.forEach(function (x) { setPick(x, !all); });
        return;
      }
      if (t.matches('.j-eapply')) { t.outerHTML = '<span class="j-done">' + IC.check + 'Applied</span>'; return; }
      if (t.matches('.j-open') && Z.story.i === 0) { S.fast = true; Z.setPaused(false); Z.go(1); }
    });
  }

  /* ================= the story ================= */
  function begin(o, p) { var f = S && S.fast; fresh(o); S.fast = f; clearWire(); pills(p || PILL.morning); }
  function done(i) { window.__jbeat = i; }
  var BEATS = [
    { /* 1. Home */
      at: '8:45 AM',
      enter: function () { begin({}); drawHome({ rise: true, hid: true }); },
      play: async function (s) {
        await s.wait(900);
        var p = $('.j-box-peek', body); if (p) p.classList.remove('hid');
        await s.wait(900); done(0);
      },
      hold: 2200
    },
    { /* 2. the box opens */
      at: '8:46 AM',
      enter: function () { begin({}); drawHome({}); },
      play: async function (s) {
        var box = $('.j-box', body), fast = S.fast; S.fast = false;
        await s.press($('.j-open', body), fast ? 0 : 1100);
        box.classList.add('open');
        await s.wait(950);
        $('.j-tr .h', body).classList.add('j-out'); $('.j-main', body).classList.add('j-out');
        await s.wait(280);
        drawList({ anim: true });
        await s.wait(900); done(1);
      },
      hold: 1500
    },
    { /* 3. heart one, tick three, apply */
      at: '8:47 AM',
      enter: function () { begin({}); drawList({}); },
      play: async function (s) {
        await s.wait(700);
        var r0 = rowOf('calendly-ss'), h = $('.j-ht', r0);
        await s.press(h, 900);
        if (!S.hearts['calendly-ss']) setHeart(h, 'calendly-ss', true, true);
        await s.wait(1500);
        for (var i = 0; i < PICKS.length; i++) {
          await s.press($('.j-ck', rowOf(PICKS[i])), i ? 650 : 500);
          setPick(PICKS[i], true);
        }
        await s.wait(600);
        await s.press($('.j-apply', body), 1100);
        done(2);
      },
      hold: 200
    },
    { /* 4. Zero tailors each one */
      at: '8:48 AM',
      enter: function () {
        begin({ hearts: { 'vercel-gtm': true, 'calendly-ss': true } });
        PICKS.forEach(function (id) { S.picks[id] = true; });
        drawList({ sheet: true });
      },
      play: async function (s) {
        await s.wait(700);
        Z.wire({ from: 1, text: 'Her 3 projects, used as proof' });
        var rows = $$('.j-sr', body);
        for (var i = 0; i < rows.length; i++) await tailor(s, rows[i], PICKS[i]);
        $('.j-sht', body).textContent = 'Applied to 3';
        $('.j-shz', body).innerHTML = Z.zero(40);
        $('.j-sf', body).classList.add('on');
        await s.wait(400); done(3);
        await s.press($('.j-donebtn', body), 1700);
        $('.j-sheet', body).classList.add('out');
        await s.wait(320);
      },
      hold: 120
    },
    { /* 5. the three land in Applied */
      at: '8:50 AM',
      enter: function () { begin({}); drawTracker({ anchor: true }); },
      play: async function (s) {
        await s.wait(500);
        var list = $('.j-tl', colEl('applied')), anchor = $('.j-anchor', body), n = byState(S.apps, 'applied').length;
        for (var i = 0; i < PICKS.length; i++) {
          var r = role(PICKS[PICKS.length - 1 - i]);
          var g = Z.el(tk({ id: r.id, state: 'applied', when: 'Today' }, 'ghost'));
          list.insertBefore(g, list.firstChild); openSpace(g);
          await s.wait(380);
          await Z.fly(anchor, g, '<div class="j-fc">' + Z.logo(r.dom, 24) + esc(r.title) + '</div>', 820);
          s.alive();
          g.classList.remove('ghost'); g.classList.add('land');
          setCount('applied', ++n);
          await s.wait(200);
        }
        S.apps = appsAt(1);
        await s.wait(500); done(4);
      },
      hold: 2400
    },
    { /* 6. Calendly writes back: Connected */
      at: '11:20 AM',
      enter: function () { begin({ apps: appsAt(1) }, PILL.noon); drawTracker(); },
      play: async function (s) {
        await s.wait(1100);
        var card = $('.j-tk[data-id="calendly-ss"]', colEl('applied')), r = role('calendly-ss');
        card.classList.add('lift');
        await s.wait(650);
        var list = $('.j-tl', colEl('connected'));
        var g = Z.el(tk({ id: r.id, state: 'connected', when: 'Today', note: 'Replied by email' }, 'ghost'));
        list.insertBefore(g, list.firstChild); openSpace(g);
        await s.wait(480);
        var fl = Z.fly(card, g, '<div class="j-fcard">' + Z.logo(r.dom, 32) + '<span>' + esc(r.title) + '</span></div>', 900);
        closeSpace(card); setCount('applied', byState(S.apps, 'applied').length - 1);
        await fl; s.alive();
        g.classList.remove('ghost'); g.classList.add('land');
        S.apps = appsAt(2); setCount('connected', byState(S.apps, 'connected').length);
        await s.wait(700);
        S.dot = true;
        var hb = $('.j-seg button[data-p="home"]', body); if (hb && !$('.j-dot', hb)) { hb.classList.add('has'); hb.insertAdjacentHTML('beforeend', '<i class="j-dot pop"></i>'); }
        await s.wait(400); done(5);
      },
      hold: 2600
    },
    { /* 7. Explore: her field by level */
      at: '12:00 PM',
      enter: function () { begin({ apps: appsAt(2), dot: true }, PILL.noon); drawExplore(); },
      play: async function (s) {
        await s.wait(1500);
        var es = $('.j-es', body), g = $('.j-grp[data-l="6"]', body);
        await tweenScroll(es, Math.min(g.offsetTop, es.scrollHeight - es.clientHeight), 1600); s.alive();
        await s.wait(600); done(6);
      },
      hold: 2400
    },
    { /* 8. Level 4 opens 35 roles */
      at: '3:41 PM',
      enter: function () { begin({ apps: appsAt(2), dot: true }, PILL.afternoon); drawExplore({ at: 3 }); },
      play: async function (s) {
        await s.wait(800);
        Z.wire({ from: 2, text: 'Level 4 opened 35 roles' });
        Z.pill.set(PILL.after[0], true); Z.pill.credits(PILL.after[1], true);
        await s.wait(1000);
        S.open = 4;
        await unlock(s, 3);
        await s.wait(350);
        var es = $('.j-es', body), to = endTop();
        if (Math.abs(es.scrollTop - to) > 2) { await tweenScroll(es, to, 900); s.alive(); }
        await unlock(s, 4);
        await s.wait(500);
        $('.j-acts', body).innerHTML = mboxHTML();
        await s.wait(700); done(7);
      },
      hold: 2600
    },
    { /* 9. what is next: the role she wants opens at Level 6 */
      at: '3:45 PM',
      enter: function () { begin({ apps: appsAt(2), dot: true, open: 4 }, PILL.after); drawExplore({ at: 'end', box: true }); },
      play: async function (s) {
        await s.wait(900);
        body.insertAdjacentHTML('beforeend', nextHTML());
        await s.wait(250);
        var bar = $('.j-prog i', body); if (bar) bar.style.width = '75%';
        Z.wire({ to: 1, text: 'Wants Level 6 for Vercel' });
        await s.wait(1200); done(8);
      },
      hold: 6000
    }
  ];

  Z.loadWord().then(function () {
    body = Z.shell({ sys: 3, tab: 'jobs', coach: true });
    fresh({});
    bind();
    Z.run(BEATS);
  });
  window.ZJ = { role: role, NEW20: NEW20, PICKS: PICKS };
})();
