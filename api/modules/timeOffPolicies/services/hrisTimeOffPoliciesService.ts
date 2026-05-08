import type {
  CreateTimeOffPolicyRequest,
  RenameTimeOffPolicyRequest,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOffPolicies/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { hrisApiTimeOffPoliciesClient } from "@/api/modules/timeOffPolicies/clients/";
import { TimeOffPolicy } from "@/models/timeOff";

export class HrisTimeOffPoliciesService {
  public async create(
    body: CreateTimeOffPolicyRequest
  ): Promise<CreateResponse> {
    return hrisApiTimeOffPoliciesClient.create(body);
  }

  public async list(): Promise<TimeOffPolicy[]> {
    return hrisApiTimeOffPoliciesClient.list();
  }

  public async getById(id: string): Promise<TimeOffPolicy> {
    return hrisApiTimeOffPoliciesClient.getById(id);
  }

  public async update(
    id: string,
    body: UpdateTimeOffPolicyRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.update(id, body);
  }

  public async rename(
    id: string,
    body: RenameTimeOffPolicyRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.rename(id, body);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.activate(id);
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.archive(id);
  }

  public async delete(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.delete(id);
  }
}

export const hrisTimeOffPoliciesService = new HrisTimeOffPoliciesService();
