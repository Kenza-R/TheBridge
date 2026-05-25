import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Calendar,
  ChevronRight,
  Coffee,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  Footprints,
} from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { MiniResilienceRing } from "@/components/bridge/MiniResilienceRing";
import { useBridge } from "@/lib/bridge-store";
import {
  enrichCircleMember,
  getCoffeeBreakPrompts,
  UPCOMING_SOCIAL,
  type CircleMemberView,
} from "@/lib/circle-data";
import { mapCircleFromApi } from "@/lib/circle-ui";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/circle/")({ component: Circle });

const eventIcons = {
  dinner: UtensilsCrossed,
  coffee: Coffee,
  walk: Footprints,
} as const;

function Circle() {
  const { circle: mockCircle } = useBridge();
  const {
    circle: apiCircle,
    incomingInvites,
    pendingOutgoing,
    isApiConnected,
    isLoading,
    refetchCircle,
  } = useBridgeApi();

  const [dismissedCoffee, setDismissedCoffee] = useState<string[]>([]);
  const [acceptedCoffee, setAcceptedCoffee] = useState<string | null>(null);

  const respond = useMutation({
    mutationFn: (args: { id: string; status: "accepted" | "declined" | "limited" }) =>
      api.respondCircleInvite(args.id, args.status),
    onSuccess: () => refetchCircle(),
  });

  const circle: CircleMemberView[] = isApiConnected
    ? apiCircle.filter((c) => c.status === "accepted").map(mapCircleFromApi)
    : mockCircle.map(enrichCircleMember);

  const coffeePrompts = getCoffeeBreakPrompts(circle).filter(
    (p) => !dismissedCoffee.includes(p.id),
  );

  const avgResilience =
    circle.length > 0
      ? Math.round(circle.reduce((s, m) => s + m.resilienceScore, 0) / circle.length)
      : null;

  return (
    <AppShell>
      <header className="mb-5">
        <p className="oura-label">Circle</p>
        <h1 className="text-2xl font-semibold mt-1">Your people</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading
            ? "Loading…"
            : `${circle.length} colleagues · shared resilience scores`}
        </p>
      </header>

      {avgResilience != null && circle.length > 0 && (
        <section className="oura-card p-4 mb-5 flex items-center gap-4">
          <MiniResilienceRing score={avgResilience} size={56} />
          <div>
            <p className="text-sm font-medium">Circle resilience</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Average of scores peers chose to share with you
            </p>
          </div>
        </section>
      )}

      {coffeePrompts.map((p) => (
        <section key={p.id} className="oura-card p-4 mb-4 border border-mint/20">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/15 text-sm font-medium">
              {p.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Coffee break?</p>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedCoffee === p.id
                  ? `You’re set — meet ${p.memberName} at ${p.location}`
                  : `Take a coffee with ${p.memberName} in ${Math.floor(p.inMinutes / 60)}h ${p.inMinutes % 60}m · ${p.location}`}
              </p>
            </div>
            <Coffee size={18} className="text-mint shrink-0" />
          </div>
          {acceptedCoffee !== p.id && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setAcceptedCoffee(p.id)}
                className="oura-btn oura-btn-primary flex-1 py-2.5 text-sm"
              >
                Yes, I’m in
              </button>
              <button
                type="button"
                onClick={() => setDismissedCoffee((d) => [...d, p.id])}
                className="oura-btn oura-btn-secondary flex-1 py-2.5 text-sm"
              >
                Not now
              </button>
            </div>
          )}
        </section>
      ))}

      <section className="mb-6">
        <h2 className="oura-label mb-3 px-1 flex items-center gap-2">
          <Calendar size={14} className="text-gold" />
          Upcoming with your circle
        </h2>
        <ul className="space-y-2">
          {UPCOMING_SOCIAL.map((ev) => {
            const Icon = eventIcons[ev.icon];
            return (
              <li key={ev.id} className="oura-card p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
                    <Icon size={18} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{ev.detail}</p>
                    <p className="text-xs text-gold mt-1">{ev.when}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      With {ev.withNames.join(", ")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Link
        to="/circle/launch"
        className="oura-card flex items-center gap-4 p-4 mb-6 active:scale-[0.99] transition"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
          <Sparkles size={20} className="text-gold" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="font-medium">Reach out</p>
          <p className="text-xs text-muted-foreground">Private note · 30-day retention</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </Link>

      {incomingInvites.length > 0 && (
        <section className="mb-6 space-y-2">
          <h2 className="oura-label px-1">Invitations</h2>
          {incomingInvites.map((inv) => (
            <div key={inv.id} className="oura-card p-4">
              <p className="text-sm font-medium">
                {inv.owner?.displayName ?? "A colleague"} invited you
              </p>
              <p className="text-xs text-muted-foreground mb-3 capitalize">
                {inv.role.replace(/_/g, " ")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: inv.id, status: "accepted" })}
                  className="oura-btn oura-btn-primary flex-1 py-2.5 text-sm"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: inv.id, status: "declined" })}
                  className="oura-btn oura-btn-secondary flex-1 py-2.5 text-sm"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {pendingOutgoing.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4 px-1">
          {pendingOutgoing.length} pending invite(s)
        </p>
      )}

      <h2 className="oura-label mb-3 px-1">Resilience in your circle</h2>
      <ul className="space-y-2 mb-2">
        {circle.map((m) => (
          <li key={m.id} className="oura-metric-row py-3">
            <MiniResilienceRing score={m.resilienceScore} size={48} />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface text-xs font-medium -ml-1 border-2 border-surface-raised">
              {m.initials}
              <span
                className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-surface-raised ${
                  m.available === "off" ? "bg-mint" : "bg-muted-foreground/50"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {m.specialty}
                {m.trend === "up" && (
                  <TrendingUp size={12} className="text-mint inline" aria-label="Improving" />
                )}
                {m.trend === "down" && (
                  <TrendingDown size={12} className="text-gold inline" aria-label="Needs care" />
                )}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gold font-medium text-right max-w-[4.5rem] leading-tight">
              {m.role}
            </span>
          </li>
        ))}

        <li>
          <Link
            to="/circle/add"
            className="oura-metric-row justify-center gap-2 text-muted-foreground border-dashed"
          >
            <Plus size={18} />
            <span className="text-sm">Add someone</span>
          </Link>
        </li>
      </ul>

      <p className="text-[10px] text-muted-foreground px-1 mb-6">
        Scores are wellbeing indices (higher = more resilient). Peers control what they share.
      </p>
    </AppShell>
  );
}
