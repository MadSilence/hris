import { attributeService } from "@/api/modules/attributes/services/attributeService";

export class AttributesRoutes {
  public async getImpact(id: string) {
    const impact = await attributeService.getAttributeImpact(id);
    return Response.json(impact);
  }

  public async exportAttributes(req: Request) {
    const backendResponse = await attributeService.exportAttributes(formatOf(req));
    // Streamed through untouched — the file is written by the backend.
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }
}

const formatOf = (req: Request): "csv" | "xlsx" =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

export const attributesRoutes = new AttributesRoutes();
