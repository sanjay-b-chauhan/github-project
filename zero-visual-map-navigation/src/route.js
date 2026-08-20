/**
 * visual-map-navigation — THE ROUTE.
 *
 * The city home ships with a bar that knows the whole journey and a map that
 * shows one building. This file gives the journey back to the map: the sixteen
 * scenarios drawn as one road through the world, the stretch behind you solid
 * and the stretch ahead dotted, and a control that pulls the camera back far
 * enough to see all of it.
 *
 * The rail is untouched. It stays the index; the map becomes the picture.
 *
 * ── Why it needs no measuring loop ────────────────────────────────────────
 * The map's markers live INSIDE the transformed plane — `left:x% / top:y%` on
 * a div the app pans and zooms as one. So does this. The road is an SVG in
 * that same plane and the stops are divs beside the app's own markers, which
 * means every camera move is already applied to them by the time they paint.
 * No rAF loop, no rect reads per frame, nothing that can fall out of sync.
 * (The nav lab's tether measured ~9 rects a frame to do less than this; it
 * measured because it lived OUTSIDE the plane. Do not move this out.)
 *
 * Two consequences of living inside a scaled element, both handled here:
 *   · strokes — `vector-effect:non-scaling-stroke` keeps the road one weight
 *     at every zoom, instead of a hairline that fattens to a ribbon at 3.4x.
 *   · stops — the plane publishes its zoom as `--map-zoom`, so a stop counter-
 *     scales in pure CSS and holds its size on screen. The same trick the
 *     app's own MapMarker does in JS with `scale={1/zoom}`.
 *
 * ── Where the data comes from ─────────────────────────────────────────────
 * Nothing here is authored. Order and status come from the journey fixture
 * (`__NX_ROADMAP`), coordinates from the map's own placement table
 * (`__NX_PLACE`), logos from the rail's own chips. A stop's click is FORWARDED
 * to that scenario's rail chip, so flying the camera and opening the card stay
 * the product's behaviour rather than a second implementation of it.
 */
