import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-md border border-cream/15 bg-navy-950/40 px-3 py-2 text-sm text-cream placeholder:text-muted-light/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sand-500/60 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
