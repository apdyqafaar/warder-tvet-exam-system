import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, question, studentAnswer } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const { searchParams } = new URL(req.url);
    const studentExamId = searchParams.get("studentExamId");

    if (!studentExamId||!examId) {
      return NextResponse.json(
        { success: false, message: "studentExamId or examId query parameter is required" },
        { status: 400 }
      );
    }

    // 1. Fetch exam details
    const examDetail = await db.query.exam.findFirst({
      where: eq(exam.id, examId),
    });

    if (!examDetail) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // 2. Fetch all questions for this exam
  const allQuestions = await db.query.question.findMany({
  where: eq(question.examId, examId),
  orderBy: sql`RANDOM()`,
})

    // 3. Strip correct answers for security
    const sanitizedQuestions = allQuestions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    // 4. Fetch already submitted answers for this student exam
    const existingAnswers = await db.query.studentAnswer.findMany({
      where: eq(studentAnswer.studentExamId, studentExamId),
    });

    return NextResponse.json({
      success: true,
      data: {
        exam: examDetail,
        questions: sanitizedQuestions,
        answers: existingAnswers,
      },
    });
  } catch (error: any) {
    console.error("Error fetching student questions:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching questions" },
      { status: 500 }
    );
  }
}
