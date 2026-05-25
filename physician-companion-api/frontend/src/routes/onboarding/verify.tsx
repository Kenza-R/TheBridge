import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";

export const Route = createFileRoute("/onboarding/verify")({ component: Verify });

function Verify() {
  const [showSecurity, setShowSecurity] = useState(false);
  return (
    <OuraPage className="pt-12">
      <p className="oura-label mb-6">Step 1 of 4</p>
      <h1 className="text-3xl font-semibold mb-2 tracking-tight">Verify your role</h1>
      <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
        Hospital SSO or NPI — we never access patient charts.
      </p>

      <button type="button" className="oura-btn oura-btn-primary mb-3">
        Sign in with Hospital SSO
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <input
          placeholder="Work email"
          className="w-full px-4 py-3.5 rounded-2xl bg-surface-raised border border-border text-sm focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
        <input
          placeholder="NPI number"
          className="w-full px-4 py-3.5 rounded-2xl bg-surface-raised border border-border text-sm focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
        <Link to="/onboarding/circle" className="oura-btn oura-btn-secondary">
          Continue
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setShowSecurity((s) => !s)}
        className="mt-10 w-full oura-card p-4 text-left flex gap-3"
      >
        <ShieldCheck size={18} className="text-gold mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Your data, your terms</p>
          {showSecurity && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Bridge only uses workflow metadata — login timing, note volume — never PHI.
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition ${showSecurity ? "rotate-180" : ""}`}
        />
      </button>
    </OuraPage>
  );
}
