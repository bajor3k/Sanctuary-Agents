import { Ticket } from "@/types/ticket";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TicketListProps {
    tickets: Ticket[];
    selectedTicketId?: string;
    onSelectTicket: (ticket: Ticket) => void;
    title: string;
    headerActions?: React.ReactNode;
}

export function TicketList({ tickets, selectedTicketId, onSelectTicket, title, headerActions }: TicketListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTickets = tickets.filter(t => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            t.title.toLowerCase().includes(query) ||
            t.clientName.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
    });

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{title} <span className="text-muted-foreground text-sm ml-2">({tickets.length})</span></h3>
                        {headerActions && <div className="flex items-center gap-1 ml-4">{headerActions}</div>}
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket)}
                        className={cn(
                            "cursor-pointer rounded-lg border p-3 hover:bg-accent transition-colors text-left",
                            selectedTicketId === ticket.id ? "bg-accent border-primary/10 shadow-md" : "bg-background dark:border-white/10 border-border/10 shadow-sm"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium truncate pr-2">{ticket.title}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2 truncate">
                            {ticket.clientName}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-1 flex-wrap">
                            {ticket.transferHistory.length > 0 && ticket.assignedTeam === 'Operations' && (
                                <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                                    Incoming: {ticket.transferHistory[ticket.transferHistory.length - 1].from}
                                </Badge>
                            )}
                            <div className="flex gap-2 mb-1">
                                {ticket.status === 'Open' ? (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                                        {ticket.status}
                                    </Badge>
                                ) : ticket.status === 'Awaiting Input' ? (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                                        {ticket.status}
                                    </Badge>
                                ) : ticket.status === 'Action Required' ? (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                        {ticket.status}
                                    </Badge>
                                ) : ticket.status === 'Closed' ? (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-orange-600/10 text-orange-600 hover:bg-orange-600/20 dark:text-orange-500">
                                        {ticket.status}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1">{ticket.status}</Badge>
                                )}
                            </div>
                            {/* Priority Badge */}
                            <Badge variant="secondary" className={cn(
                                "text-[10px] h-5 px-1",
                                ticket.priority === 'High' && "bg-red-500/10 text-red-500 hover:bg-red-500/20",
                                ticket.priority === 'Medium' && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                                ticket.priority === 'Low' && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            )}>
                                {ticket.priority}
                            </Badge>
                        </div>
                    </div>
                ))}
                {filteredTickets.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        No tickets match filter.
                    </div>
                )}
            </div>
        </div >
    );
}
