import { supabase } from "../supabase"
import type { Message } from "../../schemas/messages"

// Obtener mensajes del chat
export async function getMessagesByChat(chat_id: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chat_id)
    .order("timestamp", { ascending: true })

  if (error) throw error
  return data as Message[]
}

// Obtener mensajes con paginación
export async function getMessagesByChatPaginated(
  chat_id: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chat_id)
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Message[]
}

// Obtener último mensaje de un chat
export async function getLastMessageByChat(chat_id: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chat_id)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw error
  }
  return data as Message
}

// Obtener mensajes por customer_id
export async function getMessagesByCustomer(
  customer_id: string, 
  clinic_id?: string
): Promise<Message[]> {
  let query = supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customer_id)
    .order("timestamp", { ascending: true })

  if (clinic_id) {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Message[]
}

// Contar mensajes de un chat
export async function getMessageCountByChat(chat_id: string): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("chat_id", chat_id)

  if (error) throw error
  return count || 0
} 