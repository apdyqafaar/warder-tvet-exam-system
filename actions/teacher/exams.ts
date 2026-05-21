"use server"

import { db } from "@/lib/db";
import { exam } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export type CreateExamData = {
  title: string;
  description?: string;
  duration: number;
  departmentId: string;
};

export type UpdateExamData = {
  title?: string;
  description?: string;
  duration?: number;
  status?: "draft" | "published" | "closed";
};

export async function createExamAction(data: CreateExamData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      throw new Error("Unauthorized");
    }

    const newExam = await db.insert(exam).values({
      id: nanoid(),
      ...data,
      teacherId: session.user.id,
      status: "draft",
    }).returning();

    revalidatePath("/dashboard/teacher/exams");
    return { success: true, data: newExam[0] };
  } catch (error: any) {
    console.error("Failed to create exam:", error);
    return { success: false, error: error.message };
  }
}

export async function updateExamAction(examId: string, data: UpdateExamData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      throw new Error("Unauthorized");
    }

    const existingExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, examId), eq(exam.teacherId, session.user.id))
    });

    if (!existingExam) {
      throw new Error("Exam not found or you don't have permission to edit it");
    }

    const updatedExam = await db.update(exam)
      .set(data)
      .where(eq(exam.id, examId))
      .returning();

    revalidatePath("/dashboard/teacher/exams");
    return { success: true, data: updatedExam[0] };
  } catch (error: any) {
    console.error("Failed to update exam:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExamAction(examId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "teacher") {
      throw new Error("Unauthorized");
    }

    const existingExam = await db.query.exam.findFirst({
      where: and(eq(exam.id, examId), eq(exam.teacherId, session.user.id))
    });

    if (!existingExam) {
      throw new Error("Exam not found or you don't have permission to delete it");
    }

    await db.delete(exam).where(eq(exam.id, examId));

    revalidatePath("/dashboard/teacher/exams");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete exam:", error);
    return { success: false, error: error.message };
  }
}
