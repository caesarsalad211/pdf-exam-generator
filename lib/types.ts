export interface Choice {
  A: string;
  B: string;
  C?: string;
  D?: string;
}

export interface Question {
  id: number;
  question: string;
  choices?: Choice;
  answer: string; // 'A' | 'B' | 'C' | 'D' or exact term for identification
  explanation: string;
  type?: "mcq" | "true_false" | "identification";
}

export interface UploadedFile {
  name: string;
  text: string;
  charCount: number;
  rawCharCount: number;
  totalPages: number;
  selectedPageRange?: string; // e.g. "1-20" or "all"
}

export interface UploadedPhoto {
  id: string;
  name: string;
  mimeType: string;
  base64Data: string;
  previewUrl: string;
}

export type DifficultyLevel = "easy" | "medium" | "hard";
export type QuestionTypeFormat = "mcq" | "true_false" | "identification" | "mixed";

export interface SavedExam {
  id: string;
  title: string;
  createdAt: string;
  fileNames: string[];
  questionCount: number;
  questions: Question[];
  difficulty?: DifficultyLevel;
  questionType?: QuestionTypeFormat;
  timeLimitMinutes?: number;
  bestScore?: {
    correct: number;
    total: number;
    pct: number;
  };
}

export interface ExamSession {
  questions: Question[];
  answers: Record<number, string>; // questionId -> chosen key or typed text
  submitted: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  costTier: "cheapest" | "balanced" | "flagship";
  inputPricePerM: number; // USD per 1M input tokens
  outputPricePerM: number; // USD per 1M output tokens
  outputTokensPerQuestion: number; // average output tokens per question for this model
  speedRating: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    badge: "⚡ 15 RPM High Quota & Fast (Recommended)",
    description: "3x higher free request limit (15 req/min). Ultra-fast generation (< 12s) and high reliability.",
    costTier: "cheapest",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 85,
    speedRating: "⚡⚡⚡ Ultra Fast (< 12s)",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "🧠 Next-Gen Flash (5 RPM Limit)",
    description: "Latest generation architecture. High intelligence; free tier allows up to 5 req/min.",
    costTier: "cheapest",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    outputTokensPerQuestion: 85,
    speedRating: "⚡⚡ Very Fast (~15s)",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    badge: "🛡️ Rock-Solid Stable (15 RPM)",
    description: "Generous 15 req/min quota and proven multimodal support for long PDFs and image problems.",
    costTier: "cheapest",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    outputTokensPerQuestion: 85,
    speedRating: "⚡ Fast (~15s)",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "⚖️ Balanced Reasoning (10 RPM)",
    description: "Strong problem-solving and balanced speed for complex multi-step exams.",
    costTier: "balanced",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 90,
    speedRating: "⚡ Fast (~15s)",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "🔬 Flagship Reasoning (High Demand)",
    description: "Google's flagship reasoning model for intricate topics. Subject to high demand and 5 RPM limit.",
    costTier: "flagship",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 90,
    speedRating: "⚡ Fast (~18s)",
  },
];

export interface ImageInlinePart {
  mimeType: string;
  data: string; // base64 without data:image/... prefix
}

export interface GenerateRequest {
  texts: string[];
  count: number;
  model?: string;
  apiKey?: string;
  difficulty?: DifficultyLevel;
  questionType?: QuestionTypeFormat;
  timeLimitMinutes?: number;
  images?: ImageInlinePart[];
}

export interface ExtractResponse {
  files: UploadedFile[];
}

export interface GenerateResponse {
  questions: Question[];
}
