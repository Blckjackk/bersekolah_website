import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// Define the context type
type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
};

// Create the context with default values
const SidebarContext = createContext<SidebarContextType>({
  isOpen: true, // Default to open
  toggle: () => {},
  open: () => {},
  close: () => {},
  sidebarRef: React.createRef<HTMLDivElement | null>(),
});

// Custom hook to use the sidebar context
export const useSidebar = () => useContext(SidebarContext);

const STORAGE_KEY = 'bersekolah_sidebar_state';

// Provider component
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Get the initial state from localStorage if available, otherwise default to true (open)
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(STORAGE_KEY);
      // Default to open if no saved state
      return savedState !== null ? savedState === 'true' : true;
    }
    return true;
  });
  // Save to localStorage whenever the state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, isOpen.toString());
    }
  }, [isOpen]);

  // Add event listener for page visibility change to ensure state persistence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, recheck localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState !== null) {
          setIsOpen(savedState === 'true');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Toggle the sidebar state
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(STORAGE_KEY, newState.toString());
  };
  
  // Explicitly open the sidebar
  const open = () => {
    setIsOpen(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };
  
  // Explicitly close the sidebar
  const close = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'false');
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close, sidebarRef }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
