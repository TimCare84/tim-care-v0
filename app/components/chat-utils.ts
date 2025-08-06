import type { ChatsWithCustomer, Message, Customer } from '@/lib/querys'

// Función para formatear la fecha de último mensaje
export function formatLastUpdate(dateString?: string): string {
  if (!dateString) return 'Sin fecha'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? 'Ahora' : `Hace ${diffInMinutes} min`
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours}h`
  } else if (diffInHours < 48) {
    return 'Ayer'
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }
}

// Función para formatear timestamp de mensajes
export function formatMessageTime(timestamp?: Date | string): string {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

// Función para obtener las iniciales del nombre del usuario
export function getUserInitials(customer?: Customer): string {
  if (!customer) return '??'
  
  const name = customer.user_name || customer.whatsapp_number || 'Usuario'
  const words = name.split(' ')
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  } else if (words.length === 1 && words[0].length >= 2) {
    return words[0].substring(0, 2).toUpperCase()
  } else {
    return 'U?'
  }
}

// Función para obtener el nombre de display del customer
export function getCustomerDisplayName(customer?: Customer): string {
  if (!customer) return 'Usuario desconocido'
  
  return customer.user_name || 
         customer.whatsapp_number || 
         customer.email || 
         'Usuario sin nombre'
}

// Función para determinar si un chat necesita intervención
export function chatNeedsIntervention(chat: ChatsWithCustomer): boolean {
  // Si el customer no está activo con el agente, necesita intervención
  return !chat.customers?.agent_active
}

// Función para obtener el último mensaje de preview
export function getLastMessagePreview(messages: Message[]): string {
  if (messages.length === 0) return 'Sin mensajes'
  
  const lastMessage = messages[messages.length - 1]
  const content = lastMessage.content || 'Mensaje sin contenido'
  
  // Truncar mensaje si es muy largo
  return content.length > 50 ? content.substring(0, 47) + '...' : content
}

// Función para determinar el estado del chat
export function getChatStatus(chat: ChatsWithCustomer): 'inbox' | 'ai' {
  return chatNeedsIntervention(chat) ? 'inbox' : 'ai'
}

// Interfaz para datos de conversación adaptados para la UI
export interface ConversationUIData {
  id: string
  name: string
  lastMessage: string
  time: string
  needsIntervention: boolean
  status: 'inbox' | 'ai'
  avatar: string
  customer?: Customer
}

// Función para transformar chat con customer en datos de UI
export function transformChatToConversationUI(
  chat: ChatsWithCustomer, 
  messages: Message[] = []
): ConversationUIData {
  return {
    id: chat.id,
    name: getCustomerDisplayName(chat.customers),
    lastMessage: getLastMessagePreview(messages),
    time: formatLastUpdate(chat.last_update),
    needsIntervention: chatNeedsIntervention(chat),
    status: getChatStatus(chat),
    avatar: getUserInitials(chat.customers),
    customer: chat.customers
  }
} 