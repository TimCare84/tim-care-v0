"use client"

import { useState, useEffect } from "react"
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
 
import '@schedule-x/theme-default/dist/index.css'
 
export function CalendarView() {
  const eventsService = useState(() => createEventsServicePlugin())[0]
 
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: [
      {
        id: '1',
        title: 'Event 1',
        start: '2025-08-15',
        end: '2025-08-15',
      },
    ],
    plugins: [eventsService]
  })
 
  useEffect(() => {
    // get all events
    eventsService.getAll()
  }, [])
 
  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
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
