import { hrisApiTemplatesClient } from "@/api/modules/templates/clients";
import type {
  TemplateApplicationDTO,
  TemplateApplyResponse,
  TemplateChoicesRequest,
  TemplateKind,
  TemplatePreviewDTO,
  TemplateSummaryDTO,
} from "@/api/modules/templates/dto";

export class HrisApiTemplatesService {
  public async list(kind?: TemplateKind): Promise<TemplateSummaryDTO[]> {
    return hrisApiTemplatesClient.list(kind);
  }

  public async preview(key: string, body: TemplateChoicesRequest): Promise<TemplatePreviewDTO> {
    return hrisApiTemplatesClient.preview(key, body);
  }

  public async apply(key: string, body: TemplateChoicesRequest): Promise<TemplateApplyResponse> {
    return hrisApiTemplatesClient.apply(key, body);
  }

  public async application(id: string): Promise<TemplateApplicationDTO> {
    return hrisApiTemplatesClient.application(id);
  }
}

export const hrisApiTemplatesService = new HrisApiTemplatesService();
