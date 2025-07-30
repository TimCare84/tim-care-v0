"use client"

import { useState, useEffect, useCallback } from "react"
import { ConversationsList } from "./conversations-list"
import { ChatWindow } from "./chat-window"
import { PatientInfo } from "./patient-info"
import { ChatContext, ChatWithCustomer, Chats, Message, Customer } from "./chat-context"
import { transformChatToConversationUI, ConversationUIData } from "./chat-utils"
import { DebugPanel } from "./debug-panel"
import { 
  getAllChats,
  getChatsWithCustomerInfo,
  getMessagesByChat,
  getCustomerByChat
} from "@/lib/querys"

export function ChatViewer() {
  const [selectedConversation, setSelectedConversation] = useState<string>("")
  const [chats, setChats] = useState<ChatWithCustomer[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [customers, setCustomers] = useState<Record<string, Customer>>({})
  const [conversationsUI, setConversationsUI] = useState<ConversationUIData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar chats y datos relacionados
  useEffect(() => {
    const loadChatsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener chats con información del customer
        const chatsData = await getChatsWithCustomerInfo()
        console.log('Chats data loaded:', chatsData)
        setChats(chatsData)

        // Si hay chats, seleccionar el primero por defecto
        if (chatsData.length > 0 && !selectedConversation) {
          setSelectedConversation(chatsData[0].id)
          console.log('Selected first conversation:', chatsData[0].id)
        }

        // Preparar datos de customers para fácil acceso
        const customersMap: Record<string, Customer> = {}
        for (const chat of chatsData) {
          if (chat.customers) {
            customersMap[chat.id] = chat.customers
          }
        }
        setCustomers(customersMap)
        console.log('Customers map:', customersMap)

                // Transformar chats a formato UI
        const uiConversations = chatsData.map(chat => 
          transformChatToConversationUI(chat, [])
        )
        setConversationsUI(uiConversations)

      } catch (err) {
        console.error('Error loading chats data:', err)
        setError('Error al cargar los chats')
      } finally {
        setLoading(false)
      }
    }

    loadChatsData()
  }, [])

  // Función para cargar mensajes de un chat específico
  const loadMessagesForChat = useCallback(async (chatId: string) => {
    if (!chatId) return

    try {
      // Solo cargar si no tenemos los mensajes en cache
      if (!messages[chatId]) {
        console.log('Loading messages for chat:', chatId)
        const chatMessages = await getMessagesByChat(chatId)
        console.log('Messages loaded:', chatMessages)
        setMessages(prev => ({
          ...prev,
          [chatId]: chatMessages as Message[]
        }))
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }, [messages])

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessagesForChat(selectedConversation)
    }
  }, [selectedConversation, loadMessagesForChat])

  if (loading) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando chats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay chats disponibles</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    chats,
    messages,
    customers,
    selectedConversation,
    loading,
    error,
    conversationsUI,
    loadMessagesForChat
  }

  return (
    <ChatContext.Provider value={contextValue}>
      <div className="flex-1 flex h-screen">
        {/* Left Panel - Conversations List */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationsList 
            selectedConversation={selectedConversation} 
            onSelectConversation={setSelectedConversation}
          />
        </div>

        {/* Middle Panel - Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow 
              conversationId={selectedConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Selecciona una conversación</p>
                <p className="text-sm">Elige un chat de la lista para comenzar</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Patient Info */}
        <div className="w-80 bg-slate-50 border-l border-gray-200">
          {selectedConversation ? (
            <PatientInfo 
              conversationId={selectedConversation}
            />
          ) : (
            <div className="p-6 h-full flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Información del paciente aparecerá aquí cuando selecciones una conversación
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug Panel - Solo en desarrollo */}
      {/* {process.env.NODE_ENV === 'development' && <DebugPanel />} */}
    </ChatContext.Provider>
  )
}
