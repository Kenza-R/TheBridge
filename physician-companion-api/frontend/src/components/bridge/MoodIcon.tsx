/** Designed mood marks (not Unicode emoji) for check-ins */

export type MoodLevel = 0 | 1 | 2 | 3 | 4;

const faces: Record<MoodLevel, { label: string; mouth: string; eyes: string }> = {
  0: { label: "Rough", mouth: "M8 17 Q12 14 16 17", eyes: "M8 10 h2 M14 10 h2" },
  1: { label: "Low", mouth: "M8 16 Q12 15 16 16", eyes: "M8 10 h2 M14 10 h2" },
  2: { label: "Okay", mouth: "M8 16 h8", eyes: "M8 10 h2 M14 10 h2" },
  3: { label: "Good", mouth: "M8 15 Q12 18 16 15", eyes: "M8 9 h2 M14 9 h2" },
  4: { label: "Great", mouth: "M8 14 Q12 19 16 14", eyes: "M7 9 Q9 7 11 9 M13 9 Q15 7 17 9" },
};

export function MoodIcon({
  level,
  size = 28,
  active = false,
}: {
  level: MoodLevel;
  size?: number;
  active?: boolean;
}) {
  const f = faces[level];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={active ? "text-gold" : "text-muted-foreground"}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={active ? "rgba(212,184,150,0.15)" : "rgba(255,255,255,0.04)"}
        stroke={active ? "rgba(212,184,150,0.5)" : "rgba(255,255,255,0.08)"}
        strokeWidth="1"
      />
      <path d={f.eyes} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d={f.mouth} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MoodScale({
  value,
  onChange,
  disabled,
}: {
  value?: MoodLevel;
  onChange: (level: MoodLevel) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2" role="group" aria-label="How you feel">
      {([0, 1, 2, 3, 4] as MoodLevel[]).map((level) => (
        <button
          key={level}
          type="button"
          disabled={disabled}
          onClick={() => onChange(level)}
          className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2.5 transition active:scale-95 disabled:opacity-40 ${
            value === level ? "bg-gold-soft ring-1 ring-gold/40" : "bg-surface hover:bg-surface-raised"
          }`}
        >
          <MoodIcon level={level} size={32} active={value === level} />
          <span className="text-[10px] text-muted-foreground font-medium">{faces[level].label}</span>
        </button>
      ))}
    </div>
  );
}

export const MOOD_SCORES = [85, 70, 55, 40, 25] as const;
