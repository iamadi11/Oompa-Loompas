#!/usr/bin/env node
/**
 * Fixes common P1010 on macOS Homebrew Postgres: role "postgres" does not exist
 * or has no rights — local superuser is usually your login name.
 *
 * Rewrites DATABASE_URL in apps/api/.env to:
 *   postgresql://<os-username>@127.0.0.1:5432/oompa_dev
 *
 * Run: node scripts/use-local-postgres-url.cjs
 * Then: createdb oompa_dev  (if the DB does not exist)
 * Then: cd packages/db && pnpm db:migrate -- --name init
 */
const fs = require('fs')
const path = require('path')
const os = require('os')

const root = path.join(__dirname, '..')
const envPath = path.join(root, 'apps', 'api', '.env')
const examplePath = path.join(root, 'apps', 'api', '.env.example')
const user = os.userInfo().username
const url = `postgresql://${encodeURIComponent(user)}@127.0.0.1:5432/oompa_dev`

let content
try {
  content = fs.readFileSync(envPath, 'utf8')
} catch {
  content = fs.readFileSync(examplePath, 'utf8')
}

const lines = content.split(/\r?\n/)
let found = false
const out = lines.map((line) => {
  if (line.startsWith('DATABASE_URL=')) {
    found = true
    return `DATABASE_URL=${url}`
  }
  return line
})
if (!found) out.unshift(`DATABASE_URL=${url}`)

fs.writeFileSync(envPath, out.join('\n') + '\n', 'utf8')
process.stdout.write(
  `Updated apps/api/.env → DATABASE_URL uses OS user "${user}" @ 127.0.0.1:5432/oompa_dev\n` +
    `Next: createdb oompa_dev  (if needed)\n` +
    `Then:  cd packages/db && pnpm db:migrate -- --name init\n`,
)
