import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Check } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/settings/connection")({ component: ConnectionSettings });

function ConnectionSettings() {
  const { refetchAll, isApiConnected, profile } = useBridgeApi();
  const [token, setToken] = useState(() => getAuthToken() ?? "");

  const test = useMutation({
    mutationFn: async () => {
      setAuthToken(token.trim());
      return api.getPhysicianMe();
    },
    onSuccess: () => refetchAll(),
  });

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>

      <p className="oura-label">Account</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Connection</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Dev bearer token today. Auth0 SSO in production.
      </p>

      <div
        className={`oura-card p-4 mb-6 ${isApiConnected ? "border-mint/30" : ""}`}
      >
        <p className="text-sm font-medium flex items-center gap-2">
          {isApiConnected && <Check size={16} className="text-mint" />}
          {isApiConnected
            ? `Connected as ${profile?.displayName ?? "physician"}`
            : "Not connected"}
        </p>
        {profile && (
          <p className="text-[11px] text-muted-foreground mt-2 font-mono break-all">{profile.id}</p>
        )}
      </div>

      <label className="oura-label block mb-2">Bearer token</label>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        className="w-full p-4 rounded-2xl bg-surface-raised border border-border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-gold/40 mb-4 resize-none"
        placeholder="dev:physician:..."
      />

      <button
        type="button"
        disabled={!token.trim() || test.isPending}
        onClick={() => test.mutate()}
        className="oura-btn oura-btn-primary disabled:opacity-40"
      >
        {test.isPending ? "Testing…" : "Save & test"}
      </button>

      {test.isError && (
        <p className="text-xs text-destructive mt-3">Connection failed. Check token and API on :3000.</p>
      )}
    </OuraPage>
  );
}
