import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,transform,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-sand-500 text-navy-900 hover:bg-sand-400",
        invert: "bg-navy-900 text-cream hover:bg-navy-800",
        paper: "bg-cream text-navy-900 hover:bg-sand-300",
        outline:
          "border border-cream/20 bg-transparent text-cream hover:bg-cream/8",
        ghost: "text-cream/80 hover:bg-cream/8 hover:text-cream",
        danger: "bg-danger text-danger-fg hover:opacity-90",
        success: "bg-success text-success-fg hover:opacity-90",
        link: "text-sand-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6",
        xl: "h-14 rounded-xl px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
