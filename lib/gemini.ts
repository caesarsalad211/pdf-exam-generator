import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "./types";

function getModel(modelId?: string, clientApiKey?: string) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured. Please paste your API key using the 🔑 icon at the top or set it in .env.local");
  }
  const modelName = modelId || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
}

export async function generateQuestions(
  combinedText: string,
  count: number,
  modelId?: string,
  clientApiKey?: string
): Promise<Question[]> {
  const prompt = `Generate exactly ${count} multiple-choice exam questions from the study material.

JSON schema:
[
  {
    "question": "string",
    "choices": { "A": "string", "B": "string", "C": "string", "D": "string" },
    "answer": "A" | "B" | "C" | "D",
    "explanation": "concise 1-2 sentence rationale"
  }
]

Requirements:
- Choices must be labeled exactly A, B, C, D.
- "answer" must be one of "A", "B", "C", "D".
- "explanation" must be concise (max 2 sentences) to save output tokens.
- Directly based on the material below.

Study Material:
${combinedText.slice(0, 120000)}`;

  const model = getModel(modelId, clientApiKey);
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code fences if Gemini wraps in them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsed: Omit<Question, "id">[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON. Raw: " + raw.slice(0, 300));
  }

  return parsed.map((q, i) => ({ ...q, id: i + 1 }));
}
