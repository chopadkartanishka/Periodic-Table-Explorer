import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import elementsData from "../Data/elementsData";
import "./QuizMode.css";

const QUESTION_TYPES = ["symbol-to-name", "name-to-symbol", "number-to-symbol"];

const QUIZ_CATEGORIES = [
  { key: "noble gas", label: "Noble gases" },
  { key: "alkali metal", label: "Alkali metals" },
  { key: "transition metal", label: "Transition metals" },
];

const DIFFICULTIES = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

const TIME_LIMITS_SECONDS_BY_DIFFICULTY = {
  easy: 15,
  medium: 10,
  hard: 7,
};

function pickRandom(arr, exclude) {
  const pool = arr.filter((x) => x !== exclude);
  if (pool.length === 0) return exclude;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomDistinct(arr, count, excludeSet) {
  const pool = arr.filter((x) => !excludeSet.has(x));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function normalizeOptions(options) {
  const seen = new Set();
  const unique = [];
  for (const o of options) {
    if (!seen.has(o)) {
      seen.add(o);
      unique.push(o);
    }
  }
  return unique;
}

function generateQuestion({
  elements,
  allElements,
  difficulty,
  typeOverride,
}) {
  const type = typeOverride || QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
  const element = elements[Math.floor(Math.random() * elements.length)];

  const correctAnswer =
    type === "symbol-to-name"
      ? element.name
      : type === "name-to-symbol"
        ? element.symbol
        : element.symbol; // number-to-symbol

  const answersFromElements = (poolElements) =>
    type === "symbol-to-name" ? poolElements.map((e) => e.name) : poolElements.map((e) => e.symbol);

  const localAnswers = answersFromElements(elements);
  const globalAnswers = answersFromElements(allElements);

  const allAnswers = (() => {
    if (difficulty === "easy") return localAnswers;
    if (difficulty === "medium") return localAnswers.length > 0 ? localAnswers : globalAnswers;
    return globalAnswers;
  })();

  const distractors = new Set();
  const excludeSet = new Set([correctAnswer]);
  const desiredDistractors = 3;

  while (distractors.size < desiredDistractors) {
    const candidates = pickRandomDistinct(allAnswers, desiredDistractors - distractors.size, excludeSet);
    if (candidates.length === 0) break;
    for (const c of candidates) distractors.add(c);
    if (distractors.size >= desiredDistractors) break;
    const fallback = pickRandom(allAnswers, correctAnswer);
    if (fallback && fallback !== correctAnswer) distractors.add(fallback);
    else break;
  }

  const options = normalizeOptions([...distractors, correctAnswer]).slice(0, 4).sort(() => Math.random() - 0.5);

  // Ensure we always have 4 options for UI; if not, pad with random global answers.
  if (options.length < 4) {
    const pad = answersFromElements(allElements);
    for (const p of pad) {
      if (options.length >= 4) break;
      if (!options.includes(p)) options.push(p);
    }
    options.sort(() => Math.random() - 0.5);
  }

  let prompt;
  if (type === "symbol-to-name") {
    prompt = `What element has the symbol "${element.symbol}"?`;
  } else if (type === "name-to-symbol") {
    prompt = `What is the chemical symbol for ${element.name}?`;
  } else {
    prompt = `What is the symbol for the element with atomic number ${element.number}?`;
  }

  return { prompt, options, correctAnswer, element, type };
}

function formatSeconds(s) {
  const sec = Math.max(0, Math.floor(s));
  return `${sec}s`;
}

const LS_KEY = "quizHighScores_v1";

// function safeParseJSON(value, fallback) {
//   try {
//     return JSON.parse(value);
//   } catch {
//     return fallback;
//   }
// }

function safeParseJSON(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

// function getHighScoreMap() {
//   if (typeof window === "undefined") return {};
//   const raw = window.localStorage?.getItem(LS_KEY);
//   return safeParseJSON(raw, {});
// }

function getHighScoreMap() {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage?.getItem(LS_KEY);

  const parsed = safeParseJSON(raw, {});

  return parsed && typeof parsed === "object" ? parsed : {};
}

function setHighScoreMap(map) {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(LS_KEY, JSON.stringify(map));
}

function makeRecordKey({ category, difficulty, mode }) {
  return `${category}|${difficulty}|${mode}`;
}

const QuizMode = ({ onClose }) => {
  const allElements = useMemo(() => elementsData, []);

  const [phase, setPhase] = useState("setup"); // setup | playing | results

  const [settings, setSettings] = useState({
    category: "noble gas",
    difficulty: "easy",
    mode: "normal", // normal | timed
  });

  // ---- Fix for runtime crashes when difficulty key is temporarily null/unknown ----
  const safeDifficulty = settings?.difficulty && TIME_LIMITS_SECONDS_BY_DIFFICULTY[settings.difficulty]
    ? settings.difficulty
    : "easy";

  const timeLimitSeconds = TIME_LIMITS_SECONDS_BY_DIFFICULTY[safeDifficulty];

  const questionCount = 10;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(() =>
    generateQuestion({
      elements: allElements,
      allElements,
      difficulty: "easy",
    })
  );

  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const nextBtnRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef(null);
  const timeoutAutoAdvanceRef = useRef(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAnswer;
  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);

  const selectedElements = useMemo(() => {
    const byCategory = (el) => el.category === settings.category;
    const pool = allElements.filter(byCategory);
    return pool.length > 0 ? pool : allElements;
  }, [allElements, settings.category]);


  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const clearAutoAdvance = useCallback(() => {
    if (timeoutAutoAdvanceRef.current) {
      clearTimeout(timeoutAutoAdvanceRef.current);
      timeoutAutoAdvanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      clearAutoAdvance();
    };
  }, [stopTimer, clearAutoAdvance]);

  const startRound = useCallback(() => {
    stopTimer();
    clearAutoAdvance();

    setPhase("playing");
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
    setTimedOut(false);

    const nextQ = generateQuestion({
      elements: selectedElements,
      allElements,
      difficulty: settings.difficulty,
    });
    setQuestion(nextQ);

    if (settings.mode === "timed") {
      setTimeLeft(timeLimitSeconds);
    } else {
      setTimeLeft(null);
    }
  // }, [allElements, clearAutoAdvance, selectedElements, settings.category, settings.difficulty, settings.mode, stopTimer]);

  }, [
  allElements,
  clearAutoAdvance,
  selectedElements,
  settings.difficulty,
  settings.mode,
  stopTimer,
  timeLimitSeconds,
]);
  const finishRound = useCallback(() => {
    stopTimer();
    clearAutoAdvance();
    setPhase("results");

    const recordKey = makeRecordKey(settings);
    const map = getHighScoreMap();

    const prev = map[recordKey];
    const nextRecord = {
      bestScore: score,
      bestAccuracy: accuracy,
      bestStreak: bestStreak,
      bestPlayedAt: new Date().toISOString(),
    };

    // Compare: primary bestScore, then bestAccuracy, then bestStreak
    const isBetter =
      !prev ||
      score > prev.bestScore ||
      (score === prev.bestScore && accuracy > prev.bestAccuracy) ||
      (score === prev.bestScore && accuracy === prev.bestAccuracy && bestStreak > prev.bestStreak);

    if (isBetter) {
      map[recordKey] = nextRecord;
      setHighScoreMap(map);
    }
  }, [accuracy, bestStreak, score, settings, clearAutoAdvance, stopTimer]);

  const goNext = useCallback(() => {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= questionCount) {
      finishRound();
      return;
    }

    setQuestionIndex(nextIndex);
    setSelected(null);
    setTimedOut(false);

    const nextQ = generateQuestion({
      elements: selectedElements,
      allElements,
      difficulty: settings.difficulty,
    });
    setQuestion(nextQ);

    if (settings.mode === "timed") {
      setTimeLeft(timeLimitSeconds);
    } else {
      setTimeLeft(null);
    }
  // }, [allElements, finishRound, questionIndex, questionCount, selectedElements, settings.difficulty, settings.mode]);

  }, [
  allElements,
  finishRound,
  questionIndex,
  questionCount,
  selectedElements,
  settings.difficulty,
  settings.mode,
  timeLimitSeconds,
]);
  const applyAnswer = useCallback(
    (option) => {
      if (isAnswered) return;

      const correct = option === question.correctAnswer;
      setSelected(option);
      setTotal((t) => t + 1);

      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }
    },
    [isAnswered, question.correctAnswer]
  );

  const handleSelect = useCallback(
    (option) => {
      applyAnswer(option);
    },
    [applyAnswer]
  );

  const handleTimedTimeout = useCallback(() => {
    if (isAnswered) return;
    setTimedOut(true);
    setSelected("__timeout__");
    setTotal((t) => t + 1);
    setStreak(0);

    // After feedback delay, auto-advance
    clearAutoAdvance();
    timeoutAutoAdvanceRef.current = setTimeout(() => {
      goNext();
    }, 900);
  }, [clearAutoAdvance, goNext, isAnswered]);


  useEffect(() => {
  if (settings.mode !== "timed") return;
  if (!isAnswered) return;
  if (timedOut) return;

  clearAutoAdvance();

  timeoutAutoAdvanceRef.current = setTimeout(() => {
    goNext();
  }, 900);

  return clearAutoAdvance;
}, [
  settings.mode,
  isAnswered,
  timedOut,
  goNext,
  clearAutoAdvance,
]);

  // Timer tick while playing & not answered
  useEffect(() => {
    if (phase !== "playing") return;
    if (settings.mode !== "timed") return;
    if (isAnswered) return;

    stopTimer();

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return t;
        const next = t - 1;
        if (next <= 0) {
          // timeout
          stopTimer();
          handleTimedTimeout();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => stopTimer();
  }, [phase, handleTimedTimeout, isAnswered, settings.difficulty, settings.mode, stopTimer]);

  // Keyboard support: 1-4 to pick option, Enter/Space for Next (only in normal mode)
  useEffect(() => {
    const onKey = (e) => {
      if (phase !== "playing") return;

      if (e.key === "Enter" || e.key === " ") {
        if (isAnswered && settings.mode === "normal") {
          e.preventDefault();
          goNext();
        }
        return;
      }

      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1 && !isAnswered && settings.mode === "normal") {
        handleSelect(question.options[idx]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, handleSelect, isAnswered, phase, question.options, settings.mode]);

  // Auto-focus Next button after answering (normal mode)
  useEffect(() => {
    if (phase !== "playing") return;
    if (!isAnswered) return;
    if (settings.mode !== "normal") return;
    nextBtnRef.current?.focus();
  }, [isAnswered, phase, settings.mode]);

  // When results page renders, bestRecord reflects the currently stored high score
  // (which may or may not already be updated depending on state update timing).
  // const bestRecord = useMemo(() => {
  //   const map = getHighScoreMap();
  //   const k = makeRecordKey(settings);
  //   return map[k] || null;
  // }, [settings, phase]);

  const bestRecord = useMemo(() => {
  const map = getHighScoreMap();
  const k = makeRecordKey(settings);
  return map[k] || null;
}, [settings]);

  const isNewHighScore = useMemo(() => {
    if (!bestRecord) return true;
    // Determine whether current run is better than stored record.
    if (score > bestRecord.bestScore) return true;
    if (score === bestRecord.bestScore && accuracy > bestRecord.bestAccuracy) return true;
    if (score === bestRecord.bestScore && accuracy === bestRecord.bestAccuracy && bestStreak > bestRecord.bestStreak) return true;
    return false;
  }, [accuracy, bestRecord, bestStreak, score]);


  if (phase === "setup") {
    return (
      <div className="quiz-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quiz Mode">
        <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
          <div className="quiz-header">
            <h2 className="quiz-title">⚗️ Quiz Mode</h2>
            <button className="quiz-close-btn" onClick={onClose} aria-label="Close quiz">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="quiz-setup">
            <h3 className="quiz-setup-title">Choose your quiz</h3>

            <div className="quiz-setup-grid">
              <div className="quiz-setup-field">
                <label className="quiz-setup-label">Category</label>
                <select
                  className="quiz-setup-select"
                  value={settings.category}
                  onChange={(e) => setSettings((s) => ({ ...s, category: e.target.value }))}
                >
                  {QUIZ_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quiz-setup-field">
                <label className="quiz-setup-label">Difficulty</label>
                <select
                  className="quiz-setup-select"
                  value={settings.difficulty}
                  onChange={(e) => setSettings((s) => ({ ...s, difficulty: e.target.value }))}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quiz-setup-field">
                <label className="quiz-setup-label">Mode</label>
                <select
                  className="quiz-setup-select"
                  value={settings.mode}
                  onChange={(e) => setSettings((s) => ({ ...s, mode: e.target.value }))}
                >
                  <option value="normal">Normal</option>
                  <option value="timed">Timed (per question)</option>
                </select>
              </div>
            </div>

            {settings.mode === "timed" && (
              <div className="quiz-setup-timer-note">
                ⏱️ {timeLimitSeconds}s per question ({safeDifficulty})
              </div>
            )}

            <button className="quiz-start-btn" onClick={startRound}>
              Start Quiz ({questionCount} questions)
            </button>
            <p className="quiz-hint">Answer with 1–4 · Keyboard: Enter/Space works in Normal mode</p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const recordKey = makeRecordKey(settings);
    const map = getHighScoreMap();
    const stored = map[recordKey] || null;

    return (
      <div className="quiz-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quiz Results">
        <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
          <div className="quiz-header">
            <h2 className="quiz-title">🏁 Results</h2>
            <button className="quiz-close-btn" onClick={onClose} aria-label="Close results">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="quiz-results-summary">
            <div className="quiz-results-stats">
              <div className="quiz-score-item">
                <span className="quiz-score-label">Score</span>
                <span className="quiz-score-value">{score}/{questionCount}</span>
              </div>
              <div className="quiz-score-item">
                <span className="quiz-score-label">Accuracy</span>
                <span className="quiz-score-value">{accuracy}%</span>
              </div>
              <div className="quiz-score-item">
                <span className="quiz-score-label">Streak</span>
                <span className="quiz-score-value quiz-score-streak">🔥 {bestStreak}</span>
              </div>
              <div className="quiz-score-item">
                <span className="quiz-score-label">Best stored</span>
                <span className="quiz-score-value">{stored ? `${stored.bestScore}/${questionCount}` : `${score}/${questionCount}`}</span>
              </div>
            </div>

            {isNewHighScore && (
              <div className="quiz-new-high">✨ New High Score for this setup!</div>
            )}

            <div className="quiz-results-meta">
              <span>Category: {QUIZ_CATEGORIES.find((c) => c.key === settings.category)?.label || settings.category}</span>
              <span>Difficulty: {DIFFICULTIES.find((d) => d.key === settings.difficulty)?.label || settings.difficulty}</span>
              <span>Mode: {settings.mode === "timed" ? `Timed (${timeLimitSeconds}s)` : "Normal"}</span>
            </div>
          </div>

          <div className="quiz-results-actions">
            <button className="quiz-start-btn" onClick={startRound}>
              Play Again
            </button>
            <button className="quiz-secondary-btn" onClick={() => setPhase("setup")}>
              Change Settings
            </button>
            <button className="quiz-secondary-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing UI
  return (
    <div className="quiz-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quiz Mode">
      <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-header">
          <h2 className="quiz-title">⚗️ Quiz Mode</h2>
          <button className="quiz-close-btn" onClick={onClose} aria-label="Close quiz">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Score bar */}
        <div className="quiz-scorebar">
          <div className="quiz-score-item">
            <span className="quiz-score-label">Score</span>
            <span className="quiz-score-value">{score}/{total}</span>
          </div>
          <div className="quiz-score-item">
            <span className="quiz-score-label">Accuracy</span>
            <span className="quiz-score-value">{accuracy}%</span>
          </div>
          <div className="quiz-score-item">
            <span className="quiz-score-label">Streak</span>
            <span className="quiz-score-value quiz-score-streak">🔥 {streak}</span>
          </div>
          <div className="quiz-score-item">
            <span className="quiz-score-label">Progress</span>
            <span className="quiz-score-value">{questionIndex + 1}/{questionCount}</span>
          </div>
        </div>

        {settings.mode === "timed" && (
          <div className={`quiz-timer ${timeLeft <= 5 ? "quiz-timer-low" : ""}`}>
            ⏱️ Time: {timeLeft === null ? "" : formatSeconds(timeLeft)}
          </div>
        )}

        <div className="quiz-question">{question.prompt}</div>

        <div className="quiz-element-chip">
          <span className="quiz-chip-number">#{question.element.number}</span>
          <span className="quiz-chip-symbol">{question.element.symbol}</span>
          <span className="quiz-chip-name">{question.element.name}</span>
        </div>

        <div className="quiz-options">
          {question.options.map((option, idx) => {
            let cls = "quiz-option";
            if (isAnswered) {
              if (option === question.correctAnswer) cls += " correct";
              else if (option === selected) cls += " wrong";
            }
            return (
              <button
                key={`${option}-${idx}`}
                className={cls}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                aria-label={`Option ${idx + 1}: ${option}`}
              >
                <span className="quiz-option-key">{idx + 1}</span>
                <span className="quiz-option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`quiz-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
            {timedOut ? "⏰ Time's up!" : isCorrect ? "✅ Correct!" : `❌ The answer was "${question.correctAnswer}"`}
          </div>
        )}

        {/* {settings.mode === "normal" ? (
          <button className="quiz-next-btn" ref={nextBtnRef} onClick={goNext} disabled={!isAnswered}>
            Next Question →
          </button>
        ) : (
          <button className="quiz-next-btn" disabled style={{ opacity: 0.5 }}>
            Next Question →
          </button>
        )} */}

        <button
  className="quiz-next-btn"
  ref={nextBtnRef}
  onClick={goNext}
  disabled={!isAnswered}
>
  Next Question →
</button>

        <p className="quiz-hint">
          Tip: Press 1–4 to answer · {settings.mode === "normal" ? "Enter/Space for next" : "Auto-advance on timeout"}
        </p>
      </div>
    </div>
  );
};

export default QuizMode;

