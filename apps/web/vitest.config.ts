import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const appRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': appRoot,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
      include: ['lib/**/*.ts'],
      /** Thin DOM helpers — covered by LoginForm integration in browser; jsdom is flaky on Node 24 in Vitest. */
      exclude: ['lib/**/*.test.ts', 'lib/forms/**', 'lib/motion/**'],
    },
  },
})
