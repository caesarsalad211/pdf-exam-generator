export interface Choice {
  A: string;
  B: string;
  C?: string;
  D?: string;
}

export interface Question {
  id: number;
  question: string;
  choices: Choice;
  answer: keyof Choice; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  type?: "mcq" | "true_false";
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
export type QuestionTypeFormat = "mcq" | "true_false" | "mixed";

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
  answers: Record<number, keyof Choice>; // questionId -> chosen key
  submitted: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  costTier: "cheapest" | "balanced" | "standard";
  inputPricePerM: number; // USD per 1M input tokens
  outputPricePerM: number; // USD per 1M output tokens
  outputTokensPerQuestion: number; // average output tokens per question for this model
  speedRating: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "⚡ Lowest Cost & Fastest (Recommended)",
    description: "Google's latest lightweight Flash model. Ultra-fast throughput and high token efficiency.",
    costTier: "cheapest",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    outputTokensPerQuestion: 85,
    speedRating: "⚡⚡⚡ Ultra Fast (< 20s)",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "🎯 High Speed Flash",
    description: "Fast generation with expanded reasoning for deep conceptual questions.",
    costTier: "balanced",
    inputPricePerM: 0.10,
    outputPricePerM: 0.40,
    outputTokensPerQuestion: 95,
    speedRating: "⚡⚡ Very Fast (~25s)",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    badge: "⚖️ Standard Flash",
    description: "Standard general-purpose flash model with broad compatibility.",
    costTier: "standard",
    inputPricePerM: 0.15,
    outputPricePerM: 0.60,
    outputTokensPerQuestion: 105,
    speedRating: "⚡ Standard (~30s)",
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
