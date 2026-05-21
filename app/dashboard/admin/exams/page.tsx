"use client";

import React, { useState } from "react";
import {
  useAdminExams,
  useDeleteAdminExam,
  useUpdateAdminExamStatus,
} from "@/lib/hooks/use-admin-exams";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Trash2, Clock, HelpCircle, User, Building, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ExamsPage = () => {
  const { data: exams = [], isLoading, isError } = useAdminExams();
  const deleteMutation = useDeleteAdminExam();
  const updateStatusMutation = useUpdateAdminExamStatus();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const handleOpenDelete = (id: string) => {
    setSelectedExamId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedExamId) return;

    toast.promise(
      deleteMutation.mutateAsync(selectedExamId),
      {
        loading: "Deleting exam...",
        success: "Exam deleted successfully!",
        error: (err) => err.message || "Failed to delete exam",
      }
    );
    setIsDeleteOpen(false);
  };

  const handleStatusChange = async (id: string, status: "draft" | "published" | "closed") => {
    toast.promise(
      updateStatusMutation.mutateAsync({ id, status }),
      {
        loading: "Updating exam status...",
        success: `Exam status set to ${status}!`,
        error: (err) => err.message || "Failed to update status",
      }
    );
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      (exam.departmentName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (exam.teacherName?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Exams Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor assessments across all departments, publish drafts, close exams, or delete entries.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Assessment Catalog</CardTitle>
              <CardDescription>
                Review and update academic examinations scheduled on the platform.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams, depts, teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="w-full sm:w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive">
              <AlertCircle className="h-10 w-10 mb-2" />
              <h3 className="font-semibold">Error fetching exams</h3>
              <p className="text-sm text-muted-foreground">Please refresh the page and try again.</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <FileText className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">No exams found</h3>
              <p className="text-sm max-w-sm mt-1">
                No active exams match your filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status Override</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium flex items-center gap-2 max-w-[200px] truncate">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span title={exam.title}>{exam.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60">
                        <Building className="h-3 w-3 mr-1 shrink-0" />
                        {exam.departmentName || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 shrink-0" />
                        {exam.teacherName || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        {exam.totalQuestions} qs
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {exam.duration}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={exam.status}
                        onValueChange={(val) =>
                          handleStatusChange(exam.id, val as "draft" | "published" | "closed")
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px] text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">
                            <span className="text-orange-500 font-semibold">Draft</span>
                          </SelectItem>
                          <SelectItem value="published">
                            <span className="text-emerald-600 font-semibold">Published</span>
                          </SelectItem>
                          <SelectItem value="closed">
                            <span className="text-rose-500 font-semibold">Closed</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(exam.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this exam and wipe out all questions, choices, student submissions, and scoring reports linked to it. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamsPage;

