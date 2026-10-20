export const DECK = [0, 1, 2, 3, 5, 8, 13, 21, 34, '?'] as const;
export type Vote = typeof DECK[number];
export const SUITS = ['ember', 'claw', 'orbit', 'split-crown'] as const;
export type Suit = typeof SUITS[number];
export const MAX_PEOPLE = 20;
export const IDLE_MS = 15 * 60 * 1000;
export const PROTOCOL_VERSION = 1;
export const MAX_FRAME_BYTES = 4096;
