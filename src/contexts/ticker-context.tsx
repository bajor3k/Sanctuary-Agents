
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState } from 'react';

// This context is no longer in use and can be removed in the future.
// Kept to avoid breaking imports in case it's referenced elsewhere unexpectedly.
interface TickerContextType {
  tickerMessage: string;
  setTickerMessage: Dispatch<SetStateAction<string>>;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export function TickerProvider({ children }: { children: ReactNode }) {
  const [tickerMessage, setTickerMessage] = useState('');

  return (
    <TickerContext.Provider value={{ tickerMessage, setTickerMessage }}>
      {children}
    </TickerContext.Provider>
  );
}

export function useTicker() {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error('useTicker must be used within a TickerProvider');
  }
  return context;
}
