"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import type { DepartmentBreakdown } from "@/lib/services/admin/dashboard.service";

interface DepartmentOverviewProps {
  departments: DepartmentBreakdown[];
}

export function DepartmentOverview({ departments }: DepartmentOverviewProps) {
  const maxStudents = Math.max(...departments.map((d) => d.studentCount), 1);

  if (departments.length === 0) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No departments found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          Department Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const barWidth =
              maxStudents > 0
                ? Math.max((dept.studentCount / maxStudents) * 100, 4)
                : 4;

            return (
              <div
                key={dept.id}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors duration-200"
              >
                <h4 className="font-semibold text-sm truncate">{dept.name}</h4>

                {/* Student bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Students</span>
                    <span className="font-medium text-foreground">
                      {dept.studentCount}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-2 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Exam count */}
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Exams</span>
                  <span className="font-medium text-foreground">
                    {dept.examCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
