import { LifeBuoy, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Msg {
  id: number;
  role: "user" | "assistant";
  text: string;
}

/** Rule-based FAQ assistant — no model calls, so it always answers reliably. */
const RULES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["report lost", "lost item", "i lost", "losing", "lost my"],
    answer:
      "Open “Report Lost” in the menu, then fill in the item name, category, description, where and when you lost it, and how you can be reached. A photo helps a lot. After submitting you get a report ID and your report is stored and searchable straight away.",
  },
  {
    keywords: ["report found", "found item", "i found", "found a"],
    answer:
      "Open “Report Found”, describe the item, where and when you found it, and add a photo if you can. Keep one identifying detail to yourself — it helps verify the real owner later.",
  },
  {
    keywords: ["match", "matching", "score", "similar", "how does"],
    answer:
      "Every lost report is compared with every found report using a simple scoring system: item name 40 points, category 20, location 20, date closeness 10, and description details 10. 80+ is a strong possible match, 60-79 is a possible match. It's straightforward text and date comparison — not a trained AI model.",
  },
  {
    keywords: ["search", "filter", "find item", "browse"],
    answer:
      "Go to “Search”. You can type a keyword and filter by lost/found, category, location, date and status. Results come live from the database, so anything just reported shows up immediately.",
  },
  {
    keywords: ["claim", "contact", "get my item", "collect", "reach"],
    answer:
      "Open the item, then use “Claim Item” or “Contact”. You send your name, email and a short message. The other person's email and phone number are never shown publicly — they receive your request and reply to you.",
  },
  {
    keywords: ["safe", "safety", "scam", "meet", "privacy", "private"],
    answer:
      "Safety tips: meet in a public campus spot in daylight, never share bank details or OTPs, ask the claimant to describe a detail that isn't in the listing, and hand over documents or electronics through a staffed campus desk when possible.",
  },
  {
    keywords: ["photo", "image", "upload", "picture"],
    answer:
      "Photos are optional but strongly recommended. JPG or PNG up to 5 MB, and you'll see a preview before submitting. If an upload fails, your report is still saved without the photo.",
  },
  {
    keywords: ["resolve", "recovered", "returned", "mark"],
    answer:
      "Once an item is back with its owner, open the match on the “Matches” page and press “Mark as Resolved”. Both reports move to Recovered and stop appearing as open matches.",
  },
  {
    keywords: ["dashboard", "statistics", "stats", "numbers"],
    answer:
      "The Dashboard shows live counts pulled from the database: lost reports, found reports, active reports, possible matches and recovered items.",
  },
];

const GREETING =
  "Hi! I'm the Lost & Found Assistant. Ask me about reporting an item, searching, how matching works, claiming, or safety tips.";

const SUGGESTIONS = [
  "How do I report a lost item?",
  "How does matching work?",
  "How do I claim an item?",
  "Safety tips",
];

function answerFor(input: string): string {
  const text = input.toLowerCase();
  let best: { score: number; answer: string } | null = null;
  for (const rule of RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) score += keyword.split(" ").length + 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, answer: rule.answer };
  }
  return (
    best?.answer ??
    "I can help with reporting a lost or found item, searching, how matching works, claiming an item, and safety tips. Try asking one of those — or use the menu at the top to get started."
  );
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: "assistant", text: GREETING }]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ block: "end" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text: value },
      { id: prev.length + 1, role: "assistant", text: answerFor(value) },
    ]);
    setInput("");
  }

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lift sm:right-6 sm:bottom-24">
          <div className="flex items-center justify-between border-b border-border bg-ink px-4 py-3 text-ink-foreground">
            <div>
              <p className="font-display text-sm font-semibold">Lost &amp; Found Assistant</p>
              <p className="text-xs opacity-70">Answers common questions instantly</p>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground",
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask the assistant"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide assistant" : "Open Lost & Found Assistant"}
        className="fixed right-4 bottom-4 z-50 flex h-13 items-center gap-2 rounded-full bg-ink px-4 py-3 text-ink-foreground shadow-lift transition-transform hover:scale-[1.03] sm:right-6 sm:bottom-6"
      >
        <LifeBuoy className="h-5 w-5" aria-hidden />
        <span className="text-sm font-semibold">Assistant</span>
      </button>
    </>
  );
}
