"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar } from "lucide-react"
import { useChatContext } from "./chat-context"
import { getCustomerDisplayName, getUserInitials, formatLastUpdate, chatNeedsIntervention } from "./chat-utils"

// Remover datos mock - ahora usamos el contexto

interface PatientInfoProps {
  conversationId: string
}

export function PatientInfo({ conversationId }: PatientInfoProps) {
  const { customers, chats, messages } = useChatContext()
  const customer = customers[conversationId]
  const chat = chats.find(c => c.id === conversationId)
  const chatMessages = messages[conversationId] || []

  if (!conversationId) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">Selecciona una conversación para ver la información del paciente</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Información del customer no disponible</p>
          <p className="text-xs text-gray-400 mt-1">ID: {conversationId}</p>
        </div>
      </div>
    )
  }

  // Determinar el estado y color del badge
  const needsIntervention = chat ? chatNeedsIntervention(chat) : false
  const status = needsIntervention ? "Requiere Atención" : "Atendido por IA"
  const statusColor = needsIntervention ? "bg-red-500" : "bg-green-500"

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
    <div className="p-6 space-y-6">
      {/* Patient Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={`${getAvatarGradient(getUserInitials(customer))} text-white text-xl font-medium`}>
                {getUserInitials(customer)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900">{getCustomerDisplayName(customer)}</h3>

              {customer.whatsapp_number && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{customer.whatsapp_number}</span>
                </div>
              )}

              {customer.email && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{customer.email}</span>
                </div>
              )}

              <div className="flex justify-center">
                <Badge className={`${statusColor} text-white`}>{status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estado del Agente</h4>
            <p className="text-sm text-gray-600">
              {customer.agent_active ? 'Agente IA activo' : 'Requiere intervención humana'}
            </p>
          </div>

          {chatMessages.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Último Mensaje</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {chatMessages[chatMessages.length - 1]?.content?.substring(0, 100) || 'Sin contenido'}
                {(chatMessages[chatMessages.length - 1]?.content?.length || 0) > 100 && '...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Información Adicional</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Última actividad:</span>
              <span className="font-medium">
                {customer.last_interaction 
                  ? formatLastUpdate(customer.last_interaction)
                  : 'Desconocida'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total mensajes:</span>
              <span className="font-medium">{chatMessages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente desde:</span>
              <span className="font-medium">
                {customer.created_at 
                  ? new Date(customer.created_at).toLocaleDateString('es-ES')
                  : 'Fecha desconocida'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
