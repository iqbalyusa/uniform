#!/usr/bin/env bash
set -eu
cd -- "$(dirname -- "$0")/../.."
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13)){console.error("Activate the cPanel Node.js 22.13+ environment first.");process.exit(1)}'
seragam_lock_copy="$(mktemp)"
cp package-lock.json "$seragam_lock_copy"
cleanup_lock(){ cp "$seragam_lock_copy" package-lock.json; rm -f "$seragam_lock_copy"; }
trap cleanup_lock EXIT
npm install --include=dev --no-audit --no-fund
npm run build:hostinger
mkdir -p tmp
touch tmp/restart.txt
printf '%s\n' "Build ready; Passenger restart requested. Backend: ${SERAGAM_BACKEND:-cloudflare}. No inventory was copied or replaced."
