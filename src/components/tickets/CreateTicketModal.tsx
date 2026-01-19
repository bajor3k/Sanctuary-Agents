import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (ticketData: { title: string; clientName: string; accountNumber: string; household: string; priority: "Low" | "Medium" | "High"; description: string; attachments?: File[] }) => void;
}

export function CreateTicketModal({ isOpen, onClose, onCreate }: CreateTicketModalProps) {
    const [title, setTitle] = useState("");
    const [clientName, setClientName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [household, setHousehold] = useState("");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [description, setDescription] = useState("");

    const handleCreate = () => {
        if (title.trim() && clientName.trim()) {
            onCreate({ title, clientName, accountNumber, household, priority, description });
            onClose();
            // Reset
            setTitle("");
            setClientName("");
            setAccountNumber("");
            setHousehold("");
            setPriority("Medium");
            setDescription("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <PlusCircle className="h-5 w-5" />
                        Create New Ticket
                    </DialogTitle>
                    <DialogDescription>
                        Enter the details for the new operations ticket.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-foreground dark:text-foreground">Subject</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Wire Transfer Request"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client" className="text-foreground dark:text-foreground">Client Name</Label>
                            <Input
                                id="client"
                                placeholder="e.g. John Doe"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="accountNumber" className="text-foreground dark:text-foreground">Account Number</Label>
                            <Input
                                id="accountNumber"
                                placeholder="e.g. 12345678"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="household" className="text-foreground dark:text-foreground">Household</Label>
                            <Input
                                id="household"
                                placeholder="e.g. The Smith Family"
                                value={household}
                                onChange={(e) => setHousehold(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="priority" className="text-foreground dark:text-foreground">Priority</Label>
                        <Select value={priority} onValueChange={(v: "Low" | "Medium" | "High") => setPriority(v)}>
                            <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-foreground dark:text-foreground">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Detailed description of the request..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-foreground dark:text-foreground">Attachments</Label>
                        <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center text-sm text-muted-foreground hover:bg-muted/50 cursor-pointer">
                            <PlusCircle className="h-6 w-6 mb-2 text-muted-foreground/50" />
                            <span>Click to add screenshots or photos</span>
                            <Input type="file" className="hidden" multiple />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!title.trim() || !clientName.trim()}>
                        Create Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
