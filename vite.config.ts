import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import { seoPlugin } from './tools/seo/seo-plugin';

// The public origin comes from the custom-domain file, so SEO URLs can never drift from the real domain.
const SITE = `https://${fs.readFileSync(new URL('./public/CNAME', import.meta.url), 'utf8').trim()}`;

// `vite build` produces a code-split production build (lazy 3D + drawing chunks).
// `vite build --mode single` inlines everything into one HTML file for hosted previews.
export default defineConfig(({ mode }) => ({
  // Custom domain deployment — base stays '/'
  base: '/',
  plugins: [react(), seoPlugin({ site: SITE }), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2020',
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    rollupOptions:
      mode === 'single'
        ? undefined
        : {
            output: {
              // Everything the home screen needs (React, zustand and their helpers) must live in a chunk that
              // does not depend on three.js. Left to Rollup, those shared modules land in the r3f chunk, so
              // every first paint downloads three.js (~1 MB) even though only the 3D screens need it.
              manualChunks(id) {
                // Vite's own helpers (dynamic-import preloader, CJS interop) are used by the entry too.
                if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vendor';
                if (!id.includes('node_modules')) return undefined;
                if (/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store|@babel\/runtime|idb-keyval)\//.test(id)) return 'vendor';
                if (/node_modules\/(three|three-stdlib)\//.test(id)) return 'three';
                if (/node_modules\/@react-three\//.test(id)) return 'r3f';
                return undefined;
              },
            },
          },
  },
}));
