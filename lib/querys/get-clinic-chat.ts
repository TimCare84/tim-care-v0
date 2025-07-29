import { supabase } from "../supabase"
import { Clinic } from "./clinics"
import { Chats } from "@/schemas/chats"

// Obtener todos los chats de la clinica
export async function getClinicChats(clinicID : string): Promise<Chats[]> {

  const { data, error } = await supabase
    .from("clinics")
    .select("*")

  console.log(data)

  if (error) throw error
  return data as Chats[]
  
}

// Testing: TIM DENTAL STUDIO
getClinicChats("de74ce6d-7cfc-4601-8a07-1359cc23d006")