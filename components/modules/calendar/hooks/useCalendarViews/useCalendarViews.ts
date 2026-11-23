"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { CalendarView, CalendarViewPayload } from "@/models/calendarView";
import {
  createCalendarViewAction,
  deleteCalendarViewAction,
  reorderCalendarViewsAction,
  updateCalendarViewAction,
  type CalendarViewActionResult,
} from "@/components/modules/calendar/actions/calendarViewActions";

export const CALENDAR_VIEWS_QK = ["CALENDAR_VIEWS"];

/** The reader's own views, in the order they put them (N08c). */
export const useCalendarViews = () =>
  useQuery<CalendarView[]>({
    queryKey: CALENDAR_VIEWS_QK,
    queryFn: () => internalApiClient.get<CalendarView[]>("/calendar-views"),
    staleTime: 60 * 1000,
  });

/** Turns the action envelope into a rejected mutation, which is what react-query needs. */
function unwrap<T>(result: CalendarViewActionResult<T>): T {
  if (result.status !== ActionStatus.SUCCESS) {
    throw new Error(result.errorMessage ?? "Action failed");
  }
  return result.data as T;
}

export const useCalendarViewMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CALENDAR_VIEWS_QK });

  const create = useMutation({
    mutationFn: (vars: { name: string; payload: CalendarViewPayload }) =>
      createCalendarViewAction(vars.name, vars.payload).then(unwrap),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; name: string; payload: CalendarViewPayload }) =>
      updateCalendarViewAction(vars.id, vars.name, vars.payload).then(unwrap),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCalendarViewAction(id).then(unwrap),
    onSuccess: invalidate,
  });

  /**
   * Drop saves the order at once (N08c). The row moves before the answer — a pill that jumps back while the request
   * is out reads as a refusal — and a real refusal puts the old order back.
   */
  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderCalendarViewsAction(ids).then(unwrap),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: CALENDAR_VIEWS_QK });
      const previous = queryClient.getQueryData<CalendarView[]>(CALENDAR_VIEWS_QK);
      if (previous) {
        const byId = new Map(previous.map((v) => [v.id, v]));
        const next = ids.map((id) => byId.get(id)).filter((v): v is CalendarView => v !== undefined);
        queryClient.setQueryData(CALENDAR_VIEWS_QK, [...next, ...previous.filter((v) => !ids.includes(v.id))]);
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(CALENDAR_VIEWS_QK, context.previous);
    },
    onSuccess: (views) => queryClient.setQueryData(CALENDAR_VIEWS_QK, views),
  });

  return { create, update, remove, reorder };
};
