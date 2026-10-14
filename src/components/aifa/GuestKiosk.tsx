import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquareHeart,
  Star,
  LogOut,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useHotel } from "@/lib/hotel/store";
import { DICT, LANGS, type Lang } from "@/lib/hotel/i18n";
import type { FeedbackCategory } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

type Screen = "welcome" | "feedback" | "feedbackDone" | "rate" | "farewell";
type T = (typeof DICT)["en"];

const CATS = ["Service", "Cleanliness", "Comfort", "Facilities", "Other"] as const;
const REASONS = [
  "Room Cleanliness",
  "Staff Service",
  "Room Comfort",
  "Facilities",
  "Noise",
  "Other",
] as const;

const bigBtn =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-8 text-base font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const goldBtn = cn(
  bigBtn,
  "bg-gold-gradient text-primary-foreground shadow-gold hover:brightness-110",
);
const ghostBtn = cn(
  bigBtn,
  "border border-border text-foreground hover:border-primary/60 hover:bg-accent",
);

export function GuestKiosk() {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<Screen>("welcome");
  const t = DICT[lang];
  const rtl = lang === "ar";
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={lang}
      className="relative flex min-h-screen flex-col bg-background bg-hero-glow"
    >
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <BrandLogo size={44} />
          <span className="font-display text-xl tracking-[0.25em] text-gold-gradient">AIFA</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex rounded-md border border-border p-1"
            role="group"
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={cn(
                  "min-h-11 rounded-sm px-4 text-sm transition-colors",
                  lang === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link
            to="/"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
          >
            {t.staff}
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
        <div key={screen + lang} className="w-full max-w-3xl animate-fade-up">
          {screen === "welcome" && <Welcome t={t} go={setScreen} rtl={rtl} />}
          {screen === "feedback" && (
            <FeedbackForm
              t={t}
              onDone={() => setScreen("feedbackDone")}
              onBack={() => setScreen("welcome")}
              rtl={rtl}
            />
          )}
          {screen === "feedbackDone" && (
            <Done
              title={t.thanksFeedback}
              sub={t.thanksFeedbackSub}
              t={t}
              onHome={() => setScreen("welcome")}
            />
          )}
          {screen === "rate" && (
            <Rating
              t={t}
              onDone={() => setScreen("farewell")}
              onBack={() => setScreen("welcome")}
              rtl={rtl}
            />
          )}
          {screen === "farewell" && (
            <Done
              title={t.finalTitle}
              sub={t.finalSub}
              t={t}
              onHome={() => setScreen("welcome")}
              logo
            />
          )}
        </div>
      </main>
    </div>
  );
}

function BackBtn({ t, onClick, rtl }: { t: T; onClick: () => void; rtl: boolean }) {
  return (
    <button
      onClick={onClick}
      className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      {rtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />} {t.back}
    </button>
  );
}

function Welcome({ t, go, rtl }: { t: T; go: (s: Screen) => void; rtl: boolean }) {
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  return (
    <div className="text-center">
      <BrandLogo size={150} className="mx-auto shadow-gold" />
      <p className="mt-6 eyebrow">{t.tagline}</p>
      <h1 className="mt-4 font-display text-5xl font-medium sm:text-6xl">{t.welcome}</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t.welcomeSub}</p>
      <p className="mt-8 font-display text-2xl text-gold-soft">{t.assist}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{t.explain}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          {
            s: "feedback" as const,
            icon: MessageSquareHeart,
            title: t.shareFeedback,
            desc: t.shareFeedbackDesc,
          },
          {
            s: "rate" as const,
            icon: LogOut,
            title: t.checkoutRate,
            desc: t.checkoutRateDesc,
          },
        ].map((o) => (
          <button
            key={o.s}
            onClick={() => go(o.s)}
            className="group flex min-h-36 flex-col items-start justify-between rounded-md border border-border bg-card p-6 text-start shadow-elegant transition-all hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-gold"
          >
            <o.icon className="h-7 w-7 text-primary" />
            <span className="mt-6 w-full">
              <span className="flex items-center justify-between font-display text-2xl">
                {o.title}
                <Arrow className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackForm({
  t,
  onDone,
  onBack,
  rtl,
}: {
  t: T;
  onDone: () => void;
  onBack: () => void;
  rtl: boolean;
}) {
  const { dispatch } = useHotel();
  const [cat, setCat] = useState<FeedbackCategory | null>(null);
  const [msg, setMsg] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cat) return setErr(t.errCategory);
    if (msg.trim().length < 3) return setErr(t.errMessage);
    const n = room ? Number(room) : undefined;
    if (n !== undefined && (!Number.isInteger(n) || n < 1 || n > 90)) return setErr(t.errRoom);
    dispatch({
      type: "addFeedback",
      feedback: {
        category: cat,
        comment: msg.trim(),
        roomNumber: n,
        guestName: name.trim() || undefined,
      },
    });
    onDone();
  };
  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-md border border-border bg-card p-6 shadow-elegant sm:p-10"
    >
      <BackBtn t={t} onClick={onBack} rtl={rtl} />
      <h1 className="font-display text-4xl font-medium">{t.shareFeedback}</h1>
      <fieldset className="mt-8">
        <legend className="text-sm text-muted-foreground">{t.category}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => {
                setCat(c);
                setErr(null);
              }}
              aria-pressed={cat === c}
              className={cn(
                "min-h-12 rounded-md border px-5 text-base transition-colors",
                cat === c
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {t.cats[c]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-6 block">
        <span className="text-sm text-muted-foreground">{t.message}</span>
        <textarea
          value={msg}
          onChange={(e) => {
            setMsg(e.target.value);
            setErr(null);
          }}
          placeholder={t.messagePh}
          rows={5}
          className="mt-2 w-full rounded-md border border-input bg-background p-4 text-base text-foreground focus:border-ring focus:outline-none"
        />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted-foreground">{t.roomOpt}</span>
          <input
            inputMode="numeric"
            value={room}
            onChange={(e) => setRoom(e.target.value.replace(/\D/g, ""))}
            className="field mt-2 h-12 text-base"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">{t.nameOpt}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-2 h-12 text-base"
          />
        </label>
      </div>
      {err && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-status-maintenance/50 bg-status-maintenance/10 px-4 py-3 text-sm"
        >
          {err}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onBack} className={ghostBtn}>
          {t.cancel}
        </button>
        <button type="submit" className={goldBtn}>
          {t.submitFeedback}
        </button>
      </div>
    </form>
  );
}

function Rating({
  t,
  onDone,
  onBack,
  rtl,
}: {
  t: T;
  onDone: () => void;
  onBack: () => void;
  rtl: boolean;
}) {
  const { dispatch } = useHotel();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const low = rating > 0 && rating <= 3;
  const submit = () => {
    if (rating || comment.trim()) {
      dispatch({
        type: "addFeedback",
        feedback: {
          category: "Check-Out Rating",
          rating: rating || undefined,
          reasons: low && reasons.length ? reasons : undefined,
          comment: comment.trim(),
        },
      });
    }
    onDone();
  };
  const toggle = (r: string) =>
    setReasons((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]));
  return (
    <div className="rounded-md border border-border bg-card p-6 text-center shadow-elegant sm:p-10">
      <div className="text-start">
        <BackBtn t={t} onClick={onBack} rtl={rtl} />
      </div>
      <h1 className="font-display text-4xl font-medium sm:text-5xl">{t.farewellTitle}</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t.farewellIntro}</p>
      <p className="mt-8 text-sm text-muted-foreground">{t.rateLabel}</p>
      <div
        className="mt-3 flex justify-center gap-2"
        role="radiogroup"
        aria-label={t.rateLabel}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={rating === n}
            aria-label={t.stars(n)}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="flex h-16 w-16 items-center justify-center rounded-md transition-transform hover:scale-110 sm:h-20 sm:w-20"
          >
            <Star
              className={cn(
                "h-11 w-11 transition-colors sm:h-14 sm:w-14",
                n <= (hover || rating) ? "fill-primary text-primary" : "text-border",
              )}
              strokeWidth={1.25}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <div className="mt-8 text-start animate-fade-up">
          <p className="rounded-md border border-border bg-background/50 p-4 text-center text-foreground">
            {low ? t.lowMsg : t.highMsg}
          </p>
          {low && (
            <fieldset className="mt-6">
              <legend className="text-sm text-muted-foreground">{t.reasonsLabel}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggle(r)}
                    aria-pressed={reasons.includes(r)}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 rounded-md border px-4 text-sm transition-colors",
                      reasons.includes(r)
                        ? "border-primary bg-primary/15"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {reasons.includes(r) && <Check className="h-4 w-4 text-primary" />}
                    {t.reasons[r]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <label className="mt-6 block">
            <span className="text-sm text-muted-foreground">{t.commentOpt}</span>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background p-4 text-base focus:border-ring focus:outline-none"
            />
          </label>
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={rating ? onBack : submit} className={ghostBtn}>
          {rating ? t.cancel : t.skip}
        </button>
        <button onClick={submit} disabled={!rating} className={goldBtn}>
          {t.submit}
        </button>
      </div>
    </div>
  );
}

function Done({
  title,
  sub,
  t,
  onHome,
  logo,
}: {
  title: string;
  sub: string;
  t: T;
  onHome: () => void;
  logo?: boolean;
}) {
  return (
    <div className="text-center">
      {logo ? (
        <BrandLogo size={160} className="mx-auto shadow-gold" />
      ) : (
        <CheckCircle2 className="mx-auto h-16 w-16 text-primary" strokeWidth={1.25} />
      )}
      <h1 className="mt-8 font-display text-5xl font-medium">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">{sub}</p>
      {logo && <p className="mt-6 eyebrow">{t.tagline}</p>}
      <button onClick={onHome} className={cn(goldBtn, "mt-10")}>
        {t.home}
      </button>
    </div>
  );
}
