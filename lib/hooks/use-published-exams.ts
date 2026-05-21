import { useQuery } from "@tanstack/react-query";
import { getPublishedExams } from "../services/student/department.service";

export const usePublishedExams = (departmentId: string) => {
  return useQuery({
    queryKey: ["published-exams", departmentId],
    queryFn: () => getPublishedExams(departmentId),
    enabled: !!departmentId,
  });
};
