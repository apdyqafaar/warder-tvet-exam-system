"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertCircle,
  HelpCircle,
  Loader2,
  Sparkles,
  Layers,
  Edit2,
  Upload,
  X,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  useTeacherExam,
  useUpdateTeacherExam,
  useCreateQuestion,
  useDeleteQuestion,
  useUpdateQuestion,
  useImportQuestionsFile,
  useBulkCreateQuestions,
} from "@/lib/hooks/use-teacher-exams"
import { ParsedQuestion } from "@/lib/utils/question-parser"
import { toast } from "sonner"
interface IQuestion{
    id: string;
    createdAt: Date;
    question: string;
    examId: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string | null;
    correctAnswer: "A" | "B" | "C" | "D";
}

export default function ExamDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  // Query Hook
  const { data: examData, isLoading, isError, refetch } = useTeacherExam(id)

  // Mutations
  const updateExamMutation = useUpdateTeacherExam(id)
  const createQuestionMutation = useCreateQuestion(id)
  const deleteQuestionMutation = useDeleteQuestion(id)
  const updateQuestionMutation =  useUpdateQuestion(id)

  // Form State for new question
  const [questionText, setQuestionText] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A")
  const [errors, setErrors] = useState<Record<string, string>>({})
//   edit state
const [editMode, setEditMode]=useState(false)
const [questionToEdit, setQuestionToEdit]=useState<IQuestion|null>(null)

// Import state
const [showImportModal, setShowImportModal] = useState(false)
const [importFile, setImportFile] = useState<File | null>(null)
const [importText, setImportText] = useState("")
const [importedQuestions, setImportedQuestions] = useState<ParsedQuestion[]>([])
const [importStep, setImportStep] = useState<"upload" | "review">("upload")

const importQuestionsMutation = useImportQuestionsFile(id)
const bulkCreateQuestionsMutation = useBulkCreateQuestions(id)

