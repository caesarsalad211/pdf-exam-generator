import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model } = await req.json();
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

    if (!effectiveKey || effectiveKey === "your_api_key_here") {
      return NextResponse.json(
        { valid: false, error: "No API key provided" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(effectiveKey);
    const targetModel = genAI.getGenerativeModel({
      model: model || "gemini-3.6-flash",
    });

    // Test with a tiny 1-word prompt
    const result = await targetModel.generateContent("Test connection: respond OK");
    const responseText = result.response.text();

    return NextResponse.json({ valid: true, message: "API Key is valid and active!" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid API key";
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
