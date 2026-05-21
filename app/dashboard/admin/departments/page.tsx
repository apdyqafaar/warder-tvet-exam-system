"use client";

import {
  AlertCircle,
  BookOpenText,
  Building2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";
import type React from "react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminDepartments,
  useCreateAdminDepartment,
  useDeleteAdminDepartment,
  useUpdateAdminDepartment,
} from "@/lib/hooks/use-admin-departments";
import type {
  AdminDepartmentListItem,
  AdminDepartmentStatus,
} from "@/lib/services/admin/departments.service";

type DepartmentFormData = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  teacherId: string;
};

const FALLBACK_DEPARTMENT_IMAGE = "/departments/it_img.jpeg";
const DEPARTMENT_SKELETON_KEYS = [
  "department-skeleton-1",
  "department-skeleton-2",
  "department-skeleton-3",
  "department-skeleton-4",
  "department-skeleton-5",
  "department-skeleton-6",
];

const statusMeta: Record<
  AdminDepartmentStatus,
  {
    label: string;
    tone: string;
    helper: string;
  }
> = {
  active: {
    label: "Active",
    tone: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    helper: "Published exams are live",
  },
  draft: {
    label: "Draft",
    tone: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    helper: "Exams exist but none are published",
  },
  new: {
    label: "New",
    tone: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    helper: "No exams have been created yet",
  },
};

