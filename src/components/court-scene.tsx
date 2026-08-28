import { cn } from "@/lib/utils";

export function CourtScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 200"
      className={cn("w-full max-w-md", className)}
      role="img"
      aria-label="Terrain de pétanque avec boules et cochonnet"
    >
      <rect width="360" height="200" rx="24" fill="#102437" />
      <ellipse cx="180" cy="168" rx="150" ry="22" fill="#0b1c2c" opacity="0.55" />
      <circle cx="180" cy="118" r="54" fill="none" stroke="#c4a574" strokeWidth="2" opacity="0.55" />
      <circle cx="180" cy="118" r="54" fill="none" stroke="#f4ebd8" strokeWidth="1" opacity="0.18" />
      <circle cx="176" cy="116" r="5.5" fill="#e2d0b0" />
      <circle cx="148" cy="132" r="16" fill="#f4ebd8" />
      <circle cx="148" cy="132" r="14.4" fill="none" stroke="#c4a574" strokeWidth="1.6" />
      <circle cx="206" cy="126" r="15" fill="#c4a574" />
      <circle cx="206" cy="126" r="13.5" fill="none" stroke="#0b1c2c" strokeWidth="1.1" opacity="0.35" />
      <circle cx="228" cy="148" r="14" fill="#d4b896" />
      <circle cx="92" cy="58" r="3" fill="#e2d0b0" opacity="0.5" />
      <circle cx="268" cy="48" r="2.4" fill="#c4a574" opacity="0.4" />
    </svg>
  );
}
