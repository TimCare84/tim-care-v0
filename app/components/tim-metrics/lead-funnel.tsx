"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { LeadMetrics } from "./api-client"

interface LeadFunnelProps {
  data: LeadMetrics
  loading?: boolean
}

interface FunnelStageProps {
  stage: {
    name: string
    value: number
    percentage: string
    tooltip: string
  }
  isLast?: boolean
  maxValue: number
}

function FunnelStage({ stage, isLast, maxValue }: FunnelStageProps) {
  const progressValue = maxValue > 0 ? (stage.value / maxValue) * 100 : 0

  return (
    <div className="relative">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <h3 className="font-medium text-gray-900">{stage.name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{stage.value}</span>
                <span className="text-sm text-gray-500">({stage.percentage}%)</span>
              </div>
              <Progress value={progressValue} className="mt-2 h-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{stage.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {!isLast && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"></div>
        </div>
      )}
    </div>
  )
}

export function LeadFunnel({ data, loading }: LeadFunnelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Embudo de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stages = [
    {
      name: 'Agendados/Pagados',
      value: data.lead_metrics.lead_stages.scheduled_paid.value,
      percentage: data.lead_metrics.lead_stages.scheduled_paid.percentage,
      tooltip: data.lead_metrics.lead_stages.scheduled_paid.tooltip
    },
    {
      name: 'Confirmados',
      value: data.lead_metrics.lead_stages.confirmed.value,
      percentage: data.lead_metrics.lead_stages.confirmed.percentage,
      tooltip: data.lead_metrics.lead_stages.confirmed.tooltip
    },
    {
      name: 'Asistidos',
      value: data.lead_metrics.lead_stages.attended.value,
      percentage: data.lead_metrics.lead_stages.attended.percentage,
      tooltip: data.lead_metrics.lead_stages.attended.tooltip
    }
  ]

  const maxValue = Math.max(...stages.map(s => s.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de Conversión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <FunnelStage
              key={stage.name}
              stage={stage}
              isLast={index === stages.length - 1}
              maxValue={maxValue}
            />
          ))}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Tasa de Conversión General:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xl font-bold text-green-600 cursor-help">
                    {data.conversion_funnel.overall_conversion_rate.value}%
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{data.conversion_funnel.overall_conversion_rate.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-600">Lead → Agendado</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-lg font-semibold text-blue-600 cursor-help">
                      {data.conversion_funnel.lead_to_scheduled.value}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{data.conversion_funnel.lead_to_scheduled.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600">Agendado → Confirmado</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-lg font-semibold text-blue-600 cursor-help">
                      {data.conversion_funnel.scheduled_to_confirmed.value}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{data.conversion_funnel.scheduled_to_confirmed.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600">Confirmado → Asistido</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-lg font-semibold text-blue-600 cursor-help">
                      {data.conversion_funnel.confirmed_to_attended.value}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{data.conversion_funnel.confirmed_to_attended.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}