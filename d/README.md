# Sandbox D

Working copy of the app (based on Version B) for changes from user feedback. It's fully separate
from the main app: its own source (`d/src`), config and storage keys (`rtrD.*`).

- **Live:** https://fadesalome-design.github.io/energy/d/ (tester link: `/energy/d/?tester=1`)
- **Screens and reasons:** [docs/variant-d.md](docs/variant-d.md)

## Build and publish

```sh
./d/build.sh        # type-checks d/src and builds into public/d
git add d public/d && git commit && git push
```

The main build copies `public/d` to the site as-is, so publishing D needs no change to the main
app, its config or the GitHub Pages workflow. Commit `public/d` after every change to D.
