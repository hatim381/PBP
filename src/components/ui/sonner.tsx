import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-navy-800 text-cream border border-cream/12 shadow-[var(--shadow-soft)]",
        },
      }}
    />
  );
}
