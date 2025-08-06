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

    // Configuración directa de N8N_SERVER_POSTGRES para prueba
    const N8N_SERVER_POSTGRES_URL = process.env.N8N_SERVER_POSTGRES || 'http://localhost:5678'
    const N8N_API_KEY = process.env.N8N_API_KEY

    // Intentar llamar al servidor N8N real primero
    try {
      const n8nUrl = `${N8N_SERVER_POSTGRES_URL}/api/messages/chat/${clinicId}/${userId}?page=${page}&limit=${limit}`

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

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
      }
    } catch (n8nError) {
      console.log('Error conectando a N8N_SERVER_POSTGRES, usando datos mock:', n8nError)
    }

    // Retornar datos mock si N8N no está disponible
    const mockData = {
      data: [
        {
          id: '1',
          chat_id: `${clinicId}:${userId}`,
          clinic_id: clinicId,
          customer_id: userId,
          content: 'Mensaje de prueba 1 (N8N no disponible)',
          sender: 'customer',
          timestamp: new Date().toISOString(),
          sentiment: 0.5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          chat_id: `${clinicId}:${userId}`,
          clinic_id: clinicId,
          customer_id: userId,
          content: 'Mensaje de prueba 2 (N8N no disponible)',
          sender: 'clinic',
          timestamp: new Date().toISOString(),
          sentiment: 0.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        totalPages: 1
      }
    }


    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Error en endpoint de prueba:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
