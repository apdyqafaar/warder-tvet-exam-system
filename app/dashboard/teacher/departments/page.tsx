"use client";

import {
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Medal,
  Save,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DepartmentProgressChart from "@/components/dashboard/department-progress-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useTeacherDepartment,
  useUpdateTeacherDepartment,
} from "@/lib/hooks/use-teacher-department";
import type { DepartmentWithStats } from "@/lib/services/teacher/department.service";

const FALLBACK_DEPARTMENT_IMAGE = "/departments/it_img.jpeg";

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  gradient: string;
  loading: boolean;
}) => (
  <div className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm">
    <div
      className={`absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full blur-3xl ${gradient}`}
    />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-20" />
        ) : (
          <p className="mt-3 text-3xl font-bold">{value}</p>
        )}
        {!loading && (
          <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
        )}
      </div>
      <div className={`rounded-2xl p-3 text-white shadow-sm ${gradient}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

interface EditDepartmentSheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  department: DepartmentWithStats | null;
}

const EditDepartmentSheet = ({
  open,
  onOpenChange,
  department,
}: EditDepartmentSheetProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const updateMutation = useUpdateTeacherDepartment();

  useEffect(() => {
    if (!department || !open) {
      return;
    }

    setName(department.name ?? "");
    setDescription(department.description ?? "");
    setImageUrl(department.imageUrl ?? "");
    setErrors({});
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!department) {
      return;
    }

    if (!name.trim()) {
      setErrors({ name: "Department name is required" });
      return;
    }

    if (name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        departmentId: department.id,
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      toast.success("Department updated successfully");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update department",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l bg-background/98 px-0 sm:max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-full flex-col justify-between"
        >
          <div className="space-y-6 px-6 pb-6">
            <SheetHeader className="border-b border-border/60 px-0 pb-5 text-left">
              <SheetTitle className="text-2xl">Edit Department</SheetTitle>
              <SheetDescription>
                Update the selected department without leaving the
                multi-department workspace.
              </SheetDescription>
            </SheetHeader>

            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
              <div className="relative h-36">
                {/* biome-ignore lint/performance/noImgElement: The preview supports arbitrary external image URLs during editing. */}
                <img
                  src={imageUrl.trim() || FALLBACK_DEPARTMENT_IMAGE}
                  alt={name || "Department preview"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    Preview
                  </p>
                  <h3 className="text-xl font-bold text-white">
                    {name.trim() || "Department Name"}
                  </h3>
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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors({});
                    }
                  }}
                  placeholder="e.g. Computer Science"
                  className="rounded-xl"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="department-description"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                  Description
                </Label>
                <Textarea
                  id="department-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the department..."
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
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-border/60 px-6 py-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

const DepartmentsPage = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data, isLoading, isError } = useTeacherDepartment();

  const departments = data?.departments || [];
  const selectedDepartment =
    departments.find((department) => department.id === selectedDepartmentId) ||
    departments[0] ||
    null;

  useEffect(() => {
    if (departments.length === 0) {
      setSelectedDepartmentId(null);
      return;
    }

    const selectedStillExists = departments.some(
      (department) => department.id === selectedDepartmentId,
    );

    if (!selectedDepartmentId || !selectedStillExists) {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, selectedDepartmentId]);

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <h2 className="text-xl font-semibold">
            Unable to load your departments
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && departments.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-muted p-4 text-muted-foreground">
            <Layers3 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">No departments assigned yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Once an admin links departments to your account, they will appear
            here for navigation and editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Layers3 className="h-3.5 w-3.5" />
            Teacher Workspace
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Your Departments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Switch between every department you manage and update each one
              from a single screen.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsEditOpen(true)}
          disabled={isLoading || !selectedDepartment}
          className="self-start rounded-xl shadow-sm lg:self-auto"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Edit Selected Department
        </Button>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Department Navigator
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the department you want to inspect or edit.
            </p>
          </div>
          {!isLoading && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {departments.length} total
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {["one", "two", "three"].map((key) => (
              <Skeleton key={key} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => {
              const isActive = department.id === selectedDepartment?.id;

              return (
                <button
                  type="button"
                  key={department.id}
                  onClick={() => setSelectedDepartmentId(department.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border/70 bg-background hover:border-primary/30 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">
                        {department.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {department.stats.totalStudents} students •{" "}
                        {department.stats.totalExams} exams
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  {department.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {department.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDepartment && (
        <>
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="relative h-48 overflow-hidden">
              {/* biome-ignore lint/performance/noImgElement: Teacher department banners accept arbitrary external image URLs. */}
              <img
                src={selectedDepartment.imageUrl || FALLBACK_DEPARTMENT_IMAGE}
                alt={selectedDepartment.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute inset-x-6 bottom-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  Selected Department
                </p>
                <h2 className="text-3xl font-bold text-white">
                  {selectedDepartment.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                  {selectedDepartment.description ||
                    "Add a summary and cover image to give this department a stronger identity."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <StatCard
                icon={GraduationCap}
                label="Students"
                value={selectedDepartment.stats.totalStudents}
                sub="Enrolled learners in this department"
                gradient="bg-gradient-to-br from-primary to-cyan-600"
                loading={isLoading}
              />
              <StatCard
                icon={FileText}
                label="Exams"
                value={selectedDepartment.stats.totalExams}
                sub="Assessments created for this department"
                gradient="bg-gradient-to-br from-indigo-500 to-primary"
                loading={isLoading}
              />
              <StatCard
                icon={Layers3}
                label="Departments"
                value={departments.length}
                sub="Total departments assigned to your account"
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                loading={isLoading}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Department Progress
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Average exam scores for the currently selected department
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Data
              </div>
            </div>

            <DepartmentProgressChart
              data={selectedDepartment.stats.examScoresByMonth ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <BookOpen className="h-4 w-4 text-primary" />
                Overview
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-sm text-muted-foreground">
                    Department ID
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                    {selectedDepartment.id}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(
                      selectedDepartment.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-sm text-muted-foreground">
                    Students
                  </span>
                  <span className="text-sm font-medium">
                    {selectedDepartment.stats.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exams</span>
                  <span className="text-sm font-medium">
                    {selectedDepartment.stats.totalExams}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Monthly Completions
              </h3>

              {selectedDepartment.stats.examScoresByMonth.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-2xl bg-muted p-3 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No exam completions for this department yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedDepartment.stats.examScoresByMonth.map((row) => (
                    <div key={row.month} className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-xs font-semibold text-muted-foreground">
                        {row.month}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500"
                          style={{
                            width: `${Math.min(100, Number(row.avgScore || 0))}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-xs font-semibold">
                        {row.avgScore ?? 0}
                      </span>
                      <span className="w-16 shrink-0 text-xs text-muted-foreground">
                        {row.completedCount} exams
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Medal className="h-4 w-4 text-amber-500" />
                Top 5 Students
              </h3>

              {selectedDepartment.stats.topStudents.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-2xl bg-muted p-3 text-muted-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No completed exam scores for this department yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedDepartment.stats.topStudents.map(
                    (student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <p className="truncate text-sm font-semibold">
                              {student.fullName}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {student.studentNumber} • {student.completedExams}{" "}
                            completed exams
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {Number(student.averageScore).toFixed(1)}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            avg score
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <EditDepartmentSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        department={selectedDepartment}
      />
    </div>
  );
};

export default DepartmentsPage;
