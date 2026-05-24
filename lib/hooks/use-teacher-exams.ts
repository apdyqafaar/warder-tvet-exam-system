import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeacherExams,
  createExam,
  CreateExamInput,
  getTeacherExam,
  updateTeacherExam,
  createQuestion,
  deleteQuestion,
  CreateQuestionInput,
  updateQuestion,
  bulkCreateQuestions,
  getTeacherExamResults,
  importQuestionsFile,
} from "../services/teacher/exams.service";

interface UseTeacherExamsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
}

export const useTeacherExams = (
  params: UseTeacherExamsParams
) => {
  return useQuery({
    queryKey: [
      "teacher-exams",
      params.page,
      params.limit,
      params.search,
      params.status,
      params.departmentId,
    ],

    queryFn: () =>
      getTeacherExams(params),

    keepPreviousData: true,

    enabled: !!params.departmentId,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) => createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exams"]);
    },
  });
};

export const useTeacherExam = (examId: string) => {
  return useQuery({
    queryKey: ["teacher-exam", examId],
    queryFn: () => getTeacherExam(examId),
    enabled: !!examId,
  });
};

export const useUpdateTeacherExam = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateExamInput & { status: string }>) =>
      updateTeacherExam(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exam", examId]);
      queryClient.invalidateQueries(["teacher-exams"]);
    },
  });
};

export const useCreateQuestion = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionInput) => createQuestion(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exam", examId]);
    },
  });
};

export const useDeleteQuestion = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(examId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exam", examId]);
    },
  });
};
export const useUpdateQuestion = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data,questionId}:{data: CreateQuestionInput,questionId: string}) => updateQuestion(examId, questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exam", examId]);
    },
  });
};

export const useImportQuestionsFile = (examId: string) => {
  return useMutation({
    mutationFn: (formData: FormData) => importQuestionsFile(examId, formData),
  });
};

export const useBulkCreateQuestions = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questions: CreateQuestionInput[]) => bulkCreateQuestions(examId, questions),
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exam", examId]);
    },
  });
};

export const useTeacherExamResults = (examId: string) => {
  return useQuery({
    queryKey: ["teacher-exam-results", examId],
    queryFn: () => getTeacherExamResults(examId),
    enabled: !!examId,
  });
};