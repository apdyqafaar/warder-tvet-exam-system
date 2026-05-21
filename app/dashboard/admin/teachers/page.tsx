"use client";

import {
  AlertCircle,
  Building,
  Edit2,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminTeachers,
  useCreateAdminTeacher,
  useDeleteAdminTeacher,
  useUpdateAdminTeacher,
} from "@/lib/hooks/use-admin-teachers";
import type { TeacherListItem } from "@/lib/services/admin/teachers.service";

interface TeacherFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

const TeachersPage = () => {
  const { data, isLoading, isError } = useAdminTeachers();
  const createMutation = useCreateAdminTeacher();
  const updateMutation = useUpdateAdminTeacher();
  const deleteMutation = useDeleteAdminTeacher();

  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    email: "",
    password: "",
  });

  const teachers = data?.teachers || [];

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setSelectedTeacherId(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherListItem) => {
    setFormData({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      password: "",
    });
    setSelectedTeacherId(teacher.id);
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setSelectedTeacherId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required fields");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
    };

    if (selectedTeacherId) {
      toast.promise(
        updateMutation.mutateAsync({ id: selectedTeacherId, data: payload }),
        {
          loading: "Updating teacher details...",
          success: "Teacher updated successfully!",
          error: (err) => err.message || "Failed to update teacher",
        },
      );
    } else {
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      toast.promise(createMutation.mutateAsync(payload), {
        loading: "Creating teacher account...",
        success: "Teacher account created successfully!",
        error: (err) => err.message || "Failed to create teacher account",
      });
    }

    setIsSheetOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedTeacherId) return;

    toast.promise(deleteMutation.mutateAsync(selectedTeacherId), {
      loading: "Removing teacher...",
      success: "Teacher removed successfully!",
      error: (err) => err.message || "Failed to delete teacher",
    });
    setIsDeleteOpen(false);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.departmentNames.some((departmentName) =>
        departmentName.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Teachers Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic instructors and review every department attached to
            each teacher.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                All Teachers
              </CardTitle>
              <CardDescription>
                Teachers can now lead multiple departments. Use the departments
                dashboard to assign or reassign department ownership.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
              <h3 className="font-semibold">Error fetching teachers</h3>
              <p className="text-sm text-muted-foreground">
                Please refresh the page and try again.
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <User className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">No teachers found</h3>
              <p className="text-sm max-w-sm mt-1">
                Try searching for a different name, email, or department, or add
                a new teacher profile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {teacher.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {teacher.email}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Building className="h-3.5 w-3.5" />
                          Assigned Departments
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.departmentNames.length > 0 ? (
                            teacher.departmentNames.map((departmentName) => (
                              <Badge
                                key={`${teacher.id}-${departmentName}`}
                                variant="default"
                                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10"
                              >
                                {departmentName}
                              </Badge>
                            ))
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/10"
                            >
                              Unassigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Count
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {teacher.departmentCount}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(teacher)}
                          className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(teacher.id)}
                          className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <form
            onSubmit={handleSubmit}
            className="h-full flex flex-col justify-between"
          >
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>
                  {selectedTeacherId
                    ? "Edit Teacher Info"
                    : "Register Teacher Account"}
                </SheetTitle>
                <SheetDescription>
                  {selectedTeacherId
                    ? "Update profile details. Department ownership is now managed from the departments dashboard."
                    : "Create a new teacher account. You can assign this teacher to multiple departments from the departments dashboard."}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="teacher@wardheer.edu"
                    required
                  />
                </div>

                {!selectedTeacherId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                )}

                <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Building className="h-4 w-4 text-primary" />
                    Department Ownership
                  </div>
                  <p className="mt-2">
                    Teachers can now manage many departments. Assign or reassign
                    them from the departments dashboard where each department
                    chooses its lead teacher.
                  </p>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-6 flex sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {selectedTeacherId ? "Save Changes" : "Create Account"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the teacher's login credentials and
              terminate active sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeachersPage;
