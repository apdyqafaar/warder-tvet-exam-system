import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { student } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;
    const body = await req.json();
    const { fullName, studentNumber, departmentId } = body;

    if (!fullName || !studentNumber || !departmentId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existing = await db.query.student.findFirst({
      where: eq(student.id, studentId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student number is taken by someone else
    const numberConflict = await db.query.student.findFirst({
      where: and(eq(student.studentNumber, studentNumber.trim()), ne(student.id, studentId)),
    });

    if (numberConflict) {
      return NextResponse.json(
        { success: false, message: "Student number already in use by another student" },
        { status: 409 }
      );
    }

    // Update student
    const [updated] = await db
      .update(student)
      .set({
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
        departmentId: departmentId,
      })
      .where(eq(student.id, studentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;

    // Check if student exists
    const existing = await db.query.student.findFirst({
      where: eq(student.id, studentId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Delete student
    await db.delete(student).where(eq(student.id, studentId));

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting student" },
      { status: 500 }
    );
  }
}
