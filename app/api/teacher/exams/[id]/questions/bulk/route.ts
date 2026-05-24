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
    
    if (!body.questions || !Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions provided" },
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

    const questionsToInsert = body.questions.map((q: any) => ({
      id: nanoid(),
      examId,
      question: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD || null,
      correctAnswer: q.correctAnswer,
    }));

    // Perform bulk insert
    const insertedQuestions = await db
      .insert(question)
      .values(questionsToInsert)
      .returning();

    // Update total questions count
    await db
      .update(exam)
      .set({
        totalQuestions: sql`${exam.totalQuestions} + ${insertedQuestions.length}`,
      })
      .where(eq(exam.id, examId));

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedQuestions.length} questions`,
      data: insertedQuestions,
    });
  } catch (error: any) {
    console.error("Error creating questions in bulk:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating questions" },
      { status: 500 }
    );
  }
}
