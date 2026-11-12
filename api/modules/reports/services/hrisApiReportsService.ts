import { hrisApiReportsClient } from "@/api/modules/reports/clients";
import type { CreateResponse } from "@/api/models/misc";
import type {
  ReportCreateRequest,
  ReportDataset,
  ReportDatasetDTO,
  ReportDefinition,
  ReportDrilldownDTO,
  ReportDrilldownRequest,
  ReportDriversDTO,
  ReportDriversRequest,
  ReportDTO,
  ReportExportRequest,
  ReportPublicationDTO,
  ReportPublicDTO,
  ReportPublishedDTO,
  ReportPublishRequest,
  ReportResult,
  ReportRunRequest,
  ReportShareDTO,
  ReportSharePreviewDTO,
  ReportShareRequest,
  ReportSummaryDTO,
  ReportTemplateDTO,
  ReportUpdateRequest,
  ReportUpdateShareRequest,
} from "@/api/modules/reports/dto";

/**
 * The seam for reports: every transport — route handlers, server actions, a server component — comes
 * through here. Java owns the access checks and every number; nothing is computed in the BFF.
 */
export class HrisApiReportsService {
  public async list(): Promise<ReportSummaryDTO[]> {
    return hrisApiReportsClient.list();
  }

  public async get(id: string): Promise<ReportDTO> {
    return hrisApiReportsClient.get(id);
  }

  public async datasets(dataset?: ReportDataset): Promise<ReportDatasetDTO> {
    return hrisApiReportsClient.datasets(dataset);
  }

  public async templates(): Promise<ReportTemplateDTO[]> {
    return hrisApiReportsClient.templates();
  }

  public async create(body: ReportCreateRequest): Promise<CreateResponse> {
    return hrisApiReportsClient.create(body);
  }

  public async update(id: string, body: ReportUpdateRequest): Promise<ReportDTO> {
    return hrisApiReportsClient.update(id, body);
  }

  public async delete(id: string): Promise<void> {
    return hrisApiReportsClient.delete(id);
  }

  public async duplicate(id: string): Promise<ReportDTO> {
    return hrisApiReportsClient.duplicate(id);
  }

  public async run(definition: ReportDefinition, cursor?: string | null): Promise<ReportResult> {
    return hrisApiReportsClient.run(definition, cursor);
  }

  public async runSaved(id: string, body: ReportRunRequest): Promise<ReportResult> {
    return hrisApiReportsClient.runSaved(id, body);
  }

  public async drilldown(body: ReportDrilldownRequest): Promise<ReportDrilldownDTO> {
    return hrisApiReportsClient.drilldown(body);
  }

  public async drivers(body: ReportDriversRequest): Promise<ReportDriversDTO> {
    return hrisApiReportsClient.drivers(body);
  }

  public async exportSaved(id: string, body: ReportExportRequest): Promise<Response> {
    return hrisApiReportsClient.exportSaved(id, body);
  }

  public async exportUnsaved(body: ReportExportRequest): Promise<Response> {
    return hrisApiReportsClient.exportUnsaved(body);
  }

  public async shares(id: string): Promise<ReportShareDTO[]> {
    return hrisApiReportsClient.shares(id);
  }

  public async share(id: string, body: ReportShareRequest): Promise<ReportShareDTO[]> {
    return hrisApiReportsClient.share(id, body);
  }

  public async sharePreview(id: string, body: ReportShareRequest): Promise<ReportSharePreviewDTO> {
    return hrisApiReportsClient.sharePreview(id, body);
  }

  public async updateShare(id: string, shareId: string, body: ReportUpdateShareRequest): Promise<ReportShareDTO> {
    return hrisApiReportsClient.updateShare(id, shareId, body);
  }

  public async unshare(id: string, shareId: string): Promise<void> {
    return hrisApiReportsClient.unshare(id, shareId);
  }

  public async publish(id: string, body: ReportPublishRequest): Promise<ReportPublishedDTO> {
    return hrisApiReportsClient.publish(id, body);
  }

  public async publications(reportId?: string): Promise<ReportPublicationDTO[]> {
    return hrisApiReportsClient.publications(reportId);
  }

  public async revokePublication(publicationId: string): Promise<void> {
    return hrisApiReportsClient.revokePublication(publicationId);
  }

  /** The public page's read, no session — for a server component, when that page is built. */
  public async openPublic(token: string): Promise<ReportPublicDTO> {
    return hrisApiReportsClient.openPublic(token);
  }
}

export const hrisApiReportsService = new HrisApiReportsService();
