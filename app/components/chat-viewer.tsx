"use client"

import { useState } from "react"
import { ConversationsList } from "./conversations-list"
import { ChatWindow } from "./chat-window"
import { PatientInfo } from "./patient-info"
import { useChatContext } from "./chat-context"

export function ChatViewer() {
  const { selectedConversation, setSelectedConversation, messages, loading, loadingConversations, error } = useChatContext()

  // Solo mostrar loading global si no hay conversación seleccionada y está cargando
  if (loading && !selectedConversation) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex h-screen">
      {/* Left Panel - Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <ConversationsList 
          selectedConversation={selectedConversation} 
          onSelectConversation={setSelectedConversation}
        />
      </div>

      {/* Middle Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow 
            conversationId={selectedConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Selecciona un usuario</p>
              <p className="text-sm">Elige un usuario de la lista para ver su conversación</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Patient Info */}
      <div className="w-80 bg-slate-50 border-l border-gray-200">
        {selectedConversation ? (
          <PatientInfo 
            conversationId={selectedConversation}
          />
        ) : (
          <div className="p-6 h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Información del usuario aparecerá aquí cuando selecciones una conversación
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
