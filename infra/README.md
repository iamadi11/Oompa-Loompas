# Local infrastructure

## GitHub Actions (CI/CD)

Workflows live in **`.github/workflows/`**:

| Workflow | When | GitHub Environment |
|----------|------|--------------------|
| **`ci.yml`** | Push / PR to **`main`** | _(none — repo defaults)_ |
| **`deploy-staging.yml`** | Push to **`staging`** or **workflow dispatch** | **`staging`** |
| **`deploy-production.yml`** | **Release published** or **workflow dispatch** | **`production`** |

Create Environments under **Settings → Environments**. Suggested **variables** per environment: **`NEXT_PUBLIC_API_URL`** (and your API base URL for the web build). Suggested **secrets**: **`STAGING_DEPLOY_TOKEN`**, **`PRODUCTION_DEPLOY_TOKEN`** (or replace deploy steps with your provider’s CLI).

The **`deploy-*`** jobs ship with a **no-op deploy** until you wire a real command; **`quality`** already runs typecheck, lint, test, and build.

## PostgreSQL (recommended for `P1010` / permission errors)

On macOS with **Homebrew Postgres**, run once from the repo root:

```bash
pnpm db:use-local-pg
```

That rewrites `apps/api/.env` so `DATABASE_URL` uses your login name (not `postgres:postgres`). Then create the DB if needed (`createdb oompa_dev`) and run migrations from `packages/db`.

If `pnpm db:migrate` fails with **P1010** (user denied on `oompa_dev`), your `DATABASE_URL` user usually does not own or cannot connect to that database. Common cases:

1. **Homebrew Postgres** — the superuser is often your **macOS login name**, not `postgres`. Fix by either:
   - Setting `DATABASE_URL` in `apps/api/.env` to  
     `postgresql://YOUR_MAC_USERNAME@localhost:5432/oompa_dev`  
     (create the DB once: `createdb oompa_dev`), or  
   - Creating a `postgres` role and database in `psql` (advanced).

2. **Docker (matches `.env.example`)** — from the repo root:

   ```bash
   docker compose -f infra/docker-compose.postgres.yml up -d
   ```

   Wait until healthy, then:

   ```bash
   cd packages/db && pnpm db:migrate -- --name init
   ```

   Stop local Postgres on port **5432** first if it conflicts, or change the published port in the compose file and update `DATABASE_URL`.

### Manual grants (existing cluster, superuser session)

If the database exists but `postgres` (or your app user) lacks rights:

```sql
CREATE DATABASE oompa_dev;
GRANT ALL PRIVILEGES ON DATABASE oompa_dev TO postgres;
\c oompa_dev
GRANT ALL ON SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
```

Adjust role/database names to match your `DATABASE_URL`.
