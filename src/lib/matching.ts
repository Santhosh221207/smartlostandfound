import type { Report } from "./constants";

/**
 * Lightweight, explainable similarity scoring (not machine learning).
 * Item name 40 | Category 20 | Location 20 | Date proximity 10 | Description 10
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "my",
  "of",
  "with",
  "and",
  "in",
  "on",
  "at",
  "is",
  "it",
  "for",
  "near",
  "some",
  "was",
  "has",
  "had",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** Dice coefficient over character bigrams — cheap fuzzy string similarity. */
function bigramSimilarity(a: string, b: string): number {
  const na = normalize(a).replace(/\s/g, "");
  const nb = normalize(b).replace(/\s/g, "");
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return na === nb ? 1 : 0;
  const pairs = (s: string) => {
    const out: string[] = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
  };
  const pa = pairs(na);
  const pb = pairs(nb);
  const pool = [...pb];
  let hits = 0;
  for (const p of pa) {
    const idx = pool.indexOf(p);
    if (idx >= 0) {
      hits++;
      pool.splice(idx, 1);
    }
  }
  return (2 * hits) / (pa.length + pb.length);
}

/** Overlap of meaningful keywords between two blocks of text. */
function keywordOverlap(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

function textScore(a: string, b: string): number {
  return Math.max(bigramSimilarity(a, b), keywordOverlap(a, b));
}

function daysApart(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return 999;
  return Math.abs(da - db) / 86_400_000;
}

export interface MatchFactor {
  label: string;
  points: number;
  max: number;
  hit: boolean;
}

export interface MatchResult {
  lost: Report;
  found: Report;
  score: number;
  level: "strong" | "possible" | "low";
  factors: MatchFactor[];
}

export function scorePair(lost: Report, found: Report): MatchResult {
  const nameSim = textScore(lost.item_name, found.item_name);
  const namePoints = Math.round(nameSim * 40);

  const categoryHit = lost.category === found.category;
  const categoryPoints = categoryHit ? 20 : 0;

  const locSim = textScore(lost.location, found.location);
  const locPoints = Math.round(locSim * 20);

  const gap = daysApart(lost.item_date, found.item_date);
  const datePoints = gap <= 1 ? 10 : gap <= 3 ? 7 : gap <= 7 ? 4 : gap <= 14 ? 2 : 0;

  const descSim = textScore(
    `${lost.description} ${lost.identifying_details ?? ""}`,
    `${found.description} ${found.identifying_details ?? ""}`,
  );
  const descPoints = Math.round(descSim * 10);

  const score = namePoints + categoryPoints + locPoints + datePoints + descPoints;

  const factors: MatchFactor[] = [
    {
      label: nameSim >= 0.75 ? "Very similar item name" : "Similar item name",
      points: namePoints,
      max: 40,
      hit: namePoints >= 20,
    },
    { label: "Same category", points: categoryPoints, max: 20, hit: categoryHit },
    {
      label: locSim >= 0.85 ? "Same location" : "Nearby / similar location",
      points: locPoints,
      max: 20,
      hit: locPoints >= 10,
    },
    {
      label: gap === 0 ? "Same date" : `Reported ${Math.round(gap)} day(s) apart`,
      points: datePoints,
      max: 10,
      hit: datePoints >= 4,
    },
    { label: "Similar description details", points: descPoints, max: 10, hit: descPoints >= 4 },
  ];

  return {
    lost,
    found,
    score,
    level: score >= 80 ? "strong" : score >= 60 ? "possible" : "low",
    factors,
  };
}

export const MATCH_THRESHOLD = 60;

/** Compare every lost report against every found report and keep meaningful pairs. */
export function findMatches(reports: Report[], threshold = MATCH_THRESHOLD): MatchResult[] {
  const lost = reports.filter((r) => r.report_type === "lost");
  const found = reports.filter((r) => r.report_type === "found");
  const results: MatchResult[] = [];
  for (const l of lost) {
    for (const f of found) {
      const result = scorePair(l, f);
      if (result.score >= threshold) results.push(result);
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

/** Best meaningful match for a single report against the rest of the database. */
export function matchesForReport(report: Report, reports: Report[]): MatchResult[] {
  const counterparts = reports.filter((r) => r.report_type !== report.report_type);
  return counterparts
    .map((other) =>
      report.report_type === "lost" ? scorePair(report, other) : scorePair(other, report),
    )
    .filter((m) => m.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

export function levelLabel(level: MatchResult["level"]): string {
  return level === "strong"
    ? "Strong possible match"
    : level === "possible"
      ? "Possible match"
      : "Low similarity";
}
