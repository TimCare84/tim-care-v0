"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { RefreshCw, Bot, MessageCircle, Clock, TrendingUp, InfoIcon } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getTotalPatients,
  getPatientsNeedingIntervention,
  getPendingAppointments,
  getAttendanceRate,
  getPatientsWithAppointments,
  getAppointmentsByHour,
  getAppointmentsByDay,
  getAppointmentsByWeek,
} from "@/lib/querys"
import { MetricCard } from "./tim-metrics/metric-card"
import { PeriodChart } from "./tim-metrics/period-chart"
import { LeadFunnel } from "./tim-metrics/lead-funnel"
import { ClinicMetricsTable } from "./tim-metrics/clinic-metrics-table"
import { timMetricsAPI, BasicMetrics, ExecutiveSummary, LeadMetrics } from "./tim-metrics/api-client"

const chartConfig = {
  agendados: {
    label: "Agendados",
    color: "hsl(var(--chart-1))",
  },
  asistieron: {
    label: "Asistieron",
    color: "hsl(var(--chart-2))",
  },
}

// Datos mock - se reemplazarán con datos reales
const defaultDataByFilter = {
  hora: [
    { time: "6:00", agendados: 0, asistieron: 0 },
    { time: "9:00", agendados: 0, asistieron: 0 },
    { time: "12:00", agendados: 0, asistieron: 0 },
    { time: "15:00", agendados: 0, asistieron: 0 },
  ],
  diario: [
    { time: "Sin datos", agendados: 0, asistieron: 0 },
  ],
  semanal: [
    { time: "Sin datos", agendados: 0, asistieron: 0 },
  ],
}

interface DashboardStats {
  totalPatients: number
  attendanceRate: number
  pendingAppointments: number
  needsIntervention: number
  patientsWithAppointments: number
}

interface ChartData {
  time: string
  agendados: number
  asistieron: number
}

interface DashboardProps {
  clinicId?: string | null
}

