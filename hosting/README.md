# School hosting at pribadidepok.sch.id/seragam

This deployment serves the app's HTML, JavaScript, fonts and images from the school hosting. A PHP gateway forwards inventory operations to the existing Cloudflare Worker and D1 database. It does not copy or reset inventory. Cloudflare remains necessary for stock, history and backups.

## Requirements

- PHP 8.1 or newer with cURL and outbound HTTPS enabled.
- The school domain has a working HTTPS certificate.
- Apache or LiteSpeed processes the included `.htaccess` file.
- The current app has account enforcement disabled. This gateway does not implement Sites authentication.

## Build

```sh
npm ci
npm run build:school
```

Upload the generated `school-dist/seragam` folder. It includes production assets, `index.html`, `api.php`, `config.php`, and the hidden `.htaccess` file. It contains no inventory export or database credentials.

## Upload with cPanel or Hostinger File Manager

1. Select the website `pribadidepok.sch.id` and open its File Manager.
2. Open its document root, usually `public_html`, where the existing `wp-admin` and `wp-content` folders are located.
3. Upload and extract the prepared ZIP here. The result should be `public_html/seragam/index.html`, not `public_html/seragam/seragam/index.html`.
4. Ensure hidden files are shown and `seragam/.htaccess` was extracted. Use directory permissions 755 and file permissions 644.
5. Open `https://pribadidepok.sch.id/seragam/` and confirm stock loads.
6. Delete the uploaded ZIP from the public directory after extraction.

Leave the existing WordPress files and root `.htaccess` unchanged. The gateway uses a physical `api.php` endpoint so WordPress permalink rules do not need edits.

## Updates

GitHub pushes continue to deploy the Cloudflare backend. The school frontend is not automatically uploaded by that integration. After frontend changes, run `npm run build:school` and replace the contents of the school's `seragam` folder with the new package.

Keep `index.html` and its matching `assets` files together when updating. Existing inventory stays in the same D1 database throughout.

## Configuration

`hosting/school/config.php` points to `https://uniform.pribadisch.workers.dev` and accepts browser writes from `https://pribadidepok.sch.id`. Update these server-side values if either address changes. The local hosting test sets `SERAGAM_ORIGIN` to its loopback address; production uses the school address by default.

## Troubleshooting

- 404: confirm the ZIP was extracted into the actual domain's document root and the folder is named `seragam`.
- 403: confirm directory permissions 755 and file permissions 644.
- Gateway says cURL unavailable: enable the PHP cURL extension in the hosting's PHP settings.
- Gateway returns 502: verify outbound HTTPS access to the Worker, its availability, and the server's CA certificates. Keep TLS verification enabled.
- Writes rejected with 403: open the exact HTTPS school domain configured in `config.php`.
