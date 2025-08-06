"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { RefreshCw } from "lucide-react"
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

export function Dashboard() {
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

      // console.log(totalPatients, pendingAppointments, patientsWithAppointments)

      setStats({
        totalPatients,
        attendanceRate: 0,
        pendingAppointments,
        needsIntervention: 0,
        patientsWithAppointments
      })


      // Cargar datos de gráficos por defecto (diario)
      await loadChartData("diario")
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
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
          <div className="flex space-x-2">
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Bar dataKey="agendados" fill="var(--color-asistieron)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                `${stats.pendingAppointments > 0 ? 100 : 0}%` //cambiar por los % por ahora todas van 100%
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
      </div>
    </div>
  )
}
