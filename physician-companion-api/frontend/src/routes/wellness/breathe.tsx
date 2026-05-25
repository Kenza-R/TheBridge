import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, X } from "lucide-react";
import { api } from "@/lib/api";
import { useBridgeApi } from "@/providers/bridge-api";

export const Route = createFileRoute("/wellness/breathe")({ component: Breathe });

const patterns = {
  box: {
    name: "Box",
    steps: [
      ["In", 4],
      ["Hold", 4],
      ["Out", 4],
      ["Hold", 4],
    ] as const,
  },
  "4-7-8": {
    name: "4-7-8",
    steps: [
      ["In", 4],
      ["Hold", 7],
      ["Out", 8],
    ] as const,
  },
  extended: {
    name: "Exhale",
    steps: [
      ["In", 4],
      ["Out", 8],
    ] as const,
  },
};

function Breathe() {
  const [pattern, setPattern] = useState<keyof typeof patterns>("box");
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const steps = patterns[pattern].steps;
  const total = steps.reduce((s, [, n]) => s + n, 0) * 4;

  useEffect(() => {
    if (!running) return;
    const dur = steps[stepIdx][1] * 1000;
    const t = setTimeout(() => {
      setStepIdx((i) => (i + 1) % steps.length);
      setElapsed((e) => e + steps[stepIdx][1]);
    }, dur);
    return () => clearTimeout(t);
  }, [running, stepIdx, steps]);

  if (elapsed >= total && running) {
    return (
      <End
        durationSec={total}
        onReset={() => {
          setElapsed(0);
          setRunning(false);
          setStepIdx(0);
        }}
      />
    );
  }

  const [label, secs] = steps[stepIdx];
  const inhaling = label === "In";
  const exhaling = label === "Out";
  const progress = elapsed / total;

  return (
    <div className="fixed inset-0 flex flex-col bg-background max-w-md mx-auto">
      <div className="flex items-center justify-between px-5 pt-4 safe-top">
        <Link to="/wellness" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
          <ChevronLeft size={20} className="text-muted-foreground" />
        </Link>
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
          <X size={18} className="text-muted-foreground" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative h-[min(72vw,280px)] w-[min(72vw,280px)] flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#d4b896"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray={`${progress * 289} 289`}
            />
          </svg>
          <div
            className="rounded-full bg-surface-raised border border-border"
            style={{
              width: "72%",
              height: "72%",
              transform: inhaling ? "scale(1.08)" : exhaling ? "scale(0.82)" : "scale(0.95)",
              transition: `transform ${secs}s cubic-bezier(0.45, 0, 0.55, 1)`,
              boxShadow: "0 0 60px -15px rgba(212, 184, 150, 0.35)",
            }}
          />
          <p className="absolute text-3xl font-medium tracking-tight" key={label}>
            {label}
          </p>
        </div>

        {!running ? (
          <div className="w-full max-w-xs mt-14">
            <div className="oura-segmented mb-6">
              {(Object.keys(patterns) as (keyof typeof patterns)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  data-active={pattern === k}
                  onClick={() => setPattern(k)}
                >
                  {patterns[k].name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setRunning(true)} className="oura-btn oura-btn-primary">
              Begin
            </button>
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted-foreground tabular-nums">
            {Math.max(0, Math.ceil(total - elapsed))}s
          </p>
        )}
      </div>
    </div>
  );
}

function End({ durationSec, onReset }: { durationSec: number; onReset: () => void }) {
  const { isApiConnected } = useBridgeApi();
  const log = useMutation({
    mutationFn: () => api.logWellnessSession("breathing", durationSec),
  });

  useEffect(() => {
    if (isApiConnected) log.mutate();
  }, [isApiConnected]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 bg-background max-w-md mx-auto text-center">
      <p className="oura-label mb-2">Complete</p>
      <h2 className="text-3xl font-semibold mb-2">Nice work.</h2>
      <p className="text-sm text-muted-foreground mb-10">How do you feel now?</p>
      <div className="flex gap-3 mb-10">
        {["😞", "😕", "😐", "🙂", "😄"].map((e) => (
          <button key={e} type="button" className="h-12 w-12 rounded-2xl bg-surface-raised text-2xl border border-border">
            {e}
          </button>
        ))}
      </div>
      <Link to="/home" onClick={onReset} className="oura-btn oura-btn-primary max-w-xs">
        Done
      </Link>
      <Link to="/circle/launch" className="mt-4 text-xs text-muted-foreground">
        Share with your circle
      </Link>
      {log.isSuccess && <p className="text-[10px] text-mint mt-4">Logged privately.</p>}
    </div>
  );
}
