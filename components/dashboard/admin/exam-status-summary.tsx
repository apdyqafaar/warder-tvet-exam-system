"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { ExamStatusSummary as ExamStatusType } from "@/lib/services/admin/dashboard.service";

interface ExamStatusSummaryProps {
  summary: ExamStatusType;
}

const statusConfig = [
  { key: "published" as const, label: "Published", color: "bg-chart-2" },
  { key: "draft" as const, label: "Draft", color: "bg-chart-4" },
  { key: "closed" as const, label: "Closed", color: "bg-destructive" },
];

export function ExamStatusSummary({ summary }: ExamStatusSummaryProps) {
  const total = summary.draft + summary.published + summary.closed;

  return (
    <Card className="border border-border hover:border-primary/30 transition-colors duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Exam Status Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status bar */}
        {total > 0 ? (
          <div className="h-3 bg-muted rounded-full overflow-hidden flex">
            {statusConfig.map((config) => {
              const count = summary[config.key];
              const percent = total > 0 ? (count / total) * 100 : 0;
              if (percent === 0) return null;

              return (
                <div
                  key={config.key}
                  className={`${config.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${percent}%` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-3 bg-muted rounded-full" />
        )}

        {/* Legend with counts */}
        <div className="space-y-3">
          {statusConfig.map((config) => {
            const count = summary[config.key];
            const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

            return (
              <div key={config.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-sm ${config.color}`} />
                  <span className="text-sm text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{count}</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Exams</span>
          <span className="text-lg font-bold">{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
