"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import type { EnvelopeDTO, SigningHistoryEvent } from "@/api/modules/signing/dto";

export const signingQueryKeys = {
  person: (userId: string) => ["SIGNING", "PERSON", userId] as const,
  history: (documentId: string) => ["SIGNING", "HISTORY", documentId] as const,
};

/** The signings of one person's documents — newest first, as the backend lists them. */
export const useEnvelopesForPerson = (userId: string | null) =>
  useQuery<EnvelopeDTO[]>({
    queryKey: signingQueryKeys.person(userId ?? ""),
    queryFn: () => internalApiClient.get<EnvelopeDTO[]>(`/signing/person/${userId}`),
    enabled: Boolean(userId),
  });

export const useSigningHistory = (documentId: string | null) =>
  useQuery<SigningHistoryEvent[]>({
    queryKey: signingQueryKeys.history(documentId ?? ""),
    queryFn: () => internalApiClient.get<SigningHistoryEvent[]>(`/signing/history?documentId=${encodeURIComponent(documentId ?? "")}`),
    enabled: Boolean(documentId),
  });

/** After a send, a remind or a cancel: every signing list and history read again. */
export const useInvalidateSigning = () => {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["SIGNING"] });
};

/** The latest signing of each file of the person's — what the row's pill and its panel show. */
export const latestByDocument = (envelopes: EnvelopeDTO[] | undefined): Map<string, EnvelopeDTO> => {
  const out = new Map<string, EnvelopeDTO>();
  for (const e of envelopes ?? []) {
    if (!e.sourceDocumentId) continue;
    const kept = out.get(e.sourceDocumentId);
    if (!kept || kept.sentAt < e.sentAt) out.set(e.sourceDocumentId, e);
    if (e.signedDocumentId && !out.has(e.signedDocumentId)) out.set(e.signedDocumentId, e);
  }
  return out;
};
