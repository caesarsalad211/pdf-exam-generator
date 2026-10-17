"use client";

import { Question, Choice } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  selected: string | undefined;
  submitted: boolean;
  onSelect: (val: string) => void;
}

export default function QuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: QuestionCardProps) {
  const isIdentification = question.type === "identification" || !question.choices;

  // Comparison logic for identification: trimmed, case-insensitive
  const isCorrectIdentification =
    Boolean(selected) &&
    selected?.trim().toLowerCase() === question.answer.trim().toLowerCase();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          Question {index}
        </span>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {isIdentification
            ? "✏️ Identification"
            : question.type === "true_false"
            ? "⚖️ True / False"
            : "📝 Multiple Choice"}
        </span>
      </div>

      <p className="mb-5 text-base font-medium text-gray-900 leading-relaxed">
        {question.question}
      </p>

      {/* 1. IDENTIFICATION MODE (Interactive Text Input) */}
      {isIdentification ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              disabled={submitted}
              value={selected || ""}
              onChange={(e) => onSelect(e.target.value)}
              placeholder="Type your answer here..."
              className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus:outline-none
                ${
                  !submitted
                    ? "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    : isCorrectIdentification
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200"
                    : "border-red-400 bg-red-50 text-red-900 ring-2 ring-red-200"
                }`}
            />
            {submitted && (
              <span className="absolute right-3.5 top-3.5 text-xs font-bold">
                {isCorrectIdentification ? "✅ Correct" : "❌ Incorrect"}
              </span>
            )}
          </div>

          {submitted && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
              <span className="font-bold">🎯 Expected Answer:</span>{" "}
              <span className="font-extrabold underline">{question.answer}</span>
            </div>
          )}
        </div>
      ) : (
        /* 2. MULTIPLE CHOICE / TRUE-FALSE BUTTONS */
        <div className="space-y-2">
          {question.choices &&
            (Object.keys(question.choices) as (keyof Choice)[]).map((key) => {
              const choiceText = question.choices?.[key];
              if (!choiceText) return null;

              const isUserSelected = selected === key;
              const isCorrectChoice = key === question.answer;

              let btnClass = "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";

              if (!submitted) {
                if (isUserSelected) {
                  btnClass = "bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200";
                }
              } else {
                if (isCorrectChoice) {
                  btnClass = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 font-semibold";
                } else if (isUserSelected && !isCorrectChoice) {
                  btnClass = "bg-red-50 border-red-400 text-red-900 ring-1 ring-red-200";
                } else {
                  btnClass = "bg-white border-gray-100 text-gray-400";
                }
              }

              return (
                <button
                  key={key}
                  disabled={submitted}
                  onClick={() => onSelect(key)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${btnClass} ${
                    submitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold
                      ${
                        isUserSelected && !submitted
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : isCorrectChoice && submitted
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : isUserSelected && !isCorrectChoice && submitted
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}
                  >
                    {key}
                  </span>
                  <span className="flex-1">{choiceText}</span>
                  {submitted && isCorrectChoice && (
                    <span className="shrink-0 text-emerald-600 font-bold">✓ Correct</span>
                  )}
                </button>
              );
            })}
        </div>
      )}

      {/* RATIONALE EXPLANATION */}
      {submitted && (
        <div className="mt-4 rounded-xl bg-amber-50/80 border border-amber-200 p-3.5">
          <p className="text-xs font-bold text-amber-800 mb-1">💡 Rationale:</p>
          <p className="text-xs leading-relaxed text-amber-950">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
