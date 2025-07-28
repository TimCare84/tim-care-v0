export type Message = {
    id: string
    chat_id: string
    clinic_id: string
    customer_id: string
    content?: string
    sender?: string
    timestamp?: Date
    sentiment?: number
    created_at?: string
}