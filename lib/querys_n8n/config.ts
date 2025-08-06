// Configuración para las queries de N8N
export const N8N_CONFIG = {
  // URL del servidor N8N_SERVER_POSTGRES
  N8N_SERVER_POSTGRES_URL: process.env.N8N_SERVER_POSTGRES || 'http://localhost:5678',
  
  // API Key para autenticación (si es necesario)
  N8N_API_KEY: process.env.N8N_API_KEY,
  
  // Timeout para las peticiones
  REQUEST_TIMEOUT: 30000, // 30 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
}

// Función para obtener headers con autenticación
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { ...N8N_CONFIG.DEFAULT_HEADERS }
  
  if (N8N_CONFIG.N8N_API_KEY) {
    headers['Authorization'] = `Bearer ${N8N_CONFIG.N8N_API_KEY}`
  }
  
  return headers
}
