#!/usr/bin/env bash
set -eu
cd -- "$(dirname -- "$0")/../.."
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13))throw Error("Activate the cPanel Node.js 22.13+ environment first.")'
seragam_lock_copy="$(mktemp)"
cp package-lock.json "$seragam_lock_copy"
cleanup_lock(){ cp "$seragam_lock_copy" package-lock.json; rm -f "$seragam_lock_copy"; }
trap cleanup_lock EXIT
npm install --include=dev --no-audit --no-fund
npm run build:hostinger
node scripts/migrate-cloudflare-to-hostinger.mjs
node scripts/request-hostinger-restart.mjs
printf '%s\n' 'Import succeeded; Passenger restart requested. Backend: school-hosted SQLite only.'
