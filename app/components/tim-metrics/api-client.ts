interface MetricWithTooltip {
  value: number
  unit: string
  description: string
  tooltip: string
}

interface TimeMetricWithTooltip {
  value_minutes: number
  value_hours: number
  unit: string
  description: string
  tooltip: string
}

interface BasicMetrics {
  metrics: {
    avg_response_time: MetricWithTooltip
    automated_interactions: MetricWithTooltip
    time_saved: TimeMetricWithTooltip
    total_conversations: MetricWithTooltip
  }
  filters: any
  calculation_details: {
    total_executions: number
    time_saved_formula: string
  }
}

interface ValueWithTooltip {
  value: number
  tooltip: string
}

interface TimeSavedWithTooltip {
  minutes: number
  hours: number
  work_days: number
  tooltip: string
}

interface ExecutiveSummary {
  executive_summary: {
    total_automated_interactions: ValueWithTooltip
    total_conversations: ValueWithTooltip
    avg_response_time_seconds: ValueWithTooltip
    total_time_saved: TimeSavedWithTooltip
    recent_activity: {
      interactions_today: ValueWithTooltip
      interactions_last_7d: ValueWithTooltip
      interactions_last_30d: ValueWithTooltip
      executions_last_7d: ValueWithTooltip
    }
  }
  performance_indicators: {
    efficiency_score: ValueWithTooltip
    avg_interactions_per_conversation: ValueWithTooltip
  }
}

interface ClinicMetric {
  clinic_id: string
  clinic_name: string
  automated_interactions: ValueWithTooltip
  conversations: ValueWithTooltip
  avg_response_time: ValueWithTooltip
  executions: ValueWithTooltip
  time_saved_minutes: ValueWithTooltip
  time_saved_hours: ValueWithTooltip
}

interface ClinicMetrics {
  clinics_metrics: ClinicMetric[]
  totals: {
    total_automated_interactions: number
    total_conversations: number
    total_executions: number
    total_time_saved_minutes: number
    total_time_saved_hours: string
    avg_response_time_overall: string
  }
  total_clinics: number
  filters: any
}

interface PeriodMetric {
  period: string
  date: string
  automated_interactions: ValueWithTooltip
  conversations: ValueWithTooltip
  avg_response_time: ValueWithTooltip
  executions: ValueWithTooltip
  time_saved_minutes: ValueWithTooltip
  time_saved_hours: ValueWithTooltip
}

interface PeriodMetrics {
  period: "daily" | "weekly" | "monthly"
  metrics: PeriodMetric[]
  total_periods: number
  filtered_by_clinic?: string
}

interface ConversationMetric {
  value: number
  description: string
  percentage: string
  tooltip: string
}

interface LeadStageMetric {
  value: number
  description: string
  percentage: string
  tooltip: string
}

interface LeadMetrics {
  lead_metrics: {
    conversations: {
      active: ConversationMetric
      stalled: ConversationMetric
      total: ValueWithTooltip
    }
    lead_stages: {
      scheduled_paid: LeadStageMetric
      confirmed: LeadStageMetric
      attended: LeadStageMetric
      stalled_leads: LeadStageMetric
      total: ValueWithTooltip
    }
  }
  conversion_funnel: {
    lead_to_scheduled: ValueWithTooltip
    scheduled_to_confirmed: ValueWithTooltip
    confirmed_to_attended: ValueWithTooltip
    overall_conversion_rate: ValueWithTooltip
  }
  filters: any
}

interface MetricFilters {
  clinicId?: string
  dateFrom?: string
  dateTo?: string
}

interface DateFilters {
  dateFrom?: string
  dateTo?: string
}

interface PeriodOptions {
  clinicId?: string
  limit?: number
}

class TimMetricsAPI {
  private baseUrl = '/api/tim-metrics'

  async getBasicMetrics(filters?: MetricFilters): Promise<BasicMetrics> {
    const params = new URLSearchParams()
    if (filters?.clinicId) params.append('clinic_id', filters.clinicId)
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters?.dateTo) params.append('date_to', filters.dateTo)
    
    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getExecutiveSummary(clinicId?: string): Promise<ExecutiveSummary> {
    const params = clinicId ? `?clinic_id=${clinicId}` : ''
    const response = await fetch(`${this.baseUrl}/summary${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getClinicMetrics(filters?: DateFilters): Promise<ClinicMetrics> {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters?.dateTo) params.append('date_to', filters.dateTo)
    
    const response = await fetch(`${this.baseUrl}/by-clinic?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getPeriodMetrics(period: 'daily' | 'weekly' | 'monthly', options?: PeriodOptions): Promise<PeriodMetrics> {
    const params = new URLSearchParams()
    if (options?.clinicId) params.append('clinic_id', options.clinicId)
    if (options?.limit) params.append('limit', options.limit.toString())
    
    const response = await fetch(`${this.baseUrl}/period/${period}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getLeadMetrics(filters?: MetricFilters): Promise<LeadMetrics> {
    const params = new URLSearchParams()
    if (filters?.clinicId) params.append('clinic_id', filters.clinicId)
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters?.dateTo) params.append('date_to', filters.dateTo)
    
    const response = await fetch(`${this.baseUrl}/leads?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}

export const timMetricsAPI = new TimMetricsAPI()

export type {
  BasicMetrics,
  ExecutiveSummary,
  ClinicMetrics,
  PeriodMetrics,
  LeadMetrics,
  MetricFilters,
  DateFilters,
  PeriodOptions,
  MetricWithTooltip,
  TimeMetricWithTooltip,
  ValueWithTooltip
}