import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
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

const path = (id: string) => `/reports/${encodeURIComponent(id)}`;

/** `/reports` — the reports module (REPORTS_DESIGN.md § 11), and its one public route. */
export class HrisApiReportsClient {
  public async list(): Promise<ReportSummaryDTO[]> {
    return hrisApiClient.get<ReportSummaryDTO[]>("/reports");
  }

  public async get(id: string): Promise<ReportDTO> {
    return hrisApiClient.get<ReportDTO>(path(id));
  }

  /** A dataset's fields and measures as this reader may use them; PEOPLE when none is named. */
  public async datasets(dataset?: ReportDataset): Promise<ReportDatasetDTO> {
    return hrisApiClient.get<ReportDatasetDTO>(dataset ? `/reports/datasets?dataset=${dataset}` : "/reports/datasets");
  }

  /** The gallery: every report template made concrete for this company. Applying one is `/templates/{key}/apply`. */
  public async templates(): Promise<ReportTemplateDTO[]> {
    return hrisApiClient.get<ReportTemplateDTO[]>("/reports/templates");
  }

  public async create(body: ReportCreateRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>("/reports/create", { ...body });
  }

  public async update(id: string, body: ReportUpdateRequest): Promise<ReportDTO> {
    return hrisApiClient.patch<ReportDTO, ReportUpdateRequest>(path(id), body);
  }

  public async delete(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${path(id)}/delete`);
  }

  public async duplicate(id: string): Promise<ReportDTO> {
    return hrisApiClient.post<ReportDTO>(`${path(id)}/duplicate`);
  }

  /** A POST read: a definition is a structure, not a value. */
  public async run(definition: ReportDefinition, cursor?: string | null): Promise<ReportResult> {
    return hrisApiClient.post<ReportResult>("/reports/run", { definition, cursor: cursor ?? null });
  }

  public async runSaved(id: string, body: ReportRunRequest): Promise<ReportResult> {
    return hrisApiClient.post<ReportResult>(`${path(id)}/run`, { ...body });
  }

  public async drilldown(body: ReportDrilldownRequest): Promise<ReportDrilldownDTO> {
    return hrisApiClient.post<ReportDrilldownDTO>("/reports/drilldown", { ...body });
  }

  public async drivers(body: ReportDriversRequest): Promise<ReportDriversDTO> {
    return hrisApiClient.post<ReportDriversDTO>("/reports/drivers", { ...body });
  }

  /** A saved report as a file. The raw response, so the route can stream it on. */
  public async exportSaved(id: string, body: ReportExportRequest): Promise<Response> {
    return hrisApiClient.postForBinary(`${path(id)}/export`, body);
  }

  /** An unsaved definition as a file. */
  public async exportUnsaved(body: ReportExportRequest): Promise<Response> {
    return hrisApiClient.postForBinary("/reports/run/export", body);
  }

  public async shares(id: string): Promise<ReportShareDTO[]> {
    return hrisApiClient.get<ReportShareDTO[]>(`${path(id)}/shares`);
  }

  public async share(id: string, body: ReportShareRequest): Promise<ReportShareDTO[]> {
    return hrisApiClient.post<ReportShareDTO[]>(`${path(id)}/shares`, { ...body });
  }

  /** Who of the people these grantees reach will not see which of the report's fields. Reads only. */
  public async sharePreview(id: string, body: ReportShareRequest): Promise<ReportSharePreviewDTO> {
    return hrisApiClient.post<ReportSharePreviewDTO>(`${path(id)}/shares/preview`, { ...body });
  }

  public async updateShare(id: string, shareId: string, body: ReportUpdateShareRequest): Promise<ReportShareDTO> {
    return hrisApiClient.patch<ReportShareDTO, ReportUpdateShareRequest>(
      `${path(id)}/shares/${encodeURIComponent(shareId)}`,
      body,
    );
  }

  public async unshare(id: string, shareId: string): Promise<void> {
    await hrisApiClient.delete<void>(`${path(id)}/shares/${encodeURIComponent(shareId)}`);
  }

  public async publish(id: string, body: ReportPublishRequest): Promise<ReportPublishedDTO> {
    return hrisApiClient.post<ReportPublishedDTO>(`${path(id)}/publications`, { ...body });
  }

  /** One report's publications, or — with no report and MANAGE — every publication of the company. */
  public async publications(reportId?: string): Promise<ReportPublicationDTO[]> {
    return hrisApiClient.get<ReportPublicationDTO[]>(
      reportId ? `/reports/publications?reportId=${encodeURIComponent(reportId)}` : "/reports/publications",
    );
  }

  public async revokePublication(publicationId: string): Promise<void> {
    await hrisApiClient.post<void>(`/reports/publications/${encodeURIComponent(publicationId)}/revoke`);
  }

  /**
   * Without a session: the published snapshot behind a link. The token is the credential, and no Bearer
   * travels with it (`/public/reports/` is in `publicBackendPaths`).
   */
  public async openPublic(token: string): Promise<ReportPublicDTO> {
    return hrisApiClient.get<ReportPublicDTO>(`/public/reports/${encodeURIComponent(token)}`);
  }
}

export const hrisApiReportsClient = new HrisApiReportsClient();
