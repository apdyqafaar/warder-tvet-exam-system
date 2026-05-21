"use client";

import React, { useState } from "react";
import {
  useAdminStudents,
  useCreateAdminStudent,
  useUpdateAdminStudent,
  useDeleteAdminStudent,
} from "@/lib/hooks/use-admin-students";
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
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Plus, Search, Edit2, Trash2, GraduationCap, User, Hash, Building, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentFormData {
  id?: string;
  fullName: string;
  studentNumber: string;
  departmentId: string;
}

const StudentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const { data, isLoading, isError } = useAdminStudents({
    page,
    limit: 10,
    search: search.trim() || undefined,
    departmentId: filterDepartment === "all" ? undefined : filterDepartment,
  });

  const createMutation = useCreateAdminStudent();
  const updateMutation = useUpdateAdminStudent();
  const deleteMutation = useDeleteAdminStudent();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudentFormData>({
    fullName: "",
    studentNumber: "",
    departmentId: "",
  });

  const students = data?.students || [];
  const departments = data?.departments || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleOpenCreate = () => {
    setFormData({
      fullName: "",
      studentNumber: "",
      departmentId: departments[0]?.id || "",
    });
    setSelectedStudentId(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setFormData({
      id: student.id,
      fullName: student.fullName,
      studentNumber: student.studentNumber,
      departmentId: student.departmentId,
    });
    setSelectedStudentId(student.id);
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setSelectedStudentId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.studentNumber.trim() || !formData.departmentId) {
      toast.error("All fields are required");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      studentNumber: formData.studentNumber,
      departmentId: formData.departmentId,
    };

    if (selectedStudentId) {
      toast.promise(
        updateMutation.mutateAsync({ id: selectedStudentId, data: payload }),
        {
          loading: "Updating student details...",
          success: "Student updated successfully!",
          error: (err) => err.message || "Failed to update student",
        }
      );
      setIsSheetOpen(false);
    } else {
      toast.promise(
        createMutation.mutateAsync(payload),
        {
          loading: "Enrolling new student...",
          success: "Student enrolled successfully!",
          error: (err) => err.message || "Failed to enroll student",
        }
      );
      setIsSheetOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudentId) return;

    toast.promise(
      deleteMutation.mutateAsync(selectedStudentId),
      {
        loading: "Removing student...",
        success: "Student deleted successfully!",
        error: (err) => err.message || "Failed to delete student",
      }
    );
    setIsDeleteOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page to 1 when search filters change
  };

  const handleDeptFilterChange = (val: string) => {
    setFilterDepartment(val);
    setPage(1); // Reset page to 1
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Students Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track class enrollments, assign departments, and manage student registration information.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Student Directory</CardTitle>
              <CardDescription>
                A list of all enrolled students registered within departments.
              </CardDescription>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>

              <div className="w-full sm:w-48">
                <Select value={filterDepartment} onValueChange={handleDeptFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive">
              <AlertCircle className="h-10 w-10 mb-2" />
              <h3 className="font-semibold">Error fetching students</h3>
              <p className="text-sm text-muted-foreground">Please refresh the page and try again.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <User className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">No students found</h3>
              <p className="text-sm max-w-sm mt-1">
                No students match your query. Try registering a new student profile.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {student.fullName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{student.studentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          {student.departmentName || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(student)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(student.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} students
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center text-sm font-medium">
                      Page {page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selectedStudentId ? "Edit Student Record" : "Enroll Student"}</SheetTitle>
                <SheetDescription>
                  {selectedStudentId
                    ? "Modify student name, student number registration, and adjust department."
                    : "Register new student information and place them into a department."}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentNumber" className="flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" /> Student Number
                  </Label>
                  <Input
                    id="studentNumber"
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    placeholder="e.g. 11223344S"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="departmentId" className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" /> Department
                  </Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                  >
                    <SelectTrigger id="departmentId">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-6 flex sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {selectedStudentId ? "Save Changes" : "Register"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the student's record and erase all associated exam logs and scores from the platform database. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsPage;

