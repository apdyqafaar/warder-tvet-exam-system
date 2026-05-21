import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStudents,
  createAdminStudent,
  updateAdminStudent,
  deleteAdminStudent,
  CreateStudentInput,
} from "../services/admin/students.service";

interface UseAdminStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}

export const useAdminStudents = (params: UseAdminStudentsParams) => {
  return useQuery({
    queryKey: [
      "admin-students",
      params.page,
      params.limit,
      params.search,
      params.departmentId,
    ],
    queryFn: () => getAdminStudents(params),
    keepPreviousData: true,
  });
};

export const useCreateAdminStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentInput) => createAdminStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-students"]);
    },
  });
};

export const useUpdateAdminStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateStudentInput }) =>
      updateAdminStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-students"]);
    },
  });
};

export const useDeleteAdminStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-students"]);
    },
  });
};
