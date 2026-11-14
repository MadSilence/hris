"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { CompanyState, GoLivePreview, GoLiveStatus } from "@/models/demo";

export const demoQueryKeys = {
  state: ["COMPANY_STATE"] as const,
  goLive: ["GO_LIVE"] as const,
  preview: ["GO_LIVE_PREVIEW"] as const,
};

/** Whether the company is a demo, in its trial, read-only — for the banner and the demo's limits (DEMO_PLAN.md 4.1). */
export const useCompanyState = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CompanyState>({
    queryKey: demoQueryKeys.state,
    queryFn: () => internalApiClient.get<CompanyState>("/company/state"),
    staleTime: 60_000,
  });
};

/** True only once the state says so: an unknown state shows no demo limits. */
export const useIsDemo = (): boolean => useCompanyState().data?.isDemo === true;

/** Where going live stands; polls while the job runs, as the setup wizard's progress screen does. */
export const useGoLiveStatus = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<GoLiveStatus | null>({
    queryKey: demoQueryKeys.goLive,
    queryFn: async () => (await internalApiClient.get<GoLiveStatus | null>("/go-live")) ?? null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "ACTIVATED" || status === "RUNNING" || status === "REQUESTED" ? 3_000 : false;
    },
  });
};

export const useGoLivePreview = (enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<GoLivePreview>({
    queryKey: demoQueryKeys.preview,
    queryFn: () => internalApiClient.get<GoLivePreview>("/go-live/preview"),
    enabled,
  });
};

export const useInvalidateDemo = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.state }),
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.goLive }),
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.preview }),
    ]);
};
