"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question, Choice } from "@/lib/types";
import QuestionCard from "@/components/QuestionCard";
import ReviewerCard from "@/components/ReviewerCard";
import FlashcardView from "@/components/FlashcardView";
import ScoreSummary from "@/components/ScoreSummary";
import ApiKeyModal from "@/components/ApiKeyModal";
import AboutModal from "@/components/AboutModal";
import {
  getSavedExams,
  fetchAndSyncSavedExams,
  updateExamScore,
  exportExamAsJson,
} from "@/lib/storage";

type Tab = "exam" | "reviewer" | "flashcards";

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, keyof Choice>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("exam");
  const [examId, setExamId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>("Exam");
  const [loading, setLoading] = useState(true);

  // Timer State
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function loadExam() {
      // Check timer
      const storedTimer = sessionStorage.getItem("exam_time_limit");
      if (storedTimer) {
        const mins = parseInt(storedTimer, 10);
        if (!isNaN(mins) && mins > 0) {
          setTimeRemaining(mins * 60);
        }
      }

      // 1. Try sessionStorage first
      const raw = sessionStorage.getItem("exam_questions");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.length > 0) {
            setQuestions(parsed);
            setOriginalQuestions(parsed);
            const id = sessionStorage.getItem("current_exam_id");
            const title = sessionStorage.getItem("current_exam_title");
            const initialTab = sessionStorage.getItem("exam_initial_tab") as Tab | null;
            if (id) setExamId(id);
            if (title) setExamTitle(title);
            if (initialTab === "reviewer" || initialTab === "flashcards") {
              setActiveTab(initialTab);
            }
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 2. If sessionStorage was wiped, restore from ID
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get("id") || localStorage.getItem("current_exam_id");

      if (targetId) {
        let exams = getSavedExams();
        let found = exams.find((e) => e.id === targetId);

        if (!found) {
          const synced = await fetchAndSyncSavedExams();
          found = synced.find((e) => e.id === targetId);
        }

        if (found) {
          setQuestions(found.questions);
          setOriginalQuestions(found.questions);
          setExamId(found.id);
          setExamTitle(found.title);
          if (found.timeLimitMinutes && found.timeLimitMinutes > 0) {
            setTimeRemaining(found.timeLimitMinutes * 60);
          }
          sessionStorage.setItem("exam_questions", JSON.stringify(found.questions));
          sessionStorage.setItem("current_exam_id", found.id);
          sessionStorage.setItem("current_exam_title", found.title);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback: load latest saved exam
      const exams = getSavedExams();
      if (exams.length > 0) {
        const latest = exams[0];
        setQuestions(latest.questions);
        setOriginalQuestions(latest.questions);
        setExamId(latest.id);
        setExamTitle(latest.title);
        sessionStorage.setItem("exam_questions", JSON.stringify(latest.questions));
        sessionStorage.setItem("current_exam_id", latest.id);
        sessionStorage.setItem("current_exam_title", latest.title);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace("/");
    }

    loadExam();
  }, [router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitted || activeTab !== "exam") {
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          alert("⏱️ Time is up! Your exam has been automatically submitted.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, submitted, activeTab]);

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
    // Retake full original set
    setQuestions(originalQuestions);
    setAnswers({});
    setSubmitted(false);
    setShowScore(false);
    setActiveTab("exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetakeMissed() {
    const missed = questions.filter((q) => answers[q.id] !== q.answer);
    if (missed.length === 0) return;
    setQuestions(missed);
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
  const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
  const missedCount = questions.length - correctCount;

  if (loading || questions.length === 0) {
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

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-xs hover:bg-gray-50 print:hidden transition-colors"
            title="Back to Home"
          >
            ← Home
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{examTitle}</h1>
            <span className="text-xs text-gray-400">
              {questions.length} questions
              {questions.length !== originalQuestions.length &&
                ` (Filtered from ${originalQuestions.length})`}
            </span>
          </div>
        </div>

        {/* Right Tools: Timer, About, Key, Export */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Countdown Timer Badge */}
          {timeRemaining !== null && !submitted && (
            <div
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs
                ${
                  timeRemaining <= 60
                    ? "bg-red-600 text-white animate-pulse"
                    : timeRemaining <= 300
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                }`}
            >
              <span>⏱️</span>
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          )}

          <AboutModal />
          <ApiKeyModal />
          <button
            onClick={handleExport}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            💾 Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Mode Tabs: Exam vs Reviewer vs Flashcards */}
      <div className="mb-6 flex rounded-2xl bg-gray-100 p-1.5 print:hidden">
        <button
          onClick={() => setActiveTab("exam")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all
            ${
              activeTab === "exam"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
        >
          📝 Exam Mode ({answeredCount}/{questions.length})
        </button>
        <button
          onClick={() => setActiveTab("reviewer")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all
            ${
              activeTab === "reviewer"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
        >
          📖 Side-by-Side Reviewer
        </button>
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all
            ${
              activeTab === "flashcards"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
        >
          🃏 Flashcards
        </button>
      </div>

      {/* TAB 1: EXAM MODE */}
      {activeTab === "exam" && (
        <div className="space-y-6">
          {showScore && (
            <ScoreSummary
              total={questions.length}
              correct={correctCount}
              missedCount={missedCount}
              onReview={handleReview}
              onRetake={handleRetake}
              onRetakeMissed={handleRetakeMissed}
            />
          )}

          {/* Progress Bar */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs print:hidden">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold">
                Answered: {answeredCount} of {questions.length}
              </span>
              <span>{Math.round((answeredCount / questions.length) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                index={idx + 1}
                question={q}
                selected={answers[q.id]}
                onSelect={(key) => handleSelect(q.id, key)}
                submitted={submitted}
              />
            ))}
          </div>

          {/* Submit Exam Button */}
          {!submitted && (
            <div className="sticky bottom-6 rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm print:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {answeredCount === questions.length
                      ? "All questions answered! Ready to score."
                      : `${questions.length - answeredCount} unanswered questions remaining`}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Submit to see your score, review rationales, or retake missed items.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount === 0}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  Submit Exam ({answeredCount}/{questions.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVIEWER MODE */}
      {activeTab === "reviewer" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900 print:hidden">
            <p className="font-bold mb-0.5">📖 Reviewer Mode</p>
            <p className="text-gray-600">
              Questions and choices on the left with correct answers highlighted in green, accompanied by concise AI rationales on the right.
            </p>
          </div>
          {questions.map((q, idx) => (
            <ReviewerCard key={q.id} index={idx + 1} question={q} />
          ))}
        </div>
      )}

      {/* TAB 3: FLASHCARDS MODE */}
      {activeTab === "flashcards" && <FlashcardView questions={questions} />}
    </main>
  );
}
