
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { UserPlus, Briefcase, ListChecks, StickyNote, MessageSquareReply, ThumbsUp, Tag as TagIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ActivityCardProps {
  id: string;
  type: "contact" | "opportunity" | "task" | "note" | "system";
  summary: string;
  user: string; // Could be a user name or "System"
  userAvatar?: string; // Optional avatar URL for user
  timestamp: string; // e.g., "2 hours ago", "Just now"
  stageChange?: string; // e.g., "Stage: Needs Analysis to Review"
  tags?: string[];
  details?: React.ReactNode; // For more complex content if needed
}

const activityIcons: Record<ActivityCardProps["type"], LucideIcon> = {
  contact: UserPlus,
  opportunity: Briefcase,
  task: ListChecks,
  note: StickyNote,
  system: StickyNote, // Using StickyNote for generic system/AI notes as well
};

const activityIconColors: Record<ActivityCardProps["type"], string> = {
  contact: "text-blue-400",
  opportunity: "text-green-400",
  task: "text-orange-400",
  note: "text-yellow-400",
  system: "text-purple-400",
};

export function ActivityCard({
  type,
  summary,
  user,
  userAvatar,
  timestamp,
  stageChange,
  tags,
  details,
}: ActivityCardProps) {
  const IconComponent = activityIcons[type] || StickyNote;
  const iconColor = activityIconColors[type] || "text-muted-foreground";

  return (
    <div className="flex gap-3 p-4 bg-black/30 border border-border/20 rounded-lg hover:bg-muted/20 transition-colors duration-150 ease-out shadow-sm">
      <div className="flex-shrink-0 pt-1">
        {type === 'system' && userAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={user} data-ai-hint="AI avatar"/>
            <AvatarFallback>{user.substring(0, 1)}</AvatarFallback>
          </Avatar>
        ) : (
          <IconComponent className={cn("h-5 w-5", iconColor)} />
        )}
      </div>
      <div className="flex-grow">
        <p className="text-sm text-foreground leading-relaxed">
          {summary}
        </p>
        {details && <div className="mt-1 text-xs text-muted-foreground">{details}</div>}
        {stageChange && (
          <p className="text-xs text-muted-foreground mt-1">
            {stageChange}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary/90">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {user} • {timestamp}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-primary">
              <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Like
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-primary">
              <MessageSquareReply className="h-3.5 w-3.5 mr-1" /> Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
