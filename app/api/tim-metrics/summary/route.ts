import { NextRequest, NextResponse } from 'next/server'
import { N8N_CONFIG, getAuthHeaders } from '@/lib/querys_n8n/config'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')

    const params = new URLSearchParams()
    if (clinicId) params.append('clinic_id', clinicId)

    const url = `${N8N_CONFIG.N8N_SERVER_POSTGRES_URL}/api/tim-metrics/summary?${params.toString()}`
    
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

    const data: ExecutiveSummary = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching executive summary:', error)
    
    const fallbackData: ExecutiveSummary = {
      executive_summary: {
        total_automated_interactions: { value: 0, tooltip: 'No hay datos disponibles' },
        total_conversations: { value: 0, tooltip: 'No hay datos disponibles' },
        avg_response_time_seconds: { value: 0, tooltip: 'No hay datos disponibles' },
        total_time_saved: { 
          minutes: 0, 
          hours: 0, 
          work_days: 0, 
          tooltip: 'No hay datos disponibles' 
        },
        recent_activity: {
          interactions_today: { value: 0, tooltip: 'No hay datos disponibles' },
          interactions_last_7d: { value: 0, tooltip: 'No hay datos disponibles' },
          interactions_last_30d: { value: 0, tooltip: 'No hay datos disponibles' },
          executions_last_7d: { value: 0, tooltip: 'No hay datos disponibles' }
        }
      },
      performance_indicators: {
        efficiency_score: { value: 0, tooltip: 'No hay datos disponibles' },
        avg_interactions_per_conversation: { value: 0, tooltip: 'No hay datos disponibles' }
      }
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}