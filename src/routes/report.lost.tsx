import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/report/lost")({
  head: () => ({
    meta: [
      { title: "Report a Lost Item | Smart Lost & Found" },
      {
        name: "description",
        content:
          "Report an item you lost on campus. Add a photo, location and date so it can be matched with found items.",
      },
      { property: "og:title", content: "Report a Lost Item | Smart Lost & Found" },
      {
        property: "og:description",
        content: "Tell us what you lost and we'll match it against found reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportLost,
});

function ReportLost() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Lost something?"
        title="Report a lost item"
        description="The more detail you add, the better the matching works. Your contact details stay private."
      />
      <ReportForm type="lost" />
    </div>
  );
}
