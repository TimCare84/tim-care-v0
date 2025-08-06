export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  avatar_initials: string
  status: "todos" | "proceso" | "estancado" | "pagado"
  contact_reason: string
  description: string
  needs_intervention: boolean
  last_activity: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  patient_id: string
  status: "inbox" | "ai" // Keeping "ai" here as it might be used internally for logic, even if not a display category
  last_message: string
  last_message_time: string
  needs_intervention: boolean
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface Message {
  id: string
  conversation_id: string
  content: string
  sender: "patient" | "clinic" | "ai"
  timestamp: string
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  doctor: string
  notes?: string
  created_at: string
  patient?: Patient
}
