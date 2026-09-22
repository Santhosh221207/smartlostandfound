import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { ItemPhoto } from "./ItemPhoto";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export function ItemCard({ report }: { report: Report }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="relative">
        <ItemPhoto
          path={report.image_url}
          alt={report.item_name}
          className="h-44 w-full bg-surface"
        />
        <div className="absolute top-3 left-3">
          <TypeBadge type={report.report_type} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="font-display text-lg leading-snug font-semibold">{report.item_name}</h3>
          <p className="text-xs font-medium text-primary">{report.category}</p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
        <dl className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <dd className="truncate">{report.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <dd>{formatDate(report.item_date)}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <StatusBadge status={report.status} />
          <Button asChild size="sm" variant="secondary">
            <Link to="/item/$id" params={{ id: report.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
