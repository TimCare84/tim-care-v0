import { supabase } from "../supabase"
import type { Appointment } from "../../schemas/appointments"

// Obtener todas las citas
export async function getAllAppointments(clinic_id?: string): Promise<Appointment[]> {
  let query = supabase
    .from("appointments")
    .select("*")
    .order("scheduled_at", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Appointment[]
}

// Obtener citas pendientes (scheduled)
export async function getPendingAppointments(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Obtener citas completadas
export async function getCompletedAppointments(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Obtener total de citas agendadas
export async function getScheduledAppointments(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Calcular tasa de asistencia
export async function getAttendanceRate(clinic_id?: string): Promise<number> {
  const [completed, scheduled] = await Promise.all([
    getCompletedAppointments(clinic_id),
    getScheduledAppointments(clinic_id)
  ])

  if (scheduled === 0) return 0
  return Math.round((completed / scheduled) * 100)
}

// Obtener citas por fecha para gráficos
export async function getAppointmentsByDateRange(
  startDate: string, 
  endDate: string, 
  clinic_id?: string
) {
  let query = supabase
    .from("appointments")
    .select("*")
    .gte("scheduled_at", startDate)
    .lte("scheduled_at", endDate)

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Obtener datos de citas agrupados por hora del día
export async function getAppointmentsByHour(clinic_id?: string) {
  let query = supabase
    .from("appointments")
    .select("scheduled_at, status")

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error

  console.log('Appointments data for hour grouping:', data)

  // Agrupar por hora usando todas las citas
  const hourlyData: Record<string, { agendados: number; asistieron: number }> = {}
  
  data?.forEach(appointment => {
    if (appointment.scheduled_at) {
      try {
        const date = new Date(appointment.scheduled_at)
        const hour = date.getHours()
        const timeLabel = `${hour}:00`
        
        if (!hourlyData[timeLabel]) {
          hourlyData[timeLabel] = { agendados: 0, asistieron: 0 }
        }
        
        hourlyData[timeLabel].agendados++
        if (appointment.status === "completed") {
          hourlyData[timeLabel].asistieron++
        }
      } catch (e) {
        console.error('Error parsing date:', appointment.scheduled_at, e)
      }
    }
  })

  const result = Object.entries(hourlyData).map(([time, data]) => ({
    time,
    ...data
  })).sort((a, b) => parseInt(a.time) - parseInt(b.time))

  console.log('Hour grouping result:', result)
  return result
}

// Obtener datos de citas agrupados por día
export async function getAppointmentsByDay(clinic_id?: string) {
  let query = supabase
    .from("appointments")
    .select("scheduled_at, status")

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error

  console.log('Appointments data for day grouping:', data)

  // Agrupar por día usando todas las citas
  const dailyData: Record<string, { agendados: number; asistieron: number }> = {}
  
  data?.forEach(appointment => {
    if (appointment.scheduled_at) {
      try {
        const date = new Date(appointment.scheduled_at)
        const timeLabel = date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        })
        
        if (!dailyData[timeLabel]) {
          dailyData[timeLabel] = { agendados: 0, asistieron: 0 }
        }
        
        dailyData[timeLabel].agendados++
        if (appointment.status === "completed") {
          dailyData[timeLabel].asistieron++
        }
      } catch (e) {
        console.error('Error parsing date:', appointment.scheduled_at, e)
      }
    }
  })

  const result = Object.entries(dailyData).map(([time, data]) => ({
    time,
    ...data
  })).sort((a, b) => {
    // Ordenar por fecha
    try {
      const dateA = new Date(a.time + " 2024")
      const dateB = new Date(b.time + " 2024")
      return dateA.getTime() - dateB.getTime()
    } catch (e) {
      return 0
    }
  })

  console.log('Day grouping result:', result)
  return result
}

// Obtener datos de citas agrupados por semana
export async function getAppointmentsByWeek(clinic_id?: string) {
  let query = supabase
    .from("appointments")
    .select("scheduled_at, status")

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error

  console.log('Appointments data for week grouping:', data)

  // Simplificar: agrupar todas las citas en semanas basadas en su fecha
  const weeklyData: Record<string, { agendados: number; asistieron: number }> = {}
  
  data?.forEach((appointment, index) => {
    if (appointment.scheduled_at) {
      try {
        const weekNumber = Math.floor(index / 2) + 1 // Agrupar cada 2 citas como una semana
        const timeLabel = `Sem ${weekNumber}`
        
        if (!weeklyData[timeLabel]) {
          weeklyData[timeLabel] = { agendados: 0, asistieron: 0 }
        }
        
        weeklyData[timeLabel].agendados++
        if (appointment.status === "completed") {
          weeklyData[timeLabel].asistieron++
        }
      } catch (e) {
        console.error('Error processing appointment:', appointment.scheduled_at, e)
      }
    }
  })

  const result = Object.entries(weeklyData).map(([time, data]) => ({
    time,
    ...data
  })).sort((a, b) => {
    const weekA = parseInt(a.time.split(' ')[1])
    const weekB = parseInt(b.time.split(' ')[1])
    return weekA - weekB
  })

  console.log('Week grouping result:', result)
  return result
} 