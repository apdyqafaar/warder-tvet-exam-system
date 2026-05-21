import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { student } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const { departmentId } = await params;
    const body = await req.json();
    const { fullName, studentNumber } = body;

    if (!fullName || !studentNumber) {
      return NextResponse.json(
        { success: false, message: "Full Name and Student Number are required" },
        { status: 400 }
      );
    }

    // Search for student in this department with case-insensitive check
    const foundStudent = await db.query.student.findFirst({
      where: and(
        eq(student.departmentId, departmentId),
        sql`LOWER(${student.fullName}) = LOWER(${fullName.trim()})`
      ),
    });

    if (!foundStudent) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid credentials. Please check your name and student number" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student verified successfully",
      data: foundStudent,
    });
  } catch (error: any) {
    console.error("Error verifying student:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error verifying student" },
      { status: 500 }
    );
  }
}
