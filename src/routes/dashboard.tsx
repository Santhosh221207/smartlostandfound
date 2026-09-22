import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useReports } from "@/hooks/useReports";
import { findMatches } from "@/lib/matching";
import { CATEGORIES } from "@/lib/constants";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Smart Lost & Found" },
      {
        name: "description",
        content:
          "Live statistics for campus lost and found: reports, active items, possible matches and recoveries.",
      },
      { property: "og:title", content: "Dashboard | Smart Lost & Found" },
      {
        property: "og:description",
        content: "Live lost and found statistics for the campus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useReports();
  const reports = data ?? [];
  const matches = useMemo(() => findMatches(reports), [reports]);

  const stats = [
    { label: "Total lost reports", value: reports.filter((r) => r.report_type === "lost").length },
    {
      label: "Total found reports",
      value: reports.filter((r) => r.report_type === "found").length,
    },
    { label: "Active reports", value: reports.filter((r) => r.status === "active").length },
    { label: "Possible matches", value: matches.length },
    { label: "Resolved items", value: reports.filter((r) => r.status === "resolved").length },
  ];

  const byCategory = CATEGORIES.map((c) => ({
    name: c.replace(" / ", "/"),
    lost: reports.filter((r) => r.category === c && r.report_type === "lost").length,
    found: reports.filter((r) => r.category === c && r.report_type === "found").length,
  })).filter((row) => row.lost + row.found > 0);

  const statusData = [
    { name: "Active", value: reports.filter((r) => r.status === "active").length },
    { name: "Matched", value: reports.filter((r) => r.status === "matched").length },
    { name: "Claimed", value: reports.filter((r) => r.status === "claimed").length },
    { name: "Recovered", value: reports.filter((r) => r.status === "resolved").length },
  ].filter((d) => d.value > 0);

  const pieColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-5)",
    "var(--color-chart-3)",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Every number here is calculated live from the reports database."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            {isLoading ? (
              <Skeleton className="h-9 w-14" />
            ) : (
              <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Reports by category</h2>
          <div className="mt-4 h-72">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    dy={10}
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                  <Bar dataKey="lost" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="found" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Report status</h2>
          <div className="mt-4 h-72">
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {statusData.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                {d.name} ({d.value})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
