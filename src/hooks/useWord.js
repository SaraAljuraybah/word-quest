import { useCallback, useState } from "react";
import { GAME_CONFIG } from "../constants/game";
import { createGameSession } from "../services/gameService";
import { getRandomActiveWord } from "../services/wordService";
import { normalizeWord } from "../utils/gameLogic";

export function useWord(config = GAME_CONFIG) {
  const [word, setWord] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [wordError, setWordError] = useState(null);

  const loadWord = useCallback(async () => {
    setIsLoadingWord(true);
    setWordError(null);

    const { word: selectedWord, error } = await getRandomActiveWord(config.wordLength);

    if (error || !selectedWord) {
      setWord(null);
      setSession(null);
      setWordError(error?.message || "تعذر تحميل كلمة جديدة.");
      setIsLoadingWord(false);
      return { word: null, session: null, error };
    }

    const normalizedWord = {
      ...selectedWord,
      word: normalizeWord(selectedWord.word),
    };

    const sessionResult = await createGameSession({
      wordId: normalizedWord.id,
    });

    setWord(normalizedWord);
    setSession(sessionResult.session || null);

    if (sessionResult.error) {
      setWordError("تم تحميل الكلمة، لكن تعذر إنشاء جلسة اللعبة.");
    }

    setIsLoadingWord(false);
    return { word: normalizedWord, session: sessionResult.session, error: sessionResult.error };
  }, [config.wordLength]);

  return {
    word,
    session,
    isLoadingWord,
    wordError,
    loadWord,
  };
}
