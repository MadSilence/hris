import { hrisApiUsersService } from "../../services/hrisUsersService";
import { UsersSearchRequest } from "@/models/user/fields";

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
    const body = await req.json().catch(() => ({} as any));
    const result = await hrisApiUsersService.searchUsers(body);
    return Response.json(result);
  }

  async getFields() {
    const fields = await hrisApiUsersService.getFields();
    return Response.json(fields);
  }

  async search(req: Request) {
    const body = (await req.json()) as UsersSearchRequest;
    const data = await hrisApiUsersService.search(body);
    return Response.json(data);
  }
}

export const usersRoutes = new UsersRoutes();
