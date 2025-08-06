"use client"

import { useState, useEffect } from "react"
import { getMessagesByChatN8N, getMessagesByChatPaginatedN8N } from "@/lib/querys_n8n"
import type { Message } from "@/schemas/messages"

export function useMessagesN8N(clinicId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    if (clinicId && userId) {
      fetchMessages()
    }
  }, [clinicId, userId])

  const fetchMessages = async (page: number = 1, limit: number = 100) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getMessagesByChatPaginatedN8N(clinicId, userId, page, limit)
      setMessages(result.messages)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Error fetching messages from N8N:', err)
      setError(err instanceof Error ? err.message : "Error al cargar mensajes")
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (pagination.page < pagination.totalPages) {
      await fetchMessages(pagination.page + 1, pagination.limit)
    }
  }

  const refreshMessages = async () => {
    await fetchMessages(1, pagination.limit)
  }

  return {
    messages,
    loading,
    error,
    pagination,
    loadMoreMessages,
    refreshMessages,
    refetch: refreshMessages,
  }
}
