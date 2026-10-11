/* Aditya Talekar — portfolio interactions. No dependencies. */
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = document.body.dataset.base || '';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Theme ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = () => root.dataset.theme || (systemDark() ? 'dark' : 'light');
  function setTheme(t) {
    root.dataset.theme = t;
    store.set('theme', t);
    document.dispatchEvent(new CustomEvent('themechange'));
  }
  function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));

  /* ---------- Toast ---------- */
  const toast = $('.toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------- Copy email ---------- */
  const EMAIL = 'aditya.a.talekar@gmail.com';
  async function copyEmail() {
    try { await navigator.clipboard.writeText(EMAIL); showToast('Email copied to clipboard'); }
    catch { window.location.href = 'mailto:' + EMAIL; }
  }
  $$('[data-copy-email]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); copyEmail(); }));

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  const toTop = $('.to-top');
  const onScroll = () => { nav && nav.classList.toggle('scrolled', window.scrollY > 8); toTop && toTop.classList.toggle('show', window.scrollY > 600); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const menuBtn = $('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Highlight the nav link for the section in view (home page)
  const navLinks = $$('.nav-links a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = map.get(en.target.id);
        if (a && en.isIntersecting) {
          navLinks.forEach(l => l.removeAttribute('aria-current'));
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(el => ro.observe(el));
  }

  /* ---------- Card spotlight ---------- */
  $$('.work-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const fmt = (n, dec) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const run = el => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduceMotion) { el.textContent = fmt(target, dec); return; }
      const t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = Math.max(0, Math.min(1, (t - t0) / dur));
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * eased, dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
      }, { threshold: 0.4 });
      counters.forEach(el => co.observe(el));
    } else counters.forEach(run);
  }

  /* ---------- Case study: progress bar + TOC ---------- */
  const progress = $('.progress');
  if (progress) {
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
  }
  const tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const to = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const a = byId.get(en.target.id);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) to.observe(s); });
  }

  /* ---------- Lightbox ---------- */
  const zoomables = $$('.figure img, [data-zoom]');
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Enlarged image');
    lb.innerHTML = '<img alt="">';
    document.body.appendChild(lb);
    const lbImg = $('img', lb);
    let lastFocus = null;
    const close = () => { lb.classList.remove('open'); if (lastFocus) lastFocus.focus(); };
    zoomables.forEach(img => {
      img.tabIndex = 0;
      const open = () => { lastFocus = img; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.classList.add('open'); lb.focus(); };
      img.addEventListener('click', open);
      img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    lb.tabIndex = -1;
    lb.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* ---------- Command palette ---------- */
  const COMMANDS = [
    { group: 'Navigate', label: 'Home', hint: 'Top of page', href: base + 'index.html' },
    { group: 'Navigate', label: 'Work experience', hint: 'Four roles, newest first', href: base + 'index.html#experience' },
    { group: 'Navigate', label: 'Education', hint: 'MSc, BE, publication, certifications', href: base + 'index.html#education' },
    { group: 'Navigate', label: 'Selected work', hint: 'Case studies', href: base + 'index.html#work' },
    { group: 'Navigate', label: 'Teaching & industry outreach', hint: 'Assistant Professor role', href: base + 'index.html#role-professor' },
    { group: 'Navigate', label: 'Lab', hint: 'More projects', href: base + 'index.html#lab' },
    { group: 'Navigate', label: 'Skills', hint: 'Stack', href: base + 'index.html#skills' },
    { group: 'Navigate', label: 'Contact', hint: 'Get in touch', href: base + 'index.html#contact' },
    { group: 'Case studies', label: 'Wave Engine', hint: 'Multi-agent coding assistant', href: base + 'work/wave-engine.html' },
    { group: 'Case studies', label: 'Guardian', hint: 'Attack-surface intelligence', href: base + 'work/guardian.html' },
    { group: 'Case studies', label: 'Agentic automation for a research firm', hint: 'Freelance · Exactitude', href: base + 'work/exactitude.html' },
    { group: 'Case studies', label: 'Exactitude — technical deep dive', hint: '8 case studies', href: base + 'work/exactitude-deep-dive.html' },
    { group: 'Case studies', label: 'NexusRAG', hint: 'Hybrid retrieval platform', href: base + 'work/nexusrag.html' },
    { group: 'Case studies', label: 'EnergyNexus', hint: 'MSc dissertation · forecasting', href: base + 'work/energynexus.html' },
    { group: 'Actions', label: 'Copy email address', hint: EMAIL, action: copyEmail },
    { group: 'Actions', label: 'Toggle light / dark theme', hint: 'T', action: toggleTheme },
    { group: 'Actions', label: 'Preview résumé', hint: 'Opens on this page', action: () => openResume() },
    { group: 'Actions', label: 'Download résumé (PDF)', hint: 'Sep 2026', href: base + 'assets/docs/Aditya_Talekar_Resume.pdf', external: true },
    { group: 'Actions', label: 'Preview MSc dissertation', hint: 'Opens on this page', action: () => openDoc('thesis') },
    { group: 'Actions', label: 'Read the MSc dissertation (PDF)', hint: 'EnergyNexus', href: base + 'assets/docs/Aditya_Talekar_MSc_Dissertation.pdf', external: true },
    { group: 'Links', label: 'Research paper — smart solid-waste management (IJAER 2021)', hint: 'ijaer.com', href: 'https://ijaer.com/admin/upload/07%20Pratik%20Murke%2001144.pdf', external: true },
    { group: 'Actions', label: 'Call or WhatsApp', hint: '+91 96739 04714', href: 'tel:+919673904714' },
    { group: 'Links', label: 'LinkedIn', hint: 'in/aditya-talekar', href: 'https://www.linkedin.com/in/aditya-talekar-48731532a/', external: true },
    { group: 'Links', label: 'GitHub', hint: 'github.com/ADITYATALEKAR', href: 'https://github.com/ADITYATALEKAR', external: true },
    { group: 'Links', label: 'Exactitude Consultancy (client site)', hint: 'exactitudeconsultancy.com', href: 'https://exactitudeconsultancy.com/', external: true },
    { group: 'Links', label: 'Medium', hint: '@aditya.a.talekar', href: 'https://medium.com/@aditya.a.talekar', external: true },
    { group: 'Links', label: 'Wave Engine on VS Code Marketplace', hint: 'Install', href: 'https://marketplace.visualstudio.com/items?itemName=FundamentalLabs.mas-agent', external: true },
  ];
  const cmdk = $('.cmdk');
  if (cmdk) {
    const input = $('input', cmdk);
    const list = $('.cmdk-list', cmdk);
    let items = [], sel = 0, lastFocus = null;

    const render = q => {
      const query = q.trim().toLowerCase();
      items = COMMANDS.filter(c => !query || (c.label + ' ' + c.hint + ' ' + c.group).toLowerCase().includes(query));
      sel = 0;
      if (!items.length) { list.innerHTML = '<li class="cmdk-empty">No results</li>'; return; }
      let html = '', g = '';
      items.forEach((c, i) => {
        if (c.group !== g) { g = c.group; html += `<li class="cmdk-group" role="presentation">${g}</li>`; }
        html += `<li class="cmdk-item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === 0}"><span>${c.label}</span><span class="hint">${c.hint}</span></li>`;
      });
      list.innerHTML = html;
      input.setAttribute('aria-activedescendant', 'cmdk-0');
    };
    const highlight = () => {
      $$('.cmdk-item', list).forEach(el => el.setAttribute('aria-selected', String(+el.dataset.i === sel)));
      const el = $(`#cmdk-${sel}`, list);
      if (el) { el.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', el.id); }
    };
    const exec = c => {
      if (!c) return;
      close();
      if (c.action) c.action();
      else if (c.external) window.open(c.href, '_blank', 'noopener');
      else window.location.href = c.href;
    };
    const open = () => {
      lastFocus = document.activeElement;
      cmdk.classList.add('open');
      input.value = '';
      render('');
      requestAnimationFrame(() => input.focus());
    };
    const close = () => { cmdk.classList.remove('open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); };

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); exec(items[sel]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    list.addEventListener('click', e => { const li = e.target.closest('.cmdk-item'); if (li) exec(items[+li.dataset.i]); });
    list.addEventListener('pointermove', e => { const li = e.target.closest('.cmdk-item'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; highlight(); } });
    cmdk.addEventListener('click', e => { if (e.target === cmdk) close(); });
    $$('[data-cmdk]').forEach(b => b.addEventListener('click', open));

    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.contains('open') ? close() : open(); }
      else if (!typing && e.key === '/' && !cmdk.classList.contains('open')) { e.preventDefault(); open(); }
      else if (!typing && e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey && !cmdk.classList.contains('open')) toggleTheme();
    });
  }
  // Show the right shortcut glyph
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('[data-mod]').forEach(k => { k.textContent = isMac ? '⌘' : 'Ctrl'; });

  /* ---------- Screenshot carousels ---------- */
  const ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  $$('[data-carousel]').forEach(car => {
    const track = $('.carousel-track', car);
    const slides = $$('.slide', track);
    if (!slides.length) return;
    car.setAttribute('role', 'region');
    car.setAttribute('aria-roledescription', 'carousel');
    const ui = document.createElement('div');
    ui.className = 'car-ui';
    ui.innerHTML = `<button class="car-btn" data-dir="-1" aria-label="Previous screenshot">${ICON_PREV}</button><span class="car-count" aria-live="polite"></span><button class="car-btn" data-dir="1" aria-label="Next screenshot">${ICON_NEXT}</button>`;
    const dots = document.createElement('div');
    dots.className = 'car-dots';
    dots.innerHTML = slides.map((_, i) => `<button aria-label="Screenshot ${i + 1}"></button>`).join('');
    car.append(ui, dots);
    const [prev, next] = $$('.car-btn', ui);
    const count = $('.car-count', ui);
    const dotBtns = $$('button', dots);
    let idx = 0;
    const update = () => {
      prev.disabled = idx === 0;
      next.disabled = idx === slides.length - 1;
      count.textContent = `${idx + 1} / ${slides.length}`;
      dotBtns.forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
    };
    const go = i => {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[idx].offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      update();
    };
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    dotBtns.forEach((d, i) => d.addEventListener('click', () => go(i)));
    car.tabIndex = 0;
    car.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });
    let t;
    track.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== idx) { idx = i; update(); }
      }, 80);
    }, { passive: true });
    if (slides.length < 2) { ui.hidden = true; dots.hidden = true; }
    update();
  });

  /* ---------- Read-more panels ---------- */
  $$('[data-more]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    const label = $('.lbl', btn);
    const closed = label ? label.textContent : '';
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (label) label.textContent = open ? 'Show less' : closed;
      if (!open) btn.closest('.role')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Tabs ---------- */
  $$('[role="tablist"]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    const select = tab => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(n); n.focus();
      });
    });
  });

  /* ---------- Document preview (résumé, dissertation) ---------- */
  const DOCS = {
    resume: { title: 'Aditya Talekar — Résumé', sub: 'AI Engineer · Agentic AI & MLOps · 2 pages', pdf: base + 'assets/docs/Aditya_Talekar_Resume.pdf', file: 'Aditya_Talekar_Resume.pdf', pages: 2, img: i => `${base}assets/img/resume-p${i}.webp`, w: 1406, h: 1988, alt: i => `Résumé page ${i}` },
    thesis: { title: 'MSc Dissertation — EnergyNexus', sub: 'A Comprehensive Study of LSTM-Based Energy Demand, Energy Price, and Wind Energy Generation Prediction · QMUL 2025 · 9 pages', pdf: base + 'assets/docs/Aditya_Talekar_MSc_Dissertation.pdf', file: 'Aditya_Talekar_MSc_Dissertation.pdf', pages: 9, img: i => `${base}assets/img/thesis-p${i}.webp`, w: 1020, h: 1320, alt: i => `Dissertation page ${i}` },
  };
  const dlgs = {};
  function openDoc(key) {
    const d = DOCS[key];
    if (!d) return;
    if (!dlgs[key]) {
      const dlg = document.createElement('dialog');
      dlg.className = 'resume-dialog';
      dlg.setAttribute('aria-label', d.title + ' preview');
      const pages = Array.from({ length: d.pages }, (_, i) => `<img src="${d.img(i + 1)}" alt="${d.alt(i + 1)}" width="${d.w}" height="${d.h}"${i ? ' loading="lazy"' : ''}>`).join('');
      dlg.innerHTML = `
        <div class="rd-head">
          <div><b>${d.title}</b><span class="muted">${d.sub}</span></div>
          <div class="rd-actions">
            <a class="btn btn-primary btn-sm" href="${d.pdf}" download="${d.file}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg><span class="lbl">Download PDF</span></a>
            <a class="btn btn-ghost btn-sm" href="${d.pdf}" target="_blank" rel="noopener"><span class="lbl">Open in new tab</span> ↗</a>
            <button class="icon-btn" data-close aria-label="Close preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
          </div>
        </div>
        <div class="rd-body">${pages}</div>`;
      document.body.appendChild(dlg);
      $('[data-close]', dlg).addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlgs[key] = dlg;
    }
    const dlg = dlgs[key];
    if (typeof dlg.showModal === 'function') { dlg.showModal(); $('.rd-body', dlg).scrollTop = 0; }
    else window.open(d.pdf, '_blank', 'noopener');
  }
  const openResume = () => openDoc('resume');
  $$('[data-resume]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openDoc('resume'); }));
  $$('[data-doc]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openDoc(b.dataset.doc); }));

  /* ---------- Grouped bar charts (data in data-chart JSON) ---------- */
  $$('.chart[data-chart]').forEach(renderBarChart);

  function renderBarChart(fig) {
    const cfg = JSON.parse(fig.dataset.chart);
    const { categories, series, unit = '', max = 100, ref } = cfg;
    const W = 640, H = 300, m = { t: 16, r: 8, b: 34, l: 40 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const y = v => m.t + ih - (v / max) * ih;
    const groupW = iw / categories.length;
    const barW = Math.min(46, (groupW * 0.62) / series.length);
    const gap = 2;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.title || 'Bar chart'}">`;
    svg += '<g class="grid axis">';
    for (let v = 0; v <= max; v += max / 4) {
      svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>`;
      svg += `<text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}${unit}</text>`;
    }
    svg += '</g>';
    if (ref) {
      svg += `<g class="ref"><line x1="${m.l}" x2="${W - m.r}" y1="${y(ref.value)}" y2="${y(ref.value)}"/><text x="${W - m.r}" y="${y(ref.value) - 6}" text-anchor="end">${ref.label}</text></g>`;
    }
    const bars = [];
    categories.forEach((c, ci) => {
      const gx = m.l + ci * groupW + groupW / 2 - (series.length * barW + (series.length - 1) * gap) / 2;
      series.forEach((s, si) => {
        const v = s.values[ci];
        if (v == null) return;
        const x = gx + si * (barW + gap), top = y(v), h = m.t + ih - top, r = Math.min(4, h);
        const d = `M${x},${m.t + ih}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW - r}Q${x + barW},${top} ${x + barW},${top + r}V${m.t + ih}Z`;
        bars.push({ ci, si, v, cx: x + barW / 2, top });
        svg += `<path class="bar" data-b="${bars.length - 1}" d="${d}" fill="var(--chart-${si + 1})"/>`;
      });
      svg += `<g class="axis"><text x="${m.l + ci * groupW + groupW / 2}" y="${H - 10}" text-anchor="middle">${c}</text></g>`;
    });
    svg += `<line class="baseline" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}"/>`;
    bars.forEach((b, i) => {
      svg += `<rect class="hit" data-b="${i}" x="${b.cx - barW / 2 - 4}" y="${m.t}" width="${barW + 8}" height="${ih}"/>`;
    });
    svg += '</svg>';
    const legend = series.map((s, si) => `<span><i style="background:var(--chart-${si + 1})"></i>${s.name}</span>`).join('');
    const rows = categories.map((c, ci) => `<tr><td>${c}</td>${series.map(s => `<td>${s.values[ci] ?? '—'}${s.values[ci] != null ? unit : ''}</td>`).join('')}</tr>`).join('');
    fig.innerHTML = `
      <div class="chart-head"><div><div class="chart-title">${cfg.title || ''}</div><div class="chart-sub">${cfg.subtitle || ''}</div></div><div class="chart-legend">${legend}</div></div>
      <div class="chart-plot" style="position:relative">${svg}<div class="chart-tip" role="presentation"></div></div>
      <details><summary>View as table</summary><table><thead><tr><th>${cfg.xLabel || ''}</th>${series.map(s => `<th>${s.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></details>`;
    const plot = $('.chart-plot', fig), tip = $('.chart-tip', fig), svgEl = $('svg', fig);
    const paths = $$('.bar', fig);
    const show = i => {
      const b = bars[i];
      paths.forEach(p => p.classList.toggle('on', +p.dataset.b === i));
      const scale = svgEl.getBoundingClientRect().width / W;
      tip.innerHTML = `${series[b.si].name} · ${categories[b.ci]} <b>${b.v}${unit}</b>`;
      tip.style.left = `${b.cx * scale}px`;
      tip.style.top = `${b.top * scale}px`;
      tip.classList.add('show');
    };
    const hide = () => { tip.classList.remove('show'); paths.forEach(p => p.classList.remove('on')); };
    $$('.hit', fig).forEach(h => {
      h.addEventListener('pointerenter', () => show(+h.dataset.b));
      h.addEventListener('pointerleave', hide);
    });
    plot.addEventListener('pointerleave', hide);
  }

  /* ---------- Hero: live agent-orchestration canvas ---------- */
  const canvas = $('#agents');
  if (canvas) heroCanvas(canvas);

  function heroCanvas(cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, nodes = [], packets = [], raf = 0, running = false, t0 = performance.now();
    let colors = {};
    const readColors = () => {
      const cs = getComputedStyle(root);
      colors = {
        ink: cs.getPropertyValue('--ink').trim(),
        muted: cs.getPropertyValue('--faint').trim(),
        line: cs.getPropertyValue('--line-strong').trim(),
        accent: cs.getPropertyValue('--accent').trim(),
        signal: cs.getPropertyValue('--signal').trim(),
        violet: cs.getPropertyValue('--violet').trim(),
        bg: cs.getPropertyValue('--bg-elev').trim(),
      };
    };
    const rings = [
      { r: 0.20, n: 6, speed: 0.06, kind: 'core' },
      { r: 0.33, n: 12, speed: -0.035, kind: 'agent' },
      { r: 0.44, n: 18, speed: 0.022, kind: 'agent' },
    ];
    const build = () => {
      nodes = [{ ring: -1, a: 0, kind: 'orchestrator' }];
      rings.forEach((ring, ri) => {
        for (let i = 0; i < ring.n; i++) nodes.push({ ring: ri, a: (i / ring.n) * Math.PI * 2 + ri * 0.3, kind: ring.kind, glow: 0, ok: 0 });
      });
    };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(performance.now());
    };
    const pos = (n, t) => {
      if (n.kind === 'orchestrator') return [W / 2, H / 2];
      const ring = rings[n.ring];
      const s = Math.min(W, H);
      const ang = n.a + (reduceMotion ? 0 : (t / 1000) * ring.speed);
      return [W / 2 + Math.cos(ang) * ring.r * s, H / 2 + Math.sin(ang) * ring.r * s * 0.92];
    };
    const spawn = () => {
      const target = 1 + Math.floor(Math.random() * (nodes.length - 1));
      packets.push({ to: target, p: 0, phase: 'out', speed: 0.5 + Math.random() * 0.5 });
    };
    const draw = now => {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);
      const c = pos(nodes[0], t);
      // ring guides
      ctx.lineWidth = 1;
      rings.forEach(ring => {
        const s = Math.min(W, H);
        ctx.beginPath();
        ctx.ellipse(W / 2, H / 2, ring.r * s, ring.r * s * 0.92, 0, 0, Math.PI * 2);
        ctx.strokeStyle = colors.line; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 6]); ctx.stroke();
      });
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      // spokes to core ring
      nodes.forEach(n => {
        if (n.kind !== 'core') return;
        const p = pos(n, t);
        ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = colors.line; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1;
      });
      // packets
      packets.forEach(pk => {
        const target = pos(nodes[pk.to], t);
        const [ax, ay] = pk.phase === 'out' ? c : target;
        const [bx, by] = pk.phase === 'out' ? target : c;
        const x = ax + (bx - ax) * pk.p, y = ay + (by - ay) * pk.p;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x, y);
        ctx.strokeStyle = pk.phase === 'out' ? colors.accent : colors.signal;
        ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = pk.phase === 'out' ? colors.accent : colors.signal; ctx.fill();
      });
      // nodes
      nodes.forEach(n => {
        const [x, y] = pos(n, t);
        if (n.kind === 'orchestrator') {
          const pulse = reduceMotion ? 0 : (Math.sin(t / 600) + 1) / 2;
          ctx.beginPath(); ctx.arc(x, y, 22 + pulse * 6, 0, Math.PI * 2);
          ctx.fillStyle = colors.accent; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fillStyle = colors.ink; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fillStyle = colors.accent; ctx.fill();
          return;
        }
        const r = n.kind === 'core' ? 5.5 : 3.6;
        if (n.glow > 0.01) {
          ctx.beginPath(); ctx.arc(x, y, r + 8 * n.glow, 0, Math.PI * 2);
          ctx.fillStyle = n.ok ? colors.signal : colors.accent; ctx.globalAlpha = 0.25 * n.glow; ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors.bg; ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = n.glow > 0.05 ? (n.ok ? colors.signal : colors.accent) : (n.kind === 'core' ? colors.ink : colors.muted);
        ctx.stroke();
        n.glow *= 0.965;
      });
    };
    let last = performance.now(), spawnAcc = 0;
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      spawnAcc += dt;
      if (spawnAcc > 0.22 && packets.length < 14) { spawnAcc = 0; spawn(); }
      packets.forEach(pk => {
        pk.p += dt * pk.speed * 1.4;
        if (pk.p >= 1) {
          if (pk.phase === 'out') { pk.phase = 'back'; pk.p = 0; nodes[pk.to].glow = 1; nodes[pk.to].ok = 0; }
          else { pk.done = true; nodes[pk.to].glow = 1; nodes[pk.to].ok = 1; }
        }
      });
      packets = packets.filter(p => !p.done);
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (running || reduceMotion) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    readColors(); build(); resize();
    window.addEventListener('resize', resize);
    document.addEventListener('themechange', () => { readColors(); if (!running) draw(performance.now()); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); if (!running) draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(cv);
    } else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }
})();
