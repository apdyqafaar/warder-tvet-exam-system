"use client";
import { useUser } from "@/lib/context/useProvider";
import { useAdminDashboard } from "@/lib/hooks/use-admin-dashboard";
import { StatCards } from "@/components/dashboard/admin/stat-cards";
import { BestDepartmentCard } from "@/components/dashboard/admin/best-department-card";
import { ExamStatusSummary } from "@/components/dashboard/admin/exam-status-summary";
import { LatestExamsTable } from "@/components/dashboard/admin/latest-exams-table";
import { DepartmentOverview } from "@/components/dashboard/admin/department-overview";
import { DashboardSkeleton } from "@/components/dashboard/admin/dashboard-skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboardPage = () => {
  const user = useUser();
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full border border-destructive/50 rounded-lg p-6 bg-destructive/5 space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h3 className="font-bold text-lg">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load dashboard data. Please try again."}
          </p>
          <Button onClick={() => refetch()} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is an overview of the platform's academic departments, teachers, students, and exams.
        </p>
      </div>

      {/* Stats Cards */}
      {data?.counts && <StatCards counts={data.counts} />}

      {/* Main Grid for Best Department & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestDepartmentCard department={data?.bestDepartment || null} />
        {data?.examStatusSummary && (
          <ExamStatusSummary summary={data.examStatusSummary} />
        )}
      </div>

      {/* Latest Exams Table */}
      {data?.latestExams && <LatestExamsTable exams={data.latestExams} />}

      {/* Department Breakdown Overview */}
      {data?.departmentBreakdown && (
        <DepartmentOverview departments={data.departmentBreakdown} />
      )}
    </div>
  );
};

export default AdminDashboardPage;
