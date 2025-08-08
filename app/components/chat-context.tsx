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
  loadingOlderMessages: Record<string, boolean> // Loading específico para mensajes antiguos
  error: string | null
  conversationsUI?: any[] // Para datos de UI transformados
  pagination: Record<string, { page: number, hasMore: boolean, total: number }>
  loadMessagesForChat: (chatId: string) => Promise<void>
  loadUserMessages: (clinicId: string, userId: string, page?: number) => Promise<void>
  loadOlderMessages: (clinicId: string, userId: string) => Promise<void>
  loadNewMessages: (clinicId: string, userId: string) => Promise<void> // Nueva función para mensajes recientes
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
  const [selectedConversation, setSelectedConversation] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingConversations, setLoadingConversations] = useState<Record<string, boolean>>({})
  const [loadingOlderMessages, setLoadingOlderMessages] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState<Record<string, { page: number, hasMore: boolean, total: number }>>({})
  const [error, setError] = useState<string | null>(null)

  const loadMessagesForChat = useCallback(async (chatId: string) => {
    // Implementación para cargar mensajes de chat (Supabase)
    console.log('Loading messages for chat:', chatId)
  }, [])

    const loadUserMessages = useCallback(async (clinicId: string, userId: string, page: number = 1) => {
    // Usar loading específico para esta conversación
    const isFirstPage = page === 1
    if (isFirstPage) {
      setLoadingConversations(prev => ({ ...prev, [userId]: true }))
    }
    setError(null)
    
    try {
      const limit = 50 // Reducir el límite para mejor performance
      const userMessages = await getUserMessagesN8N(clinicId, userId, page, limit)
      
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
        timestamp: msg.timestamp || msg.created_at,
        created_at: msg.created_at || new Date().toISOString(),
        updated_at: msg.updated_at || new Date().toISOString()
      }))

      // Actualizar mensajes según si es primera página o página adicional
      if (isFirstPage) {
        // Primera página: reemplazar mensajes (solo los más recientes)
        console.log('Cargando primera página, estableciendo', formattedMessages.length, 'mensajes')
        setMessages(prev => ({
          ...prev,
          [userId]: formattedMessages
        }))
        
        // Establecer paginación inicial
        setPagination(prev => ({
          ...prev,
          [userId]: {
            page: 1,
            hasMore: formattedMessages.length === limit,
            total: formattedMessages.length
          }
        }))
      } else {
        // Página adicional: agregar mensajes más antiguos al inicio del array existente
        setMessages(prev => {
          const existingMessages = prev[userId] || []
          console.log('🔍 Mensajes existentes en el estado:', existingMessages.length)
          console.log('🔍 Mensajes nuevos recibidos del API:', formattedMessages.length)
          
          // Filtrar duplicados basado en ID
          const newMessages = formattedMessages.filter(newMsg => 
            !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
          )
          
          console.log('✅ Mensajes nuevos únicos (sin duplicados):', newMessages.length)
          
          // IMPORTANTE: Los mensajes del API vienen ordenados del más reciente al más viejo
          // Los mensajes existentes también están en ese orden
          // Necesitamos poner los mensajes más antiguos (nuevos) AL INICIO
          const updatedMessages = [...newMessages, ...existingMessages]
          
          console.log('📊 Total mensajes después de combinar:', updatedMessages.length)
          console.log('📊 Primer mensaje (más antiguo):', updatedMessages[0]?.content?.substring(0, 50))
          console.log('📊 Último mensaje (más reciente):', updatedMessages[updatedMessages.length - 1]?.content?.substring(0, 50))
          
          return {
            ...prev,
            [userId]: updatedMessages
          }
        })
        
        // Actualizar paginación para páginas adicionales
        setPagination(prev => {
          const currentPagination = prev[userId] || { page: 1, hasMore: false, total: 0 }
          const newMessages = formattedMessages.filter(newMsg => {
            const existingMessages = messages[userId] || []
            return !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
          })
          
          return {
            ...prev,
            [userId]: {
              page: page,
              hasMore: formattedMessages.length === limit,
              total: currentPagination.total + newMessages.length
            }
          }
        })
      }
      
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
      
      // Guardar la información del customer solo en la primera página
      if (isFirstPage) {
        setCustomers(prev => ({
          ...prev,
          [userId]: customerData
        }))
        setSelectedConversation(userId)
      }
    } catch (err) {
      console.error('Error loading user messages:', err)
      setError('Error al cargar mensajes del usuario')
    } finally {
      if (isFirstPage) {
        setLoadingConversations(prev => ({ ...prev, [userId]: false }))
      }
    }
  }, [])

  // Nueva función para cargar mensajes más antiguos
  const loadOlderMessages = useCallback(async (clinicId: string, userId: string) => {
    // Verificar si ya está cargando
    if (loadingOlderMessages[userId]) {
      console.log('Ya está cargando mensajes antiguos para:', userId)
      return
    }

    // Obtener paginación actual
    const currentPagination = pagination[userId]
    if (!currentPagination) {
      console.log('No hay información de paginación para:', userId)
      return
    }

    if (!currentPagination.hasMore) {
      console.log('No hay más mensajes para cargar para:', userId)
      return
    }

    const nextPage = currentPagination.page + 1
    console.log(`📥 Cargando página ${nextPage} para usuario: ${userId}`)
    console.log('📊 Estado actual:', {
      currentPage: currentPagination.page,
      hasMore: currentPagination.hasMore,
      total: currentPagination.total,
      mensajesActuales: messages[userId]?.length || 0
    })

    setLoadingOlderMessages(prev => ({ ...prev, [userId]: true }))
    
    try {
      // Cargar mensajes de la siguiente página
      const limit = 50 // Mantener consistencia con el límite
      const userMessages = await getUserMessagesN8N(clinicId, userId, nextPage, limit)
      
      if (!Array.isArray(userMessages)) {
        console.error('userMessages no es un array:', userMessages)
        throw new Error('Formato de respuesta inválido')
      }
      
      // Convertir los mensajes al formato esperado
      const formattedMessages: Message[] = userMessages.map((msg: any, index: number) => ({
        id: msg.id || `msg_${nextPage}_${index}`,
        chat_id: msg.chat_id || userId,
        clinic_id: clinicId,
        customer_id: userId,
        content: msg.content || msg.message || '',
        sender: msg.sender || 'user',
        timestamp: msg.timestamp || msg.created_at,
        created_at: msg.created_at || new Date().toISOString(),
        updated_at: msg.updated_at || new Date().toISOString()
      }))

      // Filtrar duplicados basado en ID
      const existingMessages = messages[userId] || []
      const newMessages = formattedMessages.filter(newMsg => 
        !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
      )
      
      console.log('✅ Mensajes nuevos únicos:', newMessages.length)
      
      if (newMessages.length > 0) {
        // Agregar mensajes más antiguos al inicio del array
        // Los mensajes nuevos son más antiguos que los existentes
        setMessages(prev => {
          const updatedMessages = [...newMessages, ...existingMessages]
          console.log('📊 Total mensajes después de combinar:', updatedMessages.length)
          console.log('📊 Primer mensaje (más antiguo):', updatedMessages[0]?.content?.substring(0, 50))
          console.log('📊 Último mensaje (más reciente):', updatedMessages[updatedMessages.length - 1]?.content?.substring(0, 50))
          return {
            ...prev,
            [userId]: updatedMessages
          }
        })
        
        // Actualizar paginación
        setPagination(prev => ({
          ...prev,
          [userId]: {
            page: nextPage,
            hasMore: formattedMessages.length === limit,
            total: currentPagination.total + newMessages.length
          }
        }))
        
        console.log('✅ Página', nextPage, 'cargada exitosamente con', newMessages.length, 'mensajes nuevos')
      } else {
        console.log('⚠️ No se encontraron mensajes nuevos en la página', nextPage)
        // Marcar como no hay más mensajes si no se encontraron nuevos
        setPagination(prev => ({
          ...prev,
          [userId]: {
            ...currentPagination,
            hasMore: false
          }
        }))
      }
    } catch (err) {
      console.error('Error loading older messages:', err)
      setError('Error al cargar mensajes anteriores')
    } finally {
      setLoadingOlderMessages(prev => ({ ...prev, [userId]: false }))
    }
  }, [pagination, loadingOlderMessages, messages])

  // Nueva función para cargar solo mensajes nuevos (polling)
  const loadNewMessages = useCallback(async (clinicId: string, userId: string) => {
    console.log('🔄 Polling: Verificando mensajes nuevos para', userId)
    
    try {
      // Obtener los mensajes más recientes (página 1)
      const limit = 50 // Mismo límite que la carga inicial
      const userMessages = await getUserMessagesN8N(clinicId, userId, 1, limit)
      
      if (!Array.isArray(userMessages)) {
        console.error('userMessages no es un array:', userMessages)
        return
      }
      
      // Convertir los mensajes al formato esperado
      const formattedMessages: Message[] = userMessages.map((msg: any, index: number) => ({
        id: msg.id || `msg_new_${index}`,
        chat_id: msg.chat_id || userId,
        clinic_id: clinicId,
        customer_id: userId,
        content: msg.content || msg.message || '',
        sender: msg.sender || 'user',
        timestamp: msg.timestamp || msg.created_at,
        created_at: msg.created_at || new Date().toISOString(),
        updated_at: msg.updated_at || new Date().toISOString()
      }))
      
      // Obtener mensajes existentes
      const existingMessages = messages[userId] || []
      if (existingMessages.length === 0) {
        console.log('📭 No hay mensajes existentes, omitiendo polling')
        return
      }
      
      // Filtrar solo mensajes que no existen ya (nuevos)
      const newMessages = formattedMessages.filter(newMsg => 
        !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
      )
      
      console.log('🔍 Polling result:', {
        mensajesDelApi: formattedMessages.length,
        mensajesExistentes: existingMessages.length,
        mensajesNuevos: newMessages.length
      })
      
      if (newMessages.length > 0) {
        console.log('🎉 Encontrados', newMessages.length, 'mensajes nuevos!')
        
        // Agregar mensajes nuevos al final (son los más recientes)
        // IMPORTANTE: Los mensajes nuevos son más recientes que los existentes
        setMessages(prev => {
          const updatedMessages = [...existingMessages, ...newMessages]
          console.log('📊 Total mensajes después de agregar nuevos:', updatedMessages.length)
          console.log('📊 Primer mensaje (más antiguo):', updatedMessages[0]?.content?.substring(0, 50))
          console.log('📊 Último mensaje (más reciente):', updatedMessages[updatedMessages.length - 1]?.content?.substring(0, 50))
          return {
            ...prev,
            [userId]: updatedMessages
          }
        })
        
        // Actualizar el total en paginación
        setPagination(prev => {
          const currentPagination = prev[userId]
          if (currentPagination) {
            return {
              ...prev,
              [userId]: {
                ...currentPagination,
                total: currentPagination.total + newMessages.length
              }
            }
          }
          return prev
        })
      } else {
        console.log('📭 No hay mensajes nuevos')
      }
    } catch (err) {
      console.error('Error en polling de mensajes:', err)
      // No establecer error para polling, para no interrumpir la UX
    }
  }, [messages])

  // Función segura para establecer conversación seleccionada
  const safeSetSelectedConversation = useCallback((id: string) => {
    const safeId = id || ""
    setSelectedConversation(safeId)
  }, [])

  const value: ChatContextType = useMemo(() => ({
    chats,
    messages,
    customers,
    selectedConversation,
    loading,
    loadingConversations,
    loadingOlderMessages,
    pagination,
    error,
    loadMessagesForChat,
    loadUserMessages,
    loadOlderMessages,
    loadNewMessages,
    setSelectedConversation: safeSetSelectedConversation
  }), [chats, messages, customers, selectedConversation, loading, loadingConversations, loadingOlderMessages, pagination, error, loadMessagesForChat, loadUserMessages, loadOlderMessages, loadNewMessages, safeSetSelectedConversation])

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