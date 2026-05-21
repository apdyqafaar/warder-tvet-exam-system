import { api } from "@/lib/api/client";

export interface TeacherListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  departmentIds: string[];
  departmentNames: string[];
  departmentCount: number;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  teacherId: string;
}

export interface TeachersResponse {
  teachers: TeacherListItem[];
  departments: DepartmentSummary[];
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  password?: string;
  departmentId?: string;
}

export interface TeacherMutationResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const getAdminTeachers = async () => {
  return api.get<TeachersResponse>("admin/teachers");
};

export const createAdminTeacher = async (data: CreateTeacherInput) => {
  return api.post<TeacherMutationResponse>("admin/teachers", data);
};

export const updateAdminTeacher = async (
  id: string,
  data: CreateTeacherInput,
) => {
  return api.patch<void>(`admin/teachers/${id}`, data);
};

export const deleteAdminTeacher = async (id: string) => {
  return api.delete<void>(`admin/teachers/${id}`);
};
