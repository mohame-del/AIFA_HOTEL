import { useMemo, useState } from "react";
import { ArrowUpDown, CalendarPlus, LogIn, LogOut, Search, Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHotel } from "@/lib/hotel/store";
import type { ReservationStatus } from "@/lib/hotel/types";
import { fmtDate, nightsBetween, todayISO } from "@/lib/hotel/dates";
import { ResStatusBadge } from "./badges";
import { useStaffUI } from "./StaffUI";

const STATUSES: ReservationStatus[] = [
  "Confirmed",
  "Expected Arrival",
  "Checked In",
  "Checked Out",
  "Cancelled",
];

export function ReservationsTable({
  limit,
  initialQuery = "",
  title = "Reservations",
  activeOnly = false,
}: {
  limit?: number;
  initialQuery?: string;
  title?: string;
  activeOnly?: boolean;
}) {
  const { state } = useHotel();
  const ui = useStaffUI();
  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [sort, setSort] = useState<"arrival" | "room">("arrival");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = state.reservations.filter(
      (r) =>
        (!activeOnly ||
          r.status === "Expected Arrival" ||
          r.status === "Checked In" ||
          r.status === "Confirmed") &&
        (status === "all" || r.status === status) &&
        (!term ||
          r.guestName.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term) ||
          String(r.roomNumber) === term),
    );
    list.sort((a, b) =>
      sort === "arrival"
        ? a.checkIn.localeCompare(b.checkIn) || a.roomNumber - b.roomNumber
        : a.roomNumber - b.roomNumber,
    );
    return limit ? list.slice(0, limit) : list;
  }, [state.reservations, q, status, sort, limit, activeOnly]);

  return (
    <section
      className="rounded-md border border-border bg-card shadow-elegant"
      aria-labelledby="res-h"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <p className="eyebrow">Front desk</p>
          <h2 id="res-h" className="font-display text-2xl font-medium">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search reservations</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              className="field w-56 ps-9"
              placeholder="Guest, reference or room"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              className="field w-44"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReservationStatus | "all")}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            onClick={() => setSort(sort === "arrival" ? "room" : "arrival")}
            aria-label="Toggle sort"
          >
            <ArrowUpDown /> {sort === "arrival" ? "By arrival" : "By room"}
          </Button>
          <Button onClick={() => ui.openNew()}>
            <CalendarPlus /> New reservation
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-y border-border text-start text-xs uppercase tracking-wider text-muted-foreground">
              {["Guest", "Reference", "Room", "Check-in", "Check-out", "Nights", "Status", ""].map(
                (h) => (
                  <th key={h} className="px-5 py-3 text-start font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const canIn =
                r.status === "Expected Arrival" ||
                (r.status === "Confirmed" && r.checkIn <= todayISO());
              return (
                <tr
                  key={r.id}
                  className="border-b border-border/60 transition-colors hover:bg-elevated/60"
                >
                  <td className="px-5 py-3 font-medium">{r.guestName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.id}</td>
                  <td className="px-5 py-3">
                    <button
                      className="font-display text-lg text-primary hover:underline"
                      onClick={() => ui.openRoom(r.roomNumber)}
                    >
                      {r.roomNumber}
                    </button>
                  </td>
                  <td className="px-5 py-3">{fmtDate(r.checkIn)}</td>
                  <td className="px-5 py-3">{fmtDate(r.checkOut)}</td>
                  <td className="px-5 py-3">{nightsBetween(r.checkIn, r.checkOut)}</td>
                  <td className="px-5 py-3">
                    <ResStatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      {canIn && (
                        <Button size="sm" variant="outline" onClick={() => ui.openCheckIn(r.id)}>
                          <LogIn /> Check in
                        </Button>
                      )}
                      {r.status === "Checked In" && (
                        <Button size="sm" variant="outline" onClick={() => ui.openCheckOut(r.id)}>
                          <LogOut /> Check out
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`View ${r.id}`}
                        onClick={() => ui.openReservation(r.id)}
                      >
                        <Eye />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
            <Inbox className="h-6 w-6" />
            <p className="text-sm">No reservations match your search.</p>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
