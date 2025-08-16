"use client"

import { useState, useEffect } from "react"

export interface AppointmentN8N {
  id: string
  clinic_id: string
  patient_id: string
  event_id: string
  old_scheduled_at: string | null
  reason: string
  status: "scheduled" | "cancelled" | "completed" | "rescheduled"
  note: string
  start_time: string
  end_time: string
  service_id: string | null
  created_at: string
  updated_at: string
  cancelled_at: string | null
}

export interface AppointmentsResponse {
  appointments: AppointmentN8N[]
  total: number
  page: number
  limit: number
}

export function useAppointmentsN8N(clinicId: string | null) {
  const [appointments, setAppointments] = useState<AppointmentN8N[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async () => {
    if (!clinicId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `https://n8n-postgres-server.onrender.com/api/appointments?page=1&limit=100&clinic_id=${clinicId}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: AppointmentsResponse = await response.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError(err instanceof Error ? err.message : "Error fetching appointments")
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointmentData: Partial<AppointmentN8N>) => {
    if (!clinicId) {
      throw new Error("Clinic ID is required")
    }

    try {
      const response = await fetch(
        "https://n8n-postgres-server.onrender.com/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...appointmentData,
            clinic_id: clinicId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newAppointment = await response.json()
      setAppointments(prev => [...prev, newAppointment])
      return newAppointment
    } catch (err) {
      console.error("Error creating appointment:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [clinicId])

  return {
    appointments,
    loading,
    error,
    createAppointment,
    refetch: fetchAppointments,
  }
}