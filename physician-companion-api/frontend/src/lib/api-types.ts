export type PhysicianProfile = {
  id: string;
  displayName: string | null;
  npi: string;
  specialty: string | null;
  careerStage: string | null;
  onboardingDone: boolean;
  wearableType: string | null;
  thresholdConfig: {
    sustained_days: number;
    sustained_score: number;
    acute: number;
  };
  notificationPrefs: {
    silent_start: string;
    silent_end: string;
    max_per_day: number;
  };
  hospitalId: string;
};

export type CircleMemberApi = {
  id: string;
  ownerId: string;
  memberId: string;
  role: string;
  notifyRule: string;
  status: string;
  member: {
    id: string;
    specialty: string | null;
    careerStage: string | null;
    displayName: string | null;
  };
  owner?: {
    id: string;
    specialty: string | null;
    careerStage: string | null;
    displayName: string | null;
  };
};

export type PeerSearchResult = {
  id: string;
  displayName: string | null;
  specialty: string | null;
  careerStage: string | null;
};

export type MeditationTrack = {
  id: string;
  title: string;
  duration_sec: number;
  cdn_key: string;
  url: string | null;
  note?: string;
};

export type DistressScoreRow = {
  id: string;
  date: string;
  compositeScore: number;
  ehrSubScore: number | null;
  wearableSubScore: number | null;
  selfReportSubScore: number | null;
  triggerFired: boolean;
  triggerType: string | null;
};

export type PeerMessageRow = {
  id: string;
  senderId: string;
  recipientId: string;
  messageBody: string;
  messageType: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  expiresAt: string;
  sender?: { id: string; displayName: string | null; specialty: string | null };
  recipient?: { id: string; displayName: string | null; specialty: string | null };
};

export type PatchPhysicianBody = {
  wearable_type?: "apple_watch" | "garmin" | "whoop" | "oura" | "fitbit" | "none" | null;
  onboarding_done?: boolean;
  threshold_config?: PhysicianProfile["thresholdConfig"];
  notification_prefs?: PhysicianProfile["notificationPrefs"];
};
