"use client"

import { useState } from "react"
import {
  Home,
  MessageCircle,
  Calendar,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
import { Dashboard } from "./dashboard"
import { CalendarView } from "./calendar-view"

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    component: Dashboard,
  },
  {
    id: "pacientes",
    label: "Pacientes",
    icon: MessageCircle,
    hasSubcategories: true,
    subcategories: [
      { id: "todos", label: "Todos", icon: Users, count: 12, color: "bg-gray-500" },
      { id: "proceso", label: "En proceso", icon: Clock, count: 5, color: "bg-yellow-500" },
      { id: "estancado", label: "Estancado", icon: AlertTriangle, count: 3, color: "bg-red-500" },
      { id: "agendado", label: "Agendado", icon: CheckCircle, count: 8, color: "bg-green-500" },
      { id: "pagado", label: "Pagado", icon: CreditCard, count: 15, color: "bg-emerald-600" },
      { id: "posventa", label: "Posventa", icon: Phone, count: 2, color: "bg-purple-500" },
    ],
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: Calendar,
    component: CalendarView,
  },
]

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const [activeSubcategory, setActiveSubcategory] = useState("todos")
  const isCollapsed = state === "collapsed"

  // Remove the local activeSection state since it's now passed as props
  // const [activeSection, setActiveSection] = useState("dashboard")

  return (
    <div
      className={`bg-white border-r border-gray-200 flex transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex flex-col h-full w-full">
        {/* Header with toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && <h1 className="text-lg font-semibold text-gray-800">CRM Médico</h1>}
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="ml-auto">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="mb-2">
              <Button
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>

              {/* Subcategories for Pacientes - always show when not collapsed */}
              {item.hasSubcategories && !isCollapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.subcategories?.map((sub) => (
                    <Button
                      key={sub.id}
                      variant={activeSubcategory === sub.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setActiveSubcategory(sub.id)}
                    >
                      <sub.icon className="h-3 w-3" />
                      <span className="ml-2 flex-1 text-left">{sub.label}</span>
                      <Badge variant="secondary" className={`${sub.color} text-white text-xs`}>
                        {sub.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}>
            <User className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Dr. María González</span>}
          </Button>

          <Button variant="ghost" className={`w-full justify-start mt-2 ${isCollapsed ? "px-2" : "px-3"}`}>
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Configuración</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
