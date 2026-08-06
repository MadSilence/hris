import { attributeService } from "@/api/modules/attributes/services/attributeService";

export class AttributesRoutes {
  public async getImpact(id: string) {
    const impact = await attributeService.getAttributeImpact(id);
    return Response.json(impact);
  }
}

export const attributesRoutes = new AttributesRoutes();
