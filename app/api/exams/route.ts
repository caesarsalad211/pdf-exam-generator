import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SavedExam } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const EXAMS_FILE = path.join(DATA_DIR, "saved_exams.json");

function ensureFile(): SavedExam[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(EXAMS_FILE)) {
      fs.writeFileSync(EXAMS_FILE, JSON.stringify([]), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(EXAMS_FILE, "utf-8");
    return JSON.parse(raw) as SavedExam[];
  } catch (err) {
    console.error("Error reading saved_exams.json:", err);
    return [];
  }
}

function saveToFile(exams: SavedExam[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to saved_exams.json:", err);
  }
}

// GET all saved exams
export async function GET() {
  const exams = ensureFile();
  return NextResponse.json({ exams });
}

// POST: Save a new exam (or merge imported exams)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const exam: SavedExam = body.exam;
    if (!exam || !exam.id) {
      return NextResponse.json({ error: "Invalid exam data" }, { status: 400 });
    }

    const exams = ensureFile();
    // Prepend new exam or update if existing
    const existingIndex = exams.findIndex((e) => e.id === exam.id);
    let updated: SavedExam[];
    if (existingIndex >= 0) {
      updated = [...exams];
      updated[existingIndex] = exam;
    } else {
      updated = [exam, ...exams];
    }

    saveToFile(updated);
    return NextResponse.json({ success: true, exam });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save exam";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update score for an exam
export async function PATCH(req: Request) {
  try {
    const { examId, correct, total } = await req.json();
    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    const exams = ensureFile();
    const index = exams.findIndex((e) => e.id === examId);
    if (index >= 0) {
      const pct = Math.round((correct / total) * 100);
      const currentBest = exams[index].bestScore?.pct ?? -1;
      if (pct >= currentBest) {
        exams[index].bestScore = { correct, total, pct };
        saveToFile(exams);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update score";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove an exam
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const exams = ensureFile();
    const updated = exams.filter((e) => e.id !== id);
    saveToFile(updated);
    return NextResponse.json({ success: true, exams: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete exam";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
