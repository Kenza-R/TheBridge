import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Users } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/wellness/journal")({ component: Journal });

function Journal() {
  const [text, setText] = useState("");
  const [shareWithCircle, setShareWithCircle] = useState(false);
  const { isApiConnected } = useBridgeApi();

  const save = useMutation({
    mutationFn: async () => {
      if (isApiConnected) {
        await api.logWellnessSession("journal", Math.max(60, text.length));
      }
    },
  });

  return (
    <AppShell>
      <Link
        to="/wellness"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 -ml-1"
      >
        <ChevronLeft size={18} /> Vitals
      </Link>

      <header className="mb-6">
        <p className="oura-label">Journal</p>
        <h1 className="text-2xl font-semibold mt-1">Share your experience</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Private by default. You choose what your circle sees.
        </p>
      </header>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What happened today? What helped, what didn’t?"
        rows={8}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none focus:ring-1 focus:ring-gold/40"
      />

      <label className="oura-card flex items-start gap-3 p-4 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={shareWithCircle}
          onChange={(e) => setShareWithCircle(e.target.checked)}
          className="mt-1 accent-[var(--gold)]"
        />
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <Users size={16} className="text-gold" />
            Share a summary with my circle
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sends a short note — not your full entry. 30-day retention.
          </p>
        </div>
      </label>

      <button
        type="button"
        disabled={!text.trim() || save.isPending}
        onClick={() => save.mutate()}
        className="oura-btn oura-btn-primary w-full mt-6 py-3.5"
      >
        {save.isSuccess ? "Saved" : "Save privately"}
      </button>

      {save.isSuccess && shareWithCircle && (
        <Link
          to="/circle/launch"
          className="block text-center text-sm text-gold mt-4"
        >
          Open circle message
        </Link>
      )}

      {!isApiConnected && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Stored on this device until API is connected.
        </p>
      )}
    </AppShell>
  );
}
