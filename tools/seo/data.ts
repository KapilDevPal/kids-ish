// Content the SEO generator reads. Bundled by esbuild at build time (see seo-plugin.ts), so the static
// pages, sitemap and llms.txt are always generated from the same data the app ships with.
export { MISSIONS } from '../../src/content/missions';
export { PLANETS, SUN, MOON_INFO } from '../../src/content/planets';
export { COLOURING_PAGES, CATEGORIES, COMPANIES } from '../../src/content/colouring';
