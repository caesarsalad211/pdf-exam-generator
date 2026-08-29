"use client";

import { Question, Choice } from "@/lib/types";

const CHOICE_KEYS: (keyof Choice)[] = ["A", "B", "C", "D"];

const choiceColors: Record<string, string> = {
  selected_correct: "bg-green-100 border-green-500 text-green-800",
  selected_wrong: "bg-red-100 border-red-500 text-red-800",
  correct_reveal: "bg-green-50 border-green-400 text-green-700",
  default: "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50",
};

interface QuestionCardProps {
  question: Question;
  index: number;
  selected: keyof Choice | null;
  submitted: boolean;
  onSelect: (key: keyof Choice) => void;
}

export default function QuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: QuestionCardProps) {
  function getChoiceClass(key: keyof Choice): string {
    if (!submitted) {
      return selected === key
        ? "bg-indigo-100 border-indigo-500 text-indigo-800"
        : choiceColors.default;
    }
    // After submission
    if (key === question.answer) return choiceColors.correct_reveal;
    if (selected === key && key !== question.answer) return choiceColors.selected_wrong;
    return "bg-white border-gray-200 text-gray-400";
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
        Question {index + 1}
      </p>
      <p className="mb-5 text-base font-medium text-gray-900">
        {question.question}
      </p>

      <div className="space-y-2">
        {CHOICE_KEYS.map((key) => (
          <button
            key={key}
            disabled={submitted}
            onClick={() => onSelect(key)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${getChoiceClass(key)} ${submitted ? "cursor-default" : "cursor-pointer"}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold
                ${selected === key && !submitted ? "border-indigo-500 bg-indigo-500 text-white" : "border-current"}`}
            >
              {key}
            </span>
            {question.choices[key]}
          </button>
        ))}
      </div>

      {submitted && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 Explanation</p>
          <p className="text-sm text-amber-900">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
