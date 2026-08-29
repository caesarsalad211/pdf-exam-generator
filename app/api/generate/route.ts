import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { texts, count, model, apiKey } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "No texts provided" }, { status: 400 });
    }
    if (!count || count < 1 || count > 100) {
      return NextResponse.json(
        { error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    const combinedText = texts.join("\n\n---\n\n");
    const questions = await generateQuestions(combinedText, count, model, apiKey);

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
