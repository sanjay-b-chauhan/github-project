/* Maya Reyes, portfolio, on the Zero Jobs design system.
   Reads slate9's own data (js/data.js + js/data-maya17.js) and draws her work with slate9's real tool screens (ZP.meet). */
(function () {
  const Z = ZP, P = Z.person, PR = Z.projects, I = Z.insight, V = Z.intro;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = n => `<i data-lucide="${n}"></i>`;
  const play = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>`;
  const pause = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>`;
  const tile = (k, s = '') => `<span class="pz-lt${s ? ' pz-s' : ''}">${Z.logo(k)}</span>`;
  const secs = d => { const [m, s] = d.split(':').map(Number); return m * 60 + s; };
  const mmss = t => Math.floor(t / 60) + ':' + String(Math.round(t % 60)).padStart(2, '0');
  const top = p => p.verdict === 'Exceptional';
  const rate = p => `<span class="pz-rate${top(p) ? ' pz-top' : ''}">${ic(top(p) ? 'badge-check' : 'check')}Rated ${p.verdict} by ${p.by}</span>`;
  document.title = `${P.name}, ${P.role}`;

  /* numbers worked out from her projects, not typed in */
  const high = PR.filter(p => p.verdict !== 'Meets').length;
  const mins = Math.round(PR.reduce((a, p) => a + secs(p.dur), 0) / 60);
  const hm = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
  const F = PR[0], rest = PR.slice(1), SHOW = 6;

  /* the banner: three rows of her real screens */
  const wallIds = [['router', 'waterfall', 'evals', 'intent', 'pql', 'notes'], ['model', 'churn', 'routing', 'signup', 'reply', 'icp'], ['brief', 'pipeline', 'chat', 'winloss', 'deliver', 'router']];
  const byId = Object.fromEntries(PR.map(p => [p.id, p]));
  const row = ids => { const h = ids.map(id => Z.meet(byId[id], { bare: true, thumb: true, eager: true })).join(''); return `<div class="pz-row">${h}${h}</div>`; };
  const cos = [...new Set(PR.map(p => p.co))];

  $('#banner').innerHTML = `
    <div class="pz-wall" aria-hidden="true">${wallIds.map(row).join('')}</div>
    <div class="pz-btop"><span data-zj-logo></span><span class="pz-dim">Portfolio</span><span class="pz-b">b2</span><button class="zj-sec zj-sm" type="button" data-share>${ic('link')}Share</button></div>
    <div class="pz-bline"><span class="zj-lgs">${cos.slice(0, 7).map(k => tile(k, 's')).join('')}</span><span>${PR.length} projects, each one recorded and reviewed by a manager</span></div>`;

  /* quick chips: jump straight to a section */
  const NAV = [['work', 'Work', PR.length], ['reviews', 'Reviews', PR.filter(p => p.quote).length], ['skills', 'Skills', (Z.skillCols3 || Z.skillCols || Z.skills).reduce((a, g) => a + g.items.length, 0)], ['tools', 'Tools', Z.tools.length], ['background', 'Background', 0]];
  const chipsNav = cls => `<nav class="pz-qnavs ${cls}" aria-label="Go to a section">${NAV.map(([id, t, n], i) => `<button type="button" class="pz-q${i ? '' : ' zj-on'}" data-sec="${id}">${t}${n ? `<span>${n}</span>` : ''}</button>`).join('')}</nav>`;

  /* who she is */
  $('#id').innerHTML = `
    <div class="pz-id">
      <div class="pz-av"><img class="pz-photo" src="${P.photo}" alt="${P.name}">${Z.badge(P.level, 68)}</div>
      <div class="pz-acts"><button class="zj-key" type="button" id="introBtn">${ic('play')}Watch her intro</button><button class="zj-sec" type="button" data-share>${ic('link')}Share</button></div>
    </div>
    <div class="pz-who">
      <h1 class="zj-t28">${P.name}</h1>
      <p class="zj-meta"><span class="zj-mi">${ic('briefcase')}${P.role}</span><span class="zj-mi">${ic('map-pin')}${P.place}</span><span class="zj-mi">${ic('award')}Level ${P.level}, ${P.levelLine.toLowerCase()}</span></p>
      <p class="pz-about">${P.about}</p>
      <p class="pz-open">${P.open}</p>
    </div>
    <div class="pz-stats">
      <div class="pz-stat"><b>${PR.length}</b><span class="zj-m">projects on Zero</span></div>
      <div class="pz-stat"><b>${high} of ${PR.length}</b><span class="zj-m">rated Exceeds or higher</span></div>
      <div class="pz-stat"><b>${hm}</b><span class="zj-m">of recorded presentations</span></div>
    </div>
    ${chipsNav('pz-chips-hero')}`;

  /* the featured project */
  const feat = `
    <section class="pz-sec" id="work">
      <div class="pz-h"><h2>Featured</h2></div>
      <article class="pz-feat" tabindex="0" role="button" data-p="${F.id}" aria-label="Open ${F.short}">
        <div class="pz-stage">${Z.meet(F, { bare: true, eager: true })}<span class="pz-play">${play}</span><span class="pz-dur">${F.dur}</span></div>
        <div class="pz-fb"><span class="pz-co">${tile(F.co, 's')}<b>${F.coName}</b>${F.cat} · ${F.date}</span><h3>${F.title}</h3><p>${F.me}</p>${rate(F)}</div>
      </article>
    </section>`;

  const tileCard = (p, i) => `
    <article class="pz-tile${i >= SHOW ? ' pz-hide' : ''}" tabindex="0" role="button" data-p="${p.id}" aria-label="Open ${p.short}">
      <div class="pz-stage">${Z.meet(p, { bare: true, thumb: true })}</div>
      <div class="pz-tb"><span class="pz-co">${tile(p.co, 's')}<b>${p.coName}</b>${p.date}</span><h3>${p.title}</h3>${rate(p)}</div>
    </article>`;
  const work = `
    <section class="pz-sec">
      <div class="pz-h"><h2>More work</h2><span class="zj-m">${rest.length}</span></div>
      <div class="pz-work" id="workGrid">${rest.map(tileCard).join('')}</div>
      <div class="pz-more"><button class="zj-sec" type="button" id="moreBtn">Show all ${rest.length}${ic('chevron-down')}</button></div>
    </section>`;

  /* what her managers said */
  const said = PR.filter(p => p.quote);
  const reviews = `
    <section class="pz-sec" id="reviews">
      <div class="pz-h"><h2>What her managers said</h2><span class="zj-m">${said.length}</span></div>
      <figure class="pz-quote" id="quote"></figure>
    </section>`;

  /* skills: what she can do, with the companies whose projects show it */
  const cols = Z.skillCols3 || Z.skillCols || Z.skills, proof = Z.proof || {};
  const shownAt = n => [...new Set((proof[n] || []).map(id => byId[id] && byId[id].co).filter(Boolean))];
  const skills = `
    <section class="pz-sec" id="skills">
      <div class="pz-h"><h2>Skills</h2><span class="zj-m">Each one shown in a project</span></div>
      <div class="pz-skills">${cols.map(g => `<div class="pz-sg"><h3>${g.g}</h3><ul>${g.items.map(([n]) => `<li><span>${n}</span><span class="pz-at" title="Shown at ${shownAt(n).map(Z.name).join(', ')}">${shownAt(n).map(k => tile(k, 's')).join('')}</span></li>`).join('')}</ul></div>`).join('')}</div>
    </section>`;

  /* tool stack: every tool as a tile, with how many of her projects used it */
  const used = k => PR.filter(p => (p.tools || []).includes(k)).length;
  const tools = `
    <section class="pz-sec" id="tools">
      <div class="pz-h"><h2>Tool stack</h2><span class="zj-m">${Z.tools.length} tools</span></div>
      <div class="pz-stack">${Z.tools.map(k => { const n = used(k); return `<div class="pz-tk"><span class="pz-lt">${Z.logo(k)}</span><span><b>${Z.name(k)}</b><span class="zj-m">${n ? `In ${n} project${n > 1 ? 's' : ''}` : 'Before Zero'}</span></span></div>`; }).join('')}</div>
    </section>`;

  /* background: one below the other */
  const bgItem = (lt, title, sub, when, body) => `<div class="pz-item">${lt}<div class="pz-ib"><div class="pz-it"><b>${title}</b><span class="zj-m">${when}</span></div><span class="zj-m">${sub}</span>${body}</div></div>`;
  const bg = `
    <section class="pz-sec" id="background">
      <div class="pz-h"><h2>Background</h2></div>
      <div class="pz-bg">
        ${Z.work.map(w => bgItem(tile(w.co), w.role, `${w.org} · ${w.where}`, w.when, `<ul>${w.points.map(x => `<li>${x}</li>`).join('')}</ul>`)).join('')}
        ${Z.school.map(x => bgItem(tile(x.co), x.role, x.org, x.when, `<ul><li>GPA ${x.gpa}</li><li>${x.honours}</li><li>${x.courses}</li></ul>`)).join('')}
        ${Z.certs.map(c => bgItem(tile(c.co), c.role, c.org, c.when, '')).join('')}
        ${(Z.awards || []).map(a => bgItem(`<span class="pz-lt">${ic('medal')}</span>`, a.t, a.s, '', '')).join('')}
      </div>
    </section>`;

  /* Zero's read for one role */
  const mark = { yes: ['pz-y', 'circle-check'], half: ['pz-h2', 'circle-dot'], no: ['pz-n', 'circle-dashed'] };
  const side = `
    <aside class="pz-side" aria-label="Zero's read">
      <div class="pz-read">
        <div class="pz-rh">${zj.logo('ramp.com')}<div><span class="zj-ink zj-w5">${I.role} at ${I.co}</span><span class="zj-m">Zero's read for this role</span></div>${zj.orb(28, 'idle', { still: true })}</div>
        <span class="zj-fit zj-strong zj-big">${ic('sparkle')}<span>${I.verdict}</span></span>
        <p class="pz-sum">${I.sum}</p>
        <button class="zj-quiet pz-why" type="button" aria-expanded="false">See why${ic('chevron-down')}</button>
        <ul class="pz-fit">${I.fit.map(([t, s]) => `<li class="${mark[s][0]}">${ic(mark[s][1])}<span>${t}</span></li>`).join('')}</ul>
        <div class="pz-first"><h3>Before you talk to her</h3><ol>${I.first.map((t, i) => `<li><i>${i + 1}</i><span>${t}</span></li>`).join('')}</ol></div>
      </div>
      <p class="pz-note">${I.note}</p>
    </aside>`;

  $('#body').innerHTML = `<div class="pz-main">${feat}${work}${reviews}${skills}${tools}${bg}</div>${side}`;
  $$('[data-zj-logo]').forEach(e => e.outerHTML = zj.logoMark());

  /* the dock */
  $('#dock').innerHTML = `<div><span class="pz-dme"><img src="${P.photoS || P.photo}" alt=""><span><span class="zj-ink zj-w5">${P.name}</span><span class="zj-m">${P.role}</span></span></span><nav class="zj-tabs" id="tabs">${NAV.map(([id, t], i) => `<button type="button"${i ? '' : ' class="zj-on"'} data-sec="${id}">${t}</button>`).join('')}</nav><button class="zj-sec zj-sm pz-dshare" type="button" data-share aria-label="Share">${ic('link')}<span>Share</span></button>${chipsNav('pz-chips-dock')}</div>`;
  const dock = $('#dock'), secIds = NAV.map(n => n[0]);
  let tick = 0;
  const onScroll = () => { tick = 0; const b = $('#banner').getBoundingClientRect().bottom; dock.classList.toggle('pz-on', b < 0); let cur = 'work'; secIds.forEach(id => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top < 180) cur = id; }); $$('[data-sec]').forEach(t => t.classList.toggle('zj-on', t.dataset.sec === cur)); const on = $('.pz-chips-dock .zj-on'); if (on && dock.classList.contains('pz-on') && cur !== lastSec) { lastSec = cur; on.scrollIntoView({ block: 'nearest', inline: 'center' }); } };
  let lastSec = '';
  addEventListener('scroll', () => { if (!tick) { tick = 1; requestAnimationFrame(onScroll); } }, { passive: true });
  document.addEventListener('click', e => { const t = e.target.closest('[data-sec]'); if (!t) return; document.getElementById(t.dataset.sec).scrollIntoView({ behavior: 'smooth' }); });

  /* reviews, one at a time */
  let qi = 0;
  const drawQ = () => { const p = said[qi]; $('#quote').innerHTML = `<div class="pz-q-in"><blockquote>“${p.quote}”</blockquote></div><figcaption class="pz-qby">${tile(p.co)}<div><span class="zj-ink zj-w5">${p.by}</span><span class="zj-m">${p.byRole}, ${p.coName} · on ${p.short.toLowerCase()}</span></div><span class="pz-qnav"><button class="zj-arrow" type="button" data-q="-1" aria-label="Previous review">${ic('chevron-left')}</button><span>${qi + 1} of ${said.length}</span><button class="zj-arrow" type="button" data-q="1" aria-label="Next review">${ic('chevron-right')}</button></span></figcaption>`; zj.icons($('#quote')); };
  $('#quote').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; qi = (qi + +b.dataset.q + said.length) % said.length; drawQ(); });
  drawQ();

  $('#moreBtn').onclick = () => { const g = $('#workGrid'), on = !g.classList.contains('pz-all'); g.classList.toggle('pz-all', on); $('#moreBtn').innerHTML = on ? `Show fewer${ic('chevron-up')}` : `Show all ${rest.length}${ic('chevron-down')}`; zj.icons($('#moreBtn')); };

  /* share: copies the link */
  document.addEventListener('click', e => { if (!e.target.closest('[data-share]')) return; const done = () => zj.toast('Link copied. Anyone with it sees this page.', { icon: 'check' }); navigator.clipboard ? navigator.clipboard.writeText(location.href.split('#')[0]).then(done, done) : done(); });

  /* a project, opened: the recording with what she said, and the review */
  const scrim = $('#scrim'); let cur = 0, timer = null, t0 = 0;
  const stopP = () => { clearInterval(timer); timer = null; const pp = $('.pz-pp', scrim); if (pp) pp.innerHTML = play; };
  const line = (p, i) => { const at = [0.04, 0.27, 0.52, 0.86][i] * secs(p.dur); $('.pz-line', scrim).innerHTML = `<small>From the recording · ${mmss(at)} of ${p.dur}</small>${p.said[i]}`; };
  const runP = () => {
    const p = PR[cur]; if (!p.said) return;
    if (timer) { stopP(); return; }
    $('.pz-pp', scrim).innerHTML = pause; let i = 0; line(p, 0); t0 = performance.now();
    const bar = $('.pz-prog i', scrim);
    timer = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 14000); bar.style.width = (k * 100) + '%'; const n = Math.min(3, Math.floor(k * 4)); if (n !== i) { i = n; line(p, i); } if (k >= 1) stopP(); }, 100);
  };
  const fill = () => {
    const p = PR[cur]; stopP();
    $('.pz-modal', scrim).innerHTML = `
      <button class="zj-close pz-x" type="button" data-x aria-label="Close">${ic('x')}</button>
      <div class="pz-ml">${Z.meet(p, { bare: true, eager: true })}
        ${p.said ? `<div class="pz-prog"><i></i></div><div class="pz-cap"><button class="pz-pp" type="button" aria-label="Play what she said">${play}</button><div class="pz-line"></div></div>` : ''}</div>
      <div class="pz-mr">
        <span class="pz-co">${tile(p.co, 's')}<b>${p.coName}</b>${p.cat} · ${p.date}</span>
        <h3>${p.title}</h3>
        <p>${p.me || p.sum}</p>
        ${p.quote ? `<div class="pz-says">${rate(p)}<p>“${p.quote}”</p><span class="zj-m">${p.by}, ${p.byRole}. Her manager in this project</span></div>` : ''}
        ${p.tools ? `<div class="pz-chips">${p.tools.map(t => `<span>${Z.logo(t)}${Z.name(t)}</span>`).join('')}</div>` : ''}
        ${p.files ? `<div class="zj-tree">${p.files.map(f => `<div class="zj-tn"><span class="zj-tn-i">${ic('file-text')}</span><span class="zj-tn-t">${f}</span></div>`).join('')}</div>` : ''}
        <div class="pz-mnav"><button class="zj-ghost zj-sm" type="button" data-go="-1">${ic('arrow-left')}Previous</button><button class="zj-ghost zj-sm" type="button" data-go="1">Next${ic('arrow-right')}</button><span class="zj-m">${cur + 1} of ${PR.length}</span></div>
      </div>`;
    if (p.said) line(p, 0);
    zj.icons(scrim);
    $('.pz-mr', scrim).scrollTop = 0;
  };
  const open = id => { cur = PR.findIndex(p => p.id === id); scrim.hidden = false; scrim.innerHTML = '<div class="pz-modal" role="dialog" aria-modal="true"></div>'; fill(); document.documentElement.style.overflow = 'hidden'; $('[data-x]', scrim).focus({ preventScroll: true }); };
  const shut = () => { stopP(); stopIntro(); scrim.hidden = true; scrim.innerHTML = ''; document.documentElement.style.overflow = ''; };
  scrim.addEventListener('click', e => {
    if (e.target === scrim || e.target.closest('[data-x]')) return shut();
    const g = e.target.closest('[data-go]'); if (g) { cur = (cur + +g.dataset.go + PR.length) % PR.length; fill(); return; }
    if (e.target.closest('.pz-pp')) runP();
  });
  $('#body').addEventListener('click', e => { const c = e.target.closest('[data-p]'); if (c) open(c.dataset.p); });
  $('#body').addEventListener('keydown', e => { const c = e.target.closest('[data-p]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c.dataset.p); } });
  addEventListener('keydown', e => {
    if (scrim.hidden) return;
    if (e.key === 'Escape') shut();
    if ($('.pz-modal', scrim) && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { cur = (cur + (e.key === 'ArrowRight' ? 1 : -1) + PR.length) % PR.length; fill(); }
  });

  /* her intro: her camera frame with what she says, line by line */
  let it = null;
  const stopIntro = () => { clearInterval(it); it = null; };
  $('#introBtn').onclick = () => {
    scrim.hidden = false; document.documentElement.style.overflow = 'hidden';
    scrim.innerHTML = `<div class="pz-intro" role="dialog" aria-modal="true" aria-label="${P.first}'s intro"><button class="zj-close pz-x" type="button" data-x aria-label="Close">${ic('x')}</button><img src="${V.img}" style="object-position:${V.at}" alt="${P.name}"><p class="pz-sub"></p><div class="pz-prog"><i></i></div></div>`;
    zj.icons(scrim); const sub = $('.pz-sub', scrim), bar = $('.pz-prog i', scrim), dur = V.dur * 1000, s0 = performance.now();
    it = setInterval(() => { const k = Math.min(1, (performance.now() - s0) / dur); bar.style.width = (k * 100) + '%'; sub.textContent = V.lines[Math.min(V.lines.length - 1, Math.floor(k * V.lines.length))]; if (k >= 1) stopIntro(); }, 100);
  };

  $('.pz-why').onclick = e => { const r = $('.pz-read'), on = !r.classList.contains('pz-open'); r.classList.toggle('pz-open', on); e.currentTarget.setAttribute('aria-expanded', on); e.currentTarget.innerHTML = (on ? 'Show less' : 'See why') + ic(on ? 'chevron-up' : 'chevron-down'); zj.icons(e.currentTarget); };
  zj.icons(); onScroll();
})();
