import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/report/found")({
  head: () => ({
    meta: [
      { title: "Report a Found Item | Smart Lost & Found" },
      {
        name: "description",
        content:
          "Found something on campus? Log it here so the system can match it with lost reports and get it home.",
      },
      { property: "og:title", content: "Report a Found Item | Smart Lost & Found" },
      {
        property: "og:description",
        content: "Log an item you found so its owner can be located.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportFound,
});

function ReportFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Found something?"
        title="Report a found item"
        description="Keep one identifying detail to yourself — it helps verify the real owner when someone claims the item."
      />
      <ReportForm type="found" />
    </div>
  );
}
