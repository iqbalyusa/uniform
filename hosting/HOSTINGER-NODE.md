# School-hosted app and database, with Git updates

This is the current full Hostinger version. The runtime has no Cloudflare connection. It runs a Node.js server and a persistent SQLite database on the school hosting. It does not forward inventory requests to Cloudflare. Do not use the earlier PHP gateway package for this deployment.

For the requested layout, the real checkout can be moved to `~/public_html/seragam-app` using the protected relocation command at the end of this guide. Its root `.htaccess` blocks direct HTTP access to the entire checkout. The `/seragam` URL is served by Passenger/Node.js, separately from the protected `/seragam-app` directory. The SQLite database stays at `~/seragam-data/inventory.sqlite`.

## Using uniform.pribadidepok.sch.id

A subdomain document root must point to the browser build, not the protected repository root. Pointing it at `public_html/seragam-app` returns 403 by design.

First activate the existing Node.js environment and configure the root URL:

```sh
source ~/nodevenv/repositories/seragam-app/22/bin/activate
cd ~/public_html/seragam-app
git pull --ff-only origin main
node scripts/configure-hostinger-domain.mjs https://uniform.pribadidepok.sch.id /
SERAGAM_BASE_PATH=/ SERAGAM_ORIGIN=https://uniform.pribadidepok.sch.id bash hosting/node/deploy.sh
```

The configuration is saved in the Git-ignored `hosting/node/deployment.json`, so future builds retain the domain-root asset and API URLs even in a fresh Terminal session. Environment variables take precedence over this file.

In cPanel **Domains**, set the subdomain's Document root to `public_html/seragam-app/hostinger-dist/public`.

In **Setup Node.js App**, edit the existing application:

- Keep Application root unchanged (currently `seragam-app`, through its compatibility link).
- Set Application URL to `uniform.pribadidepok.sch.id`, with URI `/` (domain root).
- Keep startup file `app.cjs`, Node.js 22.13+ and Production mode.
- Set `SERAGAM_ORIGIN=https://uniform.pribadidepok.sch.id`.
- Set `SERAGAM_BASE_PATH=/`.
- Save and restart the app.

If Save reports that it cannot find `/home/pribadisch/nodevenv/public_html/seragam-app`, Node Selector resolved the relocated app's real path. Add the environment alias without moving or rebuilding the existing environment:

```sh
mkdir -p ~/nodevenv/public_html
ln -sT ~/nodevenv/repositories/seragam-app ~/nodevenv/public_html/seragam-app
```

Then save and restart again. If the link command reports that the destination already exists, inspect that path rather than deleting or replacing it. The relocation helper also maintains this environment alias, including when rerun on an app that has already moved.

This changes the URL without relocating its application root, Node.js environment or database. Do not run the Cloudflare migration again. Use the new domain for transactions after the change.

The build creates an allow rule in its public `.htaccess` to override the repository's deny rule only for browser files. It preserves Passenger directives added to that public file by cPanel during future staged builds. The root repository stays protected, and the Node server refuses hidden-file requests.

Future updates still use `seragam-update` if the Terminal alias was configured, or the pull/deploy commands in this guide. Verify the homepage, `/assets/...` and `/api/state` on the new domain before resuming stock entry.

## 1. Clone GitHub through cPanel

Open **Git Version Control → Create**. Enable **Clone a Repository** and enter:

- Clone URL: `https://github.com/iqbalyusa/uniform.git`
- Repository Path: `repositories/seragam-app` in the account home directory, outside `public_html`.
- Repository Name: `seragam`.

Create the repository here first. The protected relocation command below moves an existing built app into `public_html` and preserves its registered paths.

## 2. Create the Node.js application

Open **Setup Node.js App → Create Application**:

- Node.js version: **22.13 or newer**. The built-in SQLite database requires this version.
- Application mode: Production.
- Application root: `repositories/seragam-app` (the Git checkout).
- Application URL: select `pribadidepok.sch.id`, with URI `/seragam`.
- Application startup file: `app.cjs`.
- Environment variable `SERAGAM_ORIGIN`: `https://pribadidepok.sch.id` (no `/seragam` suffix).

Create/save the application. Copy the environment activation command displayed by cPanel. It contains the account-specific virtual environment path.

If Node.js 22.13+ is not available, stop here and ask the hosting provider to enable it. Selecting an older version will not run this package.

## 3. First build

Open **Terminal**, paste the environment activation command from Setup Node.js App, then enter the repository directory and run:

```sh
bash hosting/node/deploy.sh
```

The app uses the existing React UI and compiles its API for Node.js. cPanel serves it at `/seragam`. The default database location is `~/seragam-data/inventory.sqlite`, independent of the checkout location, outside both Git and `public_html`.

## 4. One-time copy from Cloudflare

Pause stock entry in both apps for the transfer. For an existing deployment, activate Node and update the checkout:

