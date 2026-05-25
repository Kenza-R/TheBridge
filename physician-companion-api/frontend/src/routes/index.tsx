import { createFileRoute, Link } from "@tanstack/react-router";
import { ScoreRing } from "@/components/bridge/ScoreRing";

export const Route = createFileRoute("/")({ component: Welcome });

function Welcome() {
  return (
    <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center pt-16">
        <div className="mb-10 opacity-90 scale-[0.85] pointer-events-none">
          <ScoreRing score={72} label="Resilience" sublabel="Private · physician-only" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-center animate-fade-up">Bridge</h1>
        <p
          className="mt-3 text-center text-muted-foreground text-[15px] max-w-[260px] leading-relaxed animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Ambient wellbeing for physicians — calm signals, peer support, zero employer visibility.
        </p>
      </div>

      <div className="space-y-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <Link to="/onboarding/verify" className="oura-btn oura-btn-primary">
          Get started
        </Link>
        <p className="text-center text-sm text-muted-foreground pt-2">
          Already set up?{" "}
          <Link to="/settings/connection" className="text-foreground font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
