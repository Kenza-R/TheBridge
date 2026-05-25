import type { LucideIcon } from "lucide-react";
import { Moon, Stethoscope, Wind } from "lucide-react";

const METRIC_ICONS = {
  clinical: Stethoscope,
  recovery: Moon,
  feel: Wind,
} as const satisfies Record<string, LucideIcon>;

export type MetricIconKind = keyof typeof METRIC_ICONS;

export function MetricIcon({
  kind,
  size = 16,
  className = "text-gold",
}: {
  kind: MetricIconKind;
  size?: number;
  className?: string;
}) {
  const Icon = METRIC_ICONS[kind];
  return <Icon size={size} className={className} strokeWidth={1.75} aria-hidden />;
}

export { METRIC_ICONS };
