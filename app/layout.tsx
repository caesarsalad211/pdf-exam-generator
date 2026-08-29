import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Exam Generator",
  description: "Generate MCQ exams from your PDF study materials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 antialiased">
        {children}
      </body>
    </html>
  );
}
