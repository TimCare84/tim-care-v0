type MessageHistoryItem = {
    role: string
    content: string
}

export type Conversations = {
    id: string
    customer_id: string
    clinic_id: string
    chat_id: string
    created_at?: string
    updated_at?: string
    history: MessageHistoryItem[]
}