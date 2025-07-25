"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Message } from "@/lib/types"

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (conversationId) {
      fetchMessages()

      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching messages")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, sender: "patient" | "clinic" | "ai") => {
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        sender,
        timestamp: new Date().toISOString(),
      })

      if (error) throw error

      // Update conversation's last message
      await supabase
        .from("conversations")
        .update({
          last_message: content,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sending message")
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  }
}
