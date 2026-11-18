import { getVariant } from '../lib/variant';
/**
 * Mock data for the Urban Sports Clue / Read the Room prototype.
 *
 * Everything here is fictional: studios, trainers, addresses and numbers.
 * Edit freely. The UI reads only from this file.
 *
 * Research IDs (see docs/research.md) are noted next to each field group.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ClassType =
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'spinning'
  | 'dance'
  | 'swimming'
  | 'boxing'
  | 'gym';

/** 1 = very easy … 5 = very hard */
export type Intensity = 1 | 2 | 3 | 4 | 5;

/** 1 = quiet background … 5 = club-loud */
export type Volume = 1 | 2 | 3 | 4 | 5;

/** 1 = very relaxed … 5 = very strict */
export type TrainerStyle = 1 | 2 | 3 | 4 | 5;

export type Busyness = 'calm' | 'moderate' | 'busy';
export type RoomSize = 'small' | 'medium' | 'spacious';
export type LightLevel = 'dim' | 'natural' | 'bright' | 'flashing';
export type PartnerWork = 'none' | 'optional' | 'required';

export interface Facilities {
  // Research: F-FACILITIES (showers incl. private, lockers, safe box, space to change)
  showers: 'private' | 'shared' | 'shared-and-private' | 'none';
  lockers: 'free' | 'bring-padlock' | 'none';
  safeBox: boolean;
  changingRoom: { crowding: 'roomy' | 'gets-busy' | 'tight'; note?: string };
  towels: 'free' | 'rent' | 'bring';
}

export interface Studio {
  id: string;
  name: string;
  district: string;
  address: string;
  // Research: F-LOCATION (location stops 8/22 from booking). DEMO: from the fixed demo location, Kreuzberg.
  distanceKm: number;
  travelMin: number;
  facilities: Facilities;
}

export interface FlowStep {
  name: string;
  minutes: number;
  intensity: Intensity;
}

export interface ExpectInfo {
  // Research: F-CROWD (dealbreaker for 9/22, #1 reason to leave)
  crowd: {
    typicalMin: number;
    typicalMax: number;
    capacity: number;
    roomSize: RoomSize;
    busyness: Busyness;
    note?: string;
  };
  // Research: F-CLEAN (strongest dealbreaker, 10/22)
  // PRD: "never guess": null = not described yet
  clean: {
    lastCleaned: string;
    /** Member rating 1–5, one decimal. null = not enough ratings yet */
    rating: number | null;
    ventilation: string | null;
    temperature: string | null;
  };
  // Research: F-LEVEL (labels are not honest)
  level: {
    official: string;
    reality: string;
    priorKnowledge: string;
    /** % of first-timers who said the level matched the label */
    firstTimerMatchPct: number;
  };
  // Research: F-SOUND
  /** mic: null = not described yet */
  sound: { volume: Volume; mic: boolean | null; note?: string };
  // Research: F-LIGHT
  light: { level: LightLevel; note?: string };
  // Research: F-TRAINER
  trainer: {
    style: TrainerStyle;
    handsOn: boolean;
    /** null when the trainer doesn't do hands-on corrections at all */
    asksBeforeTouch: boolean | null;
    note?: string;
  };
  // Research: F-PARTNER
  partner: { work: PartnerWork; note?: string };
  // Research: F-FLOW
  flow: FlowStep[];
  // Research: F-BRING
  bring: string[];
  arrival: string;
  // Research: F-SOCIAL
  leaving: { quietExitOk: boolean; note: string };
  social: string[];
  // PRD: "quiet space" field (a place to step out or arrive calmly). null = not described yet
  quietSpace: string | null;
}

export interface ClassInfo {
  id: string;
  studioId: string;
  name: string;
  type: ClassType;
  /** 24h "HH:MM", all classes are "today" in the prototype */
  start: string;
  durationMin: number;
  trainer: string;
  // Research: F-VIBE (atmosphere is the top factor, 18/22)
  vibe: string;
  /** Anonymous member answers from the last 30 days the card is based on (PRD: name the sources) */
  reports: number;
  /** Does the studio's own checklist exist for this class? (PRD: studio checklist + member answers) */
  studioChecklist: boolean;
  /** PRD: when recent feedback differs from the description, e.g. "Recently reported as louder" */
  recentReport?: string;
  expect: ExpectInfo;
}

