"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  needsIntervention: boolean
  status: "inbox" | "ai"
  avatar: string
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Ana García Martínez",
    lastMessage: "Necesito reagendar mi cita para la próxima semana",
    time: "10:30",
    needsIntervention: true,
    status: "inbox",
    avatar: "AG",
  },
  {
    id: "2",
    name: "Carlos López Ruiz",
    lastMessage: "¿A qué hora es mi cita de mañana?",
    time: "09:45",
    needsIntervention: false,
    status: "ai",
    avatar: "CL",
  },
  {
    id: "3",
    name: "María Rodríguez",
    lastMessage: "Tengo dolor de cabeza desde ayer",
    time: "08:20",
    needsIntervention: true,
    status: "inbox",
    avatar: "MR",
  },
  {
    id: "4",
    name: "José Martínez",
    lastMessage: "Gracias por la información sobre los medicamentos",
    time: "Ayer",
    needsIntervention: false,
    status: "ai",
    avatar: "JM",
  },
  {
    id: "5",
    name: "Laura Sánchez",
    lastMessage: "¿Puedo cambiar mi cita?",
    time: "Ayer",
    needsIntervention: true,
    status: "inbox",
    avatar: "LS",
  },
]

interface ConversationsListProps {
  selectedConversation: string
  onSelectConversation: (id: string) => void
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const inboxConversations = filteredConversations.filter((conv) => conv.status === "inbox")
  const aiConversations = filteredConversations.filter((conv) => conv.status === "ai")

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
              <Badge variant="secondary" className="ml-auto bg-yellow-500 text-yellow-50">
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
                        <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
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
                        <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
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
