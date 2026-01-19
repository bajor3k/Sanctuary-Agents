import { useState } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    // Placeholder logic - no op
    console.log("Reminders disabled");
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        fixed right-0 top-0 bottom-0 z-30 w-96 
        bg-white/95 dark:bg-black/90 backdrop-blur-xl shadow-2xl
        border-l border-border/20 dark:border-white/5
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* ... toggle handle ... */}
      <div
        onClick={onToggle}
        className="
          absolute -left-8 top-1/2 -translate-y-1/2 flex h-16 w-8 cursor-pointer items-center justify-center 
          rounded-l-md shadow-sm transition-colors 
          border-y border-l border-border/20 dark:border-white/5
          bg-white/80 dark:bg-black/90 hover:bg-white dark:hover:bg-black
          backdrop-blur-sm
        "
      >
        {isOpen ? (
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-muted-foreground opacity-50" />
        )}
      </div>

      {/* --- Sidebar Content --- */}
      <div className="flex h-full flex-col pt-16">

        {/* Header / Main Body */}
        <div className="flex-1 p-6">
          <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/10 p-4 text-center text-muted-foreground/50">
            <span className="mb-2 text-lg font-medium">Maven</span>
            <span className="text-sm">Reminders are currently disabled in this simplified view.</span>
          </div>
        </div>

        {/* Footer (Input Area) */}
        <div className="border-t border-border/20 dark:border-white/5 bg-background/20 p-4">
          <div className="relative">
            <Textarea
              placeholder="Type a reminder..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] w-full resize-none rounded-xl border-border/30 dark:border-white/10 bg-background/50 pr-12 text-sm focus:bg-background focus:ring-1 focus:ring-blue-500/50"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!text.trim()}
              className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
