import { NextRequest, NextResponse } from 'next/server'
import { N8N_CONFIG, getAuthHeaders } from '@/lib/querys_n8n/config'

interface ValueWithTooltip {
  value: number
  tooltip: string
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    const params = new URLSearchParams()
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)

    const url = `${N8N_CONFIG.N8N_SERVER_POSTGRES_URL}/api/tim-metrics/by-clinic?${params.toString()}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), N8N_CONFIG.REQUEST_TIMEOUT)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Error del servidor N8N: ${response.status}`)
    }

    const data: ClinicMetrics = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching clinic metrics:', error)
    
    const fallbackData: ClinicMetrics = {
      clinics_metrics: [],
      totals: {
        total_automated_interactions: 0,
        total_conversations: 0,
        total_executions: 0,
        total_time_saved_minutes: 0,
        total_time_saved_hours: '0.0',
        avg_response_time_overall: '0.0'
      },
      total_clinics: 0,
      filters: {}
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}