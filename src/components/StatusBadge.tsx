import { STATUS_LABEL, type ReportStatus, type ReportType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TypeBadge({ type, className }: { type: ReportType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        type === "lost"
          ? "bg-lost text-lost-foreground"
          : "bg-found text-found-foreground",
        className,
      )}
    >
      {type}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        status === "resolved"
          ? "border-found/40 bg-found/10 text-found"
          : status === "matched"
            ? "border-accent/50 bg-accent/15 text-accent-foreground"
            : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
