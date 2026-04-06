#!/usr/bin/env node
/**
 * Regenerate `bones/*.bones.json` + `bones/registry.js` via boneyard-js Playwright capture.
 * Requires a running **production** server (`pnpm build && pnpm start -p 3020`) — Next dev
 * often yields empty layout for capture.
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.env.BONEYARD_BASE_URL ?? 'http://127.0.0.1:3020').replace(/\/$/, '')
const urls = ['dashboard', 'deals', 'deal-detail', 'generic'].map((s) => `${base}/boneyard-capture/${s}`)

const result = spawnSync(
  'pnpm',
  ['exec', 'boneyard-js', 'build', '--force', ...urls, '--out', './bones', '--wait', '2000'],
  { cwd: webRoot, stdio: 'inherit' },
)

process.exit(result.status ?? 1)
