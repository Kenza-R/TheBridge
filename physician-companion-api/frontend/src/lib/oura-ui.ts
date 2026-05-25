import { distressToWellbeing } from "./constants";

export function scoreTone(wellbeing: number): "good" | "mid" | "low" {
  if (wellbeing >= 75) return "good";
  if (wellbeing >= 50) return "mid";
  return "low";
}

export function scoreLabel(wellbeing: number): string {
  if (wellbeing >= 85) return "Optimal";
  if (wellbeing >= 70) return "Good";
  if (wellbeing >= 50) return "Fair";
  return "Pay attention";
}

export function scoreRingGradient(tone: ReturnType<typeof scoreTone>): string {
  if (tone === "good") return "var(--gradient-ring-good)";
  if (tone === "mid") return "var(--gradient-ring-mid)";
  return "var(--gradient-ring-low)";
}

export function wellbeingFromDistress(distress: number | undefined, fallback = 72): number {
  if (distress == null || Number.isNaN(distress)) return fallback;
  return Math.round(distressToWellbeing(distress));
}
