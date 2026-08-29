"use client";

interface ScoreSummaryProps {
  total: number;
  correct: number;
  onReview: () => void;
  onRetake: () => void;
}

export default function ScoreSummary({
  total,
  correct,
  onReview,
  onRetake,
}: ScoreSummaryProps) {
  const pct = Math.round((correct / total) * 100);
  const grade =
    pct >= 90 ? "🏆 Excellent!" : pct >= 75 ? "👍 Good job!" : pct >= 50 ? "📚 Keep studying!" : "💪 Don't give up!";

  const ringColor =
    pct >= 75 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="mb-2 text-2xl font-bold text-gray-900">{grade}</p>
      <p className="mb-6 text-sm text-gray-500">Here's how you did:</p>

      {/* Score ring */}
      <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-8 border-gray-100">
        <div className={`text-center ${ringColor}`}>
          <span className="block text-3xl font-extrabold">{pct}%</span>
          <span className="block text-xs text-gray-400">
            {correct} / {total}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onReview}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
        >
          📖 Review Answers
        </button>
        <button
          onClick={onRetake}
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          🔄 Retake Exam
        </button>
      </div>
    </div>
  );
}
