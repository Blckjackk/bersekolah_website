"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <TooltipProvider>
                        <Tooltip>                          <TooltipTrigger asChild>
                            {subItem.disabled ? (
                              <SidebarMenuSubButton 
                                isActive={false}
                                className={`opacity-50 cursor-not-allowed`}
                              >
                                <span className="flex items-center justify-between w-full">
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <subItem.badge.icon className={`h-4 w-4 ${subItem.badge.color}`} />
                                  )}
                                </span>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton 
                                asChild
                                isActive={subItem.isActive}
                                className={`${subItem.isActive ? 'bg-sidebar-accent/30 font-medium border-l-2 border-primary' : 'hover:bg-sidebar-accent/10'}`}
                              >                                <a 
                                  href={subItem.url} 
                                  className="flex items-center justify-between w-full cursor-pointer"
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
                              </SidebarMenuSubButton>
                            )}
                          </TooltipTrigger>
                          {subItem.badge && (
                            <TooltipContent>
                              <p>{subItem.badge.tooltip}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
