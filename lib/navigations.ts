import {
  LayoutDashboard,
  Building,
  Users,
  GraduationCap,
  FileText
} from "lucide-react";

export const getNavigations = (role: string) => {
  if (role === "admin") {
    return [
      { name: "Dashboard", route: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Departments", route: "/dashboard/admin/departments", icon: Building },
      { name: "Teachers", route: "/dashboard/admin/teachers", icon: Users },
      { name: "Students", route: "/dashboard/admin/students", icon: GraduationCap },
      { name: "Exams", route: "/dashboard/admin/exams", icon: FileText },
    ];
  } else if (role === "teacher") {
    return [
      { name: "Your Department", route: "/dashboard/teacher/departments", icon: Building },
      { name: "Students", route: "/dashboard/teacher/students", icon: GraduationCap },
      { name: "Exams", route: "/dashboard/teacher/exams", icon: FileText },
    ];
  }

  return [];
};
