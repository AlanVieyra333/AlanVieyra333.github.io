/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  // El plugin de Vite (no de SWC) es necesario para transformar
  // `.tsx` en el contexto de vitest. `@vitejs/plugin-react-swc`
  // funciona igual porque delega en el mismo runtime.
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/i18n/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
  resolve: {
    // Vite 8 resuelve los aliases de `tsconfig.json` de forma nativa.
    tsconfigPaths: true,
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@pages': new URL('./src/pages', import.meta.url).pathname,
      '@content': new URL('./src/content', import.meta.url).pathname,
    },
  },
});
