import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CreateDelegationRequest, DelegationDTO, DelegationsDTO } from "@/api/modules/delegations/dto";

/** `/me/delegations` — the caller's own approval delegations, and the ones made to them. */
export class HrisApiDelegationsClient {
  private readonly PATH = "/me/delegations";

  public async list(): Promise<DelegationsDTO> {
    return hrisApiClient.get<DelegationsDTO>(this.PATH);
  }

  public async create(body: CreateDelegationRequest): Promise<DelegationDTO> {
    return hrisApiClient.post<DelegationDTO>(this.PATH, { ...body });
  }

  public async remove(id: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.PATH}/${id}`);
  }
}

export const hrisApiDelegationsClient = new HrisApiDelegationsClient();
