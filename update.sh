#!/usr/bin/env bash
# One-step update on the hosting: download new code, build it, and restart the app.
# Usage: bash ~/repositories/uniform/update.sh
set -euo pipefail

# Everything runs inside main so bash has read the whole file before `git pull` can replace it.
main(){
 local app activate
 app="$(cd "$(dirname "$0")" && pwd)"
 cd "$app"

 # Switch on the Node.js environment cPanel created for this app (~/nodevenv/<app root>/<version>).
 if ! command -v npm >/dev/null 2>&1; then
  activate="$(ls -d "$HOME/nodevenv/${app#"$HOME"/}"/*/bin/activate 2>/dev/null | sort -V | tail -n 1 || true)"
  if [ -z "$activate" ]; then echo "Node.js environment not found. Create the app in Setup Node.js App first." >&2; exit 1; fi
  # cPanel's activate script reads variables that may be unset, so relax `set -u` while loading it.
  set +u
  # shellcheck disable=SC1090
  source "$activate"
  set -u
 fi

 echo "1/4 Downloading new code..."
 git checkout -- package-lock.json
 git pull --ff-only
 echo "2/4 Installing packages..."
 npm install --include=dev --no-audit --no-fund
 echo "3/4 Building..."
 npm run build
 echo "4/4 Restarting..."
 mkdir -p tmp && touch tmp/restart.txt
 # Stop the running copy so the next visit starts the new code. Saved data is not affected.
 pkill -f "lsnode:$app" || true
 echo "Done. The new version loads on the next visit. Data in ~/seragam-data was not touched."
}
main "$@"
exit
