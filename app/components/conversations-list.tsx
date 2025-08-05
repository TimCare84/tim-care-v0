"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Clock, AlertTriangle, CreditCard } from "lucide-react" // Removed Bot icon
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  needsIntervention: boolean
  status: "todos" | "proceso" | "estancado" | "pagado" // Removed "ai", "agendado", "posventa"
  avatar: string
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Ana García Martínez",
    lastMessage: "Necesito reagendar mi cita para la próxima semana",
    time: "10:30",
    needsIntervention: true,
    status: "proceso",
    avatar: "AG",
  },
  {
    id: "2",
    name: "Carlos López Ruiz",
    lastMessage: "¿A qué hora es mi cita de mañana?",
    time: "09:45",
    needsIntervention: false,
    status: "proceso", // Moved from "ai" to "proceso"
    avatar: "CL",
  },
  {
    id: "3",
    name: "María Rodríguez",
    lastMessage: "Tengo dolor de cabeza desde ayer",
    time: "08:20",
    needsIntervention: true,
    status: "estancado",
    avatar: "MR",
  },
  {
    id: "4",
    name: "José Martínez",
    lastMessage: "Gracias por la información sobre los medicamentos",
    time: "Ayer",
    needsIntervention: false,
    status: "proceso", // Moved from "ai" to "proceso"
    avatar: "JM",
  },
  {
    id: "6",
    name: "Pedro González",
    lastMessage: "El pago ya fue procesado correctamente",
    time: "2 días",
    needsIntervention: false,
    status: "pagado",
    avatar: "PG",
  },
]

const categories = [
  {
    id: "proceso",
    label: "En proceso",
    icon: Clock,
    count: 1,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  {
    id: "estancado",
    label: "Estancado",
    icon: AlertTriangle,
    count: 1,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
  },
  {
    id: "pagado",
    label: "Pagado",
    icon: CreditCard,
    count: 1,
    color: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
]

interface ConversationsListProps {
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<
    "todos" | "proceso" | "estancado" | "pagado" // Removed "ai", "agendado", "posventa"
  >("todos")

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // No longer need a separate aiConversations filter as they are now part of "proceso"
  // const aiConversations = filteredConversations.filter((conv) => conv.status === "ai")

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

  const renderConversations = (conversations: Conversation[]) => (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
          } ${conversation.needsIntervention ? "font-semibold" : ""}`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`${getAvatarGradient(conversation.avatar)} text-white font-medium`}>
                {conversation.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{conversation.name}</p>
                <span className="text-xs text-muted-foreground">{conversation.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderCategorySection = (category: (typeof categories)[0]) => {
    const categoryConversations = filteredConversations.filter((conv) => conv.status === category.id)
    if (categoryConversations.length === 0) return null

    return (
      <div className="p-3">
        <div className={`flex items-center mb-2 leading-7 ${category.bgColor} py-1.5 px-2 rounded-md`}>
          <category.icon className={`h-4 w-4 ${category.textColor} mr-2`} />
          <h3 className={`text-sm font-medium ${category.textColor}`}>{category.label}</h3>
          <Badge variant="secondary" className={`ml-auto ${category.bgColor} ${category.textColor}`}>
            {categoryConversations.length}
          </Badge>
        </div>
        {renderConversations(categoryConversations)}
      </div>
    )
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

      {/* Filter Buttons */}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {/* All Categories */}
        {categories.map((category) => renderCategorySection(category))}
      </div>
    </div>
  )
}
