import { cn } from "@/lib/utils";

export function BouleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0B1C2C" />
      <circle cx="13" cy="18" r="8" fill="#F4EBD8" />
      <circle cx="13" cy="18" r="7.2" fill="none" stroke="#C4A574" strokeWidth="1.2" />
      <circle cx="21" cy="14" r="7" fill="#C4A574" />
      <circle cx="21" cy="14" r="6.2" fill="none" stroke="#0B1C2C" strokeWidth="0.8" opacity="0.35" />
      <circle cx="8" cy="9" r="2.2" fill="#E2D0B0" />
    </svg>
  );
}

export function Wordmark({ compact = false, invert = false }: { compact?: boolean; invert?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BouleMark className="size-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.05rem] font-semibold tracking-tight",
            invert ? "text-navy-900" : "text-cream",
          )}
        >
          PBP Concours
        </span>
        {!compact && (
          <span className={cn("mt-0.5 text-[10px] uppercase tracking-[0.18em]", invert ? "text-navy-600" : "text-sand-400")}>
            Pétanque Bohra Paris
          </span>
        )}
      </span>
    </span>
  );
}
