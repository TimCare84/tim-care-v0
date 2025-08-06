"use client"
import { useState } from "react"
import { Sidebar } from "./components/sidebar"
import { ChatViewer } from "./components/chat-viewer"
import { Dashboard } from "./components/dashboard"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function MedicalCRM() {
const [activeSection, setActiveSection] = useState("pacientes")

const renderMainContent = () => {
  switch (activeSection) {
    case "dashboard":
      return <Dashboard />
    case "pacientes":
      return <ChatViewer />
    default:
      return <ChatViewer />
  }
}

return (
  <SidebarProvider defaultOpen={true}>
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderMainContent()}
    </div>
  </SidebarProvider>
)
}
