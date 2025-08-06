// import { supabase } from './supabase'

export interface User {
  id: string
  clinic_id: string
  user_name: string
  email: string
  agent_active: boolean
  whatsapp_number: string
  last_interaction: string
}

// Función comentada - usando Supabase (no necesaria ahora)
// export async function getUsersByClinic(clinicId: string, page: number = 1, limit: number = 50, agentActive: boolean = true): Promise<User[]> {
//   try {
//     const from = (page - 1) * limit
//     const to = from + limit - 1

//     const { data, error } = await supabase
//       .from('users')
//       .select('*')
//       .eq('clinic_id', clinicId)
//       .eq('agent_active', agentActive)
//       .range(from, to)
//       .order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching users by clinic:', error)
//       throw error
//     }

//     return data || []
//   } catch (error) {
//     console.error('Error in getUsersByClinic:', error)
//     throw error
//   }
// }

// Las funciones N8N se han movido a lib/querys_n8n/messages.ts
// Importa desde allí: import { getUserMessagesN8N, getUserMessagesTest, getUsersByClinicN8N } from '@/lib/querys_n8n'
