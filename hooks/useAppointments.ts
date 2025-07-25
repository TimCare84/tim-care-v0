"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Appointment } from "@/lib/types"

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patient:patients(*)
        `)
        .order("date", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching appointments")
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointment: Omit<Appointment, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("appointments").insert(appointment)

      if (error) throw error
      await fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating appointment")
    }
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    refetch: fetchAppointments,
  }
}
