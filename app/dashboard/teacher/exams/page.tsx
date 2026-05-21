"use client";

import { Eye, Loader2, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteExamAction } from "@/actions/teacher/exams";
import CreateNewExam from "@/components/dashboard/create-new-exam";
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
import { useTeacherExams } from "@/lib/hooks/use-teacher-exams";

const ExamsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const limit = 10;

  const { data: departmentData, isLoading: isDeptLoading } =
    useTeacherDepartment();
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

  const selectedDepartment =
    departments.find((department) => department.id === selectedDepartmentId) ||
    null;

  const { data, isFetching, isError, refetch } = useTeacherExams({
    page,
    limit,
    search,
    status,
    departmentId: selectedDepartmentId || undefined,
  });

  const handleDelete = async (examId: string) => {
    const res = await deleteExamAction(examId);
    if (res.success) {
      toast.success("Exam deleted successfully");
      refetch();
    } else {
      toast.error(res.error || "Failed to delete exam");
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Exams
          </h2>
          <p className="leading-7 text-sm text-muted-foreground">
            Create exams for any department you manage and filter the list by
            department or status.
          </p>
        </div>
        <CreateNewExam
          departments={departments.map((department) => ({
            id: department.id,
            name: department.name,
          }))}
          selectedDepartmentId={selectedDepartmentId}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>

        <Select
          value={selectedDepartmentId}
          onValueChange={(value) => {
            setSelectedDepartmentId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
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
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching || isDeptLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Loading exams...
                  </span>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-destructive h-32"
                >
                  Error loading exams.
                </TableCell>
              </TableRow>
            ) : data?.exams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-32"
                >
                  {selectedDepartment
                    ? `No exams found for ${selectedDepartment.name}.`
                    : "No exams found."}
                </TableCell>
              </TableRow>
            ) : (
              data?.exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {selectedDepartment?.name || "-"}
                  </TableCell>
                  <TableCell>{exam.duration} mins</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        exam.status === "published"
                          ? "bg-primary text-primary-foreground"
                          : exam.status === "closed"
                            ? "bg-secondary text-secondary-foreground"
                            : "border border-input bg-background"
                      }`}
                    >
                      <span className="capitalize">{exam.status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/teacher/exams/${exam.id}`}>
                        <Tooltip>
                          <TooltipTrigger className="bg-card border border-border px-2 py-2 rounded-lg cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview and manage exam</p>
                          </TooltipContent>
                        </Tooltip>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your exam.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(exam.id)}
                            >
                              Continue
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

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((currentPage) => Math.max(1, currentPage - 1))
            }
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground font-medium px-2">
            Page {page} of {data.pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= data.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
