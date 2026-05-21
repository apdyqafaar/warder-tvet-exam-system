import { and, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, student, studentExam } from "@/lib/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: studentId } = await params;

    const departmentsList = await db
      .select({ id: department.id })
      .from(department)
      .where(eq(department.teacherId, session.user.id));

    const departmentIds = departmentsList.map((item) => item.id);

    if (departmentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No department found" },
        { status: 404 },
      );
    }

    // Get student with exam records
    const studentData = await db.query.student.findFirst({
      where: and(
        eq(student.id, studentId),
        inArray(student.departmentId, departmentIds),
      ),
      with: {
        studentExams: {
          with: {
            exam: true,
          },
          orderBy: [desc(studentExam.createdAt)],
        },
      },
    });

    if (!studentData) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: studentData,
    });
  } catch (error: unknown) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching student",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: studentId } = await params;

    const departmentsList = await db
      .select({ id: department.id })
      .from(department)
      .where(eq(department.teacherId, session.user.id));

    const departmentIds = departmentsList.map((item) => item.id);

    if (departmentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No department found" },
        { status: 404 },
      );
    }

    const existing = await db.query.student.findFirst({
      where: and(
        eq(student.id, studentId),
        inArray(student.departmentId, departmentIds),
      ),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    await db.delete(student).where(eq(student.id, studentId));

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error deleting student",
      },
      { status: 500 },
    );
  }
}
