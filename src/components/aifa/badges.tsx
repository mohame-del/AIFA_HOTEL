import { BedDouble, CalendarClock, CircleCheck, Wrench, Star, AlertTriangle } from "lucide-react";
import type { FeedbackStatus, ReservationStatus, RoomStatus } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const ROOM_STATUS: Record<
  RoomStatus,
  {
    label: string;
    icon: typeof BedDouble;
    tile: string;
    dot: string;
    text: string;
  }
> = {
  available: {
    label: "Available",
    icon: CircleCheck,
    tile: "bg-status-available text-primary-foreground border-status-available",
    dot: "bg-status-available",
    text: "text-status-available",
  },
  occupied: {
    label: "Occupied",
    icon: BedDouble,
    tile: "bg-status-occupied text-foreground border-status-occupied",
    dot: "bg-status-occupied",
    text: "text-status-occupied",
  },
  reserved: {
    label: "Expected Arrival",
    icon: CalendarClock,
    tile: "bg-status-reserved text-primary-foreground border-status-reserved",
    dot: "bg-status-reserved",
    text: "text-status-reserved",
  },
  maintenance: {
    label: "Out of Service",
    icon: Wrench,
    tile: "bg-status-maintenance text-foreground border-status-maintenance",
    dot: "bg-status-maintenance",
    text: "text-status-maintenance",
  },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const s = ROOM_STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-elevated px-2 py-0.5 text-xs font-medium",
        s.text,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
    </span>
  );
}

const RES_TONE: Record<ReservationStatus, string> = {
  Confirmed: "text-gold-soft",
  "Expected Arrival": "text-status-reserved",
  "Checked In": "text-status-occupied",
  "Checked Out": "text-muted-foreground",
  Cancelled: "text-status-maintenance",
};
export function ResStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-border bg-elevated px-2 py-0.5 text-xs font-medium",
        RES_TONE[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

const FB_TONE: Record<FeedbackStatus, string> = {
  New: "text-primary",
  Reviewed: "text-status-reserved",
  Resolved: "text-status-occupied",
};
export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-elevated px-2 py-0.5 text-xs font-medium",
        FB_TONE[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function Stars({ value, size = 14 }: { value?: number | undefined; size?: number }) {
  if (!value) return <span className="text-xs text-muted-foreground">No rating</span>;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= value ? "fill-primary text-primary" : "text-border"}
          aria-hidden
        />
      ))}
      {value <= 3 && (
        <AlertTriangle className="ms-1 h-3.5 w-3.5 text-status-reserved" aria-label="Low rating" />
      )}
    </span>
  );
}
