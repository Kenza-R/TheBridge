import { create } from "zustand";

export type CircleMember = {
  id: string;
  name: string;
  specialty: string;
  role: "First Reach" | "Backup" | "Check-In Buddy";
  available: "off" | "on" | "dnd";
  initials: string;
};

type BridgeState = {
  triggerActive: boolean;
  setTrigger: (v: boolean) => void;
  circle: CircleMember[];
  addMember: (m: CircleMember) => void;
  removeMember: (id: string) => void;
};

export const useBridge = create<BridgeState>((set) => ({
  triggerActive: true,
  setTrigger: (v) => set({ triggerActive: v }),
  circle: [
    { id: "1", name: "Dr. Chen", specialty: "Internal Medicine", role: "First Reach", available: "off", initials: "MC" },
    { id: "2", name: "Dr. Okafor", specialty: "Emergency Medicine", role: "Backup", available: "on", initials: "AO" },
    { id: "3", name: "Dr. Reyes", specialty: "Pediatrics", role: "Check-In Buddy", available: "off", initials: "JR" },
  ],
  addMember: (m) => set((s) => ({ circle: [...s.circle, m] })),
  removeMember: (id) => set((s) => ({ circle: s.circle.filter((c) => c.id !== id) })),
}));
