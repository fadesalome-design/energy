# Version C (experiments)

Independent copy of Version D for experiments (made on 18 Nov). D stays the stable presentation version.
Its own source (`c/src`), data (`c/data`), config and storage keys (`c_rtr.*`), so nothing in C affects D.

- **Live:** https://fadesalome-design.github.io/energy/c/ (tester link: `/energy/c/?tester=1`)
- **Notes:** [docs/variant-c.md](docs/variant-c.md)

## Build and publish

```sh
./c/build.sh        # type-checks c/src and builds into public/c
git add c public/c && git commit && git push
```

The main build copies `public/c` to the site as-is, so publishing C needs no change to the main
app, D, its config or the GitHub Pages workflow.
