import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Shield } from "lucide-react";
import { OuraPage } from "@/components/bridge/AppShell";

export const Route = createFileRoute("/settings/privacy")({ component: PrivacySettings });

function PrivacySettings() {
  return (
    <OuraPage>
      <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> You
      </Link>

      <div className="h-14 w-14 rounded-full bg-gold-soft flex items-center justify-center mb-6">
        <Shield size={24} className="text-gold" />
      </div>

      <p className="oura-label">Privacy</p>
      <h1 className="text-2xl font-semibold mt-1 mb-6">Hospital visibility</h1>

      <ul className="space-y-2 text-sm leading-relaxed">
        {[
          "Department heatmaps only — never your name, scores, or messages.",
          "Metrics hidden when fewer than 10 physicians in a cohort.",
          "Circle outreach only with your live approval.",
          "Messages auto-delete after 30 days.",
        ].map((text) => (
          <li key={text} className="oura-card px-4 py-3.5 text-foreground/85">
            {text}
          </li>
        ))}
      </ul>
    </OuraPage>
  );
}
