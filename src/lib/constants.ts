export const CATEGORIES = [
  "Electronics",
  "Documents",
  "Wallet / Money",
  "Keys",
  "Bags",
  "Books",
  "Clothing",
  "Accessories",
  "Other",
] as const;

export const STATUSES = ["active", "matched", "claimed", "resolved"] as const;

export type Category = (typeof CATEGORIES)[number];
export type ReportStatus = (typeof STATUSES)[number];
export type ReportType = "lost" | "found";

export interface Report {
  id: string;
  report_type: ReportType;
  item_name: string;
  category: string;
  description: string;
  image_url: string | null;
  location: string;
  item_date: string;
  item_time: string | null;
  identifying_details: string | null;
  contact_name: string;
  status: ReportStatus;
  is_demo: boolean;
  created_at: string;
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  active: "Active",
  matched: "Possible match",
  claimed: "Claimed",
  resolved: "Recovered",
};
