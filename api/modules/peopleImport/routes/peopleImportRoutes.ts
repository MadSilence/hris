import { hrisPeopleImportService } from "@/api/modules/peopleImport/services";
import { formatOf, streamBinary } from "@/api/utils/exportResponse/exportResponse";

/**
 * The client-side reads of people import, plus one write that cannot be a server action.
 *
 * **The upload is a route handler, not an action**, and that is the transport table's own exception:
 * a server action's body is capped at 1 MB by default and an import file may be 5 MB, the same reason
 * document upload streams through a route of its own (`hris/CLAUDE.md` § "Transport by purpose").
 * Every other step is a server action.
 */
export class PeopleImportRoutes {
  public async getCurrent() {
    const current = await hrisPeopleImportService.getCurrent();
    return current ? Response.json(current) : new Response(null, { status: 204 });
  }

  public async get(id: string) {
    return Response.json(await hrisPeopleImportService.get(id));
  }

  public async rows(req: Request, id: string) {
    const errorsOnly = new URL(req.url).searchParams.get("errorsOnly") === "true";
    return Response.json(await hrisPeopleImportService.rows(id, errorsOnly));
  }

  public async upload(req: Request) {
    const form = await req.formData();
    return Response.json(await hrisPeopleImportService.upload(form), { status: 201 });
  }

  public async template(req: Request) {
    return streamBinary(await hrisPeopleImportService.template(formatOf(req)));
  }

  public async errorFile(id: string) {
    return streamBinary(await hrisPeopleImportService.errorFile(id));
  }
}

export const peopleImportRoutes = new PeopleImportRoutes();
