
"use client";

import * as React from "react";
import { ActivityCard, type ActivityCardProps } from "./ActivityCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityFeedProps {
  activities: ActivityCardProps[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <StickyNote className="h-12 w-12 mb-2 opacity-50" /> 
        <p>No recent activity.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-3"> {/* Adjust height as needed */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} {...activity} />
        ))}
      </div>
    </ScrollArea>
  );
}

// Adding a StickyNote icon for the empty state, if not already imported in ActivityCard.
// If it's exported from ActivityCard, this import isn't strictly necessary here but doesn't hurt.
import { StickyNote } from "lucide-react";
