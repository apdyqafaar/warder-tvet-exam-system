import { api } from "@/lib/api/client";
import type { IExam, IStudent, IStudentExam } from "@/lib/types/schema-types";

export interface StudentWithStats extends IStudent {
  totalExams: number;
  completedExams: number;
  averageScore: number | null;
}

export type TeacherStudentStatus =
  | "all"
  | "has-exams"
  | "completed"
  | "top-performer"
  | "needs-attention";

export interface StudentExamDetail extends IStudentExam {
  exam: IExam;
}

export interface StudentDetail extends IStudent {
  studentExams: StudentExamDetail[];
}

export interface TeacherStudentsResponse {
  students: StudentWithStats[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStudentInput {
  fullName: string;
  studentNumber: string;
  departmentId: string;
}

export const getTeacherStudents = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  departmentId?: string;
  status?: TeacherStudentStatus;
  minScore?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.departmentId)
    searchParams.set("departmentId", params.departmentId);
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.minScore !== undefined)
    searchParams.set("minScore", params.minScore.toString());

  return api.get<TeacherStudentsResponse>(
    `teacher/students?${searchParams.toString()}`,
  );
};

export const getTeacherStudent = async (studentId: string) => {
  return api.get<StudentDetail>(`teacher/students/${studentId}`);
};

export const createStudent = async (data: CreateStudentInput) => {
  return api.post<IStudent>("teacher/students", data);
};

export const deleteStudent = async (studentId: string) => {
  return api.delete<{ success: boolean }>(`teacher/students/${studentId}`);
};
