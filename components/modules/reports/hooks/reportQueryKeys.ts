import type {
  ReportDataset,
  ReportDefinition,
  ReportDrilldownRequest,
  ReportDriversRequest,
  ReportRunRequest,
  ReportShareRequest,
} from "@/api/modules/reports/dto";

/**
 * Every reports query sits under `all`, so `useInvalidateReportsQuery` refreshes the module at once. The
 * runs sit under `runs`, so a changed definition refreshes every result without touching the catalogue.
 */
export const reportQueryKeys = {
  all: ["REPORTS"] as const,
  list: ["REPORTS", "LIST"] as const,
  reportRoot: ["REPORTS", "REPORT"] as const,
  report: (id: string) => ["REPORTS", "REPORT", id] as const,
  datasets: (dataset?: ReportDataset) => ["REPORTS", "DATASETS", dataset ?? "DEFAULT"] as const,
  templates: ["REPORTS", "TEMPLATES"] as const,
  runs: ["REPORTS", "RUN"] as const,
  run: (definition: ReportDefinition, cursor?: string | null) =>
    ["REPORTS", "RUN", "UNSAVED", definition, cursor ?? null] as const,
  savedRuns: (id: string) => ["REPORTS", "RUN", "SAVED", id] as const,
  runSaved: (id: string, request: ReportRunRequest) => ["REPORTS", "RUN", "SAVED", id, request] as const,
  drilldown: (request: ReportDrilldownRequest) => ["REPORTS", "RUN", "DRILLDOWN", request] as const,
  drivers: (request: ReportDriversRequest) => ["REPORTS", "RUN", "DRIVERS", request] as const,
  shares: (id: string) => ["REPORTS", "SHARES", id] as const,
  sharePreview: (id: string, request: ReportShareRequest) => ["REPORTS", "SHARES", id, "PREVIEW", request] as const,
  publicationsRoot: ["REPORTS", "PUBLICATIONS"] as const,
  publications: (reportId?: string) => ["REPORTS", "PUBLICATIONS", reportId ?? "ALL"] as const,
};
