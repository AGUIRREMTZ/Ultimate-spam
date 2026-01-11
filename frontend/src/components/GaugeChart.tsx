"use client"

import { useMemo } from "react"

interface GaugeChartProps {
  value: number
}

export function GaugeChart({ value }: GaugeChartProps) {
  const rotation = useMemo(() => (value / 100) * 180 - 90, [value])
  const color = useMemo(() => {
    if (value < 30) return "#10b981"
    if (value < 70) return "#f59e0b"
    return "#ef4444"
  }, [value])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${value * 2.51} 251`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${rotation} 100 100)`}
          style={{ transition: "transform 0.5s ease" }}
        />
        <circle cx="100" cy="100" r="8" fill="white" />
        {/* Labels */}
        <text x="20" y="115" fill="white" fontSize="12" textAnchor="middle">
          Ham
        </text>
        <text x="100" y="20" fill="white" fontSize="12" textAnchor="middle">
          Uncertain
        </text>
        <text x="180" y="115" fill="white" fontSize="12" textAnchor="middle">
          Spam
        </text>
      </svg>
    </div>
  )
}
