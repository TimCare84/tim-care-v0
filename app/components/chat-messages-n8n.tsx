"use client"

import { useMessagesN8N } from "@/hooks/useMessagesN8N"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChatMessagesN8NProps {
  clinicId: string
  userId: string
}

export function ChatMessagesN8N({ clinicId, userId }: ChatMessagesN8NProps) {
  const { 
    messages, 
    loading, 
    error, 
    pagination, 
    loadMoreMessages, 
    refreshMessages 
  } = useMessagesN8N(clinicId, userId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando mensajes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="p-4">
          <div className="text-red-600 text-center">
            <p>Error al cargar mensajes: {error}</p>
            <Button 
              onClick={refreshMessages} 
              variant="outline" 
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Mensajes del Chat
          <span className="text-sm text-gray-500 ml-2">
            ({pagination.total} mensajes)
          </span>
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {messages.map((message) => (
            <Card key={message.id} className="p-3">
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {message.sender || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Sin fecha'}
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {message.content || 'Sin contenido'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {pagination.page < pagination.totalPages && (
          <div className="flex justify-center mt-4">
            <Button 
              onClick={loadMoreMessages} 
              variant="outline"
              className="w-full"
            >
              Cargar más mensajes
            </Button>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <span>
            {messages.length} de {pagination.total} mensajes
          </span>
        </div>
      </div>
    </div>
  )
}
