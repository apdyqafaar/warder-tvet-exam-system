import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, exam } from "@/lib/db/schema";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const offset = (page - 1) * limit;

    if (!departmentId) {
      return NextResponse.json({
        success: true,
        data: {
          exams: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        },
      });
    }

    // 2. Build where conditions to get ALL exams in that department
    const teacherDepartment = await db.query.department.findFirst({
      where: and(
        eq(department.id, departmentId),
        eq(department.teacherId, session.user.id),
      ),
    });

    if (!teacherDepartment) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const conditions = [
      eq(exam.departmentId, departmentId),
      eq(exam.teacherId, session.user.id),
    ];

    if (search) {
      conditions.push(ilike(exam.title, `%${search}%`));
    }

    if (status) {
      conditions.push(
        eq(exam.status, status as "draft" | "published" | "closed"),
      );
    }

    const whereClause = and(...conditions);

    // Get paginated data
    const data = await db.query.exam.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(exam.createdAt)],
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(${exam.id}) as int)` })
      .from(exam)
      .where(whereClause);

    return NextResponse.json({
      success: true,
      data: {
        exams: data,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error fetching exams"),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { title, description, duration, departmentId } = body;

    if (!title || !duration || !departmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: title, duration, departmentId",
        },
        { status: 400 },
      );
    }

    const teacherDepartment = await db.query.department.findFirst({
      where: and(
        eq(department.id, departmentId),
        eq(department.teacherId, session.user.id),
      ),
    });

    if (!teacherDepartment) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const examId = nanoid();

    const [newExam] = await db
      .insert(exam)
      .values({
        id: examId,
        title,
        description: description || null,
        duration: parseInt(duration, 10),
        totalQuestions: 0,
        status: "draft",
        departmentId,
        teacherId: session.user.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Exam created successfully",
      data: newExam,
    });
  } catch (error: unknown) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error creating exam"),
      },
      { status: 500 },
    );
  }
}
