# School-hosted app and database, with Git updates

This is the full Hostinger version. It runs a Node.js server and a persistent SQLite database on the school hosting. It does not forward inventory requests to Cloudflare. Do not use the earlier PHP gateway package for this deployment.

## 1. Clone GitHub through cPanel

Open **Git Version Control → Create**. Enable **Clone a Repository** and enter:

- Clone URL: `https://github.com/iqbalyusa/uniform.git`
- Repository Path: `repositories/seragam-app` in the account home directory, outside `public_html`.
- Repository Name: `seragam`.

Create the repository. Keep the Git checkout outside WordPress's public directory because it contains server code and configuration.

## 2. Create the Node.js application

Open **Setup Node.js App → Create Application**:

- Node.js version: **22.13 or newer**. The built-in SQLite database requires this version.
- Application mode: Production.
- Application root: `repositories/seragam-app` (the Git checkout).
- Application URL: select `pribadidepok.sch.id`, with URI `/seragam`.
- Application startup file: `app.cjs`.
- Environment variable `SERAGAM_BACKEND`: `sqlite` (this guide describes the optional local database).
- Environment variable `SERAGAM_ORIGIN`: `https://pribadidepok.sch.id` (no `/seragam` suffix).

Create/save the application. Copy the environment activation command displayed by cPanel. It contains the account-specific virtual environment path.

If Node.js 22.13+ is not available, stop here and ask the hosting provider to enable it. Selecting an older version will not run this package.

## 3. First build

Open **Terminal**, paste the environment activation command from Setup Node.js App, then enter the repository directory and run:

```sh
bash hosting/node/deploy.sh
```

The app uses the existing React UI and compiles its API for Node.js. cPanel serves it at `/seragam`. The default database location is `~/seragam-data/inventory.sqlite`, independent of the checkout location, outside both Git and `public_html`.

## 4. Import the operational database

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

The Node.js Selector relocates the app environment when its application root changes. Do not create a second clone in the intended destination before asking cPanel to relocate an existing application. Keep the source directory, app registration, activation command and Passenger paths consistent. A successful build alone does not confirm that cPanel registered the new location.
