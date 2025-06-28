"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useSidebar } from "@/contexts/SidebarContext"

// ✅ UPDATE: Interface untuk support badge
export interface NavItem {
  title: string
  url: string
  disabled?: boolean
  isActive?: boolean
  badge?: {
    icon: LucideIcon
    color: string
    tooltip: string
  }
}

export interface NavGroup {
  title: string
  icon?: LucideIcon
  isActive?: boolean
  items: NavItem[]
}

export function NavMain({
  items,
}: {
  items: NavGroup[]
}) {
  const { isOpen } = useSidebar()
  
  return (
    <div className="p-4 space-y-1">
      {isOpen && (
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Platform
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <button 
                className={`flex items-center w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground ${
                  !isOpen ? 'justify-center' : ''
                }`}
                title={!isOpen ? item.title : undefined}
              >
                {item.icon && <item.icon className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />}
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </>
                )}
              </button>
            </CollapsibleTrigger>
            {isOpen && (
              <CollapsibleContent>
                <div className="mt-1 space-y-1 pl-6">
                  {item.items?.map((subItem) => (
                    <div key={subItem.title}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {subItem.disabled ? (
                              <div className="flex items-center justify-between w-full px-2 py-1.5 text-sm opacity-50 cursor-not-allowed rounded-md">
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <subItem.badge.icon className={`h-4 w-4 ${subItem.badge.color}`} />
                                )}
                              </div>
                            ) : (
                              <a 
                                href={subItem.url} 
                                className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
                                  subItem.isActive 
                                    ? 'bg-accent/30 font-medium border-l-2 border-primary' 
                                    : 'hover:bg-accent/10'
                                }`}
                                onClick={subItem.isActive ? (e) => {
                                  e.preventDefault();
                                  window.location.href = subItem.url;
                                } : undefined}
                              >
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <subItem.badge.icon className={`h-4 w-4 ${subItem.badge.color}`} />
                                )}
                              </a>
                            )}
                          </TooltipTrigger>
                          {subItem.badge && (
                            <TooltipContent>
                              <p>{subItem.badge.tooltip}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
