/**
 * Ensures committed PWA source assets exist (manifest + icons).
 * Service worker files under public/ are build outputs — see root .gitignore.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const required = [
  'app/manifest.ts',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
]

let failed = false
for (const rel of required) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) {
    console.error(`Missing required PWA file: ${rel}`)
    failed = true
  }
}

if (failed) {
  process.exit(1)
}

console.log('PWA source artifacts OK')
