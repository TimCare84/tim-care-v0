// Exportar todas las consultas de clínicas
export * from './clinics'

// Exportar todas las consultas de pacientes
export * from './patients'

// Exportar todas las consultas de chats
export * from './chats'
export type { ChatsWithCustomer } from './chats'

// Exportar todas las consultas de mensajes
export * from './messages'

// Exportar todas las consultas de customers
export * from './customers'

// Exportar todas las consultas de appointments
export * from './appointments'

// Exportar todas las consultas de usuarios
export * from './users'

// Re-exportar consultas N8N para mantener compatibilidad
export { getUserMessagesN8N, getUserMessagesTest, getUsersByClinicN8N } from '../querys_n8n'
export type { User } from '../querys_n8n'

// Re-exportar tipos de esquemas para facilidad de uso
export type { Customer } from '../../schemas/customers'
export type { Message } from '../../schemas/messages'
export type { Chats } from '../../schemas/chats' 