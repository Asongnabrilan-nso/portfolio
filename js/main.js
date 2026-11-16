/* ============================================================
   main.js: interactions
   Motion follows the Apple fluid-interface rules: feedback on
   pointer-down, CSS transitions that retarget from the live value
   (interruptible), and reduced-motion fallbacks in CSS.
   Content for Projects & Achievements lives in /data/*.json and
   is edited through /admin.html.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^(https?:|mailto:|assets\/|\.\/|\/)/i.test(String(u || '').trim()) ? String(u).trim() : '#';
  const paras = t => esc(t).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  $('#theme-toggle').addEventListener('click', () => {
    const current = root.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-fade');
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    setTimeout(() => root.classList.remove('theme-fade'), 400);
  });

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const setMenu = open => {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  const links = $$('#nav-links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.hash === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sibs = [...en.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      en.target.style.transitionDelay = Math.min(sibs.indexOf(en.target), 5) * 60 + 'ms';
      en.target.classList.add('in');
      reveal.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  const observeReveal = scope => $$('.reveal:not(.in)', scope).forEach(el => reveal.observe(el));
  observeReveal(document);

  /* ---------- Segmented controls (sliding thumb) ---------- */
  const segmented = (seg, onChange) => {
    const thumb = $('.segmented-thumb', seg);
    const tabs = $$('button', seg);
    const move = btn => {
      thumb.style.width = btn.offsetWidth + 'px';
      thumb.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
    };
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      move(btn);
      onChange(btn.dataset.filter);
    }));
    const sync = () => move($('[aria-selected="true"]', seg));
    addEventListener('resize', sync);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(sync);
    sync();
    return sync;
  };
  const filterGrid = (grid, f, emptyEl) => {
    let shown = 0;
    $$('.card', grid).forEach(el => {
      const show = f === 'all' || el.dataset.type === f;
      el.hidden = !show;
      if (show) { shown++; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    });
    if (emptyEl) emptyEl.hidden = shown > 0;
  };

  /* ================= Interactive layer ================= */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Scroll progress + back-to-top */
  const progress = $('#progress'), toTop = $('#to-top');
  let ticking = false;
  const onScrollFx = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    toTop.classList.toggle('show', scrollY > innerHeight * 0.9);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  onScrollFx();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Rotating headline words */
  const rotator = $('#rotator');
  if (rotator && !reduceMotion) {
    const words = ['leaves the lab.', 'moves.', 'thinks.', 'ships.', 'scales.'];
    let wi = 0;
    setInterval(() => {
      if (document.hidden) return;
      // Keep at most one outgoing word; drop anything older
      $$('.rotator-word:not(.is-in)', rotator).forEach(el => el.remove());
      const old = $('.rotator-word.is-in', rotator);
      wi = (wi + 1) % words.length;
      const next = document.createElement('span');
      next.className = 'rotator-word';
      next.textContent = words[wi];
      rotator.appendChild(next);
      void next.offsetWidth; // commit the start state so the transition runs
      next.classList.add('is-in');
      if (old) { old.classList.remove('is-in'); old.classList.add('is-out'); }
    }, 2800);
  }

  /* Count-up stats when they come into view */
  const countUp = el => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    $$('[data-count]', en.target).forEach(countUp);
    countObs.unobserve(en.target);
  }), { threshold: 0.4 });
  const stats = $('.hero-stats');
  if (stats) countObs.observe(stats);

  /* Card spotlight follows the pointer */
  if (finePointer) {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* Portrait: gentle 3D tilt toward the pointer */
  const portrait = $('#portrait');
  if (portrait && finePointer && !reduceMotion) {
    portrait.addEventListener('pointermove', e => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.setProperty('--ry', `${x * 10}deg`);
      portrait.style.setProperty('--rx', `${-y * 10}deg`);
    });
    portrait.addEventListener('pointerleave', () => {
      portrait.style.setProperty('--ry', '0deg');
      portrait.style.setProperty('--rx', '0deg');
    });
  }
  // Clicking the portrait jumps to the form and focuses it
  portrait && portrait.addEventListener('click', () => setTimeout(() => $('#f-name').focus({ preventScroll: true }), 600));

  /* Toast + copy to clipboard */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Email address copied'); }
    catch (e) { showToast(btn.dataset.copy); }
  }));

  /* Hero canvas: circuit-board nodes that light up and connect near the pointer */
  const canvas = $('#hero-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let W = 0, H = 0, dpr = 1, nodes = [], mouse = { x: -9999, y: -9999 }, running = false, raf = 0;
    const GAP = 46, R = 150;
    const color = () => getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000';
    let ink = color();
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) {
        nodes.push({ x, y, glow: 0, seed: Math.random() * Math.PI * 2 });
      }
      draw(performance.now());
    };
    const draw = t => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink; ctx.strokeStyle = ink;
      const near = [];
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const target = d < R ? 1 - d / R : 0;
        n.glow += (target - n.glow) * 0.12;
        const idle = reduceMotion ? 0 : (Math.sin(t / 1400 + n.seed) + 1) * 0.02;
        ctx.globalAlpha = 0.08 + idle + n.glow * 0.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.1 + n.glow * 1.6, 0, Math.PI * 2); ctx.fill();
        if (n.glow > 0.15) near.push(n);
      }
      // Right-angle "traces" between lit neighbours, like a PCB
      ctx.lineWidth = 1;
      for (const a of near) for (const b of near) {
        if (b === a || b.x < a.x || (b.x === a.x && b.y <= a.y)) continue;
        if (Math.abs(a.x - b.x) > GAP || Math.abs(a.y - b.y) > GAP) continue;
        ctx.globalAlpha = Math.min(a.glow, b.glow) * 0.45;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    const loop = t => { draw(t); raf = running ? requestAnimationFrame(loop) : 0; };
    const start = () => { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    hero.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (reduceMotion) draw(performance.now());
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; if (reduceMotion) draw(performance.now()); });
    new IntersectionObserver(([en]) => en.isIntersecting && !document.hidden ? start() : stop()).observe(hero);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    new MutationObserver(() => { ink = color(); draw(performance.now()); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { ink = color(); });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
  }

  /* ---------- Data ---------- */
  const load = path => fetch(path, { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => []);
  const firstImg = item => (item.images && item.images[0]) || item.image || '';

  /* ---------- Projects ---------- */
  const statusClass = s => 'status-' + String(s || '').toLowerCase().replace(/\s+/g, '-');
  const projectCard = (p, i) => `
    <article class="card project reveal${p.featured ? ' featured' : ''}${firstImg(p) ? ' has-media' : ''}" data-type="${esc(p.type)}">
      ${firstImg(p) ? `<div class="card-media"><img src="${esc(safeUrl(firstImg(p)))}" alt="" loading="lazy"></div>` : ''}
      <div class="card-content">
        <div class="project-meta">
          <span class="status ${statusClass(p.status)}">${esc(p.status)}</span>
          <span class="kind">${p.type === 'collab' ? 'Collaboration' : 'My project'}${p.year ? ' · ' + esc(p.year) : ''}</span>
        </div>
        <h3>${esc(p.title)}</h3>
        ${p.partner ? `<p class="partner">with ${esc(p.partner)}</p>` : ''}
        <p class="project-desc">${esc(p.summary)}</p>
        <ul class="chips">${(p.tags || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="project-links">
          <button class="more" data-open="project" data-index="${i}">Details <span aria-hidden="true">→</span></button>
          ${(p.links || []).map(l => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}
        </div>
      </div>
    </article>`;

  /* ---------- Achievements ---------- */
  const fmtDate = d => {
    if (!d) return '';
    const dt = new Date(d.length === 7 ? d + '-01' : d);
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };
  const achCard = (a, i) => `
    <article class="card ach reveal${a.image ? ' has-media' : ''}" data-type="${esc(a.type)}">
      ${a.image ? `<div class="card-media ach-media"><img src="${esc(safeUrl(a.image))}" alt="" loading="lazy"></div>` : `
        <div class="ach-icon" aria-hidden="true">${a.type === 'award'
          ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21.5l5-2.5 5 2.5-1.5-8"/></svg>'
          : '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M7.5 9h9M7.5 12h5"/><circle cx="16" cy="17.5" r="2.2"/><path d="m14.7 19.3-.7 2.7 2-1 2 1-.7-2.7"/></svg>'}</div>`}
      <div class="card-content">
        <div class="project-meta">
          <span class="status">${a.type === 'award' ? 'Award' : 'Certificate'}</span>
          <span class="kind">${esc(fmtDate(a.date))}</span>
        </div>
        <h3>${esc(a.title)}</h3>
        ${a.issuer ? `<p class="partner">${esc(a.issuer)}</p>` : ''}
        ${a.summary ? `<p class="project-desc">${esc(a.summary)}</p>` : ''}
        <div class="project-links">
          <button class="more" data-open="ach" data-index="${i}">Details <span aria-hidden="true">→</span></button>
          ${a.url ? `<a href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">${a.type === 'award' ? 'Learn more' : 'Verify'} <span aria-hidden="true">↗</span></a>` : ''}
        </div>
      </div>
    </article>`;

  /* ---------- Detail sheet (dim to focus, materialize in, Esc / scrim to close) ---------- */
  const sheet = $('#sheet'), scrim = $('#sheet-scrim'), body = $('#sheet-body');
  let lastFocus = null;
  const gallery = imgs => !imgs.length ? '' : `
    <div class="gallery">
      <div class="gallery-track" tabindex="0" aria-label="Image gallery">
        ${imgs.map((src, i) => `<img src="${esc(safeUrl(src))}" alt="Image ${i + 1} of ${imgs.length}" loading="lazy">`).join('')}
      </div>
      ${imgs.length > 1 ? `<div class="gallery-dots">${imgs.map((_, i) => `<span${i ? '' : ' class="on"'}></span>`).join('')}</div>` : ''}
    </div>`;
  const openSheet = html => {
    lastFocus = document.activeElement;
    body.innerHTML = html;
    sheet.hidden = scrim.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => { sheet.classList.add('open'); scrim.classList.add('open'); });
    sheet.scrollTop = 0;
    $('#sheet-close').focus();
    const track = $('.gallery-track', body);
    if (track) track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      $$('.gallery-dots span', body).forEach((d, j) => d.classList.toggle('on', i === j));
    }, { passive: true });
  };
  const closeSheet = () => {
    if (sheet.hidden) return;
    sheet.classList.remove('open'); scrim.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { if (!sheet.classList.contains('open')) sheet.hidden = scrim.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
  };
  $('#sheet-close').addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeSheet(); setMenu(false);
  });
  sheet.addEventListener('keydown', e => { // keep focus inside the sheet
    if (e.key !== 'Tab') return;
    const f = $$('a, button, [tabindex="0"]', sheet);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  const projectSheet = p => `
    ${gallery(p.images || [])}
    <div class="sheet-text">
      <p class="eyebrow">${p.type === 'collab' ? 'Collaboration' : 'My project'}${p.year ? ' · ' + esc(p.year) : ''} · ${esc(p.status)}</p>
      <h2 id="sheet-title" class="sheet-title">${esc(p.title)}</h2>
      ${p.partner ? `<p class="sheet-sub">with ${esc(p.partner)}</p>` : ''}
      <div class="prose">${paras(p.description || p.summary)}</div>
      ${p.role ? `<dl class="facts"><div><dt>My role</dt><dd>${esc(p.role)}</dd></div></dl>` : ''}
      ${(p.tags || []).length ? `<ul class="chips">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${(p.links || []).length ? `<div class="sheet-links">${p.links.map(l => `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
    </div>`;
  const achSheet = a => `
    ${gallery(a.image ? [a.image] : [])}
    <div class="sheet-text">
      <p class="eyebrow">${a.type === 'award' ? 'Award' : 'Certificate'}${a.date ? ' · ' + esc(fmtDate(a.date)) : ''}</p>
      <h2 id="sheet-title" class="sheet-title">${esc(a.title)}</h2>
      ${a.issuer ? `<p class="sheet-sub">${esc(a.issuer)}</p>` : ''}
      <div class="prose">${paras(a.description || a.summary)}</div>
      ${a.url ? `<div class="sheet-links"><a class="btn btn-ghost btn-sm" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">${a.type === 'award' ? 'Learn more' : 'Verify credential'} ↗</a></div>` : ''}
    </div>`;

  /* ---------- Render ---------- */
  Promise.all([load('data/projects.json'), load('data/achievements.json')]).then(([projects, achievements]) => {
    const statP = $('#stat-projects');
    if (statP && projects.length) { statP.dataset.count = projects.length; statP.textContent = projects.length; }
    const pGrid = $('#project-grid');
    pGrid.innerHTML = projects.map(projectCard).join('');
    observeReveal(pGrid);
    segmented($('[data-target="projects"]'), f => filterGrid(pGrid, f, $('#project-empty')));

    if (achievements.length) {
      $('#achievements').hidden = false;
      $('.nav-ach').hidden = false;
      spy.observe($('#achievements'));
      const aGrid = $('#ach-grid');
      aGrid.innerHTML = achievements.map(achCard).join('');
      observeReveal($('#achievements'));
      const seg = $('[data-target="ach"]');
      const types = new Set(achievements.map(a => a.type));
      if (types.size < 2) seg.hidden = true;
      else segmented(seg, f => filterGrid(aGrid, f));
    }

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-open]');
      if (btn) {
        const i = +btn.dataset.index;
        openSheet(btn.dataset.open === 'project' ? projectSheet(projects[i]) : achSheet(achievements[i]));
        return;
      }
      // Whole card is clickable too (but not its links)
      const card = e.target.closest('.project, .ach');
      if (card && !e.target.closest('a, button')) $('[data-open]', card).click();
    });
  });

  /* ---------- Résumé: fall back to a request email if the PDF isn't there ---------- */
  const resumeBtn = $('#resume-btn');
  fetch(resumeBtn.getAttribute('href'), { method: 'HEAD' })
    .then(r => { if (!r.ok) throw 0; })
    .catch(() => {
      resumeBtn.removeAttribute('download');
      resumeBtn.href = 'mailto:b.asongna@plastibytes.com?subject=R%C3%A9sum%C3%A9%20request';
      resumeBtn.lastChild.textContent = ' Request by email';
    });

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');
  const submit = $('#f-submit');
  const messages = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    message: 'Please write a short message (at least 10 characters).',
  };
  const check = input => {
    const err = input.parentElement.querySelector('.field-error');
    if (!err) return true;
    const ok = input.checkValidity();
    input.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : messages[input.name] || 'Please check this field.';
    return ok;
  };
  $$('input[required], textarea[required]', form).forEach(i => {
    i.addEventListener('blur', () => { if (i.value) check(i); });
    i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') check(i); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fields = $$('input[required], textarea[required]', form);
    const valid = fields.map(check).every(Boolean);
    if (!valid) { fields.find(f => !f.checkValidity()).focus(); return; }
    if (form._honey.value) return; // bot

    const data = Object.fromEntries(new FormData(form));
    if (!data._subject) data._subject = `Portfolio message from ${data.name}`;
    data._replyto = data.email;
    const mail = `mailto:b.asongna@plastibytes.com?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(data.message)}`;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';
    try {
      if (location.protocol === 'file:') throw new Error('Open the site through its web address (not as a file) to send messages.');
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) !== 'true') {
        const msg = out.message || `Service error (${res.status}).`;
        console.warn('[contact] FormSubmit:', msg);
        throw new Error(/activat/i.test(msg)
          ? 'The contact form is waiting to be activated by the site owner.'
          : msg);
      }
      form.reset();
      status.classList.add('ok');
      status.textContent = 'Thanks! Your message is on its way. I\'ll reply soon.';
    } catch (err) {
      status.classList.add('err');
      status.innerHTML = `${esc(err.message || 'The message couldn\'t be sent.')} <a href="${mail}">Send it from your email app instead</a>.`;
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });
})();
