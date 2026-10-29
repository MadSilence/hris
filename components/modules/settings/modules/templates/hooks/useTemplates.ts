"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  TemplateApplicationDTO,
  TemplateChoicesRequest,
  TemplateKind,
  TemplatePreviewDTO,
  TemplateSummaryDTO,
} from "@/api/modules/templates/dto";
import { applyTemplateAction } from "@/components/modules/settings/modules/templates/actions";

export const templatesQueryKeys = {
  all: ["TEMPLATES"] as const,
  list: (kind?: TemplateKind) => ["TEMPLATES", "LIST", kind ?? "ALL"] as const,
  preview: (key: string, choices: TemplateChoicesRequest) => ["TEMPLATES", "PREVIEW", key, choices] as const,
  application: (id: string) => ["TEMPLATES", "APPLICATION", id] as const,
};

/** The catalogue, already filtered by Java to the kinds the reader may apply. */
export const useTemplates = (kind?: TemplateKind, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TemplateSummaryDTO[]>({
    queryKey: templatesQueryKeys.list(kind),
    queryFn: () => internalApiClient.get<TemplateSummaryDTO[]>(kind ? `/templates?kind=${kind}` : "/templates"),
    enabled,
  });
};

/**
 * What applying would do in this company, with the choices made so far. A read sent as a POST; it is
 * asked again on every choice, because a choice changes outcomes elsewhere — skipping a field drops the
 * role grants pointing at it.
 */
export const useTemplatePreview = (key: string, choices: TemplateChoicesRequest, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TemplatePreviewDTO>({
    queryKey: templatesQueryKeys.preview(key, choices),
    queryFn: () => internalApiClient.post<TemplatePreviewDTO>(
      `/templates/${encodeURIComponent(key)}/preview`,
      { ...choices },
    ),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useTemplateApplication = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TemplateApplicationDTO>({
    queryKey: templatesQueryKeys.application(id ?? ""),
    queryFn: () => internalApiClient.get<TemplateApplicationDTO>(`/template-applications/${encodeURIComponent(id!)}`),
    enabled: Boolean(id),
  });
};

/**
 * Applies with the preview's choices. The envelope is returned as it is, not thrown: a TPL00002 ("the
 * company changed since the preview") is not a failure to show in a card but a reason to preview again.
 */
export const useApplyTemplate = (key: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choices: TemplateChoicesRequest) => applyTemplateAction(key, choices),
    onSettled: () => queryClient.invalidateQueries({ queryKey: templatesQueryKeys.all }),
  });
};
