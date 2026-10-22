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
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "⚡ Lowest Cost & Most Reliable (Recommended)",
    description: "Ultra-fast throughput, high uptime, and lowest token cost.",
    costTier: "cheapest",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    outputTokensPerQuestion: 85,
    speedRating: "⚡⚡⚡ Ultra Fast (< 15s)",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "🧠 Flagship Reasoning (High Demand)",
    description: "Deep reasoning and nuance for complex scenarios. Auto-falls back if high demand occurs.",
    costTier: "flagship",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 90,
    speedRating: "⚡⚡ Very Fast (~18s)",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "⚖️ Reliable Standard",
    description: "Proven standard flash model with steady availability and low overhead.",
    costTier: "cheapest",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    outputTokensPerQuestion: 85,
    speedRating: "⚡ Fast (~20s)",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "🚀 Cutting Edge Speed",
    description: "Latest generation architecture optimized for high concurrency.",
    costTier: "balanced",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 90,
    speedRating: "⚡⚡⚡ Ultra Fast (~16s)",
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
