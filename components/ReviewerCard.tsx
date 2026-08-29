"use client";

import { Question, Choice } from "@/lib/types";

const CHOICE_KEYS: (keyof Choice)[] = ["A", "B", "C", "D"];

interface ReviewerCardProps {
  question: Question;
  index: number;
}

export default function ReviewerCard({ question, index }: ReviewerCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Left: Question + Choices */}
      <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
          Question {index + 1}
        </p>
        <p className="mb-5 text-base font-medium text-gray-900">
          {question.question}
        </p>
        <div className="space-y-2">
          {CHOICE_KEYS.map((key) => {
            const isCorrect = key === question.answer;
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium
                  ${isCorrect
                    ? "border-green-400 bg-green-50 text-green-800"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold
                    ${isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 text-gray-400"
                    }`}
                >
                  {key}
                </span>
                <span className="flex-1">{question.choices[key]}</span>
                {isCorrect && (
                  <span className="shrink-0 text-green-500">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Explanation */}
      <div className="flex flex-col justify-center p-6 bg-amber-50">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Explanation
          </span>
        </div>
        <p className="text-sm leading-relaxed text-amber-900">
          {question.explanation}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <span>Answer: {question.answer}</span>
          <span>—</span>
          <span>{question.choices[question.answer]}</span>
        </div>
      </div>
    </div>
  );
}
