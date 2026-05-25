import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import type { CircleMemberApi, PhysicianProfile } from "@/lib/api-types";

type BridgeApiContextValue = {
  profile: PhysicianProfile | undefined;
  circle: CircleMemberApi[];
  pendingOutgoing: CircleMemberApi[];
  incomingInvites: CircleMemberApi[];
  isLoading: boolean;
  isApiConnected: boolean;
  error: Error | null;
  refetchAll: () => void;
  refetchCircle: () => void;
  invalidateProfile: () => void;
};

const BridgeApiContext = createContext<BridgeApiContextValue | null>(null);

export function BridgeApiProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["physician", "me"],
    queryFn: () => api.getPhysicianMe(),
    retry: false,
    staleTime: 60_000,
  });

  const circleQuery = useQuery({
    queryKey: ["physician", "circle"],
    queryFn: () => api.getCircle(),
    enabled: !!profileQuery.data,
    retry: false,
    staleTime: 30_000,
  });

  const allCircle = circleQuery.data?.circle ?? [];
  const circle = allCircle.filter((c) => c.status === "accepted");
  const pendingOutgoing = allCircle.filter((c) => c.status === "pending");
  const incomingInvites = circleQuery.data?.incoming ?? [];

  const refetchCircle = useCallback(() => {
    void circleQuery.refetch();
  }, [circleQuery]);

  const invalidateProfile = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["physician", "me"] });
  }, [queryClient]);

  const refetchAll = useCallback(() => {
    void profileQuery.refetch();
    void circleQuery.refetch();
  }, [profileQuery, circleQuery]);

  const isApiConnected = profileQuery.isSuccess;
  const error =
    (profileQuery.error as Error | null) ?? (circleQuery.error as Error | null);

  return (
    <BridgeApiContext.Provider
      value={{
        profile: profileQuery.data,
        circle,
        pendingOutgoing,
        incomingInvites,
        isLoading: profileQuery.isLoading || circleQuery.isLoading,
        isApiConnected,
        error: error instanceof ApiError ? error : error,
        refetchAll,
        refetchCircle,
        invalidateProfile,
      }}
    >
      {children}
    </BridgeApiContext.Provider>
  );
}

export function useBridgeApi() {
  const ctx = useContext(BridgeApiContext);
  if (!ctx) {
    throw new Error("useBridgeApi must be used within BridgeApiProvider");
  }
  return ctx;
}
