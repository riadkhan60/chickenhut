"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from '@/components/ui/sidebar';

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
     
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-blue-500 text-sidebar-primary-foreground">
                
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold  text-2xl">
                  Chicken Hut
                </span>
                <span className="truncate text-xs">Billing System</span>
              </div>
              
            </SidebarMenuButton>
          
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
