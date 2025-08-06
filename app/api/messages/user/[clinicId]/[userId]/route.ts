import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/querys_n8n/config'

const N8N_BASE_URL = process.env.N8N_SERVER_POSTGRES || 'http://localhost:5678'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; userId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '100'
    const { clinicId, userId } = await params


    // Validar parámetros
    if (!clinicId || !userId) {
      return NextResponse.json(
        { error: 'Clinic ID y User ID son requeridos' },
        { status: 400 }
      )
    }

    // Construir la URL para N8N_SERVER_POSTGRES
    const n8nUrl = `${N8N_BASE_URL}/api/messages/user/${clinicId}/${userId}?page=${page}&limit=${limit}`


    // Realizar la petición a N8N_SERVER_POSTGRES
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      console.error('Error en respuesta de N8N_SERVER_POSTGRES:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Error al obtener mensajes del usuario: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Retornar la respuesta de N8N_SERVER_POSTGRES
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en endpoint /api/messages/user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
