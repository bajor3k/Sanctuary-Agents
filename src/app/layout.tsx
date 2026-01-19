
import './globals.css';
import { fontSans, fontMono } from "./fonts";
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { ActivityProvider } from "@/contexts/activity-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { ThemeProvider } from '@/components/theme-provider';
import { TicketProvider } from '@/contexts/ticket-context';
import { RemindersProvider } from '@/contexts/reminders-context';
import AppShell from '@/components/AppShell';
import { ClientLayout } from "@/components/ClientLayout";
import { ActivityTracker } from '@/components/ActivityTracker';
import Image from 'next/image';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <head />
      <body className="text-zinc-100" suppressHydrationWarning>
        <AuthProvider>
          <ActivityProvider>
            <RemindersProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <ClientLayout>
                  <ActivityTracker />
                  <NavigationProvider>
                    <TicketProvider>
                      <TooltipProvider delayDuration={0}>
                        <AppShell>{children}</AppShell>
                        <Toaster />
                      </TooltipProvider>
                    </TicketProvider>
                  </NavigationProvider>
                </ClientLayout>
              </ThemeProvider>
            </RemindersProvider>
          </ActivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
