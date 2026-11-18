# Version D – design tokens

Generated from `d/src/styles/global.css` by `d/scripts/design-tokens.mjs` (run on every D build),
so this list always matches the CSS. "Uses" = number of declarations; "Where" = example selectors.

## 1. CSS variables (custom properties)

| Variable | Value | Defined in |
|---|---|---|
| `--bg` | `#f6f4ef` | `:root` |
| `--surface` | `#ffffff` | `:root` |
| `--ink` | `#1e2a2d` | `:root` |
| `--muted` | `#55615f` | `:root` |
| `--line` | `#e3ded4` | `:root` |
| `--accent` | `#1d6a66` | `:root` |
| `--accent-ink` | `#134b48` | `:root` |
| `--accent-soft` | `#e4efec` | `:root` |
| `--focus` | `#1d6a66` | `:root` |
| `--calm-bg` | `#e4efec` | `:root` |
| `--calm-ink` | `#134b48` | `:root` |
| `--moderate-bg` | `#f1ebdd` | `:root` |
| `--moderate-ink` | `#5c4a1e` | `:root` |
| `--busy-bg` | `#f3e4dc` | `:root` |
| `--busy-ink` | `#6b3420` | `:root` |
| `--radius` | `18px` | `:root` |
| `--radius-sm` | `10px` | `:root` |
| `--gutter` | `20px` | `:root` |
| `--tap` | `48px` | `:root` |
| `--font` | `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | `:root` |
| `--e-shadow` | `0 1px 2px rgba(30, 42, 45, 0.05), 0 6px 20px rgba(30, 42, 45, 0.06)` | `.shell--e` |
| `--e-shadow-hover` | `0 2px 4px rgba(30, 42, 45, 0.06), 0 10px 28px rgba(30, 42, 45, 0.1)` | `.shell--e` |
| `--e-line` | `#ebe6dc` | `.shell--e` |
| `--e-tint` | `#eaf3f0` | `.shell--e` |
| `--emd-tint` | `#eaf3f0` | `.emd` |
| `--emd-shadow` | `0 1px 2px rgba(30, 42, 45, 0.05), 0 6px 20px rgba(30, 42, 45, 0.06)` | `.emd` |
| `--phone-scale` | `1` | `.pframe` |
| `--w` | `min(230px, 62vw)` | `.aura` |
| `--h` | `calc(var(--w) * 1.12)` | `.aura` |
| `--w` | `150px` | `.aura--md` |
| `--w` | `120px` | `.aura--sm` |
| `--w` | `250px` | `@media (min-width: 1024px) → .aura--lg` |
| `--aura-a` | `#9fe1cb` | `.aura--l0` |
| `--aura-b` | `#e4e2f7` | `.aura--l0` |
| `--pulse` | `1.03` | `.aura--l0` |
| `--aura-op` | `0.70` | `.aura--l0` |
| `--halo-op` | `0.50` | `.aura--l0` |
| `--aura-a` | `#5dcaa5` | `.aura--l1` |
| `--aura-b` | `#d7d3f6` | `.aura--l1` |
| `--pulse` | `1.05` | `.aura--l1` |
| `--aura-op` | `0.85` | `.aura--l1` |
| `--halo-op` | `0.70` | `.aura--l1` |
| `--aura-a` | `#8f86e3` | `.aura--l2` |
| `--aura-b` | `#c9f0e2` | `.aura--l2` |
| `--pulse` | `1.065` | `.aura--l2` |
| `--aura-op` | `0.95` | `.aura--l2` |
| `--halo-op` | `0.85` | `.aura--l2` |
| `--aura-a` | `#7cc47a` | `.aura--l3` |
| `--aura-b` | `#cecbf6` | `.aura--l3` |
| `--pulse` | `1.08` | `.aura--l3` |
| `--aura-op` | `1` | `.aura--l3` |
| `--halo-op` | `1` | `.aura--l3` |
| `--w` | `196px` | `.fb--d .aura--lg` |

## 2. Colours (literal values, besides the variables above)

