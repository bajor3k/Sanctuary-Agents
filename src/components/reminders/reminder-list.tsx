'use client';

import { useState, useEffect } from 'react';

import { CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reminder } from './types';

interface ReminderListProps {
    reminders: Reminder[];
    onToggle: (id: string) => void;
}

export function ReminderList({ reminders, onToggle }: ReminderListProps) {
    const activeReminders = reminders.filter(r => r.status === 'active');
    const completedReminders = reminders.filter(r => r.status === 'completed');

    if (reminders.length === 0) {
        return (
            <div className="text-center py-12 opacity-50">
                <p className="text-sm text-muted-foreground">No reminders yet. Start typing above.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Active Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-1">Active</h3>
                {activeReminders.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl border-muted/50">
                        <p className="text-sm text-muted-foreground">All caught up!</p>
                    </div>
                ) : (
                    activeReminders.map(reminder => (
                        <ReminderItem key={reminder.id} reminder={reminder} onToggle={onToggle} />
                    ))
                )}
            </div>

            {/* Completed Section (if any) */}
            {completedReminders.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                    <h3 className="text-sm font-medium text-muted-foreground px-1 opacity-70">Completed</h3>
                    <div className="opacity-60 hover:opacity-100 transition-opacity duration-200">
                        {completedReminders.map(reminder => (
                            <ReminderItem key={reminder.id} reminder={reminder} onToggle={onToggle} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ... (previous component code)

function ReminderItem({ reminder, onToggle }: { reminder: Reminder, onToggle: (id: string) => void }) {
    return (
        <div
            onClick={() => onToggle(reminder.id)}
            className={cn(
                "group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                reminder.status === 'completed'
                    ? "bg-muted/30 border-transparent"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
            )}
        >
            <div className={cn(
                "mt-0.5 shrink-0 transition-colors duration-200",
                reminder.status === 'completed' ? "text-primary/50" : "text-muted-foreground group-hover:text-primary"
            )}>
                {reminder.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </div>

            <div className="flex-1 space-y-1">
                <p className={cn(
                    "text-base leading-snug transition-all duration-200",
                    reminder.status === 'completed' && "line-through text-muted-foreground"
                )}>
                    {reminder.text}
                </p>

                {/* Timer Display */}
                {reminder.type === 'timer' && reminder.timerEndsAt && reminder.status === 'active' && (
                    <TimerCountdown endsAt={reminder.timerEndsAt} />
                )}

                {/* Meta data (Tags, Time) */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                    {reminder.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}

                    {reminder.dueDate && !reminder.type && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            Due {new Date(reminder.dueDate).toLocaleDateString()}
                        </span>
                    )}

                    <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-50">
                        Created {reminder.createdAt.toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

function TimerCountdown({ endsAt }: { endsAt: Date }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endsAt).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft("00:00");
                return;
            }

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endsAt]);

    return (
        <div className={cn(
            "mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md font-mono text-lg font-bold border",
            isExpired
                ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        )}>
            <Clock className="w-4 h-4" />
            {isExpired ? "Time's up!" : timeLeft}
        </div>
    );
}
