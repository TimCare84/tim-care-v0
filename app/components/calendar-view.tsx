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
import { Stethoscope, Phone, Clock, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
 
import '@schedule-x/theme-default/dist/index.css'
 
export function CalendarView() {
  // PERFORMANCE OPTIMIZATION: Memoize Schedule-X plugins to prevent recreation on every render
  // This prevents the calendar from refreshing when form inputs change
  const eventsService = useMemo(() => createEventsServicePlugin(), [])
  const eventModal = useMemo(() => createEventModalPlugin(), [])
  
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
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {calendarEvent.patientName}
          </h2>
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
              <a 
                href={`tel:${calendarEvent.phoneNumber}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {calendarEvent.phoneNumber}
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }, [])

  // PERFORMANCE OPTIMIZATION: Memoize custom components object to prevent recreation
  // Ensures ScheduleXCalendar doesn't re-render when form state changes
  const customComponents = useMemo(() => ({
    eventModal: CustomEventModal
  }), [CustomEventModal])
 
  // PERFORMANCE OPTIMIZATION: Memoize initial events to prevent recreation
  // Static events array that doesn't change, preventing unnecessary calendar re-renders
  const initialEvents = useMemo(() => [
    {
      id: '1',
      title: 'Ana García - Consulta General',
      start: '2025-08-15 09:00',
      end: '2025-08-15 10:00',
      // Custom properties
      patientName: 'Ana García',
      consultationReason: 'Consulta General',
      phoneNumber: '+57 300 123 4567',
      appointmentTime: '09:00 AM'
    },
    {
      id: '2',
      title: 'Joaquín Mendoza - Gastroenterología',
      start: '2025-08-15 09:00',
      end: '2025-08-15 10:00',
      // Custom properties
      patientName: 'Joaquín Mendoza',
      consultationReason: 'Gastroenterología',
      phoneNumber: '+57 300 777 8899',
      appointmentTime: '09:00 AM'
    },
    {
      id: '3',
      title: 'Joaquín Mendoza - Gastroenterología',
      start: '2025-08-15 11:00',
      end: '2025-08-15 12:00',
      // Custom properties
      patientName: 'Joaquín Mendoza',
      consultationReason: 'Gastroenterología',
      phoneNumber: '+57 336 777 8899',
      appointmentTime: '11:00 AM'
    },
  ], [])

  // PERFORMANCE OPTIMIZATION: Memoize calendar configuration to prevent recreation
  // Critical optimization that prevents Schedule-X from re-initializing on every render
  const calendarConfig = useMemo(() => {
    const views = [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()]
    return {
      views: views as [typeof views[0], ...Array<typeof views[0]>],
      events: initialEvents,
      plugins: [eventsService, eventModal]
    }
  }, [initialEvents, eventsService, eventModal])

  const calendar = useCalendarApp(calendarConfig)
 
  useEffect(() => {
    // PERFORMANCE OPTIMIZATION: Load events only once on component mount
    // Prevents unnecessary API calls when form state changes
    eventsService.getAll()
  }, [eventsService])
 
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
