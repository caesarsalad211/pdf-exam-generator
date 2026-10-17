"use client";

import { Question, Choice } from "@/lib/types";

interface ReviewerCardProps {
  question: Question;
  index: number;
}

export default function ReviewerCard({ question, index }: ReviewerCardProps) {
  const isIdentification = question.type === "identification" || !question.choices;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Left: Question + Choices or Identification Answer */}
      <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
        <div>
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

          <p className="mb-4 text-sm font-medium text-gray-900 leading-relaxed">
            {question.question}
          </p>

          {/* Identification Answer Display */}
          {isIdentification ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                🎯 Correct Identified Term:
              </p>
              <p className="text-base font-extrabold text-emerald-950">
                {question.answer}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {question.choices &&
                (Object.keys(question.choices) as (keyof Choice)[]).map((key) => {
                  const choiceText = question.choices?.[key];
                  if (!choiceText) return null;
                  const isCorrect = key === question.answer;

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors
                        ${
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold"
                            : "border-gray-200 bg-gray-50/60 text-gray-500"
                        }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold
                          ${
                            isCorrect
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-gray-300 text-gray-400"
                          }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1">{choiceText}</span>
                      {isCorrect && (
                        <span className="shrink-0 text-emerald-600 font-bold">✓</span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Explanation */}
      <div className="flex flex-col justify-center p-6 bg-amber-50/70 border-t md:border-t-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Rationale & Explanation
          </span>
        </div>
        <p className="text-xs leading-relaxed text-amber-950">
          {question.explanation}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <span>Answer: {question.answer}</span>
          {!isIdentification && question.choices?.[question.answer as keyof Choice] && (
            <>
              <span>—</span>
              <span className="font-semibold">
                {question.choices[question.answer as keyof Choice]}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
