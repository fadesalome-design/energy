# Variant D (sandbox): screens for the Lovable rebuild

D is the working version. It started as a copy of Version B, then got the changes below from
user-test findings. The frozen test versions (B, E and the default route) are separate and stay
the same.

- **Live:** https://fadesalome-design.github.io/energy/d/
- **Tester link** (clean session, full loop): https://fadesalome-design.github.io/energy/d/?tester=1
- **Source:** `d/src` (React + Vite). Build with `d/build.sh`, which writes to `public/d`.
- **Storage:** keys start with `rtrD.`, so D never mixes with the test versions.

Each line below says what's on the screen and why. "Finding" means what we saw in user tests.

## Change log

- **2026-11-18: realistic demo data and photos.** D now runs on generated, fully **fictional**
  data in `d/data/`: **40 places** (8 types × 5 districts: yoga, pilates, gym, dance, boxing,
  climbing, swimming, sauna & wellness) with a description, photo and room traits (noise · light ·
  crowd · partner work); **104 classes** from 07:00 to 21:00 (:00/:30 only, at least 60 min apart in
  the same place) with an intensity (gentle/moderate/hard) and 2–3 "What to expect" lines that match
  the room; **500 past ratings** (energy before, "matched the card?", noise/light/crowd/intensity,
  ~20% with a comment) for the AI feature later, not shown yet. Regenerate with
  `node d/scripts/generate-data.mjs` (seeded, same output). **Photos** are free Unsplash stock of
  rooms and equipment, with no close-up faces and no logos. If one fails to load, a soft mint
  gradient with the type icon shows, never a broken image. **Class card:** photo on the left, time ·
  duration, name, place · district · distance, then the intensity and room trait chips (information
  only, not buttons). **Class page:** a photo header and the place description. Matching, filters,
  sort and place work on the new data; "Quiet & dim" now means a quiet room **and** soft light,
  since the data separates soft light from normal light. · Finding: the 12 sample classes didn't
  feel like a real app, and testers judged a place by its look before reading anything.

- **2026-11-18: one Energy Match card.** Everything is set in one place. The card takes Version E's
  style (mint gradient fading to white, soft shadow, round dark-green sparkle badge) so it stands out
  as a new feature. The label is "ENERGY MATCH · OPTIONAL", with **no Skip** (the card is optional by
  design and the list is always all classes). The top part is "How are you today?" with D's
  Tired / Stressed / Energetic buttons in one row (nothing selected by default; tap again to clear),
  then the one-line explanation. After a thin divider comes one settings row: **📍 Near me** (opens a
  place list inside the card: Near me (Kreuzberg), Mitte, Neukölln, Friedrichshain, Prenzlauer Berg;
  distances follow the place), **⇅ Time / Nearest** (tap to switch) and **Sensory filters · N**
  (expands the 4 filters inside the card). One panel opens at a time, with no pop-ups. Active filters
  show under the row as mint chips with ×. The separate "You're near" line, Sort row and filter block
  are gone. "Tap a class to read the room before you go." sits directly under the card. · Finding:
  the settings were spread over the screen; members want one place to say how they feel and what
  they need.

## 1. Classes today (class list)

- **Header:** date, "Classes today", "You're near: Kreuzberg", plus the plain hint "Tap a class to read
  the room before you go." · Finding: testers tapped the magnifier and hand icons as if they were
  search, so the hint has no icon.
- **One Energy Match card** (E style: mint gradient, shadow, sparkle badge) with the label "Energy Match ·
  optional" and no Skip. Energy on top, then place / sort / sensory filters in one settings row (see
  Change log). · Finding: everything in one place, and it has to feel optional.
- **Tired / Stressed / Energetic** in one row. No "Normal". · Finding: "Normal" added nothing. Three
  options fit on one row on a phone.
- **The selected option shows a tick** in place of its icon, as well as the fill. · Finding: colour
  alone wasn't a clear enough signal.
- **Stressed → "Burn it off / Calm down"** inline, smaller, indented under Stressed. · Finding: stress
  goes two ways, so one "Stressed" list didn't fit everyone.
- **Calm down turns on "Quiet & dim"** automatically. It shows as a removable chip, and undoing Calm
  down turns it off. · Finding: people who wanted to calm down also wanted soft sound and light.
- **4 sensory filters inside the card:** Quiet & dim · Not crowded · No flashing lights · No partner work.
  They expand from "Sensory filters · N"; active ones show as mint chips with ×. · Finding: 7 filters
  were too many; the filters belong with the rest of the settings.
- **Best match first, nothing hidden:** with Energy Match or a filter on, the line "✦ Best match first
  · N of 104" appears, then the fitting classes, then "Other classes". · Finding: hiding classes felt
  like being told what to do; sorting keeps the choice with the member.
- **A timeline of the day:** 104 classes from 07:00 to 21:00, each at a fitting time of day (hard
  classes before or after work, calm classes in the morning, at lunch and in the evening, sauna in the evening). The default sort
  is **Time**, and each group stays in time order. "Nearest" sorts by distance from the chosen place. · Finding: clusters
  like 07:00 and 07:15 were confusing.
- **Fit rules** (from the room traits and class intensity): Tired = gentle or moderate · Energetic and
  Burn it off = hard · Calm down = quiet room, small group, soft or normal light · Quiet & dim = quiet
  room and soft light · Not crowded = small group · No flashing lights · No partner work.

## 2. Class detail

- **"What to expect" card** with the expandable rows from Version B (same look).
- **"What to bring" is information only:** a small icon plus text (👕 Comfortable clothes, 🧘 Mats and
  towels are provided), with no tick boxes. "Best arrival" stays. · Finding: tick boxes looked like a
  checklist the member had to fill in.
- **Distance line:** "2.1 km from Kreuzberg · about 10 min".
- **Book** and **Not for me today**, as in Version B.

## 3. Booked

- "Booked ✓", the class, its time and studio, and "What to bring" (icons only, no checkboxes).
- **Prototype step "I went to this class"** (dashed frame). It stands in for scanning the QR code
  and opening the app after class. In the real app this step doesn't exist.

## 4. After-class rating (full screen, next app open)

- **3 quick questions about the room**, one per screen. Tapping an answer moves on. There's a Back
  button, progress in words ("Question 2 of 3"), and "Not now" (it asks again next time).
- **Always asked next: "Did the class match its 'What to expect' card?"** Yes / Partly / No. ·
  Finding: this is the one answer that tells us whether the card can be trusted.
- **Last step:** "Thanks, that's all" with a small link **"+ Add a comment (optional)"**. Write or
  record opens only when the link is tapped. The main button is **"Send"**. · Finding: an open text
  box at the end felt like homework; "Send and collect my stamp" was too long.
- **Stamp collected**; every 10th stamp shows the free-class reward.

## Not in D

Version E's Normal option, its six-section card and its sensory-filter sheet. The admin page and
`/debug` are unchanged copies.
