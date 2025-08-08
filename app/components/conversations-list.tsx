"use client"

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Search, Bot, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChatContext } from "./chat-context"
import { transformChatToConversationUI, ConversationUIData } from "./chat-utils"
import { getLastMessageByChat, getUsersByClinicN8N, getUserMessagesN8N, User as UserType } from "@/lib/querys"
import { useSearchParams } from "next/navigation"

// Usar el tipo ConversationUIData de chat-utils
type Conversation = ConversationUIData

interface ConversationsListProps {
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

// Componente interno que usa useSearchParams
function ConversationsListContent({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { chats, messages, loadMessagesForChat, loadUserMessages } = useChatContext()
  const searchParams = useSearchParams()
  
  // Estado para manejar los últimos mensajes de cada chat
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({})
  
  // Estado para usuarios de la clínica
  const [clinicUsers, setClinicUsers] = useState<UserType[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(50)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [hasNext, setHasNext] = useState<boolean>(false)
  const [hasPrev, setHasPrev] = useState<boolean>(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Función para manejar la selección de conversación - Comentado temporalmente
  // const handleSelectConversation = async (chatId: string) => {
  //   onSelectConversation(chatId)
  //   
  //   // Solo mostrar loading si no tenemos mensajes en cache
  //   if (!messages[chatId]) {
  //     setLoadingMessages(chatId)
  //     try {
  //       await loadMessagesForChat(chatId)
  //     } finally {
  //       setLoadingMessages(null)
  //       }
  //     }
  //   }

  // Función para manejar la selección de usuario y cargar sus mensajes
  const handleSelectConversation = useCallback(async (userId: string) => {
    // Verificar que searchParams esté disponible (para SSR)
    if (!searchParams) {
      console.error('Search params not available')
      return
    }
    
    const clinicId = searchParams.get('clinic_id')
    if (!clinicId) {
      console.error('No clinic_id found in URL')
      return
    }

    // Solo cambiar la selección si es diferente
    if (selectedConversation !== userId) {
      onSelectConversation(userId)

      // Solo cargar mensajes si no están en cache
      if (!messages[userId] || messages[userId].length === 0) {
        try {
          setLoadingMessages(userId)
          await loadUserMessages(clinicId, userId)
        } catch (error) {
          console.error('Error loading user messages:', error)
        } finally {
          setLoadingMessages(null)
        }
      }
    }
  }, [selectedConversation, messages, searchParams, onSelectConversation, loadUserMessages])

  // Cargar usuarios de la clínica solo una vez
  useEffect(() => {
    const loadClinicUsers = async () => {
      // Verificar que searchParams esté disponible (para SSR)
      if (!searchParams) {
        return
      }
      
      const clinicId = searchParams.get('clinic_id')
      if (!clinicId) {
        console.log('No clinic_id found in URL')
        return
      }

      setLoadingUsers(true)
      setUsersError(null)
      
      try {
        const { users, pagination } = await getUsersByClinicN8N(clinicId, page, limit, true)
        setClinicUsers(users)
        if (pagination) {
          setTotalPages(pagination.totalPages)
          setHasNext(pagination.hasNext)
          setHasPrev(pagination.hasPrev)
        } else {
          // Fallback si no llega paginación
          setTotalPages(1)
          setHasNext(false)
          setHasPrev(false)
        }
      } catch (error) {
        console.error('Error loading clinic users:', error)
        setUsersError('Error al cargar usuarios de la clínica')
      } finally {
        setLoadingUsers(false)
      }
    }

    loadClinicUsers()
  }, [searchParams, page, limit]) // recargar al cambiar página o límite

  // Cargar último mensaje para cada chat si no está en cache - Comentado temporalmente
  // React.useEffect(() => {
  //   const loadLastMessages = async () => {
  //     for (const chat of chats) {
  //       // Si no tenemos mensajes en cache para este chat, cargar el último mensaje
  //       if (!messages[chat.id] && !lastMessages[chat.id]) {
  //         try {
  //           const lastMessage = await getLastMessageByChat(chat.id)
  //           if (lastMessage) {
  //             setLastMessages(prev => ({
  //               ...prev,
  //               [chat.id]: lastMessage.content || 'Mensaje sin contenido'
  //             }))
  //           }
  //         } catch (error) {
  //           console.error(`Error loading last message for chat ${chat.id}:`, error)
  //         }
  //       }
  //     }
  //   }

  //   if (chats.length > 0) {
  //     loadLastMessages()
  //   }
  // }, [chats, messages, lastMessages])

  // Transformar usuarios de la clínica a formato de conversación (temporalmente reemplazando chats de Supabase)
  const conversations = useMemo(() => {
    // Comentado temporalmente - usando usuarios de N8N en lugar de chats de Supabase
    // return chats.map(chat => {
    //   const chatMessages = messages[chat.id] || []
    //   
    //   // Si no hay mensajes en cache, usar el último mensaje cargado
    //   if (chatMessages.length === 0 && lastMessages[chat.id]) {
    //     // Crear un mensaje temporal para la transformación
    //     const tempMessage = {
    //       id: 'temp',
    //       chat_id: chat.id,
    //       clinic_id: chat.clinic_id,
    //       customer_id: chat.customer_id,
    //       content: lastMessages[chat.id],
    //       sender: 'temp',
    //       created_at: new Date().toISOString()
    //     }
    //     return transformChatToConversationUI(chat, [tempMessage])
    //   }
    //   
    //   return transformChatToConversationUI(chat, chatMessages)
    // })

    // Usar usuarios de N8N como conversaciones
    return clinicUsers.map(user => {
      const safeName = (user.user_name?.trim() || user.whatsapp_number || 'Usuario')
      const safeAvatar = (safeName && safeName.length > 0 ? safeName[0] : 'U').toUpperCase()
      const safeLastMessage = user.whatsapp_number ? `📱 ${user.whatsapp_number}` : ''
      const safeTime = user.last_interaction ? new Date(user.last_interaction).toLocaleDateString('es-ES') : ''

      return {
        id: user.id,
        name: safeName,
        avatar: safeAvatar,
        lastMessage: safeLastMessage,
        time: safeTime,
        status: user.agent_active ? 'inbox' : 'ai',
        needsIntervention: false,
        unreadCount: 0
      }
    })
  }, [clinicUsers]) // Cambiado de [chats, messages, lastMessages] a [clinicUsers]

  // Estado para indicar qué chat está cargando mensajes
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null)

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const inboxConversations = filteredConversations.filter((conv) => conv.status === "inbox")
  const aiConversations = filteredConversations.filter((conv) => conv.status === "ai")

  // Si está cargando usuarios, mostrar skeleton
  if (loadingUsers) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    )
  }

  // Si hay error al cargar usuarios, mostrar mensaje
  if (usersError) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm">Error al cargar usuarios</p>
            <p className="text-xs mt-1">{usersError}</p>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay usuarios
  if (clinicUsers.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">No hay usuarios disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  const getAvatarGradient = (avatar: string) => {
    if (!avatar || typeof avatar !== 'string') {
      return "bg-gradient-to-br from-gray-400 to-gray-600"
    }
    
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
            placeholder="Buscar usuarios..."
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

                {/* Usuarios de la Clínica Section - Comentado temporalmente */}
        {/* {clinicUsers.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center mb-3">
              <User className="h-4 w-4 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-800">Usuarios de la Clínica</h3>
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                {clinicUsers.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {clinicUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                     <Avatar className="h-10 w-10">
                       <AvatarFallback className={`${getAvatarGradient(user.user_name)} text-white font-medium`}>
                         {user.user_name.charAt(0).toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-medium text-gray-900 truncate">{user.user_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {user.agent_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                         <p className="text-sm text-gray-600 truncate mt-1">{user.email}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          📱 {user.whatsapp_number} • Última interacción: {new Date(user.last_interaction).toLocaleDateString('es-ES')}
                        </p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )} */}

        {/* Loading Users */}
        {loadingUsers && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Cargando usuarios...</span>
            </div>
          </div>
        )}

        {/* Users Error */}
        {usersError && (
          <div className="p-3 border-t border-gray-100">
            <div className="text-center text-red-600 py-2">
              <p className="text-sm">{usersError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {(hasNext || hasPrev || totalPages > 1) && (
        <div className="border-t border-gray-200 bg-gray-50/30">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasPrev || loadingUsers}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNext || loadingUsers}
                onClick={() => setPage(prev => prev + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Página <span className="font-medium text-foreground">{page}</span> de <span className="font-medium text-foreground">{totalPages}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Por página:
                </label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => { setPage(1); setLimit(Number(value)) }}
                  disabled={loadingUsers}
                >
                  <SelectTrigger className="h-6 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente wrapper con Suspense
export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  return (
    <Suspense fallback={
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <ConversationsListContent 
        selectedConversation={selectedConversation} 
        onSelectConversation={onSelectConversation} 
      />
    </Suspense>
  )
}
