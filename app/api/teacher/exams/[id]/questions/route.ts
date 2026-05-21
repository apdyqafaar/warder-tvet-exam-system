import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, question } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

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
    const body = await req.json();
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer } = body;

    if (!questionText || !optionA || !optionB || !optionC || !correctAnswer) {
      return NextResponse.json(
        { success: false, message: "Missing required fields for a question" },
        { status: 400 }
      );
    }

    // Verify exam ownership
    const targetExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, examId), eq(exam.teacherId, session.user.id)),
    });

    if (!targetExam) {
      return NextResponse.json({ success: false, message: "Exam not found or unauthorized" }, { status: 404 });
    }

    const questionId = nanoid();

    // Perform inside a transaction
    const [insertedQuestion] = await db
  .insert(question)
  .values({
    id: questionId,
    examId,
    question: questionText,
    optionA,
    optionB,
    optionC,
    optionD: optionD || null,
    correctAnswer,
  })
  .returning();

await db
  .update(exam)
  .set({
    totalQuestions:
      sql`${exam.totalQuestions} + 1`,
  })
  .where(eq(exam.id, examId));

    return NextResponse.json({
      success: true,
      message: "Question added successfully",
      data: insertedQuestion,
    });
  } catch (error: any) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating question" },
      { status: 500 }
    );
  }
}
