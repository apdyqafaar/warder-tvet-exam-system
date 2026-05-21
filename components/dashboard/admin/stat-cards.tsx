"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, GraduationCap, FileText } from "lucide-react";
import type { AdminDashboardCounts } from "@/lib/services/admin/dashboard.service";

interface StatCardsProps {
  counts: AdminDashboardCounts;
}

const stats = [
  {
    key: "departments" as const,
    label: "Departments",
    icon: Building,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    key: "teachers" as const,
    label: "Teachers",
    icon: Users,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    key: "students" as const,
    label: "Students",
    icon: GraduationCap,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    key: "exams" as const,
    label: "Total Exams",
    icon: FileText,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
];

export function StatCards({ counts }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = counts[stat.key];

        return (
          <Card
            key={stat.key}
            className="border border-border hover:border-primary/30 transition-colors duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">
                    {value}
                  </p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
