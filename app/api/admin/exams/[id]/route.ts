import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
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

    const { id: examId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["draft", "published", "closed"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if exam exists
    const existing = await db.query.exam.findFirst({
      where: eq(exam.id, examId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Update status
    const [updated] = await db
      .update(exam)
      .set({
        status: status as "draft" | "published" | "closed",
      })
      .where(eq(exam.id, examId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Exam status updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating exam status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating exam status" },
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

    const { id: examId } = await params;

    // Check if exam exists
    const existing = await db.query.exam.findFirst({
      where: eq(exam.id, examId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Delete exam
    await db.delete(exam).where(eq(exam.id, examId));

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting exam" },
      { status: 500 }
    );
  }
}
