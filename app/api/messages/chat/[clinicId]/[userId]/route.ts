import { NextRequest, NextResponse } from 'next/server'

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
      console.error('Parámetros faltantes:', { clinicId, userId })
      return NextResponse.json(
        { error: 'Clinic ID y User ID son requeridos' },
        { status: 400 }
      )
    }

    // Configuración directa de N8N_SERVER_POSTGRES
    const N8N_SERVER_POSTGRES_URL = process.env.N8N_SERVER_POSTGRES || 'http://localhost:5678'
    const N8N_API_KEY = process.env.N8N_API_KEY


    // Construir la URL para N8N_SERVER_POSTGRES
    const n8nUrl = `${N8N_SERVER_POSTGRES_URL}/api/messages/chat/${clinicId}/${userId}?page=${page}&limit=${limit}`


    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (N8N_API_KEY) {
      headers['Authorization'] = `Bearer ${N8N_API_KEY}`
    }


    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error en respuesta de N8N_SERVER_POSTGRES:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      return NextResponse.json(
        { 
          error: `Error al obtener mensajes: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Retornar la respuesta de N8N_SERVER_POSTGRES
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en endpoint /api/messages/chat:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
