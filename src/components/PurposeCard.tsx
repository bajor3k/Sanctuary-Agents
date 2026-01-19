// components/PurposeCard.tsx
import React from "react";
import { cn } from "@/lib/utils";

type PurposeCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PurposeCard({ children, className }: PurposeCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-sm border border-[#26272b]",
        "bg-[#0a0a0a] text-zinc-200 leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}
