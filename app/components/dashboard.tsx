"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

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

const dataByFilter = {
  hora: [
    { time: "6 PM", agendados: 12, asistieron: 10 },
    { time: "7 PM", agendados: 15, asistieron: 12 },
    { time: "8 PM", agendados: 8, asistieron: 7 },
    { time: "9 PM", agendados: 5, asistieron: 4 },
  ],
  diario: [
    { time: "27 Julio", agendados: 45, asistieron: 38 },
    { time: "28 Julio", agendados: 52, asistieron: 44 },
    { time: "29 Julio", agendados: 38, asistieron: 35 },
    { time: "30 Julio", agendados: 41, asistieron: 39 },
  ],
  semanal: [
    { time: "Sem 1", agendados: 280, asistieron: 245 },
    { time: "Sem 2", agendados: 320, asistieron: 290 },
    { time: "Sem 3", agendados: 295, asistieron: 268 },
    { time: "Sem 4", agendados: 310, asistieron: 285 },
  ],
  mensual: [
    { time: "Enero", agendados: 1200, asistieron: 1050 },
    { time: "Febrero", agendados: 1150, asistieron: 1000 },
    { time: "Marzo", agendados: 1300, asistieron: 1180 },
    { time: "Abril", agendados: 1250, asistieron: 1100 },
  ],
}

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<"hora" | "diario" | "semanal" | "mensual">("diario")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex space-x-2">
          {(["hora", "diario", "semanal", "mensual"] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              Por {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Número de pacientes que agendaron cita</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataByFilter[activeFilter]}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="agendados" fill="var(--color-agendados)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Número de pacientes que asistieron a la cita</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataByFilter[activeFilter]}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="asistieron" fill="var(--color-asistieron)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* New Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[
          { label: "Total conversaciones", value: 156, color: "text-blue-600" },
          { label: "En proceso", value: 89, color: "text-green-600" }, // Renamed
          { label: "Estancados", value: 12, color: "text-red-600" },
          { label: "Pagados", value: 25, color: "text-emerald-600" },
          { label: "Con expediente", value: 110, color: "text-yellow-600" },
          { label: "Asistidos", value: 78, color: "text-cyan-600" },
          { label: "Intervenciones Humanas", value: 18, color: "text-orange-600" },
          { label: "Tiempo promedio de respuesta", value: "2 min", color: "text-gray-600" },
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
