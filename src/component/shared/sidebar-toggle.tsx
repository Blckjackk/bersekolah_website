"use client"

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, PanelLeftCloseIcon } from "lucide-react";
import { useSidebar } from '@/contexts/SidebarContext';

export function SidebarToggle() {
  const { isOpen, toggle, sidebarRef } = useSidebar();

  // Handle keyboard shortcuts (optional)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B (common shortcut for toggling sidebars)
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={(e) => {
        e.stopPropagation(); // Prevent click from propagating
        toggle();
      }} 
      className="mr-2 sidebar-toggle"
      title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
      aria-expanded={isOpen}
      aria-controls="main-sidebar"
    >
      {isOpen ? (
        <PanelLeftCloseIcon className="h-5 w-5" />
      ) : (
        <MenuIcon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
      </span>
    </Button>
  );
}
