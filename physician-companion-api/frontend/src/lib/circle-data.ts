import type { CircleMember } from "./bridge-store";

/** Demo resilience + social data until circle wellbeing API ships */

export type CircleMemberView = CircleMember & {
  resilienceScore: number;
  trend: "up" | "down" | "stable";
  scoresShared: boolean;
};

const DEMO_SCORES: Record<string, { score: number; trend: CircleMemberView["trend"] }> = {
  "1": { score: 74, trend: "stable" },
  "2": { score: 61, trend: "down" },
  "3": { score: 82, trend: "up" },
};

export function enrichCircleMember(m: CircleMember): CircleMemberView {
  const demo = DEMO_SCORES[m.id] ?? { score: 68 + (m.id.charCodeAt(0) % 20), trend: "stable" as const };
  return {
    ...m,
    resilienceScore: demo.score,
    trend: demo.trend,
    scoresShared: true,
  };
}

export type SocialEvent = {
  id: string;
  title: string;
  detail: string;
  when: string;
  icon: "dinner" | "coffee" | "walk";
  withNames: string[];
};

export const UPCOMING_SOCIAL: SocialEvent[] = [
  {
    id: "e1",
    title: "Post-shift dinner",
    detail: "Mercy cafeteria · casual debrief",
    when: "Thu · 7:00 PM",
    icon: "dinner",
    withNames: ["Dr. Chen", "Dr. Reyes"],
  },
  {
    id: "e2",
    title: "Saturday walk",
    detail: "River trail · phones optional",
    when: "Sat · 9:00 AM",
    icon: "walk",
    withNames: ["Dr. Okafor", "Dr. Chen"],
  },
];

export type CoffeeBreakPrompt = {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  inMinutes: number;
  location: string;
};

export function getCoffeeBreakPrompts(circle: CircleMember[]): CoffeeBreakPrompt[] {
  if (circle.length === 0) return [];
  const peer = circle[0];
  return [
    {
      id: "coffee-1",
      memberId: peer.id,
      memberName: peer.name,
      initials: peer.initials,
      inMinutes: 120,
      location: "Café near South Wing",
    },
  ];
}
