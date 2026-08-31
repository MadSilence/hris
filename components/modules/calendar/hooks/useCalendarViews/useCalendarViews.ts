"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { CalendarView, CalendarViewPayload } from "@/models/calendarView";
import {
  createCalendarViewAction,
  deleteCalendarViewAction,
  updateCalendarViewAction,
  type CalendarViewActionResult,
} from "@/components/modules/calendar/actions/calendarViewActions";

export const CALENDAR_VIEWS_QK = ["CALENDAR_VIEWS"];

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

  return { create, update, remove };
};
