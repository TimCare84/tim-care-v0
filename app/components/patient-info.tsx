"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone } from "lucide-react"

const mockPatientData: Record<string, any> = {
  "1": {
    name: "Ana García Martínez",
    phone: "+34 612 345 678",
    avatar: "AG",
    status: "En proceso",
    statusColor: "bg-yellow-500",
    contactReason: "Reagendar cita médica",
    description:
      "La paciente necesita cambiar su cita programada para la próxima semana debido a un compromiso laboral imprevisto. Prefiere horarios de tarde.",
  },
  "2": {
    name: "Carlos López Ruiz",
    phone: "+34 687 654 321",
    avatar: "CL",
    status: "Agendado",
    statusColor: "bg-green-500",
    contactReason: "Consulta sobre cita",
    description:
      "Paciente consulta sobre el horario de su cita programada para mañana. Cita confirmada para las 11:00 AM con el Dr. Martínez.",
  },
}

interface PatientInfoProps {
  conversationId: string
}

export function PatientInfo({ conversationId }: PatientInfoProps) {
  const patient = mockPatientData[conversationId]

  if (!patient) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">Selecciona una conversación para ver la información del paciente</p>
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
    <div className="p-6 space-y-6">
      {/* Patient Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={`${getAvatarGradient(patient.avatar)} text-white text-xl font-medium`}>
                {patient.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>

              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{patient.phone}</span>
              </div>

              <div className="flex justify-center">
                <Badge className={`${patient.statusColor} text-white`}>{patient.status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Motivo de Contacto</h4>
            <p className="text-sm text-gray-600">{patient.contactReason}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{patient.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Información Adicional</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Última actividad:</span>
              <span className="font-medium">Hace 2 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Citas programadas:</span>
              <span className="font-medium">1 pendiente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
