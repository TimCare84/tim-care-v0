"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Zap, Phone, Calendar, MapPin, FileText, CreditCard, Bot, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useChatContext } from "./chat-context"
import { getCustomerDisplayName, getUserInitials, formatMessageTime, formatLastUpdate } from "./chat-utils"

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const { 
    messages, 
    customers, 
    loadingConversations, 
    loadingOlderMessages, 
    pagination, 
    loadOlderMessages,
    loadNewMessages 
  } = useChatContext()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [lastKnownMessageCount, setLastKnownMessageCount] = useState(0)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [hasCompletedInitialScroll, setHasCompletedInitialScroll] = useState(false)
  
  // Memoizar los datos específicos de esta conversación para evitar re-renderizados
  const chatMessages = useMemo(() => {
    const msgs = messages[conversationId] || []
    console.log('💬 Mensajes en ChatWindow para', conversationId, ':', msgs.length)
    
    // Los mensajes del API vienen del más reciente al más viejo
    // Para mostrarlos correctamente en la UI (más antiguos arriba, más recientes abajo)
    // Necesitamos ordenarlos por timestamp de forma ascendente
    const sortedMessages = [...msgs].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeA - timeB // Orden ascendente: más antiguos primero
    })
    
    if (msgs.length > 0) {
      console.log('📝 Primer mensaje (más antiguo):', sortedMessages[0]?.content?.substring(0, 30))
      console.log('📝 Último mensaje (más reciente):', sortedMessages[sortedMessages.length - 1]?.content?.substring(0, 30))
    }
    
    return sortedMessages
  }, [messages, conversationId])
  
  const customer = useMemo(() => customers[conversationId], [customers, conversationId])
  const isLoading = useMemo(() => loadingConversations[conversationId] || false, [loadingConversations, conversationId])
  const isLoadingOlderMsgs = useMemo(() => loadingOlderMessages[conversationId] || false, [loadingOlderMessages, conversationId])
  const currentPagination = useMemo(() => pagination[conversationId], [pagination, conversationId])

  // Función para hacer scroll al final
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      // Usar scrollTop directamente para asegurar que funcione
      container.scrollTop = container.scrollHeight
      
      // Verificar que realmente llegamos al final
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10
      console.log('📍 ScrollToBottom ejecutado:', {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        isAtBottom
      })
      
      // Si no llegamos al final, intentar de nuevo
      if (!isAtBottom) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const retryContainer = messagesContainerRef.current
            retryContainer.scrollTop = retryContainer.scrollHeight
            console.log('📍 Reintento de scroll:', retryContainer.scrollTop, retryContainer.scrollHeight)
          }
        }, 50)
      }
    }
  }, [])

  // Función para detectar si el usuario está cerca del final
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return false
    
    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100 // Pixels desde el bottom para considerar "cerca del final"
    return scrollTop + clientHeight >= scrollHeight - threshold
  }, [])

  // Función para detectar scroll hacia arriba y cargar mensajes antiguos
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 150 // Pixels desde el top para activar la carga
    
    // Detectar si el usuario está cerca del final
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100
    setHasScrolledToBottom(nearBottom)

    // Solo mostrar debug cuando esté cerca del top
    if (scrollTop <= threshold) {
      console.log('🔄 Scroll detectado cerca del top:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isLoadingOlderMsgs,
        hasMore: currentPagination?.hasMore,
        currentPage: currentPagination?.page,
        totalMessages: chatMessages.length,
        conversationId,
        isInitialLoad,
        hasCompletedInitialScroll
      })
    }

    // Cargar mensajes antiguos SOLO si el usuario hace scroll hacia arriba manualmente
    // NO cargar automáticamente al inicio
    if (scrollTop <= threshold && 
        !isLoadingOlderMsgs && 
        !isLoadingMore &&
        currentPagination?.hasMore &&
        chatMessages.length > 0 && 
        hasCompletedInitialScroll && // Solo cargar después de completar el scroll inicial
        scrollTop > 10) { // Solo cargar si el usuario ha hecho scroll significativo (más de 10px)
        
      console.log('📥 Iniciando carga de mensajes antiguos...')
      console.log('📥 Estado antes de cargar:', {
        mensajesActuales: chatMessages.length,
        paginaActual: currentPagination.page,
        hayMas: currentPagination.hasMore,
        scrollTop
      })
      
      // Guardar la altura actual para mantener posición después de cargar
      setPreviousScrollHeight(scrollHeight)
      setIsLoadingMore(true)
      
      // Extraer clinicId del customer
      const clinicId = customer?.clinic_id || "default_clinic"
      loadOlderMessages(clinicId, conversationId)
    }
  }, [conversationId, customer, isLoadingOlderMsgs, isLoadingMore, currentPagination, loadOlderMessages, chatMessages.length, hasCompletedInitialScroll])

  // Configurar listener de scroll con throttling
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => container.removeEventListener('scroll', throttledHandleScroll)
  }, [handleScroll])

  // Mantener posición de scroll después de cargar mensajes antiguos
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && previousScrollHeight > 0 && !isLoadingOlderMsgs && isLoadingMore) {
      const newScrollHeight = container.scrollHeight
      const scrollDiff = newScrollHeight - previousScrollHeight
      
      console.log('📍 Ajustando posición de scroll:', {
        previousHeight: previousScrollHeight,
        newHeight: newScrollHeight,
        scrollDiff,
        currentScrollTop: container.scrollTop
      })
      
      // Ajustar la posición de scroll para mantener la vista
      container.scrollTop = scrollDiff
      setPreviousScrollHeight(0)
      setIsLoadingMore(false)
    }
  }, [chatMessages.length, isLoadingOlderMsgs, previousScrollHeight, isLoadingMore])

  // Detectar mensajes nuevos para mostrar indicador
  useEffect(() => {
    // Solo mostrar indicador si no es la carga inicial y hay mensajes nuevos
    if (chatMessages.length > lastKnownMessageCount && 
        lastKnownMessageCount > 0 && 
        !hasScrolledToBottom && 
        !isInitialLoad) {
      setHasNewMessages(true)
      console.log('📨 Detectados mensajes nuevos, mostrando indicador')
    }
    setLastKnownMessageCount(chatMessages.length)
  }, [chatMessages.length, lastKnownMessageCount, hasScrolledToBottom, isInitialLoad])

  // Resetear indicador cuando el usuario hace scroll al final o se completa la carga inicial
  useEffect(() => {
    if ((hasScrolledToBottom && hasNewMessages) || (!isInitialLoad && hasNewMessages)) {
      setHasNewMessages(false)
      console.log('👁️ Ocultando indicador de mensajes nuevos')
    }
  }, [hasScrolledToBottom, hasNewMessages, isInitialLoad])

  // Resetear estados cuando cambia la conversación
  useEffect(() => {
    console.log('🔄 Reseteando estados para nueva conversación:', conversationId)
    setIsInitialLoad(true)
    setHasScrolledToBottom(false)
    setPreviousScrollHeight(0)
    setIsLoadingMore(false)
    setLastKnownMessageCount(0)
    setHasNewMessages(false)
    setHasCompletedInitialScroll(false)
  }, [conversationId])

  // Polling cada 3 minutos para obtener mensajes nuevos
  useEffect(() => {
    if (!conversationId || !customer?.clinic_id) return

    console.log('🕒 Iniciando polling cada 3 minutos para', conversationId)
    
    const POLLING_INTERVAL = 1 * 60 * 1000 // 3 minutos en milisegundos
    const clinicId = customer.clinic_id
    
    // Configurar intervalo de polling
    const pollInterval = setInterval(() => {
      console.log('⏰ Polling automático - Verificando mensajes nuevos')
      loadNewMessages(clinicId, conversationId)
    }, POLLING_INTERVAL)

    // También hacer una verificación inicial después de 10 segundos
    const initialTimeout = setTimeout(() => {
      console.log('⏰ Primera verificación automática de mensajes nuevos')
      loadNewMessages(clinicId, conversationId)
    }, 10000) // 10 segundos después de cargar

    // Cleanup: limpiar intervalos cuando cambie la conversación o se desmonte
    return () => {
      console.log('🛑 Deteniendo polling para', conversationId)
      clearInterval(pollInterval)
      clearTimeout(initialTimeout)
    }
  }, [conversationId, customer?.clinic_id, loadNewMessages])

  // Auto-scroll al final en la carga inicial o cuando hay nuevos mensajes
  useEffect(() => {
    if (chatMessages.length > 0 && !isLoading) {
      if (isInitialLoad) {
        // En la carga inicial, siempre hacer scroll al final
        console.log('🎯 Auto-scroll al final (carga inicial)')
        
        // Usar múltiples timeouts para asegurar que el contenido esté renderizado
        const initialTimer = setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current
            // Primer intento de scroll
            container.scrollTop = container.scrollHeight
            console.log('📍 Primer intento de scroll:', container.scrollTop, container.scrollHeight)
            
            // Segundo intento después de un breve delay para asegurar renderizado completo
            const finalTimer = setTimeout(() => {
              if (messagesContainerRef.current) {
                const finalContainer = messagesContainerRef.current
                finalContainer.scrollTop = finalContainer.scrollHeight
                console.log('📍 Scroll final completado:', finalContainer.scrollTop, finalContainer.scrollHeight)
                
                // Verificar que realmente llegamos al final
                const isAtBottom = finalContainer.scrollTop + finalContainer.clientHeight >= finalContainer.scrollHeight - 10
                console.log('✅ Verificación de scroll al final:', isAtBottom)
                
                setIsInitialLoad(false)
                // Marcar que el scroll inicial se ha completado
                setHasCompletedInitialScroll(true)
                console.log('✅ Scroll inicial completado, habilitando carga de mensajes anteriores')
                // Resetear el contador de mensajes conocidos para evitar falsos positivos
                setLastKnownMessageCount(chatMessages.length)
              }
            }, 100)
            
            return () => clearTimeout(finalTimer)
          }
        }, 300)
        
        return () => clearTimeout(initialTimer)
      } else if (hasScrolledToBottom && !isLoadingMore) {
        // Solo hacer auto-scroll si el usuario estaba cerca del final
        console.log('🎯 Auto-scroll al final (nuevo mensaje)')
        requestAnimationFrame(() => {
          setTimeout(scrollToBottom, 50)
        })
      }
    }
  }, [chatMessages.length, conversationId, isLoading, isInitialLoad, hasScrolledToBottom, isLoadingMore, scrollToBottom])

  // Asegurar scroll al final durante la carga inicial cuando cambian los mensajes
  useEffect(() => {
    if (isInitialLoad && chatMessages.length > 0 && !isLoading) {
      // Esperar un poco más para asegurar que el contenido esté completamente renderizado
      const timer = setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current
          container.scrollTop = container.scrollHeight
          console.log('🔄 Asegurando scroll al final durante carga inicial:', {
            scrollTop: container.scrollTop,
            scrollHeight: container.scrollHeight,
            mensajes: chatMessages.length
          })
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [chatMessages.length, isInitialLoad, isLoading])

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
      // Scroll al final después de enviar mensaje
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 50)
      })
    }
  }

  const quickActions = [
    { icon: Phone, label: "Llamar a paciente", action: () => console.log("Calling patient") },
    { icon: Calendar, label: "Agendar cita", action: () => console.log("Scheduling appointment") },
    { icon: MapPin, label: "Enviar ubicación", action: () => console.log("Sending location") },
    { icon: FileText, label: "Enviar expediente", action: () => console.log("Sending medical record") },
    { icon: CreditCard, label: "Enviar enlace de pago", action: () => console.log("Sending payment link") },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
              {getUserInitials(customer)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{getCustomerDisplayName(customer)}</h3>
            <p className="text-sm text-gray-500">
              {customer?.last_interaction 
                ? `Última actividad: ${formatLastUpdate(customer.last_interaction)}`
                : 'Estado desconocido'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* Indicador de carga de mensajes antiguos */}
        {isLoadingOlderMsgs && (
          <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando mensajes anteriores...</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando mensajes...</p>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-sm">No hay mensajes en esta conversación</p>
              <p className="text-xs mt-1">Los mensajes aparecerán aquí cuando se envíen</p>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const msgTime = formatMessageTime(msg.timestamp)
            const showTimestamp = index === 0 || 
              (chatMessages[index - 1].timestamp && 
               new Date(chatMessages[index - 1].timestamp!).toDateString() !== new Date(msg.timestamp!).toDateString())

            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="text-center text-xs text-gray-500 mb-4">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Fecha desconocida'}
                  </div>
                )}

                {/* Determinar si es mensaje del usuario (izquierda) o de la API (derecha) */}
                {(() => {
                  const isUserMessage = msg.sender === "user"
                  const isApiMessage = msg.sender === "agent"
                  
                  return (
                    <div className={`flex ${isUserMessage ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                          isUserMessage ? "flex-row" : "flex-row-reverse space-x-reverse"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-white font-medium ${
                              isUserMessage
                                ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                : "bg-gradient-to-br from-blue-400 to-blue-600"
                            }`}
                          >
                            {isUserMessage ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div
                          className={`rounded-lg p-3 ${
                            isUserMessage 
                              ? "bg-gray-100 text-gray-900" 
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.content || 'Mensaje sin contenido'}</p>
                          <p className={`text-xs mt-1 ${isUserMessage ? "text-gray-500" : "text-blue-100"}`}>
                            {msgTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })
        )}
      </div>

      {/* Indicador de mensajes nuevos */}
      {hasNewMessages && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">Hay mensajes nuevos</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollToBottom}
              className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400"
            >
              Ver mensajes
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {quickActions.map((action, index) => (
                <DropdownMenuItem key={index} onClick={action.action}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />

          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
