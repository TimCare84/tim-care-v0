"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { type AppointmentN8N } from "@/hooks/useAppointmentsN8N"

interface AppointmentDialogProps {
  selectedDate?: Date
  onCreateAppointment: (appointmentData: Partial<AppointmentN8N>) => Promise<void>
  trigger?: React.ReactNode
}

export function AppointmentDialog({ 
  selectedDate, 
  onCreateAppointment,
  trigger 
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    reason: "",
    note: "",
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
    startTime: "",
    endTime: "",
    status: "scheduled" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientName || !formData.date || !formData.startTime) {
      alert("Por favor complete los campos requeridos")
      return
    }

    setLoading(true)
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00.000Z`)
      const endDateTime = formData.endTime 
        ? new Date(`${formData.date}T${formData.endTime}:00.000Z`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000) // Default 1 hour duration

      const appointmentData: Partial<AppointmentN8N> = {
        patient_id: formData.patientId || crypto.randomUUID(),
        event_id: "none",
        reason: formData.reason,
        status: formData.status,
        note: `Paciente: ${formData.patientName}\nMotivo de la consulta: ${formData.reason || "Consulta general"}${formData.note ? `\nNotas: ${formData.note}` : ""}`,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        service_id: null,
      }

      await onCreateAppointment(appointmentData)
      
      // Reset form
      setFormData({
        patientName: "",
        patientId: "",
        reason: "",
        note: "",
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
        startTime: "",
        endTime: "",
        status: "scheduled",
      })
      setOpen(false)
    } catch (error) {
      console.error("Error creating appointment:", error)
      alert("Error al crear la cita. Por favor intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>
            Complete la información para agendar una nueva cita.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Nombre del Paciente *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder="Ingrese el nombre del paciente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientId">ID del Paciente (opcional)</Label>
            <Input
              id="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              placeholder="ID del paciente (se generará automáticamente)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de la Consulta</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ej: Consulta de valoración, Control, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="rescheduled">Reagendada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Inicio *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                placeholder="Opcional (1h por defecto)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notas Adicionales</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Notas adicionales sobre la cita"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Agendar Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}