| Colour | Uses | Where (examples) |
|---|---|---|
| `#fff` | 38 | `.devbar`, `.devbar a`, `.devbar__seg button` |
| `#ffffff` | 13 | `.aura-stamps`, `.aura__speck`, `.aura__dot--on` |
| `#000` | 4 | `.ticket` |
| `rgba(255,255,255,0.5)` | 3 | `.devbar__seg`, `.devbar__btns button`, `.aura__dot` |
| `rgba(30,42,45,0.12)` | 3 | `.tabs__tab--on`, `.sortsw__opt--on`, `.dpanel__close` |
| `#dce8e4` | 3 | `.em`, `.em__explain`, `.emd` |
| `#d7d3f6` | 3 | `.sdone__card`, `.sgrid__slot--on`, `.medal--choice .medal__coin` |
| `#afa9ec` | 3 | `.sgrid__slot--on`, `.medal--choice .medal__coin`, `.medal--choice .medal__bar > span` |
| `rgba(0,0,0,0.2)` | 2 | `.toggle__switch::after`, `.qd2__knob` |
| `rgba(255,255,255,0.85)` | 2 | `.em__explain`, `.aura__dot--on` |
| `#cfc9bd` | 2 | `.qd2__switch`, `.shell--e .src--none` |
| `#eaf3f0` | 2 | `.photo`, `.photo__fallback` |
| `#d5e8e1` | 2 | `.photo`, `.photo__fallback` |
| `rgba(30,42,45,0.28)` | 2 | `.dpanel__backdrop`, `.pframe__device` |
| `rgba(30,42,45,0.16)` | 2 | `.dpanel__panel`, `.pframe__device` |
| `rgba(246,244,239,0)` | 2 | `.sheet__body` |
| `#e1f5ee` | 2 | `.sdone__done:disabled`, `.medal__bar` |
| `#9fe1cb` | 2 | `.medal--socks .medal__coin`, `.medal__claim` |
| `#5dcaa5` | 2 | `.medal--socks .medal__coin`, `.medal__bar > span` |
| `#97c459` | 2 | `.medal--hoodie .medal__coin`, `.medal--hoodie .medal__bar > span` |
| `#fbfaf7` | 1 | `.xrow__toggle:hover` |
| `#bdb6a8` | 1 | `.spectrum__tick` |
| `rgba(246,244,239,0.96)` | 1 | `.actions` |
| `#ece9e2` | 1 | `@media (min-width: 560px) → body` |
| `rgba(255,255,255,0.2)` | 1 | `.devbar__row--fb` |
| `#b3261e` | 1 | `.voice__dot` |
| `rgba(19,75,72,0.25)` | 1 | `.ticket` |
| `rgba(255,255,255,0.16)` | 1 | `.ticket__icon` |
| `rgba(255,255,255,0.45)` | 1 | `.ticket__body` |
| `rgba(255,255,255,0.28)` | 1 | `.ticket__shine` |
| `#7fb5ad` | 1 | `.confetti__bit--t1` |
| `#d9c48f` | 1 | `.confetti__bit--t2` |
| `#e0a98f` | 1 | `.confetti__bit--t3` |
| `rgba(30,42,45,0.4)` | 1 | `.sheet__backdrop` |
| `#008779` | 1 | `.hbars__bar` |
| `rgba(255,255,255,0.8)` | 1 | `.em__skip` |
| `rgba(29,106,102,0.28)` | 1 | `.em-tile--on` |
| `rgba(255,255,255,0.18)` | 1 | `.em-tile--on .em-tile__icon` |
| `#cfe2dd` | 1 | `.qd2--on` |
| `rgba(30,42,45,0.14)` | 1 | `.sheet__body` |
| `rgba(30,42,45,0.18)` | 1 | `.sheet__body` |
| `rgba(30,42,45,0.25)` | 1 | `@media (min-width: 1024px) → .sheet__panel` |
| `#eef4f1` | 1 | `.pframe` |
| `#e3ece8` | 1 | `.pframe` |
| `#dde6e2` | 1 | `.pframe` |
| `#1b2427` | 1 | `.pframe__device` |
| `#2f3b3e` | 1 | `.pframe__device` |
| `#0f1517` | 1 | `.pframe__island` |
| `rgba(30,42,45,0.05)` | 1 | `.pcard` |
| `rgba(30,42,45,0.06)` | 1 | `.pcard` |
| `#04342c` | 1 | `.fb--aura .fb__back` |
| `rgba(255,255,255,0.55)` | 1 | `.aura__line` |
| `#d3d1c7` | 1 | `.sgrid__slot` |
| `#bde8da` | 1 | `.sgrid__slot--on` |
| `#7cc47a` | 1 | `.flydot` |
| `#cecbf6` | 1 | `.flydot` |
| `#085041` | 1 | `.medal--socks .medal__coin` |
| `rgba(93,202,165,0.45)` | 1 | `.medal--socks .medal__coin` |
| `#c0dd97` | 1 | `.medal--hoodie .medal__coin` |
| `#27500a` | 1 | `.medal--hoodie .medal__coin` |
| `#eeedfe` | 1 | `.medal--choice .medal__bar` |
| `#eaf3de` | 1 | `.medal--hoodie .medal__bar` |

## 3. Fonts

| Font family | Uses | Where (examples) |
|---|---|---|
| `var(--font)` | 1 | `body` |

## 4. Font sizes

