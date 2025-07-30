"use client"

import { createContext, useContext } from 'react'
import type { Chats } from '../../schemas/chats'
import type { Message } from '../../schemas/messages'
import type { Customer } from '../../schemas/customers'
import type { Conversations } from '../../schemas/conversations'
import type { ChatsWithCustomer } from '@/lib/querys'

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
  error: string | null
  conversationsUI?: any[] // Para datos de UI transformados
  loadMessagesForChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export { ChatContext } 