import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTeachers,
  createAdminTeacher,
  updateAdminTeacher,
  deleteAdminTeacher,
  CreateTeacherInput,
} from "../services/admin/teachers.service";

export const useAdminTeachers = () => {
  return useQuery({
    queryKey: ["admin-teachers"],
    queryFn: () => getAdminTeachers(),
  });
};

export const useCreateAdminTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherInput) => createAdminTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-teachers"]);
    },
  });
};

export const useUpdateAdminTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTeacherInput }) =>
      updateAdminTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-teachers"]);
    },
  });
};

export const useDeleteAdminTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-teachers"]);
    },
  });
};
