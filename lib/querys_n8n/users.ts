// Interfaz para usuarios
export interface User {
  id: string
  clinic_id: string
  user_name: string
  email: string
  agent_active: boolean
  whatsapp_number: string
  last_interaction: string
}

// Función para obtener usuarios usando la API N8N
export async function getUsersByClinicN8N(clinicId: string, page: number = 1, limit: number = 50, agentActive: boolean = true): Promise<User[]> {
  try {
    const response = await fetch(`/api/users/clinic/${clinicId}?page=${page}&limit=${limit}&agent_active=${agentActive}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.users || data || []
  } catch (error) {
    console.error('Error fetching users by clinic via N8N:', error)
    throw error
  }
}
