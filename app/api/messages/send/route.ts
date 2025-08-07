import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    
    // Validar campos requeridos
    const { toNumber, message, phoneNumberId, clinicId, userId } = body
    
    if (!toNumber || !message || !phoneNumberId || !clinicId || !userId) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          required: ['toNumber', 'message', 'phoneNumberId', 'clinicId', 'userId']
        },
        { status: 400 }
      )
    }

    // Obtener configuración del servidor desde variables de entorno
    const SUPABASE_FUNCTIONS_URL = process.env.SUPABASE_FUNCTIONS_URL
    const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY

    if (!SUPABASE_FUNCTIONS_URL || !SUPABASE_API_KEY) {
      console.error('Variables de entorno faltantes para Supabase')
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    // Construir la URL completa
    const functionUrl = `${SUPABASE_FUNCTIONS_URL}/messages-manual-response`

    // Preparar el payload
    const payload = {
      toNumber,
      message,
      phoneNumberId,
      clinicId,
      userId
    }

    // Realizar la petición al edge function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SUPABASE_API_KEY
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error en respuesta de Supabase Function:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      return NextResponse.json(
        { 
          error: `Error al enviar mensaje: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error en endpoint /api/messages/send:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}