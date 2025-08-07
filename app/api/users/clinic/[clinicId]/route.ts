import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/querys_n8n/config'

const N8N_BASE_URL = process.env.N8N_SERVER_POSTGRES
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    console.log('=== API Route Debug Info ===')
    console.log('N8N_BASE_URL:', N8N_BASE_URL)
    console.log('Environment check:', {
      N8N_SERVER_POSTGRES: process.env.N8N_SERVER_POSTGRES,
      NODE_ENV: process.env.NODE_ENV
    })

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const agentActive = searchParams.get('agent_active') || 'true'
    const { clinicId } = await params

    console.log('Request params:', { clinicId, page, limit, agentActive })

    // Validar parámetros
    if (!clinicId) {
      console.error('Missing clinicId parameter')
      return NextResponse.json(
        { error: 'Clinic ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la URL base esté configurada
    if (!N8N_BASE_URL) {
      console.error('N8N_SERVER_POSTGRES environment variable not set')
      return NextResponse.json(
        { error: 'Configuración del servidor N8N no encontrada', details: 'N8N_SERVER_POSTGRES no está configurado' },
        { status: 500 }
      )
    }

    // Construir la URL para N8N_SERVER_POSTGRES
    const n8nUrl = `${N8N_BASE_URL}/api/users/clinic/${clinicId}?page=${page}&limit=${limit}&agent_active=${agentActive}`
    console.log('N8N URL constructed:', n8nUrl)

    const headers = getAuthHeaders()
    console.log('Request headers:', headers)

    // Realizar la petición a N8N_SERVER_POSTGRES
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      console.error('Error en respuesta de N8N_SERVER_POSTGRES:', response.status, response.statusText)
      let errorText = ''
      try {
        errorText = await response.text()
        console.error('Error response body:', errorText)
      } catch (e) {
        console.error('Could not read error response body:', e)
      }
      
      return NextResponse.json(
        { 
          error: `Error al obtener usuarios: ${response.status}`, 
          details: errorText || response.statusText,
          n8nUrl: n8nUrl 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('N8N response data:', data)

    // Retornar la respuesta de N8N_SERVER_POSTGRES
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en endpoint /api/users/clinic:', error)
    
    // Proporcionar más detalles del error
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: errorDetails,
        n8nUrl: N8N_BASE_URL ? `${N8N_BASE_URL}/api/users/clinic/[clinicId]` : 'N8N_BASE_URL not configured'
      },
      { status: 500 }
    )
  }
}
