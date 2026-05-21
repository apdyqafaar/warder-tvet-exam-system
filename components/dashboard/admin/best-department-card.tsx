"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { BestDepartment } from "@/lib/services/admin/dashboard.service";

interface BestDepartmentCardProps {
  department: BestDepartment | null;
}

export function BestDepartmentCard({ department }: BestDepartmentCardProps) {
  if (!department) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Performing Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No exam data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const scorePercent = Math.min(Number(department.avgScore), 100);

  return (
    <Card className="border border-border hover:border-primary/30 transition-colors duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performing Department
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{department.departmentName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Highest average exam score across all departments
          </p>
        </div>

        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average Score</span>
            <span className="font-semibold text-primary">
              {scorePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-6 pt-2 border-t border-border">
          <div>
            <p className="text-2xl font-bold">{department.studentCount}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{department.examCount}</p>
            <p className="text-xs text-muted-foreground">Exams</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
