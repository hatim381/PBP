import type { ReactNode } from "react";
import { CourtScene } from "@/components/court-scene";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  actions,
  className,
}: {
  title: string;
  body: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-cream/15 bg-navy-850/60 px-6 py-10 text-center",
        className,
      )}
    >
      <CourtScene className="max-w-xs" />
      <h3 className="mt-6 font-display text-2xl text-cream">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-light">{body}</p>
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
