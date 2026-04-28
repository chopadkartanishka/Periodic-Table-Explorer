import React, { useState, useCallback, useEffect, useRef } from "react";
import elementsData from "../Data/elementsData";
import "./QuizMode.css";

const QUESTION_TYPES = ["symbol-to-name", "name-to-symbol", "number-to-symbol"];

function pickRandom(arr, exclude) {
  const pool = arr.filter((x) => x !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateQuestion(elements) {
  const type = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
  const element = elements[Math.floor(Math.random() * elements.length)];

  // Build 4 unique answer options
  const correctAnswer =
    type === "symbol-to-name" ? element.name
    : type === "name-to-symbol" ? element.symbol
    : element.symbol; // number-to-symbol

  const allAnswers =
    type === "symbol-to-name"
      ? elements.map((e) => e.name)
      : elements.map((e) => e.symbol);

  const distractors = new Set();
  while (distractors.size < 3) {
    distractors.add(pickRandom(allAnswers, correctAnswer));
  }

  const options = [...distractors, correctAnswer].sort(() => Math.random() - 0.5);

  let prompt;
  if (type === "symbol-to-name") {
    prompt = `What element has the symbol "${element.symbol}"?`;
  } else if (type === "name-to-symbol") {
    prompt = `What is the chemical symbol for ${element.name}?`;
  } else {
    prompt = `What is the symbol for the element with atomic number ${element.number}?`;
  }

  return { prompt, options, correctAnswer, element };
}

const QuizMode = ({ onClose }) => {
  const [question, setQuestion] = useState(() => generateQuestion(elementsData));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const nextBtnRef = useRef(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAnswer;

  const handleSelect = useCallback(
    (option) => {
      if (isAnswered) return;
      setSelected(option);
      const correct = option === question.correctAnswer;
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

  const handleNext = useCallback(() => {
    setQuestion(generateQuestion(elementsData));
    setSelected(null);
  }, []);

  // Keyboard support: 1-4 to pick option, Enter/Space for Next
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (isAnswered) {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1 && !isAnswered) handleSelect(question.options[idx]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, handleNext, handleSelect, question.options]);

  // Auto-focus Next button after answering for easy keyboard flow
  useEffect(() => {
    if (isAnswered) nextBtnRef.current?.focus();
  }, [isAnswered]);

  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);

  return (
    <div className="quiz-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quiz Mode">
      <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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
            <span className="quiz-score-label">Best</span>
            <span className="quiz-score-value">{bestStreak}</span>
          </div>
        </div>

        {/* Question */}
        <div className="quiz-question">{question.prompt}</div>

        {/* Element preview chip */}
        <div className="quiz-element-chip">
          <span className="quiz-chip-number">#{question.element.number}</span>
          <span className="quiz-chip-symbol">{question.element.symbol}</span>
          <span className="quiz-chip-name">{question.element.name}</span>
        </div>

        {/* Options */}
        <div className="quiz-options">
          {question.options.map((option, idx) => {
            let cls = "quiz-option";
            if (isAnswered) {
              if (option === question.correctAnswer) cls += " correct";
              else if (option === selected) cls += " wrong";
            }
            return (
              <button
                key={option}
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

        {/* Feedback + Next */}
        {isAnswered && (
          <div className={`quiz-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
            {isCorrect ? "✅ Correct!" : `❌ The answer was "${question.correctAnswer}"`}
          </div>
        )}

        <button
          ref={nextBtnRef}
          className="quiz-next-btn"
          onClick={handleNext}
          disabled={!isAnswered}
        >
          Next Question →
        </button>
        <p className="quiz-hint">Tip: Press 1–4 to answer · Enter / Space for next</p>
      </div>
    </div>
  );
};

export default QuizMode;
