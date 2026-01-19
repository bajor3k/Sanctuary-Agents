"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ActivityLog {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  page?: string;
}

interface ActivityContextType {
  logs: ActivityLog[];
  addLog: (level: ActivityLog['level'], message: string, page?: string) => void;
  clearLogs: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const addLog = useCallback((level: ActivityLog['level'], message: string, page?: string) => {
    setLogs(prevLogs => {
      const newLog: ActivityLog = {
        timestamp: new Date(),
        level,
        message,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined)
      };
      const updatedLogs = [newLog, ...prevLogs];
      // Keep only the last 100 logs
      return updatedLogs.slice(0, 100);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <ActivityContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
