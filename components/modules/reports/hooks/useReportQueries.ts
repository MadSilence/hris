"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  ReportDataset,
  ReportDatasetDTO,
  ReportDefinition,
  ReportDrilldownDTO,
  ReportDrilldownRequest,
  ReportDriversDTO,
  ReportDriversRequest,
  ReportDTO,
  ReportPublicationDTO,
  ReportResult,
  ReportRunRequest,
  ReportShareDTO,
  ReportSharePreviewDTO,
  ReportShareRequest,
  ReportSummaryDTO,
  ReportTemplateDTO,
} from "@/api/modules/reports/dto";
import { reportQueryKeys } from "./reportQueryKeys";

const reportPath = (id: string) => `/reports/${encodeURIComponent(id)}`;

/** The reports this person may open: their own and those shared with them. */
export const useReports = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportSummaryDTO[]>({
    queryKey: reportQueryKeys.list,
    queryFn: () => internalApiClient.get<ReportSummaryDTO[]>("/reports"),
    enabled,
  });
};

export const useReport = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportDTO>({
    queryKey: reportQueryKeys.report(id ?? ""),
    queryFn: () => internalApiClient.get<ReportDTO>(reportPath(id!)),
    enabled: Boolean(id),
  });
};

/** A dataset's fields and measures, as this reader may use them — what the builder offers. */
export const useReportDataset = (dataset?: ReportDataset, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportDatasetDTO>({
    queryKey: reportQueryKeys.datasets(dataset),
    queryFn: () =>
      internalApiClient.get<ReportDatasetDTO>(dataset ? `/reports/datasets?dataset=${dataset}` : "/reports/datasets"),
    enabled,
  });
};

/**
 * The gallery: every report template made concrete for this company, ready for `useReportRun` ("try
 * before keeping"). Applying one is `useApplyTemplate` from the templates module, as for every template.
 */
export const useReportTemplates = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportTemplateDTO[]>({
    queryKey: reportQueryKeys.templates,
    queryFn: () => internalApiClient.get<ReportTemplateDTO[]>("/reports/templates"),
    enabled,
  });
};

/**
 * An unsaved definition run — the builder, a template tried before applying. A read sent as a POST; the
 * previous result stays on screen while a changed definition runs.
 */
export const useReportRun = (definition: ReportDefinition | null, cursor?: string | null, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportResult>({
    queryKey: reportQueryKeys.run(definition ?? {}, cursor),
    queryFn: () => internalApiClient.post<ReportResult>("/reports/run", { definition, cursor: cursor ?? null }),
    enabled: enabled && definition !== null,
    placeholderData: keepPreviousData,
  });
};

/** A saved report's run, with an optional time override or a table's next page; what is saved is untouched. */
export const useSavedReportRun = (id: string | null, request: ReportRunRequest = {}, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportResult>({
    queryKey: reportQueryKeys.runSaved(id ?? "", request),
    queryFn: () => internalApiClient.post<ReportResult>(`${reportPath(id!)}/run`, { ...request }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

/** The people behind a group, asked with the group's key as the result gave it. */
export const useReportDrilldown = (request: ReportDrilldownRequest | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportDrilldownDTO>({
    queryKey: reportQueryKeys.drilldown(request ?? { key: [] }),
    queryFn: () => internalApiClient.post<ReportDrilldownDTO>("/reports/drilldown", { ...request }),
    enabled: request !== null,
  });
};

/** A measure's change between two dates broken down by every dimension the caller may use. */
export const useReportDrivers = (request: ReportDriversRequest | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportDriversDTO>({
    queryKey: reportQueryKeys.drivers(request ?? { from: "", to: "" }),
    queryFn: () => internalApiClient.post<ReportDriversDTO>("/reports/drivers", { ...request }),
    enabled: request !== null,
  });
};

/** Who a report is shared with. Only its owner may ask. */
export const useReportShares = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportShareDTO[]>({
    queryKey: reportQueryKeys.shares(id ?? ""),
    queryFn: () => internalApiClient.get<ReportShareDTO[]>(`${reportPath(id!)}/shares`),
    enabled: Boolean(id),
  });
};

/** Before sharing: which of the report's fields these grantees would not see, on how many people. */
export const useReportSharePreview = (id: string | null, request: ReportShareRequest, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportSharePreviewDTO>({
    queryKey: reportQueryKeys.sharePreview(id ?? "", request),
    queryFn: () => internalApiClient.post<ReportSharePreviewDTO>(`${reportPath(id!)}/shares/preview`, { ...request }),
    enabled: enabled && Boolean(id) && request.grantees.length > 0,
    placeholderData: keepPreviousData,
  });
};

/** One report's publications, or — with no report, for MANAGE — every publication of the company. */
export const useReportPublications = (reportId?: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ReportPublicationDTO[]>({
    queryKey: reportQueryKeys.publications(reportId),
    queryFn: () =>
      internalApiClient.get<ReportPublicationDTO[]>(
        reportId ? `/reports/publications?reportId=${encodeURIComponent(reportId)}` : "/reports/publications",
      ),
    enabled,
  });
};

export const useInvalidateReportsQuery = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
  };
};
