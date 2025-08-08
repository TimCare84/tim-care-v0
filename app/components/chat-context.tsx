"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import type { Chats } from '../../schemas/chats'
import type { Message } from '../../schemas/messages'
import type { Customer } from '../../schemas/customers'
import type { Conversations } from '../../schemas/conversations'
import type { ChatsWithCustomer } from '@/lib/querys'
import { getUserMessagesN8N, getUsersByClinicN8N } from '@/lib/querys'

// Usar el tipo de la consulta para mantener consistencia
export type ChatWithCustomer = ChatsWithCustomer

// Re-exportar los tipos de los esquemas para facilidad de uso
export type { Chats, Message, Customer, Conversations }

// Contexto de chat
interface ChatContextType {
  chats: ChatWithCustomer[]
  messages: Record<string, Message[]>
  customers: Record<string, Customer>
  selectedConversation: string
  loading: boolean
  loadingConversations: Record<string, boolean> // Loading específico por conversación
  error: string | null
  conversationsUI?: any[] // Para datos de UI transformados
  loadMessagesForChat: (chatId: string) => Promise<void>
  loadUserMessages: (clinicId: string, userId: string) => Promise<void>
  setSelectedConversation: (id: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [chats, setChats] = useState<ChatWithCustomer[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [customers, setCustomers] = useState<Record<string, Customer>>({})
  const [selectedConversation, setSelectedConversation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const loadMessagesForChat = useCallback(async (chatId: string) => {
    // Implementación para cargar mensajes de chat (Supabase)
    console.log('Loading messages for chat:', chatId)
  }, [])

    const loadUserMessages = useCallback(async (clinicId: string, userId: string) => {
    // Usar loading específico para esta conversación
    setLoadingConversations(prev => ({ ...prev, [userId]: true }))
    setError(null)
    
    try {
      const userMessages = await getUserMessagesN8N(clinicId, userId, 1, 100)
      
      // Verificar que userMessages sea un array
      if (!Array.isArray(userMessages)) {
        console.error('userMessages no es un array:', userMessages)
        setError('Formato de respuesta inválido')
        return
      }
      
      // Convertir los mensajes de N8N al formato esperado por el contexto
      const formattedMessages: Message[] = userMessages.map((msg: any, index: number) => ({
        id: msg.id || `msg_${index}`,
        chat_id: msg.chat_id || userId,
        clinic_id: clinicId,
        customer_id: userId,
        content: msg.content || msg.message || '',
        sender: msg.sender || 'user',
        created_at: msg.created_at || new Date().toISOString(),
        updated_at: msg.updated_at || new Date().toISOString()
      }))

      setMessages(prev => ({
        ...prev,
        [userId]: formattedMessages
      }))
      
      // Intentar obtener información del usuario desde N8N
      let customerData: Customer
      try {
        const { users } = await getUsersByClinicN8N(clinicId, 1, 100, true)
        const userInfo = users.find(user => user.id === userId)
        
        if (userInfo) {
          // Usar la información real del usuario
          customerData = {
            id: userInfo.id,
            clinic_id: userInfo.clinic_id,
            user_name: userInfo.user_name || `Usuario ${userId.substring(0, 8)}`,
            email: userInfo.email || '',
            agent_active: userInfo.agent_active,
            whatsapp_number: userInfo.whatsapp_number || '',
            last_interaction: formattedMessages.length > 0 
              ? formattedMessages[formattedMessages.length - 1].created_at 
              : userInfo.last_interaction || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        } else {
          // Crear un customer básico con la información disponible
          customerData = {
            id: userId,
            clinic_id: clinicId,
            user_name: `Usuario ${userId.substring(0, 8)}`, // Nombre temporal basado en el ID
            email: '',
            agent_active: true,
            whatsapp_number: '',
            last_interaction: formattedMessages.length > 0 
              ? formattedMessages[formattedMessages.length - 1].created_at 
              : new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      } catch (userError) {
        console.warn('No se pudo obtener información del usuario:', userError)
        // Crear un customer básico como fallback
        customerData = {
          id: userId,
          clinic_id: clinicId,
          user_name: `Usuario ${userId.substring(0, 8)}`,
          email: '',
          agent_active: true,
          whatsapp_number: '',
          last_interaction: formattedMessages.length > 0 
            ? formattedMessages[formattedMessages.length - 1].created_at 
            : new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      // Guardar la información del customer
      setCustomers(prev => ({
        ...prev,
        [userId]: customerData
      }))
      
      setSelectedConversation(userId)
    } catch (err) {
      console.error('Error loading user messages:', err)
      setError('Error al cargar mensajes del usuario')
    } finally {
      setLoadingConversations(prev => ({ ...prev, [userId]: false }))
    }
  }, [])

  const value: ChatContextType = useMemo(() => ({
    chats,
    messages,
    customers,
    selectedConversation,
    loading,
    loadingConversations,
    error,
    loadMessagesForChat,
    loadUserMessages,
    setSelectedConversation
  }), [chats, messages, customers, selectedConversation, loading, loadingConversations, error, loadMessagesForChat, loadUserMessages, setSelectedConversation])

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export { ChatContext } 