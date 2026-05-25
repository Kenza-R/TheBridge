import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  HandHeart,
  Play,
  Sparkles,
  Wind,
} from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

const tabs = ["Breathe", "Meditate", "Journal", "Support"] as const;

export const Route = createFileRoute("/wellness/")({ component: Wellness });

function Wellness() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Breathe");
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
      <header className="mb-5">
        <p className="oura-label">Vitals</p>
        <h1 className="text-2xl font-semibold mt-1">Care</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Breathe → meditate → journal → peer → professional.
        </p>
      </header>

      <div className="oura-segmented mb-5 overflow-x-auto flex-nowrap">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            data-active={tab === t}
            onClick={() => setTab(t)}
            className="shrink-0 px-3 text-xs sm:text-sm"
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Breathe" && (
        <>
          <Link
            to="/wellness/breathe"
            className="oura-card block p-6 mb-4 active:scale-[0.99] transition overflow-hidden relative"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint/10 blur-2xl" />
            <Wind size={28} className="text-mint mb-4 relative" strokeWidth={1.5} />
            <p className="text-xl font-semibold relative">90-second reset</p>
            <p className="text-sm text-muted-foreground mt-1 relative">
              Box · 4-7-8 · extended exhale
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-gold mt-4 relative">
              Start <ChevronRight size={16} />
            </span>
          </Link>
          <Link to="/wellness/trends" className="oura-metric-row">
            <div className="flex-1">
              <p className="text-sm font-medium">Your trends</p>
              <p className="text-xs text-muted-foreground">Private · last 90 days</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </>
      )}

      {tab === "Meditate" && (
        <ul className="space-y-2">
          {tracks.length === 0 && !meditations.isLoading && (
            <li className="oura-card p-4 text-sm text-muted-foreground">
              {isApiConnected
                ? "No tracks yet — your hospital can add guided audio."
                : "Connect API in You → settings to load meditation tracks."}
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
                    {Math.round(t.duration_sec / 60)} min · tap to log session
                  </p>
                </div>
              </button>
            </li>
          ))}
          {logSession.isSuccess && (
            <p className="text-xs text-mint px-1">Session logged privately.</p>
          )}
        </ul>
      )}

      {tab === "Journal" && (
        <div className="space-y-3">
          <Link to="/wellness/journal" className="oura-card block p-5 active:scale-[0.99] transition">
            <BookOpen size={24} className="text-gold mb-3" strokeWidth={1.5} />
            <p className="text-lg font-medium">Write & reflect</p>
            <p className="text-sm text-muted-foreground mt-1">
              Process the shift. Optionally share a summary with your circle.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-gold mt-4">
              Open journal <ChevronRight size={16} />
            </span>
          </Link>
          <p className="text-xs text-muted-foreground px-1">
            Full entries stay private unless you choose to share.
          </p>
        </div>
      )}

      {tab === "Support" && (
        <div className="space-y-3">
          <Link
            to="/wellness/support"
            className="oura-card flex items-center gap-4 p-4 active:scale-[0.99] transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
              <HandHeart size={22} className="text-gold" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="font-medium">Support path</p>
              <p className="text-xs text-muted-foreground">
                Peer outreach, then professional resources
              </p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
          <Link to="/circle/launch" className="oura-metric-row">
            <Sparkles size={18} className="text-mint shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Reach a peer now</p>
              <p className="text-xs text-muted-foreground">Skip to circle message</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>
      )}
    </AppShell>
  );
}