// ---------------------------------------------------------------------------
// Studios (6, fictional, Berlin)
// distanceKm / travelMin are DEMO values measured from one fixed demo location
// ("You're near: Kreuzberg"). No GPS, no routing.
// ---------------------------------------------------------------------------

export const studios: Studio[] = [
  {
    id: 'stillwerk',
    name: 'Stillwerk Yoga',
    district: 'Neukölln',
    address: 'Weserhof 14',
    distanceKm: 2.1, // demo data
    travelMin: 10, // demo data
    facilities: {
      showers: 'private',
      lockers: 'free',
      safeBox: true,
      changingRoom: { crowding: 'roomy', note: 'Two separate changing rooms with curtains' },
      towels: 'free',
    },
  },
  {
    id: 'hafen',
    name: 'Hafen Pilates Loft',
    district: 'Kreuzberg',
    address: 'Uferweg 3, 2nd floor',
    distanceKm: 0.8, // demo data
    travelMin: 4, // demo data
    facilities: {
      showers: 'shared',
      lockers: 'free',
      safeBox: true,
      changingRoom: { crowding: 'gets-busy', note: 'Small. Gets tight around 18:30–19:00' },
      towels: 'rent',
    },
  },
  {
    id: 'eisenhalle',
    name: 'Eisenhalle',
    district: 'Wedding',
    address: 'Gerichtshof 22',
    distanceKm: 7.5, // demo data
    travelMin: 28, // demo data
    facilities: {
      showers: 'shared',
      lockers: 'bring-padlock',
      safeBox: false,
      changingRoom: { crowding: 'tight', note: 'One shared room per gender, packed after evening classes' },
      towels: 'bring',
    },
  },
  {
    id: 'pulse',
    name: 'Pulse Cycle House',
    district: 'Friedrichshain',
    address: 'Lichtenberger Bogen 8',
    distanceKm: 3.0, // demo data
    travelMin: 14, // demo data
    facilities: {
      showers: 'shared-and-private',
      lockers: 'free',
      safeBox: true,
      changingRoom: { crowding: 'gets-busy', note: 'Queue for showers after evening rides' },
      towels: 'free',
    },
  },
  {
    id: 'tanzraum',
    name: 'Tanzraum Schöneberg',
    district: 'Schöneberg',
    address: 'Akazienhof 5',
    distanceKm: 3.4, // demo data
    travelMin: 15, // demo data
    facilities: {
      showers: 'none',
      lockers: 'free',
      safeBox: false,
      changingRoom: { crowding: 'gets-busy', note: 'One small room, many people change in the hallway' },
      towels: 'bring',
    },
  },
  {
    id: 'nordbad',
    name: 'Nordbad Aquatics',
    district: 'Prenzlauer Berg',
    address: 'Wasserturmweg 2',
    distanceKm: 5.5, // demo data
    travelMin: 22, // demo data
    facilities: {
      showers: 'shared-and-private',
      lockers: 'free',
      safeBox: true,
      changingRoom: { crowding: 'roomy', note: 'Individual cabins plus open area' },
      towels: 'rent',
    },
  },
];

// ---------------------------------------------------------------------------
// Classes (12), deliberately varied: calm, loud, crowded, misleading labels
// ---------------------------------------------------------------------------

