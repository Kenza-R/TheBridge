import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot, HeartPulse, Home, UserRound } from "lucide-react";

const tabs = [
  { to: "/home", label: "Today", icon: Home },
  { to: "/wellness", label: "Vitals", icon: HeartPulse },
  { to: "/circle", label: "Circle", icon: CircleDot },
  { to: "/settings", label: "You", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();

  return (
    <div className="min-h-screen max-w-md mx-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <main className="px-5 pt-4 pb-6">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-[#0a0a0b]/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md justify-around px-2 pt-2 pb-2">
          {tabs.map((t) => {
            const active =
              loc.pathname === t.to || loc.pathname.startsWith(`${t.to}/`);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="flex min-w-[4.5rem] flex-col items-center gap-1 px-3 py-1.5"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.25 : 1.75}
                    className={active ? "text-foreground" : "text-muted-foreground"}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Subpages without bottom nav (breathe, onboarding, connection) */
export function OuraPage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen max-w-md mx-auto px-5 pt-4 pb-10 ${className}`}>{children}</div>
  );
}
