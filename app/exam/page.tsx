"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question, Choice } from "@/lib/types";
import QuestionCard from "@/components/QuestionCard";
import ReviewerCard from "@/components/ReviewerCard";
import ScoreSummary from "@/components/ScoreSummary";
import ApiKeyModal from "@/components/ApiKeyModal";
import AboutModal from "@/components/AboutModal";
import { updateExamScore, exportExamAsJson } from "@/lib/storage";

type Tab = "exam" | "reviewer";

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, keyof Choice>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("exam");
  const [examId, setExamId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>("Exam");

  useEffect(() => {
    const raw = sessionStorage.getItem("exam_questions");
    if (!raw) {
      router.replace("/");
      return;
    }
    setQuestions(JSON.parse(raw));

    const id = sessionStorage.getItem("current_exam_id");
    const title = sessionStorage.getItem("current_exam_title");
    const initialTab = sessionStorage.getItem("exam_initial_tab") as Tab | null;

    if (id) setExamId(id);
    if (title) setExamTitle(title);
    if (initialTab === "reviewer") setActiveTab("reviewer");
  }, [router]);

  function handleSelect(questionId: number, key: keyof Choice) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }

  function handleSubmit() {
    setSubmitted(true);
    setShowScore(true);

    const correctCount = questions.filter(
      (q) => answers[q.id] === q.answer
    ).length;

    if (examId) {
      updateExamScore(examId, correctCount, questions.length);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReview() {
    setShowScore(false);
    setActiveTab("reviewer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetake() {
    setAnswers({});
    setSubmitted(false);
    setShowScore(false);
    setActiveTab("exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleExport() {
    exportExamAsJson({
      title: examTitle,
      questions,
    });
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.answer
  ).length;

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading exam…
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to Generator & History
        </button>
        <div className="text-center sm:text-right">
          <h1 className="text-base font-bold text-gray-900 truncate max-w-sm sm:max-w-md">
            {examTitle}
          </h1>
          <span className="text-xs text-gray-400">
            {questions.length} Multiple Choice Items
          </span>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <AboutModal />
          <ApiKeyModal />
          <button
            onClick={handleExport}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            💾 Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Score summary (shown after submit) */}
      {showScore && (
        <div className="mb-8">
          <ScoreSummary
            total={questions.length}
            correct={correctCount}
            onReview={handleReview}
            onRetake={handleRetake}
          />
        </div>
      )}

      {/* Tabs */}
      {!showScore && (
        <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm print:hidden">
          {(["exam", "reviewer"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition-colors
                ${activeTab === tab
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              {tab === "exam" ? "📝 Exam Mode" : "📖 Reviewer Mode"}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar (exam mode only) */}
      {activeTab === "exam" && !submitted && !showScore && (
        <div className="mb-6 print:hidden">
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{questions.length - answeredCount} remaining</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions list */}
      {!showScore && (
        <div className="space-y-5">
          {questions.map((q, i) =>
            activeTab === "exam" ? (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                selected={answers[q.id] ?? null}
                submitted={submitted}
                onSelect={(key) => handleSelect(q.id, key)}
              />
            ) : (
              <ReviewerCard key={q.id} question={q} index={i} />
            )
          )}
        </div>
      )}

      {/* Submit button (exam mode, not yet submitted) */}
      {activeTab === "exam" && !submitted && !showScore && (
        <div className="mt-8 print:hidden">
          {answeredCount < questions.length && (
            <p className="mb-3 text-center text-sm text-amber-600">
              ⚠️ You have {questions.length - answeredCount} unanswered question
              {questions.length - answeredCount !== 1 ? "s" : ""}.
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg hover:bg-indigo-700 transition-colors active:scale-[0.99]"
          >
            Submit Exam
          </button>
        </div>
      )}

      {/* After submission in exam mode — show score again at bottom */}
      {submitted && !showScore && activeTab === "exam" && (
        <div className="mt-8 print:hidden">
          <ScoreSummary
            total={questions.length}
            correct={correctCount}
            onReview={handleReview}
            onRetake={handleRetake}
          />
        </div>
      )}
    </main>
  );
}
