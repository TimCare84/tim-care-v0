import { supabase } from "../supabase"
import type { Patient } from "../../schemas/patients"

// Obtener total de pacientes
export async function getTotalPatients(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Obtener número de pacientes con una cita
export async function getPatientsWithAppointments(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("patients")
    .select(`
      id,
      appointments!inner(id)
    `, { count: "exact", head: true })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Obtener todos los pacientes
export async function getAllPatients(clinic_id?: string): Promise<Patient[]> {
  let query = supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Patient[]
}

// Obtener pacientes con información de citas
export async function getPatientsWithAppointmentDetails(clinic_id?: string) {
  let query = supabase
    .from("patients")
    .select(`
      *,
      appointments(*)
    `)
    .order("created_at", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Obtener pacientes que requieren atención
export async function getPatientsNeedingIntervention(clinic_id?: string): Promise<number> {
  let query = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("needs_intervention", true)

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
} 