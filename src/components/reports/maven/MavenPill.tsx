'use client';

import useKBReady from './useKBReady';
import { Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Pill from '@/components/ui/Pill';

export default function MavenPill({ onOpen, isLoading, disabled }: { onOpen: () => void, isLoading: boolean, disabled?: boolean }) {
  const { ready, count } = useKBReady();

  return (
    <div className="flex items-center gap-2" data-maven-pill data-ready={String(ready)}>
      <Pill
        onClick={onOpen}
        disabled={disabled || !ready || isLoading}
        aria-label="Open Ask Maven"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
        <span>Maven</span>
      </Pill>
      {ready && !isLoading && count !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {count}</span>
      )}
    </div>
  );
}
