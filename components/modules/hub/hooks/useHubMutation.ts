"use client";

import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { useInvalidateHub } from "./useHubQueries";

/** A refusal carried out of an action: the catalogue's words, with the backend's code to branch on. */
export class HubActionError extends Error {
  public readonly code?: string;
  public constructor(message: string, code?: string) {
    super(message);
    this.name = "HubActionError";
    this.code = code;
  }
}

/** An ERROR envelope becomes a rejected promise — what react-query needs. The text is already the dictionary's. */
export const unwrapHub = <T,>(result: ActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR) throw new HubActionError(result.errorMessage ?? "", result.code);
  return result.data as T;
};

/**
 * One server action as a mutation. On success the whole hub is refreshed (`invalidate: false` for a write whose
 * answer the caller keeps itself — the editor's autosave).
 */
export const useHubMutation = <I, T>(action: (input: I) => Promise<ActionResult<T>>, options: { invalidate?: boolean } = {}) => {
  const invalidate = useInvalidateHub();
  return useMutation<T, Error, I>({
    mutationFn: async (input: I) => unwrapHub(await action(input)),
    onSuccess: () => {
      if (options.invalidate !== false) void invalidate();
    },
  });
};