(function () {
  'use strict';
  var NX = window.NX;
  if (!NX || !NX.state.enabled || NX.state.cards) return;

  /* OFF BY DEFAULT, and no pill in the panel — Sanjay's call on 2026-08-20:
     "remove the route pill and idea". The city home is the shipped screen
     again.

     The work is kept rather than deleted, because everything it learned about
     the map is worth more than the road itself: the plane's percent space, the
     `--map-zoom` counter-scale, the computed pull-back framing, and the fact
     that ten of the sixteen buildings carry no marker at all. `?route=on`
     brings the whole thing back in one parameter if the idea is ever wanted
     again. */
  var q = new URLSearchParams(location.search);
  if ((q.get('route') || 'off').toLowerCase() !== 'on') return;

  var GREEN = 'rgb(73, 186, 97)';
  var EASE = NX.EASE;
  var REDUCE = NX.REDUCE;
  var styleEl = NX.styleEl;

  /* The plane is the app's own transformed div, reached through the map image
     rather than by class: the class is Tailwind soup that any rebuild can
     reshuffle, while the image keeps its alt text. */
  function mapPlane() {
    var img = document.querySelector('img[alt="Zero World"]');
    return img && img.parentElement;
  }

  function zoomOf(plane) {
    return parseFloat(plane.style.getPropertyValue('--map-zoom')) || 1;
  }

  /** The journey as an ordered list of stops that have a place on this map. */
  function readStops(rail) {
    var rm = window.__NX_ROADMAP;
    var place = window.__NX_PLACE;
    if (!rm || !place) return [];

    // Logos come off the rail's own chips, keyed by company, so a stop can
    // never wear a different mark than the chip it belongs to.
    var byCompany = {};
    (rail.segments || []).forEach(function (seg) {
      seg.chips.forEach(function (c) { if (c.company) byCompany[c.company] = c; });
    });

    var done = rm.completedCount;
    var out = [];
    rm.categories.forEach(function (cat) {
      cat.scenarios.forEach(function (s) {
        var name = s.company && s.company.name;
        var p = name && place(name);
        if (!p) return; // no building in this world — nothing to draw on
        out.push({
          n: s.sequence_order,
          company: name,
          title: s.title,
          category: cat.title,
          x: p.x,
          y: p.y,
          chip: byCompany[name],
          status:
            s.sequence_order <= done ? 'done' : s.sequence_order === done + 1 ? 'current' : 'ahead',
        });
      });
    });
    return out.sort(function (a, b) { return a.n - b.n; });
  }

  function currentCompany() {
    var rm = window.__NX_ROADMAP;
    if (!rm) return null;
    var found = null;
    rm.categories.forEach(function (c) {
      c.scenarios.forEach(function (s) {
        if (s.sequence_order === rm.completedCount + 1 && s.company) found = s.company.name;
      });
    });
    return found;
  }

  /* ── the road ────────────────────────────────────────────────────────────
     A route bends. Sixteen points joined by straight segments reads as a
     network diagram — nodes and edges — and the whole point is that this is a
     road through a city. Catmull-Rom through the stops, converted to cubic
     Béziers, arrives at every building exactly and curves in between. Tension
     is low: enough to round the corners, not enough to bow away from the
     buildings it exists to connect. */
  var TENSION = 0.68;

  function smooth(pts) {
    if (pts.length < 2) return '';
    var f = function (n) { return n.toFixed(2); };
    var d = 'M' + f(pts[0].X) + ' ' + f(pts[0].Y);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || pts[i + 1];
      d +=
        'C' + f(p1.X + ((p2.X - p0.X) / 6) * TENSION) + ' ' + f(p1.Y + ((p2.Y - p0.Y) / 6) * TENSION) +
        ' ' + f(p2.X - ((p3.X - p1.X) / 6) * TENSION) + ' ' + f(p2.Y - ((p3.Y - p1.Y) / 6) * TENSION) +
        ' ' + f(p2.X) + ' ' + f(p2.Y);
    }
    return d;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function installCss() {
    if (document.getElementById('nx-route-css')) return;
    var css = document.createElement('style');
    css.id = 'nx-route-css';
    css.textContent = [
      /* Every stop counter-scales against the plane's own zoom, so it holds
         its size on screen while the world grows under it. The transition
         matches the map's own 150ms: the custom property jumps, this eases it,
         and the two arrive together. */
      '.nx-stop{position:absolute;transform-origin:center center;' +
        'transform:translate(-50%,-50%) scale(calc(1 / var(--map-zoom, 1)));' +
        'transition:transform 150ms ' + EASE + ', opacity 420ms ease;' +
        'display:grid;place-items:center;cursor:pointer;z-index:2}',
      '.nx-stop-disc{width:52px;height:52px;border-radius:999px;display:grid;place-items:center;' +
        'background:rgba(18,17,16,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18), 0 8px 22px -10px rgba(0,0,0,0.85);' +
        'transition:box-shadow 200ms ease, background 200ms ease, transform 260ms ' + EASE + '}',
      '.nx-stop-disc img{width:26px;height:26px;object-fit:contain;opacity:.62;' +
        'transition:opacity 200ms ease}',
      '.nx-stop:hover .nx-stop-disc,.nx-stop:focus-visible .nx-stop-disc' +
        '{background:rgba(18,17,16,0.8);transform:scale(1.12);' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.5), 0 12px 30px -10px rgba(0,0,0,0.95)}',
      '.nx-stop:hover .nx-stop-disc img,.nx-stop:focus-visible .nx-stop-disc img{opacity:1}',
      '.nx-stop:focus{outline:none}',
      '.nx-stop-next .nx-stop-disc{background:rgba(18,17,16,0.72);' +
        'box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.55), 0 10px 26px -10px rgba(0,0,0,0.9)}',
      '.nx-stop-next .nx-stop-disc img{opacity:.95}',
      '.nx-stop-next .nx-stop-label{opacity:1}',
      /* The name sits under the disc on the same centre line, so nothing jumps
         when it appears. Held open for every stop while the whole journey is
         on screen — that is the moment the names are the point. */
      '.nx-stop-label{position:absolute;top:100%;margin-top:8px;left:50%;transform:translateX(-50%);' +
        'white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 200ms ease;' +
        'font:600 13px/1 "Google Sans Flex",system-ui,sans-serif;letter-spacing:-0.01em;' +
        'color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.85)}',
      '.nx-stop:hover .nx-stop-label,.nx-stop:focus-visible .nx-stop-label,' +
        'html[data-nx-route="wide"] .nx-stop-label{opacity:1}',
      /* Overview: the road is the subject, so the one-scenario furniture steps
         back. The card is about a single stop, and the leader line exists to
         tie that card to a building — neither has a job while you are reading
         all sixteen at once. */
      'html[data-nx-route="wide"] div[class*="right-[90px]"][class*="inset-y-0"]' +
        '{opacity:0 !important;pointer-events:none !important;transition:opacity 260ms ease}',
      'html[data-nx-route="wide"] svg[class*="z-[29]"]{opacity:0 !important;transition:opacity 200ms ease}',
      /* The control is the SettingsPill recipe at the same height, so the two
         objects in that corner read as one pair of world controls. */
      '.nx-wide-btn{height:58px;display:inline-flex;align-items:center;gap:11px;padding:0 22px 0 19px;' +
        'border-radius:999px;border:2px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.2);' +
        'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;' +
        'opacity:.55;transition:opacity 200ms ease;color:#fff;' +
        'font:500 15px/1 "Google Sans Flex",system-ui,sans-serif;letter-spacing:-0.01em;white-space:nowrap}',
      '.nx-wide-btn:hover{opacity:1}',
      '.nx-wide-icon{display:grid;place-items:center}',
    ].join('\n');
    document.head.appendChild(css);
  }

  /* ── the layer ───────────────────────────────────────────────────────────
     One SVG for the road, plus one div per unreached stop. The completed stops
     and the current one already carry the app's own MapMarker — two marks on
     one building is a bug, not a feature — so the road runs through them and
     draws nothing there. */
  function build(plane, list) {
    var pr = plane.getBoundingClientRect();
    // the plane's own proportions, so the viewBox never distorts the road
    var W = 1000;
    var H = (pr.height / pr.width) * 1000;

    var pts = list.map(function (s) {
      return { X: (s.x / 100) * W, Y: (s.y / 100) * H };
    });
    var cur = 0;
    for (var i = 0; i < list.length; i++) if (list[i].status === 'current') cur = i;
    var firstAhead = list[cur + 1] ? list[cur + 1].n : -1;

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W.toFixed(2) + ' ' + H.toFixed(2),
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    });
    styleEl(svg, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', overflow: 'visible', zIndex: '1',
    });
    svg.id = 'nx-route-svg';

    /* A ROAD, NOT A BEAM. The first pass drew a bright line with a soft green
       bloom under it, and over a rendered city that reads as a laser — it
       competes with the world instead of describing it. Cartography solves
       exactly this problem and has for a century: a road is a dark CASING with
       a lighter fill inside it. The casing buys contrast against whatever the
       line happens to cross, at a fraction of the brightness a glow costs.

       Both stretches are non-scaling, so the road holds one weight from the
       shipped 3.4x down to the overview — and `pathLength` re-bases the dash
       units, so the dot rhythm is a property of the road rather than of how
       long this particular path happens to be. */
    function road(d, attrs) {
      var casing = svgEl('path', {
        d: d, fill: 'none', stroke: 'rgba(8,10,9,0.55)',
        'stroke-width': String(parseFloat(attrs['stroke-width']) + 3.4),
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: '100',
        'vector-effect': 'non-scaling-stroke',
      });
      if (attrs['stroke-dasharray']) casing.setAttribute('stroke-dasharray', attrs['stroke-dasharray']);
      var fill = svgEl('path', Object.assign(
        { d: d, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          pathLength: '100', 'vector-effect': 'non-scaling-stroke' }, attrs));
      svg.appendChild(casing);
      svg.appendChild(fill);
      return { casing: casing, fill: fill };
    }

    /* THE WAY AHEAD, laid first so the walked road sits over it where the two
       meet: you have been there, and that is the stronger fact. Dots, not
       dashes — a dashed line reads as a border, a dotted line reads as a route
       that has been planned and not yet travelled.

       Split in two at the NEXT stop. One even dotted line from here to the end
       of the journey says every remaining scenario is equally far away, and
       they are not: one of them is the one you do next. The first leg is
       brighter and its dots sit closer, so the road has a direction to read
       even before you have read a single name. */
    var legR = road(smooth(pts.slice(cur, cur + 2)), {
      stroke: 'rgba(255,255,255,0.95)', 'stroke-width': '2.7', 'stroke-dasharray': '0 1.6',
    });
    var restR = road(smooth(pts.slice(cur + 1)), {
      stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '2.4', 'stroke-dasharray': '0 1.25',
    });
    var ahead = restR.fill;

    /* THE ROAD WALKED — solid, and the rail's own green, because in this
       journey green has meant "done" since the bar was built. */
    var walkedD = smooth(pts.slice(0, cur + 1));
    var walkedR = road(walkedD, { stroke: GREEN, 'stroke-width': '2.6' });
    var walked = walkedR.fill;
    var glow = walkedR.casing;

    /* The road belongs UNDER its stops. Inserted right after the map image so
       it paints below the app's own markers — a line crossing over the
       building it is supposed to arrive at is the tell of an overlay. */
    var img = plane.querySelector('img');
    plane.insertBefore(svg, img ? img.nextSibling : plane.firstChild);

    var nodes = [];
    list.forEach(function (s) {
      if (s.status !== 'ahead') return; // the app already marks the rest
      var el = styleEl(document.createElement('div'), { left: s.x + '%', top: s.y + '%' });
      el.className = 'nx-stop';
      el.dataset.nxStop = s.company;

      var disc = document.createElement('div');
      disc.className = 'nx-stop-disc';
      if (s.chip && s.chip.logo) {
        var img = document.createElement('img');
        img.src = s.chip.logo;
        img.alt = '';
        disc.appendChild(img);
      } else {
        // a stop with no mark still has a place in the order
        disc.textContent = String(s.n);
        disc.style.font = '500 14px/1 "Google Sans Flex",system-ui,sans-serif';
        disc.style.color = 'rgba(255,255,255,0.7)';
      }

      var label = document.createElement('span');
      label.className = 'nx-stop-label';
      label.textContent = s.company;
      /* The next stop is not one of ten equal futures — it is the one you do
         after this one. It keeps its name on screen at every zoom and wears a
         brighter ring, so the road ends somewhere specific. */
      if (s.n === firstAhead) el.classList.add('nx-stop-next');

      el.appendChild(disc);
      el.appendChild(label);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', s.title + ', ' + s.company);

      /* Forwarded, not reimplemented. The rail's chip already flies the
         camera, opens the card and moves the selection; a stop doing its own
         version of that would be a second source of truth for one click. */
      var open = function () {
        setWide(false, { silent: true });
        if (s.chip && s.chip.button) s.chip.button.click();
        else if (window.__NX_FLY) window.__NX_FLY(s.company);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });

      plane.appendChild(el);
      nodes.push(el);
    });

    return {
      svg: svg, walked: walked, glow: glow, nodes: nodes,
      // both dotted pieces fade in together after the walked road lands
      aheadParts: [legR.casing, legR.fill, restR.casing, restR.fill],
    };
  }

  /* The road draws itself in — from the start of the journey to where you
     stand — and only then does the way ahead dot in and the stops arrive.
     It plays on the FIRST pull-back and not on the shipped framing, because at
     3.4x fifteen of the sixteen stops are off screen and an animation nobody
     can see is just a delay. Timer-driven throughout: a throttled tab must
     land on the resting state, never strand the road half-drawn. */
  function drawIn(layer) {
    if (REDUCE) return;
    [layer.walked, layer.glow].forEach(function (p) {
      p.style.transition = 'none';
      p.style.strokeDasharray = '100 100';
      p.style.strokeDashoffset = '100';
    });
    layer.aheadParts.forEach(function (p) { p.style.opacity = '0'; });
    layer.nodes.forEach(function (n) { n.style.opacity = '0'; });

    setTimeout(function () {
      [layer.walked, layer.glow].forEach(function (p) {
        p.style.transition = 'stroke-dashoffset 1000ms ' + EASE;
        p.style.strokeDashoffset = '0';
      });
    }, 40);
    setTimeout(function () {
      // clear the dash so the resting road is a plain line again
      [layer.walked, layer.glow].forEach(function (p) {
        p.style.transition = 'none';
        p.style.strokeDasharray = '';
        p.style.strokeDashoffset = '';
      });
      layer.aheadParts.forEach(function (p) {
        p.style.transition = 'opacity 600ms ease';
        p.style.opacity = '1';
      });
    }, 1060);
    layer.nodes.forEach(function (n, i) {
      setTimeout(function () { n.style.opacity = '1'; }, 1180 + i * 34);
    });
  }

  /* ── the whole journey ───────────────────────────────────────────────────
     At the shipped zoom the camera frames one city and fifteen of the sixteen
     stops are somewhere past the edge of the screen. A road you can only ever
     see one bend of is not a map of a journey, so one control pulls back until
     all of it is in frame.

     The framing is COMPUTED, never a stored zoom: it reads the plane's own
     geometry and the band of screen the rail and the panel leave free, so it
     is right at any window size instead of right on one laptop. */
  function fitCamera(plane, list) {
    var pr = plane.getBoundingClientRect();
    var z = zoomOf(plane);
    var baseW = pr.width / z; // the plane at zoom 1, in px
    var baseH = pr.height / z;

    var xs = list.map(function (s) { return s.x; });
    var ys = list.map(function (s) { return s.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);

    // the discs and their names need room at the edges of the span; the rail
    // owns the bottom of the screen and the panel the top
    var PAD_X = 110, PAD_TOP = 104, PAD_BOTTOM = 172;
    var usableW = Math.max(240, window.innerWidth - 2 * PAD_X);
    var usableH = Math.max(240, window.innerHeight - PAD_TOP - PAD_BOTTOM);

    var spanX = Math.max(0.02, (maxX - minX) / 100);
    var spanY = Math.max(0.02, (maxY - minY) / 100);
    var fit = Math.min(usableW / (baseW * spanX), usableH / (baseH * spanY));
    fit = Math.max(1, Math.min(fit, 3));

    // The camera centres its focal point in the VIEWPORT, but the road has to
    // be centred in the band the chrome leaves free. Shifting the focus by the
    // difference puts the journey in the open air instead of under the rail.
    var offset = PAD_TOP + usableH / 2 - window.innerHeight / 2;
    return {
      fx: (minX + maxX) / 200,
      fy: (minY + maxY) / 200 + offset / (baseH * fit),
      z: fit,
    };
  }

  /* One place holds the wide/close state, because three things change it: the
     control, a stop, and any click on the rail. */
  var ctl = { wide: false, plane: null, list: null, btn: null, layer: null, drawn: false };

  var ICON_WIDE =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4"/></svg>';
  var ICON_CLOSE =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 9h4a2 2 0 0 0 2-2V3M20 9h-4a2 2 0 0 1-2-2V3M4 15h4a2 2 0 0 1 2 2v4M20 15h-4a2 2 0 0 0-2 2v4"/></svg>';

  /**
   * @param {boolean} on
   * @param {{silent?:boolean}} [opts] silent = something else is already
   *        flying the camera (a stop was clicked), so do not fly it back.
   */
  function setWide(on, opts) {
    if (on === ctl.wide) return;
    ctl.wide = on;
    document.documentElement.dataset.nxRoute = on ? 'wide' : 'close';

    if (ctl.btn) {
      ctl.btn.querySelector('.nx-wide-label').textContent = on
        ? ctl.btn.dataset.close
        : ctl.btn.dataset.open;
      ctl.btn.querySelector('.nx-wide-icon').innerHTML = on ? ICON_CLOSE : ICON_WIDE;
      ctl.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    if (!on) {
      if (!(opts && opts.silent)) {
        var here = currentCompany();
        if (here && window.__NX_FLY) window.__NX_FLY(here);
      }
      return;
    }

    if (window.__NX_CAM) window.__NX_CAM(fitCamera(ctl.plane, ctl.list));
    if (!ctl.drawn) {
      ctl.drawn = true;
      // let the camera's own pull-back land before the road starts drawing
      setTimeout(function () { drawIn(ctl.layer); }, 620);
    }
  }

  function buildControl(plane) {
    /* Mounted as a sibling of the settings gear's wrapper, so it inherits the
       same inset AND the same canvas scale. Mounted to <body> it would drift
       away from the gear as the window changes size. */
    var gearWrap = document.querySelector(
      '.pointer-events-auto.absolute.left-\\[40px\\].bottom-\\[33px\\], ' +
        'div[class*="left-[40px]"][class*="bottom-[33px]"]'
    );
    var host = styleEl(document.createElement('div'), {
      position: 'absolute',
      left: '110px', // 40 (the gear's inset) + 58 (the gear) + 12 (its own gap)
      bottom: '33px',
      zIndex: '30',
      pointerEvents: 'auto',
    });
    host.id = 'nx-route-control';

    var here = currentCompany();
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nx-wide-btn';
    btn.dataset.open = 'Whole journey';
    btn.dataset.close = here ? 'Back to ' + here : 'Back to the scenario';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML =
      '<span class="nx-wide-icon">' + ICON_WIDE + '</span>' +
      '<span class="nx-wide-label">' + btn.dataset.open + '</span>';
    btn.addEventListener('click', function () { setWide(!ctl.wide); });

    host.appendChild(btn);
    (gearWrap && gearWrap.parentElement ? gearWrap.parentElement : document.body).appendChild(host);
    return btn;
  }

  function init(nav, rail) {
    var plane = mapPlane();
    if (!plane) return;
    var list = readStops(rail);
    if (list.length < 2) return;

    installCss();
    document.documentElement.dataset.nxRoute = 'close';

    ctl.plane = plane;
    ctl.list = list;
    ctl.layer = build(plane, list);
    ctl.btn = buildControl(plane);

    /* React owns this plane. It does not delete children it never created, but
       it does re-create the plane itself when the map image swaps (the loader
       handing over to the full-resolution map). Re-attach rather than assume. */
    var mo = new MutationObserver(function () {
      var live = mapPlane();
      if (!live || live === ctl.layer.svg.parentElement) return;
      ctl.plane = live;
      ctl.layer = build(live, list);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // the framing depends on the window, so a resize while wide re-fits
    window.addEventListener('resize', function () {
      if (ctl.wide && window.__NX_CAM) window.__NX_CAM(fitCamera(ctl.plane, list));
    });

    // Clicking the rail is a move to one scenario, which is the opposite of
    // reading the whole road — so the rail closes the overview with it. The
    // rail flies the camera itself; this must not fly it somewhere else.
    nav.addEventListener('click', function () { setWide(false, { silent: true }); }, true);

    // Escape is what every other full-screen view on this machine answers to.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ctl.wide) setWide(false);
    });
  }

  NX.onRail(function (nav, rail) { init(nav, rail); });
})();
