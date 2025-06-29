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

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
      isActive?: boolean // <-- tambahkan agar submenu support highlight
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Handle items with no subitems differently (direct links)
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  asChild
                  className={
                    item.isActive
                      ? "bg-accent/30 font-semibold border-l-2 border-primary text-primary"
                      : "hover:bg-accent/10"
                  }
                >
                  <a href={item.url} className="flex items-center gap-2 px-3 py-2 rounded-md">
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
          
          // Items with subitems use Collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={
                      item.isActive
                        ? "bg-accent/30 font-semibold border-l-2 border-primary text-primary"
                        : "hover:bg-accent/10"
                    }
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild
                          className={
                            subItem.isActive
                              ? "bg-accent/30 font-semibold border-l-2 border-primary text-primary"
                              : "hover:bg-accent/10"
                          }
                        >
                          <a href={subItem.url} className="flex items-center gap-2 px-3 py-2 rounded-md">
                            {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
