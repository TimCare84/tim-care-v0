"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Bot, MessageCircle, Clock, TrendingUp } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MetricCard } from "./metric-card"
import { PeriodChart } from "./period-chart"
import { LeadFunnel } from "./lead-funnel"
import { ClinicMetricsTable } from "./clinic-metrics-table"
import { timMetricsAPI, BasicMetrics, ExecutiveSummary, LeadMetrics, MetricFilters } from "./api-client"

export function TimDashboard() {
  const [selectedClinic, setSelectedClinic] = useState<string>("")
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({
    from: "",
    to: ""
  })
  const [basicMetrics, setBasicMetrics] = useState<BasicMetrics | null>(null)
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null)
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const buildFilters = (): MetricFilters => ({
    clinicId: selectedClinic || undefined,
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined
  })

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = buildFilters()
      
      const [basic, executive, leads] = await Promise.all([
        timMetricsAPI.getBasicMetrics(filters),
        timMetricsAPI.getExecutiveSummary(selectedClinic || undefined),
        timMetricsAPI.getLeadMetrics(filters)
      ])

      setBasicMetrics(basic)
      setExecutiveSummary(executive)
      setLeadMetrics(leads)
    } catch (err) {
      console.error('Error loading TIM dashboard data:', err)
      setError('Error al cargar las métricas de TIM')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [selectedClinic, dateRange])

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Métricas TIM</h2>
          <p className="text-gray-600">Panel de métricas de automatización e inteligencia artificial</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic">Clínica</Label>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger id="clinic">
                  <SelectValue placeholder="Todas las clínicas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las clínicas</SelectItem>
                  {/* TODO: Cargar clínicas dinámicamente */}
                  <SelectItem value="clinic-1">Clínica Ejemplo 1</SelectItem>
                  <SelectItem value="clinic-2">Clínica Ejemplo 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-from">Fecha Desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-to">Fecha Hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Métricas Básicas */}
      {basicMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tiempo de Respuesta Promedio"
            metric={basicMetrics.metrics.avg_response_time}
            icon={<Clock className="h-5 w-5" />}
            loading={loading}
          />
          <MetricCard
            title="Interacciones Automatizadas"
            metric={basicMetrics.metrics.automated_interactions}
            icon={<Bot className="h-5 w-5" />}
            loading={loading}
            trend="up"
          />
          <MetricCard
            title="Tiempo Ahorrado"
            metric={basicMetrics.metrics.time_saved}
            icon={<TrendingUp className="h-5 w-5" />}
            loading={loading}
            trend="up"
          />
          <MetricCard
            title="Total Conversaciones"
            metric={basicMetrics.metrics.total_conversations}
            icon={<MessageCircle className="h-5 w-5" />}
            loading={loading}
          />
        </div>
      )}

      {/* Resumen Ejecutivo */}
      {executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Actividad Reciente */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Actividad Reciente</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hoy:</span>
                    <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_today.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Últimos 7 días:</span>
                    <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_last_7d.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Últimos 30 días:</span>
                    <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_last_30d.value}</span>
                  </div>
                </div>
              </div>

              {/* Indicadores de Rendimiento */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Indicadores</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Score de Eficiencia:</span>
                    <span className="font-semibold text-green-600">{executiveSummary.performance_indicators.efficiency_score.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interacciones/Conversación:</span>
                    <span className="font-semibold text-blue-600">
                      {typeof executiveSummary.performance_indicators.avg_interactions_per_conversation.value === 'number' 
                        ? executiveSummary.performance_indicators.avg_interactions_per_conversation.value.toFixed(1)
                        : executiveSummary.performance_indicators.avg_interactions_per_conversation.value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiempo Ahorrado Detallado */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Tiempo Ahorrado</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Minutos:</span>
                    <span className="font-semibold">{executiveSummary.executive_summary.total_time_saved.minutes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas:</span>
                    <span className="font-semibold">{executiveSummary.executive_summary.total_time_saved.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Días laborales:</span>
                    <span className="font-semibold text-green-600">{executiveSummary.executive_summary.total_time_saved.work_days}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis Temporal */}
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Diario</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensual</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <PeriodChart period="daily" clinicId={selectedClinic || undefined} />
        </TabsContent>
        <TabsContent value="weekly">
          <PeriodChart period="weekly" clinicId={selectedClinic || undefined} />
        </TabsContent>
        <TabsContent value="monthly">
          <PeriodChart period="monthly" clinicId={selectedClinic || undefined} />
        </TabsContent>
      </Tabs>

      {/* Análisis de Conversión */}
      {leadMetrics && (
        <LeadFunnel data={leadMetrics} loading={loading} />
      )}

      {/* Ranking de Clínicas */}
      <ClinicMetricsTable dateRange={{
        dateFrom: dateRange.from || undefined,
        dateTo: dateRange.to || undefined
      }} />
      </div>
    </TooltipProvider>
  )
}