export function Dashboard({ clinicId }: DashboardProps) {
  const [activeFilter, setActiveFilter] = useState<"hora" | "diario" | "semanal">("diario")
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    attendanceRate: 0,
    pendingAppointments: 0,
    needsIntervention: 0,
    patientsWithAppointments: 0
  })
  const [chartData, setChartData] = useState<Record<string, ChartData[]>>(defaultDataByFilter)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para métricas TIM
  const [basicMetrics, setBasicMetrics] = useState<BasicMetrics | null>(null)
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null)
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics | null>(null)
  const [timLoading, setTimLoading] = useState(true)

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        totalPatients,
        // attendanceRate,
        pendingAppointments,
        // needsIntervention,
        patientsWithAppointments
      ] = await Promise.all([
        getTotalPatients(),
        // getAttendanceRate(),
        getPendingAppointments(),
        // getPatientsNeedingIntervention(),
        getPatientsWithAppointments()
      ])


      setStats({
        totalPatients,
        attendanceRate: 0,
        pendingAppointments,
        needsIntervention: 0,
        patientsWithAppointments
      })


      // Cargar datos de gráficos por defecto (diario)
      await loadChartData("diario")
      
      // Cargar datos TIM
      await loadTimMetrics()
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar métricas TIM
  const loadTimMetrics = async () => {
    try {
      setTimLoading(true)
      
      const filters = clinicId ? { clinicId } : undefined
      
      const [basic, executive, leads] = await Promise.all([
        timMetricsAPI.getBasicMetrics(filters),
        timMetricsAPI.getExecutiveSummary(clinicId || undefined),
        timMetricsAPI.getLeadMetrics(filters)
      ])

      setBasicMetrics(basic)
      setExecutiveSummary(executive)
      setLeadMetrics(leads)
    } catch (err) {
      console.error('Error loading TIM metrics:', err)
    } finally {
      setTimLoading(false)
    }
  }

  // Función para cargar datos de gráficos según el filtro
  const loadChartData = async (filter: "hora" | "diario" | "semanal") => {
    try {
      setChartLoading(true)
      let data: ChartData[] = []

      switch (filter) {
        case "hora":
          data = await getAppointmentsByHour()
          break
        case "diario":
          data = await getAppointmentsByDay()
          break
        case "semanal":
          data = await getAppointmentsByWeek()
          break
      }

      setChartData(prev => ({
        ...prev,
        [filter]: data.length > 0 ? data : defaultDataByFilter[filter]
      }))
    } catch (err) {
      console.error(`Error loading ${filter} chart data:`, err)
      // Usar datos por defecto en caso de error
      setChartData(prev => ({
        ...prev,
        [filter]: defaultDataByFilter[filter]
      }))
    } finally {
      setChartLoading(false)
    }
  }

  // Manejar cambio de filtro
  const handleFilterChange = async (filter: "hora" | "diario" | "semanal") => {
    setActiveFilter(filter)

    // Solo cargar datos si no los tenemos en cache
    if (!chartData[filter] || chartData[filter] === defaultDataByFilter[filter]) {
      await loadChartData(filter)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Recargar métricas TIM cuando cambie clinicId
  useEffect(() => {
    if (clinicId !== null) {
      loadTimMetrics()
    }
  }, [clinicId])

  return (
    <TooltipProvider>
      <div className="h-full w-full overflow-auto">
        <div className="p-6 space-y-6 min-h-full">
          {/* Header con título y controles */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              {clinicId && (
                <p className="text-sm text-gray-600 mt-1">
                  Filtrado por clínica: <span className="font-semibold">{clinicId}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
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
              {/* <div className="flex space-x-2">
                {(["hora", "diario", "semanal"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(filter)}
                    disabled={chartLoading}
                    className="capitalize"
                  >
                    Por {filter}
                  </Button>
                ))}
              </div> */}
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Tarjetas de resumen */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    stats.totalPatients
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Pacientes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-indigo-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    stats.patientsWithAppointments
                  )}
                </div>
                <div className="text-sm text-gray-600">Con Citas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    `${stats.pendingAppointments > 0 ? 100 : 0}%`
                  )}
                </div>
                <div className="text-sm text-gray-600">Tasa de Asistencia</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    stats.pendingAppointments
                  )}
                </div>
                <div className="text-sm text-gray-600">Citas Pendientes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    stats.needsIntervention
                  )}
                </div>
                <div className="text-sm text-gray-600">Requieren Atención</div>
              </CardContent>
            </Card>
          </div> */}

          {/* Gráficos de citas */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Número de pacientes que agendaron cita</CardTitle>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData[activeFilter]}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="agendados" fill="var(--color-agendados)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Número de pacientes que asistieron a la cita</CardTitle>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData[activeFilter]}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="asistieron" fill="var(--color-asistieron)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div> */}

          {/* Tabs para Métricas TIM */}
          <div className="w-full">
            <Tabs defaultValue="tim-metrics" className="w-full">
              <TabsList className={`grid w-full ${clinicId ? 'grid-cols-3' : 'grid-cols-4'}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="tim-metrics">Métricas TIM</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Métricas principales de TIM: tiempo de respuesta, interacciones automatizadas, conversaciones y resumen ejecutivo</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="period-analysis">Análisis Temporal</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Gráficos de evolución de métricas TIM por día, semana o mes para identificar tendencias</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="lead-conversion">Conversión de Leads</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Embudo de conversión que muestra el progreso de leads desde contacto inicial hasta cita asistida</p>
                  </TooltipContent>
                </Tooltip>
                
                {!clinicId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="clinic-ranking">Ranking de Clínicas</TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Comparativo de rendimiento entre todas las clínicas mostrando métricas clave de cada una</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TabsList>

              <TabsContent value="tim-metrics" className="space-y-6">
                {basicMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title="Tiempo de Respuesta Promedio"
                      metric={basicMetrics.metrics.avg_response_time}
                      icon={<Clock className="h-5 w-5" />}
                      loading={timLoading}
                    />
                    <MetricCard
                      title="Interacciones Automatizadas"
                      metric={basicMetrics.metrics.automated_interactions}
                      icon={<Bot className="h-5 w-5" />}
                      loading={timLoading}
                      trend="up"
                    />
                    <MetricCard
                      title="Tiempo Ahorrado"
                      metric={basicMetrics.metrics.time_saved}
                      icon={<TrendingUp className="h-5 w-5" />}
                      loading={timLoading}
                      trend="up"
                    />
                    <MetricCard
                      title="Total Conversaciones"
                      metric={basicMetrics.metrics.total_conversations}
                      icon={<MessageCircle className="h-5 w-5" />}
                      loading={timLoading}
                    />
                  </div>
                )}

                {/* Resumen Ejecutivo */}
                {executiveSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen Ejecutivo TIM</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Actividad Reciente */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-700">Actividad Reciente</h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Número de interacciones automatizadas realizadas por TIM en diferentes períodos</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Hoy:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{executiveSummary.executive_summary.recent_activity.interactions_today.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_today.value}</span>
                            </div>
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Últimos 7 días:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{executiveSummary.executive_summary.recent_activity.interactions_last_7d.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_last_7d.value}</span>
                            </div>
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Últimos 30 días:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{executiveSummary.executive_summary.recent_activity.interactions_last_30d.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="font-semibold">{executiveSummary.executive_summary.recent_activity.interactions_last_30d.value}</span>
                            </div>
                          </div>
                        </div>

                        {/* Indicadores de Rendimiento */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-700">Indicadores de Rendimiento</h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Métricas que evalúan la eficiencia y efectividad del asistente TIM</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Score de Eficiencia:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{executiveSummary.performance_indicators.efficiency_score.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="font-semibold text-green-600">{executiveSummary.performance_indicators.efficiency_score.value}</span>
                            </div>
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Interacciones/Conversación:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{executiveSummary.performance_indicators.avg_interactions_per_conversation.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-700">Tiempo Ahorrado</h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Tiempo total ahorrado gracias a las respuestas automatizadas de TIM, calculado en diferentes unidades</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">Minutos:</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{executiveSummary.executive_summary.total_time_saved.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
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
              </TabsContent>

              <TabsContent value="period-analysis" className="space-y-6">
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Diario</TabsTrigger>
                    <TabsTrigger value="weekly">Semanal</TabsTrigger>
                    <TabsTrigger value="monthly">Mensual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="daily" className="mt-4">
                    <PeriodChart period="daily" clinicId={clinicId || undefined} />
                  </TabsContent>
                  <TabsContent value="weekly" className="mt-4">
                    <PeriodChart period="weekly" clinicId={clinicId || undefined} />
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-4">
                    <PeriodChart period="monthly" clinicId={clinicId || undefined} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="lead-conversion" className="space-y-6">
                {leadMetrics && <LeadFunnel data={leadMetrics} loading={timLoading} />}
              </TabsContent>

              {!clinicId && (
                <TabsContent value="clinic-ranking" className="space-y-6">
                  <ClinicMetricsTable />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
