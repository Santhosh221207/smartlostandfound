import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemPhoto } from "./ItemPhoto";
import { ClaimDialog } from "./ClaimDialog";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { levelLabel, type MatchResult } from "@/lib/matching";
import type { Report } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  match: MatchResult;
  onResolve?: () => void;
  resolving?: boolean;
}

export function MatchCard({ match, onResolve, resolving }: Props) {
  const resolved = match.lost.status === "resolved" && match.found.status === "resolved";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4",
          match.level === "strong" ? "bg-found/10" : "bg-surface",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl font-display text-sm font-bold",
              match.level === "strong"
                ? "bg-found text-found-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            {match.score}%
          </span>
          <div>
            <p className="font-display font-semibold">{levelLabel(match.level)}</p>
            <p className="text-xs text-muted-foreground">
              {match.lost.item_name} ↔ {match.found.item_name}
            </p>
          </div>
        </div>
        {resolved && <StatusBadge status="resolved" />}
      </header>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <Side report={match.lost} label="Lost item" />
        <div className="hidden items-center justify-center text-muted-foreground md:flex">
          <ArrowRight className="h-5 w-5" aria-hidden />
        </div>
        <Side report={match.found} label="Found item" />
      </div>

      <div className="border-t border-border px-5 py-4">
        <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          Matching factors
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {match.factors.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              {f.hit ? (
                <Check className="h-4 w-4 shrink-0 text-found" aria-hidden />
              ) : (
                <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
              )}
              <span className={f.hit ? "" : "text-muted-foreground"}>{f.label}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {f.points}/{f.max}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-border bg-surface/60 px-5 py-4">
        <Button asChild size="sm" variant="secondary">
          <Link to="/item/$id" params={{ id: match.lost.id }}>
            View Lost Report
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to="/item/$id" params={{ id: match.found.id }}>
            View Found Report
          </Link>
        </Button>
        <ClaimDialog
          report={match.found}
          trigger={
            <Button size="sm" disabled={resolved}>
              Contact
            </Button>
          }
        />
        {onResolve && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onResolve}
            disabled={resolved || resolving}
            className="ml-auto"
          >
            {resolved ? "Resolved" : resolving ? "Saving…" : "Mark as Resolved"}
          </Button>
        )}
      </footer>
    </article>
  );
}

function Side({ report, label }: { report: Report; label: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/70 p-3">
      <ItemPhoto
        path={report.image_url}
        alt={report.item_name}
        className="h-20 w-20 shrink-0 rounded-lg bg-surface"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-display font-semibold">{report.item_name}</p>
        <p className="truncate text-sm text-muted-foreground">{report.location}</p>
        <p className="text-sm text-muted-foreground">{formatDate(report.item_date)}</p>
      </div>
    </div>
  );
}
