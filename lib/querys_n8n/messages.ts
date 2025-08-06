import type { Message } from "../../schemas/messages"

// Interfaz para la respuesta del endpoint N8N
interface N8NMessagesResponse {
  data: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Obtener mensajes del chat desde N8N
export async function getMessagesByChatN8N(
  clinicId: string,
  userId: string, 
  page: number = 1, 
  limit: number = 100
): Promise<Message[]> {
  try {
    
    const response = await fetch(
      `/api/messages/chat/${clinicId}/${userId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    
    // Extraer mensajes de la estructura correcta: conversation.messages
    let messages = []
    
    if (data && typeof data === 'object') {
      if (data.conversation && Array.isArray(data.conversation.messages)) {
        messages = data.conversation.messages
      } else if (Array.isArray(data.data)) {
        messages = data.data
      } else if (Array.isArray(data.messages)) {
        messages = data.messages
      } else if (Array.isArray(data)) {
        messages = data
      } else {
        console.warn('getMessagesByChatN8N: data no es un array válido:', data)
        messages = []
      }
    }
    
    return messages
  } catch (error) {
    console.error('Error fetching messages from N8N:', error)
    return []
  }
}

// Obtener mensajes con paginación desde N8N
export async function getMessagesByChatPaginatedN8N(
  clinicId: string,
  userId: string, 
  page: number = 1, 
  limit: number = 50
): Promise<{ messages: Message[], pagination: any }> {
  try {
    const response = await fetch(
      `/api/messages/chat/${clinicId}/${userId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const result: N8NMessagesResponse = await response.json()
    return {
      messages: result.data,
      pagination: result.pagination
    }
  } catch (error) {
    console.error('Error fetching paginated messages from N8N:', error)
    throw error
  }
}

// Obtener último mensaje de un chat desde N8N
export async function getLastMessageByChatN8N(clinicId: string, userId: string): Promise<Message | null> {
  try {
    const response = await fetch(
      `/api/messages/chat/${clinicId}/${userId}?page=1&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const result: N8NMessagesResponse = await response.json()
    return result.data.length > 0 ? result.data[0] : null
  } catch (error) {
    console.error('Error fetching last message from N8N:', error)
    throw error
  }
}

// Función de prueba que usa el endpoint de prueba
export async function getMessagesByChatTest(
  clinicId: string,
  userId: string, 
  page: number = 1, 
  limit: number = 100
): Promise<Message[]> {
  try {
    
    const response = await fetch(
      `/api/messages/chat/${clinicId}/${userId}/test?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    
    // Extraer mensajes de la estructura correcta: conversation.messages
    let messages = []
    
    if (data && typeof data === 'object') {
      if (data.conversation && Array.isArray(data.conversation.messages)) {
        messages = data.conversation.messages
      } else if (Array.isArray(data.data)) {
        messages = data.data
      } else if (Array.isArray(data.messages)) {
        messages = data.messages
      } else if (Array.isArray(data)) {
        messages = data
      } else {
        console.warn('getMessagesByChatTest: data no es un array válido:', data)
        messages = []
      }
    }
    
    return messages
  } catch (error) {
    console.error('Error fetching test messages:', error)
    return []
  }
}



// Función para obtener mensajes de un usuario específico (alias para getMessagesByChatN8N)
export async function getUserMessagesN8N(clinicId: string, userId: string, page: number = 1, limit: number = 100): Promise<Message[]> {
  return getMessagesByChatN8N(clinicId, userId, page, limit)
}

// Función de prueba para obtener mensajes de un usuario específico (alias para getMessagesByChatTest)
export async function getUserMessagesTest(clinicId: string, userId: string, page: number = 1, limit: number = 100): Promise<Message[]> {
  return getMessagesByChatTest(clinicId, userId, page, limit)
}
