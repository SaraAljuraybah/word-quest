export const GAME_CONFIG = {
  wordLength: 5,
  maxAttempts: 6,
};

export const POINTS_BY_ATTEMPT = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 25,
  6: 10,
};

export const GAME_STATUS = {
  loading: "loading",
  ready: "ready",
  won: "won",
  lost: "lost",
  error: "error",
};

export const LETTER_STATE_PRIORITY = {
  absent: 1,
  present: 2,
  correct: 3,
};

export const ARABIC_KEYBOARD_ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح"],
  ["ج", "د", "ش", "س", "ي", "ب", "ل", "ا", "ت", "ن"],
  ["م", "ك", "ط", "ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ"],
];
