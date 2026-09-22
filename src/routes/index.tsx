import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Database, HandHeart, Search, Sparkle } from "lucide-react";
import heroImage from "@/assets/hero-items.jpg";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import { useReports } from "@/hooks/useReports";
import { findMatches } from "@/lib/matching";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Lost & Found — Campus Lost Property, Reunited" },
      {
        name: "description",
        content:
          "Report lost and found items on campus and let explainable matching connect them. Find what was lost. Return what was found.",
      },
      { property: "og:title", content: "Smart Lost & Found" },
      {
        property: "og:description",
        content: "Find what was lost. Return what was found.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: ClipboardList, title: "Report", text: "Describe the item in under a minute." },
  { icon: Database, title: "Store", text: "Every report is saved and searchable." },
  { icon: Sparkle, title: "Match", text: "Lost and found reports are scored against each other." },
  { icon: HandHeart, title: "Recover", text: "Send a claim request and get the item back." },
];

function Home() {
  const { data: reports, isLoading } = useReports();
  const list = reports ?? [];
  const matches = findMatches(list);

  const stats = [
    { label: "Lost Reports", value: list.filter((r) => r.report_type === "lost").length },
    { label: "Found Reports", value: list.filter((r) => r.report_type === "found").length },
    { label: "Possible Matches", value: matches.length },
    { label: "Items Recovered", value: list.filter((r) => r.status === "resolved").length },
  ];

  const recent = list.slice(0, 3);

  return (
    <div>
      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="grid-backdrop absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-found" /> Campus lost property
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Smart Lost <span className="text-primary">&</span> Found
            </h1>
            <p className="mt-4 font-display text-xl text-muted-foreground sm:text-2xl">
              Find what was lost. Return what was found.
            </p>
            <p className="mt-4 max-w-xl text-muted-foreground">
              A simple campus platform that connects lost and found items using intelligent,
              explainable matching.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/report/lost">Report Lost Item</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/report/found">Report Found Item</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" aria-hidden />
                  Search Items
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Wallet, keys, glasses and a water bottle on a campus lost and found counter"
              width={1280}
              height={960}
              className="w-full rounded-3xl border border-border object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-10 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-3 text-center sm:py-4">
              {isLoading ? (
                <Skeleton className="mx-auto h-9 w-16" />
              ) : (
                <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  {s.value}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">How it works</h2>
        <p className="mt-2 text-muted-foreground">Report → Store → Match → Recover</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-primary">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">
                <span className="mr-2 text-sm text-muted-foreground">0{i + 1}</span>
                {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Recently reported</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Live from the database — newest reports first.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/search">
                Browse all items
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports yet — be the first to report an item.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((r) => (
                <ItemCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
