import { cn } from "@/lib/utils";

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Pill({ className, disabled, active, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        // ↓ smaller, cleaner pill
        "inline-flex items-center gap-2 rounded-full border border-white/20",
        "px-3 py-1.5 text-xs font-medium",                      // <-- smaller height & font
        "text-zinc-300",
        "transition-colors",
        active
          ? "bg-white/10 text-white"
          : "hover:bg-white/10 hover:text-white",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-zinc-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
