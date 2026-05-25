import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function SettingsRow({
  icon: Icon,
  label,
  sub,
  to,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  to?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
        <Icon size={18} className="text-gold" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted-foreground/60" />
    </>
  );

  const className =
    "w-full flex items-center gap-3.5 py-3.5 text-left active:opacity-70 transition";

  if (to) {
    return (
      <li className="border-b border-border/60 last:border-0">
        <Link to={to} className={className}>
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-border/60 last:border-0">
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    </li>
  );
}
