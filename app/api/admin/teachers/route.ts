import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, user } from "@/lib/db/schema";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get all teachers
    const teachersListRaw = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.role, "teacher"))
      .orderBy(user.createdAt);

    const teachersList = await Promise.all(
      teachersListRaw.map(async (teacherRecord) => {
        const assignedDepartments = await db
          .select({
            id: department.id,
            name: department.name,
          })
          .from(department)
          .where(eq(department.teacherId, teacherRecord.id))
          .orderBy(department.name);

        return {
          ...teacherRecord,
          departmentIds: assignedDepartments.map(
            (assignedDepartment) => assignedDepartment.id,
          ),
          departmentNames: assignedDepartments.map(
            (assignedDepartment) => assignedDepartment.name,
          ),
          departmentCount: assignedDepartments.length,
        };
      }),
    );

    // Get all departments (for dropdown assignment)
    const departmentsList = await db
      .select({
        id: department.id,
        name: department.name,
        teacherId: department.teacherId,
      })
      .from(department)
      .orderBy(department.name);

    return NextResponse.json({
      success: true,
      data: {
        teachers: teachersList,
        departments: departmentsList,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error fetching teachers"),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, email, password, departmentId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, email, password",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create the teacher user via better-auth api
    const newTeacher = await auth.api.createUser({
      headers: await headers(),
      body: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        role: "teacher",
      },
    });

    if (!newTeacher) {
      return NextResponse.json(
        { success: false, message: "Failed to create teacher user" },
        { status: 500 },
      );
    }

    // If departmentId is provided, assign this teacher to that department
    if (departmentId) {
      await db
        .update(department)
        .set({ teacherId: newTeacher.user.id })
        .where(eq(department.id, departmentId));
    }

    return NextResponse.json({
      success: true,
      message: "Teacher created successfully",
      data: newTeacher,
    });
  } catch (error: unknown) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error creating teacher"),
      },
      { status: 500 },
    );
  }
}
