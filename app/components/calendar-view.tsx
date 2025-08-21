"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { Stethoscope, Phone, Clock, User, Plus, AlertCircle, Loader2, Pencil, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppointmentsN8N, type AppointmentN8N } from "@/hooks/useAppointmentsN8N"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
 
import '@schedule-x/theme-default/dist/index.css'
 
interface CalendarViewProps {
  clinicId: string | null
}

// Custom component for event modal content
const CustomEventModal = ({ calendarEvent }: { calendarEvent: any }) => {
  // State for edit mode functionality
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editableEvent, setEditableEvent] = useState({
    patientName: calendarEvent.patientName,
    consultationReason: calendarEvent.consultationReason,
    phoneNumber: calendarEvent.phoneNumber,
    appointmentTime: calendarEvent.appointmentTime,
    status: calendarEvent.status,
    note: calendarEvent.note || ''
  })
  
  // Ref to the modal container for portal targeting
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset editable event when calendar event changes
  useEffect(() => {
    setEditableEvent({
      patientName: calendarEvent.patientName,
      consultationReason: calendarEvent.consultationReason,
      phoneNumber: calendarEvent.phoneNumber,
      appointmentTime: calendarEvent.appointmentTime,
      status: calendarEvent.status,
      note: calendarEvent.note || ''
    })
  }, [calendarEvent])

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // Reset changes when canceling edit
      setEditableEvent({
        patientName: calendarEvent.patientName,
        consultationReason: calendarEvent.consultationReason,
        phoneNumber: calendarEvent.phoneNumber,
        appointmentTime: calendarEvent.appointmentTime,
        status: calendarEvent.status,
        note: calendarEvent.note || ''
      })
    }
  }

  // Handle save changes
  const handleSaveChanges = () => {
    // ========================================
    // 🔧 BACKEND:
    // Funcionalidad para actualizar los nuevos datos del evento en la DB correspondiente
    // ========================================

    setIsEditing(false)
    
    // Editing success message to user
    alert('Evento actualizado correctamente') 
  }

  // Handle delete event
  const handleDeleteEvent = () => {
    // ========================================
    // 🔧 BACKEND INTEGRATION REQUIRED:
    // Funcionalidad para eliminar el evento de la DB correspondiente
    // ========================================

    console.log('Deleting event:', calendarEvent.appointmentId)
    
    // For now, just show confirmation and close dialog
    // TODO: Replace with actual API call
    setShowDeleteDialog(false)
    
    // Show success message to user
    alert('Evento eliminado correctamente') // TODO: Replace with proper toast notification
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-green-100 text-green-800', label: 'Agendada' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completada' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
      rescheduled: { color: 'bg-yellow-100 text-yellow-800', label: 'Reagendada' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }
  
  return (
    <TooltipProvider>
      <div 
        ref={modalRef}
        className={isEditing ? 'p-6 space-y-4 rounded-lg transition-colors border-2 border-blue-500 bg-blue-50/30' : 'p-6 space-y-4 rounded-lg transition-colors'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-2">
            {/* ----- NOMBRE DEL PACIENTE ----- */}
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {/* -- Modo Edición -- */}
                {isEditing ? (
                  <Input 
                    value={editableEvent.patientName}
                    onChange={(e) => setEditableEvent(prev => ({ ...prev, patientName: e.target.value }))}
                    className="text-xl font-semibold bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors"
                  />
                // -- Modo Vista -- 
                ) : (
                  calendarEvent.patientName
                )}
              </h2>
            </div>
            {/* ----- ESTADO DEL EVENTO ----- */}
            <div className="ml-9">
              {/* -- Modo Edición -- */}
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-gray-800">Estado:</span>
                  <select 
                    value={editableEvent.status}
                    onChange={(e) => setEditableEvent(prev => ({ ...prev, status: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors text-sm cursor-pointer min-w-[120px]"
                  >
                    <option value="scheduled">Agendada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="rescheduled">Reagendada</option>
                  </select>
                </div>
              // -- Modo Vista -- 
              ) : (
                calendarEvent.status && getStatusBadge(calendarEvent.status)
              )}
            </div>
          </div>
          
          {/* ----- BOTONES DE ACCIÓN ----- */}
          <div className="flex items-center gap-1">
            {/* -- Modo Vista -- */}
            {!isEditing ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditToggle}
                      className="h-8 w-8 rounded-full hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar Evento</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-8 w-8 rounded-full hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar Evento</p>
                  </TooltipContent>
                </Tooltip>
              </>
            // * -- Modo Edición -- *
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveChanges}
                      className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white hover:bg-blue-50"
                    >
                      <Save className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Guardar</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditToggle}
                      className="h-8 w-8 rounded-full hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancelar</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      
        <div className="grid grid-cols-1 gap-4">
          {/* ----- TIPO DE CONSULTA ----- */}
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              {!isEditing && <p className="text-sm font-medium text-gray-700">Consulta</p>}
              {/* -- Modo Edición -- */}
              {isEditing ? (
                <>
                  <p className="text-base font-bold text-gray-800 mb-1">Consulta</p>
                  <select 
                  value={editableEvent.consultationReason}
                  onChange={(e) => setEditableEvent(prev => ({ ...prev, consultationReason: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors w-full text-gray-900 cursor-pointer"
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Gastroenterología">Gastroenterología</option>
                  <option value="Cardiología">Cardiología</option>
                  <option value="Dermatología">Dermatología</option>
                  <option value="Neurología">Neurología</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Ginecología">Ginecología</option>
                </select>
                </>
              // -- Modo Vista --
              ) : (
                <p className="text-gray-900">{calendarEvent.consultationReason}</p>
              )}
            </div>
          </div>
          
          {/* ----- HORARIO DE LA CITA ----- */}
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              {!isEditing && <p className="text-sm font-medium text-gray-700">Horario</p>}
              {/* -- Modo Edición -- */}
              {isEditing ? (
                <>
                  <p className="text-base font-bold text-gray-800 mb-1">Horario</p>
                  <Input
                  type="time"
                  value={editableEvent.appointmentTime}
                  onChange={(e) => setEditableEvent(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors w-full"
                />
                </>
              // -- Modo Vista -- 
              ) : (
                <p className="text-gray-900">{calendarEvent.appointmentTime}</p>
              )}
            </div>
          </div>
          
          {/* ----- TELÉFONO DEL PACIENTE ----- */}
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              {!isEditing && <p className="text-sm font-medium text-gray-700">Teléfono</p>}
              {/* -- Modo Edición -- */}
              {isEditing ? (
                <>
                  <p className="text-base font-bold text-gray-800 mb-1">Teléfono</p>
                  <Input
                  value={editableEvent.phoneNumber}
                  onChange={(e) => setEditableEvent(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Ej: +57 300 123 4567"
                  className="bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors w-full"
                />
                </>
              ) : (
                <p className="text-gray-600">{calendarEvent.phoneNumber}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              {!isEditing && <p className="text-sm font-medium text-gray-700">Notas</p>}
              {isEditing ? (
                <>
                  <p className="text-base font-bold text-gray-800 mb-1">Notas</p>
                  <Textarea
                  value={editableEvent.note}
                  onChange={(e) => setEditableEvent(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Agregar notas sobre la cita..."
                  className="bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2 min-h-[80px] resize-none focus:border-blue-500 focus:ring-0 focus:ring-offset-0 hover:border-gray-300 transition-colors w-full"
                />
                </>
              ) : (
                <p className="text-gray-900 text-sm whitespace-pre-line">
                  {calendarEvent.note || 'Sin notas'}
                </p>
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El evento será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

export function CalendarView({ clinicId }: CalendarViewProps) {
  // PERFORMANCE OPTIMIZATION: Memoize Schedule-X plugins to prevent recreation on every render
  // This prevents the calendar from refreshing when form inputs change
  const eventsService = useMemo(() => createEventsServicePlugin(), [])
  const eventModal = useMemo(() => createEventModalPlugin(), [])
  
  // N8N Appointments Integration
  const { appointments, loading, error, refetch } = useAppointmentsN8N(clinicId)
  
  // Function to extract patient info from note field
  const extractPatientInfo = useCallback((note: string) => {
    const lines = note.split('\n')
    let patientName = 'Paciente Desconocido'
    let consultationReason = 'Consulta'
    
    for (const line of lines) {
      if (line.startsWith('Paciente:')) {
        patientName = line.replace('Paciente:', '').trim()
      } else if (line.startsWith('Motivo de la consulta:')) {
        consultationReason = line.replace('Motivo de la consulta:', '').trim()
      }
    }
    
    return { patientName, consultationReason }
  }, [])
  
  // Transform N8N appointments to Schedule-X format
  const transformedEvents = useMemo(() => {
    if (!appointments || appointments.length === 0) return []
    
    return appointments.map((appointment: AppointmentN8N) => {
      const { patientName, consultationReason } = extractPatientInfo(appointment.note)
      
      // Get status color based on appointment status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'scheduled': return '#22c55e' // green
          case 'completed': return '#3b82f6' // blue
          case 'cancelled': return '#ef4444' // red
          case 'rescheduled': return '#f59e0b' // amber
          default: return '#6b7280' // gray
        }
      }
      
      // Calculate end time: use end_time if available, otherwise add 20 minutes to start_time
      const startTime = new Date(appointment.start_time)
      const endTime = appointment.end_time 
        ? new Date(appointment.end_time)
        : new Date(startTime.getTime() + 20 * 60 * 1000) // Add 20 minutes
      
      // Format dates for Schedule-X (YYYY-MM-DD HH:mm)
      const formatDateTime = (date: Date) => {
        return date.toISOString().replace('Z', '').replace('T', ' ').substring(0, 16)
      }
      
      return {
        id: appointment.id,
        title: `${patientName} - ${consultationReason}`,
        start: formatDateTime(startTime),
        end: formatDateTime(endTime),
        calendarId: 'appointments',
        // Custom properties for the modal
        patientName,
        consultationReason: consultationReason + (appointment.reason ? ` ${appointment.reason}` : ''),
        phoneNumber: 'No disponible', // This would need to come from patient data
        appointmentTime: startTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: appointment.status,
        appointmentId: appointment.id,
        note: appointment.note,
        backgroundColor: getStatusColor(appointment.status)
      }
    })
  }, [appointments, extractPatientInfo])
  
  // Add Event Form State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    patientName: '',
    consultationReason: '',
    phoneNumber: '',
    date: '',
    time: ''
  })

  // Handle adding new event - memoized to prevent unnecessary re-renders
  const handleAddEvent = useCallback(() => {
    // ========================================
    // 🔧 BACKEND:
    // Funcionalidad para agregar un nuevo evento a la DB correspondiente
    // ========================================
    if (!newEvent.patientName || !newEvent.consultationReason || !newEvent.date || !newEvent.time) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const startDateTime = `${newEvent.date} ${newEvent.time}`
    const endDateTime = `${newEvent.date} ${String(parseInt(newEvent.time.split(':')[0]) + 1).padStart(2, '0')}:${newEvent.time.split(':')[1]}`
    
    const eventId = Date.now().toString()
    const event = {
      id: eventId,
      title: `${newEvent.patientName} - ${newEvent.consultationReason}`,
      start: startDateTime,
      end: endDateTime,
      patientName: newEvent.patientName,
      consultationReason: newEvent.consultationReason,
      phoneNumber: newEvent.phoneNumber,
      appointmentTime: newEvent.time
    }

    eventsService.add(event)
    
    // Reset form
    setNewEvent({
      patientName: '',
      consultationReason: '',
      phoneNumber: '',
      date: '',
      time: ''
    })
    setIsAddEventOpen(false)
  }, [newEvent, eventsService])

  // PERFORMANCE OPTIMIZATION: Memoized form handlers to prevent unnecessary re-renders
  // This prevents the calendar from refreshing every time user types in the modal inputs
  const handleInputChange = useCallback((field: string, value: string) => {
    setNewEvent(prev => ({ ...prev, [field]: value }))
  }, [])

  // PERFORMANCE OPTIMIZATION: Memoize custom components object to prevent recreation
  // Ensures ScheduleXCalendar doesn't re-render when form state changes
  const customComponents = useMemo(() => ({
    eventModal: CustomEventModal
  }), [])
 
  // Use transformed events from N8N API instead of static data
  // Events are automatically updated when appointments change

  // PERFORMANCE OPTIMIZATION: Memoize calendar configuration to prevent recreation
  // Critical optimization that prevents Schedule-X from re-initializing on every render
  const calendarConfig = useMemo(() => {
    const views = [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()]
    return {
      views: views as [typeof views[0], ...Array<typeof views[0]>],
      events: transformedEvents,
      plugins: [eventsService, eventModal]
    }
  }, [transformedEvents, eventsService, eventModal])

  const calendar = useCalendarApp(calendarConfig)
 
  useEffect(() => {
    // Update calendar events when transformedEvents change
    if (eventsService && transformedEvents) {
      // Clear existing events and add new ones
      const currentEvents = eventsService.getAll()
      currentEvents.forEach(event => eventsService.remove(event.id))
      transformedEvents.forEach(event => eventsService.add(event))
    }
  }, [eventsService, transformedEvents])
 
  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    return (
      <div className="w-full p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error al cargar las citas: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-4"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  // Show message when no clinic ID is provided
  if (!clinicId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Por favor seleccione una clínica para ver las citas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <ScheduleXCalendar 
        calendarApp={calendar}
        customComponents={customComponents}
      />
      
      {/* Floating Add Event Button */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 shadow-lg bg-blue-900 hover:bg-blue-800 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear evento
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] custom-modal-shadow">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <span>Nueva Cita Médica</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Nombre del Paciente *</Label>
              <Input
                id="patientName"
                value={newEvent.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Ej: Ana García"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="consultationReason">Tipo de Consulta *</Label>
              <Select 
                value={newEvent.consultationReason}
                onValueChange={(value) => handleInputChange('consultationReason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta General">Consulta General</SelectItem>
                  <SelectItem value="Gastroenterología">Gastroenterología</SelectItem>
                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                  <SelectItem value="Neurología">Neurología</SelectItem>
                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                  <SelectItem value="Ginecología">Ginecología</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                value={newEvent.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Ej: +57 300 123 4567"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddEventOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddEvent}
              className="bg-blue-900 hover:bg-blue-800"
            >
              Agendar Cita
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}