import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon,
  tint = "primary",
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  tint?: "primary" | "secondary" | "accent" | "warning";
}) {
  const tints: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    secondary: "from-secondary/15 to-secondary/5 text-secondary",
    accent: "from-accent/20 to-accent/5 text-accent",
    warning: "from-warning/20 to-warning/5 text-warning",
  };
  return (
    <Card className="p-5 shadow-card hover:shadow-glow/40 transition-all hover:-translate-y-0.5 border-border/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold font-display mt-1 truncate">{value}</p>
          {change && <p className="text-xs text-accent mt-1 font-medium">{change}</p>}
        </div>
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br",
            tints[tint],
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold font-display truncate">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-soft mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
