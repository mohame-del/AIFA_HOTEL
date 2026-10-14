import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/aifa/AppShell";
import { SupervisorOverview } from "@/components/aifa/SupervisorOverview";
import { useHotel } from "@/lib/hotel/store";

export const Route = createFileRoute("/staff/supervisor")({
  head: () => ({
    meta: [
      { title: "Supervisor Overview — AIFA Hotel" },
      {
        name: "description",
        content: "Occupancy, demo revenue, ratings and guest alerts for AIFA management.",
      },
      { property: "og:title", content: "Supervisor Overview — AIFA Hotel" },
      {
        property: "og:description",
        content: "Occupancy, demo revenue, ratings and alerts.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { state } = useHotel();
  return (
    <AppShell title="Supervisor Overview">
      {state.role === "supervisor" ? (
        <SupervisorOverview />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <p className="font-display text-2xl">Supervisor access only</p>
          <p className="text-sm text-muted-foreground">
            Switch to the Supervisor demo account to view this page.
          </p>
          <Link to="/staff" className="text-sm text-primary hover:underline">
            Back to overview
          </Link>
        </div>
      )}
    </AppShell>
  );
}
