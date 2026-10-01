/**
 * Build-time SEO / GEO output for the static host.
 *
 * The app itself is a hash-routed single page, which search engines and AI crawlers cannot index beyond one URL.
 * This plugin adds real, crawlable HTML pages (missions, planets, colouring categories, about) generated from the
 * app's own content data, plus sitemap.xml, llms.txt, llms-full.txt and a 404 page. It never touches the app UI:
 * every page here is separate static HTML that links into the app.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
import type { Plugin } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

interface Mission { id: string; year: number; name: string; tagline: string; story: string; wow: string; question: { q: string; options: string[]; answer: number } }
interface Body { id: string; name: string; fact: string; wow: string; india?: string }
interface Category { id: string; name: string; emoji: string; blurb: string }
interface Company { id: string; name: string; city: string; what: string }
interface ColouringPage { id: string; title: string; cat: string; level: 1 | 2 | 3; about: string; facts?: string[]; company?: string; mission?: string; body?: string }
interface Data {
  MISSIONS: Mission[]; PLANETS: Body[]; SUN: Body; MOON_INFO: Body;
  COLOURING_PAGES: ColouringPage[]; CATEGORIES: Category[]; COMPANIES: Company[];
}

const NAME = 'Indian Space Hub';
const TAGLINE = 'Space adventures for kids';
const SUMMARY = 'Paint rockets, build planets, draw space scenes and explore India’s space missions.';
const LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Tricky' } as const;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Content uses non-breaking hyphens (Chandrayaan‑3). People and crawlers search with a plain hyphen. */
const clean = (s: string) => s.replace(/\u2011/g, '-');
const trim = (s: string, n = 155) => {
  s = clean(s).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
};
const jsonLd = (g: unknown[]) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': g }).replace(/</g, '\\u003c')}</script>`;

