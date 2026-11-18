#!/bin/sh
# Build sandbox D into ../public/d (published at https://fadesalome-design.github.io/energy/d/).
# Uses the main app's installed packages (../node_modules); changes nothing outside d/ and public/d/.
set -e
cd "$(dirname "$0")"
../node_modules/.bin/tsc --noEmit -p tsconfig.json
../node_modules/.bin/vite build --config vite.config.ts
