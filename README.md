# adityatalekar.github.io

Personal portfolio of Aditya Talekar — AI Engineer (Agentic AI & MLOps).

Plain HTML, CSS and JavaScript. No framework, no build step, no trackers. GitHub Pages serves the files exactly as they are.

```
index.html              Home: hero, impact, selected work, experience, teaching, lab, skills, contact
work/*.html             Case studies (Wave Engine, Guardian, Exactitude, NexusRAG, EnergyNexus)
assets/css/site.css     Design system: tokens → layout → components (light + dark)
assets/js/site.js       Theme, command palette (Ctrl/⌘ K), reveal, charts, lightbox, hero canvas
assets/img/             Screenshots (WebP), social card (og.png)
404.html, sitemap.xml, robots.txt
```

## Preview locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

## Editing

- **Text:** edit the HTML directly. Each case study is a self-contained page in `work/`.
- **Colours and fonts:** change the tokens at the top of `assets/css/site.css`.
- **Command palette entries:** the `COMMANDS` list in `assets/js/site.js`.
- **Charts:** a `<figure class="chart" data-chart='{…}'>` element renders a grouped bar chart from its JSON.
- **Images:** add WebP files to `assets/img/`. Keep each under ~300 KB.
