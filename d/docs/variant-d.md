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

- **2026-11-18: three-dot aura in the rating questions** (adapted from Version C, D's own code and
  colours; nothing else from C).
  - **Aura:** above the question on the 3 question screens: a soft blurred aura (blur 12 px) with a
    pale halo, from light mint to very light lavender (the only lavender in D). Three small white dots
    on a vertical line (question 1: bottom dot; question 2: two dots and a little stronger; question 3:
    all three and strongest). All three stay lit, smaller, on "Anything else?". It breathes slowly
    (6 s), a few tiny white specks rise, and it never flashes.
  - **Label:** "✦ Energy Match AI" sits 8 px above the aura in D's dark text colour and dissolves
    after the first answer. The intro line ("…and you'll collect a stamp.") sits above it on
    question 1; "Not now? We'll ask again…" stays at the bottom. The question icon was replaced by
    the aura.
  - **Buttons and layout:** D's button system in the rating flow. Answers and Yes / Partly / No are
    40 px pills as wide as their text, centred; one primary pill per screen (44 px, at least 200 px,
    not full width); hit areas are at least 44 px. Everything is centred, with 8-point spacing.
  - **Unchanged:** questions, logic, "Anything else?", "Stamp collected" and the rewards.
  - **Reduced motion:** nothing moves; only the dots and the strength change.

- **2026-11-18: "What to bring" only after booking.** Removed from the class detail and side panel
  (no "What to bring" or "Best arrival" before booking). It stays only on the "Booked ✓" screen: items
  with icons and "Best arrival", information only. The class detail ends with "About the studio",
  with room above the Book bar.

- **2026-11-18: small fixes from user feedback.**
  - **Class description:** every class in `d/data/classes.json` now has a `description` (2–3
    sentences: what you do, for whom, how it feels, matching type, intensity and room; fixed text, so
    no other data changed). It shows under the class name and time/place lines, above "Read the room
    / What to expect". The studio text moved lower, under "About the studio".
  - **"What to bring" once, at the end:** it was a row inside the "What to expect" card; now it's the
    last section of the class detail (just above the Book bar), as plain information with "Best
    arrival". The "Booked ✓" page keeps its own short "What to bring" (a separate screen).
  - **Helper line removed:** "Tap a class to read the room before you go." is gone from D.
  - **Energy Match is for today:** the explanation under the chosen option starts with "Today:"
    (e.g. "Today: gentle classes. Nothing harder than moderate effort."). The question stays "Hi Anna,
    how are you feeling today?".

- **2026-11-18: personal greeting, member profile and new stamp rewards.**
  - **Name:** from `?user=` (e.g. `?user=Jonas`, works with `?frame=phone`), default "Anna".
  - **Greeting:** the Energy Match question now reads "Hi Anna, how are you feeling today?" (same
    place and style).
  - **Rewards** (`d/src/lib/rewards.ts`; one stamp per class rating): 10 stamps = socks · 20 = invite
    a friend OR a massage (the member picks one) · 30 = Urban Sports Clue hoodie. Demo start value
    is unchanged (0; the tester link resets stamps and claims).
  - **Profile** (`#/profile`): opened from the round avatar (initial) next to the stamp counter. On
    desktop it uses the same right side panel as the class detail (shared `SidePanel`); on mobile
    and `?frame=phone` it's full screen with a back arrow. Contents:
    - "Hi Anna" with the avatar.
    - "Your stamps": the 10 circles of the current level (1–10 / 11–20 / 21–30) and "4 of 10. 6
      more for your socks."
    - A 0–30 progress bar with markers at 10 / 20 / 30.
    - "Your rewards": status "N stamps to go" / "Ready to claim" / "Claimed"; at 20, pick Friend or
      Massage, then Claim (demo).
    - "How to collect stamps".
  - **Stamp collected:** the same screen and badges with the new rules. At 10 / 20 / 30 the ticket
    shows the reward, plus a "See your rewards" link to the profile.
  - The header counter ("4/10", "14/20", "24/30"), the profile and Stamp collected always show the
    same count.

