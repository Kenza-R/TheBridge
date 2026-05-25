import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { distressToWellbeing } from "@/lib/constants";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/wellness/trends")({ component: Trends });

function Trends() {
  const [showSources, setShowSources] = useState(false);
  const [tip, setTip] = useState<number | null>(null);
  const { profile, isApiConnected } = useBridgeApi();

  const scoresQuery = useQuery({
    queryKey: ["scores", 90],
    queryFn: () => api.getScores(90),
    enabled: isApiConnected,
  });

  const data = useMemo(() => {
    const rows = [...(scoresQuery.data?.scores ?? [])].reverse();
    if (rows.length === 0) {
      return Array.from({ length: 90 }).map((_, i) => {
        const base = 65 + Math.sin(i / 8) * 12;
        return distressToWellbeing(Math.max(20, Math.min(95, 100 - base)));
      });
    }
    return rows.map((r) => distressToWellbeing(r.compositeScore));
  }, [scoresQuery.data]);

  const events = useMemo(() => {
    const rows = [...(scoresQuery.data?.scores ?? [])].reverse();
    return rows
      .map((r, i) =>
        r.triggerFired ? { day: i, label: r.triggerType ?? "Support offered" } : null,
      )
      .filter((e): e is { day: number; label: string } => e != null)
      .slice(0, 5);
  }, [scoresQuery.data]);

  const w = 320;
  const h = 140;
  const max = 100;
  const points = data.map((v, i) => [
    (i / Math.max(1, data.length - 1)) * w,
    h - (v / max) * h,
  ]);
  const path = points.reduce(
    (acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`),
    "",
  );
  const today = data[data.length - 1] ?? 0;

  return (
    <OuraPage>
      <Link
        to="/wellness"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6"
      >
        <ChevronLeft size={16} /> Vitals
      </Link>

      <p className="oura-label">Trends</p>
      <h1 className="text-2xl font-semibold mt-1 mb-1">Wellbeing</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Higher is better · 90 days
        {!isApiConnected && " · demo curve"}
      </p>

      <div className="oura-card p-5 mb-6">
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-4xl font-semibold tabular-nums">{Math.round(today)}</span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
          <defs>
            <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d4b896" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d4b896" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={path + ` L${w},${h} L0,${h} Z`}
            fill="url(#trend-fill)"
          />
          <path
            d={path}
            fill="none"
            stroke="#d4b896"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {events.map((e) => {
            const pt = points[e.day];
            if (!pt) return null;
            const [x, y] = pt;
            return (
              <circle
                key={e.day}
                cx={x}
                cy={y}
                r={4}
                fill="#7dd3a8"
                className="cursor-pointer"
                onClick={() => setTip(e.day)}
              />
            );
          })}
        </svg>
        {tip !== null && (
          <p className="text-xs text-mint mt-3">{events.find((e) => e.day === tip)?.label}</p>
        )}
      </div>

      <h2 className="oura-label mb-3 px-1">Insights</h2>
      <ul className="space-y-2 mb-6">
        {profile?.thresholdConfig && (
          <li className="oura-card px-4 py-3.5 text-sm text-foreground/85 leading-relaxed">
            Gentle alerts above {profile.thresholdConfig.sustained_score} for{" "}
            {profile.thresholdConfig.sustained_days} days — never shared with your hospital.
          </li>
        )}
        <li className="oura-card px-4 py-3.5 text-sm text-foreground/85 leading-relaxed">
          Blends EHR rhythm, wearable recovery, and your reflections.
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setShowSources((s) => !s)}
        className="oura-metric-row w-full"
      >
        <span className="text-sm flex-1 text-left">Data sources</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition ${showSources ? "rotate-180" : ""}`}
        />
      </button>
      {showSources && (
        <ul className="mt-2 space-y-2">
          {[
            ["EHR signals", true],
            ["Wearable", !!profile?.wearableType && profile.wearableType !== "none"],
            ["Self-report", true],
          ].map(([label, on]) => (
            <li key={label as string} className="oura-metric-row justify-between">
              <span className="text-sm">{label}</span>
              <span className={`text-xs ${on ? "text-mint" : "text-muted-foreground"}`}>
                {on ? "On" : "Off"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </OuraPage>
  );
}