const getTeacherInitials = (teacher?: { name: string | null } | null) => {
  if (!teacher?.name) {
    return "T";
  }

  return teacher.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const DepartmentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AdminDepartmentStatus
  >("all");
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading, isError } = useAdminDepartments({
    page,
    limit: 6,
    search: deferredSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const createMutation = useCreateAdminDepartment();
  const updateMutation = useUpdateAdminDepartment();
  const deleteMutation = useDeleteAdminDepartment();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    imageUrl: "",
    teacherId: "",
  });

  const departments = data?.departments || [];
  const teachers = data?.teachers || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  };
  const currentTeacher = teachers.find(
    (teacher) => teacher.id === formData.teacherId,
  );
  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;
  const activeOnPage = departments.filter(
    (department) => department.status === "active",
  ).length;
  const draftOnPage = departments.filter(
    (department) => department.status === "draft",
  ).length;

  const handleOpenCreate = () => {
    setSelectedDepartmentId(null);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      teacherId: teachers[0]?.id || "",
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (department: AdminDepartmentListItem) => {
    setSelectedDepartmentId(department.id);
    setFormData({
      id: department.id,
      name: department.name,
      description: department.description || "",
      imageUrl: department.imageUrl || "",
      teacherId: department.teacherId,
    });
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setSelectedDepartmentId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error("Department name must be at least 2 characters");
      return;
    }

    if (!formData.teacherId) {
      toast.error("Please assign a lead teacher");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      teacherId: formData.teacherId,
    };

    if (formData.id) {
      toast.promise(
        updateMutation.mutateAsync({ id: formData.id, data: payload }),
        {
          loading: "Updating department...",
          success: "Department updated successfully!",
          error: (err) => err.message || "Failed to update department",
        },
      );
    } else {
      toast.promise(createMutation.mutateAsync(payload), {
        loading: "Creating department...",
        success: "Department created successfully!",
        error: (err) => err.message || "Failed to create department",
      });
    }

    setIsSheetOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedDepartmentId) {
      return;
    }

    toast.promise(deleteMutation.mutateAsync(selectedDepartmentId), {
      loading: "Deleting department...",
      success: "Department deleted successfully!",
      error: (err) => err.message || "Failed to delete department",
    });

    setIsDeleteOpen(false);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Admin Console
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Departments Directory
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review every department with its image, lead staff profile, and
              academic activity in one place.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="self-start rounded-xl shadow-sm lg:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Matched
              </p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Active On Page
              </p>
              <p className="text-2xl font-bold">{activeOnPage}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Draft On Page
              </p>
              <p className="text-2xl font-bold">{draftOnPage}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle className="text-lg">Directory Filters</CardTitle>
              <CardDescription>
                Search by department or staff details, then narrow the list by
                operational status.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search departments or staff..."
                  className="rounded-xl pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value: "all" | AdminDepartmentStatus) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full rounded-xl sm:w-52">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DEPARTMENT_SKELETON_KEYS.map((skeletonKey) => (
                <div
                  key={skeletonKey}
                  className="overflow-hidden rounded-3xl border border-border/70"
                >
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="space-y-4 p-5">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="grid grid-cols-3 gap-3">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center text-destructive">
              <AlertCircle className="mb-3 h-10 w-10" />
              <h3 className="text-lg font-semibold">
                Unable to load departments
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Refresh the page and try again. If this keeps happening, the
                admin route may need attention.
              </p>
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">No departments found</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Try changing your filters or create a fresh department with a
                lead teacher assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {departments.map((department) => {
                  const teacherInfo = {
                    name: department.teacherName,
                  };

                  return (
                    <div
                      key={department.id}
                      className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {/* biome-ignore lint/performance/noImgElement: Department cards accept arbitrary external image URLs. */}
                        <img
                          src={department.imageUrl || FALLBACK_DEPARTMENT_IMAGE}
                          alt={department.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                          <Badge
                            className={`border ${statusMeta[department.status].tone}`}
                          >
                            {statusMeta[department.status].label}
                          </Badge>
                          <div className="rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            {department.publishedExamCount} live exam
                            {department.publishedExamCount === 1 ? "" : "s"}
                          </div>
                        </div>
                        <div className="absolute inset-x-4 bottom-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                            Department
                          </p>
                          <h3 className="text-xl font-bold text-white">
                            {department.name}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-4 p-5">
                        <p className="min-h-10 text-sm leading-6 text-muted-foreground">
                          {department.description ||
                            "Build the identity for this department by adding a description, staff lead, and exam pipeline."}
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Students
                            </p>
                            <p className="mt-2 text-xl font-bold">
                              {department.studentCount}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Exams
                            </p>
                            <p className="mt-2 text-xl font-bold">
                              {department.examCount}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Status
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                              {statusMeta[department.status].label}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Lead Staff
                          </p>
                          <div className="flex items-center gap-3">
                            <Avatar size="lg" className="h-11 w-11">
                              <AvatarImage
                                src={department.teacherImage || ""}
                                alt={department.teacherName || ""}
                              />
                              <AvatarFallback>
                                {getTeacherInitials(teacherInfo)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {department.teacherName || "Unknown teacher"}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {department.teacherEmail ||
                                  "No email available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                          <span>
                            Created{" "}
                            {new Date(
                              department.createdAt,
                            ).toLocaleDateString()}
                          </span>
                          <span>{statusMeta[department.status].helper}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl"
                            onClick={() => handleOpenEdit(department)}
                          >
                            <PencilLine className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleOpenDelete(department.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total} departments
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setPage((current) => Math.max(current - 1, 1))
                      }
                    >
                      Previous
                    </Button>
                    <div className="px-3 text-sm font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(current + 1, pagination.totalPages),
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full overflow-y-auto border-l bg-background/98 px-0 sm:max-w-xl">
          <form
            onSubmit={handleSubmit}
            className="flex min-h-full flex-col justify-between"
          >
            <div className="space-y-6 px-6 pb-6">
              <SheetHeader className="border-b border-border/60 px-0 pb-5 text-left">
                <SheetTitle className="text-2xl">
                  {formData.id ? "Update Department" : "Create Department"}
                </SheetTitle>
                <SheetDescription>
                  Configure the department identity, choose its image, and
                  assign a lead teacher.
                </SheetDescription>
              </SheetHeader>

              <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
                <div className="relative h-36">
                  {/* biome-ignore lint/performance/noImgElement: The preview supports arbitrary external image URLs during editing. */}
                  <img
                    src={formData.imageUrl.trim() || FALLBACK_DEPARTMENT_IMAGE}
                    alt={formData.name || "Department preview"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      Preview
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {formData.name.trim() || "New Department"}
                    </h3>
                  </div>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <BookOpenText className="h-4 w-4 text-primary" />
                      Department Story
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {formData.description.trim() ||
                        "Add a concise summary to explain what this department teaches and how it is positioned in the dashboard."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Users className="h-4 w-4 text-primary" />
                      Lead Preview
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="h-11 w-11">
                        <AvatarImage
                          src={currentTeacher?.image || ""}
                          alt={currentTeacher?.name || ""}
                        />
                        <AvatarFallback>
                          {getTeacherInitials(currentTeacher)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {currentTeacher?.name || "Select a teacher"}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {currentTeacher?.email ||
                            "Teacher email appears here"}
                        </p>
                        {currentTeacher && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Leads {currentTeacher.departmentCount} department
                            {currentTeacher.departmentCount === 1 ? "" : "s"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="department-name"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    Department Name
                  </Label>
                  <Input
                    id="department-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Computer Science"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department-description"
                    className="flex items-center gap-2"
                  >
                    <BookOpenText className="h-4 w-4 text-primary" />
                    Description
                  </Label>
                  <Textarea
                    id="department-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the department, curriculum focus, or administration notes."
                    className="min-h-28 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department-image"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Image URL
                  </Label>
                  <Input
                    id="department-image"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/department-cover.jpg"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department-teacher"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Lead Teacher
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData((current) => ({
                        ...current,
                        teacherId: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="department-teacher"
                      className="rounded-xl"
                    >
                      <SelectValue placeholder="Choose a lead teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => {
                        return (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.email}
                            {teacher.departmentCount > 0
                              ? ` (${teacher.departmentCount} departments)`
                              : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {teachers.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No teachers are available yet. Create a teacher first,
                      then return here.
                    </p>
                  )}
                  {teachers.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Teachers can now lead multiple departments, so you can
                      reuse the same teacher across the directory.
                    </p>
                  )}
                </div>

                {currentTeacher && (
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Teacher
                          </p>
                          <p className="font-medium">{currentTeacher.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Email
                          </p>
                          <p className="truncate font-medium">
                            {currentTeacher.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="border-t border-border/60 px-6 py-4">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={isSubmitting || teachers.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {formData.id ? "Save Changes" : "Create Department"}
                    </>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this department?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the department and its related
              students, exams, and results through the current database
              relations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Department
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsPage;
