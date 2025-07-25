"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Conversation } from "@/lib/types"

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()

    // Set up real-time subscription
    const channel = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          patient:patients(*)
        `)
        .order("last_message_time", { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching conversations")
    } finally {
      setLoading(false)
    }
  }

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  }
}
