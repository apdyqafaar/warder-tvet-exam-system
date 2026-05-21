import { api } from "@/lib/api/client";

export interface AdminDashboardCounts {
  departments: number;
  teachers: number;
  students: number;
  exams: number;
}

export interface BestDepartment {
  departmentId: string;
  departmentName: string;
  avgScore: number;
  studentCount: number;
  examCount: number;
}

export interface LatestExam {
  id: string;
  title: string;
  status: "draft" | "published" | "closed";
  totalQuestions: number;
  duration: number;
  createdAt: string;
  departmentName: string;
  teacherName: string;
}

export interface DepartmentBreakdown {
  id: string;
  name: string;
  studentCount: number;
  examCount: number;
}

export interface ExamStatusSummary {
  draft: number;
  published: number;
  closed: number;
}

export interface AdminDashboardData {
  counts: AdminDashboardCounts;
  bestDepartment: BestDepartment | null;
  latestExams: LatestExam[];
  departmentBreakdown: DepartmentBreakdown[];
  examStatusSummary: ExamStatusSummary;
}

export const getAdminDashboard = async () => {
  return api.get<AdminDashboardData>("admin/dashboard");
};
