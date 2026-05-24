"use client"

import React, { useState } from "react"
import {
  GraduationCap,
  Hash,
  Calendar,
  Trophy,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Loader2,
  XCircle,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTeacherStudent } from "@/lib/hooks/use-teacher-students"
import { StudentExamDetail } from "@/lib/services/teacher/student.service"

interface StudentDetailSheetProps {
  studentId: string | null
  onOpenChange: (open: boolean) => void
}

type SortField = "examTitle" | "score" | "submittedAt"
type SortOrder = "asc" | "desc"

const ScoreBadge = ({ score, total }: { score: number | null; total: number }) => {
  if (score === null || score === undefined) {
    return (
      <span className="text-xs text-muted-foreground italic">Not graded</span>
    )
  }
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  const color =
    pct >= 80
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
      : pct >= 60
        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
        : "bg-destructive/15 text-destructive border-destructive/30"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${color}`}
    >
      {score}/{total} ({pct}%)
    </span>
  )
}

const StudentDetailSheet = ({ studentId, onOpenChange }: StudentDetailSheetProps) => {
  const [sortField, setSortField] = useState<SortField>("submittedAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const { data: studentData, isLoading } = useTeacherStudent(studentId ?? "")

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const sortedExams = [...(studentData?.studentExams ?? [])].sort(
    (a: StudentExamDetail, b: StudentExamDetail) => {
      let valA: any
      let valB: any

      if (sortField === "examTitle") {
        valA = a.exam.title.toLowerCase()
        valB = b.exam.title.toLowerCase()
      } else if (sortField === "score") {
        valA = a.score ?? -1
        valB = b.score ?? -1
      } else {
        valA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
        valB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    }
  )

  const completedExams = studentData?.studentExams?.filter((se) => se.isCompleted) ?? []
  const avgScore =
    completedExams.length > 0
      ? Math.round(
          completedExams.reduce((acc, se) => acc + (se.score ?? 0), 0) /
            completedExams.length
        )
      : null

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-left hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-colors ${
          sortField === field ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
        }`}
      />
    </button>
  )

  return (
    <Sheet open={!!studentId} onOpenChange={() => onOpenChange(false)}>
      <SheetContent className="sm:max-w-2xl w-full border-l bg-background/97 backdrop-blur-md p-0 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
          <SheetHeader className="p-0 space-y-1">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Student Profile
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              View exam history and performance details
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : studentData ? (
            <div className="mt-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {studentData.fullName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-mono">
                    {studentData.studentNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Enrolled {new Date(studentData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Stats row */}
          {!isLoading && studentData && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card/60 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">
                  {studentData.studentExams?.length ?? 0}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Exams
                </p>
              </div>
              <div className="rounded-xl border bg-card/60 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-foreground">
                  {completedExams.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Completed
                </p>
              </div>
              <div className="rounded-xl border bg-card/60 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xl font-bold text-foreground">
                  {avgScore !== null ? `${avgScore}` : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Avg. Score
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Exam Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Exam History
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No exams yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                This student hasn't been assigned any exams.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-auto">
                      <SortButton field="examTitle" label="Exam" />
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton field="score" label="Score" />
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton field="submittedAt" label="Submitted" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExams.map((se: StudentExamDetail) => (
                    <TableRow
                      key={se.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-sm max-w-[180px] truncate">
                        {se.exam.title}
                      </TableCell>
                      <TableCell>
                        {se.isCompleted ? (
                          se.status === "passed" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              Passed
                            </span>
                          ) : se.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 rounded-full px-2 py-0.5 border border-destructive/20">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </span>
                          )
                        ) : se.startedAt ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 rounded-full px-2 py-0.5 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 border border-border">
                            <XCircle className="h-3 w-3" />
                            Not Started
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge
                          score={se.score}
                          total={se.exam.totalQuestions}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {se.submittedAt
                          ? new Date(se.submittedAt).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default StudentDetailSheet
