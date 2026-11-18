#!/bin/sh
# Build sandbox D into ../public/d (published at https://fadesalome-design.github.io/energy/d/).
# Uses the main app's installed packages (../node_modules); changes nothing outside d/ and public/d/.
# Also publishes the demo data and the design tokens for Lovable:
#   /energy/d/data/{places,classes,ratings,questions}.json and /energy/d/docs/design-tokens.md
set -e
cd "$(dirname "$0")"
../node_modules/.bin/tsc --noEmit -p tsconfig.json
../node_modules/.bin/vite build --config vite.config.ts
node scripts/design-tokens.mjs
mkdir -p ../public/d/data ../public/d/docs
cp data/places.json data/classes.json data/ratings.json data/questions.json ../public/d/data/
cp docs/design-tokens.md ../public/d/docs/
