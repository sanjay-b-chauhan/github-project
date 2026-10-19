/* Zero portfolio. Shared builders: logo, level badge, the recording frame (her screen, her camera on top), the project popup. */
(function () {
  const Z = window.ZP;
  const P = Z.person;

  Z.logo = (k, cls = '') => {
    const l = Z.logos[k]; if (!l) return '';
    if (l.img || l.pic) return `<img class="lg ${cls}" src="${l.img || l.tile}" alt="">`;
    return `<i class="lg lg-m ${cls}" style="-webkit-mask-image:url(${l.mask});mask-image:url(${l.mask});background:${l.c}"></i>`;
  };
  Z.name = k => (Z.logos[k] || {}).t || k;
  /* the badge is a rendered image. three sizes are shipped, the page picks the nearest one above what it shows */
  Z.badge = (n, size, cls = '') => {
    const file = size <= 36 ? 80 : size <= 90 ? 192 : 512;
    return `<img class="zb ${cls}" src="img/badge-${n}-${file}.webp" style="--s:${size}px" width="${size}" height="${size}" alt="Level ${n}">`;
  };
  Z.ladder = (cur, small = 26, big = 40) =>
    `<span class="zl">${Array.from({ length: 10 }, (_, i) => i + 1).map(n => n === cur ? Z.badge(n, big, 'cur') : Z.badge(n, small, 'zs' + (n > cur ? ' next' : ''))).join('')}</span>`;
  /* a skill's level is a plain number. the badge belongs to the person's level only */
  Z.lv = n => `<span class="zlv">${n}</span>`;
  Z.band = n => (Z.levelBands.find(b => n >= b.from && n <= b.to) || {}).t || '';
  /* the tint of a page comes from the profile picture: its three strongest hues, so no two portfolios look the same */
  Z.tones = src => new Promise(done => {
    const im = new Image();
    im.onload = () => {
      try {
        const n = 40, c = document.createElement('canvas'); c.width = c.height = n;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, n, n);
        const d = x.getImageData(0, 0, n, n).data, bins = Array.from({ length: 12 }, () => [0, 0, 0, 0]), all = [0, 0, 0, 0];
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510;
          all[0] += r; all[1] += g; all[2] += b; all[3]++;
          if (mx === mn) continue;
          const s = (mx - mn) / (255 - Math.abs(mx + mn - 255));
          if (s < .12 || l < .12 || l > .92) continue;
          let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
          const w = s * (1 - Math.abs(l - .5)), k = bins[Math.min(11, Math.floor(h / 30))]; k[0] += r * w; k[1] += g * w; k[2] += b * w; k[3] += w;
        }
        const avg = all.slice(0, 3).map(v => Math.round(v / all[3]));
        const top = bins.filter(k => k[3] > 1).sort((p, q) => q[3] - p[3]).slice(0, 3).map(k => k.slice(0, 3).map(v => Math.round(v / k[3])));
        while (top.length < 3) top.push(avg);
        done(top);
      } catch (e) { done(null); }
    };
    im.onerror = () => done(null); im.src = src;
  });
  /* three soft pools of those hues for a dark ground, as one background-image value */
  Z.wash = t => `radial-gradient(58% 78% at 8% -6%, rgba(${t[0]},.5) 0, rgba(${t[0]},0) 72%),radial-gradient(52% 70% at 96% 8%, rgba(${t[1]},.26) 0, rgba(${t[1]},0) 70%),radial-gradient(64% 80% at 58% 118%, rgba(${t[2]},.4) 0, rgba(${t[2]},0) 72%)`;
  Z.verdict = p => `<span class="vd ${p.verdict === 'Meets' ? 'meets' : ''}">${p.verdict}</span>`;

  /* ---------- screens she shares in each recording ---------- */
  const top = url => `<div class="sc-top"><span class="dots"><i></i><i></i><i></i></span><span class="url">${url}</span></div>`;
  const brand = k => `<span class="sl-brand">${Z.logo(k)}${Z.name(k)}</span>`;
  const S = {};

  S.n8n = () => {
    const node = (x, y, cls, inner, t, s) => `<div class="n8n ${cls}" style="left:${x}em;top:${y}em"><div class="bxn">${inner}</div><p>${t}<span>${s}</span></p></div>`;
    return `<div class="sc">${top('app.n8n.cloud/workflow/inbound-lead-router')}
      <div class="n8h">${Z.logo('n8n', 'n8l-logo')}<b>Inbound lead router</b><span class="tag">Active</span><span class="run">Last run: 1,200 items, 0 errors</span></div>
      <div class="sc-body"><div class="n8c">
        <svg viewBox="0 0 96 53.8" preserveAspectRatio="none" fill="none" stroke="#9a9ca4" stroke-width=".24"><path d="M13 13.5H20M29 13.5H36M45 13.5H52"/><path d="M61 13.5C65.5 13.5 63.5 5.5 68 5.5M77 5.5H83"/><path d="M61 13.5C65.5 13.5 63.5 22.5 68 22.5"/></svg>
        <span class="n8l" style="left:62.6em;top:6.4em"><b>true</b></span><span class="n8l" style="left:65.2em;top:16.6em"><b>false</b></span>
        ${node(4, 9, 'trg', Z.logo('hubspot'), 'New form fill', 'HubSpot trigger')}
        ${node(20, 9, '', Z.logo('clay'), 'Enrich company', 'Clay')}
        ${node(36, 9, '', Z.logo('claude'), 'Score the fit', '0 to 100, one reason')}
        ${node(52, 9, 'if', '<b>IF</b>', 'Score 70 or more', 'Branch')}
        ${node(68, 1, '', Z.logo('hubspot'), 'Assign owner', 'By territory')}
        ${node(83, 1, '', Z.logo('slack'), 'Notify rep', 'With drafted reply')}
        ${node(68, 18, 'q', '<b>?</b>', 'Review queue', 'A person decides')}
      </div></div></div>`;
  };

  S.clay = () => {
    const chip = { f: '<em class="f">Found</em>', s: '<em class="s">Skipped</em>', x: '<em class="x">No result</em>' };
    const rows = [
      ['Linear', 'linear.app', 'f', 's', 's', 'k•••@linear.app', 'Hiring 3 AEs, runs HubSpot'],
      ['Vercel', 'vercel.com', 'x', 'f', 's', 'm•••@vercel.com', 'New VP Sales in August'],
      ['Ramp', 'ramp.com', 'f', 's', 's', 'd•••@ramp.com', 'Sales team grew 40% this year'],
      ['Deel', 'deel.com', 'x', 'x', 'f', 'a•••@deel.com', 'Opened 2 RevOps roles'],
      ['Retool', 'retool.com', 'f', 's', 's', 'j•••@retool.com', 'Moved to usage pricing'],
      ['Webflow', 'webflow.com', 'x', 'f', 's', 's•••@webflow.com', 'Enterprise plan launched'],
      ['Miro', 'miro.com', 'f', 's', 's', 'r•••@miro.com', 'Hiring an SDR manager'],
      ['Airtable', 'airtable.com', 'x', 'x', 'x', '', 'No verified email yet'],
      ['Loom', 'loom.com', 'f', 's', 's', 't•••@loom.com', 'New outbound team']
    ];
    const head = [['', ''], ['Company', '#b9bcc6'], ['Domain', '#b9bcc6'], ['Apollo', '#e9f24d'], ['Prospeo', '#7a5bd0'], ['Findymail', '#2e9e6b'], ['Verified email', '#1a73e8'], ['Why they fit (Claude)', '#d97757']];
    return `<div class="sc">${top('app.clay.com/workspaces/notion-gtm/target-accounts')}
      <div class="cl-h">${Z.logo('clay', 'cl-logo')}<b>Target accounts</b><span>8,400 rows</span><span>91% with a verified email</span><span class="runb">Run waterfall</span></div>
      <div class="sc-body"><div class="cl">${head.map(([t, c], i) => `<span class="h"${i ? ` style="--c:${c}"` : ''}>${i ? '<i></i>' : ''}${t}</span>`).join('')}
        ${rows.map((r, i) => `<span class="n">${i + 1}</span><span class="co">${r[0]}</span><span>${r[1]}</span><span>${chip[r[2]]}</span><span>${chip[r[3]]}</span><span>${chip[r[4]]}</span><span>${r[5]}</span><span>${r[6]}</span>`).join('')}
      </div></div></div>`;
  };

  S.slack = () => {
    const rows = [['Ramp', 92, 'Pricing page 4 times, hiring 3 AEs'], ['Deel', 88, 'Series E news, new CRO started'], ['Retool', 85, 'Pricing page twice, 2 RevOps roles open'], ['Miro', 81, 'Docs visits from 6 people this week'], ['Webflow', 79, 'New VP Sales, enterprise plan launched']];
    return `<div class="sc sk">
      <div class="sk-s"><b>Stripe GTM</b><span># sales-team</span><span class="on"># intent-top10</span><span># deals-won</span><span># revops</span><span># pricing-page</span></div>
      <div class="sk-m"><div class="sk-h"><b># intent-top10</b><span>Ten accounts to call, posted at 8 am</span></div>
        <div class="sk-f">
          <div class="msg"><span class="av" style="background:#635bff"><b>S</b></span><div><div class="hd">Signal Score <i>APP</i><span>8:00 AM</span></div><p>Top accounts for today. Score is out of 100.</p>
            <div class="top">${rows.map((r, i) => `<div><span>${i + 1}</span><b>${r[0]}</b><em>${r[1]}</em><span>${r[2]}</span></div>`).join('')}</div></div></div>
          <div class="msg"><span class="av" style="background:#c4512d"><b>P</b></span><div><div class="hd">Priya Nair<span>8:14 AM</span></div><p>Calling Ramp and Deel first. The hiring signal is new this week.</p></div></div>
          <div class="msg"><span class="av" style="background:#4c6b8a"><b>O</b></span><div><div class="hd">Owen Clarke<span>8:21 AM</span></div><p>Retool is mine. Booked for Thursday.</p></div></div>
        </div></div></div>`;
  };

  S.evals = () => `<div class="sc sl">${brand('shopify')}<span class="k">Outbound agent, eval run 14</span><h4>46 of 50 test cases passed</h4>
    <div class="cols"><div class="cmp"><span class="k">Positive replies</span><div class="bars"><div><b>2.1%</b><i style="height:5.4em"></i><span>Before</span></div><div class="on"><b>5.4%</b><i style="height:14em"></i><span>With the agent</span></div></div></div>
    <div class="rb">
      <div><span>Facts match the brief</span><u style="--w:100%"></u><b>50/50</b></div>
      <div><span>No invented claims</span><u style="--w:100%"></u><b>50/50</b></div>
      <div><span>One clear ask</span><u style="--w:100%"></u><b>50/50</b></div>
      <div><span>Under 90 words</span><u style="--w:100%"></u><b>50/50</b></div>
      <div class="warn"><span>Tone fits the buyer</span><u style="--w:92%"></u><b>46/50</b></div>
    </div></div>
    <p class="foot">All four fails were tone. The facts were right every time.</p></div>`;

  S.lift = () => {
    const d = [['Top 5%', 38], ['5 to 10%', 14], ['10 to 20%', 16], ['20 to 40%', 15], ['40 to 60%', 9], ['60 to 100%', 8]];
    return `<div class="sc sl">${brand('figma')}<span class="k">PQL score, holdout month</span><h4>The top 5% of scores held 38% of upgrades</h4>
      <div class="cols"><div class="chw"><div class="ch">${d.map(x => `<div><b>${x[1]}%</b><i style="height:${Math.round(x[1] / 38 * 78)}%"></i></div>`).join('')}</div><div class="chx">${d.map(x => `<span>${x[0]}</span>`).join('')}</div></div>
      <div class="code"><em>select</em> workspace_id,\n    <s>0.45</s> * seats_z\n  + <s>0.35</s> * shared_files_z\n  + <s>0.20</s> * editor_days_z\n    <em>as</em> score\n<em>from</em> usage_last_30d</div></div>
      <p class="foot">Trained on six months. Scored the seventh blind.</p></div>`;
  };

  S.erd = () => `<div class="sc sl">${brand('canva')}<span class="k">Account model</span><h4>One account, one owner</h4>
    <div class="cols"><div class="erd">
      <svg style="width:50em;height:30em" viewBox="0 0 50 30" fill="none" stroke="#16161a" stroke-width=".15"><path d="M23.5 6V11M23.5 17C23.5 20 9.5 20 9.5 23M23.5 17C23.5 20 37.5 20 37.5 23"/></svg>
      <div class="bx hi" style="left:14em;top:0"><b>Parent account</b><span>One per company</span></div>
      <div class="bx" style="left:14em;top:11em"><b>Child account</b><span>One per region</span></div>
      <div class="bx" style="left:0;top:23em"><b>Contacts</b><span>Belong to one child</span></div>
      <div class="bx" style="left:28em;top:23em"><b>Deals</b><span>Roll up to the parent</span></div>
      <div class="st"><p><b>3,180</b>duplicates merged</p><p><b>22% to 3%</b>with no owner</p></div>
    </div><div class="rules"><span class="k">Three match rules</span>
      <div><b>1</b>Same root domain</div><div><b>2</b>Same legal name after cleanup</div><div><b>3</b>Same billing address</div>
    </div></div></div>`;

  S.crm = () => {
    const f = [['Metrics', 'Cut onboarding from 9 days to 4', '12:04'], ['Economic buyer', 'CFO, joins the next call', '18:31'], ['Decision criteria', 'SSO, SOC 2, admin controls', '21:47'], ['Decision process', 'Security review, then legal', '24:10'], ['Paper process', 'MSA on their paper', '26:02'], ['Pain', 'Three tools, no single owner', '06:15'], ['Champion', 'Head of IT, asked for pricing', '31:20']];
    return `<div class="sc">${top('app.hubspot.com/contacts/deal/northwind-rollout')}
      <div class="sc-body"><div class="sc crm">
        <div class="crm-l"><h5>Northwind rollout</h5><span class="sub">$84,000 · Stage: Evaluation · Close date Nov 14</span>
          <span class="ai">${Z.logo('claude')}Filled from the call on Jun 18</span>
          <div class="fl">${f.map(x => `<span>${x[0]}</span><b>${x[1]}</b><a>${x[2]}</a>`).join('')}</div></div>
        <div class="crm-r"><span class="k">Call transcript</span>
          <div class="tr"><b>Buyer · 11:58</b>We lose most of a week getting a new team set up.</div>
          <div class="tr hi"><b>Buyer · 12:04</b>Today it takes nine days. If you get that to four, I can sell this inside.</div>
          <div class="tr"><b>Rep · 12:21</b>Who signs off on a number like that?</div>
          <div class="tr"><b>Buyer · 18:31</b>Our CFO. She will join the next call.</div>
        </div></div></div></div>`;
  };

  /* two plain slides that any project can fill from its own numbers (project.sd) */
  S.slide = p => { const d = p.sd; return `<div class="sc sl">${brand(p.co)}<span class="k">${d.k}</span><h4>${d.h}</h4>
    <div class="cols"><div class="cmp"><span class="k">${d.cmp[0]}</span><div class="bars"><div><b>${d.cmp[1]}</b><i style="height:${d.cmp[2]}em"></i><span>${d.cmp[3]}</span></div><div class="on"><b>${d.cmp[4]}</b><i style="height:${d.cmp[5]}em"></i><span>${d.cmp[6]}</span></div></div></div>
    <div class="rb">${d.rows.map(r => `<div${r[3] ? ' class="warn"' : ''}><span>${r[0]}</span><u style="--w:${r[1]}%"></u><b>${r[2]}</b></div>`).join('')}</div></div>
    <p class="foot">${d.foot}</p></div>`; };
  S.chart = p => { const d = p.sd, mx = Math.max(...d.bars.map(x => x[1])), hue = (Z.logos[p.co] || {}).c || '#1f8f55'; return `<div class="sc sl">${brand(p.co)}<span class="k">${d.k}</span><h4>${d.h}</h4>
    <div class="cols"><div class="chw"><div class="ch">${d.bars.map((x, i) => `<div><b>${x[1]}${d.unit || ''}</b><i style="height:${Math.round(x[1] / mx * 78)}%${i ? '' : ';background:' + hue}"></i></div>`).join('')}</div><div class="chx">${d.bars.map(x => `<span>${x[0]}</span>`).join('')}</div></div>
    <div class="code">${d.code}</div></div>
    <p class="foot">${d.foot}</p></div>`; };

  /* ---------- the recording frame: her screen, and her on top of it ---------- */
  /* a project with no recording shows one picture of the work, with no camera on it */
  Z.meet = (p, o = {}) => p.img ? `<div class="mt mt-pic"><div class="mt-in"><img class="mt-img" src="${o.thumb && p.thumb ? p.thumb : o.lite && p.lite ? p.lite : p.img}" decoding="async" style="object-position:${p.imgAt || '50% 50%'}" alt="${p.short || p.title}"${o.eager ? '' : ' loading="lazy"'}></div></div>` : `<div class="mt"><div class="mt-in">${S[p.screen](p)}<div class="mt-cam"><img src="${(o.thumb || o.lite) && p.camS ? p.camS : p.cam}" style="object-position:${p.camX || 50}% 40%" alt="${P.name} presenting"${o.eager ? '' : ' loading="lazy"'}></div></div>${o.bare ? '' : '<span class="mt-play"></span>'}</div>`;

  /* ---------- project popup ---------- */
  const secs = d => { const [m, s] = d.split(':').map(Number); return m * 60 + s; };
  const mmss = t => Math.floor(t / 60) + ':' + String(Math.round(t % 60)).padStart(2, '0');
  let pm, cur = 0, timer = null;

  function stop() { clearInterval(timer); timer = null; pm && pm.classList.remove('playing'); }
  function line(i) {
    const p = Z.projects[cur], at = [0.04, 0.27, 0.52, 0.86][i] * secs(p.dur);
    pm.querySelector('.pm-line').innerHTML = `<small>From the recording · ${mmss(at)}</small>${p.said[i]}`;
  }
  function play() {
    if (!Z.projects[cur].said) return;
    if (timer) { stop(); line(0); return; }
    const bar = pm.querySelector('.pm-bar i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    pm.classList.add('playing'); let i = 0; line(0);
    timer = setInterval(() => { i++; if (i > 3) { stop(); line(0); return; } line(i); }, 3500);
  }
  function fill() {
    const p = Z.projects[cur]; stop();
    pm.querySelector('.pm-box').innerHTML = `
      <button class="pm-x" aria-label="Close"></button>
      <div class="pm-l">${Z.meet(p, { bare: true, eager: true })}
        ${p.said ? `<div class="pm-bar"><i></i></div>
        <div class="pm-cap"><button class="pm-pp" aria-label="Play highlights"></button><div class="pm-line"></div><span class="pm-time">${p.dur}</span></div>` : ''}</div>
      <div class="pm-r">
        <div class="pm-co">${Z.logo(p.co)}${p.coName}<span>${[p.cat, p.date].filter(Boolean).join(' · ')}</span></div>
        <h3>${p.title}</h3>
        ${p.big ? `<div class="pm-big"><b>${p.big}</b><span>${p.bigL}</span></div>` : ''}
        <p>${p[Z.sumKey] || p.sum}</p>
        ${p.tools ? `<div class="pm-tools">${p.tools.map(t => `<span>${Z.logo(t)}${Z.name(t)}</span>`).join('')}</div>` : ''}
        ${p.quote ? `<div class="pm-q"><span class="pm-v ${p.verdict === 'Meets' ? 'meets' : ''}">Rated ${p.verdict}</span><p style="margin-top:8px">${p.quote}</p><small><b>${p.by}</b>, ${p.byRole}. Manager in this scenario.</small></div>` : ''}
        ${p.credit ? `<p class="pm-credit">${p.credit}</p>` : ''}
        ${p.url ? `<a class="pm-link" href="${p.url}" target="_blank" rel="noopener">${p.urlText || 'Visit the site'}</a>` : ''}
        ${p.files ? `<div class="pm-files">${p.files.map(f => `<span>${f}</span>`).join('')}</div>` : '<span style="margin-top:auto"></span>'}
        <div class="pm-nav"><button data-go="-1">Previous</button><button data-go="1">Next</button><span>${cur + 1} of ${Z.projects.length}</span></div>
      </div>`;
    if (p.said) line(0);
  }
  Z.open = id => {
    cur = Math.max(0, Z.projects.findIndex(p => p.id === id));
    if (!pm) {
      pm = document.createElement('div'); pm.className = 'pm'; pm.setAttribute('role', 'dialog'); pm.setAttribute('aria-modal', 'true');
      pm.innerHTML = '<div class="pm-box"></div>'; document.body.appendChild(pm);
      pm.addEventListener('click', e => {
        if (e.target === pm || e.target.closest('.pm-x')) return Z.close();
        if (e.target.closest('.pm-pp')) return play();
        const g = e.target.closest('[data-go]'); if (g) { cur = (cur + Number(g.dataset.go) + Z.projects.length) % Z.projects.length; fill(); }
      });
    }
    fill(); pm.classList.add('on'); document.documentElement.style.overflow = 'hidden';
  };
  Z.close = () => { if (!pm) return; stop(); pm.classList.remove('on'); document.documentElement.style.overflow = ''; };

  /* one scale for every page: four fifths of the drawn size on a laptop, never above the drawn size on wide monitors */
  /* a page drawn at a reference's own sizes sets data-zoom on <html> and is shown as is */
  const fit = () => { const own = +document.documentElement.dataset.zoom; const z = own || .8 * Math.min(1.25, Math.max(1, innerWidth / 1512)); document.documentElement.style.zoom = z.toFixed(3); };
  fit(); addEventListener('resize', fit);

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { Z.open(o.dataset.open); return; }
    const b = e.target.closest('[data-intro]');
    if (b) { const on = b.classList.toggle('done'); b.textContent = on ? 'Intro requested' : b.dataset.intro; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') Z.close();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-open]')) { e.preventDefault(); Z.open(e.target.dataset.open); }
    if (pm && pm.classList.contains('on') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { cur = (cur + (e.key === 'ArrowRight' ? 1 : -1) + Z.projects.length) % Z.projects.length; fill(); }
  });
})();
