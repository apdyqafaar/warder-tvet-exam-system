import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentExam, studentAnswer, question } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentExamId, questionId, selectedAnswer, finishExam } = body;

    if (!studentExamId) {
      return NextResponse.json(
        { success: false, message: "Missing required field: studentExamId" },
        { status: 400 }
      );
    }

    // 1. Fetch the student exam session
    const session = await db.query.studentExam.findFirst({
      where: eq(studentExam.id, studentExamId),
      with: {
        exam: true,
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, message: "Student exam session not found" }, { status: 404 });
    }

    if (session.isCompleted) {
      return NextResponse.json(
        { success: false, message: "This exam has already been completed and submitted." },
        { status: 400 }
      );
    }

    // Support force submission (finish exam early)
    if (finishExam) {
      // Fetch all questions for this exam
      const allQuestions = await db.query.question.findMany({
        where: eq(question.examId, session.examId),
      });
      const totalQuestions = allQuestions.length;

      // Fetch all submitted answers for this student exam
      const submittedAnswers = await db.query.studentAnswer.findMany({
        where: eq(studentAnswer.studentExamId, studentExamId),
      });

      const correctAnswersCount = submittedAnswers.filter((a) => a.isCorrect).length;

      const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
      const status = percentage >= 55 ? "passed" : "failed";

      // Update studentExam status and score
      const [updatedSession] = await db
        .update(studentExam)
        .set({
          score: correctAnswersCount,
          isCompleted: true,
          status: status,
          submittedAt: new Date(),
        })
        .where(eq(studentExam.id, studentExamId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Exam submitted and scored successfully!",
        data: {
          isCompleted: true,
          score: correctAnswersCount,
          totalQuestions,
          session: updatedSession,
        },
      });
    }

    if (!questionId || !selectedAnswer) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: questionId, selectedAnswer" },
        { status: 400 }
      );
    }

    // 2. Fetch the question to verify correctness
    const qRecord = await db.query.question.findFirst({
      where: eq(question.id, questionId),
    });

    if (!qRecord) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 });
    }

    const isCorrect = selectedAnswer === qRecord.correctAnswer;

    // 3. Save or update the student answer
    const existingAnswer = await db.query.studentAnswer.findFirst({
      where: and(
        eq(studentAnswer.studentExamId, studentExamId),
        eq(studentAnswer.questionId, questionId)
      ),
    });

    if (existingAnswer) {
      await db
        .update(studentAnswer)
        .set({
          selectedAnswer,
          isCorrect,
        })
        .where(eq(studentAnswer.id, existingAnswer.id));
    } else {
      await db.insert(studentAnswer).values({
        id: nanoid(),
        studentExamId,
        questionId,
        selectedAnswer,
        isCorrect,
      });
    }

    // 4. Calculate if the exam is complete
    // Fetch all questions for this exam
    const allQuestions = await db.query.question.findMany({
      where: eq(question.examId, session.examId),
    });

    const totalQuestions = allQuestions.length;

    // Fetch all submitted answers for this student exam
    const submittedAnswers = await db.query.studentAnswer.findMany({
      where: eq(studentAnswer.studentExamId, studentExamId),
    });

    const answersCount = submittedAnswers.length;

    // "result must be calculated if questions student answered are bigger or equal exam questions"
    if (answersCount >= totalQuestions && totalQuestions > 0) {
      // Calculate results
      const correctAnswersCount = submittedAnswers.filter((a) => a.isCorrect).length;

      const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
      const status = percentage >= 55 ? "passed" : "failed";

      // Update studentExam status and score
      const [updatedSession] = await db
        .update(studentExam)
        .set({
          score: correctAnswersCount,
          isCompleted: true,
          status: status,
          submittedAt: new Date(),
        })
        .where(eq(studentExam.id, studentExamId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Exam completed and submitted!",
        data: {
          isCompleted: true,
          score: correctAnswersCount,
          totalQuestions,
          session: updatedSession,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved successfully",
      data: {
        isCompleted: false,
        answersCount,
        totalQuestions,
      },
    });
  } catch (error: any) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error submitting answer" },
      { status: 500 }
    );
  }
}
