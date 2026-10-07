import { cn } from "@/lib/utils";

/** Stand-in for tool screenshots that haven't been supplied yet. Size it with className. */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} screenshot placeholder`}
      className={cn(
        "flex aspect-[16/10] items-center justify-center border border-dashed text-sm text-muted-foreground",
        className,
      )}
    >
      {label} screenshot
    </div>
  );
}
