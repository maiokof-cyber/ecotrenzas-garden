import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', emptyOutDir: true, sourcemap: true,
    rollupOptions: { input: {
      legacyLab: resolve(import.meta.dirname,'index.html'),
      g5: resolve(import.meta.dirname,'g5.html'),
      g6: resolve(import.meta.dirname,'g6.html'),
      g7: resolve(import.meta.dirname,'g7.html'),
      g8: resolve(import.meta.dirname,'g8.html'),
      g9: resolve(import.meta.dirname,'g9.html')
    }}
  }
});
