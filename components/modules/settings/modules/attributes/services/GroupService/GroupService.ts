import { InternalApiClient } from "@/components/clients/apiClient";
import { hrisGroupsClient } from "@/api/modules/groups/clients";
import { CreateResponse } from "@/api/models/misc";

export type CreateGroupPayload = {
  name: string;
}

export class GroupService {
  constructor(private readonly apiClient: InternalApiClient) {
  }

  public async createGroup(payload: CreateGroupPayload): Promise<CreateResponse> {
    return hrisGroupsClient.createGroup(payload);
  }
}
