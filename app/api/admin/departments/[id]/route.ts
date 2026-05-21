import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, user } from "@/lib/db/schema";

const ensureAdminSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await ensureAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const name = body.name?.trim();
    const description = body.description?.trim();
    const imageUrl = body.imageUrl?.trim();
    const teacherId = body.teacherId?.trim();

    if (!name || name.length < 2 || !teacherId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name and teacherId",
        },
        { status: 400 },
      );
    }

    const existingDepartment = await db.query.department.findFirst({
      where: eq(department.id, id),
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const nameConflict = await db.query.department.findFirst({
      where: and(eq(department.name, name), ne(department.id, id)),
    });

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Department name already exists" },
        { status: 409 },
      );
    }

    const assignedTeacher = await db.query.user.findFirst({
      where: and(eq(user.id, teacherId), eq(user.role, "teacher")),
    });

    if (!assignedTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 },
      );
    }

    const [updatedDepartment] = await db
      .update(department)
      .set({
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        teacherId,
      })
      .where(eq(department.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error: unknown) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error updating department"),
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
    const session = await ensureAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const existingDepartment = await db.query.department.findFirst({
      where: eq(department.id, id),
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    await db.delete(department).where(eq(department.id, id));

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error deleting department"),
      },
      { status: 500 },
    );
  }
}
