export type Executions = {
    id: string
    exec_id?: string
    timestamp?: Date
    customer_id: string
    clinic_id: string
    scheduled?: number
    rescheduled?: number
    cancelled?: number
    event_id?: string
    run_time?: number
    feedback?: number
    confirmation?: number
    created_at: string
}