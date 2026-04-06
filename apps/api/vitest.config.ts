import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@oompa/db': path.resolve(__dirname, 'src/__tests__/__mocks__/db.ts'),
      // Use workspace source so invoice HTML tests do not depend on a pre-built `dist`.
      '@oompa/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts', 'src/__tests__/**'],
    },
  },
})
