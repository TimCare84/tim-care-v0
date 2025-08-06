"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "./components/sidebar"
import { ChatViewer } from "./components/chat-viewer"
import { Dashboard } from "./components/dashboard"
import { CalendarView } from "./components/calendar-view"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatProvider } from "./components/chat-context"

export default function MedicalCRM() {
  const [activeSection, setActiveSection] = useState("pacientes")
  const searchParams = useSearchParams()

  useEffect(() => {
    const clinicId = searchParams.get('clinic_id')
    if (clinicId) {
      console.log('clinic_id:', clinicId)
    }
  }, [])

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
