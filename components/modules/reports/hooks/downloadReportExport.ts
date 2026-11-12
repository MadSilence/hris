import { triggerExportPostDownload } from "@/components/modules/settings/shared/ExportDataModal";
import type { ExportDataFormat } from "@/components/modules/settings/shared/ExportDataModal";
import type { ReportDefinition, ReportTime } from "@/api/modules/reports/dto";

/** A saved report by its id, or an unsaved definition (the builder); `time` overrides the saved one. */
export type ReportExportTarget =
  | { reportId: string; time?: ReportTime | null }
  | { definition: ReportDefinition; time?: ReportTime | null };

/**
 * Downloads a report as a file through the route that streams it, the way the People export does. The
 * failure is not put on screen here: a 403 has already been announced by `InternalApiClient`, and anything
 * else is for the dialog that is still open (see `triggerExportPostDownload`).
 */
export const downloadReportExport = async (target: ReportExportTarget, format: ExportDataFormat): Promise<void> => {
  if ("reportId" in target) {
    await triggerExportPostDownload(`/api/reports/${encodeURIComponent(target.reportId)}/export`, format, {
      time: target.time ?? null,
    });
    return;
  }
  await triggerExportPostDownload("/api/reports/run/export", format, {
    definition: target.definition,
    time: target.time ?? null,
  });
};
