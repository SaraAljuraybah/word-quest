import { LETTER_STATE_PRIORITY } from "../constants/game";

export function getUpgradedLetterState(currentState, nextState) {
  const currentPriority = LETTER_STATE_PRIORITY[currentState] || 0;
  const nextPriority = LETTER_STATE_PRIORITY[nextState] || 0;

  return nextPriority > currentPriority ? nextState : currentState;
}

export function buildKeyboardColors(guesses) {
  return guesses.reduce((colors, guess) => {
    guess.result.forEach(({ letter, state }) => {
      colors[letter] = getUpgradedLetterState(colors[letter], state);
    });

    return colors;
  }, {});
}
