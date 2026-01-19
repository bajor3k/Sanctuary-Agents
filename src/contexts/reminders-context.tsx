'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Reminder } from '@/components/reminders/types';

interface RemindersContextType {
    reminders: Reminder[];
    addReminder: (text: string, tags?: string[], dueDate?: Date, type?: 'reminder' | 'timer', timerDuration?: number) => void;
    toggleReminder: (id: string) => void;
    completedCount: number;
    totalCount: number;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: ReactNode }) {
    const [reminders, setReminders] = useState<Reminder[]>([
        {
            id: '1',
            text: 'Call John regarding the merger',
            status: 'active',
            createdAt: new Date(),
            tags: ['Urgent', 'Client']
        },
        {
            id: '2',
            text: 'Review Q3 financial reports',
            status: 'active',
            createdAt: new Date(),
            tags: ['Admin']
        },
    ]);

    const addReminder = (text: string, tags: string[] = [], dueDate?: Date, type: 'reminder' | 'timer' = 'reminder', timerDuration?: number) => {
        let timerEndsAt: Date | undefined;
        if (type === 'timer' && timerDuration) {
            timerEndsAt = new Date(Date.now() + timerDuration * 1000);
        }

        const newReminder: Reminder = {
            id: Math.random().toString(36).substring(7),
            text,
            status: 'active',
            createdAt: new Date(),
            tags,
            dueDate,
            type,
            timerDuration,
            timerEndsAt
        };
        setReminders(prev => [newReminder, ...prev]);
    };

    const toggleReminder = (id: string) => {
        setReminders(prev => prev.map(r =>
            r.id === id
                ? { ...r, status: r.status === 'active' ? 'completed' : 'active' }
                : r
        ));
    };

    const completedCount = reminders.filter(r => r.status === 'completed').length;
    const totalCount = reminders.length;

    return (
        <RemindersContext.Provider value={{ reminders, addReminder, toggleReminder, completedCount, totalCount }}>
            {children}
        </RemindersContext.Provider>
    );
}

export function useReminders() {
    const context = useContext(RemindersContext);
    if (context === undefined) {
        throw new Error('useReminders must be used within a RemindersProvider');
    }
    return context;
}
