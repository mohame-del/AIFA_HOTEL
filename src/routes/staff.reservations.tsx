import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/aifa/AppShell";
import { ReservationsTable } from "@/components/aifa/ReservationsTable";

export const Route = createFileRoute("/staff/reservations")({
  validateSearch: (s: Record<string, unknown>): { q?: string } =>
    typeof s["q"] === "string" ? { q: s["q"] as string } : {},
  head: () => ({
    meta: [
      { title: "Reservations — AIFA Hotel" },
      {
        name: "description",
        content: "Search, create and manage AIFA Hotel reservations.",
      },
      { property: "og:title", content: "Reservations — AIFA Hotel" },
      {
        property: "og:description",
        content: "Search, create and manage reservations.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  return (
    <AppShell title="Reservations">
      <ReservationsTable key={q ?? ""} initialQuery={q ?? ""} title="All reservations" />
    </AppShell>
  );
}
