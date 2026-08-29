"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "gemini_user_api_key";

export function getClientApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function openApiKeyModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-api-key-modal"));
  }
}

export default function ApiKeyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const saved = getClientApiKey();
    if (saved) {
      setApiKey(saved);
      setHasKey(true);
    }

    function handleOpenEvent() {
      setIsOpen(true);
      setStatusMessage({
        type: "info",
        text: "Please paste your free Gemini API key to start generating exams.",
      });
    }

    window.addEventListener("open-api-key-modal", handleOpenEvent);
    return () => window.removeEventListener("open-api-key-modal", handleOpenEvent);
  }, []);

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        setStatusMessage({ type: "info", text: "Pasted from clipboard!" });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Please paste directly into the input field.",
      });
    }
  }

  async function handleTestKey() {
    if (!apiKey.trim()) {
      setStatusMessage({ type: "error", text: "Please enter an API key first." });
      return;
    }
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setStatusMessage({
          type: "success",
          text: "✅ Key Verified! Gemini connection successful.",
        });
        localStorage.setItem(STORAGE_KEY, apiKey.trim());
        setHasKey(true);
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ Verification failed: ${data.error || "Invalid API key"}`,
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error testing key",
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
      setHasKey(false);
      setStatusMessage({ type: "info", text: "Custom API key cleared." });
    } else {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setHasKey(true);
      setStatusMessage({ type: "success", text: "API Key saved in browser!" });
      setTimeout(() => setIsOpen(false), 1200);
    }
  }

  function handleClear() {
    setApiKey("");
    localStorage.removeItem(STORAGE_KEY);
    setHasKey(false);
    setStatusMessage({ type: "info", text: "API key removed from browser." });
  }

  return (
    <>
      {/* Trigger Button with Key Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all
          ${
            hasKey
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
          }`}
      >
        <span className="text-sm">🔑</span>
        <span>{hasKey ? "API Key Configured" : "Paste API Key"}</span>
        <span
          className={`h-2 w-2 rounded-full ${
            hasKey ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
          }`}
        />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-lg">
                  🔑
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Gemini API Key
                  </h3>
                  <p className="text-xs text-gray-500">
                    Stored securely in your local browser
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Input & Paste Tool */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700">
                  <span>Enter or Paste API Key:</span>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    📋 Paste
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : statusMessage.type === "error"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              {/* Helper Links */}
              <p className="text-[11px] text-gray-500">
                Don't have a key? Get a free API key in seconds at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 underline hover:text-indigo-800"
                >
                  aistudio.google.com
                </a>
              </p>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={testing || !apiKey.trim()}
                    onClick={handleTestKey}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {testing ? "Testing…" : "🧪 Test Key"}
                  </button>
                  {hasKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
