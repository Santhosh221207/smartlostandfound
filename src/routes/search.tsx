import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch, RotateCcw, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, STATUS_LABEL, STATUSES } from "@/lib/constants";
import { useReports } from "@/hooks/useReports";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Items | Smart Lost & Found" },
      {
        name: "description",
        content:
          "Search every lost and found report on campus by keyword, category, location, date and status.",
      },
      { property: "og:title", content: "Search Items | Smart Lost & Found" },
      {
        property: "og:description",
        content: "Filter lost and found reports by keyword, category, location and date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const ALL = "all";

function SearchPage() {
  const { data, isLoading, isError, refetch } = useReports();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<string>(ALL);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (
        q &&
        !`${r.item_name} ${r.description} ${r.identifying_details ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      if (type !== ALL && r.report_type !== type) return false;
      if (category !== ALL && r.category !== category) return false;
      if (loc && !r.location.toLowerCase().includes(loc)) return false;
      if (date && r.item_date !== date) return false;
      if (status !== ALL && r.status !== status) return false;
      return true;
    });
  }, [data, query, type, category, location, date, status]);

  const hasFilters =
    query || location || date || type !== ALL || category !== ALL || status !== ALL;

  function reset() {
    setQuery("");
    setType(ALL);
    setCategory(ALL);
    setLocation("");
    setDate("");
    setStatus(ALL);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Search"
        title="Search reported items"
        description="Every result comes straight from the database, including reports submitted moments ago."
      />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="q">Keyword</Label>
            <Input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item name or description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Lost / Found</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All reports</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={SearchX}
            title="We couldn't load the items"
            description="There was a problem reaching the database. Please check your connection and try again."
            action={<Button onClick={() => refetch()}>Try again</Button>}
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No items match your search"
            description="Try a broader keyword, clear a filter, or report the item so others can find it."
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={reset}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length} item{results.length === 1 ? "" : "s"} found
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r) => (
                <ItemCard key={r.id} report={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
