import { supabase } from "../supabase"
import type { Chats } from "../../schemas/chats"
import type { Customer } from "../../schemas/customers"

// Tipo extendido para chats con información del customer
export interface ChatsWithCustomer extends Chats {
  customers?: Customer
}

// Obtener todos los chats
export async function getAllChats(clinic_id?: string): Promise<Chats[]> {
  let query = supabase
    .from("chats")
    .select("*")
    .order("last_update", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Chats[]
}

// Obtener chats con información del customer
export async function getChatsWithCustomerInfo(clinic_id?: string): Promise<ChatsWithCustomer[]> {
  let query = supabase
    .from("chats")
    .select(`
      *,
      customers(
        id,
        whatsapp_number,
        user_name,
        email,
        last_interaction,
        clinic_id,
        agent_active,
        created_at,
        updated_at
      )
    `)
    .order("last_update", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ChatsWithCustomer[]
}

// Obtener chat por ID
export async function getChatById(chat_id: string): Promise<Chats | null> {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chat_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw error
  }
  return data as Chats
}

// Obtener chats por customer_id
export async function getChatsByCustomer(customer_id: string, clinic_id?: string): Promise<Chats[]> {
  let query = supabase
    .from("chats")
    .select("*")
    .eq("customer_id", customer_id)
    .order("last_update", { ascending: false })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Chats[]
} 