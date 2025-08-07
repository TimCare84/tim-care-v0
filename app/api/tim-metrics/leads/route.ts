import { NextRequest, NextResponse } from 'next/server'
import { N8N_CONFIG, getAuthHeaders } from '@/lib/querys_n8n/config'

interface ValueWithTooltip {
  value: number
  tooltip: string
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    const params = new URLSearchParams()
    if (clinicId) params.append('clinic_id', clinicId)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)

    const url = `${N8N_CONFIG.N8N_SERVER_POSTGRES_URL}/api/tim-metrics/leads?${params.toString()}`
    
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

    const data: LeadMetrics = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching lead metrics:', error)
    
    const fallbackData: LeadMetrics = {
      lead_metrics: {
        conversations: {
          active: {
            value: 0,
            description: 'Conversaciones activas',
            percentage: '0.0',
            tooltip: 'No hay datos disponibles'
          },
          stalled: {
            value: 0,
            description: 'Conversaciones estancadas',
            percentage: '0.0',
            tooltip: 'No hay datos disponibles'
          },
          total: {
            value: 0,
            tooltip: 'No hay datos disponibles'
          }
        },
        lead_stages: {
          scheduled_paid: {
            value: 0,
            description: 'Citas agendadas/pagadas',
            percentage: '0.0',
            tooltip: 'No hay datos disponibles'
          },
          confirmed: {
            value: 0,
            description: 'Citas confirmadas',
            percentage: '0.0',
            tooltip: 'No hay datos disponibles'
          },
          attended: {
            value: 0,
            description: 'Citas asistidas',
            percentage: '0.0',
            tooltip: 'No hay datos disponibles'
          },
          total: {
            value: 0,
            tooltip: 'No hay datos disponibles'
          }
        }
      },
      conversion_funnel: {
        lead_to_scheduled: {
          value: 0,
          tooltip: 'No hay datos disponibles'
        },
        scheduled_to_confirmed: {
          value: 0,
          tooltip: 'No hay datos disponibles'
        },
        confirmed_to_attended: {
          value: 0,
          tooltip: 'No hay datos disponibles'
        },
        overall_conversion_rate: {
          value: 0,
          tooltip: 'No hay datos disponibles'
        }
      },
      filters: {}
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}