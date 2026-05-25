import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Lock } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { WEARABLE_OPTIONS } from "@/lib/constants";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/settings/data-sources")({
  component: DataSourcesSettings,
});

function DataSourcesSettings() {
  const { profile, isApiConnected, invalidateProfile } = useBridgeApi();
  const [selected, setSelected] = useState<string | null>(profile?.wearableType ?? null);

  const save = useMutation({
    mutationFn: (wearable: string | null) =>
      api.patchPhysicianMe({
        wearable_type: (wearable ?? "none") as "apple_watch" | "garmin" | "whoop" | "oura" | "fitbit" | "none",
      }),
    onSuccess: () => invalidateProfile(),
  });

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>
      <p className="oura-label">Privacy</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Data sources</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Wearable trends are computed on your device — only scores sync to Bridge.
      </p>

      <div className="oura-card p-4 mb-6 flex gap-3">
        <Lock size={16} className="text-gold mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Raw biometrics never leave your phone. EHR metadata (when connected) uses timing only — no
          patient charts.
        </p>
      </div>

      <ul className="space-y-2 mb-6">
        <li className="oura-metric-row text-sm justify-between">
          <span className="text-muted-foreground">Self-report</span>
          <span className="text-mint">On</span>
        </li>
        <li className="oura-metric-row text-sm justify-between">
          <span className="text-muted-foreground">EHR workflow</span>
          <span className="float-right text-muted-foreground">Epic (when linked)</span>
        </li>
      </ul>

      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Wearable</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {WEARABLE_OPTIONS.map((d) => {
          const on = selected === d.value;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelected(on ? null : d.value)}
              className={`p-4 rounded-2xl border text-sm text-left ${
                on ? "bg-gold-soft border-gold/40" : "oura-card"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!isApiConnected || save.isPending}
        onClick={() => save.mutate(selected)}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        Save wearable
      </button>
    </OuraPage>
  );
}
