import { supabase } from "../supabase"

export type Clinic = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at?: string;
}

// ejemplo para obtener todas las clínicas
export async function getAllClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from("clinics")
    .select("*")


  if (error) throw error
  return data as Clinic[]
}
