import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
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

    const examData = await db.query.exam.findFirst({
      where: and(eq(exam.id, id), eq(exam.teacherId, session.user.id)),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.createdAt)],
        },
        department: true,
      },
    });

    if (!examData) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: examData,
    });
  } catch (error: any) {
    console.error("Error fetching single exam:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching exam" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, duration, status } = body;

    const existingExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, id), eq(exam.teacherId, session.user.id)),
    });

    if (!existingExam) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (duration !== undefined) updateFields.duration = parseInt(duration);
    if (status !== undefined) {
      if (!["draft", "published", "closed"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      updateFields.status = status;
    }

    const [updatedExam] = await db
      .update(exam)
      .set(updateFields)
      .where(and(eq(exam.id, id), eq(exam.teacherId, session.user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      data: updatedExam,
    });
  } catch (error: any) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating exam" },
      { status: 500 }
    );
  }
}
