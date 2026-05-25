import { useBridgeApi } from "@/providers/bridge-api";

export function ApiStatusBadge() {
  const { isApiConnected, isLoading } = useBridgeApi();

  if (isLoading) {
    return <span className="oura-label">Connecting…</span>;
  }

  if (!isApiConnected) {
    return <span className="oura-label text-gold/90">Offline · demo</span>;
  }

  return <span className="oura-label text-mint/90">Live</span>;
}

export function ApiErrorHint() {
  const { error, isApiConnected } = useBridgeApi();
  if (isApiConnected || !error) return null;
  return (
    <p className="text-xs text-gold/90 mt-3 mb-6 p-4 rounded-2xl bg-gold-soft border border-border leading-relaxed">
      API unavailable. Open You → API connection, or start the backend on :3000.
    </p>
  );
}
