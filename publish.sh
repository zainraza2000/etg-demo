#!/usr/bin/env bash
# Refresh this demo from the monorepo design kit, then push (Pages rebuilds ~1 min).
# Usage: ./publish.sh [path-to-kit]   (default: ../etg-monorepo/.agents/skills/etg-design/ui_kits/dashboard)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${1:-$HERE/../etg-monorepo/.agents/skills/etg-design/ui_kits/dashboard}"
[ -d "$SRC" ] || { echo "kit not found: $SRC" >&2; exit 1; }
command -v rsync >/dev/null || { echo "rsync required" >&2; exit 1; }
# Copy the kit over the demo root, but never clobber the repo's own README/.git/.nojekyll/publish.sh.
rsync -a --exclude README.md --exclude .git --exclude .nojekyll --exclude publish.sh "$SRC"/ "$HERE"/
git -C "$HERE" add -A
git -C "$HERE" commit -m "chore: refresh design demo from monorepo kit" || { echo "no changes"; exit 0; }
git -C "$HERE" push
echo "pushed — https://zainraza2000.github.io/etg-demo/ rebuilds in ~1 min"
