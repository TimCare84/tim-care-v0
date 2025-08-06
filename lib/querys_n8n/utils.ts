// Utilidades para las queries de N8N

/**
 * Extrae clinicId y userId de un chatId compuesto
 * @param chatId - ID del chat que puede contener clinicId:userId
 * @returns Objeto con clinicId y userId separados
 */
export function extractChatIds(chatId: string): { clinicId: string; userId: string } | null {
  if (!chatId) return null
  
  // Si el chatId contiene ':', asumimos que es formato clinicId:userId
  if (chatId.includes(':')) {
    const [clinicId, userId] = chatId.split(':')
    if (clinicId && userId) {
      return { clinicId, userId }
    }
  }
  
  return null
}

/**
 * Valida que los IDs de clínica y usuario sean válidos
 * @param clinicId - ID de la clínica
 * @param userId - ID del usuario
 * @returns true si ambos IDs son válidos
 */
export function validateIds(clinicId: string, userId: string): boolean {
  return !!(clinicId && userId && 
    clinicId.trim().length > 0 && 
    userId.trim().length > 0)
}

/**
 * Construye la URL del endpoint de mensajes
 * @param clinicId - ID de la clínica
 * @param userId - ID del usuario
 * @param page - Número de página
 * @param limit - Límite de resultados
 * @returns URL completa del endpoint
 */
export function buildMessagesUrl(
  clinicId: string, 
  userId: string, 
  page: number = 1, 
  limit: number = 100
): string {
  return `/api/messages/chat/${clinicId}/${userId}?page=${page}&limit=${limit}`
}

/**
 * Convierte un objeto chat a los IDs necesarios para N8N
 * @param chat - Objeto chat con clinic_id y customer_id
 * @returns Objeto con clinicId y userId
 */
export function chatToN8NIds(chat: { clinic_id: string; customer_id: string }): {
  clinicId: string;
  userId: string;
} {
  return {
    clinicId: chat.clinic_id,
    userId: chat.customer_id
  }
}
