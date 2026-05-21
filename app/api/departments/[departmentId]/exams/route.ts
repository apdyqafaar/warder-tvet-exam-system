import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exam } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const { departmentId } = await params;

    const data = await db.query.exam.findMany({
      where: and(
        eq(exam.departmentId, departmentId),
        eq(exam.status, "published")
      ),
      orderBy: (exams, { desc }) => [desc(exams.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching published exams:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching exams" },
      { status: 500 }
    );
  }
}
