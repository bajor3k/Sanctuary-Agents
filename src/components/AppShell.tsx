
// components/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar, { type SectionKey } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { TopToolbar } from "./TopToolbar";

const HEADER_H = 60; // px

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [forceOpen, setForceOpen] = useState<SectionKey | null>(null);


  function handleSidebarToggle() {
    setCollapsed(v => !v);
    setForceOpen(null);
  }

  function handleExpandRequest(section: SectionKey) {
    setCollapsed(false);
    setForceOpen(section);
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--hh": `${HEADER_H}px`,
          "--sbw": collapsed ? "72px" : "260px",
        } as React.CSSProperties
      }
    >
      {/* --------------------------------------------------------- */}
      {/* SIDEBAR — FULL HEIGHT                                     */}
      {/* --------------------------------------------------------- */}
      {/* --------------------------------------------------------- */}
      {/* TOP NAV — FULL WIDTH                                      */}
      {/* --------------------------------------------------------- */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-[var(--hh)] bg-background/80 backdrop-blur border-b border-border transition-all duration-200"
        data-topbar
      >
        <TopToolbar
          onToggleCollapsed={handleSidebarToggle}
          collapsed={collapsed}
        />
      </header>

      {/* --------------------------------------------------------- */}
      {/* SIDEBAR — BELOW HEADER                                    */}
      {/* --------------------------------------------------------- */}
      <aside
        className={cn(
          "fixed left-0 top-[var(--hh)] z-40 border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
          "nav-scroll" // Custom scrollbar class
        )}
        style={{
          width: "var(--sbw)",
          height: "calc(100vh - var(--hh))"
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onExpandRequest={handleExpandRequest}
          forceOpen={forceOpen}
          onForceOpenHandled={() => setForceOpen(null)}
          onToggleCollapsed={handleSidebarToggle}
        />
      </aside>

      {/* --------------------------------------------------------- */}
      {/* MAIN CONTENT                                              */}
      {/* --------------------------------------------------------- */}
      <main
        className="relative z-10 p-6 transition-[margin-left] duration-200 bg-transparent"
        style={{
          marginLeft: "var(--sbw)",
          marginTop: "var(--hh)",
          paddingTop: "0",
        }}
      >
        {children}
      </main>
    </div>
  );
}
