"use client"

import React, { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Search, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatContext } from "./chat-context"
import { transformChatToConversationUI, ConversationUIData } from "./chat-utils"
import { getLastMessageByChat } from "@/lib/querys"

// Usar el tipo ConversationUIData de chat-utils
type Conversation = ConversationUIData

interface ConversationsListProps {
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { chats, messages, loading, error, loadMessagesForChat } = useChatContext()
  
  // Estado para manejar los últimos mensajes de cada chat
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({})

  // Función para manejar la selección de conversación
  const handleSelectConversation = async (chatId: string) => {
    onSelectConversation(chatId)
    
    // Solo mostrar loading si no tenemos mensajes en cache
    if (!messages[chatId]) {
      setLoadingMessages(chatId)
      try {
        await loadMessagesForChat(chatId)
      } finally {
        setLoadingMessages(null)
      }
    }
  }

  // Cargar último mensaje para cada chat si no está en cache
  React.useEffect(() => {
    const loadLastMessages = async () => {
      for (const chat of chats) {
        // Si no tenemos mensajes en cache para este chat, cargar el último mensaje
        if (!messages[chat.id] && !lastMessages[chat.id]) {
          try {
            const lastMessage = await getLastMessageByChat(chat.id)
            if (lastMessage) {
              setLastMessages(prev => ({
                ...prev,
                [chat.id]: lastMessage.content || 'Mensaje sin contenido'
              }))
            }
          } catch (error) {
            console.error(`Error loading last message for chat ${chat.id}:`, error)
          }
        }
      }
    }

    if (chats.length > 0) {
      loadLastMessages()
    }
  }, [chats, messages, lastMessages])

  // Transformar chats a datos de conversación con sus mensajes
  const conversations = useMemo(() => {
    return chats.map(chat => {
      const chatMessages = messages[chat.id] || []
      
      // Si no hay mensajes en cache, usar el último mensaje cargado
      if (chatMessages.length === 0 && lastMessages[chat.id]) {
        // Crear un mensaje temporal para la transformación
        const tempMessage = {
          id: 'temp',
          chat_id: chat.id,
          clinic_id: chat.clinic_id,
          customer_id: chat.customer_id,
          content: lastMessages[chat.id],
          sender: 'temp',
          created_at: new Date().toISOString()
        }
        return transformChatToConversationUI(chat, [tempMessage])
      }
      
      return transformChatToConversationUI(chat, chatMessages)
    })
  }, [chats, messages, lastMessages])

  // Estado para indicar qué chat está cargando mensajes
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null)

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const inboxConversations = filteredConversations.filter((conv) => conv.status === "inbox")
  const aiConversations = filteredConversations.filter((conv) => conv.status === "ai")

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pacientes..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando conversaciones...</p>
          </div>
        </div>
      </div>
    )
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pacientes..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm">Error al cargar conversaciones</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay conversaciones
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">No hay conversaciones disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  const getAvatarGradient = (avatar: string) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
    ]
    const index = avatar.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {/* Inbox Section */}
        {inboxConversations.length > 0 && (
          <div className="p-3">
            <div className="flex items-center mb-3">
              <User className="h-4 w-4 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-800">Inbox</h3>
              <Badge variant="secondary" className="ml-auto bg-red-100 text-red-800">
                {inboxConversations.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {inboxConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  } ${conversation.needsIntervention ? "font-semibold" : ""}`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${getAvatarGradient(conversation.avatar)} text-white font-medium`}>
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                        <div className="flex items-center space-x-2">
                          {loadingMessages === conversation.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                          )}
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Agent Section */}
        {aiConversations.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center mb-3">
              <Bot className="h-4 w-4 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-800">Agente AI</h3>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                {aiConversations.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {aiConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors opacity-75 ${
                    selectedConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${getAvatarGradient(conversation.avatar)} text-white font-medium`}>
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                        <div className="flex items-center space-x-2">
                          {loadingMessages === conversation.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                          )}
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
