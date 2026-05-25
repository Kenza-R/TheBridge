export const CIRCLE_ROLES = [
  { value: "first_reach" as const, label: "First Reach" },
  { value: "backup" as const, label: "Backup" },
  { value: "checkin_buddy" as const, label: "Check-In Buddy" },
];

export const NOTIFY_RULES = [
  { value: "always" as const, label: "Always notify" },
  { value: "delayed_4h" as const, label: "Delay 4 hours" },
  { value: "manual_only" as const, label: "Manual only" },
];

export const WEARABLE_OPTIONS = [
  { value: "apple_watch" as const, label: "Apple Watch" },
  { value: "garmin" as const, label: "Garmin" },
  { value: "whoop" as const, label: "WHOOP" },
  { value: "oura" as const, label: "Oura" },
  { value: "fitbit" as const, label: "Fitbit" },
];

export const HARD_EVENT_TAGS = [
  { tag: "lost_patient" as const, label: "Patient death" },
  { tag: "complication" as const, label: "Complication" },
  { tag: "rough_shift" as const, label: "Rough shift" },
  { tag: "hostile_encounter" as const, label: "Difficult encounter" },
  { tag: "moral_injury" as const, label: "Moral injury" },
  { tag: "long_shift" as const, label: "Long shift" },
] as const;

/** API distress 0–100 (higher = worse) → wellbeing 0–100 (higher = better) */
export function distressToWellbeing(distress: number): number {
  return Math.max(0, Math.min(100, 100 - distress));
}
