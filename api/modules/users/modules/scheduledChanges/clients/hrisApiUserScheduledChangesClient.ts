import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { ScheduledChange } from "@/models/user/ScheduledChange";

export class HrisApiUserScheduledChangesClient {
  private readonly USERS_PATH = "/users";

  /** The person's pending changes the caller may act on — empty for a reader who may only view. */
  public async listByUserId(userId: string): Promise<ScheduledChange[]> {
    return hrisApiClient.get<ScheduledChange[]>(`${this.USERS_PATH}/${userId}/scheduled-changes`);
  }

  public async cancel(userId: string, changeId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.USERS_PATH}/${userId}/scheduled-changes/${changeId}/cancel`);
  }

  public async reschedule(userId: string, changeId: string, date: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.USERS_PATH}/${userId}/scheduled-changes/${changeId}/reschedule`, { date });
  }
}

export const hrisApiUserScheduledChangesClient = new HrisApiUserScheduledChangesClient();
