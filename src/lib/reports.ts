import { supabase } from "@/integrations/supabase/client";
import type { Report, ReportStatus, ReportType } from "./constants";

/** Public columns only — contact email/phone are never exposed to the browser. */
const PUBLIC_COLUMNS =
  "id, report_type, item_name, category, description, image_url, location, item_date, item_time, identifying_details, contact_name, status, is_demo, created_at";

export const BUCKET = "item-photos";

export class FriendlyError extends Error {}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new FriendlyError("We couldn't load reports right now. Please try again.");
  return (data ?? []) as Report[];
}

export async function fetchReport(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new FriendlyError("We couldn't load this report. Please try again.");
  return (data as Report | null) ?? null;
}

export interface NewReportInput {
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
  contact_email: string | null;
  contact_phone: string | null;
}

export async function createReport(input: NewReportInput): Promise<string> {
  const { data, error } = await supabase.from("reports").insert(input).select("id").single();
  if (error || !data) {
    throw new FriendlyError("We couldn't save your report. Please check your details and retry.");
  }
  return data.id as string;
}

export async function updateStatus(id: string, status: ReportStatus): Promise<void> {
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) throw new FriendlyError("We couldn't update this report. Please try again.");
}

export async function submitClaim(input: {
  report_id: string;
  claimant_name: string;
  claimant_email: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("claims").insert(input);
  if (error) throw new FriendlyError("We couldn't send your request. Please try again.");
}

/** Uploads a photo to private storage and returns its object path. */
export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new FriendlyError("The photo couldn't be uploaded. You can submit without it.");
  return path;
}

const signedUrlCache = new Map<string, string>();

export async function getPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (signedUrlCache.has(path)) return signedUrlCache.get(path)!;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  signedUrlCache.set(path, data.signedUrl);
  return data.signedUrl;
}
