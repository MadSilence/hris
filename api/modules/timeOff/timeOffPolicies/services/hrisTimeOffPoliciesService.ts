import type {
  CreateTimeOffPolicyRequest,
  RenameTimeOffPolicyRequest,
  SaveTimeOffPolicyRequest,
  TimeOffPolicyEditImpactDTO,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { hrisApiTimeOffPoliciesClient } from "@/api/modules/timeOff/timeOffPolicies/clients/";
import { TimeOffPolicy } from "@/models/timeOff";
import { timeOffPolicyMapper } from "@/api/modules/timeOff/timeOffPolicies/mappers";

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

  public async save(
    id: string,
    body: SaveTimeOffPolicyRequest
  ): Promise<TimeOffPolicy> {
    const dto = await hrisApiTimeOffPoliciesClient.save(id, body);
    return timeOffPolicyMapper.mapTimeOffPolicyDTO(dto);
  }

  public async duplicate(id: string, name: string): Promise<CreateResponse> {
    return hrisApiTimeOffPoliciesClient.duplicate(id, name);
  }

  public async exportPolicies(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiTimeOffPoliciesClient.exportPolicies(format);
  }

  public async editImpact(id: string): Promise<TimeOffPolicyEditImpactDTO> {
    return hrisApiTimeOffPoliciesClient.editImpact(id);
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

  public async unarchive(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.unarchive(id);
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffPoliciesClient.archive(id);
  }

  public async delete(id: string): Promise<void> {
    return hrisApiTimeOffPoliciesClient.delete(id);
  }
}

export const hrisTimeOffPoliciesService = new HrisTimeOffPoliciesService();