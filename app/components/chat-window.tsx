"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Zap, Phone, Calendar, MapPin, FileText, CreditCard, Bot, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useChatContext } from "./chat-context"
import { getCustomerDisplayName, getUserInitials, formatMessageTime, formatLastUpdate } from "./chat-utils"
import { useSearchParams } from "next/navigation"  // Add this import

// Remover datos mock - ahora usamos el contexto

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const { messages, customers, loadingConversations } = useChatContext()

  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic_id')

  // Memoizar los datos específicos de esta conversación para evitar re-renderizados
  const chatMessages = useMemo(() => messages[conversationId] || [], [messages, conversationId])
  const customer = useMemo(() => customers[conversationId], [customers, conversationId])
  const isLoading = useMemo(() => loadingConversations[conversationId] || false, [loadingConversations, conversationId])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Validar datos necesarios
    if (!customer?.whatsapp_number) {
      console.error("No se encontró el número de WhatsApp del cliente")
      return
    }
    

    if (!clinicId) {
      console.error("No se encontró el ID de la clínica")
      return
    }

    // Usando userId hardcodeado ya que el proyecto no cuenta con autenticación
    const currentUserId = "51eae6e6-b29f-981e-cd02-d50bc8147fac"

    try {
      // Usar phoneNumberId proporcionado por el backend developer
      // Este es el phoneNumberId confirmado para la clínica en producción
      const phoneNumberId = 613102665225070

      // Preparar el payload para enviar el mensaje
      const messagePayload = {
        toNumber: customer.whatsapp_number,
        message: message.trim(),
        phoneNumberId: phoneNumberId,
        clinicId: clinicId,
        userId: currentUserId
      }

      // Enviar el mensaje a través de la API interna
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar mensaje')
      }

      const result = await response.json()
      console.log("Mensaje enviado exitosamente:", result)
      
      // Limpiar el input
      setMessage("")
      
      // TODO: Actualizar la lista de mensajes con el mensaje enviado
      // Esto podría hacerse agregando el mensaje al contexto local
      // o recargando los mensajes desde el servidor

    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      // TODO: Mostrar notificación de error al usuario
      alert(`Error al enviar mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`)
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

                  return (
                    <div className={`flex ${isUserMessage ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isUserMessage ? "flex-row" : "flex-row-reverse space-x-reverse"
                          }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-white font-medium ${isUserMessage
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
                          className={`rounded-lg p-3 ${isUserMessage
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
