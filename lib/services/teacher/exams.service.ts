import { api } from "@/lib/api/client";
import { IExam, IDepartment, IQuestion } from "@/lib/types/schema-types";

export interface ExamWithDepartment extends IExam {
  department: IDepartment;
}

export interface ExamDetail extends IExam {
  department: IDepartment;
  questions: IQuestion[];
}

export interface CreateQuestionInput {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

export interface TeacherExamsResponse {
  exams: ExamWithDepartment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TeacherDepartmentOption {
  id: string;
  name: string;
}

export const getTeacherExams = async (params: { page?: number; limit?: number; search?: string; status?: string, departmentId?: string }) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.departmentId) searchParams.set("departmentId", params.departmentId);

  return api.get<TeacherExamsResponse>(`teacher/exams?${searchParams.toString()}`);
};

export interface CreateExamInput {
  title: string;
  description?: string;
  duration: number;
  departmentId: string;
}

export const createExam = async (data: CreateExamInput) => {
  return api.post<IExam>("teacher/exams", data);
};

export const getTeacherExam = async (examId: string) => {
  return api.get<ExamDetail>(`teacher/exams/${examId}`);
};

export const updateTeacherExam = async (
  examId: string,
  data: Partial<CreateExamInput & { status: string }>
) => {
  return api.patch<IExam>(`teacher/exams/${examId}`, data);
};

export const createQuestion = async (examId: string, data: CreateQuestionInput) => {
  return api.post<IQuestion>(`teacher/exams/${examId}/questions`, data);
};

export const deleteQuestion = async (examId: string, questionId: string) => {
  return api.delete<{ success: boolean }>(`teacher/exams/${examId}/questions/${questionId}`);
};
 
export const updateQuestion = async (examId: string, questionId: string, data: CreateQuestionInput) => {
  return api.patch<{ success: boolean }>(`teacher/exams/${examId}/questions/${questionId}`, data);
};

