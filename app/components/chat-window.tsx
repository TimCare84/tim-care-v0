"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Send,
  Bot,
  User,
  Calendar,
  FileText,
  Phone,
  MapPin,
  Zap,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: string
  content: string
  sender: "user" | "patient"
  timestamp: string
  type?: "text" | "appointment" | "prescription"
}

interface ChatWindowProps {
  conversationId: string
}

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hola, necesito reagendar mi cita para la próxima semana",
      sender: "patient",
      timestamp: "10:25",
    },
    {
      id: "2",
      content: "Por supuesto, Ana. ¿Qué día te vendría mejor?",
      sender: "user",
      timestamp: "10:26",
    },
    {
      id: "3",
      content: "El miércoles por la tarde estaría perfecto",
      sender: "patient",
      timestamp: "10:27",
    },
    {
      id: "4",
      content: "Perfecto, te he reagendado para el miércoles 15 a las 14:00. ¿Te parece bien?",
      sender: "user",
      timestamp: "10:28",
    },
    {
      id: "5",
      content: "Sí, perfecto. Muchas gracias",
      sender: "patient",
      timestamp: "10:30",
    },
  ],
  "2": [
    {
      id: "1",
      content: "¿A qué hora es mi cita de mañana?",
      sender: "patient",
      timestamp: "09:40",
    },
    {
      id: "2",
      content: "Su cita está programada para mañana a las 10:30 AM con el Dr. García.",
      sender: "user",
      timestamp: "09:42",
    },
    {
      id: "3",
      content: "Perfecto, gracias por la información",
      sender: "patient",
      timestamp: "09:45",
    },
  ],
  "3": [
    {
      id: "1",
      content: "Tengo dolor de cabeza desde ayer",
      sender: "patient",
      timestamp: "08:15",
    },
    {
      id: "2",
      content: "Lamento escuchar eso, María. ¿Has tomado algún medicamento?",
      sender: "user",
      timestamp: "08:16",
    },
    {
      id: "3",
      content: "Solo paracetamol, pero no me ha hecho mucho efecto",
      sender: "patient",
      timestamp: "08:18",
    },
    {
      id: "4",
      content: "Te recomiendo que vengas para una consulta. ¿Podrías venir hoy por la tarde?",
      sender: "user",
      timestamp: "08:20",
    },
  ],
}

const mockConversations = [
  { id: "1", name: "Ana García Martínez", status: "inbox" as const },
  { id: "2", name: "Carlos López Ruiz", status: "ai" as const },
  { id: "3", name: "María Rodríguez", status: "inbox" as const },
  { id: "4", name: "José Martínez", status: "ai" as const },
  { id: "5", name: "Laura Sánchez", status: "inbox" as const },
]

const messageTemplates = [
  "Si no tienes dudas adicionales, nos encantaría poder atenderte para enseñarte que somos top. ¿Te gustaría que busquemos algún horario para agendarte una cita? 🤩",
  "Creo que se me olvidó comentarte de nuestra garantía del 100%. Estamos muy seguros de que saldrás contento de tu cita. Aprovecho para comentarte de nuestra garantía del 100%!",
  "Me confirmas en cuanto quede el pago por favor.",
  "Tuviste alguna complicación con el pago o todo bien? Me confirmas en cuanto puedas para que no te ganen el espacio.",
]

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [messages] = useState<Message[]>(mockMessages[conversationId] || [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [humanIntervention, setHumanIntervention] = useState(false)

  const conversation = mockConversations.find((c) => c.id === conversationId)
  const isAiConversation = conversation?.status === "ai"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (message.trim() && (!isAiConversation || humanIntervention)) {
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea with max height of 2 lines
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 48 // Approximately 2 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }

  const handleTemplateSelect = (template: string) => {
    setMessage(template)
    setIsRescueModalOpen(false)
    setSelectedReason("")
    setCurrentTemplateIndex(0)
  }

  const handlePrevTemplate = () => {
    setCurrentTemplateIndex(Math.max(0, currentTemplateIndex - 1))
  }

  const handleNextTemplate = () => {
    setCurrentTemplateIndex(Math.min(messageTemplates.length - 1, currentTemplateIndex + 1))
  }

  const handleHumanIntervention = () => {
    setHumanIntervention(true)
  }

  const quickActions = [
    {
      icon: Calendar,
      label: "Agendar cita",
      action: () => console.log("Scheduling appointment"),
    },
    {
      icon: FileText,
      label: "Ver historial",
      action: () => console.log("Viewing medical history"),
    },
    {
      icon: Phone,
      label: "Llamar",
      action: () => console.log("Calling patient"),
    },
    {
      icon: MapPin,
      label: "Enviar ubicación",
      action: () => setMessage("Nos ubicamos en Av. Reforma 123, Col. Centro, Ciudad de México, CDMX 06000"),
    },
    {
      icon: LifeBuoy,
      label: "Rescate de abandono",
      action: () => setIsRescueModalOpen(true),
      special: true,
    },
  ]

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
          <p className="text-gray-500">Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
              {conversation.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
            <div className="flex items-center space-x-2">
              {isAiConversation && !humanIntervention ? (
                <>
                  <Bot className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Gestionado por Agente AI</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">En línea</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className="flex items-center justify-end mt-1">
                <span className={`text-xs ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {isAiConversation && !humanIntervention ? (
          /* AI Status Indicator with Emergency Button */
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-6 w-6 text-gray-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-gray-500 text-sm animate-pulse">El agente AI está trabajando en la respuesta...</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHumanIntervention}
                      className="bg-red-50 border-red-200 hover:bg-red-100"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Intervención humana</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          /* Human Input */
          <div className="space-y-2">
            <div className="flex items-end space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {quickActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.action}
                      className={action.special ? "bg-orange-50 text-orange-700 hover:bg-orange-100" : ""}
                    >
                      <action.icon className={`h-4 w-4 mr-2 ${action.special ? "text-orange-600" : ""}`} />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <textarea
                ref={textareaRef}
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] max-h-[48px] overflow-y-auto"
                rows={1}
              />

              <Button onClick={handleSend} size="sm" className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-gray-400 text-center">
              <span>Presiona Enter para enviar o Shift + Enter para nueva línea</span>
            </div>
          </div>
        )}
      </div>

      {/* Rescue Modal */}
      <Dialog open={isRescueModalOpen} onOpenChange={setIsRescueModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0">
          <div className="p-8 space-y-6">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LifeBuoy className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-medium">Selecciona motivo de abandono:</h3>
              </div>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abandono">Abandono de conversación</SelectItem>
                  <SelectItem value="falta-pago">Falta de pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Middle row - Template cards */}
            <div className="space-y-4">
              <div className="relative">
                <div className="flex space-x-4 overflow-hidden">
                  {messageTemplates.slice(currentTemplateIndex, currentTemplateIndex + 3).map((template, index) => (
                    <div
                      key={currentTemplateIndex + index}
                      onClick={() => handleTemplateSelect(template)}
                      className={`flex-shrink-0 p-6 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        index === 2 ? "w-48 opacity-50" : "w-80"
                      }`}
                    >
                      <p className="text-sm italic text-gray-700 leading-relaxed">{template}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm">
                <span className="font-medium text-black">{messageTemplates.length}</span>
                <span className="text-gray-500 ml-1">results</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrevTemplate} disabled={currentTemplateIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextTemplate}
                  disabled={currentTemplateIndex >= messageTemplates.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
