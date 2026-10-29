import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TemplateApplicationDTO,
  TemplateApplyResponse,
  TemplateChoicesRequest,
  TemplateKind,
  TemplatePreviewDTO,
  TemplateSummaryDTO,
} from "@/api/modules/templates/dto";

/** `/templates` and `/template-applications` — the template catalogue. */
export class HrisApiTemplatesClient {
  public async list(kind?: TemplateKind): Promise<TemplateSummaryDTO[]> {
    return hrisApiClient.get<TemplateSummaryDTO[]>(kind ? `/templates?kind=${kind}` : "/templates");
  }

  public async preview(key: string, body: TemplateChoicesRequest): Promise<TemplatePreviewDTO> {
    return hrisApiClient.post<TemplatePreviewDTO>(`/templates/${encodeURIComponent(key)}/preview`, { ...body });
  }

  public async apply(key: string, body: TemplateChoicesRequest): Promise<TemplateApplyResponse> {
    return hrisApiClient.post<TemplateApplyResponse>(`/templates/${encodeURIComponent(key)}/apply`, { ...body });
  }

  public async application(id: string): Promise<TemplateApplicationDTO> {
    return hrisApiClient.get<TemplateApplicationDTO>(`/template-applications/${encodeURIComponent(id)}`);
  }
}

export const hrisApiTemplatesClient = new HrisApiTemplatesClient();
