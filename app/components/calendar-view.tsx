"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, User, Clock, Stethoscope, Phone } from 'lucide-react' // Added icons
import { format, startOfWeek, addDays, subDays, isSameDay, isSameMonth, isSameYear } from 'date-fns'
import { es } from 'date-fns/locale' // Import Spanish locale

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"week" | "day">("week") // Default to week view

  const mockAppointments: Record<string, { time: string; patient: string; service: string; phone: string }[]> = {
    "2025-08-01": [
      { time: "10:00", patient: "Elena Gómez", service: "Consulta General", phone: "555-1111" },
      { time: "15:00", patient: "Fernando Ruiz", service: "Revisión Anual", phone: "555-2222" },
    ],
    "2025-08-05": [
      { time: "09:30", patient: "Isabel Torres", service: "Fisioterapia", phone: "555-3333" },
    ],
    "2025-08-08": [
      { time: "11:00", patient: "Javier Castro", service: "Vacunación", phone: "555-4444" },
      { time: "16:00", patient: "Luisa Vargas", service: "Examen de la Vista", phone: "555-5555" },
    ],
    "2025-08-15": [
      { time: "09:00", patient: "Ana García", service: "Consulta General", phone: "555-1234" },
      { time: "14:30", patient: "Carlos López", service: "Revisión Dental", phone: "555-5678" },
    ],
    "2025-08-22": [{ time: "10:00", patient: "María Rodríguez", service: "Fisioterapia", phone: "555-9012" }],
    "2025-08-28": [
      { time: "11:00", patient: "José Martínez", service: "Examen de la Vista", phone: "555-3456" },
      { time: "16:00", patient: "Laura Sánchez", service: "Vacunación", phone: "555-7890" },
    ],
  }

  const getDaysForView = (date: Date, mode: "week" | "day") => {
    const days = []
    if (mode === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 }) // Sunday as start of week
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i))
      }
    } else {
      // mode === "day"
      days.push(date)
    }
    return days
  }

  const navigate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      if (viewMode === "week") {
        return direction === "prev" ? subDays(prev, 7) : addDays(prev, 7)
      } else {
        // day view
        return direction === "prev" ? subDays(prev, 1) : addDays(prev, 1)
      }
    })
  }

  const getHeaderTitle = () => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = addDays(start, 6)
      return `Semana del ${format(start, "d 'de' MMMM", { locale: es })} al ${format(end, "d 'de' MMMM 'de' yyyy", {
        locale: es,
      })}`
    } else {
      // day view
      return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    }
  }

  const isToday = (date: Date) => isSameDay(date, new Date())

  return (
    <div className="p-6 h-full w-full">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{getHeaderTitle()}</CardTitle>
            <div className="flex space-x-2">
              <Button variant={viewMode === "week" ? "default" : "outline"} size="sm" onClick={() => setViewMode("week")}>
                Por semana
              </Button>
              <Button variant={viewMode === "day" ? "default" : "outline"} size="sm" onClick={() => setViewMode("day")}>
                Por día
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "week" ? (
            <>
              <div className="grid grid-cols-7 border-b">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7" style={{ height: "calc(100vh - 200px)" }}>
                {getDaysForView(currentDate, "week").map((date, index) => {
                  const dayNumber = date.getDate()
                  const dateKey = format(date, "yyyy-MM-dd")
                  const dayAppointments = mockAppointments[dateKey] || []
                  return (
                    <div key={index} className="border-r border-b last:border-r-0 p-2 min-h-[120px] relative overflow-y-auto">
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday(date)
                            ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {dayNumber}
                      </div>
                      {dayAppointments.length > 0 && (
                        <div className="space-y-1">
                          {dayAppointments.map((apt, i) => (
                            <div key={i} className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
                              <div className="font-medium flex items-center gap-1"><User className="h-3 w-3" />{apt.patient}</div>
                              <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</div>
                              <div className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{apt.service}</div>
                              <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{apt.phone}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4" style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
              <h3 className="text-lg font-semibold">Citas para {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</h3>
              {mockAppointments[format(currentDate, "yyyy-MM-dd")]?.length > 0 ? (
                <div className="space-y-3">
                  {mockAppointments[format(currentDate, "yyyy-MM-dd")]?.map((apt, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 text-sm">
                        <div className="font-medium text-base flex items-center gap-2"><User className="h-4 w-4" />{apt.patient}</div>
                        <div className="text-gray-700 flex items-center gap-2"><Clock className="h-4 w-4" />Hora: {apt.time}</div>
                        <div className="text-gray-700 flex items-center gap-2"><Stethoscope className="h-4 w-4" />Servicio: {apt.service}</div>
                        <div className="text-gray-700 flex items-center gap-2"><Phone className="h-4 w-4" />Teléfono: {apt.phone}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay citas programadas para este día.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
