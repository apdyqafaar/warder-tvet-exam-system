import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, student, studentExam } from "@/lib/db/schema";

const ensureTeacherSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "teacher") {
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

const getTeacherDepartmentIds = async (teacherId: string) => {
  const assignedDepartments = await db
    .select({ id: department.id })
    .from(department)
    .where(eq(department.teacherId, teacherId));

  return assignedDepartments.map((item) => item.id);
};

export async function GET(req: Request) {
  try {
    const session = await ensureTeacherSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const departmentIds = await getTeacherDepartmentIds(session.user.id);

    if (departmentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          students: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      });
    }

    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10) || 10;
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const selectedDepartmentId = searchParams.get("departmentId")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const minScore = Number.parseFloat(searchParams.get("minScore") || "");
    const offset = (page - 1) * limit;

    const scopedDepartmentIds =
      selectedDepartmentId && departmentIds.includes(selectedDepartmentId)
        ? [selectedDepartmentId]
        : departmentIds;

    const conditions = [inArray(student.departmentId, scopedDepartmentIds)];

    if (search) {
      conditions.push(ilike(student.fullName, `%${search}%`));
    }

    const whereClause = and(...conditions);
    const averageScoreSql = sql<number>`cast(coalesce(avg(case when ${studentExam.isCompleted} = true then ${studentExam.score} end), 0) as decimal(10,2))`;
    const totalExamsSql = sql<number>`cast(count(distinct ${studentExam.examId}) as int)`;
    const completedExamsSql = sql<number>`cast(count(distinct case when ${studentExam.isCompleted} = true then ${studentExam.examId} end) as int)`;

    const havingConditions = [];

    if (status === "has-exams") {
      havingConditions.push(sql`${totalExamsSql} > 0`);
    }

    if (status === "completed") {
      havingConditions.push(sql`${completedExamsSql} > 0`);
    }

    if (status === "top-performer") {
      havingConditions.push(sql`${averageScoreSql} >= 80`);
    }

    if (status === "needs-attention") {
      havingConditions.push(
        sql`${averageScoreSql} > 0 and ${averageScoreSql} < 60`,
      );
    }

    if (!Number.isNaN(minScore)) {
      havingConditions.push(sql`${averageScoreSql} >= ${minScore}`);
    }

    const sortExpression =
      sortBy === "fullName"
        ? sortOrder === "asc"
          ? asc(student.fullName)
          : desc(student.fullName)
        : sortBy === "totalExams"
          ? sortOrder === "asc"
            ? sql`${totalExamsSql} asc`
            : sql`${totalExamsSql} desc`
          : sortBy === "averageScore"
            ? sortOrder === "asc"
              ? sql`${averageScoreSql} asc`
              : sql`${averageScoreSql} desc`
            : sortBy === "passedExamsCount"
            ? sortOrder === "asc"
              ? sql`cast(count(case when ${studentExam.isCompleted} = true and ${studentExam.status} = 'passed' then 1 end) as int) asc`
              : sql`cast(count(case when ${studentExam.isCompleted} = true and ${studentExam.status} = 'passed' then 1 end) as int) desc`
            : sortOrder === "asc"
              ? asc(student.createdAt)
              : desc(student.createdAt);

    const studentsList = await db
      .select({
        id: student.id,
        fullName: student.fullName,
        studentNumber: student.studentNumber,
        departmentId: student.departmentId,
        createdAt: student.createdAt,
        totalExams: totalExamsSql,
        passedExamsCount: sql<number>`cast(count(case when ${studentExam.isCompleted} = true and ${studentExam.status} = 'passed' then 1 end) as int)`,
        completedExams: completedExamsSql,
        averageScore: sql<number>`cast(avg(case when ${studentExam.isCompleted} = true then ${studentExam.score} end) as decimal(10,2))`,
      })
      .from(student)
      .leftJoin(studentExam, eq(student.id, studentExam.studentId))
      .where(whereClause)
      .groupBy(
        student.id,
        student.fullName,
        student.studentNumber,
        student.departmentId,
        student.createdAt,
      )
      .having(
        havingConditions.length > 0 ? and(...havingConditions) : undefined,
      )
      .orderBy(sortExpression)
      .limit(limit)
      .offset(offset);

    const countRows = await db
      .select({ id: student.id })
      .from(student)
      .leftJoin(studentExam, eq(student.id, studentExam.studentId))
      .where(whereClause)
      .groupBy(student.id)
      .having(
        havingConditions.length > 0 ? and(...havingConditions) : undefined,
      );

    const total = countRows.length;

    return NextResponse.json({
      success: true,
      data: {
        students: studentsList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error fetching students"),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await ensureTeacherSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { fullName, studentNumber, departmentId } = body;

    if (!fullName || !studentNumber || !departmentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: fullName, studentNumber, departmentId",
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

    const newStudent = await db
      .insert(student)
      .values({
        id: nanoid(),
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
        departmentId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      data: newStudent[0],
    });
  } catch (error: unknown) {
    console.error("Error creating student:", error);

    if (error instanceof Error && error.message?.includes("unique")) {
      return NextResponse.json(
        {
          success: false,
          message: "Student number already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error creating student"),
      },
      { status: 500 },
    );
  }
}
