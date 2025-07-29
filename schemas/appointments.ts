export type Appointment = {
    id: string
    clinic_id: string
    patient_id?: string
    customer_id: string
    event_id: string
    scheduled_at: string
    reason?: string
    status?: string
    notes?: string
    calendar_id?: string
    duration?: string
    created_at?: string
    updated_at?: string
}