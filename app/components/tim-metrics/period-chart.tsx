"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { timMetricsAPI, PeriodMetrics } from "./api-client"

const chartConfig = {
  interactions: {
    label: "Interacciones",
    color: "hsl(var(--chart-1))",
  },
  conversations: {
    label: "Conversaciones",
    color: "hsl(var(--chart-2))",
  },
  response_time: {
    label: "Tiempo Respuesta",
    color: "hsl(var(--chart-3))",
  },
}

interface PeriodChartProps {
  period: 'daily' | 'weekly' | 'monthly'
  clinicId?: string
  limit?: number
}

export function PeriodChart({ period, clinicId, limit = 30 }: PeriodChartProps) {
  const [data, setData] = useState<PeriodMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await timMetricsAPI.getPeriodMetrics(period, { clinicId, limit })
        setData(result)
      } catch (err) {
        console.error('Error fetching period metrics:', err)
        setError('Error al cargar las métricas del período')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period, clinicId, limit])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">Métricas {period === 'daily' ? 'Diarias' : period === 'weekly' ? 'Semanales' : 'Mensuales'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">Métricas {period === 'daily' ? 'Diarias' : period === 'weekly' ? 'Semanales' : 'Mensuales'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            {error || 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.metrics.map(m => ({
    period: m.period,
    interactions: m.automated_interactions.value,
    conversations: m.conversations.value,
    avgResponseTime: m.avg_response_time.value
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          Métricas {period === 'daily' ? 'Diarias' : period === 'weekly' ? 'Semanales' : 'Mensuales'}
          {data.filtered_by_clinic && <span className="text-sm text-gray-500 ml-2">(Clínica específica)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="interactions" 
                stroke="var(--color-interactions)" 
                strokeWidth={2}
                name="Interacciones Automatizadas"
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="var(--color-conversations)" 
                strokeWidth={2}
                name="Total Conversaciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}