| Font size | Uses | Where (examples) |
|---|---|---|
| `0.875rem` | 34 | `.small`, `.row__studio`, `.flow__int` |
| `0.8125rem` | 29 | `.eyebrow`, `.devbar`, `.chip` |
| `0.9375rem` | 28 | `.meta`, `.xrow__more`, `.xrow__panel` |
| `0.75rem` | 16 | `.ticket__eyebrow`, `.sbar__seg`, `.proto__label` |
| `1rem` | 8 | `.bringlist__icon`, `.btn`, `.ai__h3` |
| `1.0625rem` | 7 | `.row__start`, `.fb__lead`, `.opt__word` |
| `1.125rem` | 5 | `.brand`, `.picker__name`, `.panel__h` |
| `1.25rem` | 3 | `h2`, `.em__q`, `.sdone__title` |
| `1.625rem` | 3 | `.fb__title`, `.ticket__title`, `@media (max-width: 420px) → .admin h1` |
| `1.5rem` | 3 | `.cpanel__head h2`, `@media (max-width: 420px) → .stat__value`, `.avatar--lg` |
| `1.1875rem` | 2 | `.fb__classname`, `.panel h2` |
| `2rem` | 2 | `.admin h1`, `.shell--e .list-head h1` |
| `1.875rem` | 2 | `.stat__value`, `.shell--e .detail-head h1` |
| `1.375rem` | 2 | `.section-title`, `.shell--e .expect__head h2` |
| `16px` | 1 | `body` |
| `1.75rem` | 1 | `h1` |
| `0.85em` | 1 | `code` |
| `0.6875rem` | 1 | `.ai-tag` |
| `inherit` | 1 | `.xrow__heading` |
| `17px` | 1 | `@media (min-width: 1024px) → body` |

## 5. Font weights

| Font weight | Uses | Where (examples) |
|---|---|---|
| `600` | 60 | `.eyebrow`, `.back`, `.chip` |
| `700` | 26 | `.brand`, `.devbar__seg button[aria-pressed='true']`, `.row__start` |
| `650` | 24 | `h1`, `h2`, `.badge` |
| `500` | 9 | `.table tbody th`, `.shell--e .row__main .chip`, `.shell--e .xrow--v4 .xrow__value` |
| `550` | 3 | `.vibe`, `.flow__name`, `.report-note` |
| `400` | 2 | `.src-inline`, `.bestfirst .muted` |
| `inherit` | 1 | `.xrow__heading` |
| `750` | 1 | `.ticket__title` |

## 6. Radii

| Radius | Uses | Where (examples) |
|---|---|---|
| `999px` | 39 | `.chip`, `.badge`, `.ai-tag` |
| `50%` | 32 | `.dot`, `.spectrum__tick`, `.spectrum__marker` |
| `var(--radius)` | 12 | `.row`, `.card`, `.after-note` |
| `12px` | 10 | `.xrow__icon`, `.fb__classicon`, `.seg__opt` |
| `14px` | 8 | `.btn`, `.opt`, `.ai__list li` |
| `16px` | 7 | `.fb__qicon`, `@media (max-width: 359px) → .pills .pill`, `.em-tile` |
| `var(--radius-sm)` | 6 | `.skip`, `.notice`, `.vibe` |
| `2px` | 6 | `.spectrum__track`, `.fb__step`, `.lvl__bar` |
| `20px` | 5 | `.shell--e .row`, `.detail-photo`, `.pcard` |
| `4px` | 4 | `code`, `.match__bar`, `.match__bar span` |
| `8px` | 4 | `.devbar__seg`, `.check__box`, `.devbar__btns button` |
| `18px` | 4 | `.ticket`, `.em__follow`, `.qd2` |
| `6px` | 3 | `:focus-visible`, `.tag`, `.proto__label` |
| `24px` | 3 | `.em`, `.shell--e .expect`, `.emd` |
| `10px` | 2 | `.fb__back`, `.btn--sm` |
| `9px` | 2 | `.tabs__tab`, `.sortsw__opt` |
| `0 4px 4px 0` | 2 | `.sbar__seg--last`, `.hbars__bar` |
| `0` | 2 | `.emd__panel`, `@media (max-width: 500px) → .pframe__box, .pframe__device, .` |
| `6px 6px 2px 2px` | 1 | `.flow__seg` |
| `22px 22px 0 0` | 1 | `.sheet__panel` |
| `3px` | 1 | `.legend__sw` |
| `4px 0 0 4px` | 1 | `.sbar__seg--first` |
| `22px` | 1 | `@media (min-width: 1024px) → .sheet__panel` |
| `68px` | 1 | `.pframe__device` |
| `56px` | 1 | `.pframe__screenwrap` |
| `48% 52% 50% 50% / 46% 46% 54% 54%` | 1 | `.aura__body` |

## 7. Shadows