- **2026-11-18: desktop class side panel fixed.** Cause: the CSS that kept the panel's Book bar inside
  the panel was accidentally deleted together with the old phone-frame styles (commit `b22832b`), so
  the bar was centred on the window again (half outside the panel, "ok" / "ne today") and the close
  button lost its sticky position. Now, in one protected CSS block:
  - **Panel:** `min(520px, 40vw)` anchored right, full height, its own scroll, dim overlay (click or ×
    closes).
  - **Close ×:** inside the panel at top right, 16 px margin, over the photo on a white circle.
  - **Photo:** full content width, 16:9, cover.
  - **Book / Not for me today:** sticky at the bottom inside the panel (white, thin top border, content
    width); the last section always ends above it.
  - Mobile and `?frame=phone` are unchanged (full-screen detail).

- **2026-11-18: the 3 rating questions are back (core AI input), using Version E's categories.**
  They were dropped in `fda679f` when the rating became "card question only". The flow is now:
  **Question 1–3 of 3 → "Anything else?" → "Stamp collected"** (4-step progress bar).
  - **Questions:** PRD v4 / Version E's 6 categories: Real level · Crowd · Cleanliness · Atmosphere
    · Coaching style · Sound & light (music or light). The 3 categories with the fewest ratings for
    the class are asked, never the same 3 twice in a row in one session. Descriptive answers (e.g.
    "Quiet, lots of space / Comfortable / Packed"). One tap moves on, with Back and "Not now".
  - **Look:** D's button style (white, rounded, one border; chosen = filled dark green with a tick, no
    radio circle, no second ring). "Anything else?" and "Stamp collected" are unchanged.
  - **Data (one record per rating, `rtrD.feedback`):** `answers` (B's structure) plus `questions`
    [{id, category, cardSection, prompt, answer, answerIndex}], `match` (Yes/Partly/No) and
    `message` (text or voice). The same answers also go into the member data behind the card
    (`rtrD.ratingsV4`), and the card's "N member answers" count goes up.

- **2026-11-18: bigger phone frame (product shot).** `?frame=phone` now shows the phone at 1.3 × its
  previous size (wider, bigger text), centred, with the top and camera pill fully visible and a small
  margin; the bottom runs past the window edge (cropped). The page doesn't scroll; the app scrolls
  inside the visible part of the screen. No caption. Change the size with `?scale=`, e.g.
  `?frame=phone&scale=1.4` (applied via the CSS variable `--phone-scale`). Normal `/d/` unchanged.

- **2026-11-18: Clear all on every view, bigger phone frame, buttons fit from 360 px.**
  - **Why "Clear all" still showed under the card on mobile / `?frame=phone`:** cached pages. The
    code had only the card and sheet "Clear all"s, but GitHub Pages lets browsers keep D for 10
    minutes, and the phone frame loaded the plain `/d/` address, so it could reuse an older cached D
    inside the frame. The frame's inner address now carries the build number, so it always loads the
    current D.
  - **Active filters header row:** "ACTIVE FILTERS" in the same style as "ENERGY MATCH", with "Clear
    all" right-aligned to the card's inner edge on the same baseline. The tap target is 44 px; there's
    8 px to the chips. Under the card there is only "Showing X of Y classes".
  - **`?frame=phone`:** a generic modern phone (thin dark bezel, rounded screen, small camera pill, no
    logo) with a 440 × 956 screen. The app runs below a 54 px status-bar strip, at 440 × 902, using the
    same code as mobile. It scales to 92% of the window height, centred; content scrolls inside the
    phone. The caption shows only when there's room. On a phone-sized window there's no frame.
  - **Tired / Stressed / Energetic:** a smaller icon and gap inside the card (font unchanged); below
    380 px the icon sits above the word. At least 7 px between text and button edge from 360 px up.

- **2026-11-18: "Active filters" row in the card.** Under the "Sensory filters" chip: a thin divider,
  then one row with "ACTIVE FILTERS" on the left and "Clear all" flush right, then the mint chips
  with × below. Shown while an energy option or a sensory filter is on (energy only: the row
  without chips); Clear all resets both. "Showing X of Y classes" stays under the card.

- **2026-11-18: Clear all in the card; every sensory filter now works on the data.**
  - **Clear all:** a small dark-green link at the end of the active-filter chips in the Energy Match
    card, shown while an energy option or a sensory filter is on. It resets both. The row under the
    card now only says "Showing X of Y classes" (left aligned). The sheet's own Clear all stays.
  - **Bug fix:** "Touch only if I agree" kept all 104 classes because the demo data had no touch
    information. Each class now has `touch` in `d/data/classes.json` (no hands-on help / asks first /
    hands-on without asking; realistic per type, e.g. common in yoga, pilates and boxing, rare in
    sauna), plus a matching "What to expect" line. It uses a separate seed, so all other data is
    unchanged.
  - **Classes kept with only one filter on (of 104):** Soft or low light 70 · No flashing lights 100 ·
    Quiet or soft music 40 · Not crowded 33 · Touch only if I agree 76 · No required partner work
    67 · Easy to step out 69.

- **2026-11-18: one filter sheet everywhere, and B's "Clear all" row.**
  - **Cause of the mobile/desktop difference:** there was only one filter component (B's sheet), but
    a phone-only CSS rule made it look different on phones, and phones could still show an older
    cached D for up to 10 minutes after a publish. Version E's unused filter UI and the old 4-filter
    styles were also still in D's code.
  - **Fix:** now one sheet with one set of styles on every width. It's a bottom sheet on phones and
    `?frame=phone`, and the same component as a centred dialog on desktop. E's leftover filter UI
    and the dead 4-filter styles were removed from D.
  - **Results row from Version B:** "Showing X of Y classes · Clear all" directly under the Energy
    Match card, only while an energy option or a sensory filter is on. Clear all does what it does in
    B: clears the energy option (with Burn it off / Calm down) and all sensory filters. Sort and place
    stay. D never hides classes, so X is the number that fit; the rest follow under "Other classes".
    The sheet's own "Clear all" stays. The "Best match first" label no longer repeats the count.

- **2026-11-18: sensory filters sheet fixed on phones.** On mobile, B's original sheet (88% height)
  showed only 4 of the 7 filters and gave no sign that it scrolls, so "Touch only if I agree", "No
  required partner work" and "Easy to step out" looked missing. On screens below 1024 px the sheet
  now uses almost the full height, with slightly tighter rows and a soft shadow at the edge while
  more filters are above or below. All 7 show at once on a typical phone (390×844); on small phones
  the last two are one short scroll away. Content, wording and desktop are unchanged.

- **2026-11-18: back to the original sheet and "Anything else?" screen** (both copied from Version B,
  `?variant=b`; the default route has neither).
  - **Sensory filters:** the "Sensory filters" chip in the Energy Match card opens B's original bottom
    sheet: title, ×, "Only show classes that fit. We'll remember these for next time.", groups
    LIGHT / SOUND / SPACE / TOUCH & PEOPLE / LEAVING EARLY, 7 filters each with an icon, a short
    description and a toggle, and "Clear all" / "Show N classes". The inline filter list in the card
    is gone. The chip keeps its count and one dark-green border; active filters still show as mint
    chips with ×. (D still re-sorts and never hides classes; "Show N" counts the classes that fit.)
  - **Rating:** opens straight on B's original "Anything else?" screen: "Both are optional. You can
    send without them.", "Did the class match its 'What to expect' card?" with Yes / Partly / No in
    one row, "Tell us more" with Write / Record and the text field, the note on who reads it, and
    "Send and collect my stamp" → the existing "Stamp collected" screen. Removed: the separate card
    question with radio circles, "Thanks, that's all" and "+ Add a comment (optional)". It's one
    screen, so there's no progress bar.

- **2026-11-18: links and a clean tester start.** Mobile: `/energy/d/?frame=phone` (phone view on any
  screen) · Desktop: `/energy/d/` on a screen 1024 px or wider · Tester: `/energy/d/?tester=1`
  (phone frame: `/energy/d/?frame=phone&tester=1`). The tester link now also clears the previous
  person's energy choice and sensory filters, not only bookings, stamps and ratings.

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

- **Header:** date and "Classes today" (the helper line "Tap a class…" was removed after feedback).
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
- **Sensory filters:** the chip "Sensory filters · N" opens Version B's original bottom sheet (7
  filters in groups, icon + description + toggle, Clear all, Show N classes). Active filters show as
  mint chips with × in the card. · Finding: testers knew and liked B's sheet.
- **Best match first, nothing hidden:** with Energy Match or a filter on, B's row "Showing X of Y
  classes · Clear all" appears under the card, then "✦ Best match first", the fitting classes, and
  "Other classes". · Finding: hiding classes felt
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
- **No "What to bring" here:** it is shown after booking, on the "Booked ✓" screen (icons + text, no
  tick boxes, "Best arrival"). · Finding: tick boxes looked like a
  checklist the member had to fill in.
- **Distance line:** "2.1 km from Kreuzberg · about 10 min".
- **Book** and **Not for me today**, as in Version B.

## 3. Booked

- "Booked ✓", the class, its time and studio, and "What to bring" (icons only, no checkboxes).
- **Prototype step "I went to this class"** (dashed frame). It stands in for scanning the QR code
  and opening the app after class. In the real app this step doesn't exist.

## 4. After-class rating (full screen, next app open)

- **3 quick questions** (Question 1–3 of 3), picked from PRD v4's 6 categories: fewest ratings
  first, never the same set twice in a row. Descriptive answers, one tap moves on, with Back and
  "Not now". · Finding: these answers keep the card honest and are the input for the AI feature.
- **"Anything else?"** (B's original): "Did the class match its 'What to expect' card?" Yes / Partly
  / No, "Tell us more" (Write / Record), the note on who reads it, and **"Send and collect my
  stamp"**. All answers are saved in one record.
- **Stamp collected** with the reward progress (10 socks · 20 friend or massage · 30 hoodie) and
  "See your rewards", which opens the profile.

## Not in D

Version E's Normal option, its six-section card and its sensory-filter sheet. The admin page and
`/debug` are unchanged copies.


## Design tokens

CSS custom properties defined in `d/src/styles/global.css` (name: value).

### Colour (`:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | #f6f4ef | page background (warm off-white) |
| `--surface` | #ffffff | cards, sheets, buttons |
| `--ink` | #1e2a2d | headings and body text |
| `--muted` | #55615f | secondary text |
| `--line` | #e3ded4 | borders and dividers |
| `--accent` | #1d6a66 | primary green: selected states, primary buttons, icons |
| `--accent-ink` | #134b48 | dark green text (eyebrows, links, active labels) |
| `--accent-soft` | #e4efec | mint tint: active chips, stamp pill, icon circles |
| `--focus` | #1d6a66 | keyboard focus ring |
| `--calm-bg` / `--calm-ink` | #e4efec / #134b48 | "calm" status chip |
| `--moderate-bg` / `--moderate-ink` | #f1ebdd / #5c4a1e | "moderate" status chip |
| `--busy-bg` / `--busy-ink` | #f3e4dc / #6b3420 | "busy" status chip |

### Colour (component-scoped)

| Token | Value | Where |
|---|---|---|
| `--emd-tint` | #eaf3f0 | Energy Match card (legacy mint, now overridden to white) |
| `--emd-shadow` | 0 1px 2px rgba(30,42,45,.05), 0 6px 20px rgba(30,42,45,.06) | Energy Match card shadow |
| `--e-tint`, `--e-line`, `--e-shadow`, `--e-shadow-hover` | #eaf3f0, #ebe6dc, (shadows as above) | copied Version E styles (not shown in D) |
| `--daura-a` / `--daura-b` per step | Q1 #cdebdf / #eceef7 · Q2 #b6e1d1 / #e8e6f6 · Q3 and "Anything else?" #9fd6c2 / #e6e3f5 | rating aura (mint → light lavender) |

### Font

| Token | Value |
|---|---|
| `--font` | ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif |

Base size 16 px (17 px on desktop ≥ 1024 px).

### Radius and spacing

| Token | Value | Use |
|---|---|---|
| `--radius` | 18px | cards and class rows |
| `--radius-sm` | 10px | small boxes and notices |
| (pills) | 999px | chips, pills and pill buttons (not a variable) |
| `--gutter` | 20px | side margins |
| `--tap` | 48px | minimum tap height (44 px for pills, via hit areas) |

Note: some screens in D still use fixed colour values directly in the CSS (for example the phone
frame and the class card photo fallbacks). The table lists the variables only.
