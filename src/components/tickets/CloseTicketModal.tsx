import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Ticket } from "@/types/ticket";
import { CheckCircle2, XCircle } from "lucide-react";

interface CloseTicketModalProps {
    ticket: Ticket;
    isOpen: boolean;
    onClose: () => void;
    initialStatus: 'Completed' | 'Closed';
    onConfirm: (status: 'Completed' | 'Closed', message: string, type: 'note' | 'reply') => void;
}

export function CloseTicketModal({ ticket, isOpen, onClose, initialStatus, onConfirm }: CloseTicketModalProps) {
    const [status, setStatus] = useState<'Completed' | 'Closed'>(initialStatus);
    const [message, setMessage] = useState("");
    const [noteType, setNoteType] = useState<'note' | 'reply'>('note');

    // Update internal state if initialStatus prop changes when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatus(initialStatus);
            setMessage("");
            setNoteType('note');
        }
    }, [isOpen, initialStatus]);

    const handleConfirm = () => {
        onConfirm(status, message, noteType);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        {status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-orange-500" />}
                        {status === 'Completed' ? 'Complete Ticket' : 'Close Ticket'}
                    </DialogTitle>
                    <DialogDescription>
                        Finalize this ticket. You can add a resolution note or send a final reply to the client.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-3">
                        <Label className="text-foreground font-semibold">Ticket Status</Label>
                        <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'Completed' | 'Closed')} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Completed" id="r-completed" />
                                <Label htmlFor="r-completed" className="text-foreground font-medium">Completed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Closed" id="r-closed" />
                                <Label htmlFor="r-closed" className="text-foreground font-medium">Closed</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid gap-3">
                        <Label className="text-foreground font-semibold">Resolution Type</Label>
                        <RadioGroup value={noteType} onValueChange={(v) => setNoteType(v as 'note' | 'reply')} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reply" id="r-reply" />
                                <Label htmlFor="r-reply" className="text-foreground font-medium">Reply to Client</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="note" id="r-note" />
                                <Label htmlFor="r-note" className="text-foreground font-medium">Internal Note</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-foreground font-semibold">
                            {noteType === 'reply' ? 'Message to Client' : 'Internal Resolution Note'}
                        </Label>
                        <Textarea
                            id="message"
                            placeholder={noteType === 'reply' ? "Thank you for creating this ticket..." : "Issue resolved by..."}
                            value={message}
                            className="resize-none h-32"
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="text-foreground border-input hover:bg-accent hover:text-accent-foreground">Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!message.trim()}>
                        {status === 'Completed' ? 'Complete Ticket' : 'Close Ticket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
