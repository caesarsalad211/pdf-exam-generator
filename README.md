# 📄 PDF Exam Generator & Reviewer

An intelligent, token-optimized Next.js web application that turns your PDF study materials into **interactive practice exams** and **side-by-side study reviewers** powered by Google Gemini AI.

---

## 🎯 What Does It Do?

1. **Upload Multi-Page PDFs**: Ingests lecture notes, textbooks, research papers, and slide decks.
2. **Generates Practice Exams (5 to 100 items)**: Creates multiple-choice questions with 4 realistic options, answer keys, and explanations.
3. **Practice & Review**:
   - **Exam Mode**: Scrollable interactive test with progress tracking and score calculation.
   - **Reviewer Mode**: Side-by-side study guide (questions on the left, highlighted answers + AI rationales on the right).
4. **Permanent Local Question Bank**: Generated exams are saved in browser storage—retake, review, and export anytime with **0 API tokens used**.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| ⚡ **Token Optimizer** | Auto-strips boilerplate, headers, footers, TOC dot leaders, and redundant spacing to reduce input token usage by **30% – 50%**. |
| 📑 **Page Range Selector** | Select specific page ranges (e.g. `1-15` or `5, 8-12`) per PDF so you only process the chapters you need. |
| 💸 **Cheapest Model Selector** | Choose between `Gemini 3.6 Flash` (recommended & lowest cost), `Gemini 2.5 Flash`, or standard models based on your token budget. |
| 📚 **0-Token Retakes** | All exams are saved in local storage. Retake exams, review answers, and track best scores without calling the API again. |
| 🔑 **Bring Your Own Key** | In-app **🔑 API Key** manager allows pasting your free Gemini API key directly in the browser UI without touching code or `.env` files. |
| 💾 **JSON Export & Import** | Download question banks as `.json` files to share with classmates or backup offline. |
| 🖨️ **Print & PDF Export** | Clean printable layout (`window.print()`) for offline study sheets. |

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
- Click **Save Key** and start generating exams!


## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **PDF Processing**: `pdf-parse` v2 (Server-side extraction)
- **Storage**: Browser `localStorage` (Question bank & saved exams)
- **Language**: TypeScript

---

## 🔒 Privacy & Security

- **Client-Side Keys**: API keys entered in the UI are stored locally in your browser's `localStorage` and sent directly to Google's API endpoints.
- **No Database Tracking**: Your study PDFs and generated exams remain on your device and are not stored in any external database.
