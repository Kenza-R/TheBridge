import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { WEARABLE_OPTIONS } from "@/lib/constants";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/onboarding/wearables")({ component: Wearables });

function Wearables() {
  const navigate = useNavigate();
  const { isApiConnected, invalidateProfile } = useBridgeApi();
  const [picked, setPicked] = useState<string | null>(null);

  const finish = useMutation({
    mutationFn: async () => {
      if (isApiConnected) {
        await api.patchPhysicianMe({
          wearable_type: (picked ?? "none") as
            | "apple_watch"
            | "garmin"
            | "whoop"
            | "oura"
            | "fitbit"
            | "none",
          onboarding_done: true,
        });
      }
    },
    onSuccess: () => {
      invalidateProfile();
      navigate({ to: "/home" });
    },
  });

  return (
    <OuraPage className="pt-12">
      <p className="oura-label mb-6">Step 3 of 4</p>
      <h1 className="text-3xl font-semibold mb-2 tracking-tight">Link a wearable</h1>
      <p className="text-muted-foreground text-sm mb-8">Optional. Trends only — never raw biometrics.</p>

      <div className="oura-card p-4 mb-8 flex gap-3">
        <Lock size={16} className="text-gold mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Numbers stay on your device. Bridge only sees derived recovery patterns.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        {WEARABLE_OPTIONS.map((d) => {
          const on = picked === d.value;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => setPicked(on ? null : d.value)}
              className={`relative p-5 rounded-2xl border text-sm font-medium text-left transition ${
                on ? "bg-gold-soft border-gold/50" : "oura-card"
              }`}
            >
              {d.label}
              {on && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check size={12} className="text-background" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={finish.isPending}
        onClick={() => finish.mutate()}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        {finish.isPending ? "Saving…" : "Finish"}
      </button>
      <button
        type="button"
        disabled={finish.isPending}
        onClick={() => finish.mutate()}
        className="block w-full text-center mt-4 text-sm text-muted-foreground"
      >
        Skip for now
      </button>
    </OuraPage>
  );
}
