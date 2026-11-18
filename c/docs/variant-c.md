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
- **18 Nov: soft aura rating flow** (replaces all earlier cloud / orb / bulb / aura / ring ideas).
  The rating flow has a warm #FFF9F6 background. Top: the class name and time, and a white stamp
  pill. A soft blurred aura (two blurred layers, no edge, colours via `@property`, fading over 1.8 s)
  breathes, slowly turns, sends out soft halos, and gets stronger and changes colour with each
  answer: peach → pink → lavender → warm mix (never stronger, no flashing). Under it, 3 thin
  progress lines. "✦ Energy Match AI" dissolves after the first answer, is back on the AI moment,
  and dissolves again before the stamp. Questions, answers, logic and saved data are unchanged.
  - **AI moment** (after question 3): "The room's aura · from N members" (demo member answers +
    ratings given in C + 1), one sentence from the answers and the class's room data, and "Your
    energy was added to the What to expect card." **Placeholder – replaced by the real AI summary
    (CALM-8) in Lovable.** In C it is built by simple rules in `c/src/lib/auraSummary.ts` (no AI
    call).
  - **Then** "Anything else?" and "Stamp collected" in the same soft style, with the calm peach aura
    behind the medal.
  - **Motion:** only transform, opacity and the colour variables animate (blur is static). The
    "morph" is a slow turn plus a slight stretch of fixed organic shapes, and the label's dissolve
    is a pre-blurred copy fading through. Under reduced motion nothing moves and every change is
    instant. Without `@property` the colours change instantly.
  - **Contrast (all ≥ 4.5:1):** the selected answer and buttons use #C2416D (white text 4.9:1;
    #D4537E would be 3.9:1). The label uses #4A1B0C on the strongest (warm-mix) aura (#72243E
    would be 4.2:1 there; it is 5.9:1 now).
- **18 Nov: three-dot energy aura (cool) + new "Stamp collected"** (replaces the warm soft aura and
  the earlier gold / bronze / silver medal idea).
  - **Rating flow:** background #F5F8F8, class #04342C, time #0F6E56, stamp pill white / #3C3489 /
    #CECBF6, and the intro and bottom lines.
  - **Aura:** a halo plus a slightly tall blurred aura (colour A in the lower centre → B), breathing
    5.5 s, wobble about 10 s, and rising white specks. Three dots on a vertical line show the question
    (Q1 / Q2 / Q3 / AI moment, with the exact colours, pulse, strength and specks from the spec).
    "✦ Energy Match AI" (#26215C) sits above the aura and dissolves after the first answer.
  - **Pills:** compact answer pills (36 px, 44 px tap area), white with #085041 text and a #9FE1CB
    border; selected is #0F6E56. The AI card has a #9FE1CB border, and "Anything else?" uses the same
    cool style.
  - **Stamp collected:** the green/lavender AI-moment aura shrinks into a dot, flies into the next
    empty circle and lands there with a turquoise glow; then the texts fade in.
    - "✦ Your energy became a stamp" / "Stamp collected" / "Thanks! Your answers help update the card
      for …".
    - Mini-aura stamps in a white card.
    - "Your rewards" as 3 soft breathing medals: socks turquoise, friend or massage violet, hoodie
      green. The next one has a progress bar; later ones have only the medal dimmed (text keeps its
      contrast); reached shows "Ready to claim" with a Claim pill.
    - A normal-width "Done" (40 px) and "See your rewards", which opens the profile at its rewards.
  - **Shared with the profile:** the same mini-aura stamps and medals (`StampGrid`, `RewardMedals`).
    The 20-stamp choice (friend or massage) happens in the profile. In C, the reward ticket and
    confetti are gone.
  - **Reduced motion:** no flight, landing, breathing, wobble or specks; the stamp just appears.
  - **Contrast:** all text is at least 4.5:1 (lowest 5.5:1; the disabled Claim uses dark text on
    mint).
