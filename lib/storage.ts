import { SavedExam, Question } from "./types";

const STORAGE_KEY = "pdf_exam_saved_exams_v1";

// Get exams synchronously from localStorage
export function getSavedExams(): SavedExam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Fetch from server /api/exams and merge with localStorage (bi-directional sync)
export async function fetchAndSyncSavedExams(): Promise<SavedExam[]> {
  const localExams = getSavedExams();
  try {
    const res = await fetch("/api/exams");
    if (!res.ok) return localExams;
    const data = await res.json();
    const serverExams: SavedExam[] = data.exams || [];

    // Merge: create map by ID
    const mergedMap = new Map<string, SavedExam>();

    // Server exams first
    for (const exam of serverExams) {
      mergedMap.set(exam.id, exam);
    }

    // Local exams (if there are any not on server, add and push to server)
    const toPushToServer: SavedExam[] = [];
    for (const exam of localExams) {
      if (!mergedMap.has(exam.id)) {
        mergedMap.set(exam.id, exam);
        toPushToServer.push(exam);
      }
    }

    const unifiedList = Array.from(mergedMap.values()).sort((a, b) => {
      // Sort newest first
      return (b.id > a.id ? 1 : -1);
    });

    // Save unified to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unifiedList));
    }

    // Sync any missing local exams up to server in background
    for (const exam of toPushToServer) {
      fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam }),
      }).catch((e) => console.warn("Failed to sync exam to server", e));
    }

    return unifiedList;
  } catch (err) {
    console.warn("Could not sync with /api/exams, using local copy", err);
    return localExams;
  }
}

export function saveExamToHistory(
  title: string,
  fileNames: string[],
  questions: Question[]
): SavedExam {
  const exams = getSavedExams();
  const newExam: SavedExam = {
    id: "exam_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    title: title || `Exam (${questions.length} Items)`,
    createdAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    fileNames,
    questionCount: questions.length,
    questions,
  };

  const updated = [newExam, ...exams];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("current_exam_id", newExam.id);
  } catch (err) {
    console.error("Failed to save exam to localStorage", err);
  }

  // Also persist to server disk asynchronously so it never vanishes on browser exit
  if (typeof window !== "undefined") {
    fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam: newExam }),
    }).catch((err) => console.warn("Server persist error", err));
  }

  return newExam;
}

export function updateExamScore(
  examId: string,
  correct: number,
  total: number
): void {
  const exams = getSavedExams();
  const index = exams.findIndex((e) => e.id === examId);
  if (index === -1) return;

  const pct = Math.round((correct / total) * 100);
  const currentBest = exams[index].bestScore?.pct ?? -1;

  if (pct >= currentBest) {
    exams[index].bestScore = { correct, total, pct };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    } catch (err) {
      console.error("Failed to update exam score", err);
    }

    if (typeof window !== "undefined") {
      fetch("/api/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, correct, total }),
      }).catch((err) => console.warn("Server score update error", err));
    }
  }
}

export function deleteSavedExam(examId: string): SavedExam[] {
  const exams = getSavedExams().filter((e) => e.id !== examId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error("Failed to delete exam from localStorage", err);
  }

  if (typeof window !== "undefined") {
    fetch(`/api/exams?id=${encodeURIComponent(examId)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Server delete error", err));
  }

  return exams;
}

export function exportExamAsJson(exam: SavedExam | { questions: Question[]; title?: string }): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exam, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  const filename = (exam.title || "exam").replace(/[^a-z0-9_-]/gi, "_") + ".json";
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importExamFromJson(jsonString: string): SavedExam {
  const parsed = JSON.parse(jsonString);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid exam JSON format: missing 'questions' array");
  }

  return saveExamToHistory(
    parsed.title || "Imported Exam",
    parsed.fileNames || ["Imported"],
    parsed.questions
  );
}

const DAILY_LIMIT = 1_000_000; // Free tier standard 1M tokens/day

export interface DailyUsage {
  date: string;
  tokensUsed: number;
  examsGenerated: number;
  limit: number;
  remainingTokens: number;
  percentRemaining: number;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export function getTodayUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return {
      date: "",
      tokensUsed: 0,
      examsGenerated: 0,
      limit: DAILY_LIMIT,
      remainingTokens: DAILY_LIMIT,
      percentRemaining: 100,
    };
  }

  const today = getTodayDateString();
  const storageKey = `pdf_exam_usage_${today}`;
  try {
    const raw = localStorage.getItem(storageKey);
    const data = raw ? JSON.parse(raw) : { tokensUsed: 0, examsGenerated: 0 };
    const tokensUsed = data.tokensUsed || 0;
    const examsGenerated = data.examsGenerated || 0;
    const remainingTokens = Math.max(0, DAILY_LIMIT - tokensUsed);
    const percentRemaining = Math.max(0, Math.round((remainingTokens / DAILY_LIMIT) * 100));

    return {
      date: today,
      tokensUsed,
      examsGenerated,
      limit: DAILY_LIMIT,
      remainingTokens,
      percentRemaining,
    };
  } catch {
    return {
      date: today,
      tokensUsed: 0,
      examsGenerated: 0,
      limit: DAILY_LIMIT,
      remainingTokens: DAILY_LIMIT,
      percentRemaining: 100,
    };
  }
}

export function recordTokenUsage(tokens: number): DailyUsage {
  if (typeof window === "undefined") return getTodayUsage();

  const today = getTodayDateString();
  const storageKey = `pdf_exam_usage_${today}`;
  const current = getTodayUsage();

  const updatedData = {
    tokensUsed: current.tokensUsed + tokens,
    examsGenerated: current.examsGenerated + 1,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  } catch (err) {
    console.error("Failed to record daily usage", err);
  }

  return getTodayUsage();
}
