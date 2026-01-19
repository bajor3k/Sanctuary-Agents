
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasNewAlerts?: boolean;
  children?: NavItem[]; // Add this line
}

export type ToolbarSectionKey = 'Reports' | 'CRM' | 'Analytics' | 'Resources' | 'Mail' | 'Calendar' | 'Teams';

export interface ToolbarSection {
  id: ToolbarSectionKey;
  title: string;
}

interface NavigationContextType {
  activeSection: ToolbarSectionKey;
  setActiveSection: Dispatch<SetStateAction<ToolbarSectionKey>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<ToolbarSectionKey>('CRM');

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
