import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/settings/thresholds")({ component: ThresholdSettings });

function ThresholdSettings() {
  const { profile, isApiConnected, invalidateProfile } = useBridgeApi();
  const [sustainedDays, setSustainedDays] = useState(3);
  const [sustainedScore, setSustainedScore] = useState(70);
  const [acute, setAcute] = useState(90);

  useEffect(() => {
    if (profile?.thresholdConfig) {
      setSustainedDays(profile.thresholdConfig.sustained_days);
      setSustainedScore(profile.thresholdConfig.sustained_score);
      setAcute(profile.thresholdConfig.acute);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      api.patchPhysicianMe({
        threshold_config: {
          sustained_days: sustainedDays,
          sustained_score: sustainedScore,
          acute,
        },
      }),
    onSuccess: () => invalidateProfile(),
  });

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>
      <p className="oura-label">Privacy</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Alert thresholds</h1>
      <p className="text-sm text-muted-foreground mb-8">
        When these patterns appear, Bridge offers support — never alerts your employer.
      </p>

      <div className="space-y-6 mb-8">
        <div>
          <label className="text-xs text-muted-foreground">Sustained days</label>
          <input
            type="number"
            min={1}
            max={14}
            value={sustainedDays}
            onChange={(e) => setSustainedDays(Number(e.target.value))}
            className="mt-2 w-full p-4 rounded-2xl bg-surface-raised border border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Sustained distress score (0–100)</label>
          <input
            type="range"
            min={50}
            max={95}
            value={sustainedScore}
            onChange={(e) => setSustainedScore(Number(e.target.value))}
            className="mt-4 w-full accent-[#d4b896]"
          />
          <p className="text-center text-sm mt-1">{sustainedScore}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Acute trigger (0–100)</label>
          <input
            type="range"
            min={70}
            max={100}
            value={acute}
            onChange={(e) => setAcute(Number(e.target.value))}
            className="mt-4 w-full accent-[#d4b896]"
          />
          <p className="text-center text-sm mt-1">{acute}</p>
        </div>
      </div>

      <button
        type="button"
        disabled={!isApiConnected || save.isPending}
        onClick={() => save.mutate()}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        Save thresholds
      </button>
    </OuraPage>
  );
}
