import * as React from "react";
import { cn } from "@/lib/utils";

type Emphasis = "normal" | "bright" | "active";

export function ActionPill({
  onClick,
  disabled,
  icon,
  label,
  srLabel,
  title,
  labelEmphasis = "normal",
  className = "",
  isRunning = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  srLabel?: string;
  title?: string;
  labelEmphasis?: Emphasis;
  className?: string;
  isRunning?: boolean;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full h-9 px-3 border select-none transition-colors duration-150 disabled:opacity-55 text-xs font-medium";
  
  const themeClasses = 
    "border-white/20 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white";

  const emphasisClasses = {
    normal: "text-zinc-400 cursor-not-allowed hover:bg-transparent hover:text-zinc-400",
    bright: "text-white hover:bg-white/10 cursor-pointer",
    active: "bg-white/10 text-white hover:bg-white/20",
  };
  
  const runningClasses = isRunning ? "text-zinc-400 cursor-wait" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isRunning}
      aria-label={srLabel || label}
      title={title || label}
      className={cn(
          baseClasses,
          themeClasses,
          isRunning ? runningClasses : emphasisClasses[labelEmphasis],
          className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="leading-none">{label}</span>
    </button>
  );
}
