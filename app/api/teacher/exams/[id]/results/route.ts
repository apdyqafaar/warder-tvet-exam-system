import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, studentExam } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify exam belongs to teacher
    const examData = await db.query.exam.findFirst({
      where: and(eq(exam.id, id), eq(exam.teacherId, session.user.id)),
      columns: {
        id: true,
        title: true,
        totalQuestions: true,
      }
    });

    if (!examData) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    const results = await db.query.studentExam.findMany({
      where: and(eq(studentExam.examId, id), eq(studentExam.isCompleted, true)),
      with: {
        student: true,
      },
      orderBy: [desc(studentExam.submittedAt)],
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        exam: examData,
      },
    });
  } catch (error: any) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching results" },
      { status: 500 }
    );
  }
}
