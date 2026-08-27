import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-sand-500/15 text-sand-400",
        navy: "bg-navy-700 text-cream/80",
        success: "bg-success/20 text-success-fg",
        danger: "bg-danger/20 text-danger-fg",
        warn: "bg-warn/20 text-warn-fg",
        live: "bg-live/20 text-live",
        outline: "border border-cream/20 text-cream/80",
        paper: "bg-navy-900/8 text-navy-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
