"use client"

import { useMessagesN8N } from "@/hooks/useMessagesN8N"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

interface ChatMessagesN8NProps {
  clinicId: string
  userId: string
}

export function ChatMessagesN8N({ clinicId, userId }: ChatMessagesN8NProps) {
  const { 
    messages, 
    loading, 
    loadingOlder,
    error, 
    pagination, 
    hasMoreMessages,
    loadOlderMessages, 
    refreshMessages 
  } = useMessagesN8N(clinicId, userId)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isScrolledToTop, setIsScrolledToTop] = useState(false)
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  // Función para hacer scroll al fondo
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }

  // Scroll al fondo cuando se cargan mensajes iniciales
  useEffect(() => {
    if (!loading && messages.length > 0 && shouldScrollToBottom) {
      setTimeout(scrollToBottom, 100) // Pequeño delay para asegurar que el DOM se actualice
      setShouldScrollToBottom(false)
    }
  }, [messages, loading, shouldScrollToBottom])

  // Resetear shouldScrollToBottom cuando cambian clinicId o userId
  useEffect(() => {
    setShouldScrollToBottom(true)
  }, [clinicId, userId])

  // Detectar scroll hacia arriba para cargar mensajes antiguos
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLDivElement
    if (!target) return

    const scrollTop = target.scrollTop
    const threshold = 100 // Pixels desde el top para activar la carga

    if (scrollTop <= threshold && hasMoreMessages && !loadingOlder) {
      setPreviousScrollHeight(target.scrollHeight)
      loadOlderMessages()
      setIsScrolledToTop(true)
    }
  }

  // Mantener posición de scroll después de cargar mensajes antiguos
  useEffect(() => {
    if (isScrolledToTop && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement
      if (viewport) {
        const newScrollHeight = viewport.scrollHeight
        const scrollDiff = newScrollHeight - previousScrollHeight
        viewport.scrollTop = scrollDiff
      }
      setIsScrolledToTop(false)
    }
  }, [messages, isScrolledToTop, previousScrollHeight])

  // Configurar listener de scroll
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.addEventListener('scroll', handleScroll)
        return () => viewport.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasMoreMessages, loadingOlder])

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
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        {/* Indicador de carga en la parte superior */}
        {loadingOlder && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando mensajes anteriores...</span>
          </div>
        )}

        <div className="space-y-2">
          {/* Invertir el orden para mostrar mensajes más antiguos arriba y más recientes abajo */}
          {[...messages].reverse().map((message, index) => (
            <Card key={`${message.id}-${index}`} className="p-3">
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {message.sender || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp ? new Date(message.timestamp).toLocaleString() : 
                     message.created_at ? new Date(message.created_at).toLocaleString() : 'Sin fecha'}
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {message.content || 'Sin contenido'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Botón alternativo para cargar más mensajes */}
        {hasMoreMessages && !loadingOlder && (
          <div className="flex justify-center mt-4">
            <Button 
              onClick={loadOlderMessages} 
              variant="outline"
              className="w-full"
              disabled={loadingOlder}
            >
              Cargar mensajes anteriores
            </Button>
          </div>
        )}

        {/* Mensaje cuando no hay más mensajes */}
        {!hasMoreMessages && messages.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No hay mensajes más antiguos
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <span>
            {messages.length} de {pagination.total} mensajes cargados
          </span>
        </div>
      </div>
    </div>
  )
}
