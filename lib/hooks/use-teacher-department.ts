import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTeacherDepartment,
  type UpdateDepartmentInput,
  updateTeacherDepartment,
} from "../services/teacher/department.service";

export const useTeacherDepartment = () => {
  return useQuery({
    queryKey: ["teacher-departments"],
    queryFn: () => getTeacherDepartment(),
  });
};

export const useUpdateTeacherDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDepartmentInput) => updateTeacherDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-departments"]);
    },
  });
};
