import { schema } from "../db/schema";

export type IUser = typeof schema.user.$inferSelect;
export type IStudent = typeof schema.student.$inferSelect;
export type IDepartment = typeof schema.department.$inferSelect;
export type IExam = typeof schema.exam.$inferSelect;
export type IQuestion = typeof schema.question.$inferSelect;
export type IStudentAnswer = typeof schema.studentAnswer.$inferSelect;
export type IStudentExam = typeof schema.studentExam.$inferSelect;

