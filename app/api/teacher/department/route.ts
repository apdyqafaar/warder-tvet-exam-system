import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, exam, student, studentExam } from "@/lib/db/schema";

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

const getDepartmentStats = async (departmentId: string) => {
  const [studentCount] = await db
    .select({ total: sql<number>`cast(count(${student.id}) as int)` })
    .from(student)
    .where(eq(student.departmentId, departmentId));

  const [examCount] = await db
    .select({ total: sql<number>`cast(count(${exam.id}) as int)` })
    .from(exam)
    .where(eq(exam.departmentId, departmentId));

  const examScoresByMonth = await db
    .select({
      month: sql<string>`to_char(${studentExam.submittedAt}, 'Mon')`,
      avgScore: sql<number>`cast(avg(${studentExam.score}) as decimal(10,2))`,
      completedCount: sql<number>`cast(count(case when ${studentExam.isCompleted} = true then 1 end) as int)`,
    })
    .from(studentExam)
    .innerJoin(exam, eq(studentExam.examId, exam.id))
    .where(eq(exam.departmentId, departmentId))
    .groupBy(sql`to_char(${studentExam.submittedAt}, 'Mon')`)
    .limit(6);

  const topStudents = await db
    .select({
      id: student.id,
      fullName: student.fullName,
      studentNumber: student.studentNumber,
      averageScore: sql<number>`cast(coalesce(avg(case when ${studentExam.isCompleted} = true then ${studentExam.score} end), 0) as decimal(10,2))`,
      completedExams: sql<number>`cast(count(distinct case when ${studentExam.isCompleted} = true then ${studentExam.examId} end) as int)`,
    })
    .from(student)
    .leftJoin(studentExam, eq(student.id, studentExam.studentId))
    .where(eq(student.departmentId, departmentId))
    .groupBy(student.id, student.fullName, student.studentNumber)
    .having(
      sql`count(distinct case when ${studentExam.isCompleted} = true then ${studentExam.examId} end) > 0`,
    )
    .orderBy(
      sql`coalesce(avg(case when ${studentExam.isCompleted} = true then ${studentExam.score} end), 0) desc`,
    )
    .limit(5);

  return {
    totalStudents: studentCount?.total || 0,
    totalExams: examCount?.total || 0,
    examScoresByMonth,
    topStudents,
  };
};

export async function GET() {
  try {
    const session = await ensureTeacherSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const departmentsList = await db.query.department.findMany({
      where: eq(department.teacherId, session.user.id),
    });

    const departmentsWithStats = await Promise.all(
      departmentsList.map(async (currentDepartment) => ({
        ...currentDepartment,
        stats: await getDepartmentStats(currentDepartment.id),
      })),
    );

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentsWithStats,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error fetching departments"),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await ensureTeacherSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { departmentId, name, description, imageUrl } = body;

    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: "Department id is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Department name must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    const existingDepartment = await db.query.department.findFirst({
      where: eq(department.id, departmentId),
    });

    if (
      !existingDepartment ||
      existingDepartment.teacherId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [updated] = await db
      .update(department)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      })
      .where(eq(department.id, departmentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      data: updated,
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
