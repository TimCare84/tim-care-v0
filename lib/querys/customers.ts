import { supabase } from "../supabase"
import type { Customer } from "../../schemas/customers"

// Obtener información del customer del chat
export async function getCustomerByChat(chat_id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      chats!inner(id)
    `)
    .eq("chats.id", chat_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw error
  }
  return data as Customer
}

// Obtener customer por ID
export async function getCustomerById(customer_id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customer_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw error
  }
  return data as Customer
}

// Obtener todos los customers
export async function getAllCustomers(clinic_id?: string): Promise<Customer[]> {
  let query = supabase
    .from("customers")
    .select("*")
    .order("last_interaction", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Customer[]
}

// Obtener customer con sus chats
export async function getCustomerWithChats(customer_id: string): Promise<any> {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      chats(*)
    `)
    .eq("id", customer_id)
    .single()

  if (error) throw error
  return data
}

// Buscar customer por número de WhatsApp
export async function getCustomerByWhatsApp(
  whatsapp_number: string, 
  clinic_id?: string
): Promise<Customer | null> {
  let query = supabase
    .from("customers")
    .select("*")
    .eq("whatsapp_number", whatsapp_number)

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw error
  }
  return data as Customer
}

// Obtener customers activos (con agent_active = true)
export async function getActiveCustomers(clinic_id?: string): Promise<Customer[]> {
  let query = supabase
    .from("customers")
    .select("*")
    .eq("agent_active", true)
    .order("last_interaction", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Customer[]
} 