"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SavedExam } from "@/lib/types";
import {
  getSavedExams,
  deleteSavedExam,
  exportExamAsJson,
  importExamFromJson,
} from "@/lib/storage";

export default function ExamHistory() {
  const router = useRouter();
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExams(getSavedExams());
  }, []);

  function handleOpenExam(exam: SavedExam, mode: "exam" | "reviewer") {
    sessionStorage.setItem("exam_questions", JSON.stringify(exam.questions));
    sessionStorage.setItem("current_exam_id", exam.id);
    sessionStorage.setItem("current_exam_title", exam.title);
    sessionStorage.setItem("exam_initial_tab", mode);
    router.push("/exam");
  }

  function handleDelete(id: string) {
    if (confirm("Delete this saved exam?")) {
      const updated = deleteSavedExam(id);
      setExams(updated);
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const newExam = importExamFromJson(text);
        setExams((prev) => [newExam, ...prev]);
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : "Failed to import exam JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  if (exams.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Saved Exams & Question Bank (0 Tokens Used)
            </h2>
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              📥 Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImportFile}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Generated exams are automatically saved here so you can retake, review, and export them anytime without calling the AI again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
              Saved Exams & Question Bank
            </h2>
            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              ⚡ 100% Free / 0 Tokens to Retake
            </span>
          </div>
        </div>
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            📥 Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importError && (
        <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
          ⚠️ {importError}
        </div>
      )}

      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-slate-50 p-3.5 transition-colors hover:border-indigo-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {exam.title}
                </p>
                <span className="shrink-0 rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {exam.questionCount} items
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <span>📅 {exam.createdAt}</span>
                {exam.bestScore && (
                  <span className="font-medium text-emerald-600">
                    🏆 Best: {exam.bestScore.pct}% ({exam.bestScore.correct}/{exam.bestScore.total})
                  </span>
                )}
                <span className="truncate max-w-[200px]">
                  📁 {exam.fileNames.join(", ")}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleOpenExam(exam, "exam")}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                📝 Retake
              </button>
              <button
                onClick={() => handleOpenExam(exam, "reviewer")}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                📖 Review
              </button>
              <button
                onClick={() => exportExamAsJson(exam)}
                title="Export exam JSON"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              >
                💾 Export
              </button>
              <button
                onClick={() => handleDelete(exam.id)}
                title="Delete exam"
                className="rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