async function loadData(): Promise<Data> {
  const out = await esbuild({
    entryPoints: [path.join(root, 'tools/seo/data.ts')],
    bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent',
    alias: { '@': path.join(root, 'src') },
  });
  const code = out.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

export function seoPlugin(opts: { site: string }): Plugin {
  const site = opts.site.replace(/\/$/, '');
  let outDir = '';
  return {
    name: 'indian-space-hub-seo',
    apply: (config, env) => env.command === 'build' && config.mode !== 'single',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    async writeBundle() {
      const d = await loadData();
      const files = generate(d, site);
      for (const [rel, content] of files) {
        const file = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
      }
      console.log(`\n[seo] wrote ${files.size} files (static pages, sitemap.xml, llms.txt, llms-full.txt, 404.html)`);
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------

const CSS = `
:root{--night:#0f1438;--night-2:#161c4c;--night-3:#1f2766;--line:rgba(168,176,255,.2);--ink:#f6f4ff;--muted:#b9bce6;--saffron:#ff9933;--saffron-deep:#c96a12;--gold:#ffc93c;--sky:#6fd3ff;--green:#2fbf71;color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:'Baloo 2','Nunito',ui-rounded,'Segoe UI',system-ui,-apple-system,sans-serif;font-size:1.0625rem;line-height:1.5;color:var(--ink);background:radial-gradient(120% 70% at 80% -10%,#2b2f8a 0%,transparent 60%),radial-gradient(90% 60% at -10% 110%,#3a1d6b 0%,transparent 55%),var(--night);background-attachment:fixed;min-height:100vh;display:flex;flex-direction:column}
a{color:var(--sky)}a:focus-visible,.btn:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:12px}
h1,h2,h3,p,ul,ol,dl{margin:0}
h1{font-size:clamp(2rem,7vw,3rem);line-height:1.08;font-weight:800;letter-spacing:-.01em}
h2{font-size:1.5rem;line-height:1.15;font-weight:800;margin-top:2rem}
h3{font-size:1.2rem;line-height:1.2;font-weight:700}
.wrap{width:100%;max-width:880px;margin:0 auto;padding:0 16px}
header.site{border-bottom:1px solid var(--line);background:rgba(15,20,56,.8)}
header.site .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding-top:10px;padding-bottom:10px}
.brand{display:inline-flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:800;min-height:44px}
.brand svg{flex:0 0 auto}
nav.top{display:flex;flex-wrap:wrap;gap:2px 6px;margin-left:auto}
nav.top a{display:inline-flex;align-items:center;min-height:44px;padding:0 10px;color:var(--muted);text-decoration:none;font-weight:700;border-radius:12px}
nav.top a:hover,nav.top a[aria-current=page]{color:var(--night);background:var(--gold)}
main{flex:1;padding:24px 0 48px}
.crumbs{font-size:.9375rem;color:var(--muted);margin-bottom:12px}.crumbs a{color:var(--muted)}
.kicker{display:inline-block;margin-bottom:6px;color:var(--gold);font-weight:800;font-size:.9375rem;letter-spacing:.04em;text-transform:uppercase}
.lead{font-size:1.25rem;color:var(--muted);margin-top:10px}
p+p{margin-top:.8rem}
.card{background:var(--night-2);border:1px solid var(--line);border-radius:22px;padding:18px;margin-top:14px}
.card h3{margin-bottom:6px}
.card p{color:var(--muted)}
.wow{border-color:rgba(255,201,60,.45)}.wow strong{color:var(--gold)}
.grid{display:grid;gap:12px;margin-top:14px;padding:0;list-style:none;grid-template-columns:1fr}
.grid li{margin:0}
.tile{display:block;height:100%;background:var(--night-2);border:1px solid var(--line);border-radius:22px;padding:16px 18px;color:var(--ink);text-decoration:none}
.tile:hover{border-color:var(--sky)}
.tile strong{display:block;font-size:1.15rem}.tile span{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 24px;border-radius:999px;background:var(--saffron);color:#2a1400;font-weight:800;text-decoration:none;box-shadow:0 5px 0 var(--saffron-deep)}
.btn.alt{background:var(--night-3);color:var(--ink);box-shadow:0 5px 0 #0b0f33}
.actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:22px}
ul.plain{padding-left:1.2rem;color:var(--muted)}ul.plain li+li{margin-top:.3rem}
.tag{display:inline-block;padding:2px 10px;border-radius:999px;border:1px solid var(--line);color:var(--muted);font-size:.875rem;font-weight:700}
dl.faq dt{font-weight:800;font-size:1.15rem;margin-top:1.2rem}dl.faq dd{margin:.3rem 0 0;color:var(--muted)}
.pn{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;margin-top:2rem}
footer.site{border-top:1px solid var(--line);padding:22px 0 30px;color:var(--muted);font-size:.9375rem}
footer.site nav{display:flex;flex-wrap:wrap;gap:0 14px;margin-bottom:8px}footer.site a{display:inline-flex;align-items:center;min-height:44px;color:var(--muted)}
@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}main{padding-top:36px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

const MARK = `<svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9933"/><stop offset=".5" stop-color="#FFF"/><stop offset="1" stop-color="#2FBF71"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="#1F2766"/><ellipse cx="24" cy="26" rx="19" ry="8" fill="none" stroke="url(#ring)" stroke-width="3.5" transform="rotate(-22 24 26)"/><path d="M24 9c4 3 5.5 7.5 5.5 12.5V29h-11v-7.5C18.5 16.5 20 12 24 9Z" fill="#fff"/><path d="M24 9c2 1.5 3.5 3.5 4.3 6h-8.6c.8-2.5 2.3-4.5 4.3-6Z" fill="#FF9933"/><circle cx="24" cy="20" r="2.4" fill="#6FD3FF"/><path d="M21 30c0 4 3 7 3 7s3-3 3-7z" fill="#FFC93C"/></svg>`;
const FAVICON = '/favicon.svg';

const SECTIONS = [
  { href: '/missions/', label: 'Missions' },
  { href: '/planets/', label: 'Planets' },
  { href: '/colouring/', label: 'Colouring' },
  { href: '/about/', label: 'About' },
] as const;

interface PageOpts {
  site: string; path: string; title: string; description: string; body: string; graph: unknown[];
  type?: 'website' | 'article'; noindex?: boolean; section?: string; date: string;
}

function layout(o: PageOpts): string {
  const url = `${o.site}${o.path}`;
  const title = clean(o.title);
  const desc = trim(o.description);
  const img = `${o.site}/og-image.png`;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
<meta name="theme-color" content="#0F1438">
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${o.type ?? 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${NAME}: ${esc(TAGLINE.toLowerCase())}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">
<link rel="icon" href="${FAVICON}" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
${jsonLd(o.graph)}
</head>
<body>
<header class="site"><div class="wrap">
<a class="brand" href="/">${MARK}<span>${NAME}</span></a>
<nav class="top" aria-label="Sections">${SECTIONS.map((s) => `<a href="${s.href}"${o.section === s.href ? ' aria-current="page"' : ''}>${s.label}</a>`).join('')}</nav>
</div></header>
<main><div class="wrap">
${o.body}
</div></main>
<footer class="site"><div class="wrap">
<nav aria-label="Footer"><a href="/">Open the app</a>${SECTIONS.map((s) => `<a href="${s.href}">${s.label}</a>`).join('')}</nav>
<p>${NAME}: ${esc(SUMMARY)} No accounts, no ads. Progress stays on the child’s own device.</p>
</div></footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------------------------

function generate(d: Data, site: string): Map<string, string> {
  const out = new Map<string, string>();
  const date = new Date().toISOString().slice(0, 10);
  const org = { '@type': 'Organization', '@id': `${site}/#organization`, name: NAME, url: `${site}/`, logo: { '@type': 'ImageObject', url: `${site}/icon-512.png`, width: 512, height: 512 } };
  const crumbs = (items: [string, string][]) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name: clean(name), item: `${site}${p}` })),
  });
  const faqNode = (qa: [string, string][]) => ({
    '@type': 'FAQPage',
    mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: clean(q), acceptedAnswer: { '@type': 'Answer', text: clean(a) } })),
  });
  const article = (p: string, headline: string, description: string) => ({
    '@type': 'Article', headline: clean(headline), description: trim(description), inLanguage: 'en-IN',
    mainEntityOfPage: `${site}${p}`, image: `${site}/og-image.png`, dateModified: date,
    author: { '@id': org['@id'] }, publisher: { '@id': org['@id'] },
  });
  const add = (o: Omit<PageOpts, 'site' | 'date'>) => out.set(`${o.path.slice(1)}index.html`, layout({ ...o, site, date }));

  const bodies: Body[] = [d.SUN, ...d.PLANETS, d.MOON_INFO];
  const catName = (id: string) => d.CATEGORIES.find((c) => c.id === id)?.name ?? id;
  const pagesOf = (cat: string) => d.COLOURING_PAGES.filter((p) => p.cat === cat);
  /** "Indian Rockets" becomes "Indian Rockets colouring pages"; names that already say colouring stay as they are. */
  const catTitle = (c: Category) => (/colou?r/i.test(c.name) ? c.name : `${c.name} colouring pages`);
  const bodyLabel = (b: Body) => clean(b.name.replace(/^The /, ''));
  const app = (hash: string) => `/#/${hash}`;
  const listing = (items: { href: string; title: string; sub: string }[]) =>
    `<ul class="grid">${items.map((i) => `<li><a class="tile" href="${i.href}"><strong>${esc(clean(i.title))}</strong><span>${esc(clean(i.sub))}</span></a></li>`).join('')}</ul>`;
  const prevNext = <T,>(list: T[], i: number, href: (t: T) => string, label: (t: T) => string) =>
    `<div class="pn">${i > 0 ? `<a class="btn alt" href="${href(list[i - 1])}" rel="prev">← ${esc(label(list[i - 1]))}</a>` : '<span></span>'}${i < list.length - 1 ? `<a class="btn alt" href="${href(list[i + 1])}" rel="next">${esc(label(list[i + 1]))} →</a>` : ''}</div>`;

  // ---- Missions -----------------------------------------------------------------------------------------------
  const missions = [...d.MISSIONS].sort((a, b) => a.year - b.year);
  add({
    path: '/missions/', section: '/missions/',
    title: `ISRO Missions for Kids: ${missions.length} Space Stories from India | ${NAME}`,
    description: `Meet ${missions.length} milestones of India’s space story for kids, from Aryabhata in 1975 to Gaganyaan: ${missions.slice(0, 5).map((m) => m.name).join(', ')} and more.`,
    graph: [org, { '@type': 'CollectionPage', name: 'India’s space missions for kids', url: `${site}/missions/`, inLanguage: 'en-IN' },
      { '@type': 'ItemList', itemListElement: missions.map((m, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site}/missions/${m.id}/`, name: clean(m.name) })) },
      crumbs([['Home', '/'], ['Missions', '/missions/']])],
    body: `<p class="crumbs"><a href="/">Home</a> › Missions</p>
<span class="kicker">India’s space story</span>
<h1>ISRO missions and milestones for kids</h1>
<p class="lead">From India’s very first satellite to astronauts flying on an Indian rocket, here are ${missions.length} short stories a child can read in a few minutes. Each one has a fun fact and a quick quiz question.</p>
${listing(missions.map((m) => ({ href: `/missions/${m.id}/`, title: `${m.name} (${m.year})`, sub: m.tagline })))}
<div class="actions"><a class="btn" href="${app('explore/missions')}">Discover missions in the app</a></div>`,
  });

  missions.forEach((m, i) => {
    const p = `/missions/${m.id}/`;
    const related = d.COLOURING_PAGES.filter((c) => c.mission === m.id);
    const answer = m.question.options[m.question.answer];
    const desc = `${m.story} ${m.wow}`;
    add({
      path: p, section: '/missions/', type: 'article',
      title: `${m.name} (${m.year}) for Kids | ${NAME}`,
      description: desc,
      graph: [org, article(p, `${m.name} (${m.year}): ${m.tagline}`, desc), faqNode([[m.question.q, answer]]), crumbs([['Home', '/'], ['Missions', '/missions/'], [m.name, p]])],
      body: `<p class="crumbs"><a href="/">Home</a> › <a href="/missions/">Missions</a> › ${esc(clean(m.name))}</p>
<span class="kicker">${m.year}</span>
<h1>${esc(clean(m.name))}: ${esc(clean(m.tagline))}</h1>
<p class="lead">${esc(clean(m.story))}</p>
<div class="card wow"><h3>Space wow</h3><p><strong>${esc(clean(m.wow))}</strong></p></div>
<h2>Quick quiz</h2>
<div class="card"><h3>${esc(clean(m.question.q))}</h3><p>Options: ${m.question.options.map((o) => esc(clean(o))).join(' · ')}</p><p><strong style="color:var(--green)">Answer: ${esc(clean(answer))}</strong></p></div>
${related.length ? `<h2>Colour this mission</h2>${listing(related.map((c) => ({ href: `/colouring/${c.cat}/`, title: c.title, sub: c.about })))}` : ''}
<div class="actions"><a class="btn" href="${app('explore/missions')}">Discover ${esc(clean(m.name))} in the app</a>${related.length ? `<a class="btn alt" href="${app(`draw/library/mission/${m.id}`)}">Colour it in</a>` : ''}</div>
${prevNext(missions, i, (x) => `/missions/${x.id}/`, (x) => clean(x.name))}`,
    });
  });

  // ---- Planets ------------------------------------------------------------------------------------------------
  add({
    path: '/planets/', section: '/planets/',
    title: `Solar System for Kids: The Sun, 8 Planets and the Moon | ${NAME}`,
    description: 'Fun facts about the Sun, all eight planets and the Moon for kids, with the Indian missions that explore them, like Chandrayaan-3, Mangalyaan and Aditya-L1.',
    graph: [org, { '@type': 'CollectionPage', name: 'The Solar System for kids', url: `${site}/planets/`, inLanguage: 'en-IN' },
      { '@type': 'ItemList', itemListElement: bodies.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site}/planets/${b.id}/`, name: bodyLabel(b) })) },
      crumbs([['Home', '/'], ['Planets', '/planets/']])],
    body: `<p class="crumbs"><a href="/">Home</a> › Planets</p>
<span class="kicker">Our Solar System</span>
<h1>The Sun, the planets and the Moon</h1>
<p class="lead">One short fact and one “wow” for each world, and how India is exploring them.</p>
${listing(bodies.map((b) => ({ href: `/planets/${b.id}/`, title: bodyLabel(b), sub: b.fact })))}
<div class="actions"><a class="btn" href="${app('explore')}">Fly through space in the app</a></div>`,
  });

  bodies.forEach((b, i) => {
    const p = `/planets/${b.id}/`;
    const label = bodyLabel(b);
    const related = d.COLOURING_PAGES.filter((c) => c.body === b.id);
    const desc = `${b.fact} ${b.wow}${b.india ? ` ${b.india}` : ''}`;
    add({
      path: p, section: '/planets/', type: 'article',
      title: `${label} Facts for Kids | ${NAME}`,
      description: `${label} facts for kids. ${desc}`,
      graph: [org, article(p, `${label} facts for kids`, desc), faqNode([[`What is special about ${b.id === 'sun' || b.id === 'moon' ? 'the ' + label : label}?`, `${b.fact} ${b.wow}`]]), crumbs([['Home', '/'], ['Planets', '/planets/'], [label, p]])],
      body: `<p class="crumbs"><a href="/">Home</a> › <a href="/planets/">Planets</a> › ${esc(label)}</p>
<span class="kicker">Solar System</span>
<h1>${esc(clean(b.name))}: facts for kids</h1>
<p class="lead">${esc(clean(b.fact))}</p>
<div class="card wow"><h3>Space wow</h3><p><strong>${esc(clean(b.wow))}</strong></p></div>
${b.india ? `<div class="card"><h3>India and ${esc(label)}</h3><p>${esc(clean(b.india))}</p></div>` : ''}
${related.length ? `<h2>Colour ${esc(label)}</h2>${listing(related.map((c) => ({ href: `/colouring/${c.cat}/`, title: c.title, sub: c.about })))}` : ''}
<div class="actions"><a class="btn" href="${app(`explore/body/${b.id}`)}">Visit ${esc(label)} in the app</a></div>
${prevNext(bodies, i, (x) => `/planets/${x.id}/`, bodyLabel)}`,
    });
  });

  // ---- Colouring ----------------------------------------------------------------------------------------------
  const total = d.COLOURING_PAGES.length;
  add({
    path: '/colouring/', section: '/colouring/',
    title: `Space Colouring Pages for Kids | ${NAME}`,
    description: `${total} space colouring pages for kids in ${d.CATEGORIES.length} groups: Indian rockets, ISRO missions, the Moon, planets, astronauts and more. Colour on any phone or tablet.`,
    graph: [org, { '@type': 'CollectionPage', name: 'Space colouring pages for kids', url: `${site}/colouring/`, inLanguage: 'en-IN' },
      { '@type': 'ItemList', itemListElement: d.CATEGORIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site}/colouring/${c.id}/`, name: clean(c.name) })) },
      crumbs([['Home', '/'], ['Colouring', '/colouring/']])],
    body: `<p class="crumbs"><a href="/">Home</a> › Colouring</p>
<span class="kicker">Colour and learn</span>
<h1>Space colouring pages for kids</h1>
<p class="lead">${total} pages built around India’s space programme. Pick a group, then colour right on a phone or tablet. Every page comes with a fun fact to read.</p>
${listing(d.CATEGORIES.map((c) => ({ href: `/colouring/${c.id}/`, title: `${c.emoji} ${c.name} (${pagesOf(c.id).length})`, sub: c.blurb })))}
<div class="actions"><a class="btn" href="${app('draw/library')}">Start colouring in the app</a></div>`,
  });

  d.CATEGORIES.forEach((c, i) => {
    const p = `/colouring/${c.id}/`;
    const pages = pagesOf(c.id);
    const desc = `${pages.length} ${catTitle(c).toLowerCase()} for kids: ${c.blurb}. Colour them on any phone or tablet and learn a fun fact on each page.`;
    add({
      path: p, section: '/colouring/',
      title: `${catTitle(c)} for Kids | ${NAME}`,
      description: desc,
      graph: [org, { '@type': 'CollectionPage', name: catTitle(c), url: `${site}${p}`, description: trim(desc), inLanguage: 'en-IN' },
        { '@type': 'ItemList', itemListElement: pages.map((x, j) => ({ '@type': 'ListItem', position: j + 1, name: clean(x.title) })) },
        crumbs([['Home', '/'], ['Colouring', '/colouring/'], [c.name, p]])],
      body: `<p class="crumbs"><a href="/">Home</a> › <a href="/colouring/">Colouring</a> › ${esc(clean(c.name))}</p>
<span class="kicker">${c.emoji} ${pages.length} pages</span>
<h1>${esc(catTitle(c))}</h1>
<p class="lead">${esc(clean(c.blurb))}.</p>
${pages.map((x) => {
  const co = d.COMPANIES.find((k) => k.id === x.company);
  return `<article class="card"><h3>${esc(clean(x.title))}</h3><p><span class="tag">${LEVELS[x.level]}</span>${co ? ` <span class="tag">${esc(co.name)}</span>` : ''}</p><p>${esc(clean(x.about))}</p>${x.facts?.length ? `<ul class="plain">${x.facts.map((f) => `<li>${esc(clean(f))}</li>`).join('')}</ul>` : ''}${co ? `<p>${esc(co.name)} (${esc(co.city)}): ${esc(clean(co.what))}</p>` : ''}<p><a href="${app(`draw/page/${x.id}`)}">Colour “${esc(clean(x.title))}” in the app</a></p></article>`;
}).join('\n')}
<div class="actions"><a class="btn" href="${app(`draw/library/${c.id}`)}">Open these pages in the app</a></div>
${prevNext(d.CATEGORIES, i, (x) => `/colouring/${x.id}/`, (x) => clean(x.name))}`,
    });
  });

  // ---- About / FAQ --------------------------------------------------------------------------------------------
  const faq: [string, string][] = [
    [`What is ${NAME}?`, `${NAME} is a mobile-first, touch-first space creativity platform for children, built around India’s space programme. Kids explore the Solar System and ISRO missions, paint and launch 3D spacecraft, invent planets, draw space scenes and keep everything in a personal Mission Archive.`],
    ['What can children do in it?', `Explore: fly past the planets and meet India’s missions, from Aryabhata to Gaganyaan. Hangar: paint, build and launch 3D rockets and spacecraft. Draw: brushes, stamps and ${total} space colouring pages. Archive: keep creations, badges and a collection.`],
    ['Does my child need an account?', 'No. There are no accounts, ads, chat or uploads. Children choose a generated call sign instead of typing their name.'],
    ['Where is my child’s progress saved?', 'Only on the device. Progress is kept in the browser’s local storage and creations in its IndexedDB. In Settings, “Start over” wipes everything.'],
    ['Does it work on phones and tablets?', 'Yes. It runs in the browser, is designed for touch first, uses large tap targets, and adjusts its 3D quality to the device so it stays smooth on mid-range Android phones.'],
    ['Are there timers or ways to fail?', 'No. There are no timers, no failure states and no penalties. Creating and launching earns stars, badges and ranks, and a fresh daily challenge gives a reason to come back.'],
    ['How many colouring pages are there?', `There are ${total} colouring pages in ${d.CATEGORIES.length} groups: ${d.CATEGORIES.map((c) => c.name).join(', ')}. Many link to the matching mission and 3D model, so a child can colour, explore in 3D and learn.`],
  ];
  add({
    path: '/about/', section: '/about/',
    title: `About ${NAME}: Space Learning and Creativity for Kids`,
    description: `${NAME} is a mobile-first space app for kids: explore ISRO missions, paint and launch 3D rockets, draw and colour. No accounts, no ads.`,
    graph: [org, { '@type': 'AboutPage', name: `About ${NAME}`, url: `${site}/about/`, inLanguage: 'en-IN' }, faqNode(faq), crumbs([['Home', '/'], ['About', '/about/']])],
    body: `<p class="crumbs"><a href="/">Home</a> › About</p>
<span class="kicker">About</span>
<h1>About ${NAME}</h1>
<p class="lead">${esc(SUMMARY)} A safe, friendly place for children to fall in love with space.</p>
<h2>Frequently asked questions</h2>
<dl class="faq">${faq.map(([q, a]) => `<dt>${esc(clean(q))}</dt><dd>${esc(clean(a))}</dd>`).join('')}</dl>
<h2>Start exploring</h2>
${listing([
  { href: '/missions/', title: 'ISRO missions', sub: 'Stories, fun facts and quizzes' },
  { href: '/planets/', title: 'The Solar System', sub: 'The Sun, planets and the Moon' },
  { href: '/colouring/', title: 'Colouring pages', sub: `${total} pages in ${d.CATEGORIES.length} groups` },
])}
<div class="actions"><a class="btn" href="/">Open ${NAME}</a></div>`,
  });

  // ---- 404 ----------------------------------------------------------------------------------------------------
  out.set('404.html', layout({
    site, date, path: '/404.html', noindex: true,
    title: `Page not found | ${NAME}`, description: `That page isn’t here. Head back to ${NAME}.`,
    graph: [org],
    body: `<h1>Oops, this page drifted off into space</h1><p class="lead">We couldn’t find that page. Try one of these instead.</p>
${listing([{ href: '/', title: 'Open the app', sub: NAME }, ...SECTIONS.map((s) => ({ href: s.href, title: s.label, sub: '' }))])}`,
  }));

  // ---- sitemap.xml --------------------------------------------------------------------------------------------
  const urls: [string, string, string][] = [
    ['/', 'weekly', '1.0'], ['/about/', 'monthly', '0.6'],
    ['/missions/', 'monthly', '0.8'], ...missions.map((m): [string, string, string] => [`/missions/${m.id}/`, 'monthly', '0.7']),
    ['/planets/', 'monthly', '0.8'], ...bodies.map((b): [string, string, string] => [`/planets/${b.id}/`, 'monthly', '0.7']),
    ['/colouring/', 'weekly', '0.8'], ...d.CATEGORIES.map((c): [string, string, string] => [`/colouring/${c.id}/`, 'weekly', '0.7']),
  ];
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, f, pr]) => `  <url><loc>${site}${u}</loc><lastmod>${date}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);

  // ---- llms.txt / llms-full.txt -------------------------------------------------------------------------------
  const L = (title: string, href: string, sub: string) => `- [${clean(title)}](${site}${href}): ${clean(sub)}`;
  out.set('llms.txt', `# ${NAME}

> ${SUMMARY} A mobile-first, touch-first space creativity app for children, built around India's space programme (ISRO). No accounts, no ads; progress stays on the device.

${NAME} lives at ${site}/. The app itself is interactive (3D rockets, drawing canvas), so the pages below hold the same facts as plain text. Missions, planets and colouring pages are generated from the app's own content.

## Start here
${L('About and FAQ', '/about/', 'What it is, who it is for, privacy and how it works')}
${L('Full content as one file', '/llms-full.txt', 'Every mission, planet and colouring page in Markdown')}

## ISRO missions and milestones
${missions.map((m) => L(`${m.name} (${m.year})`, `/missions/${m.id}/`, m.tagline)).join('\n')}

## The Solar System
${bodies.map((b) => L(bodyLabel(b), `/planets/${b.id}/`, b.fact)).join('\n')}

## Colouring pages
${d.CATEGORIES.map((c) => L(`${c.name} (${pagesOf(c.id).length})`, `/colouring/${c.id}/`, c.blurb)).join('\n')}

## Optional
${L('Sitemap', '/sitemap.xml', 'All public URLs')}
`);

  out.set('llm.txt', out.get('llms.txt')!);

  const md: string[] = [`# ${NAME}`, '', `> ${SUMMARY}`, '', `Site: ${site}/`, '', '## About and FAQ', ''];
  faq.forEach(([q, a]) => md.push(`**${clean(q)}**`, clean(a), ''));
  md.push('## ISRO missions and milestones', '');
  missions.forEach((m) => md.push(`### ${clean(m.name)} (${m.year}): ${clean(m.tagline)}`, '', clean(m.story), '', `Wow: ${clean(m.wow)}`, '', `Quiz: ${clean(m.question.q)} Answer: ${clean(m.question.options[m.question.answer])}.`, '', `URL: ${site}/missions/${m.id}/`, ''));
  md.push('## The Solar System', '');
  bodies.forEach((b) => md.push(`### ${clean(b.name)}`, '', clean(b.fact), '', `Wow: ${clean(b.wow)}`, ...(b.india ? ['', `India: ${clean(b.india)}`] : []), '', `URL: ${site}/planets/${b.id}/`, ''));
  md.push('## Colouring pages', '');
  d.CATEGORIES.forEach((c) => {
    md.push(`### ${c.name}: ${clean(c.blurb)}`, '');
    pagesOf(c.id).forEach((x) => md.push(`- **${clean(x.title)}** (${LEVELS[x.level]}): ${clean(x.about)}${x.facts?.length ? ' ' + x.facts.map(clean).join(' ') : ''}`));
    md.push('', `URL: ${site}/colouring/${c.id}/`, '');
  });
  out.set('llms-full.txt', md.join('\n'));

  return out;
}
