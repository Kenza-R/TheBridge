import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Headphones, Phone, Users, Wind } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";

export const Route = createFileRoute("/wellness/support")({ component: Support });

const steps = [
  {
    step: 1,
    title: "Ground yourself",
    detail: "Breathing, meditation, or journaling first — when you can.",
    links: [
      { to: "/wellness/breathe", label: "90-second breathing", icon: Wind },
      { to: "/wellness", label: "Meditation tracks", icon: Headphones },
      { to: "/wellness/journal", label: "Journal & share experience", icon: BookOpen },
    ],
  },
  {
    step: 2,
    title: "Reach a peer in your circle",
    detail: "Colleagues who opted in — not your employer’s wellness line.",
    links: [{ to: "/circle/launch", label: "Message your circle", icon: Users }],
  },
  {
    step: 3,
    title: "Professional help",
    detail: "Physician-specific support. Confidential where your program allows.",
    links: [
      { href: "tel:988", label: "988 Suicide & Crisis Lifeline", icon: Phone },
      { href: "tel:+18002738255", label: "Physician Support Line (US)", icon: Phone },
    ],
  },
] as const;

function Support() {
  return (
    <AppShell>
      <Link
        to="/wellness"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 -ml-1"
      >
        <ChevronLeft size={18} /> Vitals
      </Link>

      <header className="mb-6">
        <p className="oura-label">Support path</p>
        <h1 className="text-2xl font-semibold mt-1">When you need more</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A clear order: self-care → peer → professional.
        </p>
      </header>

      <ol className="space-y-4">
        {steps.map((s) => (
          <li key={s.step} className="oura-card p-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm font-semibold text-gold">
                {s.step}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.detail}</p>
                <ul className="mt-3 space-y-2">
                  {s.links.map((l) => {
                    const Icon = l.icon;
                    const inner = (
                      <>
                        <Icon size={18} className="text-gold shrink-0" strokeWidth={1.75} />
                        <span className="flex-1 text-sm">{l.label}</span>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </>
                    );
                    return (
                      <li key={l.label}>
                        {"href" in l ? (
                          <a href={l.href} className="oura-metric-row py-3">
                            {inner}
                          </a>
                        ) : (
                          <Link to={l.to} className="oura-metric-row py-3">
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-[11px] text-muted-foreground text-center mt-8 px-4 leading-relaxed">
        If you are in immediate danger, call emergency services. This app does not replace
        clinical care or your hospital’s crisis protocols.
      </p>
    </AppShell>
  );
}
