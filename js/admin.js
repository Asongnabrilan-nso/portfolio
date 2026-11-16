/* ============================================================
   admin.js: portfolio content editor
   Edits data/projects.json and data/achievements.json and uploads
   images, committing everything to GitHub in ONE commit per save
   (Git Data API). Auth = a fine-grained token entered by the owner;
   it never leaves this browser except to call api.github.com.
   ============================================================ */
(() => {
  const OWNER = 'Asongnabrilan-nso';
  const REPO = 'portfolio';
  const BRANCH = 'main';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const MAX_IMG = 1600;           // longest edge after resize (px)
  const JPEG_Q = 0.85;
  const MAX_PDF_MB = 15;          // size limit for certificate PDFs
  const MAX_PDF_PAGES = 10;       // pages converted to view-only pictures
  const WATERMARK = 'Asongna Brilan · Portfolio · View only';
  const WATERMARK_SITE = 'asongnabrilan-nso.github.io/portfolio';

  const COLS = {
    projects: { file: 'data/projects.json', dir: 'assets/projects', noun: 'project', multiImage: true },
    achievements: { file: 'data/achievements.json', dir: 'assets/achievements', noun: 'achievement', multiImage: true, acceptPdf: true },
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Token storage ---------- */
  const store = {
    get() { try { return sessionStorage.getItem('gh_token') || localStorage.getItem('gh_token') || ''; } catch (e) { return ''; } },
    set(t, remember) {
      try { (remember ? localStorage : sessionStorage).setItem('gh_token', t); } catch (e) { }
    },
    clear() { try { sessionStorage.removeItem('gh_token'); localStorage.removeItem('gh_token'); } catch (e) { } },
  };
  let token = '';

  /* ---------- GitHub API ---------- */
  async function gh(path, opts = {}) {
    const res = await fetch(path.startsWith('http') ? path : API + path, {
      ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const err = new Error(j.message || `GitHub error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  const b64ToText = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0)));
  const textToB64 = txt => {
    const bytes = new TextEncoder().encode(txt);
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };

  /* ---------- State ---------- */
  const state = { col: 'projects', data: { projects: [], achievements: [] }, sha: {}, head: '' };
  let editing = null; // { index, images: [{path}|{dataUrl,name}], original: [...] }

  /* ---------- UI helpers ---------- */
  const show = id => ['login', 'dash', 'editor'].forEach(s => { $('#' + s).hidden = s !== id; });
  const setStatus = (el, msg, kind = '') => { el.className = 'admin-status ' + kind; el.textContent = msg; };
  const imgUrl = path => /^(https?:|data:)/.test(path) ? path
    : `https://raw.githubusercontent.com/${OWNER}/${REPO}/${state.head || BRANCH}/${path}`;
  const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 48) || 'item';

  /* ---------- Sign in ---------- */
  async function signIn(t, remember) {
    token = t.trim();
    const repo = await gh('');
    if (!repo.permissions || !repo.permissions.push) throw new Error('This token can read the repo but cannot write to it. Give it “Contents: Read and write”.');
    store.set(token, remember);
    $('#sign-out').hidden = false;
    await loadAll();
    show('dash');
    renderList();
  }

  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#login-btn'); btn.disabled = true; btn.textContent = 'Signing in…';
    $('#login-error').textContent = '';
    try { await signIn($('#token').value, $('#remember').checked); $('#token').value = ''; }
    catch (err) {
      token = '';
      $('#login-error').textContent = err.status === 401 ? 'That token was not accepted. Check it was copied fully and has not expired.'
        : err.status === 404 ? 'This token has no access to the portfolio repository.' : err.message;
    }
    finally { btn.disabled = false; btn.textContent = 'Sign in'; }
  });
  $('#sign-out').addEventListener('click', () => { store.clear(); token = ''; $('#sign-out').hidden = true; show('login'); });

  /* ---------- Load ---------- */
  async function loadAll() {
    const ref = await gh(`/git/ref/heads/${BRANCH}`);
    state.head = ref.object.sha;
    for (const [col, cfg] of Object.entries(COLS)) {
      try {
        const f = await gh(`/contents/${cfg.file}?ref=${state.head}`);
        state.data[col] = JSON.parse(b64ToText(f.content));
        state.sha[col] = f.sha;
      } catch (err) {
        if (err.status !== 404) throw err;
        state.data[col] = []; state.sha[col] = null;
      }
    }
  }

  /* ---------- Commit (one commit for JSON + new images + deleted images) ---------- */
  async function commit({ col, message, uploads = [], deletes = [] }) {
    const cfg = COLS[col];
    // Conflict check: has the JSON changed on GitHub since we loaded it?
    const ref = await gh(`/git/ref/heads/${BRANCH}`);
    const head = ref.object.sha;
    if (head !== state.head) {
      let remoteSha = null;
      try { remoteSha = (await gh(`/contents/${cfg.file}?ref=${head}`)).sha; } catch (e) { if (e.status !== 404) throw e; }
      if (remoteSha !== state.sha[col]) {
        const err = new Error('This list was changed somewhere else since you opened it. Reload the page and try again.');
        err.conflict = true; throw err;
      }
    }
    const base = await gh(`/git/commits/${head}`);
    const tree = [];
    for (const u of uploads) {
      const blob = await gh('/git/blobs', { method: 'POST', body: { content: u.base64, encoding: 'base64' } });
      tree.push({ path: u.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    for (const p of deletes) tree.push({ path: p, mode: '100644', type: 'blob', sha: null });
    const json = JSON.stringify(state.data[col], null, 2) + '\n';
    const jblob = await gh('/git/blobs', { method: 'POST', body: { content: textToB64(json), encoding: 'base64' } });
    tree.push({ path: cfg.file, mode: '100644', type: 'blob', sha: jblob.sha });

    const newTree = await gh('/git/trees', { method: 'POST', body: { base_tree: base.tree.sha, tree } });
    const newCommit = await gh('/git/commits', { method: 'POST', body: { message, tree: newTree.sha, parents: [head] } });
    await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: { sha: newCommit.sha } });
    state.head = newCommit.sha;
    state.sha[col] = jblob.sha;
  }

  /* ---------- Collection tabs ---------- */
  const seg = $('.segmented');
  const thumb = $('.segmented-thumb', seg);
  const moveThumb = btn => { thumb.style.width = btn.offsetWidth + 'px'; thumb.style.transform = `translateX(${btn.offsetLeft - 4}px)`; };
  $$('button', seg).forEach(btn => btn.addEventListener('click', () => {
    $$('button', seg).forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    moveThumb(btn);
    state.col = btn.dataset.col;
    renderList();
  }));
  addEventListener('resize', () => moveThumb($('[aria-selected="true"]', seg)));

  /* ---------- List ---------- */
  function renderList() {
    requestAnimationFrame(() => moveThumb($('[aria-selected="true"]', seg)));
    const items = state.data[state.col];
    const noun = COLS[state.col].noun;
    $('#add-btn').textContent = `+ Add ${noun}`;
    const list = $('#list');
    if (!items.length) {
      list.innerHTML = `<li class="admin-empty">No ${noun}s yet. Click <b>+ Add ${noun}</b> to create the first one.</li>`;
      return;
    }
    list.innerHTML = items.map((it, i) => {
      const img = (it.images && it.images[0]) || it.image;
      const sub = state.col === 'projects'
        ? [it.type === 'collab' ? 'Collaboration' : 'My project', it.status, it.year, it.featured ? '★ Featured' : ''].filter(Boolean).join(' · ')
        : [it.type === 'award' ? 'Award' : 'Certificate', it.issuer, it.date].filter(Boolean).join(' · ');
      return `<li class="admin-item">
        <div class="admin-thumb" ${img ? `style="background-image:url('${esc(imgUrl(img))}')"` : ''}>${img ? '' : esc((it.title || '?')[0])}</div>
        <div><h3>${esc(it.title)}</h3><p>${esc(sub)}</p></div>
        <div class="admin-item-actions">
          <button class="icon-btn" data-act="up" data-i="${i}" aria-label="Move up" ${i ? '' : 'disabled'}>↑</button>
          <button class="icon-btn" data-act="down" data-i="${i}" aria-label="Move down" ${i < items.length - 1 ? '' : 'disabled'}>↓</button>
          <button class="btn btn-ghost btn-sm" data-act="edit" data-i="${i}">Edit</button>
        </div>
      </li>`;
    }).join('');
  }

  $('#list').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.dataset.i, items = state.data[state.col];
    if (b.dataset.act === 'edit') return openEditor(i);
    const j = b.dataset.act === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= items.length) return;
    const before = items.slice();
    [items[i], items[j]] = [items[j], items[i]];
    renderList();
    setStatus($('#status'), 'Saving new order…');
    try { await commit({ col: state.col, message: `Reorder ${state.col} (admin)` }); setStatus($('#status'), 'Order saved. Live in about a minute.', 'ok'); }
    catch (err) { state.data[state.col] = before; renderList(); setStatus($('#status'), err.message, 'err'); }
  });
  $('#add-btn').addEventListener('click', () => openEditor(-1));

  /* ---------- Editor ---------- */
  const F = {
    text: (name, label, val, attrs = '') => `<div class="field"><label for="e-${name}">${label}</label><input id="e-${name}" name="${name}" value="${esc(val)}" ${attrs}><p class="field-error"></p></div>`,
    area: (name, label, val, rows, hint = '') => `<div class="field"><label for="e-${name}">${label}</label><textarea id="e-${name}" name="${name}" rows="${rows}">${esc(val)}</textarea>${hint ? `<p class="hint">${hint}</p>` : ''}</div>`,
    select: (name, label, val, opts) => `<div class="field"><label for="e-${name}">${label}</label><select id="e-${name}" name="${name}">${opts.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`,
  };

  function fieldsFor(col, it) {
    if (col === 'projects') return `
      ${F.text('title', 'Title *', it.title, 'required')}
      <div class="field-row-3">
        ${F.select('type', 'Kind', it.type || 'own', [['own', 'My project'], ['collab', 'Collaboration']])}
        ${F.select('status', 'Status', it.status || 'Active', [['Active', 'Active'], ['In progress', 'In progress'], ['Complete', 'Complete']])}
        ${F.text('year', 'Year', it.year, 'placeholder="2026"')}
      </div>
      ${F.text('partner', 'Partner / organisation', it.partner, 'placeholder="For collaborations"')}
      ${F.area('summary', 'Short summary *', it.summary, 2, 'Shown on the card. One or two sentences.')}
      ${F.area('description', 'Full description', it.description, 7, 'Shown when someone opens the project. Leave a blank line between paragraphs.')}
      ${F.text('role', 'My role', it.role, 'placeholder="e.g. Lead engineer: PCB, firmware and enclosure"')}
      ${F.text('tags', 'Tags', (it.tags || []).join(', '), 'placeholder="ESP32, KiCad, Edge AI"')}
      ${linksField(it.links || [])}
      ${imagesField(true)}
      <label class="check"><input type="checkbox" name="featured" ${it.featured ? 'checked' : ''}> Feature this project (large card)</label>`;
    return `
      ${F.text('title', 'Title *', it.title, 'required')}
      <div class="field-row-3">
        ${F.select('type', 'Kind', it.type || 'award', [['award', 'Award'], ['certificate', 'Certificate']])}
        ${F.text('issuer', 'Issued by', it.issuer, 'placeholder="Organisation"')}
        ${F.text('date', 'Date', it.date, 'type="month"')}
      </div>
      ${F.area('summary', 'Short summary', it.summary, 2, 'Shown on the card.')}
      ${F.area('description', 'Full description', it.description, 5, 'Shown when someone opens it.')}
      ${F.text('url', 'Credential / news link', it.url, 'type="url" placeholder="https://"')}
      ${certField()}`;
  }
  const linkRow = (l = {}) => `<div class="link-row"><input placeholder="Label (e.g. GitHub)" value="${esc(l.label)}" data-k="label"><input type="url" placeholder="https://" value="${esc(l.url)}" data-k="url"><button type="button" class="icon-btn" data-rm-link aria-label="Remove link">✕</button></div>`;
  const linksField = links => `<div class="field"><label>Links</label><div class="links-editor" id="links">${links.map(linkRow).join('')}</div><button type="button" class="btn btn-ghost btn-sm" id="add-link" style="justify-self:start">+ Add link</button></div>`;
  const certField = () => `<div class="field"><label>Certificate (view only)</label><div class="img-grid" id="imgs"></div><p class="hint">Drop the certificate <b>PDF</b> (up to ${MAX_PDF_MB} MB). Each page is turned into a view-only picture stamped with your name as a watermark; <b>the PDF itself is never uploaded</b>, so visitors can view it but get no file to download. You can also add photos or screenshots.</p></div>`;
  const imagesField = multi => `<div class="field"><label>${multi ? 'Pictures' : 'Picture of the award / certificate'}</label><div class="img-grid" id="imgs"></div><p class="hint">${multi ? 'The first picture is the cover. ' : ''}Images are resized to ${MAX_IMG}px and uploaded when you save.</p></div>`;

  function renderImages() {
    const multi = COLS[state.col].multiImage;
    const tiles = editing.images.map((im, i) => `
      <div class="img-tile${im.dataUrl ? ' pending' : ''}">
        <img src="${esc(im.dataUrl || imgUrl(im.path))}" alt="">
        ${multi && i === 0 ? `<span class="cover">${COLS[state.col].acceptPdf ? 'Page 1 · Cover' : 'Cover'}</span>` : ''}
        <div class="tile-actions">
          ${multi && i > 0 ? `<button type="button" data-img="cover" data-i="${i}" aria-label="Make cover">★</button>` : '<span></span>'}
          <button type="button" data-img="rm" data-i="${i}" aria-label="Remove picture">✕</button>
        </div>
      </div>`).join('');
    const cfg = COLS[state.col];
    const accept = cfg.acceptPdf ? 'image/*,application/pdf,.pdf' : 'image/*';
    const what = cfg.acceptPdf ? 'PDF or pictures' : 'pictures';
    $('#imgs').innerHTML = tiles + `<label class="img-add" id="img-add">+ Add ${what}<br>or drop here<input type="file" accept="${accept}" multiple></label>`;
  }

  function openEditor(index) {
    const col = state.col, isNew = index < 0;
    const it = isNew ? {} : state.data[col][index];
    const imgs = it.images || (it.image ? [it.image] : []);
    editing = { index, images: imgs.map(path => ({ path })), original: imgs.slice(), originalPdf: it.file || '' };
    $('#editor-title').textContent = `${isNew ? 'New' : 'Edit'} ${COLS[col].noun}`;
    $('#fields').innerHTML = fieldsFor(col, it);
    $('#delete-btn').hidden = isNew;
    setStatus($('#edit-status'), '');
    renderImages();
    show('editor');
    scrollTo({ top: 0, behavior: 'smooth' });
    $('#e-title').focus({ preventScroll: true });
  }
  $('#cancel-btn').addEventListener('click', () => { editing = null; show('dash'); renderList(); });

  // Links & images (event delegation)
  $('#fields').addEventListener('click', e => {
    if (e.target.id === 'add-link') { $('#links').insertAdjacentHTML('beforeend', linkRow()); $('#links .link-row:last-child input').focus(); }
    if (e.target.closest('[data-rm-link]')) e.target.closest('.link-row').remove();
    const ib = e.target.closest('[data-img]');
    if (ib) {
      const i = +ib.dataset.i;
      if (ib.dataset.img === 'rm') editing.images.splice(i, 1);
      else editing.images.unshift(editing.images.splice(i, 1)[0]);
      renderImages();
    }
  });
  $('#fields').addEventListener('change', e => { if (e.target.type === 'file') addFiles(e.target.files); });
  ['dragover', 'dragleave', 'drop'].forEach(ev => $('#fields').addEventListener(ev, e => {
    const zone = e.target.closest('#img-add'); if (!zone) return;
    e.preventDefault();
    zone.classList.toggle('drag', ev === 'dragover');
    if (ev === 'drop') addFiles(e.dataTransfer.files);
  }));

  const isPdf = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
  async function addFiles(files) {
    const multi = COLS[state.col].multiImage;
    if (COLS[state.col].acceptPdf) {
      for (const pdf of [...files].filter(isPdf)) await addPdf(pdf);
    }
    for (const file of [...files].filter(f => f.type.startsWith('image/'))) {
      try {
        editing.images.push({ dataUrl: await resize(file, !!COLS[state.col].acceptPdf), name: file.name });
        if (!multi) break;
      } catch (err) { setStatus($('#edit-status'), `Couldn't read ${file.name}.`, 'err'); }
    }
    renderImages();
  }
  // Certificate PDFs: convert pages to view-only pictures. The PDF itself is never uploaded.
  async function addPdf(file) {
    const st = $('#edit-status');
    if (file.size > MAX_PDF_MB * 1024 * 1024) { setStatus(st, `${file.name} is larger than ${MAX_PDF_MB} MB. Please compress it first.`, 'err'); return; }
    setStatus(st, `Converting ${file.name} to view-only pages…`);
    const saveBtn = $('#save-btn'); saveBtn.disabled = true; // don't publish half-processed files
    try {
      const { pages, total } = await pdfPages(file);
      pages.forEach((dataUrl, i) => editing.images.push({ dataUrl, name: `${file.name} p${i + 1}.jpg` }));
      const more = total > pages.length ? ` (first ${pages.length} of ${total} pages)` : '';
      setStatus(st, `Converted ${pages.length} page${pages.length > 1 ? 's' : ''}${more} to view-only pictures. Click Save & publish.`, 'ok');
    } catch (e) {
      setStatus(st, `Couldn't convert ${file.name}. Try a screenshot of the certificate instead.`, 'err');
    } finally { saveBtn.disabled = false; }
    renderImages();
  }
  let pdfjsReady = null;
  function loadPdfJs() {
    if (!pdfjsReady) pdfjsReady = new Promise((resolve, reject) => {
      const sc = document.createElement('script');
      sc.src = 'js/vendor/pdfjs/pdf.min.js';
      sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdfjs/pdf.worker.min.js'; resolve(window.pdfjsLib); };
      sc.onerror = () => { pdfjsReady = null; reject(new Error('PDF tools failed to load')); };
      document.head.appendChild(sc);
    });
    return pdfjsReady;
  }
  async function pdfPages(file) {
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = [];
    const n = Math.min(doc.numPages, MAX_PDF_PAGES);
    for (let i = 1; i <= n; i++) {
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(3, MAX_IMG / Math.max(base.width, base.height)) });
      const c = document.createElement('canvas');
      c.width = Math.round(viewport.width); c.height = Math.round(viewport.height);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      watermark(ctx, c.width, c.height);
      pages.push(c.toDataURL('image/jpeg', JPEG_Q));
    }
    const total = doc.numPages;
    doc.destroy();
    return { pages, total };
  }
  // Watermark baked into certificate pictures: a light diagonal pattern plus a clear label.
  // It is part of the image itself, so screenshots and copies carry it too.
  function watermark(ctx, w, h) {
    const size = Math.max(14, Math.round(Math.min(w, h) / 28));
    ctx.save();
    // 1) Diagonal repeating text, light enough to keep the certificate readable
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = `600 ${size}px Inter, "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const diag = Math.hypot(w, h);
    const stepY = size * 7, text = WATERMARK + '     ';
    const stepX = ctx.measureText(text).width;
    for (let y = -diag / 2, row = 0; y < diag / 2; y += stepY, row++) {
      for (let x = -diag / 2 - (row % 2) * stepX / 2; x < diag / 2 + stepX; x += stepX) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'; ctx.fillText(text, x, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'; ctx.fillText(text, x + 1, y + 1); // visible on dark areas too
      }
    }
    ctx.restore();
    // 2) Solid label in the bottom-right corner
    ctx.save();
    const fs = Math.max(12, Math.round(size * 0.8)), pad = Math.round(fs * 0.7);
    ctx.font = `700 ${fs}px Inter, "Segoe UI", Arial, sans-serif`;
    const label = `${WATERMARK} · ${WATERMARK_SITE}`;
    const tw = ctx.measureText(label).width;
    const bw = Math.min(w - pad * 2, tw + pad * 2), bh = fs + pad * 1.4;
    const bx = w - bw - pad, by = h - bh - pad;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    ctx.fillText(label, bx + bw - pad, by + bh / 2, bw - pad * 2);
    ctx.restore();
  }
  function resize(file, stamp = false) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, MAX_IMG / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        if (stamp) watermark(ctx, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', JPEG_Q));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Validation
  const require = (name, msg) => {
    const el = $(`[name="${name}"]`, $('#fields'));
    const ok = el.value.trim().length > 0;
    el.setAttribute('aria-invalid', String(!ok));
    const err = el.parentElement.querySelector('.field-error');
    if (err) err.textContent = ok ? '' : msg;
    return ok ? null : el;
  };

  $('#edit-form').addEventListener('submit', async e => {
    e.preventDefault();
    const col = state.col, cfg = COLS[col];
    const bad = [require('title', 'Please add a title.'), col === 'projects' ? require('summary', 'Please add a short summary.') : null].filter(Boolean);
    if (bad.length) { bad[0].focus(); setStatus($('#edit-status'), 'Please fill in the required fields.', 'err'); return; }

    const v = n => ($(`[name="${n}"]`, $('#fields'))?.value || '').trim();
    const items = state.data[col];
    const prev = editing.index >= 0 ? items[editing.index] : {};
    let id = prev.id || slug(v('title'));
    if (!prev.id) { let n = 2; const base = id; while (items.some(x => x.id === id)) id = `${base}-${n++}`; }

    // Upload new pictures, keep existing ones, delete removed ones
    const uploads = [], paths = [];
    editing.images.forEach((im, i) => {
      if (im.path) { paths.push(im.path); return; }
      const path = `${cfg.dir}/${id}-${Date.now().toString(36)}-${i}.jpg`;
      uploads.push({ path, base64: im.dataUrl.split(',')[1] });
      paths.push(path);
    });
    const deletes = editing.original.filter(p => !paths.includes(p) && p.startsWith(cfg.dir + '/'));
    // View-only: PDFs are never published; remove any file left from an older version
    if (editing.originalPdf && editing.originalPdf.startsWith(cfg.dir + '/')) deletes.push(editing.originalPdf);

    let item;
    if (col === 'projects') {
      item = {
        id, title: v('title'), type: v('type'), status: v('status'), year: v('year'), partner: v('partner'),
        summary: v('summary'), description: v('description'), role: v('role'),
        images: paths,
        tags: v('tags').split(',').map(s => s.trim()).filter(Boolean),
        links: $$('#links .link-row').map(r => ({ label: $('[data-k="label"]', r).value.trim(), url: $('[data-k="url"]', r).value.trim() })).filter(l => l.url).map(l => ({ label: l.label || 'Link', url: l.url })),
        featured: $('[name="featured"]', $('#fields')).checked,
      };
    } else {
      item = {
        id, title: v('title'), type: v('type'), issuer: v('issuer'), date: v('date'),
        summary: v('summary'), description: v('description'), url: v('url'), images: paths, image: paths[0] || '',
      };
    }

    const before = items.slice();
    if (editing.index >= 0) items[editing.index] = item; else items.push(item);

    const btn = $('#save-btn'); btn.disabled = true; btn.textContent = 'Publishing…';
    setStatus($('#edit-status'), uploads.length ? `Uploading ${uploads.length} picture${uploads.length > 1 ? 's' : ''} and saving…` : 'Saving…');
    try {
      await commit({ col, message: `${editing.index >= 0 ? 'Update' : 'Add'} ${cfg.noun}: ${item.title} (admin)`, uploads, deletes });
      editing = null;
      show('dash'); renderList();
      setStatus($('#status'), `Saved “${item.title}”. It will be live on the site in about a minute.`, 'ok');
    } catch (err) {
      state.data[col] = before;
      setStatus($('#edit-status'), err.message, 'err');
    } finally { btn.disabled = false; btn.textContent = 'Save & publish'; }
  });

  $('#delete-btn').addEventListener('click', async () => {
    const col = state.col, cfg = COLS[col], items = state.data[col];
    const it = items[editing.index];
    if (!confirm(`Delete “${it.title}” from your portfolio? This removes it and its files from the site.`)) return;
    const before = items.slice();
    items.splice(editing.index, 1);
    const deletes = editing.original.filter(p => p.startsWith(cfg.dir + '/'));
    if (editing.originalPdf && editing.originalPdf.startsWith(cfg.dir + '/')) deletes.push(editing.originalPdf);
    setStatus($('#edit-status'), 'Deleting…');
    try {
      await commit({ col, message: `Remove ${cfg.noun}: ${it.title} (admin)`, deletes });
      editing = null; show('dash'); renderList();
      setStatus($('#status'), `Deleted “${it.title}”. Git history keeps a copy if you need it back.`, 'ok');
    } catch (err) { state.data[col] = before; setStatus($('#edit-status'), err.message, 'err'); }
  });

  /* ---------- Boot ---------- */
  const saved = store.get();
  if (saved) {
    signIn(saved, (() => { try { return !!localStorage.getItem('gh_token'); } catch (e) { return false; } })())
      .catch(() => { store.clear(); token = ''; show('login'); });
  } else show('login');
})();
