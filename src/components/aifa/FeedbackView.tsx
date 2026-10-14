import { useMemo, useState } from "react";
import { Search, MessageSquareText, CheckCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHotel } from "@/lib/hotel/store";
import type { FeedbackCategory, FeedbackStatus } from "@/lib/hotel/types";
import { fmtDateTime } from "@/lib/hotel/dates";
import { isLowRating } from "@/lib/hotel/logic";
import { cn } from "@/lib/utils";
import { FeedbackStatusBadge, Stars } from "./badges";

const CATS: FeedbackCategory[] = [
  "Service",
  "Cleanliness",
  "Comfort",
  "Facilities",
  "Other",
  "Check-Out Rating",
];

export function FeedbackView() {
  const { state, dispatch } = useHotel();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FeedbackCategory | "all">("all");
  const [rating, setRating] = useState<"all" | "low" | "high" | "none">("all");
  const [status, setStatus] = useState<FeedbackStatus | "all">("all");
  const [sel, setSel] = useState<string | null>(state.feedback[0]?.id ?? null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.feedback.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (status !== "all" && f.status !== status) return false;
      if (rating === "low" && !isLowRating(f)) return false;
      if (rating === "high" && !(f.rating && f.rating >= 4)) return false;
      if (rating === "none" && f.rating) return false;
      if (t && !`${f.comment} ${f.guestName ?? ""} ${f.roomNumber ?? ""}`.toLowerCase().includes(t))
        return false;
      return true;
    });
  }, [state.feedback, q, cat, rating, status]);
  const current = state.feedback.find((f) => f.id === sel);

  const mark = (id: string, s: FeedbackStatus) => {
    dispatch({ type: "feedbackStatus", id, status: s });
    toast.success(`Feedback marked as ${s}`);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-border bg-card shadow-elegant">
        <div className="flex flex-wrap gap-2 p-5">
          <label className="relative min-w-48 flex-1">
            <span className="sr-only">Search feedback</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="field ps-9"
              placeholder="Search comments, guest, room"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <select
            aria-label="Category"
            className="field w-40"
            value={cat}
            onChange={(e) => setCat(e.target.value as FeedbackCategory | "all")}
          >
            <option value="all">All categories</option>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Rating"
            className="field w-36"
            value={rating}
            onChange={(e) => setRating(e.target.value as typeof rating)}
          >
            <option value="all">Any rating</option>
            <option value="low">1–3 stars</option>
            <option value="high">4–5 stars</option>
            <option value="none">No rating</option>
          </select>
          <select
            aria-label="Review status"
            className="field w-36"
            value={status}
            onChange={(e) => setStatus(e.target.value as FeedbackStatus | "all")}
          >
            <option value="all">All statuses</option>
            <option>New</option>
            <option>Reviewed</option>
            <option>Resolved</option>
          </select>
        </div>
        <ul className="border-t border-border">
          {list.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => setSel(f.id)}
                className={cn(
                  "flex w-full items-start gap-4 border-b border-border/60 px-5 py-4 text-start transition-colors hover:bg-elevated/60",
                  sel === f.id && "bg-elevated",
                  isLowRating(f) && "border-s-2 border-s-status-reserved",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary">{f.category}</span>
                    <span>·</span>
                    <span>{fmtDateTime(f.createdAt)}</span>
                    {f.roomNumber && (
                      <>
                        <span>·</span>
                        <span>Room {f.roomNumber}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground">
                    {f.comment || <em className="text-muted-foreground">No comment</em>}
                  </p>
                  <div className="mt-2">
                    <Stars value={f.rating} />
                  </div>
                </div>
                <FeedbackStatusBadge status={f.status} />
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="py-14 text-center text-sm text-muted-foreground">
              No feedback matches these filters.
            </li>
          )}
        </ul>
      </section>

      <aside
        className="h-fit rounded-md border border-border bg-card p-5 shadow-elegant xl:sticky xl:top-24"
        aria-label="Feedback details"
      >
        {current ? (
          <>
            <div className="flex items-center justify-between">
              <p className="eyebrow">{current.id}</p>
              <FeedbackStatusBadge status={current.status} />
            </div>
            <h3 className="mt-2 font-display text-2xl">{current.category}</h3>
            <p className="text-xs text-muted-foreground">{fmtDateTime(current.createdAt)}</p>
            <div className="mt-4">
              <Stars value={current.rating} size={18} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="eyebrow">Guest</dt>
                <dd>{current.guestName || "Anonymous"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Room</dt>
                <dd>{current.roomNumber ?? "—"}</dd>
              </div>
            </dl>
            {current.reasons && current.reasons.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {current.reasons.map((r) => (
                  <span
                    key={r}
                    className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
            <blockquote className="mt-4 border-s-2 border-primary/60 ps-4 text-sm leading-relaxed text-foreground">
              {current.comment || (
                <em className="text-muted-foreground">The guest left no written comment.</em>
              )}
            </blockquote>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                disabled={current.status !== "New"}
                onClick={() => mark(current.id, "Reviewed")}
              >
                <Eye /> Mark reviewed
              </Button>
              <Button
                disabled={current.status === "Resolved"}
                onClick={() => mark(current.id, "Resolved")}
              >
                <CheckCheck /> Resolve
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <MessageSquareText className="h-6 w-6" /> Select feedback to see details.
          </div>
        )}
      </aside>
    </div>
  );
}
