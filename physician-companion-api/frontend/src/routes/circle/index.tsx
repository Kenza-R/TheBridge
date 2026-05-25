import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { useBridge } from "@/lib/bridge-store";
import { mapCircleFromApi } from "@/lib/circle-ui";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/circle/")({ component: Circle });

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

  const respond = useMutation({
    mutationFn: (args: { id: string; status: "accepted" | "declined" | "limited" }) =>
      api.respondCircleInvite(args.id, args.status),
    onSuccess: () => refetchCircle(),
  });

  const circle = isApiConnected
    ? apiCircle.filter((c) => c.status === "accepted").map(mapCircleFromApi)
    : mockCircle;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="oura-label">Circle</p>
        <h1 className="text-2xl font-semibold mt-1">Your people</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Loading…" : `${circle.length} trusted colleagues`}
        </p>
      </header>

      <Link
        to="/circle/launch"
        className="oura-card flex items-center gap-4 p-4 mb-6 active:scale-[0.99] transition"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
          <span className="text-lg">✦</span>
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

      <h2 className="oura-label mb-3 px-1">Members</h2>
      <ul className="space-y-2">
        {circle.map((m) => (
          <li key={m.id} className="oura-metric-row">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface text-sm font-medium">
              {m.initials}
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface-raised ${
                  m.available === "off" ? "bg-mint" : "bg-muted-foreground/50"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.specialty}</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gold font-medium">
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
    </AppShell>
  );
}
