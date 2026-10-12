/* Aditya Talekar — portfolio (v6). Copy email, document preview, lightbox, chart. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const base = document.body.dataset.base || '';

  /* toast + copy email */
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let timer;
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 1800); };
  $$('[data-copy-email]').forEach(b => b.addEventListener('click', async e => {
    e.preventDefault();
    try { await navigator.clipboard.writeText('aditya.a.talekar@gmail.com'); say('Email copied'); }
    catch { window.location.href = 'mailto:aditya.a.talekar@gmail.com'; }
  }));

  /* active section in the header nav */
  const links = $$('.site-head nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id)); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    links.forEach(a => { const s = document.getElementById(a.getAttribute('href').slice(1)); if (s) io.observe(s); });
  }

  /* lightbox */
  const zoomables = $$('img[data-zoom]');
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Enlarged image');
    lb.tabIndex = -1;
    lb.innerHTML = '<img alt="">';
    document.body.appendChild(lb);
    const img = $('img', lb);
    let last = null;
    const close = () => { lb.classList.remove('open'); if (last) last.focus(); };
    zoomables.forEach(z => {
      z.tabIndex = 0;
      const open = () => { last = z; img.src = z.currentSrc || z.src; img.alt = z.alt; lb.classList.add('open'); lb.focus(); };
      z.addEventListener('click', open);
      z.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); open(); } });
    });
    lb.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* document preview */
  const DOCS = {
    resume: { title: 'Aditya Talekar — Résumé', sub: '2 pages', pdf: base + 'assets/docs/Aditya_Talekar_Resume.pdf', file: 'Aditya_Talekar_Resume.pdf', pages: 2, img: i => `${base}assets/img/resume-p${i}.webp`, w: 1406, h: 1988 },
    thesis: { title: 'MSc Dissertation — EnergyNexus', sub: 'Queen Mary University of London, 2025 · 9 pages', pdf: base + 'assets/docs/Aditya_Talekar_MSc_Dissertation.pdf', file: 'Aditya_Talekar_MSc_Dissertation.pdf', pages: 9, img: i => `${base}assets/img/thesis-p${i}.webp`, w: 1020, h: 1320 },
  };
  const dialogs = {};
  const openDoc = key => {
    const d = DOCS[key];
    if (!d) return;
    if (typeof HTMLDialogElement !== 'function') { window.open(d.pdf, '_blank', 'noopener'); return; }
    if (!dialogs[key]) {
      const dlg = document.createElement('dialog');
      dlg.className = 'doc-dialog';
      dlg.setAttribute('aria-label', d.title);
      const pages = Array.from({ length: d.pages }, (_, i) => `<img src="${d.img(i + 1)}" alt="${d.title}, page ${i + 1}" width="${d.w}" height="${d.h}"${i ? ' loading="lazy"' : ''}>`).join('');
      dlg.innerHTML = `<div class="dd-head"><div><b>${d.title}</b><small>${d.sub}</small></div><div class="dd-actions"><a href="${d.pdf}" download="${d.file}">Download PDF</a><a href="${d.pdf}" target="_blank" rel="noopener">Open in new tab</a><button data-close aria-label="Close">Close</button></div></div><div class="dd-body">${pages}</div>`;
      document.body.appendChild(dlg);
      $('[data-close]', dlg).addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dialogs[key] = dlg;
    }
    dialogs[key].showModal();
    $('.dd-body', dialogs[key]).scrollTop = 0;
  };
  $$('[data-doc]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openDoc(b.dataset.doc); }));

  /* grouped bar chart from data-chart JSON */
  $$('.chart[data-chart]').forEach(fig => {
    const cfg = JSON.parse(fig.dataset.chart);
    const { categories, series, unit = '', max = 100 } = cfg;
    const W = 640, H = 300, m = { t: 16, r: 8, b: 34, l: 40 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const y = v => m.t + ih - (v / max) * ih;
    const groupW = iw / categories.length;
    const barW = Math.min(46, (groupW * 0.62) / series.length), gap = 2;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.title || 'Bar chart'}"><g class="grid axis">`;
    for (let v = 0; v <= max; v += max / 4) svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}${unit}</text>`;
    svg += '</g>';
    const bars = [];
    categories.forEach((c, ci) => {
      const gx = m.l + ci * groupW + groupW / 2 - (series.length * barW + (series.length - 1) * gap) / 2;
      series.forEach((s, si) => {
        const v = s.values[ci], x = gx + si * (barW + gap), top = y(v);
        svg += `<rect class="bar" data-b="${bars.length}" x="${x}" y="${top}" width="${barW}" height="${m.t + ih - top}" fill="var(--chart-${si + 1})"/>`;
        bars.push({ ci, si, v, cx: x + barW / 2, top });
      });
      svg += `<g class="axis"><text x="${m.l + ci * groupW + groupW / 2}" y="${H - 10}" text-anchor="middle">${c}</text></g>`;
    });
    svg += `<line class="baseline" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}"/>`;
    bars.forEach((b, i) => { svg += `<rect class="hit" data-b="${i}" x="${b.cx - barW / 2 - 4}" y="${m.t}" width="${barW + 8}" height="${ih}"/>`; });
    svg += '</svg>';
    const legend = series.map((s, si) => `<span><i style="background:var(--chart-${si + 1})"></i>${s.name}</span>`).join('');
    const rows = categories.map((c, ci) => `<tr><td>${c}</td>${series.map(s => `<td>${s.values[ci]}${unit}</td>`).join('')}</tr>`).join('');
    fig.innerHTML = `<div class="chart-head"><div><div class="chart-title">${cfg.title || ''}</div><div class="chart-sub">${cfg.subtitle || ''}</div></div><div class="chart-legend">${legend}</div></div><div style="position:relative">${svg}<div class="chart-tip"></div></div><details><summary>View as table</summary><table><thead><tr><th>${cfg.xLabel || ''}</th>${series.map(s => `<th>${s.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></details>`;
    const svgEl = $('svg', fig), tip = $('.chart-tip', fig), paths = $$('.bar', fig);
    $$('.hit', fig).forEach(h => {
      h.addEventListener('pointerenter', () => {
        const b = bars[+h.dataset.b], k = svgEl.getBoundingClientRect().width / W;
        paths.forEach(p => p.classList.toggle('on', p.dataset.b === h.dataset.b));
        tip.innerHTML = `${series[b.si].name}, ${categories[b.ci]}: <b>${b.v}${unit}</b>`;
        tip.style.left = `${b.cx * k}px`; tip.style.top = `${b.top * k}px`; tip.classList.add('show');
      });
      h.addEventListener('pointerleave', () => { tip.classList.remove('show'); paths.forEach(p => p.classList.remove('on')); });
    });
  });
})();
