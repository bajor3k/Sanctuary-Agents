import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamSelector } from "./TeamSelector";
import { Team, Ticket } from "@/types/ticket";
import { ArrowRightLeft } from "lucide-react";

interface TransferTicketModalProps {
    ticket: Ticket;
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (ticketId: string, toTeam: Team, reason: string) => void;
}

export function TransferTicketModal({ ticket, isOpen, onClose, onTransfer }: TransferTicketModalProps) {
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
    const [reason, setReason] = useState("");

    const handleTransfer = () => {
        if (selectedTeam && reason.trim()) {
            onTransfer(ticket.id, selectedTeam, reason);
            onClose();
            // Reset state
            setSelectedTeam(undefined);
            setReason("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <ArrowRightLeft className="h-5 w-5" />
                        Reassign Ticket
                    </DialogTitle>
                    <DialogDescription>
                        Reassign this ticket to another team's queue. It will be removed from your view.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="team" className="text-foreground font-medium">Select Destination Team</Label>
                        <TeamSelector
                            value={selectedTeam}
                            onChange={setSelectedTeam}
                            exclude={[ticket.assignedTeam]} // Don't allow transfer to current team
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason" className="text-foreground font-medium">Reason for Reassignment</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Wire amount over $500k, requires Principal Review"
                            value={reason}
                            maxLength={100}
                            className="resize-none h-24"
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="text-xs text-muted-foreground text-right relative -top-1">
                            {reason.length}/100
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleTransfer} disabled={!selectedTeam || !reason.trim()}>
                        Reassign Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
