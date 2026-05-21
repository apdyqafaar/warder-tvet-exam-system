import { api } from "@/lib/api/client";

export interface ExamListItem {
  id: string;
  title: string;
  status: "draft" | "published" | "closed";
  duration: number;
  totalQuestions: number;
  createdAt: string;
  departmentName: string | null;
  teacherName: string | null;
}

export const getAdminExams = async () => {
  return api.get<ExamListItem[]>("admin/exams");
};

export const deleteAdminExam = async (id: string) => {
  return api.delete<any>(`admin/exams/${id}`);
};

export const updateAdminExamStatus = async (id: string, status: "draft" | "published" | "closed") => {
  return api.patch<any>(`admin/exams/${id}`, { status });
};
