import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index,integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email")
    .notNull()
    .unique(),

  password: text("password"),

  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),

  image: text("image"),

  role: text("role")
    .$type<"admin" | "teacher">()
    .default("teacher")
    .notNull(),

  banned: boolean("banned")
    .default(false)
    .notNull(),

  banReason: text("ban_reason"),

  banExpires: timestamp("ban_expires"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at").notNull(),

    token: text("token").notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),

    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    accessToken: text("access_token"),

    refreshToken: text("refresh_token"),

    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp("access_token_expires_at"),

    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

    scope: text("scope"),

    password: text("password"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),

    value: text("value").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));



/* ======================================================
   DEPARTMENT
====================================================== */

export const department = pgTable("department", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
imageUrl:text("image"),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const departmentRelations = relations(department, ({ many }) => ({
  students: many(student),
  exams: many(exam),
}));

/* ======================================================
   STUDENT
====================================================== */

export const student = pgTable(
  "student",
  {
    id: text("id").primaryKey(),

    fullName: text("full_name").notNull(),

    studentNumber: text("student_number").notNull().unique(),

    departmentId: text("department_id")
      .notNull()
      .references(() => department.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("student_department_idx").on(table.departmentId)],
);

export const studentRelations = relations(student, ({ one, many }) => ({
  department: one(department, {
    fields: [student.departmentId],
    references: [department.id],
  }),

  studentExams: many(studentExam),
}));

/* ======================================================
   EXAM
====================================================== */

export const exam = pgTable(
  "exam",
  {
      id: text("id").primaryKey(),

    title: text("title").notNull(),

    description: text("description"),

    duration: integer("duration").notNull(),

    totalQuestions: integer("total_questions").default(0).notNull(),

    status: text("status")
      .$type<"draft" | "published" | "closed">()
      .default("draft")
      .notNull(),

    departmentId: text("department_id")
      .notNull()
      .references(() => department.id, {
        onDelete: "cascade",
      }),

    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("exam_department_idx").on(table.departmentId),

    index("exam_teacher_idx").on(table.teacherId),
  ],
);

export const examRelations = relations(exam, ({ one, many }) => ({
  department: one(department, {
    fields: [exam.departmentId],
    references: [department.id],
  }),

  teacher: one(user, {
    fields: [exam.teacherId],
    references: [user.id],
  }),

  questions: many(question),

  studentExams: many(studentExam),
}));

/* ======================================================
   QUESTION
====================================================== */

export const question = pgTable(
  "question",
  {
    id: text("id").primaryKey(),

    examId: text("exam_id")
      .notNull()
      .references(() => exam.id, {
        onDelete: "cascade",
      }),

    question: text("question").notNull(),

    optionA: text("option_a").notNull(),

    optionB: text("option_b").notNull(),

    optionC: text("option_c").notNull(),

    optionD: text("option_d"),

    correctAnswer: text("correct_answer")
      .$type<"A" | "B" | "C" | "D">()
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("question_exam_idx").on(table.examId)],
);

export const questionRelations = relations(question, ({ one, many }) => ({
  exam: one(exam, {
    fields: [question.examId],
    references: [exam.id],
  }),

  answers: many(studentAnswer),
}));

/* ======================================================
   STUDENT EXAM
====================================================== */

export const studentExam = pgTable(
  "student_exam",
  {
    id: text("id").primaryKey(),

    studentId: text("student_id")
      .notNull()
      .references(() => student.id, {
        onDelete: "cascade",
      }),

    examId: text("exam_id")
      .notNull()
      .references(() => exam.id, {
        onDelete: "cascade",
      }),

    score: integer("score"),

    isCompleted: boolean("is_completed").default(false).notNull(),

    status: text("status")
      .$type<"passed" | "failed" | "pending">()
      .default("pending")
      .notNull(),

    startedAt: timestamp("started_at"),

    submittedAt: timestamp("submitted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("student_exam_student_idx").on(table.studentId),

    index("student_exam_exam_idx").on(table.examId),
  ],
);

export const studentExamRelations = relations(studentExam, ({ one, many }) => ({
  student: one(student, {
    fields: [studentExam.studentId],
    references: [student.id],
  }),

  exam: one(exam, {
    fields: [studentExam.examId],
    references: [exam.id],
  }),

  answers: many(studentAnswer),
}));

/* ======================================================
   STUDENT ANSWER
====================================================== */

export const studentAnswer = pgTable(
  "student_answer",
  {
    id: text("id").primaryKey(),

    studentExamId: text("student_exam_id")
      .notNull()
      .references(() => studentExam.id, {
        onDelete: "cascade",
      }),

    questionId: text("question_id")
      .notNull()
      .references(() => question.id, {
        onDelete: "cascade",
      }),

    selectedAnswer: text("selected_answer").$type<"A" | "B" | "C" | "D">(),

    isCorrect: boolean("is_correct"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("student_answer_exam_idx").on(table.studentExamId),

    index("student_answer_question_idx").on(table.questionId),
  ],
);

export const studentAnswerRelations = relations(studentAnswer, ({ one }) => ({
  studentExam: one(studentExam, {
    fields: [studentAnswer.studentExamId],
    references: [studentExam.id],
  }),

  question: one(question, {
    fields: [studentAnswer.questionId],
    references: [question.id],
  }),
}));


export const  schema={user,session,account,verification,department,student,exam,question,studentExam,studentAnswer}