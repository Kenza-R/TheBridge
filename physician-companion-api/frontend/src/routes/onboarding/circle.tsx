import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/onboarding/circle")({ component: BuildCircle });

function BuildCircle() {
  const navigate = useNavigate();
  const { isApiConnected, refetchCircle } = useBridgeApi();
  const [added, setAdded] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const search = useQuery({
    queryKey: ["peers", "onboarding", q],
    queryFn: () => api.searchPeers(q.trim() || undefined),
    enabled: isApiConnected,
  });

  const invite = useMutation({
    mutationFn: (targetId: string) =>
      api.inviteToCircle({
        target_physician_id: targetId,
        role: "checkin_buddy",
        notify_rule: "delayed_4h",
      }),
  });

  const suggestions = search.data?.peers ?? [];

  const toggle = async (id: string) => {
    if (added.includes(id)) {
      setAdded((a) => a.filter((x) => x !== id));
      return;
    }
    setAdded((a) => [...a, id]);
    if (isApiConnected) {
      try {
        await invite.mutateAsync(id);
        refetchCircle();
      } catch {
        setAdded((a) => a.filter((x) => x !== id));
      }
    }
  };

  return (
    <OuraPage className="pt-12">
      <p className="oura-label mb-6">Step 2 of 4</p>
      <h1 className="text-3xl font-semibold mb-2 leading-tight tracking-tight">
        Who do you trust?
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Invite 2–6 colleagues. They opt in — never auto-added.
      </p>

      {added.length >= 2 && (
        <div className="oura-card p-4 mb-6 border-gold/20">
          <p className="text-sm text-foreground/90">Your circle is taking shape.</p>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search colleagues"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface-raised border border-border text-sm focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
      </div>

      <ul className="space-y-2 mb-8 max-h-64 overflow-y-auto">
        {suggestions.map((s) => {
          const isAdded = added.includes(s.id);
          const ini =
            s.displayName
              ?.replace(/^Dr\.\s*/i, "")
              .split(" ")
              .map((p) => p[0])
              .join("") ?? "?";
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => void toggle(s.id)}
                className="oura-metric-row w-full active:opacity-80"
              >
                <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-xs font-medium">
                  {ini}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{s.displayName ?? "Physician"}</p>
                  <p className="text-xs text-muted-foreground">{s.specialty ?? "—"}</p>
                </div>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isAdded ? "bg-foreground text-background" : "border border-border"
                  }`}
                >
                  {isAdded ? <Check size={14} /> : <Plus size={14} className="text-muted-foreground" />}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => navigate({ to: "/onboarding/wearables" })}
        className="oura-btn oura-btn-primary"
      >
        Continue
      </button>
      <Link
        to="/onboarding/wearables"
        className="block text-center mt-4 text-sm text-muted-foreground"
      >
        Skip for now
      </Link>
    </OuraPage>
  );
}
