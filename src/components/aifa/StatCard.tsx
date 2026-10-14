import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card p-5 shadow-elegant">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{label}</p>
        <Icon className={cn("h-4 w-4", accent ?? "text-primary")} aria-hidden />
      </div>
      <p className="mt-3 font-display text-4xl font-medium leading-none text-foreground">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      <span className="absolute inset-x-0 bottom-0 h-px bg-gold-gradient opacity-40" aria-hidden />
    </div>
  );
}
