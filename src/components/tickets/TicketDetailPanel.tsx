import { Ticket, Team } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, UserCircle2, PlusCircle, UserMinus, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { TransferTicketModal } from "./TransferTicketModal";
import { CloseTicketModal } from "./CloseTicketModal";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TicketDetailPanelProps {
    ticket: Ticket | undefined;
    onTransfer: (ticketId: string, toTeam: Team) => void;
    onAssignToMe?: (ticketId: string) => void;
    onUnassign?: (ticketId: string) => void;
    onAddActivity: (ticketId: string, message: string, type: 'note' | 'reply') => void;
    onCloseTicket?: (ticketId: string, status: 'Completed' | 'Closed', message: string, type: 'note' | 'reply') => void;
}

export function TicketDetailPanel({ ticket, onTransfer, onAssignToMe, onUnassign, onAddActivity, onCloseTicket }: TicketDetailPanelProps) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [closeStatus, setCloseStatus] = useState<'Completed' | 'Closed'>('Completed');

    const [replyMode, setReplyMode] = useState<'internal' | 'client' | 'activity'>('client');
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!ticket || !message.trim() || replyMode === 'activity') return;
        onAddActivity(ticket.id, message, replyMode === 'internal' ? 'note' : 'reply');
        setMessage("");
    };

    const handleOpenCloseModal = (status: 'Completed' | 'Closed') => {
        setCloseStatus(status);
        setIsCloseModalOpen(true);
    };

    if (!ticket) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
                <p>Select a ticket to view details</p>
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
                    <p>Select a ticket to view details</p>
                </div>
            </div>
        );
    }

    const filteredLog = ticket.activityLog?.filter(item => {
        if (replyMode === 'client') return item.type === 'reply';
        if (replyMode === 'internal') return item.type === 'note';
        return true; // activity mode shows all
    });

    const isClosed = ticket.status === 'Completed' || ticket.status === 'Closed';

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6">
                <div>
                    <div className="flex flex-col gap-1">
                        {/* 1. Ticket Number */}
                        <span className="text-lg font-mono font-semibold text-muted-foreground/70">{ticket.id}</span>

                        {/* 2. Title */}
                        <h2 className="text-xl font-bold">{ticket.title}</h2>




                        {/* 4. Account Number */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-foreground">Account:</span>
                            <span className="text-foreground">{ticket.accountNumber || "N/A"}</span>
                        </div>

                        {/* 5. Creator */}
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="font-bold text-foreground">Creator:</span>
                            <span className="text-foreground">{ticket.creator}</span>
                        </div>

                        {/* 6. Priority (and Status typically goes with it) */}
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Priority:</span>
                            {ticket.priority && (
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${ticket.priority === 'Low' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                                        ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                        }`}
                                >
                                    {ticket.priority}
                                </Badge>
                            )}
                        </div>

                        {/* Status (New Line) */}
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Status:</span>
                            {ticket.status === 'Open' ? (
                                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                                    {ticket.status}
                                </Badge>
                            ) : ticket.status === 'Awaiting Input' ? (
                                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                                    {ticket.status}
                                </Badge>
                            ) : ticket.status === 'Action Required' ? (
                                <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                    {ticket.status}
                                </Badge>
                            ) : ticket.status === 'Closed' ? (
                                <Badge variant="secondary" className="text-xs bg-orange-600/10 text-orange-600 hover:bg-orange-600/20 dark:text-orange-500">
                                    {ticket.status}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs">{ticket.status}</Badge>
                            )}
                        </div>

                        {/* 7. Owner */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-foreground">Owner:</span>
                            <span className="text-foreground">{(ticket.owner && ticket.owner !== 'Pending') ? ticket.owner : "N/A"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Action Buttons */}
                    {/* If assigned to 'You', show Unassign. Otherwise show Assign to Me (unless closed) */}
                    {!isClosed && ticket.owner === 'You' && (
                        <Button onClick={() => onUnassign && onUnassign(ticket.id)} className="gap-2 focus-visible:ring-offset-0 focus-visible:ring-white/20 bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                            <UserMinus className="h-4 w-4" />
                            Unassign
                        </Button>
                    )}

                    {!isClosed && ticket.owner !== 'You' && (
                        <Button onClick={() => onAssignToMe && onAssignToMe(ticket.id)} className="gap-2 focus-visible:ring-offset-0 focus-visible:ring-white/20 bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                            <UserCircle2 className="h-4 w-4" />
                            Assign to Me
                        </Button>
                    )}



                    {!isClosed && (
                        <Button onClick={() => setIsTransferModalOpen(true)} className="gap-2 focus-visible:ring-offset-0 focus-visible:ring-white/20 bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
                            <ArrowRightLeft className="h-4 w-4" />
                            Reassign
                        </Button>
                    )}

                    {/* Completion Dropdown */}
                    {!isClosed && onCloseTicket && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="gap-2 focus-visible:ring-offset-0 focus-visible:ring-white/20 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400 dark:bg-green-500/10 dark:hover:bg-green-500/20">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Resolve
                                    <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenCloseModal('Completed')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Mark as Completed</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenCloseModal('Closed')}>
                                    <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                                    <span>Mark as Closed</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">

                    {/* Details */}
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Description</h3>
                        <p className="text-sm rounded-md bg-muted/50 p-3">{ticket.description || "No description provided."}</p>
                    </div>

                    <Separator />

                    {/* Activity Feed */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                            {replyMode === 'activity' ? 'Activity Log' : replyMode === 'client' ? 'Conversation' : 'Internal Notes'}
                        </h3>
                        <div className="space-y-4">
                            {filteredLog?.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No messages to display.</p>
                            )}
                            {filteredLog?.map((bg) => (
                                <div key={bg.id} className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{bg.author}</span>
                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(bg.timestamp), { addSuffix: true })}</span>
                                    </div>
                                    <p className={`${bg.type === 'transfer' ? 'text-blue-400 italic' : ''}`}>
                                        {replyMode === 'activity' ? (
                                            bg.type === 'reply' ? "Responded to client" :
                                                bg.type === 'note' ? "Internal note added" :
                                                    bg.message
                                        ) : bg.message}
                                    </p>
                                </div>
                            ))}
                            {(!ticket.activityLog || ticket.activityLog.length === 0) && (
                                <p className="text-sm text-muted-foreground italic">No activity yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
                <div className="flex gap-4 mb-2">
                    <button
                        onClick={() => setReplyMode('client')}
                        className={`text-sm transition-colors ${replyMode === 'client' ? 'text-foreground font-bold' : 'text-muted-foreground font-medium hover:text-foreground'}`}
                    >
                        Reply to client
                    </button>
                    <button
                        onClick={() => setReplyMode('internal')}
                        className={`text-sm transition-colors ${replyMode === 'internal' ? 'text-foreground font-bold' : 'text-muted-foreground font-medium hover:text-foreground'}`}
                    >
                        Add internal note
                    </button>
                    <button
                        onClick={() => setReplyMode('activity')}
                        className={`text-sm transition-colors ${replyMode === 'activity' ? 'text-foreground font-bold' : 'text-muted-foreground font-medium hover:text-foreground'}`}
                    >
                        Activity
                    </button>
                </div>
                {replyMode !== 'activity' && (
                    <div className="relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={replyMode === 'internal' ? "Add an internal note..." : "Type a reply to the client..."}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={isClosed}
                        />
                        <Button size="sm" className="absolute right-1 top-1 h-8" onClick={handleSend} disabled={!message.trim() || isClosed}>Send</Button>
                    </div>
                )}
            </div>

            <TransferTicketModal
                ticket={ticket}
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onTransfer={onTransfer}
            />

            {onCloseTicket && (
                <CloseTicketModal
                    ticket={ticket}
                    isOpen={isCloseModalOpen}
                    onClose={() => setIsCloseModalOpen(false)}
                    initialStatus={closeStatus}
                    onConfirm={(status, msg, type) => onCloseTicket(ticket.id, status, msg, type)}
                />
            )}
        </div >
    );
}
