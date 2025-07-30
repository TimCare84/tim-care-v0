"use client"

import { useChatContext } from "./chat-context"

export function DebugPanel() {
  const { chats, messages, customers, selectedConversation, loading, error } = useChatContext()

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg shadow-lg z-50 max-w-md">
        <h3 className="font-bold text-yellow-800">Estado de Carga</h3>
        <p className="text-yellow-700">Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 p-4 rounded-lg shadow-lg z-50 max-w-md">
        <h3 className="font-bold text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 p-4 rounded-lg shadow-lg z-50 max-w-md text-xs">
      <h3 className="font-bold text-blue-800 mb-2">Debug Info</h3>
      <div className="space-y-2 text-blue-700">
        <div>
          <strong>Chats cargados:</strong> {chats.length}
        </div>
        <div>
          <strong>Conversación seleccionada:</strong> {selectedConversation || 'Ninguna'}
        </div>
        <div>
          <strong>Customers:</strong> {Object.keys(customers).length}
        </div>
        <div>
          <strong>Mensajes en cache:</strong> {Object.keys(messages).length}
        </div>
        {selectedConversation && (
          <div>
            <strong>Mensajes del chat actual:</strong> {messages[selectedConversation]?.length || 0}
          </div>
        )}
        {chats.length > 0 && (
          <div className="mt-2">
            <strong>Primer chat:</strong>
            <pre className="text-xs bg-blue-50 p-1 rounded mt-1">
              {JSON.stringify(chats[0], null, 2).substring(0, 200)}...
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 