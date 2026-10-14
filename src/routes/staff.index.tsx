import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Building2, CalendarClock, Wrench, CalendarPlus } from "lucide-react";
import { AppShell } from "@/components/aifa/AppShell";
import { StatCard } from "@/components/aifa/StatCard";
import { RoomGrid } from "@/components/aifa/RoomGrid";
import { ReservationsTable } from "@/components/aifa/ReservationsTable";
import { useStaffUI } from "@/components/aifa/StaffUI";
import { Button } from "@/components/ui/button";
import { useHotel } from "@/lib/hotel/store";
import { roomCounts } from "@/lib/hotel/logic";

export const Route = createFileRoute("/staff/")({
  head: () => ({
    meta: [
      { title: "Reception Overview — AIFA Hotel" },
      {
        name: "description",
        content: "Live room status, arrivals and reservations at AIFA Hotel reception.",
      },
      { property: "og:title", content: "Reception Overview — AIFA Hotel" },
      {
        property: "og:description",
        content: "Live room status, arrivals and reservations.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { state } = useHotel();
  const ui = useStaffUI();
  const c = roomCounts(state);
  return (
    <AppShell
      title="Good day, welcome back"
      actions={
        <Button onClick={() => ui.openNew()}>
          <CalendarPlus /> New reservation
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total rooms"
          value={90}
          hint={`${c.available} available now`}
          icon={Building2}
        />
        <StatCard
          label="Occupied"
          value={c.occupied}
          hint={`${Math.round((c.occupied / 90) * 100)}% occupancy`}
          icon={BedDouble}
          accent="text-status-occupied"
        />
        <StatCard
          label="Expected arrivals"
          value={c.reserved}
          hint="Arriving today"
          icon={CalendarClock}
          accent="text-status-reserved"
        />
        <StatCard
          label="Maintenance"
          value={c.maintenance}
          hint="Out of service"
          icon={Wrench}
          accent="text-status-maintenance"
        />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.1fr_1fr]">
        <RoomGrid compact />
        <ReservationsTable limit={10} activeOnly title="Upcoming & in-house" />
      </div>
    </AppShell>
  );
}
