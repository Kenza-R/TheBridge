import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Inbox, Send } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/messages")({ component: Messages });

function Messages() {
  const { isApiConnected } = useBridgeApi();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");

  const query = useQuery({
    queryKey: ["messages", tab],
    queryFn: () => api.getMessages({ direction: tab }),
    enabled: isApiConnected,
  });

  const messages = query.data?.messages ?? [];

  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>

      <p className="oura-label">Inbox</p>
      <h1 className="text-2xl font-semibold mt-1 mb-6">Messages</h1>

      <div className="oura-segmented mb-6">
        <button type="button" data-active={tab === "inbox"} onClick={() => setTab("inbox")}>
          <span className="inline-flex items-center justify-center gap-1">
            <Inbox size={14} /> Inbox
          </span>
        </button>
        <button type="button" data-active={tab === "sent"} onClick={() => setTab("sent")}>
          <span className="inline-flex items-center justify-center gap-1">
            <Send size={14} /> Sent
          </span>
        </button>
      </div>

      <ul className="space-y-2">
        {messages.map((m) => {
          const peer =
            tab === "inbox"
              ? m.sender?.displayName ?? "Colleague"
              : m.recipient?.displayName ?? "Colleague";
          return (
            <li key={m.id} className="oura-card p-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">{peer}</p>
                <span className="text-[10px] uppercase text-muted-foreground">{m.messageType}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{m.messageBody}</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {new Date(m.createdAt).toLocaleDateString()}
              </p>
            </li>
          );
        })}
      </ul>

      {!isApiConnected && (
        <p className="text-sm text-muted-foreground oura-card p-4 mt-4">Connect API to load messages.</p>
      )}
      {isApiConnected && !query.isLoading && messages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No messages yet.</p>
      )}
    </OuraPage>
  );
}
