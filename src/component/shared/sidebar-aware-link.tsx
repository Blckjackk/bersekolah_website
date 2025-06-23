'use client'

import React from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

type SidebarAwareLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
};

/**
 * A wrapper around normal links that preserves sidebar state during navigation
 * Use this instead of regular links in your navigation
 */
export function SidebarAwareLink({ children, onClick, ...props }: SidebarAwareLinkProps) {
  const { isOpen } = useSidebar();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Save current sidebar state to localStorage before navigation
    localStorage.setItem('bersekolah_sidebar_state', isOpen.toString());
    
    // Call original onClick handler if provided
    if (onClick) onClick(e);
  };
  
  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