const handleImportSubmit = async () => {
  try {
    const formData = new FormData()
    if (importFile) {
      formData.append("file", importFile)
    } else if (importText.trim()) {
      formData.append("text", importText)
    } else {
      toast.error("Please provide a file or text")
      return
    }

    const res:any = await importQuestionsMutation.mutateAsync(formData)
    if (res.success && res.data && res.data.length > 0) {
      setImportedQuestions(res.data)
      setImportStep("review")
      toast.success(res.message)
    } else {
      toast.error(res.message || "Failed to parse questions")
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to import questions")
  }
}

const handleBulkSubmit = async () => {
  try {
    await bulkCreateQuestionsMutation.mutateAsync(importedQuestions)
    toast.success("Questions added successfully")
    setShowImportModal(false)
    setImportStep("upload")
    setImportedQuestions([])
    setImportFile(null)
    setImportText("")
    refetch()
  } catch (error: any) {
    toast.error(error.message || "Failed to save questions")
  }
}

const updateImportedQuestionAnswer = (index: number, answer: "A" | "B" | "C" | "D") => {
  const newQuestions = [...importedQuestions]
  newQuestions[index].correctAnswer = answer
  setImportedQuestions(newQuestions)
}
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Retrieving assessment details...
        </p>
      </div>
    )
  }

  if (isError || !examData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Failed to load exam</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          There was an error fetching the exam. It may have been deleted or you do not have permission to view it.
        </p>
        <Link href="/dashboard/teacher/exams">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Exams
          </Button>
        </Link>
      </div>
    )
  }

  const exam = examData as any
  const questions = exam.questions || []

  // Check if dates allow publishing
  const isCreatedInPast = new Date(exam.createdAt).getTime() <= Date.now()

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateExamMutation.mutateAsync({ status: newStatus })
      toast.success(`Exam status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!questionText.trim()) newErrors.questionText = "Question text is required"
    if (!optionA.trim()) newErrors.optionA = "Option A is required"
    if (!optionB.trim()) newErrors.optionB = "Option B is required"
    if (!optionC.trim()) newErrors.optionC = "Option C is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
      if(editMode){
        try {
          await handleUpdate()
          toast.success("Question updated successfully")
          setEditMode(false)
          setQuestionToEdit(null)
          setQuestionText("")
          setOptionA("")
          setOptionB("")
          setOptionC("")
          setOptionD("")
          setCorrectAnswer("A")
          setErrors({})
        } catch (err: any) {
          toast.error(err.message || "Failed to update question")
        }
        return
      }
    if (!validateForm()) {
      toast.error("Please fill in all required options")
      return
    }

    try {
      await createQuestionMutation.mutateAsync({
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim() || undefined,
        correctAnswer,
      })

      toast.success("Question added successfully")

      // Reset form
      setQuestionText("")
      setOptionA("")
      setOptionB("")
      setOptionC("")
      setOptionD("")
      setCorrectAnswer("A")
      setErrors({})
    } catch (err: any) {
      toast.error(err.message || "Failed to add question")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestionMutation.mutateAsync(questionId)
      toast.success("Question deleted successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question")
    }
  }

  const handleEditMode=(q:IQuestion)=>{
    if (editMode) {
      setQuestionToEdit(null)
      setEditMode(false)
    } else {
      setQuestionToEdit(q)
      setEditMode(true)
      setQuestionText(q.question)
      setOptionA(q.optionA)
      setOptionB(q.optionB)
      setOptionC(q.optionC)
      setOptionD(q.optionD!)
      setCorrectAnswer(q.correctAnswer)
    }
  }

  const handleUpdate=async()=>{
    if(!questionToEdit||!questionToEdit?.id)return

    await updateQuestionMutation.mutateAsync({
       data:{
         questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim() || undefined,
        correctAnswer,
       },
       questionId:questionToEdit?.id!
      })
  }
  return (
    <div className="p-2 sm:p-6 space-y-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/teacher/exams">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Exams
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full border">
            Created: {new Date(exam.createdAt).toLocaleDateString()}
          </span>
          <Link href={`/dashboard/teacher/exams/${id}/results`}>
            <Button size="sm" variant="default" className="gap-2 shadow-sm font-semibold">
              <Users className="h-4 w-4" />
              View Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Info Card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-sm group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10 duration-700" />
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                {exam.department?.name || "Assigned Department"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                <Clock className="h-3.5 w-3.5" />
                {exam.duration} Minutes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-3.5 w-3.5" />
                {questions.length} {questions.length === 1 ? "Question" : "Questions"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                <Users className="h-3.5 w-3.5" />
                {exam.studentExams?.length || 0} {(exam.studentExams?.length || 0) === 1 ? "Student Taken" : "Students Taken"}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {exam.title}
              </h1>
              {exam.description && (
                <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed mt-2 p-3 bg-muted/30 rounded-xl border border-border/40">
                  {exam.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Changer */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 min-w-[200px] shrink-0">
            <div className="space-y-1 w-full">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 block md:text-right">
                Assessment Status
              </Label>
              <div className="relative mt-1">
                {updateExamMutation.isLoading && (
                  <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none z-10">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  </div>
                )}
                <Select
                  value={exam.status}
                  onValueChange={handleStatusChange}
                  disabled={updateExamMutation.isLoading}
                >
                  <SelectTrigger className={`w-full sm:w-[180px] h-10 font-medium transition-all shadow-xs border-muted-foreground/20 focus:ring-primary/20 ${
                    exam.status === "published" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                    exam.status === "closed" ? "bg-rose-500/5 text-rose-600 border-rose-500/20 dark:text-rose-400" :
                    "bg-yellow-500/5 text-yellow-600 border-yellow-500/20 dark:text-yellow-400"
                  } ${updateExamMutation.isLoading ? "pl-7" : ""}`}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="font-medium text-yellow-600 dark:text-yellow-400 focus:bg-yellow-500/5 focus:text-yellow-600">
                      Draft mode
                    </SelectItem>
                    <SelectItem 
                      value="published" 
                      disabled={!isCreatedInPast}
                      className="font-medium text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/5 focus:text-emerald-600"
                    >
                      Published {!isCreatedInPast && "(Scheduled)"}
                    </SelectItem>
                    <SelectItem value="closed" className="font-medium text-rose-600 dark:text-rose-400 focus:bg-rose-500/5 focus:text-rose-600">
                      Closed / Cancel
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug text-left md:text-right mt-1">
              {exam.status === "published" && "✓ Assessment is live for all students."}
              {exam.status === "draft" && "✏ Students cannot see or take this exam."}
              {exam.status === "closed" && "✕ Exam closed. Submissions disabled."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two Column Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form to Add Question */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-md border-border/80 backdrop-blur-xs bg-card/60 relative overflow-hidden group">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{editMode ? "Edit" : "Add"} Question</CardTitle>
                  <CardDescription>{editMode ? "Edit" : "Append"} a multiple choice question to the assessment.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddQuestion} className="space-y-5" id="add-question-form">
                {/* Question Description */}
                <div className="space-y-2">
                  <Label htmlFor="question-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {
                        editMode ? "Edit Question Text" : "Question Text"
                    }
                  </Label>
                  <Textarea
                    id="question-desc"
                    placeholder="e.g. What is the output of console.log(typeof NaN)?"
                    value={questionText}
                    onChange={(e) => {
                      setQuestionText(e.target.value)
                      if (errors.questionText) setErrors(prev => ({ ...prev, questionText: "" }))
                    }}
                    className={`min-h-[90px] max-h-[150px] border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                      errors.questionText ? "border-destructive focus-visible:border-destructive" : ""
                    }`}
                  />
                  {errors.questionText && (
                    <p className="text-xs font-medium text-destructive">{errors.questionText}</p>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-4 pt-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                    Options List
                  </Label>

                  {/* Option A */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-muted text-xs font-bold border">A</span>
                      <Input
                        placeholder="Option A (Required)"
                        value={optionA}
                        onChange={(e) => {
                          setOptionA(e.target.value)
                          if (errors.optionA) setErrors(prev => ({ ...prev, optionA: "" }))
                        }}
                        className={`h-9 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                          errors.optionA ? "border-destructive focus-visible:border-destructive" : ""
                        }`}
                      />
                    </div>
                    {errors.optionA && (
                      <p className="text-xs font-medium text-destructive pl-8">{errors.optionA}</p>
                    )}
                  </div>

                  {/* Option B */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-muted text-xs font-bold border">B</span>
                      <Input
                        placeholder="Option B (Required)"
                        value={optionB}
                        onChange={(e) => {
                          setOptionB(e.target.value)
                          if (errors.optionB) setErrors(prev => ({ ...prev, optionB: "" }))
                        }}
                        className={`h-9 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                          errors.optionB ? "border-destructive focus-visible:border-destructive" : ""
                        }`}
                      />
                    </div>
                    {errors.optionB && (
                      <p className="text-xs font-medium text-destructive pl-8">{errors.optionB}</p>
                    )}
                  </div>

                  {/* Option C */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-muted text-xs font-bold border">C</span>
                      <Input
                        placeholder="Option C (Required)"
                        value={optionC}
                        onChange={(e) => {
                          setOptionC(e.target.value)
                          if (errors.optionC) setErrors(prev => ({ ...prev, optionC: "" }))
                        }}
                        className={`h-9 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                          errors.optionC ? "border-destructive focus-visible:border-destructive" : ""
                        }`}
                      />
                    </div>
                    {errors.optionC && (
                      <p className="text-xs font-medium text-destructive pl-8">{errors.optionC}</p>
                    )}
                  </div>

                  {/* Option D */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-muted text-xs font-bold border">D</span>
                      <Input
                        placeholder="Option D (Optional)"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        className="h-9 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Correct Answer Selection */}
                <div className="space-y-2.5 pt-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                    Correct Answer
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        onClick={() => setCorrectAnswer(opt)}
                        className={`h-8 rounded-lg border text-sm font-bold flex items-center justify-center transition-all cursor-pointer bg-primary/10 text-primary ${
                          correctAnswer === opt
                            ? "bg-primary/20 border-primary text-primary shadow-md  "
                            : "bg-muted/50 border-muted-foreground/20 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <Button
                variant={"default"}
                  type="submit"
                  disabled={updateExamMutation.isLoading || createQuestionMutation.isLoading || updateQuestionMutation.isLoading || updateQuestionMutation.isPending}
                  className="w-full h-11  text-primary-foreground font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {updateExamMutation.isPending || createQuestionMutation.isLoading || updateQuestionMutation.isLoading || updateQuestionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editMode? "Updating the Question":"Saving Question..."}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {editMode ? "Update Question" : "Add Question"} to Exam
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Questions List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold tracking-tight">Exam Questions</h3>
              <p className="text-xs text-muted-foreground">List of current questions configured for this exam.</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)} className="h-7 text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Import
              </Button>
              <div className="h-7 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shadow-2xs">
                {questions.length} total
              </div>
            </div>
          </div>

          {questions.length === 0 ? (
            <Card className="border-dashed bg-card/25 backdrop-blur-xs flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 shadow-2xs animate-pulse">
              <div className="p-4 rounded-full bg-muted text-muted-foreground">
                <HelpCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-semibold text-sm">No questions added yet</h4>
                <p className="text-xs text-muted-foreground">
                  Get started by filling out the left form to add dynamic multiple-choice assessment questions.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              {questions.map((q: any, idx: number) => (
                <Card
                  key={q.id}
                  className="shadow-sm border-border/60 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group/item bg-card/60 backdrop-blur-xs"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 pb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold leading-relaxed text-foreground/90">
                        {q.question}
                      </p>
                    </div>

                    {/* Delete Alert Dialog */}
                    <AlertDialog>
                        <div className="flex gap-2 items-center">
                            {questionToEdit?.id===q.id? 
                            <Button onClick={()=>{{setQuestionToEdit (null)} {setEditMode(false)}}} variant={"outline"}>Cancel</Button>
                            :<Button onClick={()=>handleEditMode(q)} className="w-6 h-6 rounded-md bg-card border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300 cursor-pointer flex items-center justify-center">
                                <Edit2 className="h-4 w-4"/>
                            </Button>}
                            <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteQuestionMutation.isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger >
                        </div>
                  
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure? This will permanently delete question #{idx + 1} from this exam. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                      {/* Option A */}
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        q.correctAnswer === "A"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                          : "bg-muted/30 border-muted-foreground/10 text-muted-foreground"
                      }`}>
                        <span><strong className="mr-1.5">A.</strong> {q.optionA}</span>
                        {q.correctAnswer === "A" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                      </div>

                      {/* Option B */}
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        q.correctAnswer === "B"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                          : "bg-muted/30 border-muted-foreground/10 text-muted-foreground"
                      }`}>
                        <span><strong className="mr-1.5">B.</strong> {q.optionB}</span>
                        {q.correctAnswer === "B" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                      </div>

                      {/* Option C */}
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        q.correctAnswer === "C"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                          : "bg-muted/30 border-muted-foreground/10 text-muted-foreground"
                      }`}>
                        <span><strong className="mr-1.5">C.</strong> {q.optionC}</span>
                        {q.correctAnswer === "C" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                      </div>

                      {/* Option D */}
                      {q.optionD && (
                        <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                          q.correctAnswer === "D"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                            : "bg-muted/30 border-muted-foreground/10 text-muted-foreground"
                        }`}>
                          <span><strong className="mr-1.5">D.</strong> {q.optionD}</span>
                          {q.correctAnswer === "D" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Import Questions</h2>
                <p className="text-sm text-muted-foreground">Upload a PDF/Word file or paste text directly.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowImportModal(false); setImportStep("upload"); setImportedQuestions([]); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {importStep === "upload" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Upload File (PDF or Word)</Label>
                    <Input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs text-muted-foreground uppercase font-bold">OR</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Paste Raw Text</Label>
                    <Textarea 
                      placeholder="1. What is...&#10; A. Option A&#10; B. Option B..." 
                      className="min-h-[200px]"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Review Questions</h3>
                      <p className="text-sm text-muted-foreground">Please select the correct answers for each question before saving.</p>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {importedQuestions.length} Questions Found
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {importedQuestions.map((q, i) => (
                      <Card key={i} className="p-4 shadow-sm border-border/60">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm"><span className="text-primary mr-2 font-bold">{i + 1}.</span>{q.questionText}</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm pl-6">
                            <div className="flex gap-2"><strong>A.</strong> {q.optionA}</div>
                            <div className="flex gap-2"><strong>B.</strong> {q.optionB}</div>
                            <div className="flex gap-2"><strong>C.</strong> {q.optionC}</div>
                            {q.optionD && <div className="flex gap-2"><strong>D.</strong> {q.optionD}</div>}
                          </div>
                          <div className="pt-2 pl-6">
                            <Label className="text-xs mb-2 block text-muted-foreground">Select Correct Answer</Label>
                            <div className="flex gap-2">
                              {(["A", "B", "C", "D"] as const).map(opt => {
                                if (opt === "D" && !q.optionD) return null;
                                return (
                                  <Button 
                                    key={opt}
                                    type="button"
                                    size="sm"
                                    variant={q.correctAnswer === opt ? "default" : "outline"}
                                    onClick={() => updateImportedQuestionAnswer(i, opt)}
                                    className={`w-10 h-8 p-0 ${q.correctAnswer === opt ? "bg-primary text-primary-foreground" : ""}`}
                                  >
                                    {opt}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              {importStep === "upload" ? (
                <Button 
                  disabled={(!importFile && !importText) || importQuestionsMutation.isLoading}
                  onClick={handleImportSubmit}
                >
                  {importQuestionsMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Parse Questions
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setImportStep("upload")}>Back</Button>
                  <Button 
                    disabled={bulkCreateQuestionsMutation.isLoading}
                    onClick={handleBulkSubmit}
                  >
                    {bulkCreateQuestionsMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save {importedQuestions.length} Questions
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}