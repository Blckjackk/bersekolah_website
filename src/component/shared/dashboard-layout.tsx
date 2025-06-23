'use client'

import React from 'react';
import { AppLayout } from '@/component/shared/app-layout';
import { SidebarToggle } from '@/component/shared/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { User, Bell, Search } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <SidebarToggle />
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Example Dashboard Layout that uses the AppLayout (SidebarProvider)
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Your AppSidebar component would be placed here */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Dashboard" subtitle="Welcome back" />
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
