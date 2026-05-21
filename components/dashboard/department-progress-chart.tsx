"use client"

import React from "react"
import { TrendingUp } from "lucide-react"

interface MonthData {
  month: string
  avgScore: number
  completedCount: number
}

interface DepartmentProgressChartProps {
  data: MonthData[]
  isLoading?: boolean
}

const FALLBACK: MonthData[] = [
  { month: "Jan", avgScore: 0, completedCount: 0 },
  { month: "Feb", avgScore: 0, completedCount: 0 },
  { month: "Mar", avgScore: 0, completedCount: 0 },
  { month: "Apr", avgScore: 0, completedCount: 0 },
  { month: "May", avgScore: 0, completedCount: 0 },
  { month: "Jun", avgScore: 0, completedCount: 0 },
]

const DepartmentProgressChart = ({
  data,
  isLoading = false,
}: DepartmentProgressChartProps) => {
  const chartData = data?.length > 0 ? data.slice(-6) : FALLBACK
  const maxScore = Math.max(...chartData.map((d) => Number(d.avgScore ?? 0)), 100)

  // SVG chart dimensions
  const width = 400
  const height = 140
  const paddingLeft = 28
  const paddingRight = 12
  const paddingTop = 10
  const paddingBottom = 28
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / Math.max(chartData.length - 1, 1)) * chartWidth
    const y = paddingTop + chartHeight - (Number(d.avgScore ?? 0) / maxScore) * chartHeight
    return { x, y, ...d }
  })

  // Build SVG path
  const linePath =
    points.length > 1
      ? points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ")
      : ""

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${paddingLeft.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
      : ""

  // Y axis labels: 0, 50, 100
  const yLabels = [100, 50, 0]

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse w-full h-[140px] bg-muted/50 rounded-lg" />
      </div>
    )
  }

  const hasData = data?.length > 0 && data.some((d) => Number(d.avgScore) > 0)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">
            Avg. Score per Month
          </span>
        </div>
        {hasData && (
          <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
            <TrendingUp className="h-3 w-3" />
            Active
          </div>
        )}
      </div>

      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.685 0.169 237.323)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map((label, i) => {
            const y = paddingTop + (i / (yLabels.length - 1)) * chartHeight
            return (
              <g key={label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                  strokeDasharray={i > 0 ? "3 3" : "0"}
                />
                <text
                  x={paddingLeft - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="8"
                  fill="currentColor"
                  fillOpacity="0.4"
                  className="font-mono"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#scoreGrad)" />
          )}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--color-primary)"
                stroke="var(--color-background)"
                strokeWidth="2"
                className="transition-all duration-200"
              />
              {/* Month label */}
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                fillOpacity="0.5"
                className="font-medium"
              >
                {p.month}
              </text>
              {/* Tooltip on hover via SVG title */}
              <title>{`${p.month}: avg ${Number(p.avgScore ?? 0).toFixed(1)} | ${p.completedCount} completed`}</title>
              {/* Invisible larger hit area */}
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
            </g>
          ))}
        </svg>

        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground/60 font-medium">
              No exam data available yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DepartmentProgressChart
