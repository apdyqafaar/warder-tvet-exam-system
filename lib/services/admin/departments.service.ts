import { api } from "@/lib/api/client";

export type AdminDepartmentStatus = "active" | "draft" | "new";

export interface AdminDepartmentRecord {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  teacherId: string;
  createdAt: string;
}

export interface AdminDepartmentTeacherOption {
  id: string;
  name: string;
  email: string;
  image: string | null;
  departmentCount: number;
  departmentNames: string[];
}

export interface AdminDepartmentListItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  teacherId: string;
  teacherName: string | null;
  teacherEmail: string | null;
  teacherImage: string | null;
  studentCount: number;
  examCount: number;
  publishedExamCount: number;
  status: AdminDepartmentStatus;
}

export interface AdminDepartmentsResponse {
  departments: AdminDepartmentListItem[];
  teachers: AdminDepartmentTeacherOption[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateAdminDepartmentInput {
  name: string;
  description?: string;
  imageUrl?: string;
  teacherId: string;
}

export const getAdminDepartments = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminDepartmentStatus;
}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  return api.get<AdminDepartmentsResponse>(
    `admin/departments?${searchParams.toString()}`,
  );
};

export const createAdminDepartment = async (
  data: CreateAdminDepartmentInput,
) => {
  return api.post<AdminDepartmentRecord>("admin/departments", data);
};

export const updateAdminDepartment = async (
  id: string,
  data: CreateAdminDepartmentInput,
) => {
  return api.patch<AdminDepartmentRecord>(`admin/departments/${id}`, data);
};

export const deleteAdminDepartment = async (id: string) => {
  return api.delete<void>(`admin/departments/${id}`);
};
