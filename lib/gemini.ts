import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, DifficultyLevel, QuestionTypeFormat, ImageInlinePart } from "./types";

function getModel(modelId?: string, clientApiKey?: string) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please paste your API key using the 🔑 icon at the top or set it in .env.local"
    );
  }
  const modelName = modelId || process.env.GEMINI_MODEL || "gemini-3.6-flash";
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
- "answer" must be one of "A", "B", "C", "D".`;

  if (questionType === "true_false") {
    formatInstructions = `
Question Format: Strictly True or False questions.
- "choices" must contain only "A": "True" and "B": "False".
- "answer" must be either "A" or "B".`;
  } else if (questionType === "mixed") {
    formatInstructions = `
Question Format: Mixed format (~70% 4-choice Multiple Choice with A, B, C, D, and ~30% True/False where choices has only A: "True" and B: "False").`;
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
    "choices": { "A": "string", "B": "string", "C"?: "string", "D"?: "string" },
    "answer": "A" | "B" | "C" | "D",
    "explanation": "concise 1-2 sentence rationale explaining why the correct choice is right and other choices are wrong",
    "type": "mcq" | "true_false"
  }
]

Requirements:
- "explanation" must be concise (max 2 sentences) to save output tokens.
- Keep questions clear, unambiguous, and directly grounded in the study material.
${combinedText ? `\nStudy Material Text:\n${combinedText.slice(0, 120000)}` : ""}`;

  const model = getModel(modelId, clientApiKey);

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

  const result = await model.generateContent(parts);
  const raw = result.response.text().trim();

  // Strip markdown code fences if Gemini wraps in them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsed: Omit<Question, "id">[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON. Raw: " + raw.slice(0, 300));
  }

  return parsed.map((q, i) => ({
    ...q,
    id: i + 1,
    type: q.choices && !q.choices.C ? "true_false" : "mcq",
  }));
}
