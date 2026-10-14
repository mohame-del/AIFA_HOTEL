import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, UserCog } from "lucide-react";
import { AppShell, DemoResetDialog } from "@/components/aifa/AppShell";
import { Button } from "@/components/ui/button";
import { useHotel } from "@/lib/hotel/store";
import type { Role } from "@/lib/hotel/types";

export const Route = createFileRoute("/staff/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AIFA Hotel" },
      {
        name: "description",
        content: "Demo role and data settings for the AIFA prototype.",
      },
      { property: "og:title", content: "Settings — AIFA Hotel" },
      { property: "og:description", content: "Demo role and data settings." },
    ],
  }),
  component: Page,
});

function Page() {
  const { state, dispatch } = useHotel();
  const navigate = useNavigate();
  const [reset, setReset] = useState(false);
  const switchTo = (role: Role) => {
    dispatch({ type: "login", role });
    navigate({ to: role === "supervisor" ? "/staff/supervisor" : "/staff" });
  };
  return (
    <AppShell title="Settings">
      <div className="grid max-w-3xl gap-5">
        <section className="rounded-md border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl">Demo role</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as{" "}
            <span className="text-foreground">
              {state.role === "supervisor" ? "Supervisor" : "Receptionist"}
            </span>
            . Role switching is a frontend simulation only.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant={state.role === "receptionist" ? "default" : "outline"}
              onClick={() => switchTo("receptionist")}
            >
              Receptionist
            </Button>
            <Button
              variant={state.role === "supervisor" ? "default" : "outline"}
              onClick={() => switchTo("supervisor")}
            >
              Supervisor
            </Button>
          </div>
        </section>
        <section className="rounded-md border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl">Demo data</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Restore all rooms, reservations and feedback to the original seeded state.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => setReset(true)}>
            <RotateCcw /> Reset demo
          </Button>
        </section>
      </div>
      <DemoResetDialog open={reset} onOpenChange={setReset} />
    </AppShell>
  );
}
