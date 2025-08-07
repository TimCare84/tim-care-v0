import { NextRequest, NextResponse } from 'next/server'
import { N8N_CONFIG, getAuthHeaders } from '@/lib/querys_n8n/config'

// Interfaces para las respuestas de métricas básicas
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Construir URL del servidor N8N
    const params = new URLSearchParams()
    if (clinicId) params.append('clinic_id', clinicId)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)

    const url = `${N8N_CONFIG.N8N_SERVER_POSTGRES_URL}/api/tim-metrics?${params.toString()}`
    
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

    const data: BasicMetrics = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching basic metrics:', error)
    
    // Datos de fallback
    const fallbackData: BasicMetrics = {
      metrics: {
        avg_response_time: {
          value: 0,
          unit: 'segundos',
          description: 'Tiempo promedio de respuesta',
          tooltip: 'No hay datos disponibles'
        },
        automated_interactions: {
          value: 0,
          unit: 'interacciones',
          description: 'Interacciones automatizadas',
          tooltip: 'No hay datos disponibles'
        },
        time_saved: {
          value_minutes: 0,
          value_hours: 0,
          unit: 'horas',
          description: 'Tiempo ahorrado total',
          tooltip: 'No hay datos disponibles'
        },
        total_conversations: {
          value: 0,
          unit: 'conversaciones',
          description: 'Total de conversaciones',
          tooltip: 'No hay datos disponibles'
        }
      },
      filters: {},
      calculation_details: {
        total_executions: 0,
        time_saved_formula: 'Sin datos'
      }
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}