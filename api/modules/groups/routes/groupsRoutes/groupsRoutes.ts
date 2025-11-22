import type { GroupsService } from "@/api/modules/groups/services/groupsService";
import { groupsService } from "@/api/modules/groups/services/groupsService";

export class GroupsRoutes {
  public constructor(private readonly service: GroupsService) {}

  public async getGroups() {
    const groups = await this.service.getGroups();
    return Response.json(groups)
  }
}

export const groupsRoutes = new GroupsRoutes(groupsService);
