import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', emptyOutDir: true, sourcemap: true,
    rollupOptions: { input: {
      legacyLab: resolve(import.meta.dirname,'index.html'),
      g5: resolve(import.meta.dirname,'g5.html')
    }}
  }
});
