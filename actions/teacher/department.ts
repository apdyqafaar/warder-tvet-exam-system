"use server"

import { db } from "@/lib/db";
import { department } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getTeacherDepartmentAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      throw new Error("Unauthorized");
    }

    const teacherDept = await db.query.department.findFirst({
      where: eq(department.teacherId, session.user.id)
    });

    return { success: true, data: teacherDept };
  } catch (error: any) {
    console.error("Failed to get teacher department:", error);
    return { success: false, error: error.message };
  }
}

export type UpdateDepartmentData = {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export async function updateTeacherDepartmentAction(data: UpdateDepartmentData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      throw new Error("Unauthorized");
    }

    const existingDept = await db.query.department.findFirst({
      where: eq(department.teacherId, session.user.id)
    });

    if (!existingDept) {
      throw new Error("You do not have a department assigned to you.");
    }

    const updated = await db.update(department)
      .set(data)
      .where(eq(department.id, existingDept.id))
      .returning();

    revalidatePath("/dashboard/teacher/departments");
    return { success: true, data: updated[0] };
  } catch (error: any) {
    console.error("Failed to update department:", error);
    return { success: false, error: error.message };
  }
}
