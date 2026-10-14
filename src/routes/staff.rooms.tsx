import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/aifa/AppShell";
import { RoomGrid } from "@/components/aifa/RoomGrid";

export const Route = createFileRoute("/staff/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — AIFA Hotel" },
      {
        name: "description",
        content: "All 90 AIFA Hotel rooms with live status.",
      },
      { property: "og:title", content: "Rooms — AIFA Hotel" },
      { property: "og:description", content: "All 90 rooms with live status." },
    ],
  }),
  component: () => (
    <AppShell title="Rooms" eyebrow="90 rooms · 5 categories">
      <RoomGrid />
    </AppShell>
  ),
});
