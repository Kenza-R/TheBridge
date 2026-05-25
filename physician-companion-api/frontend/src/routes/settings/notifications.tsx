import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/settings/notifications")({
  component: NotificationSettings,
});

function NotificationSettings() {
  const { profile, isApiConnected, invalidateProfile } = useBridgeApi();
  const [silentStart, setSilentStart] = useState("07:00");
  const [silentEnd, setSilentEnd] = useState("19:00");
  const [maxPerDay, setMaxPerDay] = useState(1);

  useEffect(() => {
    if (profile?.notificationPrefs) {
      setSilentStart(profile.notificationPrefs.silent_start);
      setSilentEnd(profile.notificationPrefs.silent_end);
      setMaxPerDay(profile.notificationPrefs.max_per_day);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      api.patchPhysicianMe({
        notification_prefs: {
          silent_start: silentStart,
          silent_end: silentEnd,
          max_per_day: maxPerDay,
        },
      }),
    onSuccess: () => invalidateProfile(),
  });

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>
      <p className="oura-label">Experience</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Notifications</h1>
      <p className="text-sm text-muted-foreground mb-8">
        No alerts during patient-facing hours. Max one nudge per day.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="oura-label">Silent from</label>
          <input
            type="time"
            value={silentStart}
            onChange={(e) => setSilentStart(e.target.value)}
            className="mt-2 w-full p-4 rounded-2xl bg-surface-raised border border-border"
          />
        </div>
        <div>
          <label className="oura-label">Silent until</label>
          <input
            type="time"
            value={silentEnd}
            onChange={(e) => setSilentEnd(e.target.value)}
            className="mt-2 w-full p-4 rounded-2xl bg-surface-raised border border-border"
          />
        </div>
        <div>
          <label className="oura-label">Max per day</label>
          <input
            type="range"
            min={0}
            max={3}
            value={maxPerDay}
            onChange={(e) => setMaxPerDay(Number(e.target.value))}
            className="mt-4 w-full accent-[#d4b896]"
          />
          <p className="text-sm text-center mt-2">{maxPerDay}</p>
        </div>
      </div>

      <button
        type="button"
        disabled={!isApiConnected || save.isPending}
        onClick={() => save.mutate()}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        {save.isSuccess ? "Saved" : save.isPending ? "Saving…" : "Save preferences"}
      </button>
    </OuraPage>
  );
}
