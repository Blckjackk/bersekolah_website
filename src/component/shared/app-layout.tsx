'use client'

import { SidebarProvider } from '@/contexts/SidebarContext';
import React, { useEffect } from 'react';
import { usePersistentSidebar } from '@/hooks/use-persistent-sidebar';
import '../../../styles/sidebar.css';

// Inner component to use hooks
function AppLayoutInner({ children }: { children: React.ReactNode }) {
  usePersistentSidebar();
  
  return <>{children}</>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutInner>
        {children}
      </AppLayoutInner>
    </SidebarProvider>
  );
}
