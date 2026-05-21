import { api } from "@/lib/api/client";
import { IDepartment, IStudent, IExam } from "@/lib/types/schema-types";

export const getDepartments = async () => {
  return api.get<IDepartment[]>("departments");
};

export const verifyStudent = async (
  departmentId: string,
  fullName: string,
  studentNumber: string
) => {
  return api.post<IStudent>(`departments/${departmentId}/verify`, {
    fullName,
    studentNumber,
  });
};

export const getPublishedExams = async (departmentId: string) => {
  return api.get<IExam[]>(`departments/${departmentId}/exams`);
};
