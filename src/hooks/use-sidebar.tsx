
"use client";
import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { useIsMobile } from "./use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:collapsed";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextType = {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_COOKIE_NAME);
    // On mobile, always start collapsed. On desktop, respect saved state or default to not collapsed.
    const initialCollapsed = isMobile ? true : savedState === '1';
    setCollapsed(initialCollapsed);
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      // Only persist state for desktop view
      if (!isMobile) {
        localStorage.setItem(SIDEBAR_COOKIE_NAME, newState ? '1' : '0');
      }
      return newState;
    });
  }, [isMobile]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, isMobile, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
