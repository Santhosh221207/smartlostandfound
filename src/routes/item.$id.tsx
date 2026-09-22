import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, FileSearch, MapPin, Tag, User } from "lucide-react";
import { useMemo } from "react";
import { ClaimDialog } from "@/components/ClaimDialog";
import { EmptyState } from "@/components/EmptyState";
import { ItemPhoto } from "@/components/ItemPhoto";
import { StatusBadge, TypeBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReports } from "@/hooks/useReports";
import { fetchReport } from "@/lib/reports";
import { formatDate, shortId } from "@/lib/format";
import { levelLabel, matchesForReport } from "@/lib/matching";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "Item Details | Smart Lost & Found" },
      {
        name: "description",
        content:
          "Full details for a reported campus item, including possible matches and how to claim it.",
      },
      { property: "og:title", content: "Item Details | Smart Lost & Found" },
      {
        property: "og:description",
        content: "See item details, possible matches and send a claim request.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport(id),
  });
  const { data: all } = useReports();

  const matches = useMemo(
    () => (report && all ? matchesForReport(report, all) : []),
    [report, all],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={FileSearch}
          title="Report not found"
          description="This report may have been removed, or the link is incorrect."
          action={
            <Button asChild>
              <Link to="/search">Back to search</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isFound = report.report_type === "found";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/search">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back to search
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <ItemPhoto
          path={report.image_url}
          alt={report.item_name}
          className="aspect-4/3 w-full rounded-2xl border border-border bg-surface"
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={report.report_type} />
            <StatusBadge status={report.status} />
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              #{shortId(report.id)}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold">{report.item_name}</h1>
          <p className="mt-3 text-muted-foreground">{report.description}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Detail icon={Tag} label="Category" value={report.category} />
            <Detail
              icon={MapPin}
              label={isFound ? "Location found" : "Location lost"}
              value={report.location}
            />
            <Detail icon={CalendarDays} label="Date" value={formatDate(report.item_date)} />
            <Detail icon={Clock} label="Approximate time" value={report.item_time ?? "Not given"} />
            <Detail
              icon={User}
              label={isFound ? "Reported found by" : "Reported lost by"}
              value={report.contact_name}
            />
          </dl>

          {report.identifying_details && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                Identifying details
              </p>
              <p className="mt-1 text-sm">{report.identifying_details}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <ClaimDialog
              report={report}
              trigger={<Button size="lg">{isFound ? "Claim Item" : "Contact Owner"}</Button>}
            />
            <Button asChild size="lg" variant="secondary">
              <Link to="/matches">See all matches</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Contact details are kept private. Your request is delivered to the reporter.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">
          {matches.length > 0 ? "Possible matching item found" : "Possible matches"}
        </h2>
        {matches.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No {isFound ? "lost" : "found"} report scores high enough against this one yet. Check
            back after new reports come in.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {matches.map((m) => {
              const other = isFound ? m.lost : m.found;
              return (
                <div
                  key={other.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center"
                >
                  <ItemPhoto
                    path={other.image_url}
                    alt={other.item_name}
                    className="h-24 w-24 shrink-0 rounded-xl bg-surface"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold">
                      {levelLabel(m.level)} — {m.score}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {other.item_name} · {other.location} · {formatDate(other.item_date)}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {m.factors
                        .filter((f) => f.hit)
                        .map((f) => (
                          <li key={f.label}>✓ {f.label}</li>
                        ))}
                    </ul>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/item/$id" params={{ id: other.id }}>
                      View Details
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs tracking-wide uppercase text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}
