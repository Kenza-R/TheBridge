import { scoreTone } from "@/lib/oura-ui";

export function MiniResilienceRing({ score, size = 44 }: { score: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const tone = scoreTone(score);
  const strokeColor =
    tone === "good" ? "#7dd3a8" : tone === "mid" ? "#d4b896" : "#6e6e73";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums"
        style={{ fontSize: size < 48 ? 11 : 13 }}
      >
        {score}
      </span>
    </div>
  );
}
