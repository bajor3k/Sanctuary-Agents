
"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import FullscreenToggle from './chrome/FullscreenToggle';
import { ThemeToggle } from './theme-toggle';
import { ProfileMenu } from './ProfileMenu';
import { useAuth } from '@/contexts/auth-context';

interface TopToolbarProps {
  onToggleCollapsed: () => void;
  collapsed: boolean;
}

export function TopToolbar({ onToggleCollapsed, collapsed }: TopToolbarProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="flex h-full w-full items-center gap-3 pl-[1.125rem] pr-4">
      {/* LEFT CLUSTER - Logo & Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {/* S Logo */}
        {/* S Logo - Click to Dashboard */}
        <Link href="/dashboard" className="flex items-center justify-center shrink-0 text-foreground transition-all duration-300 hover:opacity-80">
          <svg
            viewBox="0 0 100 100"
            className="w-8 h-8"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="currentColor"
              fontSize="80"
              fontWeight="bold"
              fontFamily="serif"
            >
              S
            </text>
          </svg>
        </Link>

        <button
          onClick={onToggleCollapsed}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* RIGHT CLUSTER — STAYS AT FAR RIGHT */}
      <div className="ml-auto flex items-center gap-2">
        <FullscreenToggle />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
