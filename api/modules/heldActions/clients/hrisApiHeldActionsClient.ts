import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { HeldActionDTO, HoldActionRequestDTO } from "@/api/modules/heldActions/dto";

export class HrisApiHeldActionsClient {
  private readonly PATH = "/held-actions";

  public async hold(request: HoldActionRequestDTO): Promise<HeldActionDTO> {
    return hrisApiClient.post<HeldActionDTO>(this.PATH, request);
  }

  /** Undo: `409` when the server has already applied it. */
  public async cancel(id: string): Promise<void> {
    return hrisApiClient.delete<void>(`${this.PATH}/${id}`);
  }

  /** Apply now — the reader closed the toast. */
  public async apply(id: string): Promise<void> {
    return hrisApiClient.post<void>(`${this.PATH}/${id}/apply`);
  }
}

export const hrisApiHeldActionsClient = new HrisApiHeldActionsClient();