export const classes: ClassInfo[] = [
  {
    id: 'hiit-express',
    studioId: 'eisenhalle',
    name: 'HIIT Express',
    type: 'hiit',
    start: '07:00',
    durationMin: 30,
    trainer: 'Jonas',
    vibe: 'Short, fast and loud. A quick wake-up for people who like a push.',
    reports: 9,
    studioChecklist: false,
    expect: {
      crowd: { typicalMin: 12, typicalMax: 16, capacity: 18, roomSize: 'medium', busyness: 'busy', note: 'Stations are close together' },
      clean: { lastCleaned: 'Equipment wiped after every class', rating: null, ventilation: 'Large fans, no AC', temperature: null },
      level: { official: 'All levels', reality: 'Fast pace, but every move has an easier option', priorKnowledge: 'None. Moves are shown before each round', firstTimerMatchPct: 78 },
      sound: { volume: 4, mic: true },
      light: { level: 'bright', note: 'White ceiling lights, full brightness' },
      trainer: { style: 4, handsOn: false, asksBeforeTouch: null, note: 'Motivating, counts down loudly' },
      partner: { work: 'optional', note: 'One partner round at the end, you can do it solo' },
      flow: [
        { name: 'Warm-up', minutes: 5, intensity: 2 },
        { name: 'Intervals (40s on / 20s off)', minutes: 20, intensity: 5 },
        { name: 'Cool-down', minutes: 5, intensity: 1 },
      ],
      bring: ['Indoor trainers', 'Towel', 'Water bottle', 'Padlock for the locker'],
      arrival: '10 min early to grab a station',
      leaving: { quietExitOk: true, note: 'Fine to step out, the door is at the back' },
      social: ['Mirrors on one wall', 'Phones stay in lockers'],
      quietSpace: null,
    },
  },
  {
    id: 'sunrise-spin',
    studioId: 'pulse',
    name: 'Sunrise Spin',
    type: 'spinning',
    start: '07:15',
    durationMin: 45,
    trainer: 'Mira',
    vibe: 'A steady morning ride with soft lights. Energising, but not a party.',
    reports: 36,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 10, typicalMax: 14, capacity: 32, roomSize: 'spacious', busyness: 'calm', note: 'Lots of free bikes, you can pick a spot at the side' },
      clean: { lastCleaned: 'Bikes wiped after every ride', rating: 4.6, ventilation: 'AC and fresh-air system', temperature: 'Cool, about 19 °C' },
      level: { official: 'Open level', reality: 'You set your own resistance, nobody checks', priorKnowledge: 'None. Bike setup is shown at the start', firstTimerMatchPct: 86 },
      sound: { volume: 3, mic: true, note: 'Upbeat music, you can still hear the trainer clearly' },
      light: { level: 'dim', note: 'Warm low light, no strobe in morning rides' },
      trainer: { style: 2, handsOn: true, asksBeforeTouch: true, note: 'Helps with saddle height if you want' },
      partner: { work: 'none' },
      flow: [
        { name: 'Bike setup & warm-up', minutes: 8, intensity: 1 },
        { name: 'Climbs and sprints', minutes: 30, intensity: 4 },
        { name: 'Cool-down & stretch', minutes: 7, intensity: 1 },
      ],
      bring: ['Towel (free here)', 'Water bottle', 'Trainers or cycling shoes'],
      arrival: '10 min early for bike setup on your first ride',
      leaving: { quietExitOk: true, note: 'Fine to leave, the door is at the side' },
      social: ['No mirrors', 'Room stays dim, nobody watches'],
      quietSpace: 'Chill-out lounge by reception',
    },
  },
  {
    id: 'slow-flow',
    studioId: 'stillwerk',
    name: 'Slow Flow Yoga',
    type: 'yoga',
    start: '07:30',
    durationMin: 60,
    trainer: 'Lea',
    vibe: 'Quiet, slow and gentle. Good for easing into the day.',
    reports: 71,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 6, typicalMax: 9, capacity: 16, roomSize: 'spacious', busyness: 'calm', note: 'Plenty of space between mats' },
      clean: { lastCleaned: 'Floor cleaned before every class', rating: 4.8, ventilation: 'Windows opened between classes', temperature: 'Warm, about 23 °C' },
      level: { official: 'Beginner', reality: 'Truly beginner-friendly, slow pace', priorKnowledge: 'None', firstTimerMatchPct: 92 },
      sound: { volume: 1, mic: false, note: 'Soft instrumental music or silence' },
      light: { level: 'natural', note: 'Daylight through large windows' },
      trainer: { style: 1, handsOn: true, asksBeforeTouch: true, note: 'Uses a "yes/no to touch" card on your mat' },
      partner: { work: 'none' },
      flow: [
        { name: 'Arriving & breathing', minutes: 10, intensity: 1 },
        { name: 'Slow flow', minutes: 35, intensity: 2 },
        { name: 'Stretch & rest', minutes: 15, intensity: 1 },
      ],
      bring: ['Comfortable clothes', 'Mats and towels are provided'],
      arrival: '5–10 min early, the door closes at start time',
      leaving: { quietExitOk: true, note: 'Fine to leave quietly, the door is at the back' },
      social: ['No mirrors', 'Filming not allowed'],
      quietSpace: 'Tea corner by the entrance',
    },
  },
  {
    id: 'mat-pilates',
    studioId: 'hafen',
    name: 'Mat Pilates Basics',
    type: 'pilates',
    start: '09:00',
    durationMin: 50,
    trainer: 'Sophie',
    vibe: 'Small, calm group. Slow, careful work on your core.',
    reports: 42,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 6, typicalMax: 8, capacity: 10, roomSize: 'medium', busyness: 'calm' },
      clean: { lastCleaned: 'Mats and props cleaned after every class', rating: 4.7, ventilation: 'AC', temperature: 'Comfortable, about 21 °C' },
      level: { official: 'Beginner', reality: 'Real beginner class, lots of explaining', priorKnowledge: 'None', firstTimerMatchPct: 88 },
      sound: { volume: 2, mic: false, note: 'Soft background music' },
      light: { level: 'natural' },
      trainer: { style: 3, handsOn: true, asksBeforeTouch: true, note: 'Precise, explains why each move matters' },
      partner: { work: 'none' },
      flow: [
        { name: 'Breathing & warm-up', minutes: 10, intensity: 1 },
        { name: 'Core & mobility', minutes: 32, intensity: 3 },
        { name: 'Stretch', minutes: 8, intensity: 1 },
      ],
      bring: ['Grip socks', 'Comfortable clothes', 'Towel (or rent one for €2)'],
      arrival: '5 min early',
      leaving: { quietExitOk: true, note: 'Fine to leave, just roll up your mat' },
      social: ['Mirror at the front', 'Small group, friendly regulars'],
      quietSpace: 'Small waiting area with seats',
    },
  },
  {
    id: 'contemporary-beginners',
    studioId: 'tanzraum',
    name: 'Contemporary Dance for Beginners',
    type: 'dance',
    start: '11:00',
    durationMin: 75,
    trainer: 'Amara',
    vibe: 'Relaxed and playful. Nobody expects you to be good at it.',
    reports: 29,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 8, typicalMax: 12, capacity: 20, roomSize: 'spacious', busyness: 'calm', note: 'Space to move freely' },
      clean: { lastCleaned: 'Floor mopped daily', rating: 4.3, ventilation: 'Open windows', temperature: 'Can be cool, bring a layer' },
      level: { official: 'Beginner', reality: 'Choreography is taught from scratch every week', priorKnowledge: 'None', firstTimerMatchPct: 91 },
      sound: { volume: 2, mic: null, note: 'Music varies, from piano to soft electronic' },
      light: { level: 'natural' },
      trainer: { style: 1, handsOn: false, asksBeforeTouch: null },
      partner: { work: 'optional', note: 'One short partner exercise, you can watch instead' },
      flow: [
        { name: 'Warm-up on the floor', minutes: 15, intensity: 2 },
        { name: 'Learning the sequence', minutes: 40, intensity: 3 },
        { name: 'Dancing it through & stretch', minutes: 20, intensity: 2 },
      ],
      bring: ['Socks or bare feet', 'Comfortable clothes', 'A warm layer', 'Water bottle'],
      arrival: '10 min early, change in the hallway if the room is full',
      leaving: { quietExitOk: true, note: 'Fine to leave quietly, the door is at the side' },
      social: ['Mirrors on one wall, curtain can be closed', 'Filming only at the end, if everyone agrees'],
      quietSpace: null,
    },
  },
  {
    id: 'lane-swim',
    studioId: 'nordbad',
    name: 'Lane Swim & Technique',
    type: 'swimming',
    start: '12:00',
    durationMin: 45,
    trainer: 'Karim',
    vibe: 'Calm midday swim with tips on technique. Echoey, warm and humid.',
    reports: 54,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 6, typicalMax: 10, capacity: 16, roomSize: 'spacious', busyness: 'calm', note: 'Usually 2–3 people per lane, sorted by speed' },
      clean: { lastCleaned: 'Pool area cleaned every morning', rating: 4.5, ventilation: 'Air system, a bit humid', temperature: 'Water 28 °C, air warm and humid' },
      level: { official: 'Intermediate', reality: 'You need to swim 4 lengths without stopping', priorKnowledge: 'Basic front crawl or breaststroke', firstTimerMatchPct: 81 },
      sound: { volume: 2, mic: false, note: 'No music, but the hall echoes' },
      light: { level: 'bright', note: 'Daylight plus bright pool lights' },
      trainer: { style: 2, handsOn: false, asksBeforeTouch: null, note: 'Gives tips from the pool edge' },
      partner: { work: 'none' },
      flow: [
        { name: 'Easy lengths', minutes: 10, intensity: 2 },
        { name: 'Technique drills', minutes: 25, intensity: 3 },
        { name: 'Easy swim-out', minutes: 10, intensity: 1 },
      ],
      bring: ['Swimwear', 'Swim cap', 'Goggles', 'Flip-flops', 'Towel (or rent one)'],
      arrival: '15 min early, you need to shower before the pool',
      leaving: { quietExitOk: true, note: 'Fine to get out any time, nobody minds' },
      social: ['Private changing cabins', 'Filming not allowed in the pool area'],
      quietSpace: 'Rest area with benches by the pool',
    },
  },
  {
    id: 'strength-basics',
    studioId: 'eisenhalle',
    name: 'Strength Basics',
    type: 'gym',
    start: '12:30',
    durationMin: 45,
    trainer: 'Deniz',
    vibe: 'Tiny group, lots of attention. Learn the main lifts without pressure.',
    reports: 23,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 4, typicalMax: 6, capacity: 8, roomSize: 'small', busyness: 'calm', note: 'Corner of the gym floor, the gym itself is quiet at lunchtime' },
      clean: { lastCleaned: 'Equipment wiped after use', rating: 4.2, ventilation: null, temperature: 'Comfortable at lunchtime' },
      level: { official: 'Beginner', reality: 'Real beginner class, light weights to start', priorKnowledge: 'None', firstTimerMatchPct: 89 },
      sound: { volume: 2, mic: false, note: 'Gym music in the background' },
      light: { level: 'bright' },
      trainer: { style: 3, handsOn: true, asksBeforeTouch: true, note: 'Checks your form one by one' },
      partner: { work: 'none' },
      flow: [
        { name: 'Mobility warm-up', minutes: 10, intensity: 2 },
        { name: 'Learning 2 lifts', minutes: 28, intensity: 3 },
        { name: 'Stretch', minutes: 7, intensity: 1 },
      ],
      bring: ['Indoor trainers', 'Towel', 'Water bottle', 'Padlock for the locker'],
      arrival: '5 min early',
      leaving: { quietExitOk: true, note: 'Fine to leave, you are on the open gym floor' },
      social: ['Mirrors everywhere (it is a gym)', 'Some gym members film themselves'],
      quietSpace: 'Stretching corner away from the weights',
    },
  },
  {
    id: 'boxing-fundamentals',
    studioId: 'eisenhalle',
    name: 'Boxing Fundamentals',
    type: 'boxing',
    start: '18:00',
    durationMin: 60,
    trainer: 'Valentina',
    vibe: 'Loud and sweaty, with a strong team feeling. Pad work in pairs.',
    reports: 61,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 16, typicalMax: 22, capacity: 24, roomSize: 'medium', busyness: 'busy', note: 'Gets packed after work' },
      clean: { lastCleaned: 'Mats cleaned daily, gloves sprayed after use', rating: 3.6, ventilation: 'Fans only, gets stuffy', temperature: 'Hot by the end' },
      level: { official: 'Beginner', reality: 'Technique is beginner, but the tempo is high', priorKnowledge: 'None, but good basic fitness helps', firstTimerMatchPct: 64 },
      sound: { volume: 4, mic: false, note: 'Loud music, the trainer shouts over it' },
      light: { level: 'bright' },
      trainer: { style: 4, handsOn: true, asksBeforeTouch: false, note: 'Corrects your stance by hand. Tell her if you would rather not' },
      partner: { work: 'required', note: 'Pad work in pairs, you rotate partners' },
      flow: [
        { name: 'Skipping & warm-up', minutes: 10, intensity: 3 },
        { name: 'Technique', minutes: 15, intensity: 3 },
        { name: 'Pad work in pairs', minutes: 25, intensity: 5 },
        { name: 'Core & stretch', minutes: 10, intensity: 2 },
      ],
      bring: ['Indoor trainers', 'Towel', 'Water bottle', 'Hand wraps (or borrow)', 'Padlock for the locker'],
      arrival: '10 min early to borrow gloves',
      leaving: { quietExitOk: true, note: 'You can leave, but your partner will need a new one' },
      social: ['Mirror wall', 'Regulars sometimes film sparring'],
      quietSpace: null,
    },
  },
  {
    id: 'dance-cardio',
    studioId: 'tanzraum',
    name: 'Dance Cardio',
    type: 'dance',
    start: '18:00',
    durationMin: 60,
    trainer: 'Nico',
    vibe: 'High-energy party feeling. Regulars know the routine.',
    reports: 38,
    studioChecklist: true,
    recentReport: 'Recently reported as louder than described. The partner team is checking',
    expect: {
      crowd: { typicalMin: 20, typicalMax: 26, capacity: 28, roomSize: 'medium', busyness: 'busy', note: 'Little space to move freely' },
      clean: { lastCleaned: 'Floor mopped daily', rating: 3.9, ventilation: 'Open windows, gets warm', temperature: 'Warm' },
      level: { official: 'Open level', reality: 'Most people are regulars who already know the choreography', priorKnowledge: 'The choreography continues from last week, and steps are not taught again', firstTimerMatchPct: 38 },
      sound: { volume: 4, mic: true, note: 'Pop and dance hits' },
      light: { level: 'bright', note: 'Coloured lights, no strobe' },
      trainer: { style: 2, handsOn: false, asksBeforeTouch: null },
      partner: { work: 'none' },
      flow: [
        { name: 'Warm-up', minutes: 10, intensity: 2 },
        { name: 'Routine (no step breakdown)', minutes: 40, intensity: 4 },
        { name: 'Cool-down', minutes: 10, intensity: 1 },
      ],
      bring: ['Indoor trainers', 'Towel', 'Water bottle'],
      arrival: '10 min early to find a spot',
      leaving: { quietExitOk: false, note: 'The door is at the front, so leaving mid-class is noticeable' },
      social: ['Mirror wall', 'Some people film the routine for practice'],
      quietSpace: null,
    },
  },
  {
    id: 'vinyasa-open',
    studioId: 'stillwerk',
    name: 'Vinyasa Flow',
    type: 'yoga',
    start: '18:30',
    durationMin: 75,
    trainer: 'Tomás',
    vibe: 'Strong, flowing and full. Feels more like a workout than relaxation.',
    reports: 83,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 18, typicalMax: 22, capacity: 24, roomSize: 'medium', busyness: 'busy', note: 'Mats nearly touching' },
      clean: { lastCleaned: 'Floor cleaned before every class', rating: 4.7, ventilation: 'Windows opened between classes', temperature: 'Warm, about 25 °C with a full room' },
      level: { official: 'Open level', reality: 'Most people are advanced, the pace is fast', priorKnowledge: 'Know Sun Salutations and the basic pose names', firstTimerMatchPct: 41 },
      sound: { volume: 3, mic: false, note: 'Rhythmic music, the trainer speaks over it' },
      light: { level: 'dim', note: 'Candle-style lights' },
      trainer: { style: 3, handsOn: true, asksBeforeTouch: true, note: 'Asks at the start who wants adjustments' },
      partner: { work: 'none' },
      flow: [
        { name: 'Warm-up', minutes: 10, intensity: 2 },
        { name: 'Fast flow & arm balances', minutes: 50, intensity: 4 },
        { name: 'Stretch & rest', minutes: 15, intensity: 1 },
      ],
      bring: ['Comfortable clothes', 'Your own mat if you prefer, otherwise provided'],
      arrival: '10–15 min early, it fills up',
      leaving: { quietExitOk: true, note: 'Fine to leave quietly, the door is at the back' },
      social: ['No mirrors', 'Filming not allowed'],
      quietSpace: 'Tea corner by the entrance',
    },
  },
  {
    id: 'reformer-open',
    studioId: 'hafen',
    name: 'Reformer Pilates',
    type: 'pilates',
    start: '19:00',
    durationMin: 55,
    trainer: 'Greta',
    vibe: 'Focused and precise. Only 8 machines, so it never feels packed.',
    reports: 47,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 7, typicalMax: 8, capacity: 8, roomSize: 'medium', busyness: 'moderate', note: 'Usually fully booked, but each machine has its own space' },
      clean: { lastCleaned: 'Machines wiped after every class', rating: 4.8, ventilation: 'AC', temperature: 'Comfortable, about 21 °C' },
      level: { official: 'Open level', reality: 'Assumes you already know how the reformer works', priorKnowledge: 'One intro session or previous reformer classes', firstTimerMatchPct: 55 },
      sound: { volume: 2, mic: false, note: 'Soft background music' },
      light: { level: 'bright', note: 'Bright white lights' },
      trainer: { style: 5, handsOn: true, asksBeforeTouch: false, note: 'Corrects position by hand, tell her at the start if you would rather not' },
      partner: { work: 'none' },
      flow: [
        { name: 'Setup & footwork', minutes: 10, intensity: 2 },
        { name: 'Full-body sequence', minutes: 38, intensity: 4 },
        { name: 'Stretch', minutes: 7, intensity: 1 },
      ],
      bring: ['Grip socks (required)', 'Comfortable, close-fitting clothes', 'Towel (or rent one)'],
      arrival: '10 min early, changing room gets tight before 19:00',
      leaving: { quietExitOk: true, note: 'Fine to leave, just tell the trainer' },
      social: ['Mirror at the front', 'Filming not allowed'],
      quietSpace: 'Small waiting area with seats',
    },
  },
  {
    id: 'rhythm-ride',
    studioId: 'pulse',
    name: 'Rhythm Ride',
    type: 'spinning',
    start: '19:30',
    durationMin: 45,
    trainer: 'Mira',
    vibe: 'Club night on a bike. Dark, very loud and packed. Some people love it.',
    reports: 95,
    studioChecklist: true,
    expect: {
      crowd: { typicalMin: 28, typicalMax: 32, capacity: 32, roomSize: 'medium', busyness: 'busy', note: 'Always fully booked, bikes close together' },
      clean: { lastCleaned: 'Bikes wiped after every ride', rating: 4.4, ventilation: 'AC, gets warm in a full room', temperature: 'Warm' },
      level: { official: 'Open level', reality: 'You set your own resistance, but the beat sets the pace', priorKnowledge: 'None, but a first ride at Sunrise Spin helps', firstTimerMatchPct: 72 },
      sound: { volume: 5, mic: true, note: 'Free earplugs at reception' },
      light: { level: 'flashing', note: 'Dark room with strobe and flashing lights during sprints' },
      trainer: { style: 3, handsOn: false, asksBeforeTouch: null, note: 'High energy, shouts encouragement' },
      partner: { work: 'none' },
      flow: [
        { name: 'Warm-up', minutes: 5, intensity: 2 },
        { name: 'Beat-based sprints & climbs', minutes: 35, intensity: 5 },
        { name: 'Cool-down', minutes: 5, intensity: 1 },
      ],
      bring: ['Towel (free here)', 'Water bottle', 'Trainers or cycling shoes'],
      arrival: '15 min early, the changing room is busy',
      leaving: { quietExitOk: false, note: 'Bikes are in tight rows and the door is at the front' },
      social: ['Dark room, nobody can really see you', 'Phones not allowed in the room'],
      quietSpace: 'Chill-out lounge by reception',
    },
  },
];

