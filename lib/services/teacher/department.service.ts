import { api } from "@/lib/api/client";
import type { IDepartment } from "@/lib/types/schema-types";

export interface DepartmentStats {
  totalStudents: number;
  totalExams: number;
  examScoresByMonth: {
    month: string;
    avgScore: number;
    completedCount: number;
  }[];
  topStudents: {
    id: string;
    fullName: string;
    studentNumber: string;
    averageScore: number;
    completedExams: number;
  }[];
}

export interface DepartmentWithStats extends IDepartment {
  stats: DepartmentStats;
}

export interface TeacherDepartmentsResponse {
  departments: DepartmentWithStats[];
}

export interface UpdateDepartmentInput {
  departmentId: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export const getTeacherDepartment = async () => {
  return api.get<TeacherDepartmentsResponse>("teacher/department");
};

export const updateTeacherDepartment = async (data: UpdateDepartmentInput) => {
  return api.patch<IDepartment>("teacher/department", data);
};
