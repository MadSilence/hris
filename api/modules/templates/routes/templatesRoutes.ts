import { hrisApiTemplatesService } from "@/api/modules/templates/services";
import type { TemplateChoicesRequest, TemplateKind } from "@/api/modules/templates/dto";

const KINDS: TemplateKind[] = ["FIELD_SET", "ROLE", "PROCESS"];

export class TemplatesRoutes {
  public async list(request: Request) {
    const kind = new URL(request.url).searchParams.get("kind");
    const known = KINDS.find((k) => k === kind);
    return Response.json(await hrisApiTemplatesService.list(known));
  }

  /** A read sent as a POST: the body is the person's choices in the preview. */
  public async preview(request: Request, key: string) {
    const body = (await request.json().catch(() => ({}))) as TemplateChoicesRequest;
    return Response.json(await hrisApiTemplatesService.preview(key, body ?? {}));
  }

  public async application(id: string) {
    return Response.json(await hrisApiTemplatesService.application(id));
  }
}

export const templatesRoutes = new TemplatesRoutes();
