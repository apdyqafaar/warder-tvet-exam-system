"use client";

import {
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Loader2,
  Search,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateStudentSheet from "@/components/dashboard/create-student-sheet";
import StudentDetailSheet from "@/components/dashboard/student-detail-sheet";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTeacherDepartment } from "@/lib/hooks/use-teacher-department";
import {
  useDeleteStudent,
  useTeacherStudents,
} from "@/lib/hooks/use-teacher-students";
import type {
  StudentWithStats,
  TeacherStudentStatus,
} from "@/lib/services/teacher/student.service";

const LIMIT = 10;
const LOADING_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];
const LOADING_CELL_KEYS = [
  "cell-1",
  "cell-2",
  "cell-3",
  "cell-4",
  "cell-5",
  "cell-6",
  "cell-7",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) => (
  <div className="rounded-2xl border bg-card p-5 flex items-center gap-4 shadow-xs hover:shadow-sm transition-shadow duration-200 group">
    <div
      className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-105 transition-transform duration-200`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-6 w-16 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-foreground leading-tight">
          {value}
        </p>
      )}
    </div>
  </div>
);

const ScorePill = ({ score }: { score: number | null }) => {
  if (score === null || score === undefined) {
    return (
      <span className="text-xs text-muted-foreground italic">No scores</span>
    );
  }

  const color =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
      : score >= 60
        ? "bg-amber-500/10 text-amber-600 border-amber-500/25"
        : "bg-destructive/10 text-destructive border-destructive/25";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${color}`}
    >
      <Trophy className="h-3 w-3" />
      {Number(score).toFixed(1)}
    </span>
  );
};

const StudentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState<TeacherStudentStatus>("all");
  const [minScore, setMinScore] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  const { data: departmentData } = useTeacherDepartment();
  const departments = departmentData?.departments || [];

  useEffect(() => {
    if (!departments.length) {
      setSelectedDepartmentId("");
      return;
    }

    if (
      !selectedDepartmentId ||
      !departments.some((department) => department.id === selectedDepartmentId)
    ) {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, selectedDepartmentId]);

  const { data, isFetching, isError } = useTeacherStudents({
    page,
    limit: LIMIT,
    search,
    sortBy,
    sortOrder,
    departmentId: selectedDepartmentId || undefined,
    status,
    minScore: minScore ? Number(minScore) : undefined,
    refetchIntervalMs: 3000,
  });

  const deleteMutation = useDeleteStudent();

  const handleDelete = async (studentId: string) => {
    try {
      await deleteMutation.mutateAsync(studentId);
      toast.success("Student removed successfully");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete student",
      );
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const generateId = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (value) => chars[value % chars.length]).join("");
  };

  const students = data?.students ?? [];
  const pagination = data?.pagination;
  const totalStudents = pagination?.total ?? 0;
  const avgScores = students
    .map((student) => Number(student.averageScore))
    .filter((score) => !Number.isNaN(score) && score > 0);
  const overallAvg =
    avgScores.length > 0
      ? (
          avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length
        ).toFixed(1)
      : "—";

  const SortHead = ({ field, label }: { field: string; label: string }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-colors ${
          sortBy === field
            ? "text-primary"
            : "text-muted-foreground/50 group-hover:text-muted-foreground"
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Students
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, and live-track student performance across your
            departments.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group font-semibold self-start sm:self-auto"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="bg-primary/10 text-primary"
          loading={isFetching && !data}
        />
        <StatCard
          icon={BookOpen}
          label="With Exams"
          value={students.filter((student) => student.totalExams > 0).length}
          color="bg-violet-500/10 text-violet-600"
          loading={isFetching && !data}
        />
        <StatCard
          icon={Trophy}
          label="Avg. Score"
          value={overallAvg}
          color="bg-amber-500/10 text-amber-600"
          loading={isFetching && !data}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_160px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10 bg-background border-border focus-visible:ring-primary/20"
          />
        </div>

        <Select
          value={selectedDepartmentId}
          onValueChange={(value) => {
            setSelectedDepartmentId(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value: TeacherStudentStatus) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="has-exams">Has Exams</SelectItem>
            <SelectItem value="completed">Completed Exams</SelectItem>
            <SelectItem value="top-performer">Top Performers</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0"
          max="100"
          placeholder="Min score"
          value={minScore}
          onChange={(e) => {
            setMinScore(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Live refresh every 3 seconds</span>
        {isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-5">
                <SortHead field="fullName" label="Student" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student No.
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SortHead field="totalExams" label="Exams" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Completed
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SortHead field="averageScore" label="Avg. Score" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SortHead field="createdAt" label="Enrolled" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && !data ? (
              LOADING_ROW_KEYS.map((rowKey) => (
                <TableRow key={rowKey}>
                  {LOADING_CELL_KEYS.map((cellKey) => (
                    <TableCell key={`${rowKey}-${cellKey}`}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-destructive py-16"
                >
                  Failed to load students. Please try again.
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <GraduationCap className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {search ? "No students found" : "No students yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search
                        ? "Try a different search term"
                        : "Add your first student to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: StudentWithStats) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
                        <span className="text-xs font-bold text-primary">
                          {student.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-sm">
                        {student.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-0.5">
                      {student.studentNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <BookOpen className="h-3.5 w-3.5 text-primary/60" />
                      {student.totalExams}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                      {student.completedExams}
                      <span className="text-xs text-muted-foreground font-normal">
                        / {student.totalExams}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <ScorePill score={student.averageScore} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => setSelectedStudentId(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View student details & exams</p>
                        </TooltipContent>
                      </Tooltip>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove student?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove{" "}
                              <strong>{student.fullName}</strong> and all their
                              exam records. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(student.id)}
                            >
                              Remove Student
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * LIMIT + 1}–
              {Math.min(page * LIMIT, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {pagination.total}
            </span>{" "}
            students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={page === 1}
              className="h-8 gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm font-medium text-muted-foreground px-2">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= pagination.totalPages}
              className="h-8 gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateStudentSheet
        generateCode={generateId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        departments={departments.map((department) => ({
          id: department.id,
          name: department.name,
        }))}
        selectedDepartmentId={selectedDepartmentId}
      />
      <StudentDetailSheet
        studentId={selectedStudentId}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null);
        }}
      />
    </div>
  );
};

export default StudentsPage;
