import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Search, Check } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { CIRCLE_ROLES, NOTIFY_RULES } from "@/lib/constants";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/circle/add")({ component: AddToCircle });

function AddToCircle() {
  const { isApiConnected, refetchCircle } = useBridgeApi();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof CIRCLE_ROLES)[number]["value"]>("checkin_buddy");
  const [notify, setNotify] = useState<(typeof NOTIFY_RULES)[number]["value"]>("delayed_4h");
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const search = useQuery({
    queryKey: ["peers", q],
    queryFn: () => api.searchPeers(q.trim() || undefined),
    enabled: isApiConnected && q.length >= 2,
  });

  const invite = useMutation({
    mutationFn: (targetId: string) =>
      api.inviteToCircle({
        target_physician_id: targetId,
        role,
        notify_rule: notify,
      }),
    onSuccess: () => {
      setDone(true);
      refetchCircle();
    },
  });

  if (done) {
    return (
      <OuraPage className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="h-14 w-14 rounded-full bg-gold-soft flex items-center justify-center mb-4">
          <Check size={22} className="text-gold" />
        </div>
        <p className="text-xl font-semibold mb-2">Invite sent</p>
        <Link to="/circle" className="text-sm text-gold">
          Back to circle
        </Link>
      </OuraPage>
    );
  }

  return (
    <OuraPage>
      <Link to="/circle" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> Circle
      </Link>
      <p className="oura-label">Add</p>
      <h1 className="text-2xl font-semibold mt-1 mb-6">Invite a colleague</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (2+ chars)"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface-raised border border-border text-sm"
        />
      </div>

      <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto">
        {(search.data?.peers ?? []).map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setPicked(p.id)}
              className={`oura-metric-row w-full ${picked === p.id ? "border-gold/40" : ""}`}
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{p.displayName ?? "Physician"}</p>
                <p className="text-xs text-muted-foreground">{p.specialty ?? "—"}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <p className="oura-label mb-2">Role</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {CIRCLE_ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`oura-chip ${role === r.value ? "oura-chip-active" : ""}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <p className="oura-label mb-2">Notify</p>
      <div className="flex flex-col gap-2 mb-6">
        {NOTIFY_RULES.map((n) => (
          <button
            key={n.value}
            type="button"
            onClick={() => setNotify(n.value)}
            className={`oura-metric-row text-sm ${notify === n.value ? "border-gold/40" : ""}`}
          >
            {n.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!picked || !isApiConnected || invite.isPending}
        onClick={() => picked && invite.mutate(picked)}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        Send invite
      </button>
    </OuraPage>
  );
}
