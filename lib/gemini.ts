import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, DifficultyLevel, QuestionTypeFormat, ImageInlinePart } from "./types";

export function parseGeminiError(err: unknown): {
  message: string;
  isRateLimit: boolean;
  retryAfter?: number;
} {
  const errMsg = err instanceof Error ? err.message : String(err);

  if (
    errMsg.includes("429") ||
    errMsg.includes("Too Many Requests") ||
    errMsg.includes("Quota exceeded") ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("ResourceExhausted")
  ) {
    const delayMatch =
      errMsg.match(/retryDelay["']?:\s*["']?(\d+)s/i) ||
      errMsg.match(/Please retry in\s+([\d.]+)s/i);
    const retrySeconds = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) : 60;

    return {
      message: `Gemini Free Tier rate limit reached. Please wait ${retrySeconds}s before retrying.`,
      isRateLimit: true,
      retryAfter: retrySeconds,
    };
  }

  if (errMsg.includes("503") || errMsg.includes("high demand")) {
    return {
      message: "The AI model is experiencing temporary high demand. Please try again or switch models.",
      isRateLimit: false,
    };
  }

  if (
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("API key not valid") ||
    errMsg.includes("PERMISSION_DENIED")
  ) {
    return {
      message: "Your Gemini API key is invalid or unauthorized. Please verify your key in the 🔑 menu.",
      isRateLimit: false,
    };
  }

  // Clean raw protobuf noise
  const clean = errMsg
    .replace(/^\[GoogleGenerativeAI Error\]:\s*/i, "")
    .replace(/\[\{[\s\S]*?\}\]/g, "")
    .replace(/\[\d+\s+[\s\S]*?\]\s*/g, "")
    .trim();

  return {
    message: clean.slice(0, 250) || "An unexpected error occurred while communicating with Gemini.",
    isRateLimit: false,
  };
}

function getModel(modelId?: string, clientApiKey?: string) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please paste your API key using the 🔑 icon at the top or set it in .env.local"
    );
  }
  const modelName = modelId || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json",
    },
  });
}

export async function generateQuestions(
  combinedText: string,
  count: number,
  modelId?: string,
  clientApiKey?: string,
  difficulty: DifficultyLevel = "medium",
  questionType: QuestionTypeFormat = "mcq",
  images?: ImageInlinePart[]
): Promise<Question[]> {
  const difficultyInstructions = {
    easy: "Difficulty: EASY. Questions must focus on fundamental definitions, straightforward facts, and direct recall.",
    medium: "Difficulty: MEDIUM. Questions must test conceptual understanding, comparisons, cause-and-effect, and relationships.",
    hard: "Difficulty: HARD. Questions must be challenging, scenario-based, analytical, or clinical, with realistic and tricky distractors.",
  }[difficulty];

  let formatInstructions = `
Question Format: Standard Multiple Choice.
- "choices" must contain exactly "A", "B", "C", "D".
- "answer" must be one of "A", "B", "C", "D".
- "type": "mcq".`;

  if (questionType === "identification") {
    formatInstructions = `
Question Format: Strictly IDENTIFICATION (fill-in-the-blank or direct term recall).
- Provide a clear statement, clue, or definition where the student must identify the specific term.
- DO NOT provide multiple choice options. Do not include A, B, C, D choices.
- "answer" MUST be the exact term, concept, person, law, or formula being identified (e.g. "Mitochondria", "Newton's Second Law", "Photosynthesis").
- "type": "identification".
- "explanation": concise 1-2 sentence rationale confirming the definition.`;
  } else if (questionType === "true_false") {
    formatInstructions = `
Question Format: Strictly True or False questions.
- "choices" must contain only "A": "True" and "B": "False".
- "answer" must be either "A" or "B".
- "type": "true_false".`;
  } else if (questionType === "mixed") {
    formatInstructions = `
Question Format: Mixed format (~50% 4-choice Multiple Choice with A, B, C, D; ~25% True/False with A: True, B: False; and ~25% Identification with exact term answer and no choices). Set "type" accordingly ("mcq", "true_false", or "identification").`;
  }

  const imageInstruction =
    images && images.length > 0
      ? `\nIMPORTANT: The user has attached ${images.length} photo(s)/diagram(s) of problems or study notes. Inspect the diagrams, formulas, equations, or handwritten problems in the image(s) closely. Generate questions that directly assess how to solve, analyze, or interpret the material shown in the image(s).`
      : "";

  const prompt = `You are an expert exam creator. Generate exactly ${count} high-quality exam questions based on the provided material.

${difficultyInstructions}
${formatInstructions}
${imageInstruction}

JSON schema requirement:
[
  {
    "question": "string",
    "choices"?: { "A": "string", "B": "string", "C"?: "string", "D"?: "string" },
    "answer": "string (A/B/C/D for MCQ/TrueFalse, or the exact term string for identification)",
    "explanation": "concise 1-2 sentence rationale explaining why the answer is correct",
    "type": "mcq" | "true_false" | "identification"
  }
]

Requirements:
- "explanation" must be concise (max 2 sentences) to save output tokens.
- Keep questions clear, unambiguous, and directly grounded in the study material.
${combinedText ? `\nStudy Material Text:\n${combinedText.slice(0, 120000)}` : ""}`;

  // Build multimodal content if images are present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [prompt];
  if (images && images.length > 0) {
    for (const img of images) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }
  }

  // Model fallback chain: requested model -> gemini-2.0-flash (15 RPM) -> gemini-1.5-flash (15 RPM) -> gemini-2.5-flash -> gemini-3.6-flash
  const requestedModel = modelId || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const fallbackModels = [
    requestedModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
    "gemini-3.6-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let raw = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastError: any = null;

  for (const m of fallbackModels) {
    try {
      const model = getModel(m, clientApiKey);
      const result = await model.generateContent(parts);
      raw = result.response.text().trim();
      break;
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      const isTemporary =
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("Too Many Requests") ||
        errMsg.includes("ResourceExhausted") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("not found") ||
        errMsg.includes("404");

      if (!isTemporary) {
        throw err; // Genuine auth or syntax errors fail immediately
      }

      console.warn(`Model ${m} encountered: ${errMsg.slice(0, 80)}. Falling back to next available model...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!raw) {
    throw lastError || new Error("All AI models are currently busy. Please try again in a moment.");
  }

  // Strip markdown code fences if Gemini wraps in them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsed: Omit<Question, "id">[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON. Raw: " + raw.slice(0, 300));
  }

  return parsed.map((q, i) => {
    let qType: "mcq" | "true_false" | "identification" = "mcq";
    if (
      questionType === "identification" ||
      q.type === "identification" ||
      !q.choices ||
      Object.keys(q.choices).length === 0
    ) {
      qType = "identification";
    } else if (q.choices && !q.choices.C) {
      qType = "true_false";
    }

    return {
      ...q,
      id: i + 1,
      type: qType,
      choices: qType === "identification" ? undefined : q.choices,
    };
  });
}
