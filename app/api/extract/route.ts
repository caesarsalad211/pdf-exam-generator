import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { cleanAndOptimizeText, parsePageRange } from "@/lib/textCleaner";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const pageRangesJson = formData.get("pageRanges") as string | null;
    const pageRanges: Record<string, string> = pageRangesJson ? JSON.parse(pageRangesJson) : {};

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parser = new PDFParse({ data: buffer });
        
        // First get the text to find total pages
        const fullData = await parser.getText();
        const totalPages = fullData.total || (fullData.pages ? fullData.pages.length : 1);
        
        const requestedRange = pageRanges[file.name];
        const pageNumbers = parsePageRange(requestedRange, totalPages);
        
        let extractedRawText = fullData.text;
        if (pageNumbers && pageNumbers.length > 0 && pageNumbers.length < totalPages) {
          // Extract only selected pages
          const partialData = await parser.getText({ partial: pageNumbers });
          extractedRawText = partialData.text;
        }

        await parser.destroy();

        const { cleaned, rawCharCount, cleanedCharCount } = cleanAndOptimizeText(extractedRawText);

        return {
          name: file.name,
          text: cleaned,
          charCount: cleanedCharCount,
          rawCharCount,
          totalPages,
          selectedPageRange: requestedRange || "all",
        };
      })
    );

    return NextResponse.json({ files: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
