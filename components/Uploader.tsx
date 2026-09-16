"use client";

import { useRef, useState } from "react";
import { UploadedFile, UploadedPhoto } from "@/lib/types";
import { estimateTokens } from "@/lib/textCleaner";

interface UploaderProps {
  files: UploadedFile[];
  onFilesExtracted: (files: UploadedFile[]) => void;
  photos: UploadedPhoto[];
  onPhotosExtracted: (photos: UploadedPhoto[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function Uploader({
  files,
  onFilesExtracted,
  photos,
  onPhotosExtracted,
  loading,
  setLoading,
}: UploaderProps) {
  const [activeUploadTab, setActiveUploadTab] = useState<"pdf" | "photo">("pdf");
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [rawFileMap, setRawFileMap] = useState<Record<string, File>>({});
  const [pageRanges, setPageRanges] = useState<Record<string, string>>({});
  const [editingRange, setEditingRange] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process PDF files
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

  async function handlePdfFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const pdfFiles = Array.from(selectedFiles).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfFiles.length === 0) {
      setError("Please select PDF files.");
      return;
    }

    const newMap = { ...rawFileMap };
    pdfFiles.forEach((f) => {
      newMap[f.name] = f;
    });
    setRawFileMap(newMap);

    await processFiles(pdfFiles, pageRanges);
  }

  // Process Photo / Image files
  function handlePhotoFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError(null);

    const imageFiles = Array.from(selectedFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      setError("Please select image files (PNG, JPG, WEBP).");
      return;
    }

    const newPhotos: UploadedPhoto[] = [];
    let processed = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultStr = e.target?.result as string;
        // Strip data:image/xxx;base64, prefix for Gemini
        const base64Data = resultStr.split(",")[1] || "";
        newPhotos.push({
          id: "photo_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
          name: file.name,
          mimeType: file.type || "image/jpeg",
          base64Data,
          previewUrl: resultStr,
        });
        processed++;
        if (processed === imageFiles.length) {
          onPhotosExtracted([...photos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleRemovePhoto(id: string) {
    onPhotosExtracted(photos.filter((p) => p.id !== id));
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
      {/* Tab Switcher: PDF vs Photo */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveUploadTab("pdf")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all
            ${
              activeUploadTab === "pdf"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <span>📄 PDF Files</span>
          {files.length > 0 && (
            <span className="rounded-full bg-indigo-800/60 px-1.5 py-0.2 text-[10px] text-white">
              {files.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveUploadTab("photo")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all
            ${
              activeUploadTab === "photo"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <span>📸 Snap / Photo of Problem</span>
          {photos.length > 0 && (
            <span className="rounded-full bg-indigo-800/60 px-1.5 py-0.2 text-[10px] text-white">
              {photos.length}
            </span>
          )}
        </button>
      </div>

      {/* PDF DROPZONE */}
      {activeUploadTab === "pdf" && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handlePdfFiles(e.dataTransfer.files);
            }}
            onClick={() => pdfInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${
                dragging
                  ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
                  : "border-gray-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-white"
              }
              ${loading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => handlePdfFiles(e.target.files)}
            />

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <p className="text-sm font-semibold text-gray-700">
              {loading ? "Extracting & sanitizing text…" : "Click or drag & drop PDF files here"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supports multiple lecture slides, notes, or textbook chapters
            </p>
          </div>

          {/* Token Savings Banner */}
          {files.length > 0 && totalSavedChars > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⚡</span>
                <span className="font-semibold">Token Sanitizer Active:</span>
                <span>
                  Saved ~{totalSavedChars.toLocaleString()} boilerplate chars ({totalSavedPercent}% reduction)
                </span>
              </div>
              <span className="font-bold text-emerald-900">
                ~{estimatedInputTokens.toLocaleString()} input tokens
              </span>
            </div>
          )}

          {/* PDF Files List */}
          {files.length > 0 && (
            <div className="space-y-2.5">
              {files.map((file) => {
                const isEditing = editingRange === file.name;
                const currentRange = pageRanges[file.name] || file.selectedPageRange || "all";

                return (
                  <div
                    key={file.name}
                    className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📄</span>
                        <p className="truncate text-xs font-bold text-gray-800">{file.name}</p>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                          {file.totalPages} {file.totalPages === 1 ? "page" : "pages"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
                        <span>~{estimateTokens(file.charCount).toLocaleString()} tokens</span>
                        <span>•</span>
                        <span>Pages: <strong className="text-indigo-600">{currentRange}</strong></span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="e.g. 1-10, 15"
                            value={pageRanges[file.name] ?? (file.selectedPageRange || "")}
                            onChange={(e) =>
                              setPageRanges((prev) => ({ ...prev, [file.name]: e.target.value }))
                            }
                            className="w-28 rounded-lg border border-indigo-300 px-2 py-1 text-xs text-gray-800 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyPageRange(file.name)}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingRange(file.name)}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                        >
                          📑 Pages ({currentRange})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.name)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PHOTO / SNAPSHOT DROPZONE */}
      {activeUploadTab === "photo" && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handlePhotoFiles(e.dataTransfer.files);
            }}
            onClick={() => photoInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${
                dragging
                  ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                  : "border-gray-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-white"
              }`}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple
              className="sr-only"
              onChange={(e) => handlePhotoFiles(e.target.files)}
            />

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
              <span className="text-2xl">📸</span>
            </div>

            <p className="text-sm font-semibold text-gray-700">
              Upload or snap photos of problems or diagrams
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Math equations, whiteboard notes, diagrams, or textbook problem snapshots (PNG, JPG, WEBP)
            </p>
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700">
                Attached Photos ({photos.length}):
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xs"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={photo.name}
                      className="h-28 w-full rounded-lg object-cover"
                    />
                    <div className="mt-1 flex items-center justify-between px-1">
                      <p className="truncate text-[10px] font-semibold text-gray-700">
                        {photo.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
