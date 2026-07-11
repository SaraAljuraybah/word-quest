import { POINTS_BY_ATTEMPT } from "../constants/game";
export { buildKeyboardColors } from "./keyboardColors";

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;

export function normalizeWord(value = "") {
  return value
    .trim()
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "");
}

export function isArabicWord(value = "") {
  return /^[\u0621-\u064A]+$/.test(normalizeWord(value));
}

export function splitWord(word) {
  return Array.from(normalizeWord(word));
}

export function getWordLength(word) {
  return splitWord(word).length;
}

export function checkGuess(guess, answer) {
  const guessLetters = splitWord(guess);
  const answerLetters = splitWord(answer);
  const result = guessLetters.map((letter, index) => ({
    letter,
    state: "absent",
    index,
  }));
  const remaining = new Map();

  answerLetters.forEach((letter, index) => {
    if (guessLetters[index] === letter) {
      result[index].state = "correct";
      return;
    }

    remaining.set(letter, (remaining.get(letter) || 0) + 1);
  });

  guessLetters.forEach((letter, index) => {
    if (result[index].state === "correct") {
      return;
    }

    const available = remaining.get(letter) || 0;

    if (available > 0) {
      result[index].state = "present";
      remaining.set(letter, available - 1);
    }
  });

  return result;
}

export function calculatePoints(attemptNumber, hasWon) {
  if (!hasWon) {
    return 0;
  }

  return POINTS_BY_ATTEMPT[attemptNumber] || 0;
}

export function isWinningResult(result) {
  return result.every((tile) => tile.state === "correct");
}

export function createBoardRows({ guesses, currentGuess, maxAttempts, wordLength }) {
  const rows = guesses.map((guess) => ({
    id: guess.id,
    letters: guess.result,
    status: "submitted",
  }));

  if (rows.length < maxAttempts) {
    const activeLetters = splitWord(currentGuess);

    rows.push({
      id: "current",
      status: "current",
      letters: Array.from({ length: wordLength }, (_, index) => ({
        letter: activeLetters[index] || "",
        state: "empty",
        index,
      })),
    });
  }

  while (rows.length < maxAttempts) {
    rows.push({
      id: `empty-${rows.length}`,
      status: "empty",
      letters: Array.from({ length: wordLength }, (_, index) => ({
        letter: "",
        state: "empty",
        index,
      })),
    });
  }

  return rows;
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
