import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Link2Off, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { MatchCard } from "@/components/MatchCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReports } from "@/hooks/useReports";
import { findMatches } from "@/lib/matching";
import { updateStatus, FriendlyError } from "@/lib/reports";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Possible Matches | Smart Lost & Found" },
      {
        name: "description",
        content:
          "See lost and found reports scored against each other, with the exact reasons behind every possible match.",
      },
      { property: "og:title", content: "Possible Matches | Smart Lost & Found" },
      {
        property: "og:description",
        content: "Explainable similarity scores between lost and found reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { data, isLoading, isError, refetch, isFetching } = useReports();
  const queryClient = useQueryClient();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const matches = useMemo(() => findMatches(data ?? []), [data]);
  const strong = matches.filter((m) => m.level === "strong").length;

  async function resolve(lostId: string, foundId: string) {
    setResolvingId(`${lostId}-${foundId}`);
    try {
      await updateStatus(lostId, "resolved");
      await updateStatus(foundId, "resolved");
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Marked as resolved. Nice work!");
    } catch (error) {
      toast.error(
        error instanceof FriendlyError ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Matching engine"
        title="Possible matches"
        description="Every lost report is compared with every found report. Scores use item name (40), category (20), location (20), date closeness (10) and description details (10) — simple, explainable text comparison, not a trained model."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-surface px-3 py-1.5 text-sm">
          <strong>{matches.length}</strong> meaningful match
          {matches.length === 1 ? "" : "es"}
        </span>
        <span className="rounded-full bg-found/10 px-3 py-1.5 text-sm text-found">
          <strong>{strong}</strong> strong
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto"
        >
          <RefreshCw className={isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Link2Off}
          title="We couldn't run the matching"
          description="The reports couldn't be loaded. Please try again in a moment."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Link2Off}
          title="No meaningful matches yet"
          description="Matches appear once a lost report and a found report score at least 60 out of 100 against each other."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/report/lost">Report Lost Item</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/report/found">Report Found Item</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-6">
          {matches.map((m) => (
            <MatchCard
              key={`${m.lost.id}-${m.found.id}`}
              match={m}
              resolving={resolvingId === `${m.lost.id}-${m.found.id}`}
              onResolve={() => resolve(m.lost.id, m.found.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
