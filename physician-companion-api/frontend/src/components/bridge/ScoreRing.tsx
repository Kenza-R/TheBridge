import { scoreLabel, scoreRingGradient, scoreTone } from "@/lib/oura-ui";

type ScoreRingProps = {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
};

export function ScoreRing({
  score,
  label,
  sublabel,
  size = 220,
  stroke = 10,
}: ScoreRingProps) {
  const tone = scoreTone(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full animate-ring-pulse opacity-40 blur-2xl"
        style={{ background: scoreRingGradient(tone) }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
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
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3a8" />
            <stop offset="50%" stopColor="#d4b896" />
            <stop offset="100%" stopColor="#8fd4c4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <span className="text-[3.25rem] font-semibold leading-none tracking-tight tabular-nums">
          {score}
        </span>
        <span className="oura-label mt-2">{label}</span>
        <span className="text-sm text-muted-foreground mt-1">{scoreLabel(score)}</span>
        {sublabel && (
          <span className="text-[11px] text-muted-foreground/80 mt-2 max-w-[140px] leading-snug">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
