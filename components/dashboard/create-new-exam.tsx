"use client";

import {
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateExam } from "@/lib/hooks/use-teacher-exams";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";

interface DepartmentOption {
  id: string;
  name: string;
}

interface CreateNewExamProps {
  departments: DepartmentOption[];
  selectedDepartmentId?: string;
}

const CreateNewExam = ({
  departments,
  selectedDepartmentId,
}: CreateNewExamProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [departmentId, setDepartmentId] = useState(selectedDepartmentId || "");
  const [errors, setErrors] = useState<{
    title?: string;
    duration?: string;
    departmentId?: string;
  }>({});

  const createExamMutation = useCreateExam();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDepartmentId(selectedDepartmentId || departments[0]?.id || "");
  }, [departments, open, selectedDepartmentId]);

  const validate = () => {
    const newErrors: {
      title?: string;
      duration?: string;
      departmentId?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Exam title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    const durationNum = Number.parseInt(duration, 10);
    if (!duration) {
      newErrors.duration = "Duration is required";
    } else if (Number.isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = "Duration must be a positive number of minutes";
    }

    if (!departmentId) {
      newErrors.departmentId = "Please select a department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please correct the validation errors");
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        duration: Number.parseInt(duration, 10),
        departmentId,
      });

      toast.success("Exam created successfully");
      setTitle("");
      setDescription("");
      setDuration("");
      setErrors({});
      setOpen(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create exam. Please try again.",
      );
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group font-semibold"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
        Create Exam
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md border-l bg-background/95 backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl animate-in fade-in-50 duration-200">
          <div className="space-y-6 overflow-y-auto pr-1">
            <SheetHeader className="p-0 space-y-1">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Create New Exam
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                Define the primary structure and settings for the new
                assessment.
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 rounded-xl border bg-card/50 backdrop-blur-xs shadow-2xs space-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-primary/10 duration-500" />
              <div className="flex items-start gap-3 relative">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                    Target Department
                  </span>
                  <h4 className="text-sm font-semibold text-foreground leading-snug">
                    {departments.find(
                      (department) => department.id === departmentId,
                    )?.name || "Select department"}
                  </h4>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              id="create-exam-form"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="exam-department"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Department
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger
                    id="exam-department"
                    className={errors.departmentId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-150">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="exam-title"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> Exam Title
                </Label>
                <Input
                  id="exam-title"
                  placeholder="e.g. Midterm Programming Exam"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={`h-10 transition-all duration-200 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                    errors.title
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10"
                      : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-150">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="exam-duration"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" /> Duration (Minutes)
                </Label>
                <div className="relative">
                  <Input
                    id="exam-duration"
                    type="number"
                    min="1"
                    placeholder="e.g. 60"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      if (errors.duration)
                        setErrors((prev) => ({ ...prev, duration: undefined }));
                    }}
                    className={`h-10 transition-all duration-200 pr-12 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                      errors.duration
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10"
                        : ""
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-xs text-muted-foreground font-medium">
                      min
                    </span>
                  </div>
                </div>
                {errors.duration && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-150">
                    {errors.duration}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="exam-description"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90"
                >
                  Description / Instructions
                </Label>
                <Textarea
                  id="exam-description"
                  placeholder="Provide instructions or background info for students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] max-h-[200px] border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 transition-all duration-200"
                />
              </div>
            </form>
          </div>

          <SheetFooter className="p-0 border-t pt-4 flex flex-row items-center gap-3 sm:justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-initial h-10 font-semibold border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-exam-form"
              disabled={
                createExamMutation.isLoading || departments.length === 0
              }
              className="flex-1 sm:flex-initial h-10 font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-primary-foreground shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {createExamMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Exam
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CreateNewExam;
