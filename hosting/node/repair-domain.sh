#!/usr/bin/env bash
set -eu
cd -- "$(dirname -- "$0")/../.."
seragam_domain="${1:?Usage: bash hosting/node/repair-domain.sh https://uniform.pribadidepok.sch.id}"
node --input-type=module -e 'import {validateOrigin} from "./hosting/node/config.mjs";validateOrigin(process.argv[1]);' "$seragam_domain"
node scripts/repair-hostinger-registration.mjs
node scripts/configure-hostinger-domain.mjs "$seragam_domain" /
SERAGAM_BASE_PATH=/ SERAGAM_ORIGIN="$seragam_domain" bash hosting/node/deploy.sh
printf '%s\n' 'Repair and domain-root build complete. Reopen the app from cPanel Web Applications, keep Application root seragam-app, save the subdomain settings, and restart.'
