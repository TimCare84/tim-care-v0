"use client"

import { useState, useEffect, useRef } from "react"
import { getMessagesByChatN8N, getMessagesByChatPaginatedN8N } from "@/lib/querys_n8n"
import type { Message } from "@/schemas/messages"

export function useMessagesN8N(clinicId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (clinicId && userId) {
      initialLoadRef.current = true
      fetchMessages(1, true)
    }
  }, [clinicId, userId])

  const fetchMessages = async (page: number = 1, isInitialLoad: boolean = false, limit: number = 50) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setMessages([])
      } else {
        setLoadingOlder(true)
      }
      setError(null)
      
      const result = await getMessagesByChatPaginatedN8N(clinicId, userId, page, limit)
      
      if (result.messages && Array.isArray(result.messages)) {
        if (isInitialLoad || initialLoadRef.current) {
          // Primera carga: establecer mensajes (ya vienen ordenados del backend)
          setMessages(result.messages)
          initialLoadRef.current = false
        } else {
          // Carga de mensajes más antiguos: agregar al final
          setMessages(prevMessages => [...prevMessages, ...result.messages])
        }
      }

      setPagination(result.pagination)
      setHasMoreMessages(page < result.pagination.totalPages)
    } catch (err) {
      console.error('Error fetching messages from N8N:', err)
      setError(err instanceof Error ? err.message : "Error al cargar mensajes")
    } finally {
      setLoading(false)
      setLoadingOlder(false)
    }
  }

  const loadOlderMessages = async () => {
    if (hasMoreMessages && !loadingOlder) {
      const nextPage = pagination.page + 1
      await fetchMessages(nextPage, false, pagination.limit)
    }
  }

  const refreshMessages = async () => {
    initialLoadRef.current = true
    await fetchMessages(1, true, pagination.limit)
  }

  // Función para agregar un mensaje nuevo al inicio (para mensajes en tiempo real)
  const addNewMessage = (newMessage: Message) => {
    setMessages(prevMessages => {
      // Verificar que no exista el mensaje ya
      const exists = prevMessages.some(msg => msg.id === newMessage.id)
      if (exists) return prevMessages
      
      // Agregar al inicio (más reciente)
      return [newMessage, ...prevMessages]
    })
  }

  return {
    messages,
    loading,
    loadingOlder,
    error,
    pagination,
    hasMoreMessages,
    loadOlderMessages,
    refreshMessages,
    addNewMessage,
    refetch: refreshMessages,
  }
}
