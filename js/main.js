/* ============================================================
   main.js: interactions
   Motion follows the Apple fluid-interface rules: feedback on
   pointer-down, CSS transitions that retarget from the live value
   (interruptible), and reduced-motion fallbacks in CSS.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Theme (auto by default, user override remembered) ---------- */
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

  /* ---------- Nav: translucent edge + mobile menu ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const setMenu = (open) => {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Active section highlight (wayfinding: "where am I?")
  const links = $$('#nav-links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.hash === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Projects ---------- */
  const grid = $('#project-grid');
  const empty = $('#project-empty');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const statusClass = s => 'status-' + s.toLowerCase().replace(/\s+/g, '-');

  const card = p => `
    <article class="card project${p.featured ? ' featured' : ''}" data-type="${esc(p.type)}">
      <div class="project-meta">
        <span class="status ${statusClass(p.status)}">${esc(p.status)}</span>
        <span class="kind">${p.type === 'collab' ? 'Collaboration' : 'My project'} · ${esc(p.year)}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      ${p.partner ? `<p class="partner">with ${esc(p.partner)}</p>` : ''}
      <p class="project-desc">${esc(p.desc)}</p>
      <ul class="chips">${(p.tags || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="project-links">${(p.links || []).map(l =>
        `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}
      </div>
    </article>`;

  const projects = window.PROJECTS || [];
  grid.innerHTML = projects.map(card).join('');

  const seg = $('.segmented');
  const thumb = $('.segmented-thumb', seg);
  const tabs = $$('button', seg);
  const moveThumb = btn => {
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  };
  const applyFilter = f => {
    let shown = 0;
    $$('.project', grid).forEach(el => {
      const show = f === 'all' || el.dataset.type === f;
      el.hidden = !show;
      if (show) { shown++; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    });
    empty.hidden = shown > 0;
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    moveThumb(btn);
    applyFilter(btn.dataset.filter);
  }));
  const syncThumb = () => moveThumb($('[aria-selected="true"]', seg));
  addEventListener('resize', syncThumb);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(syncThumb);
  syncThumb();

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
  $$('.reveal, .project').forEach(el => { el.classList.add('reveal'); reveal.observe(el); });

  /* ---------- Résumé: fall back to a request email if the PDF isn't uploaded yet ---------- */
  const resumeBtn = $('#resume-btn');
  fetch(resumeBtn.getAttribute('href'), { method: 'HEAD' })
    .then(r => { if (!r.ok) throw 0; })
    .catch(() => {
      resumeBtn.removeAttribute('download');
      resumeBtn.href = 'mailto:b.asongna@plastibytes.com?subject=R%C3%A9sum%C3%A9%20request';
      resumeBtn.lastChild.textContent = ' Request by email';
    });

  /* ---------- Contact form: inline validation + async send ---------- */
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

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';
    try {
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success === 'false' || out.success === false) throw new Error(out.message);
      form.reset();
      status.classList.add('ok');
      status.textContent = 'Thanks! Your message is on its way. I\'ll reply soon.';
    } catch (err) {
      const mail = `mailto:b.asongna@plastibytes.com?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(data.message)}`;
      status.classList.add('err');
      status.innerHTML = `The message couldn't be sent from here. <a href="${mail}">Send it from your email app instead</a>.`;
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });
})();
