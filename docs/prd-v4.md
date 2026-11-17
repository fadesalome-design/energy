# Energy Match: PRD v4.2

Ironhack AI Product Management capstone. Energy Match is an unofficial, **optional** new feature
concept for the Urban Sports Club app. In the prototype it is **Version E** (`?variant=e`).

- Live app: https://fadesalome-design.github.io/energy/?variant=e
- Tester link (clean session, full loop): https://fadesalome-design.github.io/energy/?tester=1&variant=e
- Admin: https://fadesalome-design.github.io/energy/admin

v4 final: 2026-11-17 · v4.1 · **v4.2: 2026-11-17** (see the change log at the end).

## Product summary

- **Problem:** members book new classes blind (cleanliness, crowd, real level, atmosphere, sound &
  light and facilities are unknown). When tired or stressed they don't know which class fits, so
  they skip training.
- **Idea:** match the member's energy today with the energy of the class.
- **Persona:** Jonas, 38, product developer, Berlin. Knows his energy; wants a place that matches it.
- **Optional by design:** everything can be skipped; the normal list and card work without it; no
  reminders; nothing about **energy** is saved after the session. No mood, emotion or health data.
  *(v4.1: sensory filters are the one exception and are remembered, see C2.)*

## Priority 1: needed for user tests

**A. Energy check-in** above the class list: "How much energy do you have today?"
Options: Tired / Stressed / Normal / Energetic + a visible "Skip".
If Stressed → one follow-up: "Burn it off" / "Calm down". Can be changed or cleared any time.

**B. The list re-sorts at once** (nothing hidden by the check-in itself):
Tired → low intensity, quiet, small first · Stressed + Calm down → quiet, low intensity, small first ·
Stressed + Burn it off → high intensity first · Normal → default · Energetic → high intensity first.
Each class shows one short reason line, e.g. "Fits: calm, small group".

**C. Quiet & dim:** optional. Off by default; switches ON automatically with Stressed → Calm down;
one tap turns it on/off. When on, leaves out classes rated loud (music) or bright (light). Classes
with "Not enough ratings yet" stay. Not saved after the session.
*(v4.1: Quiet & dim is now the first switch inside the Sensory filters sheet, under "Quick switch",
and shows as a removable chip when on. Behaviour unchanged.)*

**C2. Sensory filters** *(new in v4.1)*: the same seven filters as Version B, in the same sheet,
opened from a "Sensory filters" pill on the class list:

| Group | Filter | Rule (from the studio's class data) |
|---|---|---|
| Light | Soft or low light | dim or daylight |
| Light | No flashing lights | no strobe or flashing effects |
| Sound | Quiet or soft music | background level |
| Space | Not crowded | usually calm **and** a small group (≤ 10), so it agrees with the reason line *(v4.2; Version B keeps "usually calm")* |
| Touch & people | Touch only if I agree | no hands-on corrections, or the trainer asks first |
| Touch & people | No required partner work | partner work is none or optional |
| Leaving early | Easy to step out | fine to leave quietly |

- **Re-sort, never hide:** classes that meet all active filters move to the top, then classes with
  fewer misses. The energy order is kept within each group. A status line says "N classes match all
  your filters, shown first" with "Clear all".
- A class that misses a filter says so in its reason line, e.g. "Misses your filter: not crowded".
- Active filters show as removable chips next to the pill.
- **Remembered between visits** (an explicit member choice, unlike energy). Kept separate from
  Version B's filters.

## Priority 2: What to expect card (class page, above the Book button)

**D. Six sections in this order:** Cleanliness · Crowd at this time · Real level · Atmosphere & people ·
Sound & light (e.g. "Music: loud · Light: bright · From 7 members") · Facilities & what to bring.

**E. Real level:** studio label vs member reports, e.g. "Studio: Beginner · 6 of 9 members: harder
than described". Show a mismatch only with ≥ 5 ratings and ≥ 60% disagreeing.

**F. Every section shows its source:** "From the studio" or "From N members".
Under 5 ratings: "Not enough ratings yet", never a guess. Member answers read like
"**Packed** · From 9 members".

## Priority 3: rating after class

**G. "Rate your class"** after a booked class, in the same flow and design as Version B: the one-line
intro "3 quick questions about the room, not about you", one question per screen, Back, progress in
words ("Question 2 of 3"), "Not now", and a stamp at the end.

3 tap questions from 3 different categories, fewest ratings for that class first, and never the
same 3 categories twice in a row in one session. Answers describe the class, they don't judge it:

| Category | Question | Answers |
|---|---|---|
| Real level | Level compared with the label | Easier than the label / As the label says / Harder than the label |
| Crowd | How full was it? | Quiet, lots of space / Comfortable / Packed |
| Cleanliness | How clean was it? | Clean / Okay / Not clean |
| Atmosphere | The atmosphere was | Calm / Balanced / High energy |
| Coaching style | Coaching style | Gentle guidance / Balanced / Pushes hard (the class, never the trainer as a person) |
| Sound & light | Music was / Light was (whichever has fewer ratings) | Too quiet / Just right / Too loud · Too dim / Just right / Too bright |

Then "Was it as you expected?" Yes / No, then the optional "Anything else?" step (write or record).

**H.** These ratings feed the card (D–F) and Quiet & dim (C).

## Data per class

intensity (low/medium/high), music volume (quiet/medium/loud), light (dim/normal/bright),
typical crowd (small/medium/large), declared level, showers (yes/no), lockers (yes/no), what to bring.
In the prototype these are derived from the existing sample data.

## Out of scope: do not build

Mood map or emotion detection · heads-up labels · club report · favourite trainers ·
friends on the card · report a mistake · login, payments, real USC data.
*(v4.1: "saved personal dealbreaker settings" removed from this list, see C2.)*

## Copy rules

Plain short English. Feature name: "Energy Match". Never call a class "safe". No health or diagnosis words.

## Done when

A tester can: skip or choose an energy → see the list re-sort (Quiet & dim on with "Calm down") →
use sensory filters to move fitting classes up → open a new studio's card → book → rate the class.
Works at 375 px (phone) and on desktop.

## Change log

**v4.2 (2026-11-17)**
- Energy labels match Version B: "Drained" → **Tired**, "Energized" → **Energetic**.
- Clarified: "Stressed" without a follow-up keeps time order; only "Burn it off" puts high intensity first.
- E's "Not crowded" now also needs a small group, so a "medium group" class can't appear under
  "matches all your filters".
- Version B gets the same "Stressed" follow-up (Burn it off / Calm down). In B, "Calm down"
  turns on the Quiet music and Soft light filters (B's Quiet & dim); undoing it turns off only
  the ones it added.

**v4.1 (2026-11-17)**
- Added **C2. Sensory filters** (from Version B): re-sort instead of hide, remembered between visits.
- **Quiet & dim** moved into the Sensory filters sheet as the first switch (behaviour unchanged).
- Removed "saved personal dealbreaker settings" from Out of scope; the summary notes sensory filters
  as the one remembered setting. Energy is still never saved.
- **G** rewritten with the final question set (descriptive answers; "air" question removed), the
  Version B flow, "Was it as you expected?" Yes / No after the questions, and the
  no-repeat rule.
- Class list hint icon in Version E is a hand, not a magnifier (testers read it as search).
