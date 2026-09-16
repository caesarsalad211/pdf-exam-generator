# 📄 PDF & Photo Exam Generator — AI Study Suite 🎓

An intelligent, token-optimized Next.js web application that transforms your PDF study materials and photos of problems into **interactive practice exams**, **side-by-side study reviewers**, and **3D interactive flashcards** powered by Google Gemini AI.

---

## 🎯 What Does It Do?

1. **Upload Multi-Page PDFs & Problem Photos**:
   - Ingests lecture slides, textbooks, and notes.
   - Accepts photos of handwritten equations, diagrams, whiteboard notes, and textbook problems with Gemini Vision analysis.
2. **Generates Practice Exams (5 to 100 items)**:
   - Configurable difficulty: **Easy** (recall), **Medium** (conceptual), or **Hard** (clinical / tricky scenarios).
   - Flexible question formats: **Multiple Choice (A, B, C, D)**, **True / False**, or **Mixed**.
3. **Three Study Modes**:
   - 📝 **Exam Mode**: Scrollable test with live progress bar and instant grading.
   - 📖 **Side-by-Side Reviewer**: Question and choices on the left, highlighted answers + concise AI rationales on the right.
   - 🃏 **3D Flip Flashcards**: Interactive cards with keyboard shortcuts (<kbd>Space</kbd> / <kbd>←</kbd> / <kbd>→</kbd>), shuffle mode, and mastery tracking.
4. **Targeted Practice**:
   - 🎯 **Retake Missed Only**: After scoring, retry only the questions you answered incorrectly until you reach 100%.
   - ⏱️ **Mock Exam Countdown Timer**: 15m, 30m, 45m, or 60m timed simulations with auto-submit.
5. **Permanent Storage & 0-Token Retakes**:
   - Exams are saved directly to your computer's disk (`data/saved_exams.json`) and synced with your browser. Your exams never vanish upon closing the browser.
6. **📱 Android App (PWA) Support**:
   - Installable on Android phones and tablets via Chrome/Edge without needing an app store.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📸 **Photo of Problem Ingestion** | Upload photos of diagrams, math problems, or notes. Gemini Vision extracts and generates targeted questions based on the photo. |
| 🃏 **3D Flip Flashcards** | Practice spaced repetition with smooth 3D flip animations, keyboard navigation (<kbd>Space</kbd>, <kbd>M</kbd>, <kbd>L</kbd>), shuffle, and mastery tracking. |
| 🎯 **Retake Missed Questions Only** | Focus on your weak spots by drilling exclusively into incorrect items after scoring. |
| ⏱️ **Mock Exam Timer** | Simulate real board or college exam conditions with countdown timers and warning alerts. |
| 🎚️ **Difficulty & Format Selectors** | Choose Easy, Medium, or Hard difficulty, plus Multiple Choice (A-D) or True/False question styles. |
| ⚡ **Token Optimizer** | Auto-strips boilerplate, headers, footers, TOC dots, and redundant spacing to reduce input token usage by **30% – 50%**. |
| 📑 **Page Range Selector** | Select specific page ranges (e.g. `1-15` or `5, 8-12`) per PDF to process only the chapters you need. |
| 💸 **Cheapest Model Selector** | Dynamically pick `Gemini 3.6 Flash` (recommended & lowest cost), `Gemini 2.5 Flash`, or standard models. |
| 💾 **Permanent Disk Storage** | Auto-saves exams to disk (`data/saved_exams.json`). Retake, review, and export anytime with **0 API tokens used**. |
| 🔑 **Bring Your Own Key** | In-app **🔑 API Key** manager allows pasting your free Gemini key in the browser UI without touching `.env` files. |
| 📱 **Android PWA Support** | Install as a standalone native-feeling app on Android home screens and app drawers. |
| 💾 **JSON & Print Export** | Download question banks as `.json` or print clean offline study sheets (`window.print()`). |

---

## 📱 How to Install on Android

1. Open the website on your Android phone using **Google Chrome** or **Microsoft Edge**.
2. Tap the **three-dot menu (`⋮`)** in the browser.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. An app icon will be added to your home screen and app drawer, running in fullscreen standalone mode without browser tabs!

---

## 🚀 Quick Start (Local Run)

### 1. Clone & Install
```bash
git clone https://github.com/caesarsalad211/pdf-exam-generator.git
cd pdf-exam-generator
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Add Your Free API Key
- Click the **🔑 Paste API Key** button in the top navbar.
- Get a free key at [Google AI Studio](https://aistudio.google.com).
- Click **Save Key** and start studying!

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/generative-ai` multimodal vision + text)
- **PDF Processing**: `pdf-parse` v2 (Server-side extraction)
- **Storage**: Bi-directional sync between local disk (`data/saved_exams.json`) & browser `localStorage`
- **Mobile**: Progressive Web App (PWA / WebAPK)
- **Language**: TypeScript

---

## 🔒 Privacy & Security

- **Client-Side Keys**: API keys entered in the UI are stored locally in your browser's `localStorage` and sent directly to Google's API endpoints.
- **Local Persistence**: Your study files and generated exams remain on your computer and are never shared or tracked in external databases.
