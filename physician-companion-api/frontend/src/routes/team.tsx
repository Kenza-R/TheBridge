import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import type { PeerSearchResult } from "@/lib/api-types";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/team")({ component: Team });

function initials(name: string | null) {
  const n = name ?? "Physician";
  return n
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Team() {
  const { isApiConnected } = useBridgeApi();
  const [flagged, setFlagged] = useState<PeerSearchResult | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const peers = useQuery({
    queryKey: ["peers", "team"],
    queryFn: () => api.searchPeers(),
    enabled: isApiConnected,
  });

  const flag = useMutation({
    mutationFn: () => api.submitConcernFlag(flagged!.id, note.trim() || undefined),
    onSuccess: () => setDone(true),
  });

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>

      <p className="oura-label">Care</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Team</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Send an anonymous soft check-in if someone’s on your mind.
      </p>

      <ul className="space-y-2">
        {(peers.data?.peers ?? []).map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                setFlagged(c);
                setDone(false);
                setNote("");
              }}
              className="oura-metric-row w-full text-left active:opacity-80"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-xs font-medium">
                {initials(c.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.displayName ?? "Physician"}</p>
                <p className="text-xs text-muted-foreground">{c.specialty ?? "—"}</p>
              </div>
              <Heart size={16} className="text-muted-foreground" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>

      {flagged && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setFlagged(null)}
        >
          <div
            className="w-full max-w-md bg-surface-raised border-t border-border rounded-t-[1.75rem] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-full bg-gold-soft mx-auto mb-4 flex items-center justify-center">
                  <Heart size={20} className="text-gold" />
                </div>
                <p className="text-xl font-semibold mb-2">They’ll know someone cares.</p>
                <p className="text-sm text-muted-foreground mb-6">Anonymous · expires in 14 days</p>
                <button
                  type="button"
                  onClick={() => setFlagged(null)}
                  className="oura-btn oura-btn-primary max-w-[200px] mx-auto py-3"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-lg font-semibold mb-1">Worried about {flagged.displayName}?</p>
                <p className="text-sm text-muted-foreground mb-5">We’ll nudge them gently. You stay private.</p>
                <textarea
                  placeholder="Note for yourself (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-20 p-3 rounded-2xl bg-surface border border-border text-sm resize-none mb-4 focus:outline-none focus:ring-1 focus:ring-gold/30"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlagged(null)}
                    className="oura-btn oura-btn-secondary py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={flag.isPending}
                    onClick={() => flag.mutate()}
                    className="oura-btn oura-btn-primary py-3"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </OuraPage>
  );
}
