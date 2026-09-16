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
                    AI-powered study suite with Flashcards, Mock Exams, and Photo Problem solving
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
                  This app transforms your PDF lecture slides, notes, and photos of problems into <strong>interactive exams</strong>, <strong>side-by-side study reviewers</strong>, and <strong>3D Flashcards</strong> using Google Gemini AI. Built with deep token optimizations and permanent disk storage.
                </p>
              </div>

              {/* Core Features */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                  ✨ Key Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">📸 Photo of Problem Ingestion</p>
                    <p className="text-[11px] text-gray-500">
                      Snap or upload photos of handwritten equations, diagrams, or textbook problems. Gemini Vision analyzes the image and creates practice questions!
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">🃏 3D Flip Flashcards</p>
                    <p className="text-[11px] text-gray-500">
                      Spaced-repetition card deck with smooth 3D flip, keyboard controls (Spacebar/Arrows), shuffle, and Mastery tracking.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">🎯 Retake Missed Only</p>
                    <p className="text-[11px] text-gray-500">
                      After scoring, click 1 button to retake only the questions you got wrong until you master 100% of the material.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">⏱️ Mock Exam Timer</p>
                    <p className="text-[11px] text-gray-500">
                      Simulate real board and university test environments with 15m, 30m, 45m, or 60m countdown timers with auto-submit.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">🎚️ Difficulty & Formats</p>
                    <p className="text-[11px] text-gray-500">
                      Choose Easy (definitions), Medium (applied), or Hard (tricky scenarios), plus Multiple Choice or True/False.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                    <p className="font-bold text-gray-900 mb-0.5">💾 Permanent Disk Persistence</p>
                    <p className="text-[11px] text-gray-500">
                      Exams are automatically saved to your hard drive (`data/saved_exams.json`). Your exams never vanish when closing the browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* Android App Installation Guide */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
                  <span>📱</span> Install on Android (PWA / WebAPK)
                </h4>
                <p className="text-[11px] leading-relaxed text-emerald-800 mb-2">
                  You can install this app directly on any Android phone without using the Google Play Store:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-900">
                  <li>Open the website on your Android phone using <strong>Chrome</strong> or <strong>Edge</strong>.</li>
                  <li>Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Android will add a native app icon to your phone's home screen and app drawer!</li>
                </ol>
              </div>

              {/* Quick Guide */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                  🚀 Quick 3-Step Guide
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-gray-600 text-[11px]">
                  <li>
                    <strong>Configure Key:</strong> Click the <strong>🔑 API Key</strong> button in the navbar and paste your free key from Google AI Studio.
                  </li>
                  <li>
                    <strong>Upload PDFs or Photos:</strong> Drag and drop your study files, textbook chapters, or snapshots of problems.
                  </li>
                  <li>
                    <strong>Generate & Study:</strong> Switch between <strong>Exam Mode</strong>, <strong>Side-by-Side Reviewer</strong>, and <strong>Flashcards</strong>!
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
