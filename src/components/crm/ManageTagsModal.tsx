import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, X, Plus } from "lucide-react";

interface ManageTagsModalProps {
    children?: React.ReactNode;
    tags?: string[];
    onTagsChange?: (tags: string[]) => void;
}

export function ManageTagsModal({ children, tags: externalTags, onTagsChange }: ManageTagsModalProps) {
    // Use external state if provided, otherwise local state
    const [localTags, setLocalTags] = useState<string[]>(["VIP", "Prospect", "Client", "Lead", "Referral"]);
    const tags = externalTags || localTags;

    const setTags = (newTags: string[]) => {
        if (onTagsChange) {
            onTagsChange(newTags);
        } else {
            setLocalTags(newTags);
        }
    };

    const [newTag, setNewTag] = useState("");
    const [open, setOpen] = useState(false);

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleDeleteTag = (tagToDelete: string) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        Manage Tags
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                    <DialogDescription>
                        Add or remove tags used for contact organization.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-2">
                        <Input
                            id="new-tag"
                            placeholder="New tag name..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button size="icon" onClick={handleAddTag}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <div key={tag} className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">
                                <Tag className="h-3 w-3 opacity-50" />
                                <span>{tag}</span>
                                <button
                                    onClick={() => handleDeleteTag(tag)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                >
                                    <X className="h-3 w-3 text-zinc-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => setOpen(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
