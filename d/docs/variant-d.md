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

- **2026-11-18: mobile polish, desktop layout, presentation mode.**
  - **Label:** "ENERGY MATCH" with the sparkle badge. No "optional" in the card (the rating's
    "+ Add a comment (optional)" stays).
  - **Settings chips:** one even dark-green border when active or open (no thicker ring, no phone
    tap-highlight box), a pill-shaped focus ring for keyboard users only.
  - **Filters:** they sit directly in the card (no inner box).
  - **Photos:** every frame has a fixed aspect ratio (list 1:1, class page 16:9, desktop grid 16:10),
    cover, centred and rounded, with a gradient + type icon if a photo fails. Photos were rechecked by
    exact ID; two with visible faces were replaced.
  - **Desktop (1024 px and wider; mobile unchanged):**
    - Top bar with the app name on the left and the current place and stamps on the right.
    - A sticky 380 px left column with the Energy Match card, and a right column with the class grid
      (2–3 cards per row, equal photo frames).
    - Opening a class shows "What to expect" as a side panel on the right: photo header, a × close
      button that stays visible, Escape or a click on the list closes it, Book / Not for me at the
      bottom of the panel.
    - 17 px base text.
  - **Presentation mode:** `?frame=phone` shows the mobile app in a phone frame on a calm
    background (the real app at 390 px inside an iframe).
  - · Finding: the study is presented on laptops and projectors as well as phones.

- **2026-11-18: final D layout.** **Energy Match card:** white background (no gradient), rounded,
  soft shadow, the round dark-green sparkle badge and the label "ENERGY MATCH". There's no
  "optional" text and no Skip. "How are you today?" has Tired / Stressed / Energetic in one row,
  nothing selected by default, tap again to clear. The one-line explanation shows only while an
  option is selected (Tired: "Gentle classes. Nothing harder than moderate effort."). Stressed works
  as before (Burn it off / Calm down). **Settings row** (after a thin divider): Near me (place list
  in the card) · Time/Nearest · Sensory filters · N. One panel opens at a time, inside the card.
  **Sensory filters are now exactly Version B's 7**, with the same names, order and icons: Soft or
  low light · No flashing lights · Quiet or soft music · Not crowded · Touch only if I agree · No
  required partner work · Easy to step out. Active ones show as mint chips with ×. D's own "Quiet &
  dim" filter is gone, so Calm down now turns on "Quiet or soft music" + "Soft or low light" (as in
  B). **List:** the helper line sits under the card, all 104 classes always show, best matches
  first, each group in time order. **Rating (one screen):** "Did the class match its 'What to
  expect' card?" Yes / Partly / No, then "+ Add a comment (optional)" (write or record, opens only
  when tapped) and **Done**. Done works after one answer, with no error or reminder about the
  comment. The 3 room questions are no longer asked in D. · Finding: members want one place to
  set everything and the shortest possible rating; B's filter set tested well and should stay the
  same.

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
  as a new feature. The label was then "ENERGY MATCH" plus "optional" (removed later), with **no Skip**
  (the list is always all classes). The top part is "How are you today?" with D's
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
- **One Energy Match card** (white, rounded, soft shadow, sparkle badge) with the label "Energy Match"
  and no Skip. Energy on top, then place / sort / sensory filters in one settings row (see
  Change log). · Finding: everything in one place, and it has to feel optional.
- **Tired / Stressed / Energetic** in one row. No "Normal". · Finding: "Normal" added nothing. Three
  options fit on one row on a phone.
- **The selected option shows a tick** in place of its icon, as well as the fill. · Finding: colour
  alone wasn't a clear enough signal.
- **Stressed → "Burn it off / Calm down"** inline, smaller, indented under Stressed. · Finding: stress
  goes two ways, so one "Stressed" list didn't fit everyone.
- **Calm down turns on "Quiet or soft music" and "Soft or low light"** automatically. They show as
  removable chips, and undoing Calm down turns them off. · Finding: people who wanted to calm down also wanted soft sound and light.
- **Version B's 7 sensory filters inside the card** (same names, order and icons). They expand from
  "Sensory filters · N"; active ones show as mint chips with ×. · Finding: the filters belong with the
  rest of the settings.
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

- **One screen:** the class name and time, "One question, anonymous. You'll collect a stamp", then
  **"Did the class match its 'What to expect' card?"** Yes / Partly / No. · Finding: this is the one
  answer that tells us whether the card can be trusted, and members want the rating to take seconds.
- **"+ Add a comment (optional)":** write or record opens only when the link is tapped. · Finding: an
  open text box felt like homework.
- **Done** finishes after one answer, with no error and no reminder about the comment. "Not now" asks
  again next time. The 3 room questions are no longer asked in D.
- **Stamp collected**; every 10th stamp shows the free-class reward.

## Not in D

Version E's Normal option, its six-section card and its sensory-filter sheet. The admin page and
`/debug` are unchanged copies.
