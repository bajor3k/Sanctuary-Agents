
"use client";

import { useState, useEffect } from "react";
// import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth"; // REMOVED
// import { app } from "@/lib/firebase"; // REMOVED
import { RightSidebar } from "@/components/RightSidebar";
import Login from "@/components/Login";
import AppShell from "./AppShell";
import { useAuth } from "@/contexts/auth-context";

import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

// Inner component to consume the context
function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  const { user, isLoading } = useAuth();

  // 1. Loading State
  if (isLoading) return <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500">Loading AI Agents...</div>;

  // 2. Not Logged In -> Show Login (And NOTHING else)
  if (!user) {
    return <Login />;
  }

  // 3. Logged In -> Show Sidebar + App
  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isOpen ? "mr-96" : "mr-0"}
          `}
        >
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={isOpen}
        onToggle={toggle}
      />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SidebarProvider>
  );
}
