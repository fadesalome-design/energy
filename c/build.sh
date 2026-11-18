#!/bin/sh
# Build Version C into ../public/c (published at https://fadesalome-design.github.io/energy/c/).
# Uses the main app's installed packages (../node_modules); changes nothing outside c/ and public/c/.
set -e
cd "$(dirname "$0")"
../node_modules/.bin/tsc --noEmit -p tsconfig.json
../node_modules/.bin/vite build --config vite.config.ts
