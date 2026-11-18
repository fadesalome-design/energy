/**
 * Plain-language words for every scale on the card.
 * Copy is neutral on purpose: "loud" and "busy" describe, they don't warn.
 * Research: F-SENSORY (6 enjoy busy places, 6 prefer calm, so neither is "bad")
 */
import type {
  Busyness, ClassType, Facilities, Intensity, LightLevel, PartnerWork, RoomSize, TrainerStyle, Volume,
} from '../data/classes';

export const typeLabel: Record<ClassType, string> = {
  yoga: 'Yoga', pilates: 'Pilates', hiit: 'HIIT', spinning: 'Spinning',
  dance: 'Dance', swimming: 'Swimming', boxing: 'Boxing', gym: 'Gym class',
  climbing: 'Climbing', wellness: 'Sauna & wellness',
};

export const busynessLabel: Record<Busyness, string> = {
  calm: 'Calm', moderate: 'Moderate', busy: 'Busy',
};

export const roomSizeLabel: Record<RoomSize, string> = {
  small: 'small room', medium: 'medium room', spacious: 'spacious room',
};

// Research: F-SOUND (brief: "quiet background" … "club-loud")
export const volumeLabel: Record<Volume, string> = {
  1: 'Quiet background', 2: 'Soft music', 3: 'Noticeable, you can still talk', 4: 'Loud', 5: 'Club-loud',
};

// Research: F-LIGHT
export const lightLabel: Record<LightLevel, string> = {
  dim: 'Dim', natural: 'Natural light', bright: 'Bright', flashing: 'Flashing / strobe',
};

export const trainerStyleLabel: Record<TrainerStyle, string> = {
  1: 'Very relaxed', 2: 'Relaxed', 3: 'Balanced', 4: 'Strict', 5: 'Very strict',
};

export const partnerLabel: Record<PartnerWork, string> = {
  none: 'No partner work', optional: 'Partner work optional', required: 'Partner work required',
};

export const intensityLabel: Record<Intensity, string> = {
  1: 'Very easy', 2: 'Easy', 3: 'Moderate', 4: 'Hard', 5: 'Very hard',
};

export const showersLabel: Record<Facilities['showers'], string> = {
  private: 'Private showers',
  shared: 'Shared showers',
  'shared-and-private': 'Shared + private showers',
  none: 'No showers',
};

export const lockersLabel: Record<Facilities['lockers'], string> = {
  free: 'Lockers included',
  'bring-padlock': 'Lockers, bring a padlock',
  none: 'No lockers',
};

export const changingLabel: Record<Facilities['changingRoom']['crowding'], string> = {
  roomy: 'Roomy changing room',
  'gets-busy': 'Changing room gets busy',
  tight: 'Changing room gets crowded',
};

export const towelsLabel: Record<Facilities['towels'], string> = {
  free: 'Towels provided',
  rent: 'Towels to rent',
  bring: 'Bring your own towel',
};
