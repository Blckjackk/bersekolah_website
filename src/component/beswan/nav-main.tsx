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
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'opacity-100 max-h-8 mb-2' 
          : 'opacity-0 max-h-0 mb-0'
      }`}>
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Platform
        </div>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.title}>
            {!isOpen ? (
              // Collapsed state - show only icons with tooltips
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`flex items-center justify-center w-full p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                        item.isActive ? 'bg-accent/30' : ''
                      }`}
                      onClick={() => {
                        // Navigate to first item in the group when icon is clicked
                        if (item.items.length > 0 && item.items[0].url) {
                          window.location.href = item.items[0].url;
                        }
                      }}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="max-w-[200px]">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.items.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.title}
                              onClick={() => {
                                if (!subItem.disabled && subItem.url) {
                                  window.location.href = subItem.url;
                                }
                              }}
                              disabled={subItem.disabled}
                              className={`block w-full text-left text-xs px-2 py-1 rounded hover:bg-accent/10 transition-colors ${
                                subItem.isActive ? 'font-medium bg-accent/20' : ''
                              } ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              • {subItem.title}
                              {subItem.badge && (
                                <subItem.badge.icon className={`inline w-3 h-3 ml-1 ${subItem.badge.color}`} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              // Expanded state - show full collapsible menu
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-4'
              }`}>
                <Collapsible
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <button 
                      className={`flex items-center w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                        item.isActive ? 'bg-accent/20' : ''
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 flex-shrink-0 mr-3" />}
                      <span className="flex-1 text-left whitespace-nowrap">{item.title}</span>
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 space-y-1 pl-6">
                      {item.items?.map((subItem) => (
                        <div key={subItem.title}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {subItem.disabled ? (
                                  <div className="flex items-center justify-between w-full px-2 py-1.5 text-sm opacity-50 cursor-not-allowed rounded-md">
                                    <span className="whitespace-nowrap">{subItem.title}</span>
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
                                    <span className="whitespace-nowrap">{subItem.title}</span>
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
                </Collapsible>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
