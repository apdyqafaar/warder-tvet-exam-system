"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOrCreateExamSession,
  getExamQuestions,
  submitAnswer,
  finishExam,
  ExamQuestionsResponse,
} from "@/lib/services/student/exam.service";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Check,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Flag,
  Trophy,
  GraduationCap,
  Info,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { IStudent, IStudentExam } from "@/lib/types/schema-types";
import { nanoid } from "nanoid";
import { Label } from "@/components/ui/label";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;
  const examId = params.examId as string;

  // Authentication & Verification state
  const [student, setStudent] = useState<IStudent | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Exam session & loading state
  const [examSession, setExamSession] = useState<IStudentExam | null>(null);
  const [examData, setExamData] = useState<ExamQuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active question navigation
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<
    Record<string, boolean>
  >({});

  // Timer & Auto-submit state
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingNext, setIsSavingNext] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timerRef = useRef<any>(null);

  // 1. Verify Student Authentication
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wardheer_student_session");
      if (stored) {
        const studentInfo = JSON.parse(stored) as IStudent;
        if (studentInfo.departmentId === departmentId) {
          setStudent(studentInfo);
        } else {
          toast.error("Department mismatch. Please verify again.");
          router.replace(`/exam/onboard-examinees/${departmentId}`);
        }
      } else {
        toast.error("Please verify your credentials to take the exam.");
        router.replace(`/exam/onboard-examinees/${departmentId}`);
      }
    } catch (e) {
      console.error(e);
      router.replace(`/exam/onboard-examinees/${departmentId}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [departmentId, router]);

  // 2. Initialize Exam Session & Questions
  useEffect(() => {
    if (!student || !examId) return;

    const startSession = async () => {
      try {
        // A. Start or fetch the student exam session
        const session = await getOrCreateExamSession(student.id, examId);
        setExamSession(session);

        // B. Fetch the exam questions and submitted answers
        const questionsPayload = await getExamQuestions(examId, session.id);
        setExamData(questionsPayload);

        // C. Pre-populate flags from local storage if they refreshed
        const savedFlags = localStorage.getItem(`flags_${session.id}`);
        if (savedFlags) {
          setFlaggedQuestions(JSON.parse(savedFlags));
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to initialize exam workspace.");
        router.replace(`/exam/onboard-examinees/${departmentId}`);
      }
    };

    startSession();
  }, [student, examId, departmentId, router]);

  // 3. Precision Dynamic Countdown Timer
  useEffect(() => {
    if (!examSession || !examData || examSession.isCompleted) return;

    const startedTime = new Date(examSession.startedAt!).getTime();
    const durationMs = examData.exam.duration * 60 * 1000;
    const targetEndTime = startedTime + durationMs;

    const tick = () => {
      const now = new Date().getTime();
      const left = Math.max(0, Math.floor((targetEndTime - now) / 1000));
      setSecondsLeft(left);

      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeExpiration();
      }
    };

    // Run first tick immediately
    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examSession, examData]);

  // 4. Choose Answer Locally (updates React UI state only)
  const handleChooseAnswerLocal = (
    questionId: string,
    answerLetter: "A" | "B" | "C" | "D",
  ) => {
    if (!examSession || examSession.isCompleted) return;

    // Optimistic Local UI State update
    setExamData((prev) => {
      if (!prev) return null;
      const index = prev.answers.findIndex((a) => a.questionId === questionId);
      const newAnswers = [...prev.answers];
      if (index > -1) {
        newAnswers[index] = {
          ...newAnswers[index],
          selectedAnswer: answerLetter,
        };
      } else {
        newAnswers.push({
          id: nanoid(),
          studentExamId: examSession.id,
          questionId,
          selectedAnswer: answerLetter,
          isCorrect: null,
          createdAt: new Date(),
        });
      }
      return { ...prev, answers: newAnswers };
    });
  };

  // 4b. Save current answer to database and go to next question
  const handleNextQuestion = async () => {
    if (!examSession || !currentQuestion || isSavingNext) return;

    const selectedLetter = getSelectedAnswer(currentQuestion.id);
    if (!selectedLetter) {
      toast.error("Please select an answer before proceeding.");
      return;
    }

    setIsSavingNext(true);
    try {
      // Submit current answer to database API
      const result = await submitAnswer(
        examSession.id,
        currentQuestion.id,
        selectedLetter,
      );

      if (result.isCompleted) {
        localStorage.removeItem("wardheer_student_session");
        setExamSession(result.session || null);
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success("Exam completed and submitted successfully.");
        return;
      }

      // Go to next question index
      setCurrentIdx((p) => Math.min(questions.length - 1, p + 1));
    } catch (err: any) {
      console.error(err);
      toast.error(
        "Failed to save answer. Please check your connection and try again.",
      );
    } finally {
      setIsSavingNext(false);
    }
  };

  // 4c. Save final answer to database and finish/complete the exam
  const handleCompleteExam = async () => {
    if (!examSession || !currentQuestion || isSubmitting) return;

    const selectedLetter = getSelectedAnswer(currentQuestion.id);
    if (!selectedLetter) {
      toast.error("Please select an answer before completing the exam.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to complete and submit your exam?")
    )
      return;

    setIsSubmitting(true);
    try {
      // Submit final answer to the database API
      await submitAnswer(examSession.id, currentQuestion.id, selectedLetter);

      // Finalize the exam session
      const response = await finishExam(examSession.id);
      if (response.isCompleted) {
        localStorage.removeItem("wardheer_student_session");
        setExamSession(response.session || null);
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success("Exam completed and submitted successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Toggle Flag for Review (Local State & Storage)
  const toggleFlag = (questionId: string) => {
    if (!examSession) return;
    setFlaggedQuestions((prev) => {
      const updated = { ...prev, [questionId]: !prev[questionId] };
      localStorage.setItem(`flags_${examSession.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // 6. Explicit Early Submit Confirmation
  const handleSubmitExam = async () => {
    if (!examSession || isSubmitting) return;

    const unansweredCount =
      (examData?.questions.length || 0) - (examData?.answers.length || 0);
    const confirmMessage =
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered questions remaining. Are you sure you want to finish and submit the exam?`
        : "Are you sure you want to complete and submit your exam?";

    if (!window.confirm(confirmMessage)) return;

    setIsSubmitting(true);
    try {
      const response = await finishExam(examSession.id);
      if (response.isCompleted) {
        localStorage.removeItem("wardheer_student_session");
        setExamSession(response.session || null);
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success("Exam submitted successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Handle Automatic Submission on Timeout
  const handleTimeExpiration = async () => {
    if (!examSession || autoSubmitted || examSession.isCompleted) return;

    setAutoSubmitted(true);
    setIsSubmitting(true);
    try {
      toast.warning(
        "Time has expired! Automatically saving and submitting your answers...",
        {
          duration: 8000,
        },
      );

      // If they have selected an answer for the current question, save it first
      if (currentQuestion) {
        const selectedLetter = getSelectedAnswer(currentQuestion.id);
        if (selectedLetter) {
          try {
            await submitAnswer(
              examSession.id,
              currentQuestion.id,
              selectedLetter,
            );
          } catch (e) {
            console.error("Failed to save final answer during timeout:", e);
          }
        }
      }

      const response = await finishExam(examSession.id);
      if (response.isCompleted) {
        localStorage.removeItem("wardheer_student_session");
        setExamSession(response.session || null);
      }
    } catch (err) {
      console.error("Auto submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Timer output (HH:MM:SS)
  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  // console.log("exam data", examData)
  // Safe checks & Loading view
  if (isAuthenticating || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="space-y-6 text-center max-w-sm px-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-xl font-bold tracking-tight">
            Loading exam environment
          </h3>
          <p className="text-muted-foreground text-sm">
            Please do not refresh or close the browser window. Setting up your
            secure test workspace...
          </p>
        </div>
      </div>
    );
  }

  const exam = examData!.exam;
  const questions = examData!.questions;
  const answers = examData!.answers;

  const currentQuestion = questions[currentIdx];
  const isQuestionAnswered = (qId: string) =>
    answers.some((a) => a.questionId === qId && a.selectedAnswer);
  const getSelectedAnswer = (qId: string) =>
    answers.find((a) => a.questionId === qId)?.selectedAnswer;

  // ----------------------------------------
  // SUB-VIEW: COMPLETED/RESULTS DASHBOARD
  // ----------------------------------------
  if (examSession?.isCompleted) {
    const score = examSession.score || 0;
    const totalQ = questions.length || exam.totalQuestions;
    const percent = Math.min(
      100,
      Math.round((score / Math.max(1, totalQ)) * 100),
    );

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <div className="container mx-auto px-4 py-20 flex-grow max-w-xl flex flex-col justify-center">
          <Card className=" shadow-lg p-8 text-center space-y-8 rounded-xl">
            {/* Header Trophy */}
            <div className="space-y-3">
              <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary shadow-inner">
                <Trophy className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {percent > 75 ? "Congratulations!" : "Keep it up"}
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Excellent effort. Your answers have been successfully locked and
                scored on our secure databases.
              </p>
            </div>

            {/* Interactive Scoring Gauge */}
            <div className="relative flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-8 border-muted flex flex-col items-center justify-center p-4 relative bg-background shadow-inner">
                <span className="text-4xl font-extrabold text-foreground">
                  {percent}%
                </span>
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-1">
                  Graded Score
                </span>

                {/* Absolute outer dynamic border */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 h-full w-full -rotate-90"
                >
                  {/* Background */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="fill-none stroke-muted/20"
                    strokeWidth="10"
                  />

                  {/* Progress */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="fill-none stroke-primary transition-all duration-700"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="534"
                    strokeDashoffset={534 - (534 * percent) / 100}
                  />
                </svg>
              </div>
            </div>

            {/* Detailed scorecard list */}
            <div className="bg-background border rounded-lg p-5 space-y-3 text-left text-sm text-muted-foreground">
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Student Name:</span>
                <span className="font-bold text-foreground">
                  {student?.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Student ID:</span>
                <span className="font-mono text-foreground">
                  {student?.studentNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Correct Answers:</span>
                <span className="font-bold text-foreground">
                  {score} of {totalQ}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Submission Date:</span>
                <span className="text-foreground">
                  {examSession.submittedAt
                    ? new Date(examSession.submittedAt).toLocaleTimeString()
                    : new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                onClick={() =>
                  router.replace(`/exam/onboard-examinees/${departmentId}`)
                }
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>

        <footer className="w-full border-t bg-card py-6 text-center text-muted-foreground text-xs">
          <span>
            Wardheer TVET Student Examination Hub © {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    );
  }

  // ----------------------------------------
  // SUB-VIEW: EXAM TAKING DASHBOARD
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Banner Header bar */}
      <header className="sticky top-0 z-40 border-b bg-background backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground md:text-base">
                {exam.title}
              </h1>

              <p className="truncate text-xs text-muted-foreground">
                Candidate: {student?.fullName} ({student?.studentNumber})
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm shadow-sm transition-colors ${
              secondsLeft !== null && secondsLeft < 300
                ? "border-destructive/30 bg-destructive/10"
                : "bg-card"
            }`}
          >
            <Clock
              className={`h-4 w-4 ${
                secondsLeft !== null && secondsLeft < 300
                  ? "animate-pulse text-destructive"
                  : "text-primary"
              }`}
            />

            <span
              className={`font-bold tracking-wider ${
                secondsLeft !== null && secondsLeft < 300
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Main taking body workspace */}
      <main className="container mx-auto px-4 py-8 flex-grow max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Question Stepper Navigation */}
        <section className="lg:col-span-4 space-y-6">
          <Card className="bg-card border text-card-foreground p-5 shadow-sm rounded-xl">
            <h3 className="font-bold text-foreground text-sm mb-4 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Exam Progress Stepper
            </h3>

            {/* Questions Grid mapping */}
            {/* <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = isQuestionAnswered(q.id);
                const isFlagged = flaggedQuestions[q.id];

               
                let btnVariant: "outline" | "default" | "secondary" = "outline";
                let customClass = "border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground";
                
                if (isCurrent) {
                  btnVariant = "default";
                  customClass = "bg-primary text-primary-foreground font-bold ring-2 ring-primary/20";
                } else if (isFlagged) {
                  customClass = "bg-warning/20 border-warning text-warning hover:bg-warning/30 bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400";
                } else if (isAnswered) {
                  customClass = "bg-success/20 border-success text-success bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                }

                return (
                  <Button
                    key={q.id}
                    variant={btnVariant}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-11 p-0 rounded-lg text-xs font-semibold relative cursor-pointer ${customClass}`}
                  >
                    {idx + 1}
                 
                    {isFlagged && !isCurrent && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </Button>
                );
              })}
            </div> */}

            {/* Legend guide info */}
            <Separator className="my-5" />

            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-primary border" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded border border-input bg-background" />
                <span>Unanswered</span>
              </div>
            </div>
          </Card>

          {/* Quick Help card banner */}
          <Card className="bg-card border text-card-foreground p-5 text-xs text-muted-foreground flex items-start gap-3 leading-relaxed shadow-sm rounded-xl">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-foreground">
                Persistent Auto-Save:
              </span>
              <p>
                Your answers are immediately uploaded to our server as soon as
                you select them. In the event of a sudden outage or browser
                refresh, your progress remains perfectly safe.
              </p>
            </div>
          </Card>
          <Card className="bg-card border text-card-foreground p-5 text-xs text-muted-foreground flex items-start gap-3 leading-relaxed shadow-sm rounded-xl">
            <Info className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-foreground">
                Don`t Refresh or Close:
              </span>
              <p>
                For the integrity of the exam session, please avoid refreshing
                the page or closing the browser window. If you need to step
                away, rest assured that your current progress is securely saved
                on our servers.
              </p>
            </div>
          </Card>
        </section>

        {/* RIGHT COLUMN: Question Panel Display */}
        <section className="lg:col-span-8 space-y-6">
          {currentQuestion ? (
            <Card className="bg-card border text-card-foreground shadow-sm rounded-xl overflow-hidden flex flex-col justify-between min-h-[500px]">
              {/* Question Header Card info */}
              <div className="p-6 border-b flex justify-between items-center gap-4 bg-muted/20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border text-xs font-semibold text-primary">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`border-input text-xs flex items-center gap-2 rounded-lg py-4 transition ${
                    flaggedQuestions[currentQuestion.id]
                      ? "border-amber-500 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flag
                    className={`w-3.5 h-3.5 ${flaggedQuestions[currentQuestion.id] ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                  {flaggedQuestions[currentQuestion.id]
                    ? "Flagged"
                    : "Flag for Review"}
                </Button>
              </div>

              {/* Question Text Panel */}
              <div className="p-8 flex-grow space-y-8">
                <h2 className="text-xl font-bold text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Multiple Options Multiple-Choice Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <Label>Answers</Label>
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const optionField =
                      letter === "A"
                        ? currentQuestion.optionA
                        : letter === "B"
                          ? currentQuestion.optionB
                          : letter === "C"
                            ? currentQuestion.optionC
                            : currentQuestion.optionD;

                    if (!optionField) return null;

                    const isSelected =
                      getSelectedAnswer(currentQuestion.id) === letter;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() =>
                          handleChooseAnswerLocal(currentQuestion.id, letter)
                        }
                        className={`w-full text-left h-auto p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-start gap-4 group/option shadow-sm cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 text-foreground"
                            : "bg-card border-border text-foreground hover:border-muted-foreground/50 hover:bg-accent/50"
                        }`}
                      >
                        {/* Checkbox Visual Element */}
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/60 bg-background group-hover/option:border-foreground"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-50 duration-200" />
                          )}
                        </div>

                        {/* Option text content with letter prefix */}
                        <span className="font-semibold text-sm md:text-base flex-grow text-wrap leading-relaxed">
                          <span className="text-muted-foreground mr-2 font-bold">
                            {letter}.
                          </span>
                          {optionField}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Actions Footer Panel */}
              {isQuestionAnswered(currentQuestion.id) && (
                <div className="p-6 border-t flex justify-end items-center gap-4 bg-muted/20 animate-in fade-in duration-200">
                  {/* {currentIdx < questions.length - 1 ? ( */}
                    <Button
                      onClick={handleNextQuestion}
                      disabled={isSavingNext}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg px-6 py-5 flex items-center gap-2 transition disabled:opacity-50"
                    >
                  
                        <>
                        {
                          currentIdx < questions.length - 1 ?(
                            <>{
                                 isSavingNext ? "Saving..." : "Next Question"}
                      <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          ):(
                            <>{
                              isSavingNext ? "Completing..." : "Complete"
                              
                            }
                             <Send className="w-4 h-4 ml-1" />
                            </>
                          )
                        }
                        </>
                    </Button>
                    
                
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center text-muted-foreground bg-card border rounded-xl">
              <HelpCircle className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <p>
                No questions found for this exam. Please notify your department
                administrator.
              </p>
            </Card>
          )}
        </section>
      </main>

      {/* Small subtle footer space */}
      <footer className="w-full py-4 text-center text-muted-foreground text-[10px] select-none border-t bg-card mt-8">
        <span>
          Wardheer TEVET Secure Exam Portal • System Version 2.0-Production
        </span>
      </footer>
    </div>
  );
}