| Shadow | Uses | Where (examples) |
|---|---|---|
| `var(--e-shadow)` | 4 | `.em`, `.qd2`, `.shell--e .row` |
| `0 1px 2px rgba(30, 42, 45, 0.12)` | 2 | `.tabs__tab--on`, `.sortsw__opt--on` |
| `0 0 0 1.5px var(--accent)` | 1 | `.spectrum__marker` |
| `0 0 0 1px var(--line)` | 1 | `@media (min-width: 560px) → .shell` |
| `0 10px 24px rgba(19, 75, 72, 0.25)` | 1 | `.ticket` |
| `0 1px 2px rgba(0, 0, 0, 0.2)` | 1 | `.toggle__switch::after` |
| `0 6px 16px rgba(29, 106, 102, 0.28)` | 1 | `.em-tile--on` |
| `0 1px 3px rgba(0, 0, 0, 0.2)` | 1 | `.qd2__knob` |
| `var(--e-shadow-hover)` | 1 | `.shell--e .row:hover` |
| `var(--emd-shadow)` | 1 | `.emd` |
| `-12px 0 40px rgba(30, 42, 45, 0.16)` | 1 | `.dpanel__panel` |
| `0 2px 8px rgba(30, 42, 45, 0.12)` | 1 | `.dpanel__close` |
| `0 24px 64px rgba(30, 42, 45, 0.25)` | 1 | `@media (min-width: 1024px) → .sheet__panel` |
| `0 0 0 2px #2f3b3e, 0 40px 90px rgba(30, 42, 45, 0.28), 0 12px 28px rgba(30, 42, 45, 0.16)` | 1 | `.pframe__device` |
| `0 1px 2px rgba(30, 42, 45, 0.05), 0 6px 20px rgba(30, 42, 45, 0.06)` | 1 | `.pcard` |
| `0 0 10px 3px rgba(255, 255, 255, 0.85)` | 1 | `.aura__dot--on` |
| `0 0 16px 2px rgba(93, 202, 165, 0.45)` | 1 | `.medal--socks .medal__coin` |

## 8. Spacing (padding, margin, gap)

| Value | Uses | Where (examples) |
|---|---|---|
| `0` | 226 | `body`, `h1, h2, h3, p`, `.shell` |
| `8px` | 107 | `.appbar`, `.page`, `.chip` |
| `12px` | 79 | `.notice`, `.card > h2`, `.vibe` |
| `4px` | 75 | `.back`, `.devbar__seg button`, `.tag` |
| `16px` | 64 | `.skip`, `.appbar`, `.notice` |
| `10px` | 59 | `.skip`, `.appbar`, `.brand` |
| `6px` | 59 | `.back`, `.devbar`, `.chip` |
| `14px` | 37 | `.devbar__seg button`, `.notice`, `.row` |
| `20px` | 29 | `.list-head`, `.card`, `.expect__head` |
| `2px` | 28 | `.badge`, `.meta .icon`, `.expect__head` |
| `24px` | 18 | `.detail-head`, `.empty`, `.list-head--plain, .shell--e .list-head--plain` |
| `3px` | 14 | `.chip`, `.row__main`, `.xrow__body` |
| `18px` | 14 | `.xrow__panel`, `.report__done`, `.sheet__panel` |
| `5px` | 5 | `code`, `.badge`, `.pills .pill` |
| `1px` | 4 | `code`, `.tag`, `.mockbanner .icon` |
| `28px` | 4 | `.booked`, `@media (min-width: 1024px) → .shell--desk .rows__divider`, `.sdone__done` |
| `-4px` | 3 | `.back`, `.emd__activehead`, `.emd__activehead .emd__clear` |
| `-6px` | 3 | `.fb__back`, `.energy__head`, `.emd__activehead` |
| `22px` | 3 | `.ticket` |
| `32px` | 3 | `@media (min-width: 1024px) → .shell--desk`, `@media (min-width: 1024px) → .shell--desk .dl`, `.profile--panel` |
| `40px` | 2 | `.page`, `.fb__screen--reward` |
| `-3px` | 2 | `.spectrum__tick` |
| `-9px` | 2 | `.spectrum__marker` |
| `48px` | 2 | `.fb__screen--done`, `@media (min-width: 1024px) → .shell--desk .page` |
| `56px` | 2 | `.admin`, `.profile--panel .profile__head` |
| `-14px` | 2 | `.emd__activehead .emd__clear` |
| `7px` | 1 | `.badge` |
| `74px` | 1 | `.xrow__panel` |
| `-10px` | 1 | `.sheet__close` |
| `44px` | 1 | `.picker__card` |
| `50px` | 1 | `.ai__list li` |
| `-8px` | 1 | `.energy__head` |
| `54px` | 1 | `.pframe__screenwrap` |
| `-60px` | 1 | `.dpanel .dpanel__close` |
