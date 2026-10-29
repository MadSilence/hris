"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type {
  PeopleImportDTO,
  PeopleImportRowDTO,
  PeopleImportUpdateRequest,
} from "@/api/modules/peopleImport/dto";
import {
  applyPeopleImportAction,
  checkPeopleImportAction,
  discardPeopleImportAction,
  invitePeopleImportAction,
  updatePeopleImportAction,
} from "@/components/modules/settings/modules/peopleImport/actions";

export const peopleImportQueryKeys = {
  current: ["PEOPLE_IMPORT", "current"] as const,
  rows: (id: string, errorsOnly: boolean) => ["PEOPLE_IMPORT", id, "rows", errorsOnly] as const,
};

/** Thrown with the action's envelope, so a step can say the dictionary's words beside its button. */
export class PeopleImportActionError extends Error {
  constructor(public readonly result: ActionResult) {
    super(result.errorMessage ?? "That step could not be done.");
    this.name = "PeopleImportActionError";
  }
}

const unwrap = <T,>(result: ActionResult<T>): T => {
  if (result.status !== ActionStatus.SUCCESS) throw new PeopleImportActionError(result);
  return result.data as T;
};

/**
 * The import the page shows — the newest one that is not over, or the last report. While it is being
 * applied the page asks every second and a half: the job has nothing to push its progress with.
 */
export const useCurrentPeopleImport = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PeopleImportDTO | null>({
    queryKey: peopleImportQueryKeys.current,
    queryFn: async () => (await internalApiClient.get<PeopleImportDTO | undefined>("/people-imports/current")) ?? null,
    refetchInterval: (query) => (query.state.data?.status === "APPLYING" ? 1500 : false),
    refetchIntervalInBackground: true,
  });
};

export const usePeopleImportRows = (id: string | undefined, errorsOnly: boolean, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PeopleImportRowDTO[]>({
    queryKey: peopleImportQueryKeys.rows(id ?? "none", errorsOnly),
    queryFn: () => internalApiClient.get<PeopleImportRowDTO[]>(`/people-imports/${id}/rows?errorsOnly=${errorsOnly}`),
    enabled: Boolean(id) && enabled,
  });
};

/** Every step answers the whole import; it becomes the page's state at once, and its rows are re-read. */
const useStepMutation = <V,>(run: (variables: V) => Promise<ActionResult<PeopleImportDTO>>) => {
  const queryClient = useQueryClient();
  return useMutation<PeopleImportDTO, Error, V>({
    mutationFn: async (variables) => unwrap(await run(variables)),
    onSuccess: (dto) => {
      queryClient.setQueryData(peopleImportQueryKeys.current, dto);
      void queryClient.invalidateQueries({ queryKey: ["PEOPLE_IMPORT", dto.id] });
    },
  });
};

/**
 * The upload — through the route handler rather than an action (the action body limit), and through
 * `InternalApiClient.fetch` so a refusal is typed and a stale session is renewed like everywhere else.
 */
export const useUploadPeopleImport = () => {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  return useMutation<PeopleImportDTO, Error, File>({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append("file", file, file.name);
      const response = await internalApiClient.fetch("/people-imports", { method: "POST", body: form });
      return (await response.json()) as PeopleImportDTO;
    },
    onSuccess: (dto) => {
      queryClient.setQueryData(peopleImportQueryKeys.current, dto);
    },
  });
};

export const useUpdatePeopleImport = () =>
  useStepMutation((input: { id: string; body: PeopleImportUpdateRequest }) => updatePeopleImportAction(input));

export const useCheckPeopleImport = () => useStepMutation((id: string) => checkPeopleImportAction(id));

export const useApplyPeopleImport = () => useStepMutation((id: string) => applyPeopleImportAction(id));

export const useInvitePeopleImport = () => useStepMutation((id: string) => invitePeopleImportAction(id));

export const useDiscardPeopleImport = () => useStepMutation((id: string) => discardPeopleImportAction(id));
