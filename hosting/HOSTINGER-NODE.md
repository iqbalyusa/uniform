# School Node.js app with the existing Cloudflare inventory

The school hosting serves the website at `https://pribadidepok.sch.id/seragam/`. Its Node.js server forwards stock, history, settings and backup requests to `https://uniform.pribadisch.workers.dev`. That Worker continues to use the existing D1 database. The browser calls the school domain; it does not need cross-domain CORS access or a Cloudflare API token.

Cloudflare is now the default backend. No stock is imported, copied or merged during deploy. A Worker outage returns an error and never switches to the separate SQLite database. Movement request IDs and stock revisions pass through unchanged, so existing multi-item purchases, Staff records, duplicate-request protection and concurrent stock checks still run in the Worker.

## Update the existing school deployment

Use the Node.js activation command for the environment currently present on the server. For this account it is:

```sh
source /home/pribadisch/nodevenv/repositories/seragam-app/22/bin/activate
cd /home/pribadisch/repositories/seragam-app
git pull --ff-only origin main && bash hosting/node/deploy.sh
```

The deploy script builds the website and touches `tmp/restart.txt` to request a Passenger restart. If necessary, click **Restart** in Setup Node.js App. Keep startup file `app.cjs`, Production mode and Node.js 22.13 or newer. Preserve the existing application registration; changing the backend does not require moving directories or recreating the app.

`SERAGAM_ORIGIN` must be `https://pribadidepok.sch.id`. `SERAGAM_BACKEND` may be omitted or explicitly set to `cloudflare`. If the app has an existing `SERAGAM_BACKEND=sqlite` setting, change it to `cloudflare` and restart. The existing `SERAGAM_DATABASE_PATH` setting has no effect in Cloudflare mode.

Open the school app and compare stock and history with the original Worker app. Both addresses use the same database after this deployment. Keep `~/seragam-data` intact; that separate database is not accessed in Cloudflare mode.

## Future updates

Push code to GitHub, then run the same pull/deploy commands above on the school hosting. A GitHub push does not automatically pull into cPanel. Cloudflare's existing GitHub integration continues to deploy the Worker.

## First installation

Clone the repository into `~/repositories/seragam-app`. Create the Node.js app with application root `repositories/seragam-app`, URI `seragam`, startup `app.cjs`, Node.js 22.13+, Production mode, and `SERAGAM_ORIGIN=https://pribadidepok.sch.id`. Activate the environment using the command supplied by cPanel, enter the checkout and run `bash hosting/node/deploy.sh`.

For an already registered app, do not attempt a folder relocation as part of this database change. The application root and activation environment must resolve to the existing files before Passenger can restart successfully.

## Optional local database

Explicitly set `SERAGAM_BACKEND=sqlite` to use the separate school-hosted database. The [SQLite migration guide](HOSTINGER-SQLITE.md) describes that alternative. The databases are independent; switching back does not synchronize quantities or transactions. Do not import the school database over the existing Cloudflare inventory.
