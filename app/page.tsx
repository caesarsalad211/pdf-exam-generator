"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Uploader from "@/components/Uploader";
import ExamHistory from "@/components/ExamHistory";
import ApiKeyModal, { getClientApiKey, openApiKeyModal } from "@/components/ApiKeyModal";
import AboutModal from "@/components/AboutModal";
import { UploadedFile, AVAILABLE_MODELS } from "@/lib/types";
import { estimateTokens } from "@/lib/textCleaner";
import { saveExamToHistory } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [count, setCount] = useState(10);
  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const [customTitle, setCustomTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic calculations based on selected model and count
  const activeModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];
  const totalChars = files.reduce((acc, f) => acc + (f.charCount || 0), 0);
  const estInputTokens = estimateTokens(totalChars);
  const estOutputTokens = count * activeModel.outputTokensPerQuestion;
  const estTotalTokens = estInputTokens + estOutputTokens;
  const estCostUSD =
    (estInputTokens / 1_000_000) * activeModel.inputPricePerM +
    (estOutputTokens / 1_000_000) * activeModel.outputPricePerM;

  async function handleGenerate() {
    if (files.length === 0) return;
    setGenerating(true);
    setError(null);
    try {
      const clientApiKey = getClientApiKey();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: files.map((f) => f.text),
          count,
          model: selectedModel,
          apiKey: clientApiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes("GEMINI_API_KEY")) {
          openApiKeyModal();
        }
        throw new Error(data.error || "Generation failed");
      }

      const title =
        customTitle.trim() ||
        `${files[0]?.name.replace(/\.pdf$/i, "")} (${count} Items)`;
      const fileNames = files.map((f) => f.name);

      // Save to localStorage history so it's permanently stored (0 tokens to retake)
      const savedExam = saveExamToHistory(title, fileNames, data.questions);

      // Store in sessionStorage and navigate
      sessionStorage.setItem("exam_questions", JSON.stringify(data.questions));
      sessionStorage.setItem("current_exam_id", savedExam.id);
      sessionStorage.setItem("current_exam_title", savedExam.title);
      sessionStorage.setItem("exam_initial_tab", "exam");

      router.push("/exam");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = files.length > 0 && !uploading && !generating;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Top Navbar with API Key Modal trigger and About */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-indigo-600">📝 ExamGen</span>
        </div>
        <div className="flex items-center gap-2">
          <AboutModal />
          <ApiKeyModal />
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
          <span className="text-2xl">📄</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          PDF Exam Generator & Reviewer
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload multi-page PDFs, pick the lowest-cost AI model, and practice or review with token-optimized AI.
        </p>
      </div>

      <div className="space-y-6">
        {/* Saved Exams Section */}
        <ExamHistory />

        {/* Upload section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            1. Upload & Filter PDFs
          </h2>
          <Uploader
            files={files}
            onFilesExtracted={setFiles}
            loading={uploading}
            setLoading={setUploading}
          />
        </section>

        {/* Settings section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            2. Configure Exam & Model
          </h2>
          <div className="space-y-5">
            {/* Title (Optional) */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Exam Title (Optional)
              </label>
              <input
                type="text"
                placeholder={
                  files[0]
                    ? `${files[0].name.replace(/\.pdf$/i, "")} Quiz`
                    : "e.g. Biology Midterm Review"
                }
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* AI Model Selector */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Select AI Model (Cheapest / Lowest Token Cost):
                </label>
                <span className="text-[11px] font-medium text-emerald-600">
                  💡 Dynamic token & cost estimation updates live
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {AVAILABLE_MODELS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all
                        ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-gray-900">
                            {m.name}
                          </p>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]
                              ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-gray-300"
                              }`}
                          >
                            {isSelected ? "✓" : ""}
                          </span>
                        </div>
                        <span
                          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold
                            ${
                              m.costTier === "cheapest"
                                ? "bg-emerald-100 text-emerald-800"
                                : m.costTier === "balanced"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {m.badge}
                        </span>
                        <p className="mt-2 text-[11px] leading-snug text-gray-500">
                          {m.description}
                        </p>
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-2 text-[10px] text-gray-400">
                        <div className="flex justify-between">
                          <span>Rates:</span>
                          <span className="font-semibold text-gray-600">
                            ${m.inputPricePerM}/1M in
                          </span>
                        </div>
                        <div className="flex justify-between text-indigo-600 font-medium">
                          <span>Speed:</span>
                          <span>{m.speedRating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Number of Questions
                </label>
                <span className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                  {count} items
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>5</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Dynamic Token & Cost Estimation Box */}
            <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-indigo-50/50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-base font-bold">
                    📊
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Estimated Token Budget: ~{estTotalTokens.toLocaleString()} tokens
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Input: ~{estInputTokens.toLocaleString()} tokens | Output: ~{estOutputTokens.toLocaleString()} tokens ({activeModel.outputTokensPerQuestion} tokens/item)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-xs">
                    {activeModel.name}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="text-sm">💵</span>
                  <span>Estimated API Cost:</span>
                  <span className="font-bold text-emerald-700">
                    {estCostUSD < 0.001 ? "< $0.001 USD" : `$${estCostUSD.toFixed(4)} USD`}
                  </span>
                  <span className="text-[10px] text-gray-400">(Free Tier: $0.00)</span>
                </div>

                <div className="text-indigo-700 text-[11px] font-medium">
                  {activeModel.speedRating}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full rounded-2xl py-4 text-base font-bold tracking-wide shadow-lg transition-all
            ${canGenerate
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.99]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Generating with {activeModel.name}…
            </span>
          ) : (
            `✨ Generate ${count}-Item Exam`
          )}
        </button>

        {files.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            Upload at least one PDF above to enable exam generation.
          </p>
        )}
      </div>
    </main>
  );
}
