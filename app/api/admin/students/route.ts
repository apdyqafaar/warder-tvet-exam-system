import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { student, department } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        ilike(student.fullName, `%${search}%`)
      );
    }
    if (departmentId && departmentId !== "all") {
      conditions.push(eq(student.departmentId, departmentId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get students with department info
    const studentsList = await db
      .select({
        id: student.id,
        fullName: student.fullName,
        studentNumber: student.studentNumber,
        departmentId: student.departmentId,
        departmentName: department.name,
        createdAt: student.createdAt,
      })
      .from(student)
      .leftJoin(department, eq(student.departmentId, department.id))
      .where(whereClause)
      .orderBy(desc(student.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ total: sql<number>`cast(count(${student.id}) as int)` })
      .from(student)
      .where(whereClause);

    // Get departments list for filtering/assigning
    const departmentsList = await db
      .select({
        id: department.id,
        name: department.name,
      })
      .from(department)
      .orderBy(department.name);

    return NextResponse.json({
      success: true,
      data: {
        students: studentsList,
        departments: departmentsList,
        pagination: {
          total: countResult?.total || 0,
          page,
          limit,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching students" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fullName, studentNumber, departmentId } = body;

    if (!fullName || !studentNumber || !departmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: fullName, studentNumber, departmentId",
        },
        { status: 400 }
      );
    }

    // Check if student number exists
    const existing = await db.query.student.findFirst({
      where: eq(student.studentNumber, studentNumber.trim()),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Student number already exists" },
        { status: 409 }
      );
    }

    const newStudent = await db
      .insert(student)
      .values({
        id: nanoid(),
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
        departmentId: departmentId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      data: newStudent[0],
    });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating student" },
      { status: 500 }
    );
  }
}
