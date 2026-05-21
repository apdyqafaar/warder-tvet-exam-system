import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, studentExam } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, examId } = body;

    if (!studentId || !examId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: studentId, examId" },
        { status: 400 }
      );
    }

    //Check if there is already an existing session for this student and exam
    let session = await db.query.studentExam.findFirst({
      where: and(
        eq(studentExam.studentId, studentId),
        eq(studentExam.examId, examId)
      ),
    });

    if (!session) {
      // Create a new exam session
      const [newSession] = await db
        .insert(studentExam)
        .values({
          id: nanoid(),
          studentId,
          examId,
          isCompleted: false,
          startedAt: new Date(),
        })
        .returning();
      session = newSession;
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error("Error managing exam session:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error managing exam session" },
      { status: 500 }
    );
  }
}
