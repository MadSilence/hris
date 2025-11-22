import { InternalApiClient } from "@/components/clients/apiClient";
import { hrisAttributeClient } from "@/api/modules/attributes/clients";
import { CreateResponse } from "@/api/models/misc";
import { AttributeType } from "@/models/attribute";

export type CreateAttributePayload = {
  name: string;
  type: AttributeType;
  groupId?: string;
  options?: Array<any>;
};

export class AttributeService {
  constructor(private readonly apiClient: InternalApiClient) {}

  public async createAttribute(payload: CreateAttributePayload): Promise<CreateResponse> {
    return hrisAttributeClient.createAttribute(payload);
  }
}
