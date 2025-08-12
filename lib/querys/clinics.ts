import { supabase } from "../supabase"

export type Clinic = {
  id: string;
  clinic_name: string;
  responsible_name?: string;
  whatsapp_number?: string;
  phone_number_id?: string;
  display_phone_number?: string;
  agent_tone?: string;
  agent_name?: string;
  timezone?: string;
  address?: string;
  opening_hours?: string;
  cancellation_policy?: string;
  emergency_cases?: string;
  promotions?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  calendar_ids?: string[] | null;
}

// ejemplo para obtener todas las clínicas
export async function getAllClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from("clinics")
    .select("*")


  if (error) throw error
  return data as Clinic[]
}

// obtener clínica por ID
export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", clinicId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return data as Clinic
}
