import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ConciergeBell, ShieldCheck, Tablet, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/aifa/BrandLogo";
import { useHotel } from "@/lib/hotel/store";
import type { Role } from "@/lib/hotel/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIFA Hotel — Staff Sign In" },
      {
        name: "description",
        content:
          "AIFA Hotel management prototype: reception, supervisor and guest kiosk experiences.",
      },
      {
        property: "og:title",
        content: "AIFA Hotel — Where Luxury Meets Comfort",
      },
      {
        property: "og:description",
        content: "Interactive hotel management prototype for AIFA Hotel.",
      },
    ],
  }),
  component: Login,
});

const ACCOUNTS: {
  role: Role;
  name: string;
  title: string;
  desc: string;
  icon: typeof ShieldCheck;
}[] = [
  {
    role: "receptionist",
    name: "Lina Mekki",
    title: "Receptionist",
    desc: "Rooms, reservations, check-in & check-out, guest feedback.",
    icon: ConciergeBell,
  },
  {
    role: "supervisor",
    name: "Samir Benamar",
    title: "Supervisor",
    desc: "Everything at reception plus occupancy, revenue and ratings overview.",
    icon: ShieldCheck,
  },
];

function Login() {
  const { dispatch } = useHotel();
  const navigate = useNavigate();
  const signIn = (role: Role) => {
    dispatch({ type: "login", role });
    navigate({ to: role === "supervisor" ? "/staff/supervisor" : "/staff" });
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background bg-hero-glow px-6 py-12">
      <div className="w-full max-w-3xl text-center animate-fade-up">
        <BrandLogo size={128} className="mx-auto shadow-gold" />
        <p className="mt-6 eyebrow">Where Luxury Meets Comfort</p>
        <h1 className="mt-3 font-display text-5xl font-medium">AIFA Hotel Operations</h1>
        <p className="mt-3 text-muted-foreground">Choose a demo account to continue.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ACCOUNTS.map((a) => (
            <button
              key={a.role}
              onClick={() => signIn(a.role)}
              className="group rounded-md border border-border bg-card p-6 text-start shadow-elegant transition-all hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-gold"
            >
              <div className="flex items-center justify-between">
                <a.icon className="h-6 w-6 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-6 font-display text-3xl">{a.title}</p>
              <p className="text-sm text-gold-soft">{a.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>

        <Link
          to="/guest"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <Tablet className="h-4 w-4 text-primary" /> Open the guest kiosk
        </Link>
        <p className="mt-10 text-xs text-muted-foreground">
          Demonstration prototype · simulated sign-in, no real security · all data is fictional
        </p>
      </div>
    </div>
  );
}
