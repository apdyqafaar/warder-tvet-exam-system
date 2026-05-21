import { api } from "@/lib/api/client";
import { IExam, IQuestion, IStudentAnswer, IStudentExam } from "@/lib/types/schema-types";

export interface ExamQuestionsResponse {
  exam: IExam;
  questions: Omit<IQuestion, "correctAnswer">[];
  answers: IStudentAnswer[];
}

export interface SubmitAnswerResponse {
  isCompleted: boolean;
  score?: number;
  totalQuestions?: number;
  session?: IStudentExam;
  answersCount?: number;
}

export const getOrCreateExamSession = async (studentId: string, examId: string) => {
  return api.post<IStudentExam>("student/exam-session", {
    studentId,
    examId,
  });
};

export const getExamQuestions = async (examId: string, studentExamId: string) => {
  return api.get<ExamQuestionsResponse>(
    `student/exams/${examId}/questions?studentExamId=${studentExamId}`
  );
};

export const submitAnswer = async (
  studentExamId: string,
  questionId: string,
  selectedAnswer: "A" | "B" | "C" | "D"
) => {
  return api.post<SubmitAnswerResponse>("student/answers", {
    studentExamId,
    questionId,
    selectedAnswer,
  });
};

export const finishExam = async (studentExamId: string) => {
  return api.post<SubmitAnswerResponse>("student/answers", {
    studentExamId,
    finishExam: true,
  });
};
