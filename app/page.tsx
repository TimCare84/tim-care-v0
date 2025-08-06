"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "./components/sidebar"
import { ChatViewer } from "./components/chat-viewer"
import { Dashboard } from "./components/dashboard"
import { CalendarView } from "./components/calendar-view"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatProvider } from "./components/chat-context"

// Componente que maneja los search params
function MedicalCRMContent() {
  const [activeSection, setActiveSection] = useState("pacientes")
  const searchParams = useSearchParams()

  useEffect(() => {
    const clinicId = searchParams.get('clinic_id')
    if (clinicId) {
      console.log('clinic_id:', clinicId)
    }
  }, [searchParams])

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "pacientes":
        return <ChatViewer />
      case "calendario":
        return <CalendarView />
      default:
        return <ChatViewer />
    }
  }

  return (
    <ChatProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen bg-gray-50">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          {renderMainContent()}
        </div>
      </SidebarProvider>
    </ChatProvider>
  )
}

// Componente de fallback para Suspense
function MedicalCRMFallback() {
  return (
    <div className="flex h-screen w-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function MedicalCRM() {
  return (
    <Suspense fallback={<MedicalCRMFallback />}>
      <MedicalCRMContent />
    </Suspense>
  )
}
