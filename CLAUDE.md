# Notes for AI assistants

Uniform inventory app for Pribadi school (SD/SMP/SMA). UI and README are in Indonesian. The owner (GitHub `iqbalyusa`) is new to programming: explain simply, give copy-paste commands, avoid jargon.

## The two shortcuts the owner uses

- **"push"** → after the change passes `npm test`, `npx tsc --noEmit` and `npm run build`, commit and push **directly to `main`**. No branches, no pull requests.
- **Live update** → the owner then runs one line in cPanel Terminal:
  ```bash
  bash ~/repositories/uniform/update.sh
  ```
  `update.sh` activates Node.js, runs `git pull`, `npm install`, `npm run build`, then restarts the app. Always end a change by telling the owner to run this line.

## How it is built

- Node.js 22.13+ server, no framework at runtime: `app.cjs` → `server/index.mjs` (HTTP + static files) → `dist/api.mjs` (bundled from `app/api/[...path]/route.ts` and `lib/server.ts`).
- Database: one SQLite file via `node:sqlite`. `server/database.mjs` runs `drizzle/*.sql` migrations (table `school_migrations`) and adapts SQLite to the small interface in `lib/database.ts`.
- `npm run build` (esbuild, `scripts/build-app.mjs`) writes `dist/public` (page + hashed assets) and `dist/api.mjs`. It keeps the previous build's assets.
- Business rules: `lib/server.ts`. Uniforms, sizes and the **staff list**: `lib/catalog.ts` (`staffNames`).
- Accounts are off (`lib/access.ts`, `accountsEnabled=false`); everyone edits in shared mode. The old account mode depended on ChatGPT/Sites sign-in, which no longer exists.
- Optional login: env `SERAGAM_PASSWORD` (+ `SERAGAM_USER`, default `seragam`). The owner turned it **off**.

## Live hosting (Hostinger cPanel, LiteSpeed/CloudLinux)

| What | Where |
|---|---|
| URL | https://uniform.pribadidepok.sch.id |
| Code | `/home/pribadisch/repositories/uniform` (clone of github.com/iqbalyusa/uniform) |
| Node.js app | cPanel → Setup Node.js App, root `repositories/uniform`, startup `app.cjs`, Node 22.23, env `SERAGAM_ORIGIN=https://uniform.pribadidepok.sch.id` |
| Node env | `source /home/pribadisch/nodevenv/repositories/uniform/22/bin/activate` (update.sh does this) |
| Database | `~/seragam-data/inventory.sqlite` (outside the repo; back it up) |

Hosting gotchas:
- Use `npm install`, **never `npm ci`**: `node_modules` is a CloudLinux symlink that `npm ci` deletes.
- `npm install` edits `package-lock.json`; run `git checkout -- package-lock.json` before `git pull` (update.sh does it).
- The cPanel **Restart** button does not reliably stop the old process. Real restart: `pkill -f "lsnode:/home/pribadisch/repositories/uniform"` (update.sh does it).
- The cPanel activate script reads unset variables (`CL_VIRTUAL_ENV`), so scripts with `set -u` must `set +u` around `source`.
- Code changes need a restart; data changes (stock entries) never do.

## Data history

The app used to run on Cloudflare Workers + D1 (`https://uniform.pribadisch.workers.dev`, still online read-only). On 2026-10-13 the data was copied into the cPanel SQLite file with `node scripts/import-cloudflare.mjs` (it only fills an empty database). Never commit data, `.sqlite` or export files: the repo is public.

## Developing on the owner's Windows PC

- Repo at `E:\Uniform Management App`. Run locally with `npm run dev` → http://127.0.0.1:5173 (dev database `.data/dev.sqlite`).
- Checks: `npm test`, `npx tsc --noEmit`, `npm run build`. `npm run lint` has older errors in UI files; don't treat them as new.
- Most files are stored with **CRLF** line endings; keep each file's existing endings so diffs stay small. `*.sh` must stay LF (`.gitattributes`).
- Git identity is set per-repo (`iqbalyusa`). Git pushes use the `iqbalyusa` GitHub login (`git config credential.username iqbalyusa`). The `gh` CLI on this PC is logged in as another account (`aegonnx`) without access, so don't rely on `gh` for this repo.
- If `node_modules` can't be deleted (Windows long paths), mirror an empty folder over it with `robocopy <empty> node_modules /MIR`, then reinstall.
