import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/querys_n8n/config'

const N8N_BASE_URL = process.env.N8N_SERVER_POSTGRES || process.env.N8N_SERVER_POSTGRES
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const agentActive = searchParams.get('agent_active') || 'true'
    const { clinicId } = await params

    // Validar parámetros
    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID es requerido' },
        { status: 400 }
      )
    }

    // Construir la URL para N8N_SERVER_POSTGRES
    const n8nUrl = `${N8N_BASE_URL}/api/users/clinic/${clinicId}?page=${page}&limit=${limit}&agent_active=${agentActive}`


    // Realizar la petición a N8N_SERVER_POSTGRES
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      console.error('Error en respuesta de N8N_SERVER_POSTGRES:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Error al obtener usuarios: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Retornar la respuesta de N8N_SERVER_POSTGRES
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en endpoint /api/users/clinic:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
