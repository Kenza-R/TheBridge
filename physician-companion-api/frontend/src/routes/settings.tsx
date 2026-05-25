import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Shield,
  Activity,
  LogOut,
  Users,
  Wifi,
  Sliders,
  Inbox,
  Heart,
} from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { ApiErrorHint } from "@/components/bridge/ApiStatusBadge";
import { SettingsRow } from "@/components/bridge/SettingsRow";
import { clearAuthToken } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const { profile, circle, isApiConnected } = useBridgeApi();
  const name = profile?.displayName ?? "Physician";
  const wearable = profile?.wearableType
    ? profile.wearableType.replace(/_/g, " ")
    : "Not connected";

  return (
    <AppShell>
      <header className="mb-8">
        <p className="oura-label">You</p>
        <h1 className="text-2xl font-semibold mt-1">{name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.specialty ?? "Mercy General"} ·{" "}
          {isApiConnected ? "Connected" : "Demo mode"}
        </p>
      </header>

      <ApiErrorHint />

      <section className="mb-8">
        <h2 className="oura-label mb-3 px-1">Account</h2>
        <ul className="oura-card overflow-hidden px-1">
          <SettingsRow
            icon={Wifi}
            label="API connection"
            sub={isApiConnected ? "Live backend" : "Set dev token"}
            to="/settings/connection"
          />
          <SettingsRow
            icon={Users}
            label="Manage circle"
            sub={`${circle.length} active`}
            to="/circle/add"
          />
          <SettingsRow icon={Inbox} label="Messages" sub="Inbox & sent" to="/messages" />
          <SettingsRow icon={Heart} label="Team check-ins" sub="Anonymous concern flags" to="/team" />
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="oura-label mb-3 px-1">Privacy</h2>
        <ul className="oura-card overflow-hidden px-1">
          <SettingsRow
            icon={Shield}
            label="Data sources"
            sub={`EHR · ${wearable}`}
            to="/settings/data-sources"
          />
          <SettingsRow
            icon={Activity}
            label="Hospital visibility"
            sub="Aggregates only"
            to="/settings/privacy"
          />
          <SettingsRow
            icon={Sliders}
            label="Alert thresholds"
            sub="Sustained & acute"
            to="/settings/thresholds"
          />
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="oura-label mb-3 px-1">Experience</h2>
        <ul className="oura-card overflow-hidden px-1">
          <SettingsRow
            icon={Bell}
            label="Notifications"
            sub={`Silent ${profile?.notificationPrefs.silent_start ?? "07:00"}–${profile?.notificationPrefs.silent_end ?? "19:00"}`}
            to="/settings/notifications"
          />
        </ul>
      </section>

      <button
        type="button"
        onClick={() => {
          clearAuthToken();
          window.location.href = "/";
        }}
        className="oura-btn oura-btn-secondary gap-2"
      >
        <LogOut size={16} />
        Sign out
      </button>

      <p className="text-center text-[11px] text-muted-foreground mt-10 leading-relaxed px-4">
        Your hospital never sees individual scores, messages, or names — only anonymized cohort trends.
      </p>
    </AppShell>
  );
}
