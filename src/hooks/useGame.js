import { useCallback, useEffect, useMemo, useState } from "react";
import { GAME_CONFIG, GAME_STATUS } from "../constants/game";
import { createGameSession, finishGameSession, getPlayerProfile, updatePlayerStats } from "../services/gameService";
import { validateGuessWord } from "../services/wordService";
import {
  buildKeyboardColors,
  checkGuess,
  createBoardRows,
  isWinningResult,
  normalizeWord,
  splitWord,
} from "../utils/gameLogic";
import { useKeyboard } from "./useKeyboard";
import { useStage } from "./useStage";

export function useGame(config = GAME_CONFIG, requestedStageNumber = null) {
  const { stage, progress, isLoadingStage, stageError, loadCurrentStage, completeCurrentStage } = useStage();
  const [word, setWord] = useState(null);
  const [session, setSession] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [status, setStatus] = useState(GAME_STATUS.loading);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeRowId, setShakeRowId] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedStage, setCompletedStage] = useState(null);
  const [profileStats, setProfileStats] = useState({
    totalPoints: 0,
    totalXp: 0,
    level: 1,
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [statsError, setStatsError] = useState("");
  const activeWordLength = word?.length || config.wordLength;

  const startNewGame = useCallback(async () => {
    setCurrentGuess("");
    setGuesses([]);
    setMessage("");
    setStatsError("");
    setPointsEarned(0);
    setXpEarned(0);
    setCompletedStage(null);
    setShakeRowId(null);
    setStatus(GAME_STATUS.loading);
    setWord(null);
    setSession(null);

    const profileResult = await getPlayerProfile();

    if (profileResult.profile) {
      setProfileStats({
        totalPoints: profileResult.profile.total_points || 0,
        totalXp: profileResult.profile.total_xp || 0,
        level: profileResult.profile.level || 1,
        gamesPlayed: profileResult.profile.games_played || 0,
        wins: profileResult.profile.wins || 0,
        currentStreak: profileResult.profile.current_streak || 0,
        bestStreak: profileResult.profile.best_streak || 0,
      });
    }

    const stageResult = await loadCurrentStage(requestedStageNumber);

    if (stageResult.stage?.word) {
      setWord(stageResult.stage.word);

      const sessionResult = await createGameSession({
        wordId: stageResult.stage.word.id,
        stageId: stageResult.stage.id,
      });

      setSession(sessionResult.session || null);
      setStatus(GAME_STATUS.ready);
      setMessage(`المرحلة ${stageResult.stage.stage_number} جاهزة. ابدأ التخمين.`);
      return;
    }

    setStatus(GAME_STATUS.error);
    setMessage(stageResult.error?.message || "تعذر تحميل المرحلة. تحقق من الاتصال.");
  }, [loadCurrentStage, requestedStageNumber]);

  const replayCompletedStage = useCallback(async () => {
    if (!completedStage?.word) {
      startNewGame();
      return;
    }

    setCurrentGuess("");
    setGuesses([]);
    setMessage(`إعادة المرحلة ${completedStage.stage_number}.`);
    setStatsError("");
    setPointsEarned(0);
    setXpEarned(0);
    setCompletedStage(null);
    setShakeRowId(null);
    setStatus(GAME_STATUS.loading);
    setWord(completedStage.word);

    const sessionResult = await createGameSession({
      wordId: completedStage.word.id,
      stageId: completedStage.id,
    });

    setSession(sessionResult.session || null);
    setStatus(GAME_STATUS.ready);
  }, [completedStage, startNewGame]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const rejectGuess = useCallback((text) => {
    setMessage(text);
    setShakeRowId("current");
    window.setTimeout(() => setShakeRowId(null), 520);
  }, []);

  const keyboardColors = useMemo(() => buildKeyboardColors(guesses), [guesses]);

  const addLetter = useCallback(
    (letter) => {
      if (status !== GAME_STATUS.ready || isSubmitting) {
        return;
      }

      const normalizedLetter = normalizeWord(letter);

      if (keyboardColors[normalizedLetter] === "absent") {
        return;
      }

      setCurrentGuess((current) => {
        if (splitWord(current).length >= activeWordLength) {
          return current;
        }

        return normalizeWord(`${current}${normalizedLetter}`);
      });
    },
    [activeWordLength, isSubmitting, keyboardColors, status]
  );

  const removeLetter = useCallback(() => {
    if (status !== GAME_STATUS.ready || isSubmitting) {
      return;
    }

    setCurrentGuess((current) => splitWord(current).slice(0, -1).join(""));
  }, [isSubmitting, status]);

  const finishGame = useCallback(
    async ({ nextGuesses, hasWon, result }) => {
      const nextPoints = hasWon ? stage?.reward_points || 0 : 0;
      const nextXp = hasWon ? stage?.reward_xp || 0 : 0;
      const nextStatus = hasWon ? GAME_STATUS.won : GAME_STATUS.lost;

      setStatus(nextStatus);
      setPointsEarned(nextPoints);
      setXpEarned(nextXp);
      setCompletedStage(hasWon ? stage : null);
      setMessage(
        hasWon
          ? `أحسنت! أكملت المرحلة ${stage.stage_number} وربحت ${nextPoints} نقطة و ${nextXp} XP.`
          : `انتهت المحاولات. أعد المحاولة في المرحلة ${stage?.stage_number || 1}.`
      );

      const sessionResult = await finishGameSession({
        sessionId: session?.id,
        attemptsUsed: nextGuesses.length,
        status: hasWon ? "won" : "lost",
        pointsEarned: nextPoints,
        xpEarned: nextXp,
      });

      const progressResult = hasWon
        ? await completeCurrentStage(stage.stage_number)
        : { progress, error: null };
      const profileResult = await updatePlayerStats({
        pointsEarned: nextPoints,
        hasWon,
        xpEarned: nextXp,
      });

      if (sessionResult.error || profileResult.error || progressResult.error) {
        setStatsError("انتهت الجولة، لكن تعذر حفظ كل التقدم الآن.");
      }

      setProfileStats((current) => ({
        totalPoints: profileResult.data?.total_points ?? current.totalPoints + nextPoints,
        totalXp: profileResult.data?.total_xp ?? current.totalXp + nextXp,
        level: profileResult.data?.level ?? current.level,
        gamesPlayed: profileResult.data?.games_played ?? current.gamesPlayed + 1,
        wins: profileResult.data?.wins ?? current.wins + (hasWon ? 1 : 0),
        currentStreak: profileResult.data?.current_streak ?? current.currentStreak,
        bestStreak: profileResult.data?.best_streak ?? current.bestStreak,
      }));

      return result;
    },
    [completeCurrentStage, progress, session?.id, stage]
  );

  const submitGuess = useCallback(async () => {
    if (status !== GAME_STATUS.ready || isSubmitting || !word) {
      return;
    }

    const normalizedGuess = normalizeWord(currentGuess);

    if (splitWord(normalizedGuess).length !== activeWordLength) {
      rejectGuess(`يجب أن تكون الكلمة من ${activeWordLength} أحرف.`);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const validation = await validateGuessWord(normalizedGuess, activeWordLength);

    if (validation.error) {
      rejectGuess("تعذر التحقق من الكلمة. تحقق من الاتصال وحاول مرة أخرى.");
      setIsSubmitting(false);
      return;
    }

    if (!validation.isValid) {
      rejectGuess("هذه الكلمة غير موجودة في القاموس.");
      setIsSubmitting(false);
      return;
    }

    const result = checkGuess(normalizedGuess, word.word);
    const nextGuess = {
      id: `guess-${guesses.length}-${normalizedGuess}`,
      word: normalizedGuess,
      result,
    };
    const nextGuesses = [...guesses, nextGuess];
    const hasWon = isWinningResult(result);
    const hasLost = !hasWon && nextGuesses.length >= config.maxAttempts;

    setGuesses(nextGuesses);
    setCurrentGuess("");

    if (hasWon || hasLost) {
      await finishGame({
        nextGuesses,
        hasWon,
        result,
      });
    } else {
      setMessage(`محاولة ${nextGuesses.length + 1} من ${config.maxAttempts}.`);
    }

    setIsSubmitting(false);
  }, [
    activeWordLength,
    config.maxAttempts,
    currentGuess,
    finishGame,
    guesses,
    isSubmitting,
    rejectGuess,
    status,
    word,
  ]);

  useKeyboard({
    onLetter: addLetter,
    onBackspace: removeLetter,
    onSubmit: submitGuess,
    isEnabled: status === GAME_STATUS.ready && !isSubmitting,
  });

  const boardRows = useMemo(
    () =>
      createBoardRows({
        guesses,
        currentGuess,
        maxAttempts: config.maxAttempts,
        wordLength: activeWordLength,
      }),
    [activeWordLength, config.maxAttempts, currentGuess, guesses]
  );

  return {
    boardRows,
    currentGuess,
    guesses,
    keyboardColors,
    status,
    message: stageError || statsError || message,
    isLoading: isLoadingStage,
    isSubmitting,
    pointsEarned,
    xpEarned,
    completedStage,
    profileStats,
    attempt: Math.min(guesses.length + 1, config.maxAttempts),
    config,
    wordLength: activeWordLength,
    addLetter,
    removeLetter,
    submitGuess,
    startNewGame,
    resetGame: startNewGame,
    replayCompletedStage,
    shakeRowId,
    targetWord: status === GAME_STATUS.lost ? word?.word : "",
    stage,
    progress,
  };
}