// ---------------------------------------------------------------------------
// Versions B and E: an evenly spread day (07:00–21:00, round times, ≥ 60 min apart),
// each class at a fitting time of day. Only the start time changes; Version A (the
// default route) keeps the original times above.
// ---------------------------------------------------------------------------

const DAY_PLAN: Record<string, string> = {
  'hiit-express': '07:00', // before work
  'sunrise-spin': '08:00', // morning ride before work
  'slow-flow': '09:00', // "easing into the day"
  'mat-pilates': '10:00', // calm morning
  'lane-swim': '12:00', // lunchtime
  'strength-basics': '13:00', // "quiet at lunchtime"
  'vinyasa-open': '16:00', // afternoon
  'boxing-fundamentals': '17:00', // "gets packed after work"
  'contemporary-beginners': '18:00', // gentle after-work option
  'reformer-open': '19:00', // "changing room gets tight before 19:00"
  'dance-cardio': '20:00', // evening
  'rhythm-ride': '21:00', // "club night on a bike"
};

for (const c of classes) {
  const original = c.start;
  Object.defineProperty(c, 'start', {
    enumerable: true,
    get: () => (getVariant() === 'a' ? original : DAY_PLAN[c.id] ?? original),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "07:30" → 450. Times are compared as real times, not as text. */
export function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Earliest start first. */
export const byStart = (a: ClassInfo, b: ClassInfo) => toMinutes(a.start) - toMinutes(b.start);

export function getClass(id: string): ClassInfo | undefined {
  return classes.find((c) => c.id === id);
}

export function getStudio(id: string): Studio {
  const s = studios.find((st) => st.id === id);
  if (!s) throw new Error(`Unknown studio: ${id}`);
  return s;
}

export function endTime(c: ClassInfo): string {
  const [h, m] = c.start.split(':').map(Number);
  const total = h * 60 + m + c.durationMin;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
