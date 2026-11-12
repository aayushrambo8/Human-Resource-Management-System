import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite 8 transforms with oxc and honours tsconfig's `"jsx": "preserve"`
  // (a Next.js convention) — which would hand raw JSX to import-analysis in
  // test files. Override it here so .tsx tests compile with the automatic
  // JSX runtime. (`esbuild.jsx` is deprecated in Vite 8 and silently ignored.)
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The app reads/writes sessionStorage and dispatches window events, so
    // every suite runs in a fresh DOM per file.
    restoreMocks: true,
  },
});
