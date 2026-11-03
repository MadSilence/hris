"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  CalibrationSession,
  CalibrationSummary,
  Cycle,
  CycleResults,
  CycleOverview,
  CycleSummary,
  LaunchPreview,
  MyReviews,
  Nomination,
  Packet,
  PacketSummary,
  ReviewStepKind,
  Writing,
} from "@/models/reviews";
import { reviewQueryKeys } from "./reviewQueryKeys";

export const useReviewCycles = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CycleSummary[]>({
    queryKey: reviewQueryKeys.cycles,
    queryFn: () => internalApiClient.get<CycleSummary[]>("/reviews/cycles"),
    enabled,
  });
};

/** The cycle templates (REVIEWS_PLAN.md 11.2): the overview's Templates section and "From a Template". */
export const useReviewCycleTemplates = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CycleSummary[]>({
    queryKey: reviewQueryKeys.templates,
    queryFn: () => internalApiClient.get<CycleSummary[]>("/reviews/cycles/templates"),
    enabled,
  });
};

export const useReviewCycle = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Cycle>({
    queryKey: reviewQueryKeys.cycle(id ?? ""),
    queryFn: () => internalApiClient.get<Cycle>(`/reviews/cycles/${id}`),
    enabled: Boolean(id),
  });
};

export const useCycleOverview = (id: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CycleOverview>({
    queryKey: reviewQueryKeys.overview(id),
    queryFn: () => internalApiClient.get<CycleOverview>(`/reviews/cycles/${id}/overview`),
    enabled,
  });
};

/** Asked when the launch dialog opens, and again whenever it is opened afresh: a preview goes stale. */
export const useLaunchPreview = (id: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<LaunchPreview>({
    queryKey: reviewQueryKeys.launchPreview(id),
    queryFn: () => internalApiClient.get<LaunchPreview>(`/reviews/cycles/${id}/launch-preview`),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMyReviews = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<MyReviews>({
    queryKey: reviewQueryKeys.mine,
    queryFn: () => internalApiClient.get<MyReviews>("/reviews/me"),
  });
};

export const useReviewAssignment = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Writing>({
    queryKey: reviewQueryKeys.assignment(id ?? ""),
    queryFn: () => internalApiClient.get<Writing>(`/reviews/assignments/${id}`),
    enabled: Boolean(id),
  });
};

export const useAssignmentByTask = (taskId: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<{ assignmentId: string }>({
    queryKey: reviewQueryKeys.byTask(taskId),
    queryFn: () => internalApiClient.get<{ assignmentId: string }>(`/reviews/assignments/by-task/${taskId}`),
  });
};

export const useReviewPacket = (participantId: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Packet>({
    queryKey: reviewQueryKeys.packet(participantId),
    queryFn: () => internalApiClient.get<Packet>(`/reviews/packets/${participantId}`),
  });
};

/** A person's nomination of their peers — for them to nominate, for their manager to approve (10.2). */
export const useReviewNomination = (participantId: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Nomination>({
    queryKey: reviewQueryKeys.nomination(participantId),
    queryFn: () => internalApiClient.get<Nomination>(`/reviews/nominations/${participantId}`),
  });
};

/** The step a Tasks row points at — nominating, approving peers, approving a review. */
export const useStepByTask = (taskId: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<{ kind: ReviewStepKind; participantId: string }>({
    queryKey: reviewQueryKeys.stepByTask(taskId),
    queryFn: () => internalApiClient.get<{ kind: ReviewStepKind; participantId: string }>(`/reviews/steps/by-task/${taskId}`),
  });
};

export const usePersonReviews = (userId: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PacketSummary[]>({
    queryKey: reviewQueryKeys.person(userId),
    queryFn: () => internalApiClient.get<PacketSummary[]>(`/reviews/people/${userId}`),
  });
};

/** A cycle's calibration sessions (REVIEWS_PLAN.md 12.1). */
export const useCalibrations = (cycleId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CalibrationSummary[]>({
    queryKey: reviewQueryKeys.calibrations(cycleId),
    queryFn: () => internalApiClient.get<CalibrationSummary[]>(`/reviews/cycles/${cycleId}/calibrations`),
    enabled,
  });
};

export const useCalibration = (id: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CalibrationSession>({
    queryKey: reviewQueryKeys.calibration(id),
    queryFn: () => internalApiClient.get<CalibrationSession>(`/reviews/calibrations/${id}`),
  });
};

/** A cycle's results reports (12.3): numbers only. */
export const useCycleResults = (cycleId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CycleResults>({
    queryKey: reviewQueryKeys.results(cycleId),
    queryFn: () => internalApiClient.get<CycleResults>(`/reviews/cycles/${cycleId}/results`),
    enabled,
  });
};

/** Everything a write may have changed: lists, the cycle, its overview, my reviews, packets. */
export const useInvalidateReviews = () => {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.cycles }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.cycleRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.overviewRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.mine }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.assignmentRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.packetRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.personRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.nominationRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.calibrationsRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.calibrationRoot }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.resultsRoot }),
    queryClient.invalidateQueries({ queryKey: ["MY_TASKS"] }),
  ]);
};
