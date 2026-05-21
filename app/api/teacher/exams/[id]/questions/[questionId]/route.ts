import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, question } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: examId, questionId } = await params;

    // Verify exam ownership
    const targetExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, examId), eq(exam.teacherId, session.user.id)),
    });

    if (!targetExam) {
      return NextResponse.json({ success: false, message: "Exam not found or unauthorized" }, { status: 404 });
    }

    // Verify question belongs to this exam
    const targetQuestion = await db.query.question.findFirst({
      where: and(eq(question.id, questionId), eq(question.examId, examId)),
    });

    if (!targetQuestion) {
      return NextResponse.json({ success: false, message: "Question not found in this exam" }, { status: 404 });
    }

    // Delete in a transaction
    
      // 1. Delete question
      await db
        .delete(question)
        .where(eq(question.id, questionId));

      // 2. Decrement total questions in exam
      await db
        .update(exam)
        .set({
          totalQuestions: sql`GREATEST(0, ${exam.totalQuestions} - 1)`,
        })
        .where(eq(exam.id, examId));

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting question" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: examId, questionId } = await params;
    const body=await req.json();
    const {questionText,optionA,optionB,optionC,optionD,correctAnswer}=body;

    // Verify exam ownership
    const targetExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, examId), eq(exam.teacherId, session.user.id)),
    });

    if (!targetExam) {
      return NextResponse.json({ success: false, message: "Exam not found or unauthorized" }, { status: 404 });
    } 

    // Verify question belongs to this exam
    const targetQuestion = await db.query.question.findFirst({
      where: and(eq(question.id, questionId), eq(question.examId, examId)),
    });

    if (!targetQuestion) {
      return NextResponse.json({ success: false, message: "Question not found in this exam" }, { status: 404 });
    }

    // update in a transaction
    
      // 1. update question
      await db
        .update(question)
        .set({
          question: questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
        })
        .where(eq(question.id, questionId));

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating question" },
      { status: 500 }
    );
  }
}
