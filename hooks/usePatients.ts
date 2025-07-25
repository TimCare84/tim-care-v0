"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Patient } from "@/lib/types"

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("patients").select("*").order("last_activity", { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching patients")
    } finally {
      setLoading(false)
    }
  }

  const updatePatientStatus = async (patientId: string, status: Patient["status"]) => {
    try {
      const { error } = await supabase
        .from("patients")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", patientId)

      if (error) throw error
      await fetchPatients() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating patient")
    }
  }

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    updatePatientStatus,
  }
}
