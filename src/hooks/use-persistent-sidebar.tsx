'use client'

import { useEffect } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

/**
 * Hook to persist sidebar state during page navigation
 * Place this in your main layout component
 */
export function usePersistentSidebar() {
  const { isOpen } = useSidebar();
  
  useEffect(() => {
    // Store sidebar state in sessionStorage to persist during navigation
    const handleBeforeNavigation = () => {
      // We use sessionStorage for navigation-only persistence
      sessionStorage.setItem('bersekolah_sidebar_nav_state', isOpen.toString());
    };

    // Handle navigation attempts
    window.addEventListener('beforeunload', handleBeforeNavigation);
    
    // Handle router navigation if using a client-side router
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if the click is on a link
      const link = target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        // Internal link navigation
        sessionStorage.setItem('bersekolah_sidebar_nav_state', isOpen.toString());
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeNavigation);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen]);
  
  return null;
}
