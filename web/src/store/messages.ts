/**
 * Mouse encouragement message pool (placeholder)
 *
 * Mirrors schemas/card_pool_mouse.json. For the placeholder we use English
 * because the pixel font only contains ASCII digits. Real i18n with Chinese
 * pixel font support comes later.
 */

export interface CardMessage {
  text: string;
  /** general | short_session | long_session | cumulative_5_days */
  condition: string;
}

export const MOUSE_POOL: CardMessage[] = [
  // A. Direct affirmation
  { text: 'Hey. I see you.', condition: 'general' },
  { text: "You're so cool.", condition: 'general' },
  { text: 'Pretty good today.', condition: 'general' },
  { text: 'Even a short one counts.', condition: 'short_session' },
  { text: 'You held on so long.', condition: 'long_session' },
  // B. Closing
  { text: 'Imma hide now...', condition: 'general' },
  { text: "That's it for today.", condition: 'general' },
  { text: 'You go home too.', condition: 'general' },
  { text: 'Off duty.', condition: 'general' },
  { text: 'Bye-bye.', condition: 'general' },
  // C. Gentle
  { text: 'Slow is fine.', condition: 'general' },
  { text: 'Curl up if tired.', condition: 'general' },
  { text: 'Mouse likes quiet folks.', condition: 'general' },
  { text: 'Another day. Good.', condition: 'cumulative_5_days' },
  { text: 'All good.', condition: 'general' },
];

let lastShownIndex = -1;

/**
 * Picks a message from the pool, considering the session duration.
 * - Short sessions (< 15min) sometimes pick the "short" line
 * - Long sessions (>= 60min) sometimes pick the "long" line
 * - Otherwise random from the general pool
 * - Anti-repeat: don't pick the same as last time
 */
export function pickMouseMessage(sessionMinutes: number): CardMessage {
  const pool = MOUSE_POOL;
  const general = pool.filter((m) => m.condition === 'general');

  // 10% conditional
  if (Math.random() < 0.1) {
    if (sessionMinutes < 15) {
      return pool.find((m) => m.condition === 'short_session') ?? general[0];
    }
    if (sessionMinutes >= 60) {
      return pool.find((m) => m.condition === 'long_session') ?? general[0];
    }
  }

  // Anti-repeat
  const candidates = general
    .map((_, i) => i)
    .filter((i) => i !== lastShownIndex);
  const pickIdx = candidates[Math.floor(Math.random() * candidates.length)];
  lastShownIndex = pickIdx;
  return general[pickIdx];
}
