import { SavedExam, Question } from "./types";

const STORAGE_KEY = "pdf_exam_saved_exams_v1";

export function getSavedExams(): SavedExam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
  } catch (err) {
    console.error("Failed to save exam to localStorage", err);
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
  }
}

export function deleteSavedExam(examId: string): SavedExam[] {
  const exams = getSavedExams().filter((e) => e.id !== examId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error("Failed to delete exam from localStorage", err);
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
