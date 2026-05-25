import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Play, Wind } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

const tabs = ["Restore", "Listen", "Trends"] as const;

export const Route = createFileRoute("/wellness/")({ component: Wellness });

function Wellness() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Restore");
  const { isApiConnected } = useBridgeApi();

  const meditations = useQuery({
    queryKey: ["meditations"],
    queryFn: () => api.getMeditations(),
    enabled: isApiConnected,
  });

  const logSession = useMutation({
    mutationFn: (args: { session_type: string; duration_sec: number }) =>
      api.logWellnessSession(args.session_type, args.duration_sec),
  });

  const tracks = meditations.data?.tracks ?? [];

  return (
    <AppShell>
      <header className="mb-6">
        <p className="oura-label">Vitals</p>
        <h1 className="text-2xl font-semibold mt-1">Wellness</h1>
        <p className="text-sm text-muted-foreground mt-1">Short, private, on your terms.</p>
      </header>

      <div className="oura-segmented mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            data-active={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Restore" && (
        <Link
          to="/wellness/breathe"
          className="oura-card block p-6 mb-4 active:scale-[0.99] transition overflow-hidden relative"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint/10 blur-2xl" />
          <Wind size={28} className="text-mint mb-4 relative" strokeWidth={1.5} />
          <p className="text-xl font-semibold relative">90-second reset</p>
          <p className="text-sm text-muted-foreground mt-1 relative">Box · 4-7-8 · extended exhale</p>
          <span className="inline-flex items-center gap-1 text-sm text-gold mt-4 relative">
            Start <ChevronRight size={16} />
          </span>
        </Link>
      )}

      {tab === "Trends" && (
        <Link to="/wellness/trends" className="oura-metric-row">
          <div className="flex-1">
            <p className="text-sm font-medium">Wellbeing trends</p>
            <p className="text-xs text-muted-foreground">Last 90 days · only you</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      )}

      {tab === "Listen" && (
        <ul className="space-y-2">
          {tracks.length === 0 && !meditations.isLoading && (
            <li className="oura-card p-4 text-sm text-muted-foreground">
              {isApiConnected ? "No tracks yet." : "Connect API to load audio."}
            </li>
          )}
          {tracks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                disabled={logSession.isPending}
                onClick={() =>
                  logSession.mutate({
                    session_type: t.id,
                    duration_sec: t.duration_sec,
                  })
                }
                className="oura-metric-row w-full text-left active:opacity-80"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface">
                  <Play size={18} className="text-gold ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(t.duration_sec / 60)} min · tap to log
                  </p>
                </div>
              </button>
            </li>
          ))}
          {logSession.isSuccess && (
            <p className="text-xs text-mint px-1">Session logged.</p>
          )}
        </ul>
      )}
    </AppShell>
  );
}
