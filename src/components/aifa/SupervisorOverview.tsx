import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BedDouble, Building2, Coins, Percent, Star, AlertTriangle } from "lucide-react";
import { useHotel } from "@/lib/hotel/store";
import { averageRating, isLowRating, roomCounts } from "@/lib/hotel/logic";
import { fmtDate, fmtDateTime, nightsBetween } from "@/lib/hotel/dates";
import { cn } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { ROOM_STATUS, ResStatusBadge, Stars } from "./badges";
import type { RoomStatus } from "@/lib/hotel/types";

const PERIODS = {
  today: { label: "Today", days: 1 },
  week: { label: "Last 7 days", days: 7 },
  month: { label: "Last 30 days", days: 30 },
} as const;
type Period = keyof typeof PERIODS;
const HISTORY = [0.71, 0.68, 0.74, 0.79, 0.83, 0.77]; // mock occupancy of previous 6 days

export function SupervisorOverview() {
  const { state } = useHotel();
  const [period, setPeriod] = useState<Period>("week");
  const c = roomCounts(state);
  const occRate = c.occupied / 90;
  const inHouse = state.reservations
    .filter((r) => r.status === "Checked In")
    .reduce((s, r) => s + r.guests, 0);
  const rateOf = (n: number) => state.rooms.find((r) => r.number === n)!.rate;
  const nightly = state.reservations
    .filter((r) => r.status === "Checked In")
    .reduce((s, r) => s + rateOf(r.roomNumber), 0);
  // Demo revenue: today's live nightly revenue, extrapolated using mock history for longer periods.
  const avgHist = HISTORY.reduce((a, b) => a + b, 0) / HISTORY.length;
  const revenue =
    PERIODS[period].days === 1
      ? nightly
      : Math.round(
          nightly * (1 + (PERIODS[period].days - 1) * (avgHist / Math.max(occRate, 0.01))),
        );
  const avg = averageRating(state);
  const low = state.feedback.filter((f) => isLowRating(f) && f.status !== "Resolved");
  const chart = [...HISTORY, occRate];
  const days = chart.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (chart.length - 1 - i));
    return i === chart.length - 1 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" });
  });
  const recent = [...state.reservations]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.checkIn.localeCompare(a.checkIn))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-sm border border-status-reserved/40 bg-status-reserved/10 px-3 py-1.5 text-xs text-foreground">
          Financial figures are demonstration data only and do not represent real hotel accounting.
        </p>
        <div
          className="flex rounded-md border border-border p-0.5"
          role="group"
          aria-label="Revenue period"
        >
          {(Object.keys(PERIODS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PERIODS[p].label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total rooms" value={90} icon={Building2} />
        <StatCard
          label="Occupancy"
          value={`${Math.round(occRate * 100)}%`}
          hint={`${c.occupied} of 90 rooms`}
          icon={Percent}
          accent="text-status-occupied"
        />
        <StatCard
          label="In-house guests"
          value={inHouse}
          hint={`${c.occupied} occupied rooms`}
          icon={BedDouble}
        />
        <StatCard
          label="Revenue (demo)"
          value={`${(revenue / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })}K`}
          hint={`DZD · ${PERIODS[period].label}`}
          icon={Coins}
        />
        <StatCard
          label="Avg. rating"
          value={avg.toFixed(1)}
          hint={`${state.feedback.filter((f) => f.rating).length} rated stays`}
          icon={Star}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-md border border-border bg-card p-5 shadow-elegant">
          <p className="eyebrow">Occupancy · last 7 days</p>
          <h2 className="font-display text-2xl">Trend</h2>
          <div
            className="mt-6 flex h-48 items-end gap-3"
            role="img"
            aria-label="Occupancy bar chart"
          >
            {chart.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{Math.round(v * 100)}%</span>
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-500",
                    i === chart.length - 1
                      ? "bg-gold-gradient"
                      : "bg-elevated border border-border",
                  )}
                  style={{ height: `${v * 150}px` }}
                />
                <span
                  className={cn(
                    "text-xs",
                    i === chart.length - 1 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {days[i]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-md border border-border bg-card p-5 shadow-elegant">
          <p className="eyebrow">Right now</p>
          <h2 className="font-display text-2xl">Room status</h2>
          <ul className="mt-5 space-y-4">
            {(Object.keys(ROOM_STATUS) as RoomStatus[]).map((s) => (
              <li key={s}>
                <div className="flex justify-between text-sm">
                  <span>{ROOM_STATUS[s].label}</span>
                  <span className="font-medium">{c[s]}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-elevated">
                  <div
                    className={cn("h-full rounded-full", ROOM_STATUS[s].dot)}
                    style={{ width: `${(c[s] / 90) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-card p-5 shadow-elegant lg:col-span-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-reserved" />
            <h2 className="font-display text-2xl">Low-rating alerts</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {low.map((f) => (
              <li
                key={f.id}
                className="rounded-sm border border-border border-s-2 border-s-status-reserved p-3"
              >
                <div className="flex items-center justify-between">
                  <Stars value={f.rating} />
                  <span className="text-xs text-muted-foreground">
                    {f.roomNumber ? `Room ${f.roomNumber}` : "—"}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm">{f.comment || "No comment"}</p>
              </li>
            ))}
            {low.length === 0 && (
              <p className="text-sm text-muted-foreground">No open low-rating alerts.</p>
            )}
          </ul>
        </section>
        <section className="rounded-md border border-border bg-card p-5 shadow-elegant">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent feedback</h2>
            <Link to="/staff/feedback" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {state.feedback.slice(0, 5).map((f) => (
              <li key={f.id} className="py-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-primary">{f.category}</span>
                  <span>{fmtDateTime(f.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm">{f.comment || "No comment"}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md border border-border bg-card p-5 shadow-elegant">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent reservations</h2>
            <Link to="/staff/reservations" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{r.guestName}</span>
                  <span className="text-xs text-muted-foreground">
                    Room {r.roomNumber} · {fmtDate(r.checkIn)} ·{" "}
                    {nightsBetween(r.checkIn, r.checkOut)}n
                  </span>
                </span>
                <ResStatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
