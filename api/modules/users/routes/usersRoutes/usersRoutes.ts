import { hrisApiUsersService, UsersSearchArgs } from "../../services/hrisUsersService";
import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import type { PeopleExportRequest } from "@/models/user/peopleExport";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class UsersRoutes {
  public async getUsers(req: Request) {
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get("limit") ?? "100");
    const cursor = searchParams.get("cursor");
    const q = searchParams.get("q") ?? undefined;
    const sortField = searchParams.get("sortField") ?? undefined;
    const sortDir = (searchParams.get("sortDir") ?? undefined) as "asc" | "desc" | undefined;

    const users = await hrisApiUsersService.getUsers({ limit, cursor, q, sortField, sortDir });
    return Response.json(users);
  }

  public async searchUsers(req: Request) {
    const body = (await req.json().catch(() => ({}))) as UsersSearchArgs;
    const result = await hrisApiUsersService.searchUsers(body);
    return Response.json(result);
  }

  /**
   * The People table's view as a file. The format comes from the query string, like every other
   * export route, and wins over whatever the body says; the rest of the body is the view and is passed
   * on as it is — the backend decides which of its columns the caller may carry out.
   */
  public async exportUsers(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Partial<PeopleExportRequest>;
    const request: PeopleExportRequest = {
      ...body,
      columns: Array.isArray(body.columns) ? body.columns : [],
      allColumns: body.allColumns === true,
      format: formatOf(req),
    };
    return streamBinary(await hrisApiUsersService.exportUsers(request));
  }

  /** The number behind the directory's Drafts segment. Listing them is searchUsers with drafts: "ONLY". */
  async draftCount() {
    return Response.json(await hrisApiUsersService.draftCount());
  }

  async getFields() {
    const fields = await hrisApiUsersService.getFields();
    return Response.json(fields);
  }

  async orgChart(_req: Request) {
    const data = await hrisApiUsersService.orgChart();
    return Response.json(data);
  }
}

export const usersRoutes = new UsersRoutes();
