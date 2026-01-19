"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useActivity } from '@/contexts/activity-context';

export function ActivityTracker() {
  const pathname = usePathname();
  const { addLog } = useActivity();

  // Track navigation
  useEffect(() => {
    if (pathname) {
      addLog('INFO', `Navigated to ${pathname}`);
    }
  }, [pathname, addLog]);

  // Track browser events
  useEffect(() => {
    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addLog('INFO', 'Browser tab hidden');
      } else {
        addLog('INFO', 'Browser tab visible');
      }
    };

    // Track online/offline status
    const handleOnline = () => {
      addLog('INFO', 'Network connection restored');
    };

    const handleOffline = () => {
      addLog('WARN', 'Network connection lost');
    };

    // Track errors
    const handleError = (event: ErrorEvent) => {
      addLog('ERROR', `${event.message} at ${event.filename}:${event.lineno}`);
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('ERROR', `Unhandled rejection: ${event.reason}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addLog]);

  return null;
}
