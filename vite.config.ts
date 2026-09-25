import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

// `vite build` produces a code-split production build (lazy 3D + drawing chunks).
// `vite build --mode single` inlines everything into one HTML file for hosted previews.
export default defineConfig(({ mode }) => ({
  // Custom domain deployment — base stays '/'
  base: '/',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2020',
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    rollupOptions:
      mode === 'single'
        ? undefined
        : {
            output: {
              manualChunks: {
                three: ['three'],
                r3f: ['@react-three/fiber', '@react-three/drei'],
              },
            },
          },
  },
}));
