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

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UsersResponse {
  users: User[]
  pagination?: Pagination
}

// Función para obtener usuarios usando la API N8N
export async function getUsersByClinicN8N(
  clinicId: string,
  page: number = 1,
  limit: number = 50,
  agentActive: boolean = true
): Promise<UsersResponse> {
  try {
    const response = await fetch(`/api/users/clinic/${clinicId}?page=${page}&limit=${limit}&agent_active=${agentActive}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Compatibilidad: si la API devuelve directamente un array, normalizar
    if (Array.isArray(data)) {
      return { users: data }
    }
    // Si devuelve objeto con users y pagination
    return {
      users: data.users || [],
      pagination: data.pagination,
    }
  } catch (error) {
    console.error('Error fetching users by clinic via N8N:', error)
    throw error
  }
}
