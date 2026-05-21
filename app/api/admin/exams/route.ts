import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam, department, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
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

    const examsList = await db
      .select({
        id: exam.id,
        title: exam.title,
        status: exam.status,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        createdAt: exam.createdAt,
        departmentName: department.name,
        teacherName: user.name,
      })
      .from(exam)
      .leftJoin(department, eq(exam.departmentId, department.id))
      .leftJoin(user, eq(exam.teacherId, user.id))
      .orderBy(desc(exam.createdAt));

    return NextResponse.json({
      success: true,
      data: examsList,
    });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching exams" },
      { status: 500 }
    );
  }
}
