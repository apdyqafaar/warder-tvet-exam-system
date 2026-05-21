import { api } from "@/lib/api/client";

export interface StudentListItem {
  id: string;
  fullName: string;
  studentNumber: string;
  departmentId: string;
  departmentName: string | null;
  createdAt: string;
}

export interface DepartmentListItem {
  id: string;
  name: string;
}

export interface StudentsResponse {
  students: StudentListItem[];
  departments: DepartmentListItem[];
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

export const getAdminStudents = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.departmentId) searchParams.set("departmentId", params.departmentId);

  return api.get<StudentsResponse>(`admin/students?${searchParams.toString()}`);
};

export const createAdminStudent = async (data: CreateStudentInput) => {
  return api.post<any>("admin/students", data);
};

export const updateAdminStudent = async (id: string, data: CreateStudentInput) => {
  return api.patch<any>(`admin/students/${id}`, data);
};

export const deleteAdminStudent = async (id: string) => {
  return api.delete<any>(`admin/students/${id}`);
};
