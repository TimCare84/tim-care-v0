"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { Stethoscope, Phone, Clock, User, Plus, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointmentsN8N, type AppointmentN8N } from "@/hooks/useAppointmentsN8N"
import { Alert, AlertDescription } from "@/components/ui/alert"
 
import '@schedule-x/theme-default/dist/index.css'
 
interface CalendarViewProps {
  clinicId: string | null
}

export function CalendarView({ clinicId }: CalendarViewProps) {
  // PERFORMANCE OPTIMIZATION: Memoize Schedule-X plugins to prevent recreation on every render
  // This prevents the calendar from refreshing when form inputs change
  const eventsService = useMemo(() => createEventsServicePlugin(), [])
  const eventModal = useMemo(() => createEventModalPlugin(), [])
  
  // N8N Appointments Integration
  const { appointments, loading, error, refetch } = useAppointmentsN8N(clinicId)
  
  // Function to extract patient info from note field
  const extractPatientInfo = useCallback((note: string) => {
    const lines = note.split('\n')
    let patientName = 'Paciente Desconocido'
    let consultationReason = 'Consulta'
    
    for (const line of lines) {
      if (line.startsWith('Paciente:')) {
        patientName = line.replace('Paciente:', '').trim()
      } else if (line.startsWith('Motivo de la consulta:')) {
        consultationReason = line.replace('Motivo de la consulta:', '').trim()
      }
    }
    
    return { patientName, consultationReason }
  }, [])
  
  // Transform N8N appointments to Schedule-X format
  const transformedEvents = useMemo(() => {
    if (!appointments || appointments.length === 0) return []
    
    return appointments.map((appointment: AppointmentN8N) => {
      const { patientName, consultationReason } = extractPatientInfo(appointment.note)
      
      // Get status color based on appointment status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'scheduled': return '#22c55e' // green
          case 'completed': return '#3b82f6' // blue
          case 'cancelled': return '#ef4444' // red
          case 'rescheduled': return '#f59e0b' // amber
          default: return '#6b7280' // gray
        }
      }
      
      // Calculate end time: use end_time if available, otherwise add 20 minutes to start_time
      const startTime = new Date(appointment.start_time)
      const endTime = appointment.end_time 
        ? new Date(appointment.end_time)
        : new Date(startTime.getTime() + 20 * 60 * 1000) // Add 20 minutes
      
      // Format dates for Schedule-X (YYYY-MM-DD HH:mm)
      const formatDateTime = (date: Date) => {
        return date.toISOString().replace('Z', '').replace('T', ' ').substring(0, 16)
      }
      
      return {
        id: appointment.id,
        title: `${patientName} - ${consultationReason}`,
        start: formatDateTime(startTime),
        end: formatDateTime(endTime),
        calendarId: 'appointments',
        // Custom properties for the modal
        patientName,
        consultationReason: consultationReason + (appointment.reason ? ` ${appointment.reason}` : ''),
        phoneNumber: 'No disponible', // This would need to come from patient data
        appointmentTime: startTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: appointment.status,
        appointmentId: appointment.id,
        note: appointment.note,
        backgroundColor: getStatusColor(appointment.status)
      }
    })
  }, [appointments, extractPatientInfo])
  
  // Add Event Form State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    patientName: '',
    consultationReason: '',
    phoneNumber: '',
    date: '',
    time: ''
  })

  // Handle adding new event - memoized to prevent unnecessary re-renders
  const handleAddEvent = useCallback(() => {
    if (!newEvent.patientName || !newEvent.consultationReason || !newEvent.date || !newEvent.time) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const startDateTime = `${newEvent.date} ${newEvent.time}`
    const endDateTime = `${newEvent.date} ${String(parseInt(newEvent.time.split(':')[0]) + 1).padStart(2, '0')}:${newEvent.time.split(':')[1]}`
    
    const eventId = Date.now().toString()
    const event = {
      id: eventId,
      title: `${newEvent.patientName} - ${newEvent.consultationReason}`,
      start: startDateTime,
      end: endDateTime,
      patientName: newEvent.patientName,
      consultationReason: newEvent.consultationReason,
      phoneNumber: newEvent.phoneNumber,
      appointmentTime: newEvent.time
    }

    eventsService.add(event)
    
    // Reset form
    setNewEvent({
      patientName: '',
      consultationReason: '',
      phoneNumber: '',
      date: '',
      time: ''
    })
    setIsAddEventOpen(false)
  }, [newEvent, eventsService])

  // PERFORMANCE OPTIMIZATION: Memoized form handlers to prevent unnecessary re-renders
  // This prevents the calendar from refreshing every time user types in the modal inputs
  const handleInputChange = useCallback((field: string, value: string) => {
    setNewEvent(prev => ({ ...prev, [field]: value }))
  }, [])

  // PERFORMANCE OPTIMIZATION: Memoized custom component for event modal content
  // Prevents component recreation on every render, maintaining modal performance
  const CustomEventModal = useMemo(() => ({ calendarEvent }: { calendarEvent: any }) => {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        scheduled: { color: 'bg-green-100 text-green-800', label: 'Agendada' },
        completed: { color: 'bg-blue-100 text-blue-800', label: 'Completada' },
        cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
        rescheduled: { color: 'bg-yellow-100 text-yellow-800', label: 'Reagendada' }
      }
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )
    }
    
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {calendarEvent.patientName}
            </h2>
          </div>
          {calendarEvent.status && getStatusBadge(calendarEvent.status)}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Consulta</p>
              <p className="text-gray-900">{calendarEvent.consultationReason}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Horario</p>
              <p className="text-gray-900">{calendarEvent.appointmentTime}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Teléfono</p>
              <p className="text-gray-600">{calendarEvent.phoneNumber}</p>
            </div>
          </div>
          
          {calendarEvent.note && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Notas</p>
                <p className="text-gray-900 text-sm whitespace-pre-line">{calendarEvent.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }, [])

  // PERFORMANCE OPTIMIZATION: Memoize custom components object to prevent recreation
  // Ensures ScheduleXCalendar doesn't re-render when form state changes
  const customComponents = useMemo(() => ({
    eventModal: CustomEventModal
  }), [CustomEventModal])
 
  // Use transformed events from N8N API instead of static data
  // Events are automatically updated when appointments change

  // PERFORMANCE OPTIMIZATION: Memoize calendar configuration to prevent recreation
  // Critical optimization that prevents Schedule-X from re-initializing on every render
  const calendarConfig = useMemo(() => {
    const views = [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()]
    return {
      views: views as [typeof views[0], ...Array<typeof views[0]>],
      events: transformedEvents,
      plugins: [eventsService, eventModal]
    }
  }, [transformedEvents, eventsService, eventModal])

  const calendar = useCalendarApp(calendarConfig)
 
  useEffect(() => {
    // Update calendar events when transformedEvents change
    if (eventsService && transformedEvents) {
      // Clear existing events and add new ones
      const currentEvents = eventsService.getAll()
      currentEvents.forEach(event => eventsService.remove(event.id))
      transformedEvents.forEach(event => eventsService.add(event))
    }
  }, [eventsService, transformedEvents])
 
  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    return (
      <div className="w-full p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error al cargar las citas: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-4"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  // Show message when no clinic ID is provided
  if (!clinicId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Por favor seleccione una clínica para ver las citas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <ScheduleXCalendar 
        calendarApp={calendar}
        customComponents={customComponents}
      />
      
      {/* Floating Add Event Button */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 shadow-lg bg-blue-900 hover:bg-blue-800 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear evento
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] custom-modal-shadow">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <span>Nueva Cita Médica</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Nombre del Paciente *</Label>
              <Input
                id="patientName"
                value={newEvent.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Ej: Ana García"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="consultationReason">Tipo de Consulta *</Label>
              <Select 
                value={newEvent.consultationReason}
                onValueChange={(value) => handleInputChange('consultationReason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta General">Consulta General</SelectItem>
                  <SelectItem value="Gastroenterología">Gastroenterología</SelectItem>
                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                  <SelectItem value="Neurología">Neurología</SelectItem>
                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                  <SelectItem value="Ginecología">Ginecología</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                value={newEvent.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Ej: +57 300 123 4567"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddEventOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddEvent}
              className="bg-blue-900 hover:bg-blue-800"
            >
              Agendar Cita
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
// const months = [
//   "Enero",
//   "Febrero",
//   "Marzo",
//   "Abril",
//   "Mayo",
//   "Junio",
//   "Julio",
//   "Agosto",
//   "Septiembre",
//   "Octubre",
//   "Noviembre",
//   "Diciembre",
// ]

// export function CalendarView() {
//   const [currentDate, setCurrentDate] = useState(new Date())

//   const getDaysInMonth = (date: Date) => {
//     const year = date.getFullYear()
//     const month = date.getMonth()
//     const firstDay = new Date(year, month, 1)
//     const lastDay = new Date(year, month + 1, 0)
//     const daysInMonth = lastDay.getDate()
//     const startingDayOfWeek = firstDay.getDay()

//     const days = []

//     // Add empty cells for days before the first day of the month
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(null)
//     }

//     // Add days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(day)
//     }

//     return days
//   }

//   const navigateMonth = (direction: "prev" | "next") => {
//     setCurrentDate((prev) => {
//       const newDate = new Date(prev)
//       if (direction === "prev") {
//         newDate.setMonth(prev.getMonth() - 1)
//       } else {
//         newDate.setMonth(prev.getMonth() + 1)
//       }
//       return newDate
//     })
//   }

//   const days = getDaysInMonth(currentDate)
//   const today = new Date()
//   const isToday = (day: number | null) => {
//     if (!day) return false
//     return (
//       day === today.getDate() &&
//       currentDate.getMonth() === today.getMonth() &&
//       currentDate.getFullYear() === today.getFullYear()
//     )
//   }

//   // Mock appointments
//   const appointments = {
//     15: [
//       { time: "09:00", patient: "Ana García" },
//       { time: "14:30", patient: "Carlos López" },
//     ],
//     22: [{ time: "10:00", patient: "María Rodríguez" }],
//     28: [
//       { time: "11:00", patient: "José Martínez" },
//       { time: "16:00", patient: "Laura Sánchez" },
//     ],
//   }

//   return (
//     <div className="p-6 h-full">
//       <Card className="h-full">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-xl">
//               {months[currentDate.getMonth()]} {currentDate.getFullYear()}
//             </CardTitle>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="grid grid-cols-7 border-b">
//             {daysOfWeek.map((day) => (
//               <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
//                 {day}
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-7" style={{ height: "calc(100vh - 200px)" }}>
//             {days.map((day, index) => (
//               <div key={index} className="border-r border-b last:border-r-0 p-2 min-h-[120px] relative">
//                 {day && (
//                   <>
//                     <div
//                       className={`text-sm font-medium mb-1 ${
//                         isToday(day)
//                           ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
//                           : ""
//                       }`}
//                     >
//                       {day}
//                     </div>
//                     {appointments[day as keyof typeof appointments] && (
//                       <div className="space-y-1">
//                         {appointments[day as keyof typeof appointments].map((apt, i) => (
//                           <div key={i} className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
//                             <div className="font-medium">{apt.time}</div>
//                             <div className="truncate">{apt.patient}</div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
