import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import type { SectionSort } from "@/api/modules/signing/dto";

type RouteContext = { params: Promise<{ view: string }> };

const SORTS: SectionSort[] = ["NAME", "PERSON", "CATEGORY", "EXPIRES", "UPLOADED"];

/**
 * The Documents item's lists (documents-section D01–D04): `documents`, `signings`, `requests`, `expiring` and the view
 * switch's `counts`. Java decides who may read each, and refuses a reader whose scope does not reach past themselves.
 */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { view } = await context.params;
  const params = new URL(req.url).searchParams;
  const q = params.get("q") ?? undefined;
  const personIds = params.getAll("personIds");
  const categoryIds = params.getAll("categoryIds");
  switch (view) {
    case "documents": {
      const sort = params.get("sort") as SectionSort | null;
      return Response.json(
        await hrisApiSigningService.sectionDocuments({
          q,
          personIds,
          categoryIds,
          sort: sort && SORTS.includes(sort) ? sort : "UPLOADED",
          asc: params.get("asc") === "true",
          offset: Number(params.get("offset") ?? 0) || 0,
          size: Number(params.get("size") ?? 50) || 50,
        }),
      );
    }
    case "signings":
      return Response.json(await hrisApiSigningService.sectionSignings({ q, personIds, categoryIds }));
    case "requests":
      return Response.json(await hrisApiSigningService.sectionRequests());
    case "expiring":
      return Response.json(await hrisApiSigningService.expiring());
    case "counts":
      return Response.json(await hrisApiSigningService.sectionCounts());
    default:
      return new Response(null, { status: 404 });
  }
});
