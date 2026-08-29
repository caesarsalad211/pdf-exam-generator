export interface Choice {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: number;
  question: string;
  choices: Choice;
  answer: keyof Choice; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
}

export interface UploadedFile {
  name: string;
  text: string;
  charCount: number;
  rawCharCount: number;
  totalPages: number;
  selectedPageRange?: string; // e.g. "1-20" or "all"
}

export interface SavedExam {
  id: string;
  title: string;
  createdAt: string;
  fileNames: string[];
  questionCount: number;
  questions: Question[];
  bestScore?: {
    correct: number;
    total: number;
    pct: number;
  };
}

export interface ExamSession {
  questions: Question[];
  answers: Record<number, keyof Choice>; // questionId -> chosen key
  submitted: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  costTier: "cheapest" | "balanced" | "standard";
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "⚡ Lowest Cost & Fastest (Recommended)",
    description: "Google's latest lightweight Flash model. High speed, low token cost, and sharp question generation.",
    costTier: "cheapest",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "🎯 High Speed Flash",
    description: "Fast and reliable generation for medium to large study materials.",
    costTier: "balanced",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    badge: "⚖️ Standard Flash",
    description: "Standard general-purpose flash model.",
    costTier: "standard",
  },
];

export interface GenerateRequest {
  texts: string[];
  count: number;
  model?: string;
}

export interface ExtractResponse {
  files: UploadedFile[];
}

export interface GenerateResponse {
  questions: Question[];
}


