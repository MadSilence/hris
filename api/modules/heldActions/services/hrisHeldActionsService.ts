import { hrisApiHeldActionsClient } from "@/api/modules/heldActions/clients";
import type { HoldActionRequestDTO } from "@/api/modules/heldActions/dto";
import type { HeldAction } from "@/models/heldActions";

/** Longer than any window the server could mean; a clock that has run away does not keep a toast up for an hour. */
const MAX_WINDOW_MS = 60_000;

export class HrisHeldActionsService {
  public async hold(request: HoldActionRequestDTO): Promise<HeldAction> {
    const held = await hrisApiHeldActionsClient.hold(request);
    const left = Date.parse(held.executeAt) - Date.now();
    return {
      id: held.id,
      executeAt: held.executeAt,
      windowMs: Number.isFinite(left) ? Math.min(Math.max(0, left), MAX_WINDOW_MS) : 0,
    };
  }

  public async cancel(id: string): Promise<void> {
    return hrisApiHeldActionsClient.cancel(id);
  }

  public async apply(id: string): Promise<void> {
    return hrisApiHeldActionsClient.apply(id);
  }
}

export const hrisHeldActionsService = new HrisHeldActionsService();
