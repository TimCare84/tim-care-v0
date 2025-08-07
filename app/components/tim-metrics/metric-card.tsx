"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface MetricWithTooltip {
  value: number
  unit: string
  description: string
  tooltip: string
}

interface TimeMetricWithTooltip {
  value_minutes: number
  value_hours: number
  unit: string
  description: string
  tooltip: string
}

interface MetricCardProps {
  title: string
  metric: MetricWithTooltip | TimeMetricWithTooltip
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export function MetricCard({ title, metric, icon, trend, loading }: MetricCardProps) {
  const isTimeMetric = 'value_minutes' in metric
  const displayValue = isTimeMetric ? metric.value_hours : metric.value
  const displayUnit = isTimeMetric ? 'horas' : metric.unit

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{metric.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
          ) : (
            <div className={`text-2xl font-bold ${getTrendColor()}`}>
              {displayValue.toLocaleString()}
              <span className="text-sm font-normal ml-1">{displayUnit}</span>
            </div>
          )}
          <p className="text-xs text-gray-600">{metric.description}</p>
          {isTimeMetric && (
            <p className="text-xs text-gray-500">
              ({metric.value_minutes} minutos)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}