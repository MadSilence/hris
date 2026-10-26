import { hrisApiDelegationsClient } from "@/api/modules/delegations/clients";
import type { CreateDelegationRequest, DelegationDTO, DelegationsDTO } from "@/api/modules/delegations/dto";

export class HrisDelegationsService {
  public async list(): Promise<DelegationsDTO> {
    return hrisApiDelegationsClient.list();
  }

  public async create(body: CreateDelegationRequest): Promise<DelegationDTO> {
    return hrisApiDelegationsClient.create(body);
  }

  public async remove(id: string): Promise<void> {
    return hrisApiDelegationsClient.remove(id);
  }
}

export const hrisDelegationsService = new HrisDelegationsService();
