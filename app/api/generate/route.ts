import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/gemini";
import { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { texts, count, model, apiKey, difficulty, questionType, images } = body;

    const hasTexts = texts && Array.isArray(texts) && texts.length > 0;
    const hasImages = images && Array.isArray(images) && images.length > 0;

    if (!hasTexts && !hasImages) {
      return NextResponse.json(
        { error: "Please upload at least one PDF or photo of a problem." },
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 100) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 100" },
        { status: 400 }
      );
    }

    const combinedText = hasTexts ? texts.join("\n\n---\n\n") : "";
    const questions = await generateQuestions(
      combinedText,
      count,
      model,
      apiKey,
      difficulty || "medium",
      questionType || "mcq",
      images
    );

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
