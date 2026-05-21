CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"department_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"question" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text,
	"correct_answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"student_number" text NOT NULL,
	"department_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_student_number_unique" UNIQUE("student_number")
);
--> statement-breakpoint
CREATE TABLE "student_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"student_exam_id" text NOT NULL,
	"question_id" text NOT NULL,
	"selected_answer" text,
	"is_correct" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_exam" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"score" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'teacher' NOT NULL;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_student_exam_id_student_exam_id_fk" FOREIGN KEY ("student_exam_id") REFERENCES "public"."student_exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam" ADD CONSTRAINT "student_exam_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam" ADD CONSTRAINT "student_exam_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exam_department_idx" ON "exam" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "exam_teacher_idx" ON "exam" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "question_exam_idx" ON "question" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "student_department_idx" ON "student" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "student_answer_exam_idx" ON "student_answer" USING btree ("student_exam_id");--> statement-breakpoint
CREATE INDEX "student_answer_question_idx" ON "student_answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "student_exam_student_idx" ON "student_exam" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_exam_exam_idx" ON "student_exam" USING btree ("exam_id");