import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

type SpinnerSize = keyof typeof sizeClasses;

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: SpinnerSize;
}) {
  return (
    <Loader2
      className={cn(sizeClasses[size], "animate-spin text-muted-foreground", className)}
      aria-hidden
    />
  );
}

export function LoadingState({
  label = "Loading",
  className,
  size = "md",
}: {
  label?: string;
  className?: string;
  size?: SpinnerSize;
}) {
  return (
    <div role="status" aria-label={label} className={cn("flex items-center justify-center", className)}>
      <LoadingSpinner size={size} />
    </div>
  );
}
