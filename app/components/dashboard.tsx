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
}

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<"hora" | "diario" | "semanal">("diario")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex space-x-2">
          {(["hora", "diario", "semanal"] as const).map((filter) => (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Total Pacientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">Tasa de Asistencia</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <div className="text-sm text-gray-600">Citas Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Requieren Atención</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
