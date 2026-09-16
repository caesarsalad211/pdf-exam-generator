"use client";

import { useState, useEffect, useCallback } from "react";
import { Question } from "@/lib/types";

interface FlashcardViewProps {
  questions: Question[];
}

export default function FlashcardView({ questions }: FlashcardViewProps) {
  const [deck, setDeck] = useState<Question[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDeck(questions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
  }, [questions]);

  const currentQ = deck[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMarkMastered = useCallback(() => {
    if (!currentQ) return;
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(currentQ.id);
      return next;
    });
    // Auto advance to next card
    setTimeout(() => {
      handleNext();
    }, 200);
  }, [currentQ, handleNext]);

  const handleMarkLearning = useCallback(() => {
    if (!currentQ) return;
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentQ.id);
      return next;
    });
    setTimeout(() => {
      handleNext();
    }, 200);
  }, [currentQ, handleNext]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1" || e.key.toLowerCase() === "m") {
        handleMarkMastered();
      } else if (e.key === "2" || e.key.toLowerCase() === "l") {
        handleMarkLearning();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkMastered, handleMarkLearning]);

  if (!currentQ || deck.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No questions available for flashcards.
      </div>
    );
  }

  const isMastered = masteredIds.has(currentQ.id);
  const masteryPercentage = Math.round((masteredIds.size / deck.length) * 100);
  const answerText = currentQ.choices[currentQ.answer] || "";

  return (
    <div className="mx-auto max-w-2xl py-4">
      {/* Top Controls & Mastery Bar */}
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Card {currentIndex + 1} of {deck.length}
          </span>
          {isMastered && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              ✓ Mastered
            </span>
          )}
        </div>

        {/* Mastery meter */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600">
            {masteredIds.size}/{deck.length} ({masteryPercentage}%)
          </span>
          <button
            onClick={handleShuffle}
            title="Shuffle deck"
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            🔀 Shuffle
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="group relative h-[380px] w-full cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <div
          className="relative h-full w-full rounded-3xl transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT OF CARD */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-indigo-100 bg-white p-8 shadow-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Question #{currentQ.id}
              </span>
              <span className="text-xs text-gray-400">
                {currentQ.type === "true_false" ? "True / False" : "Multiple Choice"}
              </span>
            </div>

            <div className="my-auto text-center">
              <h3 className="text-lg font-bold leading-relaxed text-gray-900 sm:text-xl">
                {currentQ.question}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600">
              <span>🔄 Click or press</span>
              <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold">
                Space
              </kbd>
              <span>to reveal answer</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-indigo-50/40 p-8 shadow-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                ✓ Correct Answer
              </span>
              <span className="text-xs text-gray-400">Card #{currentQ.id}</span>
            </div>

            <div className="my-auto space-y-3 text-center">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-white shadow-md">
                <span className="text-lg font-black">{currentQ.answer}:</span>
                <span className="text-base font-bold">{answerText}</span>
              </div>

              {currentQ.explanation && (
                <div className="mx-auto max-w-md rounded-xl border border-gray-100 bg-white/90 p-3.5 text-xs text-gray-600 leading-relaxed shadow-xs">
                  <p className="font-semibold text-gray-700 mb-0.5">💡 Rationale:</p>
                  <p>{currentQ.explanation}</p>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-gray-400">
              Click to flip back to question
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Rating */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Rating Buttons */}
        <div className="flex w-full max-w-md items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkLearning();
            }}
            className="flex-1 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition-all active:scale-[0.98]"
          >
            ❌ Still Learning
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered();
            }}
            className="flex-1 rounded-xl border border-emerald-300 bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            ✅ Mastered
          </button>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={handleFlip}
            className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            🔄 Flip Card
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>

        <p className="text-[11px] text-gray-400">
          Keyboard Shortcuts: <kbd className="font-semibold text-gray-600">Space</kbd> to flip • <kbd className="font-semibold text-gray-600">← / →</kbd> to navigate • <kbd className="font-semibold text-gray-600">M</kbd> mastered
        </p>
      </div>
    </div>
  );
}
