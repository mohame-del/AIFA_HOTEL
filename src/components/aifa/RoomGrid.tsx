import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { useHotel } from "@/lib/hotel/store";
import type { RoomStatus } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";
import { ROOM_STATUS } from "./badges";
import { useStaffUI } from "./StaffUI";
import { roomCounts } from "@/lib/hotel/logic";

export function RoomStatusLegend() {
  const { state } = useHotel();
  const c = roomCounts(state);
  return (
    <ul
      className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
      aria-label="Room status legend"
    >
      {(Object.keys(ROOM_STATUS) as RoomStatus[]).map((s) => (
        <li key={s} className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-[2px]", ROOM_STATUS[s].dot)} aria-hidden />
          {ROOM_STATUS[s].label} <span className="text-foreground">{c[s]}</span>
        </li>
      ))}
    </ul>
  );
}

export function RoomGrid({ compact = false }: { compact?: boolean }) {
  const { state } = useHotel();
  const { openRoom } = useStaffUI();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [selected, setSelected] = useState<number | null>(null);

  const rooms = useMemo(
    () =>
      state.rooms.filter(
        (r) =>
          (status === "all" || r.status === status) && (!q || String(r.number).includes(q.trim())),
      ),
    [state.rooms, q, status],
  );

  return (
    <section
      className="rounded-md border border-border bg-card p-5 shadow-elegant"
      aria-labelledby="rooms-h"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Floor plan</p>
          <h2 id="rooms-h" className="font-display text-2xl font-medium">
            Room Overview
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search room number</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              className="field w-36 ps-9"
              inputMode="numeric"
              placeholder="Room no."
              value={q}
              onChange={(e) => setQ(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              className="field w-44"
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
            >
              <option value="all">All rooms (90)</option>
              {(Object.keys(ROOM_STATUS) as RoomStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ROOM_STATUS[s].label}
                </option>
              ))}
            </select>
          </label>
          {(q || status !== "all") && (
            <button
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm text-primary hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
      <div className="mt-4">
        <RoomStatusLegend />
      </div>

      {rooms.length === 0 ? (
        <p className="mt-8 py-10 text-center text-sm text-muted-foreground">
          No rooms match these filters.
        </p>
      ) : (
        <ul
          className={cn(
            "mt-5 grid gap-2",
            compact
              ? "grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))]"
              : "grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))]",
          )}
        >
          {rooms.map((r) => {
            const s = ROOM_STATUS[r.status];
            const Icon = s.icon;
            return (
              <li key={r.number}>
                <button
                  onClick={() => {
                    setSelected(r.number);
                    openRoom(r.number);
                  }}
                  aria-label={`Room ${r.number}, ${s.label}`}
                  className={cn(
                    "group relative flex aspect-square w-full flex-col items-center justify-center rounded-sm border text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110",
                    s.tile,
                    selected === r.number && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                  )}
                >
                  <span
                    className={cn("font-display leading-none", compact ? "text-lg" : "text-2xl")}
                  >
                    {r.number}
                  </span>
                  <Icon
                    className={cn("mt-1 opacity-70", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
