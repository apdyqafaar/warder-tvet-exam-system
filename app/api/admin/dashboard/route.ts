import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  department,
  student,
  exam,
  studentExam,
  user,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // --- Total counts ---
    const [departmentCount] = await db
      .select({ total: sql<number>`cast(count(${department.id}) as int)` })
      .from(department);

    const [teacherCount] = await db
      .select({ total: sql<number>`cast(count(${user.id}) as int)` })
      .from(user)
      .where(eq(user.role, "teacher"));

    const [studentCount] = await db
      .select({ total: sql<number>`cast(count(${student.id}) as int)` })
      .from(student);

    const [examCount] = await db
      .select({ total: sql<number>`cast(count(${exam.id}) as int)` })
      .from(exam);

    // --- Best department by average exam score ---
    const bestDepartmentResult = await db
      .select({
        departmentId: department.id,
        departmentName: department.name,
        avgScore: sql<number>`cast(coalesce(avg(${studentExam.score}), 0) as decimal(10,2))`,
        examCount: sql<number>`cast(count(distinct ${exam.id}) as int)`,
      })
      .from(department)
      .leftJoin(exam, eq(exam.departmentId, department.id))
      .leftJoin(studentExam, eq(studentExam.examId, exam.id))
      .groupBy(department.id, department.name)
      .orderBy(sql`avg(${studentExam.score}) desc nulls last`)
      .limit(1);

    let bestDepartment = null;
    if (bestDepartmentResult[0]) {
      const [sCount] = await db
        .select({ total: sql<number>`cast(count(${student.id}) as int)` })
        .from(student)
        .where(eq(student.departmentId, bestDepartmentResult[0].departmentId));

      bestDepartment = {
        departmentId: bestDepartmentResult[0].departmentId,
        departmentName: bestDepartmentResult[0].departmentName,
        avgScore: Number(bestDepartmentResult[0].avgScore),
        examCount: bestDepartmentResult[0].examCount,
        studentCount: sCount?.total || 0,
      };
    }

    // --- Latest 5 exams with department and teacher info ---
    const latestExams = await db
      .select({
        id: exam.id,
        title: exam.title,
        status: exam.status,
        totalQuestions: exam.totalQuestions,
        duration: exam.duration,
        createdAt: exam.createdAt,
        departmentName: department.name,
        teacherName: user.name,
      })
      .from(exam)
      .leftJoin(department, eq(exam.departmentId, department.id))
      .leftJoin(user, eq(exam.teacherId, user.id))
      .orderBy(desc(exam.createdAt))
      .limit(5);

    // --- Department breakdown: each dept with student + exam counts ---
    const departmentBreakdown = await db
      .select({
        id: department.id,
        name: department.name,
        studentCount: sql<number>`cast(count(distinct ${student.id}) as int)`,
        examCount: sql<number>`cast(count(distinct ${exam.id}) as int)`,
      })
      .from(department)
      .leftJoin(student, eq(student.departmentId, department.id))
      .leftJoin(exam, eq(exam.departmentId, department.id))
      .groupBy(department.id, department.name)
      .orderBy(department.name);

    // --- Exam status summary ---
    const examStatusResult = await db
      .select({
        status: exam.status,
        count: sql<number>`cast(count(${exam.id}) as int)`,
      })
      .from(exam)
      .groupBy(exam.status);

    const examStatusSummary = {
      draft: 0,
      published: 0,
      closed: 0,
    };

    for (const row of examStatusResult) {
      if (row.status === "draft") examStatusSummary.draft = row.count;
      if (row.status === "published") examStatusSummary.published = row.count;
      if (row.status === "closed") examStatusSummary.closed = row.count;
    }

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          departments: departmentCount.total,
          teachers: teacherCount.total,
          students: studentCount.total,
          exams: examCount.total,
        },
        bestDepartment,
        latestExams,
        departmentBreakdown,
        examStatusSummary,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error fetching admin dashboard",
      },
      { status: 500 }
    );
  }
}
