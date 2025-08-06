"use client"

import { useState } from "react"
import { ConversationsList } from "./conversations-list"
import { ChatWindow } from "./chat-window"
import { PatientInfo } from "./patient-info"

export function ChatViewer() {
  const [selectedConversation, setSelectedConversation] = useState("1")

  return (
    <div className="flex-1 flex h-screen">
      {/* Left Panel - Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <ConversationsList selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />
      </div>

      {/* Middle Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow conversationId={selectedConversation} />
      </div>

      {/* Right Panel - Patient Info */}
      <div className="w-80 bg-slate-50 border-l border-gray-200">
        <PatientInfo conversationId={selectedConversation} />
      </div>
    </div>
  )
}
