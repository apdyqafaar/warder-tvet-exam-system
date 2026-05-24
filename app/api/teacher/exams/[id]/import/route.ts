import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseQuestionsFromText } from "@/lib/utils/question-parser";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: examId } = await params;

    // Use FormData for file uploads
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawText = formData.get("text") as string | null;
  // console.log("Received form data:", { file, rawText });
    let textToParse = "";

    if (rawText) {
      textToParse = rawText;
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
        console.log("Parsed text from PDF file:", textToParse);
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  textToParse = result.text;
} else if (fileName.endsWith(".docx")) {
  const result = await mammoth.extractRawText({ buffer });
  // console.log("Parsed text from DOCX file:", textToParse);
  textToParse = result.value;
} else if (fileName.endsWith(".txt")) {
  textToParse = buffer.toString("utf-8");
  console.log("Parsed text from TXT file:", textToParse);
} else {
  return NextResponse.json(
    {
      success: false,
      message:
        "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
    },
    { status: 400 }
  );
}}

    if (!textToParse.trim()) {
      return NextResponse.json(
        { success: false, message: "No content found in the provided document" },
        { status: 400 }
      );
    }

    const parsedQuestions = await parseQuestionsFromText(textToParse);
    console.log("Parsed questions:", parsedQuestions);

    return NextResponse.json({
      success: true,
      message: `Successfully parsed ${parsedQuestions.length} questions`,
      data: parsedQuestions,
    });
  } catch (error: any) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error parsing file" },
      { status: 500 }
    );
  }
}
