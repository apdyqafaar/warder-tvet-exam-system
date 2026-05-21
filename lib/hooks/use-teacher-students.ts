import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateStudentInput,
  createStudent,
  deleteStudent,
  getTeacherStudent,
  getTeacherStudents,
  type TeacherStudentStatus,
} from "../services/teacher/student.service";

interface UseTeacherStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  departmentId?: string;
  status?: TeacherStudentStatus;
  minScore?: number;
  refetchIntervalMs?: number;
}

export const useTeacherStudents = (params: UseTeacherStudentsParams) => {
  return useQuery({
    queryKey: [
      "teacher-students",
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
      params.departmentId,
      params.status,
      params.minScore,
    ],
    queryFn: () => getTeacherStudents(params),
    keepPreviousData: true,
    enabled: !!params.departmentId,
    refetchInterval: params.refetchIntervalMs,
  });
};

export const useTeacherStudent = (studentId: string) => {
  return useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => getTeacherStudent(studentId),
    enabled: !!studentId,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentInput) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-departments"] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-departments"] });
    },
  });
};
