"use client";

import { useRef, useState } from "react";
import { UploadedFile } from "@/lib/types";
import { estimateTokens } from "@/lib/textCleaner";

interface UploaderProps {
  files: UploadedFile[];
  onFilesExtracted: (files: UploadedFile[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function Uploader({
  files,
  onFilesExtracted,
  loading,
  setLoading,
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawFileMap, setRawFileMap] = useState<Record<string, File>>({});
  const [pageRanges, setPageRanges] = useState<Record<string, string>>({});
  const [editingRange, setEditingRange] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFiles(newFiles: File[], currentRanges: Record<string, string>) {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      newFiles.forEach((f) => formData.append("files", f));
      formData.append("pageRanges", JSON.stringify(currentRanges));

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      // Merge results
      const updatedMap: Record<string, UploadedFile> = {};
      files.forEach((f) => {
        updatedMap[f.name] = f;
      });
      (data.files as UploadedFile[]).forEach((f) => {
        updatedMap[f.name] = f;
      });

      onFilesExtracted(Object.values(updatedMap));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to process PDFs");
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const pdfFiles = Array.from(selectedFiles).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }

    const newMap = { ...rawFileMap };
    pdfFiles.forEach((f) => {
      newMap[f.name] = f;
    });
    setRawFileMap(newMap);

    await processFiles(pdfFiles, pageRanges);
  }

  async function handleApplyPageRange(fileName: string) {
    const fileObj = rawFileMap[fileName];
    if (!fileObj) {
      setEditingRange(null);
      return;
    }
    setEditingRange(null);
    await processFiles([fileObj], pageRanges);
  }

  function handleRemoveFile(name: string) {
    const updated = files.filter((f) => f.name !== name);
    const newMap = { ...rawFileMap };
    delete newMap[name];
    setRawFileMap(newMap);
    onFilesExtracted(updated);
  }

  const totalCleanedChars = files.reduce((acc, f) => acc + (f.charCount || 0), 0);
  const totalRawChars = files.reduce((acc, f) => acc + (f.rawCharCount || f.charCount || 0), 0);
  const totalSavedChars = Math.max(0, totalRawChars - totalCleanedChars);
  const totalSavedPercent = totalRawChars > 0 ? Math.round((totalSavedChars / totalRawChars) * 100) : 0;
  const estimatedInputTokens = estimateTokens(totalCleanedChars);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer select-none
          ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}
          ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-800">
          {loading ? "Extracting & optimizing PDF text…" : "Drop PDF study materials here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-400">Multiple files supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">
          ⚠️ {error}
        </p>
      )}

      {/* Token Savings Summary Banner */}
      {files.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-xs font-bold text-emerald-800">
                Token Optimizer Active
              </span>
              <p className="text-[11px] text-gray-600">
                Stripped boilerplate & headers:{" "}
                <span className="font-semibold text-emerald-700">
                  {totalSavedPercent}% tokens saved
                </span>{" "}
                ({totalSavedChars.toLocaleString()} chars removed)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-indigo-700">
              ~{estimatedInputTokens.toLocaleString()} tokens
            </span>
            <p className="text-[10px] text-gray-400">est. input size</p>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {files.map((f) => {
            const raw = f.rawCharCount || f.charCount;
            const cleaned = f.charCount;
            const savedPct = raw > 0 ? Math.round(((raw - cleaned) / raw) * 100) : 0;
            const isEditing = editingRange === f.name;

            return (
              <li key={f.name} className="p-3.5 sm:px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      📄
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {f.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                        <span>{f.totalPages ? `${f.totalPages} pages` : ""}</span>
                        <span>•</span>
                        <span>{cleaned.toLocaleString()} chars</span>
                        {savedPct > 0 && (
                          <span className="font-medium text-emerald-600">
                            (-{savedPct}% tokens)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setEditingRange(isEditing ? null : f.name)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {f.selectedPageRange && f.selectedPageRange !== "all"
                        ? `Pages: ${f.selectedPageRange}`
                        : "📑 Select Pages"}
                    </button>
                    <button
                      onClick={() => handleRemoveFile(f.name)}
                      title="Remove file"
                      className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Page Range Selector Sub-bar */}
                {isEditing && (
                  <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5">
                    <p className="mb-1.5 text-xs font-medium text-indigo-900">
                      Select Page Range to save tokens (e.g. <code className="rounded bg-white px-1">1-15</code> or <code className="rounded bg-white px-1">all</code>):
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`1-${f.totalPages || 10} or all`}
                        value={pageRanges[f.name] ?? f.selectedPageRange ?? ""}
                        onChange={(e) =>
                          setPageRanges({
                            ...pageRanges,
                            [f.name]: e.target.value,
                          })
                        }
                        className="w-36 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleApplyPageRange(f.name)}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                      >
                        Apply Filter
                      </button>
                      <button
                        onClick={() => setEditingRange(null)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
