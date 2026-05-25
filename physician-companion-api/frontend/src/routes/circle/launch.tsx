import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Coffee, Clock } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { useBridge } from "@/lib/bridge-store";
import { api } from "@/lib/api";
import { mapCircleFromApi } from "@/lib/circle-ui";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/circle/launch")({ component: Launch });

function Launch() {
  const { circle: mockCircle } = useBridge();
  const { circle: apiCircle, isApiConnected } = useBridgeApi();
  const circle = isApiConnected
    ? apiCircle.filter((c) => c.status === "accepted").map(mapCircleFromApi)
    : mockCircle;

  const sendMessages = useMutation({
    mutationFn: async (recipientIds: string[]) => {
      await Promise.all(
        recipientIds.map((recipient_id) =>
          api.sendMessage({
            recipient_id,
            body: message,
            message_type: "outreach",
          }),
        ),
      );
    },
    onSuccess: () => setSent(true),
  });

  const [selected, setSelected] = useState<string[]>([circle[0]?.id].filter(Boolean));
  const [message, setMessage] = useState(
    "I had a rough one. Could use a quick chat when you're free.",
  );
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center px-6 text-center bg-background">
        <div className="h-20 w-20 rounded-full bg-gold-soft mb-6 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-gold animate-ring-pulse" />
        </div>
        <p className="oura-label mb-2">Sent</p>
        <h1 className="text-2xl font-semibold mb-3">On its way.</h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-xs">
          Your circle typically responds within a few hours.
        </p>
        <Link to="/home" className="oura-btn oura-btn-primary max-w-[220px] py-3.5">
          Back to Today
        </Link>
      </div>
    );
  }

  if (preview) {
    return (
      <OuraPage className="flex flex-col min-h-screen pb-8">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6"
        >
          <ChevronLeft size={16} /> Edit
        </button>
        <p className="oura-label">Preview</p>
        <h1 className="text-2xl font-semibold mt-1 mb-6">What they’ll see</h1>

        <div className="oura-card p-5 mb-6">
          <p className="text-xs text-muted-foreground mb-2">You reached out</p>
          <p className="leading-relaxed text-[15px]">{message}</p>
        </div>

        <div className="space-y-2 mb-auto">
          <div className="oura-metric-row">
            <Coffee size={16} className="text-gold" />
            <span className="text-sm">Request a walk together</span>
          </div>
          <div className="oura-metric-row">
            <Clock size={16} className="text-gold" />
            <span className="text-sm">Schedule 15 minutes</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <button type="button" onClick={() => setPreview(false)} className="oura-btn oura-btn-secondary py-3.5">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (isApiConnected && selected.length) sendMessages.mutate(selected);
              else setSent(true);
            }}
            disabled={sendMessages.isPending}
            className="oura-btn oura-btn-primary py-3.5 disabled:opacity-40"
          >
            {sendMessages.isPending ? "Sending…" : "Send"}
          </button>
        </div>
      </OuraPage>
    );
  }

  return (
    <OuraPage>
      <Link to="/circle" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> Circle
      </Link>
      <p className="oura-label">Reach out</p>
      <h1 className="text-2xl font-semibold mt-1 mb-6">Who should hear from you?</h1>

      <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-2 mb-6">
        {circle.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() =>
                setSelected((s) => (on ? s.filter((x) => x !== m.id) : [...s, m.id]))
              }
              className={`shrink-0 w-[7.5rem] p-4 rounded-2xl border text-left transition ${
                on ? "bg-gold-soft border-gold/40" : "oura-card"
              }`}
            >
              <div className="h-11 w-11 rounded-full bg-surface flex items-center justify-center text-xs font-medium mb-2">
                {m.initials}
              </div>
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{m.specialty}</p>
            </button>
          );
        })}
      </div>

      <label className="oura-label block mb-2">Message</label>
      <textarea
        value={message}
        maxLength={280}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-32 p-4 rounded-2xl bg-surface-raised border border-border text-sm resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-gold/30"
      />
      <p className="text-xs text-muted-foreground text-right mt-1">{message.length}/280</p>

      <button
        type="button"
        onClick={() => setPreview(true)}
        disabled={!selected.length || !message.trim()}
        className="oura-btn oura-btn-primary mt-6 disabled:opacity-40"
      >
        Preview
      </button>
    </OuraPage>
  );
}
