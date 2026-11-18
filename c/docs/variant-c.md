# Variant C (experiments)

Copy of D made on 18 Nov for experiments; D stays the stable presentation version.

- Live: https://fadesalome-design.github.io/energy/c/ (same parameters as D: `?frame=phone`, `?scale=`, `?user=`, `?tester=1`)
- Source: `c/` · build: `c/build.sh` → `public/c/`
- Saved state is separate from D: every browser storage key in C starts with `c_rtr.` (D uses `rtrD.`).
- Marker: a small grey "C · test" tag in the header and the tab title "Urban Sports Clue · C (test)".
- `docs/variant-d.md` in this folder is D's history at the time of the copy.

## Change log

- **18 Nov: colour themes.** All colours in C now live in one place: the theme tokens at the top of
  `c/src/styles/global.css`. The admin chart colours were moved there too. Two themes:
  - **violet** (default): `--primary` #5B50D6, `--primary-dark` #4840B8, `--ink` #1E1F2B, `--bg`
    #F6F6FB (cards #FFFFFF), `--tint` #ECEBFD, `--accent` #E5487A (stamps and rewards only),
    `--border` #E4E3EE.
  - **green**: the original D palette.

  Switch with `?theme=green` / `?theme=violet`; it works with `?frame=phone`, `?scale=` and
  `?user=`. Only colours changed. Contrast: every visible text was checked on all key screens in
  both themes; none is under 4.5:1 (lowest: violet 5.1:1, green 4.8:1). The reward ticket uses
  `--primary-dark` in violet because white on pink would be about 3.6:1. The "C · test" tag text was
  darkened to `--muted` for contrast. C has no rating bubble with a "new" dot, so none was added.
