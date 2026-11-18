#!/usr/bin/env node
/**
 * SANDBOX D: generates the demo data in d/data/ (places, classes, ratings).
 * Everything is FICTIONAL: place names, streets, trainers and comments are made up.
 * Photos are free stock photos (Unsplash) of rooms and equipment, no close-up faces or logos.
 * Seeded, so running it again gives the same files:  node d/scripts/generate-data.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

// ---------- seeded random ----------
let seed = 20261118;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const chance = (p) => rnd() < p;
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
// A second, separate seed for fields added later (touch), so adding them doesn't change any
// of the data generated with the first seed (places, times, trainers, ratings…).
let seed2 = 7031;
const rnd2 = () => ((seed2 = (seed2 * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// ---------- photos (checked by ID on a contact sheet: load, room or equipment, no close-up faces or logos) ----------
const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;
const PHOTOS = {
  yoga: ['1599901860904-17e6ed7083a0', '1506126613408-eca07ce68773', '1591258370814-01609b341790', '1591291621164-2c6367723315'],
  pilates: ['1518310383802-640c2de311b2', '1591291621164-2c6367723315', '1591258370814-01609b341790'],
  gym: ['1534438327276-14e5300c3a48', '1571902943202-507ec2618e8f', '1540497077202-7c8a3999166f', '1517836357463-d25dfeac3438', '1583454110551-21f2fa2afe61', '1576678927484-cc907957088c', '1517963879433-6ad2b056d712', '1534258936925-c58bed479fcb'],
  dance: ['1504609813442-a8924e83f76e', '1508700929628-666bc8bd84ea'],
  boxing: ['1534258936925-c58bed479fcb', '1583454110551-21f2fa2afe61'],
  climbing: ['1564769662533-4f00a87b4056'],
  swimming: ['1519315901367-f34ff9154487', '1560090995-01632a28895b'],
  wellness: ['1583416750470-965b2707b355', '1600334129128-685c5582fd35', '1540555700478-4be289fbecef'],
};

// ---------- question bank (after-class rating, PRD v4: 6 categories) ----------
// Written to questions.json and read by the app (lib/energy.ts), so app and data never drift.
const PLACE_TYPES = ['yoga', 'pilates', 'gym', 'dance', 'boxing', 'climbing', 'swimming', 'wellness'];
const QUESTION_BANK = [
  { id: 'level', label: 'Real level', questions: [
    { id: 'level', icon: 'level', prompt: 'Level compared with the label', answers: ['Easier than the label', 'As the label says', 'Harder than the label'] }] },
  { id: 'crowd', label: 'Crowd at this time', questions: [
    { id: 'crowd', icon: 'people', prompt: 'How full was it?', answers: ['Quiet, lots of space', 'Comfortable', 'Packed'] }] },
  { id: 'clean', label: 'Cleanliness', questions: [
    { id: 'clean', icon: 'sparkle', prompt: 'How clean was it?', answers: ['Clean', 'Okay', 'Not clean'] }] },
  { id: 'atmosphere', label: 'Atmosphere & people', questions: [
    { id: 'atmosphere', icon: 'calm', prompt: 'The atmosphere was', answers: ['Calm', 'Balanced', 'High energy'] }] },
  { id: 'coaching', label: 'Atmosphere & people', questions: [
    { id: 'coaching', icon: 'trainer', prompt: 'Coaching style', answers: ['Gentle guidance', 'Balanced', 'Pushes hard'] }] },
  { id: 'senses', label: 'Sound & light', questions: [
    { id: 'music', icon: 'volume', prompt: 'Music was', answers: ['Too quiet', 'Just right', 'Too loud'] },
    { id: 'light', icon: 'sun', prompt: 'Light was', answers: ['Too dim', 'Just right', 'Too bright'] }] },
].map((c) => ({ ...c, appliesTo: PLACE_TYPES }));   // every category applies to every place type (the app does not filter)

// What to bring per place type (shown on the "Booked" screen)
const BRING = {
  yoga: ['Comfortable clothes', 'Mats and towels are provided'],
  pilates: ['Grip socks', 'Comfortable clothes', 'Towel (or rent one)'],
  gym: ['Indoor trainers', 'Towel', 'Water bottle', 'Padlock for the locker'],
  dance: ['Socks or bare feet', 'Comfortable clothes', 'Water bottle'],
  boxing: ['Indoor trainers', 'Towel', 'Water bottle', 'Hand wraps (or borrow)'],
  climbing: ['Comfortable clothes', 'Climbing shoes (or rent)', 'Water bottle'],
  swimming: ['Swimwear', 'Swim cap', 'Goggles', 'Flip-flops', 'Towel (or rent one)'],
  wellness: ['Two towels (or rent them)', 'Flip-flops', 'Water bottle'],
};

// A third, separate seed for the rating category answers, so nothing generated earlier changes
let seed3 = 4411;
const rnd3 = () => ((seed3 = (seed3 * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const nudge = (i) => { const r = rnd3(); return Math.min(2, Math.max(0, i + (r < 0.72 ? 0 : r < 0.86 ? 1 : -1))); };

// ---------- places: one of each type in each district ----------
const DISTRICTS = ['Kreuzberg', 'Neukölln', 'Mitte', 'Prenzlauer Berg', 'Friedrichshain'];
const STREETS = {
  Kreuzberg: ['Ufergasse', 'Lindenhof', 'Kanalweg', 'Görlitzer Bogen', 'Wrangelhof', 'Mariannenweg', 'Spreeufer', 'Bergmannhof'],
  Neukölln: ['Weserhof', 'Pannierweg', 'Schillerhof', 'Reuterbogen', 'Lenauweg', 'Hertahof', 'Sonnenhof', 'Elbeweg'],
  Mitte: ['Torbogen', 'Linienhof', 'Auguststeg', 'Gartenhof', 'Rosenweg', 'Brunnenbogen', 'Invalidenhof', 'Spreebogen'],
  'Prenzlauer Berg': ['Kastanienhof', 'Kollwitzweg', 'Lychener Hof', 'Gleimbogen', 'Stargarder Weg', 'Pappelhof', 'Danziger Hof', 'Wörther Weg'],
  Friedrichshain: ['Boxhagener Hof', 'Simonweg', 'Wühlischhof', 'Revaler Bogen', 'Warschauer Weg', 'Gärtnerhof', 'Samariterweg', 'Rigaer Hof'],
};
const NAMES = {
  yoga: ['Stillwerk Yoga', 'Lotushof', 'Atemraum', 'Ruhepol Yoga', 'Mondsalz Yoga'],
  pilates: ['Hafen Pilates Loft', 'Kernwerk Pilates', 'Linie Pilates', 'Federhaus Pilates', 'Mitte Moves Pilates'],
  gym: ['Eisenhalle', 'Pulse Cycle House', 'Kraftwerk Nord', 'Stahlhof Gym', 'Ostblock Fitness'],
  dance: ['Tanzraum Schöneberg', 'Taktwerk', 'Parkett 22', 'Bewegungshaus', 'Studio Sprung'],
  boxing: ['Ringhof Boxing', 'Linke Gerade', 'Boxkeller 9', 'Schlagwerk', 'Fightclub Kiez'],
  climbing: ['Griffwerk Bouldern', 'Blockhalle', 'Kletterkiste', 'Wandlauf', 'Grip & Chalk'],
  swimming: ['Nordbad Aquatics', 'Wellenbad Ost', 'Bahn 5', 'Blaues Becken', 'Spreebad'],
  wellness: ['Dampfhaus Sauna', 'Ruhebad', 'Wärmestube', 'Salzgrotte Mitte', 'Kiez Spa'],
};
const DESCRIPTIONS = {
  yoga: ['A calm loft with wooden floors and big windows.', 'Small rooms, soft light and blankets for everyone.', 'A quiet studio in a courtyard, away from street noise.'],
  pilates: ['Bright studio with reformers and mats.', 'Small groups on mats, with clear instructions.', 'Reformer studio with space between machines.'],
  gym: ['An industrial hall with free weights, racks and a class area.', 'Busy gym with a separate studio for classes.', 'Big open floor, music on all day.'],
  dance: ['A dance studio with a sprung floor and a mirror wall.', 'Two rooms, one for beginners and one for party classes.', 'Wooden floor, warm lights and a good sound system.'],
  boxing: ['A boxing gym with bags, a ring and loud music.', 'Basement gym with heavy bags and pads.', 'Boxing studio with small groups and technique focus.'],
  climbing: ['A bouldering hall with walls for all levels.', 'Indoor walls, soft mats and a café corner.', 'Bouldering gym with a quiet training room.'],
  swimming: ['A 25 m indoor pool with lanes for courses.', 'Public pool with lane swimming and aqua classes.', 'Indoor pool with a learner area and a sauna.'],
  wellness: ['Finnish sauna, a steam room and a quiet rest area.', 'Spa with sauna, salt room and relaxation sessions.', 'A small sauna house with a garden and a rest room.'],
};
// Room traits per type: [noise, light, crowd, partner] options
const TRAITS = {
  yoga: { noise: ['quiet', 'quiet', 'medium'], light: ['soft', 'soft', 'normal'], crowd: ['small', 'medium'], partner: ['no', 'no', 'no', 'yes'] },
  pilates: { noise: ['quiet', 'medium'], light: ['normal', 'soft', 'bright'], crowd: ['small', 'small', 'medium'], partner: ['no'] },
  gym: { noise: ['loud', 'loud', 'medium'], light: ['bright', 'bright', 'normal', 'flashing'], crowd: ['medium', 'large'], partner: ['no', 'no', 'yes'] },
  dance: { noise: ['loud', 'medium'], light: ['normal', 'flashing', 'soft'], crowd: ['medium', 'large'], partner: ['yes', 'no'] },
  boxing: { noise: ['loud', 'loud', 'medium'], light: ['bright', 'normal'], crowd: ['medium', 'small', 'large'], partner: ['yes', 'yes', 'no'] },
  climbing: { noise: ['medium', 'medium', 'quiet'], light: ['normal', 'bright'], crowd: ['medium', 'large', 'small'], partner: ['no', 'yes'] },
  swimming: { noise: ['medium', 'loud', 'quiet'], light: ['bright', 'normal'], crowd: ['large', 'medium'], partner: ['no'] },
  wellness: { noise: ['quiet'], light: ['soft'], crowd: ['small', 'medium'], partner: ['no'] },
};

const places = [];
const TYPES = Object.keys(NAMES);
DISTRICTS.forEach((district, di) => {
  TYPES.forEach((type, ti) => {
    const t = TRAITS[type];
    const photos = PHOTOS[type];
    places.push({
      id: `${type}-${district.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '')}`,
      name: NAMES[type][di],
      type,
      district,
      address: `${STREETS[district][ti]} ${int(2, 48)}`,
      description: `${pick(DESCRIPTIONS[type])} ${pick(['Lockers and showers on site.', 'Showers and towels for rent.', 'Changing rooms with lockers.', 'Bring a padlock for the lockers.'])}`,
      photo: U(photos[(di + ti) % photos.length]),
      traits: { noise: pick(t.noise), light: pick(t.light), crowd: pick(t.crowd), partnerWork: pick(t.partner) },
      offsetKm: Math.round(rnd() * 12) / 10, // demo: distance inside the district
    });
  });
});

// ---------- classes ----------
// [name, classType, intensity, duration, preferred times]
const MORNING = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'];
const LUNCH = ['12:00', '12:30', '13:00', '13:30'];
const AFTERNOON = ['16:00', '16:30', '17:00', '17:30'];
const EVENING = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
const CATALOG = {
  yoga: [['Slow Flow Yoga', 'yoga', 'gentle', 60, [...MORNING, ...EVENING]], ['Vinyasa Flow', 'yoga', 'moderate', 75, [...MORNING, ...AFTERNOON, ...EVENING]], ['Yin Yoga', 'yoga', 'gentle', 60, EVENING], ['Power Yoga', 'yoga', 'hard', 60, [...MORNING, ...EVENING]], ['Lunch Break Yoga', 'yoga', 'gentle', 45, LUNCH]],
  pilates: [['Mat Pilates Basics', 'pilates', 'moderate', 50, [...MORNING, ...LUNCH]], ['Reformer Pilates', 'pilates', 'hard', 55, [...AFTERNOON, ...EVENING]], ['Gentle Pilates', 'pilates', 'gentle', 45, [...MORNING, ...LUNCH, ...EVENING]]],
  gym: [['HIIT Express', 'hiit', 'hard', 30, [...MORNING, ...LUNCH, ...EVENING]], ['Sunrise Spin', 'spinning', 'hard', 45, MORNING], ['Rhythm Ride', 'spinning', 'hard', 45, EVENING], ['Strength Basics', 'gym', 'moderate', 45, [...LUNCH, ...AFTERNOON]], ['Functional Circuit', 'gym', 'hard', 50, [...AFTERNOON, ...EVENING]], ['Mobility & Stretch', 'gym', 'gentle', 45, [...MORNING, ...EVENING]]],
  dance: [['Contemporary for Beginners', 'dance', 'moderate', 75, [...AFTERNOON, ...EVENING]], ['Dance Cardio', 'dance', 'hard', 60, EVENING], ['Salsa Basics', 'dance', 'moderate', 60, EVENING], ['Hip-hop Foundations', 'dance', 'hard', 60, [...AFTERNOON, ...EVENING]]],
  boxing: [['Boxing Fundamentals', 'boxing', 'hard', 60, [...AFTERNOON, ...EVENING]], ['Boxfit', 'boxing', 'hard', 45, [...MORNING, ...LUNCH]], ['Technique & Pads', 'boxing', 'moderate', 60, EVENING]],
  climbing: [['Bouldering Intro', 'climbing', 'moderate', 90, [...AFTERNOON, ...EVENING]], ['Morning Bouldering', 'climbing', 'moderate', 60, MORNING], ['Climbing Technique', 'climbing', 'hard', 75, EVENING]],
  swimming: [['Lane Swim & Technique', 'swimming', 'moderate', 45, [...MORNING, ...LUNCH]], ['Aqua Fit', 'swimming', 'moderate', 45, [...MORNING, ...AFTERNOON]], ['Easy Lengths', 'swimming', 'gentle', 45, [...MORNING, ...LUNCH, ...EVENING]]],
  wellness: [['Sauna & Stretch', 'wellness', 'gentle', 60, [...AFTERNOON, ...EVENING]], ['Breathwork', 'wellness', 'gentle', 45, [...MORNING, ...EVENING]], ['Sound Bath', 'wellness', 'gentle', 60, EVENING]],
};
const TRAINERS = ['Mira', 'Jonas', 'Leyla', 'Tomasz', 'Ana', 'Felix', 'Noor', 'Ben', 'Sofia', 'Kenji', 'Lena', 'Marco', 'Aylin', 'Paul', 'Ines', 'David', 'Hanna', 'Omar', 'Clara', 'Luca'];

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
// Hands-on help per place type: [no touch, trainer asks first, hands-on corrections without asking]
const TOUCH_ODDS = {
  yoga: [0.25, 0.45, 0.3], pilates: [0.25, 0.45, 0.3], boxing: [0.2, 0.3, 0.5], dance: [0.35, 0.3, 0.35],
  climbing: [0.35, 0.3, 0.35], gym: [0.45, 0.25, 0.3], swimming: [0.6, 0.2, 0.2], wellness: [0.85, 0.15, 0],
};
// Class descriptions: what you do and for whom (per class), plus how it feels (from the room).
// Fixed text, no random choices, so adding them changes nothing else in the data.
const ABOUT = {
  'Slow Flow Yoga': 'Slow, flowing yoga with long holds and plenty of time to breathe. Good for beginners and anyone who wants to move without rushing.',
  'Vinyasa Flow': 'A flowing yoga class that links breath and movement, with a few stronger standing poses. For people who know the basics and like to keep moving.',
  'Yin Yoga': 'Floor-based yoga with long, supported stretches of a few minutes each. For anyone who wants to slow down after a long day.',
  'Power Yoga': 'Strong, sweaty yoga with strength holds, balances and fast sequences. For people who want yoga as a proper workout.',
  'Lunch Break Yoga': 'A short yoga break with easy stretches and breathing. Made for office days, no experience needed.',
  'Mat Pilates Basics': 'Pilates on the mat with slow, controlled moves for core, back and posture. A good start if you are new to Pilates.',
  'Reformer Pilates': 'Pilates on reformer machines with springs for resistance, focused on core strength and control. Some experience helps.',
  'Gentle Pilates': 'Calm Pilates with small movements for core and mobility, at an easy pace. Suits beginners and anyone getting back into training.',
  'HIIT Express': 'Short high-intensity intervals of bodyweight moves with quick breaks. For people who want a full workout in little time.',
  'Sunrise Spin': 'An indoor cycling ride to wake you up, with climbs and sprints to the beat. You set your own resistance.',
  'Rhythm Ride': 'Indoor cycling to loud, beat-driven music, with sprints and climbs. For riders who like a party feel.',
  'Strength Basics': 'Learn the main strength moves with free weights and machines, step by step. For beginners and anyone who wants good technique.',
  'Functional Circuit': 'A circuit of stations with kettlebells, ropes and bodyweight moves. For people who like variety and a challenge.',
  'Mobility & Stretch': 'Easy mobility drills and stretching for hips, back and shoulders. Good after a desk day or on a recovery day.',
  'Contemporary for Beginners': 'Learn a short contemporary dance piece, step by step, with floor work and flowing moves. No dance experience needed.',
  'Dance Cardio': 'Easy-to-follow dance routines to upbeat music that keep you moving the whole hour. For anyone who wants cardio that feels like a party.',
  'Salsa Basics': 'Learn salsa basic steps and simple turns, in pairs and on your own. You can come without a partner.',
  'Hip-hop Foundations': 'Hip-hop grooves and short combinations, built up through the class. For beginners with some energy to spare.',
  'Boxing Fundamentals': 'Learn the basic punches, footwork and defence on bags and pads. For beginners who want a hard, focused workout.',
  'Boxfit': 'A boxing-style workout with combinations on the bag and fitness rounds in between. No sparring.',
  'Technique & Pads': 'Work on cleaner punches and combinations with a partner holding pads. For people who know the basics.',
  'Bouldering Intro': 'An introduction to bouldering: safe falling, basic moves and easy routes on low walls. No experience needed.',
  'Morning Bouldering': 'Guided bouldering on quieter morning walls, with tips on technique and route reading. For new and returning climbers.',
  'Climbing Technique': 'Focused bouldering practice on footwork, balance and harder routes. For climbers who already know the basics.',
  'Lane Swim & Technique': 'Lane swimming with a coach who helps with breathing and stroke technique. For swimmers who can do a few lengths.',
  'Aqua Fit': 'A water workout in the shallow end with music, easy on the joints. No swimming skills needed.',
  'Easy Lengths': 'Relaxed lengths at your own pace in a reserved lane. For anyone who wants calm time in the water.',
  'Sauna & Stretch': 'Sauna rounds with gentle stretching and rest in between. For winding down after a busy day.',
  'Breathwork': 'Guided breathing exercises, sitting or lying down, to calm the body and mind. No experience needed.',
  'Sound Bath': 'Lie down and rest while bowls and gongs are played around you. A quiet, deeply relaxing session.',
};
const FEEL = {
  gentle: { quiet: 'It feels calm and unhurried.', medium: 'It feels relaxed, with some music in the background.', loud: 'The pace is easy, though the room can be lively.' },
  moderate: { quiet: 'It feels focused and steady.', medium: 'It feels steady, with a few harder moments.', loud: 'It feels energetic, with music pushing you along.' },
  hard: { quiet: 'It is hard work in a focused, quiet room.', medium: 'Expect to sweat and push through the harder parts.', loud: 'Expect to sweat: loud music and a high pace.' },
};
const describe = (name, intensity, traits) => `${ABOUT[name] ?? ''} ${FEEL[intensity][traits.noise]}`.trim();

const pickTouch = (type) => { const [a, b] = TOUCH_ODDS[type]; const r = rnd2(); return r < a ? 'none' : r < a + b ? 'asks-first' : 'hands-on'; };
const TOUCH_LINE = { none: 'No hands-on corrections.', 'asks-first': 'The trainer asks before any hands-on help.', 'hands-on': 'Hands-on corrections, the trainer may touch to adjust.' };
const NOISE = { quiet: 'Quiet room, soft background music.', medium: 'Music in the background, you can still talk.', loud: 'Loud music, the trainer uses a mic.' };
const LIGHT = { soft: 'Soft, dimmed light.', normal: 'Normal daylight and ceiling lights.', bright: 'Bright white lights.', flashing: 'Coloured and flashing lights in parts.' };
const CROWD = { small: 'Small group, plenty of space.', medium: 'Medium group, enough space.', large: 'Large group, it can get packed.' };
const PACE = { gentle: 'Gentle pace, nothing harder than moderate effort.', moderate: 'Steady pace with a few harder parts.', hard: 'Hard parts to push through, easier options shown.' };

const classes = [];
for (const p of places) {
  const options = [...CATALOG[p.type]];
  const n = classes.length < 100 ? (chance(0.5) ? 3 : 2) : 2;
  const taken = [];
  for (let k = 0; k < n && options.length; k++) {
    const [name, classType, intensity, durationMin, times] = options.splice(Math.floor(rnd() * options.length), 1)[0];
    // at least 60 min (and the class + 15 min) after/before other classes in the same place
    const free = times.filter((t) => taken.every((o) => Math.abs(toMin(t) - toMin(o.start)) >= Math.max(60, (toMin(t) > toMin(o.start) ? o.durationMin : durationMin) + 15)));
    if (!free.length) continue;
    const start = pick(free);
    const tr = p.traits;
    const lines = [PACE[intensity], `${NOISE[tr.noise]} ${LIGHT[tr.light]}`, tr.partnerWork === 'yes' ? `${CROWD[tr.crowd]} Partner work is part of the class.` : `${CROWD[tr.crowd]} No partner work.`];
    const c = { id: `${p.id}-${name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '')}`, placeId: p.id, name, type: classType, start, durationMin, intensity, trainer: pick(TRAINERS), whatToExpect: lines };
    c.touch = pickTouch(p.type); // 'none' | 'asks-first' | 'hands-on'
    c.description = describe(name, intensity, p.traits); // what you do, for whom, how it feels
    c.whatToExpect[2] = `${c.whatToExpect[2]} ${TOUCH_LINE[c.touch]}`;
    taken.push(c);
    classes.push(c);
  }
}
classes.sort((a, b) => toMin(a.start) - toMin(b.start) || a.id.localeCompare(b.id));
for (const c of classes) {
  const end = toMin(c.start) + c.durationMin;
  c.day = 'today'; // the demo shows one day; every class is "today"
  c.end = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  c.whatToBring = BRING[places.find((p) => p.id === c.placeId).type];
}

// ---------- ratings (for the AI feature later; not shown in D yet) ----------
const COMMENTS = ['Music was louder than the card said.', 'Exactly as described, very calm.', 'More people than expected.', 'Great teacher, clear instructions.', 'The room was quite warm.', 'Lights were brighter than I thought.', 'Nice and quiet, I could switch off.', 'Harder than the label says.', 'Easier than I expected, good for a tired day.', 'Changing room was crowded.', 'Lovely space, will come back.', 'A bit too fast for a beginner.', 'Partner work was optional, which helped.', 'The card was spot on.'];
const shift = (v, order) => { const i = order.indexOf(v); const j = Math.min(order.length - 1, Math.max(0, i + (chance(0.75) ? 0 : chance(0.5) ? 1 : -1))); return order[j]; };
const ratings = [];
for (let i = 0; i < 500; i++) {
  const c = pick(classes);
  const tr = places.find((p) => p.id === c.placeId).traits;
  const answers = {
    noise: shift(tr.noise, ['quiet', 'medium', 'loud']),
    light: shift(tr.light === 'flashing' ? 'bright' : tr.light, ['soft', 'normal', 'bright']),
    crowd: shift(tr.crowd, ['small', 'medium', 'large']),
    intensity: shift(c.intensity, ['gentle', 'moderate', 'hard']),
  };
  const diffs = (answers.noise !== tr.noise) + (answers.crowd !== tr.crowd) + (answers.intensity !== c.intensity);
  const day = new Date(Date.UTC(2026, 10, 18) - int(1, 30) * 86400000).toISOString().slice(0, 10);
  const energyBefore = pick(['tired', 'stressed', 'energetic']);
  const matched = diffs === 0 ? (chance(0.9) ? 'yes' : 'partly') : diffs === 1 ? 'partly' : 'no';
  const comment = chance(0.2) ? pick(COMMENTS) : null;
  // 3 different categories (as in the app), answers consistent with the room and class
  const cats = ['level', 'crowd', 'clean', 'atmosphere', 'coaching', 'senses'];
  const chosen = [];
  while (chosen.length < 3) { const k = cats.splice(Math.floor(rnd3() * cats.length), 1)[0]; chosen.push(k); }
  const ix = { gentle: 0, moderate: 1, hard: 2 }[c.intensity];
  const base = {
    level: answers.intensity === c.intensity ? 1 : (answers.intensity === 'hard' || (answers.intensity === 'moderate' && c.intensity === 'gentle')) ? 2 : 0,
    crowd: { small: 0, medium: 1, large: 2 }[answers.crowd],
    clean: rnd3() < 0.7 ? 0 : 1,
    atmosphere: tr.noise === 'quiet' && ix === 0 ? 0 : tr.noise === 'loud' || ix === 2 ? 2 : 1,
    coaching: ix,
  };
  const categoryAnswers = chosen.map((cat) => {
    const bank = QUESTION_BANK.find((q) => q.id === cat);
    if (cat === 'senses') {
      const useMusic = rnd3() < 0.5; const q = bank.questions[useMusic ? 0 : 1];
      const i = useMusic ? (answers.noise === 'loud' ? 2 : answers.noise === 'quiet' && tr.noise !== 'quiet' ? 0 : 1) : (answers.light === 'bright' ? 2 : 1);
      return { category: cat, questionId: q.id, question: q.prompt, answer: q.answers[i] };
    }
    const q = bank.questions[0];
    const i = cat === 'clean' ? base.clean : nudge(base[cat]);
    return { category: cat, questionId: q.id, question: q.prompt, answer: q.answers[i] };
  });
  const r = { id: `r${String(i + 1).padStart(3, '0')}`, classId: c.id, placeId: c.placeId, date: day, energyBefore, answers: categoryAnswers, matched };
  if (comment) r.comment = comment;
  ratings.push(r);
}

mkdirSync(OUT, { recursive: true });
const write = (f, data) => writeFileSync(join(OUT, f), JSON.stringify(data, null, 2) + '\n');
write('places.json', places);
write('classes.json', classes);
write('ratings.json', ratings);
write('questions.json', QUESTION_BANK);
console.log(`places ${places.length} · classes ${classes.length} · ratings ${ratings.length} · comments ${ratings.filter((r) => r.comment).length} · question categories ${QUESTION_BANK.length} (${QUESTION_BANK.reduce((n, c) => n + c.questions.length, 0)} questions)`);
