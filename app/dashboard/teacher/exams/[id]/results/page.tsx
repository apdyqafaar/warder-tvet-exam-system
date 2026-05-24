"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Printer,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeacherExamResults } from "@/lib/hooks/use-teacher-exams";

export default function ExamResultsPage() {
  const { id } = useParams() as { id: string };
  const { data, isLoading, isError } = useTeacherExamResults(id);
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Loading exam results...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Failed to load results</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Could not retrieve exam results. Please try again later.
        </p>
        <Link href={`/dashboard/teacher/exams/${id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Exam
          </Button>
        </Link>
      </div>
    );
  }

  const { results, exam } = data;

  const filteredResults = results.filter((r) => 
    r.student.fullName.toLowerCase().includes(search.toLowerCase()) || 
    r.student.studentNumber.toLowerCase().includes(search.toLowerCase())
  );

  const passedCount = results.filter(r => r.status === "passed").length;
  const failedCount = results.length - passedCount;

  const downloadCSV = () => {
    const headers = ["Student Name", "Student Number", "Score", "Total Questions", "Percentage", "Status", "Submitted At"];
    const csvContent = [
      headers.join(","),
      ...filteredResults.map(r => {
        const pct = exam.totalQuestions > 0 ? Math.round(((r.score || 0) / exam.totalQuestions) * 100) : 0;
        return [
          `"${r.student.fullName}"`,
          `"${r.student.studentNumber}"`,
          r.score,
          exam.totalQuestions,
          `${pct}%`,
          r.status.toUpperCase(),
          `"${new Date(r.submittedAt!).toLocaleString()}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Exam_Results_${exam.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-6xl mx-auto">
      {/* Header - hide on print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <Link href={`/dashboard/teacher/exams/${id}`}>
            <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Exam
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Exam Results</h1>
          <p className="text-sm text-muted-foreground">
            {exam.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
          <Button onClick={downloadCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">Exam Results: {exam.title}</h1>
        <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Students Taken
          </p>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
        <div className="rounded-xl border bg-emerald-500/5 p-5 shadow-sm border-emerald-500/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Passed
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{passedCount}</p>
        </div>
        <div className="rounded-xl border bg-destructive/5 p-5 shadow-sm border-destructive/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive mb-1">
            Failed
          </p>
          <p className="text-2xl font-bold text-destructive">{failedCount}</p>
        </div>
      </div>

      {/* Search - hide on print */}
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Student Name</TableHead>
              <TableHead>Student No.</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((r) => {
                const pct = exam.totalQuestions > 0 ? Math.round(((r.score || 0) / exam.totalQuestions) * 100) : 0;
                const isPassed = r.status === "passed";
                
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.student.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">{r.student.studentNumber}</TableCell>
                    <TableCell className="text-center font-medium">
                      {r.score} / {exam.totalQuestions}
                      <span className="text-muted-foreground ml-1 text-xs">({pct}%)</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isPassed 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {isPassed ? "PASSED" : "FAILED"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