```sh
source ~/nodevenv/repositories/seragam-app/22/bin/activate
cd ~/repositories/seragam-app
git pull --ff-only origin main && bash hosting/node/migrate-from-cloudflare.sh
```

The script builds the school app, exports the latest stock, complete history, stock revisions, settings and all saved backups listed by the existing API, then imports them into the school SQLite database in one transaction. The current source has one saved backup. A private JSON source backup is saved next to the database with permissions 600. The export checks the source revision and quantities before and after; if the source keeps changing, it refuses the transfer. It never writes to Cloudflare.

The import accepts a completely unused database, including initialized zero balances. If the school database already has nonzero stock, revised balances, history, backups or modified settings, the import stops without overwriting records. Do not delete the school database to bypass this protection.

After a successful copy the script requests a Passenger restart. Click **Restart** in cPanel if necessary. Open the school app and compare the reported totals and history. Record all future transactions only at `https://pribadidepok.sch.id/seragam/`. The runtime uses only SQLite; an old `SERAGAM_BACKEND` environment variable is ignored. The Worker can remain as an untouched historical copy, but it is no longer connected to the school app.

This migration script is for the first transfer only. Later updates use `hosting/node/deploy.sh`, which never reimports the source.

### Import a downloaded archive instead

Pause entry in the old Cloudflare app during the final transfer. Use a fresh export so transactions made after an earlier export are not missed.

Upload the supplied private migration JSON into the account home directory, outside `public_html`, using File Manager. From the repository directory in the activated Node.js environment, run:

```sh
npm run import:hostinger -- ~/seragam-hostinger-migration.json
```

This imports stock, revisions, complete activity history, Staff names, settings and the saved backups included in the archive. It refuses to overwrite an already populated database. The private migration file and the SQLite database must never be committed to Git or put inside `public_html`.

Click **Restart** in Setup Node.js App, then open `https://pribadidepok.sch.id/seragam/`. Compare stock totals, history and backups before resuming entry on the school app. Keep the old Cloudflare database until the school deployment is verified; after cutover, record transactions only in the school app.

## 5. Future Git updates

Push code changes to GitHub normally:

```sh
git push origin main
```

On cPanel, either use **Git Version Control → Manage → Pull or Deploy → Update from Remote**, or activate the Node.js environment in Terminal, enter the repository directory, and run:

```sh
git pull --ff-only origin main
bash hosting/node/deploy.sh
```

The script installs build dependencies, builds into a staging directory, switches the build, and touches `tmp/restart.txt` to restart Passenger. It preserves the database. Previous hashed assets are retained for clients that loaded the page before the update.

Git pull updates source code; it does not build or restart Node by itself. This setup does not automatically pull on each GitHub push. Automatic push-to-server deployments need a separate SSH deployment connection.

## Backups and configuration

Use **Impor & cadangan** to download backups before updates and periodically. A Git repository backs up code, not inventory.

Optional `SERAGAM_DATABASE_PATH` selects a different absolute SQLite path. Set the same value during import and at runtime. Keep it outside the checkout and public website directory.

The current shared-editing behavior and Staff selector are preserved. Existing account enforcement is not enabled by this deployment.

## Moving an existing cPanel app

To place the actual checkout inside `public_html`, pause entry while running:

```sh
source ~/nodevenv/repositories/seragam-app/22/bin/activate
cd ~/repositories/seragam-app
git pull --ff-only origin main && node scripts/move-hostinger-public-html.mjs
```

The script checks the existing paths and the deny-all `.htaccess`, creates private source and SQLite backups under `~/seragam-relocation-backups/<timestamp>`, and moves the app to `~/public_html/seragam-app`. SQLite is backed up with `VACUUM INTO` so changes in its active WAL file are included. The database itself is not moved. An occupied destination stops the command without overwriting files. A failure after the move restores the original layout.

Both `~/seragam-app` and the old checkout path become links to the new directory. The existing Node.js environment, cPanel Application root, URI, startup file and activation command stay valid. Do not change Application root or move `nodevenv` as part of this operation. The script requests a Passenger restart; click **Restart** in cPanel if needed.

Afterward, `https://pribadidepok.sch.id/seragam/` must display the app, while `https://pribadidepok.sch.id/seragam-app/` and paths such as `/seragam-app/.git/HEAD` must be blocked (403/404). The deny-all rule protects all source files, built server files and configuration; Node.js reads its files locally and only serves its public browser assets.

Future updates use:

```sh
source ~/nodevenv/repositories/seragam-app/22/bin/activate
cd ~/public_html/seragam-app
git pull --ff-only origin main && bash hosting/node/deploy.sh
```

Keep the compatibility links in place. `repositories/seragam-app` is then a link, not a second copy. Keep the root `.htaccess`, database, migration JSON and private relocation backups in their designated locations. Do not rerun the Cloudflare import when moving or updating the app.
