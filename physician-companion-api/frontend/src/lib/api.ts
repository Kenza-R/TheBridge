import type {
  CircleMemberApi,
  DistressScoreRow,
  MeditationTrack,
  PatchPhysicianBody,
  PeerMessageRow,
  PhysicianProfile,
  PeerSearchResult,
} from "./api-types.js";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "/api/v1";

const TOKEN_KEY = "bridge_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_DEV_AUTH_TOKEN ?? null;
  }
  return (
    localStorage.getItem(TOKEN_KEY) ??
    import.meta.env.VITE_DEV_AUTH_TOKEN ??
    null
  );
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.statusText || "Request failed", res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getPhysicianMe: () => apiFetch<PhysicianProfile>("/physician/me"),

  patchPhysicianMe: (body: PatchPhysicianBody) =>
    apiFetch<PhysicianProfile>("/physician/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getCircle: () =>
    apiFetch<{ circle: CircleMemberApi[]; incoming: CircleMemberApi[] }>(
      "/physician/me/circle",
    ),

  searchPeers: (q?: string, specialty?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialty) params.set("specialty", specialty);
    const qs = params.toString();
    return apiFetch<{ peers: PeerSearchResult[] }>(
      `/peers/search${qs ? `?${qs}` : ""}`,
    );
  },

  inviteToCircle: (body: {
    target_physician_id: string;
    role: "first_reach" | "backup" | "checkin_buddy";
    notify_rule: "always" | "delayed_4h" | "manual_only";
  }) =>
    apiFetch<{ invite: CircleMemberApi }>("/physician/me/circle/invite", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  respondCircleInvite: (inviteId: string, status: "accepted" | "declined" | "limited") =>
    apiFetch<{ invite: CircleMemberApi }>(`/circle-invites/${inviteId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  submitSelfReport: (tag: string) =>
    apiFetch<{ id: string; tag: string }>("/self-report", {
      method: "POST",
      body: JSON.stringify({ tag }),
    }),

  submitConcernFlag: (target_id: string, private_note?: string) =>
    apiFetch<{ id: string; expires_at: string }>("/concern-flags", {
      method: "POST",
      body: JSON.stringify({ target_id, private_note }),
    }),

  submitScore: (body: {
    composite?: number;
    ehr?: number | null;
    wearable?: number | null;
    self_report?: number | null;
    signal_flags?: Record<string, boolean>;
  }) =>
    apiFetch<{ id: string; composite_score: number; date: string }>(
      "/physician/me/score",
      { method: "POST", body: JSON.stringify(body) },
    ),

  getScores: (days = 90) =>
    apiFetch<{ scores: DistressScoreRow[] }>(`/physician/me/scores?days=${days}`),

  sendMessage: (body: {
    recipient_id: string;
    body: string;
    message_type: "outreach" | "response" | "schedule" | "flag";
    include_schedule_cta?: boolean;
  }) =>
    apiFetch<{ message: { id: string; status: string; expires_at: string } }>("/messages", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMessages: (opts?: { unread?: boolean; direction?: "inbox" | "sent" }) => {
    const params = new URLSearchParams();
    if (opts?.unread) params.set("unread", "true");
    if (opts?.direction) params.set("direction", opts.direction);
    const qs = params.toString();
    return apiFetch<{ messages: PeerMessageRow[] }>(`/messages${qs ? `?${qs}` : ""}`);
  },

  getMeditations: () => apiFetch<{ tracks: MeditationTrack[] }>("/wellness/meditations"),

  logWellnessSession: (session_type: string, duration_sec: number) =>
    apiFetch<{ id: string }>("/wellness/sessions", {
      method: "POST",
      body: JSON.stringify({ session_type, duration_sec }),
    }),
};
