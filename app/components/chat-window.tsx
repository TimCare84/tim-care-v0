"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Zap, Phone, Calendar, MapPin, FileText, CreditCard, Bot, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  sender: "patient" | "clinic" | "ai"
  timestamp: string
  time: string
}

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hola, necesito reagendar mi cita para la próxima semana por favor",
      sender: "patient",
      timestamp: "Hoy",
      time: "10:25",
    },
    {
      id: "2",
      content: "Por supuesto, puedo ayudarte con eso. ¿Qué día de la próxima semana te viene mejor?",
      sender: "ai",
      timestamp: "Hoy",
      time: "10:26",
    },
    {
      id: "3",
      content: "Preferiría el miércoles o jueves si es posible",
      sender: "patient",
      timestamp: "Hoy",
      time: "10:28",
    },
    {
      id: "4",
      content: "Tengo disponibilidad el miércoles a las 14:00 o el jueves a las 10:30. ¿Cuál prefieres?",
      sender: "ai",
      timestamp: "Hoy",
      time: "10:29",
    },
    {
      id: "5",
      content: "El miércoles a las 14:00 está perfecto",
      sender: "patient",
      timestamp: "Hoy",
      time: "10:30",
    },
  ],
  "2": [
    {
      id: "1",
      content: "¿A qué hora es mi cita de mañana?",
      sender: "patient",
      timestamp: "Hoy",
      time: "09:40",
    },
    {
      id: "2",
      content: "Tu cita está programada para mañana a las 11:00 AM con el Dr. Martínez.",
      sender: "ai",
      timestamp: "Hoy",
      time: "09:41",
    },
    {
      id: "3",
      content: "Perfecto, gracias por la información",
      sender: "patient",
      timestamp: "Hoy",
      time: "09:45",
    },
  ],
}

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const messages = mockMessages[conversationId] || []

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", message)
      setMessage("")
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
              AG
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">Ana García Martínez</h3>
            <p className="text-sm text-gray-500">En línea hace 2 min</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const showTimestamp = index === 0 || messages[index - 1].timestamp !== msg.timestamp

          return (
            <div key={msg.id}>
              {showTimestamp && <div className="text-center text-xs text-gray-500 mb-4">{msg.timestamp}</div>}

              <div className={`flex ${msg.sender === "patient" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    msg.sender === "patient" ? "flex-row" : "flex-row-reverse space-x-reverse"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={`text-white font-medium ${
                        msg.sender === "patient"
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : msg.sender === "ai"
                            ? "bg-gradient-to-br from-green-400 to-green-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                      }`}
                    >
                      {msg.sender === "patient" ? (
                        <User className="h-4 w-4" />
                      ) : msg.sender === "ai" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        "C"
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`rounded-lg p-3 ${
                      msg.sender === "patient" ? "bg-gray-100 text-gray-900" : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "patient" ? "text-gray-500" : "text-blue-100"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
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
