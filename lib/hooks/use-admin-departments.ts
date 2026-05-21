import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateAdminDepartmentInput,
  createAdminDepartment,
  deleteAdminDepartment,
  getAdminDepartments,
  updateAdminDepartment,
} from "../services/admin/departments.service";

interface UseAdminDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "draft" | "new";
}

export const useAdminDepartments = (params: UseAdminDepartmentsParams) => {
  return useQuery({
    queryKey: [
      "admin-departments",
      params.page,
      params.limit,
      params.search,
      params.status,
    ],
    queryFn: () => getAdminDepartments(params),
    keepPreviousData: true,
  });
};

export const useCreateAdminDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminDepartmentInput) =>
      createAdminDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
};

export const useUpdateAdminDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateAdminDepartmentInput;
    }) => updateAdminDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
};

export const useDeleteAdminDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
};
