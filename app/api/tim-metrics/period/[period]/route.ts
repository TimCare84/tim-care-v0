import { NextRequest, NextResponse } from 'next/server'
import { N8N_CONFIG, getAuthHeaders } from '@/lib/querys_n8n/config'

interface ValueWithTooltip {
  value: number
  tooltip: string
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

export async function GET(
  request: NextRequest,
  { params }: { params: { period: string } }
) {
  try {
    const period = params.period as "daily" | "weekly" | "monthly"
    
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Period must be daily, weekly, or monthly' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const limit = searchParams.get('limit')

    const queryParams = new URLSearchParams()
    if (clinicId) queryParams.append('clinic_id', clinicId)
    if (limit) queryParams.append('limit', limit)

    const url = `${N8N_CONFIG.N8N_SERVER_POSTGRES_URL}/api/tim-metrics/period/${period}?${queryParams.toString()}`
    
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

    const data: PeriodMetrics = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching period metrics:', error)
    
    const fallbackData: PeriodMetrics = {
      period: params.period as "daily" | "weekly" | "monthly",
      metrics: [],
      total_periods: 0,
      filtered_by_clinic: undefined
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}