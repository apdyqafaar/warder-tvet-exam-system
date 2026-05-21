import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminExams,
  deleteAdminExam,
  updateAdminExamStatus,
} from "../services/admin/exams.service";

export const useAdminExams = () => {
  return useQuery({
    queryKey: ["admin-exams"],
    queryFn: () => getAdminExams(),
  });
};

export const useDeleteAdminExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-exams"]);
    },
  });
};

export const useUpdateAdminExamStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" | "closed" }) =>
      updateAdminExamStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-exams"]);
    },
  });
};
