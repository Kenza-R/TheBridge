import type { CircleMemberApi } from "./api-types";
import type { CircleMember } from "./bridge-store";

const ROLE_LABELS: Record<string, CircleMember["role"]> = {
  first_reach: "First Reach",
  backup: "Backup",
  checkin_buddy: "Check-In Buddy",
};

export function mapCircleFromApi(row: CircleMemberApi): CircleMember {
  const name = row.member.displayName ?? "Colleague";
  const parts = name.replace(/^Dr\.\s*/i, "").split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? "??").toUpperCase();

  return {
    id: row.memberId,
    name: name.startsWith("Dr.") ? name : `Dr. ${name}`,
    specialty: row.member.specialty ?? "",
    role: ROLE_LABELS[row.role] ?? "Check-In Buddy",
    available: row.status === "accepted" ? "on" : "off",
    initials,
  };
}
