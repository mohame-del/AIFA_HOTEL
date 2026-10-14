import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Tablet,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHotel } from "@/lib/hotel/store";
import { fmtLongToday } from "@/lib/hotel/dates";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { useStaffUI } from "./StaffUI";

const NAV = [
  { to: "/staff", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/staff/rooms", label: "Rooms", icon: BedDouble },
  { to: "/staff/reservations", label: "Reservations", icon: CalendarDays },
  { to: "/staff/feedback", label: "Guest Feedback", icon: MessageSquareText },
  {
    to: "/staff/supervisor",
    label: "Supervisor",
    icon: ShieldCheck,
    supervisor: true,
  },
  { to: "/staff/settings", label: "Settings", icon: Settings },
] as const;

export function DemoResetDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { dispatch } = useHotel();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-3xl font-medium">
            Reset the demo?
          </AlertDialogTitle>
          <AlertDialogDescription>
            All rooms, reservations and feedback will return to their original demo state. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep current data</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              dispatch({ type: "reset" });
              toast.success("Demo data restored");
            }}
          >
            Reset demo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AppShell({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { state, dispatch } = useHotel();
  const ui = useStaffUI();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [reset, setReset] = useState(false);
  const [mobile, setMobile] = useState(false);
  const newCount = state.feedback.filter((f) => f.status === "New").length;
  const isSup = state.role === "supervisor";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    const n = Number(t);
    if (Number.isInteger(n) && n >= 1 && n <= 90) ui.openRoom(n);
    else navigate({ to: "/staff/reservations", search: { q: t } });
    setQ("");
  };

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Main">
      <div className="flex items-center gap-3 px-5 py-6">
        <BrandLogo size={42} />
        <div>
          <p className="font-display text-xl tracking-[0.2em] text-gold-gradient">AIFA</p>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            Hotel Operations
          </p>
        </div>
      </div>
      <ul className="mt-2 flex-1 space-y-0.5 px-3">
        {NAV.filter((n) => !("supervisor" in n) || isSup).map((n) => (
          <li key={n.to}>
            <Link
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              onClick={() => setMobile(false)}
              className="group flex items-center gap-3 rounded-sm border-s-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:border-primary data-[status=active]:bg-accent data-[status=active]:text-foreground"
            >
              <n.icon className="h-4 w-4 group-data-[status=active]:text-primary" aria-hidden />
              {n.label}
              {n.to === "/staff/feedback" && newCount > 0 && (
                <span className="ms-auto rounded-sm bg-primary/15 px-1.5 text-xs text-primary">
                  {newCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          to="/guest"
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Tablet className="h-4 w-4" /> Open guest kiosk
        </Link>
        <button
          onClick={() => setReset(true)}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Reset demo
        </button>
        <button
          onClick={() => {
            dispatch({ type: "logout" });
            navigate({ to: "/" });
          }}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Switch role
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 border-e border-border bg-sidebar lg:block">
        {sidebar}
      </aside>
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          />
          <aside className="relative h-full w-64 border-e border-border bg-sidebar animate-in slide-in-from-left">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:ps-60">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button
              className="rounded-sm p-2 hover:bg-accent lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
            >
              {mobile ? <X /> : <Menu className="h-5 w-5" />}
            </button>
            <form onSubmit={onSearch} className="relative max-w-sm flex-1">
              <label htmlFor="global-search" className="sr-only">
                Search rooms or guests
              </label>
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="global-search"
                className="field ps-9"
                placeholder="Room number or guest name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
            <div className="ms-auto flex items-center gap-4">
              <Link
                to="/staff/feedback"
                className="relative rounded-sm p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`${newCount} new feedback`}
              >
                <Bell className="h-5 w-5" />
                {newCount > 0 && (
                  <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
              <div className="flex items-center gap-3 border-s border-border ps-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/50 font-display text-primary">
                  {isSup ? "SB" : "LM"}
                </div>
                <div className="hidden text-sm sm:block">
                  <p className="leading-tight">{isSup ? "Samir Benamar" : "Lina Mekki"}</p>
                  <p className="text-xs text-primary">{isSup ? "Supervisor" : "Receptionist"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
            <div>
              <p className="eyebrow">{eyebrow ?? fmtLongToday()}</p>
              <h1 className="mt-1 font-display text-4xl font-medium sm:text-5xl">{title}</h1>
            </div>
            {actions}
          </div>
          <div className={cn("animate-fade-up")}>{children}</div>
        </main>
      </div>
      <DemoResetDialog open={reset} onOpenChange={setReset} />
    </div>
  );
}
