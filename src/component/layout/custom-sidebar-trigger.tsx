"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebar } from "@/contexts/SidebarContext"

export function CustomSidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`h-7 w-7 ${className}`}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="w-4 h-4" />
    </Button>
  )
}
