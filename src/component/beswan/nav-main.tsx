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
        {items.map((item) => {
          // Handle items with no subitems differently (direct links)
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  asChild
                  className={item.isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                >
                  <a href={item.items?.[0]?.url || "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
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
                        {subItem.disabled ? (
                          <SidebarMenuSubButton 
                            isActive={false}
                            className="opacity-50 cursor-not-allowed"
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
                            className={subItem.isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                          >
                            <a 
                              href={subItem.url} 
                              className="flex items-center justify-between w-full"
                            >
                              <span>{subItem.title}</span>
                              {subItem.badge && (
                                <subItem.badge.icon className={`h-4 w-4 ${subItem.badge.color}`} />
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
