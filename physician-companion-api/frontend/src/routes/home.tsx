import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, ChevronRight, MessageCircle, Wind, X } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { MetricIcon } from "@/components/bridge/MetricIcon";
import { MoodScale, MOOD_SCORES, type MoodLevel } from "@/components/bridge/MoodIcon";
import { ScoreRing } from "@/components/bridge/ScoreRing";
import { useBridge } from "@/lib/bridge-store";
import { api } from "@/lib/api";
import { HARD_EVENT_TAGS } from "@/lib/constants";
import { wellbeingFromDistress } from "@/lib/oura-ui";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/home")({ component: Home });

const greetings = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

function Home() {
  const { triggerActive, setTrigger } = useBridge();
  const { profile, isApiConnected } = useBridgeApi();
  const displayName = profile?.displayName?.replace(/^Dr\.\s*/i, "") ?? "there";

  const scoresQuery = useQuery({
    queryKey: ["scores", 14],
    queryFn: () => api.getScores(14),
    enabled: isApiConnected,
  });

  const inboxQuery = useQuery({
    queryKey: ["messages", "inbox", "unread"],
    queryFn: () => api.getMessages({ direction: "inbox" }),
    enabled: isApiConnected,
  });

  const latest = scoresQuery.data?.scores?.[0];
  const wellbeing = wellbeingFromDistress(latest?.compositeScore);
  const acute = profile?.thresholdConfig.acute ?? 90;
  const showTrigger =
    triggerActive ||
    (latest?.triggerFired && (latest.compositeScore >= acute || latest.triggerType != null));

  const unread = (inboxQuery.data?.messages ?? []).filter(
    (m) => m.status === "pending" || m.status === "delivered",
  ).length;

  const contributors = [
    {
      icon: "clinical" as const,
      name: "Clinical load",
      value: latest?.ehrSubScore != null ? `${Math.round(latest.ehrSubScore)}` : "—",
      hint: "EHR timing patterns",
    },
    {
      icon: "recovery" as const,
      name: "Recovery",
      value: latest?.wearableSubScore != null ? `${Math.round(latest.wearableSubScore)}` : "—",
      hint: profile?.wearableType ? "Wearable trends" : "Not linked",
    },
    {
      icon: "feel" as const,
      name: "How you feel",
      value: latest?.selfReportSubScore != null ? `${Math.round(latest.selfReportSubScore)}` : "—",
      hint: "Private check-ins",
    },
  ];

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-2">
        <div>
          <p className="oura-label">Today</p>
          <h1 className="text-xl font-semibold mt-0.5">
            {greetings()}, {displayName}
          </h1>
        </div>
        <Link
          to="/messages"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised border border-border"
        >
          <Bell size={18} className="text-muted-foreground" strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-[9px] font-medium text-primary-foreground flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>

      <section className="flex flex-col items-center py-6 mb-2 animate-fade-up">
        <ScoreRing
          score={wellbeing}
          label="Resilience"
          sublabel={isApiConnected ? "Updated from your private signals" : "Connect to see live score"}
        />
      </section>

      <section className="mb-6 space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="oura-label">Contributors</h2>
          <Link to="/wellness/trends" className="text-xs text-muted-foreground flex items-center gap-0.5">
            Trends <ChevronRight size={14} />
          </Link>
        </div>
        {contributors.map(({ icon, name, value, hint }) => (
          <div key={name} className="oura-metric-row">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
              <MetricIcon kind={icon} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{hint}</p>
            </div>
            <span className="text-lg font-semibold tabular-nums text-foreground/90">{value}</span>
          </div>
        ))}
      </section>

      {showTrigger ? (
        <TriggerInterface onDismiss={() => setTrigger(false)} />
      ) : (
        <DailyCheckIn onHighDistress={() => setTrigger(true)} />
      )}

      <QuickActions />

      <HardEventsRow />

      <section className="mt-8">
        <h2 className="oura-label mb-3 px-1">Timeline</h2>
        <ul className="space-y-2">
          {(inboxQuery.data?.messages?.[0]
            ? [`${inboxQuery.data.messages[0].sender?.displayName ?? "Someone"} reached out`]
            : ["Your circle is here when you need them", "Tap Vitals for a 90-second reset"]
          ).map((t, i) => (
            <li key={i} className="oura-card px-4 py-3.5 text-sm text-foreground/85">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function QuickActions() {
  return (
    <section className="mt-6 grid grid-cols-2 gap-2">
      <Link to="/wellness/breathe" className="oura-card p-4 active:scale-[0.98] transition">
        <Wind size={20} className="text-mint mb-3" strokeWidth={1.75} />
        <p className="text-sm font-medium">Breathe</p>
        <p className="text-xs text-muted-foreground mt-0.5">90 sec reset</p>
      </Link>
      <Link to="/wellness/support" className="oura-card p-4 active:scale-[0.98] transition">
        <MessageCircle size={20} className="text-gold mb-3" strokeWidth={1.75} />
        <p className="text-sm font-medium">Get support</p>
        <p className="text-xs text-muted-foreground mt-0.5">Peer → professional</p>
      </Link>
    </section>
  );
}

function TriggerInterface({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section className="oura-card p-5 relative animate-fade-up">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-surface flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X size={14} className="text-muted-foreground" />
      </button>
      <p className="oura-label mb-1">Attention</p>
      <p className="text-lg font-medium pr-8 mb-4">A tougher stretch showed up in your signals.</p>
      <div className="space-y-2">
        <Link to="/wellness/breathe" className="oura-btn oura-btn-primary text-sm py-3.5">
          Take a breath
        </Link>
        <Link to="/circle/launch" className="oura-btn oura-btn-secondary text-sm py-3.5">
          Message your circle
        </Link>
      </div>
    </section>
  );
}

function DailyCheckIn({ onHighDistress }: { onHighDistress: () => void }) {
  const { isApiConnected } = useBridgeApi();
  const [selected, setSelected] = useState<MoodLevel | undefined>();
  const checkIn = useMutation({
    mutationFn: async (level: MoodLevel) => {
      const score = MOOD_SCORES[level];
      await api.submitScore({ self_report: score });
      if (score >= 70) {
        await api.submitSelfReport("rough_shift");
        onHighDistress();
      }
    },
  });

  return (
    <section className="oura-card p-5 animate-fade-up">
      <p className="oura-label mb-3">Daily reflection</p>
      <p className="text-sm text-muted-foreground mb-4">How is today landing?</p>
      <MoodScale
        value={selected}
        disabled={!isApiConnected || checkIn.isPending}
        onChange={(level) => {
          setSelected(level);
          if (isApiConnected) checkIn.mutate(level);
        }}
      />
      {checkIn.isSuccess && (
        <p className="text-xs text-mint mt-3">Saved privately.</p>
      )}
      {!isApiConnected && (
        <p className="text-xs text-muted-foreground mt-3">Connect in You → API to save.</p>
      )}
    </section>
  );
}

function HardEventsRow() {
  const { isApiConnected } = useBridgeApi();
  const report = useMutation({
    mutationFn: (tag: string) => api.submitSelfReport(tag),
  });

  return (
    <section className="mt-6">
      <p className="oura-label mb-3 px-1">Log a moment</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {HARD_EVENT_TAGS.map(({ tag, label }) => (
          <button
            key={tag}
            type="button"
            disabled={!isApiConnected || report.isPending}
            onClick={() => report.mutate(tag)}
            className="oura-chip shrink-0 disabled:opacity-40 active:oura-chip-active"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
