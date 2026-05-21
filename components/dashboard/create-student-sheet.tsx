"use client";

import {
  Building2,
  ChevronRight,
  GraduationCap,
  Hash,
  Loader2,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useCreateStudent } from "@/lib/hooks/use-teacher-students";

interface DepartmentOption {
  id: string;
  name: string;
}

interface CreateStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generateCode: () => string;
  departments: DepartmentOption[];
  selectedDepartmentId?: string;
}

const CreateStudentSheet = ({
  open,
  onOpenChange,
  generateCode,
  departments,
  selectedDepartmentId,
}: CreateStudentSheetProps) => {
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [departmentId, setDepartmentId] = useState(selectedDepartmentId || "");
  const [errors, setErrors] = useState<{
    fullName?: string;
    studentNumber?: string;
    departmentId?: string;
  }>({});

  const createMutation = useCreateStudent();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDepartmentId(selectedDepartmentId || departments[0]?.id || "");
  }, [departments, open, selectedDepartmentId]);

  const validate = () => {
    const newErrors: {
      fullName?: string;
      studentNumber?: string;
      departmentId?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    if (!studentNumber.trim()) {
      newErrors.studentNumber = "Student number is required";
    } else if (studentNumber.trim().length < 2) {
      newErrors.studentNumber = "Student number must be at least 2 characters";
    }

    if (!departmentId) {
      newErrors.departmentId = "Please select a department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
        departmentId,
      });
      toast.success("Student added successfully");
      setFullName("");
      setStudentNumber("");
      setErrors({});
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create student",
      );
    }
  };

  const handleClose = () => {
    setFullName("");
    setStudentNumber("");
    setDepartmentId(selectedDepartmentId || departments[0]?.id || "");
    setErrors({});
    onOpenChange(false);
  };

  const handleGenerateCode = () => {
    setStudentNumber(generateCode());
    if (errors.studentNumber) {
      setErrors((prev) => ({ ...prev, studentNumber: undefined }));
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md border-l bg-background/95 backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6 overflow-y-auto pr-1">
          <SheetHeader className="p-0 space-y-1">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Add New Student
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Register a new student and place them in one of your departments.
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 rounded-xl border bg-card/50 backdrop-blur-xs shadow-2xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-primary/10 duration-500" />
            <div className="flex items-center gap-3 relative">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                  New Student
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fill in the details below to enroll a student
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            id="create-student-form"
          >
            <div className="space-y-2">
              <Label
                htmlFor="student-department"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" /> Department
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger
                  id="student-department"
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
                htmlFor="student-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input
                id="student-name"
                placeholder="e.g. Ahmed Mohamed Ali"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName)
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                className={`h-10 transition-all duration-200 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                  errors.fullName
                    ? "border-destructive focus-visible:border-destructive"
                    : ""
                }`}
              />
              {errors.fullName && (
                <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="student-number"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
              >
                <Hash className="h-3.5 w-3.5" /> Student Number
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleGenerateCode}
                  className="h-6 w-6 hover:bg-muted/50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </Label>
              <Input
                id="student-number"
                placeholder="e.g. STU-2024-001"
                value={studentNumber}
                onChange={(e) => {
                  setStudentNumber(e.target.value);
                  if (errors.studentNumber)
                    setErrors((prev) => ({
                      ...prev,
                      studentNumber: undefined,
                    }));
                }}
                className={`h-10 transition-all duration-200 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-primary/10 ${
                  errors.studentNumber
                    ? "border-destructive focus-visible:border-destructive"
                    : ""
                }`}
              />
              {errors.studentNumber && (
                <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.studentNumber}
                </p>
              )}
            </div>
          </form>
        </div>

        <SheetFooter className="p-0 border-t pt-4 flex flex-row items-center gap-3 sm:justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 sm:flex-initial h-10 font-semibold border-muted-foreground/20 hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-student-form"
            disabled={createMutation.isLoading}
            className="flex-1 sm:flex-initial h-10 font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-primary-foreground shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {createMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add Student
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateStudentSheet;
