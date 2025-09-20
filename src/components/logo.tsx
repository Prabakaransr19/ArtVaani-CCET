
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      className={cn("text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ArtVaani"
    >
      <text 
        x="10" 
        y="35" 
        fontFamily="Caveat, cursive" 
        fontSize="35" 
        fill="currentColor"
      >
        ArtVaani
      </text>
    </svg>
  );
}
