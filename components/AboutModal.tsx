"use client";

import { useState } from "react";

export default function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span>ℹ️</span>
        <span>About & Guide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
                  📄
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    PDF Exam Generator & Reviewer
                  </h3>
                  <p className="text-xs text-gray-400">
                    AI-powered study tool & token-optimized question bank
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

            {/* Content */}
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              {/* Summary */}
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 text-indigo-950">
                <p className="font-semibold mb-1 text-xs text-indigo-900">
                  🎯 What is this app?
                </p>
                <p className="text-xs leading-normal">
                  This app transforms your PDF lecture slides, textbooks, and notes into <strong>interactive multiple-choice exams</strong> and <strong>side-by-side study reviewers</strong> using Google Gemini AI. Built with deep token optimizations so you get maximum questions at the lowest possible cost.
                </p>
              </div>

              {/* Core Features */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                  ✨ Key Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">📤 Multi-PDF Ingestion</p>
                    <p className="text-[11px] text-gray-500">
                      Upload multiple PDFs simultaneously. Combine notes and chapters into a single comprehensive exam.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">⚡ Token Sanitizer & Optimizer</p>
                    <p className="text-[11px] text-gray-500">
                      Auto-strips boilerplate, page headers, footers, and redundant spacing to cut token usage by 30%–50%.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">📑 Page Range Filtering</p>
                    <p className="text-[11px] text-gray-500">
                      Select specific pages (e.g. <code className="bg-white px-1 rounded">1-15</code>) so you only process the chapters you need.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">💸 Low-Cost Model Selector</p>
                    <p className="text-[11px] text-gray-500">
                      Choose between Gemini 3.6 Flash, 2.5 Flash, or standard models based on your token budget and speed needs.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">📖 Side-by-Side Reviewer</p>
                    <p className="text-[11px] text-gray-500">
                      View questions on the left and AI rationale explanations on the right with color-coded answers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">📚 Local Question Bank (0 Tokens)</p>
                    <p className="text-[11px] text-gray-500">
                      All generated exams are saved locally in your browser. Retake, review, and track high scores forever for free.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">💾 JSON Export & Import</p>
                    <p className="text-[11px] text-gray-500">
                      Download exam question banks as JSON to share with classmates or backup offline.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">🔑 Bring Your Own Key</p>
                    <p className="text-[11px] text-gray-500">
                      Directly paste your free Gemini API key in the UI. No coding or environment file setup required.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to use */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                  🚀 Quick 3-Step Guide
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-gray-600 text-[11px]">
                  <li>
                    <strong>Configure Key:</strong> Click the <strong>🔑 API Key</strong> button in the navbar and paste your free key from Google AI Studio.
                  </li>
                  <li>
                    <strong>Upload PDFs:</strong> Drag and drop your study files. Optionally filter pages to save tokens.
                  </li>
                  <li>
                    <strong>Generate & Practice:</strong> Adjust the question slider (5–100 items), click <strong>Generate</strong>, and test your knowledge!
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
