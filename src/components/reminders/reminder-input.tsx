'use client';

import { useState } from 'react';
import { ArrowUp, Sparkles, Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { processReminder } from '@/app/actions/process-reminder';

interface ReminderInputProps {
    onAdd: (text: string, tags: string[], dueDate?: Date) => void;
}

const AVAILABLE_TAGS = ['Urgent', 'Client', 'Follow-up', 'Idea', 'Personal'];

export function ReminderInput({ onAdd }: ReminderInputProps) {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit();
    };

    const submit = async () => {
        if (!text.trim()) return;

        setIsProcessing(true);

        try {
            // If manual overrides are present, respect them. 
            // Otherwise, or purely additive, ask AI.
            // Strategy: Always ask AI for the text parsing if no manual date/tags set?
            // User requested: "add gemini API key to this chatbox". Implies AI powered.

            // If user explicitly set tags or date, we might NOT want AI to override them.
            // But let's assume mixing is okay or AI fills gaps.
            // For simplicity/robustness: 
            // 1. If tags/date are empty, use AI.
            // 2. If present, use manual.

            let finalTags = [...selectedTags];
            let finalDate = dueDate ? new Date(dueDate + 'T12:00:00') : undefined;
            let finalText = text;

            // Only call AI if we don't have *both* tags and date, OR if we want it to parse the text name
            // Let's call AI always to get the "clean text" and potential missing info.

            const aiResult = await processReminder(text);

            if (aiResult.success && aiResult.data) {
                finalText = aiResult.data.text || text; // Use cleaned text

                // Add AI tags if not duplicated
                if (aiResult.data.tags && Array.isArray(aiResult.data.tags)) {
                    const newTags = aiResult.data.tags.filter((t: string) => !finalTags.includes(t));
                    finalTags = [...finalTags, ...newTags];
                }

                // Use AI date if manual not set
                if (!dueDate && aiResult.data.dueDate) {
                    finalDate = new Date(aiResult.data.dueDate + 'T12:00:00');
                }
            }

            onAdd(finalText, finalTags, finalDate);
            setText('');
            setSelectedTags([]);
            setDueDate('');
        } catch (error) {
            console.error("Error submitting reminder:", error);
            // Fallback to raw text
            onAdd(text, selectedTags, dueDate ? new Date(dueDate + 'T12:00:00') : undefined);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 space-y-3">
            <form onSubmit={handleSubmit} className={cn(
                "relative flex flex-col gap-2 p-3 rounded-2xl border bg-background transition-all duration-300 shadow-sm",
                isFocused ? "border-primary/50 ring-4 ring-primary/5 shadow-lg" : "border-border hover:border-primary/20"
            )}>
                <div className="flex items-start gap-2">
                    <div className="pl-2 pt-2 text-muted-foreground">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="What do you need to remember?"
                        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[50px] max-h-[200px] py-1.5 px-2 text-lg placeholder:text-muted-foreground/50"
                        rows={1}
                        style={{ height: 'auto', minHeight: '50px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || isProcessing}
                        className={cn(
                            "p-2 rounded-xl transition-all duration-200 shrink-0 mt-0.5",
                            text.trim() && !isProcessing
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                    </button>
                </div>

                {/* Toolbar Area */}
                <div className="flex items-center justify-between px-2 pt-1 border-t border-dashed border-border/40 mt-1">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {AVAILABLE_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                    "text-xs font-medium px-2.5 py-1 rounded-full transition-all border",
                                    selectedTags.includes(tag)
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                        <div className="relative group">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8 z-10"
                            />
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                                dueDate ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                            )}>
                                <CalendarIcon className="w-4 h-4" />
                            </div>
                        </div>
                        {dueDate && (
                            <span className="text-xs font-medium text-muted-foreground">
                                {format(new Date(dueDate + 'T12:00:00'), 'MMM d')}
                            </span>
                        )}
                        {dueDate && (
                            <button
                                type="button"
                                onClick={() => setDueDate('')}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
