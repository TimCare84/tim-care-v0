"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Zap, Phone, Calendar, MapPin, FileText, CreditCard, Bot, User, LifeBuoy, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChatContext } from "./chat-context"
import { getCustomerDisplayName, getUserInitials, formatMessageTime, formatLastUpdate } from "./chat-utils"
import { useSearchParams } from "next/navigation"  // Add this import
import { useSearchParams } from "next/navigation"  // Add this import

// Remover datos mock - ahora usamos el contexto

const rescueTemplates = [
  "Si no tienes dudas adicionales, nos encantaría poder atenderte para enseñarte que somos top. ¿Te gustaría que busquemos algún horario para agendarte una cita? 🤩",
  "Creo que se me olvidó comentarte de nuestra garantía del 100%. Estamos muy seguros de que saldrás contento de tu cita. Aprovecho para comentarte de nuestra garantía del 100%!",
  "Me confirmas en cuanto quede el pago por favor.",
  "Tuviste alguna complicación con el pago o todo bien? Me confirmas en cuanto puedas para que no te ganen el espacio.",
]

const promotionTemplates = [
  "🎉 ¡Oferta especial! Este mes tenemos 20% de descuento en consultas de primera vez. ¿Te interesa agendar?",
  "💫 Promoción limitada: Paquete de 3 consultas por el precio de 2. Válido hasta fin de mes.",
  "🌟 ¡Descuento del 15% para pacientes que refieran a un amigo! Ambos se benefician.",
  "🎁 Oferta de temporada: Consulta + exámenes básicos con 25% de descuento. ¡No te lo pierdas!",
  "⚡ Flash sale: 30% off en tratamientos estéticos este fin de semana únicamente.",
]

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const { messages, customers, loadingConversations } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false)
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [currentRescueTemplateIndex, setCurrentRescueTemplateIndex] = useState(0)
  const [currentPromotionTemplateIndex, setCurrentPromotionTemplateIndex] = useState(0)

  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic_id')

  // Memoizar los datos específicos de esta conversación para evitar re-renderizados
  const chatMessages = useMemo(() => messages[conversationId] || [], [messages, conversationId])
  const customer = useMemo(() => customers[conversationId], [customers, conversationId])
  const isLoading = useMemo(() => loadingConversations[conversationId] || false, [loadingConversations, conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

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
      // Usar phoneNumberId proporcionado 
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

  const handleRescueTemplateSelect = (template: string) => {
    setMessage(template)
    setIsRescueModalOpen(false)
    setSelectedReason("")
    setCurrentRescueTemplateIndex(0)
  }

  const handlePromotionTemplateSelect = (template: string) => {
    setMessage(template)
    setIsPromotionModalOpen(false)
    setCurrentPromotionTemplateIndex(0)
  }

  const handlePrevRescueTemplate = () => {
    setCurrentRescueTemplateIndex(Math.max(0, currentRescueTemplateIndex - 1))
  }

  const handleNextRescueTemplate = () => {
    setCurrentRescueTemplateIndex(Math.min(rescueTemplates.length - 1, currentRescueTemplateIndex + 1))
  }

  const handlePrevPromotionTemplate = () => {
    setCurrentPromotionTemplateIndex(Math.max(0, currentPromotionTemplateIndex - 1))
  }

  const handleNextPromotionTemplate = () => {
    setCurrentPromotionTemplateIndex(Math.min(promotionTemplates.length - 1, currentPromotionTemplateIndex + 1))
  }

  const handleLocationAddress = () => {
    setMessage("Dirección y ubicación: Av. Río Churubusco 188, Col. El Prado, Iztapalapa, C.P. 09480 Ciudad de México. Mira, te comparto nuestra ubicación: https://maps.app.goo.gl/6GHYhVfsxE2NZuQB9")
  }

  const handleLocationDirections = () => {
    setMessage("Indicaciones y referencias: Muy cerca del Metro Ermita (línea azul y dorada), entre Ermita y General Anaya. Estamos justo enfrente de la Cineteca Nacional de las Artes, ¡muy fácil de llegar!")
  }

  const handlePaymentLink = () => {
    setMessage("Te comparto el enlace para realizar tu pago de forma segura: https://pay.timcare.com/secure-payment/abc123. Una vez completado el pago, tu cita quedará confirmada automáticamente.")
  }

  const quickActions = [
    {
      icon: Calendar,
      label: "Agendar cita",
      action: () => console.log("Scheduling appointment"),
    },
    {
      icon: Phone,
      label: "Llamar",
      action: () => console.log("Calling patient"),
    },
    {
      icon: MapPin,
      label: "Enviar ubicación",
      hasSubmenu: true,
      submenu: [
        {
          label: "Enviar Dirección y ubicación Google Maps",
          action: handleLocationAddress,
        },
        {
          label: "Enviar indicaciones para llegar y referencias",
          action: handleLocationDirections,
        },
      ],
    },
    {
      icon: CreditCard,
      label: "Enviar enlace de pago",
      action: handlePaymentLink,
    },
    {
      icon: LifeBuoy,
      label: "Rescate de abandono",
      action: () => setIsRescueModalOpen(true),
      special: true,
    },
    {
      icon: MessageSquare,
      label: "Promociones y ofertas",
      action: () => setIsPromotionModalOpen(true),
      special: false,
    },
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
              {quickActions.map((
                action, index) => (
                action.hasSubmenu ? (
                  <DropdownMenuSub key={index}>
                    <DropdownMenuSubTrigger>
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {action.submenu?.map((subAction, subIndex) => (
                        <DropdownMenuItem key={subIndex} onClick={subAction.action}>
                          {subAction.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={action.action}
                    className={action.special ? "bg-orange-50 text-orange-700 hover:bg-orange-100" : ""}
                  >
                    <action.icon className={`h-4 w-4 mr-2 ${action.special ? "text-orange-600" : ""}`} />
                    {action.label}
                  </DropdownMenuItem>
                )
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
