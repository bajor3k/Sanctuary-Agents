'use client';

import React, { useState, useMemo } from 'react';
import { useTicket } from '@/contexts/ticket-context';
import {
    Building2,
    Briefcase,
    ShieldAlert,
    TrendingUp,
    BarChart3,
    Wallet,
    FileText,
    LayoutGrid,
    Repeat,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Components ---

function MetricCard({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend?: string }) {
    return (
        <div className="bg-card/50 p-4 rounded-xl flex items-center justify-between border border-border/50 dark:border-white/10">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                {trend && <span className="text-xs text-emerald-500">{trend}</span>}
            </div>
        </div>
    );
}

function TicketRow({ ticket }: { ticket: any }) {
    const statusColor =
        ticket.status === 'Open' ? 'text-blue-400 bg-blue-400/10' :
            ticket.status === 'Urgent' ? 'text-red-400 bg-red-400/10' :
                ticket.status === 'Completed' ? 'text-emerald-400 bg-emerald-400/10' :
                    'text-zinc-400 bg-zinc-400/10';

    return (
        <div className="group flex items-center justify-between p-3 rounded-lg bg-card/30 hover:bg-zinc-900/40 transition-all">
            <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full",
                    ticket.priority === 'High' ? 'bg-red-500' :
                        ticket.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <div>
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{ticket.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{ticket.description}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{ticket.id}</span>
                <Badge variant="outline" className={cn("text-xs border", statusColor)}>
                    {ticket.status}
                </Badge>
                <span className="text-xs text-muted-foreground w-16 text-right">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}

// --- Main Page ---

const TEAMS = [
    { id: 'all', label: 'Global', icon: LayoutGrid },
    { id: 'Orion', label: 'Orion', icon: Sparkles },
    { id: 'Advisor Services', label: 'Advisor Svcs', icon: Briefcase },
    { id: 'Managed Accounts', label: 'Managed Accts', icon: Wallet },
    { id: 'Asset Movement', label: 'Asset Mvmt', icon: TrendingUp },
    { id: 'Principal Review', label: 'Principal Rev', icon: BarChart3 },
    { id: 'Compliance', label: 'Compliance', icon: ShieldAlert },
    { id: 'Direct Business', label: 'Direct Business', icon: Building2 },
    { id: 'Transitions', label: 'Transitions', icon: Repeat },
];

export default function DashboardPage() {
    const { tickets } = useTicket();
    const [selectedTeam, setSelectedTeam] = useState('all');

    // Filter Logic
    const filteredTickets = useMemo(() => {
        if (selectedTeam === 'all') return tickets;
        return tickets.filter(t => {
            const team = t.assignedTeam as string;
            return selectedTeam === 'Orion' ? (team === 'Orion' || team === 'Agents') : // Handle legacy 'Agents'
                team.includes(selectedTeam);
        });
    }, [tickets, selectedTeam]);

    // Metrics
    const pendingTickets = filteredTickets.filter(t => ['Open', 'Awaiting Input', 'Action Required', 'Pending'].includes(t.status));
    const completedTickets = filteredTickets.filter(t => ['Completed', 'Closed'].includes(t.status));
    const highPriority = pendingTickets.filter(t => t.priority === 'High').length;

    return (
        <div className="h-full flex flex-col bg-background/95 space-y-6 p-8">

            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                </div>

                {/* Team Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {TEAMS.map((team) => {
                        const Icon = team.icon;
                        const isActive = selectedTeam === team.id;
                        return (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                    isActive
                                        ? "bg-zinc-200 text-zinc-900 dark:bg-primary dark:text-primary-foreground font-bold shadow-sm ring-1 ring-zinc-300 dark:ring-primary"
                                        : "bg-card hover:bg-accent text-muted-foreground border-border hover:border-primary/20"
                                )}
                            >
                                {team.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <MetricCard
                    title="Pending"
                    value={pendingTickets.length}
                    icon={Clock}
                    trend={pendingTickets.length > 5 ? "+2 new" : ""}
                />
                <MetricCard
                    title="Urgent Items"
                    value={highPriority}
                    icon={AlertCircle}
                />
                <MetricCard
                    title="Completed (History)"
                    value={completedTickets.length}
                    icon={CheckCircle2}
                />
                <MetricCard
                    title="Agent Actions"
                    value={Math.floor(completedTickets.length * 1.5)} // Mock metric for now
                    icon={Sparkles}
                />
                <MetricCard
                    title="Agent Hours"
                    value={Math.floor(completedTickets.length * 0.5) + "h"} // Mock metric: 30 mins per ticket
                    icon={Sparkles}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">

                {/* Active Column */}
                <div className="flex flex-col gap-4 h-full min-h-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            Pending
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{pendingTickets.length} items</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[300px] p-1">
                        {pendingTickets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <CheckCircle2 className="h-12 w-12 mb-2" />
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            pendingTickets.map(ticket => (
                                <TicketRow key={ticket.id} ticket={ticket} />
                            ))
                        )}
                    </div>
                </div>

                {/* History Column */}
                <div className="flex flex-col gap-4 h-full min-h-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            History
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">Past 30 days</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[300px] p-1">
                        {completedTickets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Clock className="h-12 w-12 mb-2" />
                                <p>No history yet.</p>
                            </div>
                        ) : (
                            completedTickets.map(ticket => (
                                <TicketRow key={ticket.id} ticket={ticket} />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
