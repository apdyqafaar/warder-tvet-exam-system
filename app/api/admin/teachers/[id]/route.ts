import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, department } from "@/lib/db/schema";
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

    const { id: teacherId } = await params;
    const body = await req.json();
    const { name, email, departmentId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    // Check if user exists and is a teacher
    const existingTeacher = await db.query.user.findFirst({
      where: and(eq(user.id, teacherId), eq(user.role, "teacher")),
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    const emailConflict = await db.query.user.findFirst({
      where: and(eq(user.email, email.toLowerCase().trim()), ne(user.id, teacherId)),
    });

    if (emailConflict) {
      return NextResponse.json(
        { success: false, message: "Email is already taken by another user" },
        { status: 409 }
      );
    }

    // Update user info
    await db
      .update(user)
      .set({
        name: name.trim(),
        email: email.toLowerCase().trim(),
      })
      .where(eq(user.id, teacherId));

    // Update department if departmentId is provided
    if (departmentId) {
      // Reassign this department to this teacher
      await db
        .update(department)
        .set({ teacherId: teacherId })
        .where(eq(department.id, departmentId));
    }

    return NextResponse.json({
      success: true,
      message: "Teacher updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating teacher" },
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

    const { id: teacherId } = await params;

    // Check if teacher exists
    const existingTeacher = await db.query.user.findFirst({
      where: and(eq(user.id, teacherId), eq(user.role, "teacher")),
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    // Delete the teacher
    await db.delete(user).where(eq(user.id, teacherId));

    return NextResponse.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting teacher" },
      { status: 500 }
    );
  }
}
