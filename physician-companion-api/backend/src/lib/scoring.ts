export type ScoreInput = {
  ehr?: number | null;
  wearable?: number | null;
  selfReport?: number | null;
  signalFlags?: Record<string, boolean>;
};

export type ThresholdConfig = {
  sustained_days: number;
  sustained_score: number;
  acute: number;
};

const DEFAULT_WEIGHTS = {
  ehr: 0.4,
  wearable: 0.25,
  selfReport: 0.35,
};

/**
 * Composite 0–100 (higher = more distress). Missing sub-scores are re-weighted.
 */
export function computeCompositeScore(input: ScoreInput): number {
  const parts: { value: number; weight: number }[] = [];
  if (input.ehr != null) parts.push({ value: input.ehr, weight: DEFAULT_WEIGHTS.ehr });
  if (input.wearable != null) parts.push({ value: input.wearable, weight: DEFAULT_WEIGHTS.wearable });
  if (input.selfReport != null) parts.push({ value: input.selfReport, weight: DEFAULT_WEIGHTS.selfReport });

  if (parts.length === 0) return 0;

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const weighted = parts.reduce((s, p) => s + (p.value * p.weight) / totalWeight, 0);
  return Math.min(100, Math.max(0, Math.round(weighted)));
}

export function evaluateTrigger(
  composite: number,
  config: ThresholdConfig,
  recentScores: number[],
  hardEventToday: boolean,
): { fired: boolean; type: "sustained" | "acute" | "hard_event" | null } {
  if (hardEventToday) return { fired: true, type: "hard_event" };
  if (composite >= config.acute) return { fired: true, type: "acute" };

  const window = recentScores.slice(-config.sustained_days);
  if (
    window.length >= config.sustained_days &&
    window.every((s) => s >= config.sustained_score)
  ) {
    return { fired: true, type: "sustained" };
  }

  return { fired: false, type: null };
}
